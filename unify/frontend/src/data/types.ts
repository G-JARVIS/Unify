export interface Opportunity {
  id: string;
  sourceId?: string;
  title: string;
  sector: string;
  location: string;
  budgetRange: string;
  deadline: string;
  matchScore: number;
  type: "tender" | "contract" | "outsourcing" | "collaboration";
  postedBy: string;
  description: string;
  saved?: boolean;
}

export interface SupplyChainRequest {
  id: string;
  companyName: string;
  title: string;
  sector: string;
  quantity: string;
  budget: string;
  location: string;
  deadline: string;
  description: string;
}

export interface Collaboration {
  id: string;
  companyName: string;
  projectTitle: string;
  requiredSkills: string[];
  budget: string;
  sector: string;
  partnersNeeded: number;
  description: string;
}

export interface Application {
  id: string;
  opportunityTitle: string;
  opportunityId?: string;
  opportunityType?: string;
  portalTenderId?: string;
  tenderReferenceNumber?: string;
  status: "pending" | "reviewed" | "shortlisted" | "rejected" | "accepted" | "withdrawn";
  appliedDate: string;
  sector: string;
  budget: string;
  company?: string;
  location?: string;
  description?: string;
  message?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  applicantCompanyName?: string;
  applicantIndustry?: string;
  applicantLocation?: string;
  applicantEmployees?: number;
  ownerId?: string;
  applicantId?: string;
  applicantName?: string;
  applicantCompany?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}
