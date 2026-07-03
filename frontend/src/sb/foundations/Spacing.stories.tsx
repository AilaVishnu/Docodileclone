import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { spacing } from '../../styles/theme';
import { Page, Group, Mono } from './_kit';

const meta = {
  title: 'Foundations/Spacing',
  parameters: { layout: 'fullscreen', options: { showPanel: false } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Scale: Story = {
  render: () => (
    <Page
      title="Spacing"
      intro="The spacing scale from theme.ts — static inner padding/gap for controls and cards. Use these for spacing inside components; use fluidSpacing.* for outer page gutters."
    >
      <Group label="Scale">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {Object.entries(spacing).map(([key, value]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 90, flexShrink: 0 }}>
                <Mono>{key}</Mono>
              </div>
              <div
                style={{
                  height: 18,
                  width: value,
                  background: '#ECA66D',
                  borderRadius: 3,
                  flexShrink: 0,
                }}
              />
              <div style={{ fontSize: 12, color: '#8F8F8F' }}>{value}</div>
            </div>
          ))}
        </div>
      </Group>
    </Page>
  ),
};
