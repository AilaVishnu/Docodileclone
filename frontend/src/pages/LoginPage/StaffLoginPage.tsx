import React from "react";
import { LoginCard } from "../../components/LoginCard";
import { styles } from "./LoginPage.styles";
import { colors } from "../../styles/theme";


export function StaffLoginPage() {
  return (
    <div style={{...styles.page, backgroundColor: colors.primary300}}>
      <LoginCard mode={"staff"}/>
    </div>
  );
}
