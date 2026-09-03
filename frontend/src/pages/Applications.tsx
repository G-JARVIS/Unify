import { useQuery, useQueryClient } from "@tanstack/react-query";
import { contracts } from "@/lib/api";
import type { ContractRead, ContractStatus } from "@/types/api";
import { Clock, CheckCircle, XCircle, Eye, AlertCircle, RefreshCw, ChevronDown } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const statusConfig: Record<ContractStatus, { icon: React.ElementType; color: string; bg: string }> = {
  UNDER_REVIEW: { icon: Clock, color: "text-warning", bg: "bg-warning/10" },
  VERIFIED: { icon: Eye, color: "text-info", bg: "bg-info/10" },
  ESCROW_PENDING: { icon: AlertCircle, color: "text-amber-400", bg: "bg-amber-400/10" },
  ACTIVE: { icon: AlertCircle, color: "text-primary", bg: "bg-primary/10" },
  COMPLETED: { icon: CheckCircle, color: "text-success", bg: "bg-success/10" },
  DISPUTED: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" },
};

function ApplicationRow({ app }: { app: ContractRead }) {
  const [expanded, setExpanded] = useState(false);
  const status = statusConfig[app.status];
  const StatusIcon = status.icon;
  const queryClient = useQueryClient();

  const toggleMilestone = async (milestoneId: string, current: boolean) => {
    try {
      await contracts.updateMilestone(milestoneId, !current);
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      toast.success("Milestone updated");
    } catch (err) {
      toast.error("Failed to update milestone");
    }
  };

  return (
    <>
      <tr
        onClick={() => setExpanded(!expanded)}
        className="border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer"
      >
        <td className="p-4 text-sm font-medium">Contract {app.id.slice(0,8)}</td>
        <td className="p-4 text-sm text-muted-foreground">{app.opportunity_id ? "Linked to Opportunity" : "Direct Application"}</td>
        <td className="p-4 text-sm text-muted-foreground">₹{app.agreed_amount.toLocaleString()}</td>
        <td className="p-4 text-sm text-muted-foreground">{app.milestones.length} milestones</td>
        <td className="p-4">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${status.bg} ${status.color}`}>
            <StatusIcon className="h-3 w-3" />
            {app.status.replace("_", " ")}
          </span>
        </td>
        <td className="p-4">
          <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </td>
      </tr>
      {expanded && app.milestones.length > 0 && (
        <tr className="bg-muted/20">
          <td colSpan={6} className="p-4">
            <div className="space-y-3">
              <h4 className="text-sm font-semibold mb-2">Milestones</h4>
              {app.milestones.map(m => (
                <div key={m.id} className="flex items-center justify-between bg-card p-3 rounded-lg border border-border/50">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{m.title}</span>
                    <span className="text-xs text-muted-foreground">Due: {m.due_date} • Payout: {m.payout_percentage}%</span>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleMilestone(m.id, m.is_completed); }}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium ${m.is_completed ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                  >
                    {m.is_completed ? "Completed" : "Mark Complete"}
                  </button>
                </div>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

const Applications = () => {
  const { data: applications = [], isLoading } = useQuery({
    queryKey: ["contracts"],
    queryFn: contracts.listContracts,
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Applications</h1>
        <p className="text-sm text-muted-foreground mt-1">Track the status of your submitted applications and contracts.</p>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-semibold text-muted-foreground p-4">ID</th>
                <th className="text-left text-xs font-semibold text-muted-foreground p-4">Origin</th>
                <th className="text-left text-xs font-semibold text-muted-foreground p-4">Budget</th>
                <th className="text-left text-xs font-semibold text-muted-foreground p-4">Scope</th>
                <th className="text-left text-xs font-semibold text-muted-foreground p-4">Status</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                  </td>
                </tr>
              ) : applications.map((app) => (
                <ApplicationRow key={app.id} app={app} />
              ))}
            </tbody>
          </table>
          {!isLoading && applications.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">No applications yet. Apply for opportunities to see them here.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Applications;
