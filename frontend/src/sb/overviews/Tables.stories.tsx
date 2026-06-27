import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { Page, Group } from '../foundations/_kit';
import { DataGrid, type GridColumn } from '../../components/DataGrid/DataGrid';
import { mockPharmacyStock } from '../mockData';
import type { PharmacyStockDTO } from '../../api/pharmacy';
import { colors, fonts } from '../../styles/theme';

// Consolidation view for TABLES. `DataGrid` is the one shared table; only a few
// surfaces use it today, the rest are hand-rolled <table>s. This page shows the
// canonical grid plus a full inventory of every tabular surface and where it's
// headed (tiers discussed separately).

const stockColumns: GridColumn<PharmacyStockDTO>[] = [
  { key: 'name', header: 'Medicine', align: 'left', render: (r) => r.name },
  { key: 'category', header: 'Category', render: (r) => r.category },
  { key: 'batch', header: 'Batch', width: 90, render: (r) => r.batch },
  { key: 'stock', header: 'In stock', width: 90, render: (r) => r.unitsInStock },
  { key: 'mrp', header: 'MRP', width: 80, align: 'right', render: (r) => `₹${r.packMrp}` },
  { key: 'expiry', header: 'Expiry', width: 110, render: (r) => r.expiry },
];

// ── The inventory itself, rendered (fittingly) in a DataGrid ──────────────────
type TableRow = { surface: string; built: string; shape: string; tier: string };

const TIER_COLOR: Record<string, string> = {
  'On DataGrid': colors.secondary700,
  'Tier 1': colors.active.shade700,
  'Tier 2': colors.neutral700,
  'Bespoke': colors.neutral500,
};

const inventory: TableRow[] = [
  { surface: 'BillModal — line items', built: 'DataGrid', shape: 'Editable line-items', tier: 'On DataGrid' },
  { surface: 'Pharmacy stock', built: 'hand-rolled <table>', shape: 'Read-only data', tier: 'Tier 1' },
  { surface: 'Services catalog', built: 'hand-rolled <table>', shape: 'Read-only + row actions', tier: 'Tier 1' },
  { surface: 'Archived patients', built: 'hand-rolled <table>', shape: 'Read-only + 1 action', tier: 'Tier 1' },
  { surface: 'Stats — overdue reviews', built: 'hand-rolled <table>', shape: 'Read-only data', tier: 'Tier 1' },
  { surface: 'Appointment queue', built: 'hand-rolled <table>', shape: 'Queue (badges, grouping)', tier: 'Tier 2' },
  { surface: 'Prescription queue', built: 'hand-rolled <table>', shape: 'Queue (badges, grouping)', tier: 'Tier 2' },
  { surface: 'BillMedicines — line items', built: 'hand-rolled <table>', shape: 'Editable line-items', tier: 'Bespoke' },
];

const tierPill = (tier: string) => (
  <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 999, fontSize: fonts.control.xs, color: colors.neutral100, backgroundColor: TIER_COLOR[tier] ?? colors.neutral500 }}>
    {tier}
  </span>
);

const inventoryColumns: GridColumn<TableRow>[] = [
  { key: 'surface', header: 'Table surface', align: 'left', render: (r) => r.surface },
  { key: 'built', header: 'Built with', align: 'left', render: (r) => r.built },
  { key: 'shape', header: 'Shape', align: 'left', render: (r) => r.shape },
  { key: 'tier', header: 'Plan', width: 130, render: (r) => tierPill(r.tier) },
];

const meta = {
  title: 'Overview/Tables',
  parameters: { layout: 'fullscreen', options: { showPanel: false } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = {
  render: () => (
    <Page
      title="Tables"
      intro="DataGrid is the one shared table — render-prop columns, fixed layout, m/s sizes. Most tables are still hand-rolled <table>s in three shapes: read-only data, queues (status badges + grouping), and editable line-items. The plan: migrate the read-only ones onto DataGrid first, decide on a shared queue table next, keep the dense editable line-items bespoke."
    >
      <Group label="The shared table — DataGrid (default size)">
        <div style={{ width: 760 }}>
          <DataGrid columns={stockColumns} rows={mockPharmacyStock} rowKey={(r) => r.id} />
        </div>
      </Group>

      <Group label='Denser "s" size — for inside modals'>
        <div style={{ width: 760 }}>
          <DataGrid columns={stockColumns} rows={mockPharmacyStock} rowKey={(r) => r.id} size="s" />
        </div>
      </Group>

      <Group label="Every table in the app (and where it's headed)">
        <div style={{ width: 760 }}>
          <DataGrid columns={inventoryColumns} rows={inventory} rowKey={(r) => r.surface} size="s" />
        </div>
      </Group>
    </Page>
  ),
};
