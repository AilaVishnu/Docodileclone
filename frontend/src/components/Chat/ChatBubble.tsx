import React, { useState, useCallback } from "react";
import { colors, fonts } from "../../styles/theme";
import { ChatPanel } from "./ChatPanel";
import { Icon } from "../Icon";

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
      {/*
        Keep ChatPanel mounted even when closed so its internal state
        (active conversation, scroll position, input draft, view mode)
        persists across open/close cycles. We just hide it visually.
        This also keeps useChat alive so unread counts keep flowing in.
      */}
      <div style={{ ...styles.panelWrapper, display: open ? "block" : "none" }}>
        <ChatPanel
          clinicId={clinicId}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
          onUnreadChange={handleUnreadChange}
          onClose={() => setOpen(false)}
          isOpen={open}
        />
      </div>
      <button
        style={styles.bubble}
        onClick={() => { setOpen(o => !o); if (!open) setUnread(0); }}
        title="Clinic Chat"
        aria-label="Open clinic chat"
      >
        <Icon name="chat-dots" size={22} tone="inverse" />
        {unread > 0 && !open && (
          <div style={styles.badge}>{unread > 99 ? "99+" : unread}</div>
        )}
      </button>
    </div>
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
  // Black floating bubble with white icon. Same elevation pattern as other
  // floating CTAs in the app.
  bubble: {
    width: 52,
    height: 52,
    borderRadius: "50%",
    backgroundColor: colors.neutral900,
    color: colors.neutral100,
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.18)",
    position: "relative",
    flexShrink: 0,
    transition: "background-color 0.15s, box-shadow 0.15s",
  },
  // Unread counter — same typography/size as the SessionTrayButton
  // notification badge in TopNav, tinted with the brand primary, and
  // positioned at the edge of the bubble circle (notch slightly outside).
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 20,
    height: 20,
    padding: "0 6px",
    borderRadius: 999,
    backgroundColor: colors.active.shade700,
    color: colors.neutral100,
    fontSize: fonts.size.xs,
    fontWeight: fonts.weight.semibold,
    lineHeight: "20px",
    textAlign: "center",
    fontFamily: fonts.family.primary,
    boxSizing: "border-box",
    border: `2px solid ${colors.neutral900}`,
  },
};
