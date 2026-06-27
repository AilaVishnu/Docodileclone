import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { http, HttpResponse } from 'msw';
import { SessionTrayButton } from './SessionTrayButton';
import { withClinicSession } from '../../sb/decorators';
import { API_BASE_URL } from '../../apiConfig';
import type { ActiveSession } from '../../api/visits';

// Two in-progress consultations so the tray button renders (it returns null
// when the list is empty). `sessionStartedAt` is recent so the elapsed timer
// ticks live (within the 6h live window).
const now = Date.now();
const iso = (msAgo: number) => new Date(now - msAgo).toISOString();

const mockSessions: ActiveSession[] = [
  {
    visitId: 'v1',
    patientId: 'p1',
    appointmentId: 'a1',
    sessionStartedAt: iso(7 * 60 * 1000),
    name: 'Ramesh Babu',
    phone: '+918885672664',
    email: 'ramesh@example.com',
    gender: 'male',
    dob: '1986-03-12',
    age: 456,
    displayNo: 12,
  },
  {
    visitId: 'v2',
    patientId: 'p2',
    appointmentId: null,
    sessionStartedAt: iso(23 * 60 * 1000),
    name: 'Sita Lakshmi',
    phone: '+919000012345',
    email: null,
    gender: 'female',
    dob: '1994-07-02',
    age: 384,
    displayNo: 13,
  },
];

const meta = {
  title: 'Patterns/SessionTrayButton',
  component: SessionTrayButton,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The active-sessions indicator in the header. It polls `GET /api/active-sessions` and renders nothing when no consultation is in progress; with sessions it shows a prescription icon, a count badge, and a dropdown of live elapsed timers. This story overrides the endpoint to return two in-progress sessions so the button and its tray are visible.',
      },
    },
    msw: {
      handlers: [
        http.get(`${API_BASE_URL}/api/active-sessions`, () => HttpResponse.json(mockSessions)),
      ],
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
      <div style={{ padding: 24, minHeight: 380 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SessionTrayButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
