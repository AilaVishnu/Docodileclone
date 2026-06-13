import { SuggestionInput } from "../Input/SuggestionInput/SuggestionInput";

// Dosing interval — how often the medicine is taken (distinct from the
// per-day pattern handled by FrequencyPicker, e.g. 1-0-1).
const OPTIONS = [
  "daily",
  "alternate day",
  "weekly",
  "fort night",
  "monthly",
  "stat",
  "sos",
  "weekly twice",
  "weekly thrice",
];

type Props = { value: string; onChange: (v: string) => void };

export function FrequencyIntervalPicker({ value, onChange }: Props) {
  return (
    <SuggestionInput
      value={value}
      onChange={onChange}
      placeholder="Frequency"
      suggestions={OPTIONS}
      chevron
    />
  );
}
