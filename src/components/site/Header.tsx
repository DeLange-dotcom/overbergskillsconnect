import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { LanguageSelector } from "@/components/site/LanguageSelector";
import overbergLogo from "@/assets/overberg-logo.png.asset.json";

export function Header() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [unread, setUnread] = useState(0);

  const NAV = [
    { to: "/", label: t("nav.home") },
    { to: "/how-it-works", label: t("nav.howItWorks") },
    { to: "/find-help", label: t("nav.browse") },
    { to: "/advertise", label: t("nav.advertise") },
    { to: "/about", label: t("nav.about") },
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <img
            src={overbergLogo.url}
            alt="Overberg Skills Connect"
            className="h-12 w-auto object-contain"
          />
          <div className="leading-tight hidden sm:block">
            <div className="font-heading font-bold text-brand-primary text-lg">
              Overberg Skills Connect
            </div>
            <div className="text-[10px] uppercase tracking-widest text-brand-dark/50">
              {t("footer.poweredBy")}
            </div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm whitespace-nowrap">
          {NAV.map((n) => (
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
              className="hidden sm:inline-flex relative items-center gap-2 px-4 py-2 rounded-full bg-brand-primary text-white text-sm font-semibold shadow hover:bg-brand-primary/90 transition"
            >
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
              className="hidden sm:inline-flex px-3 py-2 rounded-full border border-brand-dark/10 text-sm text-brand-dark/70 hover:bg-brand-soft hover:text-brand-primary transition"
              title={t("nav.adminSignIn")}
            >
              Sign in
            </Link>
          )}
          <button
            onClick={() => setOpen((v) => !v)}
            className="md:hidden size-10 rounded-full bg-brand-soft grid place-items-center relative"
            aria-label={t("nav.toggleMenu")}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
            {signedIn && unread > 0 && !open && (
              <span className="absolute top-1 right-1 size-2.5 rounded-full bg-brand-primary" />
            )}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-brand-dark/5 bg-brand-page">
          <nav className="px-4 py-4 flex flex-col gap-2">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="px-3 py-2.5 rounded-lg text-brand-dark/80 hover:bg-brand-soft"
                activeProps={{ className: "bg-brand-soft text-brand-primary font-semibold" }}
                activeOptions={{ exact: n.to === "/" }}
              >
                {n.label}
              </Link>
            ))}
            {signedIn ? (
              <Link
                to="/profile"
                onClick={() => setOpen(false)}
                className="relative px-4 py-2.5 rounded-lg bg-brand-primary text-white font-semibold shadow hover:bg-brand-primary/90 flex items-center justify-between"
              >
                <span>My Profile</span>
                {unread > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[22px] h-5 px-1.5 rounded-full bg-white text-brand-primary text-[11px] font-bold">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </Link>
            ) : (
              <Link
                to="/auth"
                onClick={() => setOpen(false)}
                className="px-3 py-2.5 rounded-lg text-brand-dark/80 hover:bg-brand-soft"
              >
                Sign in
              </Link>
            )}
            <div className="px-3 pt-2">
              <LanguageSelector />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
