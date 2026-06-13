import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { http, HttpResponse } from 'msw';
import { LoginCard } from './LoginCard';
import { withClinicSession } from '../../sb/decorators';

// A three-segment JWT-shaped token. The component decodes the middle segment
// with atob() to read user_id/email, so the payload is real base64url JSON
// ({"user_id":"u1","email":"admin@sunrise.clinic"}).
const FAKE_JWT =
  'eyJhbGciOiJIUzI1NiJ9' +
  '.eyJ1c2VyX2lkIjoidTEiLCJlbWFpbCI6ImFkbWluQHN1bnJpc2UuY2xpbmljIn0' +
  '.s1gn4tur3';

const adminSuccess = {
  token: FAKE_JWT,
  role: 'admin',
  clinicId: 'clinic-1',
  clinicName: 'Sunrise Skin Clinic',
  gender: 'female',
};

const staffSuccess = {
  token: FAKE_JWT,
  role: 'doctor',
  clinicId: 'clinic-1',
  clinicName: 'Sunrise Skin Clinic',
  gender: 'female',
};

// Auth endpoints the card POSTs to. /auth/login (admin), /auth/staff/login
// (staff), and /auth/forgot-password for the reset view. The staff form also
// renders a DomainInput, whose availability check (/api/tenant/domain/check)
// is already covered by the default handler.
const authHandlers = [
  http.post('http://localhost:8080/auth/login', () => HttpResponse.json(adminSuccess)),
  http.post('http://localhost:8080/auth/staff/login', () => HttpResponse.json(staffSuccess)),
  http.post('http://localhost:8080/auth/forgot-password', () =>
    HttpResponse.json({ ok: true }),
  ),
];

const meta = {
  title: 'Patterns/Login',
  component: LoginCard,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The login card used on the admin and staff entry screens. `mode="admin"` POSTs to `/auth/login`; `mode="staff"` adds a clinic `DomainInput` and POSTs to `/auth/staff/login`. On success it stows the JWT/role/clinic in localStorage and calls `onLoginSuccess`. The "Forgot Password" link swaps to a reset view that POSTs to `/auth/forgot-password`. Validation happens on submit via an inline Toast.',
      },
    },
    layout: 'centered',
    msw: { handlers: authHandlers },
  },
  argTypes: {
    mode: {
      control: 'inline-radio',
      options: ['admin', 'staff'],
      table: { defaultValue: { summary: 'admin' } },
    },
    onLoginSuccess: { control: false },
    onSwitchMode: { control: false },
  },
  args: {
    mode: 'admin',
    onLoginSuccess: () => {},
    onSwitchMode: () => {},
  },
  decorators: [
    withClinicSession,
    (Story) => (
      // The card width tracks --login-card-w; give it a sized stage so the
      // 40vw/var widths resolve to something sensible in isolation.
      <div style={{ width: 520, ['--login-card-w' as string]: '520px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof LoginCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Admin login — email + password, POSTs to /auth/login. */
export const Admin: Story = {
  args: { mode: 'admin' },
};

/** Staff login — adds the clinic DomainInput and POSTs to /auth/staff/login. */
export const Staff: Story = {
  args: { mode: 'staff' },
};
