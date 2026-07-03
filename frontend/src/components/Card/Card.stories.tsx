import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { Card } from './Card';

const Demo = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <strong>Clinic summary</strong>
    <span style={{ color: '#6b6b6b' }}>3 doctors · 2 departments</span>
  </div>
);

const meta = {
  title: 'Components/Card',
  component: Card,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Canonical card surface — one source of truth for the “paper” look every *Card draws. `plain` (default) is a transparent layout shell; `surface`/`sage`/`cream` are paper colours; `elevation="raised"` adds the single soft card shadow. Radius is always 16.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['plain', 'surface', 'sage', 'cream'],
      table: { defaultValue: { summary: 'plain' } },
    },
    elevation: {
      control: 'inline-radio',
      options: ['none', 'raised'],
      table: { defaultValue: { summary: 'none' } },
    },
    padding: {
      control: 'select',
      options: ['xs', 's', 'm', 'l', 'xl', '2xl'],
    },
    children: { control: false },
    style: { control: false },
  },
  args: {
    variant: 'surface',
    elevation: 'none',
    padding: 'l',
    children: <Demo />,
    style: { width: 320 },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Surface: Story = {};

export const Sage: Story = { args: { variant: 'sage' } };

export const Cream: Story = { args: { variant: 'cream' } };

export const Raised: Story = { args: { elevation: 'raised' } };

/** The transparent layout shell (legacy default) — no paper, just a flex column. */
export const Plain: Story = { args: { variant: 'plain', padding: undefined } };

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
      {(['surface', 'sage', 'cream'] as const).map((v) => (
        <Card key={v} variant={v} elevation="raised" padding="l" style={{ width: 200 }}>
          <strong style={{ textTransform: 'capitalize' }}>{v}</strong>
        </Card>
      ))}
    </div>
  ),
};
