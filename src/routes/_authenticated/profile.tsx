import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useTranslation, Trans } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { LocationSelect } from "@/components/site/LocationSelect";
import { whatsappHref } from "@/lib/phone";
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
  LogOut,
  Trash2,
  Heart,
  MapPin,

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

function SignOutButton() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  return (
    <button
      onClick={async () => {
        setLoading(true);
        await supabase.auth.signOut();
        navigate({ to: "/" });
      }}
      disabled={loading}
      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-brand-dark/15 text-sm text-brand-dark/70 hover:bg-brand-soft hover:text-brand-primary transition shrink-0"
    >
      {loading ? <Loader2 className="size-4 animate-spin" /> : <LogOut className="size-4" />}
      {t("account.signOut")}
    </button>
  );
}

function WelcomeCard() {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);
  useEffect(() => {
    try {
      if (localStorage.getItem("osc_show_welcome") === "1") setShow(true);
    } catch {
      /* storage unavailable */
    }
  }, []);
  if (!show) return null;

  function dismiss() {
    try {
      localStorage.removeItem("osc_show_welcome");
      localStorage.setItem("osc_welcomed", "1");
    } catch {
      /* storage unavailable */
    }
    setShow(false);
  }

  return (
    <section className="rounded-2xl border border-brand-primary/30 bg-brand-soft/70 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <h2 className="osc-heading text-xl">{t("account.welcome.title")}</h2>
        <button
          onClick={dismiss}
          aria-label={t("account.welcome.dismiss")}
          className="text-brand-dark/50 hover:text-brand-dark"
        >
          <X className="size-4" />
        </button>
      </div>
      <p className="text-sm text-brand-dark/70 mt-1">
        {t("account.welcome.body")}
      </p>
      <div className="flex flex-wrap gap-2 mt-4">
        <Link
          to="/advertise"
          onClick={dismiss}
          className="px-4 py-2.5 rounded-xl bg-brand-primary text-white text-sm font-semibold"
        >
          {t("account.welcome.advertise")}
        </Link>
        <Link
          to="/find-help"
          onClick={dismiss}
          className="px-4 py-2.5 rounded-xl border border-brand-dark/15 bg-white text-sm font-medium hover:bg-brand-soft"
        >
          {t("account.welcome.findHelp")}
        </Link>
        <button
          onClick={dismiss}
          className="px-4 py-2.5 rounded-xl border border-brand-dark/15 bg-white text-sm font-medium hover:bg-brand-soft"
        >
          {t("account.welcome.myProfile")}
        </button>
      </div>
    </section>
  );
}

// ============ Main ============
function MyProfile() {
  const { t } = useTranslation();
  return (
    <SiteLayout>
      <div className="osc-container py-8 sm:py-12 space-y-8">
        <header className="space-y-1">
          <h1 className="osc-heading text-3xl sm:text-4xl">{t("account.page.title")}</h1>
          <p className="text-brand-dark/60">
            {t("account.page.subtitle")}
          </p>
        </header>

        <WelcomeCard />
        <NotificationsSection />
        <MyDetailsSection />
        <MyListingSection />
        <PeopleInterestedSection />
        <MyServiceRequestsSection />
        <MyFavouritesSection />
        <AccountSection />

        <div className="pt-4 border-t border-brand-dark/10 flex flex-wrap items-center gap-3">
          <Link
            to="/help"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-brand-dark/15 text-sm text-brand-dark/70 hover:bg-brand-soft hover:text-brand-primary transition"
          >
            {t("account.needHelp")}
          </Link>
          <SignOutButton />
        </div>
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
          <h2 className="osc-heading text-xl flex items-center gap-2">
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
  const { t } = useTranslation();
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
      title={t("account.notifications.title")}
      subtitle={
        unread > 0
          ? t("account.notifications.unread", { count: unread })
          : t("account.notifications.checkRegularly")
      }
      right={
        unread > 0 && (
          <button
            type="button"
            onClick={() => markAllRead.mutate()}
            className="text-xs text-brand-primary hover:underline"
          >
            {t("account.notifications.markAllRead")}
          </button>
        )
      }
    >
      {isLoading ? (
        <Loader2 className="size-4 animate-spin text-brand-dark/40" />
      ) : items.length === 0 ? (
        <p className="text-sm text-brand-dark/50">{t("account.notifications.empty")}</p>
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
                <div className="text-[11px] text-brand-dark/40 mt-0.5">{fmtDate(n.created_at)}</div>
              </div>
              {n.link && (
                <a
                  href={n.link}
                  className="text-xs text-brand-primary hover:underline shrink-0 mt-1"
                >
                  {t("account.notifications.open")}
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
  const { t } = useTranslation();
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
      toast.success(t("account.details.savedToast"));
      setEditing(false);
      qc.invalidateQueries({ queryKey: ["my-details"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Section
      icon="👤"
      title={t("account.details.title")}
      subtitle={t("account.details.subtitle")}
      right={
        !editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1.5 text-xs text-brand-primary hover:underline"
          >
            <Edit3 className="size-3.5" /> {t("account.details.edit")}
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
          <Field label={t("account.details.fullName")} value={fullName} onChange={setFullName} />
          <LocationSelect value={town} onChange={setTown} label={t("account.details.town")} />
          <Field
            label={t("account.details.phone")}
            type="tel"
            value={phone}
            onChange={setPhone}
          />
          <div className="text-xs text-brand-dark/50">
            {t("account.details.email")}: <span className="font-medium">{data?.email ?? "—"}</span> {t("account.details.emailManaged")}
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={save.isPending}
              className="px-4 py-2 rounded-lg bg-brand-primary text-white text-sm font-medium disabled:opacity-60"
            >
              {save.isPending ? t("account.details.saving") : t("account.details.save")}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="px-4 py-2 rounded-lg border border-brand-dark/15 text-sm"
            >
              {t("account.details.cancel")}
            </button>
          </div>
        </form>
      ) : (
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <Detail label={t("account.details.fullName")} value={data?.full_name} />
          <Detail label={t("account.details.email")} value={data?.email} />
          <Detail label={t("account.details.phoneShort")} value={data?.phone} />
          <Detail label={t("account.details.town")} value={data?.town} />
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
  const { t } = useTranslation();
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
      <Section icon="🛠" title={t("account.listing.title")}>
        <Loader2 className="size-4 animate-spin text-brand-dark/40" />
      </Section>
    );
  }

  if (!data) {
    return (
      <Section
        icon="🛠"
        title={t("account.listing.title")}
        subtitle={t("account.listing.subtitle")}
      >
        <p className="text-sm text-brand-dark/60 mb-4">{t("account.listing.empty")}</p>
        <Link
          to="/advertise"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-primary text-white font-medium"
        >
          <Plus className="size-4" /> {t("account.listing.create")}
        </Link>
      </Section>
    );
  }

  const status = data.is_archived
    ? { label: t("account.listing.status.archived"), cls: "bg-brand-dark/10 text-brand-dark/70" }
    : data.is_hidden
      ? { label: t("account.listing.status.paused"), cls: "bg-amber-100 text-amber-900" }
      : { label: t("account.listing.status.active"), cls: "bg-emerald-100 text-emerald-800" };

  const publicUrl = data.public_listing_reference
    ? `/profile/${data.public_listing_reference}`
    : null;

  return (
    <Section
      icon="🛠"
      title={t("account.listing.title")}
      right={
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${status.cls}`}>
          {status.label}
        </span>
      }
    >
      <div className="space-y-2 text-sm">
        <div className="font-heading font-semibold text-base">{data.name}</div>
        <div className="text-brand-dark/70">
          <span className="font-medium">{t("account.listing.area")}</span> {data.town}
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
        {data.description && <p className="text-brand-dark/70 line-clamp-3">{data.description}</p>}
        <div className="text-xs text-brand-dark/50 pt-1">
          {t("account.listing.created", { date: fmtDate(data.created_at), activity: fmtDate(data.last_activity_at) })}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        <Link
          to="/my-advert"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand-primary text-white text-sm font-medium"
        >
          <Edit3 className="size-4" /> {t("account.listing.editListing")}
        </Link>
        {publicUrl && (
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-brand-dark/15 text-sm hover:bg-brand-soft"
          >
            <ExternalLink className="size-4" /> {t("account.listing.preview")}
          </a>
        )}
        <Link
          to="/my-advert"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-brand-dark/15 text-sm hover:bg-brand-soft"
        >
          {data.is_hidden ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
          {data.is_hidden ? t("account.listing.unpause") : t("account.listing.pause")}
        </Link>
        <Link
          to="/my-advert"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-200 text-red-700 text-sm hover:bg-red-50"
        >
          <Trash2 className="size-4" /> {t("account.listing.deleteListing")}
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

function statusLabelIncoming(row: IncomingRow, t: (k: string) => string) {
  const expired =
    row.status === "approved" &&
    !!row.expires_at &&
    new Date(row.expires_at).getTime() < Date.now();
  if (expired)
    return {
      label: t("account.incoming.status.expired"),
      icon: <TimerOff className="size-3.5" />,
      cls: "bg-brand-dark/10 text-brand-dark/70",
    };
  if (row.status === "approved")
    return {
      label: t("account.incoming.status.accepted"),
      icon: <CheckCircle2 className="size-3.5" />,
      cls: "bg-emerald-100 text-emerald-800",
    };
  if (row.status === "declined")
    return {
      label: t("account.incoming.status.declined"),
      icon: <XCircle className="size-3.5" />,
      cls: "bg-red-100 text-red-800",
    };
  if (row.status === "revoked")
    return {
      label: t("account.incoming.status.revoked"),
      icon: <ShieldOff className="size-3.5" />,
      cls: "bg-brand-dark/10 text-brand-dark/70",
    };
  return { label: t("account.incoming.status.new"), icon: <Clock className="size-3.5" />, cls: "bg-amber-100 text-amber-900" };
}

function PeopleInterestedSection() {
  const { t } = useTranslation();
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
      toast.success(vars.decision === "approved" ? t("account.incoming.acceptedToast") : t("account.incoming.declinedToast"));
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
      toast.success(t("account.incoming.revokedToast"));
      qc.invalidateQueries({ queryKey: ["my-incoming-requests"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = data ?? [];

  return (
    <Section
      icon="📩"
      title={t("account.incoming.title")}
      subtitle={t("account.incoming.subtitle")}
    >
      {isLoading ? (
        <Loader2 className="size-4 animate-spin text-brand-dark/40" />
      ) : rows.length === 0 ? (
        <p className="text-sm text-brand-dark/60">{t("account.incoming.empty")}</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => {
            const s = statusLabelIncoming(r, t);
            return (
              <li key={r.id} className="border border-brand-dark/10 rounded-xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold">{firstName(r.requester_name)}</div>
                    <div className="text-xs text-brand-dark/50">
                      {t("account.incoming.submitted", { date: fmtDate(r.created_at) })}
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
                      <Check className="size-4" /> {t("account.incoming.accept")}
                    </button>
                    <button
                      type="button"
                      disabled={decide.isPending}
                      onClick={() => decide.mutate({ id: r.id, decision: "declined" })}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-brand-dark/15 text-sm disabled:opacity-60"
                    >
                      <X className="size-4" /> {t("account.incoming.decline")}
                    </button>
                  </div>
                )}
                {r.status === "approved" &&
                  !(r.expires_at && new Date(r.expires_at).getTime() < Date.now()) && (
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <p className="text-xs text-emerald-700">
                      {t("account.incoming.sharedUntil", { date: fmtDate(r.expires_at) })}
                    </p>
                    <button
                      type="button"
                      onClick={() => revoke.mutate(r.id)}
                      className="inline-flex items-center gap-1.5 text-xs text-red-700 hover:underline"
                    >
                      <ShieldOff className="size-3.5" /> {t("account.incoming.revoke")}
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

function statusLabelOutgoing(row: OutgoingRow, t: (k: string) => string) {
  const expired =
    row.status === "approved" &&
    !!row.expires_at &&
    new Date(row.expires_at).getTime() < Date.now();
  if (expired) return { label: t("account.outgoing.status.expired"), cls: "bg-brand-dark/10 text-brand-dark/70" };
  if (row.status === "approved")
    return { label: t("account.outgoing.status.accepted"), cls: "bg-emerald-100 text-emerald-800" };
  if (row.status === "declined") return { label: t("account.outgoing.status.declined"), cls: "bg-red-100 text-red-800" };
  if (row.status === "revoked")
    return { label: t("account.outgoing.status.revoked"), cls: "bg-brand-dark/10 text-brand-dark/70" };
  return { label: t("account.outgoing.status.pending"), cls: "bg-amber-100 text-amber-900" };
}

function MyServiceRequestsSection() {
  const { t } = useTranslation();
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
      title={t("account.outgoing.title")}
      subtitle={t("account.outgoing.subtitle")}
    >
      {isLoading ? (
        <Loader2 className="size-4 animate-spin text-brand-dark/40" />
      ) : rows.length === 0 ? (
        <div className="text-sm text-brand-dark/60">
          {t("account.outgoing.empty")}{" "}
          <Link to="/find-help" className="text-brand-primary hover:underline">
            {t("account.outgoing.browse")}
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => {
            const s = statusLabelOutgoing(r, t);
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
                      {t("account.outgoing.submitted", { date: fmtDate(r.created_at) })}
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
                    {t("account.outgoing.waiting")}
                  </p>
                )}

                {accepted && (
                  <div className="mt-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200 space-y-2">
                    <p className="text-sm font-medium text-emerald-900">
                      {t("account.outgoing.acceptedMessage")}
                    </p>
                    <div className="text-sm">
                      <span className="text-brand-dark/60">{t("account.outgoing.telephone")}</span>{" "}
                      <span className="font-semibold">{r.phone}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <a
                        href={`tel:${r.phone}`}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand-primary text-white text-sm font-medium"
                      >
                        <Phone className="size-4" /> {t("account.outgoing.call")}
                      </a>
                      <a
                        href={whatsappHref(
                          r.phone!,
                          t("account.outgoing.whatsappMessage", { name: firstName(r.worker_name) }),
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium"
                      >
                        <MessageCircle className="size-4" /> {t("account.outgoing.whatsapp")}
                      </a>
                    </div>
                    {r.expires_at && (
                      <p className="text-[11px] text-emerald-800/70">
                        {t("account.outgoing.accessExpires", { date: fmtDate(r.expires_at) })}
                      </p>
                    )}
                  </div>
                )}

                {r.status === "declined" && (
                  <p className="mt-3 text-sm text-brand-dark/70">
                    {t("account.outgoing.notAvailable")}
                  </p>
                )}

                {r.status === "revoked" && (
                  <p className="mt-3 text-sm text-brand-dark/70">
                    {t("account.outgoing.accessEndedMessage")}
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

// ============ My Favourites ============
type FavouriteRow = {
  profile_id: string;
  public_listing_reference: string | null;
  name: string;
  town: string;
  skills: string[];
  description: string;
  photo_url: string | null;
  is_available: boolean;
  saved_at: string;
};

function MyFavouritesSection() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["my-favourites"],
    queryFn: async (): Promise<FavouriteRow[]> => {
      const { data, error } = await supabase.rpc("noticeboard_my_favourites");
      if (error) throw error;
      return (data ?? []) as FavouriteRow[];
    },
  });

  const remove = useMutation({
    mutationFn: async (profileId: string) => {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user.id;
      if (!uid) throw new Error(t("account.favourites.signInAgain"));
      const { error } = await supabase
        .from("noticeboard_favourites")
        .delete()
        .eq("user_id", uid)
        .eq("profile_id", profileId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("account.favourites.removedToast"));
      qc.invalidateQueries({ queryKey: ["my-favourites"] });
    },
    onError: () => toast.error(t("account.favourites.removeError")),
  });

  const rows = data ?? [];

  return (
    <Section
      icon="❤️"
      title={t("account.favourites.title")}
      subtitle={t("account.favourites.subtitle")}
    >
      {isLoading ? (
        <Loader2 className="size-4 animate-spin text-brand-dark/40" />
      ) : rows.length === 0 ? (
        <div className="text-sm text-brand-dark/60">
          {t("account.favourites.emptyPrefix")}{" "}
          <span className="inline-flex items-center gap-1 font-medium">
            <Heart className="size-3.5" /> {t("account.favourites.save")}
          </span>{" "}
          {t("account.favourites.emptySuffix")}{" "}
          <Link to="/find-help" className="text-brand-primary underline">
            {t("account.favourites.findHelp")}
          </Link>
          .
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => (
            <li
              key={r.profile_id}
              className="flex items-start gap-3 p-3 rounded-xl border border-brand-dark/10"
            >
              <div className="size-11 rounded-full bg-brand-soft overflow-hidden grid place-items-center text-brand-dark/40 shrink-0">
                {r.photo_url ? (
                  <img src={r.photo_url} alt="" className="size-full object-cover" />
                ) : (
                  <span className="font-semibold">{r.name?.[0] ?? "?"}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-medium truncate">{r.name}</div>
                <div className="flex items-center gap-1 text-xs text-brand-dark/60">
                  <MapPin className="size-3" /> {r.town}
                </div>
                <div className="text-xs text-brand-dark/60 mt-1 line-clamp-1">
                  {r.skills?.slice(0, 3).join(", ")}
                </div>
                {!r.is_available && (
                  <div className="text-xs text-amber-700 mt-1">
                    {t("account.favourites.notAvailable")}
                  </div>
                )}
                <div className="flex flex-wrap gap-2 mt-2">
                  <Link
                    to="/profile/$id"
                    params={{ id: r.public_listing_reference ?? r.profile_id }}
                    className="px-3 py-2 rounded-lg bg-brand-primary text-white text-xs font-medium"
                  >
                    {t("account.favourites.openListing")}
                  </Link>
                  <button
                    type="button"
                    onClick={() => remove.mutate(r.profile_id)}
                    className="px-3 py-2 rounded-lg border border-brand-dark/15 text-xs"
                  >
                    {t("account.favourites.remove")}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}

// ============ Account (permanent deletion) ============
function AccountSection() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [ack, setAck] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [busy, setBusy] = useState(false);

  async function deleteAccount() {
    setBusy(true);
    const { error } = await supabase.rpc("delete_my_account_data");
    if (error) {
      setBusy(false);
      toast.error(t("account.accountManagement.deleteError"));
      return;
    }
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    setBusy(false);
    toast.success(t("account.accountManagement.deletedToast"));
    navigate({ to: "/", replace: true });
  }

  return (
    <Section
      icon="⚙️"
      title={t("account.accountManagement.title")}
      subtitle={t("account.accountManagement.subtitle")}
    >
      <p className="text-sm text-brand-dark/70 mb-4">
        {t("account.accountManagement.body")}
      </p>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-red-200 text-red-700 text-sm font-medium hover:bg-red-50"
      >
        <Trash2 className="size-4" /> {t("account.accountManagement.deleteAccount")}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40 grid place-items-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h2 className="osc-heading text-xl mb-2">{t("account.accountManagement.confirmTitle")}</h2>
            <p className="text-sm text-brand-dark/70 mb-4">
              {t("account.accountManagement.confirmBody")}
            </p>
            <label className="flex items-start gap-2.5 text-sm mb-4 cursor-pointer">
              <input
                type="checkbox"
                checked={ack}
                onChange={(e) => setAck(e.target.checked)}
                className="mt-1 size-4"
              />
              <span>{t("account.accountManagement.confirmAck")}</span>
            </label>
            {ack && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1" htmlFor="confirm-delete">
                  {t("account.accountManagement.confirmStep2")} <strong>DELETE</strong> {t("account.accountManagement.confirmDelete")}
                </label>
                <input
                  id="confirm-delete"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  className="w-full px-4 py-3 border border-brand-dark/15 rounded-xl"
                  autoComplete="off"
                />
              </div>
            )}
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setAck(false);
                  setConfirmText("");
                }}
                className="px-4 py-2 rounded-lg border border-brand-dark/15 text-sm"
              >
                {t("account.accountManagement.cancel")}
              </button>
              <button
                type="button"
                disabled={!ack || confirmText.trim().toUpperCase() !== "DELETE" || busy}
                onClick={deleteAccount}
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm disabled:opacity-40"
              >
                {busy ? t("account.accountManagement.deleting") : t("account.accountManagement.deleteAccount")}
              </button>
            </div>
          </div>
        </div>
      )}
    </Section>
  );
}
