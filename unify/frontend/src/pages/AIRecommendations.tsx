import { useQuery } from "@tanstack/react-query";
import { Brain, ExternalLink, Landmark } from "lucide-react";
import { fetchGovTenders, getGovTenderPortalUrl } from "@/lib/db";

const AIRecommendations = () => {
  const { data: tenders = [], isLoading, isError, error } = useQuery({
    queryKey: ["gov-tenders"],
    queryFn: fetchGovTenders,
  });
  const activeTenders = tenders.filter((tender) => tender.status === "active");

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          Tender Opportunities
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Tender notices from the connected data service. They are not live-synced; verify availability and deadlines on eProcure before applying.
        </p>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Loading tender notices…</p>}
      {isError && <p role="alert" className="text-sm text-destructive">Could not load tender notices: {error.message}</p>}
      {!isLoading && !isError && activeTenders.length === 0 && (
        <p className="text-sm text-muted-foreground">No active tender notices are available from the connected data service.</p>
      )}

      <div className="space-y-4">
        {activeTenders.map((tender) => (
          <article key={tender.id} className="glass-card-hover rounded-xl p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="flex-1 space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-muted/60 text-muted-foreground">{tender.sector}</span>
                <h2 className="text-sm font-semibold leading-snug">{tender.title}</h2>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Landmark className="h-3 w-3" /> Reference: {tender.referenceNumber || tender.department}
                </p>
                {!tender.verified && <p className="text-xs text-muted-foreground">Not live-verified</p>}
                <p className="text-xs text-muted-foreground">{tender.description}</p>
              </div>
              <a
                href={getGovTenderPortalUrl(tender)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-8 items-center justify-center gap-1 rounded-lg border border-border px-4 text-xs font-medium hover:bg-muted"
              >
                Official listing <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default AIRecommendations;
