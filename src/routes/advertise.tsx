import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ShortNotice } from "@/components/site/ShortNotice";
import { PageHeader } from "@/components/site/PageHeader";
import { LocationSelect } from "@/components/site/LocationSelect";
import { supabase } from "@/integrations/supabase/client";
import { AVAILABILITY_OPTIONS } from "@/lib/noticeboard";
import { useLabels } from "@/i18n/labels";
import {
  SkillExperienceEditor,
  entriesToPayload,
  newSkillEntry,
  type SkillEntry,
} from "@/components/site/SkillExperienceEditor";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";


export const Route = createFileRoute("/advertise")({
  head: () => ({
    meta: [
      { title: "Advertise My Services — Overberg Skills Connect" },
      {
        name: "description",
        content:
          "Post a free noticeboard listing for your skills. Your phone number stays private until you approve a request.",
      },
    ],
  }),
  component: Advertise,
});

function Advertise() {
  const { t } = useTranslation();
  const { availabilityLabel } = useLabels();
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [hasListing, setHasListing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [entries, setEntries] = useState<SkillEntry[]>([newSkillEntry()]);
  const [town, setTown] = useState("");
  const [acks, setAcks] = useState({
    age: false,
    truthful: false,
    terms: false,
    noticeboard: false,
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!mounted) return;
      if (!sess.session) {
        setSignedIn(false);
        setAuthChecked(true);
        return;
      }
      setSignedIn(true);
      const { data } = await supabase.rpc("noticeboard_my_listing");
      const existing = Array.isArray(data) ? data[0] : data;
      if (mounted) {
        setHasListing(!!existing);
        setAuthChecked(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!acks.age || !acks.truthful || !acks.terms || !acks.noticeboard) {
      toast.error(t("advertiseForm.toasts.confirmAll"));
      return;
    }
    const skillExperience = entriesToPayload(entries);
    if (skillExperience.length === 0) {
      toast.error(t("advertiseForm.toasts.addOneSkill"));
      return;
    }
    if (skillExperience.some((s) => !s.experience_level)) {
      toast.error(t("advertiseForm.toasts.chooseExperience"));
      return;
    }
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const finalSkills = skillExperience.map((s) => s.skill);
    const payload = {
      name: String(fd.get("name") || "").trim(),
      town: town.trim(),
      phone: String(fd.get("phone") || "").trim(),
      description: String(fd.get("description") || "").trim(),
      availability: String(fd.get("availability") || "").trim() || null,
      skills: finalSkills,
      skill_experience: skillExperience,
      category: finalSkills[0] ?? null,
      accepted_terms: true,
    };

    if (!payload.name || !payload.town || !payload.phone || !payload.description) {
      setSubmitting(false);
      toast.error(t("advertiseForm.toasts.completeRequired"));
      return;
    }

    const { error } = await supabase.rpc("noticeboard_my_create", {
      _payload: payload,
    });

    setSubmitting(false);
    if (error) {
      toast.error(error.message ?? t("advertiseForm.toasts.publishError"));
      return;
    }
    toast.success(t("advertiseForm.toasts.published"));
    navigate({ to: "/my-advert" });
  }


  if (!authChecked) {
    return (
      <SiteLayout>
        <div className="max-w-xl mx-auto px-4 py-20 text-center text-brand-dark/60">
          <Loader2 className="size-6 animate-spin mx-auto" />
        </div>
      </SiteLayout>
    );
  }

  if (!signedIn) {
    return (
      <SiteLayout>
        <div className="max-w-xl mx-auto px-4 sm:px-6 py-16 text-center">
          <div className="text-5xl mb-4" aria-hidden>
            👋
          </div>
          <h1 className="osc-heading text-3xl mb-3">{t("advertiseForm.signIn.heading")}</h1>
          <p className="text-brand-dark/70 mb-8">
            {t("advertiseForm.signIn.body")}
          </p>
          <Link
            to="/auth"
            search={{ next: "/advertise" } as never}
            className="osc-btn osc-btn-primary px-6 py-3.5"
          >
            {t("advertiseForm.signIn.cta")}
          </Link>
        </div>
      </SiteLayout>
    );
  }

  if (hasListing) {
    return (
      <SiteLayout>
        <div className="max-w-xl mx-auto px-4 sm:px-6 py-16 text-center">
          <div className="text-5xl mb-4" aria-hidden>
            ✅
          </div>
          <h1 className="osc-heading text-3xl mb-3">{t("advertiseForm.hasListing.heading")}</h1>
          <p className="text-brand-dark/70 mb-8">
            {t("advertiseForm.hasListing.body")}
          </p>
          <Link
            to="/my-advert"
            className="osc-btn osc-btn-primary px-6 py-3.5"
          >
            {t("advertiseForm.hasListing.cta")}
          </Link>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="osc-container py-10 sm:py-14">
        <PageHeader
          eyebrow={t("advertiseForm.header.eyebrow")}
          title={t("advertiseForm.header.title")}
          intro={t("advertiseForm.header.intro")}
        />
        <ShortNotice className="mb-8" />

        <form onSubmit={onSubmit} className="space-y-5 max-w-2xl">
          <Field label={t("advertiseForm.fields.name")} name="name" required />
          <LocationSelect value={town} onChange={setTown} required />

          <div>
            <h2 className="osc-heading text-xl">{t("advertiseForm.fields.skillsHeading")}</h2>
            <p className="text-sm text-brand-dark/60 mt-1 mb-3">
              {t("advertiseForm.fields.skillsHelp")}
            </p>
            <SkillExperienceEditor entries={entries} onChange={setEntries} />
          </div>


          <div>
            <Label>{t("advertiseForm.fields.availability")}</Label>
            <select
              name="availability"
              className="osc-input"
            >
              <option value="">{t("advertiseForm.fields.selectPlaceholder")}</option>
              {AVAILABILITY_OPTIONS.map((a) => (
                <option key={a} value={a}>
                  {availabilityLabel(a)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label required>{t("advertiseForm.fields.description")}</Label>
            <textarea
              name="description"
              required
              rows={4}
              placeholder={t("advertiseForm.fields.descriptionPlaceholder")}
              className="osc-input"
              spellCheck="true"
            />
          </div>


          <Field
            label={t("advertiseForm.fields.phone")}
            name="phone"
            type="tel"
            required
            placeholder={t("advertiseForm.fields.phonePlaceholder")}
            help={t("advertiseForm.fields.phoneHelp")}
          />

          <div className="space-y-3 p-5 osc-panel">
            <p className="text-sm font-semibold">{t("advertiseForm.acks.heading")}</p>
            <Ack
              checked={acks.age}
              onChange={(v) => setAcks((a) => ({ ...a, age: v }))}
              label={t("advertiseForm.acks.age")}
            />
            <Ack
              checked={acks.truthful}
              onChange={(v) => setAcks((a) => ({ ...a, truthful: v }))}
              label={t("advertiseForm.acks.truthful")}
            />
            <Ack
              checked={acks.terms}
              onChange={(v) => setAcks((a) => ({ ...a, terms: v }))}
              label={
                <>
                  {t("advertiseForm.acks.termsPrefix")}{" "}
                  <Link to="/terms" className="underline">
                    {t("advertiseForm.acks.termsLink")}
                  </Link>{" "}
                  {t("advertiseForm.acks.and")}{" "}
                  <Link to="/privacy" className="underline">
                    {t("advertiseForm.acks.privacyLink")}
                  </Link>
                  .
                </>
              }
            />
            <Ack
              checked={acks.noticeboard}
              onChange={(v) => setAcks((a) => ({ ...a, noticeboard: v }))}
              label={t("advertiseForm.acks.noticeboard")}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-xl bg-brand-primary text-white font-medium disabled:opacity-60"
          >
            {submitting ? t("advertiseForm.submit.publishing") : t("advertiseForm.submit.publish")}
          </button>
        </form>
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
  name,
  type = "text",
  required,
  placeholder,
  help,
  min,
  max,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  help?: string;
  min?: number;
  max?: number;
}) {
  return (
    <div>
      <Label required={required}>{label}</Label>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        min={min}
        max={max}
        spellCheck={!type || ["text", "search", "email"].includes(type)}
        className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl"
      />
      {help && <p className="text-xs text-brand-dark/60 mt-1">{help}</p>}
    </div>
  );
}

function Ack({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: React.ReactNode;
}) {
  return (
    <label className="flex items-start gap-2.5 text-sm text-brand-dark cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 size-4"
      />
      <span>{label}</span>
    </label>
  );
}
