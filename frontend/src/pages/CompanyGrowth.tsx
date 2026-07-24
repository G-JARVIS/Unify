import { sectorData, trendData, fairnessData } from "@/data/dummy";
import { TrendingUp, BarChart3, Activity, Sparkles } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from "recharts";
import type { TooltipProps } from "recharts";

const companyGrowthData = [
  { month: "Oct", revenue: 12, projects: 3, clients: 8 },
  { month: "Nov", revenue: 15, projects: 4, clients: 10 },
  { month: "Dec", revenue: 14, projects: 3, clients: 11 },
  { month: "Jan", revenue: 19, projects: 5, clients: 14 },
  { month: "Feb", revenue: 23, projects: 6, clients: 16 },
  { month: "Mar", revenue: 28, projects: 7, clients: 19 },
];

function PremiumChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-border/60 bg-background/95 px-3 py-2 shadow-2xl backdrop-blur-xl">
      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <div className="mt-2 space-y-1.5">
        {payload.map((entry) => (
          <div key={entry.dataKey?.toString()} className="flex items-center justify-between gap-4 text-xs">
            <span className="flex items-center gap-2 text-muted-foreground">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color ?? "hsl(var(--primary))" }} />
              {entry.name ?? entry.dataKey}
            </span>
            <span className="font-medium text-foreground">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const CompanyGrowth = () => (
  <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
    <div>
      <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
        <TrendingUp className="h-6 w-6 text-primary" />
        Company Growth Analytics
      </h1>
      <p className="text-sm text-muted-foreground mt-1">Track your company's growth alongside sector trends.</p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="premium-card-hover p-5 text-center">
        <p className="text-sm text-muted-foreground font-medium">Revenue Growth</p>
        <p className="text-3xl font-bold mt-2 text-emerald-400">+42%</p>
        <p className="text-xs text-muted-foreground mt-1">vs last quarter</p>
      </div>
      <div className="premium-card-hover p-5 text-center">
        <p className="text-sm text-muted-foreground font-medium">Projects Won</p>
        <p className="text-3xl font-bold mt-2 text-primary">7</p>
        <p className="text-xs text-muted-foreground mt-1">This quarter</p>
      </div>
      <div className="premium-card-hover p-5 text-center">
        <p className="text-sm text-muted-foreground font-medium">Client Base</p>
        <p className="text-3xl font-bold mt-2 text-secondary">19</p>
        <p className="text-xs text-muted-foreground mt-1">Active clients</p>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="premium-card p-5">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Activity className="h-4 w-4 text-primary" />Company Revenue Trend (₹ Lakhs)</h3>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={companyGrowthData} margin={{ left: 8, right: 8 }}>
            <defs>
              <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" stroke="hsl(var(--border))" strokeOpacity={0.4} vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
            <Tooltip content={<PremiumChartTooltip />} cursor={{ stroke: "hsl(var(--primary) / 0.12)" }} />
            <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="url(#growthGradient)" strokeWidth={2.5} dot={false} name="Revenue" />
            <Line type="monotone" dataKey="projects" stroke="hsl(var(--secondary))" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} name="Projects" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="premium-card p-5">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" />Sector Growth Rates (%)</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={sectorData} layout="vertical" margin={{ left: 8, right: 8 }}>
            <defs>
              <linearGradient id="sectorGrowthGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.95} />
                <stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity={0.95} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" stroke="hsl(var(--border))" strokeOpacity={0.4} vertical={false} />
            <XAxis type="number" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={86} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
            <Tooltip content={<PremiumChartTooltip />} cursor={{ fill: "hsl(var(--primary) / 0.06)" }} />
            <Bar dataKey="growth" fill="url(#sectorGrowthGradient)" radius={[0, 10, 10, 0]} barSize={14} name="Growth %" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="premium-card p-5 lg:col-span-2">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" />Opportunity & Application Trends</h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={trendData} margin={{ left: 8, right: 8 }}>
            <defs>
              <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" stroke="hsl(var(--border))" strokeOpacity={0.4} vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
            <Tooltip content={<PremiumChartTooltip />} cursor={{ stroke: "hsl(var(--primary) / 0.12)" }} />
            <Area type="monotone" dataKey="opportunities" stroke="hsl(var(--primary))" fill="url(#trendGradient)" strokeWidth={2.5} dot={false} name="Opportunities" />
            <Line type="monotone" dataKey="applications" stroke="hsl(var(--secondary))" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} name="Applications" />
            <Line type="monotone" dataKey="matches" stroke="hsl(var(--success))" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} name="AI Matches" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>

    <div className="premium-card-hover p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">OCI</p>
          <h3 className="text-base font-semibold">Opportunity Concentration Index</h3>
          <p className="text-sm text-muted-foreground">Fairness signals for how opportunities are distributed across enterprise sizes and sectors.</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-background/70 px-4 py-3 text-right shadow-sm">
          <p className="text-3xl font-bold tracking-tight text-foreground">{fairnessData.marketFairnessScore}</p>
          <p className="text-xs text-muted-foreground">Fairness score</p>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-border/60 bg-background/60 p-3">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={fairnessData.monthlyFairness} margin={{ left: 8, right: 8 }}>
              <defs>
                <linearGradient id="fairnessGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--secondary))" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="hsl(var(--border))" strokeOpacity={0.35} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
              <Tooltip content={<PremiumChartTooltip />} cursor={{ fill: "hsl(var(--secondary) / 0.06)" }} />
              <Area type="monotone" dataKey="score" stroke="hsl(var(--secondary))" strokeWidth={2.5} fill="url(#fairnessGradient)" dot={false} name="Fairness score" />
              <Line type="monotone" dataKey="participation" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} name="MSME participation" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border/60 bg-background/60 p-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">MSME Participation</p>
              <p className="mt-2 text-2xl font-semibold">{fairnessData.msmeParticipationRate}%</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-background/60 p-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Top Company Share</p>
              <p className="mt-2 text-2xl font-semibold">{fairnessData.topCompanyShare}%</p>
            </div>
          </div>

          <div className="space-y-2">
            {fairnessData.distributionData.map((bucket) => (
              <div key={bucket.name} className="rounded-xl border border-border/60 bg-background/60 p-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">{bucket.name}</span>
                  <span className="text-muted-foreground">{bucket.share}%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-muted/70 overflow-hidden">
                  <div className="h-full rounded-full gradient-primary" style={{ width: `${bucket.share}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

  </div>
);

export default CompanyGrowth;