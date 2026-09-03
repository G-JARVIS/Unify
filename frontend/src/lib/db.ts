import {
  opportunities as dummyOpportunities,
  applications as dummyApplications,
  supplyChainRequests as dummySupplyChain,
  collaborations as dummyCollaborations,
  userProfile as dummyProfile,
} from '../data/dummy';
import type { Opportunity, Application, SupplyChainRequest, Collaboration } from '../data/dummy';

// ─── Opportunities ────────────────────────────────────────────────────────────

export async function fetchOpportunities(): Promise<Opportunity[]> {
  return dummyOpportunities;
}

export async function fetchOpportunity(id: string): Promise<Opportunity | null> {
  return dummyOpportunities.find((o) => o.id === id) ?? null;
}

export async function toggleSaveOpportunity(id: string, saved: boolean): Promise<void> {}

// ─── Applications ─────────────────────────────────────────────────────────────

export async function fetchApplications(): Promise<Application[]> {
  return dummyApplications;
}

export async function createApplication(app: Omit<Application, 'id'>): Promise<void> {}

// ─── Supply Chain ─────────────────────────────────────────────────────────────

export async function fetchSupplyChain(): Promise<SupplyChainRequest[]> {
  return dummySupplyChain;
}

export async function createSupplyChainRequest(req: Omit<SupplyChainRequest, 'id'>): Promise<void> {}

// ─── Collaborations ───────────────────────────────────────────────────────────

export async function fetchCollaborations(): Promise<Collaboration[]> {
  return dummyCollaborations;
}

export async function createCollaboration(collab: Omit<Collaboration, 'id'>): Promise<void> {}

// ─── Government Contracts ─────────────────────────────────────────────────────

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
  status: 'active' | 'closed';
}

let dummyGovContracts: GovContract[] = [];

export async function fetchGovContracts(): Promise<GovContract[]> {
  return dummyGovContracts;
}

export async function fetchGovContract(id: string): Promise<GovContract | null> {
  return null;
}

export async function createGovContract(contract: Omit<GovContract, 'id'>): Promise<GovContract> {
  return { ...contract, id: Date.now().toString() };
}

export async function updateGovContract(id: string, contract: Partial<GovContract>): Promise<void> {}

export async function deleteGovContract(id: string): Promise<void> {}

// ─── Government Tenders ───────────────────────────────────────────────────────

export interface GovTender {
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
  status: 'active' | 'closed';
}

let dummyGovTenders: GovTender[] = [];

export async function fetchGovTenders(): Promise<GovTender[]> {
  return dummyGovTenders;
}

export async function fetchGovTender(id: string): Promise<GovTender | null> {
  return null;
}

export async function createGovTender(tender: Omit<GovTender, 'id'>): Promise<GovTender> {
  return { ...tender, id: 't' + Date.now().toString() };
}

export async function updateGovTender(id: string, tender: Partial<GovTender>): Promise<void> {}

export async function deleteGovTender(id: string): Promise<void> {}

// ─── Messages ─────────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'me' | 'them';
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

export const dummyConversations: Conversation[] = [];

export async function fetchConversations(): Promise<Conversation[]> {
  return dummyConversations;
}

export async function sendMessage(conversationId: string, text: string): Promise<ChatMessage> {
  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return { id: Date.now().toString(), text, sender: 'me', time: timeStr };
}

// ─── Notifications ────────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  title: string;
  desc: string;
  time: string;
  read: boolean;
  link: string;
}

const dummyNotifications: Notification[] = [];

export async function fetchNotifications(): Promise<Notification[]> {
  return dummyNotifications;
}

export async function markNotificationRead(id: string): Promise<void> {}

export async function markAllNotificationsRead(): Promise<void> {}

// ─── Profile ──────────────────────────────────────────────────────────────────

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
  return dummyProfile;
}

export async function updateProfile(profile: Profile): Promise<void> {}
