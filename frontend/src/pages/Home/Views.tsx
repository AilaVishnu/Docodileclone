import React from 'react';
import { AppointmentQueue } from '../../components/AppointmentQueue';
import { PrescriptionPage } from '../PrescriptionPage';
import { PatientFilesPage } from '../PatientFilesPage';
import type { NavTab } from '../../components/SideNav';

export function AppointmentsView({ isBooking, bookingKey, onBack, onEditStart }: { isBooking?: boolean, bookingKey?: number, onBack?: () => void, onEditStart?: () => void }) {
  return (
    <AppointmentQueue isBooking={isBooking} bookingKey={bookingKey} onBack={onBack} onEditStart={onEditStart} />
  );
}

export function PrescriptionView() {
  return <PrescriptionPage />;
}

export function PatientFilesView({ onNavigate }: { onNavigate?: (tab: NavTab) => void }) {
  return <PatientFilesPage onNavigate={onNavigate} />;
}
// Add others as needed or just use a generic one
