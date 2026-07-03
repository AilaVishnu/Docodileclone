import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { radii, strokes } from '../../styles/theme';
import { Page, Group, Grid, Mono } from './_kit';

const meta = {
  title: 'Foundations/Radii & Strokes',
  parameters: { layout: 'fullscreen', options: { showPanel: false } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Shape: Story = {
  render: () => (
    <Page
      title="Radii & Strokes"
      intro="Corner radii and border-stroke widths from theme.ts. Radii carry shape identity and stay static across viewports."
    >
      <Group label="Corner radii">
        <Grid min={130}>
          {Object.entries(radii).map(([key, value]) => (
            <div key={key} style={{ textAlign: 'center' }}>
              <div
                style={{
                  height: 72,
                  background: '#F3F3DC',
                  border: '1.5px solid #ECA66D',
                  borderRadius: typeof value === 'number' ? value : Number(value),
                  marginBottom: 8,
                }}
              />
              <div style={{ fontSize: 12.5, fontWeight: 600 }}>{key}</div>
              <Mono>{value}px</Mono>
            </div>
          ))}
        </Grid>
      </Group>

      <Group label="Stroke widths">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {Object.entries(strokes).map(([key, value]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 70 }}>
                <Mono>{key}</Mono>
              </div>
              <div style={{ width: 220, borderTop: `${value} solid #585858` }} />
              <div style={{ fontSize: 12, color: '#8F8F8F' }}>{value}</div>
            </div>
          ))}
        </div>
      </Group>
    </Page>
  ),
};
