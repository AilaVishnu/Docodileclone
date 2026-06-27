import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { SessionBar } from './SessionBar';
import { withClinicSession } from '../../sb/decorators';

const meta = {
  title: 'Patterns/SessionBar',
  component: SessionBar,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The floating session toolbar shown at the bottom of the Prescription page. A dark pill with a cream timer; the right-side controls swap between Start Session (idle), Pause / Restart / Stop (running), and a frozen "Session Ended" view. It persists its full timer state under the `docodile_session_state` localStorage key when given a `storageKey`. Normally `position: fixed`; wrapped here in a sized `position: relative` stage so it stays in view.',
      },
    },
    layout: 'fullscreen',
  },
  argTypes: {
    storageKey: { control: 'text', description: 'localStorage key to persist timer state under.' },
    readOnly: { control: 'boolean', description: 'Frozen historic-visit view; never writes localStorage.' },
    recordedDurationSec: { control: 'number', description: 'Duration shown in the readOnly view.' },
    bottomOffset: { control: 'number' },
    onPrint: { control: false },
    onDownload: { control: false },
    onShare: { control: false },
    onRestart: { control: false },
    onStart: { control: false },
    onEnd: { control: false },
    onActiveChange: { control: false },
    recordedEndedAtMs: { control: false },
  },
  args: {
    storageKey: 'sb-demo-visit',
    readOnly: false,
    onPrint: () => {},
    onDownload: () => {},
    onShare: () => {},
  },
  decorators: [
    withClinicSession,
    (Story) => (
      <div style={{ position: 'relative', height: 160, width: '100%' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SessionBar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Idle bar — only the green Start Session button is shown. */
export const Default: Story = {};

/** Frozen historic-visit view with a recorded duration and the export icons. */
export const ReadOnly: Story = {
  args: {
    readOnly: true,
    recordedDurationSec: 1287,
    storageKey: undefined,
  },
};
