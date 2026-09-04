import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";
import { Loader2, Check, X, Mail } from "lucide-react";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: i18n.t("auth.meta.title") },
      { name: "description", content: i18n.t("auth.meta.description") },
    ],
  }),
  component: AuthPage,
});

type PwChecks = {
  length: boolean;
  upper: boolean;
  lower: boolean;
  number: boolean;
  special: boolean;
};

function checkPassword(p: string): PwChecks {
  return {
    length: p.length >= 8,
    upper: /[A-Z]/.test(p),
    lower: /[a-z]/.test(p),
    number: /\d/.test(p),
    special: /[^A-Za-z0-9]/.test(p),
  };
}

function passwordIsStrong(c: PwChecks) {
  return c.length && c.upper && c.lower && c.number && c.special;
}

function friendlyAuthError(msg: string, t: (key: string) => string): string {
  const m = msg.toLowerCase();
  if (m.includes("password") && (m.includes("weak") || m.includes("short") || m.includes("characters") || m.includes("pwned") || m.includes("leaked"))) {
    return t("auth.errors.weakOrBreachedPassword");
  }
  if (m.includes("invalid login") || m.includes("invalid credentials")) {
    return t("auth.errors.invalidCredentials");
  }
  if (m.includes("email not confirmed")) {
    return t("auth.errors.emailNotConfirmed");
  }
  if (m.includes("user already registered") || m.includes("already registered")) {
    return t("auth.errors.alreadyRegistered");
  }
  if (m.includes("rate limit") || m.includes("too many")) {
    return t("auth.errors.rateLimited");
  }
  if (m.includes("network") || m.includes("fetch")) {
    return t("auth.errors.networkError");
  }
  if (m.includes("email") && m.includes("invalid")) {
    return t("auth.errors.invalidEmail");
  }
  // Never show raw technical errors to users.
  return t("auth.errors.generic");
}

function AuthPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [busy, setBusy] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [password, setPassword] = useState("");
  const [showPwHints, setShowPwHints] = useState(false);
  const [signupEmail, setSignupEmail] = useState("");
  const [signupSent, setSignupSent] = useState(false);
  const [resending, setResending] = useState(false);

  const checks = useMemo(() => checkPassword(password), [password]);
  const strong = passwordIsStrong(checks);

  function markWelcome() {
    try {
      if (typeof window !== "undefined" && !localStorage.getItem("osc_welcomed")) {
        localStorage.setItem("osc_show_welcome", "1");
      }
    } catch {
      /* storage unavailable */
    }
  }

  function explicitNext(): string | null {
    if (typeof window === "undefined") return null;
    const params = new URLSearchParams(window.location.search);
    const n = params.get("next");
    if (n && n.startsWith("/") && !n.startsWith("//")) return n;
    return null;
  }

  // Someone who just created their account (or has never seen the choice)
  // gets the "what would you like to do?" screen once.
  function isFirstTime(createdAt?: string | null): boolean {
    if (typeof window === "undefined") return false;
    try {
      if (localStorage.getItem("osc_welcomed") === "1") return false;
    } catch {
      /* storage unavailable */
    }
    if (!createdAt) return false;
    return Date.now() - new Date(createdAt).getTime() < 15 * 60 * 1000;
  }

  function nextDest(createdAt?: string | null): string {
    return explicitNext() ?? (isFirstTime(createdAt) ? "/welcome" : "/profile");
  }

  // Handle email verification callback (code exchange) and post-verification UX
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (typeof window === "undefined") return;
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");
      const verified = url.searchParams.get("verified");
      const errorDesc = url.searchParams.get("error_description") || url.hash.match(/error_description=([^&]+)/)?.[1];

      if (errorDesc) {
        toast.error(decodeURIComponent(errorDesc.replace(/\+/g, " ")));
      }

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        url.searchParams.delete("code");
        url.searchParams.set("verified", "1");
        window.history.replaceState({}, "", url.pathname + url.search);
        if (cancelled) return;
        if (error) {
          toast.error(t("auth.toasts.invalidVerificationLink"));
          setMode("signin");
          return;
        }
      }

      // Implicit hash flow
      if (window.location.hash.includes("access_token")) {
        await supabase.auth.getSession();
      }

      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      if (data.session) {
        if (verified || code) {
          toast.success(t("auth.toasts.emailVerifiedWelcome"));
          markWelcome();
        }
        navigate({ to: nextDest(data.session.user?.created_at), replace: true });
      } else if (verified) {
        toast.success(t("auth.toasts.emailVerifiedSignIn"));
        setMode("signin");
      }
    })();
    return () => { cancelled = true; };
  }, [navigate, t]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = (fd.get("email") as string).trim();
    const pw = (fd.get("password") as string) ?? "";

    if (mode === "signup" && !passwordIsStrong(checkPassword(pw))) {
      setShowPwHints(true);
      toast.error(t("auth.toasts.passwordRequirementsNotMet"));
      return;
    }

    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
        if (error) throw error;
        markWelcome();
        navigate({ to: nextDest(), replace: true });
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password: pw,
          options: {
            emailRedirectTo: `${window.location.origin}/auth?verified=1`,
            data: { app: "Overberg Skills Connect" },
          },
        });
        if (error) throw error;
        // If email confirmations are enabled, no session is returned yet.
        if (data.session) {
          toast.success(t("auth.toasts.accountCreatedSignedIn"));
          markWelcome();
          navigate({ to: nextDest(), replace: true });
        } else {
          setSignupEmail(email);
          setSignupSent(true);
          toast.success(t("auth.toasts.checkEmailToConfirm"));
        }
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + "/reset-password",
        });
        if (error) throw error;
        setResetSent(true);
        toast.success(t("auth.toasts.passwordResetEmailSent"));
      }
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Request failed";
      toast.error(friendlyAuthError(raw, t));
    } finally {
      setBusy(false);
    }
  }

  async function resendVerification() {
    if (!signupEmail) return;
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: signupEmail,
        options: { emailRedirectTo: `${window.location.origin}/auth?verified=1` },
      });
      if (error) throw error;
      toast.success(t("auth.toasts.verificationResent"));
    } catch (err) {
      toast.error(err instanceof Error ? friendlyAuthError(err.message, t) : t("auth.toasts.couldNotResendEmail"));
    } finally {
      setResending(false);
    }
  }

  async function google() {
    setBusy(true);
    markWelcome();
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/auth" + (window.location.search || ""),
    });
    if (result.error) {
      toast.error(t("auth.toasts.googleSignInFailed"));
      setBusy(false);
    }
  }

  // Post-signup confirmation screen
  if (signupSent) {
    return (
      <SiteLayout>
        <div className="max-w-md mx-auto px-4 sm:px-6 py-14">
          <div className="osc-card p-6 sm:p-7">
          <div className="inline-flex items-center justify-center size-12 rounded-full bg-brand-cream mb-4">
            <Mail className="size-6 text-brand-orange" />
          </div>
          <h1 className="osc-heading text-3xl mb-2">{t("auth.confirmEmail.heading")}</h1>
          <p className="text-brand-dark/70 text-sm mb-6">
            {t("auth.confirmEmail.body", { email: signupEmail }).split(/(<strong>.*?<\/strong>)/g).map((part, i) => {
              const match = part.match(/^<strong>(.*)<\/strong>$/);
              return match ? <strong key={i}>{match[1]}</strong> : <span key={i}>{part}</span>;
            })}
          </p>
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-900 mb-6">
            <p className="font-semibold mb-1">{t("auth.confirmEmail.cantFindItTitle")}</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>{t("auth.confirmEmail.checkSpam")}</li>
              <li>{t("auth.confirmEmail.checkAddress")}</li>
              <li>{t("auth.confirmEmail.linksExpire")}</li>
            </ul>
          </div>
          <button
            onClick={resendVerification}
            disabled={resending}
            className="osc-btn osc-btn-primary w-full mb-3"
          >
            {resending && <Loader2 className="size-4 animate-spin" />}
            {t("auth.confirmEmail.resendButton")}
          </button>
          <button
            onClick={() => { setSignupSent(false); setMode("signin"); }}
            className="osc-btn osc-btn-outline w-full"
          >
            {t("auth.confirmEmail.backToSignIn")}
          </button>
          </div>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="max-w-md mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="osc-card p-6 sm:p-8">
        <span className="osc-eyebrow">{t("auth.eyebrow")}</span>
        <h1 className="osc-heading text-3xl mt-2 mb-2">
          {mode === "signin" ? t("auth.headings.signin") : mode === "signup" ? t("auth.headings.signup") : t("auth.headings.forgot")}
        </h1>
        <p className="text-brand-navy/65 text-sm mb-8">
          {mode === "forgot" ? t("auth.intro.forgot") : t("auth.intro.default")}
        </p>

        {mode !== "forgot" && (
          <>
            <button
              onClick={google}
              disabled={busy}
              className="osc-btn osc-btn-outline w-full mb-4"
            >
              <span className="font-medium">{t("auth.google.continue")}</span>
            </button>
            <p className="text-xs text-brand-dark/60 -mt-2 mb-2 text-center">
              {t("auth.google.reassurance")}
            </p>
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-brand-dark/10" />
              <span className="text-xs text-brand-dark/40 uppercase tracking-widest">{t("auth.or")}</span>
              <div className="flex-1 h-px bg-brand-dark/10" />
            </div>
          </>
        )}

        {mode === "forgot" && resetSent ? (
          <div className="p-4 rounded-xl bg-brand-soft text-sm text-brand-dark/80">
            {t("auth.forgot.sentMessage")}
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <input
              name="email"
              type="email"
              required
              placeholder={t("auth.form.emailPlaceholder")}
              autoComplete="email"
              className="osc-input"
            />
            {mode !== "forgot" && (
              <>
                <input
                  name="password"
                  type="password"
                  required
                  minLength={mode === "signup" ? 8 : 6}
                  placeholder={t("auth.form.passwordPlaceholder")}
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => mode === "signup" && setShowPwHints(true)}
                  className="osc-input"
                  aria-describedby={mode === "signup" ? "pw-requirements" : undefined}
                />
                {mode === "signup" && (showPwHints || password.length > 0) && (
                  <div
                    id="pw-requirements"
                    className="p-3 rounded-xl bg-brand-neutral border border-brand-navy/5 text-sm"
                  >
                    <p className="font-medium mb-2 text-brand-dark/80">
                      {t("auth.form.requirementsTitle")}
                    </p>
                    <ul className="space-y-1">
                      <PwRule ok={checks.length} label={t("auth.form.reqLength")} />
                      <PwRule ok={checks.upper} label={t("auth.form.reqUpper")} />
                      <PwRule ok={checks.lower} label={t("auth.form.reqLower")} />
                      <PwRule ok={checks.number} label={t("auth.form.reqNumber")} />
                      <PwRule ok={checks.special} label={t("auth.form.reqSpecial")} />
                    </ul>
                    <p className="mt-2 text-xs text-brand-dark/60">
                      {t("auth.form.breachedNote")}
                    </p>
                  </div>
                )}
              </>
            )}
            <button
              type="submit"
              disabled={busy || (mode === "signup" && !strong)}
              className="osc-btn osc-btn-primary w-full"
            >
              {busy && <Loader2 className="size-4 animate-spin" />}
              {mode === "signin" ? t("auth.submit.signin") : mode === "signup" ? t("auth.submit.signup") : t("auth.submit.forgot")}
            </button>
          </form>
        )}
        <div className="mt-4 flex flex-col gap-2 text-sm">
          {mode !== "forgot" && (
            <div className="osc-panel-cream p-4 text-center">
              <p className="text-sm text-brand-dark/70 mb-3">
                {mode === "signin" ? t("auth.switch.newHere") : t("auth.switch.alreadyHaveAccount")}
              </p>
              <button
                onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setShowPwHints(false); }}
                className="osc-btn osc-btn-primary w-full"
              >
                {mode === "signin" ? t("auth.switch.createFreeAccount") : t("auth.switch.signInInstead")}
              </button>
            </div>
          )}
          {mode === "signin" && (
            <button
              onClick={() => { setResetSent(false); setMode("forgot"); }}
              className="text-brand-primary hover:underline self-start"
            >
              {t("auth.links.forgotPassword")}
            </button>
          )}
          {mode === "forgot" && (
            <button
              onClick={() => { setResetSent(false); setMode("signin"); }}
              className="text-brand-primary hover:underline self-start"
            >
              {t("auth.links.backToSignIn")}
            </button>
          )}
          <Link to="/help" className="text-brand-primary hover:underline self-start">
            {t("auth.links.needHelp")}
          </Link>
        </div>
        </div>
      </div>
    </SiteLayout>
  );
}

function PwRule({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className="flex items-center gap-2">
      {ok ? (
        <Check className="size-4 text-green-600 shrink-0" />
      ) : (
        <X className="size-4 text-brand-dark/40 shrink-0" />
      )}
      <span className={ok ? "text-brand-dark/80" : "text-brand-dark/60"}>{label}</span>
    </li>
  );
}
