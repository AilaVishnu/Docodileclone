import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { Icon, ICON_NAMES, MULTICOLOR_ICONS } from '../../components/Icon';
import { Page, Group, Grid } from './_kit';

const meta = {
  title: 'Foundations/Icons',
  parameters: { layout: 'fullscreen', options: { showPanel: false } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const lineIcons = ICON_NAMES.filter((n) => !MULTICOLOR_ICONS.has(n));
const multiIcons = ICON_NAMES.filter((n) => MULTICOLOR_ICONS.has(n));

const Cell = ({ name, label, children }: { name: string; label?: string; children: React.ReactNode }) => (
  <div
    style={{
      border: '1px solid #E3E3E3',
      borderRadius: 10,
      background: '#fff',
      padding: '18px 10px 10px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 12,
    }}
  >
    <div style={{ height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{children}</div>
    <div style={{ fontSize: 11, color: '#585858', textAlign: 'center', wordBreak: 'break-word' }}>{label ?? name}</div>
  </div>
);

export const Library: Story = {
  render: () => (
    <Page
      title="Icons"
      intro={
        'Every icon registered in <Icon> — auto-pulled from assets/icons plus the named app/nav icons. ' +
        'Render with `<Icon name="…" size tone disabled />`. Line icons are monochrome (currentColor, ' +
        'neutral900 by default, 1.5 stroke, 24px); multicolor icons keep their own baked palette.'
      }
    >
      <Group label="Sizes & states">
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <Cell name="calendar" label="24 · default"><Icon name="calendar" /></Cell>
          <Cell name="calendar" label="20 · small"><Icon name="calendar" size={20} /></Cell>
          <Cell name="calendar" label="muted"><Icon name="calendar" tone="muted" /></Cell>
          <Cell name="calendar" label="disabled"><Icon name="calendar" disabled /></Cell>
          <Cell name="calendar" label="recolor"><Icon name="calendar" color="#CF6F2F" /></Cell>
        </div>
      </Group>

      <Group label={`Line icons · ${lineIcons.length}`}>
        <Grid min={120}>
          {lineIcons.map((name) => (
            <Cell key={name} name={name}>
              <Icon name={name} />
            </Cell>
          ))}
        </Grid>
      </Group>

      <Group label={`Multicolor / illustrative · ${multiIcons.length}`}>
        <Grid min={120}>
          {multiIcons.map((name) => (
            <Cell key={name} name={name}>
              <Icon name={name} />
            </Cell>
          ))}
        </Grid>
      </Group>
    </Page>
  ),
};

// ── Duplicate concepts — two glyphs for one idea, both live in the app ───────
const Opt = ({ name, use }: { name: string; use: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
    <div style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #E3E3E3', borderRadius: 8, background: '#fff', flexShrink: 0 }}>
      <Icon name={name} />
    </div>
    <div>
      <div style={{ fontSize: 13, color: '#202020' }}>{name}</div>
      <div style={{ fontSize: 11, color: '#888' }}>{use}</div>
    </div>
  </div>
);

const DUP_PAIRS: { concept: string; a: string; aUse: string; b: string; bUse: string }[] = [
  { concept: 'calendar', a: 'calendar', aUse: 'Rx pad', b: 'calendar-alt', bUse: 'BillModal · date/patient pickers' },
  { concept: 'pulse', a: 'pulse', aUse: 'Rx pad', b: 'pulse-alt', bUse: 'BookAppointment (Service)' },
  { concept: 'envelope', a: 'letter', aUse: 'Rx pad', b: 'mail', bUse: 'Login · Staff · SetupPassword' },
  { concept: 'restart', a: 'restart', aUse: 'SessionBar', b: 'restart-24', bUse: 'Rx pad' },
  { concept: 'bill-check', a: 'bill-check', aUse: 'BookAppointment', b: 'bill-check-small', bUse: 'Rx pad' },
  { concept: 'hourglass', a: 'hourglass', aUse: 'DoctorStatusCard', b: 'hourglass-line', bUse: 'Rx pad' },
  { concept: 'users group', a: 'users-group', aUse: 'DoctorStatusCard', b: 'users-group-rounded', bUse: 'Rx pad' },
  { concept: 'person', a: 'user', aUse: 'DoctorStatusCard · Rx pad', b: 'user-hands', bUse: 'Staff · PatientForm' },
];

/** The 8 "same concept, two glyphs" pairs still live in the app — pick one per row to merge. */
export const DuplicatePairs: Story = {
  render: () => (
    <Page
      title="Duplicate concepts — pick one per row"
      intro="Each row is two different glyphs for the same idea, both currently used in the app. Pick the one to keep; I re-point the screens onto it and drop the other."
    >
      <div>
        {DUP_PAIRS.map((p) => (
          <div
            key={p.concept}
            style={{ display: 'grid', gridTemplateColumns: '110px 1fr 1fr', alignItems: 'center', gap: 16, padding: '14px 4px', borderBottom: '1px solid #E3E3E3' }}
          >
            <div style={{ fontSize: 13, fontWeight: 500, color: '#202020' }}>{p.concept}</div>
            <Opt name={p.a} use={p.aUse} />
            <Opt name={p.b} use={p.bUse} />
          </div>
        ))}
      </div>
    </Page>
  ),
};
