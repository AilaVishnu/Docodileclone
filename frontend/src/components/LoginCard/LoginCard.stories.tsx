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

const loginSuccess = {
  token: FAKE_JWT,
  role: 'admin',
  clinicId: 'clinic-1',
  clinicName: 'Sunrise Skin Clinic',
  gender: 'female',
};

// Auth endpoints the card POSTs to. /auth/login carries the typed clinic
// domain as an X-Tenant header, and /auth/forgot-password backs the reset view.
const authHandlers = [
  http.post('http://localhost:8080/auth/login', () => HttpResponse.json(loginSuccess)),
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
          'The single login card. The user enters their clinic `DomainInput` + email + password; on submit it POSTs to `/auth/login` with the typed domain sent as an `X-Tenant` header (scoping the request to that clinic regardless of subdomain). On success it stows the JWT/role/clinic in localStorage and calls `onLoginSuccess`. The "Forgot Password" link swaps to a reset view that takes the same clinic domain (sent as `X-Tenant`) plus email and POSTs to `/auth/forgot-password`. Validation happens on submit via an inline Toast.',
      },
    },
    layout: 'centered',
    msw: { handlers: authHandlers },
  },
  argTypes: {
    onLoginSuccess: { control: false },
  },
  args: {
    onLoginSuccess: () => {},
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

/** Login — clinic domain + email + password, POSTs to /auth/login. */
export const Login: Story = {};
