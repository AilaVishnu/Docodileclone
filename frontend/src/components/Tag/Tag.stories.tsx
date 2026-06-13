import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { Tag } from './Tag';

const meta = {
  title: 'Components/Tag',
  component: Tag,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Design-system tag pill in two looks: `outline` (white bg, sage border — autocomplete chips) and `filled` (dark sage bg, white text — the specialty picker). A small ✕ button appears only when `onRemove` is set.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['outline', 'filled'],
      table: { defaultValue: { summary: 'outline' } },
    },
    label: { control: 'text' },
    removeLabel: { control: 'text' },
    onRemove: { control: false },
    style: { control: false },
  },
  args: {
    label: 'Dengue Fever',
    variant: 'outline',
  },
} satisfies Meta<typeof Tag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Outline: Story = {};

export const Filled: Story = { args: { variant: 'filled' } };

export const Removable: Story = {
  args: {
    onRemove: () => {},
    removeLabel: 'Remove Dengue Fever',
  },
};

export const FilledRemovable: Story = {
  args: {
    variant: 'filled',
    onRemove: () => {},
    removeLabel: 'Remove Dengue Fever',
  },
};

/** Both variants, plain and removable. */
export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
      <Tag label="Outline" variant="outline" />
      <Tag label="Outline" variant="outline" onRemove={() => {}} removeLabel="Remove" />
      <Tag label="Filled" variant="filled" />
      <Tag label="Filled" variant="filled" onRemove={() => {}} removeLabel="Remove" />
    </div>
  ),
};
