import type { Meta, StoryObj } from "@storybook/react-webpack5";
import { StatsWidget } from "./StatsWidget";
import { QuickActionsWidget } from "./QuickActionsWidget";
import { QueueWidget } from "./QueueWidget";
import { Sticker } from "./Sticker";
import { colors } from "../../../styles/theme";

// The functional widgets and decals that live on the pinboard alongside sticky
// notes. Each is shown at roughly the size it takes inside a BoardItem.

const meta = {
  title: "Patterns/Board widgets",
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div
        style={{
          display: "inline-block",
          padding: 28,
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
          "Functional widgets (calendar, today's stats, quick actions) and decorative stickers that the Pinboard hosts inside draggable BoardItems. Each reuses Card/Icon and theme tokens.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const SAMPLE_STATS = { totalAppointments: 9, newPatients: 3, reviews: 4, procedures: 2 };

export const Stats: Story = {
  render: () => (
    <div style={{ width: 200, height: 150 }}>
      <StatsWidget stats={SAMPLE_STATS} />
    </div>
  ),
};

export const QuickActions: Story = {
  render: () => (
    <div style={{ width: 196, height: 130 }}>
      <QuickActionsWidget onAction={() => {}} />
    </div>
  ),
};

export const Queue: Story = {
  render: () => (
    <div style={{ width: 200, height: 150 }}>
      <QueueWidget moreWaiting={2} />
    </div>
  ),
};

export const Stickers: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
      <div style={{ width: 48, height: 48 }}>
        <Sticker name="star" color={colors.yellow200} size={40} rotation={8} />
      </div>
      <div style={{ width: 48, height: 48 }}>
        <Sticker name="mask-happy" color={colors.red200} size={36} />
      </div>
      <div style={{ width: 48, height: 48 }}>
        <Sticker name="heart-pulse" color={colors.primary600} size={38} rotation={-10} />
      </div>
      <div style={{ width: 48, height: 48 }}>
        <Sticker name="stethoscope" color={colors.secondary600} size={38} rotation={6} />
      </div>
      <div style={{ width: 96, height: 22 }}>
        <Sticker variant="tape" color={colors.green200} rotation={-4} />
      </div>
    </div>
  ),
};

// All widgets together on one cork backdrop — the board vocabulary at a glance.
export const Gallery: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 24, flexWrap: "wrap", maxWidth: 720 }}>
      <div style={{ width: 200, height: 150 }}>
        <StatsWidget stats={SAMPLE_STATS} />
      </div>
      <div style={{ width: 196, height: 130 }}>
        <QuickActionsWidget onAction={() => {}} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 18, paddingTop: 8 }}>
        <Sticker name="star" color={colors.yellow200} size={36} rotation={8} style={{ width: 44, height: 44 }} />
        <Sticker name="heart-pulse" color={colors.red200} size={32} style={{ width: 40, height: 40 }} />
      </div>
    </div>
  ),
};
