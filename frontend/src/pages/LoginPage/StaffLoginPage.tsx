import React from "react";
import { LoginCard } from "../../components/LoginCard";
import { styles } from "./LoginPage.styles";


export function StaffLoginPage() {
  return (
    <div style={styles.page}>
      <LoginCard mode={"staff"} />
    </div>
  );
}
