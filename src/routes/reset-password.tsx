import { createFileRoute, useNavigate } from "@tanstack/react-router";
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

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN" || event === "INITIAL_SESSION") {
        setReady(true);
      }
    });

    (async () => {
      // PKCE flow: ?code=...
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
          setReady(true);
          url.searchParams.delete("code");
          window.history.replaceState({}, "", url.pathname + url.search);
          return;
        }
      }
      // Implicit/hash recovery flow: #access_token=...&type=recovery
      const hash = window.location.hash;
      if (hash.includes("access_token") || hash.includes("type=recovery")) {
        // getSession will trigger detectSessionInUrl processing
        await supabase.auth.getSession();
      }
      const { data } = await supabase.auth.getSession();
      if (data.session) setReady(true);
    })();

    return () => sub.subscription.unsubscribe();
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
      navigate({ to: "/admin", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update password");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SiteLayout>
      <div className="max-w-md mx-auto px-4 sm:px-6 py-14">
        <h1 className="text-3xl font-heading font-bold mb-2">Set a new password</h1>
        <p className="text-brand-dark/60 text-sm mb-8">
          {ready
            ? "Choose a strong new password for your account."
            : "Waiting for your recovery link… If nothing happens, request a new reset email."}
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
            disabled={busy || !ready}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-brand-primary text-white font-medium disabled:opacity-60"
          >
            {busy && <Loader2 className="size-4 animate-spin" />}
            Update password
          </button>
        </form>
      </div>
    </SiteLayout>
  );
}
