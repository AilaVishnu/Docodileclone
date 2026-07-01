import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { http, HttpResponse } from 'msw';
import { SectionBlock } from '../../components/SectionBlock';
import { handlers as sbHandlers } from '../../sb/handlers';
import { VitalsBlock, emptyVitals } from './VitalsBlock';
import { HistoryBlock, emptyHistory } from './HistoryBlock';
import { ComplaintsBlock, DiagnosisBlock, TestsBlock, emptyTags } from './TagsBlock';
import { RxBlock, type RxRow } from './RxBlock';
import { NotesBlock, emptyNotes } from './NotesBlock';
import { TextBlock, emptyText } from './TextBlock';
import { ReferBlock } from './ReferBlock';
import { ReviewBlock } from './ReviewBlock';
import type { Doctor } from '../../hooks/useDoctors';
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

// A blank Rx row mirroring the page's blankRxRow — RxBlock keeps a trailing
// empty row, so a fresh pad starts with exactly one.
const blankRxRow = (position: number): RxRow => ({
  id: null, position, medicine: '', genericName: '', medicineNote: '', dosage: '',
  whenToTake: '', frequency: '', frequencyInterval: '', duration: '', notes: '', thenRows: [],
});
const MOCK_DOCTORS: Doctor[] = [
  { id: 'd1', name: 'Dr. Anjali Menon', department: 'Dermatology', specialty: 'Dermatology', registrationNo: null, qualification: null, medicalCouncil: null, experienceYears: null },
  { id: 'd2', name: 'Dr. Vikram Rao', department: 'Rheumatology', specialty: 'Rheumatology', registrationNo: null, qualification: null, medicalCouncil: null, experienceYears: null },
  { id: 'd3', name: 'Dr. Priya Nair', department: 'Plastic surgery', specialty: 'Plastic surgery', registrationNo: null, qualification: null, medicalCouncil: null, experienceYears: null },
];

// Wrap a bottom-row block (Rx / Refer / Review) in the SectionBlock card on the
// cream page, matching how the visit renders it.
function Frame({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div style={{ background: colors.primary200, padding: 24, width: 820, boxSizing: 'border-box' }}>
      <SectionBlock title={title} icon={icon} surface="card">{children}</SectionBlock>
    </div>
  );
}

function RxDemo() {
  const [rows, setRows] = useState<RxRow[]>([blankRxRow(1)]);
  // Keep exactly one trailing empty row, like the page's withTrailingRx.
  const commit = (next: RxRow[]) => {
    const filled = next.filter((r) => r.medicine.trim() !== '');
    const empty = next.find((r) => r.medicine.trim() === '');
    setRows([...filled, empty ?? blankRxRow(0)].map((r, i) => ({ ...r, position: i + 1 })));
  };
  const patch = (i: number, p: Partial<RxRow>) => commit(rows.map((r, ix) => (ix === i ? { ...r, ...p } : r)));
  return (
    <Frame title="Rx" icon="pills">
      <RxBlock
        rows={rows}
        interactions={[]}
        onUpdateField={(i, key, value) => patch(i, { [key]: value } as Partial<RxRow>)}
        onMedicineChange={(i, v) => patch(i, { medicine: v, genericName: '' })}
        onMedicineSelect={(i, name, genericName) => patch(i, { medicine: name, genericName })}
        onAddThenRow={(i) => patch(i, { thenRows: [...rows[i].thenRows, { dosage: '', whenToTake: '', frequency: '', frequencyInterval: '', duration: '', notes: '' }] })}
        onRemoveRxRow={(i) => commit(rows.filter((_, ix) => ix !== i))}
        onUpdateThenField={(i, ti, key, value) => patch(i, { thenRows: rows[i].thenRows.map((t, tx) => (tx === ti ? { ...t, [key]: value } : t)) })}
        onRemoveThenRow={(i, ti) => patch(i, { thenRows: rows[i].thenRows.filter((_, tx) => tx !== ti) })}
      />
    </Frame>
  );
}

// The Tests / Refer / Review rows render inside the page's `bottomRows` card
// (each block carries its own icon + label), not inside a titled SectionBlock.
function BottomRowFrame({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: colors.primary200, padding: 24, width: 820, boxSizing: 'border-box' }}>
      <div style={{ background: colors.neutral100, borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {children}
      </div>
    </div>
  );
}

function TestsDemo() {
  const [v, setV] = useState<{ tags: string[] }>({ tags: [] });
  return <BottomRowFrame><TestsBlock value={v} onChange={setV} /></BottomRowFrame>;
}

function ReferDemo() {
  const [value, setValue] = useState<string | null>(null);
  return (
    <BottomRowFrame>
      <ReferBlock doctors={MOCK_DOCTORS} value={value} onChange={setValue} />
    </BottomRowFrame>
  );
}

function ReviewDemo() {
  const [date, setDate] = useState<Date | null>(null);
  const [days, setDays] = useState('');
  const [notes, setNotes] = useState('');
  return (
    <BottomRowFrame>
      <ReviewBlock
        date={date}
        days={days}
        notes={notes}
        onPickDate={(d) => { setDate(d); setDays(String(Math.max(0, Math.round((d.getTime() - Date.now()) / 86400000)))); }}
        onDaysChange={(raw) => setDays(raw.replace(/\D/g, ''))}
        onNotesChange={setNotes}
      />
    </BottomRowFrame>
  );
}

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
export const Rx: Story = { render: () => <RxDemo /> };
export const NotesForPatient: Story = { render: () => <Demo Comp={NotesBlock} make={emptyNotes} title="Notes for patient" icon="pen" /> };
export const PrivateNotes: Story = { render: () => <Demo Comp={TextBlock} make={emptyText} title="Private notes" icon="eye-closed" /> };
export const Tests: Story = { render: () => <TestsDemo /> };
export const Refer: Story = { render: () => <ReferDemo /> };
export const Review: Story = { render: () => <ReviewDemo /> };
