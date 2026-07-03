import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { Page, Group } from '../foundations/_kit';
import { Toast } from '../../components/Toast';
import { HintCard } from '../../components/HintCard';

// Consolidation view: the feedback surfaces. Toast is fixed-position, so each is
// pinned open (isVisible + duration:0) inside a position:relative stage so it
// sits inline instead of floating over the viewport. Reuses the real components.

const meta = {
  title: 'Overview/Feedback',
  parameters: { layout: 'fullscreen', options: { showPanel: false } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** A relative stage so the fixed-position Toast anchors inside the box. */
const Stage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      position: 'relative',
      minHeight: 96,
      border: '1px dashed #E3E3E3',
      borderRadius: 12,
      background: '#FAFAF9',
      overflow: 'hidden',
    }}
  >
    {children}
  </div>
);

export const All: Story = {
  render: () => (
    <Page
      title="Feedback"
      intro="The transient feedback surfaces. Toast is the single canonical toast in the system — there is no other toast component; everything routes through it. It is fixed-position, so it is pinned open (isVisible, duration: 0) inside a relative stage here so you can see it inline."
    >
      <Group
        label="Toast — the one canonical toast"
        note="Pinned open with isVisible + duration:0. In the app it auto-dismisses after `duration` ms and floats over the viewport."
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 520 }}>
          <Stage>
            <Toast message="Clinic created successfully" isVisible duration={0} onClose={() => {}} />
          </Stage>
          <Stage>
            <Toast
              message="Doctor removed"
              actionLabel="Undo"
              onAction={() => {}}
              isVisible
              duration={0}
              onClose={() => {}}
            />
          </Stage>
        </div>
      </Group>

      <Group label="HintCard — inline guidance">
        <div style={{ width: 320 }}>
          <HintCard description="Add your first doctor to begin scheduling appointments." />
        </div>
      </Group>
    </Page>
  ),
};
