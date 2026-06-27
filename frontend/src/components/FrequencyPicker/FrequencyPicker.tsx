import { SuggestionInput } from "../Input/SuggestionInput/SuggestionInput";

const ALL_OPTIONS = [
  // 3-slot patterns — morning / noon / night
  "1-0-0",
  "0-0-1",
  "1-0-1",
  "1-1-1",
  "0-1-0",
  // 4-slot patterns — morning / noon / evening / night
  "1-1-1-1",
  "1-1-1-0",
  "1-1-0-1",
  "1-0-1-1",
  "0-1-1-1",
  "1-1-0-0",
  "1-0-1-0",
  "0-1-0-1",
  "1-0-0-1",
  "1-0-0-0",
  "0-1-0-0",
  "0-0-1-0",
  "0-0-0-1",
  "Once a day",
  "Twice a day",
  "Thrice a day",
  "Once a week",
  "Twice a week",
  "Alternate days",
  "Every 6h",
  "Every 8h",
  "Every 12h",
  "Once in 10 days",
  "Once in every 15 days",
  "Once in 20 days",
  "Once in 45 days",
  "Once a month",
  "Once in 2 months",
  "Once in 3 months",
];

type Props = { value: string; onChange: (v: string) => void };

export function FrequencyPicker({ value, onChange }: Props) {
  return (
    <SuggestionInput
      value={value}
      onChange={onChange}
      placeholder="e.g 1-0-1"
      suggestions={ALL_OPTIONS}
    />
  );
}
