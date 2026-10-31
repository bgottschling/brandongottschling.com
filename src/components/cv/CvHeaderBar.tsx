// src/components/cv/CvHeaderBar.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Briefcase, Sparkles, Mail, ChevronsUpDown, Download, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useHeaderOffset } from "@/hooks/useHeaderOffset";
import { useSmartCollapse } from "@/hooks/useSmartCollapse";

type Mode = "experience" | "skills";

export default function CvHeaderBar({
  name = "Brandon Gottschling",
  headline,
  location,
  mode,
  setMode,
  onDownload,
  downloading = false,
  className,
}: {
  name?: string;
  headline?: string;
  location?: string;
  mode: Mode;
  setMode: (m: Mode) => void;
  onDownload?: () => void;
  downloading?: boolean;
  className?: string;
}) {
  const top = useHeaderOffset();
  const { collapsed, toggle, isMobile } = useSmartCollapse();
  const compact = isMobile && collapsed;

  return (
    <div className={cn("sticky z-30", className)} style={{ top }}>
      <div className="rounded-2xl border shadow-sm bg-white/80 backdrop-blur dark:bg-neutral-900/70">
        <div className={cn("px-4 sm:px-5", compact ? "py-2" : "py-4 sm:py-5")}>
          {/* Top row: identity (left) + Contact (right) */}
          <div className="grid grid-cols-[1fr_auto] items-start gap-3">
            <button
              type="button"
              onClick={isMobile ? toggle : undefined}
              aria-label="Toggle header size"
              className="justify-self-start text-left select-none max-w-full"
            >
              <div className={cn("font-semibold leading-tight", compact ? "text-base" : "text-lg")}>
                {name}
              </div>
              {!compact && (
                <>
                  {headline && (
                    <div className="mt-0.5 text-sm text-muted-foreground whitespace-normal break-words leading-relaxed">
                      {headline}
                    </div>
                  )}
                  {location && <div className="mt-1 text-xs text-muted-foreground">{location}</div>}
                </>
              )}
              {isMobile && (
                <div className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground md:hidden">
                  <ChevronsUpDown className="h-3.5 w-3.5" />
                  {compact ? "Expand" : "Minimize"}
                </div>
              )}
            </button>

            {/* Right-aligned actions */}
            <div className="justify-self-end flex flex-col items-end gap-2 sm:flex-row sm:items-center">
              {onDownload && (
                <Button
                  type="button"
                  onClick={onDownload}
                  disabled={downloading}
                  aria-busy={downloading}
                  className="h-9 px-4 text-sm"
                >
                  {downloading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                  ) : (
                    <Download className="mr-2 h-4 w-4" aria-hidden />
                  )}
                  {downloading ? "Preparing…" : "Download CV"}
                </Button>
              )}
              <Button asChild variant="outline" className="h-9 px-4 text-sm">
                <Link href="/trust/contact" prefetch={false}>
                  <Mail className="mr-2 h-4 w-4" /> Contact
                </Link>
              </Button>
            </div>
          </div>

          {/* Segmented control (centered) */}
          <div
            className={cn(
              "overflow-hidden transition-[max-height,opacity] duration-200 ease-out md:max-h-none md:opacity-100",
              compact ? "max-h-0 opacity-0 md:opacity-100" : "max-h-[220px] opacity-100"
            )}
          >
            <div className="mt-3 md:mt-4 flex justify-center">
              {/* Plain buttons on purpose: the shared Button's ghost hover uses the
                  full-strength site accent, which read as a second "active" pill. */}
              <div
                role="group"
                aria-label="CV view"
                className="inline-flex items-center gap-1 rounded-full border bg-neutral-100/80 p-1 dark:bg-neutral-800/70"
              >
                {(
                  [
                    { key: "experience", label: "Experience", Icon: Briefcase },
                    { key: "skills", label: "Skills", Icon: Sparkles },
                  ] as const
                ).map(({ key, label, Icon }) => {
                  const active = mode === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setMode(key)}
                      aria-pressed={active}
                      className={cn(
                        "inline-flex h-8 items-center gap-2 rounded-full px-4 text-sm font-medium transition-colors",
                        "outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                        active
                          ? "bg-neutral-900 text-white shadow-sm dark:bg-white dark:text-neutral-900"
                          : "text-muted-foreground hover:bg-white/70 hover:text-foreground dark:hover:bg-neutral-700/60"
                      )}
                    >
                      <Icon className="h-4 w-4" aria-hidden />
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
