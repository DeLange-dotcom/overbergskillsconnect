import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Copy } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { DisclaimerBanner } from "@/components/site/DisclaimerBanner";
import { supabase } from "@/integrations/supabase/client";
import { SKILL_CATEGORIES, AVAILABILITY_OPTIONS } from "@/lib/noticeboard";
import { toast } from "sonner";

export const Route = createFileRoute("/advertise")({
  head: () => ({
    meta: [
      { title: "Advertise My Skills — Overberg Skills Connect" },
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
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [otherSkills, setOtherSkills] = useState("");
  const [done, setDone] = useState<{ manageToken: string; publicRef: string | null } | null>(null);
  const [acks, setAcks] = useState({ age: false, truthful: false, terms: false, noticeboard: false });

  const hasOther = skills.includes("Other");

  function toggleSkill(s: string) {
    setSkills((prev) => {
      const next = prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s];
      if (s === "Other" && prev.includes(s)) {
        // deselecting Other – clear the custom text
        setOtherSkills("");
      }
      return next;
    });
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!acks.age || !acks.truthful || !acks.terms || !acks.noticeboard) {
      toast.error("Please confirm all four declarations to publish.");
      return;
    }
    if (skills.length === 0) {
      toast.error("Choose at least one skill.");
      return;
    }
    const customSkills = hasOther
      ? otherSkills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
    if (hasOther && customSkills.length === 0) {
      toast.error("Please specify your skill(s) for the Other option.");
      return;
    }
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    // Replace literal "Other" with the custom values so the array stays searchable
    const finalSkills = [...skills.filter((s) => s !== "Other"), ...customSkills];
    const payload = {
      name: String(fd.get("name") || "").trim(),
      town: String(fd.get("town") || "").trim(),
      phone: String(fd.get("phone") || "").trim(),
      description: String(fd.get("description") || "").trim(),
      availability: String(fd.get("availability") || "").trim() || null,
      years_experience: fd.get("years_experience")
        ? Number(fd.get("years_experience"))
        : null,
      photo_url: String(fd.get("photo_url") || "").trim() || null,
      skills: finalSkills,
      category: finalSkills[0] ?? null,
      accepted_terms: true,
    };

    if (!payload.name || !payload.town || !payload.phone || !payload.description) {
      setSubmitting(false);
      toast.error("Please complete the required fields.");
      return;
    }

    const { data, error } = await supabase.rpc(
      "noticeboard_create_listing" as never,
      { _payload: payload } as never,
    );

    setSubmitting(false);
    if (error || !data) {
      toast.error((error as { message?: string } | null)?.message ?? "Could not publish your listing.");
      return;
    }
    const row = Array.isArray(data) ? data[0] : data;
    setDone({
      manageToken: (row as { manage_token: string }).manage_token,
      publicRef:
        ((row as { public_listing_reference: string | null }).public_listing_reference) ?? null,
    });
  }


  if (done) {
    const manageUrl = `${window.location.origin}/my-listing/${done.manageToken}`;
    const publicUrl = done.publicRef
      ? `${window.location.origin}/profile/${done.publicRef}`
      : null;
    return (
      <SiteLayout>
        <div className="max-w-xl mx-auto px-4 sm:px-6 py-16 text-center">
          <CheckCircle2 className="size-16 text-emerald-600 mx-auto mb-6" />
          <h1 className="text-3xl font-heading font-bold mb-3">Your listing is live</h1>

          {publicUrl && (
            <>
              <p className="text-brand-dark/70 mb-3">
                Share this short link so people can find you on the noticeboard:
              </p>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-white border border-brand-primary/30 mb-2 text-left">
                <code className="text-sm font-medium break-all flex-1">{publicUrl}</code>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(publicUrl);
                    toast.success("Listing link copied");
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand-primary text-white text-sm"
                  aria-label="Copy my listing link"
                >
                  <Copy className="size-4" /> Copy My Listing Link
                </button>
              </div>
              <p className="text-xs text-brand-dark/50 mb-6">Reference: {done.publicRef}</p>
            </>
          )}

          <p className="text-brand-dark/70 mb-3 mt-2">
            Save this <strong>private</strong> link — it lets you manage your listing and approve contact requests.
            Anyone with this link can manage your listing, so keep it safe.
          </p>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-brand-soft border border-brand-dark/10 mb-6 text-left">
            <code className="text-xs break-all flex-1">{manageUrl}</code>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(manageUrl);
                toast.success("Link copied");
              }}
              className="p-2 rounded-lg hover:bg-white"
              aria-label="Copy manage link"
            >
              <Copy className="size-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => navigate({ to: "/my-listing/$token", params: { token: done.manageToken } })}
              className="px-6 py-3 rounded-xl bg-brand-primary text-white"
            >
              Manage my listing
            </button>
            <Link to="/find-help" className="px-6 py-3 rounded-xl border border-brand-dark/15">
              Browse the board
            </Link>
          </div>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <h1 className="text-3xl sm:text-4xl font-heading font-bold mb-3">Advertise my skills</h1>
        <p className="text-brand-dark/70 mb-6">
          Post a free listing on the community noticeboard. Your phone number stays private — it is
          only shared when you approve a request.
        </p>
        <div className="mb-8">
          <DisclaimerBanner />
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <Field label="Name" name="name" required />
          <Field label="Town or area" name="town" required placeholder="e.g. Hermanus" />

          <div>
            <Label required>Skills</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
              {SKILL_CATEGORIES.map((s) => {
                const active = skills.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSkill(s)}
                    className={
                      "px-3 py-2 rounded-xl text-sm border text-left " +
                      (active
                        ? "bg-brand-primary text-white border-brand-primary"
                        : "bg-white border-brand-dark/10 hover:border-brand-primary/40")
                    }
                  >
                    {s}
                  </button>
                );
              })}
            </div>
            <div
              className={
                "grid transition-all duration-300 ease-out " +
                (hasOther
                  ? "grid-rows-[1fr] opacity-100 mt-3"
                  : "grid-rows-[0fr] opacity-0")
              }
            >
              <div className="overflow-hidden">
                <Label required>Please specify your skill(s)</Label>
                <input
                  type="text"
                  value={otherSkills}
                  onChange={(e) => setOtherSkills(e.target.value)}
                  required={hasOther}
                  placeholder="e.g. Upholstery, Drone Operator, Beekeeper, Piano Teacher, Stone Mason..."
                  spellCheck
                  className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl"
                />
                <p className="text-xs text-brand-dark/60 mt-1">
                  Separate multiple skills with commas.
                </p>
              </div>
            </div>
          </div>


          <Field
            label="Years of experience"
            name="years_experience"
            type="number"
            min={0}
            max={70}
          />

          <div>
            <Label>Availability</Label>
            <select
              name="availability"
              className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl bg-white"
            >
              <option value="">Select…</option>
              {AVAILABILITY_OPTIONS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label required>Short description</Label>
            <textarea
              name="description"
              required
              rows={4}
              placeholder="A few sentences about what you do best."
              className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl"
             spellCheck="true" />
          </div>

          <Field
            label="Optional photo URL"
            name="photo_url"
            placeholder="https://…"
            type="url"
          />

          <Field
            label="Telephone number (kept private)"
            name="phone"
            type="tel"
            required
            placeholder="e.g. 082 123 4567"
            help="This is never shown publicly. It is only shared when you approve a contact request."
          />

          <div className="space-y-3 p-5 rounded-2xl border border-brand-dark/10 bg-brand-soft/40">
            <p className="text-sm font-semibold">Before publishing, please confirm:</p>
            <Ack
              checked={acks.age}
              onChange={(v) => setAcks((a) => ({ ...a, age: v }))}
              label="I am over the age of 18."
            />
            <Ack
              checked={acks.truthful}
              onChange={(v) => setAcks((a) => ({ ...a, truthful: v }))}
              label="The information I have provided is true and accurate."
            />
            <Ack
              checked={acks.terms}
              onChange={(v) => setAcks((a) => ({ ...a, terms: v }))}
              label={
                <>
                  I have read and accept the{" "}
                  <Link to="/terms" className="underline">Terms of Use</Link> and{" "}
                  <Link to="/privacy" className="underline">Privacy Policy</Link>.
                </>
              }
            />
            <Ack
              checked={acks.noticeboard}
              onChange={(v) => setAcks((a) => ({ ...a, noticeboard: v }))}
              label="I understand that Overberg Skills Connect is a community noticeboard only and that any arrangements made are entirely between myself and other users."
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-xl bg-brand-primary text-white font-medium disabled:opacity-60"
          >
            {submitting ? "Publishing…" : "Publish my listing"}
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
