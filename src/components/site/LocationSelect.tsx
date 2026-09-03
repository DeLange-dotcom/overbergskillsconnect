import { useState } from "react";
import { OVERBERG_LOCATIONS, OTHER_LOCATION_LABEL, isCustomTown } from "@/lib/noticeboard";

/**
 * Standardised Overberg town/area picker.
 * Falls back to a free-text box when "Other Overberg area" is chosen so that
 * smaller settlements and farms can still be captured.
 */
export function LocationSelect({
  value,
  onChange,
  id = "town",
  label = "Town or area",
  required,
  allowAny,
  anyLabel = "All areas",
}: {
  value: string;
  onChange: (v: string) => void;
  id?: string;
  label?: string;
  required?: boolean;
  allowAny?: boolean;
  anyLabel?: string;
}) {
  const [other, setOther] = useState(() => (isCustomTown(value) ? value : ""));
  const showOther = isCustomTown(value) || (other !== "" && value === other);

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-brand-dark mb-1">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      <select
        id={id}
        required={required}
        value={showOther ? OTHER_LOCATION_LABEL : value}
        onChange={(e) => {
          const v = e.target.value;
          if (v === OTHER_LOCATION_LABEL) {
            onChange(other);
          } else {
            setOther("");
            onChange(v);
          }
        }}
        className="w-full px-4 py-3.5 text-base border border-brand-dark/10 rounded-xl bg-white"
      >
        <option value="">{allowAny ? anyLabel : "Select your area…"}</option>
        {OVERBERG_LOCATIONS.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
        <option value={OTHER_LOCATION_LABEL}>{OTHER_LOCATION_LABEL}</option>
      </select>

      {showOther && (
        <input
          value={other}
          onChange={(e) => {
            setOther(e.target.value);
            onChange(e.target.value);
          }}
          placeholder="Type your area, e.g. Protem"
          aria-label="Other Overberg area"
          className="w-full mt-2 px-4 py-3.5 text-base border border-brand-dark/10 rounded-xl"
        />
      )}
    </div>
  );
}
