import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { MapPin, Loader2, Search, Calendar } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { DisclaimerBanner } from "@/components/site/DisclaimerBanner";
import { supabase } from "@/integrations/supabase/client";
import { SKILL_CATEGORIES } from "@/lib/noticeboard";

export const Route = createFileRoute("/find-help")({
  head: () => ({
    meta: [
      { title: "Looking for Someone — Khulisa Community" },
      {
        name: "description",
        content:
          "Browse local people offering services on the Khulisa Community noticeboard. Search by town and skill.",
      },
    ],
  }),
  component: FindHelp,
});

type Row = {
  id: string;
  name: string;
  town: string;
  skills: string[];
  category: string | null;
  years_experience: number | null;
  availability: string | null;
  description: string;
  photo_url: string | null;
  created_at: string;
};

function FindHelp() {
  const [town, setTown] = useState("");
  const [skill, setSkill] = useState("");
  const [q, setQ] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["noticeboard_public"],
    queryFn: async (): Promise<Row[]> => {
      const { data, error } = await supabase
        .from("noticeboard_public")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });

  const filtered = useMemo(() => {
    return (data ?? []).filter((r) => {
      if (town && !r.town.toLowerCase().includes(town.toLowerCase())) return false;
      if (skill && !r.skills.includes(skill)) return false;
      if (q) {
        const hay = `${r.name} ${r.town} ${r.description} ${r.skills.join(" ")}`.toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [data, town, skill, q]);

  return (
    <SiteLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <h1 className="text-3xl sm:text-4xl font-heading font-bold mb-3">Looking for someone</h1>
        <p className="text-brand-dark/70 max-w-2xl mb-6">
          Browse local people offering services. Khulisa Community does not vet or recommend anyone
          — please make your own checks before entering into any agreement.
        </p>

        <div className="mb-6">
          <DisclaimerBanner compact />
        </div>

        <div className="grid sm:grid-cols-3 gap-3 mb-8 p-4 bg-brand-soft rounded-2xl">
          <div>
            <label className="text-xs uppercase tracking-wider text-brand-dark/60">Search</label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-brand-dark/40" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="name, skill, town…"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-white border border-brand-dark/10"
              />
            </div>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-brand-dark/60">Town</label>
            <input
              value={town}
              onChange={(e) => setTown(e.target.value)}
              placeholder="e.g. Hermanus"
              className="w-full mt-1 px-3 py-2.5 rounded-lg bg-white border border-brand-dark/10"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-brand-dark/60">Skill</label>
            <select
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              className="w-full mt-1 px-3 py-2.5 rounded-lg bg-white border border-brand-dark/10"
            >
              <option value="">All skills</option>
              {SKILL_CATEGORIES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="grid place-items-center py-20 text-brand-dark/50">
            <Loader2 className="size-6 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-brand-dark/60">
            No listings match your filters yet.{" "}
            <Link to="/advertise" className="text-brand-primary underline">
              Be the first to advertise.
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((r) => (
              <Link
                key={r.id}
                to="/profile/$id"
                params={{ id: r.id }}
                className="bg-white border border-brand-dark/5 rounded-2xl p-5 flex flex-col hover:border-brand-primary/30 hover:shadow-sm transition"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="size-14 rounded-full bg-brand-soft overflow-hidden grid place-items-center text-brand-dark/40 shrink-0">
                    {r.photo_url ? (
                      <img src={r.photo_url} alt="" className="size-full object-cover" />
                    ) : (
                      <span className="text-lg font-semibold">{r.name?.[0] ?? "?"}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-heading text-lg font-semibold truncate">{r.name}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-brand-dark/60 mt-0.5">
                      <MapPin className="size-3" /> {r.town}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {r.skills.slice(0, 4).map((s) => (
                    <span
                      key={s}
                      className="text-[11px] px-2 py-0.5 rounded-full bg-brand-soft text-brand-dark/80"
                    >
                      {s}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-brand-dark/70 mb-3 line-clamp-3">{r.description}</p>
                <div className="mt-auto flex items-center justify-between text-xs text-brand-dark/60">
                  {r.availability && (
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="size-3" /> {r.availability}
                    </span>
                  )}
                  {r.years_experience != null && <span>{r.years_experience} yrs exp.</span>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
