import React from "react";
import { Icon } from "../../components/Icon";
import { colors } from "../../styles/theme";
import {
  noteRow,
  noteLabel,
  noteLabelText,
  sectionIcon,
  referDropdown,
  referText,
  referChevron,
  referMenu,
  referMenuEmpty,
  referMenuItem,
  referMenuItemName,
  referMenuItemMeta,
} from "./bottomRowStyles";

// ReferBlock — "Referred by": which referral doctor (from the Catalog directory)
// referred this patient in. A custom click-outside dropdown (NOT a generic
// Select) populated with the clinic's referral doctors. The selected value is
// the doctor's NAME (denormalized onto the visit + printed as "Ref. by"), so the
// field keeps working even if that referral doctor is later renamed/removed.
export type ReferOption = { id: string; name: string; specialty?: string };

export type ReferBlockProps = {
  /** Referral doctors from the Catalog directory (useReferralDoctors()). */
  options: ReferOption[];
  /** Selected referral doctor NAME, or null. */
  value: string | null;
  onChange: (name: string) => void;
};

export function ReferBlock({ options, value, onChange }: ReferBlockProps) {
  const [referOpen, setReferOpen] = React.useState(false);
  const referWrapRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!referOpen) return;
    const handler = (e: MouseEvent) => {
      if (referWrapRef.current && !referWrapRef.current.contains(e.target as Node)) {
        setReferOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [referOpen]);

  return (
    <div style={noteRow}>
      <div style={noteLabel}>
        <Icon name="users-group-rounded" tone="inherit" style={sectionIcon} />
        <span style={noteLabelText}>Referred by</span>
      </div>
      <div ref={referWrapRef} style={{ position: "relative" }}>
        <div
          style={referDropdown}
          onClick={() => setReferOpen((v) => !v)}
          role="button"
          aria-haspopup="listbox"
          aria-expanded={referOpen}
        >
          <span
            style={{
              ...referText,
              ...(value ? { color: colors.neutral900 } : {}),
            }}
          >
            {value || "Select referral doctor"}
          </span>
          <span style={referChevron}>
            <Icon
              name="chevron-up"
              size={16}
              tone="inherit"
              style={{ transform: referOpen ? "rotate(0deg)" : "rotate(180deg)" }}
            />
          </span>
        </div>
        {referOpen && (
          <div style={referMenu}>
            {options.length === 0 ? (
              <div style={referMenuEmpty}>No referral doctors — add them in Catalog</div>
            ) : (
              options.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  style={referMenuItem}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onChange(o.name);
                    setReferOpen(false);
                  }}
                >
                  <span style={referMenuItemName}>{o.name}</span>
                  {o.specialty && <span style={referMenuItemMeta}>{o.specialty}</span>}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
