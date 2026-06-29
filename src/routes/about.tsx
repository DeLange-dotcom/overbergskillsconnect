import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PLATFORM_NAME } from "@/lib/brand";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: `About — ${PLATFORM_NAME}` },
      {
        name: "description",
        content:
          "Overberg Skills Connect is a digital community noticeboard connecting local skills with local opportunities. Powered by Khulisa Group.",
      },
    ],
  }),
  component: About,
});

function About() {
  return (
    <SiteLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-6 text-brand-dark/85 leading-relaxed">
        <h1 className="text-3xl font-heading font-bold">About {PLATFORM_NAME}</h1>
        <p>
          {PLATFORM_NAME} is a simple digital community noticeboard that helps people in the
          Overberg connect. People looking for work can advertise their skills, and people
          looking for help can browse local profiles.
        </p>
        <p>
          The platform is provided by <strong>Khulisa Group</strong>. Khulisa Group only
          provides the technology — it is not an employment agency, recruitment company, labour
          broker, vetting organisation, payment platform, employer or guarantor of any user.
        </p>
        <p>
          Users are responsible for carrying out their own checks before entering into any
          arrangement. Please read our{" "}
          <Link to="/terms" className="underline">Terms of Use</Link>,{" "}
          <Link to="/privacy" className="underline">Privacy Policy</Link> and{" "}
          <Link to="/disclaimer" className="underline">Disclaimer</Link>.
        </p>
      </div>
    </SiteLayout>
  );
}
