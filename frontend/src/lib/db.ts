import { supabase, isConfigured } from './supabase';
import {
  opportunities as dummyOpportunities,
  applications as dummyApplications,
  supplyChainRequests as dummySupplyChain,
  collaborations as dummyCollaborations,
  userProfile as dummyProfile,
} from '../data/dummy';
import type { Opportunity, Application, SupplyChainRequest, Collaboration } from '../data/dummy';

// ─── Opportunities ────────────────────────────────────────────────────────────

function mapOpportunity(row: Record<string, unknown>): Opportunity {
  return {
    id: row.id as string,
    title: row.title as string,
    sector: row.sector as string,
    location: row.location as string,
    budgetRange: row.budget_range as string,
    deadline: row.deadline as string,
    matchScore: row.match_score as number,
    type: row.type as Opportunity['type'],
    postedBy: row.posted_by as string,
    description: row.description as string,
    saved: (row.saved as boolean) ?? false,
  };
}

export async function fetchOpportunities(): Promise<Opportunity[]> {
  if (!isConfigured) return dummyOpportunities;
  const { data, error } = await supabase.from('opportunities').select('*').order('created_at', { ascending: false });
  if (error || !data?.length) return dummyOpportunities;
  return data.map(mapOpportunity);
}

export async function fetchOpportunity(id: string): Promise<Opportunity | null> {
  if (!isConfigured) return dummyOpportunities.find((o) => o.id === id) ?? null;
  const { data, error } = await supabase.from('opportunities').select('*').eq('id', id).single();
  if (error || !data) return dummyOpportunities.find((o) => o.id === id) ?? null;
  return mapOpportunity(data);
}

export async function toggleSaveOpportunity(id: string, saved: boolean): Promise<void> {
  if (!isConfigured) return;
  await supabase.from('opportunities').update({ saved }).eq('id', id);
}

// ─── Applications ─────────────────────────────────────────────────────────────

function mapApplication(row: Record<string, unknown>): Application {
  return {
    id: row.id as string,
    opportunityTitle: row.opportunity_title as string,
    status: row.status as Application['status'],
    appliedDate: row.applied_date as string,
    sector: row.sector as string,
    budget: row.budget as string,
  };
}

export async function fetchApplications(): Promise<Application[]> {
  if (!isConfigured) return dummyApplications;
  const { data, error } = await supabase.from('applications').select('*').order('created_at', { ascending: false });
  if (error || !data?.length) return dummyApplications;
  return data.map(mapApplication);
}

export async function createApplication(app: Omit<Application, 'id'>): Promise<void> {
  if (!isConfigured) return;
  await supabase.from('applications').insert({
    opportunity_title: app.opportunityTitle,
    status: app.status,
    applied_date: app.appliedDate,
    sector: app.sector,
    budget: app.budget,
  });
}

// ─── Supply Chain ─────────────────────────────────────────────────────────────

function mapSupplyChain(row: Record<string, unknown>): SupplyChainRequest {
  return {
    id: row.id as string,
    companyName: row.company_name as string,
    title: row.title as string,
    sector: row.sector as string,
    quantity: row.quantity as string,
    budget: row.budget as string,
    location: row.location as string,
    deadline: row.deadline as string,
    description: row.description as string,
  };
}

export async function fetchSupplyChain(): Promise<SupplyChainRequest[]> {
  if (!isConfigured) return dummySupplyChain;
  const { data, error } = await supabase.from('supply_chain_requests').select('*').order('created_at', { ascending: false });
  if (error || !data?.length) return dummySupplyChain;
  return data.map(mapSupplyChain);
}

export async function createSupplyChainRequest(req: Omit<SupplyChainRequest, 'id'>): Promise<void> {
  if (!isConfigured) return;
  await supabase.from('supply_chain_requests').insert({
    company_name: req.companyName,
    title: req.title,
    sector: req.sector,
    quantity: req.quantity,
    budget: req.budget,
    location: req.location,
    deadline: req.deadline,
    description: req.description,
  });
}

// ─── Collaborations ───────────────────────────────────────────────────────────

function mapCollaboration(row: Record<string, unknown>): Collaboration {
  return {
    id: row.id as string,
    companyName: row.company_name as string,
    projectTitle: row.project_title as string,
    requiredSkills: (row.required_skills as string[]) || [],
    budget: row.budget as string,
    sector: row.sector as string,
    partnersNeeded: row.partners_needed as number,
    description: row.description as string,
  };
}

export async function fetchCollaborations(): Promise<Collaboration[]> {
  if (!isConfigured) return dummyCollaborations;
  const { data, error } = await supabase.from('collaborations').select('*').order('created_at', { ascending: false });
  if (error || !data?.length) return dummyCollaborations;
  return data.map(mapCollaboration);
}

export async function createCollaboration(collab: Omit<Collaboration, 'id'>): Promise<void> {
  if (!isConfigured) return;
  await supabase.from('collaborations').insert({
    company_name: collab.companyName,
    project_title: collab.projectTitle,
    required_skills: collab.requiredSkills,
    budget: collab.budget,
    sector: collab.sector,
    partners_needed: collab.partnersNeeded,
    description: collab.description,
  });
}

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

let dummyGovContracts: GovContract[] = [
  { id: '1', title: 'National Highway Smart Tolling System', department: 'Ministry of Road Transport & Highways', location: 'Pan India', budget: '₹8.5 Cr', deadline: '2026-05-15', sector: 'IT & Infrastructure', verified: true, description: 'Design, develop and deploy smart tolling systems across 200+ toll plazas on national highways.', fullDescription: 'This project involves designing and implementing a comprehensive smart tolling system across national highways. The system should include RFID/ANPR technology for toll collection, real-time traffic monitoring, and integrated payment gateways. The scope includes infrastructure setup, software development, deployment, and 3-year maintenance support.', applyLink: '', status: 'active' },
  { id: '2', title: 'Digital Health Records Platform', department: 'Ministry of Health & Family Welfare', location: 'New Delhi', budget: '₹3.2 Cr', deadline: '2026-04-30', sector: 'Healthcare & IT', verified: true, description: 'Unified digital health records management system for government hospitals.', fullDescription: 'Development of a unified Electronic Health Records (EHR) system for integration across government hospitals. The platform should support patient data management, prescription tracking, laboratory results, imaging data, and interoperability with existing healthcare systems. Must comply with healthcare data security standards.', applyLink: '', status: 'active' },
  { id: '3', title: 'Agricultural Commodity Exchange Portal', department: 'Ministry of Agriculture', location: 'Multiple States', budget: '₹1.8 Cr', deadline: '2026-06-01', sector: 'Agriculture & Tech', verified: true, description: 'Online portal for agricultural commodity trading and price discovery.', fullDescription: 'Creation of a digital agricultural commodity exchange platform connecting farmers directly to buyers. Features should include real-time price discovery, transparent bidding, quality certification, logistics integration, and payment processing.', applyLink: '', status: 'active' },
  { id: '4', title: 'Smart Water Management System', department: 'Jal Shakti Ministry', location: 'Rajasthan', budget: '₹4.5 Cr', deadline: '2026-05-20', sector: 'Infrastructure', verified: true, description: 'IoT-based water distribution and quality monitoring for rural areas.', fullDescription: 'Implementation of an IoT-based water management and distribution system for rural municipalities. Includes smart meters, real-time water quality monitoring, leak detection, and automated distribution control.', applyLink: '', status: 'active' },
  { id: '5', title: 'Renewable Energy Grid Integration', department: 'Ministry of New & Renewable Energy', location: 'Gujarat & Tamil Nadu', budget: '₹12 Cr', deadline: '2026-07-01', sector: 'Energy', verified: false, description: 'Integration of solar and wind energy sources into the national power grid.', fullDescription: 'Develop and deploy a comprehensive renewable energy management system for integrating distributed solar and wind energy sources into the state power grids. Includes SCADA systems, forecasting algorithms, battery storage management, and grid stability enhancement.', applyLink: '', status: 'active' },
];

function mapGovContract(row: Record<string, unknown>): GovContract {
  return {
    id: row.id as string,
    title: row.title as string,
    department: row.department as string,
    location: row.location as string,
    budget: row.budget as string,
    deadline: row.deadline as string,
    sector: row.sector as string,
    verified: row.verified as boolean,
    description: row.description as string,
    fullDescription: row.full_description as string | undefined,
    applyLink: row.apply_link as string | undefined,
    status: (row.status as 'active' | 'closed') || 'active',
  };
}

export async function fetchGovContracts(): Promise<GovContract[]> {
  if (!isConfigured) return [...dummyGovContracts];
  const { data, error } = await supabase.from('government_contracts').select('*').order('created_at', { ascending: false });
  if (error || !data?.length) return [...dummyGovContracts];
  return data.map(mapGovContract);
}

export async function fetchGovContract(id: string): Promise<GovContract | null> {
  if (!isConfigured) return dummyGovContracts.find((c) => c.id === id) ?? null;
  const { data, error } = await supabase.from('government_contracts').select('*').eq('id', id).single();
  if (error || !data) return dummyGovContracts.find((c) => c.id === id) ?? null;
  return mapGovContract(data);
}

export async function createGovContract(contract: Omit<GovContract, 'id'>): Promise<GovContract> {
  if (!isConfigured) {
    const newC = { ...contract, id: Date.now().toString() };
    dummyGovContracts = [newC, ...dummyGovContracts];
    return newC;
  }
  const { data } = await supabase.from('government_contracts').insert({
    title: contract.title, department: contract.department, location: contract.location,
    budget: contract.budget, deadline: contract.deadline, sector: contract.sector,
    verified: contract.verified, description: contract.description,
    full_description: contract.fullDescription, apply_link: contract.applyLink, status: contract.status,
  }).select().single();
  return mapGovContract(data!);
}

export async function updateGovContract(id: string, contract: Partial<GovContract>): Promise<void> {
  if (!isConfigured) {
    dummyGovContracts = dummyGovContracts.map((c) => (c.id === id ? { ...c, ...contract } : c));
    return;
  }
  await supabase.from('government_contracts').update({
    title: contract.title, department: contract.department, location: contract.location,
    budget: contract.budget, deadline: contract.deadline, sector: contract.sector,
    verified: contract.verified, description: contract.description,
    full_description: contract.fullDescription, apply_link: contract.applyLink, status: contract.status,
  }).eq('id', id);
}

export async function deleteGovContract(id: string): Promise<void> {
  if (!isConfigured) {
    dummyGovContracts = dummyGovContracts.filter((c) => c.id !== id);
    return;
  }
  await supabase.from('government_contracts').delete().eq('id', id);
}

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

let dummyGovTenders: GovTender[] = [
  { id: 't1', title: 'Smart City Infrastructure Development', department: 'Ministry of Innovation', location: 'Mumbai', budget: '₹4Cr - ₹16Cr', deadline: '2026-04-15', sector: 'IT & Infrastructure', verified: true, description: 'Design and implement IoT-based smart city solutions including traffic management and waste monitoring.', fullDescription: 'Comprehensive smart city infrastructure development including IoT sensors, data centers, and analytics platforms for traffic management, waste monitoring, and citizen services. The project spans multiple phases over 3 years.', applyLink: '', status: 'active' },
  { id: 't2', title: 'Healthcare Data Analytics Platform', department: 'National Health Authority', location: 'Bengaluru', budget: '₹2.4Cr - ₹8Cr', deadline: '2026-05-10', sector: 'Healthcare & IT', verified: true, description: 'Develop a comprehensive health data analytics and reporting platform.', fullDescription: 'Development of an advanced health data analytics platform integrating data from hospitals, clinics, and public health agencies. The system should provide real-time dashboards and predictive analytics for disease outbreaks.', applyLink: '', status: 'active' },
  { id: 't3', title: 'National Road Safety Management System', department: 'Ministry of Road Transport', location: 'New Delhi', budget: '₹6Cr - ₹18Cr', deadline: '2026-04-30', sector: 'Transportation & IT', verified: false, description: 'Implement an integrated road safety management system.', fullDescription: 'End-to-end road safety management system integrating CCTV, speed cameras, crash reporting, emergency response, and analytics. Must integrate with existing transport infrastructure.', applyLink: '', status: 'active' },
];

function mapGovTender(row: Record<string, unknown>): GovTender {
  return {
    id: row.id as string,
    title: row.title as string,
    department: row.department as string,
    location: row.location as string,
    budget: row.budget as string,
    deadline: row.deadline as string,
    sector: row.sector as string,
    verified: row.verified as boolean,
    description: row.description as string,
    fullDescription: row.full_description as string | undefined,
    applyLink: row.apply_link as string | undefined,
    status: (row.status as 'active' | 'closed') || 'active',
  };
}

export async function fetchGovTenders(): Promise<GovTender[]> {
  if (!isConfigured) return [...dummyGovTenders];
  const { data, error } = await supabase.from('government_tenders').select('*').order('created_at', { ascending: false });
  if (error || !data?.length) return [...dummyGovTenders];
  return data.map(mapGovTender);
}

export async function fetchGovTender(id: string): Promise<GovTender | null> {
  if (!isConfigured) return dummyGovTenders.find((t) => t.id === id) ?? null;
  const { data, error } = await supabase.from('government_tenders').select('*').eq('id', id).single();
  if (error || !data) return dummyGovTenders.find((t) => t.id === id) ?? null;
  return mapGovTender(data);
}

export async function createGovTender(tender: Omit<GovTender, 'id'>): Promise<GovTender> {
  if (!isConfigured) {
    const newT = { ...tender, id: 't' + Date.now().toString() };
    dummyGovTenders = [newT, ...dummyGovTenders];
    return newT;
  }
  const { data } = await supabase.from('government_tenders').insert({
    title: tender.title, department: tender.department, location: tender.location,
    budget: tender.budget, deadline: tender.deadline, sector: tender.sector,
    verified: tender.verified, description: tender.description,
    full_description: tender.fullDescription, apply_link: tender.applyLink, status: tender.status,
  }).select().single();
  return mapGovTender(data!);
}

export async function updateGovTender(id: string, tender: Partial<GovTender>): Promise<void> {
  if (!isConfigured) {
    dummyGovTenders = dummyGovTenders.map((t) => (t.id === id ? { ...t, ...tender } : t));
    return;
  }
  await supabase.from('government_tenders').update({
    title: tender.title, department: tender.department, location: tender.location,
    budget: tender.budget, deadline: tender.deadline, sector: tender.sector,
    verified: tender.verified, description: tender.description,
    full_description: tender.fullDescription, apply_link: tender.applyLink, status: tender.status,
  }).eq('id', id);
}

export async function deleteGovTender(id: string): Promise<void> {
  if (!isConfigured) {
    dummyGovTenders = dummyGovTenders.filter((t) => t.id !== id);
    return;
  }
  await supabase.from('government_tenders').delete().eq('id', id);
}

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

export const dummyConversations: Conversation[] = [
  {
    id: '1', name: 'eshheet raka', company: 'BuildTech Industries', lastMessage: 'Can we discuss the supply chain proposal?', time: '2m ago', unread: 2, avatar: 'ER',
    messages: [
      { id: '1', text: 'Hi! We saw your profile on UNIFY and were impressed by your capabilities.', sender: 'them', time: '10:30 AM' },
      { id: '2', text: "Thank you, eshheet! We'd love to collaborate. What's the project scope?", sender: 'me', time: '10:32 AM' },
      { id: '3', text: 'We need IT infrastructure support for our new construction project. Budget is around ₹50L.', sender: 'them', time: '10:35 AM' },
      { id: '4', text: 'Can we discuss the supply chain proposal?', sender: 'them', time: '10:40 AM' },
    ],
  },
  {
    id: '2', name: 'gandharva ugale', company: 'AgriTech Corp', lastMessage: 'The collaboration agreement looks good!', time: '1h ago', unread: 0, avatar: 'GU',
    messages: [
      { id: '1', text: 'Hi, I wanted to follow up on the agricultural digitization project.', sender: 'me', time: '9:00 AM' },
      { id: '2', text: "Sure! We've reviewed your proposal and it looks promising.", sender: 'them', time: '9:15 AM' },
      { id: '3', text: 'The collaboration agreement looks good!', sender: 'them', time: '9:20 AM' },
    ],
  },
  {
    id: '3', name: 'farhaan khan', company: 'SolarPlus Ltd', lastMessage: 'When can we schedule a call?', time: '3h ago', unread: 1, avatar: 'FK',
    messages: [
      { id: '1', text: "We're interested in your IoT solutions for our solar farms.", sender: 'them', time: 'Yesterday' },
      { id: '2', text: 'That sounds great! We have extensive experience in that area.', sender: 'me', time: 'Yesterday' },
      { id: '3', text: 'When can we schedule a call?', sender: 'them', time: 'Today' },
    ],
  },
];

export async function fetchConversations(): Promise<Conversation[]> {
  if (!isConfigured) return dummyConversations;
  const { data: convs, error } = await supabase.from('conversations').select('*').order('last_message_at', { ascending: false });
  if (error || !convs?.length) return dummyConversations;

  const result: Conversation[] = [];
  for (const conv of convs) {
    const { data: msgs } = await supabase.from('messages').select('*').eq('conversation_id', conv.id).order('created_at', { ascending: true });
    result.push({
      id: conv.id as string, name: conv.name as string, company: conv.company as string,
      lastMessage: (conv.last_message as string) || '', avatar: conv.avatar as string,
      time: conv.last_message_at ? new Date(conv.last_message_at as string).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
      unread: (conv.unread_count as number) || 0,
      messages: (msgs || []).map((m) => ({
        id: m.id as string, text: m.text as string, sender: m.sender as 'me' | 'them',
        time: new Date(m.created_at as string).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      })),
    });
  }
  return result;
}

export async function sendMessage(conversationId: string, text: string): Promise<ChatMessage> {
  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (!isConfigured) return { id: Date.now().toString(), text, sender: 'me', time: timeStr };
  const { data } = await supabase.from('messages').insert({ conversation_id: conversationId, text, sender: 'me' }).select().single();
  await supabase.from('conversations').update({ last_message: text, last_message_at: new Date().toISOString(), unread_count: 0 }).eq('id', conversationId);
  return { id: (data?.id as string) || Date.now().toString(), text, sender: 'me', time: timeStr };
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

const dummyNotifications: Notification[] = [
  { id: '1', title: 'Application shortlisted', desc: 'Your application for Smart City Infrastructure has been shortlisted.', time: '2 hours ago', read: false, link: '/applications' },
  { id: '2', title: 'New supply chain request', desc: 'BuildTech Industries posted a new procurement requirement.', time: '5 hours ago', read: false, link: '/supply-chain' },
  { id: '3', title: 'AI Match Found', desc: 'A new 90% match opportunity in FinTech sector is available.', time: '1 day ago', read: true, link: '/ai-recommendations' },
  { id: '4', title: 'Collaboration invite', desc: 'InnovateTech Solutions invited you to join a consortium.', time: '2 days ago', read: true, link: '/collaborations' },
];

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return 'Just now';
  if (h < 24) return `${h} hour${h > 1 ? 's' : ''} ago`;
  const d = Math.floor(h / 24);
  return `${d} day${d > 1 ? 's' : ''} ago`;
}

export async function fetchNotifications(): Promise<Notification[]> {
  if (!isConfigured) return dummyNotifications;
  const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
  if (error || !data?.length) return dummyNotifications;
  return data.map((row) => ({
    id: row.id as string, title: row.title as string, desc: row.description as string,
    time: relativeTime(row.created_at as string), read: row.read as boolean, link: row.link as string,
  }));
}

export async function markNotificationRead(id: string): Promise<void> {
  if (!isConfigured) return;
  await supabase.from('notifications').update({ read: true }).eq('id', id);
}

export async function markAllNotificationsRead(): Promise<void> {
  if (!isConfigured) return;
  await supabase.from('notifications').update({ read: true }).eq('read', false);
}

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
  if (!isConfigured) return dummyProfile;
  const { data, error } = await supabase.from('profile').select('*').eq('id', 1).single();
  if (error || !data) return dummyProfile;
  return {
    companyName: data.company_name as string, industry: data.industry as string,
    employees: data.employees as number, location: data.location as string,
    capabilities: (data.capabilities as string[]) || [], certifications: (data.certifications as string[]) || [],
    bio: data.bio as string, pastProjects: (data.past_projects as { name: string; client: string; year: number }[]) || [],
  };
}

export async function updateProfile(profile: Profile): Promise<void> {
  if (!isConfigured) return;
  await supabase.from('profile').upsert({
    id: 1, company_name: profile.companyName, industry: profile.industry,
    employees: profile.employees, location: profile.location,
    capabilities: profile.capabilities, certifications: profile.certifications,
    bio: profile.bio, past_projects: profile.pastProjects, updated_at: new Date().toISOString(),
  });
}
