import { KaizenLogo } from "@/components/shared/KaizenLogo";
import { cn } from "@/lib/classnames";

import { StickySiteHeader } from "./StickySiteHeader";

export interface AppShellProps {
  filterSlot?: React.ReactNode;
  /** Sticky booking bar below nav (SIXT-style float on scroll) */
  stickySearchSlot?: React.ReactNode;
  heroSlot?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function AppShell({
  filterSlot,
  stickySearchSlot,
  heroSlot,
  children,
  className,
}: AppShellProps) {
  return (
    <div className={cn("flex min-h-screen flex-col bg-background", className)}>
      <StickySiteHeader searchSlot={stickySearchSlot ?? filterSlot} />

      {heroSlot}

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>

      <footer className="bg-hero text-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 lg:flex-row lg:items-start lg:justify-between lg:px-8">
          <KaizenLogo variant="dark" />
          <div className="text-sm text-white/70">
            <p>© {new Date().getFullYear()} Kaizen Wheels</p>
            <p className="mt-1">Premium car rental · No hidden costs</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
