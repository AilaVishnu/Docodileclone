import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-webpack5";
import { BoardItem, type BoardItemPos } from "./BoardItem";
import { StickyNote } from "../StickyNote";
import { Card } from "../Card";
import { Switch } from "../Switch";

const meta = {
  title: "Components/BoardItem",
  component: BoardItem,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A free-drag, z-ordered frame that positions any child on a board. Drag from anywhere except elements marked [data-no-drag] (inputs, buttons). Pass the board's layout box as `bounds` and any `scale` so positions clamp correctly. `locked` turns dragging off for a read-only/view mode. Used by Pinboard to host notes, widgets and stickers.",
      },
    },
  },
} satisfies Meta<typeof BoardItem>;

export default meta;
type Story = StoryObj<typeof meta>;

const BOARD = { width: 560, height: 360 };

function Board({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        position: "relative",
        width: BOARD.width,
        height: BOARD.height,
        borderRadius: 10,
        border: "8px solid #EDCA99",
        background: "#FBF7EF",
        backgroundImage: "radial-gradient(#d8cdb6 1px, transparent 1px)",
        backgroundSize: "16px 16px",
        backgroundPosition: "8px 8px",
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  );
}

// A small interactive playground: two draggable items + a view/edit toggle.
export const Playground: Story = {
  render: () => {
    const [locked, setLocked] = useState(false);
    const [a, setA] = useState<BoardItemPos>({ x: 40, y: 56 });
    const [b, setB] = useState<BoardItemPos>({ x: 300, y: 130 });
    const [za, setZa] = useState(1);
    const [zb, setZb] = useState(2);
    const front = (which: "a" | "b") => {
      const top = Math.max(za, zb) + 1;
      if (which === "a") setZa(top);
      else setZb(top);
    };
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Switch checked={!locked} onChange={(v) => setLocked(!v)} ariaLabel="Edit mode" />
          <span style={{ fontSize: 13 }}>{locked ? "View mode (locked)" : "Edit mode (drag enabled)"}</span>
        </label>
        <Board>
          <BoardItem
            x={a.x}
            y={a.y}
            z={za}
            width={156}
            height={152}
            rotation={-3}
            bounds={BOARD}
            locked={locked}
            onFocus={() => front("a")}
            onChange={setA}
            onRemove={() => {}}
          >
            <StickyNote
              color="#EAE5FA"
              pinColor="#FF8A8A"
              dateStamp="22 Jun"
              title="Drag me"
              text="Grab anywhere on the paper. The text field won't start a drag."
              readOnly
            />
          </BoardItem>

          <BoardItem
            x={b.x}
            y={b.y}
            z={zb}
            width={200}
            height={120}
            bounds={BOARD}
            locked={locked}
            onFocus={() => front("b")}
            onChange={setB}
            onRemove={() => {}}
          >
            <Card variant="surface" elevation="raised" padding="m" style={{ height: "100%", boxSizing: "border-box" }}>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>Any widget</div>
              <div style={{ fontSize: 13 }}>
                BoardItem positions, drags and z-orders whatever you put inside — a card, a
                calendar, a queue.
              </div>
            </Card>
          </BoardItem>
        </Board>
      </div>
    );
  },
};
