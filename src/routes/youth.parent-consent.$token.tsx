import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { HineniDisclaimer } from "@/components/site/HineniDisclaimer";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, Loader2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/youth/parent-consent/$token")({
  head: () => ({
    meta: [
      { title: "Parent / Guardian Consent — Hineni" },
      { name: "description", content: "Secure parent or guardian consent page for Hineni Youth Hub registrations." },
    ],
  }),
  component: ParentConsentPage,
});

type Lookup = {
  applicant_first_name: string;
  applicant_full_name: string;
  parent_full_name: string | null;
  parent_consent_status: string;
  parent_consent_signed_at: string | null;
};

function ParentConsentPage() {
  const { token } = Route.useParams();
  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState<Lookup | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.rpc("lookup_parent_consent" as never, { _token: token } as never);
      if (error || !data || (data as Lookup[]).length === 0) {
        setInfo(null);
      } else {
        setInfo((data as Lookup[])[0]);
      }
      setLoading(false);
    })();
  }, [token]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const signature = (fd.get("signature") as string).trim();
    const parent_name = (fd.get("parent_name") as string).trim();
    const relationship = (fd.get("relationship") as string).trim();
    const phone = (fd.get("phone") as string).trim();
    const email = (fd.get("email") as string).trim();
    const declaration = fd.get("declaration") === "on";

    if (!declaration) {
      toast.error("Please confirm the declaration.");
      setSubmitting(false);
      return;
    }
    if (!signature || signature.toLowerCase() !== parent_name.toLowerCase()) {
      toast.error("Type your full name in the signature field exactly as above.");
      setSubmitting(false);
      return;
    }

    const { error } = await supabase.rpc("submit_parent_consent" as never, {
      _token: token,
      _parent_name: parent_name,
      _relationship: relationship,
      _phone: phone,
      _email: email,
      _signature: signature,
    } as never);

    if (error) {
      toast.error(error.message);
      setSubmitting(false);
      return;
    }
    setDone(true);
    setSubmitting(false);
  }

  if (loading) {
    return (
      <SiteLayout>
        <div className="max-w-md mx-auto py-24 text-center text-brand-dark/60">
          <Loader2 className="size-6 animate-spin mx-auto" />
        </div>
      </SiteLayout>
    );
  }

  if (!info) {
    return (
      <SiteLayout>
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <ShieldAlert className="size-12 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-heading font-bold mb-2">Invalid or expired link</h1>
          <p className="text-brand-dark/70 mb-6">
            This consent link is not valid. Please ask the young person to share the original email or contact Hineni.
          </p>
          <Link to="/" className="px-4 py-2 rounded-xl bg-brand-primary text-white">Back home</Link>
        </div>
      </SiteLayout>
    );
  }

  if (done || info.parent_consent_signed_at) {
    return (
      <SiteLayout>
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <CheckCircle2 className="size-14 text-brand-primary mx-auto mb-4" />
          <h1 className="text-2xl font-heading font-bold mb-2">Consent received</h1>
          <p className="text-brand-dark/70 mb-6">
            Thank you. {info.applicant_first_name}'s registration will be reviewed by a Hineni coordinator.
          </p>
          <Link to="/" className="px-4 py-2 rounded-xl bg-brand-primary text-white">Back home</Link>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <h1 className="text-3xl font-heading font-bold mb-2">Parent / Guardian Consent</h1>
        <p className="text-brand-dark/70 mb-6">
          You are being asked to consent to <strong>{info.applicant_full_name}</strong> registering on the
          Hineni Youth Opportunities Hub.
        </p>

        <div className="mb-6">
          <HineniDisclaimer />
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-brand-dark/10 rounded-2xl p-6 space-y-5">
          <Field name="parent_name" label="Your full name" required />
          <Field name="relationship" label="Relationship to applicant" required placeholder="e.g. Mother, Father, Guardian" />
          <div className="grid sm:grid-cols-2 gap-4">
            <Field name="phone" label="Mobile number" required type="tel" />
            <Field name="email" label="Email" type="email" />
          </div>

          <label className="flex items-start gap-2 text-sm p-3 bg-brand-soft rounded-xl">
            <input type="checkbox" name="declaration" className="mt-1 accent-brand-primary" required />
            <span>
              I confirm I am the parent or legal guardian of {info.applicant_full_name}. I consent to their
              registration on the Hineni Youth Opportunities Hub. I understand Hineni acts solely as a
              facilitator and does not guarantee placements, conduct, or outcomes.
            </span>
          </label>

          <div>
            <label className="text-sm font-medium text-brand-dark/80 mb-1.5 block">
              Digital signature (re-type your full name) <span className="text-destructive">*</span>
            </label>
            <input
              name="signature"
              required
              className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl bg-white font-serif italic"
              placeholder="Your full name"
            />
            <p className="text-xs text-brand-dark/50 mt-1">
              Signed on {new Date().toLocaleDateString()}.
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-primary text-white font-medium hover:brightness-110 disabled:opacity-60"
          >
            {submitting && <Loader2 className="size-4 animate-spin" />}
            Submit consent
          </button>
        </form>
      </div>
    </SiteLayout>
  );
}

function Field({
  name, label, type = "text", required, placeholder,
}: { name: string; label: string; type?: string; required?: boolean; placeholder?: string }) {
  return (
    <div>
      <label className="text-sm font-medium text-brand-dark/80 mb-1.5 block">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full px-4 py-3 border border-brand-dark/10 rounded-xl bg-white"
      />
    </div>
  );
}
