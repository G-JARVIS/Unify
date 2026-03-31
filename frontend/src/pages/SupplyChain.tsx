import { supplyChainRequests } from "@/data/dummy";
import { MapPin, Calendar, Building2, Plus, ExternalLink } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const SupplyChain = () => {
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  const handleSubmitProposal = (title: string) => {
    toast.success("Proposal submitted!", { description: `Your proposal for "${title}" has been sent.` });
  };

  const handlePostRequirement = () => {
    toast.success("Requirement posted!", { description: "Your supply chain requirement is now visible to MSMEs." });
    setShowForm(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Private Supply Chain Marketplace</h1>
          <p className="text-sm text-muted-foreground mt-1">Browse procurement needs and submit proposals.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="h-9 px-4 rounded-lg gradient-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <Plus className="h-3.5 w-3.5" />
          Post Requirement
        </button>
      </div>

      {showForm && (
        <div className="glass-card rounded-xl p-6 animate-scale-in">
          <h3 className="text-sm font-semibold mb-4">Upload New Requirement</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {["Requirement Title", "Industry Sector", "Budget Range", "Required Capacity", "Deadline"].map((label) => (
              <div key={label}>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{label}</label>
                <input className="w-full h-9 px-3 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            ))}
            <div className="md:col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Description</label>
              <textarea className="w-full h-20 px-3 py-2 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handlePostRequirement} className="h-9 px-4 rounded-lg gradient-primary text-primary-foreground text-xs font-semibold">Submit</button>
            <button onClick={() => setShowForm(false)} className="h-9 px-4 rounded-lg border border-border text-xs font-medium hover:bg-muted">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {supplyChainRequests.map((req) => (
          <div key={req.id} className="glass-card-hover rounded-xl p-5">
            <div className="flex items-start justify-between mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-secondary/10 text-secondary">{req.sector}</span>
              <span className="text-xs font-bold text-foreground">{req.budget}</span>
            </div>
            <h3 className="text-sm font-semibold mt-2">{req.title}</h3>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><Building2 className="h-3 w-3" />{req.companyName}</p>
            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{req.description}</p>
            <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{req.location}</span>
              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{req.deadline}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Qty: <span className="font-medium text-foreground">{req.quantity}</span></p>
            <div className="flex gap-2 mt-4">
              <button onClick={() => handleSubmitProposal(req.title)} className="flex-1 h-8 rounded-lg gradient-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity">Submit Proposal</button>
              <button onClick={() => navigate(`/supply-chain/${req.id}`)} className="flex-1 h-8 rounded-lg border border-border text-xs font-medium hover:bg-muted transition-colors flex items-center justify-center gap-1">
                <ExternalLink className="h-3 w-3" /> View Requirement
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SupplyChain;
