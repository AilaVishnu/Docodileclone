import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { DataGrid, type GridColumn } from './DataGrid';
import { mockPharmacyStock, mockPatients } from '../../sb/mockData';
import type { PharmacyStockDTO } from '../../api/pharmacy';

const stockColumns: GridColumn<PharmacyStockDTO>[] = [
  { key: 'name', header: 'Medicine', align: 'left', render: (r) => r.name },
  { key: 'category', header: 'Category', render: (r) => r.category },
  { key: 'batch', header: 'Batch', width: 90, render: (r) => r.batch },
  { key: 'stock', header: 'In stock', width: 90, render: (r) => r.unitsInStock },
  { key: 'mrp', header: 'MRP', width: 80, align: 'right', render: (r) => `₹${r.packMrp}` },
  { key: 'expiry', header: 'Expiry', width: 110, render: (r) => r.expiry },
];

const meta = {
  title: 'Components/DataGrid',
  component: DataGrid,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The shared, Catalog-styled table. Columns are render-prop based, so a cell can be plain text (read-only) or an editor (inputs / comboboxes). Fixed layout via a colgroup; non-name columns centre by default. `size="s"` is a denser variant for modals.',
      },
    },
  },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: ['m', 's'],
      table: { defaultValue: { summary: 'm' } },
    },
    tdPadding: { control: 'text' },
    thPadding: { control: 'text' },
    columns: { control: false },
    rows: { control: false },
    rowKey: { control: false },
  },
  args: {
    columns: stockColumns,
    rows: mockPharmacyStock,
    rowKey: (r: PharmacyStockDTO) => r.id,
    size: 'm',
  },
  decorators: [
    (Story) => (
      <div style={{ width: 720 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DataGrid<PharmacyStockDTO>>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Pharmacy stock at the default "m" size. */
export const Default: Story = {};

/** The denser "s" size — for inside a modal. */
export const Small: Story = {
  args: { size: 's' },
};

/** A different dataset — patients — to show the generic shape. */
export const Patients: Story = {
  args: {
    columns: [
      { key: 'no', header: '#', width: 60, render: (r) => r.displayNo ?? '—' },
      { key: 'name', header: 'Name', align: 'left', render: (r) => r.name },
      { key: 'gender', header: 'Gender', width: 100, render: (r) => r.gender ?? '—' },
      { key: 'phone', header: 'Phone', width: 160, align: 'right', render: (r) => r.phone ?? '—' },
      { key: 'lastVisit', header: 'Last visit', width: 130, render: (r) => r.lastVisitDate ?? '—' },
    ],
    rows: mockPatients,
    rowKey: (r) => r.id,
  } as Story['args'],
};
