import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { FileViewer } from './FileViewer';

// Self-contained placeholder image (data URI) so the viewer renders offline,
// without auth — the viewer uses a non-API fileUrl directly.
const SAMPLE_IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='900' height='1100'>
       <rect width='100%' height='100%' fill='#1c1c1c'/>
       <rect x='60' y='60' width='780' height='980' fill='none' stroke='#3a3a3a' stroke-width='2'/>
       <text x='50%' y='52%' font-family='sans-serif' font-size='44' fill='#8a8a8a' text-anchor='middle'>Chest X-ray (sample)</text>
     </svg>`,
  );

const meta = {
  title: 'Pages/Prescription/FileViewer',
  component: FileViewer,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The patient-file image viewer with annotation overlay (pin + comment, pencil, arrow, rect), opened from the Files tab. Annotations persist to localStorage per file id. Rendered here standalone with a placeholder image for iterating on layout.',
      },
    },
  },
  decorators: [(Story) => <div style={{ height: '92vh' }}><Story /></div>],
  argTypes: { onBack: { control: false }, file: { control: false } },
  args: { onBack: () => {} },
} satisfies Meta<typeof FileViewer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    file: { id: 'sb-file-1', name: 'Chest X-ray.png', fileUrl: SAMPLE_IMG, mimeType: 'image/svg+xml' },
  },
};
