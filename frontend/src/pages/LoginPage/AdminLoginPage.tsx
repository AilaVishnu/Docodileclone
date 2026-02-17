import React from "react";
import { LoginCard } from "../../components/LoginCard";
import { styles } from "./LoginPage.styles";
import AdminBg from "../../assets/admin-illo.svg";

type AdminLoginPageProps = {
  onLoginSuccess?: () => void;
};

export function AdminLoginPage({ onLoginSuccess }: AdminLoginPageProps) {
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
