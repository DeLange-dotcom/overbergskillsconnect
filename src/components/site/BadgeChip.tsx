import { Award } from "lucide-react";
import { YOUTH_BADGES, type YouthBadgeKey } from "@/lib/youth";

export function BadgeChip({ badgeKey }: { badgeKey: YouthBadgeKey | string }) {
  const meta = YOUTH_BADGES.find((b) => b.key === badgeKey);
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-accent/10 text-brand-accent text-xs font-semibold"
      title={meta?.desc}
    >
      <Award className="size-3.5" /> {meta?.label ?? badgeKey}
    </span>
  );
}
