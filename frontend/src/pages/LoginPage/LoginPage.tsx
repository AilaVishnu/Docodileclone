import React, { useEffect } from "react";
import { LoginCard } from "../../components/LoginCard";
import { styles } from "./LoginPage.styles";
import { colors } from "../../styles/theme";
import StaffBg from "../../assets/staff-illo.svg";

type LoginPageProps = {
  onLoginSuccess?: () => void;
};

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  useEffect(() => {
    document.title = "Docodile | Login";
  }, []);

  return (
    <div
      style={{
        ...styles.page,
        backgroundColor: colors.primary300,
        backgroundImage: `url(${StaffBg})`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundSize: "100% auto",
      }}
    >
      <LoginCard onLoginSuccess={onLoginSuccess} />
    </div>
  );
}
