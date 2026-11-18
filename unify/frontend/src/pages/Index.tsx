import { useQuery } from "@tanstack/react-query";
import { Calendar, ExternalLink, FileText, Landmark, MapPin, IndianRupee } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { MetricCard } from "@/components/shared/MetricCard";
import { fetchGovContracts, fetchGovTenders, getGovTenderPortalUrl } from "@/lib/db";

const TENDER_PORTAL = "https://eprocure.gov.in/eprocure/app?page=FrontEndAdvancedSearch&service=page";
const AWARD_PORTAL = "https://eprocure.gov.in/eprocure/app?page=ResultOfTenders&service=page";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const tendersQuery = useQuery({ queryKey: ["gov-tenders"], queryFn: fetchGovTenders });
  const contractsQuery = useQuery({ queryKey: ["gov-contracts"], queryFn: fetchGovContracts });
  const activeTenders = (tendersQuery.data ?? []).filter((tender) => tender.status === "active");

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back, <span className="gradient-text">{user?.name || "UNIFY"}</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Tender notices and award records from the connected data service. Tender notices are not live-synced; verify them on eProcure.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button className="text-left" onClick={() => navigate("/government-tenders")}>
          <MetricCard
            title="Listed Government Tenders"
            value={tendersQuery.isLoading ? "…" : tendersQuery.isError ? "Unavailable" : activeTenders.length}
            description="Confirm live status on eProcure"
            icon={Landmark}
          />
        </button>
        <button className="text-left" onClick={() => navigate("/government-contracts")}>
          <MetricCard
            title="Government Award Records"
            value={contractsQuery.isLoading ? "…" : contractsQuery.isError ? "Unavailable" : contractsQuery.data.length}
            description="Published contract awards"
            icon={FileText}
          />
        </button>
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Government Tender Notices</h2>
            <p className="text-xs text-muted-foreground mt-1">Not live-synced. Verify current availability on the official portal.</p>
          </div>
          <a href={TENDER_PORTAL} target="_blank" rel="noreferrer" className="text-xs font-medium text-primary hover:underline">
            Official portal <ExternalLink className="inline h-3 w-3" />
          </a>
        </div>

        {tendersQuery.isLoading && <p className="text-sm text-muted-foreground">Loading tender notices…</p>}
        {tendersQuery.isError && <p role="alert" className="text-sm text-destructive">Could not load tenders: {tendersQuery.error.message}</p>}
        {!tendersQuery.isLoading && !tendersQuery.isError && activeTenders.length === 0 && (
          <p className="text-sm text-muted-foreground">The data service returned no active tender notices. Check the official portal for current listings.</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeTenders.slice(0, 6).map((tender) => (
            <article key={tender.id} className="glass-card rounded-xl p-5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">{tender.sector}</p>
              <h3 className="text-sm font-semibold mt-2">{tender.title}</h3>
              <p className="text-xs text-muted-foreground mt-2">Reference: {tender.referenceNumber || tender.department}</p>
              {!tender.verified && <p className="text-xs text-muted-foreground mt-1">Not live-verified</p>}
              <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Closes {new Date(tender.deadline).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {tender.location && !tender.location.toLowerCase().includes("see the official") ? tender.location : "Location in official notice"}
              </p>
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <IndianRupee className="h-3 w-3" /> {tender.budget && !tender.budget.toLowerCase().includes("not stated") ? tender.budget : "Value in official notice"}
              </p>
              <div className="mt-4 flex gap-3 text-xs">
                <button onClick={() => navigate(`/government-tenders/${tender.id}`)} className="font-medium text-primary hover:underline">
                  View details & prepare
                </button>
                <a href={getGovTenderPortalUrl(tender)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                  Official notice <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      {contractsQuery.isError && <p role="alert" className="text-sm text-destructive">Could not load award records: {contractsQuery.error.message}</p>}
      {!contractsQuery.isLoading && !contractsQuery.isError && contractsQuery.data.length === 0 && (
        <aside className="glass-card rounded-xl p-5">
          <h2 className="text-sm font-semibold">No published award records in the connected data source</h2>
          <p className="text-xs text-muted-foreground mt-2">Tender notices are not awarded contracts; we do not present them as awards.</p>
          <a href={AWARD_PORTAL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 mt-3 text-xs text-primary hover:underline">
            Check the official Bid Awards portal <ExternalLink className="h-3 w-3" />
          </a>
        </aside>
      )}
    </div>
  );
};

export default Dashboard;
