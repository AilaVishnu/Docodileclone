import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { ViewToggle, type ViewMode } from './ViewToggle';

const meta = {
  title: 'Components/ViewToggle',
  component: ViewToggle,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'The canonical list ⇄ grid view switch — a segmented control of two icon buttons (list-sort / grid) at neutral900, 1.5 stroke. The active view gets a white pill on a subtle grey track. Used by the prescription queue, the patient Files tab, and anywhere a list/grid view is offered.',
      },
    },
  },
} satisfies Meta<typeof ViewToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [mode, setMode] = useState<ViewMode>('grid');
    return <ViewToggle value={mode} onChange={setMode} />;
  },
};
