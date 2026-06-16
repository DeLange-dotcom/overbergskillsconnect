import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Menu, X, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/find-help", label: "Find Help" },
  { to: "/register-provider", label: "Register" },
  { to: "/request-support", label: "Request Support" },
  { to: "/how-it-works", label: "How it works" },
  { to: "/donate", label: "Donate" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

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
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="size-9 rounded-full bg-brand-primary text-primary-foreground grid place-items-center font-heading font-bold">
            H
          </div>
          <div className="leading-tight">
            <div className="font-heading font-bold text-brand-primary text-lg">Hineni</div>
            <div className="text-[10px] uppercase tracking-widest text-brand-dark/50">
              Skills Register
            </div>
          </div>
        </Link>

        <nav className="hidden xl:flex items-center gap-6 text-sm whitespace-nowrap">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="text-brand-dark/70 hover:text-brand-primary transition-colors whitespace-nowrap"
              activeProps={{ className: "text-brand-primary font-semibold whitespace-nowrap" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
          <Link
            to="/youth"
            className="px-4 py-2 rounded-full bg-brand-primary text-primary-foreground text-sm font-medium hover:brightness-110 transition whitespace-nowrap"
            activeProps={{ className: "px-4 py-2 rounded-full bg-brand-primary text-primary-foreground text-sm font-medium brightness-110 whitespace-nowrap" }}
          >
            Youth Hub
          </Link>
          <Link
            to="/apprenticeships"
            className="px-4 py-2 rounded-full bg-brand-primary text-primary-foreground text-sm font-medium hover:brightness-110 transition whitespace-nowrap"
            activeProps={{ className: "px-4 py-2 rounded-full bg-brand-primary text-primary-foreground text-sm font-medium brightness-110 whitespace-nowrap" }}
          >
            Apprenticeships
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/donate"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-brand-accent text-white text-sm font-medium hover:brightness-110 transition whitespace-nowrap"
          >
            <Heart className="size-4" /> Donate
          </Link>
          {signedIn ? (
            <Link
              to="/admin"
              className="hidden sm:inline-flex px-3 py-2 rounded-full border border-brand-dark/10 text-sm text-brand-dark hover:bg-brand-soft transition"
            >
              Admin
            </Link>
          ) : null}
          <button
            onClick={() => setOpen((v) => !v)}
            className="xl:hidden size-10 rounded-full bg-brand-soft grid place-items-center"
            aria-label="Toggle menu"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-brand-dark/5 bg-brand-page">
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
            <div className="border-t border-brand-dark/10 my-1" />
            <Link
              to="/youth"
              onClick={() => setOpen(false)}
              className="px-3 py-3 rounded-lg text-center bg-brand-primary text-primary-foreground font-medium hover:brightness-110"
              activeProps={{ className: "px-3 py-3 rounded-lg text-center bg-brand-primary text-primary-foreground font-medium brightness-110" }}
            >
              Youth Hub
            </Link>
            <Link
              to="/apprenticeships"
              onClick={() => setOpen(false)}
              className="px-3 py-3 rounded-lg text-center bg-brand-primary text-primary-foreground font-medium hover:brightness-110"
              activeProps={{ className: "px-3 py-3 rounded-lg text-center bg-brand-primary text-primary-foreground font-medium brightness-110" }}
            >
              Apprenticeships
            </Link>
            {signedIn && (
              <Link
                to="/admin"
                onClick={() => setOpen(false)}
                className="px-3 py-2.5 rounded-lg text-brand-dark/80 hover:bg-brand-soft"
              >
                Admin Dashboard
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
