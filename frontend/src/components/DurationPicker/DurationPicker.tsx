import { SuggestionInput } from "../Input/SuggestionInput/SuggestionInput";

const UNITS = ["Days", "Weeks", "Months", "Years"];

const STATIC_SUGGESTIONS = [
  "SOS",
  "3 Days", "5 Days", "7 Days", "10 Days", "14 Days",
  "1 Month", "2 Months", "3 Months",
  "As directed",
];

function buildSuggestions(value: string): string[] {
  const trimmed = value.trim();

  // Pure number → generate "N Days / N Weeks / N Months / N Years"
  const numMatch = trimmed.match(/^(\d+\.?\d*|\d*\.?\d+)$/);
  if (numMatch) {
    const num = parseFloat(numMatch[1]);
    if (!isNaN(num)) {
      return UNITS.map((u) => {
        // singular for 1
        const unit = num === 1 ? u.replace(/s$/, "") : u;
        return `${num} ${unit}`;
      });
    }
  }

  if (!trimmed) return STATIC_SUGGESTIONS;
  return STATIC_SUGGESTIONS.filter((s) =>
    s.toLowerCase().includes(trimmed.toLowerCase())
  );
}

type Props = { value: string; onChange: (v: string) => void };

export function DurationPicker({ value, onChange }: Props) {
  // buildSuggestions already does the number→units generation + substring
  // filtering, so the primitive passes the list through verbatim (filter=false).
  return (
    <SuggestionInput
      value={value}
      onChange={onChange}
      placeholder="Duration"
      suggestions={buildSuggestions(value)}
      filter={false}
    />
  );
}
