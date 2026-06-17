import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { HineniDisclaimer } from "@/components/site/HineniDisclaimer";
import { supabase } from "@/integrations/supabase/client";
import {
  YOUTH_OPPORTUNITY_TYPES,
  YOUTH_OPPORTUNITY_CATEGORIES,
  YOUTH_LOCATIONS,
  YOUTH_COMPENSATION_TYPES,
  labelFromList,
} from "@/lib/youth";
import { Loader2, MapPin, Calendar, Tag, Coins } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/youth/opportunities")({
  head: () => ({
    meta: [
      { title: "Opportunity Board — Hineni Youth Hub" },
      { name: "description", content: "Search vetted youth opportunities in the Overberg — paid work, volunteering, training, internships and mentorship." },
    ],
  }),
  component: OpportunityBoard,
});

type Opp = {
  id: string;
  organisation_name: string;
  title: string;
  description: string;
  category: string;
  opportunity_type: string;
  min_age: number;
  max_age: number;
  town: string;
  closing_date: string | null;
  prohibited_for_minors: boolean;
  compensation_type: string | null;
  compensation_amount: number | null;
  provider_type: string | null;
};

function OpportunityBoard() {
  const navigate = useNavigate();
  const [type, setType] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [comp, setComp] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["opp_board", type, ageGroup, location, category, comp],
    queryFn: async (): Promise<Opp[]> => {
      let q = supabase
        .from("youth_opportunities")
        .select("id,organisation_name,title,description,category,opportunity_type,min_age,max_age,town,closing_date,prohibited_for_minors,compensation_type,compensation_amount,provider_type")
        .eq("status", "approved" as never)
        .order("created_at", { ascending: false });
      if (type) q = q.eq("opportunity_type", type);
      if (category) q = q.eq("category", category as never);
      if (location) q = q.eq("town", location);
      if (comp) q = q.eq("compensation_type", comp);
      if (ageGroup === "15-17") q = q.lte("min_age", 17).eq("prohibited_for_minors", false);
      if (ageGroup === "18-25") q = q.gte("max_age", 18);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Opp[];
    },
  });

  async function handleApply(opp: Opp) {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      toast.info("Please register first to apply.");
      navigate({ to: "/youth/register" });
      return;
    }
    const { data: profile } = await supabase
      .from("youth_profiles")
      .select("id,status")
      .eq("user_id", auth.user.id)
      .maybeSingle();
    if (!profile) {
      toast.info("Complete your youth registration to apply.");
      navigate({ to: "/youth/register" });
      return;
    }
    if (profile.status !== "approved") {
      toast.info("Your registration is still being reviewed.");
      return;
    }
    const { error } = await supabase.from("youth_applications").insert({
      youth_profile_id: profile.id,
      opportunity_id: opp.id,
      status: "applied" as never,
      outcome: "applied",
    } as never);
    if (error) toast.error(error.message);
    else toast.success("Application submitted via Hineni.");
  }

  return (
    <SiteLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-heading font-bold mb-2">Opportunity Board</h1>
            <p className="text-brand-dark/70 max-w-2xl">
              Approved opportunities for young people aged 15–25. All applications are facilitated through Hineni.
            </p>
          </div>
          <Link to="/youth/post-opportunity" className="px-4 py-2.5 rounded-xl border border-brand-dark/15 hover:bg-brand-soft text-sm">
            Post an opportunity
          </Link>
        </div>

        <div className="mb-6"><HineniDisclaimer compact /></div>

        <div className="grid sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8 p-4 bg-brand-soft rounded-2xl">
          <Sel label="Type" value={type} onChange={setType} options={YOUTH_OPPORTUNITY_TYPES} />
          <Sel label="Age group" value={ageGroup} onChange={setAgeGroup} options={[{value:"15-17",label:"15–17"},{value:"18-25",label:"18–25"}]} />
          <Sel label="Location" value={location} onChange={setLocation} options={YOUTH_LOCATIONS} />
          <Sel label="Category" value={category} onChange={setCategory} options={YOUTH_OPPORTUNITY_CATEGORIES} />
          <Sel label="Compensation" value={comp} onChange={setComp} options={YOUTH_COMPENSATION_TYPES} />
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
              <article key={o.id} className="bg-white border border-brand-dark/5 rounded-2xl p-5 flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-heading text-lg font-semibold leading-tight">{o.title}</h3>
                  <span className="text-[10px] uppercase tracking-widest bg-brand-soft text-brand-primary px-2 py-1 rounded-full shrink-0">
                    {labelFromList(YOUTH_OPPORTUNITY_CATEGORIES, o.category)}
                  </span>
                </div>
                <div className="text-sm text-brand-dark/70 mb-3">{o.organisation_name}</div>
                <p className="text-sm text-brand-dark/70 mb-4 line-clamp-3">{o.description}</p>
                <div className="text-xs text-brand-dark/60 space-y-1 mb-4">
                  <div className="flex items-center gap-1.5"><MapPin className="size-3.5" /> {o.town}</div>
                  <div className="flex items-center gap-1.5"><Tag className="size-3.5" /> {labelFromList(YOUTH_OPPORTUNITY_TYPES, o.opportunity_type)} · Ages {o.min_age}–{o.max_age}</div>
                  {o.compensation_type && (
                    <div className="flex items-center gap-1.5"><Coins className="size-3.5" /> {labelFromList(YOUTH_COMPENSATION_TYPES, o.compensation_type)}{o.compensation_amount ? ` · R${o.compensation_amount}` : ""}</div>
                  )}
                  {o.closing_date && (
                    <div className="flex items-center gap-1.5"><Calendar className="size-3.5" /> Closes {new Date(o.closing_date).toLocaleDateString()}</div>
                  )}
                </div>
                {o.prohibited_for_minors && (
                  <div className="text-[11px] mb-3 px-2 py-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
                    Open to 18+ only.
                  </div>
                )}
                <button
                  onClick={() => handleApply(o)}
                  className="mt-auto inline-flex justify-center px-4 py-2.5 rounded-xl bg-brand-primary text-white text-sm font-medium hover:brightness-110"
                >
                  Apply through Hineni
                </button>
              </article>
            ))}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}

function Sel({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: readonly { value: string; label: string }[] }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-wider text-brand-dark/60">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full mt-1 px-3 py-2.5 rounded-lg bg-white border border-brand-dark/10">
        <option value="">All</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}
