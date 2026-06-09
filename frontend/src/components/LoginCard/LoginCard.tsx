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
import { colors, fonts } from "../../styles/theme";
import { API_BASE_URL } from "../../apiConfig";
import { Toast } from "../Toast";


type LoginMode = "admin" | "staff";
type View = "login" | "forgot";

type LoginCardProps = {
  mode: LoginMode;
  onLoginSuccess?: () => void;
  onSwitchMode?: () => void;
};

type LoginResponse = {
  token: string;
  role: string;
  clinicId?: string | null;
  clinicName?: string;
  gender?: string | null;
};

export function LoginCard({ mode, onLoginSuccess, onSwitchMode }: LoginCardProps) {
  const [domain, setDomain] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const [view, setView] = useState<View>("login");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotDomain, setForgotDomain] = useState("");
  const [forgotSubmitting, setForgotSubmitting] = useState(false);

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
      if (data.gender) localStorage.setItem("docodile_gender", data.gender.toLowerCase());
      else localStorage.removeItem("docodile_gender");
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

  const handleForgotPassword = async () => {
    const emailVal = forgotEmail.trim();
    if (!emailVal) {
      setToastMessage("Enter a valid email address");
      return;
    }

    if (isStaff && !forgotDomain.trim()) {
      setToastMessage("Enter clinic domain");
      return;
    }

    setForgotSubmitting(true);
    try {
      const body: Record<string, string> = { email: emailVal };
      if (isStaff) body.domain = forgotDomain.trim();

      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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
      setForgotDomain("");
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
      <Card style={{ ...styles.card, width: "40vw", backgroundColor: isStaff ? colors.active.shade100 : colors.secondary50 }}>
        <h4 style={styles.title}>Reset Password</h4>

        {isStaff && (
          <DomainInput
            value={forgotDomain}
            onChange={setForgotDomain}
            onKeyDown={handleForgotKeyDown}
          />
        )}

        <TextInput
          type="email"
          value={forgotEmail}
          onChange={setForgotEmail}
          placeholder="hello@example.com"
          iconLeft={<MailIcon />}
          onKeyDown={handleForgotKeyDown}
        />

        <Button
          variant={isStaff ? "primary" : "secondary"}
          size="md"
          onClick={handleForgotPassword}
          disabled={forgotSubmitting}
        >
          {forgotSubmitting ? "Sending..." : "Send Reset Link"}
        </Button>

        <div style={{ display: "flex", justifyContent: "center", marginTop: -8 }}>
          <span
            onClick={() => { setView("login"); setForgotEmail(""); setForgotDomain(""); }}
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
              e.currentTarget.style.color = isStaff ? colors.secondary800 : colors.active.shade700;
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
          isVisible={!!toastMessage}
          onClose={() => setToastMessage("")}
        />
      </Card>
    );
  }

  return (
    <Card style={{ ...styles.card, width: "var(--login-card-w)", backgroundColor: isStaff ? colors.active.shade100 : colors.secondary50 }}>
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

      {onSwitchMode && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: -8 }}>
          <span
            onClick={onSwitchMode}
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
              e.currentTarget.style.color = isStaff ? colors.secondary800 : colors.active.shade700;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = colors.neutral700;
            }}
          >
            {isStaff ? "Login as Admin" : "Login as Staff"}
          </span>
        </div>
      )}

      <Toast
        message={toastMessage}
        isVisible={!!toastMessage}
        onClose={() => setToastMessage("")}
      />

      {/* Footer */}
      <div style={styles.footer}>
        {/* "New to docodile? Book Demo" is for the public admin sign-up
            funnel, not staff — clinic staff are seeded by their admin, so
            hide the CTA on the staff login. */}
        {!isStaff && (
          <p style={styles.footerText}>
            New to docodile?{" "}
            <strong
              style={{ cursor: "pointer" }}
              onClick={() => window.open("https://calendar.app.google/uQskDY6DM4F8q8Kd9", "_blank")}
            >
              Book Demo
            </strong>
          </p>
        )}

        {/* On the staff login, Book Demo above is hidden — the flex
            space-between would otherwise pull this to the left, so push
            it back to the right. Admin login keeps the natural layout. */}
        <p
          style={{
            ...styles.footerText,
            cursor: "pointer",
            ...(isStaff ? { marginLeft: "auto" } : null),
          }}
          onClick={() => setView("forgot")}
        >
          <strong>Forgot Password</strong>
        </p>
      </div>
    </Card>
  );
}