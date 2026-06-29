import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { MapPin, Calendar, Flag, MessageCircle, ArrowLeft, Copy } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { DisclaimerBanner } from "@/components/site/DisclaimerBanner";
import { supabase } from "@/integrations/supabase/client";
import { REPORT_REASONS } from "@/lib/noticeboard";
import { toast } from "sonner";

export const Route = createFileRoute("/profile/$id")({
  component: ProfilePage,
  errorComponent: ({ error }) => (
    <SiteLayout>
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-heading font-bold mb-2">Something went wrong</h1>
        <p className="text-brand-dark/70">{(error as Error).message}</p>
      </div>
    </SiteLayout>
  ),
  notFoundComponent: () => (
    <SiteLayout>
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-heading font-bold mb-2">Listing not found</h1>
        <Link to="/find-help" className="text-brand-primary underline">
          Back to the noticeboard
        </Link>
      </div>
    </SiteLayout>
  ),
});

type Row = {
  id: string;
  name: string;
  town: string;
  skills: string[];
  years_experience: number | null;
  availability: string | null;
  description: string;
  photo_url: string | null;
};

function ProfilePage() {
  const { id } = Route.useParams();
  const [contactOpen, setContactOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["profile", id],
    queryFn: async (): Promise<Row | null> => {
      const { data, error } = await supabase
        .from("noticeboard_public")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return (data as Row | null) ?? null;
    },
  });

  if (isLoading) {
    return (
      <SiteLayout>
        <div className="max-w-2xl mx-auto px-4 py-16 text-center text-brand-dark/50">
          Loading…
        </div>
      </SiteLayout>
    );
  }
  if (error) throw error;
  if (!data) throw notFound();

  return (
    <SiteLayout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <Link
          to="/find-help"
          className="inline-flex items-center gap-1.5 text-sm text-brand-dark/60 hover:text-brand-primary mb-6"
        >
          <ArrowLeft className="size-4" /> Back to noticeboard
        </Link>

        <div className="bg-white border border-brand-dark/5 rounded-3xl p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="size-20 rounded-full bg-brand-soft overflow-hidden grid place-items-center text-brand-dark/40 shrink-0">
              {data.photo_url ? (
                <img src={data.photo_url} alt="" className="size-full object-cover" />
              ) : (
                <span className="text-2xl font-semibold">{data.name[0]}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-heading font-bold">{data.name}</h1>
              <div className="flex items-center gap-1.5 text-sm text-brand-dark/60 mt-1">
                <MapPin className="size-4" /> {data.town}
              </div>
              {data.availability && (
                <div className="flex items-center gap-1.5 text-sm text-brand-dark/60 mt-1">
                  <Calendar className="size-4" /> {data.availability}
                  {data.years_experience != null && ` · ${data.years_experience} yrs experience`}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-5">
            {data.skills.map((s) => (
              <span
                key={s}
                className="text-xs px-2.5 py-1 rounded-full bg-brand-soft text-brand-dark/80"
              >
                {s}
              </span>
            ))}
          </div>

          <p className="mt-5 text-brand-dark/80 leading-relaxed whitespace-pre-line">
            {data.description}
          </p>

          <div className="mt-6 grid sm:grid-cols-2 gap-3">
            <button
              onClick={() => setContactOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-brand-primary text-white font-medium hover:brightness-110"
            >
              <MessageCircle className="size-4" /> Request Contact Details
            </button>
            <button
              onClick={() => setReportOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-brand-dark/15 text-sm text-brand-dark/70 hover:bg-brand-soft"
            >
              <Flag className="size-4" /> Report this profile
            </button>
          </div>
        </div>

        <div className="mt-6">
          <DisclaimerBanner />
        </div>
      </div>

      {contactOpen && (
        <ContactDialog profileId={data.id} name={data.name} onClose={() => setContactOpen(false)} />
      )}
      {reportOpen && (
        <ReportDialog profileId={data.id} onClose={() => setReportOpen(false)} />
      )}
    </SiteLayout>
  );
}

function ContactDialog({
  profileId,
  name,
  onClose,
}: {
  profileId: string;
  name: string;
  onClose: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const { data, error } = await supabase
      .from("noticeboard_contact_requests")
      .insert({
        profile_id: profileId,
        requester_name: String(fd.get("name") || "").trim(),
        requester_contact: String(fd.get("contact") || "").trim(),
        message: String(fd.get("message") || "").trim() || null,
      })
      .select("requester_token")
      .single();
    setSubmitting(false);
    if (error || !data) {
      toast.error(error?.message ?? "Could not send your request.");
      return;
    }
    setToken(data.requester_token as string);
  }

  if (token) {
    const url = `${window.location.origin}/request/${token}`;
    return (
      <Modal onClose={onClose}>
        <h2 className="font-heading text-xl font-semibold mb-2">Request sent</h2>
        <p className="text-sm text-brand-dark/70 mb-4">
          {name} will be notified. Save this link to check the response — if approved, you'll see
          the contact details there.
        </p>
        <div className="flex items-center gap-2 p-3 rounded-xl bg-brand-soft border border-brand-dark/10 mb-4">
          <code className="text-xs break-all flex-1">{url}</code>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(url);
              toast.success("Link copied");
            }}
            className="p-2 rounded-lg hover:bg-white"
          >
            <Copy className="size-4" />
          </button>
        </div>
        <button
          onClick={onClose}
          className="w-full px-4 py-2.5 rounded-xl bg-brand-primary text-white"
        >
          Done
        </button>
      </Modal>
    );
  }

  return (
    <Modal onClose={onClose}>
      <h2 className="font-heading text-xl font-semibold mb-1">Request contact details</h2>
      <p className="text-sm text-brand-dark/60 mb-4">
        {name} will choose whether to share their phone number.
      </p>
      <form onSubmit={submit} className="space-y-3">
        <input
          required
          name="name"
          placeholder="Your name"
          className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl"
        />
        <input
          required
          name="contact"
          placeholder="Your phone or WhatsApp"
          className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl"
        />
        <textarea
          name="message"
          rows={3}
          placeholder="Briefly, what help are you looking for?"
          className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl"
        />
        <div className="flex gap-2 justify-end pt-1">
          <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl border border-brand-dark/10">
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2.5 rounded-xl bg-brand-primary text-white disabled:opacity-60"
          >
            {submitting ? "Sending…" : "Send request"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ReportDialog({ profileId, onClose }: { profileId: string; onClose: () => void }) {
  const [submitting, setSubmitting] = useState(false);
  const [reason, setReason] = useState<string>("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!reason) {
      toast.error("Please select a reason.");
      return;
    }
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const { error } = await supabase.from("noticeboard_reports").insert({
      profile_id: profileId,
      reason,
      details: String(fd.get("details") || "").trim() || null,
      reporter_contact: String(fd.get("reporter_contact") || "").trim() || null,
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Thank you. Khulisa admins will review this report.");
    onClose();
  }

  return (
    <Modal onClose={onClose}>
      <h2 className="font-heading text-xl font-semibold mb-1">Report this profile</h2>
      <p className="text-sm text-brand-dark/60 mb-4">
        Khulisa admins will review reports and may remove profiles that breach our Terms.
      </p>
      <form onSubmit={submit} className="space-y-3">
        <div className="space-y-2">
          {REPORT_REASONS.map((r) => (
            <label key={r.value} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="reason"
                value={r.value}
                checked={reason === r.value}
                onChange={() => setReason(r.value)}
              />
              {r.label}
            </label>
          ))}
        </div>
        <textarea
          name="details"
          rows={3}
          placeholder="Optional details"
          className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl"
        />
        <input
          name="reporter_contact"
          placeholder="Your contact (optional, so we can follow up)"
          className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl"
        />
        <div className="flex gap-2 justify-end pt-1">
          <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl border border-brand-dark/10">
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2.5 rounded-xl bg-red-600 text-white disabled:opacity-60"
          >
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
      <div
        className="bg-white rounded-2xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
