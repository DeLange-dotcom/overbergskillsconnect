import { useState } from "react";
import { Info, ShieldCheck } from "lucide-react";

export type PccStatus = "" | "have" | "applied" | "none" | "need_help";

/**
 * Police Clearance Certificate (PCC) registration fieldset.
 *
 * Self-contained: renders status radios, conditional details when the applicant
 * has a PCC, an info notice + financial-assistance opt-in when they don't.
 *
 * Reads back from FormData via named inputs:
 *  - pcc_status: 'have' | 'applied' | 'none'
 *  - pcc_issue_date (when have)
 *  - pcc_number (when have, optional)
 *  - pcc_wants_assistance ('on' when checked, only relevant if status !== 'have')
 */
export function PccSection({ errors = {} }: { errors?: Record<string, string> }) {
  const [status, setStatus] = useState<PccStatus>("");

  return (
    <fieldset className="bg-white rounded-2xl border border-brand-dark/10 p-5 sm:p-6">
      <legend className="px-2 font-heading text-lg font-semibold inline-flex items-center gap-2">
        <ShieldCheck className="size-4 text-brand-primary" />
        Police Clearance Certificate (PCC)
      </legend>

      <p className="text-sm text-brand-dark/70 mb-4">
        A PCC helps Hineni place you in trusted, safer opportunities. If you don't have
        one yet, you can still register — let us know and we'll guide you.
      </p>

      <div className="space-y-2.5" role="radiogroup" aria-label="Police Clearance Certificate status">
        <Option
          value="have"
          current={status}
          onChange={setStatus}
          label="I have a current Police Clearance Certificate"
        />
        <Option
          value="applied"
          current={status}
          onChange={setStatus}
          label="I have applied for a Police Clearance Certificate"
        />
        <Option
          value="none"
          current={status}
          onChange={setStatus}
          label="I do not currently have a Police Clearance Certificate"
        />
        <Option
          value="need_help"
          current={status}
          onChange={setStatus}
          label="I need help with paying for a Police Clearance Certificate"
        />
      </div>
      {errors.pcc_status && (
        <p className="text-xs text-destructive mt-2">{errors.pcc_status}</p>
      )}

      {status === "have" && (
        <div className="mt-5 grid sm:grid-cols-2 gap-4 rounded-xl bg-brand-soft/60 p-4">
          <div className="sm:col-span-2 text-sm text-brand-dark/70">
            You'll bring your original PCC for verification at your interview. Hineni admins
            will scan and securely store a copy on your record.
          </div>
          <div>
            <Label>Certificate issue date <span className="text-destructive">*</span></Label>
            <input
              name="pcc_issue_date"
              type="date"
              required
              className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl bg-white"
            />
            {errors.pcc_issue_date && (
              <p className="text-xs text-destructive mt-1">{errors.pcc_issue_date}</p>
            )}
          </div>
          <div>
            <Label>Certificate number (optional)</Label>
            <input
              name="pcc_number"
              type="text"
              className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl bg-white"
            />
          </div>
        </div>
      )}

      {(status === "applied" || status === "none") && (
        <div className="mt-5 space-y-4">
          <div className="rounded-xl border border-brand-dark/10 bg-brand-soft/40 p-4 text-sm text-brand-dark/80 flex gap-3">
            <Info className="size-5 text-brand-primary shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="font-medium text-brand-dark">How to apply for a PCC</p>
              <p>
                A Police Clearance Certificate can be obtained from your local South African
                Police Service (SAPS) station. You will normally need:
              </p>
              <ul className="list-disc list-inside space-y-1 text-brand-dark/75">
                <li>A valid ID document or passport</li>
                <li>Fingerprints taken by SAPS</li>
                <li>Payment of the applicable SAPS fee</li>
              </ul>
              <p className="text-brand-dark/70">
                Please contact your nearest police station for current requirements and
                processing times.
              </p>
            </div>
          </div>

          <label className="flex items-start gap-3 p-4 rounded-xl border border-brand-primary/20 bg-brand-primary/5 cursor-pointer">
            <input
              type="checkbox"
              name="pcc_wants_assistance"
              className="mt-1 accent-brand-primary"
            />
            <span className="text-sm">
              <span className="font-medium text-brand-dark">
                I would like Hineni to contact me regarding assistance with obtaining a Police
                Clearance Certificate.
              </span>
              <span className="block mt-1 text-brand-dark/70">
                Hineni believes that financial circumstances should not prevent suitable
                candidates from accessing opportunities. In certain circumstances we may be
                able to assist applicants with obtaining a Police Clearance Certificate,
                subject to available funding and programme criteria.
              </span>
            </span>
          </label>
        </div>
      )}
    </fieldset>
  );
}

function Option({
  value,
  current,
  onChange,
  label,
}: {
  value: Exclude<PccStatus, "">;
  current: string;
  onChange: (v: Exclude<PccStatus, "">) => void;
  label: string;
}) {
  const selected = current === value;
  return (
    <label
      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
        selected
          ? "border-brand-primary bg-brand-primary/5"
          : "border-brand-dark/10 hover:bg-brand-soft/50"
      }`}
    >
      <input
        type="radio"
        name="pcc_status"
        value={value}
        checked={selected}
        onChange={() => onChange(value)}
        required
        className="mt-1 accent-brand-primary"
      />
      <span className="text-sm">{label}</span>
    </label>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-sm font-medium text-brand-dark/80 mb-1.5">{children}</div>;
}

/**
 * Parse PCC form values from a FormData on submit.
 * Returns null when status is missing (validation responsibility of the caller).
 */
export function readPccFromForm(fd: FormData): {
  pcc_status: "have" | "applied" | "none" | null;
  pcc_issue_date: string | null;
  pcc_number: string | null;
  pcc_wants_assistance: boolean;
} {
  const status = (fd.get("pcc_status") as string) || "";
  const validStatus =
    status === "have" || status === "applied" || status === "none" ? status : null;
  return {
    pcc_status: validStatus,
    pcc_issue_date:
      validStatus === "have" ? ((fd.get("pcc_issue_date") as string) || null) : null,
    pcc_number:
      validStatus === "have" ? ((fd.get("pcc_number") as string)?.trim() || null) : null,
    pcc_wants_assistance:
      validStatus !== "have" && fd.get("pcc_wants_assistance") === "on",
  };
}
