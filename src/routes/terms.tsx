import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PLATFORM_NAME, PLATFORM_OWNER, IP_OWNERSHIP_STATEMENT } from "@/lib/brand";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: `Terms of Use — ${PLATFORM_NAME}` },
      { name: "description", content: `${PLATFORM_NAME} terms of use.` },
    ],
  }),
  component: Terms,
});

function Terms() {
  return (
    <SiteLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-6 text-brand-dark/85 leading-relaxed">
        <h1 className="text-3xl font-heading font-bold">Terms of Use</h1>
        <p className="text-sm text-brand-dark/60">Effective date: 29 June 2026</p>

        <Section title="1. What this platform is">
          <p>
            {PLATFORM_NAME} ("the platform") is a digital community noticeboard owned and operated
            by {PLATFORM_OWNER}. It exists to allow people offering skills and people looking for
            help to find each other in their local community.
          </p>
        </Section>

        <Section title="2. What Khulisa is not">
          <ul className="list-disc pl-6 space-y-1">
            <li>{PLATFORM_NAME} is a community noticeboard only.</li>
            <li>Khulisa is not an employer.</li>
            <li>Khulisa is not a labour broker.</li>
            <li>Khulisa is not a recruitment agency.</li>
            <li>Khulisa does not verify users.</li>
            <li>Khulisa does not verify qualifications.</li>
            <li>Khulisa does not verify experience.</li>
            <li>Khulisa does not verify references.</li>
            <li>Khulisa does not recommend any person.</li>
          </ul>
        </Section>

        <Section title="3. Your responsibilities">
          <p>
            Users are solely responsible for conducting their own checks before entering into any
            agreement. This includes verifying identity, references, qualifications and work
            permits where applicable, and obtaining a police clearance certificate where
            appropriate.
          </p>
          <p>
            Users are responsible for agreeing payment, work conditions and complying with all
            applicable legal obligations, including labour, tax and immigration law.
          </p>
        </Section>

        <Section title="4. Listings and conduct">
          <p>
            You must only post information that is true and accurate, and you must be 18 or older
            to publish a listing. Khulisa may remove listings that breach these Terms, are
            misleading, fraudulent, offensive, illegal, or otherwise inappropriate.
          </p>
        </Section>

        <Section title="5. Privacy and contact details">
          <p>
            Telephone numbers are stored privately and are only shared with another user once you
            have explicitly approved their request. See our{" "}
            <Link to="/privacy" className="underline">Privacy Policy</Link>.
          </p>
        </Section>

        <Section title="6. Limitation of liability">
          <p>
            To the maximum extent permitted by South African law, {PLATFORM_OWNER} accepts no
            liability for any loss, injury, damage, dispute or claim arising from introductions
            made through this platform. See our{" "}
            <Link to="/disclaimer" className="underline">Disclaimer</Link>.
          </p>
        </Section>

        <Section title="7. Intellectual property">
          <p>{IP_OWNERSHIP_STATEMENT}</p>
        </Section>

        <Section title="8. Governing law">
          <p>These Terms are governed by the laws of the Republic of South Africa.</p>
        </Section>
      </div>
    </SiteLayout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-xl font-heading font-semibold">{title}</h2>
      {children}
    </section>
  );
}
