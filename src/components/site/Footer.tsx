import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { HINENI_DISCLAIMER } from "@/lib/directory-constants";
import {
  PLATFORM_NAME,
  POWERED_BY_LINE,
  GROUP_PLATFORM_LINE,
  PLATFORM_OWNER,
  IP_OWNERSHIP_STATEMENT,
} from "@/lib/brand";

export function Footer() {
  const [shareUrl, setShareUrl] = useState("https://hineni.example");
  useEffect(() => {
    setShareUrl(window.location.origin);
  }, []);
  const waLink = `https://wa.me/?text=${encodeURIComponent(
    `Find or register for trusted local help with Hineni: ${shareUrl}`,
  )}`;

  return (
    <footer className="mt-20 border-t border-brand-dark/5 bg-brand-soft/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 grid gap-8 md:grid-cols-3">
        <div>
          <div className="font-heading text-xl font-bold text-brand-primary mb-1">
            {PLATFORM_NAME}
          </div>
          <div className="text-xs uppercase tracking-widest text-brand-dark/50 mb-3">
            {GROUP_PLATFORM_LINE}
          </div>
          <p className="text-sm text-brand-dark/70 max-w-xs">
            A multi-programme skills, mentorship and opportunities platform owned and operated by{" "}
            {PLATFORM_OWNER}. The Hineni Programme is delivered through this platform to serve the
            Overberg community.
          </p>
        </div>
        <div className="text-sm">
          <div className="font-semibold mb-3 text-brand-dark">Get involved</div>
          <ul className="space-y-2 text-brand-dark/70">
            <li><Link to="/register-provider" className="hover:text-brand-primary">Register your skills</Link></li>
            <li><Link to="/directory" className="hover:text-brand-primary">Search directory</Link></li>
            <li><Link to="/find-help" className="hover:text-brand-primary">Find approved help</Link></li>
            <li><Link to="/request-support" className="hover:text-brand-primary">Request support</Link></li>
            <li><Link to="/youth" className="hover:text-brand-primary">Youth Opportunities Hub</Link></li>
            <li><Link to="/apprenticeships" className="hover:text-brand-primary">Apprenticeships &amp; Mentorships</Link></li>
            <li><Link to="/donate" className="hover:text-brand-primary">Donate to Hineni</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <div className="font-semibold mb-3 text-brand-dark">Information</div>
          <ul className="space-y-2 text-brand-dark/70">
            <li><Link to="/how-it-works" className="hover:text-brand-primary">How it works</Link></li>
            <li><Link to="/terms" className="hover:text-brand-primary">Terms &amp; Disclaimer</Link></li>
            <li><Link to="/privacy" className="hover:text-brand-primary">Privacy notice (POPIA)</Link></li>
            <li><Link to="/safeguarding-policy" className="hover:text-brand-primary">Safeguarding policy</Link></li>
            <li>
              <a href={waLink} target="_blank" rel="noopener noreferrer" className="hover:text-brand-primary">
                Share on WhatsApp
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-brand-dark/5 py-6 px-4 sm:px-6 space-y-4">
        <p className="max-w-5xl mx-auto text-[11px] leading-relaxed text-brand-dark/55 text-center">
          {HINENI_DISCLAIMER}
        </p>
        <p className="max-w-5xl mx-auto text-[11px] leading-relaxed text-brand-dark/55 text-center">
          {IP_OWNERSHIP_STATEMENT}
        </p>
        <div className="text-center text-xs text-brand-dark/60 font-medium">
          {POWERED_BY_LINE} · {GROUP_PLATFORM_LINE}
        </div>
        <div className="text-center text-xs text-brand-dark/50">
          &copy; {new Date().getFullYear()} {PLATFORM_OWNER} · {PLATFORM_NAME}
        </div>
      </div>
    </footer>
  );
}
