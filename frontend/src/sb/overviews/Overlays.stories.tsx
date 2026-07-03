import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { Page, Group } from '../foundations/_kit';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { ModalHeader } from '../../components/ModalHeader';
import { UploadModal } from '../../components/UploadModal';
import { AddStaffModal } from '../../components/AddStaffModal';
import { BillModal } from '../../components/BillCard/BillModal';
import { BillMedicinesModal } from '../../components/AppointmentQueue/BillMedicinesModal';
import { PrintPreviewModal } from '../../components/PrintPreviewModal';
import { SchedulePresetsModal } from '../../components/DoctorSchedule/SchedulePresetsModal';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { AddServiceModal } from '../../pages/Services/AddServiceModal';
import { EditPatientModal } from '../../pages/PrescriptionPage/EditPatientModal';
import { NewPrescriptionModal } from '../../pages/PrescriptionPage/NewPrescriptionModal';
import type { ScheduleState } from '../../components/DoctorSchedule/scheduleStorage';
import { mockPatients } from '../mockData';
import { withClinicSession, withLocalStorage } from '../decorators';

// Consolidation view: modals portal to <body>, so we DON'T render them all at
// once. Instead a row of triggers opens one overlay at a time. Each overlay is
// opened with the same props its own colocated story uses. Reuses the real
// components.

const noop = () => {};

const SEED_SCHEDULE: ScheduleState = {
  default: {
    mon: { off: false, sessions: [{ start: '17:00', end: '20:00' }] },
    tue: { off: false, sessions: [{ start: '17:00', end: '20:00' }] },
    wed: { off: false, sessions: [{ start: '17:00', end: '20:00' }] },
    thu: { off: false, sessions: [{ start: '17:00', end: '20:00' }] },
    fri: { off: false, sessions: [{ start: '17:00', end: '20:00' }] },
    sat: { off: false, sessions: [{ start: '17:00', end: '20:00' }] },
    sun: { off: true, sessions: [] },
  },
  overrides: {},
  configured: true,
};

const CLINIC_DEPARTMENTS = ['Dermatology', 'Pediatrics', 'General Medicine', 'Cardiology'];

const SAMPLE_MEDICINES = [
  { id: 'm1', name: 'Amoxicillin 500mg', dosage: '1 tab · 1-0-1 · 5 days', unitPrice: 18, qty: 10, inStock: true },
  { id: 'm2', name: 'Cetirizine 10mg', dosage: '1 tab · 0-0-1 · 7 days', unitPrice: 8, qty: 7, inStock: true },
  { id: 'm3', name: 'Calamine Lotion', dosage: 'Apply twice daily', unitPrice: 60, qty: 1, inStock: true },
  { id: 'm4', name: 'Tacrolimus Ointment', dosage: 'Apply at night · 14 days', unitPrice: 0, qty: 1, inStock: false },
];

const PRINT_HTML = `
<!doctype html>
<html>
  <head>
    <style>
      body { font-family: -apple-system, system-ui, sans-serif; color: #222; padding: 32px; }
      h1 { font-size: 20px; margin: 0 0 4px; }
      .muted { color: #777; font-size: 13px; }
      hr { border: none; border-top: 1px solid #ddd; margin: 16px 0; }
      .rx { font-size: 15px; line-height: 1.6; }
    </style>
  </head>
  <body>
    <h1>Sunrise Skin Clinic</h1>
    <div class="muted">12, MG Road, Bengaluru · +91 98765 43210</div>
    <hr />
    <div class="muted">Patient: Ramesh Babu · M 40 · 13 Jun 2026</div>
    <h2>Prescription</h2>
    <div class="rx">
      1. Cetirizine 10mg — once daily, 5 days<br />
      2. Calamine lotion — apply twice daily<br />
      3. Avoid direct sun exposure
    </div>
  </body>
</html>
`;

const ModalContent = ({ onClose }: { onClose: () => void }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
    <ModalHeader
      title="Add a doctor"
      subtitle="Fill in the doctor’s details to add them to your clinic."
      onClose={onClose}
    />
    <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
      <Button variant="light" size="sm" onClick={onClose}>Cancel</Button>
      <Button variant="dark" size="sm" onClick={onClose}>Save</Button>
    </div>
  </div>
);

type Which =
  | null
  | 'modal'
  | 'confirm'
  | 'upload'
  | 'addStaff'
  | 'addService'
  | 'editPatient'
  | 'newRx'
  | 'bill'
  | 'billMeds'
  | 'print'
  | 'presets';

const meta = {
  title: 'Overview/Overlays',
  parameters: { layout: 'fullscreen', options: { showPanel: false } },
  // Several overlays read clinic session + schedule from localStorage.
  decorators: [
    withLocalStorage({ docodile_schedule: JSON.stringify(SEED_SCHEDULE) }),
    withClinicSession,
  ],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = {
  render: () => {
    const [open, setOpen] = useState<Which>(null);
    const close = () => setOpen(null);

    return (
      <Page
        title="Overlays"
        intro="Modals portal to <body>, so opening them all at once would stack. Click a trigger to open one overlay at a time — each is opened with the same props its own story uses. Esc or the backdrop closes it."
      >
        <Group label="Open an overlay">
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Button variant="dark" onClick={() => setOpen('modal')}>
              Modal (basic)
            </Button>
            <Button variant="dark" onClick={() => setOpen('confirm')}>
              ConfirmDialog
            </Button>
            <Button variant="dark" onClick={() => setOpen('upload')}>
              UploadModal
            </Button>
            <Button variant="dark" onClick={() => setOpen('addStaff')}>
              AddStaffModal
            </Button>
            <Button variant="dark" onClick={() => setOpen('addService')}>
              AddServiceModal
            </Button>
            <Button variant="dark" onClick={() => setOpen('editPatient')}>
              EditPatientModal
            </Button>
            <Button variant="dark" onClick={() => setOpen('newRx')}>
              NewPrescriptionModal
            </Button>
            <Button variant="dark" onClick={() => setOpen('bill')}>
              BillModal
            </Button>
            <Button variant="dark" onClick={() => setOpen('billMeds')}>
              BillMedicinesModal
            </Button>
            <Button variant="dark" onClick={() => setOpen('print')}>
              PrintPreviewModal
            </Button>
            <Button variant="dark" onClick={() => setOpen('presets')}>
              SchedulePresetsModal
            </Button>
          </div>
        </Group>

        <Modal isOpen={open === 'modal'} onClose={close}>
          <ModalContent onClose={close} />
        </Modal>

        {open === 'confirm' && (
          <ConfirmDialog
            isOpen
            title="Cancel this appointment?"
            message="The slot will be freed and the patient will need to rebook."
            confirmLabel="Yes, cancel"
            cancelLabel="Nope"
            destructive
            onConfirm={close}
            onCancel={close}
          />
        )}

        {open === 'upload' && (
          <UploadModal
            isOpen
            onClose={close}
            onFiles={noop}
            onConfirm={close}
            title="Upload files"
            confirmLabel="Upload"
          />
        )}

        {open === 'addStaff' && (
          <AddStaffModal
            isOpen
            clinicDepartments={CLINIC_DEPARTMENTS}
            onSave={close}
            onClose={close}
            onShowToast={noop}
          />
        )}

        {open === 'addService' && (
          <AddServiceModal isOpen onClose={close} onSave={close} />
        )}

        {open === 'editPatient' && (
          <EditPatientModal
            isOpen
            patient={mockPatients[0]}
            onClose={close}
            onSave={noop}
            onSaved={close}
          />
        )}

        {open === 'newRx' && (
          <NewPrescriptionModal
            isOpen
            onClose={close}
            onSelectPatient={close}
            onAddPatient={close}
          />
        )}

        {open === 'bill' && <BillModal isOpen onClose={close} />}

        {open === 'billMeds' && (
          <BillMedicinesModal
            isOpen
            onClose={close}
            patientName="Ramesh Babu"
            medicines={SAMPLE_MEDICINES}
          />
        )}

        {open === 'print' && (
          <PrintPreviewModal
            isOpen
            html={PRINT_HTML}
            onClose={close}
            onSave={noop}
            onPrint={noop}
            onShare={noop}
            onConfigureTemplate={noop}
          />
        )}

        {open === 'presets' && (
          <SchedulePresetsModal onPick={close} onCustom={close} onDismiss={close} />
        )}
      </Page>
    );
  },
};
