import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { Briefcase, MapPin, Calendar, Loader2 } from "lucide-react";

export const Route = createFileRoute("/apprenticeships/opportunities")({
  head: () => ({
    meta: [
      { title: "Apprenticeship Opportunities — Hineni" },
      { name: "description", content: "Browse approved apprenticeship and work-experience opportunities across the Overberg." },
    ],
  }),
  component: Opportunities,
});

type Opportunity = {
  id: string;
  title: string;
  industry: string;
  skills_offered: string[];
  placements_available: number;
  paid: boolean;
  stipend_amount: number | null;
  duration: string | null;
  start_date: string | null;
  min_age: number | null;
  description: string | null;
  town: string | null;
  status: string;
};

function Opportunities() {
  const [items, setItems] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("apprenticeship_opportunities_public" as never)
        .select("*")
        .order("created_at", { ascending: false });
      setItems((data as Opportunity[] | null) ?? []);
      setLoading(false);
    })();
  }, []);

  const filtered = items.filter((o) => {
    if (!q) return true;
    const s = q.toLowerCase();
    return (
      o.title.toLowerCase().includes(s) ||
      o.industry.toLowerCase().includes(s) ||
      (o.town?.toLowerCase().includes(s) ?? false) ||
      o.skills_offered.some((k) => k.toLowerCase().includes(s))
    );
  });

  return (
    <SiteLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-heading font-bold">Apprenticeship Opportunities</h1>
            <p className="text-brand-dark/70 mt-2">All opportunities are vetted by Hineni before being listed.</p>
          </div>
          <Link
            to="/apprenticeships/register-apprentice"
            className="px-5 py-2.5 rounded-full bg-brand-primary text-white text-sm font-medium hover:brightness-110"
          >
            Register as an apprentice
          </Link>
        </div>

        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by title, industry, town or skill…"
          className="w-full mb-6 px-4 py-3 border border-brand-dark/10 rounded-xl bg-white"
        />

        {loading ? (
          <div className="py-20 text-center text-brand-dark/50"><Loader2 className="size-6 animate-spin inline" /></div>
        ) : filtered.length === 0 ? (
          <div className="bg-brand-soft/50 rounded-2xl p-10 text-center text-brand-dark/70">
            No opportunities to show yet. Check back soon.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {filtered.map((o) => (
              <article key={o.id} className="bg-white rounded-2xl p-5 border border-brand-dark/10">
                <div className="flex items-start gap-3 mb-2">
                  <Briefcase className="size-5 text-brand-primary mt-1" />
                  <div>
                    <h2 className="font-heading text-lg font-semibold">{o.title}</h2>
                    <div className="text-xs text-brand-dark/60">{o.industry}</div>
                  </div>
                </div>
                {o.description && <p className="text-sm text-brand-dark/75 mb-3">{o.description}</p>}
                <ul className="text-xs text-brand-dark/70 space-y-1 mb-3">
                  {o.town && <li className="flex items-center gap-1.5"><MapPin className="size-3.5" /> {o.town}</li>}
                  {o.duration && <li className="flex items-center gap-1.5"><Calendar className="size-3.5" /> {o.duration}</li>}
                  <li>{o.paid ? `Paid${o.stipend_amount ? ` — R${o.stipend_amount}` : ""}` : "Unpaid placement"}</li>
                  <li>{o.placements_available} placement{o.placements_available === 1 ? "" : "s"} available</li>
                  {o.min_age && <li>Minimum age: {o.min_age}</li>}
                </ul>
                {o.skills_offered.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {o.skills_offered.slice(0, 6).map((s) => (
                      <span key={s} className="text-[11px] px-2 py-0.5 rounded-full bg-brand-soft text-brand-dark/70">{s}</span>
                    ))}
                  </div>
                )}
                <Link
                  to="/apprenticeships/register-apprentice"
                  className="text-sm text-brand-primary font-medium hover:underline"
                >
                  Apply via Hineni →
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
