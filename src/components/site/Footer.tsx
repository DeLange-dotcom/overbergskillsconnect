import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { IP_OWNERSHIP_STATEMENT } from "@/lib/brand";
import { Logo } from "@/components/brand/Logo";
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
    <footer className="mt-20 bg-brand-navy text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 grid gap-10 md:grid-cols-2">
        <div>
          <Logo onDark showRelationship={false} />
          <p className="mt-4 text-sm text-white/70 max-w-sm leading-relaxed">
            {t("footer.tagline")}
          </p>
          <div className="mt-4 space-y-1">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-green">
              A Hineni Call Initiative
            </div>
            <div className="text-[11px] uppercase tracking-[0.16em] text-white/55">
              Powered by Khulisa Group
            </div>
          </div>
        </div>
        <div className="text-sm md:justify-self-end">
          <div className="font-semibold mb-3 text-white">{t("footer.information")}</div>
          <ul className="space-y-2.5 text-white/75">
            <li><Link to="/help" className="font-semibold text-brand-green hover:underline">Need Help?</Link></li>
            <li><Link to="/how-it-works" className="hover:text-white">How It Works</Link></li>
            <li><Link to="/about" className="hover:text-white">{t("footer.about")}</Link></li>
            <li><Link to="/terms" className="hover:text-white">{t("footer.terms")}</Link></li>
            <li><Link to="/privacy" className="hover:text-white">{t("footer.privacy")}</Link></li>
            <li><Link to="/disclaimer" className="hover:text-white">{t("footer.disclaimer")}</Link></li>
            <li><Link to="/contact" className="hover:text-white">{t("footer.contact")}</Link></li>
            {isAdmin && (
              <li>
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-white text-xs font-semibold hover:bg-white/20 transition"
                >
                  🛠 Admin
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-6 px-4 sm:px-6 space-y-3">
        <p className="max-w-5xl mx-auto text-[11px] leading-relaxed text-white/45 text-center">
          {IP_OWNERSHIP_STATEMENT}
        </p>
        <div className="text-center text-xs text-white/55">
          {t("footer.copyright")}
        </div>
      </div>
    </footer>
  );
}
