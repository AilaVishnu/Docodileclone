import type { Meta, StoryObj } from "@storybook/react-webpack5";
import React from "react";
import { BillsView, ClinicBill } from "./BillsView";
import { sampleBills } from "./sampleBills";
import { colors } from "../../styles/theme";

// Frame the view like the app shell's main content (primary200 app background).
const inShell = (Story: React.ComponentType) => (
  <div style={{ position: "relative", height: "100vh", width: "100%", backgroundColor: colors.primary200, overflow: "hidden" }}>
    <Story />
  </div>
);

const meta = {
  title: "Pages/Bills",
  component: BillsView,
  decorators: [inShell],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "The clinic-wide Bills page (sidebar 'Billing' module). Composed from existing components — PageHeader, Card (KPI tiles + cream list), Tabs (status filter), DateRangeDropdown (period), DataGrid (invoice table). Needs a clinic-wide bills endpoint to wire for real (listBills is per-patient).",
      },
    },
  },
} satisfies Meta<typeof BillsView>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Clinic Bills page with a mixed set of invoices. */
export const Default: Story = { render: () => <BillsView bills={sampleBills} /> };

/** Empty — no bills in range. */
export const Empty: Story = { render: () => <BillsView bills={[] as ClinicBill[]} /> };
