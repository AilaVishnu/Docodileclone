import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { ContactCard } from './ContactCard';
import type { DirEntry } from '../../pages/Catalog/catalogData';
import { Icon } from '../Icon';

// The app's DIRECTORY ships empty (no demo data), so the story carries its own
// representative fixtures to exercise the card's variants.
const doctor: DirEntry = {
  id: 'd1', name: 'Dr. Anjali Menon', subtitle: 'Dermatosurgery · Apollo',
  icon: <Icon name="stethoscope" tone="inherit" size={22} />, tags: ['We refer', 'Preferred'],
  phone: '+91 98201 11111', whatsapp: true, email: 'anjali@apollo.in', address: 'Apollo, Jubilee Hills', cta: 'Refer',
};
const lab: DirEntry = {
  id: 'l1', name: 'Metropolis Labs', subtitle: 'Pathology · home collection',
  icon: <Icon name="heart-pulse" tone="inherit" size={22} />, tags: ['Contract rates', 'TAT 24h'],
  phone: '+91 80000 44444', whatsapp: true, email: 'hyd@metropolis.in', cta: 'Order test',
};
const supplier: DirEntry = {
  id: 'v1', name: 'MedPlus Distribution', subtitle: 'Pharma distributor',
  icon: <Icon name="buildings" tone="inherit" size={22} />, tags: ['Net 30', 'Primary'],
  phone: '+91 70000 77777', whatsapp: true, email: 'orders@medplus.in', cta: 'Reorder',
};

const meta = {
  title: 'Components/ContactCard',
  component: ContactCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A directory tile for a Catalog party (referral doctor, lab, supplier or general contact). Shows identity + tags, a row of phonebook quick-actions (call / WhatsApp / email / directions) and an optional CTA. Used by the Catalog DirectoryView.',
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
  args: { entry: doctor, onOpen: noop },
};

/** Lab — different icon and tags, "Order test" CTA. */
export const Lab: Story = {
  args: { entry: lab, onOpen: noop },
};

/** With an edit affordance — passing `onEdit` reveals the pencil IconButton. */
export const Editable: Story = {
  args: { entry: supplier, onOpen: noop, onEdit: noop },
};
