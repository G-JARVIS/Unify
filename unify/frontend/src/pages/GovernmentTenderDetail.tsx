import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchGovTender, createApplication, getGovTenderPortalUrl } from "@/lib/db";
import { MapPin, Calendar, Building2, ArrowLeft, Share2, IndianRupee, ShieldCheck, CheckCircle2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { fetchProfile } from "@/lib/db";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const GovernmentTenderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [contactName, setContactName] = useState(user?.name ?? "");
  const [contactEmail, setContactEmail] = useState(user?.email ?? "");
  const [contactPhone, setContactPhone] = useState("");
  const [message, setMessage] = useState("");
  const { data: companyProfile } = useQuery({ queryKey: ["profile"], queryFn: fetchProfile });

  const { data: tender, isLoading } = useQuery({
    queryKey: ["gov-tender", id],
    queryFn: () => fetchGovTender(id!),
    enabled: !!id,
  });

  if (isLoading) return <div className="flex items-center justify-center py-20"><p className="text-sm text-muted-foreground">Loading...</p></div>;

  if (!tender) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <p className="text-lg font-semibold">Tender not found</p>
        <button onClick={() => navigate("/government-tenders")} className="mt-4 text-sm text-primary hover:underline">
          ← Back to Government Tenders
        </button>
      </div>
    );
  }

  const handleApply = async () => {
    if (!contactName.trim() || !contactEmail.trim()) {
      toast.error("Add your contact name and email to save this tender.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.trim())) {
      toast.error("Enter a valid contact email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createApplication({
        opportunityId: tender.id,
        opportunityTitle: tender.title,
        portalTenderId: tender.portalTenderId || "",
        tenderReferenceNumber: tender.referenceNumber || "",
        opportunityType: "gov-tender",
        status: "pending",
        appliedDate: new Date().toISOString().split("T")[0],
        sector: tender.sector,
        budget: tender.budget,
        company: tender.department,
        location: tender.location,
        description: tender.description,
        contactName: contactName.trim(),
        contactEmail: contactEmail.trim(),
        contactPhone: contactPhone.trim(),
        message: message.trim(),
        applicantCompanyName: companyProfile?.companyName || user?.company || "",
        applicantIndustry: companyProfile?.industry || "",
        applicantLocation: companyProfile?.location || "",
        applicantEmployees: companyProfile?.employees || 0,
      });

      await queryClient.invalidateQueries({ queryKey: ["applications"] });
      setShowSuccessModal(true);
    } catch (error) {
      toast.error("Could not save your tender details", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied!", { description: "Share this tender with others." });
  };

  const officialTenderUrl = getGovTenderPortalUrl(tender);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="glass-card rounded-xl p-6">
        <div className="flex items-start justify-between mb-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-primary/10 text-primary">
            {tender.sector}
          </span>
          <div className="flex gap-2">
            {tender.verified && (
              <span className="flex items-center gap-1 text-[11px] font-medium text-success px-2.5 py-1 rounded-full bg-success/10">
                <ShieldCheck className="h-3.5 w-3.5" /> Verified
              </span>
            )}
            <button onClick={handleShare} className="p-2 rounded-lg hover:bg-muted transition-colors" title="Share">
              <Share2 className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        <h1 className="text-3xl font-bold">{tender.title}</h1>
        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
          <Building2 className="h-3.5 w-3.5" /> {tender.department}
        </p>

        <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{tender.location && !tender.location.toLowerCase().includes("see the official") ? tender.location : "Location: see notice"}</span>
          <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />Closes {new Date(tender.deadline).toLocaleString("en-IN")}</span>
          <span className="flex items-center gap-1"><IndianRupee className="h-3.5 w-3.5" />{tender.budget && !tender.budget.toLowerCase().includes("not stated") ? tender.budget : "Value: see notice"}</span>
        </div>

        <p className="text-sm text-muted-foreground mt-4">{tender.description}</p>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-2">Prepare your bid details</h2>
        <p className="text-xs text-muted-foreground mb-4">
          Confirm the tender and company details, then save your application in UNIFY. This does not submit a bid to the government; official bidding must still be completed on eProcure.
        </p>
        <p className="text-xs text-muted-foreground mb-4">
          The eProcure Tender ID and Tender Reference Number are different fields. Use the reference number or title in Advanced Search; the current listing does not provide an official Tender ID unless one is shown below. eProcure may require CAPTCHA verification.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          {tender.fullDescription || tender.description}
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-xs font-medium text-muted-foreground">
            Tender ID
            <input value={tender.portalTenderId || "Not available in current listing"} readOnly className="mt-1 h-10 w-full rounded-lg border border-border bg-muted px-3 text-sm text-foreground" />
          </label>
          <label className="text-xs font-medium text-muted-foreground">
            Tender reference number
            <input value={tender.referenceNumber || "Not available in current listing"} readOnly className="mt-1 h-10 w-full rounded-lg border border-border bg-muted px-3 text-sm text-foreground" />
          </label>
          <label className="text-xs font-medium text-muted-foreground sm:col-span-2">
            Tender title
            <input value={tender.title} readOnly className="mt-1 h-10 w-full rounded-lg border border-border bg-muted px-3 text-sm text-foreground" />
          </label>
          <label className="text-xs font-medium text-muted-foreground">
            Company
            <input value={companyProfile?.companyName || user?.company || ""} readOnly className="mt-1 h-10 w-full rounded-lg border border-border bg-muted px-3 text-sm text-foreground" />
          </label>
          <label className="text-xs font-medium text-muted-foreground">
            Industry
            <input value={companyProfile?.industry || ""} readOnly className="mt-1 h-10 w-full rounded-lg border border-border bg-muted px-3 text-sm text-foreground" />
          </label>
          <label className="text-xs font-medium text-muted-foreground">
            Company location
            <input value={companyProfile?.location || ""} readOnly className="mt-1 h-10 w-full rounded-lg border border-border bg-muted px-3 text-sm text-foreground" />
          </label>
          <label className="text-xs font-medium text-muted-foreground">
            Employees
            <input value={companyProfile?.employees || ""} readOnly className="mt-1 h-10 w-full rounded-lg border border-border bg-muted px-3 text-sm text-foreground" />
          </label>
          <label className="text-xs font-medium text-muted-foreground">
            Contact person *
            <input value={contactName} onChange={(event) => setContactName(event.target.value)} autoComplete="name" className="mt-1 h-10 w-full rounded-lg border border-border bg-muted/40 px-3 text-sm text-foreground" />
          </label>
          <label className="text-xs font-medium text-muted-foreground">
            Contact email *
            <input type="email" value={contactEmail} onChange={(event) => setContactEmail(event.target.value)} autoComplete="email" className="mt-1 h-10 w-full rounded-lg border border-border bg-muted/40 px-3 text-sm text-foreground" />
          </label>
          <label className="text-xs font-medium text-muted-foreground">
            Phone (optional)
            <input type="tel" value={contactPhone} onChange={(event) => setContactPhone(event.target.value)} autoComplete="tel" className="mt-1 h-10 w-full rounded-lg border border-border bg-muted/40 px-3 text-sm text-foreground" />
          </label>
          <label className="text-xs font-medium text-muted-foreground sm:col-span-2">
            Note for your application tracker (optional)
            <textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={3} className="mt-1 w-full resize-y rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-foreground" placeholder="Add a note or question about this tender…" />
          </label>
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <button
            onClick={handleApply}
            disabled={isSubmitting}
            className="h-10 flex-1 rounded-lg gradient-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {isSubmitting ? "Submitting…" : "Submit application to UNIFY"}
          </button>
          <a
            href={officialTenderUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-border font-semibold hover:bg-muted transition-colors"
          >
            Open official eProcure <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>

      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader className="flex flex-col items-center justify-center text-center">
            <div className="h-12 w-12 rounded-full bg-success/20 text-success flex items-center justify-center mb-3">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <DialogTitle className="text-xl font-bold">Saved to My Applications</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-2">
              Your contact details for <span className="font-semibold text-foreground">"{tender.title}"</span> are saved in UNIFY. To submit an official government bid, continue on eProcure and search by tender reference.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
            <a
              href={officialTenderUrl}
              target="_blank"
              rel="noreferrer"
              className="flex flex-1 items-center justify-center gap-1 rounded-lg gradient-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              Continue to eProcure <ExternalLink className="h-3 w-3" />
            </a>
            <button onClick={() => navigate("/applications")} className="flex-1 h-10 rounded-lg border border-border text-xs font-semibold hover:bg-muted transition-colors">
              Track in UNIFY
            </button>
            <button
              onClick={() => navigate("/government-tenders")}
              className="flex-1 h-10 rounded-lg border border-border text-xs font-semibold hover:bg-muted transition-colors"
            >
              Back to Tenders
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GovernmentTenderDetail;
