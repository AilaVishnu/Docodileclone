import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { Modal } from './Modal';

const SampleContent = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    <h2 style={{ margin: 0 }}>Add a doctor</h2>
    <p style={{ margin: 0, color: '#4a4a4a' }}>
      Fill in the doctor’s details to add them to your clinic. They’ll appear in the
      queue and the scheduling grid right away.
    </p>
    <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
      <button type="button">Cancel</button>
      <button type="button">Save</button>
    </div>
  </div>
);

const meta = {
  title: 'Components/Modal',
  component: Modal,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The one canonical overlay shell — owns the backdrop, centering, portal, stacking, Esc-to-close and body scroll-lock. The content surface colour is per-caller via `surface`. Stories render the modal open.',
      },
    },
  },
  argTypes: {
    level: {
      control: 'inline-radio',
      options: ['modal', 'top'],
      table: { defaultValue: { summary: 'modal' } },
    },
    surface: { control: 'color' },
    backdrop: { control: 'color' },
    width: { control: 'text' },
    padding: { control: 'number' },
    radius: { control: 'number' },
    closeOnBackdrop: {
      control: 'boolean',
      table: { defaultValue: { summary: 'true' } },
    },
    closeOnEsc: {
      control: 'boolean',
      table: { defaultValue: { summary: 'true' } },
    },
    lockScroll: {
      control: 'boolean',
      table: { defaultValue: { summary: 'true' } },
    },
    isOpen: { control: false },
    onClose: { control: false },
    children: { control: false },
    shadow: { control: false },
  },
  args: {
    isOpen: true,
    onClose: () => {},
    children: <SampleContent />,
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const FixedWidth: Story = { args: { width: 520 } };

export const TightPadding: Story = { args: { padding: 16, radius: 12 } };

export const TopLevel: Story = { args: { level: 'top' } };
