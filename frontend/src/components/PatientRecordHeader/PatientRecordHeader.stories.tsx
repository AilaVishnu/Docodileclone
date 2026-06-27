import type { Meta, StoryObj } from "@storybook/react-webpack5";
import { useState } from "react";
import { PatientRecordHeader, RecordSection } from "./PatientRecordHeader";
import { Icon } from "../Icon";
import { PopoverMenu } from "../PopoverMenu/PopoverMenu";
import { fluidSpacing } from "../../styles/theme";

// The header is full-bleed: it cancels the page's outer gutter and re-centers
// its inner at the content max. This decorator recreates that gutter so the
// bar reads correctly in isolation (mirrors how the prescription page wraps it).
const PageGutter: Meta["decorators"] = [
  (Story) => (
    <div
      style={{
        paddingLeft: fluidSpacing.outerX,
        paddingRight: fluidSpacing.outerX,
        background: "var(--page-bg, #fff)",
      }}
    >
      <Story />
    </div>
  ),
];

const SECTIONS: RecordSection[] = [
  { id: "info", label: "Info", icon: <Icon name="user-hands" size={16} tone="inherit" /> },
  { id: "visits", label: "Visits", icon: <Icon name="visits" size={16} tone="inherit" /> },
  { id: "files", label: "Files", icon: <Icon name="file" size={16} tone="inherit" />, badge: 3 },
  { id: "timeline", label: "Timeline", icon: <Icon name="history" size={16} tone="inherit" /> },
  { id: "bills", label: "Bills", icon: <Icon name="bill-check" size={16} tone="inherit" /> },
];

const kebab = (
  <PopoverMenu
    trigger={
      <span
        aria-hidden="true"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 36,
          height: 36,
          fontSize: 22,
          lineHeight: 1,
        }}
      >
        ⋯
      </span>
    }
    items={[
      { label: "Call +91 98765 43210", onClick: () => {} },
      { label: "Email patient", onClick: () => {} },
      { label: "Edit patient", onClick: () => {} },
    ]}
    ariaLabel="Patient contact and actions"
  />
);

const meta = {
  title: "Patterns/PatientRecordHeader",
  component: PatientRecordHeader,
  tags: ["autodocs"],
  decorators: PageGutter,
  parameters: {
    docs: {
      description: {
        component:
          "Compact sticky header for a patient/record screen: back arrow · name · section nav (icon + label + optional count) · actions slot. Full-bleed against the page gutter; the title left-aligns to the body below. Extracted from the prescription page.",
      },
    },
  },
} satisfies Meta<typeof PatientRecordHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Interactive — click the tabs to switch the active section. */
export const Default: Story = {
  render: (args) => {
    const [activeId, setActiveId] = useState("info");
    return (
      <PatientRecordHeader
        {...args}
        activeId={activeId}
        onSelect={setActiveId}
      />
    );
  },
  args: {
    title: "Aarav Sharma",
    sections: SECTIONS,
    onBack: () => {},
    actions: kebab,
  },
};

/** No back arrow, no actions — just the title and section nav. */
export const NavOnly: Story = {
  render: (args) => {
    const [activeId, setActiveId] = useState("visits");
    return (
      <PatientRecordHeader
        {...args}
        activeId={activeId}
        onSelect={setActiveId}
      />
    );
  },
  args: {
    title: "Priya Patel",
    sections: SECTIONS,
  },
};
