import type { Meta, StoryObj } from "@storybook/react-webpack5";
import React from "react";
import { VisitTabs, VisitTabItem } from "./VisitTabs";
import { colors, spacing } from "../../styles/theme";

// Cream page background (HomePage uses active.shade200/300) so the white active
// pill and the segmented dividers read the way they do in the app.
const onCream = (Story: React.ComponentType) => (
  <div style={{ backgroundColor: colors.active.shade200, padding: spacing.xl }}>
    <Story />
  </div>
);

const meta = {
  title: "Components/VisitTabs",
  component: VisitTabs,
  decorators: [onCream],
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Horizontal strip of visit tabs as segmented `number │ date` pills — the date is the primary element, the visit number a quiet grey marker; the active tab turns both peach. When the tabs overflow the available width, left/right chevrons page through them (each disabled at its end) and the active visit is kept scrolled into view. The `+ New Visit` action sits outside the scroller so it stays reachable. Used by the Prescription page.",
      },
    },
  },
  argTypes: {
    activeIndex: { control: { type: "number" } },
    addingVisit: { control: "boolean" },
    onSelect: { action: "select" },
    onAddVisit: { action: "addVisit" },
  },
} satisfies Meta<typeof VisitTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

const FEW: VisitTabItem[] = [
  { id: "v1", label: "23 May" },
  { id: "v2", label: "08 Jun" },
  { id: "v3", label: "Today" },
];

const MANY: VisitTabItem[] = [
  "18 Feb", "08 Mar", "26 Mar", "13 Apr", "01 May",
  "19 May", "06 Jun", "Today",
].map((label, i) => ({ id: `v${i}`, label }));

// Controlled wrapper so clicking a tab actually moves the active state.
const Interactive = ({ tabs, start }: { tabs: VisitTabItem[]; start: number }) => {
  const [active, setActive] = React.useState(start);
  return (
    <VisitTabs
      tabs={tabs}
      activeIndex={active}
      onSelect={setActive}
      onAddVisit={() => {}}
    />
  );
};

/** A handful of visits — everything fits, so no pagination chevrons. */
export const Default: Story = {
  render: () => <Interactive tabs={FEW} start={2} />,
};

/** Many visits in a width-constrained strip — chevrons appear and page through. */
export const Paginated: Story = {
  render: () => (
    <div style={{ maxWidth: 560 }}>
      <Interactive tabs={MANY} start={1} />
    </div>
  ),
};

/** Active visit mid-list — it gets scrolled into view on mount. */
export const ActiveMidList: Story = {
  render: () => (
    <div style={{ maxWidth: 520 }}>
      <Interactive tabs={MANY} start={4} />
    </div>
  ),
};

/** While a new visit is being created. */
export const AddingVisit: Story = {
  args: {
    tabs: FEW,
    activeIndex: 2,
    addingVisit: true,
    onSelect: () => {},
    onAddVisit: () => {},
  },
};
