import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { ContactCard } from './ContactCard';
import { DIRECTORY } from '../../pages/Catalog/catalogData';

const meta = {
  title: 'Components/ContactCard',
  component: ContactCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A directory tile for a Catalog party (referral doctor, lab, supplier or general contact). Shows identity + tags, a row of phonebook quick-actions (call / WhatsApp / email / directions) and an optional CTA. Used by the Catalog DirectoryView. Renders real `DIRECTORY` fixture entries from `catalogData`.',
      },
    },
  },
  argTypes: { onOpen: { control: false }, onEdit: { control: false } },
  decorators: [(Story) => <div style={{ width: 360 }}><Story /></div>],
} satisfies Meta<typeof ContactCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const noop = () => {};

/** Referral doctor — tags + all four quick-actions + a "Refer" CTA. */
export const ReferralDoctor: Story = {
  args: { entry: DIRECTORY['Referral doctors'][0], onOpen: noop },
};

/** Lab — different icon and tags, "Order test" CTA. */
export const Lab: Story = {
  args: { entry: DIRECTORY['Labs'][0], onOpen: noop },
};

/** With an edit affordance — passing `onEdit` reveals the pencil IconButton. */
export const Editable: Story = {
  args: { entry: DIRECTORY['Suppliers'][0], onOpen: noop, onEdit: noop },
};
