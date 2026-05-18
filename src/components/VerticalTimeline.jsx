import { useMemo } from "react";

/**
 * VerticalTimeline
 *
 * Props:
 *   entries  – array of { id, startDate, endDate } OR
 *              { id, periods: [{ id?, startDate, endDate }] }
 *              where startDate /endDate are "YYYY-MM" strings (endDate null = present)
 *   activeId – id of the currently selected entry (or null)
 *   height   – total pixel height to render the bar (default 100% via flex)
 */
export default function VerticalTimeline({ entries, activeId }) {
  const NOW = "2026-04";
  const TIMELINE_WIDTH = "var(--timeline-width, 88px)";
  const TRACK_X = "var(--timeline-track-x, 68px)";
  const TICK_WIDTH = 16;
  const LABEL_WIDTH = "var(--timeline-label-width, 54px)";

  // Convert a date string to an integer month index.
  // If `isEnd` is true, treat the date as inclusive end-of-period (end of month / end of year),
  // by returning the start-of-next-month representation (so end-of-month maps to next month's start).
  const toMonths = (dateStr, isEnd = false) => {
    if (!dateStr) return toMonths(NOW, isEnd);
    const parts = dateStr.split("-");
    const y = parseInt(parts[0], 10);
    const mStr = parts[1];
    let monthNum;
    if (!mStr) {
      // Only year provided
      monthNum = isEnd ? 13 : 1; // end -> next year's Jan, start -> Jan
    } else {
      const m = parseInt(mStr, 10);
      monthNum = isEnd ? m + 1 : m; // end-of-month -> move to next month start
    }
    return y * 12 + monthNum;
  };

  // Return a year number suitable for labeling.
  // If `isEnd` is true and the date represents the end of December (or only a year),
  // return the following year (the year that starts after that December).
  const toYear = (dateStr, isEnd = false) => {
    const parts = (dateStr || NOW).split("-");
    const y = parseInt(parts[0], 10);
    const mStr = parts[1];
    if (!isEnd) return y;
    if (!mStr) return y + 1;
    const m = parseInt(mStr, 10);
    return m === 12 ? y + 1 : y;
  };

  const getPeriods = (entry) => {
    if (!entry) return [];
    if (Array.isArray(entry.periods) && entry.periods.length) {
      return entry.periods.map((p, i) => ({
        id: p.id ?? `${entry.id}__p${i}`,
        startDate: p.startDate ?? p.date?.start ?? p.start,
        endDate: p.endDate ?? p.date?.end ?? p.end,
      }));
    }
    if (entry.startDate || entry.endDate) {
      return [{ id: entry.id, startDate: entry.startDate, endDate: entry.endDate }];
    }
    return [];
  };

  // Find min/max months for all entries (considering periods)
  const { minM, maxM, minYear, maxYear } = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    let minDate = NOW;
    let maxDate = NOW;

    for (const e of entries) {
      const periods = getPeriods(e);
      for (const p of periods) {
        const s = toMonths(p.startDate, false);
        const en = toMonths(p.endDate, true);

        if (s < min) {
          min = s;
          minDate = p.startDate || NOW;
        }

        if (en > max) {
          max = en;
          maxDate = p.endDate || NOW;
        }
      }
    }

    // add a small padding at top and bottom (3 months each)
    min -= 3;
    max += 3;

    return {
      minM: min,
      maxM: max,
      minYear: toYear(minDate, false),
      maxYear: toYear(maxDate, true),
    };
  }, [entries]);

  const totalMonths = Math.max(maxM - minM, 1);

  // convert a "YYYY-MM" to a 0–1 fraction from top (recent) to bottom (old)
  // `isEnd` indicates whether the date should be treated as an inclusive end-of-period.
  const toFrac = (dateStr, isEnd = false) => {
    const m = toMonths(dateStr, isEnd);
    return (maxM - m) / totalMonths;
  };

  // Find active entry (either parent id or a period id)
  let activeEntry = null;
  let activePeriodId = null;
  if (activeId) {
    activeEntry = entries.find((e) => e.id === activeId) || entries.find((e) => getPeriods(e).some((p) => p.id === activeId));
    if (activeEntry) {
      const periods = getPeriods(activeEntry);
      if (periods.some((p) => p.id === activeId)) {
        activePeriodId = activeId;
      }
    }
  }

  // Build list of periods to highlight for active entry
  const activePeriods = activeEntry ? getPeriods(activeEntry).filter((p) => !activePeriodId || p.id === activePeriodId) : [];

  // Collect years to show: always minYear and maxYear, and if active, its start/end years (from active periods)
  const yearLabels = useMemo(() => {
    const set = new Set([minYear, maxYear]);
    for (const p of activePeriods) {
      set.add(toYear(p.startDate, false));
      // if there's no explicit end date, treat the end as 'present' (not end-of-year)
      set.add(toYear(p.endDate, !!p.endDate));
    }
    return Array.from(set).sort((a, b) => b - a);
  }, [activePeriods, maxYear, minYear]);

  // Calculate the top and height for the main vertical line
  let lineTop = 0, lineHeight = '100%';
  if (minYear !== maxYear) {
    const topFrac = toFrac(`${maxYear}-01`);
    const botFrac = toFrac(`${minYear}-01`);
    lineTop = `${topFrac * 100}%`;
    lineHeight = `${(botFrac - topFrac) * 100}%`;
  }

  // Precompute dot fractions for active periods that are ongoing (endDate == null)
  const activeDotFracs = activePeriods.filter(p => !p.endDate).map(p => toFrac(p.endDate, false));

  // Compute union (min top, max bottom) across active periods to animate a single highlight
  // For periods with no explicit end date, use the 'present' fraction (isEnd=false) so the union
  // highlight stops at the dot instead of stretching to an end-of-month/year.
  const unionTopFrac = activePeriods.length > 0 ? Math.min(...activePeriods.map((p) => toFrac(p.endDate, !!p.endDate))) : 0;
  const unionBotFrac = activePeriods.length > 0 ? Math.max(...activePeriods.map((p) => toFrac(p.startDate, false))) : 0;

  return (
    <div className="vertical-timeline relative self-stretch" style={{ width: TIMELINE_WIDTH, minWidth: TIMELINE_WIDTH }}>
      {/* Main vertical line */}
      <div
        className="absolute bg-gray-700"
        style={{
          left: TRACK_X,
          width: 1,
          top: lineTop,
          height: lineHeight,
        }}
      />

      {/* Highlight segments for active entry (one per period) */}
      {/* Animated highlight container that repositions and contains per-period segments */}
      <div
        className="absolute transition-all duration-300"
        style={{
          left: TRACK_X,
          width: 1,
          top: `${unionTopFrac * 100}%`,
          height: `${Math.max(0, (unionBotFrac - unionTopFrac) * 100)}%`,
          opacity: activePeriods.length > 0 ? 1 : 0,
          zIndex: 1,
        }}
      >
        {activePeriods.map((p) => {
          const pTop = toFrac(p.endDate, !!p.endDate);
          const pBot = toFrac(p.startDate, false);
          const denom = unionBotFrac - unionTopFrac;
          const innerTop = denom <= 0 ? 0 : ((pTop - unionTopFrac) / denom) * 100;
          const innerHeight = denom <= 0 ? 100 : ((pBot - pTop) / denom) * 100;
          return (
            <div
              key={p.id}
              className="absolute section-timeline-accent transition-all duration-300"
              style={{
                left: 0,
                width: 1,
                top: `${innerTop}%`,
                height: `${innerHeight}%`,
              }}
            />
          );
        })}

        {/* Dots for ongoing active periods placed inside the animated container */}
        {activePeriods.filter((p) => !p.endDate).map((p) => {
          const pTop = toFrac(p.endDate, false);
          const denom = unionBotFrac - unionTopFrac;
          const innerTop = denom <= 0 ? 0 : ((pTop - unionTopFrac) / denom) * 100;
          return (
            <div
              key={`dot-${p.id}`}
              className="absolute rounded-full shadow section-timeline-accent"
              style={{
                left: -6,
                top: `${innerTop}%`,
                width: 12,
                height: 12,
                zIndex: 2,
              }}
            />
          );
        })}
      </div>

      {/* Year labels: only oldest, most recent, and active entry's years */}
      {yearLabels.map((year) => {
        const frac = toFrac(`${year}-01`);
        const isActiveYear = activePeriods.some(p => toYear(p.startDate, false) === year || toYear(p.endDate, true) === year);
        // Only hide tick if dot and tick are visually overlapping (within ~7px)
        let hideTick = false;
        if (activeDotFracs.length > 0) {
          hideTick = activeDotFracs.some(dotFrac => Math.abs(frac - dotFrac) * 100 < 1.5);
        }

        return (
          <div
            key={year}
            className="absolute inset-x-0 pointer-events-none flex items-center"
            style={{
              top: `${frac * 100}%`,
              transform: "translateY(-50%)",
              height: 16,
            }}
          >
            <span
              className={`text-[10px] leading-4 text-right select-none ${isActiveYear ? "section-year-active font-bold" : "text-gray-500"}`}
              style={{ width: LABEL_WIDTH }}
            >
              {year}
            </span>
            {!hideTick && (
              <span
                className={`${isActiveYear ? "section-year-tick-active" : "bg-gray-600"}`}
                style={{ position: "absolute", left: `calc(${TRACK_X} - ${TICK_WIDTH / 2}px)`, width: TICK_WIDTH, height: 1 }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
