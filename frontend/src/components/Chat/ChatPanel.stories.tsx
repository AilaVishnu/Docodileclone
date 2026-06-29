import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { http, HttpResponse } from 'msw';
import { within, userEvent, expect, waitFor } from 'storybook/test';
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
          'The Slack-style single-pane clinic chat. A conversation list (Croc, the # Clinic group, and per-teammate DMs) that opens into a thread with a message composer. Live data comes from `useChat`, a STOMP/SockJS websocket that cannot connect inside Storybook — so the panel falls back to built-in demo staff + sample messages and shows a "Reconnecting…" banner in any open thread. Opening the Croc thread and sending a message hits `POST /api/ai/chat`, mocked here. Each story below drives the panel into one of its pages via a `play` interaction.',
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
    currentUserId: { control: 'text' },
    currentUserName: { control: 'text' },
    isOpen: { control: 'boolean' },
    onUnreadChange: { control: false },
    onClose: { control: false },
  },
  args: {
    currentUserId: 'user-1',
    currentUserName: 'Sneha Pillai',
    isOpen: true,
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

/**
 * The conversation list (the panel's home page): Croc, the # Clinic
 * group, and a DM row per teammate with presence dots and unread badges.
 */
export const Default: Story = {};

/**
 * The Croc thread, empty — its suggestion prompt before the first
 * question. The status line reads "Clinic-scoped, read-only".
 */
export const AIAssistant: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByText('Croc'));
    await canvas.findByText('Ask about your clinic');
  },
};

/**
 * The Croc mid-conversation: ask a question and the panel posts to
 * `/api/ai/chat` (mocked) and renders the assistant's reply bubble.
 */
export const AIAssistantConversation: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByText('Croc'));
    const input = await canvas.findByPlaceholderText('Type a message…');
    // Submit via Enter (onKeyDown) — doesn't depend on the Send button's
    // enabled state having flushed after the controlled-input update.
    await userEvent.type(input, 'How many patients are waiting?{Enter}');
    await waitFor(() => expect(canvas.getByText(/3 patients waiting/i)).toBeInTheDocument());
  },
};

/**
 * The # Clinic group thread — sample multi-sender messages with day separators
 * and per-sender name labels. The "Reconnecting…" banner shows because the
 * websocket can't connect in Storybook.
 */
export const GroupThread: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByText('# Clinic'));
    await canvas.findByPlaceholderText('Type a message…');
  },
};

/**
 * A one-to-one DM thread (Dr. Anika Reddy) — own vs partner bubbles, the
 * online/offline status line in the header, and the composer.
 */
export const DirectMessage: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByText('Dr. Anika Reddy'));
    await canvas.findByPlaceholderText('Type a message…');
  },
};

/**
 * The voice-note recording state of the composer: a live waveform, elapsed
 * timer, and cancel / send controls. `getUserMedia` + `MediaRecorder` are
 * stubbed so the recorder starts without real microphone access.
 */
export const Recording: Story = {
  play: async ({ canvasElement }) => {
    // Stub the media APIs the recorder touches so the UI can enter the
    // recording state inside Storybook (no real mic permission / stream).
    const fakeStream = { getTracks: () => [{ stop() {} }] } as unknown as MediaStream;
    const md = (navigator.mediaDevices ??= {} as MediaDevices);
    md.getUserMedia = (async () => fakeStream) as MediaDevices['getUserMedia'];
    class FakeMediaRecorder {
      onstop: (() => void) | null = null;
      stream = fakeStream;
      start() {}
      stop() { this.onstop?.(); }
    }
    (window as unknown as { MediaRecorder: unknown }).MediaRecorder = FakeMediaRecorder;

    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByText('Dr. Anika Reddy'));
    await userEvent.click(await canvas.findByLabelText('Record voice note'));
    await canvas.findByLabelText('Send voice note');
  },
};
