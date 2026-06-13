import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { AddStaffModal } from './AddStaffModal';
import type { StaffData } from './AddStaffModal';

const CLINIC_DEPARTMENTS = ['Dermatology', 'Pediatrics', 'General Medicine', 'Cardiology'];

const sampleStaff: StaffData = {
  name: 'Dr. Anita Rao',
  email: 'anita.rao@example.com',
  phone: '+91 98765 43210',
  gender: 'female',
  role: 'Doctor',
  department: 'Dermatology',
  specialty: 'Cosmetic Dermatology',
  registrationNo: 'AP-12345',
  qualification: 'MBBS, MD (Dermatology)',
  medicalCouncil: 'Andhra Pradesh Medical Council',
  experienceYears: '12',
};

const noop = () => {};

const meta = {
  title: 'Components/AddStaffModal',
  component: AddStaffModal,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The full add/edit staff modal. A Role selector drives which fields show — clinical roles (Doctor/Nurse) get a Department picker, and Doctor additionally gets specialty, qualification, council and registration fields. Departments are scoped to the clinic via `clinicDepartments`.',
      },
    },
  },
  argTypes: {
    clinicDepartments: { control: 'object' },
    isOpen: { control: 'boolean' },
    onSave: { control: false },
    onClose: { control: false },
    onDelete: { control: false },
    onShowToast: { control: false },
    initialData: { control: false },
  },
  args: {
    isOpen: true,
    clinicDepartments: CLINIC_DEPARTMENTS,
    onSave: noop,
    onClose: noop,
    onShowToast: noop,
  },
} satisfies Meta<typeof AddStaffModal>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Fresh "Add staff member" form — defaults to the Doctor role. */
export const AddNew: Story = {};

/** Editing an existing doctor — fields are pre-filled and a Remove Staff action appears. */
export const EditExisting: Story = {
  args: {
    initialData: sampleStaff,
    onDelete: noop,
  },
};

/** No departments configured yet — the Department picker prompts to add them in clinic info first. */
export const NoDepartments: Story = {
  args: { clinicDepartments: [] },
};
