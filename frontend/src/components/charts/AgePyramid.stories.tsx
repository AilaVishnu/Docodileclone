import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { AgePyramid } from './index';
import { withSize } from '../../sb/decorators';

const meta = {
  title: 'Components/Charts/AgePyramid',
  component: AgePyramid,
  tags: ['autodocs'],
  decorators: [withSize(440, 220)],
  parameters: {
    docs: {
      description: {
        component:
          'Diverging age-pyramid bar chart with male counts mirrored to the left and female to the right across age bands.',
      },
    },
  },
  args: {
    height: 220,
    leftColor: '#2563EB',
    rightColor: '#DB2777',
    data: [
      { band: '0–9', male: 64, female: 58 },
      { band: '10–19', male: 82, female: 76 },
      { band: '20–39', male: 140, female: 162 },
      { band: '40–59', male: 118, female: 124 },
      { band: '60+', male: 71, female: 86 },
    ],
  },
} satisfies Meta<typeof AgePyramid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
