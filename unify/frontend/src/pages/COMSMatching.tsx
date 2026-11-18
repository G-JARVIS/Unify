import { useQuery } from "@tanstack/react-query";
import { ExternalLink, Handshake, RefreshCw, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { fetchCollaborations, fetchProfile } from "@/lib/db";

const COMSMatching = () => {
  const profileQuery = useQuery({ queryKey: ["profile"], queryFn: fetchProfile });
  const collaborationsQuery = useQuery({ queryKey: ["collaborations"], queryFn: fetchCollaborations });
  const profile = profileQuery.data;
  const companyName = profile?.companyName.trim().toLocaleLowerCase() || "";
  const profileTerms = new Set(
    [...(profile?.capabilities ?? []), ...(profile?.certifications ?? [])]
      .map((term) => term.trim().toLocaleLowerCase())
      .filter(Boolean),
  );
  const industry = profile?.industry.trim().toLocaleLowerCase() || "";

  const matches = (collaborationsQuery.data ?? [])
    .filter((collaboration) => collaboration.companyName.trim().toLocaleLowerCase() !== companyName)
    .map((collaboration) => {
      const requiredSkills = collaboration.requiredSkills ?? [];
      const matchedSkills = requiredSkills.filter((skill) => profileTerms.has(skill.trim().toLocaleLowerCase()));
      const sector = collaboration.sector.trim().toLocaleLowerCase();
      const sectorMatch = !!industry && !!sector &&
        (sector === industry || sector.includes(industry) || industry.includes(sector));
      const score = requiredSkills.length
        ? Math.round((matchedSkills.length / requiredSkills.length) * 80 + (sectorMatch ? 20 : 0))
        : sectorMatch ? 65 : 0;
      return { collaboration, matchedSkills, sectorMatch, score };
    })
    .filter((match) => match.score > 0)
    .sort((a, b) => b.score - a.score);

  const isLoading = profileQuery.isLoading || collaborationsQuery.isLoading;
  const hasError = profileQuery.isError || collaborationsQuery.isError;
  const hasProfileData = profileTerms.size > 0 || industry.length > 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      <header>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Target className="h-6 w-6 text-primary" />
          COMS Company Matching
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Find collaboration partners using your saved company capabilities, certifications, and industry.
        </p>
      </header>

      {isLoading && <p className="text-sm text-muted-foreground">Matching your company profile with collaboration opportunities…</p>}
      {profileQuery.isError && (
        <p role="alert" className="text-sm text-destructive">Could not load your company profile: {profileQuery.error.message}</p>
      )}
      {collaborationsQuery.isError && (
        <p role="alert" className="text-sm text-destructive">Could not load collaboration opportunities: {collaborationsQuery.error.message}</p>
      )}
      {!isLoading && !hasError && !hasProfileData && (
        <div className="glass-card rounded-xl p-5">
          <p className="text-sm font-medium">Complete your company profile to get matches.</p>
          <p className="text-xs text-muted-foreground mt-1">Add your industry, capabilities, or certifications so COMS can compare your company with collaboration requirements.</p>
          <Link to="/profile" className="inline-flex items-center gap-1 mt-3 text-xs font-medium text-primary hover:underline">
            Update profile <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      )}
      {!isLoading && !hasError && hasProfileData && matches.length === 0 && (
        <div className="glass-card rounded-xl p-5 text-sm text-muted-foreground">
          No collaboration opportunities match your current profile. Add capabilities or check again when new opportunities are posted.
        </div>
      )}

      {!isLoading && !hasError && matches.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {matches.map(({ collaboration, matchedSkills, sectorMatch, score }) => (
            <article key={collaboration.id} className="glass-card-hover rounded-xl p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">{collaboration.companyName} · {collaboration.sector}</p>
                  <h2 className="text-sm font-semibold mt-1">{collaboration.projectTitle}</h2>
                </div>
                <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                  {score}% match
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{collaboration.description || "No description provided."}</p>
              <div className="space-y-1.5 text-xs">
                {sectorMatch && <p className="text-muted-foreground">Industry match: <span className="text-foreground">{collaboration.sector}</span></p>}
                {matchedSkills.length > 0 && (
                  <p className="text-muted-foreground">Matching capabilities: <span className="text-foreground">{matchedSkills.join(", ")}</span></p>
                )}
              </div>
              <Link to={`/collaborations/${collaboration.id}`} className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                <Handshake className="h-3 w-3" /> View collaboration <ExternalLink className="h-3 w-3" />
              </Link>
            </article>
          ))}
        </div>
      )}

      <aside className="flex items-start gap-2 rounded-lg border border-border p-3 text-xs text-muted-foreground">
        <RefreshCw className="h-3.5 w-3.5 mt-0.5 shrink-0" />
        Match scores show overlap with live collaboration requirements; they are based on saved profile data and are not an AI-generated score.
      </aside>
    </div>
  );
};

export default COMSMatching;
