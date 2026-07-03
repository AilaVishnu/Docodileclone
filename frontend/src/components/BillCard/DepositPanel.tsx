import React, { useState } from "react";
import { Tabs } from "../Tabs";
import { Select } from "../Input/Select/Select";
import { MeasureField } from "../MeasureField";
import { Field } from "../Field";
import { Button } from "../Button";
import { IconButton } from "../IconButton";
import { Icon } from "../Icon";
import { colors, fonts, spacing, radii, shadows } from "../../styles/theme";

// DepositPanel — the "Deposit Amount" drawer that wraps OVER the bill's right
// column (the Bills Summary + Payment cards) when the "+" beside Deposit Amount
// is clicked. Rendered into BillLayout's `rightOverlay` slot, so it sits in the
// same place the summary/payment cards do; the left line-item grid and the
// bottom footer stay visible. Composed entirely from design-system pieces — the
// same mode Select + ₹ MeasureField + inline +/trash the bill's Payment section
// uses, the shared Tabs, a Field, and the dark Button. Mounts fresh each open.
type Line = { mode: string; amount: number | "" };
const MODES = ["Cash", "Card", "UPI"];
const TABS = [{ id: "deposit", label: "Add Deposit" }, { id: "refund", label: "Refund" }];
const inr = (n: number) => n.toLocaleString("en-IN");
const fmtAmt = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function DepositPanel({ onClose, deposited, onApply, onRefund }: {
  onClose: () => void;
  /** The patient's current deposit/advance — shown in the band. */
  deposited: number;
  /** Add a deposit: total + the combined payment mode + the details note. */
  onApply: (amount: number, mode: string, details: string) => void;
  /** Refund (draw down) the deposit: total + mode + details. */
  onRefund?: (amount: number, mode: string, details: string) => void;
}) {
  const [tab, setTab] = useState("deposit");
  const [lines, setLines] = useState<Line[]>([{ mode: "Cash", amount: "" }]);
  const [details, setDetails] = useState("");

  const total = lines.reduce((s, l) => s + (Number(l.amount) || 0), 0);
  const setLine = (i: number, patch: Partial<Line>) =>
    setLines((ls) => ls.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  const addLine = () => setLines((ls) => [...ls, { mode: "Cash", amount: "" }]);
  const removeLine = (i: number) => setLines((ls) => (ls.length === 1 ? ls : ls.filter((_, idx) => idx !== i)));

  const submit = () => {
    // Combine the split rows' modes into one label ("Cash", or "Cash + UPI").
    const mode = Array.from(new Set(lines.map((l) => l.mode))).join(" + ");
    if (tab === "refund") onRefund?.(total, mode, details);
    else onApply(total, mode, details);
    onClose();
  };

  return (
    <div style={styles.card}>
      {/* Header — back / title / close */}
      <div style={styles.header}>
        <IconButton ariaLabel="Back" onClick={onClose} color={colors.neutral900}>
          <Icon name="arrow-left" size={20} tone="inherit" />
        </IconButton>
        <span style={styles.title}>Deposit Amount</span>
        <IconButton ariaLabel="Close" onClick={onClose} />
      </div>

      {/* Deposited-amount band — the design-system total band (label left / value right).
          Shows what's already deposited against the bill, not the outstanding due. */}
      <div style={styles.balance}>
        <span style={styles.balanceLabel}>Deposited</span>
        <span style={styles.balanceAmt}>₹ {fmtAmt(deposited)}</span>
      </div>

      <Tabs items={TABS} activeId={tab} onSelect={setTab} variant="block" />

      {/* Payment-mode rows — same pattern as the bill's Payment section. */}
      {lines.map((l, i) => {
        const last = i === lines.length - 1;
        return (
          <div key={i} style={{ display: "flex", gap: spacing.s, alignItems: "center", "--input-h": "36px" } as React.CSSProperties}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Select options={MODES} value={l.mode} onChange={(m) => setLine(i, { mode: m })} />
            </div>
            <div style={{ width: 96, flexShrink: 0 }}>
              <MeasureField box prefix="₹" placeholder="0" inputMode="decimal" ariaLabel="Amount"
                value={l.amount === "" ? "" : String(l.amount)} onChange={(v) => setLine(i, { amount: v === "" ? "" : Number(v) })} />
            </div>
            {last ? (
              <IconButton ariaLabel="Add payment mode" onClick={addLine} color={colors.neutral900}>
                <Icon name="plus" size={20} tone="inherit" />
              </IconButton>
            ) : (
              <IconButton ariaLabel="Remove payment mode" onClick={() => removeLine(i)} color={colors.neutral900}>
                <Icon name="trash" size={20} tone="inherit" />
              </IconButton>
            )}
          </div>
        );
      })}

      {/* Details */}
      <div style={{ "--input-h": "40px" } as React.CSSProperties}>
        <Field variant="box" ariaLabel="Details" placeholder="Add Details" value={details} onChange={setDetails} />
      </div>

      <Button variant="dark" size="md" onClick={submit} style={{ width: "100%" }}>
        {tab === "refund" ? `Refund ₹ ${inr(total)}` : `Pay ₹ ${inr(total)}`}
      </Button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    width: "100%",
    height: "100%",
    boxSizing: "border-box",
    backgroundColor: colors.neutral100,
    borderRadius: radii.m,
    boxShadow: shadows.modal,
    padding: spacing.xl,
    display: "flex",
    flexDirection: "column",
    gap: spacing.m,
    overflowY: "auto",
    fontFamily: fonts.family.primary,
  },
  header: { display: "flex", alignItems: "center", gap: spacing.s },
  title: { flex: 1, fontSize: fonts.size.m, fontWeight: fonts.weight.medium, color: colors.neutral900 },
  balance: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "8px 12px",
    backgroundColor: colors.neutral150,
    borderRadius: radii.m,
  },
  balanceLabel: { fontSize: fonts.size.m, fontWeight: 600, color: colors.neutral900, lineHeight: 1 },
  balanceAmt: {
    fontSize: fonts.size.h4,
    fontWeight: fonts.weight.regular,
    fontFamily: fonts.family.secondary,
    color: colors.neutral900,
    lineHeight: 1,
  },
};
