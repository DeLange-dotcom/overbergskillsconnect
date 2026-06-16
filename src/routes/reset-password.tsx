import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset password — Hineni" },
      { name: "description", content: "Set a new password for your Hineni account." },
    ],
  }),
  component: ResetPasswordPage,
});

type Status = "checking" | "ready" | "invalid";

function ResetPasswordPage() {
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
      toast.error("Passwords don't match.");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password updated. You're signed in.");
      window.location.replace("/admin");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update password");
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
      toast.success("New reset link sent. Open it as soon as it arrives.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send reset email");
    } finally {
      setResending(false);
    }
  }

  return (
    <SiteLayout>
      <div className="max-w-md mx-auto px-4 sm:px-6 py-14">
        <h1 className="text-3xl font-heading font-bold mb-2">Set a new password</h1>

        {status === "checking" && (
          <p className="text-brand-dark/60 text-sm mb-8">Verifying your reset link…</p>
        )}

        {status === "invalid" && (
          <div className="space-y-5">
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-900 space-y-2">
              <p className="font-semibold">This reset link is no longer valid.</p>
              <p>
                Reset links can only be opened once and expire quickly. Email providers like Gmail
                sometimes preview links automatically, which uses them up before you click.
              </p>
              <p className="font-medium">
                Request a fresh link below and open it in your browser as soon as it arrives.
              </p>
            </div>

            {resent ? (
              <div className="p-4 rounded-xl bg-brand-soft text-sm text-brand-dark/80">
                If an account exists for that email, a new reset link is on its way. Open it right
                away — don't hover or preview it first.
              </div>
            ) : (
              <form onSubmit={resend} className="space-y-3">
                <input
                  type="email"
                  required
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder="Your email"
                  className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl"
                />
                <button
                  type="submit"
                  disabled={resending}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-brand-primary text-white font-medium disabled:opacity-60"
                >
                  {resending && <Loader2 className="size-4 animate-spin" />}
                  Send a new reset link
                </button>
              </form>
            )}

            <Link to="/auth" className="text-brand-primary hover:underline text-sm">
              Back to sign in
            </Link>
          </div>
        )}

        {status === "ready" && (
          <>
            <p className="text-brand-dark/60 text-sm mb-8">
              Choose a strong new password for your account.
            </p>
            <form onSubmit={submit} className="space-y-3">
              <input
                name="password"
                type="password"
                required
                minLength={6}
                placeholder="New password"
                className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl"
              />
              <input
                name="confirm"
                type="password"
                required
                minLength={6}
                placeholder="Confirm new password"
                className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl"
              />
              <button
                type="submit"
                disabled={busy}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-brand-primary text-white font-medium disabled:opacity-60"
              >
                {busy && <Loader2 className="size-4 animate-spin" />}
                Update password
              </button>
            </form>
          </>
        )}
      </div>
    </SiteLayout>
  );
}
