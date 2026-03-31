import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Handshake, IndianRupee, Share2, ExternalLink, Building2 } from "lucide-react";
import { toast } from "sonner";

const collaborations = [
  { id: "1", companyName: "InnovateTech Solutions", projectTitle: "Pan-India Digital ID System", requiredSkills: ["Blockchain", "Mobile Dev", "Security"], budget: "₹16Cr", sector: "GovTech", partnersNeeded: 3, description: "Building a decentralized digital identity system for cross-state verification.", fullDescription: "InnovateTech Solutions is developing a comprehensive digital identity system that will enable seamless verification across all Indian states and union territories. The project involves creating a blockchain-based infrastructure that ensures privacy, security, and interoperability. We are looking for partners with expertise in blockchain technology, mobile application development, and cybersecurity. The system will support Aadhaar integration, biometric verification, and cross-border identity validation. This is a 24-month project with potential for international expansion." },
  { id: "2", companyName: "GreenBuild Consortium", projectTitle: "Sustainable Housing Initiative", requiredSkills: ["Architecture", "Green Energy", "Construction"], budget: "₹40Cr", sector: "Construction", partnersNeeded: 5, description: "Affordable and sustainable housing using local materials and renewable energy.", fullDescription: "GreenBuild Consortium is launching an ambitious sustainable housing initiative targeting affordable housing for middle-income families across urban and semi-urban areas. The project focuses on using locally sourced materials, renewable energy integration, and green building standards. We need partners with expertise in sustainable architecture, solar energy systems, and construction management. The initiative includes 5000 housing units across 10 cities, with each unit incorporating rainwater harvesting, solar panels, and energy-efficient designs. This is a 36-month project with significant social impact potential." },
  { id: "3", companyName: "HealthBridge AI", projectTitle: "Telemedicine Network Expansion", requiredSkills: ["Healthcare IT", "AI/ML", "Networking"], budget: "₹12Cr", sector: "Healthcare", partnersNeeded: 2, description: "Expanding telemedicine capabilities to rural clinics across India.", fullDescription: "HealthBridge AI is expanding its telemedicine network to connect rural healthcare facilities with urban medical experts. The project involves deploying AI-powered diagnostic tools, establishing secure communication networks, and creating a centralized patient management system. We are seeking partners with healthcare IT experience, machine learning expertise, and network infrastructure knowledge. The expansion will cover 500 rural clinics across 15 states, enabling real-time consultations, remote diagnostics, and emergency response coordination. This initiative aims to bridge the urban-rural healthcare divide." },
];

const CollaborationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const collaboration = collaborations.find(c => c.id === id);

  if (!collaboration) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold">Collaboration not found</h1>
        <button onClick={() => navigate("/collaborations")} className="mt-4 h-9 px-4 rounded-lg gradient-primary text-primary-foreground text-xs font-semibold hover:opacity-90">
          Back to Collaborations
        </button>
      </div>
    );
  }

  const handleShare = () => {
    navigator.clipboard.writeText(`Check out this collaboration opportunity: ${collaboration.projectTitle}`);
    toast.success("Copied to clipboard!");
  };

  const handleSendRequest = () => {
    toast.success("Collaboration request sent!", {
      description: `Your request to join "${collaboration.projectTitle}" has been sent to ${collaboration.companyName}.`,
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      <button
        onClick={() => navigate("/collaborations")}
        className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Collaborations
      </button>

      <div className="space-y-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <h1 className="text-3xl font-bold tracking-tight">{collaboration.projectTitle}</h1>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                {collaboration.companyName}
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

          <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-secondary/10 text-secondary inline-block w-fit">{collaboration.sector}</span>
        </div>

        <div className="glass-card rounded-xl p-5 space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Budget</p>
              <p className="text-xl font-bold text-primary flex items-center gap-2">
                <IndianRupee className="h-5 w-5" />
                {collaboration.budget.replace("₹", "")}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Partners Needed</p>
              <p className="text-lg font-bold flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                {collaboration.partnersNeeded} partners
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-6 space-y-4">
          <div>
            <h2 className="text-lg font-bold mb-3">Project Overview</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{collaboration.fullDescription}</p>
          </div>

          <div>
            <h3 className="text-sm font-bold mb-3">Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {collaboration.requiredSkills.map((skill) => (
                <span key={skill} className="text-xs font-medium px-3 py-1.5 rounded-full bg-primary/10 text-primary">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSendRequest}
            className="flex-1 h-11 rounded-lg gradient-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity shadow-lg flex items-center justify-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Send Request
          </button>
          <button
            onClick={() => navigate("/collaborations")}
            className="flex-1 h-11 rounded-lg border-2 border-border text-sm font-semibold hover:bg-muted transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CollaborationDetail;