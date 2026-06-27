import React, { useState } from "react";
import { styles } from "./LoginCard.styles";
import { Field } from "../Field";
import { Button } from "../Button";
import { Card } from "../Card";
import { Icon } from "../Icon";
import { colors, fonts } from "../../styles/theme";
import { API_BASE_URL } from "../../apiConfig";
import { Toast } from "../Toast";
import { resolveToastIcon } from "../Toast/toastIcon";


type View = "login" | "forgot";

type LoginCardProps = {
  onLoginSuccess?: () => void;
};

type LoginResponse = {
  token: string;
  role: string;
  gender?: string;
  mfaPending?: boolean;
};

export function LoginCard({ onLoginSuccess }: LoginCardProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const [view, setView] = useState<View>("login");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSubmitting, setForgotSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setToastMessage("Please enter email and password.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
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
      if (data.gender) localStorage.setItem("docodile_gender", data.gender.toLowerCase());
      else localStorage.removeItem("docodile_gender");
      try {
        const payload = JSON.parse(atob(data.token.split(".")[1]));
        if (payload.user_id) localStorage.setItem("docodile_user_id", payload.user_id);
        if (payload.email) localStorage.setItem("docodile_user_email", payload.email);
      } catch { /* ignore decode errors */ }

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
    if (e.key === "Enter" && !isSubmitting) {
      handleLogin();
    }
  };

  const handleForgotPassword = async () => {
    const emailVal = forgotEmail.trim();
    if (!emailVal) {
      setToastMessage("Enter a valid email address");
      return;
    }

    setForgotSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailVal }),
      });

      if (response.status === 404) {
        setToastMessage("Email ID does not exist");
        return;
      }

      if (!response.ok) {
        setToastMessage("Something went wrong. Please try again.");
        return;
      }

      setToastMessage(`Password reset email sent to ${emailVal}`);
      setForgotEmail("");
      setView("login");
    } catch {
      setToastMessage("Network error. Please try again.");
    } finally {
      setForgotSubmitting(false);
    }
  };

  const handleForgotKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !forgotSubmitting) {
      handleForgotPassword();
    }
  };

  if (view === "forgot") {
    return (
      <Card style={{ ...styles.card, width: "40vw", backgroundColor: colors.secondary50 }}>
        <h4 style={styles.title}>Reset Password</h4>

        <Field
          variant="underline"
          type="email"
          value={forgotEmail}
          onChange={setForgotEmail}
          placeholder="hello@example.com"
          iconLeft={<Icon name="mail" tone="inherit" />}
          onKeyDown={handleForgotKeyDown}
        />

        <Button
          variant="secondary"
          size="md"
          onClick={handleForgotPassword}
          disabled={forgotSubmitting}
        >
          {forgotSubmitting ? "Sending..." : "Send Reset Link"}
        </Button>

        <div style={{ display: "flex", justifyContent: "center", marginTop: -8 }}>
          <span
            onClick={() => { setView("login"); setForgotEmail(""); }}
            style={{
              fontFamily: fonts.family.primary,
              fontSize: fonts.size.s,
              fontWeight: fonts.weight.medium,
              color: colors.neutral700,
              cursor: "pointer",
              textDecoration: "underline",
              textUnderlineOffset: "3px",
              transition: "color 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = colors.active.shade700;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = colors.neutral700;
            }}
          >
            Back to Login
          </span>
        </div>

        <Toast
          message={toastMessage}
          {...resolveToastIcon(toastMessage)}
          isVisible={!!toastMessage}
          onClose={() => setToastMessage("")}
        />
      </Card>
    );
  }

  return (
    <Card style={{ ...styles.card, width: "var(--login-card-w)", backgroundColor: colors.secondary50 }}>
      <h4 style={styles.title}>
        Login
      </h4>

      {/* Email */}
      <Field
        variant="underline"
        type="email"
        value={email}
        onChange={setEmail}
        placeholder="hello@example.com"
        iconLeft={<Icon name="mail" tone="inherit" />}
        onKeyDown={handleKeyDown}
      />

      {/* Password */}
      <div style={styles.passwordRow}>
        <Field
          variant="underline"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={setPassword}
          placeholder="Enter your password"
          iconLeft={<Icon name="key" tone="inherit" />}
          onKeyDown={handleKeyDown}
          iconRight={<button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            style={styles.eyeButton}
          >
            {showPassword ? <Icon name="eye-closed" tone="inherit" /> : <Icon name="eye" tone="inherit" />}
          </button>}
        />
      </div>

      {/* Sign in */}
      <Button
        variant="secondary"
        size="md"
        onClick={handleLogin}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Signing in..." : "Sign in"}
      </Button>

      <Toast
        message={toastMessage}
        {...resolveToastIcon(toastMessage)}
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

        <p
          style={{
            ...styles.footerText,
            cursor: "pointer",
          }}
          onClick={() => setView("forgot")}
        >
          <strong>Forgot Password</strong>
        </p>
      </div>
    </Card>
  );
}
