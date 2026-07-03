import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-webpack5";
import { FloatingBar, FloatingBarButton, FloatingBarDivider } from "./FloatingBar";

// FloatingBar is positioned (absolute/fixed), so each story gives it a relative
// stage to sit at the bottom of.
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        position: "relative",
        width: 560,
        height: 240,
        borderRadius: 12,
        background: "var(--active-shade-200, #efe7d9)",
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  );
}

const meta = {
  title: "Components/FloatingBar",
  component: FloatingBar,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <Stage>
        <Story />
      </Stage>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "A floating pill of actions — the same pattern as the prescription page's bottom bar. Compose it from FloatingBarButton (icon + label, with default/primary/danger variants and an active state) and FloatingBarDivider. Defaults to absolute, centered at the bottom of a positioned parent; use position=\"fixed\" to pin to the viewport.",
      },
    },
  },
} satisfies Meta<typeof FloatingBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <FloatingBar>
      <FloatingBarButton iconName="download" label="Download" onClick={() => {}} />
      <FloatingBarButton iconName="printer" label="Print" onClick={() => {}} />
      <FloatingBarButton iconName="share" label="Share" onClick={() => {}} />
      <FloatingBarDivider />
      <FloatingBarButton iconName="trash" label="Clear all" variant="danger" onClick={() => {}} />
    </FloatingBar>
  ),
};

// A toggle (active state) plus an add action — the shape the Pinboard uses.
export const EditAndAdd: Story = {
  render: () => {
    const [editing, setEditing] = useState(true);
    return (
      <FloatingBar>
        <FloatingBarButton
          iconName={editing ? "check" : "edit-pencil"}
          label={editing ? "Done" : "Edit"}
          active={editing}
          onClick={() => setEditing((e) => !e)}
        />
        {editing && (
          <>
            <FloatingBarDivider />
            <FloatingBarButton iconName="plus" label="Add" variant="primary" onClick={() => {}} />
          </>
        )}
      </FloatingBar>
    );
  },
};
