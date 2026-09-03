import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: i18n.t("auth.resetPassword.meta.title") },
      { name: "description", content: i18n.t("auth.resetPassword.meta.description") },
    ],
  }),
  component: ResetPasswordPage,
});

type Status = "checking" | "ready" | "invalid";

function ResetPasswordPage() {
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<Status>("checking");
  const [resendEmail, setResendEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    let active = true;
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        if (active) setStatus("ready");
      }
    });

    (async () => {
      const url = new URL(window.location.href);
      // PKCE flow: ?code=...
      const code = url.searchParams.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!active) return;
        if (!error) {
          url.searchParams.delete("code");
          window.history.replaceState({}, "", url.pathname + url.search);
          setStatus("ready");
          return;
        }
      }
      // token_hash flow: ?token_hash=...&type=recovery
      const tokenHash = url.searchParams.get("token_hash");
      const type = url.searchParams.get("type");
      if (tokenHash && type) {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: type as "recovery",
        });
        if (!active) return;
        if (!error) {
          setStatus("ready");
          return;
        }
      }
      // Implicit hash flow (#access_token=...)
      if (window.location.hash.includes("access_token")) {
        await supabase.auth.getSession();
      }
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      setStatus(data.session ? "ready" : "invalid");
    })();

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const password = fd.get("password") as string;
    const confirm = fd.get("confirm") as string;
    if (password !== confirm) {
      toast.error(t("auth.resetPassword.toasts.passwordsDontMatch"));
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success(t("auth.resetPassword.toasts.passwordUpdated"));
      window.location.replace("/admin");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("auth.resetPassword.toasts.couldNotUpdatePassword"));
    } finally {
      setBusy(false);
    }
  }

  async function resend(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!resendEmail) return;
    setResending(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resendEmail, {
        redirectTo: window.location.origin + "/reset-password",
      });
      if (error) throw error;
      setResent(true);
      toast.success(t("auth.resetPassword.toasts.newResetLinkSent"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("auth.resetPassword.toasts.couldNotSendResetEmail"));
    } finally {
      setResending(false);
    }
  }

  return (
    <SiteLayout>
      <div className="max-w-md mx-auto px-4 sm:px-6 py-14">
        <h1 className="osc-heading text-3xl mb-2">{t("auth.resetPassword.heading")}</h1>

        {status === "checking" && (
          <p className="text-brand-dark/60 text-sm mb-8">{t("auth.resetPassword.verifying")}</p>
        )}

        {status === "invalid" && (
          <div className="space-y-5">
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-900 space-y-2">
              <p className="font-semibold">{t("auth.resetPassword.invalid.title")}</p>
              <p>
                {t("auth.resetPassword.invalid.explanation")}
              </p>
              <p className="font-medium">
                {t("auth.resetPassword.invalid.callToAction")}
              </p>
            </div>

            {resent ? (
              <div className="p-4 rounded-xl bg-brand-soft text-sm text-brand-dark/80">
                {t("auth.resetPassword.invalid.sentMessage")}
              </div>
            ) : (
              <form onSubmit={resend} className="space-y-3">
                <input
                  type="email"
                  required
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder={t("auth.resetPassword.invalid.emailPlaceholder")}
                  className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl"
                />
                <button
                  type="submit"
                  disabled={resending}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-brand-primary text-white font-medium disabled:opacity-60"
                >
                  {resending && <Loader2 className="size-4 animate-spin" />}
                  {t("auth.resetPassword.invalid.sendButton")}
                </button>
              </form>
            )}

            <Link to="/auth" className="text-brand-primary hover:underline text-sm">
              {t("auth.resetPassword.invalid.backToSignIn")}
            </Link>
          </div>
        )}

        {status === "ready" && (
          <>
            <p className="text-brand-dark/60 text-sm mb-8">
              {t("auth.resetPassword.ready.intro")}
            </p>
            <form onSubmit={submit} className="space-y-3">
              <input
                name="password"
                type="password"
                required
                minLength={6}
                placeholder={t("auth.resetPassword.ready.newPasswordPlaceholder")}
                className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl"
              />
              <input
                name="confirm"
                type="password"
                required
                minLength={6}
                placeholder={t("auth.resetPassword.ready.confirmPasswordPlaceholder")}
                className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl"
              />
              <button
                type="submit"
                disabled={busy}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-brand-primary text-white font-medium disabled:opacity-60"
              >
                {busy && <Loader2 className="size-4 animate-spin" />}
                {t("auth.resetPassword.ready.updateButton")}
              </button>
            </form>
          </>
        )}
      </div>
    </SiteLayout>
  );
}
