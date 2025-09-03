"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Props = {
  href: string;
  title: string;
  summary?: string;
  cover?: string;
  date?: string;
  tags?: string[];
  className?: string;
};

export default function FancyCard({ href, title, summary, cover, date, tags }: Props) {
  return (
    <Link href={href} className="group block no-underline">
      <Card className="overflow-hidden rounded-2xl border-white/15 bg-white/8 shadow-sm ring-1 ring-white/5 transition duration-300 hover:bg-white/12 hover:ring-white/10">
        {cover && (
          <div className="relative aspect-[16/9] overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cover}
              alt=""
              className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/55 to-transparent" />
          </div>
        )}
        <CardContent className="p-4">
          {/* Title: no default underline; only on hover for clarity */}
          <div className="line-clamp-2 text-base font-semibold leading-tight tracking-tight decoration-transparent underline-offset-4 group-hover:underline">
            {title}
          </div>
          {summary && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{summary}</p>}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {date && <span className="text-xs text-muted-foreground">{date.slice(0, 10)}</span>}
            {tags?.slice(0, 2).map((t) => (
              <Badge key={t} variant="secondary" className="rounded-full">
                {t}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
