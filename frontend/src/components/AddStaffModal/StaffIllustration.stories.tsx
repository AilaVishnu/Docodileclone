import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { StaffIllustration } from './StaffIllustration';

const ROLES = ['Doctor', 'Nurse', 'Pharmacy', 'Front Desk', 'Lab'] as const;

const meta = {
  title: 'Components/Staff/StaffIllustration',
  component: StaffIllustration,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Pure SVG avatar for a staff member, picked by `role` + `gender`. The container background matches the colour baked into each illustration, and `crop` reframes the figure — `full` (whole figure), `bust` (head + shoulders), or `face` (circular avatars).',
      },
    },
  },
  argTypes: {
    role: {
      control: 'select',
      options: ROLES,
      description: 'Which illustration set to draw. Unknown roles fall back to Front Desk.',
    },
    gender: {
      control: 'inline-radio',
      options: ['male', 'female', 'other', ''],
      description: 'Picks the male/female variant; anything but "male" renders female.',
    },
    crop: {
      control: 'inline-radio',
      options: ['full', 'bust', 'face'],
      table: { defaultValue: { summary: 'full' } },
    },
    width: { control: 'text' },
    height: { control: 'text' },
    borderRadius: { control: 'text' },
  },
  args: {
    role: 'Doctor',
    gender: 'female',
    width: 180,
    height: 220,
    borderRadius: 8,
    crop: 'full',
  },
} satisfies Meta<typeof StaffIllustration>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Doctor: Story = {};

export const Nurse: Story = { args: { role: 'Nurse', gender: 'male' } };

export const Bust: Story = {
  args: { role: 'Front Desk', crop: 'bust', height: 160 },
};

export const FaceAvatar: Story = {
  args: { role: 'Pharmacy', gender: 'male', crop: 'face', width: 96, height: 96, borderRadius: '50%' },
};

/** Every role × gender at a glance. */
export const AllRoles: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
      {ROLES.map((role) =>
        (['female', 'male'] as const).map((gender) => (
          <div key={`${role}-${gender}`} style={{ textAlign: 'center' }}>
            <StaffIllustration role={role} gender={gender} width={120} height={150} />
            <div style={{ fontSize: 12, marginTop: 4 }}>
              {role} · {gender}
            </div>
          </div>
        )),
      )}
    </div>
  ),
};
