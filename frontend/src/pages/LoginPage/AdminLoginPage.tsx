import React, { useEffect } from "react";
import { LoginCard } from "../../components/LoginCard";
import { styles } from "./LoginPage.styles";
import AdminBg from "../../assets/admin-illo.svg";

type AdminLoginPageProps = {
  onLoginSuccess?: () => void;
};

export function AdminLoginPage({ onLoginSuccess }: AdminLoginPageProps) {
  useEffect(() => {
    document.title = "Docodile | Login";
  }, []);

  return (
    <div
      style={{
        ...styles.page,
        backgroundImage: `url(${AdminBg})`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
      <LoginCard mode="admin" onLoginSuccess={onLoginSuccess} />
    </div>
  );
}
