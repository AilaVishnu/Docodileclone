import React, { useState, useCallback } from "react";
import { colors, fonts, radii } from "../../styles/theme";
import { ChatPanel } from "./ChatPanel";

type Props = {
  clinicId: string;
  currentUserId: string;
  currentUserName: string;
};

export function ChatBubble({ clinicId, currentUserId, currentUserName }: Props) {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  const handleUnreadChange = useCallback((total: number) => {
    setUnread(open ? 0 : total);
  }, [open]);

  if (!clinicId || !currentUserId) return null;

  return (
    <div style={styles.root}>
      {open && (
        <div style={styles.panelWrapper}>
          <ChatPanel
            clinicId={clinicId}
            currentUserId={currentUserId}
            currentUserName={currentUserName}
            onUnreadChange={handleUnreadChange}
          />
        </div>
      )}
      <button
        style={styles.bubble}
        onClick={() => { setOpen(o => !o); if (!open) setUnread(0); }}
        title="Clinic Chat"
      >
        <ChatIcon />
        {unread > 0 && !open && (
          <div style={styles.badge}>{unread > 99 ? "99+" : unread}</div>
        )}
      </button>
    </div>
  );
}

function ChatIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    position: "fixed",
    bottom: 24,
    right: 24,
    zIndex: 9000,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 12,
  },
  panelWrapper: {
    animation: "fadeUp 0.18s ease",
  },
  bubble: {
    width: 52,
    height: 52,
    borderRadius: "50%",
    backgroundColor: colors.primary600,
    color: colors.neutral100,
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
    position: "relative",
    flexShrink: 0,
    transition: "transform 0.15s ease, box-shadow 0.15s ease",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#e53935",
    color: "#fff",
    fontSize: 11,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 4px",
    fontFamily: fonts.family.primary,
    border: `2px solid ${colors.neutral100}`,
  },
};
