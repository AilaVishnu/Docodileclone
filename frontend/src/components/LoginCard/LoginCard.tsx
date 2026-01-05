import React, { useState } from "react";
import { styles } from "./LoginCard.styles";
import { TextInput } from "../Input/TextInput";
import { DomainInput } from "../Input/DomainInput";
import { Button } from "../Button";
import { Card } from "../Card";
import { ReactComponent as MailIcon } from "../../assets/Letter.svg";
import { ReactComponent as PasswordIcon } from "../../assets/Key.svg";
import { ReactComponent as EyeIcon } from "../../assets/Eye.svg";
import { ReactComponent as EyeClosedIcon } from "../../assets/Eye Closed.svg";


type LoginMode = "admin" | "staff";

type LoginCardProps = {
  mode: LoginMode;
};

export function LoginCard({ mode }: LoginCardProps) {
  const [domain, setDomain] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const isStaff = mode === "staff";

  return (
    <Card style={{ ...styles.card, width: "40vw"}}>
      <h4 style={styles.title}>
        Login as {isStaff ? "Staff" : "Admin"}
      </h4>

      {/* Domain (staff only) */}
      {isStaff && (
        <DomainInput
          value={domain}
          onChange={setDomain}
        />
      )}

      {/* Email */}
      <TextInput
        type="email"
        value={email}
        onChange={setEmail}
        placeholder="hello@example.com"
        iconLeft={<MailIcon />}
      />

      {/* Password */}
      <div style={styles.passwordRow}>
        <TextInput
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={setPassword}
          placeholder="Enter your password"
          iconLeft={<PasswordIcon />}
          iconRight={<button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            style={styles.eyeButton}
          >
            {showPassword ? <EyeClosedIcon /> : <EyeIcon />}
          </button>}
        />

        
      </div>

      {/* Sign in */}
      <Button
        variant={isStaff ? "primary" : "secondary"}
        size="md"
      >
        Sign in
      </Button>

      {/* Footer */}
      <div style={styles.footer}>
        <p style={styles.footerText}>
          New to docodile? <strong>Book Demo</strong>
        </p>

        <p style={styles.footerText}>
          <strong>Forgot Password</strong>
        </p>
      </div>
    </Card>
  );
}
