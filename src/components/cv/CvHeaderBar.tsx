// src/components/cv/CvHeaderBar.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Briefcase, Sparkles, Mail, ChevronsUpDown } from "lucide-react";
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
  className,
}: {
  name?: string;
  headline?: string;
  location?: string;
  mode: Mode;
  setMode: (m: Mode) => void;
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

            {/* Right-aligned single primary action */}
            <div className="justify-self-end">
              <Button asChild className="h-9 px-4 text-sm">
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
              <div className="inline-flex rounded-full border bg-white/80 backdrop-blur dark:bg-neutral-900/70 shadow-sm">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setMode("experience")}
                  className={cn(
                    "h-9 rounded-full px-4 text-sm",
                    mode === "experience" ? "bg-black text-white dark:bg-white dark:text-black" : "bg-transparent"
                  )}
                  variant={mode === "experience" ? "default" : "ghost"}
                  aria-pressed={mode === "experience"}
                >
                  <Briefcase className="mr-2 h-4 w-4" />
                  Experience
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setMode("skills")}
                  className={cn(
                    "h-9 rounded-full px-4 text-sm",
                    mode === "skills" ? "bg-black text-white dark:bg-white dark:text-black" : "bg-transparent"
                  )}
                  variant={mode === "skills" ? "default" : "ghost"}
                  aria-pressed={mode === "skills"}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Skills
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
