import { Link } from "@tanstack/react-router";
import {
  PLATFORM_NAME,
  PLATFORM_OWNER,
  IP_OWNERSHIP_STATEMENT,
} from "@/lib/brand";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-brand-dark/5 bg-brand-soft/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 grid gap-8 md:grid-cols-2">
        <div>
          <div className="font-heading text-xl font-bold text-brand-primary mb-1">
            {PLATFORM_NAME}
          </div>
          <div className="text-xs uppercase tracking-widest text-brand-dark/50 mb-3">
            A Khulisa Group Platform
          </div>
          <p className="text-sm text-brand-dark/70 max-w-sm">
            A digital community noticeboard. Overberg Skills Connect does not employ, recruit, recommend
            or vet anyone using this platform.
          </p>
        </div>
        <div className="text-sm">
          <div className="font-semibold mb-3 text-brand-dark">Information</div>
          <ul className="space-y-2 text-brand-dark/70">
            <li><Link to="/terms" className="hover:text-brand-primary">Terms of Use</Link></li>
            <li><Link to="/privacy" className="hover:text-brand-primary">Privacy Policy</Link></li>
            <li><Link to="/disclaimer" className="hover:text-brand-primary">Disclaimer</Link></li>
            <li><Link to="/contact" className="hover:text-brand-primary">Contact Us</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-brand-dark/5 py-6 px-4 sm:px-6 space-y-3">
        <p className="max-w-5xl mx-auto text-[11px] leading-relaxed text-brand-dark/55 text-center">
          {IP_OWNERSHIP_STATEMENT}
        </p>
        <div className="text-center text-xs text-brand-dark/50">
          &copy; {new Date().getFullYear()} {PLATFORM_OWNER} · {PLATFORM_NAME}
        </div>
      </div>
    </footer>
  );
}
