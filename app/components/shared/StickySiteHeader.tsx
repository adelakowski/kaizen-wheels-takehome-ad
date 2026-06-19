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
      <div className="mx-auto w-full max-w-7xl px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
        <Link
          href="/"
          className="inline-block cursor-pointer transition-opacity hover:opacity-80"
        >
          <KaizenLogo variant="light" />
        </Link>
      </div>

      {searchSlot && (
        <div className="mx-auto w-full max-w-7xl px-4 pb-3 pt-1 sm:px-6 lg:px-8">
          {searchSlot}
        </div>
      )}
    </header>
  );
}
