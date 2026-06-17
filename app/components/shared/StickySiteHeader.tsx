"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { KaizenLogo } from "@/components/shared/KaizenLogo";
import { cn } from "@/lib/classnames";

export interface StickySiteHeaderProps {
  searchSlot?: React.ReactNode;
}

export function StickySiteHeader({ searchSlot }: StickySiteHeaderProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 bg-header transition-shadow duration-200 motion-reduce:transition-none",
        scrolled && "shadow-lg ring-1 ring-border/60",
      )}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
        <Link
          href="/"
          className="cursor-pointer transition-opacity hover:opacity-80"
        >
          <KaizenLogo variant="light" />
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-foreground md:flex">
          <Link
            href="/"
            className="cursor-pointer transition-colors hover:text-primary"
          >
            Cars
          </Link>
          <span className="cursor-default text-muted-foreground">Support</span>
          <Link
            href="/"
            className="kaizen-cta hidden cursor-pointer rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground transition-colors hover:bg-primary/90 lg:inline-flex"
          >
            Get started
          </Link>
        </nav>
      </div>

      {searchSlot && (
        <div className="mx-auto w-full max-w-7xl px-4 pb-3 pt-1 sm:px-6 lg:px-8">
          {searchSlot}
        </div>
      )}
    </header>
  );
}
