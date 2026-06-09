import React, { useEffect } from "react";
import { LoginCard } from "../../components/LoginCard";
import { styles } from "./LoginPage.styles";
import AdminBg from "../../assets/admin-illo.svg";

type AdminLoginPageProps = {
  onLoginSuccess?: () => void;
  onSwitchToStaff?: () => void;
};

export function AdminLoginPage({ onLoginSuccess, onSwitchToStaff }: AdminLoginPageProps) {
  useEffect(() => {
    document.title = "Docodile | Login";
  }, []);

  return (
    <div
      style={{
        ...styles.page,
        // Fit the illustration to 100% width; crop vertically to the viewport.
        // backgroundColor matches the illustration's full-canvas backdrop
        // (#556536) so any vertical sliver on narrow-ratio monitors blends in.
        backgroundColor: "#556536",
        backgroundImage: `url(${AdminBg})`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundSize: "100% auto",
      }}
    >
      <LoginCard mode="admin" onLoginSuccess={onLoginSuccess} onSwitchMode={onSwitchToStaff} />
    </div>
  );
}
