import { Link } from "@tanstack/react-router";

export function Footer() {
  const shareUrl =
    typeof window !== "undefined" ? window.location.origin : "https://hineni.example";
  const waLink = `https://wa.me/?text=${encodeURIComponent(
    `Find or register for trusted local help with Hineni: ${shareUrl}`,
  )}`;

  return (
    <footer className="mt-20 border-t border-brand-dark/5 bg-brand-soft/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 grid gap-8 md:grid-cols-3">
        <div>
          <div className="font-heading text-xl font-bold text-brand-primary mb-2">Hineni</div>
          <p className="text-sm text-brand-dark/70 max-w-xs">
            A trusted community skills register for the Overberg. Connecting vetted local people
            with households, farms and businesses that need help.
          </p>
        </div>
        <div className="text-sm">
          <div className="font-semibold mb-3 text-brand-dark">Get involved</div>
          <ul className="space-y-2 text-brand-dark/70">
            <li><Link to="/register-provider" className="hover:text-brand-primary">Register your skills</Link></li>
            <li><Link to="/find-help" className="hover:text-brand-primary">Find approved help</Link></li>
            <li><Link to="/request-support" className="hover:text-brand-primary">Request support</Link></li>
            <li><Link to="/donate" className="hover:text-brand-primary">Donate to Hineni</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <div className="font-semibold mb-3 text-brand-dark">Information</div>
          <ul className="space-y-2 text-brand-dark/70">
            <li><Link to="/how-it-works" className="hover:text-brand-primary">How it works</Link></li>
            <li><Link to="/terms" className="hover:text-brand-primary">Terms &amp; Disclaimer</Link></li>
            <li><Link to="/privacy" className="hover:text-brand-primary">Privacy notice (POPIA)</Link></li>
            <li>
              <a href={waLink} target="_blank" rel="noopener noreferrer" className="hover:text-brand-primary">
                Share on WhatsApp
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-brand-dark/5 py-5 text-center text-xs text-brand-dark/50">
        &copy; {new Date().getFullYear()} Hineni Community Skills Register · Overberg, South Africa
      </div>
    </footer>
  );
}
