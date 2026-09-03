import { Link } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
import { SHORT_DISCLAIMER } from "@/lib/noticeboard";

/** One-line safety notice with a link to the full disclaimer. */
export function ShortNotice({ className = "" }: { className?: string }) {
  return (
    <p className={`flex items-start gap-2 text-xs text-brand-dark/70 leading-relaxed ${className}`}>
      <ShieldAlert className="size-4 text-amber-600 shrink-0 mt-px" aria-hidden />
      <span>
        {SHORT_DISCLAIMER}{" "}
        <Link to="/disclaimer" className="underline hover:text-brand-primary">
          Read the full notice
        </Link>
        .
      </span>
    </p>
  );
}
