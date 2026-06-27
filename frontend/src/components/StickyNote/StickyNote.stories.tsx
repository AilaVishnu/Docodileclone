import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-webpack5";
import { StickyNote } from "./StickyNote";

// The note fills its parent's width and grows in height with its copy. Pushpins
// are the brand pin (primary400) by default; paper comes in five colours.
const NOTE_COLORS = ["#EAE5FA", "#E3EEEF", "#CFEED5", "#FFE1F3", "#FFFFFF"];

// Width-only box (no fixed height) so the note can grow with its content.
function NoteBox({ children }: { children: React.ReactNode }) {
  return <div style={{ width: 168 }}>{children}</div>;
}

const meta = {
  title: "Components/StickyNote",
  component: StickyNote,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div
        style={{
          display: "inline-block",
          padding: 28,
          background: "var(--active-shade-100, #FBF4E6)",
          backgroundImage: "radial-gradient(var(--active-shade-400, #EDCA99) 1px, transparent 1px)",
          backgroundSize: "16px 16px",
        }}
      >
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "The paper note used on the pinboard: folded-corner or torn edge, a brand (primary400) pushpin, a subtle drop shadow, an italic title, free-text body that grows vertically with the copy (capped by maxLength), and a date stamp at the bottom. Presentational only — positioning, rotation and drag belong to the board.",
      },
    },
  },
} satisfies Meta<typeof StickyNote>;

export default meta;
type Story = StoryObj<typeof meta>;

// Controlled wrapper so the title/body are editable in the story.
function Editable(props: React.ComponentProps<typeof StickyNote>) {
  const [title, setTitle] = useState(props.title ?? "");
  const [text, setText] = useState(props.text ?? "");
  return (
    <NoteBox>
      <StickyNote
        {...props}
        title={title}
        text={text}
        onTitleChange={setTitle}
        onTextChange={setText}
        onDelete={() => {}}
      />
    </NoteBox>
  );
}

export const Default: Story = {
  args: {
    title: "Follow up",
    text: "Call Ramesh re: lab results on Monday.",
    color: NOTE_COLORS[0],
    dateStamp: "12 Jun",
  },
  render: (args) => <Editable {...args} />,
};

export const Torn: Story = {
  args: {
    title: "Restock",
    text: "Cetirizine running low — reorder this week.",
    color: NOTE_COLORS[2],
    torn: true,
    dateStamp: "13 Jun",
  },
  render: (args) => <Editable {...args} />,
};

export const White: Story = {
  args: {
    title: "Note",
    text: "A clean white sticky for a calmer board.",
    color: "#FFFFFF",
    dateStamp: "22 Jun",
  },
  render: (args) => <Editable {...args} />,
};

// Long copy: the note grows taller; maxLength (160) keeps it from getting huge.
export const LongCopy: Story = {
  args: {
    title: "Handover",
    text: "Kennel 3 post-op recheck at 4pm — watch the incision, keep the cone on, and call the owner with an update before close.",
    color: NOTE_COLORS[4],
    dateStamp: "14 Jun",
  },
  render: (args) => <Editable {...args} />,
};

// All five paper colours with the brand pushpin, as they appear on the board.
export const Palette: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
      {NOTE_COLORS.map((c, i) => (
        <NoteBox key={c}>
          <StickyNote
            color={c}
            torn={i % 2 === 1}
            dateStamp="22 Jun"
            title={["Idea", "Reminder", "Stock", "Note", "Plain"][i]}
            text="Drag me, edit me, pin me to the board."
            readOnly
          />
        </NoteBox>
      ))}
    </div>
  ),
};
