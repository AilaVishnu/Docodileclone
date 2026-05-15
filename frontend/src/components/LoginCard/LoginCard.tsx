import React, { useState, useEffect } from "react";
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
import { API_BASE_URL } from "../../apiConfig";
import { Toast } from "../Toast";


type LoginMode = "admin" | "staff";

type LoginCardProps = {
  mode: LoginMode;
  onLoginSuccess?: () => void;
};

type LoginResponse = {
  token: string;
  role: string;
  clinicId?: string | null;
  clinicName?: string;
};

export function LoginCard({ mode, onLoginSuccess }: LoginCardProps) {
  const [domain, setDomain] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showPopup) {
      timer = setTimeout(() => {
        setShowPopup(false);
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [showPopup]);

  const showHelpPopup = () => {
    setShowPopup(true);
  };
  const isStaff = mode === "staff";
  const isDomainValid = !isStaff || domain.trim().length > 0;
  const canSubmit = email.trim().length > 0 && password.trim().length > 0 && isDomainValid;

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setToastMessage("Please enter email and password.");
      return;
    }

    if (isStaff && !domain.trim()) {
      setToastMessage("Please enter clinic domain.");
      return;
    }

    setIsSubmitting(true);

    try {
      const url = isStaff ? `${API_BASE_URL}/auth/staff/login` : `${API_BASE_URL}/auth/login`;
      const body = isStaff
        ? { domain: domain.trim(), email, password }
        : { email, password };

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error("Invalid email or password");
        }
        throw new Error(`Login failed (${response.status})`);
      }

      const data = (await response.json()) as LoginResponse;
      localStorage.setItem("docodile_token", data.token);
      localStorage.setItem("docodile_role", data.role);
      // Decode JWT payload to extract user_id and email for chat
      try {
        const payload = JSON.parse(atob(data.token.split(".")[1]));
        if (payload.user_id) localStorage.setItem("docodile_user_id", payload.user_id);
        if (payload.email) localStorage.setItem("docodile_user_email", payload.email);
      } catch { /* ignore decode errors */ }
      if (data.clinicId) {
        localStorage.setItem("docodile_clinic_id", data.clinicId);
      } else {
        localStorage.removeItem("docodile_clinic_id");
      }
      if (data.clinicName) {
        localStorage.setItem("docodile_clinic_name", data.clinicName);
      }

      setToastMessage("Login successful");
      onLoginSuccess?.();
    } catch (err) {
      const msg = err instanceof TypeError
        ? "Network error. Please check your connection."
        : err instanceof Error
          ? err.message
          : "Login failed. Please check your credentials.";
      setToastMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && canSubmit && !isSubmitting) {
      handleLogin();
    }
  };

  return (
    <Card style={{ ...styles.card, width: "40vw", backgroundColor: isStaff ? colors.active.shade100 : colors.secondary50 }}>
      <h4 style={styles.title}>
        Login as {isStaff ? "Staff" : "Admin"}
      </h4>

      {/* Domain (staff only) */}
      {isStaff && (
        <DomainInput
          value={domain}
          onChange={setDomain}
          onKeyDown={handleKeyDown}
        />
      )}

      {/* Email */}
      <TextInput
        type="email"
        value={email}
        onChange={setEmail}
        placeholder="hello@example.com"
        iconLeft={<MailIcon />}
        onKeyDown={handleKeyDown}
      />

      {/* Password */}
      <div style={styles.passwordRow}>
        <TextInput
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={setPassword}
          placeholder="Enter your password"
          iconLeft={<PasswordIcon />}
          onKeyDown={handleKeyDown}
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

      <Toast
        message={toastMessage}
        isVisible={!!toastMessage}
        onClose={() => setToastMessage("")}
      />

      {/* Footer */}
      <div style={styles.footer}>
        <p style={styles.footerText}>
          New to docodile?{" "}
          <strong
            style={{ cursor: "pointer" }}
            onClick={() => window.open("https://calendar.app.google/uQskDY6DM4F8q8Kd9", "_blank")}
          >
            Book Demo
          </strong>
        </p>

        <p style={styles.footerText} onClick={showHelpPopup}>
          <strong>Forgot Password</strong>
        </p>
      </div>

      {showPopup && (
        <div style={{
          ...styles.supportPopup,
          backgroundColor: isStaff ? colors.active.shade700 : colors.secondary700,
          color: colors.neutral100,
        }}>
          Contact Docodile Support Team
        </div>
      )}
    </Card>
  );
}
