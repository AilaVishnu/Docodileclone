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
