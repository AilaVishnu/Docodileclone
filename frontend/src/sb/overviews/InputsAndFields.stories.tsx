import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { Page, Group } from '../foundations/_kit';
import { Field } from '../../components/Field';
import { Select } from '../../components/Input/Select/Select';
import { SuggestionInput } from '../../components/Input/SuggestionInput/SuggestionInput';
import { MeasureField } from '../../components/MeasureField';

// The input system, organised by SHAPE → VARIANT → STATE. Every example is the
// real component driven by local state so typing works.

const meta = {
  title: 'Overview/Inputs & Fields',
  parameters: { layout: 'fullscreen', options: { showPanel: false } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const Slot: React.FC<{ label: string; children: React.ReactNode; w?: number }> = ({
  label,
  children,
  w = 300,
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

const SelectDemo: React.FC<React.ComponentProps<typeof Select> & { initial?: string }> = ({
  initial = '',
  ...props
}) => {
  const [value, setValue] = useState(initial);
  return <Select {...props} value={value} onChange={setValue} />;
};

const SuggestionDemo: React.FC<{
  suggestions: string[];
  placeholder?: string;
  chevron?: boolean;
}> = ({ suggestions, placeholder, chevron }) => {
  const [value, setValue] = useState('');
  return (
    <SuggestionInput
      value={value}
      onChange={setValue}
      suggestions={suggestions}
      placeholder={placeholder}
      chevron={chevron}
    />
  );
};

const MeasureFieldDemo: React.FC<React.ComponentProps<typeof MeasureField>> = (props) => {
  const [value, setValue] = useState(props.value ?? '');
  const [value2, setValue2] = useState(props.value2 ?? '');
  return (
    <MeasureField {...props} value={value} onChange={setValue} value2={value2} onChange2={setValue2} />
  );
};

const DEPARTMENTS = ['Cardiology', 'Dermatology', 'Neurology'];
const DURATIONS = ['SOS', '3 Days', '5 Days', '7 Days', 'As directed'];
const WHEN = ['Before Food', 'After Food', 'Empty Stomach', 'Bed Time'];

export const All: Story = {
  render: () => (
    <Page
      title="Inputs & Fields"
      intro="The input system, organised by shape → variant → state. Every example is the real component driven by local state, so you can type into them. Errors show the red border + soft red fill; disabled is dimmed."
    >
      {/* ── TEXT INPUTS ─────────────────────────────────────────────── */}
      <Group
        label="1 · Underline — minimal text field (left-aligned)"
        note="States: default · typed · error. The plainest field — inline form rows (this is the old TextInput)."
      >
        <Wrap>
          <Slot label="default">
            <FieldDemo variant="underline" placeholder="Patient name" />
          </Slot>
          <Slot label="typed">
            <FieldDemo variant="underline" value="Ramesh Babu" />
          </Slot>
          <Slot label="error">
            <FieldDemo variant="underline" value="bad@" error errorMessage="Enter a valid email" />
          </Slot>
        </Wrap>
      </Group>

      <Group
        label="2 · Box · Outline — border + white"
        note="States: default · typed · error · disabled. Alignment: left / center / right."
      >
        <Wrap>
          <Slot label="default">
            <FieldDemo variant="box" placeholder="Email" />
          </Slot>
          <Slot label="typed">
            <FieldDemo variant="box" value="ramesh@clinic.test" />
          </Slot>
          <Slot label="error">
            <FieldDemo variant="box" value="taken-name" error errorMessage="That domain is taken" />
          </Slot>
          <Slot label="disabled">
            <FieldDemo variant="box" value="Read only" disabled />
          </Slot>
          <Slot label="align · left">
            <FieldDemo variant="box" value="Name" align="left" />
          </Slot>
          <Slot label="align · center">
            <FieldDemo variant="box" value="12" align="center" />
          </Slot>
          <Slot label="align · right">
            <FieldDemo variant="box" value="250.00" align="right" />
          </Slot>
        </Wrap>
      </Group>

      <Group
        label="3 · Box · Filled — cream, borderless"
        note="Same states + alignment as outline. The cream fill is the old FillInput / MeasureField surface."
      >
        <Wrap>
          <Slot label="default">
            <FieldDemo variant="box" fill="filled" placeholder="Item name" />
          </Slot>
          <Slot label="typed">
            <FieldDemo variant="box" fill="filled" value="Paracetamol" />
          </Slot>
          <Slot label="error">
            <FieldDemo variant="box" fill="filled" value="0" error errorMessage="Required" />
          </Slot>
          <Slot label="disabled">
            <FieldDemo variant="box" fill="filled" value="Read only" disabled />
          </Slot>
          <Slot label="align · center (qty)">
            <FieldDemo variant="box" fill="filled" value="12" align="center" />
          </Slot>
          <Slot label="align · right (price)">
            <FieldDemo variant="box" fill="filled" value="250.00" align="right" />
          </Slot>
        </Wrap>
      </Group>

      <Group
        label="4 · Pill — search field (outline)"
        note="Mostly used for search. States: default · typed."
      >
        <Wrap>
          <Slot label="default">
            <FieldDemo variant="pill" type="search" placeholder="Search patients…" />
          </Slot>
          <Slot label="typed">
            <FieldDemo variant="pill" type="search" value="Ramesh" />
          </Slot>
        </Wrap>
      </Group>

      {/* ── DROPDOWNS ───────────────────────────────────────────────── */}
      <Group
        label="5 · Select — dropdown, pick from a list (not editable)"
        note="fill: outline / filled · chevron: on / off · states: default · selected · error · disabled. Menu portals to body."
      >
        <Wrap>
          <Slot label="outline · chevron">
            <SelectDemo options={DEPARTMENTS} placeholder="Select a department" />
          </Slot>
          <Slot label="filled · chevron">
            <SelectDemo options={DEPARTMENTS} placeholder="Select a department" fill="filled" />
          </Slot>
          <Slot label="outline · no chevron">
            <SelectDemo options={DEPARTMENTS} placeholder="Select a department" chevron={false} />
          </Slot>
          <Slot label="filled · no chevron">
            <SelectDemo options={DEPARTMENTS} placeholder="Select a department" fill="filled" chevron={false} />
          </Slot>
          <Slot label="selected">
            <SelectDemo options={DEPARTMENTS} initial="Dermatology" />
          </Slot>
          <Slot label="error">
            <SelectDemo options={DEPARTMENTS} placeholder="Select a department" error />
          </Slot>
          <Slot label="disabled">
            <SelectDemo options={DEPARTMENTS} placeholder="Select a department" disabled />
          </Slot>
        </Wrap>
      </Group>

      <Group
        label="6 · Combobox — dropdown you type into (filters as you type)"
        note="Filled. States: default · typed → filtered suggestions. With or without a chevron. This is what the dosing pickers (Duration / Frequency / When …) are built on."
      >
        <Wrap>
          <Slot label="type-to-filter · no chevron">
            <SuggestionDemo suggestions={DURATIONS} placeholder="Duration" />
          </Slot>
          <Slot label="pick-list · with chevron">
            <SuggestionDemo suggestions={WHEN} placeholder="When" chevron />
          </Slot>
        </Wrap>
      </Group>

      {/* ── SPECIALISED ─────────────────────────────────────────────── */}
      <Group
        label="7 · MeasureField — value box + unit chip (specialised filled box)"
        note="A filled box (same cream surface as #3) plus a unit chip, prefix, dense, and a two-field blood-pressure mode."
      >
        <Wrap>
          <Slot label="default (cream)" w={340}>
            <MeasureFieldDemo value="72" placeholder="Pulse" />
          </Slot>
          <Slot label="with unit" w={340}>
            <MeasureFieldDemo value="170" unit="cm" />
          </Slot>
          <Slot label="box + prefix" w={340}>
            <MeasureFieldDemo value="250" box prefix="₹" />
          </Slot>
          <Slot label="dense" w={340}>
            <MeasureFieldDemo value="98.6" unit="°F" dense />
          </Slot>
          <Slot label="bp (systolic / diastolic)" w={340}>
            <MeasureFieldDemo value="120" value2="80" unit="mmHg" bp box />
          </Slot>
        </Wrap>
      </Group>
    </Page>
  ),
};
