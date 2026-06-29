import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Calendar, Check, ChevronDown, ChevronsLeft, ChevronsRight, ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { formatUtcDate, getRecentUtcRange, getSingleUtcDayRange, getUtcMonthDays, getUtcMonthRange, getUtcWeekRange, isDateRangeEdge, isWithinDateRange, shiftUtcMonth, toUtcDate } from '../shared/date/dateRange';

export { getRecentUtcRange };

interface AnalyticsDateRangeFieldProps {
  end: string;
  mode?: 'launch' | 'spend';
  onChange: (range: { start: string; end: string }) => void;
  start: string;
}

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface CustomDropdownProps {
  className?: string;
  compact?: boolean;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
  value: string;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  className = '',
  compact = false,
  onChange,
  options,
  placeholder,
  value,
}) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find((option) => option.value === value);
  const label = selectedOption?.label || placeholder || '';

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={`flex w-full items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white font-black shadow-3xs outline-none transition-all hover:border-indigo-200 hover:bg-slate-50 ${
          open ? 'border-indigo-300 ring-2 ring-indigo-100' : ''
        } ${
          compact ? 'h-8 px-2 text-xs text-slate-700' : `h-9 px-3 text-xs ${value ? 'text-slate-800' : 'text-slate-400'}`
        }`}
      >
        <span className="truncate">{label}</span>
        <ChevronDown className={`shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''} ${compact ? 'h-3.5 w-3.5' : 'h-4 w-4'}`} />
      </button>

      {open && (
        <div className={`absolute left-0 top-[calc(100%+6px)] z-[70] max-h-64 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-xl shadow-slate-200/80 ${
          compact ? 'min-w-[92px]' : 'min-w-full'
        }`}>
          {placeholder && (
            <button
              type="button"
              onClick={() => {
                onChange('');
                setOpen(false);
              }}
              className={`flex w-full items-center rounded-md px-3 text-left font-bold transition-colors ${
                !value ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              } ${compact ? 'h-7 text-xs' : 'h-8 text-xs'}`}
            >
              {placeholder}
            </button>
          )}
          {options.map((option) => {
            const selected = option.value === value;
            return (
              <button
                type="button"
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center rounded-md px-3 text-left font-bold transition-colors ${
                  selected ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                } ${compact ? 'h-7 text-xs' : 'h-8 text-xs'}`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

interface AnalyticsSearchFieldProps {
  className?: string;
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}

export const AnalyticsSearchField: React.FC<AnalyticsSearchFieldProps> = ({
  className = '',
  onChange,
  placeholder,
  value,
}) => (
  <div className={`relative min-w-[160px] ${className}`}>
    <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
    <input
      type="text"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className={`h-9 w-full rounded-lg border border-slate-200 bg-white py-0 pl-9 pr-8 text-xs font-bold shadow-3xs outline-none transition-all placeholder:text-slate-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 ${
        value ? 'text-slate-800' : 'text-slate-400'
      }`}
    />
    {value && (
      <button
        type="button"
        onClick={() => onChange('')}
        className="absolute right-2 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    )}
  </div>
);

interface AnalyticsMultiSearchFieldProps {
  className?: string;
  onSearchChange: (value: string) => void;
  onToggle: (value: string) => void;
  options: { label: string; value: string }[];
  placeholder: string;
  searchValue: string;
  selectedValues: string[];
}

export const AnalyticsMultiSearchField: React.FC<AnalyticsMultiSearchFieldProps> = ({
  className = '',
  onSearchChange,
  onToggle,
  options,
  placeholder,
  searchValue,
  selectedValues,
}) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selectedCount = selectedValues.length;
  const displayText = selectedCount > 0 ? `${placeholder} · ${selectedCount}` : searchValue || placeholder;

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  const visibleOptions = options.filter((option) => option.label.toLowerCase().includes(searchValue.toLowerCase()));

  return (
    <div ref={rootRef} className={`relative min-w-[190px] ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={`flex h-9 w-full items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold shadow-3xs outline-none transition-all hover:border-indigo-200 hover:bg-slate-50 ${
          open ? 'border-indigo-300 ring-2 ring-indigo-100' : ''
        } ${selectedCount || searchValue ? 'text-slate-800' : 'text-slate-400'}`}
      >
        <Search className="h-3.5 w-3.5 shrink-0 text-slate-400" />
        <span className="min-w-0 flex-1 truncate text-left">{displayText}</span>
        <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+6px)] z-[70] w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl shadow-slate-200/80">
          <div className="border-b border-slate-100 p-2">
            <AnalyticsSearchField
              className="min-w-0"
              value={searchValue}
              onChange={onSearchChange}
              placeholder={placeholder}
            />
          </div>
          <div className="max-h-56 overflow-y-auto p-1">
            {visibleOptions.map((option) => {
              const selected = selectedValues.includes(option.value);
              return (
                <button
                  type="button"
                  key={option.value}
                  onClick={() => onToggle(option.value)}
                  className={`flex h-9 w-full items-center gap-2 rounded-md px-2 text-left text-xs font-bold transition-colors ${
                    selected ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                    selected ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-slate-300 bg-white'
                  }`}>
                    {selected && <Check className="h-3 w-3" />}
                  </span>
                  <span className="min-w-0 truncate">{option.label}</span>
                </button>
              );
            })}
            {visibleOptions.length === 0 && (
              <div className="px-3 py-4 text-center text-xs font-bold text-slate-400">没有匹配项</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const AnalyticsDateRangeField: React.FC<AnalyticsDateRangeFieldProps> = ({
  end,
  mode = 'spend',
  onChange,
  start,
}) => {
  const [open, setOpen] = useState(false);
  const [draftStart, setDraftStart] = useState(start);
  const [draftEnd, setDraftEnd] = useState(end);
  const [viewMonth, setViewMonth] = useState(() => shiftUtcMonth(toUtcDate(start || end || getRecentUtcRange(30).start), 0));
  const [popupPosition, setPopupPosition] = useState({ left: 0, top: 0 });
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setDraftStart(start);
    setDraftEnd(end);
  }, [start, end]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  const updatePopupPosition = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const popupWidth = 720;
    const viewportPadding = 16;
    const maxLeft = Math.max(viewportPadding, window.innerWidth - popupWidth - viewportPadding);
    const left = Math.min(Math.max(viewportPadding, rect.left), maxLeft);
    setPopupPosition({
      left,
      top: rect.bottom + 8,
    });
  };

  useEffect(() => {
    if (!open) return;
    updatePopupPosition();
    window.addEventListener('resize', updatePopupPosition);
    window.addEventListener('scroll', updatePopupPosition, true);
    return () => {
      window.removeEventListener('resize', updatePopupPosition);
      window.removeEventListener('scroll', updatePopupPosition, true);
    };
  }, [open]);

  const years = useMemo(() => {
    const current = new Date().getUTCFullYear();
    return Array.from({ length: 9 }, (_, index) => current - 4 + index);
  }, []);

  const displayRange = start && end ? `${start} - ${end}` : '选择时间范围';
  const leftMonth = viewMonth;
  const rightMonth = shiftUtcMonth(viewMonth, 1);

  const commitRange = (nextStart: string, nextEnd: string) => {
    setDraftStart(nextStart);
    setDraftEnd(nextEnd);
    onChange({ start: nextStart, end: nextEnd });
    setOpen(false);
  };

  const handleDayClick = (value: string) => {
    if (!draftStart || draftEnd) {
      setDraftStart(value);
      setDraftEnd('');
      return;
    }

    const nextStart = value < draftStart ? value : draftStart;
    const nextEnd = value < draftStart ? draftStart : value;
    commitRange(nextStart, nextEnd);
  };

  const handleShortcut = (range: { start: string; end: string }) => {
    setViewMonth(toUtcDate(range.start));
    commitRange(range.start, range.end);
  };

  const handleMonthChange = (base: Date, month: number, panel: 'left' | 'right') => {
    const next = new Date(Date.UTC(base.getUTCFullYear(), month, 1));
    setViewMonth(panel === 'left' ? next : shiftUtcMonth(next, -1));
  };

  const handleYearChange = (base: Date, year: number, panel: 'left' | 'right') => {
    const next = new Date(Date.UTC(year, base.getUTCMonth(), 1));
    setViewMonth(panel === 'left' ? next : shiftUtcMonth(next, -1));
  };

  const CalendarPanel = ({ monthDate, panel }: { monthDate: Date; panel: 'left' | 'right' }) => (
    <div className="min-w-[240px] flex-1">
      <div className="mb-3 flex items-center justify-center gap-2">
        <CustomDropdown
          compact
          className="w-[84px]"
          value={String(monthDate.getUTCMonth())}
          onChange={(value) => handleMonthChange(monthDate, Number(value), panel)}
          options={monthNames.map((label, index) => ({ label, value: String(index) }))}
        />
        <CustomDropdown
          compact
          className="w-[86px]"
          value={String(monthDate.getUTCFullYear())}
          onChange={(value) => handleYearChange(monthDate, Number(value), panel)}
          options={years.map((year) => ({ label: String(year), value: String(year) }))}
        />
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center">
        {weekDays.map((day) => (
          <div key={day} className="py-1 text-[11px] font-black text-slate-500">{day}</div>
        ))}
        {getUtcMonthDays(monthDate).map((date) => {
          const dateString = formatUtcDate(date);
          const inMonth = date.getUTCMonth() === monthDate.getUTCMonth();
          const selected = isDateRangeEdge(dateString, draftStart, draftEnd);
          const inRange = isWithinDateRange(dateString, draftStart, draftEnd);
          return (
            <button
              type="button"
              key={dateString}
              onClick={() => handleDayClick(dateString)}
              className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full text-xs font-black transition-all ${
                selected
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 ring-2 ring-indigo-100'
                  : inRange
                    ? 'bg-indigo-50 text-indigo-700'
                    : inMonth
                      ? 'text-slate-800 hover:bg-indigo-50 hover:text-indigo-700'
                      : 'text-slate-300 hover:bg-slate-50'
              }`}
            >
              {date.getUTCDate()}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          updatePopupPosition();
          setOpen((value) => !value);
          setViewMonth(toUtcDate(start || end || getRecentUtcRange(30).start));
        }}
        className={`flex h-9 min-w-[280px] items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold shadow-3xs transition-all hover:border-indigo-200 hover:bg-slate-50 ${
          open ? 'border-indigo-300 ring-2 ring-indigo-100' : ''
        }`}
      >
        <Calendar className="h-3.5 w-3.5 shrink-0 text-slate-400" />
        <span className="shrink-0 text-xs font-black uppercase tracking-wide text-slate-400">UTC</span>
        {mode === 'launch' && <span className="shrink-0 text-xs font-black text-slate-800">投放时间</span>}
        {mode === 'spend' && <span className="shrink-0 text-xs font-black text-slate-800">Last 30 days</span>}
        <span className={`min-w-0 flex-1 truncate text-left text-xs font-bold ${start && end ? 'text-slate-700' : 'text-slate-400'}`}>
          {displayRange}
        </span>
        <ChevronDown className="ml-auto h-3.5 w-3.5 shrink-0 text-slate-400" />
      </button>

      {open && (
        <div
          className="fixed z-50 w-[720px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/80"
          style={{ left: popupPosition.left, top: popupPosition.top }}
        >
          <div className="flex">
            <aside className="w-40 shrink-0 border-r border-slate-200 bg-slate-50 p-3">
              {[
                { label: 'Today', range: getSingleUtcDayRange(0) },
                { label: 'Yesterday', range: getSingleUtcDayRange(-1) },
                { label: 'This week', range: getUtcWeekRange(0) },
                { label: 'Last week', range: getUtcWeekRange(-1) },
                { label: 'This month', range: getUtcMonthRange(0) },
                { label: 'Last month', range: getUtcMonthRange(-1) },
                { label: 'Last 7 days', range: getRecentUtcRange(7) },
                { label: 'Last 30 days', range: getRecentUtcRange(30) },
              ].map((item) => (
                <button
                  type="button"
                  key={item.label}
                  onClick={() => handleShortcut(item.range)}
                  className="mb-1.5 h-8 w-full rounded-md bg-white text-xs font-bold text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-900"
                >
                  {item.label}
                </button>
              ))}
            </aside>

            <div className="flex-1">
              <div className="flex h-11 items-center justify-between border-b border-slate-200 px-5">
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setViewMonth(shiftUtcMonth(viewMonth, -12))} className="rounded-md p-1 text-slate-500 hover:bg-slate-100"><ChevronsLeft className="h-4 w-4" /></button>
                  <button type="button" onClick={() => setViewMonth(shiftUtcMonth(viewMonth, -1))} className="rounded-md p-1 text-slate-500 hover:bg-slate-100"><ChevronLeft className="h-4 w-4" /></button>
                </div>
                <div className={`rounded-md px-2 py-1 text-[11px] font-black uppercase tracking-wide ${
                  draftStart && draftEnd ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400'
                }`}>
                  {draftStart && draftEnd ? `${draftStart} - ${draftEnd}` : 'Select date range'}
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setViewMonth(shiftUtcMonth(viewMonth, 1))} className="rounded-md p-1 text-slate-500 hover:bg-slate-100"><ChevronRight className="h-4 w-4" /></button>
                  <button type="button" onClick={() => setViewMonth(shiftUtcMonth(viewMonth, 12))} className="rounded-md p-1 text-slate-500 hover:bg-slate-100"><ChevronsRight className="h-4 w-4" /></button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-5 p-5">
                <CalendarPanel monthDate={leftMonth} panel="left" />
                <CalendarPanel monthDate={rightMonth} panel="right" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface AnalyticsSelectFieldProps {
  className?: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  placeholder: string;
  value: string;
}

export const AnalyticsSelectField: React.FC<AnalyticsSelectFieldProps> = ({
  className = '',
  onChange,
  options,
  placeholder,
  value,
}) => (
  <CustomDropdown
    className={`min-w-[150px] ${className}`}
    value={value}
    onChange={onChange}
    options={options}
    placeholder={placeholder}
  />
);

export const AnalyticsFilterBar = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
    <div className="flex flex-wrap items-center gap-2">
      {children}
    </div>
  </div>
);
