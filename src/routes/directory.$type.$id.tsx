import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { HineniDisclaimer } from "@/components/site/HineniDisclaimer";
import {
  VerificationBadge,
  VERIFICATION_CRITERIA,
  type VerificationLevel,
} from "@/components/site/VerificationBadge";
import { supabase } from "@/integrations/supabase/client";
import {
  COMPLAINT_TYPES,
  directoryCategoryLabel,
  HINENI_DISCLAIMER,
} from "@/lib/directory-constants";
import { ArrowLeft, Loader2, MapPin, MessageCircle, ShieldAlert, Star } from "lucide-react";
import { toast } from "sonner";

const TYPES = ["service_provider", "apprentice", "youth"] as const;
type ApplicantType = (typeof TYPES)[number];

export const Route = createFileRoute("/directory/$type/$id")({
  parseParams: (p) => {
    if (!TYPES.includes(p.type as ApplicantType)) throw notFound();
    return { type: p.type as ApplicantType, id: p.id };
  },
  head: () => ({ meta: [{ title: "Verified profile — Hineni" }] }),
  component: ProfilePage,
  errorComponent: ({ error }) => (
    <SiteLayout>
      <div className="max-w-xl mx-auto p-10 text-center text-brand-dark/70">
        {error?.message ?? "Profile not found."}
      </div>
    </SiteLayout>
  ),
  notFoundComponent: () => (
    <SiteLayout>
      <div className="max-w-xl mx-auto p-10 text-center">
        <h1 className="text-2xl font-bold mb-2">Profile not found</h1>
        <Link to="/directory" className="text-brand-primary underline">Back to directory</Link>
      </div>
    </SiteLayout>
  ),
});

function ProfilePage() {
  const { type, id } = Route.useParams();
  const [showContact, setShowContact] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const tableMap = {
    service_provider: "service_providers",
    apprentice: "apprentices",
    youth: "youth_profiles",
  } as const;

  const { data: profile, isLoading } = useQuery({
    queryKey: ["directory_profile", type, id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(tableMap[type])
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw notFound();
      return data as Record<string, unknown>;
    },
  });

  const { data: rep } = useQuery({
    queryKey: ["applicant_reputation", type, id],
    queryFn: async () => {
      const { data } = await supabase
        .from("applicant_reputation" as never)
        .select("*")
        .eq("applicant_type", type)
        .eq("applicant_id", id)
        .maybeSingle();
      return data as { review_count: number; avg_rating: number; recommend_pct: number } | null;
    },
  });

  if (isLoading || !profile) {
    return (
      <SiteLayout>
        <div className="grid place-items-center py-20 text-brand-dark/50">
          <Loader2 className="size-6 animate-spin" />
        </div>
      </SiteLayout>
    );
  }

  const firstName =
    String((profile as { display_name?: string }).display_name ?? (profile.full_name as string) ?? "")
      .split(" ")[0] || "Member";
  const level = ((profile.verification_level as VerificationLevel) ?? "unverified");

  const skills: string[] = (
    (profile.services as string[] | null) ??
      (profile.career_interests as string[] | null) ??
      (profile.skills as string[] | null) ??
      []
  );
  const languages: string[] = (profile.languages as string[]) ?? [];
  const town = (profile.town as string) ?? "—";
  const category = (profile.category as string) ?? null;
  const bio = (profile.short_bio as string) ?? null;
  const photo = (profile.profile_photo_url as string) ?? null;

  return (
    <SiteLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <Link to="/directory" className="inline-flex items-center gap-2 text-sm text-brand-dark/60 hover:text-brand-primary mb-4">
          <ArrowLeft className="size-4" /> Back to directory
        </Link>

        <div className="bg-white border border-brand-dark/5 rounded-3xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row gap-5 items-start mb-6">
            <div className="size-24 rounded-2xl bg-brand-soft overflow-hidden grid place-items-center text-brand-dark/40 shrink-0">
              {photo ? (
                <img src={photo} alt="" className="size-full object-cover" />
              ) : (
                <span className="text-3xl font-semibold">{firstName[0]}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-3xl font-heading font-bold">{firstName}</h1>
                <VerificationBadge level={level} size="lg" />
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-brand-dark/70">
                <span className="inline-flex items-center gap-1"><MapPin className="size-4" /> {town}</span>
                <span>{directoryCategoryLabel(category)}</span>
              </div>
              {rep && rep.review_count > 0 && (
                <div className="mt-3 inline-flex items-center gap-2 text-sm">
                  <Star className="size-4 text-amber-500 fill-amber-400" />
                  <strong>{Number(rep.avg_rating).toFixed(1)}</strong>
                  <span className="text-brand-dark/60">
                    · {rep.review_count} review{rep.review_count === 1 ? "" : "s"}
                    {rep.recommend_pct != null ? ` · ${rep.recommend_pct}% recommend` : ""}
                  </span>
                </div>
              )}
            </div>
          </div>

          {bio && <p className="text-brand-dark/80 leading-relaxed mb-6">{bio}</p>}

          <div className="grid sm:grid-cols-2 gap-6 mb-6">
            {skills.length > 0 && (
              <div>
                <h3 className="text-xs uppercase tracking-wider text-brand-dark/50 mb-2">Skills</h3>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((s) => (
                    <span key={s} className="text-xs px-2 py-1 rounded-full bg-brand-soft">{s}</span>
                  ))}
                </div>
              </div>
            )}
            {languages.length > 0 && (
              <div>
                <h3 className="text-xs uppercase tracking-wider text-brand-dark/50 mb-2">Languages</h3>
                <div className="flex flex-wrap gap-1.5">
                  {languages.map((l) => (
                    <span key={l} className="text-xs px-2 py-1 rounded-full bg-brand-soft">{l}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {level !== "unverified" && (
            <div className="bg-brand-soft/60 border border-brand-dark/5 rounded-2xl p-4 mb-6">
              <h3 className="font-semibold text-sm mb-2">Verification includes</h3>
              <ul className="text-sm text-brand-dark/70 space-y-1">
                {VERIFICATION_CRITERIA[level].map((c) => (
                  <li key={c}>✓ {c}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowContact(true)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-primary text-primary-foreground font-medium hover:brightness-110"
            >
              <MessageCircle className="size-4" /> Request Contact
            </button>
            <button
              onClick={() => setShowReport(true)}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-brand-dark/10 text-sm hover:bg-brand-soft"
            >
              <ShieldAlert className="size-4" /> Report a concern
            </button>
          </div>
        </div>

        <div className="mt-6">
          <HineniDisclaimer />
        </div>

        <ReviewsList type={type} id={id} />
      </div>

      {showContact && (
        <ContactDialog
          firstName={firstName}
          applicantType={type}
          applicantId={id}
          category={category}
          onClose={() => setShowContact(false)}
        />
      )}
      {showReport && (
        <SafetyDialog
          firstName={firstName}
          applicantType={type}
          applicantId={id}
          onClose={() => setShowReport(false)}
        />
      )}
    </SiteLayout>
  );
}

function ContactDialog({
  firstName,
  applicantType,
  applicantId,
  category,
  onClose,
}: {
  firstName: string;
  applicantType: ApplicantType;
  applicantId: string;
  category: string | null;
  onClose: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!accepted) {
      setErr("You must accept the disclaimer to continue.");
      return;
    }
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const payload = {
      visitor_name: (fd.get("name") as string).trim(),
      visitor_email: (fd.get("email") as string).trim(),
      visitor_phone: (fd.get("phone") as string).trim(),
      reason: (fd.get("reason") as string).trim(),
      applicant_type: applicantType,
      applicant_id: applicantId,
    };

    try {
      const res = await fetch("/api/public/contact-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({ error: "Failed" }));
        throw new Error(j.error ?? "Failed to send request.");
      }
      toast.success("Request sent. Hineni will share contact details by email.");
      onClose();
    } catch (e) {
      setSubmitting(false);
      setErr(e instanceof Error ? e.message : "Could not send your request.");
      return;
    }
  }

  return (
    <Modal onClose={onClose}>
      <h2 className="font-heading text-xl font-semibold mb-1">Request contact with {firstName}</h2>
      <p className="text-sm text-brand-dark/60 mb-5">
        Hineni will share contact details by email with both of you. We don't get involved in your
        arrangement.
      </p>
      <form onSubmit={submit} className="space-y-3">
        <input required name="name" placeholder="Full name" className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl" />
        <input required type="email" name="email" placeholder="Email address" className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl" />
        <input required name="phone" placeholder="Phone or WhatsApp number" className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl" />
        <textarea required name="reason" rows={4} placeholder="Reason for contact (what help do you need?)" className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl" />
        <label className="flex items-start gap-2 text-sm text-brand-dark/75">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => { setAccepted(e.target.checked); if (e.target.checked) setErr(null); }}
            className="mt-1"
          />
          <span>
            I understand that Hineni only facilitates introductions and is not responsible for
            employment decisions, performance, conduct, or agreements between parties.
          </span>
        </label>
        <p className="text-[11px] text-brand-dark/50">{HINENI_DISCLAIMER}</p>
        {err && <p className="text-sm text-rose-600">{err}</p>}
        {/* category included silently */}
        <input type="hidden" name="category" value={category ?? ""} />
        <div className="flex gap-2 justify-end pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl border border-brand-dark/10">Cancel</button>
          <button type="submit" disabled={submitting} className="px-4 py-2.5 rounded-xl bg-brand-primary text-primary-foreground disabled:opacity-60">
            {submitting ? "Sending…" : "Send request"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function SafetyDialog({
  firstName,
  applicantType,
  applicantId,
  onClose,
}: {
  firstName: string;
  applicantType: ApplicantType;
  applicantId: string;
  onClose: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const { error } = await supabase.from("safety_reports").insert({
      applicant_type: applicantType,
      applicant_id: applicantId,
      complaint_type: fd.get("complaint_type") as string,
      description: (fd.get("description") as string).trim(),
      reporter_name: ((fd.get("name") as string) || "").trim() || null,
      reporter_email: ((fd.get("email") as string) || "").trim() || null,
      reporter_phone: ((fd.get("phone") as string) || "").trim() || null,
    });
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Thank you. A Hineni administrator will review this report.");
    onClose();
  }

  return (
    <Modal onClose={onClose}>
      <h2 className="font-heading text-xl font-semibold mb-1">Report a concern about {firstName}</h2>
      <p className="text-sm text-brand-dark/60 mb-5">
        Reports are confidential and reviewed by Hineni administrators.
      </p>
      <form onSubmit={submit} className="space-y-3">
        <select required name="complaint_type" className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl bg-white">
          <option value="">Type of concern…</option>
          {COMPLAINT_TYPES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        <textarea required name="description" rows={5} placeholder="Describe what happened…" className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl" />
        <input name="name" placeholder="Your name (optional)" className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl" />
        <input type="email" name="email" placeholder="Your email (optional)" className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl" />
        <input name="phone" placeholder="Your phone (optional)" className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl" />
        <div className="flex gap-2 justify-end pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl border border-brand-dark/10">Cancel</button>
          <button type="submit" disabled={submitting} className="px-4 py-2.5 rounded-xl bg-brand-primary text-primary-foreground disabled:opacity-60">
            {submitting ? "Sending…" : "Submit report"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center px-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

function ReviewsList({ type, id }: { type: ApplicantType; id: string }) {
  const { data } = useQuery({
    queryKey: ["reviews", type, id],
    queryFn: async () => {
      const { data } = await supabase
        .from("feedback_responses")
        .select("reliability, communication, punctuality, would_recommend, comment, created_at")
        .eq("applicant_type", type)
        .eq("applicant_id", id)
        .eq("engaged", "yes")
        .order("created_at", { ascending: false })
        .limit(20);
      return data ?? [];
    },
  });

  if (!data || data.length === 0) return null;

  return (
    <div className="mt-8 bg-white border border-brand-dark/5 rounded-3xl p-6">
      <h2 className="font-heading text-xl font-semibold mb-4">Reviews from the community</h2>
      <ul className="space-y-4">
        {data.map((r, i) => {
          const avg = ((r.reliability ?? 0) + (r.communication ?? 0) + (r.punctuality ?? 0)) / 3;
          return (
            <li key={i} className="border-b border-brand-dark/5 last:border-0 pb-4 last:pb-0">
              <div className="flex items-center gap-2 mb-1">
                <Star className="size-4 text-amber-500 fill-amber-400" />
                <strong className="text-sm">{avg.toFixed(1)}</strong>
                {r.would_recommend && <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">Recommends</span>}
                <span className="text-xs text-brand-dark/50 ml-auto">{new Date(r.created_at).toLocaleDateString()}</span>
              </div>
              {r.comment && <p className="text-sm text-brand-dark/80">{r.comment}</p>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
