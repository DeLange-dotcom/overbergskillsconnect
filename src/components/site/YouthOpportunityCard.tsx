import { MapPin, Calendar, Tag } from "lucide-react";
import { YOUTH_OPPORTUNITY_CATEGORIES, YOUTH_OPPORTUNITY_TYPES, labelFromList } from "@/lib/youth";

export type YouthOpportunityPublic = {
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
};

export function YouthOpportunityCard({ o }: { o: YouthOpportunityPublic }) {
  return (
    <article className="bg-white border border-brand-dark/5 rounded-2xl p-5 flex flex-col">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-heading text-lg font-semibold leading-tight">{o.title}</h3>
        <span className="text-[10px] uppercase tracking-widest bg-brand-soft text-brand-primary px-2 py-1 rounded-full shrink-0">
          {labelFromList(YOUTH_OPPORTUNITY_CATEGORIES, o.category)}
        </span>
      </div>
      <div className="text-sm text-brand-dark/70 mb-3">{o.organisation_name}</div>
      <p className="text-sm text-brand-dark/70 mb-4 line-clamp-3">{o.description}</p>
      <div className="text-xs text-brand-dark/60 space-y-1 mb-4">
        <div className="flex items-center gap-1.5">
          <MapPin className="size-3.5" /> {o.town}
        </div>
        <div className="flex items-center gap-1.5">
          <Tag className="size-3.5" /> {labelFromList(YOUTH_OPPORTUNITY_TYPES, o.opportunity_type)} · Ages {o.min_age}–{o.max_age}
        </div>
        {o.closing_date && (
          <div className="flex items-center gap-1.5">
            <Calendar className="size-3.5" /> Closes {new Date(o.closing_date).toLocaleDateString()}
          </div>
        )}
      </div>
      {o.prohibited_for_minors && (
        <div className="text-[11px] mb-3 px-2 py-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
          Open to 18+ only.
        </div>
      )}
      <a
        href={`mailto:hineni@example.org?subject=${encodeURIComponent("Youth opportunity interest: " + o.title)}`}
        className="mt-auto inline-flex justify-center px-4 py-2.5 rounded-xl bg-brand-primary text-white text-sm font-medium hover:brightness-110"
      >
        Express interest through Hineni
      </a>
    </article>
  );
}
