"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Briefcase, Sparkles, FileDown, Printer, Download, Mail, ChevronsUpDown, Loader2 } from "lucide-react";
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
  onPrint,
  onDownloadVCard,
  onCopyEmail,
  pdfBusy = false,
  className,
}: {
  name?: string;
  headline?: string;
  location?: string;
  mode: Mode;
  setMode: (m: Mode) => void;
  onDownloadPdf: () => void;
  onPrint: () => void;
  onDownloadVCard: () => void;
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
          <div className="flex items-center justify-between gap-3">
            {/* Identity / tap to toggle on mobile */}
            <button
              type="button"
              onClick={isMobile ? toggle : undefined}
              className={cn("text-left min-w-[12rem] md:min-w-[22rem] md:max-w-[36rem] flex-1 select-none")}
              aria-label="Toggle header size"
            >
              <div className={cn("font-semibold leading-tight", compact ? "text-base" : "text-lg")}>
                {name}
              </div>
              {!compact && (
                <>
                  {headline && <div className="text-sm text-muted-foreground leading-snug">{headline}</div>}
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

            {/* Actions */}
            <div className={cn("flex flex-wrap items-center gap-2", compact ? "hidden md:flex" : "flex")}>
              <Button
                variant="outline"
                onClick={onDownloadPdf}
                disabled={pdfBusy}
                className="justify-center whitespace-nowrap"
                aria-busy={pdfBusy}
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
              <Button variant="outline" onClick={onPrint} className="justify-center whitespace-nowrap">
                <Printer className="mr-2 h-4 w-4" /> Print
              </Button>
              <Button variant="outline" onClick={onDownloadVCard} className="justify-center whitespace-nowrap">
                <Download className="mr-2 h-4 w-4" /> vCard
              </Button>
              <Button variant="outline" onClick={onCopyEmail} className="justify-center whitespace-nowrap">
                <Mail className="mr-2 h-4 w-4" /> Copy email
              </Button>
            </div>
          </div>

          {/* View toggle (no "View" label; hidden when compact on mobile) */}
          <div
            className={cn(
              "overflow-hidden transition-[max-height,opacity] duration-200 ease-out md:max-h-none md:opacity-100",
              compact ? "max-h-0 opacity-0 md:opacity-100" : "max-h-[220px] opacity-100"
            )}
          >
            <div className="mt-3 md:mt-4 grid grid-cols-[auto_auto] items-center gap-2">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={mode === "experience" ? "default" : "outline"}
                  className="justify-center"
                  onClick={() => setMode("experience")}
                >
                  <Briefcase className="mr-2 h-4 w-4" />
                  Experience
                </Button>
                <Button
                  variant={mode === "skills" ? "default" : "outline"}
                  className="justify-center"
                  onClick={() => setMode("skills")}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Skills
                </Button>
              </div>
              <div />
            </div>
          </div>
        </div>
        {/* (separator removed by request) */}
      </div>
    </div>
  );
}
