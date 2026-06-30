import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { SectionBlock } from './SectionBlock';
import { colors, fonts, spacing } from '../../styles/theme';

// A throwaway body so the chrome is the focus of these stories.
const SampleBody = () => (
  <p style={{ margin: 0, fontFamily: fonts.family.primary, fontSize: fonts.size.s, color: colors.neutral600 }}>
    Block body goes here — each block component renders only its own fields inside this shared chrome.
  </p>
);

const meta = {
  title: 'Components/SectionBlock',
  component: SectionBlock,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The uniform **chrome** every visit block renders inside: icon + title header, an optional collapse chevron, a remove action, and a kebab/actions slot — wrapping any body content. Two surfaces: **flush** (divider-separated section in the visit sheet, matching the consult sections) and **card** (its own surface, e.g. for the Procedure block). This is the foundation that makes the visit form modular — every block (Vitals, Rx, Procedure…) shares this shell.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ background: colors.primary200, padding: spacing.xl, width: 680, boxSizing: 'border-box', borderRadius: 12 }}>
        <Story />
      </div>
    ),
  ],
  argTypes: { onToggle: { control: false }, onRemove: { control: false }, children: { control: false } },
} satisfies Meta<typeof SectionBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Flush section — the default. Header + body + a hairline divider, sitting in the visit sheet. */
export const Flush: Story = {
  args: { title: 'Complaints', icon: 'chat-dots', children: <SampleBody /> },
};

/** Card surface — a distinct block that stands out (e.g. Procedure). */
export const CardSurface: Story = {
  args: { title: 'Procedure', icon: 'stethoscope', surface: 'card', children: <SampleBody /> },
};

/** Collapsed — shows a one-line summary next to the title. Click the chevron to expand. */
export const Collapsed: Story = {
  args: { title: 'Procedure', icon: 'stethoscope', summary: 'Left cheek', defaultOpen: false, children: <SampleBody /> },
};

/** With a remove action — for repeatable blocks the doctor can drop. */
export const WithRemove: Story = {
  args: { title: 'Procedure', icon: 'stethoscope', surface: 'card', onRemove: () => {}, children: <SampleBody /> },
};

/** Non-collapsible — no chevron, always open. */
export const NonCollapsible: Story = {
  args: { title: 'Review', icon: 'restart', collapsible: false, children: <SampleBody /> },
};
