import { SuggestionInput } from "../Input/SuggestionInput/SuggestionInput";

const OPTIONS = [
  "Before Food",
  "After Food",
  "Before Breakfast",
  "After Breakfast",
  "Before Lunch",
  "After Lunch",
  "Before Dinner",
  "After Dinner",
  "Empty Stomach",
  "Bed Time",
  "SoS",
];

type Props = { value: string; onChange: (v: string) => void };

export function WhenPicker({ value, onChange }: Props) {
  return (
    <SuggestionInput
      value={value}
      onChange={onChange}
      placeholder="When"
      suggestions={OPTIONS}
      chevron
    />
  );
}
