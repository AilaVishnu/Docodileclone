import type { Meta, StoryObj } from "@storybook/react-webpack5";
import React from "react";
import { BillStatusBadge, BillStatus } from "./BillStatusBadge";
import { colors, spacing } from "../../styles/theme";

// Paid · Due · Refunded · Waived
const ALL: BillStatus[] = ["paid", "due", "refunded", "waived"];

const meta = {
  title: 'Components/Bills/BillStatusBadge',
  component: BillStatusBadge,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ backgroundColor: colors.neutral100, padding: spacing.xl }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "Status pill for a bill — Paid (green) / Due (yellow) / Refunded (grey) / Waived (blue). Tinted pill + colour icon + dark word; Paid/Due reuse the appointment-queue glyphs (check-circle / danger-triangle). Partial + unpaid both collapse to Due. Pair with `billStatusOf(bill)`.",
      },
    },
  },
} satisfies Meta<typeof BillStatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The full set. */
export const States: Story = {
  render: () => (
    <div style={{ display: "flex", gap: spacing.s, alignItems: "center", flexWrap: "wrap" }}>
      {ALL.map((s) => <BillStatusBadge key={s} status={s} />)}
    </div>
  ),
};

export const Paid: Story = { args: { status: "paid" } };
export const Due: Story = { args: { status: "due" } };
export const Refunded: Story = { args: { status: "refunded" } };
export const Waived: Story = { args: { status: "waived" } };
