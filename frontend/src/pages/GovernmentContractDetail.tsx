import { useParams, useNavigate } from "react-router-dom";
import { MapPin, Calendar, Building2, ArrowLeft, Share2, IndianRupee, ShieldCheck, Clock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const govContracts = [
  { id: "1", title: "National Highway Smart Tolling System", department: "Ministry of Road Transport & Highways", location: "Pan India", budget: "₹8.5 Cr", deadline: "2026-05-15", sector: "IT & Infrastructure", verified: true, description: "Design, develop and deploy smart tolling systems across 200+ toll plazas on national highways.", fullDescription: "This project involves designing and implementing a comprehensive smart tolling system across national highways. The system should include RFID/ANPR technology for toll collection, real-time traffic monitoring, and integrated payment gateways. The scope includes infrastructure setup, software development, deployment, and 3-year maintenance support." },
  { id: "2", title: "Digital Health Records Platform", department: "Ministry of Health & Family Welfare", location: "New Delhi", budget: "₹3.2 Cr", deadline: "2026-04-30", sector: "Healthcare & IT", verified: true, description: "Unified digital health records management system for government hospitals.", fullDescription: "Development of a unified Electronic Health Records (EHR) system for integration across government hospitals. The platform should support patient data management, prescription tracking, laboratory results, imaging data, and interoperability with existing healthcare systems. Must comply with healthcare data security standards and HIPAA regulations." },
  { id: "3", title: "Agricultural Commodity Exchange Portal", department: "Ministry of Agriculture", location: "Multiple States", budget: "₹1.8 Cr", deadline: "2026-06-01", sector: "Agriculture & Tech", verified: true, description: "Online portal for agricultural commodity trading and price discovery.", fullDescription: "Creation of a digital agricultural commodity exchange platform connecting farmers directly to buyers. Features should include real-time price discovery, transparent bidding, quality certification, logistics integration, and payment processing. The portal should support multiple languages and work seamlessly on mobile and desktop platforms." },
  { id: "4", title: "Smart Water Management System", department: "Jal Shakti Ministry", location: "Rajasthan", budget: "₹4.5 Cr", deadline: "2026-05-20", sector: "Infrastructure", verified: true, description: "IoT-based water distribution and quality monitoring for rural areas.", fullDescription: "Implementation of an IoT-based water management and distribution system for rural municipalities. Includes smart meters, real-time water quality monitoring, leak detection, and automated distribution control. The system must be operable offline in remote areas and include a centralized monitoring dashboard for administrators." },
  { id: "5", title: "Renewable Energy Grid Integration", department: "Ministry of New & Renewable Energy", location: "Gujarat & Tamil Nadu", budget: "₹12 Cr", deadline: "2026-07-01", sector: "Energy", verified: false, description: "Integration of solar and wind energy sources into the national power grid.", fullDescription: "Develop and deploy a comprehensive renewable energy management system for integrating distributed solar and wind energy sources into the state power grids. Includes SCADA systems, forecasting algorithms, battery storage management, and grid stability enhancement. Must achieve 99.9% uptime and handle peak load balancing." },
];

const GovernmentContractDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const contract = govContracts.find((c) => c.id === id);
  const [applied, setApplied] = useState(false);

  if (!contract) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <p className="text-lg font-semibold">Contract not found</p>
        <button onClick={() => navigate("/government-contracts")} className="mt-4 text-sm text-primary hover:underline">
          ← Back to Government Contracts
        </button>
      </div>
    );
  }

  const handleApply = () => {
    setApplied(true);
    toast.success("Application submitted!", {
      description: `You applied for "${contract.title}". Track it in My Applications.`,
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied!", { description: "Share this contract with others." });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="glass-card rounded-xl p-6">
        <div className="flex items-start justify-between mb-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-primary/10 text-primary">
            {contract.sector}
          </span>
          <div className="flex gap-2">
            {contract.verified && (
              <span className="flex items-center gap-1 text-[11px] font-medium text-success px-2.5 py-1 rounded-full bg-success/10">
                <ShieldCheck className="h-3.5 w-3.5" /> Verified
              </span>
            )}
            <button onClick={handleShare} className="p-2 rounded-lg hover:bg-muted transition-colors" title="Share">
              <Share2 className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        <h1 className="text-3xl font-bold">{contract.title}</h1>
        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
          <Building2 className="h-3.5 w-3.5" /> {contract.department}
        </p>

        <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{contract.location}</span>
          <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{contract.deadline}</span>
          <span className="flex items-center gap-1"><IndianRupee className="h-3.5 w-3.5" />{contract.budget}</span>
        </div>

        <p className="text-sm text-muted-foreground mt-4">{contract.description}</p>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Project Overview</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">{contract.fullDescription}</p>

        <div className="flex gap-2">
          <button
            onClick={handleApply}
            disabled={applied}
            className="flex-1 h-10 rounded-lg gradient-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {applied ? "Application Submitted" : "Apply Now"}
          </button>
          <button onClick={() => navigate("/government-contracts")} className="flex-1 h-10 rounded-lg border border-border font-semibold hover:bg-muted transition-colors">
            Back to Contracts
          </button>
        </div>
      </div>
    </div>
  );
};

export default GovernmentContractDetail;
