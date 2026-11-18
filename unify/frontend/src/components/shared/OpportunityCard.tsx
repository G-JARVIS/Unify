import { MapPin, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Opportunity } from "@/data/types";
import { MatchScoreBar } from "./MatchScoreBar";

interface OpportunityCardProps { opportunity: Opportunity }

export function OpportunityCard({ opportunity }: OpportunityCardProps) {
  const navigate = useNavigate();

  const typeColors: Record<string, string> = {
    tender: "bg-primary/10 text-primary",
    contract: "bg-secondary/10 text-secondary",
    outsourcing: "bg-warning/10 text-warning",
    collaboration: "bg-success/10 text-success",
  };

  return (
    <div className="glass-card-hover rounded-xl p-5 flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <span className={`text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${typeColors[opportunity.type]}`}>
          {opportunity.type}
        </span>
      </div>

      <h3 className="font-semibold text-sm leading-snug mb-1">{opportunity.title}</h3>
      <p className="text-xs text-muted-foreground mb-3">{opportunity.postedBy}</p>

      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{opportunity.location}</span>
        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{opportunity.deadline}</span>
      </div>

      <div className="flex items-center justify-between text-xs mb-4">
        <span className="font-medium text-foreground">{opportunity.budgetRange}</span>
        <span className="text-muted-foreground">{opportunity.sector}</span>
      </div>

      {opportunity.matchScore > 0 && <MatchScoreBar score={opportunity.matchScore} />}

      <button
        onClick={() => {
          if (opportunity.type === "tender" && opportunity.sourceId) {
            navigate(`/government-tenders/${opportunity.sourceId}`);
          } else if (opportunity.type === "collaboration" && opportunity.sourceId) {
            navigate(`/collaborations/${opportunity.sourceId}`);
          } else if (opportunity.type === "outsourcing" && opportunity.sourceId) {
            navigate(`/supply-chain/${opportunity.sourceId}`);
          } else {
            navigate(`/opportunities/${opportunity.id}`);
          }
        }}
        className="mt-4 h-9 rounded-lg border border-border text-xs font-medium hover:bg-muted transition-colors"
      >
        {opportunity.type === "tender" ? "View tender & prepare" : "View Details"}
      </button>
    </div>
  );
}
