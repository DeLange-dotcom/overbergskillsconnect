import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { HINENI_DONATION_URL, PLATFORM_NAME } from "@/lib/brand";
import { PageHeader } from "@/components/site/PageHeader";
import { GraduationCap, HandHeart, Hammer, Sparkles } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: `About — ${PLATFORM_NAME}` },
      {
        name: "description",
        content:
          "Overberg Skills Connect is a Hineni Call community initiative making it easier to share skills, find local help and connect with local opportunity.",
      },
      { property: "og:title", content: `About — ${PLATFORM_NAME}` },
      {
        property: "og:description",
        content:
          "Why Overberg Skills Connect exists, the roles of Hineni Call and Khulisa Group, and what is planned next.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: About,
});

const futureCards = [
  {
    icon: Sparkles,
    title: "Youth Club",
    copy: "A future space for younger people to discover activities, skills development, mentoring and opportunities to become more involved in their communities.",
    tone: "green",
  },
  {
    icon: Hammer,
    title: "Apprenticeships & Mentoring",
    copy: "Connecting people who want to learn with local tradespeople, businesses and experienced community members who can help develop practical skills.",
    tone: "orange",
  },
  {
    icon: GraduationCap,
    title: "Knowledge Guardians",
    copy: "Recognising people who hold valuable practical, traditional and specialist knowledge — and creating opportunities for that knowledge to be shared with the next generation.",
    tone: "navy",
  },
  {
    icon: HandHeart,
    title: "Sponsors",
    copy: "Creating opportunities for businesses, organisations and individuals to support skills development, learning, apprenticeships and community opportunity across the Overberg.",
    tone: "green",
  },
] as const;

const toneStyles = {
  green: "bg-brand-green/12 text-brand-green",
  orange: "bg-brand-orange/15 text-brand-orange",
  navy: "bg-brand-navy/10 text-brand-navy",
} as const;

export default function About() {
  return (
    <SiteLayout>
      {/* 1. Introduction */}
      <section className="px-4 sm:px-6 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <PageHeader
            eyebrow={`About ${PLATFORM_NAME}`}
            title="Connecting local skills with local opportunity"
          />
          <div className="space-y-5 text-base sm:text-lg leading-relaxed text-brand-navy/80">
            <p>
              Overberg Skills Connect is a Hineni Call community initiative created to make it
              easier for people across the Overberg to share their skills, find local help and
              connect with opportunities.
            </p>
            <p>
              Across our communities, people have valuable practical skills, experience and
              knowledge — but finding the right person for a job often still depends on word of
              mouth.
            </p>
            <p>
              At the same time, households, businesses and organisations are often looking for
              people locally who can help.
            </p>
            <p className="font-medium text-brand-navy">
              Overberg Skills Connect brings the two together.
            </p>
            <p>
              People can create a skills profile showing what they can do, while people looking for
              help can search locally and request contact.
            </p>
          </div>
        </div>
      </section>

      {/* 2 + 3. Partnership */}
      <section className="bg-brand-neutral px-4 sm:px-6 py-12 sm:py-16">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Hineni */}
            <div className="osc-card p-6 sm:p-8">
              <span className="osc-eyebrow">Hineni Call</span>
              <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-brand-navy/55">
                Community &amp; Programme
              </p>
              {/* Approved Hineni Call logo asset is not present in the project — position reserved. */}
              <div className="mt-4 flex h-20 items-center justify-center rounded-xl border border-dashed border-brand-navy/15 bg-brand-cream text-xs uppercase tracking-wider text-brand-navy/45">
                Hineni Call logo
              </div>
              <h2 className="osc-heading mt-5 text-2xl">Connecting people and opportunity</h2>
              <div className="mt-3 space-y-3 leading-relaxed text-brand-navy/80">
                <p>
                  Hineni Call is at the heart of the community side of Overberg Skills Connect.
                </p>
                <p>
                  Hineni works directly with communities to encourage participation, help people
                  register their skills, promote opportunities and support the day-to-day community
                  engagement around the platform.
                </p>
                <p>The aim is simple:</p>
                <p className="font-medium text-brand-navy">
                  Make local skills more visible and local opportunity more accessible.
                </p>
              </div>
            </div>

            {/* Khulisa */}
            <div className="osc-card p-6 sm:p-8">
              <span className="osc-eyebrow">Khulisa Group</span>
              <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-brand-navy/55">
                Technology &amp; Development
              </p>
              {/* Approved Khulisa Group logo asset is not present in the project — position reserved. */}
              <div className="mt-4 flex h-20 items-center justify-center rounded-xl border border-dashed border-brand-navy/15 bg-brand-cream text-xs uppercase tracking-wider text-brand-navy/45">
                Khulisa Group logo
              </div>
              <h2 className="osc-heading mt-5 text-2xl">Made possible with Khulisa Group</h2>
              <div className="mt-3 space-y-3 leading-relaxed text-brand-navy/80">
                <p>
                  The Overberg Skills Connect digital platform was developed by Khulisa Group (Pty)
                  Ltd, Hineni Call&apos;s technology and development partner.
                </p>
                <p>
                  Khulisa provides the technology behind Skills Connect and continues to support the
                  development of the platform as it grows.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border-l-4 border-brand-orange bg-brand-cream p-6 text-center">
            <p className="text-lg font-medium text-brand-navy">
              Together, Hineni Call brings the community connection and Khulisa Group provides the
              technology that enables it.
            </p>
            <p className="mt-3 text-sm uppercase tracking-wider text-brand-navy/55">
              Overberg Skills Connect · A Hineni Call initiative · Powered by Khulisa Group
            </p>
          </div>
        </div>
      </section>

      {/* 5 + 6. What's coming next */}
      <section className="px-4 sm:px-6 py-12 sm:py-16">
        <div className="mx-auto max-w-5xl">
          <span className="osc-eyebrow">What&apos;s coming next</span>
          <h2 className="osc-heading mt-2 text-2xl sm:text-3xl">
            Growing beyond the skills directory
          </h2>
          <p className="mt-3 max-w-2xl leading-relaxed text-brand-navy/75">
            Overberg Skills Connect is being developed beyond the current skills directory. Future
            phases are intended to create more ways for people to learn, share knowledge and connect
            with opportunity.
          </p>

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {futureCards.map((card) => (
              <div
                key={card.title}
                className="rounded-2xl border border-brand-navy/10 bg-white p-6 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <span
                    className={`grid size-12 shrink-0 place-items-center rounded-xl ${toneStyles[card.tone]}`}
                    aria-hidden="true"
                  >
                    <card.icon className="size-6" />
                  </span>
                  <span className="rounded-full bg-brand-neutral px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-brand-navy/60">
                    Coming next
                  </span>
                </div>
                <h3 className="osc-heading mt-4 text-xl">{card.title}</h3>
                <p className="mt-2 leading-relaxed text-brand-navy/75">{card.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7 + 8. Support Hineni Call */}
      <section className="bg-brand-navy px-4 sm:px-6 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-green">
            Support Hineni Call
          </span>
          <h2 className="mt-2 font-heading text-2xl sm:text-3xl font-semibold text-brand-cream">
            Help us create more local opportunities
          </h2>
          <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-brand-cream/80">
            Your support helps Hineni Call continue its work connecting people, developing
            opportunities and strengthening communities across the Overberg.
          </p>
          <div className="mt-7">
            {HINENI_DONATION_URL ? (
              <a
                href={HINENI_DONATION_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="osc-btn osc-btn-primary px-7 py-3 text-base"
              >
                Support Hineni Call
              </a>
            ) : (
              <>
                <button
                  type="button"
                  disabled
                  aria-disabled="true"
                  className="osc-btn osc-btn-primary px-7 py-3 text-base opacity-60"
                >
                  Support Hineni Call
                </button>
                <p className="mt-3 text-sm text-brand-cream/70">
                  Hineni Call&apos;s secure donation link will be added here soon.
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* 9. Community platform / safety */}
      <section className="px-4 sm:px-6 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <span className="osc-eyebrow">A community connection platform</span>
          <div className="mt-3 space-y-3 leading-relaxed text-brand-navy/80">
            <p>
              Overberg Skills Connect is a community noticeboard that helps local people offer their
              skills and find local help.
            </p>
            <p>
              It is not an employment or recruitment agency and does not employ, vet, recommend or
              guarantee people listed on the platform.
            </p>
            <p>
              Users should make their own enquiries and checks before agreeing to work or services.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-brand-navy">
            <Link to="/terms" className="font-medium underline underline-offset-4">
              Terms of Use
            </Link>
            <Link to="/privacy" className="font-medium underline underline-offset-4">
              Privacy Policy
            </Link>
            <Link to="/disclaimer" className="font-medium underline underline-offset-4">
              Safety &amp; Disclaimer
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
