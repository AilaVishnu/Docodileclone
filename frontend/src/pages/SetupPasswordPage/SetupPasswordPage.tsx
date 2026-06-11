import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { colors, fonts, radii, spacing } from "../../styles/theme";
import { API_BASE_URL } from "../../apiConfig";
import AdminBg from "../../assets/admin-illo.svg";
import StaffBg from "../../assets/staff-illo.svg";
import { ReactComponent as KeyIcon } from "../../assets/Key.svg";
import { ReactComponent as EyeIcon } from "../../assets/Eye.svg";
import { ReactComponent as EyeClosedIcon } from "../../assets/Eye Closed.svg";

type Phase = "loading" | "invalid" | "ready" | "success";

type Theme = {
  bg: string;
  bgImage: string;
  card: string;
  button: string;
  buttonText: string;
};

const adminTheme: Theme = {
  bg: colors.secondary700,
  bgImage: AdminBg,
  card: colors.secondary50,
  button: colors.secondary800,
  buttonText: "#ffffff",
};

const staffTheme: Theme = {
  bg: colors.primary300,
  bgImage: StaffBg,
  card: colors.primary100,
  button: colors.primary700,
  buttonText: "#ffffff",
};

export function SetupPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";

  const [phase, setPhase] = useState<Phase>("loading");
  const [theme, setTheme] = useState<Theme>(staffTheme);
  const [userName, setUserName] = useState("");
  const [invalidReason, setInvalidReason] = useState("");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setInvalidReason("No token provided.");
      setPhase("invalid");
      return;
    }

    fetch(`${API_BASE_URL}/auth/validate-token?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data.valid) {
          setInvalidReason("This link is invalid or has expired. Please ask your administrator to resend the invite.");
          setPhase("invalid");
          return;
        }
        setTheme(data.role === "ADMIN" ? adminTheme : staffTheme);
        setUserName(data.name ?? "");
        setPhase("ready");
      })
      .catch(() => {
        setInvalidReason("Could not validate the link. Please try again later.");
        setPhase("invalid");
      });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/setup-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirmPassword: confirm }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error ?? "Something went wrong. Please try again.");
      } else {
        setPhase("success");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const page: React.CSSProperties = {
    minHeight: "100vh",
    minWidth: "100vw",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.bg,
    backgroundImage: `url(${theme.bgImage})`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    backgroundSize: "cover",
    boxSizing: "border-box",
  };

  const card: React.CSSProperties = {
    backgroundColor: theme.card,
    borderRadius: radii.primary,
    padding: spacing["2xl"],
    width: 400,
    display: "flex",
    flexDirection: "column",
    gap: spacing.xl,
    boxShadow: "4px 4px 24px rgba(0,0,0,0.10)",
  };

  const fieldRow: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: spacing.xs,
    borderBottom: `1px solid ${colors.neutral300}`,
    padding: spacing.xs,
  };

  const input: React.CSSProperties = {
    flex: 1,
    border: "none",
    background: "transparent",
    outline: "none",
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.md,
    color: colors.neutral900,
  };

  const btn: React.CSSProperties = {
    backgroundColor: theme.button,
    color: theme.buttonText,
    border: "none",
    borderRadius: radii.pill,
    padding: `${spacing.xs} ${spacing.m}`,
    height: 40,
    width: "100%",
    fontFamily: fonts.family.primary,
    fontSize: fonts.control.md,
    cursor: submitting ? "not-allowed" : "pointer",
    opacity: submitting ? 0.7 : 1,
  };

  const eyeBtn: React.CSSProperties = {
    background: "none",
    border: "none",
    cursor: "pointer",
    opacity: 0.6,
    padding: 0,
    lineHeight: 1,
    display: "flex",
    alignItems: "center",
    flexShrink: 0,
  };

  if (phase === "loading") {
    return (
      <div style={page}>
        <div style={{ ...card, alignItems: "center" }}>
          <p style={{ fontFamily: fonts.family.primary, color: colors.neutral600, margin: 0 }}>
            Validating link…
          </p>
        </div>
      </div>
    );
  }

  if (phase === "invalid") {
    return (
      <div style={{ ...page, backgroundImage: `url(${staffTheme.bgImage})`, backgroundColor: staffTheme.bg }}>
        <div style={{ ...card, backgroundColor: staffTheme.card }}>
          <h2 style={{ fontFamily: fonts.family.secondary, fontSize: fonts.size.h4, color: colors.neutral900, margin: 0, fontWeight: 400 }}>
            Link Expired
          </h2>
          <p style={{ fontFamily: fonts.family.primary, fontSize: fonts.control.md, color: colors.neutral600, margin: 0, lineHeight: 1.6 }}>
            {invalidReason}
          </p>
        </div>
      </div>
    );
  }

  if (phase === "success") {
    return (
      <div style={page}>
        <div style={{ ...card, alignItems: "center", gap: spacing.m }}>
          <h2 style={{ fontFamily: fonts.family.secondary, fontSize: fonts.size.h4, color: colors.neutral900, margin: 0, fontWeight: 400 }}>
            Password Set!
          </h2>
          <p style={{ fontFamily: fonts.family.primary, fontSize: fonts.control.md, color: colors.neutral600, margin: 0, textAlign: "center" }}>
            {userName ? `Welcome, ${userName}.` : "Welcome."} Your account is now active.
          </p>
          <a
            href="/"
            style={{ ...btn, display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={page}>
      <div style={card}>
        <h2 style={{ fontFamily: fonts.family.secondary, fontSize: fonts.size.h4, color: colors.neutral900, margin: 0, fontWeight: 400 }}>
          New Password
        </h2>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: spacing.xs }}>
          {/* New password */}
          <div style={fieldRow}>
            <KeyIcon style={{ width: 24, height: 24, opacity: 0.5, flexShrink: 0 }} />
            <input
              style={input}
              type={showPassword ? "text" : "password"}
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
            <button type="button" style={eyeBtn} onClick={() => setShowPassword((v) => !v)}>
              {showPassword ? <EyeClosedIcon style={{ width: 24, height: 24 }} /> : <EyeIcon style={{ width: 24, height: 24 }} />}
            </button>
          </div>

          {/* Confirm password */}
          <div style={fieldRow}>
            <KeyIcon style={{ width: 24, height: 24, opacity: 0.5, flexShrink: 0 }} />
            <input
              style={input}
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              required
            />
            <button type="button" style={eyeBtn} onClick={() => setShowConfirm((v) => !v)}>
              {showConfirm ? <EyeClosedIcon style={{ width: 24, height: 24 }} /> : <EyeIcon style={{ width: 24, height: 24 }} />}
            </button>
          </div>

          {error && (
            <p style={{ fontFamily: fonts.family.primary, fontSize: fonts.control.sm, color: colors.red100, margin: 0 }}>
              {error}
            </p>
          )}

          <button type="submit" style={{ ...btn, marginTop: spacing.xs }} disabled={submitting}>
            {submitting ? "Updating…" : "Update"}
          </button>
        </form>
      </div>
    </div>
  );
}
