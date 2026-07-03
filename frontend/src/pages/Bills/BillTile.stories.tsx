import type { Meta, StoryObj } from "@storybook/react-webpack5";
import React from "react";
import { BillTile } from "./BillTile";
import { sampleBills } from "./sampleBills";
import { colors, spacing } from "../../styles/theme";

/**
 * The read-only receipt tile for the Bills page grid view — the BillCard
 * aesthetic (white card + grey total band + torn zigzag foot) carrying a
 * settled bill's summary. Clicking a tile opens the bill modal.
 */
const meta = {
  title: "Pages/Bills/BillTile",
  component: BillTile,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof BillTile>;

export default meta;
type Story = StoryObj<typeof meta>;

const cream = (node: React.ReactNode) => (
  <div style={{ background: colors.primary200, padding: spacing.xl, minHeight: "100vh" }}>{node}</div>
);

/** A single tile — a part-paid (Due) bill. */
export const Single: Story = {
  render: () => cream(<div style={{ maxWidth: 320 }}><BillTile bill={sampleBills[1]} onClick={() => {}} /></div>),
};

/** The full grid across every state (Paid / Due / Refunded / Waived / Unpaid). */
export const Grid: Story = {
  render: () => cream(
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: spacing.m, alignItems: "start" }}>
      {sampleBills.map((b) => <BillTile key={b.id} bill={b} onClick={() => {}} />)}
    </div>
  ),
};
