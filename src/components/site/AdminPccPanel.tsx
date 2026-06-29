import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { VerificationBadge, VERIFICATION_CRITERIA, type VerificationLevel } from "./VerificationBadge";
import { Download, Loader2, Upload, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

type Table = "service_providers" | "apprentices" | "youth_profiles";

interface Props {
  table: Table;
  id: string;
}

interface PccRecord {
  pcc_status: "have" | "applied" | "none" | null;
  pcc_certificate_path: string | null;
  pcc_issue_date: string | null;
  pcc_number: string | null;
  pcc_wants_assistance: boolean;
  pcc_verified: boolean;
  pcc_verified_by: string | null;
  pcc_verified_at: string | null;
  pcc_admin_notes: string | null;
  pcc_expiry_review_date: string | null;
  identity_verified: boolean;
  references_checked: boolean;
  interview_completed: boolean;
  verification_level: VerificationLevel;
}

export function AdminPccPanel({ table, id }: Props) {
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [savingChecklist, setSavingChecklist] = useState(false);
  const [notesDraft, setNotesDraft] = useState("");

  const recordQ = useQuery({
    queryKey: ["admin_pcc", table, id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(table)
        .select(
          "pcc_status, pcc_certificate_path, pcc_issue_date, pcc_number, pcc_wants_assistance, pcc_verified, pcc_verified_by, pcc_verified_at, pcc_admin_notes, pcc_expiry_review_date, identity_verified, references_checked, interview_completed, verification_level",
        )
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as unknown as PccRecord;
    },
  });

  useEffect(() => {
    if (recordQ.data) setNotesDraft(recordQ.data.pcc_admin_notes ?? "");
  }, [recordQ.data]);

  async function patch(updates: Partial<PccRecord>) {
    const { data: user } = await supabase.auth.getUser();
    const payload: Partial<PccRecord> = { ...updates };
    if (
      "pcc_verified" in updates ||
      "identity_verified" in updates ||
      "references_checked" in updates ||
      "interview_completed" in updates
    ) {
      payload.pcc_verified_by = user.user?.id ?? null;
      payload.pcc_verified_at = new Date().toISOString();
    }
    const { error } = await supabase.from(table).update(payload as never).eq("id", id);
    if (error) {
      toast.error(error.message);
      return false;
    }
    await qc.invalidateQueries({ queryKey: ["admin_pcc", table, id] });
    return true;
  }

  async function toggleChecklist(field: keyof PccRecord, value: boolean) {
    setSavingChecklist(true);
    const ok = await patch({ [field]: value } as Partial<PccRecord>);
    setSavingChecklist(false);
    if (ok) toast.success("Verification updated");
  }

  async function saveNotes() {
    if (!recordQ.data) return;
    if ((recordQ.data.pcc_admin_notes ?? "") === notesDraft) return;
    await patch({ pcc_admin_notes: notesDraft });
    toast.success("Notes saved");
  }

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File must be 10MB or less.");
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop()?.toLowerCase() || "pdf";
    const path = `${id}/pcc-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("pcc-documents")
      .upload(path, file, { upsert: false, contentType: file.type });
    if (upErr) {
      toast.error(upErr.message);
      setUploading(false);
      return;
    }
    await patch({ pcc_certificate_path: path });
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    toast.success("Certificate uploaded");
  }

  async function downloadCert() {
    if (!recordQ.data?.pcc_certificate_path) return;
    const { data, error } = await supabase.storage
      .from("pcc-documents")
      .createSignedUrl(recordQ.data.pcc_certificate_path, 120);
    if (error) {
      toast.error(error.message);
      return;
    }
    window.open(data.signedUrl, "_blank");
  }

  if (recordQ.isLoading || !recordQ.data) {
    return (
      <section className="bg-white border border-brand-dark/5 rounded-2xl p-5">
        <Loader2 className="size-5 animate-spin text-brand-dark/40" />
      </section>
    );
  }

  const r = recordQ.data;

  return (
    <section className="bg-white border border-brand-dark/5 rounded-2xl p-5 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-heading text-lg font-semibold inline-flex items-center gap-2">
          <ShieldCheck className="size-5 text-brand-primary" />
          Verification & PCC
        </h2>
        <VerificationBadge level={r.verification_level} size="lg" showTooltip />
      </div>

      <div>
        <div className="text-xs uppercase tracking-wider text-brand-dark/50 mb-2">
          Verification checklist (admin only)
        </div>
        <div className="grid sm:grid-cols-2 gap-2">
          <CheckRow
            label="Identity verified"
            checked={r.identity_verified}
            disabled={savingChecklist}
            onChange={(v) => toggleChecklist("identity_verified", v)}
          />
          <CheckRow
            label="References checked"
            checked={r.references_checked}
            disabled={savingChecklist}
            onChange={(v) => toggleChecklist("references_checked", v)}
          />
          <CheckRow
            label="Interview completed"
            checked={r.interview_completed}
            disabled={savingChecklist}
            onChange={(v) => toggleChecklist("interview_completed", v)}
          />
          <CheckRow
            label="PCC verified"
            checked={r.pcc_verified}
            disabled={savingChecklist || !r.pcc_certificate_path}
            onChange={(v) => toggleChecklist("pcc_verified", v)}
            hint={!r.pcc_certificate_path ? "Upload a certificate first" : undefined}
          />
        </div>
        <ul className="text-xs text-brand-dark/50 mt-3 space-y-0.5">
          <li>Bronze: {VERIFICATION_CRITERIA.bronze.join(" · ")}</li>
          <li>Silver: {VERIFICATION_CRITERIA.silver.join(" · ")}</li>
          <li>Gold: {VERIFICATION_CRITERIA.gold.join(" · ")}</li>
        </ul>
      </div>

      <div className="border-t border-brand-dark/10 pt-5">
        <div className="text-xs uppercase tracking-wider text-brand-dark/50 mb-2">
          Applicant declaration
        </div>
        <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <Pair label="PCC status" value={statusLabel(r.pcc_status)} />
          <Pair
            label="Wants PCC assistance"
            value={r.pcc_wants_assistance ? "Yes — follow up" : "No"}
            highlight={r.pcc_wants_assistance}
          />
          <Pair label="Issue date" value={r.pcc_issue_date ?? "—"} />
          <Pair label="Certificate number" value={r.pcc_number ?? "—"} />
          <Pair label="Expiry review" value={r.pcc_expiry_review_date ?? "—"} />
          <Pair
            label="Verified at"
            value={r.pcc_verified_at ? new Date(r.pcc_verified_at).toLocaleString() : "—"}
          />
        </dl>
      </div>

      <div className="border-t border-brand-dark/10 pt-5">
        <div className="text-xs uppercase tracking-wider text-brand-dark/50 mb-2">
          Certificate file
        </div>
        {r.pcc_certificate_path ? (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={downloadCert}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-brand-dark/10 hover:bg-brand-soft text-sm"
            >
              <Download className="size-4" /> Download certificate
            </button>
            <span className="text-xs text-brand-dark/50 truncate">{r.pcc_certificate_path}</span>
          </div>
        ) : (
          <p className="text-sm text-brand-dark/50">No certificate on file.</p>
        )}
        <label className="mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-brand-primary text-white text-sm cursor-pointer hover:brightness-110">
          {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
          {r.pcc_certificate_path ? "Replace certificate" : "Upload certificate"}
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,image/jpeg,image/png"
            className="hidden"
            disabled={uploading}
            onChange={onUpload}
          />
        </label>
        <p className="text-xs text-brand-dark/50 mt-1">PDF, JPG or PNG · max 10MB · private storage</p>
      </div>

      <div className="border-t border-brand-dark/10 pt-5">
        <div className="text-xs uppercase tracking-wider text-brand-dark/50 mb-2">
          Admin notes
        </div>
        <textarea
          spellCheck
          rows={3}
          value={notesDraft}
          onChange={(e) => setNotesDraft(e.target.value)}
          onBlur={saveNotes}
          className="w-full px-3 py-2.5 rounded-lg border border-brand-dark/10 bg-white text-sm"
          placeholder="Internal PCC / vetting notes…"
        />
        <p className="text-xs text-brand-dark/50 mt-1">Saved when you click outside the box.</p>
      </div>
    </section>
  );
}

function CheckRow({
  label,
  checked,
  disabled,
  hint,
  onChange,
}: {
  label: string;
  checked: boolean;
  disabled?: boolean;
  hint?: string;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors ${
        checked
          ? "border-brand-primary/40 bg-brand-primary/5"
          : "border-brand-dark/10"
      } ${disabled ? "opacity-60" : "cursor-pointer hover:bg-brand-soft/50"}`}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-brand-primary"
      />
      <span className="text-sm flex-1">{label}</span>
      {hint && <span className="text-[10px] text-brand-dark/50">{hint}</span>}
    </label>
  );
}

function Pair({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-widest text-brand-dark/40">{label}</dt>
      <dd className={`text-sm ${highlight ? "text-brand-primary font-semibold" : "text-brand-dark/90"}`}>
        {value}
      </dd>
    </div>
  );
}

function statusLabel(s: PccRecord["pcc_status"]): string {
  if (s === "have") return "Has current PCC";
  if (s === "applied") return "Applied — awaiting";
  if (s === "none") return "No PCC";
  return "Not declared";
}
