import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { PharmacyShelfView } from './PharmacyShelfView';
import { MOCK_INVENTORY } from './mockInventory';

const meta = {
  title: 'Patterns/Pharmacy/Shelf View',
  component: PharmacyShelfView,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The grid / shelf view — medicine tiles laid out in labelled aisle sections (header + item count). ' +
          '`groupBy` chooses the aisles: by **form**, by **category**, or **none** (one ungrouped shelf, no headers). ' +
          'Each tile shows its `MedIllustration`, current stock and an expiry chip.',
      },
    },
  },
  args: { items: MOCK_INVENTORY },
} satisfies Meta<typeof PharmacyShelfView>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Aisles by medication form — Tablets, Creams & lotions, Soaps & cleansers… */
export const ByForm: Story = { args: { groupBy: 'form' } };

/** Aisles by product category — Tablets, Topicals, Acne & skin, Serums… */
export const ByCategory: Story = { args: { groupBy: 'category' } };

/** Ungrouped — a single shelf with no section header, names A→Z. */
export const Ungrouped: Story = { args: { groupBy: 'none' } };
