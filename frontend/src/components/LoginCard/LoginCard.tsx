import React, { useState } from "react";
import { Card } from "../../components/Card";
import { DomainInput } from "../../components/Input/DomainInput";
import { RoundedButton } from "../../components/Button/RoundedButton";
import { styles } from "./LoginCard.styles";
import { TextInput } from "../Input/TextInput";

export function LoginCard() {
  const [role, setRole] = useState<"admin" | "staff">("staff");
  const [domain, setDomain] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (role === "staff") {
      console.log("Staff login:", `${domain}.docodile.app`);
    } else {
      console.log("Admin login");
    }
  };

  return (
    <Card style={{...styles.card, padding: "4vw"}}>
      <h1 style={styles.title}>Login as {role === "admin" ? "Admin" : "Staff"}</h1>

      {/* Role selector */}
      <div style={styles.roleSelector}>
        <label style={styles.roleOption}>
          <input
            type="radio"
            checked={role === "staff"}
            onChange={() => setRole("staff")}
          />
          Staff
        </label>

        <label style={styles.roleOption}>
          <input
            type="radio"
            checked={role === "admin"}
            onChange={() => setRole("admin")}
          />
          Admin
        </label>
      </div>

      <div
        style={{
          ...styles.domainWrapper,
          ...(role === "admin" ? styles.domainHidden : {}),
        }}
      >
        <DomainInput value={domain} onChange={setDomain} />
      </div>

      <TextInput
        value={email}
        onChange={setEmail}
        placeholder="hello@example.com"
        icon="✉️"
      />

      <TextInput
        type="password"
        value={password}
        onChange={setPassword}
        placeholder="enter your password"
        icon="🔑"
      />

      <RoundedButton onClick={handleLogin}>
        Login
      </RoundedButton>
    </Card>
  );
}
