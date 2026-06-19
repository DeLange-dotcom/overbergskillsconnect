import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { IP_OWNERSHIP_STATEMENT, PLATFORM_NAME, PLATFORM_OWNER } from "@/lib/brand";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Notice — Khulisa Skills Platform" },
      { name: "description", content: "How we collect, store and protect your information under POPIA on the Khulisa Skills Platform." },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <SiteLayout>
      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16 prose-content">
        <h1 className="text-4xl font-heading font-bold mb-3">Privacy Notice</h1>
        <p className="text-brand-dark/60 mb-10">
          The {PLATFORM_NAME} (owned and operated by {PLATFORM_OWNER}) and its participating
          programmes — including the Hineni Programme — respect your privacy and comply with the
          Protection of Personal Information Act (POPIA).
        </p>

        <Section title="Why we collect your information">
          We collect information so we can safely connect community members with people who need
          their help, and so we can perform reference and background checks.
        </Section>

        <Section title="Who can access your information">
          Only authorised Hineni administrators can view your full registration details, identity
          documents, references and vetting records. Sensitive information is never shown publicly.
        </Section>

        <Section title="How your information will be used">
          Information is used only for the purpose of vetting, registration on the skills register,
          and connecting you with potential work or assistance. Where lawful and necessary, we may
          share information with authorised vetting partners such as police clearance services.
        </Section>

        <Section title="What is never shown publicly">
          ID/passport numbers, full date of birth, physical address, uploaded documents, criminal
          declarations, reference details and vetting notes are <strong>never</strong> shown publicly.
        </Section>

        <Section title="Your rights">
          You can request a copy of the information we hold about you, request corrections, or
          request that we remove your information from the register at any time.
        </Section>

        <Section title="Important">
          Registration does <strong>not</strong> guarantee work. Approval is subject to the checks we
          perform. We may decline applications without giving full reasons.
        </Section>

        <Section title="Contact">
          To exercise any of your rights, or to ask a privacy question, please contact a programme
          coordinator (e.g. the Hineni Programme team) or {PLATFORM_OWNER} directly.
        </Section>

        <Section title="Platform ownership & intellectual property">
          {IP_OWNERSHIP_STATEMENT}
        </Section>
      </article>
    </SiteLayout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-heading font-semibold mb-2">{title}</h2>
      <p className="text-brand-dark/75 leading-relaxed">{children}</p>
    </section>
  );
}
