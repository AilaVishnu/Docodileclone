import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { RangeCalendar } from './RangeCalendar';

const meta = {
  title: 'Components/RangeCalendar',
  component: RangeCalendar,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A start→end variant of the DatePicker calendar that reuses the same look. Click a start date then an end date (clicking earlier swaps them); the in-between days fill, and the Done button enables once both ends are chosen. Calls back via `onApply(start, end)`.',
      },
    },
  },
  argTypes: {
    initialStart: { control: false },
    initialEnd: { control: false },
    onApply: { control: false },
  },
  args: {
    onApply: () => {},
  },
} satisfies Meta<typeof RangeCalendar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Fresh — pick a start date, then an end date. */
export const Default: Story = {};

/** Pre-seeded with a range so the fill + endpoints + enabled Done are visible. */
export const WithRange: Story = {
  args: {
    initialStart: new Date('2026-06-08'),
    initialEnd: new Date('2026-06-20'),
  },
};

/** Only a start date chosen — Done stays disabled until an end is picked. */
export const StartOnly: Story = {
  args: {
    initialStart: new Date('2026-06-10'),
  },
};
