import React from "react";
import { LoginCard } from "../../components/LoginCard";
import { styles } from "./LoginPage.styles";
import StaffBg from "../../assets/staff-illo.svg";

type StaffLoginPageProps = {
  onLoginSuccess?: () => void;
};

export function StaffLoginPage({ onLoginSuccess }: StaffLoginPageProps) {
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
      <LoginCard mode="staff" onLoginSuccess={onLoginSuccess} />
    </div>
  );
}
