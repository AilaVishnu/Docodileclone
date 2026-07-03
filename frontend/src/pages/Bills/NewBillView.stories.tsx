import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { SideNav } from '../../components/SideNav';
import { TopNav } from '../../components/TopNav';
import { NewBillView } from './NewBillView';
import { withClinicSession } from '../../sb/decorators';
import { colors } from '../../styles/theme';

/**
 * New Bill — the consolidated page (mock). The Bills "New bill" CTA opens this
 * full page that combines the New-Appointment patient block (avatar + details)
 * with the BillModal's bill content (line items, summary, split payments).
 */
const meta = {
  title: 'Pages/Bills/New Bill',
  component: NewBillView,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [withClinicSession],
} satisfies Meta<typeof NewBillView>;

export default meta;
type Story = StoryObj<typeof meta>;

const noop = () => {};

export const Page: Story = {
  render: () => (
    <div style={{ width: '100%', height: '100vh', overflow: 'hidden', backgroundColor: colors.active.shade300 }} data-theme="primary">
      <SideNav activeTab="Billing" onTabChange={noop} />
      <div style={{ marginLeft: 'var(--sidenav-w)', width: 'calc(100% - var(--sidenav-w))', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
          <TopNav onBuildClinic={noop} onViewAllClinics={noop} onLogout={noop} onNewAppointment={noop} />
          <main style={{ flex: 1, minHeight: 0, position: 'relative', backgroundColor: colors.active.shade200, borderTopLeftRadius: 16, overflow: 'hidden' }}>
            <NewBillView onBack={noop} />
          </main>
        </div>
      </div>
    </div>
  ),
};
