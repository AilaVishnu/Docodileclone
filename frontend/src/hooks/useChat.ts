import { useEffect, useRef, useState, useCallback } from "react";
import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { API_BASE_URL } from "../apiConfig";

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

function authHeaders() {
  const token = localStorage.getItem("docodile_token") ?? "";
  return { Authorization: `Bearer ${token}` };
}

function dmKey(a: string, b: string) {
  return [a, b].sort().join("_");
}

export function useChat(clinicId: string, currentUserId: string) {
  const [messages, setMessages] = useState<ChatState>({ group: [], dms: {} });
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [unread, setUnread] = useState<Record<string, number>>({});
  const [connected, setConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);

  // Load history + staff on mount
  useEffect(() => {
    if (!clinicId || !currentUserId) return;
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
  }, [clinicId, currentUserId]);

  // WebSocket connection
  useEffect(() => {
    if (!clinicId || !currentUserId) return;
    const token = localStorage.getItem("docodile_token") ?? "";

    const client = new Client({
      webSocketFactory: () => new SockJS(`${API_BASE_URL}/ws`),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        setConnected(true);

        // Subscribe to clinic group channel
        client.subscribe(`/topic/clinic/${clinicId}`, (msg: IMessage) => {
          const data: ChatMessage = JSON.parse(msg.body);
          setMessages(prev => ({ ...prev, group: [...prev.group, data] }));
          setUnread(prev => ({ ...prev, group: (prev["group"] ?? 0) + 1 }));
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
  }, [clinicId, currentUserId]);

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
    const res = await fetch(`${API_BASE_URL}/api/chat/messages/dm/${partnerId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;
    const msgs: ChatMessage[] = await res.json();
    setMessages(prev => ({ ...prev, dms: { ...prev.dms, [partnerId]: msgs } }));
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
