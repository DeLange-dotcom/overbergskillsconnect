import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import {
  YOUTH_OPPORTUNITY_CATEGORIES,
  YOUTH_OPPORTUNITY_TYPES,
} from "@/lib/youth";
import {
  YouthOpportunityCard,
  type YouthOpportunityPublic,
} from "@/components/site/YouthOpportunityCard";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/youth/opportunities")({
  head: () => ({
    meta: [
      { title: "Youth Opportunities Board — Hineni" },
      {
        name: "description",
        content:
          "Browse vetted youth opportunities in the Overberg: paid work, volunteering, training, internships and community service.",
      },
    ],
  }),
  component: YouthOpportunitiesBoard,
});

function YouthOpportunitiesBoard() {
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [town, setTown] = useState("");
  const [minorsOnly, setMinorsOnly] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["youth_opportunities_public", category, type, town, minorsOnly],
    queryFn: async (): Promise<YouthOpportunityPublic[]> => {
      let q = supabase
        .from("youth_opportunities_public")
        .select("*")
        .order("created_at", { ascending: false });
      if (category) q = q.eq("category", category as never);
      if (type) q = q.eq("opportunity_type", type);
      if (town) q = q.ilike("town", `%${town}%`);
      if (minorsOnly) q = q.eq("prohibited_for_minors", false).lte("min_age", 17);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as YouthOpportunityPublic[];
    },
  });

  return (
    <SiteLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-heading font-bold mb-2">
              Youth opportunities
            </h1>
            <p className="text-brand-dark/70 max-w-2xl">
              Approved opportunities for young people aged 15–25. Contact happens through Hineni.
            </p>
          </div>
          <Link
            to="/youth/post-opportunity"
            className="px-4 py-2.5 rounded-xl border border-brand-dark/15 hover:bg-brand-soft text-sm"
          >
            Post an opportunity
          </Link>
        </div>

        <div className="grid sm:grid-cols-4 gap-3 mb-8 p-4 bg-brand-soft rounded-2xl">
          <Select label="Category" value={category} onChange={setCategory} options={YOUTH_OPPORTUNITY_CATEGORIES} />
          <Select label="Type" value={type} onChange={setType} options={YOUTH_OPPORTUNITY_TYPES} />
          <div>
            <label className="text-xs uppercase tracking-wider text-brand-dark/60">Town</label>
            <input
              value={town}
              onChange={(e) => setTown(e.target.value)}
              placeholder="e.g. Hermanus"
              className="w-full mt-1 px-3 py-2.5 rounded-lg bg-white border border-brand-dark/10"
            />
          </div>
          <label className="flex items-center gap-2 text-sm self-end pb-2">
            <input
              type="checkbox"
              checked={minorsOnly}
              onChange={(e) => setMinorsOnly(e.target.checked)}
              className="accent-brand-primary"
            />
            Suitable for under-18s
          </label>
        </div>

        {isLoading ? (
          <div className="grid place-items-center py-20 text-brand-dark/50">
            <Loader2 className="size-6 animate-spin" />
          </div>
        ) : !data || data.length === 0 ? (
          <div className="text-center py-16 text-brand-dark/60">
            No opportunities match these filters yet. Check back soon.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.map((o) => (
              <YouthOpportunityCard key={o.id} o={o} />
            ))}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="text-xs uppercase tracking-wider text-brand-dark/60">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full mt-1 px-3 py-2.5 rounded-lg bg-white border border-brand-dark/10"
      >
        <option value="">All</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
