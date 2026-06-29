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

  const NAV = [
    { to: "/", label: t("nav.home") },
    { to: "/find-help", label: t("nav.browse") },
    { to: "/advertise", label: t("nav.advertise") },
    { to: "/about", label: t("nav.about") },
  ];

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setSignedIn(!!data.session);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setSignedIn(!!session);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

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
              to="/my-advert"
              className="hidden sm:inline-flex px-3 py-2 rounded-full border border-brand-dark/10 text-sm text-brand-dark hover:bg-brand-soft transition"
            >
              My Listing
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
            className="md:hidden size-10 rounded-full bg-brand-soft grid place-items-center"
            aria-label={t("nav.toggleMenu")}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
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
                to="/my-advert"
                onClick={() => setOpen(false)}
                className="px-3 py-2.5 rounded-lg text-brand-dark/80 hover:bg-brand-soft"
              >
                My Listing
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
