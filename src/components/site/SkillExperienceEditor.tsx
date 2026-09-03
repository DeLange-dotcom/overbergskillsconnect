import { Plus, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { EXPERIENCE_LEVELS, SKILL_CATEGORIES, type SkillExperience } from "@/lib/noticeboard";
import { useLabels } from "@/i18n/labels";

export type SkillEntry = {
  key: string;
  skill: string; // predefined category, or "Other"
  custom: string; // used when skill === "Other"
  level: string; // experience_level code
};

export function newSkillEntry(): SkillEntry {
  return {
    key: Math.random().toString(36).slice(2),
    skill: "",
    custom: "",
    level: "",
  };
}

export function entriesFromSkillExperience(rows: SkillExperience[] | null | undefined): SkillEntry[] {
  const list = (rows ?? []).map((r) => {
    const known = (SKILL_CATEGORIES as readonly string[]).includes(r.skill) && r.skill !== "Other";
    return {
      key: Math.random().toString(36).slice(2),
      skill: known ? r.skill : "Other",
      custom: known ? "" : r.skill,
      level: r.experience_level ?? "",
    };
  });
  return list.length ? list : [newSkillEntry()];
}

/** Resolve an entry to the skill name that will be stored. */
export function entryName(e: SkillEntry): string {
  return (e.skill === "Other" ? e.custom : e.skill).trim();
}

export function entriesToPayload(entries: SkillEntry[]): SkillExperience[] {
  const seen = new Set<string>();
  const out: SkillExperience[] = [];
  for (const e of entries) {
    const name = entryName(e);
    if (!name) continue;
    const dedupeKey = name.toLowerCase();
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);
    out.push({
      skill: name,
      experience_level: e.level || null,
      is_custom: e.skill === "Other",
    });
  }
  return out;
}

export function SkillExperienceEditor({
  entries,
  onChange,
}: {
  entries: SkillEntry[];
  onChange: (next: SkillEntry[]) => void;
}) {
  const { t } = useTranslation();
  const { skillLabel, experienceLabel } = useLabels();
  const chosen = entries.map((e) => e.skill).filter((s) => s && s !== "Other");

  function update(key: string, patch: Partial<SkillEntry>) {
    onChange(entries.map((e) => (e.key === key ? { ...e, ...patch } : e)));
  }

  function remove(key: string) {
    const next = entries.filter((e) => e.key !== key);
    onChange(next.length ? next : [newSkillEntry()]);
  }

  return (
    <div className="space-y-4">
      {entries.map((e, i) => (
        <div
          key={e.key}
          className="p-4 rounded-2xl border border-brand-dark/10 bg-white space-y-3"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-brand-dark/70">
              {t("advertiseForm.skillEditor.skillNumber", { number: i + 1 })}
            </span>
            {entries.length > 1 && (
              <button
                type="button"
                onClick={() => remove(e.key)}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-red-200 text-red-700 text-sm"
                aria-label={t("advertiseForm.skillEditor.removeAria", { number: i + 1 })}
              >
                <X className="size-4" /> {t("advertiseForm.skillEditor.remove")}
              </button>
            )}
          </div>

          <select
            value={e.skill}
            onChange={(ev) => update(e.key, { skill: ev.target.value, custom: "" })}
            className="w-full px-4 py-3.5 text-base border border-brand-dark/10 rounded-xl bg-white"
            aria-label={t("advertiseForm.skillEditor.chooseSkillAria")}
          >
            <option value="">{t("advertiseForm.skillEditor.chooseSkill")}</option>
            {SKILL_CATEGORIES.map((s) => (
              <option
                key={s}
                value={s}
                disabled={s !== "Other" && s !== e.skill && chosen.includes(s)}
              >
                {skillLabel(s)}
                {s !== "Other" && s !== e.skill && chosen.includes(s)
                  ? ` ${t("advertiseForm.skillEditor.alreadyAdded")}`
                  : ""}
              </option>
            ))}
          </select>

          {e.skill === "Other" && (
            <div>
              <input
                type="text"
                value={e.custom}
                onChange={(ev) => update(e.key, { custom: ev.target.value })}
                placeholder={t("advertiseForm.skillEditor.customPlaceholder")}
                spellCheck
                className="w-full px-4 py-3.5 text-base border border-brand-dark/10 rounded-xl"
              />
              <p className="text-xs text-brand-dark/60 mt-1">
                {t("advertiseForm.skillEditor.customHelp")}
              </p>
            </div>
          )}

          {(e.skill && (e.skill !== "Other" || e.custom.trim())) && (
            <div>
              <p className="text-sm font-medium mb-2">{t("advertiseForm.skillEditor.experiencePrompt")}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {EXPERIENCE_LEVELS.map((lvl) => {
                  const active = e.level === lvl.value;
                  return (
                    <button
                      key={lvl.value}
                      type="button"
                      onClick={() => update(e.key, { level: lvl.value })}
                      className={
                        "px-4 py-3 rounded-xl text-sm border text-left " +
                        (active
                          ? "bg-brand-primary text-white border-brand-primary"
                          : "bg-white border-brand-dark/10 hover:border-brand-primary/40")
                      }
                    >
                      {experienceLabel(lvl.value)}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={() => onChange([...entries, newSkillEntry()])}
        className="w-full inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl border-2 border-dashed border-brand-primary/40 text-brand-primary font-medium"
      >
        <Plus className="size-4" /> {t("advertiseForm.skillEditor.addAnother")}
      </button>
    </div>
  );
}
