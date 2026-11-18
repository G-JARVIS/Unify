import { apiGet, apiPost, apiPatch, apiPut, apiDelete, ApiError } from "./api";
import type { Opportunity, Application, SupplyChainRequest, Collaboration } from "../data/types";

export type { Opportunity, Application, SupplyChainRequest, Collaboration };
export { ApiError };

export async function fetchOpportunities(): Promise<Opportunity[]> {
  const [opportunities, tenders, supplyChain, collaborations] = await Promise.all([
    apiGet<Opportunity[]>("/opportunities"),
    fetchGovTenders(),
    fetchSupplyChain(),
    fetchCollaborations(),
  ]);
  const fromTenders: Opportunity[] = tenders
    .filter((tender) => tender.status === "active")
    .map((tender) => ({
      id: `gov-tender:${tender.id}`,
      sourceId: tender.id,
      tenderReferenceNumber: tender.referenceNumber,
      title: tender.title,
      sector: tender.sector || "Government",
      location: tender.location && !tender.location.toLowerCase().includes("see the official")
        ? tender.location
        : "See official tender notice",
      budgetRange: tender.budget && !tender.budget.toLowerCase().includes("not stated")
        ? tender.budget
        : "See official tender notice",
      deadline: tender.deadline,
      matchScore: 0,
      type: "tender",
      postedBy: tender.department || "Government of India",
      description: tender.description,
    }));
  const fromSupplyChain: Opportunity[] = supplyChain.map((request) => ({
    id: `supply-chain:${request.id}`,
    sourceId: request.id,
    title: request.title,
    sector: request.sector || "Supply chain",
    location: request.location || "Not specified",
    budgetRange: request.budget || "Not specified",
    deadline: request.deadline || "Not specified",
    matchScore: 0,
    type: "outsourcing",
    postedBy: request.companyName,
    description: request.description,
  }));
  const fromCollaborations: Opportunity[] = collaborations.map((collaboration) => ({
    id: `collaboration:${collaboration.id}`,
    sourceId: collaboration.id,
    title: collaboration.projectTitle,
    sector: collaboration.sector || "Collaboration",
    location: "Pan India",
    budgetRange: collaboration.budget || "Not specified",
    deadline: "Open",
    matchScore: 0,
    type: "collaboration",
    postedBy: collaboration.companyName,
    description: collaboration.description,
  }));
  return [...fromTenders, ...fromSupplyChain, ...fromCollaborations, ...opportunities];
}

export async function fetchOpportunity(id: string): Promise<Opportunity> {
  if (id.includes(":")) {
    const opportunity = (await fetchOpportunities()).find((item) => item.id === id);
    if (opportunity) return opportunity;
    throw new ApiError(404, "Opportunity not found");
  }
  return apiGet<Opportunity>(`/opportunities/${encodeURIComponent(id)}`);
}

export async function toggleSaveOpportunity(id: string, saved: boolean): Promise<void> {
  await apiPatch(`/opportunities/${encodeURIComponent(id)}/save`, { saved });
}

export async function fetchApplications(): Promise<Application[]> {
  return apiGet<Application[]>("/applications");
}

export async function fetchReceivedRequests(): Promise<Application[]> {
  return apiGet<Application[]>("/applications/requests");
}

export async function fetchApplication(id: string): Promise<Application> {
  return apiGet<Application>(`/applications/${encodeURIComponent(id)}`);
}

export async function createApplication(app: Partial<Application> & { opportunityTitle: string }): Promise<Application> {
  return apiPost<Application>("/applications", app);
}

export async function updateApplicationStatus(id: string, status: string): Promise<Application> {
  return apiPatch<Application>(`/applications/${encodeURIComponent(id)}/status`, { status });
}

export async function fetchSupplyChain(): Promise<SupplyChainRequest[]> {
  return apiGet<SupplyChainRequest[]>("/supply-chain");
}

export async function fetchSupplyChainRequest(id: string): Promise<SupplyChainRequest> {
  return apiGet<SupplyChainRequest>(`/supply-chain/${encodeURIComponent(id)}`);
}

export async function createSupplyChainRequest(req: Omit<SupplyChainRequest, "id">): Promise<void> {
  await apiPost("/supply-chain", req);
}

export async function fetchCollaborations(): Promise<Collaboration[]> {
  return apiGet<Collaboration[]>("/collaborations");
}

export async function fetchCollaboration(id: string): Promise<Collaboration> {
  return apiGet<Collaboration>(`/collaborations/${encodeURIComponent(id)}`);
}

export async function createCollaboration(collab: Omit<Collaboration, "id" | "companyName">): Promise<Collaboration> {
  return apiPost<Collaboration>("/collaborations", collab);
}

export interface GovContract {
  id: string;
  title: string;
  department: string;
  location: string;
  budget: string;
  deadline: string;
  sector: string;
  verified: boolean;
  description: string;
  fullDescription?: string;
  applyLink?: string;
  sourceName?: string;
  sourceUrl?: string;
  sourceReference?: string;
  sourceCheckedAt?: string | null;
  status: "active" | "closed";
}

export async function fetchGovContracts(): Promise<GovContract[]> {
  return apiGet<GovContract[]>("/gov-contracts");
}

export async function fetchGovContract(id: string): Promise<GovContract> {
  return apiGet<GovContract>(`/gov-contracts/${encodeURIComponent(id)}`);
}

export async function createGovContract(contract: Omit<GovContract, "id">): Promise<GovContract> {
  return apiPost<GovContract>("/gov-contracts", contract);
}

export async function updateGovContract(id: string, contract: Partial<GovContract>): Promise<void> {
  await apiPut(`/gov-contracts/${encodeURIComponent(id)}`, contract);
}

export async function deleteGovContract(id: string): Promise<void> {
  await apiDelete(`/gov-contracts/${encodeURIComponent(id)}`);
}

export interface GovTender extends GovContract {
  portalTenderId?: string;
  referenceNumber?: string;
  bidOpeningDate?: string;
}

export function getGovTenderPortalUrl(tender: Pick<GovTender, "sourceUrl" | "applyLink">): string {
  const specificUrl = [tender.sourceUrl, tender.applyLink].find(
    (url): url is string => Boolean(url) && !url.includes("FrontEndLatestActiveTenders"),
  );
  return specificUrl || "https://eprocure.gov.in/eprocure/app?page=FrontEndAdvancedSearch&service=page";
}

export async function fetchGovTenders(): Promise<GovTender[]> {
  return apiGet<GovTender[]>("/gov-tenders");
}

export async function fetchGovTender(id: string): Promise<GovTender> {
  return apiGet<GovTender>(`/gov-tenders/${encodeURIComponent(id)}`);
}

export async function createGovTender(tender: Omit<GovTender, "id">): Promise<GovTender> {
  return apiPost<GovTender>("/gov-tenders", tender);
}

export async function updateGovTender(id: string, tender: Partial<GovTender>): Promise<void> {
  await apiPut(`/gov-tenders/${encodeURIComponent(id)}`, tender);
}

export async function deleteGovTender(id: string): Promise<void> {
  await apiDelete(`/gov-tenders/${encodeURIComponent(id)}`);
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: "me" | "them";
  time: string;
}

export interface Conversation {
  id: string;
  name: string;
  company: string;
  lastMessage: string;
  time: string;
  unread: number;
  avatar: string;
  messages: ChatMessage[];
}

interface RawConversation {
  id: string;
  name: string;
  company: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount?: number;
  avatar: string;
  messages: { id: string; text: string; sender: "me" | "them"; createdAt: string }[];
}

export async function fetchConversations(): Promise<Conversation[]> {
  const data = await apiGet<RawConversation[]>("/conversations");
  return data.map((conversation) => ({
    id: conversation.id,
    name: conversation.name,
    company: conversation.company,
    lastMessage: conversation.lastMessage || "",
    avatar: conversation.avatar,
    time: conversation.lastMessageAt
      ? new Date(conversation.lastMessageAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : "",
    unread: conversation.unreadCount || 0,
    messages: (conversation.messages || []).map((message) => ({
      id: message.id,
      text: message.text,
      sender: message.sender,
      time: new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    })),
  }));
}

export async function sendMessage(conversationId: string, text: string): Promise<ChatMessage> {
  const data = await apiPost<{ id: string; createdAt: string }>(
    `/conversations/${encodeURIComponent(conversationId)}/messages`,
    { text },
  );
  return {
    id: data.id,
    text,
    sender: "me",
    time: new Date(data.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };
}

export interface Notification {
  id: string;
  title: string;
  desc: string;
  time: string;
  read: boolean;
  link: string;
}

interface RawNotification {
  id: string;
  title: string;
  description?: string;
  desc?: string;
  createdAt: string;
  read: boolean;
  link: string;
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

export async function fetchNotifications(): Promise<Notification[]> {
  const rows = await apiGet<RawNotification[]>("/notifications");
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    desc: row.description || row.desc || "",
    time: relativeTime(row.createdAt),
    read: row.read,
    link: row.link,
  }));
}

export async function markNotificationRead(id: string): Promise<void> {
  await apiPatch(`/notifications/${encodeURIComponent(id)}/read`);
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiPatch("/notifications/read-all");
}

export interface Profile {
  companyName: string;
  industry: string;
  employees: number;
  location: string;
  capabilities: string[];
  certifications: string[];
  bio: string;
  pastProjects: { name: string; client: string; year: number }[];
}

export async function fetchProfile(): Promise<Profile> {
  return apiGet<Profile>("/profile");
}

export async function updateProfile(profile: Profile): Promise<void> {
  await apiPut("/profile", profile);
}
