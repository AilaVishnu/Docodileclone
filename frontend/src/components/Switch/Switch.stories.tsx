import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { Switch } from './Switch';

const meta = {
  title: 'Components/Switch',
  component: Switch,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Accessible toggle (role="switch") with an optional hint. Controlled via `checked`/`onChange`. Keyboard-operable (Space/Enter). Two sizes.',
      },
    },
  },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: ['sm', 'md'],
      table: { defaultValue: { summary: 'md' } },
    },
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    hint: { control: 'text' },
    ariaLabel: { control: 'text' },
    onChange: { control: false },
  },
  args: { checked: false, size: 'md', ariaLabel: 'Toggle setting' },
  render: (args) => {
    const [checked, setChecked] = useState(args.checked ?? false);
    React.useEffect(() => setChecked(args.checked ?? false), [args.checked]);
    return <Switch {...args} checked={checked} onChange={setChecked} />;
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Off: Story = {};

export const On: Story = { args: { checked: true } };

export const WithHint: Story = { args: { checked: true, hint: 'Email notifications' } };

export const Disabled: Story = { args: { disabled: true } };

export const Small: Story = { args: { size: 'sm', checked: true } };
