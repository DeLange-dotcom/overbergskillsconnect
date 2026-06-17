import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Archive, Pause, Play, Loader2 } from "lucide-react";
import { toast } from "sonner";

type Table = "service_providers" | "apprentices" | "youth_profiles";

export function ProfileLifecyclePanel({
  table,
  id,
  initial,
  onChange,
}: {
  table: Table;
  id: string;
  initial: { is_published: boolean; is_suspended: boolean; is_archived: boolean };
  onChange?: () => void;
}) {
  const [state, setState] = useState(initial);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => setState(initial), [initial.is_published, initial.is_suspended, initial.is_archived]);

  async function update(patch: Partial<typeof state>, label: string) {
    setSaving(label);
    const { error } = await supabase.from(table).update(patch as never).eq("id", id);
    setSaving(null);
    if (error) { toast.error(error.message); return; }
    setState((s) => ({ ...s, ...patch }));
    toast.success("Updated");
    onChange?.();
  }

  return (
    <div className="bg-white border border-brand-dark/5 rounded-2xl p-4 mt-4">
      <div className="text-xs uppercase tracking-wider text-brand-dark/50 mb-2">Profile lifecycle</div>
      <div className="flex flex-wrap gap-2 mb-3">
        <Status label="Published" on={state.is_published} />
        <Status label="Suspended" on={state.is_suspended} tone={state.is_suspended ? "warn" : undefined} />
        <Status label="Archived" on={state.is_archived} tone={state.is_archived ? "muted" : undefined} />
      </div>
      <div className="flex flex-wrap gap-2">
        {!state.is_suspended ? (
          <Btn onClick={() => update({ is_suspended: true }, "suspend")} loading={saving === "suspend"} icon={<Pause className="size-4" />}>
            Suspend
          </Btn>
        ) : (
          <Btn onClick={() => update({ is_suspended: false }, "reinstate")} loading={saving === "reinstate"} icon={<Play className="size-4" />}>
            Reinstate
          </Btn>
        )}
        {!state.is_archived ? (
          <Btn onClick={() => update({ is_archived: true }, "archive")} loading={saving === "archive"} icon={<Archive className="size-4" />}>
            Archive
          </Btn>
        ) : (
          <Btn onClick={() => update({ is_archived: false }, "unarchive")} loading={saving === "unarchive"} icon={<Archive className="size-4" />}>
            Restore
          </Btn>
        )}
        {!state.is_published ? (
          <Btn onClick={() => update({ is_published: true }, "publish")} loading={saving === "publish"}>
            Publish to directory
          </Btn>
        ) : (
          <Btn onClick={() => update({ is_published: false }, "unpublish")} loading={saving === "unpublish"}>
            Hide from directory
          </Btn>
        )}
      </div>
      <p className="text-xs text-brand-dark/55 mt-3">
        Suspended and archived profiles are removed from public search and contact requests are
        disabled. Archived profiles are retained for records.
      </p>
    </div>
  );
}

function Status({ label, on, tone }: { label: string; on: boolean; tone?: "warn" | "muted" }) {
  const cls = on
    ? tone === "warn"
      ? "bg-amber-50 text-amber-800 ring-amber-200"
      : tone === "muted"
        ? "bg-brand-dark/10 text-brand-dark/60 ring-brand-dark/10"
        : "bg-emerald-50 text-emerald-800 ring-emerald-200"
    : "bg-brand-soft text-brand-dark/50 ring-brand-dark/5";
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full ring-1 ${cls}`}>
      {label}: {on ? "Yes" : "No"}
    </span>
  );
}

function Btn({
  children,
  onClick,
  loading,
  icon,
}: {
  children: React.ReactNode;
  onClick: () => void;
  loading: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-brand-dark/10 text-sm hover:bg-brand-soft disabled:opacity-60"
    >
      {loading ? <Loader2 className="size-4 animate-spin" /> : icon}
      {children}
    </button>
  );
}
