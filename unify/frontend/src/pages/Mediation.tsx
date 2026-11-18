import { ShieldCheck } from "lucide-react";

const Mediation = () => (
  <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
    <div>
      <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
        <ShieldCheck className="h-6 w-6 text-primary" />
        Platform Mediation
      </h1>
      <p className="text-sm text-muted-foreground mt-1">
        Mediation cases and verification status are shown only when returned by a connected case-management service.
      </p>
    </div>
    <div className="glass-card rounded-xl p-6">
      <h2 className="text-sm font-semibold">No mediation case data is connected</h2>
      <p className="text-xs text-muted-foreground mt-2">
        No deal statuses, escrow progress, or verification outcomes are being displayed because this project does not currently provide a mediation-record API.
      </p>
    </div>
  </div>
);

export default Mediation;
