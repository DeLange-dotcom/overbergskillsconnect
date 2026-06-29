import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PLATFORM_NAME, PLATFORM_OWNER } from "@/lib/brand";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: `Privacy Policy — ${PLATFORM_NAME}` },
      { name: "description", content: `How ${PLATFORM_NAME} handles your personal information.` },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <SiteLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-6 text-brand-dark/85 leading-relaxed">
        <h1 className="text-3xl font-heading font-bold">Privacy Policy</h1>
        <p className="text-sm text-brand-dark/60">Effective date: 29 June 2026</p>

        <Section title="1. Who we are">
          <p>
            {PLATFORM_NAME} ("we", "us") is operated by {PLATFORM_OWNER}, the responsible party
            for the purposes of the Protection of Personal Information Act, 2013 (POPIA).
          </p>
        </Section>

        <Section title="2. What information we collect">
          <ul className="list-disc pl-6 space-y-1">
            <li>Listing details you provide: name, town/area, skills, experience, availability and short description.</li>
            <li>An optional profile photograph.</li>
            <li>Your telephone number, stored privately.</li>
            <li>Contact request details when you reach out to a listed person, or when someone reaches out to you.</li>
            <li>Basic technical information (such as timestamps) needed to operate the noticeboard.</li>
          </ul>
        </Section>

        <Section title="3. Why we collect it">
          <p>
            We collect this information only to run the noticeboard: to display your listing to
            other community members, to deliver contact requests, and to allow you to manage your
            listing.
          </p>
        </Section>

        <Section title="4. How telephone numbers are handled">
          <p>
            Your telephone number is <strong>never displayed publicly</strong>. It is only shared
            with another user when you explicitly approve their contact request. You can decline
            any request.
          </p>
        </Section>

        <Section title="5. How we store information">
          <p>
            Information is stored securely with our cloud provider. We keep it only for as long as
            your listing is active, and for a reasonable period afterwards for record-keeping.
          </p>
        </Section>

        <Section title="6. Editing or removing your information">
          <p>
            You can hide or unhide your listing at any time from your private management link. To
            permanently remove a listing, request deletion or correct your information, contact us
            using the details on the{" "}
            <Link to="/contact" className="underline">Contact Us</Link> page.
          </p>
        </Section>

        <Section title="7. Sharing with third parties">
          <p>
            We do not sell your information. We may share it with service providers strictly to
            operate the platform (e.g. cloud hosting), or with authorities where required by law.
          </p>
        </Section>

        <Section title="8. Your rights">
          <p>
            Under POPIA you have the right to access, correct, delete or object to the processing
            of your personal information. Contact us to exercise these rights.
          </p>
        </Section>

        <Section title="9. Contact">
          <p>
            For privacy questions, please use our{" "}
            <Link to="/contact" className="underline">Contact Us</Link> page.
          </p>
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
