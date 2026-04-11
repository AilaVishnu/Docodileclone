import React, { useEffect, useState } from "react";
import { Tabs, TabItem } from "../Tabs";
import { QueueTable, Appointment } from "./QueueTable";
import { styles } from "./AppointmentQueue.styles";
import { DatePicker } from "./DatePicker";
import { colors } from "../../styles/theme";
import { BookAppointment } from "./BookAppointment";
import { API_BASE_URL } from "../../apiConfig";

type Doctor = {
  id: string;
  name: string;
};

type AppointmentQueueProps = {
  isBooking?: boolean;
  onBack?: () => void;
};

export function AppointmentQueue({ isBooking, onBack }: AppointmentQueueProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [activeDoctorId, setActiveDoctorId] = useState<string>("");
  const [appointments, setAppointments] = useState<Record<string, Appointment[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const token = localStorage.getItem("docodile_token");
      const clinicId = localStorage.getItem("docodile_clinic_id");

      if (!token || !clinicId) {
        setIsLoading(false);
        return;
      }

      try {
        // 1. Fetch Staff (to filter doctors)
        if (doctors.length === 0) {
          const staffRes = await fetch(`${API_BASE_URL}/api/tenant/clinics/${clinicId}/staff`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (staffRes.ok) {
            const staffData = await staffRes.json();
            const doctorList = staffData
              .filter((s: any) => s.role === "DOCTOR")
              .map((s: any) => ({ id: s.id, name: s.name }));
            
            setDoctors(doctorList);
            if (doctorList.length > 0) {
              setActiveDoctorId(doctorList[0].id);
            }
          }
        }

        // 2. Fetch appointments for selected date
        const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
        const aptRes = await fetch(`${API_BASE_URL}/api/tenant/appointments?date=${dateStr}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (aptRes.ok) {
          const aptData = await aptRes.json();
          const grouped: Record<string, Appointment[]> = {};

          aptData.forEach((apt: any) => {
            if (!grouped[apt.doctorId]) {
              grouped[apt.doctorId] = [];
            }
            grouped[apt.doctorId].push({
              id: apt.id,
              patientName: apt.patientName,
              patientPhone: apt.patientPhone,
              type: apt.type === "REVIEW" ? "Review" : "New",
              scheduledTime: apt.scheduledTime ? new Date(apt.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Walk-in",
              isWalkin: apt.isWalkin,
              status: apt.status || "WAITING",
              payStatus: apt.payStatus || "DUE",
            });
          });

          setAppointments(grouped);
        }
      } catch (error) {
        console.error("Failed to fetch queue data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedDate]);

  const tabItems: TabItem[] = doctors.map(d => ({
    id: d.id,
    label: d.name
  }));

  const activeQueue = activeDoctorId ? appointments[activeDoctorId] || [] : [];

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const dateText = isToday(selectedDate) ? "Today's" : formatDate(selectedDate);

  if (isLoading && doctors.length === 0) {
    return <div style={{ padding: "40px", textAlign: "center" }}>Loading Queue...</div>;
  }

  return (
    <div style={styles.container}>
      <header style={{ ...styles.header, marginBottom: "24px", position: "relative" }}>
        <div style={{ flex: 1 }} />
        <h2 style={{ ...styles.title, position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
          <span 
            onClick={() => setShowDatePicker(!showDatePicker)}
            style={{ 
              textDecoration: "underline", 
              cursor: "pointer",
              color: colors.active.shade700
            }}
          >
            {dateText}
          </span> Queue
        </h2>

        <div style={{ display: "flex", gap: "12px" }}>
          {/* Internal booking trigger removed in favor of TopNav trigger */}
        </div>

        {showDatePicker && (
          <DatePicker 
            selectedDate={selectedDate} 
            onSelect={(date) => {
              setSelectedDate(date);
              setShowDatePicker(false);
            }} 
            onClose={() => setShowDatePicker(false)}
          />
        )}
      </header>

      {isBooking && (
        <BookAppointment 
          doctors={doctors} 
          initialDoctorId={activeDoctorId}
          onBack={onBack || (() => {})}
        />
      )}

      {doctors.length > 0 ? (
        <>
          <Tabs 
            items={tabItems} 
            activeId={activeDoctorId} 
            onSelect={setActiveDoctorId} 
          />
          <QueueTable 
            appointments={activeQueue} 
            doctorName={doctors.find(d => d.id === activeDoctorId)?.name}
          />
        </>
      ) : (
        <div style={{ padding: "48px", textAlign: "center", backgroundColor: "white", borderRadius: "24px" }}>
          No doctors found for this clinic. Please add staff in Clinic Setup.
        </div>
      )}
    </div>
  );
}
