import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { ConfirmDialog } from './ConfirmDialog';
import { Button } from '../Button';

const meta = {
  title: 'Components/ConfirmDialog',
  component: ConfirmDialog,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The one canonical "are you sure?" dialog — built on `<Modal level="top">` so it floats above whatever opened it. `destructive` gives a red confirm (cancel / delete / end); `hideCancel` makes it an alert (single button). Replaces ~7 hand-rolled confirm overlays.',
      },
    },
  },
  argTypes: {
    isOpen: { control: 'boolean' },
    message: { control: 'text' },
    destructive: { control: 'boolean' },
    hideCancel: { control: 'boolean' },
    onConfirm: { control: false },
    onCancel: { control: false },
  },
  args: {
    isOpen: true,
    title: 'Are you sure?',
    message: 'This action cannot be undone.',
    confirmLabel: 'Yes',
    cancelLabel: 'Nope',
  },
  render: (args) => {
    const [open, setOpen] = useState(true);
    return (
      <div>
        <Button onClick={() => setOpen(true)}>Re-open dialog</Button>
        <ConfirmDialog {...args} isOpen={open} onConfirm={() => setOpen(false)} onCancel={() => setOpen(false)} />
      </div>
    );
  },
} satisfies Meta<typeof ConfirmDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Standard confirm — dark confirm button. */
export const Default: Story = {};

/** Destructive — red confirm for cancel / delete / end actions. */
export const Destructive: Story = {
  args: {
    title: 'Cancel this appointment?',
    message: 'The slot will be freed and the patient will need to rebook.',
    confirmLabel: 'Yes, cancel',
    destructive: true,
  },
};

/** Alert — a single button (no cancel). */
export const Alert: Story = {
  args: {
    title: 'Walk-in failed',
    message: "Couldn't create the walk-in. Please try again.",
    confirmLabel: 'OK',
    hideCancel: true,
  },
};
