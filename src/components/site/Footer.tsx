import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { PLATFORM_NAME, IP_OWNERSHIP_STATEMENT } from "@/lib/brand";
import { supabase } from "@/integrations/supabase/client";

export function Footer() {
  const { t } = useTranslation();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let active = true;
    async function check() {
      const { data: userRes } = await supabase.auth.getUser();
      const uid = userRes.user?.id;
      if (!uid) { if (active) setIsAdmin(false); return; }
      const { data } = await supabase.rpc("has_role", { _user_id: uid, _role: "admin" });
      if (active) setIsAdmin(Boolean(data));
    }
    check();
    const { data: sub } = supabase.auth.onAuthStateChange(() => check());
    return () => { active = false; sub.subscription.unsubscribe(); };
  }, []);

  return (
    <footer className="mt-20 border-t border-brand-dark/5 bg-brand-soft/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 grid gap-8 md:grid-cols-2">
        <div>
          <div className="font-heading text-xl font-bold text-brand-primary mb-1">
            {PLATFORM_NAME}
          </div>
          <div className="text-sm text-brand-dark/70 mb-1">{t("footer.tagline")}</div>
          <div className="text-xs uppercase tracking-widest text-brand-dark/50">
            {t("footer.poweredBy")}
          </div>
        </div>
        <div className="text-sm">
          <div className="font-semibold mb-3 text-brand-dark">{t("footer.information")}</div>
          <ul className="space-y-2 text-brand-dark/70">
            <li><Link to="/how-it-works" className="hover:text-brand-primary">How It Works</Link></li>
            <li><Link to="/about" className="hover:text-brand-primary">{t("footer.about")}</Link></li>
            <li><Link to="/terms" className="hover:text-brand-primary">{t("footer.terms")}</Link></li>
            <li><Link to="/privacy" className="hover:text-brand-primary">{t("footer.privacy")}</Link></li>
            <li><Link to="/disclaimer" className="hover:text-brand-primary">{t("footer.disclaimer")}</Link></li>
            <li><Link to="/contact" className="hover:text-brand-primary">{t("footer.contact")}</Link></li>
            {isAdmin && (
              <li>
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-dark text-white text-xs font-semibold hover:bg-brand-dark/90 transition"
                >
                  🛠 Admin
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className="border-t border-brand-dark/5 py-6 px-4 sm:px-6 space-y-3">
        <p className="max-w-5xl mx-auto text-[11px] leading-relaxed text-brand-dark/55 text-center">
          {IP_OWNERSHIP_STATEMENT}
        </p>
        <div className="text-center text-xs text-brand-dark/50">
          {t("footer.copyright")}
        </div>
      </div>
    </footer>
  );
}
