import type React from "react";
import type { Requirement } from "../../types";
import type { Producer } from "./people";
import type { CalendarWeek } from "./dateUtils";
import type { ScheduledTaskView } from "./requirementUtils";
import { ProductionCalendarView } from "./ProductionCalendarView";
import { ProductionCapacityView } from "./ProductionCapacityView";
import { ProductionGanttView } from "./ProductionGanttView";
import { ProductionScheduleHeader } from "./ProductionScheduleHeader";

type ProductionView = "capacity" | "calendar" | "gantt";

type CapacityRow = {
  producer: Producer;
  weekTasks: ScheduledTaskView[];
  loadRate: number;
  nextAvailable: string;
};

type GanttDay = {
  dateString: string;
  day: number;
  month: number;
  isToday: boolean;
  isWeekend: boolean;
};

type GanttRow = {
  producer: Producer;
  tasks: ScheduledTaskView[];
};

export const ProductionWorkspace = ({
  productionView,
  delayedCount,
  selectedProducers,
  personnelCapacityGroups,
  calendarYear,
  calendarMonth,
  calendarWeeks,
  productionTasks,
  isProducerFilterOpen,
  producerFilterRef,
  activeProducers,
  ganttStart,
  ganttDays,
  ganttRows,
  onProductionViewChange,
  onOpenRiskModal,
  onSelectedProducersChange,
  onJumpToday,
  onPrevMonth,
  onNextMonth,
  onToggleProducerFilter,
  onClearProducerFilter,
  onToggleProducer,
  onOpenRequirement,
}: {
  productionView: ProductionView;
  delayedCount: number;
  selectedProducers: string[];
  personnelCapacityGroups: Record<string, CapacityRow[]>;
  calendarYear: number;
  calendarMonth: number;
  calendarWeeks: CalendarWeek[];
  productionTasks: ScheduledTaskView[];
  isProducerFilterOpen: boolean;
  producerFilterRef: React.RefObject<HTMLDivElement>;
  activeProducers: Producer[];
  ganttStart: string;
  ganttDays: GanttDay[];
  ganttRows: GanttRow[];
  onProductionViewChange: (view: ProductionView) => void;
  onOpenRiskModal: () => void;
  onSelectedProducersChange: (producers: string[]) => void;
  onJumpToday: () => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToggleProducerFilter: () => void;
  onClearProducerFilter: () => void;
  onToggleProducer: (producerName: string) => void;
  onOpenRequirement: (requirement: Requirement) => void;
}) => (
  <div className="flex-1 flex flex-col gap-4 overflow-hidden relative">
    <ProductionScheduleHeader
      productionView={productionView}
      delayedCount={delayedCount}
      selectedProducers={selectedProducers}
      onProductionViewChange={onProductionViewChange}
      onOpenRiskModal={onOpenRiskModal}
      onClearSelectedProducers={() => onSelectedProducersChange([])}
    />

    <div className="flex-1 overflow-auto rounded-2xl border border-slate-150 bg-white p-4 shadow-3xs">
      {productionView === "capacity" ? (
        <ProductionCapacityView
          personnelCapacityGroups={personnelCapacityGroups}
          onSelectProducer={(producerName) => {
            onSelectedProducersChange([producerName]);
            onProductionViewChange("calendar");
          }}
        />
      ) : productionView === "calendar" ? (
        <ProductionCalendarView
          calendarYear={calendarYear}
          calendarMonth={calendarMonth}
          calendarWeeks={calendarWeeks}
          productionTasks={productionTasks}
          selectedProducers={selectedProducers}
          isProducerFilterOpen={isProducerFilterOpen}
          producerFilterRef={producerFilterRef}
          activeProducers={activeProducers}
          onJumpToday={onJumpToday}
          onPrevMonth={onPrevMonth}
          onNextMonth={onNextMonth}
          onToggleProducerFilter={onToggleProducerFilter}
          onClearProducers={onClearProducerFilter}
          onToggleProducer={onToggleProducer}
          onOpenRequirement={onOpenRequirement}
        />
      ) : (
        <ProductionGanttView
          ganttStart={ganttStart}
          days={ganttDays}
          rows={ganttRows}
          selectedProducers={selectedProducers}
          onSelectProducer={(producerName) => onSelectedProducersChange([producerName])}
          onOpenRequirement={onOpenRequirement}
        />
      )}
    </div>
  </div>
);
