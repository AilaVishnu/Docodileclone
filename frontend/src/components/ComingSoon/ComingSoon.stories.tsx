import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { ComingSoon } from './ComingSoon';

const meta = {
  title: 'Components/ComingSoon',
  component: ComingSoon,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Placeholder for not-yet-built modules. Gives the page the same sticky `<PageHeader>` + scroll-container shell as the real modules, with a simple "coming soon" body. Renders absolutely, so stories wrap it in a relative, fixed-height box.',
      },
    },
  },
  argTypes: {
    title: { control: 'text' },
  },
  args: {
    title: 'Bills',
  },
  decorators: [
    (Story) => (
      <div style={{ position: 'relative', height: 320 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ComingSoon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Reports: Story = { args: { title: 'Reports' } };
