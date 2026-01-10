import React from "react";
import { LoginCard } from "../../components/LoginCard";
import { styles } from "./LoginPage.styles";
import AdminBg from "../../assets/admin-illo.svg";

export function AdminLoginPage() {
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
      <LoginCard mode="admin" />
    </div>
  );
}

