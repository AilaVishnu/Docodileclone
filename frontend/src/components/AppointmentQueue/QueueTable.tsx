import React from "react";
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
  type: "New" | "Review";
  scheduledTime: string;
  isWalkin: boolean;
  status: AppointmentStatus;
  payStatus: PayStatus;
};

type QueueTableProps = {
  appointments: Appointment[];
  doctorName?: string;
};

export function QueueTable({ appointments, doctorName }: QueueTableProps) {
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
                  <button style={styles.actionButton}>
                    <span style={{ fontSize: "18px", fontWeight: "bold" }}>...</span>
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
