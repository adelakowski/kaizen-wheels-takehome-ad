"use client";

import { TrustBadges } from "@/components/search/TrustBadges";

export function SearchHero() {
  return (
    <section className="bg-hero text-white">
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-8 sm:px-6 lg:px-8 lg:pb-14 lg:pt-10">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold tracking-wide text-brand-lime">
            Kaizen Wheels
          </p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            Premium car rental at prices you&apos;ll love.
          </h1>
          <p className="mt-4 text-lg text-white/75">
            Drive first class. Pay economy. Select your dates and discover our
            fleet.
          </p>
        </div>

        <TrustBadges className="mt-10" />
      </div>
    </section>
  );
}
