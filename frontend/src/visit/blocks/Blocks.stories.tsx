import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { http, HttpResponse } from 'msw';
import { SectionBlock } from '../../components/SectionBlock';
import { handlers as sbHandlers } from '../../sb/handlers';
import { VitalsBlock, emptyVitals } from './VitalsBlock';
import { HistoryBlock, emptyHistory } from './HistoryBlock';
import { ComplaintsBlock, DiagnosisBlock, TestsBlock, emptyTags } from './TagsBlock';
import { RxBlock, emptyRx } from './RxBlock';
import { NotesBlock, emptyNotes } from './NotesBlock';
import { TextBlock, emptyText } from './TextBlock';
import { ReferBlock, emptyRefer } from './ReferBlock';
import { ReviewBlock, emptyReview } from './ReviewBlock';
import { colors } from '../../styles/theme';

const B = 'http://localhost:8080';
const MEDS = [
  { id: 'm1', name: 'Cetirizine 10mg', genericName: 'Cetirizine' },
  { id: 'm2', name: 'Mometasone cream', genericName: 'Mometasone furoate' },
  { id: 'm3', name: 'Paracetamol 500mg', genericName: 'Paracetamol' },
];
const medHandlers = [
  http.get(`${B}/api/medicines/frequent`, () => HttpResponse.json(MEDS)),
  http.get(`${B}/api/medicines/search`, ({ request }) => {
    const q = (new URL(request.url).searchParams.get('q') || '').toLowerCase();
    return HttpResponse.json(MEDS.filter((m) => m.name.toLowerCase().includes(q)));
  }),
];

// Render any block inside the shared SectionBlock card with local state, on the
// cream visit page — exactly as it appears in the visit.
function Demo({ Comp, make, title, icon }: { Comp: React.ComponentType<{ value: any; onChange: (v: any) => void }>; make: () => any; title: string; icon: string }) {
  const [v, setV] = useState(make());
  return (
    <div style={{ background: colors.primary200, padding: 24, width: 820, boxSizing: 'border-box' }}>
      <SectionBlock title={title} icon={icon} surface="card">
        <Comp value={v} onChange={setV} />
      </SectionBlock>
    </div>
  );
}

const meta = {
  title: 'Visit/Blocks',
  parameters: {
    layout: 'fullscreen',
    msw: { handlers: [...medHandlers, ...sbHandlers] },
    docs: { description: { component: 'Each visit section as a standalone block component — the real building blocks a specialty template is composed from. Lifted from PrescriptionPage so they mirror the page.' } },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Vitals: Story = { render: () => <Demo Comp={VitalsBlock} make={emptyVitals} title="Vitals" icon="heart-pulse" /> };
export const History: Story = { render: () => <Demo Comp={HistoryBlock} make={emptyHistory} title="History" icon="history" /> };
export const Complaints: Story = { render: () => <Demo Comp={ComplaintsBlock} make={emptyTags} title="Complaints" icon="chat-dots" /> };
export const Diagnosis: Story = { render: () => <Demo Comp={DiagnosisBlock} make={emptyTags} title="Diagnosis" icon="stethoscope" /> };
export const Rx: Story = { render: () => <Demo Comp={RxBlock} make={emptyRx} title="Rx" icon="prescription" /> };
export const NotesForPatient: Story = { render: () => <Demo Comp={NotesBlock} make={emptyNotes} title="Notes for patient" icon="pen" /> };
export const PrivateNotes: Story = { render: () => <Demo Comp={TextBlock} make={emptyText} title="Private notes" icon="eye-closed" /> };
export const Tests: Story = { render: () => <Demo Comp={TestsBlock} make={emptyTags} title="Tests" icon="file" /> };
export const Refer: Story = { render: () => <Demo Comp={ReferBlock} make={emptyRefer} title="Refer to" icon="staff" /> };
export const Review: Story = { render: () => <Demo Comp={ReviewBlock} make={emptyReview} title="Review" icon="calendar-check" /> };
