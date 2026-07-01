import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { http, HttpResponse } from 'msw';
import { VisitForm } from './VisitForm';
import { GENERAL_TEMPLATE, DERM_TEMPLATE } from '../../visit/templates';
import { handlers as sbHandlers } from '../../sb/handlers';

const B = 'http://localhost:8080';
const MEDS = [
  { id: 'm1', name: 'Cetirizine 10mg', genericName: 'Cetirizine' },
  { id: 'm2', name: 'Mometasone cream', genericName: 'Mometasone furoate' },
  { id: 'm3', name: 'Paracetamol 500mg', genericName: 'Paracetamol' },
  { id: 'm4', name: 'Azithromycin 500mg', genericName: 'Azithromycin' },
  { id: 'm5', name: 'Amoxicillin 500mg', genericName: 'Amoxicillin' },
];
const medHandlers = [
  http.get(`${B}/api/medicines/frequent`, () => HttpResponse.json(MEDS)),
  http.get(`${B}/api/medicines/search`, ({ request }) => {
    const q = (new URL(request.url).searchParams.get('q') || '').toLowerCase();
    return HttpResponse.json(MEDS.filter((m) => m.name.toLowerCase().includes(q)));
  }),
];

const meta = {
  title: 'Patterns/Visit/Form',
  component: VisitForm,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    msw: { handlers: [...medHandlers, ...sbHandlers] },
    docs: {
      description: {
        component:
          'The visit form as a **bento of block cards** — borderless white cards on the warm visit page, separated by gaps, driven by a specialty template. Full-width blocks span the row; half-width blocks pair up (Complaints│Diagnosis, Notes│Private). Each block is a `<SectionBlock surface="card">` from the registry; the **Procedure** block is live and removable, and "Add procedure" appends another. The consult sections currently render a stub body — each is filled in as it is extracted from PrescriptionPage into a real block.',
      },
    },
  },
  argTypes: { template: { control: false } },
} satisfies Meta<typeof VisitForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Dermatology template — the consult sections plus a live Procedure block. */
export const Dermatology: Story = { args: { template: DERM_TEMPLATE } };

/** General consultation — no Procedure block (use "Add procedure" to drop one in). */
export const GeneralConsult: Story = { args: { template: GENERAL_TEMPLATE } };
