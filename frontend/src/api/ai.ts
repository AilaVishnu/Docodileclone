import { API_BASE_URL } from "../apiConfig";

// REST client for the AI features. Every endpoint returns a `content`
// string that's a JSON-encoded payload — the model is prompted to respond
// in JSON-mode so callers can JSON.parse(content) and pluck fields.

function authHeaders(): HeadersInit {
  const token = localStorage.getItem("docodile_token");
  return token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    : { "Content-Type": "application/json" };
}

async function readError(res: Response): Promise<string> {
  const raw = await res.text();
  try {
    return raw ? (JSON.parse(raw).error || `HTTP ${res.status}`) : `HTTP ${res.status}`;
  } catch {
    return raw || `HTTP ${res.status}`;
  }
}

export type AIHealth = { configured: boolean };

export async function getAIHealth(): Promise<AIHealth> {
  const res = await fetch(`${API_BASE_URL}/api/ai/health`, { headers: authHeaders() });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

// ── Patient summary ─────────────────────────────────────────────────────────

export type PatientSummary = {
  summary: string;
  activeConditions: string[];
  allergies: string[];
  riskFlags: string[];
  lastVisitGist: string;
  error?: string;
};

export type PatientSummaryResponse = {
  // Model-generated JSON as a string — parse with parsePatientSummary().
  // Empty string when nothing has been generated yet for the current visit set.
  content: string;
  updatedAt: string;
  cached: boolean;
  // True when the DB row matches the patient's current visit fingerprint.
  // False = no summary exists yet, OR new visits invalidated the cache.
  // The UI shows a "Generate" button when this is false.
  generated: boolean;
};

/** Cached-only read. Never calls OpenAI. Safe to invoke on every page open. */
export async function fetchPatientSummary(patientId: string): Promise<PatientSummaryResponse> {
  const res = await fetch(`${API_BASE_URL}/api/ai/patients/${patientId}/summary`, { headers: authHeaders() });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

/** Explicit generation — costs tokens. Wire to Generate/Refresh buttons. */
export async function generatePatientSummary(patientId: string): Promise<PatientSummaryResponse> {
  const res = await fetch(`${API_BASE_URL}/api/ai/patients/${patientId}/summary`, {
    method: "POST",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export function parsePatientSummary(content: string): PatientSummary {
  try {
    const j = JSON.parse(content || "{}");
    return {
      summary: String(j.summary ?? ""),
      activeConditions: Array.isArray(j.activeConditions) ? j.activeConditions.map(String) : [],
      allergies: Array.isArray(j.allergies) ? j.allergies.map(String) : [],
      riskFlags: Array.isArray(j.riskFlags) ? j.riskFlags.map(String) : [],
      lastVisitGist: String(j.lastVisitGist ?? ""),
      error: j.error ? String(j.error) : undefined,
    };
  } catch {
    return { summary: "", activeConditions: [], allergies: [], riskFlags: [], lastVisitGist: "", error: "Couldn't parse AI response" };
  }
}

// ── Visit SOAP draft ────────────────────────────────────────────────────────

export type SoapDraft = {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  error?: string;
};

export async function fetchVisitSoapDraft(visitId: string): Promise<SoapDraft> {
  const res = await fetch(`${API_BASE_URL}/api/ai/visits/${visitId}/soap-draft`, {
    method: "POST",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await readError(res));
  const body = await res.json();
  try {
    const j = JSON.parse(body.content || "{}");
    return {
      subjective: String(j.subjective ?? ""),
      objective: String(j.objective ?? ""),
      assessment: String(j.assessment ?? ""),
      plan: String(j.plan ?? ""),
      error: j.error ? String(j.error) : undefined,
    };
  } catch {
    return { subjective: "", objective: "", assessment: "", plan: "", error: "Couldn't parse AI response" };
  }
}

// ── Stats highlights ────────────────────────────────────────────────────────

export type AIHighlight = { tone: "good" | "warn" | "info"; text: string };

export async function fetchStatsHighlights(overviewPayload: unknown): Promise<AIHighlight[]> {
  const res = await fetch(`${API_BASE_URL}/api/ai/stats/highlights`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(overviewPayload),
  });
  if (!res.ok) throw new Error(await readError(res));
  const body = await res.json();
  try {
    const j = JSON.parse(body.content || "{}");
    const items = Array.isArray(j.items) ? j.items : [];
    return items
      .map((it: any) => ({ tone: (it?.tone === "good" || it?.tone === "warn" ? it.tone : "info") as AIHighlight["tone"], text: String(it?.text ?? "") }))
      .filter((it: AIHighlight) => it.text.length > 0);
  } catch {
    return [];
  }
}

// Drug interactions intentionally NOT routed through AI — Eka Care's
// pharmacology API already returns clinician-grade interaction text
// (drug + interactsWith + comment) which the prescription page surfaces
// directly. Wrapping it with an LLM only adds latency and cost.

// ── Clinic AI chat assistant ────────────────────────────────────────────────

export type AIChatTurn = { role: "user" | "assistant"; content: string };

export async function chatWithAssistant(messages: AIChatTurn[]): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/api/ai/chat`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ messages }),
  });
  if (!res.ok) throw new Error(await readError(res));
  const body = await res.json();
  return String(body.reply ?? "");
}
