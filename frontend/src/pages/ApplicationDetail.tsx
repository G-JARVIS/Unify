import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, CheckCircle, AlertCircle, Trophy, Calendar, IndianRupee, Building2, FileText, Target, Users } from "lucide-react";
import { toast } from "sonner";

const applications = [
  { id: "1", opportunityTitle: "Smart City Infrastructure Development", status: "shortlisted", appliedDate: "2026-03-10", sector: "IT & Infrastructure", budget: "₹4Cr - ₹16Cr", description: "Development of smart city infrastructure including IoT sensors, traffic management systems, and citizen engagement platforms.", progress: 75, nextStep: "Technical presentation scheduled for March 28, 2026", company: "SmartCity Corp", location: "Multiple Cities" },
  { id: "2", opportunityTitle: "Agricultural Supply Chain Digitization", status: "pending", appliedDate: "2026-03-12", sector: "Agriculture & Tech", budget: "₹1.6Cr - ₹6.5Cr", description: "Digital transformation of agricultural supply chains with blockchain tracking and automated logistics.", progress: 25, nextStep: "Initial screening in progress", company: "AgriChain Ltd", location: "Pan India" },
  { id: "3", opportunityTitle: "E-Commerce Logistics Integration", status: "reviewed", appliedDate: "2026-03-08", sector: "Logistics", budget: "₹80L - ₹3.2Cr", description: "Integration of e-commerce platforms with advanced logistics and delivery management systems.", progress: 50, nextStep: "Waiting for final decision", company: "LogiTech Solutions", location: "Mumbai" },
  { id: "4", opportunityTitle: "Water Treatment Plant Modernization", status: "rejected", appliedDate: "2026-02-28", sector: "Infrastructure", budget: "₹8Cr - ₹24Cr", description: "Modernization of water treatment facilities with advanced filtration and monitoring systems.", progress: 0, nextStep: "Application rejected", company: "WaterPure Inc", location: "Delhi" },
  { id: "5", opportunityTitle: "Mobile Banking Platform Development", status: "accepted", appliedDate: "2026-02-20", sector: "FinTech", budget: "₹2.4Cr - ₹7.2Cr", description: "Development of secure mobile banking platform with advanced security features and user-friendly interface.", progress: 100, nextStep: "Contract signing scheduled", company: "FinSecure Bank", location: "Bengaluru", contractValue: "₹4.8Cr", startDate: "2026-04-01", duration: "12 months" },
];

const ApplicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const application = applications.find(a => a.id === id);

  if (!application) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold">Application not found</h1>
        <button onClick={() => navigate("/applications")} className="mt-4 h-9 px-4 rounded-lg gradient-primary text-primary-foreground text-xs font-semibold hover:opacity-90">
          Back to Applications
        </button>
      </div>
    );
  }

  const getStatusConfig = (status: string) => {
    const configs = {
      pending: { icon: Clock, color: "text-warning", bg: "bg-warning/10", title: "Application Pending" },
      reviewed: { icon: AlertCircle, color: "text-info", bg: "bg-info/10", title: "Under Review" },
      shortlisted: { icon: Target, color: "text-primary", bg: "bg-primary/10", title: "Shortlisted!" },
      rejected: { icon: CheckCircle, color: "text-destructive", bg: "bg-destructive/10", title: "Application Rejected" },
      accepted: { icon: Trophy, color: "text-success", bg: "bg-success/10", title: "Congratulations!" },
    };
    return configs[status as keyof typeof configs] || configs.pending;
  };

  const statusConfig = getStatusConfig(application.status);

  const handleDownloadContract = () => {
    toast.success("Contract downloaded!", { description: "The contract document has been downloaded to your device." });
  };

  const handleScheduleMeeting = () => {
    toast.success("Meeting scheduled!", { description: "A meeting has been scheduled with the project team." });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      <button
        onClick={() => navigate("/applications")}
        className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Applications
      </button>

      <div className="space-y-4">
        {/* Status Header */}
        <div className={`glass-card rounded-xl p-6 ${statusConfig.bg}`}>
          <div className="flex items-center gap-3 mb-4">
            <statusConfig.icon className={`h-8 w-8 ${statusConfig.color}`} />
            <div>
              <h1 className="text-2xl font-bold">{statusConfig.title}</h1>
              <p className="text-sm text-muted-foreground">{application.opportunityTitle}</p>
            </div>
          </div>

          {application.status === "accepted" && (
            <div className="mt-4 p-4 bg-success/10 rounded-lg border border-success/20">
              <div className="flex items-center gap-2 text-success font-semibold mb-2">
                <Trophy className="h-5 w-5" />
                Congratulations! Your application has been accepted.
              </div>
              <p className="text-sm text-muted-foreground">
                You have successfully won this contract. Please review the project details below and prepare for the kickoff meeting.
              </p>
            </div>
          )}

          {application.status === "shortlisted" && (
            <div className="mt-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-center gap-2 text-primary font-semibold mb-2">
                <Target className="h-5 w-5" />
                You're in the final round!
              </div>
              <p className="text-sm text-muted-foreground">
                Congratulations on being shortlisted! Your proposal has impressed the evaluation committee.
              </p>
            </div>
          )}
        </div>

        {/* Progress Section */}
        {(application.status === "shortlisted" || application.status === "pending" || application.status === "reviewed") && (
          <div className="glass-card rounded-xl p-6">
            <h2 className="text-lg font-bold mb-4">Application Progress</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress</span>
                  <span>{application.progress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-500"
                    style={{ width: `${application.progress}%` }}
                  ></div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span><strong>Next Step:</strong> {application.nextStep}</span>
              </div>
            </div>
          </div>
        )}

        {/* Project Details */}
        <div className="glass-card rounded-xl p-6">
          <h2 className="text-lg font-bold mb-4">Project Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Project Title</p>
                <p className="text-sm font-semibold">{application.opportunityTitle}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Sector</p>
                <p className="text-sm font-semibold">{application.sector}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Budget Range</p>
                <p className="text-lg font-bold text-primary flex items-center gap-2">
                  <IndianRupee className="h-4 w-4" />
                  {application.budget.replace("₹", "")}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Applied Date</p>
                <p className="text-sm font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  {application.appliedDate}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Company</p>
                <p className="text-sm font-semibold flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" />
                  {application.company}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Location</p>
                <p className="text-sm font-semibold">{application.location}</p>
              </div>
              {application.status === "accepted" && (
                <>
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Contract Value</p>
                    <p className="text-lg font-bold text-success flex items-center gap-2">
                      <IndianRupee className="h-4 w-4" />
                      {application.contractValue}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Project Duration</p>
                    <p className="text-sm font-semibold">{application.duration}</p>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <h3 className="text-sm font-bold mb-3">Project Description</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{application.description}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {application.status === "accepted" && (
            <>
              <button
                onClick={handleDownloadContract}
                className="flex-1 h-11 rounded-lg gradient-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity shadow-lg flex items-center justify-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Download Contract
              </button>
              <button
                onClick={handleScheduleMeeting}
                className="flex-1 h-11 rounded-lg border-2 border-border text-sm font-semibold hover:bg-muted transition-colors flex items-center justify-center gap-2"
              >
                <Users className="h-4 w-4" />
                Schedule Kickoff Meeting
              </button>
            </>
          )}
          {application.status === "shortlisted" && (
            <>
              <button
                onClick={handleScheduleMeeting}
                className="flex-1 h-11 rounded-lg gradient-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity shadow-lg flex items-center justify-center gap-2"
              >
                <Users className="h-4 w-4" />
                Schedule Presentation
              </button>
              <button
                onClick={() => navigate("/applications")}
                className="flex-1 h-11 rounded-lg border-2 border-border text-sm font-semibold hover:bg-muted transition-colors"
              >
                Back to Applications
              </button>
            </>
          )}
          {(application.status === "pending" || application.status === "reviewed") && (
            <button
              onClick={() => navigate("/applications")}
              className="w-full h-11 rounded-lg border-2 border-border text-sm font-semibold hover:bg-muted transition-colors"
            >
              Back to Applications
            </button>
          )}
          {application.status === "rejected" && (
            <div className="w-full text-center py-4">
              <p className="text-sm text-muted-foreground">This application was not successful. You can apply for other opportunities.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetail;