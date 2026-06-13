import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { HeaderPatientSearch } from './HeaderPatientSearch';
import { withClinicSession } from '../../sb/decorators';

const meta = {
  title: 'Patterns/HeaderPatientSearch',
  component: HeaderPatientSearch,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The header search pill. Type a name, T-number, or phone and pick a patient from the dropdown (rendered in the standard "T## : Name (M|age) +phone" row). Patients come from `GET /api/patients` (the default Storybook handler returns three sample patients), so typing e.g. "ram", "sita", or "t12" surfaces matching rows.',
      },
    },
  },
  argTypes: {
    onNavigate: { control: false },
  },
  args: {
    onNavigate: () => {},
  },
  decorators: [
    withClinicSession,
    (Story) => (
      <div style={{ padding: 24, minHeight: 420 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof HeaderPatientSearch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
