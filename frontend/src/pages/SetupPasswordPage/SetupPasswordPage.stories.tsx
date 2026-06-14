import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { MemoryRouter } from 'react-router-dom';
import { SetupPasswordPage } from './SetupPasswordPage';

// The page reads ?token=… via useSearchParams and validates it against
// /auth/validate-token (mocked in sb/handlers). token "admin" → green ADMIN
// theme, else peach STAFF; empty token → the "Link Expired" state.
const withToken = (token: string) => (Story: React.ComponentType) => (
  <MemoryRouter initialEntries={[`/setup-password?token=${token}`]}>
    <Story />
  </MemoryRouter>
);

const meta = {
  title: 'Patterns/SetupPassword',
  component: SetupPasswordPage,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Invite set-password page, rebuilt on the shared `Field` (underline, key + eye icons) and `Button` — matching the Login card. Theme follows the invite role: peach (staff) / green (admin).',
      },
    },
  },
} satisfies Meta<typeof SetupPasswordPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Staff invite — peach theme; password form on shared Field + Button. */
export const Staff: Story = { decorators: [withToken('staff')] };

/** Admin invite — green theme. */
export const Admin: Story = { decorators: [withToken('admin')] };

/** No / expired token → the "Link Expired" state. */
export const Expired: Story = { decorators: [withToken('')] };
