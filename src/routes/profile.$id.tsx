import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { MapPin, Calendar, Flag, MessageCircle, ArrowLeft, CheckCircle2 } from "lucide-react";
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
  public_listing_reference: string | null;
  name: string;
  town: string;
  skills: string[];
  years_experience: number | null;
  availability: string | null;
  description: string;
  photo_url: string | null;
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function ProfilePage() {
  const { id } = Route.useParams();
  const [contactOpen, setContactOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["profile", id],
    queryFn: async (): Promise<Row | null> => {
      const lookupColumn = UUID_RE.test(id) ? "id" : "public_listing_reference";
      const { data, error } = await supabase
        .from("noticeboard_public")
        .select("*")
        .eq(lookupColumn, id)
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
              <MessageCircle className="size-4" /> Request Contact
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
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      setSignedIn(!!u);
      if (u) {
        setUserName(
          (u.user_metadata?.full_name as string) ||
            (u.user_metadata?.name as string) ||
            "",
        );
        setUserPhone((u.user_metadata?.phone as string) || u.phone || "");
      }
      setAuthChecked(true);
    });
  }, []);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!consent) {
      toast.error("Please tick the consent box to continue.");
      return;
    }
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const { error } = await supabase.rpc("noticeboard_create_contact_request", {
      _profile_id: profileId,
      _requester_name: String(fd.get("name") || "").trim(),
      _requester_contact: String(fd.get("contact") || "").trim(),
      _message: String(fd.get("message") || "").trim(),
      _consent: true,
    });
    setSubmitting(false);
    if (error) {
      const msg = error.message ?? "";
      if (msg.includes("rate_limited")) {
        toast.error(
          "You've reached the limit of 5 contact requests in 24 hours. Please try again later.",
        );
      } else if (msg.includes("consent_required")) {
        toast.error("Please tick the consent box to continue.");
      } else {
        toast.error(msg || "Could not send your request.");
      }
      return;
    }
    setSent(true);
  }

  if (!authChecked) {
    return (
      <Modal onClose={onClose}>
        <div className="py-6 text-center text-brand-dark/60 text-sm">Loading…</div>
      </Modal>
    );
  }

  if (!signedIn) {
    return (
      <Modal onClose={onClose}>
        <h2 className="font-heading text-xl font-semibold mb-2">Sign in to continue</h2>
        <p className="text-sm text-brand-dark/70 mb-5">
          Create a free account or sign in so {name} can reply, and so you can track your
          contact requests from your dashboard.
        </p>
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-brand-dark/10"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() =>
              navigate({
                to: "/auth",
                search: { next: `/profile/${profileId}` } as never,
              })
            }
            className="px-4 py-2.5 rounded-xl bg-brand-primary text-white"
          >
            Sign in
          </button>
        </div>
      </Modal>
    );
  }

  if (sent) {
    return (
      <Modal onClose={onClose}>
        <div className="text-center">
          <div className="mx-auto size-14 rounded-full bg-emerald-100 grid place-items-center mb-3">
            <CheckCircle2 className="size-7 text-emerald-600" />
          </div>
          <h2 className="font-heading text-xl font-semibold mb-2">Request sent</h2>
          <p className="text-sm text-brand-dark/70 mb-5">
            Your request has been sent successfully. {name} has been notified and can choose
            whether to share their contact details. You can check the status any time from
            <span className="font-medium"> My Contact Requests</span> in your dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={() => navigate({ to: "/my-requests" })}
              className="flex-1 px-4 py-3 rounded-xl bg-brand-primary text-white font-medium"
            >
              View My Contact Requests
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border border-brand-dark/15"
            >
              Continue Browsing
            </button>
          </div>
        </div>
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
          defaultValue={userName}
          placeholder="Your name"
          className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl"
        />
        <input
          required
          name="contact"
          defaultValue={userPhone}
          placeholder="Your phone or WhatsApp"
          className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl"
        />
        <textarea
          name="message"
          rows={3}
          placeholder="Briefly, what help are you looking for?"
          className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl"
          spellCheck
        />
        <label className="flex items-start gap-2 text-xs text-brand-dark/70 leading-relaxed pt-1">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 size-4 shrink-0"
          />
          <span>
            I agree that my name and contact details will be shared with {name} so they can
            respond to my request. Any phone number they choose to share will be visible to me
            for 30 days.
          </span>
        </label>
        <div className="flex gap-2 justify-end pt-1">
          <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl border border-brand-dark/10">
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || !consent}
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
         spellCheck="true" />
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
