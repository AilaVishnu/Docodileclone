import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { Autocomplete } from './Autocomplete';
import { withClinicSession } from '../../sb/decorators';

const meta = {
  title: 'Components/Input/Autocomplete',
  component: Autocomplete,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Generic per-clinic autocomplete input. Pulls ranked suggestions from `GET /api/suggestions?field=&q=` via `useSuggestions(field, value)`, shows the top items on focus, and prefix-filters as you type. Selecting an item fills the input and fires `onChange`. The `field` prop names the suggestion bucket — e.g. `allergies`, `diagnosis`, `complaints`.',
      },
    },
  },
  argTypes: {
    field: {
      control: 'select',
      options: ['allergies', 'familyHistory', 'diagnosis', 'complaints'],
      description: 'Suggestion bucket name on the server.',
    },
    value: { control: 'text' },
    placeholder: { control: 'text' },
    multiline: { control: 'boolean' },
    ariaLabel: { control: 'text' },
    onChange: { control: false },
    inputStyle: { control: false },
    trailingSlot: { control: false },
  },
  args: {
    field: 'allergies',
    value: '',
    placeholder: 'Start typing…',
  },
  decorators: [withClinicSession],
  // Controlled (value/onChange) — local state so typing/selecting works.
  // The shared /api/suggestions handler returns the bucket for `field`.
  render: (args) => {
    const [value, setValue] = useState(args.value ?? '');
    React.useEffect(() => setValue(args.value ?? ''), [args.value]);
    return (
      <div style={{ width: 360 }}>
        <Autocomplete
          {...args}
          value={value}
          onChange={setValue}
          inputStyle={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: 8,
            border: '1px solid #d8d4cc',
            fontSize: 14,
          }}
        />
      </div>
    );
  },
} satisfies Meta<typeof Autocomplete>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Empty allergies field — focusing it would surface the top suggestions. */
export const Allergies: Story = {
  args: { field: 'allergies', placeholder: 'e.g. Penicillin' },
};

/** A typed value — the dropdown prefix-filters the diagnosis bucket. */
export const Diagnosis: Story = {
  args: { field: 'diagnosis', value: 'Ecz', placeholder: 'Diagnosis' },
};

/** Multiline mode renders a textarea instead of a single-line input. */
export const Multiline: Story = {
  args: { field: 'complaints', multiline: true, placeholder: 'Chief complaints…' },
};
