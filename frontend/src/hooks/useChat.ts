import { useEffect, useRef, useState, useCallback } from "react";
import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { API_BASE_URL } from "../apiConfig";
import { currentTenant } from "../tenant";

export type ChatMessage = {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string | null;
  recipientId: string | null;
  content: string;
  createdAt: string;
};

export type StaffMember = {
  id: string;
  name: string;
  role: string;
};

type ChatState = {
  group: ChatMessage[];
  dms: Record<string, ChatMessage[]>; // keyed by partner userId
};

function dmKey(a: string, b: string) {
  return [a, b].sort().join("_");
}

export function useChat(currentUserId: string) {
  const [messages, setMessages] = useState<ChatState>({ group: [], dms: {} });
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [unread, setUnread] = useState<Record<string, number>>({});
  const [connected, setConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);

  // Load history + staff on mount
  useEffect(() => {
    if (!currentUserId) return;
    const token = localStorage.getItem("docodile_token") ?? "";
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch(`${API_BASE_URL}/api/chat/messages/group`, { headers }).then(r => r.ok ? r.json() : []),
      fetch(`${API_BASE_URL}/api/chat/staff`, { headers }).then(r => r.ok ? r.json() : []),
      fetch(`${API_BASE_URL}/api/chat/unread`, { headers }).then(r => r.ok ? r.json() : {}),
    ]).then(([groupMsgs, staffList, unreadCounts]) => {
      setMessages(prev => ({ ...prev, group: groupMsgs }));
      setStaff(staffList);
      setUnread(unreadCounts);
    }).catch(() => {});
  }, [currentUserId]);

  // WebSocket connection
  useEffect(() => {
    if (!currentUserId) return;
    const token = localStorage.getItem("docodile_token") ?? "";

    const client = new Client({
      webSocketFactory: () => new SockJS(`${API_BASE_URL}/ws`),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        setConnected(true);

        // Re-fetch group history to fill any gap from a disconnect
        const reconnectToken = localStorage.getItem("docodile_token") ?? "";
        fetch(`${API_BASE_URL}/api/chat/messages/group`, {
          headers: { Authorization: `Bearer ${reconnectToken}` },
        })
          .then(r => r.ok ? r.json() : null)
          .then((groupMsgs: ChatMessage[] | null) => {
            if (!groupMsgs) return;
            setMessages(prev => {
              const restIds = new Set(groupMsgs.map(m => m.id));
              const wsOnly = prev.group.filter(m => !restIds.has(m.id));
              return {
                ...prev,
                group: [...groupMsgs, ...wsOnly].sort(
                  (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                ),
              };
            });
          })
          .catch(() => {});

        // Subscribe to clinic group channel
        client.subscribe(`/topic/clinic/${currentTenant() ?? ""}`, (msg: IMessage) => {
          const data: ChatMessage = JSON.parse(msg.body);
          setMessages(prev => ({ ...prev, group: [...prev.group, data] }));
          if (data.senderId !== currentUserId) {
            setUnread(prev => ({ ...prev, group: (prev["group"] ?? 0) + 1 }));
          }
        });

        // Subscribe to personal DM queue
        client.subscribe("/user/queue/messages", (msg: IMessage) => {
          const data: ChatMessage = JSON.parse(msg.body);
          const partnerId = data.senderId === currentUserId ? data.recipientId! : data.senderId;
          const key = dmKey(currentUserId, partnerId);
          setMessages(prev => ({
            ...prev,
            dms: { ...prev.dms, [partnerId]: [...(prev.dms[partnerId] ?? []), data] },
          }));
          if (data.senderId !== currentUserId) {
            setUnread(prev => ({ ...prev, [key]: (prev[key] ?? 0) + 1 }));
          }
        });
      },
      onDisconnect: () => setConnected(false),
    });

    client.activate();
    clientRef.current = client;
    return () => { client.deactivate(); };
  }, [currentUserId]);

  const sendGroup = useCallback((content: string) => {
    clientRef.current?.publish({
      destination: "/app/chat/group",
      body: JSON.stringify({ content }),
    });
  }, []);

  const sendDirect = useCallback((recipientId: string, content: string) => {
    clientRef.current?.publish({
      destination: "/app/chat/direct",
      body: JSON.stringify({ content, recipientId }),
    });
  }, []);

  const loadDmHistory = useCallback(async (partnerId: string) => {
    const token = localStorage.getItem("docodile_token") ?? "";
    // Swallow network/parse errors like the other fetches here: a transient
    // failure on opening a DM (or no backend, e.g. in Storybook) must not throw
    // an unhandled rejection that crashes the panel — the live WS still feeds it.
    try {
      const res = await fetch(`${API_BASE_URL}/api/chat/messages/dm/${partnerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const msgs: ChatMessage[] = await res.json();
      setMessages(prev => {
        const existing = prev.dms[partnerId] ?? [];
        const restIds = new Set(msgs.map(m => m.id));
        const wsOnly = existing.filter(m => !restIds.has(m.id));
        const merged = [...msgs, ...wsOnly].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        return { ...prev, dms: { ...prev.dms, [partnerId]: merged } };
      });
    } catch {
      /* offline / no backend — keep whatever the websocket has delivered */
    }
  }, []);

  const markSeen = useCallback((conversationKey: string) => {
    const token = localStorage.getItem("docodile_token") ?? "";
    fetch(`${API_BASE_URL}/api/chat/seen/${conversationKey}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
    setUnread(prev => {
      const next = { ...prev };
      delete next[conversationKey];
      return next;
    });
  }, []);

  return { messages, staff, unread, connected, sendGroup, sendDirect, loadDmHistory, markSeen, dmKey };
}
