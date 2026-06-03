import React from 'react';
import { AppointmentQueue } from '../../components/AppointmentQueue';
import { PrescriptionPage } from '../PrescriptionPage';
import { PatientFilesPage } from '../PatientFilesPage';
import type { NavTab } from '../../components/SideNav';
import type { Patient } from '../../hooks/usePatients';

export function AppointmentsView({ isBooking, bookingKey, onBack, onEditStart, onViewPatientFile }: { isBooking?: boolean, bookingKey?: number, onBack?: () => void, onEditStart?: () => void, onViewPatientFile?: (patient: Patient, appointmentId: string, doctorId: string) => void }) {
  return (
    <AppointmentQueue isBooking={isBooking} bookingKey={bookingKey} onBack={onBack} onEditStart={onEditStart} onViewPatientFile={onViewPatientFile} />
  );
}

export function PrescriptionView({ onNavigate, queueRefreshKey }: { onNavigate?: (tab: NavTab) => void; queueRefreshKey?: number }) {
  return <PrescriptionPage onNavigate={onNavigate} queueRefreshKey={queueRefreshKey} />;
}

export function PatientFilesView({ onNavigate, initialSelectedId }: { onNavigate?: (tab: NavTab) => void; initialSelectedId?: string | null }) {
  return <PatientFilesPage onNavigate={onNavigate} initialSelectedId={initialSelectedId} />;
}
// Add others as needed or just use a generic one
