import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { AdditionalStaffDetailsCard } from './AdditionalStaffDetailsCard';

const CLINIC_DEPARTMENTS = ['Dermatology', 'Pediatrics', 'General Medicine', 'Cardiology'];

const meta = {
  title: 'Components/Staff/AdditionalStaffDetailsCard',
  component: AdditionalStaffDetailsCard,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Role-conditional clinical fields for the staff modal. Doctors get department, specialty (scoped to the chosen department), qualification, experience, medical council and registration number; other clinical roles (Nurse) get just a department picker. All fields are controlled via paired `set*` props.',
      },
    },
  },
  argTypes: {
    role: { control: 'inline-radio', options: ['Doctor', 'Nurse'] },
    department: { control: 'text' },
    specialty: { control: 'text' },
    registrationNo: { control: 'text' },
    qualification: { control: 'text' },
    medicalCouncil: { control: 'text' },
    experienceYears: { control: 'text' },
    clinicDepartments: { control: 'object' },
    errors: { control: false },
    setDepartment: { control: false },
    setSpecialty: { control: false },
    setRegistrationNo: { control: false },
    setQualification: { control: false },
    setMedicalCouncil: { control: false },
    setExperienceYears: { control: false },
  },
  args: {
    role: 'Doctor',
    department: 'Dermatology',
    specialty: 'Cosmetic Dermatology',
    registrationNo: 'AP-12345',
    qualification: 'MBBS, MD (Dermatology)',
    medicalCouncil: 'Andhra Pradesh Medical Council',
    experienceYears: '12',
    clinicDepartments: CLINIC_DEPARTMENTS,
  },
  decorators: [
    (Story) => (
      <div style={{ width: 560 }}>
        <Story />
      </div>
    ),
  ],
  // Controlled card — keep all the conditional fields in local state.
  render: (args) => {
    const [department, setDepartment] = useState(args.department);
    const [specialty, setSpecialty] = useState(args.specialty);
    const [registrationNo, setRegistrationNo] = useState(args.registrationNo);
    const [qualification, setQualification] = useState(args.qualification);
    const [medicalCouncil, setMedicalCouncil] = useState(args.medicalCouncil);
    const [experienceYears, setExperienceYears] = useState(args.experienceYears);
    React.useEffect(() => setDepartment(args.department), [args.department]);
    React.useEffect(() => setSpecialty(args.specialty), [args.specialty]);
    React.useEffect(() => setRegistrationNo(args.registrationNo), [args.registrationNo]);
    React.useEffect(() => setQualification(args.qualification), [args.qualification]);
    React.useEffect(() => setMedicalCouncil(args.medicalCouncil), [args.medicalCouncil]);
    React.useEffect(() => setExperienceYears(args.experienceYears), [args.experienceYears]);
    return (
      <AdditionalStaffDetailsCard
        {...args}
        department={department}
        setDepartment={setDepartment}
        specialty={specialty}
        setSpecialty={setSpecialty}
        registrationNo={registrationNo}
        setRegistrationNo={setRegistrationNo}
        qualification={qualification}
        setQualification={setQualification}
        medicalCouncil={medicalCouncil}
        setMedicalCouncil={setMedicalCouncil}
        experienceYears={experienceYears}
        setExperienceYears={setExperienceYears}
      />
    );
  },
} satisfies Meta<typeof AdditionalStaffDetailsCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A doctor — the full set of clinical fields. */
export const Doctor: Story = {};

/** A nurse — only the department picker shows. */
export const Nurse: Story = {
  args: { role: 'Nurse', specialty: '', registrationNo: '', qualification: '', medicalCouncil: '', experienceYears: '' },
};
