import React, { useEffect, useMemo, useRef, useState } from "react";
import { colors, fonts, radii, spacing, strokes } from "../../styles/theme";
import { ChatMessage, useChat } from "../../hooks/useChat";
import { IconButton } from "../IconButton";
import { chatWithAssistant, AIChatTurn } from "../../api/ai";

type Props = {
  clinicId: string;
  currentUserId: string;
  currentUserName: string;
  onUnreadChange: (total: number) => void;
  onClose: () => void;
};

type Conversation = { type: "group" } | { type: "dm"; partnerId: string; partnerName: string } | { type: "ai" };

export function ChatPanel({ clinicId, currentUserId, currentUserName, onUnreadChange, onClose }: Props) {
  const { messages, staff: realStaff, unread, connected, sendGroup, sendDirect, loadDmHistory, markSeen, dmKey } =
    useChat(clinicId, currentUserId);
  // DEMO: fall back to mock staff when the API returns none, so the DM
  // experience is visible. Remove before shipping.
  const staff = realStaff.length > 0 ? realStaff : DEMO_STAFF;
  // DEMO: mock presence — real implementation should derive this from the
  // useChat hook (a server-side "who's online" list).
  const onlineIds = useMemo(() => new Set(["demo-anika", "demo-vikram", "demo-sneha"]), []);
  const [active, setActive] = useState<Conversation>({ type: "dm", partnerId: "demo-anika", partnerName: "Dr. Anika Reddy" });
  // Slack-mobile single-pane navigation: list view (conversation picker)
  // or thread view (one conversation open at a time).
  const [viewMode, setViewMode] = useState<"list" | "thread">("list");
  const [input, setInput] = useState("");
  // AI assistant lives in this panel as another "conversation". Its messages
  // are kept in local state (not persisted server-side) and routed through
  // the /api/ai/chat tool-using endpoint when the user sends.
  const [aiMessages, setAiMessages] = useState<AIChatTurn[]>([]);
  const [aiThinking, setAiThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Voice recording state.
  const [recording, setRecording] = useState(false);
  const [recordingMs, setRecordingMs] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingTimerRef = useRef<number | null>(null);
  const recordingChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      recordingChunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) recordingChunksRef.current.push(e.data); };
      mr.start();
      mediaRecorderRef.current = mr;
      setRecording(true);
      setRecordingMs(0);
      const startedAt = Date.now();
      recordingTimerRef.current = window.setInterval(() => {
        setRecordingMs(Date.now() - startedAt);
      }, 100);
    } catch (e) {
      console.warn("Could not start recording", e);
    }
  };

  const stopRecording = (mode: "send" | "cancel") => {
    const mr = mediaRecorderRef.current;
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (mr) {
      mr.onstop = () => {
        mr.stream.getTracks().forEach(t => t.stop());
        if (mode === "send") {
          const blob = new Blob(recordingChunksRef.current, { type: "audio/webm" });
          // TODO: upload blob to backend and send as a voice-note attachment.
          // For the v1 UI, just send a placeholder message.
          const seconds = Math.max(1, Math.round(recordingMs / 1000));
          const placeholder = `🎤 Voice note · ${seconds}s`;
          if (active.type === "group") sendGroup(placeholder);
          else if (active.type === "dm") sendDirect(active.partnerId, placeholder);
          // Voice notes intentionally not supported in the AI thread.
        }
      };
      mr.stop();
    }
    mediaRecorderRef.current = null;
    setRecording(false);
    setRecordingMs(0);
  };

  const handleAttachClick = () => fileInputRef.current?.click();
  const handleFileChosen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // TODO: upload file to backend and send as an attachment message.
    const placeholder = `📎 ${file.name} · ${formatFileSize(file.size)}`;
    if (active.type === "group") sendGroup(placeholder);
    else if (active.type === "dm") sendDirect(active.partnerId, placeholder);
    // Attachments not supported in the AI thread.
    e.target.value = "";
  };

  useEffect(() => {
    const total = Object.values(unread).reduce((s, n) => s + n, 0);
    onUnreadChange(total);
  }, [unread, onUnreadChange]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (active.type === "ai") {
      // AI thread has no server-side history to load or seen-state to mark.
      inputRef.current?.focus();
      return;
    }
    const key = active.type === "group" ? "group" : dmKey(currentUserId, active.partnerId);
    markSeen(key);
    if (active.type === "dm") loadDmHistory(active.partnerId);
    inputRef.current?.focus();
  }, [active]);

  const realMessages: ChatMessage[] =
    active.type === "group"
      ? messages.group
      : messages.dms[active.type === "dm" ? active.partnerId : ""] ?? [];
  // DEMO: when there are no real messages, show sample messages so the
  // design is visible at a glance. Remove this fallback before shipping.
  const activeMessages: ChatMessage[] = realMessages.length > 0 ? realMessages : DEMO_MESSAGES(currentUserId, active);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    if (active.type === "ai") {
      // Append user message immediately, fire backend, append assistant when done.
      const next: AIChatTurn[] = [...aiMessages, { role: "user", content: text }];
      setAiMessages(next);
      setInput("");
      setAiThinking(true);
      chatWithAssistant(next)
        .then((reply) => {
          setAiMessages((cur) => [...cur, { role: "assistant", content: reply || "(no response)" }]);
        })
        .catch((e) => {
          setAiMessages((cur) => [...cur, { role: "assistant", content: `Error: ${(e as Error).message}` }]);
        })
        .finally(() => setAiThinking(false));
      return;
    }
    if (active.type === "group") sendGroup(text);
    else sendDirect(active.partnerId, text);
    setInput("");
  };

  const unreadForConv = (key: string) => unread[key] ?? 0;
  const groupUnread = unreadForConv("group");

  // Group active messages by day for the date separators.
  const groupedMessages = useMemo(() => groupByDay(activeMessages), [activeMessages]);

  // Compute last message + timestamp for the group conversation.
  const groupLast = messages.group[messages.group.length - 1];

  return (
    <div style={styles.panel}>
      <IconButton
        ariaLabel="Close"
        onClick={onClose}
        size={28}
        style={{ position: "absolute", top: spacing.s, right: spacing.s, zIndex: 2 }}
      />

      {/* Conversation list — shown in list view, hidden once a thread is opened. */}
      {viewMode === "list" && (
      <div style={styles.sidebar}>
        <div style={styles.listHeader}>Chats</div>
        <ConvItem
          label="✨ AI Assistant"
          subtitle="Ask about patients, queue, reviews…"
          active={active.type === "ai"}
          unread={0}
          isGroup
          onClick={() => { setActive({ type: "ai" }); setViewMode("thread"); }}
        />
        <ConvItem
          label="# Clinic"
          subtitle={groupLast ? previewText(groupLast, currentUserId) : "Group chat"}
          time={groupLast ? relativeTime(groupLast.createdAt) : undefined}
          active={active.type === "group"}
          unread={groupUnread}
          isGroup
          onClick={() => { setActive({ type: "group" }); setViewMode("thread"); }}
        />
        {staff.length === 0 && (
          <div style={styles.sidebarEmpty}>No teammates yet</div>
        )}
        {staff.map(s => {
          const key = dmKey(currentUserId, s.id);
          const dmList = messages.dms[s.id] ?? [];
          const dmLast = dmList[dmList.length - 1];
          return (
            <ConvItem
              key={s.id}
              label={s.name}
              subtitle={dmLast ? previewText(dmLast, currentUserId) : formatRole(s.role)}
              time={dmLast ? relativeTime(dmLast.createdAt) : undefined}
              active={active.type === "dm" && active.partnerId === s.id}
              unread={unreadForConv(key)}
              role={s.role}
              online={onlineIds.has(s.id)}
              onClick={() => { setActive({ type: "dm", partnerId: s.id, partnerName: s.name }); setViewMode("thread"); }}
            />
          );
        })}
      </div>
      )}

      {/* Thread view — shown after a conversation is selected. */}
      {viewMode === "thread" && (
      <div style={styles.thread}>
        <div style={styles.threadHeader}>
          <button
            style={styles.backBtn}
            onClick={() => setViewMode("list")}
            aria-label="Back to conversations"
            title="Back"
          >
            <BackArrowIcon />
          </button>
          <div style={styles.threadTitleRow}>
            {active.type === "dm" ? (
              <Avatar name={active.partnerName} size={28} online={onlineIds.has(active.partnerId)} />
            ) : active.type === "ai" ? (
              <div style={{ ...styles.avatar, width: 28, height: 28, fontSize: 15, backgroundColor: colors.active.shade600 }}>✨</div>
            ) : (
              <div style={{ ...styles.avatar, width: 28, height: 28, fontSize: 13, backgroundColor: colors.active.shade400 }}>
                #
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
              <span style={styles.threadTitle}>
                {active.type === "group" ? "Clinic" : active.type === "ai" ? "AI Assistant" : active.partnerName}
              </span>
              {active.type === "dm" && (
                <span style={styles.threadStatus}>
                  {onlineIds.has(active.partnerId) ? "Online" : "Offline"}
                </span>
              )}
              {active.type === "ai" && (
                <span style={styles.threadStatus}>Clinic-scoped, read-only</span>
              )}
            </div>
          </div>
        </div>

        <div style={styles.messages}>
          {active.type === "ai" && (
            <>
              {aiMessages.length === 0 && (
                <div style={styles.empty}>
                  <div style={styles.emptyIcon} aria-hidden>✨</div>
                  <div style={styles.emptyTitle}>Ask about your clinic</div>
                  <div style={styles.emptySub}>
                    Try: "How many patients are waiting?", "Show overdue reviews", "Find patients with diabetes".
                  </div>
                </div>
              )}
              {aiMessages.map((m, i) => {
                const isMe = m.role === "user";
                return (
                  <div key={`ai-${i}`} style={{ ...styles.msgRow, justifyContent: isMe ? "flex-end" : "flex-start" }}>
                    <div style={{ maxWidth: "82%" }}>
                      <div style={{ ...styles.bubble, ...(isMe ? styles.bubbleMe : styles.bubbleThem), whiteSpace: "pre-wrap" }}>
                        {m.content}
                      </div>
                    </div>
                  </div>
                );
              })}
              {aiThinking && (
                <div style={{ ...styles.msgRow, justifyContent: "flex-start" }}>
                  <div style={{ ...styles.bubble, ...styles.bubbleThem, fontStyle: "italic", color: colors.neutral500 }}>
                    Thinking…
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </>
          )}
          {active.type !== "ai" && groupedMessages.length === 0 && (
            <div style={styles.empty}>
              <div style={styles.emptyIcon} aria-hidden>💬</div>
              <div style={styles.emptyTitle}>
                {active.type === "group" ? "Start the clinic conversation" : `Message ${active.partnerName.split(" ")[0]}`}
              </div>
              <div style={styles.emptySub}>
                {active.type === "group"
                  ? "Share announcements or quick notes with everyone."
                  : "Send a direct message — only you two will see it."}
              </div>
            </div>
          )}
          {active.type !== "ai" && groupedMessages.map((group, gIdx) => (
            <React.Fragment key={group.label + gIdx}>
              <div style={styles.dateSeparator}>
                <span style={styles.dateSeparatorPill}>{group.label}</span>
              </div>
              {group.items.map((msg, i) => {
                const isMe = msg.senderId === currentUserId;
                const prev = group.items[i - 1];
                // Sender label only matters in the group thread — in a DM
                // both participants are known from the thread header.
                const showName = active.type === "group" && !isMe && (!prev || prev.senderId !== msg.senderId);
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
            </React.Fragment>
          ))}
          <div ref={bottomRef} />
        </div>

        {!connected && (
          <div style={styles.disconnectBanner}>
            <span style={styles.disconnectDot} aria-hidden />
            Reconnecting…
          </div>
        )}

        {recording ? (
          <div style={styles.recordingRow}>
            <button
              style={styles.iconBtn}
              onClick={() => stopRecording("cancel")}
              aria-label="Cancel recording"
              title="Cancel"
            >
              <TrashIcon />
            </button>
            <div style={styles.recordingMeter}>
              <span style={styles.recordingDot} aria-hidden />
              <Waveform />
              <span style={styles.recordingTime}>{formatDuration(recordingMs)}</span>
            </div>
            <button
              style={styles.sendBtnActive}
              onClick={() => stopRecording("send")}
              aria-label="Send voice note"
              title="Send"
            >
              <ArrowUpIcon />
            </button>
          </div>
        ) : (
          <div style={styles.inputRow}>
            <input
              ref={fileInputRef}
              type="file"
              style={{ display: "none" }}
              onChange={handleFileChosen}
            />
            <button
              style={styles.iconBtn}
              onClick={handleAttachClick}
              aria-label="Attach file"
              title="Attach file"
            >
              <PaperclipIcon />
            </button>
            <div style={styles.inputPill}>
              <input
                ref={inputRef}
                style={styles.input}
                placeholder="Type a message…"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              />
              <button
                style={styles.inputMicBtn}
                onClick={startRecording}
                aria-label="Record voice note"
                title="Record voice note"
              >
                <MicIcon />
              </button>
            </div>
            <button
              style={input.trim() ? styles.sendBtnActive : styles.sendBtnDisabled}
              onClick={handleSend}
              disabled={!input.trim()}
              aria-label="Send"
              title="Send"
            >
              <ArrowUpIcon />
            </button>
          </div>
        )}
      </div>
      )}
    </div>
  );
}

// ── Subcomponents ───────────────────────────────────────────────────────────

function ConvItem({ label, subtitle, time, active, unread, onClick, isGroup, role, online }: {
  label: string; subtitle?: string; time?: string;
  active: boolean; unread: number; onClick: () => void;
  isGroup?: boolean; role?: string; online?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        ...styles.convItem,
        backgroundColor: active ? colors.neutral100 : "transparent",
      }}
    >
      {isGroup ? (
        <div style={{ ...styles.avatar, backgroundColor: colors.active.shade400 }}>#</div>
      ) : (
        <Avatar name={label} online={online} />
      )}
      <div style={styles.convText}>
        <div style={styles.convTopRow}>
          <span style={{
            ...styles.convLabel,
            fontWeight: active || unread > 0 ? fonts.weight.semibold : fonts.weight.regular,
          }}>{label}</span>
          {time && <span style={styles.convTime}>{time}</span>}
        </div>
        {subtitle && (
          <div style={{
            ...styles.convSub,
            color: unread > 0 ? colors.neutral900 : colors.neutral500,
            fontWeight: unread > 0 ? fonts.weight.medium : fonts.weight.regular,
          }}>{subtitle}</div>
        )}
      </div>
      {unread > 0 && <div style={styles.badge}>{unread > 99 ? "99+" : unread}</div>}
    </button>
  );
}

// Initials avatar. Color is deterministic per name so each person gets the
// same color across sessions. Uses theme palette tints.
const AVATAR_COLORS = [
  colors.active.shade500,
  colors.active.shade600,
  colors.active.shade700,
  colors.secondary500,
  "#9C7CBC", // muted purple — only used for avatar tinting, not in theme
  "#5BA3B8", // muted teal — same
];

function Avatar({ name, size = 32, online }: { name: string; size?: number; online?: boolean }) {
  const initials = useMemo(() => name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? "")
    .join(""), [name]);
  const color = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
  }, [name]);
  const dotSize = Math.max(8, Math.round(size * 0.3));
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <div
        style={{
          ...styles.avatar,
          width: size,
          height: size,
          fontSize: Math.round(size * 0.42),
          backgroundColor: color,
        }}
        aria-hidden
      >
        {initials || "?"}
      </div>
      {online && (
        <span
          title="Online"
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: dotSize,
            height: dotSize,
            borderRadius: "50%",
            backgroundColor: colors.secondary500,
            border: `2px solid ${colors.primary200}`,
            boxSizing: "border-box",
          }}
        />
      )}
    </div>
  );
}

function ArrowUpIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19V5" />
      <path d="M5 12l7-7 7 7" />
    </svg>
  );
}

function PaperclipIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
      <line x1="12" y1="18" x2="12" y2="22" />
      <line x1="8" y1="22" x2="16" y2="22" />
    </svg>
  );
}

function BackArrowIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5" />
      <path d="M12 19L5 12L12 5" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

// Animated waveform — twenty bars pulsing at offset delays. Mocks audio levels
// without wiring up an AnalyserNode (which can be a follow-up).
function Waveform() {
  return (
    <div style={styles.waveform} aria-hidden>
      {Array.from({ length: 24 }).map((_, i) => (
        <span
          key={i}
          style={{
            ...styles.waveformBar,
            animationDelay: `${(i * 80) % 720}ms`,
          }}
        />
      ))}
    </div>
  );
}

// ── DEMO data (remove before shipping) ──────────────────────────────────────

const DEMO_STAFF = [
  { id: "demo-anika",   name: "Dr. Anika Reddy",   role: "DOCTOR" },
  { id: "demo-vikram",  name: "Dr. Vikram Shah",   role: "DOCTOR" },
  { id: "demo-priya",   name: "Dr. Priya Iyer",    role: "DOCTOR" },
  { id: "demo-rohan",   name: "Dr. Rohan Mehta",   role: "DOCTOR" },
  { id: "demo-sneha",   name: "Sneha Pillai",      role: "RECEPTION" },
];

function DEMO_MESSAGES(currentUserId: string, active: Conversation): ChatMessage[] {
  const now = Date.now();
  const ago = (mins: number) => new Date(now - mins * 60 * 1000).toISOString();
  const yesterday = (h: number, m: number) => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    d.setHours(h, m, 0, 0);
    return d.toISOString();
  };
  const partner = active.type === "dm" ? active.partnerName : "Dr. Anika Reddy";
  const partnerId = active.type === "dm" ? active.partnerId : "demo-anika";
  return [
    { id: "d1", senderId: partnerId, senderName: partner, senderRole: "DOCTOR",
      recipientId: null, content: "Morning! Are we starting at 10 sharp today?", createdAt: yesterday(9, 12) },
    { id: "d2", senderId: currentUserId, senderName: "You", senderRole: "RECEPTION",
      recipientId: partnerId, content: "Yes, first patient is Aarav at 10. Walk-ins after lunch.", createdAt: yesterday(9, 14) },
    { id: "d3", senderId: partnerId, senderName: partner, senderRole: "DOCTOR",
      recipientId: null, content: "Perfect. Please pull up his last report before he comes in.", createdAt: yesterday(9, 15) },
    { id: "d4", senderId: currentUserId, senderName: "You", senderRole: "RECEPTION",
      recipientId: partnerId, content: "Done 👍", createdAt: yesterday(9, 16) },
    { id: "d5", senderId: partnerId, senderName: partner, senderRole: "DOCTOR",
      recipientId: null, content: "Quick one — Pantoprazole stock down to 8 strips. Can someone order a fresh box?", createdAt: ago(48) },
    { id: "d6", senderId: "demo-vikram", senderName: "Dr. Vikram Shah", senderRole: "DOCTOR",
      recipientId: null, content: "I'll place the order this evening.", createdAt: ago(42) },
    { id: "d7", senderId: currentUserId, senderName: "You", senderRole: "RECEPTION",
      recipientId: null, content: "Noted, thanks Dr. Vikram.", createdAt: ago(40) },
    { id: "d8", senderId: partnerId, senderName: partner, senderRole: "DOCTOR",
      recipientId: null, content: "Also: the AC in consult room 2 is making noise again. Could you log a maintenance ticket?", createdAt: ago(8) },
    { id: "d9", senderId: currentUserId, senderName: "You", senderRole: "RECEPTION",
      recipientId: null, content: "On it.", createdAt: ago(3) },
  ];
}

// ── Helpers ─────────────────────────────────────────────────────────────────

type DayGroup = { label: string; items: ChatMessage[] };

function groupByDay(msgs: ChatMessage[]): DayGroup[] {
  const groups: DayGroup[] = [];
  for (const m of msgs) {
    const label = dayLabel(m.createdAt);
    const last = groups[groups.length - 1];
    if (last && last.label === label) {
      last.items.push(m);
    } else {
      groups.push({ label, items: [m] });
    }
  }
  return groups;
}

function dayLabel(iso: string): string {
  try {
    const d = new Date(iso);
    const now = new Date();
    const startOfDay = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
    const diffDays = Math.round((startOfDay(now) - startOfDay(d)) / 86400000);
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return d.toLocaleDateString("en-US", { weekday: "long" });
    return d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: now.getFullYear() === d.getFullYear() ? undefined : "numeric" });
  } catch { return "—"; }
}

function relativeTime(iso: string): string {
  try {
    const d = new Date(iso).getTime();
    const diffSec = Math.round((Date.now() - d) / 1000);
    if (diffSec < 60) return "now";
    const diffMin = Math.round(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m`;
    const diffHr = Math.round(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h`;
    const diffDay = Math.round(diffHr / 24);
    if (diffDay < 7) return `${diffDay}d`;
    return new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "short" });
  } catch { return ""; }
}

function previewText(msg: ChatMessage, currentUserId: string): string {
  const prefix = msg.senderId === currentUserId ? "You: " : "";
  const text = msg.content.replace(/\s+/g, " ").trim();
  return prefix + text;
}

function formatRole(role: string) {
  return role.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch { return ""; }
}

function formatDuration(ms: number) {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

// Inject waveform keyframes once on module load — saves wiring the styles
// up to a stylesheet just for one animation.
if (typeof document !== "undefined" && !document.getElementById("docodile-chat-waveform-style")) {
  const el = document.createElement("style");
  el.id = "docodile-chat-waveform-style";
  el.innerHTML = `
    @keyframes docodileChatWave {
      0%, 100% { transform: scaleY(0.25); }
      50% { transform: scaleY(1); }
    }
    @keyframes docodileChatPulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(1.15); }
    }
  `;
  document.head.appendChild(el);
}

// ── Styles ──────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  // Outer card — single pane (slack-mobile style). No stroke; rely on
  // box-shadow for elevation only.
  panel: {
    position: "relative" as const,
    display: "flex",
    width: 340,
    height: 540,
    backgroundColor: colors.neutral100,
    borderRadius: radii["2xl"],
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.16)",
    overflow: "hidden",
    fontFamily: fonts.family.primary,
  },
  // Back arrow shown in the thread header — returns to the conversation list.
  backBtn: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    border: "none",
    backgroundColor: "transparent",
    color: colors.neutral700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    flexShrink: 0,
  },
  // Sidebar uses a warm cream tint (primary200) to separate from the white
  // thread by color rather than a divider line.
  sidebar: {
    flex: 1,
    backgroundColor: colors.primary200,
    display: "flex",
    flexDirection: "column",
    overflowY: "auto" as const,
    padding: spacing.xs,
    gap: spacing["2xs"],
  },
  sidebarTitle: {
    padding: `${spacing.xs} ${spacing.s}`,
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.m,
    lineHeight: fonts.lineHeight.m,
    fontWeight: fonts.weight.regular,
    color: colors.neutral900,
  },
  sidebarSection: {
    padding: `${spacing.s} ${spacing.s} ${spacing["2xs"]}`,
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.xs,
    color: colors.neutral500,
    fontWeight: fonts.weight.medium,
  },
  // Header above the conversation list — gives the X close button a clear
  // anchor and visual separation from the first conv item.
  listHeader: {
    padding: `${spacing.xs} ${spacing.s} ${spacing.s}`,
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.m,
    lineHeight: fonts.lineHeight.m,
    fontWeight: fonts.weight.regular,
    color: colors.neutral900,
  },
  sidebarEmpty: {
    padding: `${spacing.xs} ${spacing.s}`,
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.xs,
    color: colors.neutral500,
    fontStyle: "italic" as const,
  },
  convItem: {
    display: "flex",
    alignItems: "center",
    gap: spacing.xs,
    padding: `${spacing.xs} ${spacing.s}`,
    border: "none",
    cursor: "pointer",
    textAlign: "left" as const,
    transition: "background-color 0.1s",
    fontFamily: fonts.family.primary,
    width: "100%",
    borderRadius: radii.s,
  },
  convText: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  convTopRow: {
    display: "flex",
    alignItems: "baseline",
    gap: spacing["2xs"],
    minWidth: 0,
  },
  convLabel: {
    flex: 1,
    fontSize: fonts.size.s,
    color: colors.neutral900,
    whiteSpace: "nowrap" as const,
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  convTime: {
    fontSize: fonts.size.xs,
    color: colors.neutral500,
    flexShrink: 0,
  },
  convSub: {
    fontSize: fonts.size.xs,
    whiteSpace: "nowrap" as const,
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  // Initials avatar (sidebar + thread header).
  avatar: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: fonts.weight.semibold,
    color: colors.neutral100,
    fontFamily: fonts.family.primary,
    flexShrink: 0,
    userSelect: "none" as const,
  },
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.red200,
    color: colors.neutral100,
    fontSize: fonts.size.xs,
    fontWeight: fonts.weight.semibold,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 4px",
    flexShrink: 0,
    fontFamily: fonts.family.primary,
  },
  thread: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  // Header sits on the thread (white) — no border. Back arrow + avatar +
  // title flow left-to-right.
  threadHeader: {
    padding: `${spacing.s} ${spacing.m}`,
    display: "flex",
    alignItems: "center",
    gap: spacing.s,
  },
  threadTitleRow: {
    display: "flex",
    alignItems: "center",
    gap: spacing.s,
    minWidth: 0,
  },
  threadTitle: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.m,
    lineHeight: fonts.lineHeight.m,
    fontWeight: fonts.weight.regular,
    color: colors.neutral900,
    whiteSpace: "nowrap" as const,
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  threadStatus: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.xs,
    color: colors.neutral500,
    lineHeight: 1.2,
  },
  // Reconnect banner — only renders when the WS connection is down. Visually
  // anchored to the input row so the user sees it where they'd act.
  disconnectBanner: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing["2xs"],
    padding: `${spacing["2xs"]} ${spacing.s}`,
    fontSize: fonts.size.xs,
    fontFamily: fonts.family.primary,
    color: colors.neutral700,
    backgroundColor: colors.primary100,
  },
  disconnectDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.neutral400,
    flexShrink: 0,
    animation: "docodileChatPulse 1s ease-in-out infinite",
  },
  messages: {
    flex: 1,
    overflowY: "auto" as const,
    padding: spacing.m,
    display: "flex",
    flexDirection: "column",
    gap: spacing["2xs"],
    scrollbarWidth: "none" as const,
  },
  empty: {
    margin: "auto",
    color: colors.neutral500,
    fontFamily: fonts.family.primary,
    textAlign: "center" as const,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: spacing["2xs"],
    padding: spacing.m,
  },
  emptyIcon: {
    fontSize: 32,
    lineHeight: 1,
    marginBottom: spacing["2xs"],
  },
  emptyTitle: {
    fontSize: fonts.size.m,
    fontWeight: fonts.weight.medium,
    color: colors.neutral900,
  },
  emptySub: {
    fontSize: fonts.size.s,
    color: colors.neutral500,
    maxWidth: 260,
    lineHeight: 1.4,
  },
  // Date separator — centered cream pill, no lines. Inspired by the
  // notification chip pattern used elsewhere in the app.
  dateSeparator: {
    display: "flex",
    justifyContent: "center",
    margin: `${spacing.s} 0 ${spacing["2xs"]}`,
  },
  dateSeparatorPill: {
    fontSize: fonts.size.xs,
    color: colors.neutral700,
    fontWeight: fonts.weight.medium,
    backgroundColor: colors.primary100,
    padding: `${spacing["3xs"]} ${spacing.s}`,
    borderRadius: radii.full,
  },
  msgRow: { display: "flex" },
  msgSender: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.xs,
    color: colors.neutral500,
    marginBottom: 2,
  },
  bubble: {
    padding: `${spacing.xs} ${spacing.m}`,
    borderRadius: radii["2xl"],
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.s,
    lineHeight: fonts.lineHeight.s,
    wordBreak: "break-word" as const,
  },
  bubbleMe: {
    backgroundColor: colors.active.shade700,
    color: colors.neutral100,
  },
  bubbleThem: {
    backgroundColor: colors.primary100,
    color: colors.neutral900,
  },
  msgTime: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.caption,
    color: colors.neutral500,
    marginTop: 2,
  },
  // Input row — no top border. The cream input fill against the white thread
  // gives the visual separation.
  inputRow: {
    display: "flex",
    gap: spacing.xs,
    padding: spacing.s,
    alignItems: "center",
  },
  // Cream pill that wraps the text input + inline mic button.
  inputPill: {
    flex: 1,
    minWidth: 0,
    height: 36,
    display: "flex",
    alignItems: "center",
    backgroundColor: colors.primary100,
    borderRadius: 999,
    paddingLeft: spacing.s,
    paddingRight: 4,
  },
  input: {
    flex: 1,
    minWidth: 0,
    height: "100%",
    border: "none",
    padding: 0,
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.s,
    color: colors.neutral900,
    outline: "none",
    backgroundColor: "transparent",
    boxSizing: "border-box" as const,
  },
  // Mic button rendered inside the input pill (right side).
  inputMicBtn: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    border: "none",
    backgroundColor: "transparent",
    color: colors.neutral700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    flexShrink: 0,
  },
  // Plain icon button — used for paperclip / mic / cancel-recording.
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    border: "none",
    backgroundColor: "transparent",
    color: colors.neutral700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    flexShrink: 0,
    transition: "background-color 0.15s, color 0.15s",
  },
  // Active circular send button — brand orange fill, white up-arrow.
  sendBtnActive: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    border: "none",
    backgroundColor: colors.active.shade700,
    color: colors.neutral100,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    flexShrink: 0,
  },
  // Muted send button when the input is empty — still visible (always shown),
  // just signals that there's nothing to send yet.
  sendBtnDisabled: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    border: "none",
    backgroundColor: colors.primary200,
    color: colors.neutral400,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "not-allowed",
    flexShrink: 0,
  },

  // ─── Voice recording row ──────────────────────────────────────────────────
  recordingRow: {
    display: "flex",
    alignItems: "center",
    gap: spacing.xs,
    padding: spacing.s,
  },
  recordingMeter: {
    flex: 1,
    minWidth: 0,
    height: 36,
    backgroundColor: colors.primary100,
    borderRadius: 999,
    display: "flex",
    alignItems: "center",
    gap: spacing.xs,
    padding: `0 ${spacing.s}`,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    backgroundColor: colors.red200,
    flexShrink: 0,
    animation: "docodileChatPulse 1s ease-in-out infinite",
  },
  recordingTime: {
    fontFamily: fonts.family.primary,
    fontSize: fonts.size.s,
    color: colors.neutral700,
    fontVariantNumeric: "tabular-nums",
    flexShrink: 0,
  },
  waveform: {
    flex: 1,
    minWidth: 0,
    height: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    overflow: "hidden",
  },
  waveformBar: {
    width: 2,
    height: 16,
    backgroundColor: colors.active.shade700,
    borderRadius: 999,
    transformOrigin: "center",
    animation: "docodileChatWave 720ms ease-in-out infinite",
  },
};
