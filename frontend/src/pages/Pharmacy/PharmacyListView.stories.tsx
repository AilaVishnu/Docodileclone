import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { PharmacyListView } from './PharmacyListView';
import type { Med } from './types';

const MEDS: Med[] = [
  { id: 'm1', name: 'Amoxicillin 500mg', category: 'Tablets', form: 'tablet', invoiceNo: 'INV-1042', batch: 'B-2231', packPrice: 84, packMrp: 120, unitsPerPack: 10, unitPrice: 8.4, unitsInStock: 240, expiry: '2027-01', discountPct: 0, gstPct: 12 },
  { id: 'm2', name: 'Cetirizine 10mg', category: 'Tablets', form: 'tablet', invoiceNo: 'INV-1042', batch: 'B-1180', packPrice: 56, packMrp: 80, unitsPerPack: 10, unitPrice: 5.6, unitsInStock: 30, expiry: '2026-09', discountPct: 5, gstPct: 12 },
  { id: 'm3', name: 'Calamine Lotion', category: 'Topicals', form: 'cream', invoiceNo: 'INV-0998', batch: 'C-7741', packPrice: 60, packMrp: 75, unitsPerPack: 1, unitPrice: 60, unitsInStock: 14, expiry: '2027-03', discountPct: 0, gstPct: 18 },
  { id: 'm4', name: 'Tacrolimus Ointment', category: 'Topicals', form: 'ointment', invoiceNo: 'INV-0998', batch: 'T-3320', packPrice: 420, packMrp: 510, unitsPerPack: 1, unitPrice: 420, unitsInStock: 3, expiry: '2026-06', discountPct: 10, gstPct: 18 },
  { id: 'm5', name: 'Salicylic Cleanser', category: 'Cleansers & soaps', form: 'soap', invoiceNo: 'INV-1101', batch: 'S-5510', packPrice: 240, packMrp: 300, unitsPerPack: 1, unitPrice: 240, unitsInStock: 52, expiry: '2028-02', discountPct: 0, gstPct: 18 },
];

const meta = {
  title: 'Patterns/Pharmacy/List View',
  component: PharmacyListView,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Pharmacy stock table on the shared `DataGrid` (12 columns, right-aligned numerics, invoice link + delete/edit/adjust actions). Wide, so it uses DataGrid `minWidth` to scroll horizontally. Presentational — pass `items` + callbacks.',
      },
    },
  },
  args: { items: MEDS },
} satisfies Meta<typeof PharmacyListView>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Populated stock. */
export const Default: Story = {};

/** Empty state. */
export const Empty: Story = { args: { items: [] } };
