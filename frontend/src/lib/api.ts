import type {
  LoginCredentials,
  MatchFilters,
  MatchResponse,
  MSMEProfile,
  Opportunity,
  RegisterData,
  Token,
  User,
  ContractCreate,
  ContractRead,
  ContractStatus,
  MilestoneRead,
} from "@/types/api";

// ─── Base URL ────────────────────────────────────────────────
const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api/v1";

// ─── Token helpers ───────────────────────────────────────────
const TOKEN_KEY = "token";

export const tokenStore = {
  get: (): string | null => localStorage.getItem(TOKEN_KEY),
  set: (token: string): void => localStorage.setItem(TOKEN_KEY, token),
  clear: (): void => localStorage.removeItem(TOKEN_KEY),
};

// ─── Core fetch wrapper ──────────────────────────────────────

class APIError extends Error {
  constructor(
    public readonly status: number,
    public readonly detail: string,
  ) {
    super(detail);
    this.name = "APIError";
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = tokenStore.get();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> | undefined),
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Graceful body parse
  const isJSON = response.headers
    .get("content-type")
    ?.includes("application/json");
  const body = isJSON ? await response.json() : await response.text();

  if (!response.ok) {
    // Only dispatch global 401 for protected routes, NOT for /auth/* endpoints.
    // This prevents a wrong-password login attempt from triggering an automatic logout.
    if (response.status === 401 && !endpoint.startsWith("/auth/")) {
      window.dispatchEvent(new CustomEvent("unify:unauthorized"));
    }
    const detail =
      typeof body === "object" && body !== null
        ? body.detail ?? `${response.status} ${response.statusText}`
        : body || `${response.status} ${response.statusText}`;
    throw new APIError(response.status, String(detail));
  }

  return body as T;
}

// ─── Convenience helpers ─────────────────────────────────────
const get = <T>(endpoint: string) => request<T>(endpoint, { method: "GET" });

const post = <T>(endpoint: string, body: unknown) =>
  request<T>(endpoint, {
    method: "POST",
    body: JSON.stringify(body),
  });

// ─── API Namespaces ──────────────────────────────────────────

export const auth = {
  /** POST /auth/login → Token */
  login: (credentials: LoginCredentials): Promise<Token> =>
    post<Token>("/auth/login", credentials),

  /** POST /auth/register → User */
  register: (userData: RegisterData): Promise<User> =>
    post<User>("/auth/register", userData),

  /** GET /auth/me → User */
  me: (): Promise<User> => get<User>("/auth/me"),
};

export const profiles = {
  /** GET /profiles/msme/me → MSMEProfile */
  getMSMEProfile: (): Promise<MSMEProfile> =>
    get<MSMEProfile>("/profiles/msme/me"),

  /** POST /profiles/msme → MSMEProfile (create or update) */
  upsertMSMEProfile: (data: {
    company_name: string;
    udyam_registration?: string | null;
    capabilities?: Record<string, unknown>;
  }): Promise<MSMEProfile> =>
    post<MSMEProfile>("/profiles/msme", data),
};

export const matching = {
  /**
   * POST /match/opportunities
   * msmeId  – UUID of the MSME profile
   * topK    – number of results (1–50)
   * filters – optional sector / is_verified filters
   */
  getOpportunitiesMatch: (
    msmeId: string,
    topK: number = 5,
    filters: MatchFilters = {},
  ): Promise<MatchResponse> =>
    post<MatchResponse>("/match/opportunities", {
      msme_id: msmeId,
      top_k: topK,
      ...(filters.sector?.length ? { sector: filters.sector } : {}),
      ...(filters.is_verified !== undefined
        ? { is_verified: filters.is_verified }
        : {}),
    }),
};

export const opportunities = {
  /** GET /opportunities → Opportunity[] */
  listOpportunities: (params?: {
    sector?: string;
    search?: string;
    is_verified?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<Opportunity[]> => {
    const qs = new URLSearchParams();
    if (params?.sector) qs.set("sector", params.sector);
    if (params?.search) qs.set("search", params.search);
    if (params?.is_verified !== undefined)
      qs.set("is_verified", String(params.is_verified));
    if (params?.limit !== undefined) qs.set("limit", String(params.limit));
    if (params?.offset !== undefined) qs.set("offset", String(params.offset));
    const q = qs.toString();
    return get<Opportunity[]>(`/opportunities${q ? `?${q}` : ""}`);
  },
};

export const contracts = {
  /** POST /contracts → ContractRead */
  createContract: (data: ContractCreate): Promise<ContractRead> =>
    post<ContractRead>("/contracts", data),

  /** GET /contracts → ContractRead[] */
  listContracts: (): Promise<ContractRead[]> => get<ContractRead[]>("/contracts"),

  /** PATCH /contracts/{id}/status → ContractRead */
  updateStatus: (id: string, status: ContractStatus): Promise<ContractRead> =>
    request<ContractRead>(`/contracts/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  /** PATCH /contracts/milestones/{id} → MilestoneRead */
  updateMilestone: (id: string, is_completed: boolean): Promise<MilestoneRead> =>
    request<MilestoneRead>(`/contracts/milestones/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ is_completed }),
    }),
};

// Re-export error class so consumers can do: catch (e) { if (e instanceof APIError) ... }
export { APIError };

// ─── Backward-compatible legacy API export ───────────────────
export const api = {
  getAIRecommendations: (msmeId: string, topK: number = 10) =>
    post<any[]>("/opportunities/recommendations", { msme_id: msmeId, top_k: topK }),
  getOpportunities: (filters?: { sector?: string; search?: string }) => {
    const qs = new URLSearchParams(filters as Record<string, string>).toString();
    return get<any[]>(`/opportunities${qs ? `?${qs}` : ""}`);
  },
  getActiveDeals: () => get<any[]>("/mediation/deals"),
  getConversations: () => get<any[]>("/messages/conversations"),
  sendMessage: (recipientId: string, message: string) =>
    post<any>("/messages/send", { recipient_id: recipientId, message }),
  getProfile: () => get<any>("/profile/me"),
  updateProfile: (profileData: any) =>
    request<any>("/profile/me", { method: "PUT", body: JSON.stringify(profileData) }),
};