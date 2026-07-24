const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

/**
 * Generic fetch wrapper with standard error handling and Auth header
 */
async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// ==========================================
// API Methods corresponding to your UI Views
// ==========================================

export const api = {
  // 1. AI Recommendations (Pinecone + COMS + VRA)
  getAIRecommendations: (msmeId: string, topK: number = 10) =>
    fetchAPI<any[]>('/opportunities/recommendations', {
      method: 'POST',
      body: JSON.stringify({ msme_id: msmeId, top_k: topK }),
    }),

  // 2. Opportunities Feed
  getOpportunities: (filters?: { sector?: string; search?: string }) => {
    const query = new URLSearchParams(filters as Record<string, string>).toString();
    return fetchAPI<any[]>(`/opportunities?${query}`);
  },

  // 3. Mediation & Active Deals
  getActiveDeals: () => fetchAPI<any[]>('/mediation/deals'),

  // 4. Messages / Real-Time Collaboration
  getConversations: () => fetchAPI<any[]>('/messages/conversations'),
  sendMessage: (recipientId: string, message: string) =>
    fetchAPI<any>('/messages/send', {
      method: 'POST',
      body: JSON.stringify({ recipient_id: recipientId, message }),
    }),

  // 5. User Profile
  getProfile: () => fetchAPI<any>('/profile/me'),
  updateProfile: (profileData: any) =>
    fetchAPI<any>('/profile/me', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }),
};