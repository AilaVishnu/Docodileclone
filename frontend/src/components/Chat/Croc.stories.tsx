import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { Croc } from './Croc';

const meta = {
  title: 'Patterns/Croc',
  component: Croc,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Croc — the Docodile mascot. A self-contained circular illustration used as the in-chat AI assistant avatar (see `Patterns/ChatPanel`). The artwork fills a round body, so it drops straight into an avatar slot without a wrapper circle. Pass `size` (px) and an optional `title` for an accessible label.',
      },
    },
  },
  argTypes: {
    size: { control: { type: 'range', min: 16, max: 160, step: 4 } },
    title: { control: 'text' },
  },
  args: { size: 96 },
} satisfies Meta<typeof Croc>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default mascot at a comfortable preview size. */
export const Default: Story = {};

/** The avatar sizes used in the chat panel: 32px (conversation list) and 28px (thread header). */
export const AvatarSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16 }}>
      <Croc size={28} title="Croc, 28px" />
      <Croc size={32} title="Croc, 32px" />
      <Croc size={48} title="Croc, 48px" />
      <Croc size={96} title="Croc, 96px" />
    </div>
  ),
};
