import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/unavailable")({
  validateSearch: (search: Record<string, unknown>) => ({
    feature: typeof search.feature === "string" ? search.feature : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Section not live yet" },
      {
        name: "description",
        content: "This section is not available in the current launch.",
      },
    ],
  }),
  component: Unavailable,
});

function Unavailable() {
  return (
    <SiteLayout>
      <main className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-brand-primary">
          Not live yet
        </p>
        <h1 className="mb-4 font-heading text-3xl font-bold text-brand-dark">
          This section is still being prepared
        </h1>
        <p className="mx-auto mb-8 max-w-xl leading-relaxed text-brand-dark/70">
          For this launch, Overberg SkillsConnect is focused on the public skills noticeboard,
          private contact requests, and profile management. Other sections will open once the
          operational, privacy, and safety processes are ready.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to="/find-help"
            className="rounded-xl bg-brand-primary px-5 py-3 font-medium text-white"
          >
            Find Help
          </Link>
          <Link
            to="/advertise"
            className="rounded-xl border border-brand-dark/15 px-5 py-3 font-medium text-brand-dark"
          >
            Advertise a Skill
          </Link>
        </div>
      </main>
    </SiteLayout>
  );
}
