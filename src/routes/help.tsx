import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "Need Help? — Overberg Skills Connect" },
      {
        name: "description",
        content:
          "Simple, step-by-step help for advertising your skills and finding local help on Overberg Skills Connect.",
      },
      { property: "og:title", content: "Need Help? — Overberg Skills Connect" },
      {
        property: "og:description",
        content: "Plain-language help for using the Overberg Skills Connect noticeboard.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HelpPage,
});

// Set these when support contact details are confirmed.
const SUPPORT_EMAIL: string | null = null;
const SUPPORT_PHONE: string | null = null;

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="size-7 shrink-0 rounded-full bg-brand-primary text-white grid place-items-center text-sm font-bold">
        {n}
      </span>
      <span className="pt-0.5 text-brand-dark/80">{children}</span>
    </li>
  );
}

function HelpPage() {
  return (
    <SiteLayout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <h1 className="text-3xl sm:text-4xl font-heading font-bold mb-3">
          Need help using Overberg Skills Connect?
        </h1>
        <p className="text-brand-dark/70 mb-8">
          Here is how it works, step by step.
        </p>

        <section className="rounded-2xl border border-brand-dark/10 bg-white p-5 sm:p-6 mb-6">
          <h2 className="text-xl font-heading font-bold mb-4">How to advertise your skills</h2>
          <ol className="space-y-3 text-base">
            <Step n={1}>Create a free account.</Step>
            <Step n={2}>Choose the skills you offer.</Step>
            <Step n={3}>Add your area and contact number.</Step>
            <Step n={4}>Publish your listing.</Step>
            <Step n={5}>
              Your telephone number stays private until you approve someone&apos;s request.
            </Step>
          </ol>
          <Link
            to="/advertise"
            className="mt-5 inline-block w-full sm:w-auto text-center px-5 py-3.5 rounded-xl bg-brand-primary text-white font-semibold"
          >
            Advertise My Skills
          </Link>
        </section>

        <section className="rounded-2xl border border-brand-dark/10 bg-white p-5 sm:p-6 mb-6">
          <h2 className="text-xl font-heading font-bold mb-4">How to find someone</h2>
          <ol className="space-y-3 text-base">
            <Step n={1}>Search for the help you need.</Step>
            <Step n={2}>Choose a service provider.</Step>
            <Step n={3}>Request their contact details.</Step>
            <Step n={4}>The service provider decides whether to share their number.</Step>
            <Step n={5}>
              If they accept, the Call and WhatsApp options will appear in My Profile.
            </Step>
          </ol>
          <Link
            to="/find-help"
            className="mt-5 inline-block w-full sm:w-auto text-center px-5 py-3.5 rounded-xl bg-brand-primary text-white font-semibold"
          >
            Find Local Help
          </Link>
        </section>

        <section className="rounded-2xl border border-brand-dark/10 bg-brand-soft/60 p-5 sm:p-6">
          <h2 className="text-xl font-heading font-bold mb-2">Still stuck?</h2>
          <p className="text-brand-dark/75 text-base">
            If you cannot create an account or publish your listing, you can ask a person for help.
          </p>
          {SUPPORT_EMAIL || SUPPORT_PHONE ? (
            <ul className="mt-3 space-y-2 text-base">
              {SUPPORT_EMAIL && (
                <li>
                  <a className="text-brand-primary underline" href={`mailto:${SUPPORT_EMAIL}`}>
                    {SUPPORT_EMAIL}
                  </a>
                </li>
              )}
              {SUPPORT_PHONE && (
                <li>
                  <a className="text-brand-primary underline" href={`tel:${SUPPORT_PHONE}`}>
                    {SUPPORT_PHONE}
                  </a>
                </li>
              )}
            </ul>
          ) : (
            <p className="mt-3 text-brand-dark/70 text-sm">
              Support contact details will be published here shortly. In the meantime, please use
              the contact page.
            </p>
          )}
          <Link
            to="/contact"
            className="mt-4 inline-block w-full sm:w-auto text-center px-5 py-3.5 rounded-xl border border-brand-dark/15 bg-white font-semibold hover:bg-brand-soft"
          >
            Contact Us
          </Link>
        </section>
      </div>
    </SiteLayout>
  );
}
