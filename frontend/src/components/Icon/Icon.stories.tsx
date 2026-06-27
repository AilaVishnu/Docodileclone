import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { Icon } from './Icon';
import { ICON_NAMES } from './iconRegistry';

const meta = {
  title: 'Components/Icon',
  component: Icon,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The one way to render an icon. `name` picks from the registry (see Foundations/Icons for the full set). ' +
          '`size` scales the same SVG (24 default, 20 small); `tone` / `color` / `disabled` recolour monochrome ' +
          'icons via currentColor. Multicolor icons keep their palette.',
      },
    },
  },
  argTypes: {
    name: { control: 'select', options: ICON_NAMES },
    size: { control: { type: 'number', min: 12, max: 64, step: 2 } },
    tone: { control: 'inline-radio', options: ['default', 'muted', 'disabled', 'inverse'] },
    color: { control: 'color' },
    disabled: { control: 'boolean' },
  },
  args: { name: 'bell', size: 24, tone: 'default' },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Default: Story = { args: { name: 'calendar' } };

export const Small: Story = { args: { name: 'calendar', size: 20 } };

export const Muted: Story = { args: { name: 'calendar', tone: 'muted' } };

export const Disabled: Story = { args: { name: 'calendar', disabled: true } };

/** Multicolor icon — keeps its baked palette; tone/color are ignored. */
export const Multicolor: Story = { args: { name: 'check-circle' } };
