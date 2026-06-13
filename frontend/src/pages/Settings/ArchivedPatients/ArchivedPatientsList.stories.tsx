import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { ArchivedPatientsList } from './ArchivedPatientsList';
import { HttpResponse, http } from 'msw';
import { API_BASE_URL } from '../../../apiConfig';
import { mockArchivedPatients } from '../../../sb/mockData';

const meta = {
  title: 'Patterns/ArchivedPatients',
  component: ArchivedPatientsList,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Settings → Archived patients. Read-only list on the shared `DataGrid` with a per-row Restore action. Data via GET /api/patients/archived (mocked here).',
      },
    },
  },
  decorators: [(Story) => <div style={{ maxWidth: 760 }}><Story /></div>],
} satisfies Meta<typeof ArchivedPatientsList>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Populated list. */
export const Default: Story = {};

/** Empty state. */
export const Empty: Story = {
  parameters: {
    msw: { handlers: [http.get(`${API_BASE_URL}/api/patients/archived`, () => HttpResponse.json([]))] },
  },
};

// Reference the import so the populated story's mock data is colocated/visible.
void mockArchivedPatients;
