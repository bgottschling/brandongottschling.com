"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Briefcase, Sparkles, FileDown, Mail, ChevronsUpDown, Loader2 } from "lucide-react";
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
  onDownloadPdf,
  onCopyEmail,
  pdfBusy = false,
  className,
}: {
  name?: string;
  headline?: string;
  location?: string;
  mode: Mode;
  setMode: (m: Mode) => void;
  onDownloadPdf?: () => Promise<void>;
  onCopyEmail: () => void;
  pdfBusy?: boolean;
  className?: string;
}) {
  const top = useHeaderOffset();
  const { collapsed, toggle, isMobile } = useSmartCollapse();
  const compact = isMobile && collapsed;

  return (
    <div className={cn("sticky z-30", className)} style={{ top }}>
      <div
        className={cn(
          "rounded-2xl border shadow-sm transition-colors",
          compact
            ? "border-white/20 bg-white/95 dark:bg-neutral-900/95"
            : "border-white/10 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:bg-neutral-900/70 dark:supports-[backdrop-filter]:bg-neutral-900/60"
        )}
      >
        <div className={cn("px-4 sm:px-5", compact ? "py-2" : "py-4 sm:py-5")}>
          {/* Top row: equal side columns with safe shrinking so text can wrap */}
          <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-3">
            {/* Identity (left) */}
            <button
              type="button"
              onClick={isMobile ? toggle : undefined}
              aria-label="Toggle header size"
              className="justify-self-start text-left select-none min-w-0 max-w-full"
            >
              <div className={cn("font-semibold leading-tight", compact ? "text-base" : "text-lg")}>
                {name}
              </div>
              {!compact && (
                <>
                  {headline && (
                    <div className="text-sm text-muted-foreground leading-snug whitespace-normal break-words">
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

            {/* Centered actions (middle) */}
            <div className={cn(compact ? "hidden md:flex" : "flex", "justify-self-center items-center gap-2")}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => void onDownloadPdf?.()}
                disabled={pdfBusy}
                aria-busy={pdfBusy}
                className="h-9 px-3 text-sm"
              >
                {pdfBusy ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Preparing…
                  </>
                ) : (
                  <>
                    <FileDown className="mr-2 h-4 w-4" /> Download PDF
                  </>
                )}
              </Button>
              <Button variant="outline" size="sm" onClick={onCopyEmail} className="h-9 px-3 text-sm">
                <Mail className="mr-2 h-4 w-4" /> Copy email
              </Button>
            </div>

            {/* Right side (empty) keeps the center perfectly centered */}
            <div aria-hidden />
          </div>

          {/* Segmented control */}
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
