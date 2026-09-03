import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { MapPin, Loader2, Search, Calendar } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ShortNotice } from "@/components/site/ShortNotice";
import { LocationSelect } from "@/components/site/LocationSelect";
import { supabase } from "@/integrations/supabase/client";
import { experienceLabel, type SkillExperience } from "@/lib/noticeboard";


export const Route = createFileRoute("/find-help")({
  head: () => ({
    meta: [
      { title: "Browse Local Skills — Overberg Skills Connect" },
      {
        name: "description",
        content:
          "Browse local people offering services on the Overberg Skills Connect noticeboard. Search by town and skill.",
      },
    ],
  }),
  component: FindHelp,
});

type Row = {
  id: string;
  public_listing_reference: string | null;
  name: string;
  town: string;
  skills: string[];
  skill_experience?: SkillExperience[] | null;
  category: string | null;
  years_experience: number | null;
  availability: string | null;
  description: string;
  photo_url: string | null;
  created_at: string;
};

/** Quick shortcuts for the most commonly requested skills. */
const QUICK_SKILLS = [
  "Domestic Worker",
  "Gardening",
  "Painting",
  "Building & handyman",
  "Childcare",
  "Eldercare",
  "Driving",
  "Farm work",
];

/** Loose match so "Gardener" finds "Gardening" and "domestic worker" finds "Domestic Worker". */
function looseMatch(skill: string, query: string) {
  const a = skill.toLowerCase();
  const b = query.trim().toLowerCase();
  if (!b) return false;
  if (a.includes(b) || b.includes(a)) return true;
  const stem = (v: string) => v.replace(/(ing|er|ers|s)$/i, "");
  return stem(a).startsWith(stem(b)) || stem(b).startsWith(stem(a));
}

function skillRows(r: Row): SkillExperience[] {
  return r.skill_experience?.length
    ? r.skill_experience
    : r.skills.map((s) => ({ skill: s, experience_level: null }));
}


function FindHelp() {
  const [town, setTown] = useState("");
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

  // Live filtering: keyword AND area must both match.
  const filtered = useMemo(() => {
    const keyword = q.trim().toLowerCase();
    return (data ?? []).filter((r) => {
      if (town && r.town.toLowerCase() !== town.toLowerCase()) return false;
      if (keyword) {
        // Skills only — a person is not returned just because their name or
        // description happens to contain the word.
        const rows = skillRows(r);
        const matched =
          rows.some((s) => looseMatch(s.skill, keyword)) ||
          (r.category ? looseMatch(r.category, keyword) : false);
        if (!matched) return false;
      }
      return true;
    });
  }, [data, town, q]);


  return (
    <SiteLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-14">
        <h1 className="text-3xl sm:text-4xl font-heading font-bold mb-2">What help do you need?</h1>
        <p className="text-brand-dark/70 max-w-2xl mb-4">
          Type the kind of work you need, then choose an area if you want to narrow it down.
        </p>
        <ShortNotice className="mb-6 max-w-2xl" />

        <div className="mb-6 p-4 sm:p-5 bg-brand-soft rounded-2xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-brand-dark/40" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="e.g. Gardener"
              aria-label="What help do you need?"
              spellCheck="true"
              className="w-full pl-12 pr-4 py-4 text-base rounded-xl bg-white border border-brand-dark/10"
            />
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {QUICK_SKILLS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setQ(q.toLowerCase() === e.toLowerCase() ? "" : e)}
                aria-pressed={q.toLowerCase() === e.toLowerCase()}
                className={`px-3 py-2 rounded-full border text-sm transition ${
                  q.toLowerCase() === e.toLowerCase()
                    ? "bg-brand-primary text-white border-brand-primary"
                    : "bg-white border-brand-dark/10 hover:border-brand-primary/40"
                }`}
              >
                {e}
              </button>
            ))}
          </div>
          <div className="mt-4">
            <LocationSelect
              id="area"
              label="Area (optional)"
              value={town}
              onChange={setTown}
              allowAny
              anyLabel="All Overberg areas"
            />
          </div>
          {(q || town) && (
            <button
              type="button"
              onClick={() => {
                setQ("");
                setTown("");
              }}
              className="mt-3 text-sm underline text-brand-dark/70"
            >
              Clear search
            </button>
          )}
        </div>

        <p className="mb-4 text-sm text-brand-dark/60" aria-live="polite">
          {isLoading
            ? "Loading…"
            : `${filtered.length} ${filtered.length === 1 ? "person" : "people"} found`}
        </p>



        {isLoading ? (
          <div className="grid place-items-center py-20 text-brand-dark/50">
            <Loader2 className="size-6 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-brand-dark/60">
            No one matches that search yet. Try a different word or choose “All Overberg areas”.{" "}

            <Link to="/advertise" className="text-brand-primary underline">
              Be the first to advertise.
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((r) => {
              const rows = skillRows(r);
              // Show the skill the person searched for first, then a couple of others
              const ordered = q
                ? [...rows].sort(
                    (a, b) => Number(looseMatch(b.skill, q)) - Number(looseMatch(a.skill, q)),
                  )
                : rows;
              const shown = ordered.slice(0, 3);
              const extra = ordered.length - shown.length;
              return (
                <Link
                  key={r.id}
                  to="/profile/$id"
                  params={{ id: r.public_listing_reference ?? r.id }}
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
                  <ul className="mb-3 space-y-0.5 text-sm">
                    {shown.map((s) => {
                      const label = experienceLabel(s.experience_level);
                      return (
                        <li key={s.skill} className="text-brand-dark/80">
                          <span className="font-medium">{s.skill}</span>
                          {label && (
                            <span className="text-brand-dark/60"> — {label} experience</span>
                          )}
                        </li>
                      );
                    })}
                    {extra > 0 && (
                      <li className="text-xs text-brand-dark/50">+{extra} more skills</li>
                    )}
                  </ul>
                  <p className="text-sm text-brand-dark/70 mb-3 line-clamp-3">{r.description}</p>
                  <div className="mt-auto flex items-center justify-between text-xs text-brand-dark/60">
                    {r.availability && (
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="size-3" /> {r.availability}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}

      </div>
    </SiteLayout>
  );
}
