import { Landmark, MapPin, Calendar, IndianRupee, ExternalLink, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const govContracts = [
  { id: "1", title: "National Highway Smart Tolling System", department: "Ministry of Road Transport & Highways", location: "Pan India", budget: "₹8.5 Cr", deadline: "2026-05-15", sector: "IT & Infrastructure", verified: true, description: "Design, develop and deploy smart tolling systems across 200+ toll plazas on national highways." },
  { id: "2", title: "Digital Health Records Platform", department: "Ministry of Health & Family Welfare", location: "New Delhi", budget: "₹3.2 Cr", deadline: "2026-04-30", sector: "Healthcare & IT", verified: true, description: "Unified digital health records management system for government hospitals." },
  { id: "3", title: "Agricultural Commodity Exchange Portal", department: "Ministry of Agriculture", location: "Multiple States", budget: "₹1.8 Cr", deadline: "2026-06-01", sector: "Agriculture & Tech", verified: true, description: "Online portal for agricultural commodity trading and price discovery." },
  { id: "4", title: "Smart Water Management System", department: "Jal Shakti Ministry", location: "Rajasthan", budget: "₹4.5 Cr", deadline: "2026-05-20", sector: "Infrastructure", verified: true, description: "IoT-based water distribution and quality monitoring for rural areas." },
  { id: "5", title: "Renewable Energy Grid Integration", department: "Ministry of New & Renewable Energy", location: "Gujarat & Tamil Nadu", budget: "₹12 Cr", deadline: "2026-07-01", sector: "Energy", verified: false, description: "Integration of solar and wind energy sources into the national power grid." },
];

const GovernmentContracts = () => {
  const navigate = useNavigate();

  const handleApply = (title: string) => {
    toast.success("Application initiated!", { description: `Your application for "${title}" has been started. Complete the submission in My Applications.` });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Landmark className="h-6 w-6 text-primary" />
          Government Contracts
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Verified government contracts available for MSMEs. Direct contracts from government agencies without competitive bidding.</p>
      </div>

      <div className="glass-card rounded-xl p-4 flex items-center gap-3">
        <ShieldCheck className="h-5 w-5 text-success flex-shrink-0" />
        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Verified Contracts:</span> All contracts marked with a verification badge have been authenticated by UNIFY through official government portals.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {govContracts.map((contract) => (
          <div key={contract.id} className="glass-card-hover rounded-xl p-5">
            <div className="flex items-start justify-between mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-primary/10 text-primary">{contract.sector}</span>
              {contract.verified && (
                <span className="flex items-center gap-1 text-[11px] font-medium text-success">
                  <ShieldCheck className="h-3.5 w-3.5" /> Verified
                </span>
              )}
            </div>
            <h3 className="text-sm font-semibold mt-2">{contract.title}</h3>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Landmark className="h-3 w-3" /> {contract.department}
            </p>
            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{contract.description}</p>
            <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{contract.location}</span>
              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{contract.deadline}</span>
            </div>
            <p className="text-sm font-bold mt-3 flex items-center gap-1"><IndianRupee className="h-3.5 w-3.5" />{contract.budget.replace("₹", "")}</p>
            <div className="flex gap-2 mt-4">
              <button onClick={() => handleApply(contract.title)} className="flex-1 h-8 rounded-lg gradient-primary text-primary-foreground text-xs font-semibold hover:opacity-90">Apply Now</button>
              <button onClick={() => navigate(`/government-contracts/${contract.id}`)} className="flex-1 h-8 rounded-lg border border-border text-xs font-medium hover:bg-muted transition-colors flex items-center justify-center gap-1">
                <ExternalLink className="h-3 w-3" /> View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GovernmentContracts;
