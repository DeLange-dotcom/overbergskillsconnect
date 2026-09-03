import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { MapPin, Calendar, Flag, MessageCircle, ArrowLeft, CheckCircle2 } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { FavouriteButton } from "@/components/site/FavouriteButton";
import { DisclaimerBanner } from "@/components/site/DisclaimerBanner";
import { supabase } from "@/integrations/supabase/client";
import { REPORT_REASONS, type SkillExperience } from "@/lib/noticeboard";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";
import { useLabels } from "@/i18n/labels";

export const Route = createFileRoute("/profile/$id")({
  component: ProfilePage,
  errorComponent: ({ error }) => (
    <SiteLayout>
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h1 className="osc-heading text-2xl mb-2">{i18n.t("publicProfile.error.title")}</h1>
        <p className="text-brand-dark/70">{(error as Error).message}</p>
      </div>
    </SiteLayout>
  ),
  notFoundComponent: () => (
    <SiteLayout>
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h1 className="osc-heading text-2xl mb-2">{i18n.t("publicProfile.notFound.title")}</h1>
        <Link to="/find-help" className="text-brand-primary underline">
          {i18n.t("publicProfile.notFound.backLink")}
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
  skill_experience?: SkillExperience[] | null;
  years_experience: number | null;
  availability: string | null;
  description: string;
  photo_url: string | null;
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function ProfilePage() {
  const { t } = useTranslation();
  const { experienceLabel, availabilityLabel } = useLabels();
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
        <div className="max-w-2xl mx-auto px-4 py-16 text-center text-brand-dark/50">{t("publicProfile.loading")}</div>
      </SiteLayout>
    );
  }
  if (error) throw error;
  if (!data) throw notFound();

  return (
    <SiteLayout>
      <div className="osc-container py-10">
        <Link
          to="/find-help"
          className="inline-flex items-center gap-1.5 text-sm text-brand-dark/60 hover:text-brand-primary mb-6"
        >
          <ArrowLeft className="size-4" /> {t("publicProfile.backToNoticeboard")}
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
              <h1 className="osc-heading text-2xl">{data.name}</h1>
              <div className="flex items-center gap-1.5 text-sm text-brand-dark/60 mt-1">
                <MapPin className="size-4" /> {data.town}
              </div>
              {data.availability && (
                <div className="flex items-center gap-1.5 text-sm text-brand-dark/60 mt-1">
                  <Calendar className="size-4" /> {availabilityLabel(data.availability)}
                </div>
              )}
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-dark/50 mb-2">
              {t("publicProfile.skillsHeading")}
            </h2>
            <ul className="space-y-1.5">
              {(data.skill_experience?.length
                ? data.skill_experience
                : data.skills.map((s) => ({ skill: s, experience_level: null }))
              ).map((s) => {
                const label = experienceLabel(s.experience_level);
                return (
                  <li key={s.skill} className="text-brand-dark/85">
                    <span className="font-medium">{s.skill}</span>
                    {label && (
                      <span className="text-brand-dark/60"> — {label} {t("publicProfile.experienceSuffix")}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>


          <p className="mt-5 text-brand-dark/80 leading-relaxed whitespace-pre-line">
            {data.description}
          </p>

          <div className="mt-6 grid sm:grid-cols-2 gap-3">
            <button
              onClick={() => setContactOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-brand-primary text-white font-medium hover:brightness-110"
            >
              <MessageCircle className="size-4" /> {t("publicProfile.requestContact")}
            </button>
            <button
              onClick={() => setReportOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-brand-dark/15 text-sm text-brand-dark/70 hover:bg-brand-soft"
            >
              <Flag className="size-4" /> {t("publicProfile.reportProfile")}
            </button>
            <FavouriteButton profileId={data.id} className="sm:col-span-2" />
          </div>
        </div>

        <div className="mt-6">
          <DisclaimerBanner />
        </div>
      </div>

      {contactOpen && (
        <ContactDialog profileId={data.id} name={data.name} onClose={() => setContactOpen(false)} />
      )}
      {reportOpen && <ReportDialog profileId={data.id} onClose={() => setReportOpen(false)} />}
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
  const { t } = useTranslation();
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
          (u.user_metadata?.full_name as string) || (u.user_metadata?.name as string) || "",
        );
        setUserPhone((u.user_metadata?.phone as string) || u.phone || "");
      }
      setAuthChecked(true);
    });
  }, []);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!consent) {
      toast.error(t("publicProfile.contactDialog.consentRequired"));
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
        toast.error(t("publicProfile.contactDialog.rateLimited"));
      } else if (msg.includes("consent_required")) {
        toast.error(t("publicProfile.contactDialog.consentRequired"));
      } else {
        toast.error(msg || t("publicProfile.contactDialog.genericError"));
      }
      return;
    }
    setSent(true);
  }

  if (!authChecked) {
    return (
      <Modal onClose={onClose}>
        <div className="py-6 text-center text-brand-dark/60 text-sm">{t("publicProfile.contactDialog.loading")}</div>
      </Modal>
    );
  }

  if (!signedIn) {
    return (
      <Modal onClose={onClose}>
        <h2 className="font-heading text-xl font-semibold mb-2">{t("publicProfile.contactDialog.signInTitle")}</h2>
        <p className="text-sm text-brand-dark/70 mb-5">
          {t("publicProfile.contactDialog.signInBody", { name })}
        </p>
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-brand-dark/10"
          >
            {t("publicProfile.contactDialog.cancel")}
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
            {t("publicProfile.contactDialog.signIn")}
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
          <h2 className="font-heading text-xl font-semibold mb-2">{t("publicProfile.contactDialog.sentTitle")}</h2>
          <p className="text-sm text-brand-dark/70 mb-5">
            {t("publicProfile.contactDialog.sentBody", { name })}
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={() => navigate({ to: "/profile" })}
              className="flex-1 px-4 py-3 rounded-xl bg-brand-primary text-white font-medium"
            >
              {t("publicProfile.contactDialog.viewMyProfile")}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border border-brand-dark/15"
            >
              {t("publicProfile.contactDialog.continueBrowsing")}
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal onClose={onClose}>
      <h2 className="font-heading text-xl font-semibold mb-1">{t("publicProfile.contactDialog.title")}</h2>
      <p className="text-sm text-brand-dark/60 mb-4">
        {t("publicProfile.contactDialog.subtitle", { name })}
      </p>
      <form onSubmit={submit} className="space-y-3">
        <input
          required
          name="name"
          defaultValue={userName}
          placeholder={t("publicProfile.contactDialog.namePlaceholder")}
          className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl"
        />
        <input
          required
          name="contact"
          defaultValue={userPhone}
          placeholder={t("publicProfile.contactDialog.contactPlaceholder")}
          className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl"
        />
        <textarea
          name="message"
          rows={3}
          placeholder={t("publicProfile.contactDialog.messagePlaceholder")}
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
            {t("publicProfile.contactDialog.consentLabel", { name })}
          </span>
        </label>
        <div className="flex gap-2 justify-end pt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-brand-dark/10"
          >
            {t("publicProfile.contactDialog.cancel")}
          </button>
          <button
            type="submit"
            disabled={submitting || !consent}
            className="px-4 py-2.5 rounded-xl bg-brand-primary text-white disabled:opacity-60"
          >
            {submitting ? t("publicProfile.contactDialog.sending") : t("publicProfile.contactDialog.send")}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ReportDialog({ profileId, onClose }: { profileId: string; onClose: () => void }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reason, setReason] = useState<string>("");

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      setSignedIn(Boolean(data.user));
      setAuthChecked(true);
    });
    return () => {
      active = false;
    };
  }, []);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!reason) {
      toast.error(t("publicProfile.reportDialog.reasonRequired"));
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
    toast.success(t("publicProfile.reportDialog.success"));
    onClose();
  }

  if (!authChecked) {
    return (
      <Modal onClose={onClose}>
        <h2 className="font-heading text-xl font-semibold mb-2">{t("publicProfile.reportDialog.checkingAccount")}</h2>
        <p className="text-sm text-brand-dark/60">{t("publicProfile.reportDialog.pleaseWait")}</p>
      </Modal>
    );
  }

  if (!signedIn) {
    return (
      <Modal onClose={onClose}>
        <h2 className="font-heading text-xl font-semibold mb-2">{t("publicProfile.reportDialog.signInTitle")}</h2>
        <p className="text-sm text-brand-dark/60 mb-5">
          {t("publicProfile.reportDialog.signInBody")}
        </p>
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-brand-dark/10"
          >
            {t("publicProfile.reportDialog.cancel")}
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
            {t("publicProfile.reportDialog.signIn")}
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal onClose={onClose}>
      <h2 className="font-heading text-xl font-semibold mb-1">{t("publicProfile.reportDialog.title")}</h2>
      <p className="text-sm text-brand-dark/60 mb-4">
        {t("publicProfile.reportDialog.subtitle")}
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
              {t(`publicProfile.reportDialog.reasons.${r.value}`, { defaultValue: r.label })}
            </label>
          ))}
        </div>
        <textarea
          name="details"
          rows={3}
          placeholder={t("publicProfile.reportDialog.detailsPlaceholder")}
          className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl"
          spellCheck="true"
        />
        <input
          name="reporter_contact"
          placeholder={t("publicProfile.reportDialog.contactPlaceholder")}
          className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl"
        />
        <div className="flex gap-2 justify-end pt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-brand-dark/10"
          >
            {t("publicProfile.reportDialog.cancel")}
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2.5 rounded-xl bg-red-600 text-white disabled:opacity-60"
          >
            {submitting ? t("publicProfile.reportDialog.sending") : t("publicProfile.reportDialog.submit")}
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
