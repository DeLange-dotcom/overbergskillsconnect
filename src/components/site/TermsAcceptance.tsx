import { Link } from "@tanstack/react-router";
import { ACCEPTANCE_TEXT, TERMS_VERSION } from "@/lib/terms";

export function TermsAcceptance({
  name = "accept_terms",
  checked,
  onChange,
  error,
}: {
  name?: string;
  checked?: boolean;
  onChange?: (v: boolean) => void;
  error?: string;
}) {
  return (
    <div className="rounded-2xl border border-brand-dark/10 bg-brand-soft/40 p-4">
      <div className="flex items-start gap-3 text-sm leading-relaxed">
        <input
          id={name}
          name={name}
          type="checkbox"
          required
          checked={checked}
          onChange={(e) => onChange?.(e.target.checked)}
          className="mt-1 size-4 accent-brand-primary shrink-0"
        />
        <label htmlFor={name} className="text-brand-dark/85">
          {ACCEPTANCE_TEXT}{" "}
          <span className="block mt-2 text-xs text-brand-dark/60">
            Read the full{" "}
            <Link to="/terms" target="_blank" className="underline text-brand-primary">
              Terms &amp; Disclaimer
            </Link>{" "}
            and{" "}
            <Link to="/privacy" target="_blank" className="underline text-brand-primary">
              Privacy Notice
            </Link>
            . Version {TERMS_VERSION}.
          </span>
        </label>
      </div>
      {error && <p className="text-xs text-destructive mt-2">{error}</p>}
    </div>
  );
}
