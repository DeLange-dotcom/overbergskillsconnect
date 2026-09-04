import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Loader2,
  LogOut,
  Search,
  Users,
  ClipboardList,
  MessageSquare,
  ShieldCheck,
  ScrollText,
  ExternalLink,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({ meta: [{ title: "Administration — Overberg Skills Connect" }] }),
  component: AdminDashboard,
});

type Tab = "users" | "listings" | "requests" | "roles" | "audit";

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "users", label: "Users", icon: <Users className="size-4" /> },
  { key: "listings", label: "Listings", icon: <ClipboardList className="size-4" /> },
  { key: "requests", label: "Contact activity", icon: <MessageSquare className="size-4" /> },
  { key: "roles", label: "Admin roles", icon: <ShieldCheck className="size-4" /> },
  { key: "audit", label: "Audit trail", icon: <ScrollText className="size-4" /> },
];

function fmt(d?: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function StatusPill({ status }: { status: string | null }) {
  if (!status)
    return (
      <span className="text-brand-dark/50 text-xs">
        Registered – skills listing not yet created
      </span>
    );
  const cls =
    status === "active"
      ? "bg-emerald-100 text-emerald-800"
      : status === "paused"
        ? "bg-amber-100 text-amber-900"
        : status === "suspended"
          ? "bg-red-100 text-red-800"
          : "bg-brand-dark/10 text-brand-dark/70";
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${cls}`}>
      {status === "archived" ? "Removed / archived" : status}
    </span>
  );
}

function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("users");

  const superAdmin = useQuery({
    queryKey: ["is-super-admin"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("is_super_admin");
      if (error) throw error;
      return data === true;
    },
  });

  return (
    <SiteLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
          <div>
            <h1 className="osc-heading text-3xl sm:text-4xl">Administration</h1>
            <p className="text-brand-dark/60 text-sm mt-1">
              Operational tools for managing members, listings and support enquiries.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/admin/noticeboard"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-brand-dark/15 text-sm hover:bg-brand-soft"
            >
              <ExternalLink className="size-4" /> Lifecycle &amp; reports
            </Link>
            <button
              type="button"
              onClick={async () => {
                await supabase.auth.signOut();
                navigate({ to: "/auth", replace: true });
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-brand-dark/15 text-sm hover:bg-brand-soft"
            >
              <LogOut className="size-4" /> Sign out
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6 border-b border-brand-dark/10 pb-3">
          {TABS.filter((t) => t.key !== "roles" || superAdmin.data).map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                tab === t.key
                  ? "bg-brand-primary text-white"
                  : "border border-brand-dark/15 hover:bg-brand-soft"
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {tab === "users" && <UsersTab superAdmin={!!superAdmin.data} />}
        {tab === "listings" && <ListingsTab />}
        {tab === "requests" && <RequestsTab />}
        {tab === "roles" && superAdmin.data && <RolesTab />}
        {tab === "audit" && <AuditTab />}
      </div>
    </SiteLayout>
  );
}

function SearchBox({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative mb-4 max-w-md">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-brand-dark/40" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-3 rounded-xl border border-brand-dark/15 bg-white"
      />
    </div>
  );
}

// ---------------------------------------------------------------- Users
type AdminUser = {
  user_id: string;
  email: string | null;
  full_name: string | null;
  town: string | null;
  phone: string | null;
  account_status: string;
  created_at: string;
  last_sign_in_at: string | null;
  roles: string[];
  listing_id: string | null;
  listing_reference: string | null;
  listing_name: string | null;
  listing_status: string | null;
};

function UsersTab({ superAdmin }: { superAdmin: boolean }) {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", q],
    queryFn: async (): Promise<AdminUser[]> => {
      const { data, error } = await supabase.rpc("admin_list_users", { _q: q || undefined });
      if (error) throw error;
      return (data ?? []) as AdminUser[];
    },
  });

  async function setState(userId: string, state: "active" | "suspended" | "removed") {
    const reason =
      state === "active" ? null : window.prompt("Reason (recorded in the audit trail):") ?? null;
    if (state !== "active" && reason === null) return;
    const { error } = await supabase.rpc("admin_set_account_state", {
      _user_id: userId,
      _state: state,
      _reason: reason ?? undefined,
    });
    if (error) {
      toast.error(
        error.message.includes("cannot_moderate_yourself")
          ? "You cannot change your own account status."
          : "You are not allowed to make that change.",
      );
      return;
    }
    toast.success("Account updated.");
    qc.invalidateQueries({ queryKey: ["admin-users"] });
  }

  const rows = data ?? [];

  return (
    <div>
      <SearchBox value={q} onChange={setQ} placeholder="Search by name or email…" />
      {isLoading ? (
        <Loader2 className="size-5 animate-spin text-brand-dark/40" />
      ) : rows.length === 0 ? (
        <p className="text-sm text-brand-dark/60">No members found.</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((u) => (
            <li key={u.user_id} className="p-4 rounded-2xl border border-brand-dark/10 bg-white">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium">{u.full_name || "(no name)"}</div>
                  <div className="text-sm text-brand-dark/60 break-all">{u.email}</div>
                  <div className="text-xs text-brand-dark/50 mt-1">
                    Joined {fmt(u.created_at)} · Last sign-in {fmt(u.last_sign_in_at)}
                  </div>
                  {u.roles.length > 0 && (
                    <div className="text-xs text-brand-primary mt-1">
                      Role: {u.roles.join(", ")}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
                      u.account_status === "active"
                        ? "bg-emerald-100 text-emerald-800"
                        : u.account_status === "suspended"
                          ? "bg-red-100 text-red-800"
                          : "bg-brand-dark/10 text-brand-dark/70"
                    }`}
                  >
                    {u.account_status}
                  </span>
                  <StatusPill status={u.listing_status} />
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => setOpenId(openId === u.user_id ? null : u.user_id)}
                  className="px-3 py-2 rounded-lg border border-brand-dark/15 text-xs"
                >
                  {openId === u.user_id ? "Hide details" : "Open details"}
                </button>
                {u.account_status === "active" ? (
                  <button
                    type="button"
                    onClick={() => setState(u.user_id, "suspended")}
                    className="px-3 py-2 rounded-lg border border-amber-300 text-amber-800 text-xs"
                  >
                    Suspend
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setState(u.user_id, "active")}
                    className="px-3 py-2 rounded-lg border border-emerald-300 text-emerald-800 text-xs"
                  >
                    Reinstate
                  </button>
                )}
                {superAdmin && u.account_status !== "removed" && (
                  <button
                    type="button"
                    onClick={() => setState(u.user_id, "removed")}
                    className="px-3 py-2 rounded-lg border border-red-300 text-red-700 text-xs"
                  >
                    Remove
                  </button>
                )}
                {u.listing_reference && (
                  <Link
                    to="/profile/$id"
                    params={{ id: u.listing_reference }}
                    className="px-3 py-2 rounded-lg border border-brand-dark/15 text-xs"
                  >
                    View listing
                  </Link>
                )}
              </div>

              {openId === u.user_id && (
                <dl className="mt-4 grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm border-t border-brand-dark/10 pt-3">
                  <div>
                    <dt className="text-xs uppercase text-brand-dark/40">Area</dt>
                    <dd>{u.town || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase text-brand-dark/40">
                      Telephone (support use only)
                    </dt>
                    <dd>{u.phone || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase text-brand-dark/40">Listing</dt>
                    <dd>
                      {u.listing_name ?? "—"}
                      {u.listing_reference ? ` (${u.listing_reference})` : ""}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase text-brand-dark/40">Account ID</dt>
                    <dd className="text-xs break-all text-brand-dark/60">{u.user_id}</dd>
                  </div>
                </dl>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- Listings
type AdminListing = {
  id: string;
  user_id: string | null;
  public_listing_reference: string | null;
  name: string;
  town: string;
  skills: string[];
  phone: string;
  status: string;
  created_at: string;
  updated_at: string;
  last_activity_at: string | null;
  owner_email: string | null;
};

const LISTING_STATES = ["active", "paused", "suspended", "removed"] as const;

function ListingsTab() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-listings", q, status],
    queryFn: async (): Promise<AdminListing[]> => {
      const { data, error } = await supabase.rpc("admin_list_listings", {
        _q: q || undefined,
        _status: status || undefined,
      });
      if (error) throw error;
      return (data ?? []) as AdminListing[];
    },
  });

  async function setListingState(id: string, state: string) {
    const reason =
      state === "active" ? null : window.prompt("Reason (recorded in the audit trail):") ?? null;
    if (state !== "active" && reason === null) return;
    const { error } = await supabase.rpc("admin_set_listing_state", {
      _profile_id: id,
      _state: state,
      _reason: reason ?? undefined,
    });
    if (error) {
      toast.error("You are not allowed to make that change.");
      return;
    }
    toast.success("Listing updated.");
    qc.invalidateQueries({ queryKey: ["admin-listings"] });
  }

  const rows = data ?? [];

  return (
    <div>
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[240px]">
          <SearchBox value={q} onChange={setQ} placeholder="Search listings, area or reference…" />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="mb-4 px-4 py-3 rounded-xl border border-brand-dark/15 bg-white text-sm"
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          {LISTING_STATES.map((s) => (
            <option key={s} value={s === "removed" ? "archived" : s}>
              {s === "removed" ? "Removed / archived" : s}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <Loader2 className="size-5 animate-spin text-brand-dark/40" />
      ) : rows.length === 0 ? (
        <p className="text-sm text-brand-dark/60">No listings found.</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((l) => (
            <li key={l.id} className="p-4 rounded-2xl border border-brand-dark/10 bg-white">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium">
                    {l.name}{" "}
                    {l.public_listing_reference && (
                      <span className="text-xs text-brand-dark/40">
                        {l.public_listing_reference}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-brand-dark/60">{l.town}</div>
                  <div className="text-xs text-brand-dark/50 mt-1">
                    {l.skills?.slice(0, 5).join(", ")}
                  </div>
                  <div className="text-xs text-brand-dark/50 mt-1">
                    Created {fmt(l.created_at)} · Last activity {fmt(l.last_activity_at)}
                    {l.owner_email ? ` · ${l.owner_email}` : " · no account linked"}
                  </div>
                </div>
                <StatusPill status={l.status} />
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {LISTING_STATES.filter((s) => s !== l.status).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setListingState(l.id, s)}
                    className="px-3 py-2 rounded-lg border border-brand-dark/15 text-xs capitalize"
                  >
                    Set {s}
                  </button>
                ))}
                {l.public_listing_reference && (
                  <Link
                    to="/profile/$id"
                    params={{ id: l.public_listing_reference }}
                    className="px-3 py-2 rounded-lg border border-brand-dark/15 text-xs"
                  >
                    View
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- Contact activity
type ActivityRow = {
  id: string;
  provider_name: string;
  provider_reference: string | null;
  requester_name: string;
  status: string;
  created_at: string;
  decided_at: string | null;
  revoked_at: string | null;
};

function RequestsTab() {
  const [q, setQ] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["admin-activity", q],
    queryFn: async (): Promise<ActivityRow[]> => {
      const { data, error } = await supabase.rpc("admin_contact_activity", {
        _q: q || undefined,
        _limit: 200,
      });
      if (error) throw error;
      return (data ?? []) as ActivityRow[];
    },
  });

  const rows = data ?? [];

  return (
    <div>
      <SearchBox value={q} onChange={setQ} placeholder="Search by person or requester…" />
      <p className="text-xs text-brand-dark/50 mb-3">
        Shown for support and complaint handling only. Telephone numbers are not displayed here.
      </p>
      {isLoading ? (
        <Loader2 className="size-5 animate-spin text-brand-dark/40" />
      ) : rows.length === 0 ? (
        <p className="text-sm text-brand-dark/60">No contact requests found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-brand-dark/40">
              <tr>
                <th className="py-2 pr-4">Provider</th>
                <th className="py-2 pr-4">Requester</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Requested</th>
                <th className="py-2 pr-4">Decided</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-dark/5">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="py-2 pr-4">{r.provider_name}</td>
                  <td className="py-2 pr-4">{r.requester_name}</td>
                  <td className="py-2 pr-4 capitalize">
                    {r.revoked_at ? "revoked" : r.status}
                  </td>
                  <td className="py-2 pr-4">{fmt(r.created_at)}</td>
                  <td className="py-2 pr-4">{fmt(r.decided_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- Roles
function RolesTab() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", q],
    queryFn: async (): Promise<AdminUser[]> => {
      const { data, error } = await supabase.rpc("admin_list_users", { _q: q || undefined });
      if (error) throw error;
      return (data ?? []) as AdminUser[];
    },
  });

  async function setRole(userId: string, role: string, grant: boolean) {
    const { error } = await supabase.rpc("admin_set_role", {
      _user_id: userId,
      _role: role,
      _grant: grant,
    });
    if (error) {
      toast.error(
        error.message.includes("last_super_admin")
          ? "You cannot remove the last Super Admin."
          : "You are not allowed to make that change.",
      );
      return;
    }
    toast.success("Role updated.");
    qc.invalidateQueries({ queryKey: ["admin-users"] });
  }

  const rows = (data ?? []).filter((u) => q || u.roles.length > 0);

  return (
    <div>
      <p className="text-sm text-brand-dark/70 mb-3">
        Only a Super Admin can grant or remove administrator access. Search for a member to add
        them.
      </p>
      <SearchBox value={q} onChange={setQ} placeholder="Search by name or email…" />
      {isLoading ? (
        <Loader2 className="size-5 animate-spin text-brand-dark/40" />
      ) : (
        <ul className="space-y-3">
          {rows.map((u) => (
            <li
              key={u.user_id}
              className="p-4 rounded-2xl border border-brand-dark/10 bg-white flex flex-wrap items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="font-medium">{u.full_name || "(no name)"}</div>
                <div className="text-sm text-brand-dark/60 break-all">{u.email}</div>
                <div className="text-xs text-brand-primary mt-1">
                  {u.roles.length ? u.roles.join(", ") : "No admin role"}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {(["support_admin", "admin", "super_admin"] as const).map((role) => {
                  const has = u.roles.includes(role);
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setRole(u.user_id, role, !has)}
                      className={`px-3 py-2 rounded-lg text-xs border ${
                        has
                          ? "bg-brand-primary/10 border-brand-primary/30 text-brand-primary"
                          : "border-brand-dark/15"
                      }`}
                    >
                      {has ? "Remove " : "Grant "}
                      {role.replace("_", " ")}
                    </button>
                  );
                })}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- Audit
type AuditRow = {
  id: string;
  created_at: string;
  admin_email: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown> | null;
};

function AuditTab() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-audit"],
    queryFn: async (): Promise<AuditRow[]> => {
      const { data, error } = await supabase.rpc("admin_audit_trail", { _limit: 200 });
      if (error) throw error;
      return (data ?? []) as AuditRow[];
    },
  });

  const rows = data ?? [];

  return (
    <div>
      <p className="text-sm text-brand-dark/70 mb-3">
        Every suspension, reinstatement, removal and role change is recorded here.
      </p>
      {isLoading ? (
        <Loader2 className="size-5 animate-spin text-brand-dark/40" />
      ) : rows.length === 0 ? (
        <p className="text-sm text-brand-dark/60">No administrator actions recorded yet.</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((a) => (
            <li
              key={a.id}
              className="p-3 rounded-xl border border-brand-dark/10 bg-white text-sm flex flex-wrap gap-x-3 gap-y-1"
            >
              <span className="text-brand-dark/50">{fmt(a.created_at)}</span>
              <span className="font-medium">{a.admin_email ?? "system"}</span>
              <span className="capitalize">{a.action.replace(/_/g, " ")}</span>
              <span className="text-brand-dark/50">
                {a.entity_type}
                {a.entity_id ? ` ${a.entity_id.slice(0, 8)}…` : ""}
              </span>
              {a.details && typeof a.details === "object" && "reason" in a.details && (
                <span className="text-brand-dark/60 italic">
                  {String((a.details as { reason?: string }).reason ?? "")}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
