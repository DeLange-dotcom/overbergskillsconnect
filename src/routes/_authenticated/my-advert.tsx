import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation, Trans } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { AVAILABILITY_OPTIONS, type SkillExperience } from "@/lib/noticeboard";
import { LocationSelect } from "@/components/site/LocationSelect";
import {
  SkillExperienceEditor,
  entriesFromSkillExperience,
  entriesToPayload,
  type SkillEntry,
} from "@/components/site/SkillExperienceEditor";

import {
  approvedContactMessage,
  declinedContactMessage,
  openWhatsAppMessage,
} from "@/lib/manual-whatsapp";
import { toast } from "sonner";
import { Eye, EyeOff, Trash2, ExternalLink, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/my-advert")({
  component: MyAdvert,
});

type MyListing = {
  id: string;
  name: string;
  town: string;
  phone: string;
  description: string;
  skills: string[];
  skill_experience?: SkillExperience[] | null;

  category: string | null;
  years_experience: number | null;
  availability: string | null;
  photo_url: string | null;
  is_hidden: boolean;
  is_archived: boolean;
  public_listing_reference: string | null;
  created_at: string;
};

function MyAdvert() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["my-advert"],
    queryFn: async (): Promise<MyListing | null> => {
      const { data, error } = await supabase.rpc("noticeboard_my_listing");
      if (error) throw error;
      // Best-effort: stamp last_login_at for lifecycle tracking
      supabase.rpc("noticeboard_touch_login").then(() => {});
      const row = Array.isArray(data) ? data[0] : data;
      return (row as MyListing | undefined) ?? null;
    },
  });

  if (isLoading) {
    return (
      <SiteLayout>
        <div className="max-w-2xl mx-auto px-4 py-16 text-center text-brand-dark/60">
          <Loader2 className="size-6 animate-spin mx-auto mb-3" />
          {t("myAdvert.loading")}
        </div>
      </SiteLayout>
    );
  }

  if (!data) {
    return (
      <SiteLayout>
        <div className="max-w-xl mx-auto px-4 sm:px-6 py-16 text-center">
          <div className="text-5xl mb-4" aria-hidden>
            📝
          </div>
          <h1 className="osc-heading text-3xl mb-3">{t("myAdvert.notCreated.title")}</h1>
          <p className="text-brand-dark/70 mb-8">{t("myAdvert.notCreated.body")}</p>
          <Link
            to="/advertise"
            className="inline-flex px-6 py-3.5 rounded-xl bg-brand-primary text-white font-medium"
          >
            {t("myAdvert.notCreated.create")}
          </Link>
        </div>
      </SiteLayout>
    );
  }

  return (
    <MyAdvertEditor
      listing={data}
      onSaved={() => qc.invalidateQueries({ queryKey: ["my-advert"] })}
      onDeleted={() => {
        qc.invalidateQueries({ queryKey: ["my-advert"] });
        navigate({ to: "/advertise" });
      }}
      refetch={refetch}
    />
  );
}

function MyAdvertEditor({
  listing,
  onSaved,
  onDeleted,
  refetch,
}: {
  listing: MyListing;
  onSaved: () => void;
  onDeleted: () => void;
  refetch: () => void;
}) {
  const { t } = useTranslation();
  const [name, setName] = useState(listing.name);
  const [town, setTown] = useState(listing.town);
  const [phone, setPhone] = useState(listing.phone);
  const [description, setDescription] = useState(listing.description);
  const [photoUrl, setPhotoUrl] = useState(listing.photo_url ?? "");
  const [availability, setAvailability] = useState(listing.availability ?? "");
  const [entries, setEntries] = useState<SkillEntry[]>(() =>
    entriesFromSkillExperience(
      listing.skill_experience?.length
        ? listing.skill_experience
        : listing.skills.map((s) => ({ skill: s, experience_level: null })),
    ),
  );
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteAck, setDeleteAck] = useState(false);

  // Keep form in sync if listing changes externally
  useEffect(() => {
    setName(listing.name);
    setTown(listing.town);
    setPhone(listing.phone);
    setDescription(listing.description);
    setPhotoUrl(listing.photo_url ?? "");
    setAvailability(listing.availability ?? "");
    setEntries(
      entriesFromSkillExperience(
        listing.skill_experience?.length
          ? listing.skill_experience
          : listing.skills.map((s) => ({ skill: s, experience_level: null })),
      ),
    );
  }, [listing.id]);

  async function save(extra: Partial<Record<string, unknown>> = {}) {
    setSaving(true);
    const skillExperience = entriesToPayload(entries);
    if (skillExperience.length === 0) {
      setSaving(false);
      toast.error(t("myAdvert.toasts.atLeastOneSkill"));
      return;
    }
    if (skillExperience.some((s) => !s.experience_level)) {
      setSaving(false);
      toast.error(t("myAdvert.toasts.chooseExperience"));
      return;
    }
    const finalSkills = skillExperience.map((s) => s.skill);
    const payload = {
      name: name.trim(),
      town: town.trim(),
      phone: phone.trim(),
      description: description.trim(),
      skills: finalSkills,
      skill_experience: skillExperience,
      category: finalSkills[0],
      availability,
      photo_url: photoUrl.trim(),
      ...extra,
    };
    const { error } = await supabase.rpc("noticeboard_my_update", {
      _payload: payload,
    });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(t("myAdvert.toasts.updated"));
    onSaved();
  }


  async function togglePaused() {
    const { error } = await supabase.rpc("noticeboard_my_set_paused", {
      _paused: !listing.is_hidden,
    });
    if (error) {
      toast.error(t("myAdvert.toasts.pauseError"));
      return;
    }
    toast.success(listing.is_hidden ? t("myAdvert.toasts.listingLive") : t("myAdvert.toasts.listingPaused"));
    refetch();
  }

  async function deleteListing() {
    const { error } = await supabase.rpc("noticeboard_my_delete");
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(t("myAdvert.toasts.removed"));
    onDeleted();
  }

  const publicUrl = listing.public_listing_reference
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/profile/${listing.public_listing_reference}`
    : null;

  return (
    <SiteLayout>
      <div className="osc-container py-8 sm:py-12">
        <div className="flex items-start justify-between gap-3 mb-6">
          <div>
            <h1 className="osc-heading text-3xl sm:text-4xl">{t("myAdvert.page.title")}</h1>
            <p className="text-brand-dark/60 text-sm mt-1">
              {t("myAdvert.page.subtitle")}
            </p>
          </div>
          {publicUrl && (
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-brand-dark/15 text-sm hover:bg-brand-soft whitespace-nowrap"
              title={t("myAdvert.page.preview")}
            >
              <ExternalLink className="size-4" /> {t("myAdvert.page.preview")}
            </a>
          )}
        </div>

        {listing.is_archived && (
          <div className="p-4 rounded-2xl border border-amber-300 bg-amber-50 mb-4 text-sm text-amber-900">
            <Trans
              i18nKey="myAdvert.archivedNotice"
              components={{ bold: <strong />, italic: <em /> }}
            />
          </div>
        )}

        <div className="flex items-center justify-between p-4 rounded-2xl border border-brand-dark/10 bg-white mb-6">
          <div>
            <div className="font-medium">
              {listing.is_hidden ? t("myAdvert.status.pausedNotShown") : t("myAdvert.status.live")}
            </div>
            <div className="text-xs text-brand-dark/60">
              {listing.is_hidden
                ? t("myAdvert.status.pausedInfo")
                : t("myAdvert.status.liveInfo")}
            </div>
          </div>
          <button
            type="button"
            onClick={togglePaused}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-brand-dark/15 text-sm hover:bg-brand-soft whitespace-nowrap"
          >
            {listing.is_hidden ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
            {listing.is_hidden ? t("myAdvert.unpause") : t("myAdvert.pause")}
          </button>
        </div>

        <IncomingRequests listing={listing} />

        <form
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
          className="space-y-5"
        >
          <Field label={t("myAdvert.form.name")} value={name} onChange={setName} required />
          <LocationSelect value={town} onChange={setTown} required />

          <div>
            <h2 className="osc-heading text-xl">{t("myAdvert.form.skillsTitle")}</h2>
            <p className="text-sm text-brand-dark/60 mt-1 mb-3">
              {t("myAdvert.form.skillsSubtitle")}
            </p>
            <SkillExperienceEditor entries={entries} onChange={setEntries} />
          </div>


          <div>
            <Label>{t("myAdvert.form.availability")}</Label>
            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl bg-white"
            >
              <option value="">{t("myAdvert.form.availabilityPlaceholder")}</option>
              {AVAILABILITY_OPTIONS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label required>{t("myAdvert.form.description")}</Label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              spellCheck
              className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl"
            />
          </div>

          <div>
            <Label>{t("myAdvert.form.photoUrl")}</Label>
            <input
              type="url"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder={t("myAdvert.form.photoUrlPlaceholder")}
              className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl"
            />
            <p className="text-xs text-brand-dark/60 mt-1">{t("myAdvert.form.photoUrlHelp")}</p>
          </div>

          <div>
            <Label required>{t("myAdvert.form.phone")}</Label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl"
            />
            <p className="text-xs text-brand-dark/60 mt-1">
              {t("myAdvert.form.phoneHelp")}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3.5 rounded-xl bg-brand-primary text-white font-medium disabled:opacity-60"
            >
              {saving ? t("myAdvert.form.saving") : t("myAdvert.form.save")}
            </button>
            {publicUrl && (
              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="sm:hidden inline-flex justify-center items-center gap-1.5 py-3.5 rounded-xl border border-brand-dark/15 text-sm"
              >
                <ExternalLink className="size-4" /> {t("myAdvert.form.previewMobile")}
              </a>
            )}
          </div>
        </form>

        <div className="mt-10 pt-6 border-t border-brand-dark/10 flex flex-wrap gap-2">
          {listing.is_archived ? (
            <button
              type="button"
              onClick={async () => {
                const { error } = await supabase.rpc("noticeboard_my_reactivate");
                if (error) return toast.error(error.message);
                toast.success(t("myAdvert.toasts.reactivated"));
                refetch();
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50 text-sm"
            >
              <Eye className="size-4" /> {t("myAdvert.reactivate")}
            </button>
          ) : (
            <button
              type="button"
              onClick={async () => {
                if (
                  !confirm(t("myAdvert.archiveConfirm"))
                )
                  return;
                const { error } = await supabase.rpc("noticeboard_my_archive");
                if (error) return toast.error(error.message);
                toast.success(t("myAdvert.toasts.archived"));
                refetch();
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-brand-dark/15 text-brand-dark/80 hover:bg-brand-soft text-sm"
            >
              <EyeOff className="size-4" /> {t("myAdvert.archive")}
            </button>
          )}
        </div>

        <div className="mt-6 p-5 rounded-2xl border border-red-200 bg-red-50/50">
          <h2 className="font-heading font-bold text-red-800 mb-1">{t("myAdvert.deleteSection.title")}</h2>
          <p className="text-sm text-red-900/80 mb-4">
            <Trans i18nKey="myAdvert.deleteSection.body" components={{ bold: <strong /> }} />
          </p>
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium"
          >
            <Trash2 className="size-4" /> {t("myAdvert.deleteSection.button")}
          </button>
        </div>

        {confirmDelete && (
          <div
            className="fixed inset-0 z-50 bg-black/40 grid place-items-center p-4"
            role="dialog"
            aria-modal="true"
          >
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
              <h2 className="osc-heading text-xl mb-2">
                {t("myAdvert.deleteDialog.title")}
              </h2>
              <p className="text-brand-dark/70 mb-4">
                <Trans i18nKey="myAdvert.deleteDialog.body" components={{ bold: <strong /> }} />
              </p>
              <label className="flex items-start gap-2.5 text-sm mb-6 cursor-pointer">
                <input
                  type="checkbox"
                  checked={deleteAck}
                  onChange={(e) => setDeleteAck(e.target.checked)}
                  className="mt-1 size-4"
                />
                <span>{t("myAdvert.deleteDialog.ack")}</span>
              </label>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setConfirmDelete(false);
                    setDeleteAck(false);
                  }}
                  className="px-4 py-2 rounded-lg border border-brand-dark/15 text-sm"
                >
                  {t("myAdvert.deleteDialog.cancel")}
                </button>
                <button
                  type="button"
                  disabled={!deleteAck}
                  onClick={() => {
                    setConfirmDelete(false);
                    setDeleteAck(false);
                    deleteListing();
                  }}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm disabled:opacity-40"
                >
                  {t("myAdvert.deleteDialog.confirm")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SiteLayout>
  );
}

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-medium text-brand-dark mb-1">
      {children}
      {required && <span className="text-destructive ml-0.5">*</span>}
    </label>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: string;
}) {
  return (
    <div>
      <Label required={required}>{label}</Label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        spellCheck={["text", "search"].includes(type)}
        className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl"
      />
    </div>
  );
}

type IncomingRow = {
  id: string;
  requester_name: string;
  requester_contact: string;
  message: string | null;
  status: "pending" | "approved" | "declined";
  created_at: string;
  decided_at: string | null;
};

function IncomingRequests({ listing }: { listing: MyListing }) {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["incoming-requests"],
    queryFn: async (): Promise<IncomingRow[]> => {
      const { data, error } = await supabase.rpc("noticeboard_my_incoming_requests");
      if (error) throw error;
      return (data ?? []) as IncomingRow[];
    },
    refetchInterval: 30000,
  });

  async function decide(id: string, decision: "approved" | "declined") {
    const whatsappWindow = window.open("about:blank", "_blank");
    const { error } = await supabase.rpc("noticeboard_my_decide", {
      _request_id: id,
      _decision: decision,
    });
    if (error) {
      whatsappWindow?.close();
      toast.error(error.message);
      return;
    }
    const row = rows.find((r) => r.id === id);
    if (row?.requester_contact) {
      const message =
        decision === "approved"
          ? approvedContactMessage(listing.name, listing.phone)
          : declinedContactMessage(listing.name);
      openWhatsAppMessage(row.requester_contact, message, whatsappWindow);
      toast.success(
        decision === "approved"
          ? t("myAdvert.incoming.approvedWhatsappToast")
          : t("myAdvert.incoming.declinedWhatsappToast"),
      );
    } else {
      whatsappWindow?.close();
      toast.success(decision === "approved" ? t("myAdvert.incoming.approvedToast") : t("myAdvert.incoming.declinedToast"));
    }
    qc.invalidateQueries({ queryKey: ["incoming-requests"] });
  }

  const rows = data ?? [];

  return (
    <section className="mb-8">
      <h2 className="osc-heading text-xl mb-3">{t("myAdvert.incoming.title")}</h2>
      {isLoading ? (
        <div className="text-sm text-brand-dark/60">{t("myAdvert.incoming.loading")}</div>
      ) : rows.length === 0 ? (
        <div className="p-5 rounded-2xl border border-dashed border-brand-dark/15 text-sm text-brand-dark/60 text-center">
          {t("myAdvert.incoming.empty")}
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => {
            const date = new Date(r.created_at).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            });
            return (
              <li key={r.id} className="p-4 rounded-2xl border border-brand-dark/10 bg-white">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{r.requester_name}</div>
                    <div className="text-xs text-brand-dark/50">{t("myAdvert.incoming.requested", { date })}</div>
                    {r.message && (
                      <p className="text-sm text-brand-dark/70 mt-2 whitespace-pre-line">
                        {r.message}
                      </p>
                    )}
                  </div>
                  {r.status !== "pending" && (
                    <span
                      className={
                        "text-xs px-2.5 py-1 rounded-full shrink-0 " +
                        (r.status === "approved"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-red-100 text-red-800")
                      }
                    >
                      {r.status === "approved" ? t("myAdvert.incoming.approved") : t("myAdvert.incoming.declined")}
                    </span>
                  )}
                </div>
                {r.status === "pending" && (
                  <div className="flex gap-2 mt-4">
                    <button
                      type="button"
                      onClick={() => decide(r.id, "approved")}
                      className="flex-1 px-3 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium"
                    >
                      {t("myAdvert.incoming.approveWhatsapp")}
                    </button>
                    <button
                      type="button"
                      onClick={() => decide(r.id, "declined")}
                      className="flex-1 px-3 py-2.5 rounded-xl border border-red-200 text-red-700 text-sm font-medium"
                    >
                      {t("myAdvert.incoming.declineWhatsapp")}
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
