import type { CreativeSchedule, Requirement } from "../../types";
import RequirementDetail from "../RequirementDetail";
import type { ScheduledTaskView } from "./requirementUtils";

export const RequirementDetailOverlay = ({
  requirement,
  schedules,
  productionTasks,
  onClose,
  onChange,
  onDelete,
}: {
  requirement: Requirement;
  schedules: CreativeSchedule[];
  productionTasks: ScheduledTaskView[];
  onClose: () => void;
  onChange: (requirement: Requirement) => void;
  onDelete: (requirementId: string) => void;
}) => {
  const selectedSchedule = schedules.find(
    (schedule) => schedule.id === requirement.scheduleId,
  );
  const scheduleDeadline =
    selectedSchedule?.productionEnd ||
    selectedSchedule?.submissionDeadline ||
    selectedSchedule?.requirementEnd ||
    requirement.endDate ||
    "";

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full h-full bg-white overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <RequirementDetail
          requirement={requirement}
          onClose={onClose}
          onChange={onChange}
          onDelete={onDelete}
          scheduleDeadline={scheduleDeadline}
          productionScheduleContext={productionTasks.map((task) => ({
            id: task.id,
            requirementId: task.requirement.id,
            displayRequirementId: task.displayRequirementId,
            requirementName: task.requirement.name,
            priority: task.requirement.priority,
            role: task.role,
            producer: task.producer,
            status: task.status,
            startDate: task.startDate,
            endDate: task.endDate,
          }))}
        />
      </div>
    </div>
  );
};
