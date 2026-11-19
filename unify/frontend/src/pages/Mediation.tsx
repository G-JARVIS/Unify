import {
  CircleCheck,
  CircleDollarSign,
  Clock3,
  FileCheck2,
  ShieldCheck,
} from "lucide-react";

const mediationSteps = [
  {
    title: "Profile Verification",
    description:
      "Company registration, certifications, and financial standing are checked.",
    label: "Company checks",
    icon: FileCheck2,
    iconClass: "bg-success/10 text-success",
  },
  {
    title: "Application Review",
    description:
      "Applications are reviewed for eligibility and completeness before forwarding.",
    label: "Eligibility review",
    icon: CircleCheck,
    iconClass: "bg-success/10 text-success",
  },
  {
    title: "Deal Verification",
    description:
      "Deal terms, pricing, and deliverables are reviewed by UNIFY mediators.",
    label: "Terms review",
    icon: ShieldCheck,
    iconClass: "bg-primary/10 text-primary",
  },
  {
    title: "Escrow & Settlement",
    description:
      "Payment milestones can be settled after deliverables are verified and approved.",
    label: "Final stage",
    icon: Clock3,
    iconClass: "bg-muted text-muted-foreground",
  },
];

const Mediation = () => (
  <div className="mx-auto max-w-7xl space-y-6 animate-fade-in">
    <header>
      <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
        <ShieldCheck className="h-6 w-6 text-primary" />
        Platform Mediation
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        All deals on UNIFY can go through verification and mediation to help
        support trust and legitimacy.
      </p>
    </header>

    <section
      aria-labelledby="trust-heading"
      className="glass-card flex items-start gap-3 rounded-xl p-4"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <ShieldCheck className="h-4 w-4" />
      </span>
      <div>
        <h2 id="trust-heading" className="text-sm font-semibold">
          UNIFY Trust &amp; Mediation
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          UNIFY is designed to support transactions with company-profile
          verification, application review, deal-term checks, and secure
          settlement workflows.
        </p>
      </div>
    </section>

    <section aria-labelledby="process-heading">
      <h2 id="process-heading" className="mb-3 text-base font-semibold">
        Mediation Process
      </h2>
      <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {mediationSteps.map(({ title, description, label, icon: Icon, iconClass }, index) => (
          <li key={title} className="glass-card flex min-h-40 flex-col rounded-xl p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconClass}`}>
                <Icon className="h-4 w-4" />
              </span>
              <span className="text-[11px] font-medium text-muted-foreground">
                Step {index + 1}
              </span>
            </div>
            <h3 className="text-sm font-semibold">{title}</h3>
            <p className="mt-1.5 flex-1 text-xs leading-relaxed text-muted-foreground">
              {description}
            </p>
            <span className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-medium text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {label}
            </span>
          </li>
        ))}
      </ol>
    </section>

    <section aria-labelledby="deals-heading">
      <div className="mb-3 flex items-center gap-2">
        <h2 id="deals-heading" className="text-base font-semibold">
          Active Deals
        </h2>
        <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="glass-card rounded-xl px-5 py-8 text-center">
        <ShieldCheck className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
        <p className="text-sm font-medium">No active mediation cases</p>
        <p className="mx-auto mt-1 max-w-lg text-xs leading-relaxed text-muted-foreground">
          Live deal statuses, escrow progress, and settlement details will
          appear here when mediation records are connected.
        </p>
      </div>
    </section>
  </div>
);

export default Mediation;
