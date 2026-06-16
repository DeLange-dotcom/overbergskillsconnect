import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ACCEPTANCE_TEXT, TERMS_EFFECTIVE_DATE, TERMS_VERSION } from "@/lib/terms";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Disclaimer — Hineni Skills Register" },
      {
        name: "description",
        content:
          "Important disclaimer and terms of use for applicants, service providers and service seekers on the Hineni Community Skills Register.",
      },
    ],
  }),
  component: Terms,
});

const LIABILITY_ITEMS = [
  "Personal injury",
  "Death",
  "Loss of property",
  "Theft",
  "Fraud",
  "Misrepresentation",
  "Negligence by third parties",
  "Criminal conduct",
  "Workplace disputes",
  "Employment disputes",
  "Immigration or permit issues",
  "Financial losses",
  "Data supplied by applicants",
  "Actions or omissions of service providers",
  "Actions or omissions of service seekers",
  "Any relationship formed through the platform",
];

function Terms() {
  return (
    <SiteLayout>
      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <p className="text-xs uppercase tracking-widest text-brand-dark/50 mb-3">
          Version {TERMS_VERSION} · Effective {TERMS_EFFECTIVE_DATE}
        </p>
        <h1 className="text-4xl sm:text-5xl font-heading font-bold mb-6">
          Terms &amp; Disclaimer
        </h1>

        <div className="bg-brand-soft border-l-4 border-brand-primary rounded-r-xl p-5 mb-10">
          <h2 className="font-heading text-lg font-bold mb-2">IMPORTANT DISCLAIMER</h2>
          <p className="text-brand-dark/80 text-sm">
            Please read these terms carefully. You must accept them before registering, requesting
            a service or contacting a provider on this platform.
          </p>
        </div>

        <Section>
          The Hineni Community Skills Register is a community-based platform intended to help
          connect individuals, households, businesses, farms, churches, charities and other
          organisations with people offering services.
        </Section>

        <Section>
          Hineni may conduct document reviews, reference checks, identity verification and other
          screening activities where possible. However, Hineni does not guarantee the accuracy,
          completeness or authenticity of information supplied by applicants, references,
          employers, third parties or government authorities.
        </Section>

        <Section>
          While reasonable efforts may be made to verify information, Hineni does not warrant or
          guarantee the suitability, competence, conduct, honesty, qualifications, availability,
          legal status or ongoing compliance of any applicant, service provider, employer or
          service seeker.
        </Section>

        <Section>
          Users remain solely responsible for conducting their own assessments, interviews,
          reference checks, supervision, contractual arrangements, safeguarding measures and due
          diligence before engaging any individual or organisation through the platform.
        </Section>

        <h2 className="text-xl font-heading font-semibold mt-10 mb-3">Limitation of liability</h2>
        <p className="text-brand-dark/80 leading-relaxed mb-4">
          To the fullest extent permitted by applicable law, Hineni, its directors, officers,
          employees, volunteers, partners and affiliates shall not be liable for any direct,
          indirect, incidental, consequential or special damages, losses, claims, costs or
          expenses arising from or relating to:
        </p>
        <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5 text-brand-dark/80 text-sm mb-6 pl-5 list-disc">
          {LIABILITY_ITEMS.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
        <p className="text-brand-dark/80 leading-relaxed mb-6">
          Nothing in these terms excludes any liability which cannot legally be excluded under
          applicable law.
        </p>

        <Section>
          Applicants and service seekers acknowledge that participation in the platform is
          voluntary and undertaken at their own risk.
        </Section>

        <h2 className="text-xl font-heading font-semibold mt-10 mb-3">Mandatory acceptance</h2>
        <div className="bg-white border border-brand-dark/10 rounded-2xl p-5 text-sm text-brand-dark/85 italic">
          “{ACCEPTANCE_TEXT}”
        </div>

        <p className="text-xs text-brand-dark/50 mt-10">
          When you accept these terms, we record the date and time, the version accepted, and where
          legally permitted your IP address, as part of our audit log.
        </p>
      </article>
    </SiteLayout>
  );
}

function Section({ children }: { children: React.ReactNode }) {
  return <p className="text-brand-dark/80 leading-relaxed mb-5">{children}</p>;
}
