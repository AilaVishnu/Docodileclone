import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { DosagePicker } from './DosagePicker';

const meta = {
  title: 'Components/DosagePicker',
  component: DosagePicker,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A cream combobox for entering a dose. It infers the medicine type from `medicineName` / `genericName` and offers smart suggestions — typing a bare number expands it into that type\'s units (e.g. "2" → "2 Tablets"). Focus the input to open the menu.',
      },
    },
  },
  argTypes: {
    medicineName: { control: 'text' },
    genericName: { control: 'text' },
    value: { control: 'text' },
    onChange: { control: false },
  },
  args: {
    value: '',
    medicineName: 'Amoxicillin 500mg Tablet',
    genericName: 'Amoxicillin',
  },
  decorators: [
    (Story) => (
      <div style={{ width: 360 }}>
        <Story />
      </div>
    ),
  ],
  // Controlled: manages its own open state; drive value with local state.
  render: (args) => {
    const [value, setValue] = useState(args.value ?? '');
    React.useEffect(() => setValue(args.value ?? ''), [args.value]);
    return <DosagePicker {...args} value={value} onChange={setValue} />;
  },
} satisfies Meta<typeof DosagePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Empty — focus to see tablet suggestions. */
export const Default: Story = {};

/** A chosen dose. */
export const WithValue: Story = {
  args: { value: '2 Tablets' },
};

/** A syrup — suggestions switch to ml / teaspoons. */
export const Syrup: Story = {
  args: { medicineName: 'Cough Syrup', genericName: 'Dextromethorphan', value: '' },
};

/** Insulin — suggestions are in Units. */
export const Insulin: Story = {
  args: { medicineName: 'Insulin Glargine', genericName: 'Insulin', value: '10 Units' },
};
