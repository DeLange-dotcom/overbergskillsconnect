import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Heart, Search, HelpingHand, UserPlus, ShieldCheck, Handshake, ClipboardList } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Hineni Community Skills Register — Trusted local help in the Overberg" },
      {
        name: "description",
        content:
          "A handshake you can trust. Register your skills, find vetted local help, or support our community vetting work in the Overberg.",
      },
      { property: "og:title", content: "Hineni Community Skills Register" },
      {
        property: "og:description",
        content: "Trusted, vetted local people for households, farms, churches and businesses.",
      },
    ],
  }),
  component: Home,
});

function useImpactStats() {
  return useQuery({
    queryKey: ["impact_stats"],
    queryFn: async () => {
      const { data } = await supabase.from("impact_stats").select("*").maybeSingle();
      return (
        data ?? {
          registered: 0,
          approved: 0,
          requests: 0,
          matches: 0,
          sponsored_checks: 0,
        }
      );
    },
  });
}

function Home() {
  const { data: stats } = useImpactStats();

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="px-4 sm:px-6 pt-10 pb-6 sm:pt-16">
        <div className="max-w-2xl mx-auto text-center">
          <span className="inline-block px-3 py-1 rounded-full bg-brand-soft text-xs uppercase tracking-widest text-brand-primary font-semibold">
            Overberg · Western Cape
          </span>
          <h1 className="mt-5 text-4xl md:text-5xl font-heading font-bold leading-tight text-brand-dark">
            A handshake you can trust in the Overberg.
          </h1>
          <p className="mt-5 text-lg text-brand-dark/70 leading-relaxed">
            We connect skilled community members with households, farms, churches and businesses.
            Every register entry is vetted by Hineni to ensure safety and quality for our community.
          </p>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            <CardCta
              to="/register-provider"
              tag="For Workers"
              tagColor="text-white/80"
              title="Register as Service Provider"
              icon={<UserPlus className="size-5" />}
              variant="primary"
            />
            <CardCta
              to="/find-help"
              tag="For Households"
              tagColor="text-white/80"
              title="Find Approved Help"
              icon={<Search className="size-5" />}
              variant="accent"
            />
            <CardCta
              to="/request-support"
              tag="Need Assistance"
              tagColor="text-brand-primary"
              title="Request Support"
              icon={<HelpingHand className="size-5" />}
              variant="soft"
            />
            <CardCta
              to="/donate"
              tag="Support Us"
              tagColor="text-brand-accent"
              title="Donate to Hineni"
              icon={<Heart className="size-5" />}
              variant="soft"
            />
          </div>
        </div>
      </section>

      {/* Impact stats */}
      <section className="bg-brand-dark text-white py-12 px-6 mt-12">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <Stat label="Registered" value={stats?.registered ?? 0} />
          <Stat label="Approved" value={stats?.approved ?? 0} />
          <Stat label="Requests" value={stats?.requests ?? 0} />
          <Stat label="Matches made" value={stats?.matches ?? 0} />
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-20 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-heading font-bold mb-3">The Hineni Process</h2>
          <p className="text-brand-dark/60 max-w-xl mx-auto">
            We take care of the trust-building so you can focus on the work — or the person you need.
          </p>
        </div>
        <div className="space-y-10">
          <Step n={1} icon={<ClipboardList className="size-5" />} title="Register Interest">
            People register their skills — gardening, childcare, eldercare, farm work and more.
            Sign-up takes just a few minutes online or with a Hineni coordinator.
          </Step>
          <Step n={2} icon={<ShieldCheck className="size-5" />} title="Rigorous Vetting">
            Hineni checks ID, work permits and references, and requests police clearances where
            appropriate. Sensitive information is never shown publicly.
          </Step>
          <Step n={3} icon={<Handshake className="size-5" />} title="Safe Connection">
            Approved providers are listed publicly without private details. Hineni introduces
            households, farms and businesses to the right person — safely.
          </Step>
        </div>
      </section>

      {/* Donation appeal */}
      <section className="px-6 pb-20">
        <div className="max-w-4xl mx-auto bg-brand-soft p-8 sm:p-12 rounded-3xl border border-brand-dark/5">
          <div className="grid md:grid-cols-[1fr_auto] gap-8 items-center">
            <div>
              <span className="inline-block text-xs uppercase tracking-widest text-brand-accent font-semibold">
                Sponsor a Vetting Check
              </span>
              <h2 className="text-2xl sm:text-3xl font-heading font-bold mt-3 mb-4">
                Help us safely approve one more neighbour.
              </h2>
              <p className="text-brand-dark/70 mb-6 max-w-xl">
                Each vetting check costs Hineni around R250 — document review, reference calls, and
                administration. Your donation directly unlocks a neighbour's ability to work safely.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/donate"
                  search={{ amount: 250, purpose: "sponsor_vetting" }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-brand-dark text-white rounded-xl font-medium hover:bg-black transition"
                >
                  <Heart className="size-4" /> Sponsor a Check (R250)
                </Link>
                <Link
                  to="/donate"
                  className="inline-flex items-center px-6 py-3 border border-brand-dark/15 rounded-xl font-medium hover:bg-white transition"
                >
                  Other amounts
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="size-32 rounded-full bg-brand-accent/10 grid place-items-center">
                <Heart className="size-12 text-brand-accent" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div>
      <div className="text-3xl md:text-4xl font-heading font-bold text-brand-accent">{value}</div>
      <div className="text-[10px] uppercase tracking-widest opacity-60 mt-1">{label}</div>
    </div>
  );
}

function Step({
  n,
  icon,
  title,
  children,
}: {
  n: number;
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-5">
      <div className="size-12 rounded-full bg-brand-primary/10 text-brand-primary grid place-items-center shrink-0 font-bold">
        {icon}
      </div>
      <div>
        <div className="text-xs uppercase tracking-widest text-brand-primary/70 font-semibold">
          Step {n}
        </div>
        <h3 className="text-xl font-heading font-semibold mt-1 mb-2">{title}</h3>
        <p className="text-brand-dark/70 leading-relaxed">{children}</p>
      </div>
    </div>
  );
}

function CardCta({
  to,
  tag,
  tagColor,
  title,
  icon,
  variant,
}: {
  to: string;
  tag: string;
  tagColor: string;
  title: string;
  icon: React.ReactNode;
  variant: "primary" | "accent" | "soft";
}) {
  const base = "p-6 rounded-2xl block hover:scale-[1.02] transition-transform";
  const styles =
    variant === "primary"
      ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/10"
      : variant === "accent"
        ? "bg-brand-accent text-white shadow-lg shadow-brand-accent/10"
        : "bg-white border border-brand-dark/10 text-brand-dark hover:bg-brand-soft";

  return (
    <Link to={to} className={`${base} ${styles}`}>
      <div className="flex items-center justify-between">
        <span className={`text-xs font-bold uppercase tracking-wider ${tagColor}`}>{tag}</span>
        <span
          className={`size-9 rounded-full grid place-items-center ${variant === "soft" ? "bg-brand-soft" : "bg-white/15"}`}
        >
          {icon}
        </span>
      </div>
      <div className="mt-4 text-xl font-heading font-semibold">{title}</div>
    </Link>
  );
}
