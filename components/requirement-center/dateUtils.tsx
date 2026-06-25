import { Info } from "lucide-react";

export interface CalendarDay {
  dayNum: number;
  dateString: string;
  isToday: boolean;
  isWeekend: boolean;
  isCurrentMonth: boolean;
}

export interface CalendarWeek {
  days: CalendarDay[];
}

export const formatCalendarDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export function getMonthWeeks(year: number, month: number): CalendarWeek[] {
  const weeks: CalendarWeek[] = [];
  const todayString = formatCalendarDate(new Date());
  const firstDayOfMonth = new Date(year, month - 1, 1);
  const dayOfWeek = firstDayOfMonth.getDay();
  const startOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const startDate = new Date(year, month - 1, 1 - startOffset);
  const currentDate = new Date(startDate);

  for (let w = 0; w < 6; w++) {
    const weekDays: CalendarDay[] = [];
    for (let d = 0; d < 7; d++) {
      const yearVal = currentDate.getFullYear();
      const monthVal = currentDate.getMonth() + 1;
      const dayVal = currentDate.getDate();
      const formattedDate = `${yearVal}-${String(monthVal).padStart(2, "0")}-${String(dayVal).padStart(2, "0")}`;
      const dayOfWeekVal = currentDate.getDay();

      weekDays.push({
        dayNum: dayVal,
        dateString: formattedDate,
        isToday: formattedDate === todayString,
        isWeekend: dayOfWeekVal === 0 || dayOfWeekVal === 6,
        isCurrentMonth: monthVal === month,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (w < 5 || weekDays.some((day) => day.isCurrentMonth)) {
      weeks.push({ days: weekDays });
    }
  }

  return weeks;
}

export const parseDateValue = (dateStr?: string) => {
  if (!dateStr) return null;
  const timestamp = new Date(`${dateStr}T00:00:00`).getTime();
  return Number.isNaN(timestamp) ? null : timestamp;
};

export const parseWeekRangeDates = (weekRange: string) => {
  const [start, end] = weekRange.split("~").map((part) => part.trim());
  return {
    start,
    end,
    startTime: parseDateValue(start) ?? 0,
    endTime: parseDateValue(end) ?? 0,
  };
};

export const rangesOverlap = (
  itemStart?: string,
  itemEnd?: string,
  filterStart?: string,
  filterEnd?: string,
) => {
  const filterStartTime = parseDateValue(filterStart);
  const filterEndTime = parseDateValue(filterEnd);
  if (filterStartTime === null && filterEndTime === null) return true;

  const itemStartTime = parseDateValue(itemStart) ?? parseDateValue(itemEnd);
  const itemEndTime = parseDateValue(itemEnd) ?? itemStartTime;
  if (itemStartTime === null || itemEndTime === null) return false;

  return (
    (filterStartTime === null || itemEndTime >= filterStartTime) &&
    (filterEndTime === null || itemStartTime <= filterEndTime)
  );
};

export const getDateRangeDays = (startDate: string, endDate: string) => {
  const startTime = parseDateValue(startDate);
  const endTime = parseDateValue(endDate);
  if (startTime === null || endTime === null) return 0;
  return Math.max(1, Math.round((endTime - startTime) / 86400000) + 1);
};

export const getSubmitTimeBadge = (submitDate: string, todayDate: string) => {
  const submitTime = parseDateValue(submitDate);
  const todayTime = parseDateValue(todayDate);
  if (submitTime === null || todayTime === null) return null;
  const diffDays = Math.round((submitTime - todayTime) / 86400000);
  if (diffDays < 0) {
    return {
      label: "延期",
      className: "border-rose-100 bg-rose-50 text-rose-600",
    };
  }
  if (diffDays <= 1) {
    return {
      label: "1天内",
      className: "border-amber-100 bg-amber-50 text-amber-700",
    };
  }
  return null;
};

export const getSubmitDelayDays = (submitDate: string, todayDate: string) => {
  const submitTime = parseDateValue(submitDate);
  const todayTime = parseDateValue(todayDate);
  if (submitTime === null || todayTime === null || submitTime >= todayTime) {
    return 0;
  }
  return Math.ceil((todayTime - submitTime) / 86400000);
};

const formatCompactDate = (date: string) => date.replaceAll("-", "/");

export const ProductionSubmitDateDisplay = ({
  date,
  badge,
}: {
  date: string;
  badge: ReturnType<typeof getSubmitTimeBadge>;
}) => (
  <div className="flex justify-center">
    <div className="relative inline-flex h-9 min-w-[118px] items-center justify-center rounded-xl border border-slate-150 bg-white px-3 text-[12px] font-black text-slate-800 shadow-3xs transition-all group-hover:border-indigo-150">
      <span className="whitespace-nowrap">{date ? formatCompactDate(date) : "-"}</span>
      {badge && (
        <span
          className={`absolute -right-2 -top-2 inline-flex h-5 items-center rounded-full border bg-white px-1.5 text-[9px] font-black shadow-3xs ${badge.className}`}
        >
          {badge.label}
        </span>
      )}
    </div>
  </div>
);

export const WeekRangeRuleInfo = ({ className = "" }: { className?: string }) => (
  <span
    className={`group/rule relative inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-white/70 hover:text-indigo-500 ${className}`}
    onClick={(event) => event.stopPropagation()}
    role="button"
    aria-label="查看周期显示规则"
  >
    <Info className="h-3.5 w-3.5" />
    <span className="pointer-events-none absolute left-1/2 top-full z-[180] mt-2 hidden w-64 -translate-x-1/2 rounded-2xl border border-slate-150 bg-white p-3 text-left text-[10px] font-bold leading-relaxed text-slate-500 shadow-2xl shadow-slate-900/10 group-hover/rule:block">
      <span className="block text-[11px] font-black text-slate-800">周期显示规则</span>
      <span className="mt-2 block">橙色框：未来周期</span>
      <span className="block">绿色框：当前周期</span>
      <span className="block">灰色框：过去周期</span>
      <span className="mt-1 block pl-3 text-slate-400">- 灰色点：过去周期所有方向已完成</span>
      <span className="block pl-3 text-slate-400">- 红色点：过去周期存在方向未完成</span>
    </span>
  </span>
);

export const addDaysToDateString = (dateStr: string, days: number) => {
  const base = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(base.getTime())) return dateStr;
  base.setDate(base.getDate() + days);
  return formatCalendarDate(base);
};

const DEFAULT_WEEK_RANGE_COUNT = 20;

export const getDefaultWeekRanges = (
  ranges: string[],
  count: number = DEFAULT_WEEK_RANGE_COUNT,
  baseDate: string = formatCalendarDate(new Date()),
) => {
  const sortedRanges = [...ranges].sort((a, b) => {
    const aRange = parseWeekRangeDates(a);
    const bRange = parseWeekRangeDates(b);
    return bRange.endTime - aRange.endTime || bRange.startTime - aRange.startTime;
  });
  const baseTime = parseDateValue(baseDate) ?? Date.now();
  const existingCurrentRange =
    sortedRanges.find((range) => {
      const { startTime, endTime } = parseWeekRangeDates(range);
      return baseTime >= startTime && baseTime < endTime;
    }) || sortedRanges[0];
  const fallbackCurrentStart = baseDate;
  const fallbackCurrentEnd = addDaysToDateString(fallbackCurrentStart, 7);
  const { start: currentStart, end: currentEnd } = existingCurrentRange
    ? parseWeekRangeDates(existingCurrentRange)
    : { start: fallbackCurrentStart, end: fallbackCurrentEnd };
  const generatedRanges: string[] = [];

  generatedRanges.push(`${currentStart} ~ ${currentEnd}`);
  for (let i = 1; i <= 4; i += 1) {
    const start = addDaysToDateString(currentStart, i * 7);
    generatedRanges.push(`${start} ~ ${addDaysToDateString(start, 7)}`);
  }
  for (let i = 1; generatedRanges.length < count; i += 1) {
    const start = addDaysToDateString(currentStart, -i * 7);
    generatedRanges.push(`${start} ~ ${addDaysToDateString(start, 7)}`);
  }

  return Array.from(new Set([...sortedRanges, ...generatedRanges]))
    .sort((a, b) => {
      const aRange = parseWeekRangeDates(a);
      const bRange = parseWeekRangeDates(b);
      return bRange.startTime - aRange.startTime || bRange.endTime - aRange.endTime;
    })
    .slice(0, Math.max(count, sortedRanges.length));
};

export const openNativeDatePicker = (event: React.MouseEvent<HTMLInputElement>) => {
  (event.currentTarget as HTMLInputElement & { showPicker?: () => void }).showPicker?.();
};
