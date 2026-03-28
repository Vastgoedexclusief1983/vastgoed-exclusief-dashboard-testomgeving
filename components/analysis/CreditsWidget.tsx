'use client';

import { useEffect, useMemo, useState } from 'react';
import AiCreditsInfo from '@/components/analysis/AiCreditsInfo';

type CreditsStatus = {
  used: number;
  limit: number;
  remaining: number;
  month?: string;
};

export function CreditsWidget() {
  const [data, setData] = useState<CreditsStatus | null>(null);

  const pctUsed = useMemo(() => {
    if (!data?.limit) return 0;
    return Math.min(100, Math.max(0, Math.round((data.used / data.limit) * 100)));
  }, [data]);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        const res = await fetch('/api/ai/credits', { cache: 'no-store' });
        if (!res.ok) return;
        const json = (await res.json()) as CreditsStatus;
        if (alive) setData(json);
      } catch {
        // ignore
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

  // Skeleton (luxer, geen rare dubbele balk)
  if (!data) {
    return (
      <div className="hidden md:flex items-center gap-3 rounded-2xl border bg-white/60 px-4 py-2 shadow-sm backdrop-blur">
        <div className="min-w-[220px]">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>AI-credits</span>
            <span className="font-medium tabular-nums">—</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted" />
        </div>
      </div>
    );
  }

  return (
    <div className="hidden md:flex items-center gap-3 rounded-2xl border bg-white/60 px-4 py-2 shadow-sm backdrop-blur">
      <div className="min-w-[220px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span className="tracking-wide">AI-credits</span>
            <AiCreditsInfo iconOnly remaining={data.remaining} limit={data.limit} />
          </div>

          <span className="text-[11px] font-medium tabular-nums text-foreground">
            {data.remaining}/{data.limit}
          </span>
        </div>

        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-foreground/70 transition-all duration-300"
            style={{ width: `${pctUsed}%` }}
          />
        </div>
      </div>
    </div>
  );
}
