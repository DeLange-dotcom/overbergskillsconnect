import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { Award, MapPin, Loader2, ShieldCheck } from "lucide-react";
import { MENTOR_CATEGORIES, MENTOR_FORMATS } from "@/lib/apprenticeships";

export const Route = createFileRoute("/apprenticeships/mentors")({
  head: () => ({
    meta: [
      { title: "Find a Mentor — Hineni" },
      { name: "description", content: "Browse approved mentors across the Overberg. Request an introduction through Hineni." },
    ],
  }),
  component: Mentors,
});

type Mentor = {
  id: string;
  full_name: string;
  town: string | null;
  categories: string[];
  years_experience: number | null;
  professional_background: string | null;
  biography: string | null;
  availability: string | null;
  formats: string[];
  is_knowledge_keeper: boolean;
  knowledge_keeper_categories: string[];
};

function Mentors() {
  const [items, setItems] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState("");
  const [fmt, setFmt] = useState("");
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("mentors_public" as never)
        .select("*")
        .order("created_at", { ascending: false });
      setItems((data as Mentor[] | null) ?? []);
      setLoading(false);
    })();
  }, []);

  const filtered = items.filter((m) => {
    if (cat && !m.categories.includes(cat)) return false;
    if (fmt && !m.formats.includes(fmt)) return false;
    if (q) {
      const s = q.toLowerCase();
      if (
        !m.full_name.toLowerCase().includes(s) &&
        !(m.town?.toLowerCase().includes(s) ?? false) &&
        !(m.professional_background?.toLowerCase().includes(s) ?? false)
      )
        return false;
    }
    return true;
  });

  return (
    <SiteLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-heading font-bold">Find a Mentor</h1>
            <p className="text-brand-dark/70 mt-2">Contact is brokered through Hineni — your details and theirs stay private.</p>
          </div>
          <Link to="/apprenticeships/become-mentor" className="px-5 py-2.5 rounded-full bg-brand-accent text-white text-sm font-medium hover:brightness-110">
            Become a mentor
          </Link>
        </div>

        <div className="grid sm:grid-cols-3 gap-3 mb-6">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, town or background…"
            className="px-4 py-3 border border-brand-dark/10 rounded-xl bg-white"
          />
          <select
            value={cat}
            onChange={(e) => setCat(e.target.value)}
            className="px-4 py-3 border border-brand-dark/10 rounded-xl bg-white"
          >
            <option value="">All categories</option>
            {MENTOR_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={fmt}
            onChange={(e) => setFmt(e.target.value)}
            className="px-4 py-3 border border-brand-dark/10 rounded-xl bg-white"
          >
            <option value="">All formats</option>
            {MENTOR_FORMATS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="py-20 text-center text-brand-dark/50"><Loader2 className="size-6 animate-spin inline" /></div>
        ) : filtered.length === 0 ? (
          <div className="bg-brand-soft/50 rounded-2xl p-10 text-center text-brand-dark/70">
            No mentors to show yet. Become the first.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {filtered.map((m) => (
              <article key={m.id} className="bg-white rounded-2xl p-5 border border-brand-dark/10">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h2 className="font-heading text-lg font-semibold">{m.full_name}</h2>
                  {m.is_knowledge_keeper && (
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide px-2 py-1 rounded-full bg-brand-accent/10 text-brand-accent font-semibold">
                      <Award className="size-3" /> Knowledge Keeper
                    </span>
                  )}
                </div>
                {m.town && <div className="text-xs text-brand-dark/60 flex items-center gap-1 mb-2"><MapPin className="size-3" /> {m.town}</div>}
                {m.professional_background && <p className="text-sm text-brand-dark/75 mb-2">{m.professional_background}</p>}
                {m.biography && <p className="text-sm text-brand-dark/65 line-clamp-3 mb-3">{m.biography}</p>}
                {m.categories.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {m.categories.slice(0, 5).map((c) => (
                      <span key={c} className="text-[11px] px-2 py-0.5 rounded-full bg-brand-soft text-brand-dark/70">{c}</span>
                    ))}
                  </div>
                )}
                <div className="text-xs text-brand-dark/60 mb-3">
                  {m.years_experience ? `${m.years_experience}+ years experience` : null}
                  {m.formats.length > 0 && <> · {m.formats.join(", ")}</>}
                </div>
                <Link to="/request-support" className="text-sm text-brand-primary font-medium hover:underline">
                  Request introduction →
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
