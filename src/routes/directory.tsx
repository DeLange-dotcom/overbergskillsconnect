import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { HineniDisclaimer } from "@/components/site/HineniDisclaimer";
import { VerificationBadge, type VerificationLevel } from "@/components/site/VerificationBadge";
import { supabase } from "@/integrations/supabase/client";
import {
  DIRECTORY_CATEGORIES,
  VERIFICATION_LEVELS,
  COMMON_LANGUAGES,
  directoryCategoryLabel,
} from "@/lib/directory-constants";
import { MapPin, Loader2, Search } from "lucide-react";

export const Route = createFileRoute("/directory")({
  head: () => ({
    meta: [
      { title: "Directory — Hineni Verified Applicants" },
      {
        name: "description",
        content:
          "Search Hineni's directory of verified domestic workers, carers, apprentices, tutors and more across the Overberg.",
      },
    ],
  }),
  component: Directory,
});

type Row = {
  applicant_type: "service_provider" | "apprentice" | "youth";
  id: string;
  first_name: string;
  area: string | null;
  category: string | null;
  skills: string[] | null;
  languages: string[] | null;
  short_bio: string | null;
  profile_photo_url: string | null;
  verification_level: VerificationLevel | null;
  available_now: boolean | null;
  availability: string[] | null;
};

function Directory() {
  const [category, setCategory] = useState("");
  const [town, setTown] = useState("");
  const [level, setLevel] = useState("");
  const [language, setLanguage] = useState("");
  const [skill, setSkill] = useState("");
  const [availability, setAvailability] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["directory_profiles"],
    queryFn: async (): Promise<Row[]> => {
      const { data, error } = await supabase
        .from("directory_profiles" as never)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Row[];
    },
  });

  const filtered = useMemo(() => {
    return (data ?? []).filter((r) => {
      if (category && r.category !== category) return false;
      if (town && !(r.area ?? "").toLowerCase().includes(town.toLowerCase())) return false;
      if (level && r.verification_level !== level) return false;
      if (language && !(r.languages ?? []).includes(language)) return false;
      if (skill && !(r.skills ?? []).some((s) => s.toLowerCase().includes(skill.toLowerCase()))) return false;
      if (availability === "now" && !r.available_now) return false;
      return true;
    });
  }, [data, category, town, level, language, skill, availability]);

  return (
    <SiteLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <h1 className="text-3xl sm:text-4xl font-heading font-bold mb-3">
          Verified community directory
        </h1>
        <p className="text-brand-dark/70 max-w-2xl mb-6">
          Every person listed has had their identity and references checked. Higher tiers add a
          Hineni interview and a Police Clearance Certificate.
        </p>

        <div className="mb-6">
          <HineniDisclaimer />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8 p-4 bg-brand-soft rounded-2xl">
          <Field label="Category">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full mt-1 px-3 py-2.5 rounded-lg bg-white border border-brand-dark/10"
            >
              <option value="">All categories</option>
              {DIRECTORY_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Location">
            <input
              value={town}
              onChange={(e) => setTown(e.target.value)}
              placeholder="e.g. Hermanus"
              className="w-full mt-1 px-3 py-2.5 rounded-lg bg-white border border-brand-dark/10"
            />
          </Field>
          <Field label="Verification level">
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full mt-1 px-3 py-2.5 rounded-lg bg-white border border-brand-dark/10"
            >
              <option value="">Any level</option>
              {VERIFICATION_LEVELS.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Language">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full mt-1 px-3 py-2.5 rounded-lg bg-white border border-brand-dark/10"
            >
              <option value="">Any language</option>
              {COMMON_LANGUAGES.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </Field>
          <Field label="Skill keyword">
            <div className="relative mt-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-brand-dark/40" />
              <input
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                placeholder="e.g. cleaning"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-white border border-brand-dark/10"
              />
            </div>
          </Field>
          <Field label="Availability">
            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              className="w-full mt-1 px-3 py-2.5 rounded-lg bg-white border border-brand-dark/10"
            >
              <option value="">Any availability</option>
              <option value="now">Available now</option>
            </select>
          </Field>
        </div>

        {isLoading ? (
          <div className="grid place-items-center py-20 text-brand-dark/50">
            <Loader2 className="size-6 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-brand-dark/60">
            No verified profiles match these filters yet.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((r) => (
              <ProfileCard key={`${r.applicant_type}-${r.id}`} row={r} />
            ))}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-wider text-brand-dark/60">{label}</label>
      {children}
    </div>
  );
}

function ProfileCard({ row }: { row: Row }) {
  return (
    <Link
      to="/directory/$type/$id"
      params={{ type: row.applicant_type, id: row.id }}
      className="bg-white border border-brand-dark/5 rounded-2xl p-5 flex flex-col hover:border-brand-primary/30 hover:shadow-sm transition"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="size-14 rounded-full bg-brand-soft overflow-hidden grid place-items-center text-brand-dark/40 shrink-0">
          {row.profile_photo_url ? (
            <img src={row.profile_photo_url} alt="" className="size-full object-cover" />
          ) : (
            <span className="text-lg font-semibold">{row.first_name?.[0] ?? "?"}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-heading text-lg font-semibold truncate">{row.first_name}</h3>
          <div className="flex items-center gap-1.5 text-xs text-brand-dark/60 mt-0.5">
            <MapPin className="size-3" /> {row.area ?? "—"}
          </div>
        </div>
        <VerificationBadge level={row.verification_level ?? "unverified"} size="sm" />
      </div>
      <div className="text-xs text-brand-dark/60 mb-2">
        {directoryCategoryLabel(row.category)}
      </div>
      {row.short_bio && (
        <p className="text-sm text-brand-dark/70 mb-3 line-clamp-3">{row.short_bio}</p>
      )}
      {row.available_now && (
        <span className="self-start text-[10px] uppercase tracking-widest bg-brand-primary/10 text-brand-primary px-2 py-1 rounded-full mt-auto">
          Available now
        </span>
      )}
    </Link>
  );
}
