import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import {
  HomeIcon,
  AppointmentsIcon,
  PrescriptionIcon,
  PatientFilesIcon,
  ServicesIcon,
  BillingIcon,
  BusinessIcon,
  PharmacyIcon,
  MessageIcon,
  MessageUnreadIcon,
  BellIcon,
  BellActiveIcon,
  BackIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserHandsIcon,
  LetterIcon,
  PhoneIcon,
  CalendarIcon,
  HashtagIcon,
  ClockIcon,
  PlusIcon,
  StethoscopeIcon,
  PulseIcon,
} from '../../iconsUtil';
import { ChevronDown } from '../../components/icons/ChevronDown';
import { Page, Group, Grid } from './_kit';

const meta = {
  title: 'Foundations/Icons',
  parameters: { layout: 'fullscreen', options: { showPanel: false } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const ICONS: { name: string; el: React.ReactNode }[] = [
  { name: 'HomeIcon', el: <HomeIcon /> },
  { name: 'AppointmentsIcon', el: <AppointmentsIcon /> },
  { name: 'PrescriptionIcon', el: <PrescriptionIcon /> },
  { name: 'PatientFilesIcon', el: <PatientFilesIcon /> },
  { name: 'ServicesIcon', el: <ServicesIcon /> },
  { name: 'BillingIcon', el: <BillingIcon /> },
  { name: 'BusinessIcon', el: <BusinessIcon /> },
  { name: 'PharmacyIcon', el: <PharmacyIcon /> },
  { name: 'MessageIcon', el: <MessageIcon /> },
  { name: 'MessageUnreadIcon', el: <MessageUnreadIcon /> },
  { name: 'BellIcon', el: <BellIcon /> },
  { name: 'BellActiveIcon', el: <BellActiveIcon /> },
  { name: 'BackIcon', el: <BackIcon /> },
  { name: 'ChevronLeftIcon', el: <ChevronLeftIcon /> },
  { name: 'ChevronRightIcon', el: <ChevronRightIcon /> },
  { name: 'ChevronDown', el: <ChevronDown size={24} /> },
  { name: 'UserHandsIcon', el: <UserHandsIcon /> },
  { name: 'LetterIcon', el: <LetterIcon /> },
  { name: 'PhoneIcon', el: <PhoneIcon /> },
  { name: 'CalendarIcon', el: <CalendarIcon /> },
  { name: 'HashtagIcon', el: <HashtagIcon /> },
  { name: 'ClockIcon', el: <ClockIcon /> },
  { name: 'PlusIcon', el: <PlusIcon /> },
  { name: 'StethoscopeIcon', el: <StethoscopeIcon /> },
  { name: 'PulseIcon', el: <PulseIcon /> },
];

export const Library: Story = {
  render: () => (
    <Page
      title="Icons"
      intro="The icon set exported from iconsUtil.tsx (plus the canonical ChevronDown). These are the named icon components used across the app — import them from '../../iconsUtil'."
    >
      <Group label={`${ICONS.length} icons`}>
        <Grid min={130}>
          {ICONS.map(({ name, el }) => (
            <div
              key={name}
              style={{
                border: '1px solid #E3E3E3',
                borderRadius: 10,
                background: '#fff',
                padding: '18px 10px 10px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div
                style={{
                  height: 28,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#202020',
                }}
              >
                {el}
              </div>
              <div style={{ fontSize: 11, color: '#585858', textAlign: 'center', wordBreak: 'break-word' }}>
                {name}
              </div>
            </div>
          ))}
        </Grid>
      </Group>
    </Page>
  ),
};
