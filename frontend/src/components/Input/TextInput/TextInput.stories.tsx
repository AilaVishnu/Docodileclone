import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { TextInput } from './TextInput';

const meta = {
  title: 'Components/Input/TextInput',
  component: TextInput,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Thin alias for the canonical `<Field variant="underline">`. Controlled via `value`/`onChange`, with optional icon slots, an error line, password/email types, and a multiline mode.',
      },
    },
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'password', 'email'],
      table: { defaultValue: { summary: 'text' } },
    },
    error: { control: 'boolean' },
    multiline: { control: 'boolean' },
    placeholder: { control: 'text' },
    errorMessage: { control: 'text' },
    maxLength: { control: 'number' },
    value: { control: 'text' },
    onChange: { control: false },
    onKeyDown: { control: false },
    onBlur: { control: false },
    iconLeft: { control: false },
    iconRight: { control: false },
  },
  args: {
    placeholder: 'Patient name',
    value: '',
  },
  decorators: [
    (Story) => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    ),
  ],
  render: (args) => {
    const [value, setValue] = useState(args.value ?? '');
    React.useEffect(() => setValue(args.value ?? ''), [args.value]);
    return <TextInput {...args} value={value} onChange={setValue} />;
  },
} satisfies Meta<typeof TextInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Password: Story = {
  args: { placeholder: 'Password', type: 'password' },
};

export const WithError: Story = {
  args: {
    value: 'taken-name',
    error: true,
    errorMessage: 'That name is already in use',
  },
};

export const Multiline: Story = {
  args: { placeholder: 'Notes…', multiline: true },
};
