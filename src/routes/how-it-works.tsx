import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { UserPlus, Search, MessageCircle, ShieldAlert, Settings, Eye, Archive, Trash2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { PLATFORM_NAME } from "@/lib/brand";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: `How It Works — ${PLATFORM_NAME}` },
      { name: "description", content: "Three simple steps to advertise your skills or find local help in the Overberg." },
      { property: "og:title", content: `How ${PLATFORM_NAME} works` },
      { property: "og:description", content: "Advertise your skills or find local help in three simple steps." },
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
          {PLATFORM_NAME} is a simple community noticeboard. Whether you are looking for work or
          looking for help, the process is straightforward.
        </p>

        <div className="grid gap-10 md:grid-cols-2 mb-12">
          <div className="p-6 rounded-2xl bg-brand-soft border border-brand-dark/5">
            <h2 className="font-heading text-xl font-semibold mb-6">I am looking for work</h2>
            <ol className="space-y-8">
              <Card icon={<UserPlus />} title="1. Create your profile">
                Sign up and tell the community what you can do. Add your skills, a short
                description, and the areas you work in. It only takes a few minutes.
              </Card>
              <Card icon={<Search />} title="2. Get discovered">
                Your profile appears in the local directory where people can browse by skill and
                location. No paperwork or approvals needed.
              </Card>
              <Card icon={<MessageCircle />} title="3. Receive contact requests">
                When someone is interested, they send a contact request through the platform. You
                choose whether to share your details. Your private information is never public.
              </Card>
            </ol>
          </div>

          <div className="p-6 rounded-2xl bg-brand-sky/10 border border-brand-dark/5">
            <h2 className="font-heading text-xl font-semibold mb-6">I am looking for help</h2>
            <ol className="space-y-8">
              <Card icon={<Search />} title="1. Browse local skills">
                Search or browse profiles by skill type and town. See what people offer and read
                their descriptions before reaching out.
              </Card>
              <Card icon={<MessageCircle />} title="2. Request contact details">
                Found someone suitable? Send a contact request. They will be notified and can choose
                to share their phone number or email with you.
              </Card>
              <Card icon={<HandshakeIcon />} title="3. Connect directly">
                Once the worker shares their details, you contact each other directly and agree on
                the work. The platform simply made the introduction.
              </Card>
            </ol>
          </div>
        </div>

        <div className="mt-8 flex items-start gap-3 p-4 rounded-2xl border border-brand-dark/10 bg-white">
          <ShieldAlert className="size-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-brand-dark/70 leading-relaxed">
            {PLATFORM_NAME} is a noticeboard only. We do not employ, vet or recommend anyone.
            Please carry out your own checks before entering into any agreement.{" "}
            <Link to="/disclaimer" className="underline hover:text-brand-primary">
              Read the full disclaimer
            </Link>
            .
          </p>
        </div>
      </div>
    </SiteLayout>
  );
}

function Card({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-4">
      <div className="size-10 rounded-full bg-brand-primary/10 text-brand-primary grid place-items-center shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="font-heading text-lg font-semibold mb-1">{title}</h3>
        <p className="text-sm text-brand-dark/70 leading-relaxed">{children}</p>
      </div>
    </li>
  );
}

function HandshakeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-handshake">
      <path d="m11 17 2 2a1 1 0 1 0 3-3"/>
      <path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.55.47a.78.78 0 0 0 .59.18"/>
      <path d="m18.5 2.5 2.5 2.5"/>
      <path d="m2.5 2.5 2.5 2.5"/>
      <path d="m7 8 1 1"/>
      <path d="M2.5 2.5 7 7"/>
      <path d="M18.5 2.5 14 7"/>
    </svg>
  );
}
