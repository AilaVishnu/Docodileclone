import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { QueueTable, type QueueColumn } from './QueueTable';
import { colors, fonts, radii } from '../../styles/theme';

// ── Mock queue data ──────────────────────────────────────────────────────────
type Row = {
  id: string; no: string; name: string; sub: string;
  phone: string; service: string; type: string; time: string; status: string;
};

const ROWS: Row[] = [
  { id: '1', no: 'T12', name: 'Ramesh Babu', sub: 'M · 40', phone: '+91 88856 72664', service: 'Consult', type: 'New', time: '10:00 AM', status: 'In progress' },
  { id: '2', no: 'T13', name: 'Sita Lakshmi', sub: 'F · 32', phone: '+91 90000 12345', service: 'Review', type: 'Review', time: '10:20 AM', status: 'In progress' },
  { id: '3', no: 'T14', name: 'Arjun Mehta', sub: 'M · 24', phone: '+91 98123 45678', service: 'Consult', type: 'New', time: '10:40 AM', status: 'Booked' },
  { id: '4', no: 'T15', name: 'Priya Nair', sub: 'F · 29', phone: '+91 99887 76655', service: 'Dressing', type: 'Review', time: '11:00 AM', status: 'Booked' },
  { id: '5', no: 'T09', name: 'Mohan Das', sub: 'M · 58', phone: '+91 90011 22334', service: 'Consult', type: 'Review', time: '09:30 AM', status: 'Completed' },
  { id: '6', no: 'T07', name: 'Fatima Sheikh', sub: 'F · 45', phone: '+91 90090 90090', service: 'Consult', type: 'New', time: '09:10 AM', status: 'Cancelled' },
];

const TONE: Record<string, string | undefined> = {
  'In progress': colors.primary200,
  Completed: colors.neutral150,
  Cancelled: colors.redAlpha10,
  Booked: undefined,
};
const STATUS_COLOR: Record<string, string> = {
  'In progress': colors.active.shade700,
  Completed: colors.secondary700,
  Cancelled: colors.red200,
  Booked: colors.neutral700,
};

const Pill = ({ s }: { s: string }) => (
  <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: radii.pill, fontSize: fonts.control.xs, color: colors.neutral100, backgroundColor: STATUS_COLOR[s] ?? colors.neutral700 }}>{s}</span>
);

const columns: QueueColumn<Row>[] = [
  { key: 'no', header: '#', width: 48, align: 'center', render: (r) => r.no },
  { key: 'name', header: 'Patient', grow: 2, render: (r) => (
    <div style={{ minWidth: 0 }}>
      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.name}</div>
      <div style={{ fontSize: fonts.control.xs, color: colors.neutral500 }}>{r.sub}</div>
    </div>
  ) },
  { key: 'phone', header: 'Phone', grow: 1.5, render: (r) => r.phone },
  { key: 'service', header: 'Service', grow: 1, render: (r) => r.service },
  { key: 'type', header: 'Type', width: 72, align: 'center', render: (r) => r.type },
  { key: 'time', header: 'Time', width: 84, align: 'center', render: (r) => r.time },
  { key: 'status', header: 'Status', width: 116, align: 'center', render: (r) => <Pill s={r.status} /> },
  { key: 'actions', header: '', width: 36, align: 'center', render: () => '⋯' },
];

const order = ['In progress', 'Booked', 'Completed', 'Cancelled'];
const sorted = [...ROWS].sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status));

const Demo = ({ width, label }: { width: number; label: string }) => (
  <div style={{ marginBottom: 28 }}>
    <div style={{ fontFamily: fonts.family.primary, fontSize: fonts.control.xs, color: colors.neutral500, marginBottom: 6 }}>{label} — {width}px</div>
    <div style={{ width, background: colors.neutral100, borderRadius: radii.l, padding: 8, boxSizing: 'border-box' }}>
      <QueueTable columns={columns} rows={sorted} rowKey={(r) => r.id} rowTone={(r) => TONE[r.status]} groupBy={(r) => r.status} />
    </div>
  </div>
);

const meta = {
  title: 'Components/QueueTable',
  component: QueueTable,
  parameters: {
    docs: {
      description: {
        component:
          'DRAFT / Tier-2 mock of the shared queue table for the appointment + prescription queues. Columns are render-props (status badge/dropdown, row actions); `rowTone(row)` sets the status background; `groupBy(row)` draws separators between status groups. Responsive via CSS-grid columns — fixed columns take px, flexible ones take `fr`, so they squeeze/stretch with width (the clean equivalent of spacer columns). The two widths below show the same table adapting.',
      },
    },
  },
} satisfies Meta<typeof QueueTable>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Same data, two widths — flexible columns (Patient / Phone / Service) squeeze & stretch; fixed ones (#, Type, Time, Status, ⋯) hold. Row tones + group separators by status. */
export const Mock: Story = {
  render: () => (
    <div>
      <Demo width={1080} label="Wide" />
      <Demo width={720} label="Compact" />
    </div>
  ),
};
