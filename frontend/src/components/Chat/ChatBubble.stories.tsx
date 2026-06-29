import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { http, HttpResponse } from 'msw';
import { within, userEvent } from 'storybook/test';
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
          "The floating clinic-chat launcher (bottom-right). Renders a black bubble with an unread badge and keeps a `ChatPanel` mounted but hidden so its state (active conversation, draft, scroll) survives open/close. Returns null unless `currentUserId` is provided. Click the bubble to reveal the panel; the websocket won't connect in Storybook, so the panel falls back to built-in demo staff and messages, and `POST /api/ai/chat` is mocked for the AI assistant thread.",
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
    currentUserId: { control: 'text' },
    currentUserName: { control: 'text' },
  },
  args: {
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

/** The resting launcher — a floating black bubble in the bottom-right corner. */
export const Default: Story = {};

/** The launcher clicked open, revealing the `ChatPanel` on its conversation list. */
export const Open: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByLabelText('Open clinic chat'));
    await canvas.findByText('Croc');
  },
};
