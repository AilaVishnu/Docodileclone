import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { UploadModal } from './UploadModal';

const meta = {
  title: 'Components/UploadModal',
  component: UploadModal,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The shared "upload anything" modal. A centered header + top-right ✕, an arrow drop-zone (click OR drag-drop), an optional body slot (per-file metadata, a CSV preview…) and a Cancel + black-confirm footer. Rendered open here; the parent owns `isOpen`.',
      },
    },
    layout: 'fullscreen',
  },
  argTypes: {
    title: { control: 'text' },
    subtitle: { control: 'text' },
    dropTitle: { control: 'text' },
    dropHint: { control: 'text' },
    confirmLabel: { control: 'text' },
    cancelLabel: { control: 'text' },
    hasFiles: { control: 'boolean' },
    confirmDisabled: { control: 'boolean' },
    multiple: { control: 'boolean' },
    accept: { control: 'text' },
    width: { control: 'number', table: { defaultValue: { summary: '560' } } },
    isOpen: { control: false },
    onClose: { control: false },
    onFiles: { control: false },
    onConfirm: { control: false },
    children: { control: false },
  },
  args: {
    isOpen: true,
    onClose: () => {},
    onFiles: () => {},
    onConfirm: () => {},
    title: 'Upload files',
    confirmLabel: 'Upload',
  },
} satisfies Meta<typeof UploadModal>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The plain upload modal — drop-zone + footer. */
export const Default: Story = {};

/** With a subtitle and an accepted-types hint. */
export const WithSubtitleAndHint: Story = {
  args: {
    title: 'Import pharmacy stock',
    subtitle: 'Upload a CSV exported from your distributor.',
    dropHint: 'CSV up to 5 MB',
    accept: '.csv',
    confirmLabel: 'Import',
  },
};

/** Confirm disabled — e.g. before any file is chosen. */
export const ConfirmDisabled: Story = {
  args: { confirmDisabled: true },
};
