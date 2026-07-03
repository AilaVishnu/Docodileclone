import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { PrintPreviewModal } from './PrintPreviewModal';

const noop = () => {};

const SAMPLE_HTML = `
<!doctype html>
<html>
  <head>
    <style>
      body { font-family: -apple-system, system-ui, sans-serif; color: #222; padding: 32px; }
      h1 { font-size: 20px; margin: 0 0 4px; }
      .muted { color: #777; font-size: 13px; }
      hr { border: none; border-top: 1px solid #ddd; margin: 16px 0; }
      .rx { font-size: 15px; line-height: 1.6; }
    </style>
  </head>
  <body>
    <h1>Sunrise Skin Clinic</h1>
    <div class="muted">12, MG Road, Bengaluru · +91 98765 43210</div>
    <hr />
    <div class="muted">Patient: Ramesh Babu · M 40 · 13 Jun 2026</div>
    <h2>Prescription</h2>
    <div class="rx">
      1. Cetirizine 10mg — once daily, 5 days<br />
      2. Calamine lotion — apply twice daily<br />
      3. Avoid direct sun exposure
    </div>
  </body>
</html>
`;

const meta = {
  title: 'Components/PrintPreviewModal',
  component: PrintPreviewModal,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The browser-style print/save dialog used for prescriptions. Renders the supplied `html` string inside a preview iframe, with a Destination toggle (Save as PDF / Print) plus configure, share and download actions.',
      },
    },
  },
  argTypes: {
    isOpen: { control: 'boolean' },
    html: { control: 'text' },
    onClose: { control: false },
    onSave: { control: false },
    onPrint: { control: false },
    onShare: { control: false },
    onConfigureTemplate: { control: false },
  },
  args: {
    isOpen: true,
    html: SAMPLE_HTML,
    onClose: noop,
    onSave: noop,
    onPrint: noop,
    onShare: noop,
    onConfigureTemplate: noop,
  },
} satisfies Meta<typeof PrintPreviewModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Empty document — the preview iframe renders blank. */
export const EmptyDocument: Story = {
  args: { html: '<!doctype html><html><body></body></html>' },
};
