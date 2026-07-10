import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Loader2,
  Bell,
  Check,
  X,
  Phone,
  MessageCircle,
  ExternalLink,
  Edit3,
  Plus,
  ShieldOff,
  TimerOff,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  EyeOff,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/profile")({
  component: MyProfile,
});

// ---------- helpers ----------
function fmtDate(s?: string | null) {
  if (!s) return "—";
  try {
    return new Date(s).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return s;
  }
}
function firstName(full: string) {
  return (full || "").trim().split(/\s+/)[0] || full;
}
function whatsappHref(phone: string, msg?: string) {
  const digits = (phone || "").replace(/\D/g, "");
  const text = msg ? `?text=${encodeURIComponent(msg)}` : "";
  return `https://wa.me/${digits}${text}`;
}

// ============ Main ============
function MyProfile() {
  return (
    <SiteLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        <header className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-heading font-bold">My Profile</h1>
          <p className="text-brand-dark/60">
            Manage your details, your skills listing, and any service requests — all in one place.
          </p>
        </header>

        <NotificationsSection />
        <MyDetailsSection />
        <MyListingSection />
        <PeopleInterestedSection />
        <MyServiceRequestsSection />
      </div>
    </SiteLayout>
  );
}

// ============ Section shell ============
function Section({
  icon,
  title,
  subtitle,
  children,
  right,
}: {
  icon: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <section className="bg-white rounded-2xl border border-brand-dark/10 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl font-heading font-bold flex items-center gap-2">
            <span aria-hidden>{icon}</span>
            {title}
          </h2>
          {subtitle && <p className="text-sm text-brand-dark/60 mt-0.5">{subtitle}</p>}
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

// ============ Notifications ============
type NotificationRow = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
};

function NotificationsSection() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async (): Promise<NotificationRow[]> => {
      const { data, error } = await supabase
        .from("notifications")
        .select("id,type,title,body,link,read_at,created_at")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data ?? []) as NotificationRow[];
    },
    refetchInterval: 30000,
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("notifications_mark_all_read");
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const items = data ?? [];
  const unread = items.filter((n) => !n.read_at).length;

  return (
    <Section
      icon="🔔"
      title="Notifications"
      subtitle={unread > 0 ? `${unread} new` : "You're all caught up"}
      right={
        unread > 0 && (
          <button
            type="button"
            onClick={() => markAllRead.mutate()}
            className="text-xs text-brand-primary hover:underline"
          >
            Mark all read
          </button>
        )
      }
    >
      {isLoading ? (
        <Loader2 className="size-4 animate-spin text-brand-dark/40" />
      ) : items.length === 0 ? (
        <p className="text-sm text-brand-dark/50">No notifications yet.</p>
      ) : (
        <ul className="divide-y divide-brand-dark/5">
          {items.slice(0, 5).map((n) => (
            <li key={n.id} className="py-2.5 flex items-start gap-3">
              <span
                className={
                  "mt-1 size-2 rounded-full shrink-0 " +
                  (n.read_at ? "bg-brand-dark/20" : "bg-brand-primary")
                }
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium">{n.title}</div>
                {n.body && <div className="text-sm text-brand-dark/70">{n.body}</div>}
                <div className="text-[11px] text-brand-dark/40 mt-0.5">
                  {fmtDate(n.created_at)}
                </div>
              </div>
              {n.link && (
                <a
                  href={n.link}
                  className="text-xs text-brand-primary hover:underline shrink-0 mt-1"
                >
                  Open
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}

// ============ My Details ============
type MyDetails = {
  user_id: string;
  email: string | null;
  full_name: string | null;
  town: string | null;
  phone: string | null;
};

function MyDetailsSection() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["my-details"],
    queryFn: async (): Promise<MyDetails | null> => {
      const { data, error } = await supabase.rpc("get_my_profile");
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      return (row as MyDetails | undefined) ?? null;
    },
  });

  const [fullName, setFullName] = useState("");
  const [town, setTown] = useState("");
  const [phone, setPhone] = useState("");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (data) {
      setFullName(data.full_name ?? "");
      setTown(data.town ?? "");
      setPhone(data.phone ?? "");
    }
  }, [data?.user_id, data?.full_name, data?.town, data?.phone]);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("upsert_my_profile", {
        _full_name: fullName.trim(),
        _town: town.trim(),
        _phone: phone.trim(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Details saved");
      setEditing(false);
      qc.invalidateQueries({ queryKey: ["my-details"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Section
      icon="👤"
      title="My Details"
      subtitle="Your account information. Only you can see and edit this."
      right={
        !editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1.5 text-xs text-brand-primary hover:underline"
          >
            <Edit3 className="size-3.5" /> Edit
          </button>
        )
      }
    >
      {isLoading ? (
        <Loader2 className="size-4 animate-spin text-brand-dark/40" />
      ) : editing ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate();
          }}
          className="space-y-3"
        >
          <Field label="Full name" value={fullName} onChange={setFullName} />
          <Field label="Town or area" value={town} onChange={setTown} />
          <Field
            label="Telephone number (also used for WhatsApp)"
            type="tel"
            value={phone}
            onChange={setPhone}
          />
          <div className="text-xs text-brand-dark/50">
            Email: <span className="font-medium">{data?.email ?? "—"}</span> (managed by your
            account sign-in)
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={save.isPending}
              className="px-4 py-2 rounded-lg bg-brand-primary text-white text-sm font-medium disabled:opacity-60"
            >
              {save.isPending ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="px-4 py-2 rounded-lg border border-brand-dark/15 text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <Detail label="Full name" value={data?.full_name} />
          <Detail label="Email" value={data?.email} />
          <Detail label="Telephone / WhatsApp" value={data?.phone} />
          <Detail label="Town or area" value={data?.town} />
        </dl>
      )}
    </Section>
  );
}

function Detail({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-brand-dark/40">{label}</dt>
      <dd className="text-brand-dark">{value || <span className="text-brand-dark/40">—</span>}</dd>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-brand-dark mb-1">{label}</span>
      <input
        type={type}
        value={value}
        spellCheck={type === "text"}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-brand-dark/15 rounded-lg"
      />
    </label>
  );
}

// ============ My Skills Listing ============
type MyListing = {
  id: string;
  name: string;
  town: string;
  skills: string[];
  description: string;
  is_hidden: boolean;
  is_archived: boolean;
  public_listing_reference: string | null;
  created_at: string;
  last_activity_at: string | null;
};

function MyListingSection() {
  const { data, isLoading } = useQuery({
    queryKey: ["my-advert"],
    queryFn: async (): Promise<MyListing | null> => {
      const { data, error } = await supabase.rpc("noticeboard_my_listing");
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      return (row as MyListing | undefined) ?? null;
    },
  });

  if (isLoading) {
    return (
      <Section icon="🛠" title="My Skills Listing">
        <Loader2 className="size-4 animate-spin text-brand-dark/40" />
      </Section>
    );
  }

  if (!data) {
    return (
      <Section
        icon="🛠"
        title="My Skills Listing"
        subtitle="Share your skills so people in your area can find you."
      >
        <p className="text-sm text-brand-dark/60 mb-4">You have not advertised any skills yet.</p>
        <Link
          to="/advertise"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-primary text-white font-medium"
        >
          <Plus className="size-4" /> Create a Skills Listing
        </Link>
      </Section>
    );
  }

  const status = data.is_archived
    ? { label: "Archived", cls: "bg-brand-dark/10 text-brand-dark/70" }
    : data.is_hidden
      ? { label: "Paused", cls: "bg-amber-100 text-amber-900" }
      : { label: "Active", cls: "bg-emerald-100 text-emerald-800" };

  const publicUrl = data.public_listing_reference
    ? `/profile/${data.public_listing_reference}`
    : null;

  return (
    <Section
      icon="🛠"
      title="My Skills Listing"
      right={
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${status.cls}`}>
          {status.label}
        </span>
      }
    >
      <div className="space-y-2 text-sm">
        <div className="font-heading font-semibold text-base">{data.name}</div>
        <div className="text-brand-dark/70">
          <span className="font-medium">Area:</span> {data.town}
        </div>
        {data.skills?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {data.skills.map((s) => (
              <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-brand-soft">
                {s}
              </span>
            ))}
          </div>
        )}
        {data.description && (
          <p className="text-brand-dark/70 line-clamp-3">{data.description}</p>
        )}
        <div className="text-xs text-brand-dark/50 pt-1">
          Created {fmtDate(data.created_at)} · Last activity {fmtDate(data.last_activity_at)}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        <Link
          to="/my-advert"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand-primary text-white text-sm font-medium"
        >
          <Edit3 className="size-4" /> Edit Listing
        </Link>
        {publicUrl && (
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-brand-dark/15 text-sm hover:bg-brand-soft"
          >
            <ExternalLink className="size-4" /> Preview
          </a>
        )}
        <Link
          to="/my-advert"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-brand-dark/15 text-sm hover:bg-brand-soft"
        >
          {data.is_hidden ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
          {data.is_hidden ? "Unpause" : "Pause"} / Delete
        </Link>
      </div>
    </Section>
  );
}

// ============ People Interested In My Services ============
type IncomingRow = {
  id: string;
  requester_name: string;
  message: string | null;
  status: "pending" | "approved" | "declined" | "revoked";
  created_at: string;
  decided_at: string | null;
  revoked_at: string | null;
  expires_at: string | null;
};

function statusLabelIncoming(row: IncomingRow) {
  const expired =
    row.status === "approved" &&
    !!row.expires_at &&
    new Date(row.expires_at).getTime() < Date.now();
  if (expired) return { label: "Expired", icon: <TimerOff className="size-3.5" />, cls: "bg-brand-dark/10 text-brand-dark/70" };
  if (row.status === "approved")
    return { label: "Accepted", icon: <CheckCircle2 className="size-3.5" />, cls: "bg-emerald-100 text-emerald-800" };
  if (row.status === "declined")
    return { label: "Declined", icon: <XCircle className="size-3.5" />, cls: "bg-red-100 text-red-800" };
  if (row.status === "revoked")
    return { label: "Revoked", icon: <ShieldOff className="size-3.5" />, cls: "bg-brand-dark/10 text-brand-dark/70" };
  return { label: "New", icon: <Clock className="size-3.5" />, cls: "bg-amber-100 text-amber-900" };
}

function PeopleInterestedSection() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["my-incoming-requests"],
    queryFn: async (): Promise<IncomingRow[]> => {
      const { data, error } = await supabase.rpc("noticeboard_my_incoming_requests");
      if (error) throw error;
      return (data ?? []) as IncomingRow[];
    },
    refetchInterval: 30000,
  });

  const decide = useMutation({
    mutationFn: async (vars: { id: string; decision: "approved" | "declined" }) => {
      const { error } = await supabase.rpc("noticeboard_my_decide", {
        _request_id: vars.id,
        _decision: vars.decision,
      });
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      toast.success(vars.decision === "approved" ? "Request accepted" : "Request declined");
      qc.invalidateQueries({ queryKey: ["my-incoming-requests"] });
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const revoke = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.rpc("noticeboard_my_revoke", { _request_id: id });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Access revoked");
      qc.invalidateQueries({ queryKey: ["my-incoming-requests"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = data ?? [];

  return (
    <Section
      icon="📩"
      title="People Interested In My Services"
      subtitle="Requests from people who want to hire or contact you."
    >
      {isLoading ? (
        <Loader2 className="size-4 animate-spin text-brand-dark/40" />
      ) : rows.length === 0 ? (
        <p className="text-sm text-brand-dark/60">No one has requested your details yet.</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => {
            const s = statusLabelIncoming(r);
            return (
              <li
                key={r.id}
                className="border border-brand-dark/10 rounded-xl p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold">{firstName(r.requester_name)}</div>
                    <div className="text-xs text-brand-dark/50">
                      Submitted {fmtDate(r.created_at)}
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${s.cls}`}
                  >
                    {s.icon}
                    {s.label}
                  </span>
                </div>
                {r.message && (
                  <p className="mt-2 text-sm text-brand-dark/80 whitespace-pre-line">
                    "{r.message}"
                  </p>
                )}
                {r.status === "pending" && (
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      disabled={decide.isPending}
                      onClick={() => decide.mutate({ id: r.id, decision: "approved" })}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium disabled:opacity-60"
                    >
                      <Check className="size-4" /> Accept Request
                    </button>
                    <button
                      type="button"
                      disabled={decide.isPending}
                      onClick={() => decide.mutate({ id: r.id, decision: "declined" })}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-brand-dark/15 text-sm disabled:opacity-60"
                    >
                      <X className="size-4" /> Decline Request
                    </button>
                  </div>
                )}
                {r.status === "approved" && s.label === "Accepted" && (
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <p className="text-xs text-emerald-700">
                      Your number is shared until {fmtDate(r.expires_at)}.
                    </p>
                    <button
                      type="button"
                      onClick={() => revoke.mutate(r.id)}
                      className="inline-flex items-center gap-1.5 text-xs text-red-700 hover:underline"
                    >
                      <ShieldOff className="size-3.5" /> Revoke
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Section>
  );
}

// ============ My Service Requests (OUTGOING — Tony's fix) ============
type OutgoingRow = {
  id: string;
  profile_id: string;
  worker_name: string;
  worker_skills: string[] | null;
  status: "pending" | "approved" | "declined" | "revoked";
  phone: string | null;
  created_at: string;
  decided_at: string | null;
  expires_at: string | null;
};

function statusLabelOutgoing(row: OutgoingRow) {
  const expired =
    row.status === "approved" &&
    !!row.expires_at &&
    new Date(row.expires_at).getTime() < Date.now();
  if (expired) return { label: "Expired", cls: "bg-brand-dark/10 text-brand-dark/70" };
  if (row.status === "approved") return { label: "Accepted", cls: "bg-emerald-100 text-emerald-800" };
  if (row.status === "declined") return { label: "Declined", cls: "bg-red-100 text-red-800" };
  if (row.status === "revoked") return { label: "Access ended", cls: "bg-brand-dark/10 text-brand-dark/70" };
  return { label: "Awaiting Response", cls: "bg-amber-100 text-amber-900" };
}

function MyServiceRequestsSection() {
  const { data, isLoading } = useQuery({
    queryKey: ["my-outgoing-requests"],
    queryFn: async (): Promise<OutgoingRow[]> => {
      const { data, error } = await supabase.rpc("noticeboard_my_requests");
      if (error) throw error;
      return (data ?? []) as OutgoingRow[];
    },
    refetchInterval: 30000,
  });

  const rows = data ?? [];

  return (
    <Section
      icon="📨"
      title="My Service Requests"
      subtitle="Requests you've sent to service providers."
    >
      {isLoading ? (
        <Loader2 className="size-4 animate-spin text-brand-dark/40" />
      ) : rows.length === 0 ? (
        <div className="text-sm text-brand-dark/60">
          You haven't sent any requests yet.{" "}
          <Link to="/find-help" className="text-brand-primary hover:underline">
            Browse local skills →
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => {
            const s = statusLabelOutgoing(r);
            const accepted = r.status === "approved" && r.phone;
            return (
              <li key={r.id} className="border border-brand-dark/10 rounded-xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold">{r.worker_name}</div>
                    {r.worker_skills && r.worker_skills.length > 0 && (
                      <div className="text-xs text-brand-dark/60 mt-0.5 truncate">
                        {r.worker_skills.slice(0, 3).join(" · ")}
                      </div>
                    )}
                    <div className="text-xs text-brand-dark/50 mt-1">
                      Submitted {fmtDate(r.created_at)}
                    </div>
                  </div>
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${s.cls}`}
                  >
                    {s.label}
                  </span>
                </div>

                {r.status === "pending" && (
                  <p className="mt-3 text-sm text-brand-dark/70">
                    Waiting for the service provider to respond.
                  </p>
                )}

                {accepted && (
                  <div className="mt-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200 space-y-2">
                    <p className="text-sm font-medium text-emerald-900">
                      Your service request has been accepted. You may now contact the service
                      provider directly.
                    </p>
                    <div className="text-sm">
                      <span className="text-brand-dark/60">Telephone:</span>{" "}
                      <span className="font-semibold">{r.phone}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <a
                        href={`tel:${r.phone}`}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand-primary text-white text-sm font-medium"
                      >
                        <Phone className="size-4" /> Call
                      </a>
                      <a
                        href={whatsappHref(r.phone!, `Hi ${firstName(r.worker_name)}, I'm reaching out via Overberg Skills Connect about my service request.`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium"
                      >
                        <MessageCircle className="size-4" /> WhatsApp
                      </a>
                    </div>
                    {r.expires_at && (
                      <p className="text-[11px] text-emerald-800/70">
                        Access expires {fmtDate(r.expires_at)}.
                      </p>
                    )}
                  </div>
                )}

                {r.status === "declined" && (
                  <p className="mt-3 text-sm text-brand-dark/70">
                    This service provider is not available for this request.
                  </p>
                )}

                {r.status === "revoked" && (
                  <p className="mt-3 text-sm text-brand-dark/70">
                    The service provider ended access to their contact details.
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Section>
  );
}
