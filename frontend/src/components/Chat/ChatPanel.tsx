import React, { useEffect, useRef, useState } from "react";
import { colors, fonts, radii, spacing } from "../../styles/theme";
import { ChatMessage, StaffMember, useChat } from "../../hooks/useChat";

type Props = {
  clinicId: string;
  currentUserId: string;
  currentUserName: string;
  onUnreadChange: (total: number) => void;
};

type Conversation = { type: "group" } | { type: "dm"; partnerId: string; partnerName: string };

export function ChatPanel({ clinicId, currentUserId, currentUserName, onUnreadChange }: Props) {
  const { messages, staff, unread, connected, sendGroup, sendDirect, loadDmHistory, markSeen, dmKey } =
    useChat(clinicId, currentUserId);
  const [active, setActive] = useState<Conversation>({ type: "group" });
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // Notify parent of total unread
  useEffect(() => {
    const total = Object.values(unread).reduce((s, n) => s + n, 0);
    onUnreadChange(total);
  }, [unread, onUnreadChange]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark seen when switching conversation
  useEffect(() => {
    const key = active.type === "group" ? "group" : dmKey(currentUserId, active.partnerId);
    markSeen(key);
    if (active.type === "dm") loadDmHistory(active.partnerId);
  }, [active]);

  const activeMessages: ChatMessage[] =
    active.type === "group"
      ? messages.group
      : messages.dms[active.type === "dm" ? active.partnerId : ""] ?? [];

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    if (active.type === "group") sendGroup(text);
    else sendDirect(active.partnerId, text);
    setInput("");
  };

  const unreadForConv = (key: string) => unread[key] ?? 0;
  const groupUnread = unreadForConv("group");

  return (
    <div style={styles.panel}>
      {/* Left: conversation list */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarTitle}>Clinic Chat</div>
        <ConvItem
          label="# Clinic"
          active={active.type === "group"}
          unread={groupUnread}
          onClick={() => setActive({ type: "group" })}
        />
        <div style={styles.divider} />
        <div style={styles.sidebarSection}>Direct</div>
        {staff.map(s => {
          const key = dmKey(currentUserId, s.id);
          return (
            <ConvItem
              key={s.id}
              label={s.name}
              subtitle={formatRole(s.role)}
              active={active.type === "dm" && active.partnerId === s.id}
              unread={unreadForConv(key)}
              onClick={() => setActive({ type: "dm", partnerId: s.id, partnerName: s.name })}
            />
          );
        })}
      </div>

      {/* Right: thread */}
      <div style={styles.thread}>
        <div style={styles.threadHeader}>
          <span style={styles.threadTitle}>
            {active.type === "group" ? "# Clinic" : active.partnerName}
          </span>
          <span style={{ ...styles.dot, backgroundColor: connected ? "#4caf50" : colors.neutral400 }} />
        </div>

        <div style={styles.messages}>
          {activeMessages.length === 0 && (
            <div style={styles.empty}>No messages yet. Say hello!</div>
          )}
          {activeMessages.map((msg, i) => {
            const isMe = msg.senderId === currentUserId;
            const showName = !isMe && (i === 0 || activeMessages[i - 1].senderId !== msg.senderId);
            return (
              <div key={msg.id} style={{ ...styles.msgRow, justifyContent: isMe ? "flex-end" : "flex-start" }}>
                <div style={{ maxWidth: "72%" }}>
                  {showName && (
                    <div style={styles.msgSender}>{msg.senderName} · {formatRole(msg.senderRole ?? "")}</div>
                  )}
                  <div style={{ ...styles.bubble, ...(isMe ? styles.bubbleMe : styles.bubbleThem) }}>
                    {msg.content}
                  </div>
                  <div style={{ ...styles.msgTime, textAlign: isMe ? "right" : "left" }}>
                    {formatTime(msg.createdAt)}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <div style={styles.inputRow}>
          <input
            style={styles.input}
            placeholder="Type a message…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          />
          <button style={styles.sendBtn} onClick={handleSend} disabled={!input.trim()}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

function ConvItem({ label, subtitle, active, unread, onClick }: {
  label: string; subtitle?: string; active: boolean; unread: number; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        ...styles.convItem,
        backgroundColor: active ? colors.primary100 : "transparent",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ ...styles.convLabel, fontWeight: active ? 600 : 400 }}>{label}</div>
        {subtitle && <div style={styles.convSub}>{subtitle}</div>}
      </div>
      {unread > 0 && <div style={styles.badge}>{unread > 99 ? "99+" : unread}</div>}
    </button>
  );
}

function formatRole(role: string) {
  return role.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch { return ""; }
}

const styles: Record<string, React.CSSProperties> = {
  panel: {
    display: "flex",
    width: 480,
    height: 420,
    backgroundColor: colors.neutral100,
    borderRadius: radii.m,
    boxShadow: "0 8px 32px rgba(0,0,0,0.16)",
    overflow: "hidden",
    border: `1px solid ${colors.neutral200}`,
  },
  sidebar: {
    width: 148,
    borderRight: `1px solid ${colors.neutral200}`,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  sidebarTitle: {
    padding: `${spacing.xs} ${spacing.s}`,
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.s,
    fontWeight: 700,
    color: colors.neutral900,
    borderBottom: `1px solid ${colors.neutral200}`,
  },
  sidebarSection: {
    padding: `${spacing["2xs"]} ${spacing.s}`,
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.xs,
    color: colors.neutral500,
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
  },
  divider: { height: 1, backgroundColor: colors.neutral200, margin: `${spacing["2xs"]} 0` },
  convItem: {
    display: "flex",
    alignItems: "center",
    gap: spacing["2xs"],
    padding: `6px ${spacing.s}`,
    border: "none",
    cursor: "pointer",
    textAlign: "left" as const,
    transition: "background-color 0.1s",
    fontFamily: fonts.family.primary,
    width: "100%",
    borderRadius: 0,
  },
  convLabel: { fontSize: fonts.size.s, color: colors.neutral900, whiteSpace: "nowrap" as const, overflow: "hidden", textOverflow: "ellipsis" },
  convSub: { fontSize: fonts.size.xs, color: colors.neutral500, whiteSpace: "nowrap" as const, overflow: "hidden", textOverflow: "ellipsis" },
  badge: {
    minWidth: 18, height: 18, borderRadius: 9,
    backgroundColor: colors.primary600,
    color: colors.neutral100,
    fontSize: 10, fontWeight: 700,
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "0 4px", flexShrink: 0,
    fontFamily: fonts.family.primary,
  },
  thread: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
  threadHeader: {
    padding: `${spacing.xs} ${spacing.s}`,
    borderBottom: `1px solid ${colors.neutral200}`,
    display: "flex", alignItems: "center", justifyContent: "space-between",
  },
  threadTitle: { fontFamily: fonts.family.primary, fontSize: fonts.size.s, fontWeight: 600, color: colors.neutral900 },
  dot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  messages: { flex: 1, overflowY: "auto" as const, padding: spacing.xs, display: "flex", flexDirection: "column", gap: 4, scrollbarWidth: "none" as const },
  empty: { margin: "auto", color: colors.neutral400, fontFamily: fonts.family.primary, fontSize: fonts.size.s, textAlign: "center" as const },
  msgRow: { display: "flex" },
  msgSender: { fontFamily: fonts.family.primary, fontSize: fonts.size.xs, color: colors.neutral500, marginBottom: 2 },
  bubble: { padding: `6px ${spacing.xs}`, borderRadius: radii.m, fontFamily: fonts.family.primary, fontSize: fonts.size.s, lineHeight: 1.4, wordBreak: "break-word" as const },
  bubbleMe: { backgroundColor: colors.primary500, color: colors.neutral100 },
  bubbleThem: { backgroundColor: colors.neutral150, color: colors.neutral900 },
  msgTime: { fontFamily: fonts.family.primary, fontSize: 10, color: colors.neutral400, marginTop: 2 },
  inputRow: {
    display: "flex", gap: spacing["2xs"], padding: spacing.xs,
    borderTop: `1px solid ${colors.neutral200}`,
  },
  input: {
    flex: 1, padding: `6px ${spacing.xs}`, borderRadius: radii.m,
    border: `1px solid ${colors.neutral200}`, fontFamily: fonts.family.primary,
    fontSize: fonts.size.s, outline: "none", backgroundColor: colors.neutral150,
  },
  sendBtn: {
    padding: `6px ${spacing.s}`, borderRadius: radii.m, border: "none",
    backgroundColor: colors.primary600, color: colors.neutral100,
    fontFamily: fonts.family.primary, fontSize: fonts.size.s, fontWeight: 600,
    cursor: "pointer",
  },
};
