import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { shadows, zIndex } from '../../styles/theme';
import { Page, Group, Mono } from './_kit';

const meta = {
  title: 'Foundations/Elevation',
  parameters: { layout: 'fullscreen', options: { showPanel: false } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const ShadowsAndLayering: Story = {
  render: () => (
    <Page
      title="Elevation"
      intro="Shadows and the z-index scale from theme.ts — the single source of truth for surfaces and stacking order."
    >
      <Group label="Shadows">
        <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', padding: '8px 0 4px' }}>
          {Object.entries(shadows).map(([key, value]) => (
            <div key={key} style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: 150,
                  height: 96,
                  background: '#fff',
                  borderRadius: 12,
                  boxShadow: value,
                  marginBottom: 12,
                }}
              />
              <div style={{ fontSize: 12.5, fontWeight: 600 }}>{key}</div>
              <div style={{ fontSize: 10.5, color: '#ABABAB', maxWidth: 150 }}>{value}</div>
            </div>
          ))}
        </div>
      </Group>

      <Group label="Layering (z-index)" note="Stacking order: modals clear the fixed nav; toasts win.">
        <div style={{ display: 'inline-flex', flexDirection: 'column', border: '1px solid #E3E3E3', borderRadius: 10, overflow: 'hidden' }}>
          {Object.entries(zIndex)
            .sort((a, b) => a[1] - b[1])
            .map(([key, value], i) => (
              <div
                key={key}
                style={{
                  display: 'flex',
                  gap: 24,
                  alignItems: 'center',
                  padding: '10px 16px',
                  borderTop: i === 0 ? 'none' : '1px solid #F0F0F0',
                  minWidth: 320,
                }}
              >
                <span style={{ width: 110, fontWeight: 600, fontSize: 13 }}>{key}</span>
                <Mono>{value}</Mono>
              </div>
            ))}
        </div>
      </Group>
    </Page>
  ),
};
