import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { PatientSearchRow } from './PatientSearchRow';
import { mockPatients } from '../../sb/mockData';

const meta = {
  title: 'Components/PatientSearchRow',
  component: PatientSearchRow,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'One row in any patient-search dropdown — the app-wide standard. Three aligned columns (fixed T-id, flexible name with ellipsis, right-aligned phone) so rows line up regardless of id / name length. Calls back via `onSelect(patient)`.',
      },
    },
  },
  argTypes: {
    patient: { control: false },
    onSelect: { control: false },
  },
  args: {
    patient: mockPatients[0],
    onSelect: () => {},
  },
  decorators: [
    (Story) => (
      <div style={{ width: 360 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PatientSearchRow<(typeof mockPatients)[number]>>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A single patient row. Hover to see the highlight. */
export const Default: Story = {};

/** A patient with no phone on file. */
export const NoPhone: Story = {
  args: { patient: mockPatients[2] },
};

/** A full dropdown — every mock patient stacked, as it appears in search. */
export const Gallery: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {mockPatients.map((p) => (
        <PatientSearchRow key={p.id} patient={p} onSelect={() => {}} />
      ))}
    </div>
  ),
};
