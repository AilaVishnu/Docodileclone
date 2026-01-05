import React from "react";
import { LoginCard } from "../../components/LoginCard";
import { styles } from "./LoginPage.styles";


export function AdminLoginPage() {
  return (
    <div style={styles.page}>
      <LoginCard mode={"admin"} />
    </div>
  );
}
