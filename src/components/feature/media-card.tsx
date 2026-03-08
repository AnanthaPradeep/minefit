"use client";

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MediaCardProps {
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  metaLeft?: string;
  metaRight?: string;
  ctaLabel?: string;
  ctaTo?: string;
  onCta?: () => void;
  compact?: boolean;
  showImage?: boolean;
  className?: string;
}

function placeholderFromTitle(title: string) {
  const initials = title
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
  return initials || "MF";
}

export function MediaCard({
  title,
  subtitle,
  description,
  imageUrl,
  metaLeft,
  metaRight,
  ctaLabel,
  ctaTo,
  onCta,
  compact = false,
  showImage = true,
  className,
}: MediaCardProps) {
  const hasAction = Boolean(ctaLabel && (ctaTo || onCta));

  return (
    <Card className={cn("overflow-hidden p-0", className)}>
      {showImage ? (
        <div className={cn("relative w-full overflow-hidden", compact ? "h-28" : "h-40") }>
          {imageUrl ? (
            <img src={imageUrl} alt={title} className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-emerald-600/30 to-zinc-900 text-lg font-bold tracking-widest text-white">
              {placeholderFromTitle(title)}
            </div>
          )}
          <div className="absolute inset-0 bg-linear-to-t from-zinc-950/35 via-transparent to-transparent" />
        </div>
      ) : null}

      <div className={cn("space-y-3", compact ? "p-3" : "p-4")}>
        <div>
          <CardTitle className={cn(compact ? "text-base" : "text-xl")}>{title}</CardTitle>
          {subtitle ? <CardDescription className="mt-1">{subtitle}</CardDescription> : null}
        </div>

        {metaLeft || metaRight ? (
          <>
            <div className="border-t border-zinc-200/70 dark:border-zinc-800/80" />
            <div className="grid grid-cols-2 gap-2 text-xs text-zinc-500 dark:text-zinc-400">
              <p className="truncate">{metaLeft ?? "-"}</p>
              <p className="truncate text-right">{metaRight ?? "-"}</p>
            </div>
          </>
        ) : null}

        {description ? <p className="text-xs text-zinc-500 dark:text-zinc-400">{description}</p> : null}

        {hasAction ? (
          ctaTo ? (
            <Link to={ctaTo} className="block">
              <Button className="w-full">{ctaLabel}</Button>
            </Link>
          ) : (
            <Button className="w-full" onClick={onCta}>
              {ctaLabel}
            </Button>
          )
        ) : null}
      </div>
    </Card>
  );
}
