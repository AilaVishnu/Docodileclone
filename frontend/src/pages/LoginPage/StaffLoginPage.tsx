import React, { useEffect } from "react";
import { LoginCard } from "../../components/LoginCard";
import { styles } from "./LoginPage.styles";
import StaffBg from "../../assets/staff-illo.svg";

type StaffLoginPageProps = {
  onLoginSuccess?: () => void;
};

export function StaffLoginPage({ onLoginSuccess }: StaffLoginPageProps) {
  useEffect(() => {
    document.title = "Docodile | Login";
  }, []);

  return (
    <div
      style={{
        ...styles.page,
        // Fit the illustration to 100% width; crop vertically to the viewport.
        // backgroundColor matches the illustration's full-canvas backdrop
        // (#EDDFBA) so any vertical sliver on narrow-ratio monitors blends in.
        backgroundColor: "#EDDFBA",
        backgroundImage: `url(${StaffBg})`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundSize: "100% auto",
      }}
    >
      <LoginCard mode="staff" onLoginSuccess={onLoginSuccess} />
    </div>
  );
}
