import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { http, HttpResponse } from 'msw';
import { MedicineAutocomplete } from './MedicineAutocomplete';
import { withClinicSession } from '../../sb/decorators';

// Drug-DB rows come back as { id, name, generic_name | genericName }. The
// component reads either casing, so we send snake_case here to mirror the API.
const FREQUENT = [
  { id: 'f1', name: 'Amoxicillin 500mg', generic_name: 'Amoxicillin' },
  { id: 'f2', name: 'Cetirizine 10mg', generic_name: 'Cetirizine' },
  { id: 'f3', name: 'Paracetamol 650mg', generic_name: 'Paracetamol' },
];

const SEARCH = [
  { id: 's1', name: 'Amoxicillin 250mg', generic_name: 'Amoxicillin' },
  { id: 's2', name: 'Amoxiclav 625mg', generic_name: 'Amoxicillin + Clavulanic acid' },
  { id: 's3', name: 'Azithromycin 500mg', generic_name: 'Azithromycin' },
];

// Inline handlers for the two /api/medicines endpoints this component hits.
// (Pharmacy stock — /api/tenant/pharmacy-stock — is already covered by the
// default handler, so the "In Stock" section is fed from the shared mock.)
const medicineHandlers = [
  http.get('http://localhost:8080/api/medicines/frequent', () =>
    HttpResponse.json(FREQUENT),
  ),
  http.get('http://localhost:8080/api/medicines/search', ({ request }) => {
    const q = new URL(request.url).searchParams.get('q')?.toLowerCase() ?? '';
    const rows = q
      ? SEARCH.filter((d) => d.name.toLowerCase().includes(q) || d.generic_name.toLowerCase().includes(q))
      : SEARCH;
    return HttpResponse.json(rows);
  }),
];

const meta = {
  title: 'Components/Rx/MedicineAutocomplete',
  component: MedicineAutocomplete,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Prescription medicine picker. On mount it loads `GET /api/medicines/frequent?limit=10` (shown on focus) and this clinic\'s pharmacy inventory via `listPharmacyStock()`. As the doctor types it debounces 300ms then hits `GET /api/medicines/search?q=&limit=8`, surfacing on-shelf inventory matches (with a colour-coded units badge) above the generic drug-DB results. Selecting a row fires `onSelect(name, genericName)`.',
      },
    },
    msw: { handlers: medicineHandlers },
  },
  argTypes: {
    value: { control: 'text' },
    placeholder: { control: 'text' },
    onChange: { control: false },
    onSelect: { control: false },
    inputStyle: { control: false },
  },
  args: {
    value: '',
    placeholder: 'Search medicine…',
  },
  decorators: [withClinicSession],
  // Controlled (value/onChange + optional onSelect). Local state drives the
  // debounced search; the inline handlers feed the dropdown.
  render: (args) => {
    const [value, setValue] = useState(args.value ?? '');
    React.useEffect(() => setValue(args.value ?? ''), [args.value]);
    return (
      <div style={{ width: 360 }}>
        <MedicineAutocomplete
          {...args}
          value={value}
          onChange={setValue}
          inputStyle={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: 8,
            border: '1px solid #d8d4cc',
            fontSize: 14,
          }}
        />
      </div>
    );
  },
} satisfies Meta<typeof MedicineAutocomplete>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Empty — focusing surfaces the "Frequently Used" list. */
export const Default: Story = {};

/** Typed query — "In Stock" matches (from pharmacy stock) above drug-DB results. */
export const WithQuery: Story = {
  args: { value: 'Amox' },
};
