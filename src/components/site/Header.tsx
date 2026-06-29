import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/find-help", label: "Looking for Someone" },
  { to: "/advertise", label: "Advertise My Skills" },
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
            K
          </div>
          <div className="leading-tight">
            <div className="font-heading font-bold text-brand-primary text-lg">
              Overberg Skills Connect
            </div>
            <div className="text-[10px] uppercase tracking-widest text-brand-dark/50">
              Community Noticeboard
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
          <Link
            to="/advertise"
            className="hidden sm:inline-flex px-4 py-2 rounded-full bg-brand-primary text-primary-foreground text-sm font-medium hover:brightness-110 transition"
          >
            Advertise
          </Link>
          {signedIn ? (
            <Link
              to="/admin"
              className="hidden sm:inline-flex px-3 py-2 rounded-full border border-brand-dark/10 text-sm text-brand-dark hover:bg-brand-soft transition"
            >
              Admin
            </Link>
          ) : (
            <Link
              to="/auth"
              className="hidden sm:inline-flex px-3 py-2 rounded-full border border-brand-dark/10 text-sm text-brand-dark/70 hover:bg-brand-soft hover:text-brand-primary transition"
              title="Admin sign-in"
            >
              Admin
            </Link>
          )}
          <button
            onClick={() => setOpen((v) => !v)}
            className="md:hidden size-10 rounded-full bg-brand-soft grid place-items-center"
            aria-label="Toggle menu"
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
                to="/admin"
                onClick={() => setOpen(false)}
                className="px-3 py-2.5 rounded-lg text-brand-dark/80 hover:bg-brand-soft"
              >
                Admin Dashboard
              </Link>
            ) : (
              <Link
                to="/auth"
                onClick={() => setOpen(false)}
                className="px-3 py-2.5 rounded-lg text-brand-dark/80 hover:bg-brand-soft"
              >
                Admin sign-in
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
