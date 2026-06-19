import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Khulisa Community" },
      { name: "description", content: "Sign in to the Khulisa Community admin dashboard." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [busy, setBusy] = useState(false);
  const [resetSent, setResetSent] = useState(false);


  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin", replace: true });
    });
  }, [navigate]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    const email = (fd.get("email") as string).trim();
    const password = fd.get("password") as string;
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/admin" },
        });
        if (error) throw error;
        toast.success("Check your email to confirm your account.");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + "/reset-password",
        });
        if (error) throw error;
        setResetSent(true);
        toast.success("Password reset email sent. Check your inbox.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Request failed");
    } finally {
      setBusy(false);
    }
  }


  async function google() {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/admin",
    });
    if (result.error) {
      toast.error("Google sign-in failed.");
      setBusy(false);
    }
  }

  return (
    <SiteLayout>
      <div className="max-w-md mx-auto px-4 sm:px-6 py-14">
        <div className="mb-6">
          <div className="text-xs uppercase tracking-widest text-brand-primary font-semibold">
            Khulisa Community
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
            : "Admins and programme coordinators use this area. The public site doesn't require an account."}
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
              className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl"
            />
            {mode !== "forgot" && (
              <input
                name="password"
                type="password"
                required
                minLength={6}
                placeholder="Password"
                className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl"
              />
            )}
            <button
              type="submit"
              disabled={busy}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-brand-primary text-white font-medium disabled:opacity-60"
            >
              {busy && <Loader2 className="size-4 animate-spin" />}
              {mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link"}
            </button>
          </form>
        )}
        <div className="mt-4 flex flex-col gap-2 text-sm">
          {mode !== "forgot" && (
            <button
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="text-brand-primary hover:underline self-start"
            >
              {mode === "signin" ? "Need an account? Sign up" : "Have an account? Sign in"}
            </button>
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
        </div>

      </div>
    </SiteLayout>
  );
}
