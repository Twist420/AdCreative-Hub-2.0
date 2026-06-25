import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { getMonthWeeks, parseDateValue } from "./dateUtils";

type UseAddWeekModalOptions = {
  addScheduleRow: (weekRange?: string, atTop?: boolean) => void;
  setSelectedWeekRange: Dispatch<SetStateAction<string>>;
  setSelectedWeekRanges: Dispatch<SetStateAction<string[]>>;
  setDateRangeStart: Dispatch<SetStateAction<string>>;
  setDateRangeEnd: Dispatch<SetStateAction<string>>;
};

export const useAddWeekModal = ({
  addScheduleRow,
  setSelectedWeekRange,
  setSelectedWeekRanges,
  setDateRangeStart,
  setDateRangeEnd,
}: UseAddWeekModalOptions) => {
  const [showAddWeekPopup, setShowAddWeekPopup] = useState(false);
  const [newWeekRange, setNewWeekRange] = useState("");
  const [newWeekStart, setNewWeekStart] = useState("");
  const [newWeekEnd, setNewWeekEnd] = useState("");
  const [newWeekCalendarYear, setNewWeekCalendarYear] = useState(2026);
  const [newWeekCalendarMonth, setNewWeekCalendarMonth] = useState(6);

  const openAddWeekPopup = () => {
    const today = new Date();
    setNewWeekCalendarYear(today.getFullYear());
    setNewWeekCalendarMonth(today.getMonth() + 1);
    setNewWeekStart("");
    setNewWeekEnd("");
    setNewWeekRange("");
    setShowAddWeekPopup(true);
  };

  const jumpNewWeekCalendarToToday = () => {
    const today = new Date();
    setNewWeekCalendarYear(today.getFullYear());
    setNewWeekCalendarMonth(today.getMonth() + 1);
  };

  const handleSelectNewWeekDay = (dateString: string) => {
    if (!newWeekStart || (newWeekStart && newWeekEnd)) {
      setNewWeekStart(dateString);
      setNewWeekEnd("");
      setNewWeekRange("");
      return;
    }

    const startTime = parseDateValue(newWeekStart) ?? 0;
    const selectedTime = parseDateValue(dateString) ?? 0;
    const start = selectedTime < startTime ? dateString : newWeekStart;
    const end = selectedTime < startTime ? newWeekStart : dateString;
    setNewWeekStart(start);
    setNewWeekEnd(end);
    setNewWeekRange(`${start} ~ ${end}`);
  };

  const handlePrevNewWeekMonth = () => {
    if (newWeekCalendarMonth === 1) {
      setNewWeekCalendarYear((prev) => prev - 1);
      setNewWeekCalendarMonth(12);
    } else {
      setNewWeekCalendarMonth((prev) => prev - 1);
    }
  };

  const handleNextNewWeekMonth = () => {
    if (newWeekCalendarMonth === 12) {
      setNewWeekCalendarYear((prev) => prev + 1);
      setNewWeekCalendarMonth(1);
    } else {
      setNewWeekCalendarMonth((prev) => prev + 1);
    }
  };

  const handleAddWeek = () => {
    if (!newWeekStart || !newWeekEnd) return;
    const range = `${newWeekStart} ~ ${newWeekEnd}`;
    addScheduleRow(range);
    setSelectedWeekRange(range);
    setSelectedWeekRanges([range]);
    setDateRangeStart(newWeekStart);
    setDateRangeEnd(newWeekEnd);
    setShowAddWeekPopup(false);
    setNewWeekRange("");
    setNewWeekStart("");
    setNewWeekEnd("");
  };

  const newWeekCalendarWeeks = useMemo(
    () => getMonthWeeks(newWeekCalendarYear, newWeekCalendarMonth),
    [newWeekCalendarYear, newWeekCalendarMonth],
  );

  return {
    showAddWeekPopup,
    setShowAddWeekPopup,
    newWeekRange,
    newWeekStart,
    newWeekEnd,
    newWeekCalendarYear,
    newWeekCalendarMonth,
    newWeekCalendarWeeks,
    openAddWeekPopup,
    jumpNewWeekCalendarToToday,
    handleSelectNewWeekDay,
    handlePrevNewWeekMonth,
    handleNextNewWeekMonth,
    handleAddWeek,
  };
};
