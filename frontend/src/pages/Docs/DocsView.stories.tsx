import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { SideNav } from '../../components/SideNav';
import { TopNav } from '../../components/TopNav';
import { DocsView } from './DocsView';
import { withClinicSession } from '../../sb/decorators';
import { colors } from '../../styles/theme';

/**
 * The Docs page in the real application shell — actual `SideNav` (Docs active)
 * and the sticky `TopNav`, with `DocsView` in the scrolling content panel.
 * Mirrors HomePage's layout exactly.
 */
const meta = {
  title: 'Pages/Docs',
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [withClinicSession],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const noop = () => {};

export const Page: Story = {
  render: () => (
    <div style={{ width: '100%', height: '100vh', overflow: 'hidden', backgroundColor: colors.active.shade300 }} data-theme="primary">
      <SideNav activeTab="Docs" onTabChange={noop} />
      <div style={{ marginLeft: 'var(--sidenav-w)', width: 'calc(100% - var(--sidenav-w))', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
          <TopNav onBuildClinic={noop} onViewAllClinics={noop} onLogout={noop} onNewAppointment={noop} />
          <main
            style={{
              padding: 'var(--page-pad-top) var(--page-pad-x) var(--page-pad-bottom)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--main-gap, 24px)',
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              overflowX: 'hidden',
              backgroundColor: colors.active.shade200,
              borderTopLeftRadius: 16,
              position: 'relative',
            }}
          >
            <DocsView />
          </main>
        </div>
      </div>
    </div>
  ),
};
