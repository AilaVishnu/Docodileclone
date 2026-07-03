import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { PageHeader } from './PageHeader';
import { Button } from '../Button/Button';

const meta = {
  title: 'Components/PageHeader',
  component: PageHeader,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The shared sticky app-bar for full-page views. Three zones: a back button (left), a centered title, and right-hand actions. Omit `onBack` to hide the arrow while keeping the title centered. Set `wrapTitle={false}` to supply your own heading markup.',
      },
    },
    layout: 'fullscreen',
  },
  argTypes: {
    title: { control: 'text' },
    backLabel: { control: 'text' },
    wrapTitle: { control: 'boolean', table: { defaultValue: { summary: 'true' } } },
    onBack: { control: false },
    actions: { control: false },
    style: { control: false },
    innerStyle: { control: false },
  },
  args: {
    title: 'Patients',
    onBack: () => {},
    backLabel: 'Back',
  },
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Back arrow + centered title. */
export const Default: Story = {};

/** With a right-hand action button. */
export const WithActions: Story = {
  args: {
    title: 'Pharmacy',
    actions: (
      <Button variant="primary" size="sm">
        Add stock
      </Button>
    ),
  },
};

/** No back button — the left slot stays empty so the title stays centered. */
export const NoBack: Story = {
  args: { title: 'Dashboard', onBack: undefined },
};
