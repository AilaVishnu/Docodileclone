import React, { useState } from "react";
import { Card } from "../../components/Card";
import { DomainInput } from "../../components/Input/DomainInput";
import { RoundedButton } from "../../components/Button/RoundedButton";
import { styles } from "./LoginCard.styles";

export function LoginCard() {
  const [domain, setDomain] = useState("");

  const handleLogin = () => {
    const fullDomain = `${domain}.docodile.app`;
    console.log("Logging in with:", fullDomain);
  };

  return (
    <Card>
      <div style={styles.header}>
        <h1 style={styles.title}>Login as Staff</h1>
      </div>

      <DomainInput
        value={domain}
        onChange={setDomain}
      />

      <RoundedButton
        onClick={handleLogin}
        disabled={!domain}
      >
        Login
      </RoundedButton>

      <div style={styles.footer}>
        <h3 style={styles.footertext}>New to docodile? <b>Book a demo</b></h3>
      </div>
    </Card>
  );
}
