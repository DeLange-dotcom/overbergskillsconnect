import { Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { SAFEGUARDING_ACK_ITEMS, SAFEGUARDING_POLICY_VERSION } from "@/lib/safeguarding";

export type SafeguardingAckState = [boolean, boolean, boolean, boolean];

export function emptyAckState(): SafeguardingAckState {
  return [false, false, false, false];
}

export function isAckComplete(s: SafeguardingAckState): boolean {
  return s.every(Boolean);
}

export function SafeguardingAcknowledgement({
  value,
  onChange,
  error,
}: {
  value: SafeguardingAckState;
  onChange: (next: SafeguardingAckState) => void;
  error?: string;
}) {
  const links: Record<number, React.ReactNode> = {
    0: (
      <Link to="/safeguarding-policy" target="_blank" className="underline text-brand-primary">
        Safeguarding Policy
      </Link>
    ),
    1: (
      <Link to="/safeguarding-policy" target="_blank" className="underline text-brand-primary">
        Safeguarding Policy
      </Link>
    ),
    3: (
      <>
        <Link to="/terms" target="_blank" className="underline text-brand-primary">
          Terms &amp; Conditions
        </Link>{" "}
        and{" "}
        <Link to="/privacy" target="_blank" className="underline text-brand-primary">
          Privacy Policy
        </Link>
      </>
    ),
  };

  function toggle(i: number, v: boolean) {
    const next = [...value] as SafeguardingAckState;
    next[i] = v;
    onChange(next);
  }

  return (
    <div className="rounded-2xl border border-brand-dark/10 bg-brand-soft/40 p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-3">
        <ShieldCheck className="size-4 text-brand-primary" />
        <h3 className="font-heading text-sm font-semibold text-brand-dark">
          Safeguarding acknowledgement
        </h3>
        <span className="ml-auto text-[11px] text-brand-dark/50">
          Policy v{SAFEGUARDING_POLICY_VERSION}
        </span>
      </div>
      <div className="space-y-2.5">
        {SAFEGUARDING_ACK_ITEMS.map((item, i) => {
          const link = links[i];
          // Replace the relevant phrase with a link where applicable
          const rendered = link
            ? item
                .split(/(Safeguarding Policy|Terms and Conditions and Privacy Policy)/)
                .map((part, idx) =>
                  part === "Safeguarding Policy" || part === "Terms and Conditions and Privacy Policy"
                    ? <span key={idx}>{link}</span>
                    : <span key={idx}>{part}</span>,
                )
            : item;
          return (
            <label key={i} className="flex items-start gap-3 text-sm text-brand-dark/85 leading-relaxed">
              <input
                type="checkbox"
                checked={value[i]}
                onChange={(e) => toggle(i, e.target.checked)}
                className="mt-1 size-4 accent-brand-primary shrink-0"
                required
              />
              <span>{rendered}</span>
            </label>
          );
        })}
      </div>
      {error && <p className="text-xs text-destructive mt-3">{error}</p>}
    </div>
  );
}
