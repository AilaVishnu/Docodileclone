import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { ServicesView } from './ServicesView';
import { HttpResponse, http } from 'msw';
import { API_BASE_URL } from '../../apiConfig';

const meta = {
  title: 'Patterns/ServicesView',
  component: ServicesView,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Settings → Services catalog. The table is the shared `DataGrid` (Short Form / Name / Price / Duration / Discount / GST + edit/delete actions). Data via GET /api/tenant/services (mocked here).',
      },
    },
  },
} satisfies Meta<typeof ServicesView>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Populated catalog. */
export const Default: Story = {};

/** Empty state. */
export const Empty: Story = {
  parameters: {
    msw: { handlers: [http.get(`${API_BASE_URL}/api/tenant/services`, () => HttpResponse.json([]))] },
  },
};
