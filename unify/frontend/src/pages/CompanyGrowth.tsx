import { useQuery } from "@tanstack/react-query";
import { Activity, BarChart3, Landmark } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { fetchGovContracts, fetchGovTenders } from "@/lib/db";

const CompanyGrowth = () => {
  const tendersQuery = useQuery({ queryKey: ["gov-tenders"], queryFn: fetchGovTenders });
  const contractsQuery = useQuery({ queryKey: ["gov-contracts"], queryFn: fetchGovContracts });
  const activeTenders = (tendersQuery.data ?? []).filter((tender) => tender.status === "active");
  const bySector = Object.entries(
    activeTenders.reduce<Record<string, number>>((counts, tender) => {
      counts[tender.sector] = (counts[tender.sector] ?? 0) + 1;
      return counts;
    }, {}),
  ).map(([name, notices]) => ({ name, notices }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Activity className="h-6 w-6 text-primary" />
          Business & Market Data
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Published tender and award records are shown below. Company revenue and growth figures are not connected and are not estimated.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="glass-card rounded-xl p-5">
          <p className="text-sm text-muted-foreground flex items-center gap-2"><Landmark className="h-4 w-4" /> Active government tenders</p>
          <p className="text-3xl font-bold mt-2">{tendersQuery.isLoading ? "…" : tendersQuery.isError ? "Unavailable" : activeTenders.length}</p>
        </div>
        <div className="glass-card rounded-xl p-5">
          <p className="text-sm text-muted-foreground flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Published government awards</p>
          <p className="text-3xl font-bold mt-2">{contractsQuery.isLoading ? "…" : contractsQuery.isError ? "Unavailable" : contractsQuery.data.length}</p>
        </div>
      </div>

      {tendersQuery.isError && <p role="alert" className="text-sm text-destructive">Could not load tender data: {tendersQuery.error.message}</p>}
      {contractsQuery.isError && <p role="alert" className="text-sm text-destructive">Could not load award data: {contractsQuery.error.message}</p>}
      {!tendersQuery.isLoading && !tendersQuery.isError && bySector.length > 0 && (
        <section className="glass-card rounded-xl p-5">
          <h2 className="text-sm font-semibold mb-4">Current tender notices by sector</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={bySector}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip />
              <Bar dataKey="notices" fill="hsl(221, 83%, 53%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>
      )}
      {!tendersQuery.isLoading && !tendersQuery.isError && activeTenders.length === 0 && (
        <p className="glass-card rounded-xl p-5 text-sm text-muted-foreground">No active tender records are available to summarize.</p>
      )}
    </div>
  );
};

export default CompanyGrowth;
