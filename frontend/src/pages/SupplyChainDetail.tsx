import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Calendar, Building2, IndianRupee, Share2, ExternalLink, Package } from "lucide-react";
import { toast } from "sonner";

const supplyChainRequests = [
  { id: "1", companyName: "BuildTech Industries", title: "Steel Beams & Structural Components", sector: "Construction", quantity: "500 metric tons", budget: "₹6Cr", location: "Mumbai", deadline: "2026-04-30", description: "High-grade structural steel for commercial building projects.", fullDescription: "BuildTech Industries is seeking high-grade structural steel components for multiple commercial building projects across India. We require 500 metric tons of certified steel beams, columns, and structural components that meet Indian Standards (IS: 2062). The steel must undergo rigorous quality checks including tensile testing, hardness testing, and chemical composition analysis. Delivery should be completed by April 30, 2026. We prefer suppliers with proven track record in supplying to major construction companies and government projects." },
  { id: "2", companyName: "FreshFarm Co.", title: "Cold Storage Equipment", sector: "Agriculture", quantity: "25 units", budget: "₹1.6Cr", location: "Pune", deadline: "2026-05-15", description: "Industrial cold storage units for perishable goods.", fullDescription: "FreshFarm Co. is looking for industrial-grade cold storage equipment to establish a network of agricultural processing centers across Maharashtra and neighboring states. We need 25 complete cold storage units with specifications: Capacity 5000-10000 MT per unit, Temperature control -5°C to 5°C, Humidity control 90-95%, Backup power system with 72-hour battery backup. Installation and training included. Preferred brands with service centers in western India. Timeline for complete installation is May 15, 2026." },
  { id: "3", companyName: "TechVentures Ltd", title: "Server Infrastructure Setup", sector: "Technology", quantity: "Data center for 200 racks", budget: "₹9.6Cr", location: "Bengaluru", deadline: "2026-06-01", description: "Complete data center setup including servers, networking, and cooling.", fullDescription: "TechVentures Ltd is establishing a tier-3 data center facility in Bengaluru to support cloud services and enterprise hosting. Requirements include: 200 server racks with enterprise-grade servers (minimum 32-core processors), redundant networking switches (Tier-1 brands), advanced cooling systems (liquid cooling preferred), UPS with minimum 4 hours runtime, fire suppression systems, physical security infrastructure, and comprehensive monitoring systems. The vendor should also provide 24/7 technical support and SLA of 99.99% uptime. Full deployment by June 1, 2026." },
  { id: "4", companyName: "CleanEnergy Corp", title: "Solar Panel Manufacturing Materials", sector: "Energy", quantity: "10,000 panels worth", budget: "₹4Cr", location: "Gujarat", deadline: "2026-05-20", description: "Raw materials for solar panel manufacturing including silicon wafers.", fullDescription: "CleanEnergy Corp is a solar panel manufacturer seeking consistent supply of high-purity raw materials for manufacturing 10,000 solar panels annually. Materials needed: Polycrystalline silicon wafers (275-300 microns thickness), solar glass (4mm borosilicate), aluminum frames, junction boxes, bypass diodes, and interconnecting ribbons. All materials must comply with IEC 61215 standards and come with certification. Supplier must have capacity for quarterly bulk orders and maintain consistent quality. Preferred payment terms: 30-60 days post-delivery. Target completion by May 20, 2026." },
];

const SupplyChainDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const request = supplyChainRequests.find(r => r.id === id);

  if (!request) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold">Request not found</h1>
        <button onClick={() => navigate("/supply-chain")} className="mt-4 h-9 px-4 rounded-lg gradient-primary text-primary-foreground text-xs font-semibold hover:opacity-90">
          Back to Supply Chain
        </button>
      </div>
    );
  }

  const handleShare = () => {
    navigator.clipboard.writeText(`Check out this supply chain requirement: ${request.title}`);
    toast.success("Copied to clipboard!");
  };

  const handleSubmitProposal = () => {
    toast.success("Proposal submitted!", {
      description: `Your proposal for "${request.title}" has been sent to ${request.companyName}.`,
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      <button
        onClick={() => navigate("/supply-chain")}
        className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Supply Chain
      </button>

      <div className="space-y-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <h1 className="text-3xl font-bold tracking-tight">{request.title}</h1>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                {request.companyName}
              </p>
            </div>
            <button
              onClick={handleShare}
              className="h-9 w-9 rounded-lg border border-border hover:bg-muted transition-colors flex items-center justify-center"
              title="Share"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>

          <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-secondary/10 text-secondary inline-block w-fit">{request.sector}</span>
        </div>

        <div className="glass-card rounded-xl p-5 space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Budget</p>
              <p className="text-xl font-bold text-primary flex items-center gap-2">
                <IndianRupee className="h-5 w-5" />
                {request.budget.replace("₹", "")}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Deadline</p>
              <p className="text-lg font-bold flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                {request.deadline}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Location</p>
              <p className="text-sm font-semibold flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                {request.location}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Quantity Required</p>
              <p className="text-sm font-semibold flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                {request.quantity}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-6 space-y-4">
          <div>
            <h2 className="text-lg font-bold mb-3">Requirement Details</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{request.fullDescription}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSubmitProposal}
            className="flex-1 h-11 rounded-lg gradient-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity shadow-lg flex items-center justify-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Submit Proposal
          </button>
          <button
            onClick={() => navigate("/supply-chain")}
            className="flex-1 h-11 rounded-lg border-2 border-border text-sm font-semibold hover:bg-muted transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupplyChainDetail;
