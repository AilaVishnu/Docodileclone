import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { Page, Group } from '../foundations/_kit';
import { Button } from '../../components/Button';
import { IconButton } from '../../components/IconButton';
import { Tag } from '../../components/Tag';
import { Switch } from '../../components/Switch';
import { StatusBadge, PayBadge } from '../../components/AppointmentQueue/StatusBadge';

// Consolidation view: every button / chip / badge primitive on one page so a
// designer can eyeball them together and catch inconsistencies. Reuses the real
// components — no reimplementation.

const meta = {
  title: 'Overview/Buttons & Chips',
  parameters: { layout: 'fullscreen', options: { showPanel: false } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const VARIANTS = [
  'dark',
  'light',
  'primary',
  'primaryLight',
  'secondary',
  'secondaryLight',
] as const;

const STATUSES = [
  'BOOKED',
  'WAITING',
  'SCHEDULED',
  'ARRIVED',
  'IN_PROGRESS',
  'COMPLETED',
  'NO_SHOW',
  'CANCELLED',
] as const;

const PAY_STATUSES = ['PAID', 'DUE', 'UNPAID', 'NO PAY'] as const;

const Row: React.FC<{ children: React.ReactNode; label?: string }> = ({ children, label }) => (
  <div style={{ marginBottom: 16 }}>
    {label && (
      <div style={{ fontSize: 12, color: '#8F8F8F', marginBottom: 8 }}>{label}</div>
    )}
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
      {children}
    </div>
  </div>
);

export const All: Story = {
  render: () => (
    <Page
      title="Buttons & Chips"
      intro="Every interactive pill, chip and badge in one place — Button variants × sizes × states, IconButton, Tag, Switch, and the queue StatusBadge / PayBadge. Scan across to catch any drift in colour, radius or height."
    >
      <Group label="Button — variants × text sizes">
        {VARIANTS.map((v) => (
          <Row key={v} label={v}>
            <Button variant={v} size="md">
              Medium
            </Button>
            <Button variant={v} size="sm">
              Small
            </Button>
          </Row>
        ))}
      </Group>

      <Group label="Button — with icon">
        <Row>
          <Button variant="primary" iconLeft={<span aria-hidden>＋</span>}>
            Add patient
          </Button>
          <Button variant="secondary" iconLeft={<span aria-hidden>＋</span>}>
            New clinic
          </Button>
          <Button variant="dark" iconRight={<span aria-hidden>→</span>}>
            Continue
          </Button>
          <Button variant="light" iconLeft={<span aria-hidden>↻</span>}>
            Refresh
          </Button>
        </Row>
      </Group>

      <Group label="Button — disabled">
        <Row>
          {VARIANTS.map((v) => (
            <Button key={v} variant={v} disabled>
              {v}
            </Button>
          ))}
        </Row>
      </Group>

      <Group label="IconButton — circular icon-only (square *Icon sizes)">
        <Row>
          <IconButton ariaLabel="Close" />
          <IconButton ariaLabel="Add" size={32}>
            <span aria-hidden>＋</span>
          </IconButton>
          <IconButton ariaLabel="Large add" size={48}>
            <span aria-hidden>＋</span>
          </IconButton>
          <IconButton ariaLabel="Disabled" disabled />
        </Row>
      </Group>

      <Group label="Tag — outline / filled, plain & removable">
        <Row>
          <Tag label="Outline" variant="outline" />
          <Tag label="Outline" variant="outline" onRemove={() => {}} removeLabel="Remove" />
          <Tag label="Filled" variant="filled" />
          <Tag label="Filled" variant="filled" onRemove={() => {}} removeLabel="Remove" />
        </Row>
      </Group>

      <Group label="Switch — off / on / sm">
        <Row>
          <Switch ariaLabel="Off" checked={false} onChange={() => {}} />
          <Switch ariaLabel="On" checked onChange={() => {}} />
          <Switch ariaLabel="With hint" checked hint="Email notifications" onChange={() => {}} />
          <Switch ariaLabel="Small on" size="sm" checked onChange={() => {}} />
          <Switch ariaLabel="Disabled" disabled onChange={() => {}} />
        </Row>
      </Group>

      <Group label="StatusBadge — every appointment status">
        <Row>
          {STATUSES.map((s) => (
            <StatusBadge key={s} status={s} />
          ))}
          <StatusBadge
            status="IN_PROGRESS"
            sessionStartedAt={new Date(Date.now() - 8 * 60 * 1000).toISOString()}
          />
          <StatusBadge status="IN_PROGRESS" started />
        </Row>
      </Group>

      <Group label="PayBadge — every pay state (hover for the label)">
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          {PAY_STATUSES.map((s) => (
            <div key={s} style={{ textAlign: 'center' }}>
              <PayBadge status={s} />
              <div style={{ fontSize: 12, marginTop: 4 }}>{s}</div>
            </div>
          ))}
        </div>
      </Group>
    </Page>
  ),
};
