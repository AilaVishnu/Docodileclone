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
import { colors } from "../../styles/theme";


type LoginMode = "admin" | "staff";

type LoginCardProps = {
  mode: LoginMode;
  onLoginSuccess?: () => void;
};

type LoginResponse = {
  token: string;
  role: string;
  clinicId: string;
};

export function LoginCard({ mode, onLoginSuccess }: LoginCardProps) {
  const [domain, setDomain] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isStaff = mode === "staff";
  const canSubmit = email.trim().length > 0 && password.trim().length > 0;

  const handleLogin = async () => {
    if (!canSubmit) {
      setError("Please enter email and password.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:8080/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Invalid credentials");
      }

      const data = (await response.json()) as LoginResponse;
      localStorage.setItem("docodile_token", data.token);
      localStorage.setItem("docodile_role", data.role);
      localStorage.setItem("docodile_clinic_id", data.clinicId);

      onLoginSuccess?.();
    } catch (err) {
      setError("Login failed. Please check your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card style={{ ...styles.card, width: "40vw", backgroundColor: isStaff ? colors.primary100 : colors.secondary50 }}>
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
        onClick={handleLogin}
        disabled={isSubmitting || !canSubmit}
      >
        {isSubmitting ? "Signing in..." : "Sign in"}
      </Button>

      {error && (
        <p style={{ marginTop: 12, color: colors.red200 }}>
          {error}
        </p>
      )}

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
