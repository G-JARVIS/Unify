import { useQuery } from "@tanstack/react-query";
import { fetchApplications } from "@/lib/db";
import { Clock, CheckCircle, XCircle, Eye, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const statusConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  pending: { icon: Clock, color: "text-warning", bg: "bg-warning/10" },
  reviewed: { icon: Eye, color: "text-info", bg: "bg-info/10" },
  shortlisted: { icon: AlertCircle, color: "text-primary", bg: "bg-primary/10" },
  rejected: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" },
  accepted: { icon: CheckCircle, color: "text-success", bg: "bg-success/10" },
};

const Applications = () => {
  const navigate = useNavigate();

  const { data: applications = [] } = useQuery({
    queryKey: ["applications"],
    queryFn: fetchApplications,
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Applications</h1>
        <p className="text-sm text-muted-foreground mt-1">Track the status of your submitted applications.</p>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-semibold text-muted-foreground p-4">Opportunity</th>
                <th className="text-left text-xs font-semibold text-muted-foreground p-4">Sector</th>
                <th className="text-left text-xs font-semibold text-muted-foreground p-4">Budget</th>
                <th className="text-left text-xs font-semibold text-muted-foreground p-4">Applied</th>
                <th className="text-left text-xs font-semibold text-muted-foreground p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => {
                const status = statusConfig[app.status];
                const StatusIcon = status.icon;
                return (
                  <tr
                    key={app.id}
                    onClick={() => navigate(`/applications/${app.id}`)}
                    className="border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer"
                  >
                    <td className="p-4 text-sm font-medium">{app.opportunityTitle}</td>
                    <td className="p-4 text-sm text-muted-foreground">{app.sector}</td>
                    <td className="p-4 text-sm text-muted-foreground">{app.budget}</td>
                    <td className="p-4 text-sm text-muted-foreground">{app.appliedDate}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${status.bg} ${status.color}`}>
                        <StatusIcon className="h-3 w-3" />
                        {app.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {applications.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">No applications yet. Apply for opportunities to see them here.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Applications;
