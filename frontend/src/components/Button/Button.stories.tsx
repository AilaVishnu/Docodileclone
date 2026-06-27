import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { Button } from './Button';

const VARIANTS = [
  'primary',
  'primaryLight',
  'secondary',
  'secondaryLight',
  'dark',
  'light',
] as const;

const meta = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The canonical pill button. Six color variants × four sizes, with optional left/right icon slots. Hover is handled internally; pass `disabled` to mute it. Heights step down below 1440px via the `--btn-*` CSS variables in globals.css.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: VARIANTS,
      description: 'Color treatment.',
      table: { defaultValue: { summary: 'primary' } },
    },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'smIcon', 'mdIcon'],
      description: 'Height + padding. The `*Icon` sizes are square, for icon-only buttons.',
      table: { defaultValue: { summary: 'md' } },
    },
    children: { control: 'text', description: 'Label content.' },
    disabled: { control: 'boolean' },
    iconLeft: { control: false },
    iconRight: { control: false },
    onClick: { control: false },
    style: { control: false },
  },
  args: {
    children: 'Button',
    variant: 'primary',
    size: 'md',
    disabled: false,
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Secondary: Story = { args: { variant: 'secondary' } };

export const Dark: Story = { args: { variant: 'dark' } };

export const Light: Story = { args: { variant: 'light' } };

export const Disabled: Story = { args: { disabled: true } };

export const WithIcons: Story = {
  args: {
    children: 'Add patient',
    iconLeft: <span aria-hidden>＋</span>,
  },
};

/** Every color variant at a glance. */
export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      {VARIANTS.map((v) => (
        <Button key={v} variant={v}>
          {v}
        </Button>
      ))}
    </div>
  ),
};

/** The two text sizes side by side. */
export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
    </div>
  ),
};
