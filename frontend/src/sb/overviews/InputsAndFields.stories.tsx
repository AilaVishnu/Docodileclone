import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { Page, Group } from '../foundations/_kit';
import { Field } from '../../components/Field';
import { TextInput } from '../../components/Input/TextInput';
import { Select } from '../../components/Input/Select/Select';
import { UnderlineSelect } from '../../components/Input/UnderlineSelect/UnderlineSelect';
import { MeasureField } from '../../components/MeasureField';
import { FillInput } from '../../components/FillInput';
import { DosagePicker } from '../../components/DosagePicker/DosagePicker';
import { DurationPicker } from '../../components/DurationPicker/DurationPicker';
import { FrequencyPicker } from '../../components/FrequencyPicker/FrequencyPicker';
import { FrequencyIntervalPicker } from '../../components/FrequencyIntervalPicker/FrequencyIntervalPicker';
import { WhenPicker } from '../../components/WhenPicker/WhenPicker';

// Consolidation view: every text/value input + the dosing pickers (rendered
// closed) on one page, each driven by local state so typing works. Reuses the
// real components.

const meta = {
  title: 'Overview/Inputs & Fields',
  parameters: { layout: 'fullscreen', options: { showPanel: false } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** A fixed-width slot so every input sits at a comparable size. */
const Slot: React.FC<{ label: string; children: React.ReactNode; w?: number }> = ({
  label,
  children,
  w = 320,
}) => (
  <div style={{ width: w }}>
    <div style={{ fontSize: 12, color: '#8F8F8F', marginBottom: 6 }}>{label}</div>
    {children}
  </div>
);

const Wrap: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
    {children}
  </div>
);

const FieldDemo: React.FC<React.ComponentProps<typeof Field>> = (props) => {
  const [value, setValue] = useState(props.value ?? '');
  return <Field {...props} value={value} onChange={setValue} />;
};

const TextInputDemo: React.FC<React.ComponentProps<typeof TextInput>> = (props) => {
  const [value, setValue] = useState(props.value ?? '');
  return <TextInput {...props} value={value} onChange={setValue} />;
};

const SelectDemo: React.FC<React.ComponentProps<typeof Select>> = (props) => {
  const [value, setValue] = useState('');
  return <Select {...props} value={value} onChange={setValue} />;
};

const UnderlineSelectDemo: React.FC<React.ComponentProps<typeof UnderlineSelect>> = (props) => {
  const [value, setValue] = useState(props.options[0]);
  return <UnderlineSelect {...props} value={value} onChange={setValue} />;
};

const MeasureFieldDemo: React.FC<React.ComponentProps<typeof MeasureField>> = (props) => {
  const [value, setValue] = useState(props.value ?? '');
  const [value2, setValue2] = useState(props.value2 ?? '');
  return (
    <MeasureField
      {...props}
      value={value}
      onChange={setValue}
      value2={value2}
      onChange2={setValue2}
    />
  );
};

const FillInputDemo: React.FC<React.ComponentProps<typeof FillInput>> = (props) => {
  const [value, setValue] = useState(props.value ?? '');
  return <FillInput {...props} value={value} onChange={setValue} />;
};

const DEPARTMENTS = ['Cardiology', 'Dermatology', 'Neurology'];
const RANGE = ['Today', 'This week', 'This month'];

// Generic local-state wrapper for the string-value dosing pickers.
function PickerDemo<P extends { value: string; onChange: (v: string) => void }>({
  Component,
  initial = '',
  extra,
}: {
  Component: React.ComponentType<P>;
  initial?: string;
  extra?: Omit<P, 'value' | 'onChange'>;
}) {
  const [value, setValue] = useState(initial);
  const props = { ...(extra as object), value, onChange: setValue } as P;
  return <Component {...props} />;
}

export const All: Story = {
  render: () => (
    <Page
      title="Inputs & Fields"
      intro="Every text/value input and dropdown side by side, each driven by local state so typing works. Dosing pickers are shown closed — focus / click to open them. Each sits in a fixed-width slot so widths and heights line up for comparison."
    >
      <Group label="Field — the canonical text input (underline / box / pill)">
        <Wrap>
          <Slot label="underline">
            <FieldDemo variant="underline" placeholder="Patient name" />
          </Slot>
          <Slot label="box">
            <FieldDemo variant="box" placeholder="Email" type="email" />
          </Slot>
          <Slot label="pill">
            <FieldDemo variant="pill" placeholder="Search…" type="search" />
          </Slot>
          <Slot label="box — error">
            <FieldDemo
              variant="box"
              value="taken-name"
              error
              errorMessage="That domain is already taken"
            />
          </Slot>
          <Slot label="box — disabled">
            <FieldDemo variant="box" value="Read only" disabled />
          </Slot>
          <Slot label="box — multiline">
            <FieldDemo variant="box" placeholder="Notes…" multiline />
          </Slot>
        </Wrap>
      </Group>

      <Group label="TextInput — thin alias for <Field variant='underline'>">
        <Wrap>
          <Slot label="default">
            <TextInputDemo placeholder="Patient name" />
          </Slot>
          <Slot label="password">
            <TextInputDemo placeholder="Password" type="password" />
          </Slot>
          <Slot label="error">
            <TextInputDemo value="taken-name" error errorMessage="That name is already in use" />
          </Slot>
        </Wrap>
      </Group>

      <Group label="Select — box-style dropdown (menu portals to body)">
        <Wrap>
          <Slot label="string options">
            <SelectDemo options={DEPARTMENTS} placeholder="Select a department" />
          </Slot>
          <Slot label="error">
            <SelectDemo options={DEPARTMENTS} placeholder="Select a department" error />
          </Slot>
          <Slot label="disabled">
            <SelectDemo options={DEPARTMENTS} placeholder="Select a department" disabled />
          </Slot>
        </Wrap>
      </Group>

      <Group label="UnderlineSelect — inline dropdown (underline / chip)">
        <Wrap>
          <Slot label="underline">
            <UnderlineSelectDemo options={RANGE} placeholder="Select…" variant="underline" />
          </Slot>
          <Slot label="chip">
            <UnderlineSelectDemo options={RANGE} placeholder="Select…" variant="chip" />
          </Slot>
        </Wrap>
      </Group>

      <Group label="MeasureField — value box + unit chip">
        <Wrap>
          <Slot label="default (cream)" w={360}>
            <MeasureFieldDemo value="72" placeholder="Pulse" />
          </Slot>
          <Slot label="with unit" w={360}>
            <MeasureFieldDemo value="170" unit="cm" />
          </Slot>
          <Slot label="box + prefix" w={360}>
            <MeasureFieldDemo value="250" box prefix="₹" />
          </Slot>
          <Slot label="dense" w={360}>
            <MeasureFieldDemo value="98.6" unit="°F" dense />
          </Slot>
          <Slot label="bp (systolic / diastolic)" w={360}>
            <MeasureFieldDemo value="120" value2="80" unit="mmHg" bp box />
          </Slot>
        </Wrap>
      </Group>

      <Group label="FillInput — borderless cream fill block">
        <Wrap>
          <Slot label="left (names)" w={360}>
            <FillInputDemo value="Paracetamol" placeholder="Item name" />
          </Slot>
          <Slot label="centered (qty)" w={360}>
            <FillInputDemo value="12" align="center" inputMode="numeric" placeholder="Qty" />
          </Slot>
          <Slot label="right (price)" w={360}>
            <FillInputDemo value="250.00" align="right" inputMode="decimal" />
          </Slot>
        </Wrap>
      </Group>

      <Group
        label="Dosing pickers — shown closed"
        note="Focus / click each to open its menu. Each owns its own open state; value is driven by local state here."
      >
        <Wrap>
          <Slot label="DosagePicker" w={360}>
            <PickerDemo
              Component={DosagePicker}
              extra={{ medicineName: 'Amoxicillin 500mg Tablet', genericName: 'Amoxicillin' }}
            />
          </Slot>
          <Slot label="DurationPicker" w={360}>
            <PickerDemo Component={DurationPicker} />
          </Slot>
          <Slot label="FrequencyPicker" w={360}>
            <PickerDemo Component={FrequencyPicker} />
          </Slot>
          <Slot label="FrequencyIntervalPicker" w={360}>
            <PickerDemo Component={FrequencyIntervalPicker} />
          </Slot>
          <Slot label="WhenPicker" w={360}>
            <PickerDemo Component={WhenPicker} />
          </Slot>
        </Wrap>
      </Group>
    </Page>
  ),
};
