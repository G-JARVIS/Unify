import { Landmark, Search, Filter } from "lucide-react";
import { useState } from "react";
import { opportunities } from "@/data/dummy";
import { OpportunityCard } from "@/components/shared/OpportunityCard";

const GovernmentTenders = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  
  // Filter for tenders only (government tenders)
  const tenders = opportunities.filter(opp => opp.type === "tender");
  
  // Further filter by search and sector
  const filteredTenders = tenders.filter(tender => {
    const matchesSearch = tender.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tender.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tender.postedBy.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSector = !selectedSector || tender.sector === selectedSector;
    return matchesSearch && matchesSector;
  });
  
  // Get unique sectors from tenders
  const sectors = Array.from(new Set(tenders.map(t => t.sector))).sort();

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Landmark className="h-6 w-6 text-primary" />
          Government Tenders
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Discover government tenders from various ministries and departments. All opportunities sourced from official government portals.</p>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search by title, ministry, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <button className="h-10 px-4 rounded-lg border border-border hover:bg-muted flex items-center gap-2 text-sm font-medium">
            <Filter className="h-4 w-4" /> Filters
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedSector(null)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              selectedSector === null 
                ? "gradient-primary text-primary-foreground" 
                : "border border-border hover:bg-muted"
            }`}
          >
            All Tenders ({tenders.length})
          </button>
          {sectors.map(sector => (
            <button
              key={sector}
              onClick={() => setSelectedSector(sector)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedSector === sector
                  ? "gradient-primary text-primary-foreground"
                  : "border border-border hover:bg-muted"
              }`}
            >
              {sector} ({tenders.filter(t => t.sector === sector).length})
            </button>
          ))}
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        Showing {filteredTenders.length} tender{filteredTenders.length !== 1 ? "s" : ""}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTenders.length > 0 ? (
          filteredTenders.map((tender) => (
            <OpportunityCard key={tender.id} opportunity={tender} />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <Landmark className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">No tenders found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GovernmentTenders;
