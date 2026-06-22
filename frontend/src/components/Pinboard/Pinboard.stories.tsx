import type { Meta, StoryObj } from "@storybook/react-webpack5";
import { Pinboard, type PinboardItem } from "./Pinboard";
import { colors } from "../../styles/theme";
import { withSchedule } from "../../sb/decorators";

// A free-drag canvas hosting sticky notes + functional widgets + stickers.
// Stories run with persist=false (in-memory) so they're deterministic; toggle
// "Editing" inside the story to drag items, add from the palette, or remove.

const SAMPLE_STATS = { totalAppointments: 9, newPatients: 3, reviews: 4, procedures: 2 };
const SAMPLE_QUEUE = {
  entries: [
    { id: "1", name: "Bella", note: "room 2", state: "seeing" as const },
    { id: "2", name: "Max", note: "walk-in", state: "waiting" as const },
  ],
  moreWaiting: 2,
};

const SEED: PinboardItem[] = [
  { id: "cal", type: "calendar", x: 16, y: 16, z: 1, w: 224, h: 192 },
  { id: "queue", type: "queue", x: 240, y: 16, z: 2, w: 200, h: 150 },
  { id: "stats", type: "stats", x: 462, y: 16, z: 3, w: 200, h: 150 },
  { id: "actions", type: "quickActions", x: 462, y: 182, z: 4, w: 196, h: 130 },
  {
    id: "note1",
    type: "sticky",
    x: 240,
    y: 182,
    z: 5,
    w: 156,
    h: 152,
    rotation: -3,
    sticky: {
      title: "Follow up",
      text: "Call Mrs Patel re: Bella's bloodwork.",
      color: "#EAE5FA",
      pinColor: colors.primary400,
      torn: false,
      createdAt: "2026-06-20T09:00:00.000Z",
    },
  },
  {
    id: "note2",
    type: "sticky",
    x: 40,
    y: 250,
    z: 6,
    w: 156,
    h: 152,
    rotation: 3,
    sticky: {
      title: "Restock",
      text: "Vaccines — reorder before Friday.",
      color: "#CFEED5",
      pinColor: colors.primary400,
      torn: true,
      createdAt: "2026-06-21T08:30:00.000Z",
    },
  },
  {
    id: "star",
    type: "sticker",
    x: 210,
    y: 360,
    z: 7,
    w: 48,
    h: 48,
    rotation: 8,
    sticker: { variant: "icon", name: "star", color: colors.yellow200, size: 36 },
  },
  {
    id: "paws",
    type: "sticker",
    x: 470,
    y: 330,
    z: 8,
    w: 44,
    h: 44,
    rotation: -10,
    sticker: { variant: "icon", name: "heart-pulse", color: colors.primary600, size: 34 },
  },
];

const meta = {
  title: "Patterns/Pinboard",
  component: Pinboard,
  tags: ["autodocs"],
  decorators: [
    withSchedule,
    (Story) => (
      <div style={{ width: 820, height: 500 }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "The home pinboard: every object — sticky note, calendar, queue, today's stats, quick actions, sticker — is a free-drag, z-ordered BoardItem. Toggle Editing to drag, add from the palette, or remove. Layout persists per account (localStorage key from the auth token); stories use persist=false.",
      },
    },
  },
} satisfies Meta<typeof Pinboard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    seed: SEED,
    persist: false,
    stats: SAMPLE_STATS,
    queue: SAMPLE_QUEUE,
    onAction: () => {},
  },
};

export const Empty: Story = {
  args: {
    seed: [],
    persist: false,
    stats: SAMPLE_STATS,
    queue: SAMPLE_QUEUE,
  },
};
