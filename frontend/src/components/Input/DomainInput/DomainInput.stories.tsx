import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { http, HttpResponse } from 'msw';
import { DomainInput } from './DomainInput';
import { withClinicSession } from '../../../sb/decorators';

const meta = {
  title: 'Components/DomainInput',
  component: DomainInput,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Sub-domain picker for clinic onboarding and the staff/forgot-password login flows. As you type (≥2 chars) it debounces 500ms then hits `GET /api/tenant/domain/check?domain=…` and reads `data.available` to show a green "Available" or red "Already taken" line under the field. The `readOnly` look (used on a ClinicCard) goes transparent and skips the network check entirely.',
      },
    },
  },
  argTypes: {
    value: { control: 'text' },
    placeholder: { control: 'text' },
    suffix: { control: 'text' },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    onChange: { control: false },
    onKeyDown: { control: false },
  },
  args: {
    value: 'sunrise-skin',
    placeholder: 'your-clinic-domain',
    suffix: '.docodile.app',
  },
  decorators: [withClinicSession],
  // Controlled (value/onChange) — drive with local state so typing re-runs the
  // debounced availability check, while still honouring the `value` control.
  render: (args) => {
    const [value, setValue] = useState(args.value ?? '');
    React.useEffect(() => setValue(args.value ?? ''), [args.value]);
    return (
      <div style={{ width: 360 }}>
        <DomainInput {...args} value={value} onChange={setValue} />
      </div>
    );
  },
} satisfies Meta<typeof DomainInput>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default state — the shared handler reports the domain as free. */
export const Available: Story = {};

/** Override the check to return `available:false` so the "Already taken" error look shows. */
export const Taken: Story = {
  args: { value: 'taken-clinic' },
  parameters: {
    msw: {
      handlers: [
        http.get('http://localhost:8080/api/tenant/domain/check', () =>
          HttpResponse.json({ available: false }),
        ),
      ],
    },
  },
};

/** Display-only on a card — transparent background, no availability check fires. */
export const ReadOnly: Story = {
  args: { value: 'sunrise-skin', readOnly: true },
};

/** Disabled — muted and non-interactive, no network. */
export const Disabled: Story = {
  args: { value: 'sunrise-skin', disabled: true },
};
