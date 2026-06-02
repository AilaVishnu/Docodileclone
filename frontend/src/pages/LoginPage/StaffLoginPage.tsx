import React, { useEffect } from "react";
import { LoginCard } from "../../components/LoginCard";
import { styles } from "./LoginPage.styles";
import StaffBg from "../../assets/staff-illo.svg";

type StaffLoginPageProps = {
  onLoginSuccess?: () => void;
  onSwitchToAdmin?: () => void;
};

export function StaffLoginPage({ onLoginSuccess, onSwitchToAdmin }: StaffLoginPageProps) {
  useEffect(() => {
    document.title = "Docodile | Login";
  }, []);

  return (
    <div
      style={{
        ...styles.page,
        backgroundImage: `url(${StaffBg})`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
      <LoginCard mode="staff" onLoginSuccess={onLoginSuccess} onSwitchMode={onSwitchToAdmin} />
    </div>
  );
}
