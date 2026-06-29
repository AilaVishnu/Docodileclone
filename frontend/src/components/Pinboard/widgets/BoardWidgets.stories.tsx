import type { Meta, StoryObj } from "@storybook/react-webpack5";
import { HoursWidget } from "./HoursWidget";
import { StatsWidget } from "./StatsWidget";
import { QuickActionsWidget } from "./QuickActionsWidget";
import { QueueWidget } from "./QueueWidget";
import { Sticker } from "./Sticker";
import { colors } from "../../../styles/theme";
import { withSchedule } from "../../../sb/decorators";

// The functional widgets and decals that live on the pinboard alongside sticky
// notes. Each is shown at roughly the size it takes inside a BoardItem.

const meta = {
  title: "Patterns/Board widgets",
  tags: ["autodocs"],
  decorators: [
    withSchedule,
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

// Agenda treatments (text / mini-bars / chips) plus the timeline for reference.
const HOURS_OPTIONS = [
  ["agenda", "Agenda · text"],
  ["agendaBars", "Agenda · bars"],
  ["agendaChips", "Agenda · chips"],
  ["timeline", "Timeline"],
] as const;

export const Hours: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
      {HOURS_OPTIONS.map(([v, label]) => (
        <div key={v} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ fontSize: 12, color: colors.neutral600, fontFamily: "Inter, sans-serif" }}>{label}</span>
          <div style={{ width: 224, height: 190 }}>
            <HoursWidget variant={v} />
          </div>
        </div>
      ))}
    </div>
  ),
};

// Creative treatments for the weekly "This week" hours widget — pick a keeper.
// The Day strip (chosen) is shown compact; the others at the size each needs.
const THIS_WEEK_OPTIONS = [
  { v: "week", label: "Day strip (compact)", h: 140 },
  { v: "weekColumns", label: "Columns", h: 170 },
  { v: "agendaBars", label: "Ribbon", h: 232 },
  { v: "weekHeatRows", label: "Heatmap list", h: 232 },
  { v: "agenda", label: "List", h: 232 },
] as const;

export const ThisWeek: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap", maxWidth: 1180 }}>
      {THIS_WEEK_OPTIONS.map(({ v, label, h }) => (
        <div key={v} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ fontSize: 12, color: colors.neutral600, fontFamily: "Inter, sans-serif" }}>{label}</span>
          <div style={{ width: 224, height: h }}>
            <HoursWidget variant={v} />
          </div>
        </div>
      ))}
    </div>
  ),
};

// Four treatments of the "Today" stats widget to choose from.
const STATS_OPTIONS = [
  ["bar", "Composition bar"],
  ["icons", "Icon rows"],
  ["spotlight", "Spotlight"],
  ["list", "List (ref)"],
] as const;

export const Stats: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
      {STATS_OPTIONS.map(([v, label]) => (
        <div key={v} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ fontSize: 12, color: colors.neutral600, fontFamily: "Inter, sans-serif" }}>{label}</span>
          <div style={{ width: 208, height: 190 }}>
            <StatsWidget stats={SAMPLE_STATS} variant={v} />
          </div>
        </div>
      ))}
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
      <div style={{ width: 224, height: 168 }}>
        <HoursWidget />
      </div>
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
