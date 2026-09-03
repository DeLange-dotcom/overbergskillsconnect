import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";
import { Loader2, Check, X, Mail } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Overberg Skills Connect" },
      { name: "description", content: "Sign in to the Overberg Skills Connect admin dashboard." },
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

function friendlyAuthError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("password") && (m.includes("weak") || m.includes("short") || m.includes("characters") || m.includes("pwned") || m.includes("leaked"))) {
    return "That password is too weak or has appeared in a known data breach. Please choose a stronger password that meets all the requirements shown.";
  }
  if (m.includes("invalid login") || m.includes("invalid credentials")) {
    return "Email or password is incorrect.";
  }
  if (m.includes("email not confirmed")) {
    return "Please verify your email first. Check your inbox (and spam folder) for the confirmation link.";
  }
  if (m.includes("user already registered") || m.includes("already registered")) {
    return "An account already exists for that email. Try signing in instead, or reset your password.";
  }
  if (m.includes("rate limit") || m.includes("too many")) {
    return "Too many attempts. Please wait a minute and try again.";
  }
  if (m.includes("network") || m.includes("fetch")) {
    return "We could not reach the server. Please check your internet connection and try again.";
  }
  if (m.includes("email") && m.includes("invalid")) {
    return "That email address doesn't look right. Please check it and try again.";
  }
  // Never show raw technical errors to users.
  return "Something went wrong. Please try again, or use \u201cForgot password?\u201d if you cannot sign in.";
}

function AuthPage() {
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

  function nextDest(): string {
    if (typeof window === "undefined") return "/profile";
    const params = new URLSearchParams(window.location.search);
    const n = params.get("next");
    if (n && n.startsWith("/") && !n.startsWith("//")) return n;
    return "/profile";
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
          toast.error("That verification link is invalid or has expired. Please request a new one below.");
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
          toast.success("Your email is verified. Welcome to Overberg Skills Connect!");
          markWelcome();
        }
        navigate({ to: nextDest(), replace: true });
      } else if (verified) {
        toast.success("Email verified. Please sign in.");
        setMode("signin");
      }
    })();
    return () => { cancelled = true; };
  }, [navigate]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = (fd.get("email") as string).trim();
    const pw = (fd.get("password") as string) ?? "";

    if (mode === "signup" && !passwordIsStrong(checkPassword(pw))) {
      setShowPwHints(true);
      toast.error("Please choose a password that meets all the requirements.");
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
          toast.success("Account created. You're signed in.");
          markWelcome();
          navigate({ to: nextDest(), replace: true });
        } else {
          setSignupEmail(email);
          setSignupSent(true);
          toast.success("Check your email to confirm your account.");
        }
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + "/reset-password",
        });
        if (error) throw error;
        setResetSent(true);
        toast.success("Password reset email sent. Check your inbox.");
      }
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Request failed";
      toast.error(friendlyAuthError(raw));
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
      toast.success("Verification email resent. Please check your inbox and spam folder.");
    } catch (err) {
      toast.error(err instanceof Error ? friendlyAuthError(err.message) : "Could not resend email");
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
      toast.error("Google sign-in failed.");
      setBusy(false);
    }
  }

  // Post-signup confirmation screen
  if (signupSent) {
    return (
      <SiteLayout>
        <div className="max-w-md mx-auto px-4 sm:px-6 py-14">
          <div className="inline-flex items-center justify-center size-12 rounded-full bg-brand-soft mb-4">
            <Mail className="size-6 text-brand-primary" />
          </div>
          <h1 className="text-3xl font-heading font-bold mb-2">Confirm your email</h1>
          <p className="text-brand-dark/70 text-sm mb-6">
            We've sent a verification link to <strong>{signupEmail}</strong>. Click the link in
            that email to activate your account.
          </p>
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-900 mb-6">
            <p className="font-semibold mb-1">Can't find it?</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Check your spam or junk folder.</li>
              <li>Make sure the email address is correct.</li>
              <li>Links expire — request a new one if needed.</li>
            </ul>
          </div>
          <button
            onClick={resendVerification}
            disabled={resending}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-brand-primary text-white font-medium disabled:opacity-60 mb-3"
          >
            {resending && <Loader2 className="size-4 animate-spin" />}
            Resend verification email
          </button>
          <button
            onClick={() => { setSignupSent(false); setMode("signin"); }}
            className="w-full px-4 py-3 rounded-xl border border-brand-dark/10 hover:bg-brand-soft"
          >
            Back to sign in
          </button>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="max-w-md mx-auto px-4 sm:px-6 py-14">
        <div className="mb-6">
          <div className="text-xs uppercase tracking-widest text-brand-primary font-semibold">
            Overberg Skills Connect
          </div>
          <p className="text-sm text-brand-dark/60 mt-1">
            Supporting Skills, Mentorship, Apprenticeships and Community Opportunities
          </p>
        </div>
        <h1 className="text-3xl font-heading font-bold mb-2">
          {mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Reset password"}
        </h1>
        <p className="text-brand-dark/60 text-sm mb-8">
          {mode === "forgot"
            ? "Enter your email and we'll send you a link to set a new password."
            : "Sign in or create a free account to advertise your skills, request contact details, and manage your activity."}
        </p>

        {mode !== "forgot" && (
          <>
            <button
              onClick={google}
              disabled={busy}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-brand-dark/10 hover:bg-brand-soft mb-4"
            >
              <span className="font-medium">Continue with Google</span>
            </button>
            <p className="text-xs text-brand-dark/60 -mt-2 mb-2 text-center">
              Google is only used to sign you in. We do not access your emails, contacts or files.
            </p>
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-brand-dark/10" />
              <span className="text-xs text-brand-dark/40 uppercase tracking-widest">or</span>
              <div className="flex-1 h-px bg-brand-dark/10" />
            </div>
          </>
        )}

        {mode === "forgot" && resetSent ? (
          <div className="p-4 rounded-xl bg-brand-soft text-sm text-brand-dark/80">
            If an account exists for that email, a reset link is on its way. Check your inbox (and spam).
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <input
              name="email"
              type="email"
              required
              placeholder="Email"
              autoComplete="email"
              className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl"
            />
            {mode !== "forgot" && (
              <>
                <input
                  name="password"
                  type="password"
                  required
                  minLength={mode === "signup" ? 8 : 6}
                  placeholder="Password"
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => mode === "signup" && setShowPwHints(true)}
                  className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl"
                  aria-describedby={mode === "signup" ? "pw-requirements" : undefined}
                />
                {mode === "signup" && (showPwHints || password.length > 0) && (
                  <div
                    id="pw-requirements"
                    className="p-3 rounded-xl bg-brand-soft/60 border border-brand-dark/5 text-sm"
                  >
                    <p className="font-medium mb-2 text-brand-dark/80">
                      Your password must include:
                    </p>
                    <ul className="space-y-1">
                      <PwRule ok={checks.length} label="At least 8 characters" />
                      <PwRule ok={checks.upper} label="One uppercase letter (A–Z)" />
                      <PwRule ok={checks.lower} label="One lowercase letter (a–z)" />
                      <PwRule ok={checks.number} label="One number (0–9)" />
                      <PwRule ok={checks.special} label="One special character (e.g. ! @ # ?)" />
                    </ul>
                    <p className="mt-2 text-xs text-brand-dark/60">
                      For your safety, common or breached passwords are also rejected.
                    </p>
                  </div>
                )}
              </>
            )}
            <button
              type="submit"
              disabled={busy || (mode === "signup" && !strong)}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-brand-primary text-white font-medium disabled:opacity-60"
            >
              {busy && <Loader2 className="size-4 animate-spin" />}
              {mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link"}
            </button>
          </form>
        )}
        <div className="mt-4 flex flex-col gap-2 text-sm">
          {mode !== "forgot" && (
            <div className="rounded-xl border border-brand-primary/30 bg-brand-soft/60 p-4 text-center">
              <p className="text-sm text-brand-dark/70 mb-3">
                {mode === "signin"
                  ? "New here? Creating an account is free and takes about a minute."
                  : "Already have an account?"}
              </p>
              <button
                onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setShowPwHints(false); }}
                className="w-full px-4 py-3 rounded-xl bg-brand-primary text-white font-semibold shadow-md hover:opacity-95"
              >
                {mode === "signin" ? "Create a free account" : "Sign in instead"}
              </button>
            </div>
          )}
          {mode === "signin" && (
            <button
              onClick={() => { setResetSent(false); setMode("forgot"); }}
              className="text-brand-primary hover:underline self-start"
            >
              Forgot password?
            </button>
          )}
          {mode === "forgot" && (
            <button
              onClick={() => { setResetSent(false); setMode("signin"); }}
              className="text-brand-primary hover:underline self-start"
            >
              Back to sign in
            </button>
          )}
          <Link to="/help" className="text-brand-primary hover:underline self-start">
            Need Help?
          </Link>
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
