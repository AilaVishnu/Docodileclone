import React from 'react';
import { AppointmentQueue } from '../../components/AppointmentQueue';
import { fonts } from '../../styles/theme';

export function AppointmentsView({ isBooking, bookingKey, onBack, onEditStart }: { isBooking?: boolean, bookingKey?: number, onBack?: () => void, onEditStart?: () => void }) {
  return (
    <AppointmentQueue isBooking={isBooking} bookingKey={bookingKey} onBack={onBack} onEditStart={onEditStart} />
  );
}

export function PrescriptionView() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h2 style={{ fontSize: fonts.size.l, fontWeight: 600 }}>Prescriptions</h2>
      <div style={{ padding: '40px', background: 'white', borderRadius: '12px', textAlign: 'center', border: '1px dashed #ccc' }}>
        Prescription history and new prescription entry will appear here.
      </div>
    </div>
  );
}

export function PatientFilesView() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h2 style={{ fontSize: fonts.size.l, fontWeight: 600 }}>Patient Files</h2>
      <div style={{ padding: '40px', background: 'white', borderRadius: '12px', textAlign: 'center', border: '1px dashed #ccc' }}>
        Patient electronic medical records and file management.
      </div>
    </div>
  );
}
// Add others as needed or just use a generic one
