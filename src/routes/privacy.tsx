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
        <h1 className="osc-heading text-3xl">Privacy Policy</h1>
        <p className="text-sm text-brand-dark/60">Effective date: 4 August 2026</p>

        <Section title="1. Who we are">
          <p>
            {PLATFORM_NAME} ("we", "us") is operated by {PLATFORM_OWNER}, the responsible party for
            the purposes of the Protection of Personal Information Act, 2013 (POPIA).
          </p>
        </Section>

        <Section title="2. What information we collect">
          <ul className="list-disc pl-6 space-y-1">
            <li>Account details such as your email address and sign-in information.</li>
            <li>
              Listing details you provide, including name, town or area, skills, experience,
              availability, description and optional profile photograph.
            </li>
            <li>
              Your telephone or WhatsApp number, stored privately unless you approve a contact
              request.
            </li>
            <li>
              Contact request details, including requester name, contact number, message, status and
              decision date.
            </li>
            <li>
              Reports submitted about listings, including reason, details, reporter account and
              optional contact details.
            </li>
            <li>
              Technical records needed to run and secure the platform, such as timestamps,
              notifications and system logs.
            </li>
          </ul>
          <p>
            Some future sections of the app refer to identity checks, parent consent, references,
            police clearance certificates, work permits, youth programmes or safeguarding records.
            Those sections are not live for this launch. If they are enabled later, this policy must
            be updated before that information is collected.
          </p>
        </Section>

        <Section title="3. Why and how we use it">
          <p>
            We use personal information to operate the skills noticeboard, publish listings, receive
            and manage contact requests, show in-app notifications, handle reports, prevent misuse,
            keep records of user choices, and respond to support, correction or deletion requests.
          </p>
          <p>
            We process this information because it is needed to provide the platform, because users
            consent to specific sharing actions, because we have a legitimate interest in safety and
            abuse prevention, and because South African law may require us to keep or disclose
            certain records.
          </p>
        </Section>

        <Section title="4. Contact details and WhatsApp">
          <p>
            Your telephone number is <strong>never displayed publicly</strong>. It is only shared
            with another user when you explicitly approve their contact request. You can decline any
            request.
          </p>
          <p>
            This launch uses manual WhatsApp links. When a contact request is approved or declined,
            the app may open WhatsApp with a prepared message for the user to review and send.
            WhatsApp messages are handled by WhatsApp/Meta under their own terms and privacy
            policies.
          </p>
        </Section>

        <Section title="5. Sharing with service providers">
          <p>
            We do not sell personal information. We may share limited information with service
            providers who help us operate the platform, such as hosting, authentication, database,
            email, analytics, security or communication services. We may also disclose information
            where required by law, court order, regulator request, or to protect users from harm,
            fraud or abuse.
          </p>
        </Section>

        <Section title="6. Security and retention">
          <p>
            We use access controls, private database rules, secure hosting and administrative
            restrictions to protect personal information. No online system is perfectly secure, so
            users should avoid posting sensitive details in public descriptions.
          </p>
          <p>
            We keep active listing and account records while they are needed to provide the
            platform. Contact request records are reviewed and may be removed after they are no
            longer needed for the contact flow, dispute handling or legal record-keeping. Reviewed
            reports may be retained longer where needed for safety, abuse prevention or compliance.
          </p>
        </Section>

        <Section title="7. Editing or removing your information">
          <p>
            You can hide or unhide your listing from your private management link or account. To
            permanently remove a listing, request deletion, request access to your information, or
            correct your information, contact us using the details on the{" "}
            <Link to="/contact" className="underline">
              Contact Us
            </Link>{" "}
            page.
          </p>
        </Section>

        <Section title="8. Your rights">
          <p>
            Under POPIA you may request access to your personal information, ask us to correct or
            delete it, object to certain processing, withdraw consent where processing depends on
            consent, and complain to the Information Regulator. Contact us first so we can assist.
          </p>
        </Section>

        <Section title="9. Children and special personal information">
          <p>
            The public noticeboard is intended for adults. Users must not submit another person's
            identity documents, medical details, criminal history, child information, or other
            sensitive information unless a live feature specifically asks for it and the required
            consent and safeguards are in place.
          </p>
        </Section>

        <Section title="10. Security incidents">
          <p>
            If we reasonably believe that personal information has been accessed or acquired by an
            unauthorised person, we will assess the incident and take the notification steps
            required by POPIA.
          </p>
        </Section>

        <Section title="11. Contact">
          <p>
            For privacy questions, please use our{" "}
            <Link to="/contact" className="underline">
              Contact Us
            </Link>{" "}
            page. You may also contact the Information Regulator South Africa if you believe your
            POPIA rights have not been respected.
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
