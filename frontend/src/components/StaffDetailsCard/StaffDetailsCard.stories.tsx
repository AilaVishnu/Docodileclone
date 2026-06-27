import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { StaffDetailsCard } from './StaffDetailsCard';

type Gender = 'male' | 'female' | 'other' | '';

const meta = {
  title: 'Components/StaffDetailsCard',
  component: StaffDetailsCard,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The identity block inside the staff modal — name, email, phone and gender. Every field is controlled via a paired `set*` prop; pass an `errors` map to flag invalid fields. Phone input auto-formats to a +91 number on blur.',
      },
    },
  },
  argTypes: {
    name: { control: 'text' },
    email: { control: 'text' },
    phone: { control: 'text' },
    gender: { control: 'inline-radio', options: ['', 'male', 'female', 'other'] },
    errors: { control: false },
    setName: { control: false },
    setEmail: { control: false },
    setPhone: { control: false },
    setGender: { control: false },
  },
  args: {
    name: 'Dr. Anita Rao',
    email: 'anita.rao@example.com',
    phone: '+91 98765 43210',
    gender: 'female',
  },
  decorators: [
    (Story) => (
      <div style={{ width: 360 }}>
        <Story />
      </div>
    ),
  ],
  // Controlled card — drive the four paired fields with local state so typing
  // and the radio group work, while still honouring the initial arg values.
  render: (args) => {
    const [name, setName] = useState(args.name);
    const [email, setEmail] = useState(args.email);
    const [phone, setPhone] = useState(args.phone);
    const [gender, setGender] = useState<Gender>(args.gender);
    React.useEffect(() => setName(args.name), [args.name]);
    React.useEffect(() => setEmail(args.email), [args.email]);
    React.useEffect(() => setPhone(args.phone), [args.phone]);
    React.useEffect(() => setGender(args.gender), [args.gender]);
    return (
      <StaffDetailsCard
        {...args}
        name={name}
        setName={setName}
        email={email}
        setEmail={setEmail}
        phone={phone}
        setPhone={setPhone}
        gender={gender}
        setGender={setGender}
      />
    );
  },
} satisfies Meta<typeof StaffDetailsCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Filled: Story = {};

export const Empty: Story = {
  args: { name: '', email: '', phone: '', gender: '' },
};

/** With validation errors — every field is flagged. */
export const WithErrors: Story = {
  args: {
    name: '',
    email: 'not-an-email',
    phone: '',
    gender: '',
    errors: { name: true, email: true, phone: true, gender: true },
  },
};
