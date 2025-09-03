"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import SidebarCategoryGrid, { type GridOption } from "@/components/SidebarCategoryGrid";
import { Filter } from "lucide-react";

export default function MobileFilterSheet({
  title = "Filters",
  param = "bucket",
  options,
}: {
  title?: string;
  param?: string;
  options: GridOption[];
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="rounded-full">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[92vw] sm:w-[420px]">
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <SidebarCategoryGrid
              title={title}
              options={options}
              param={param}
              showAll
              onPicked={() => setOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
