import React from "react";
import { LoginCard } from "../../components/LoginCard";
import { styles } from "./LoginPage.styles";
import { colors } from "../../styles/theme";


export function AdminLoginPage() {
  return (
    <div style={{...styles.page, backgroundColor: colors.secondary600}}>
      <LoginCard mode={"admin"} />
    </div>
  );
}
