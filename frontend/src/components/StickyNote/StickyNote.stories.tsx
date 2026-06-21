import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-webpack5";
import { StickyNote } from "./StickyNote";

// The note fills its positioned parent, so every story sits it in a fixed
// box at the size it takes on the board (≈156×152), on a cork backdrop.
const NOTE_COLORS = ["#EAE5FA", "#E3EEEF", "#CFEED5", "#FFE1F3"];
const PIN_COLORS = ["#FF8A8A", "#FFD400", "#9FD8A8", "#7C6BD6"];

function NoteBox({ children }: { children: React.ReactNode }) {
  return <div style={{ width: 156, height: 152 }}>{children}</div>;
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
          padding: 24,
          background: "#F4EEE2",
          backgroundImage: "radial-gradient(#d8cdb6 1px, transparent 1px)",
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
          "The paper note used on the pinboard: folded-corner or torn edge, a pushpin, an italic title and a free-text body. Presentational only — positioning, rotation and drag are owned by the board (BoardItem / Pinboard). State persistence lives in the board, not here.",
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
    pinColor: PIN_COLORS[0],
    dateStamp: "12 Jun",
  },
  render: (args) => <Editable {...args} />,
};

export const Torn: Story = {
  args: {
    title: "Restock",
    text: "Cetirizine running low — reorder this week.",
    color: NOTE_COLORS[2],
    pinColor: PIN_COLORS[1],
    torn: true,
    dateStamp: "13 Jun",
  },
  render: (args) => <Editable {...args} />,
};

export const ReadOnly: Story = {
  args: {
    title: "Handover",
    text: "Kennel 3 needs a recheck at 4pm.",
    color: NOTE_COLORS[1],
    pinColor: PIN_COLORS[3],
    dateStamp: "14 Jun",
    readOnly: true,
  },
  render: (args) => (
    <NoteBox>
      <StickyNote {...args} />
    </NoteBox>
  ),
};

// All four paper colours with their pushpins, as they appear on the board.
export const Palette: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 24 }}>
      {NOTE_COLORS.map((c, i) => (
        <NoteBox key={c}>
          <StickyNote
            color={c}
            pinColor={PIN_COLORS[i]}
            torn={i % 2 === 1}
            dateStamp="22 Jun"
            title={["Idea", "Reminder", "Stock", "Note"][i]}
            text="Drag me, edit me, pin me to the board."
            readOnly
          />
        </NoteBox>
      ))}
    </div>
  ),
};
