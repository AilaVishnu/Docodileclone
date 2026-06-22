import type { Meta, StoryObj } from "@storybook/react-webpack5";
import { Pinboard, type PinboardItem } from "../../components/Pinboard";
import { withClinicSession, withSchedule } from "../../sb/decorators";
import { colors } from "../../styles/theme";

// The Home screen as a free-drag pinboard hosting every object type:
// my-hours widget, today's stats, queue, quick actions, sticky notes and
// stickers. This mirrors what HomeView renders — refine the layout here, then
// mirror the seed into HomeView.

const STATS = { totalAppointments: 9, newPatients: 3, reviews: 4, procedures: 2 };
const QUEUE = {
  entries: [
    { id: "1", name: "Bella", note: "room 2", state: "seeing" as const },
    { id: "2", name: "Max", note: "walk-in", state: "waiting" as const },
  ],
  moreWaiting: 2,
};

// Established sticky-note paper palette (same as StickyNote / MemoBoard).
const NOTE_PURPLE = "#EAE5FA";
const NOTE_GREEN = "#CFEED5";

const SEED: PinboardItem[] = [
  { id: "cal", type: "calendar", x: 24, y: 24, z: 1, w: 224, h: 192 },
  { id: "stats", type: "stats", x: 272, y: 24, z: 2, w: 208, h: 150 },
  { id: "actions", type: "quickActions", x: 504, y: 24, z: 4, w: 208, h: 150 },
  { id: "queue", type: "queue", x: 272, y: 196, z: 3, w: 208, h: 170 },
  {
    id: "note1",
    type: "sticky",
    x: 504,
    y: 196,
    z: 5,
    w: 156,
    h: 152,
    rotation: -3,
    sticky: {
      title: "Follow up",
      text: "Call Mrs Patel re: Bella's bloodwork.",
      color: NOTE_PURPLE,
      pinColor: colors.primary400,
      torn: false,
      createdAt: "2026-06-20T09:00:00.000Z",
    },
  },
  {
    id: "note2",
    type: "sticky",
    x: 700,
    y: 40,
    z: 6,
    w: 156,
    h: 152,
    rotation: 3,
    sticky: {
      title: "Restock",
      text: "Vaccines — reorder before Friday.",
      color: NOTE_GREEN,
      pinColor: colors.primary400,
      torn: true,
      createdAt: "2026-06-21T08:30:00.000Z",
    },
  },
  {
    id: "star",
    type: "sticker",
    x: 700,
    y: 232,
    z: 7,
    w: 48,
    h: 48,
    rotation: 8,
    sticker: { variant: "icon", name: "star", color: colors.yellow200, size: 36 },
  },
  {
    id: "pulse",
    type: "sticker",
    x: 100,
    y: 250,
    z: 8,
    w: 44,
    h: 44,
    rotation: -10,
    sticker: { variant: "icon", name: "heart-pulse", color: colors.primary600, size: 34 },
  },
];

const meta = {
  title: "Pages/Home",
  component: Pinboard,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "The Home screen as a free-drag pinboard. Every object — calendar, today's stats, queue, quick actions, sticky notes, stickers — is a draggable BoardItem; the floating bar adds items and toggles delete. Refine the layout here, then mirror the seed into HomeView.",
      },
    },
  },
  decorators: [
    withClinicSession,
    withSchedule,
    // Constrain to a realistic screen width so the layout reads like the real
    // Home content area (not Storybook's ultra-wide iframe).
    (Story) => (
      <div style={{ width: "100%", maxWidth: 1320, height: 620, margin: "0 auto" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Pinboard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    seed: SEED,
    stats: STATS,
    queue: QUEUE,
    persist: false,
    onAction: () => {},
  },
};
