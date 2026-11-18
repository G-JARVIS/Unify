import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { OpportunityCard } from "@/components/shared/OpportunityCard";
import { fetchOpportunities } from "@/lib/db";

const Opportunities = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedType, setSelectedType] = useState("all");
  const { data: opportunities = [], isLoading, isError, error } = useQuery({
    queryKey: ["opportunities"],
    queryFn: fetchOpportunities,
  });

  const filtered = opportunities.filter((opportunity) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = opportunity.title.toLowerCase().includes(query) || opportunity.sector.toLowerCase().includes(query);
    return matchesSearch && (selectedType === "all" || opportunity.type === selectedType);
  });
  const types = ["all", "tender", "contract", "outsourcing", "collaboration"];

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Opportunities</h1>
        <p className="text-sm text-muted-foreground mt-1">Browse opportunities returned by the connected data service.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search opportunities..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {types.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-2 rounded-lg text-xs font-medium capitalize ${selectedType === type ? "gradient-primary text-primary-foreground" : "bg-card border border-border hover:bg-muted"}`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Loading opportunities…</p>}
      {isError && <p role="alert" className="text-sm text-destructive">Could not load opportunities: {error.message}</p>}
      {!isLoading && !isError && (
        <>
          <p className="text-xs text-muted-foreground">Showing {filtered.length} result{filtered.length === 1 ? "" : "s"}.</p>
          {filtered.length === 0 ? (
            <div className="glass-card rounded-xl p-8 text-center text-sm text-muted-foreground">No opportunities match your search.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((opportunity) => <OpportunityCard key={opportunity.id} opportunity={opportunity} />)}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Opportunities;
