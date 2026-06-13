import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { Field } from './Field';

const meta = {
  title: 'Components/Field',
  component: Field,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The canonical text input. Three looks — underline / box / pill — with optional left/right icon slots, an error line, and an auto-growing multiline mode. Heights track the `--input-h` CSS variable responsively.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['underline', 'box', 'pill'],
      table: { defaultValue: { summary: 'underline' } },
    },
    type: {
      control: 'select',
      options: ['text', 'password', 'email', 'tel', 'number', 'search'],
    },
    error: { control: 'boolean' },
    disabled: { control: 'boolean' },
    multiline: { control: 'boolean' },
    placeholder: { control: 'text' },
    errorMessage: { control: 'text' },
    value: { control: 'text' },
    onChange: { control: false },
    iconLeft: { control: false },
    iconRight: { control: false },
    style: { control: false },
    inputStyle: { control: false },
  },
  args: {
    variant: 'box',
    placeholder: 'Type here…',
    value: '',
  },
  decorators: [
    (Story) => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    ),
  ],
  // Controlled wrapper: Field is value/onChange — drive it with local state so
  // typing works, while still honouring the `value` control.
  render: (args) => {
    const [value, setValue] = useState(args.value ?? '');
    React.useEffect(() => setValue(args.value ?? ''), [args.value]);
    return <Field {...args} value={value} onChange={setValue} />;
  },
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Underline: Story = {
  args: { variant: 'underline', placeholder: 'Patient name' },
};

export const Box: Story = {
  args: { variant: 'box', placeholder: 'Email', type: 'email' },
};

export const Pill: Story = {
  args: { variant: 'pill', placeholder: 'Search…', type: 'search' },
};

export const WithError: Story = {
  args: {
    variant: 'box',
    value: 'taken-name',
    error: true,
    errorMessage: 'That domain is already taken',
  },
};

export const Disabled: Story = {
  args: { variant: 'box', value: 'Read only', disabled: true },
};

export const Multiline: Story = {
  args: { variant: 'box', placeholder: 'Notes…', multiline: true },
};
