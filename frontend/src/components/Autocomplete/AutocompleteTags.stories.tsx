import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { AutocompleteTags } from './AutocompleteTags';
import { withClinicSession } from '../../sb/decorators';

const meta = {
  title: 'Components/Input/AutocompleteTags',
  component: AutocompleteTags,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Multi-tag variant of Autocomplete. Backed by the same `GET /api/suggestions?field=&q=` bucket via `useSuggestions`, but each selection (or Enter / "," on free text) becomes a removable chip. Backspace at an empty input pops the last chip. `value` is a `string[]`; the host owns (de)serializing to the column format. Used by the four patient History fields.',
      },
    },
  },
  argTypes: {
    field: {
      control: 'select',
      options: ['allergies', 'familyHistory', 'diagnosis', 'complaints'],
      description: 'Suggestion bucket name on the server.',
    },
    placeholder: { control: 'text' },
    ariaLabel: { control: 'text' },
    value: { control: false },
    onChange: { control: false },
    containerStyle: { control: false },
  },
  args: {
    field: 'allergies',
    placeholder: 'Add an allergy…',
  },
  decorators: [withClinicSession],
  // Controlled with string[] state — seed a couple of chips so the chip layout
  // is visible at a glance. The shared /api/suggestions handler feeds the menu.
  render: (args) => {
    const [tags, setTags] = useState<string[]>(['Penicillin', 'Dust']);
    return (
      <div style={{ width: 360 }}>
        <AutocompleteTags {...args} value={tags} onChange={setTags} />
      </div>
    );
  },
} satisfies Meta<typeof AutocompleteTags>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Allergies with two seeded chips. */
export const Allergies: Story = {
  args: { field: 'allergies', placeholder: 'Add an allergy…' },
};

/** A different bucket — family history conditions as chips. */
export const FamilyHistory: Story = {
  args: { field: 'familyHistory', placeholder: 'Add a condition…' },
  render: (args) => {
    const [tags, setTags] = useState<string[]>(['Diabetes']);
    return (
      <div style={{ width: 360 }}>
        <AutocompleteTags {...args} value={tags} onChange={setTags} />
      </div>
    );
  },
};

/** Empty — placeholder shows until the first chip is added. */
export const Empty: Story = {
  args: { field: 'complaints', placeholder: 'Add a complaint…' },
  render: (args) => {
    const [tags, setTags] = useState<string[]>([]);
    return (
      <div style={{ width: 360 }}>
        <AutocompleteTags {...args} value={tags} onChange={setTags} />
      </div>
    );
  },
};
