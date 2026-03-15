"use client";

import { useMemo } from "react";

import type { TimelineUnit } from "../features/timeline";

interface TimelineScaleConfig {
  tickWidthPx: number;
  tickMs: number;
  majorMs: number;
}

const MS = {
  hour: 60 * 60 * 1000,
  day: 24 * 60 * 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000,
  month: 30 * 24 * 60 * 60 * 1000,
  quarter: 91 * 24 * 60 * 60 * 1000,
  year: 365 * 24 * 60 * 60 * 1000,
};

const UNIT_CONFIGS: Record<TimelineUnit, TimelineScaleConfig> = {
  hours: { tickWidthPx: 40, tickMs: MS.hour, majorMs: MS.day },
  day: { tickWidthPx: 40, tickMs: MS.day, majorMs: MS.week },
  week: { tickWidthPx: 80, tickMs: MS.week, majorMs: MS.month },
  "bi-week": { tickWidthPx: 80, tickMs: 2 * MS.week, majorMs: MS.month },
  month: { tickWidthPx: 120, tickMs: MS.month, majorMs: MS.year },
  quarter: { tickWidthPx: 120, tickMs: MS.quarter, majorMs: MS.year },
  year: { tickWidthPx: 120, tickMs: MS.year, majorMs: 5 * MS.year },
  "5-years": { tickWidthPx: 120, tickMs: 5 * MS.year, majorMs: 10 * MS.year },
};

const BUFFER_TICKS = 60;

function formatMajorLabel(ts: number, unit: TimelineUnit): string {
  const d = new Date(ts);
  switch (unit) {
    case "hours":
      return d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
    case "day":
    case "week":
    case "bi-week":
      return d.toLocaleDateString(undefined, {
        month: "long",
        year: "numeric",
      });
    case "month":
    case "quarter":
      return d.getFullYear().toString();
    case "year":
    case "5-years":
      return `${Math.floor(d.getFullYear() / 10) * 10}s`;
  }
}

function formatMinorLabel(ts: number, unit: TimelineUnit): string {
  const d = new Date(ts);
  switch (unit) {
    case "hours":
      return d.toLocaleTimeString(undefined, {
        hour: "numeric",
        hour12: true,
      });
    case "day":
      return d.toLocaleDateString(undefined, {
        weekday: "short",
        day: "numeric",
      });
    case "week":
    case "bi-week":
      return d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
    case "month":
      return d.toLocaleDateString(undefined, { month: "short" });
    case "quarter":
      return `Q${Math.floor(d.getMonth() / 3) + 1}`;
    case "year":
      return d.getFullYear().toString();
    case "5-years":
      return `${d.getFullYear()}–${d.getFullYear() + 4}`;
  }
}

interface LabelItem {
  label: string;
  left: number;
  width?: number;
}

interface GridLine {
  left: number;
  isMajor: boolean;
  isWeekend?: boolean;
}

export interface UseTimelineScaleReturn {
  config: TimelineScaleConfig;
  pxPerMs: number;
  originX: number;
  totalWidth: number;
  dateToX: (timestamp: number) => number;
  xToDate: (x: number) => number;
  getMajorLabels: () => LabelItem[];
  getMinorLabels: () => LabelItem[];
  getGridLines: () => GridLine[];
  todayX: number;
}

export function useTimelineScale(
  unit: TimelineUnit,
  scrollOrigin: number,
): UseTimelineScaleReturn {
  const now = Date.now();

  return useMemo(() => {
    const config = UNIT_CONFIGS[unit];
    const pxPerMs = config.tickWidthPx / config.tickMs;
    const totalWidth = config.tickWidthPx * BUFFER_TICKS * 2;
    const originX = totalWidth / 2;

    const dateToX = (timestamp: number) =>
      originX + (timestamp - scrollOrigin) * pxPerMs;

    const xToDate = (x: number) => scrollOrigin + (x - originX) / pxPerMs;

    const todayX = dateToX(now);

    const startTs = xToDate(0);
    const endTs = xToDate(totalWidth);

    const getMajorLabels = (): LabelItem[] => {
      const labels: LabelItem[] = [];
      const firstMajor = Math.floor(startTs / config.majorMs) * config.majorMs;
      for (let ts = firstMajor; ts <= endTs; ts += config.majorMs) {
        labels.push({
          label: formatMajorLabel(ts, unit),
          left: dateToX(ts),
          width: config.majorMs * pxPerMs,
        });
      }
      return labels;
    };

    const getMinorLabels = (): LabelItem[] => {
      const labels: LabelItem[] = [];
      const firstTick = Math.floor(startTs / config.tickMs) * config.tickMs;
      for (let ts = firstTick; ts <= endTs; ts += config.tickMs) {
        labels.push({
          label: formatMinorLabel(ts, unit),
          left: dateToX(ts),
          width: config.tickWidthPx,
        });
      }
      return labels;
    };

    const getGridLines = (): GridLine[] => {
      const lines: GridLine[] = [];
      const firstTick = Math.floor(startTs / config.tickMs) * config.tickMs;
      for (let ts = firstTick; ts <= endTs; ts += config.tickMs) {
        const isMajor = ts % config.majorMs === 0;
        const d = new Date(ts);
        const dayOfWeek = d.getDay();
        const isWeekend =
          unit === "day" && (dayOfWeek === 0 || dayOfWeek === 6);
        lines.push({ left: dateToX(ts), isMajor, isWeekend });
      }
      return lines;
    };

    return {
      config,
      pxPerMs,
      originX,
      totalWidth,
      dateToX,
      xToDate,
      getMajorLabels,
      getMinorLabels,
      getGridLines,
      todayX,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unit, scrollOrigin]);
}
