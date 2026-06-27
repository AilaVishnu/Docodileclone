import React, { useEffect, useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { fonts } from '../../styles/theme';
import { Page, Group, Mono } from './_kit';

const meta = {
  title: 'Foundations/Typography',
  parameters: { layout: 'fullscreen', options: { showPanel: false } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// Reads the live computed font-size / line-height (the --fs-*/--lh-* vars are
// fluid clamps defined in globals.css, so we measure rather than hardcode).
const TypeRow: React.FC<{ token: string; serif?: boolean }> = ({ token, serif }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [px, setPx] = useState('');
  useEffect(() => {
    if (!ref.current) return;
    const cs = getComputedStyle(ref.current);
    setPx(`${Math.round(parseFloat(cs.fontSize))} / ${Math.round(parseFloat(cs.lineHeight))}`);
  }, []);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: 20,
        padding: '12px 0',
        borderBottom: '1px solid #F0F0F0',
      }}
    >
      <div style={{ width: 140, flexShrink: 0 }}>
        <Mono>--fs-{token}</Mono>
        <div style={{ fontSize: 11, color: '#ABABAB', marginTop: 2 }}>{px} px</div>
      </div>
      <div
        ref={ref}
        style={{
          fontSize: `var(--fs-${token})`,
          lineHeight: `var(--lh-${token})`,
          fontFamily: serif ? "'Libertinus Serif', serif" : "'Inter', sans-serif",
          fontWeight: 500,
        }}
      >
        Healthy patients, happy clinics
      </div>
    </div>
  );
};

const SIZES = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'l', 'm', 's', 'xs', 'caption'];

export const Scale: Story = {
  render: () => (
    <Page
      title="Typography"
      intro="The type scale is CSS-variable driven (--fs-*/--lh-* in globals.css) and scales fluidly with the viewport — resize the canvas to watch the sizes track. Components read fonts.size.h1 etc. from theme.ts."
    >
      <Group label="Type scale (Inter)">
        <div>
          {SIZES.map((t) => (
            <TypeRow key={t} token={t} />
          ))}
        </div>
      </Group>

      <Group label="Families">
        <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 30, fontWeight: 600 }}>Inter</div>
            <Mono>fonts.family.primary</Mono>
            <div style={{ color: '#8F8F8F', fontSize: 12, marginTop: 2 }}>UI / body</div>
          </div>
          <div>
            <div style={{ fontFamily: "'Libertinus Serif', serif", fontSize: 30 }}>Libertinus Serif</div>
            <Mono>fonts.family.secondary</Mono>
            <div style={{ color: '#8F8F8F', fontSize: 12, marginTop: 2 }}>display / accents</div>
          </div>
        </div>
      </Group>

      <Group label="Weights">
        <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', fontFamily: "'Inter', sans-serif" }}>
          {Object.entries(fonts.weight).map(([name, w]) => (
            <div key={name}>
              <div style={{ fontSize: 26, fontWeight: w as number }}>Aa</div>
              <div style={{ fontSize: 12, color: '#585858' }}>
                {name} · {w}
              </div>
            </div>
          ))}
        </div>
      </Group>
    </Page>
  ),
};
