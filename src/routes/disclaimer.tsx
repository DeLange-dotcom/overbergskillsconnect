import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { DisclaimerBanner } from "@/components/site/DisclaimerBanner";

export const Route = createFileRoute("/disclaimer")({
  head: () => ({
    meta: [
      { title: "Disclaimer — Khulisa Community" },
      {
        name: "description",
        content: "Khulisa Community is a digital community noticeboard only.",
      },
    ],
  }),
  component: DisclaimerPage,
});

function DisclaimerPage() {
  return (
    <SiteLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 prose prose-sm">
        <h1 className="text-3xl font-heading font-bold mb-6">Disclaimer</h1>
        <DisclaimerBanner />
        <div className="mt-8 space-y-4 text-brand-dark/80 leading-relaxed">
          <p>
            Khulisa Community is a digital community noticeboard. It exists only to help people
            offering skills and people looking for help to find each other. We are not a recruiter,
            employer, labour broker, agency or supervisor.
          </p>
          <p>
            We do not vet, verify, recommend or guarantee any person listed on this platform. We
            do not verify identities, qualifications, references, experience, work permits or
            police clearance. We do not confirm the accuracy of any information posted.
          </p>
          <p>
            You are responsible for carrying out your own enquiries before entering into any
            agreement. This includes — but is not limited to — verifying identity documents,
            requesting references, asking for a police clearance certificate where appropriate,
            agreeing payment and working conditions in writing, and complying with all applicable
            laws.
          </p>
          <p>
            Khulisa Group, Khulisa Community and any related parties accept no responsibility for
            any loss, injury, damage, dispute or claim arising from introductions made through this
            platform.
          </p>
          <p className="text-sm text-brand-dark/60">
            See also our{" "}
            <Link to="/terms" className="underline">Terms of Use</Link> and{" "}
            <Link to="/privacy" className="underline">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </SiteLayout>
  );
}
