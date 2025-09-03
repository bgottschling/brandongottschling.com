"use client";

import * as React from "react";

export default function FilterShell({
  sidebar,
  children,
}: {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
      <div className="grid gap-6 md:grid-cols-[260px_minmax(0,1fr)]">
        {/* Sidebar (desktop) */}
        <aside className="hidden md:block">
          <div className="sticky top-24">
            {sidebar}
          </div>
        </aside>
        {/* Main content column */}
        <div className="min-w-0">
          {children}
        </div>
      </div>
    </div>
  );
}
