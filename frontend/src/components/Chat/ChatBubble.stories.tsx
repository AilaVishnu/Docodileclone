import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { http, HttpResponse } from 'msw';
import { ChatBubble } from './ChatBubble';
import { withClinicSession } from '../../sb/decorators';
import { API_BASE_URL } from '../../apiConfig';

const meta = {
  title: 'Patterns/ChatBubble',
  component: ChatBubble,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The floating clinic-chat launcher (bottom-right). Renders a black bubble with an unread badge and keeps a `ChatPanel` mounted but hidden so its state survives open/close. Returns null unless `clinicId` and `currentUserId` are provided — all three identity props are supplied here. Click the bubble to reveal the panel. The panel\'s websocket won\'t connect in Storybook, so it falls back to built-in demo staff and messages; the `POST /api/ai/chat` handler backs the AI assistant thread.',
      },
    },
    layout: 'fullscreen',
    msw: {
      handlers: [
        http.post(`${API_BASE_URL}/api/ai/chat`, () =>
          HttpResponse.json({
            reply:
              'Three patients are currently waiting. The longest wait is Ramesh Babu at 14 minutes.',
          }),
        ),
      ],
    },
  },
  argTypes: {
    clinicId: { control: 'text' },
    currentUserId: { control: 'text' },
    currentUserName: { control: 'text' },
  },
  args: {
    clinicId: 'clinic-1',
    currentUserId: 'user-1',
    currentUserName: 'Sneha Pillai',
  },
  decorators: [
    withClinicSession,
    (Story) => (
      <div style={{ position: 'relative', height: 640, width: '100%' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ChatBubble>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
