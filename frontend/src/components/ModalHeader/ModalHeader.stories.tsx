import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { ModalHeader } from './ModalHeader';
import { colors, radii, spacing } from '../../styles/theme';

// Renders the header on a faux modal surface so it reads in context.
const Surface = ({ children, width = 440 }: { children: React.ReactNode; width?: number }) => (
  <div style={{ width, background: colors.primary100, borderRadius: radii['2xl'], padding: spacing.xl, boxSizing: 'border-box' }}>
    {children}
  </div>
);

const meta = {
  title: 'Components/ModalHeader',
  component: ModalHeader,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The canonical modal header — serif title (+ optional subtitle) and the canonical `IconButton` close (✕). Pair with `<Modal>` so modals stop re-declaring the same header/title/subtitle styles. `align="left"` puts the close on the right; `align="center"` centres the title and pins the close top-right; omit `onClose` for no close button.',
      },
    },
  },
  argTypes: {
    onClose: { control: false },
    align: { control: 'radio', options: ['left', 'center'] },
  },
  decorators: [(Story) => <Surface><Story /></Surface>],
} satisfies Meta<typeof ModalHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Left-aligned, title only, close on the right (AddStaffModal / AddServiceModal). */
export const Left: Story = {
  args: { title: 'Add staff member', onClose: () => {} },
};

/** Left-aligned with a subtitle (EditPatientModal / NewPrescriptionModal). */
export const LeftWithSubtitle: Story = {
  args: { title: 'Edit Patient Info', subtitle: 'Update personal details for this patient', onClose: () => {} },
};

/** Centred title + subtitle, close pinned top-right (UploadModal). */
export const Centered: Story = {
  args: { title: 'Upload files', subtitle: 'PDFs and images, up to 10MB each', onClose: () => {}, align: 'center' },
};

/** Centred, no close button (SchedulePresetsModal). */
export const CenteredNoClose: Story = {
  args: { title: 'Set your hours', subtitle: 'Pick a starting point — you can tweak any day after.', align: 'center' },
};
