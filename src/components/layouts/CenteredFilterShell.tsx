"use client";

import * as React from "react";

/**
 * Three-column shell:
 * [left gutter (sidebar)] [centered content (48rem)] [right gutter]
 * Sidebar is sticky on md+ and hidden on mobile.
 */
export default function CenteredFilterShell({
  sidebar,
  children,
}: {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 md:px-6 lg:px-8">
      <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,48rem)_minmax(0,1fr)]">
        {/* Left gutter with right-aligned sidebar so it's further from the center */}
        <aside className="relative hidden md:block">
          <div className="sticky top-24 flex justify-end pr-2">
            {sidebar}
          </div>
        </aside>

        {/* Center column (reading lane) */}
        <div className="min-w-0">{children}</div>

        {/* Right gutter (reserved for future widgets) */}
        <div className="hidden md:block" />
      </div>
    </div>
  );
}
