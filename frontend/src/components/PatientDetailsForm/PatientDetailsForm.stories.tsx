import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { PatientDetailsForm, type PatientDraft } from './PatientDetailsForm';
import { mockPatients } from '../../sb/mockData';
import { colors } from '../../styles/theme';

const EMPTY: PatientDraft = { name: '', email: '', phone: '', dob: '', age: '', gender: '' };

const meta = {
  title: 'Components/PatientDetailsForm',
  component: PatientDetailsForm,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The shared patient identity card — name, email, phone, DOB (digit-entry + calendar) / age, gender. Controlled: parent owns the draft (`value`/`onChange`), the raw DOB digits, the patient list (name/phone autocomplete) and lock state. Lifted out of BookAppointment so the same card can serve other patient flows.',
      },
    },
  },
  decorators: [(Story) => <div style={{ width: 560, background: colors.active.shade200, padding: 24 }}><Story /></div>],
} satisfies Meta<typeof PatientDetailsForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Empty form. Type a name or phone to see autocomplete from existing patients. */
export const Default: Story = {
  render: () => {
    const [value, setValue] = useState<PatientDraft>(EMPTY);
    const [dobDigits, setDobDigits] = useState('');
    const [locked, setLocked] = useState(false);
    return (
      <PatientDetailsForm
        value={value}
        onChange={(patch) => setValue((v) => ({ ...v, ...patch }))}
        dobDigits={dobDigits}
        setDobDigits={setDobDigits}
        patients={mockPatients}
        onSelectExisting={(p) => {
          const clean = (p.phone ?? '').replace(/\D/g, '').slice(-10);
          setValue((v) => ({ ...v, name: p.name, phone: clean ? `+91 ${clean.slice(0, 5)} ${clean.slice(5)}` : '', gender: p.gender ?? v.gender }));
          setLocked(true);
        }}
        locked={locked}
        showClearLink={locked}
        onClearLocked={() => { setLocked(false); setValue(EMPTY); setDobDigits(''); }}
      />
    );
  },
};

/** Prefilled + locked — the state after picking an existing patient. */
export const Locked: Story = {
  render: () => {
    const [value, setValue] = useState<PatientDraft>({ name: 'Ramesh Babu', email: 'ramesh@example.com', phone: '+91 88856 72664', dob: '12 03 1986', age: '40 / 2', gender: 'Male' });
    const [dobDigits, setDobDigits] = useState('12031986');
    const [locked, setLocked] = useState(true);
    return (
      <PatientDetailsForm
        value={value}
        onChange={(patch) => setValue((v) => ({ ...v, ...patch }))}
        dobDigits={dobDigits}
        setDobDigits={setDobDigits}
        locked={locked}
        showClearLink={locked}
        onClearLocked={() => { setLocked(false); setValue(EMPTY); setDobDigits(''); }}
      />
    );
  },
};

/** Validation errors highlighted. */
export const WithErrors: Story = {
  render: () => {
    const [value, setValue] = useState<PatientDraft>(EMPTY);
    const [dobDigits, setDobDigits] = useState('');
    return (
      <PatientDetailsForm
        value={value}
        onChange={(patch) => setValue((v) => ({ ...v, ...patch }))}
        dobDigits={dobDigits}
        setDobDigits={setDobDigits}
        errors={{ name: true, phone: true, dob: true }}
      />
    );
  },
};

/**
 * `bare` — renders flat (no card surface / border / padding) for use inside a
 * modal that already provides its own background + inset (e.g. EditPatientModal).
 * Also shows `genderOptions` extended with a 4th "Prefer not to say" radio.
 */
export const Bare: Story = {
  decorators: [(Story) => <div style={{ width: 520, background: colors.neutral100, padding: 24 }}><Story /></div>],
  render: () => {
    const [value, setValue] = useState<PatientDraft>({ name: 'Ramesh Babu', email: 'ramesh@example.com', phone: '+91 88856 72664', dob: '12 03 1986', age: '40 / 3', gender: 'Male' });
    const [dobDigits, setDobDigits] = useState('12031986');
    return (
      <PatientDetailsForm
        bare
        genderOptions={['Male', 'Female', 'Other', 'Prefer not to say']}
        value={value}
        onChange={(patch) => setValue((v) => ({ ...v, ...patch }))}
        dobDigits={dobDigits}
        setDobDigits={setDobDigits}
      />
    );
  },
};
