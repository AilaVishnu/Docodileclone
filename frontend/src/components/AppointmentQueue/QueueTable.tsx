import React, { useState, useRef, useEffect } from "react";
import { styles, getStatusStyle, getPayStyle } from "./AppointmentQueue.styles";

export type AppointmentStatus = 
  | "WAITING" 
  | "IN_PROGRESS" 
  | "COMPLETED" 
  | "NO_SHOW" 
  | "CANCELLED";

export type PayStatus = "PAID" | "DUE" | "NO PAY";

export type Appointment = {
  id: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  patientGender?: string;
  patientDob?: string;
  type: "New" | "Review";
  scheduledTime: string;
  rawScheduledTime?: string;
  isWalkin: boolean;
  status: AppointmentStatus;
  payStatus: PayStatus;
  doctorId?: string;
  notes?: string;
  fee?: number;
};

type MenuItem = {
  label: string;
  onClick: (appointment: Appointment) => void;
};

type QueueTableProps = {
  appointments: Appointment[];
  doctorName?: string;
  menuItems?: MenuItem[];
};

function ActionMenu({ appointment, menuItems, openUpward }: { appointment: Appointment; menuItems: MenuItem[]; openUpward?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button style={styles.actionButton} onClick={() => setIsOpen(!isOpen)}>
        <span style={{ fontSize: "18px", fontWeight: "bold" }}>...</span>
      </button>
      {isOpen && (
        <div style={{ ...styles.actionMenu, ...(openUpward ? { top: "auto", bottom: "100%" } : {}) }}>
          {menuItems.map((item, i) => (
            <div
              key={i}
              style={styles.actionMenuItem}
              onClick={() => { item.onClick(appointment); setIsOpen(false); }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#f5f5f5"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              {item.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function QueueTable({ appointments, doctorName, menuItems }: QueueTableProps) {
  return (
    <div style={styles.tableContainer}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>#</th>
            <th style={styles.th}>Name</th>
            <th style={styles.th}>Phone</th>
            <th style={styles.th}>Type</th>
            <th style={styles.th}>Time</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Pay</th>
            <th style={styles.th}></th>
          </tr>
        </thead>
        <tbody>
          {appointments.length === 0 ? (
            <tr>
              <td colSpan={8} style={{ ...styles.td, textAlign: "center", padding: "48px", color: "#666" }}>
                No Appointments for {doctorName || "this doctor"} today
              </td>
            </tr>
          ) : (
            appointments.map((apt, index) => (
              <tr key={apt.id} style={styles.tr}>
                <td style={styles.td}>{index + 1}</td>
                <td style={{ ...styles.td, fontWeight: 500 }}>{apt.patientName}</td>
                <td style={styles.td}>{apt.patientPhone}</td>
                <td style={styles.td}>{apt.type}</td>
                <td style={styles.td}>
                  <span style={styles.time}>{apt.scheduledTime}</span>
                  {apt.isWalkin && <span style={styles.walkinBadge}>Walk-in</span>}
                </td>
                <td style={styles.td}>
                  <span style={{ ...styles.statusBadge, ...getStatusStyle(apt.status) }}>
                    {apt.status.replace("_", " ")}
                  </span>
                </td>
                <td style={{ ...styles.td, ...getPayStyle(apt.payStatus), fontWeight: 600 }}>
                  {apt.payStatus}
                </td>
                <td style={styles.td}>
                  {menuItems && menuItems.length > 0 ? (
                    <ActionMenu appointment={apt} menuItems={menuItems} openUpward={index >= appointments.length - 2} />
                  ) : (
                    <button style={styles.actionButton}>
                      <span style={{ fontSize: "18px", fontWeight: "bold" }}>...</span>
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
