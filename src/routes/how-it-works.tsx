import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ClipboardList, ShieldCheck, Handshake, Lock } from "lucide-react";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How It Works — Hineni Community Skills Register" },
      { name: "description", content: "Three simple steps: register, vet, connect — safely." },
      { property: "og:title", content: "How Hineni works" },
      { property: "og:description", content: "Three steps to safe community work in the Overberg." },
    ],
  }),
  component: HowItWorks,
});

function HowItWorks() {
  return (
    <SiteLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <h1 className="text-4xl font-heading font-bold mb-4">How it works</h1>
        <p className="text-lg text-brand-dark/70 mb-12">
          Hineni exists to make community work safe and dignified for everyone — both the worker and
          the household.
        </p>

        <ol className="space-y-10">
          <Card icon={<ClipboardList />} title="1. People register their skills">
            Anyone in the Overberg can register. We capture skills, experience, references,
            availability, and the type of work being looked for. Registration takes a few minutes.
          </Card>
          <Card icon={<ShieldCheck />} title="2. Hineni checks documents and references">
            Our team reviews ID and work permits, calls references, and requests police/vetting
            checks where appropriate. Every step is recorded in the applicant's file.
          </Card>
          <Card icon={<Handshake />} title="3. Approved providers are listed">
            Only approved members appear in the public directory — and never with private details
            like ID numbers, addresses or documents.
          </Card>
          <Card icon={<Lock />} title="4. Hineni connects people safely">
            Households, farms, churches and businesses request support through Hineni. We introduce
            both parties only after consent — your private details are never published.
          </Card>
        </ol>

        <div className="mt-12 p-6 rounded-2xl bg-brand-soft border border-brand-dark/5">
          <h2 className="font-heading text-xl font-semibold mb-2">A few important notes</h2>
          <ul className="space-y-2 text-sm text-brand-dark/70 list-disc pl-5">
            <li>Registration does <strong>not</strong> guarantee work — it makes you safely findable.</li>
            <li>Approval is subject to our checks, which can take a few days.</li>
            <li>You can ask us to remove your information at any time.</li>
          </ul>
        </div>
      </div>
    </SiteLayout>
  );
}

function Card({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-5">
      <div className="size-12 rounded-full bg-brand-primary/10 text-brand-primary grid place-items-center shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="font-heading text-xl font-semibold mb-2">{title}</h3>
        <p className="text-brand-dark/70 leading-relaxed">{children}</p>
      </div>
    </li>
  );
}
