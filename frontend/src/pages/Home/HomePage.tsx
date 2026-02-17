import React from "react";

export function HomePage() {
  const clinicName = localStorage.getItem("docodile_clinic_name") || "your clinic";

  return (
    <div style={{ padding: 40 }}>
      <h2>Welcome to {clinicName}</h2>
    </div>
  );
}
