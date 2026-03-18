import React, { useEffect, useState, useCallback } from "react";
import { styles } from "./AppointmentsPage.styles";
import { colors } from "../../styles/theme";
import { Button } from "../../components/Button";
import { WalkInModal } from "../../components/WalkInModal";
import { 
  getTodayQueue, 
  updateAppointmentStatus,
  AppointmentDto, 
  QueueSummary,
  AppointmentStatus 
} from "../../services/appointmentService";

export function AppointmentsPage() {
  const [appointments, setAppointments] = useState<AppointmentDto[]>([]);
  const [summary, setSummary] = useState<QueueSummary>({
    waiting: 0,
    inConsultation: 0,
    done: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showWalkInModal, setShowWalkInModal] = useState(false);

  useEffect(() => {
    document.title = "Docodile | Appointments";
  }, []);

  const fetchQueue = useCallback(async () => {
    try {
      const data = await getTodayQueue();
      setAppointments(data.appointments);
      setSummary(data.summary);
    } catch (error) {
      console.error("Failed to fetch queue:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueue();
    // Refresh queue every 30 seconds
    const interval = setInterval(fetchQueue, 30000);
    return () => clearInterval(interval);
  }, [fetchQueue]);

  const handleStatusChange = async (appointmentId: string, newStatus: AppointmentStatus) => {
    try {
      await updateAppointmentStatus(appointmentId, newStatus);
      fetchQueue();
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleWalkInSuccess = () => {
    setShowWalkInModal(false);
    fetchQueue();
  };

  const formatDate = () => {
    return new Date().toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusStyle = (status: AppointmentStatus): React.CSSProperties => {
    switch (status) {
      case "WAITING":
        return { ...styles.statusBadge, ...styles.statusWaiting };
      case "IN_CONSULTATION":
        return { ...styles.statusBadge, ...styles.statusInConsultation };
      case "DONE":
        return { ...styles.statusBadge, ...styles.statusDone };
      default:
        return styles.statusBadge;
    }
  };

  const getNextStatus = (current: AppointmentStatus): AppointmentStatus | null => {
    switch (current) {
      case "WAITING":
        return "IN_CONSULTATION";
      case "IN_CONSULTATION":
        return "DONE";
      default:
        return null;
    }
  };

  const getStatusLabel = (status: AppointmentStatus): string => {
    switch (status) {
      case "WAITING":
        return "Waiting";
      case "IN_CONSULTATION":
        return "In Consultation";
      case "DONE":
        return "Done";
      case "CANCELLED":
        return "Cancelled";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Today's Queue</h1>
        <div style={styles.dateNav}>
          <span style={styles.dateText}>{formatDate()}</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={styles.summaryRow}>
        <div style={{ ...styles.summaryCard, borderLeft: `4px solid ${colors.yellow200}` }}>
          <p style={{ ...styles.summaryCount, color: colors.yellow200 }}>{summary.waiting}</p>
          <p style={styles.summaryLabel}>Waiting</p>
        </div>
        <div style={{ ...styles.summaryCard, borderLeft: `4px solid ${colors.green200}` }}>
          <p style={{ ...styles.summaryCount, color: colors.green200 }}>{summary.inConsultation}</p>
          <p style={styles.summaryLabel}>In Consultation</p>
        </div>
        <div style={{ ...styles.summaryCard, borderLeft: `4px solid ${colors.neutral500}` }}>
          <p style={{ ...styles.summaryCount, color: colors.neutral500 }}>{summary.done}</p>
          <p style={styles.summaryLabel}>Done</p>
        </div>
        <div style={{ ...styles.summaryCard, borderLeft: `4px solid ${colors.secondary500}` }}>
          <p style={{ ...styles.summaryCount, color: colors.secondary500 }}>{summary.total}</p>
          <p style={styles.summaryLabel}>Total</p>
        </div>
      </div>

      {/* Queue List */}
      <div style={styles.queueContainer}>
        {appointments.length === 0 ? (
          <div style={styles.emptyState}>
            <span style={styles.emptyIcon}>📋</span>
            <p style={styles.emptyText}>No appointments yet today.</p>
            <p style={{ ...styles.emptyText, marginTop: 8 }}>
              Click "Walk-in" to add the first patient.
            </p>
          </div>
        ) : (
          appointments.map((appt) => (
            <div key={appt.id} style={styles.queueRow}>
              {/* Token Number */}
              <div style={styles.tokenNumber}>{appt.tokenNumber}</div>

              {/* Patient Info */}
              <div style={styles.patientInfo}>
                <p style={styles.patientName}>{appt.patient.name}</p>
                <p style={styles.patientMeta}>
                  {appt.patient.phone} 
                  {appt.patient.age && ` • ${appt.patient.age}y`}
                  {appt.patient.gender && ` • ${appt.patient.gender}`}
                </p>
              </div>

              {/* Type Badge */}
              <span style={styles.typeBadge}>{appt.type}</span>

              {/* Status Badge */}
              <span style={getStatusStyle(appt.status)}>
                {getStatusLabel(appt.status)}
              </span>

              {/* Fee */}
              <span style={styles.fee as React.CSSProperties}>
                {appt.fee ? `₹${appt.fee}` : "—"}
              </span>

              {/* Action Button */}
              {getNextStatus(appt.status) && (
                <Button
                  variant="secondaryLight"
                  size="sm"
                  onClick={() => handleStatusChange(appt.id, getNextStatus(appt.status)!)}
                >
                  {appt.status === "WAITING" ? "Call In" : "Mark Done"}
                </Button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Walk-in FAB */}
      <div style={styles.walkInButton}>
        <Button 
          variant="primary" 
          size="md"
          onClick={() => setShowWalkInModal(true)}
        >
          + Walk-in
        </Button>
      </div>

      {/* Walk-in Modal */}
      {showWalkInModal && (
        <WalkInModal
          onClose={() => setShowWalkInModal(false)}
          onSuccess={handleWalkInSuccess}
        />
      )}
    </div>
  );
}
