import { BadgeCheck, Car, ShieldCheck } from "lucide-react";

import { cn } from "@/lib/classnames";

const TRUST_ITEMS = [
  {
    icon: BadgeCheck,
    title: "Best price guaranteed",
    description: "Rent premium with the best price",
  },
  {
    icon: Car,
    title: "Distinctive fleet",
    description: "From compacts to luxury SUVs",
  },
  {
    icon: ShieldCheck,
    title: "Exceptional service",
    description: "Stress-free, trustworthy, no hidden costs",
  },
] as const;

export function TrustBadges({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "grid gap-6 border-t border-white/15 pt-8 sm:grid-cols-3",
        className,
      )}
    >
      {TRUST_ITEMS.map(({ icon: Icon, title, description }) => (
        <div key={title} className="flex gap-3 text-white">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-lime text-primary">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold">{title}</p>
            <p className="mt-1 text-sm text-white/70">{description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
