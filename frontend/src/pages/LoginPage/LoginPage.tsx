import React, { useEffect } from "react";
import { LoginCard } from "../../components/LoginCard";
import { styles } from "./LoginPage.styles";
import AdminBg from "../../assets/admin-illo.svg";

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
        backgroundColor: "#556536",
        backgroundImage: `url(${AdminBg})`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundSize: "100% auto",
      }}
    >
      <LoginCard onLoginSuccess={onLoginSuccess} />
    </div>
  );
}
