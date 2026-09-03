import { Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Menu, X, LogOut, UserRound } from "lucide-react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { LanguageSelector } from "@/components/site/LanguageSelector";
import logoAsset from "@/assets/osc-logo-header.png.asset.json";

export function Header() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [unread, setUnread] = useState(0);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  // Simple, plain-language navigation
  const NAV = [
    { to: "/", label: "Home" },
    { to: "/find-help", label: "Find Local Help" },
    { to: "/advertise", label: "Advertise My Skills" },
    { to: "/how-it-works", label: "How It Works" },
    { to: "/about", label: "About" },
    { to: "/help", label: "Need Help?" },
  ];

  useEffect(() => {
    let mounted = true;
    async function loadUnread() {
      const { data } = await supabase.rpc("notifications_unread_count");
      if (mounted) setUnread(Number(data ?? 0));
    }
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      const signed = !!data.session;
      setSignedIn(signed);
      if (signed) loadUnread();
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      const signed = !!session;
      setSignedIn(signed);
      if (signed) loadUnread();
      else setUnread(0);
    });
    const interval = setInterval(() => {
      if (signedIn) loadUnread();
    }, 60000);
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
      clearInterval(interval);
    };
  }, [signedIn]);

  return (
    <header className="border-b border-brand-dark/5 bg-brand-page sticky top-0 z-40 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-6 flex items-center justify-between gap-3">
        <Link to="/" className="flex flex-col items-start gap-2 sm:gap-2.5 shrink-0 min-w-0">
          <img
            src={logoAsset.url}
            alt="Overberg Skills Connect — A Hineni Call Initiative, powered by Khulisa Group"
            className="h-9 sm:h-11 w-auto"
          />
          <span className="flex items-center gap-1 text-[8px] sm:text-[9px] uppercase tracking-[0.14em] leading-none whitespace-nowrap">
            <span className="font-semibold text-brand-green">A Hineni Call Initiative</span>
            <span className="text-brand-navy/25">·</span>
            <span className="text-brand-navy/60">Powered by Khulisa Group</span>
          </span>
        </Link>



        <nav className="hidden md:flex items-center gap-6 text-sm whitespace-nowrap">
          {NAV.filter((n) => n.to !== "/help").map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="text-brand-dark/70 hover:text-brand-primary transition-colors"
              activeProps={{ className: "text-brand-primary font-semibold" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSelector className="hidden sm:block" />
          {signedIn ? (
            <Link
              to="/profile"
              className="inline-flex relative items-center gap-2 px-3 sm:px-4 py-2.5 rounded-full bg-brand-green text-white text-sm font-semibold whitespace-nowrap shadow-sm hover:bg-brand-primary/90 transition"
            >
              <UserRound className="size-4" />
              My Profile
              {unread > 0 && (
                <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-white text-brand-primary text-[11px] font-bold">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </Link>
          ) : (
            <Link
              to="/auth"
              className="inline-flex px-3 sm:px-4 py-2.5 rounded-full border border-brand-navy/15 text-sm font-medium whitespace-nowrap text-brand-dark/80 hover:bg-brand-soft hover:text-brand-primary transition"
            >
              Sign In
            </Link>
          )}
          <button
            onClick={() => setOpen((v) => !v)}
            className="md:hidden size-11 rounded-full bg-brand-soft grid place-items-center relative"
            aria-label={t("nav.toggleMenu")}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-brand-dark/5 bg-brand-page">
          <nav className="px-4 py-4 flex flex-col gap-2 text-base">
            {signedIn && (
              <Link
                to="/profile"
                onClick={() => setOpen(false)}
                className="relative px-4 py-3.5 rounded-xl bg-brand-primary text-white font-semibold shadow flex items-center justify-between"
              >
                <span className="inline-flex items-center gap-2">
                  <UserRound className="size-5" /> My Profile
                </span>
                {unread > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[22px] h-5 px-1.5 rounded-full bg-white text-brand-primary text-[11px] font-bold">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </Link>
            )}

            {NAV.filter((n) => !(signedIn && n.to === "/")).map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="px-4 py-3 rounded-xl text-brand-dark/85 hover:bg-brand-soft"
                activeProps={{ className: "bg-brand-soft text-brand-primary font-semibold" }}
                activeOptions={{ exact: n.to === "/" }}
              >
                {n.label}
              </Link>
            ))}

            {signedIn ? (
              <button
                onClick={() => {
                  setOpen(false);
                  handleSignOut();
                }}
                className="px-4 py-3 rounded-xl border border-brand-dark/15 text-brand-dark/80 hover:bg-brand-soft flex items-center gap-2"
              >
                <LogOut className="size-4" /> Sign Out
              </button>
            ) : (
              <Link
                to="/auth"
                onClick={() => setOpen(false)}
                className="px-4 py-3.5 rounded-xl bg-brand-primary text-white font-semibold shadow text-center"
              >
                Sign In / Create Account
              </Link>
            )}
            <div className="px-1 pt-2">
              <LanguageSelector />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
