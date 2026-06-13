import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { http, HttpResponse } from 'msw';
import { ChatPanel } from './ChatPanel';
import { withClinicSession } from '../../sb/decorators';
import { API_BASE_URL } from '../../apiConfig';

const meta = {
  title: 'Patterns/ChatPanel',
  component: ChatPanel,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The Slack-style single-pane clinic chat. A conversation list (AI assistant, the clinic group, and per-teammate DMs) that opens into a thread with a message composer. The live data comes from `useChat`, a STOMP/SockJS websocket that cannot connect inside Storybook — so the panel uses its built-in demo staff and sample messages and shows a "Reconnecting…" banner. Opening the ✨ AI Assistant thread and sending a message hits `POST /api/ai/chat`, mocked here to return a canned reply. Wrapped in a 420×640 stage.',
      },
    },
    msw: {
      handlers: [
        http.post(`${API_BASE_URL}/api/ai/chat`, () =>
          HttpResponse.json({
            reply:
              'You have 3 patients waiting and 1 overdue review (Arjun Mehta, due 2 days ago). Want me to open his chart?',
          }),
        ),
      ],
    },
  },
  argTypes: {
    clinicId: { control: 'text' },
    currentUserId: { control: 'text' },
    currentUserName: { control: 'text' },
    onUnreadChange: { control: false },
    onClose: { control: false },
  },
  args: {
    clinicId: 'clinic-1',
    currentUserId: 'user-1',
    currentUserName: 'Sneha Pillai',
    onUnreadChange: () => {},
    onClose: () => {},
  },
  decorators: [
    withClinicSession,
    (Story) => (
      <div
        style={{
          width: 420,
          height: 640,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ChatPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
