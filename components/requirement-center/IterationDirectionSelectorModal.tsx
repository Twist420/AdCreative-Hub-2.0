import type { LucideIcon } from "lucide-react";
import {
  ChevronRight,
  Inbox,
  Video,
  XCircle,
} from "lucide-react";
import type {
  CreativeForm,
  CreativeSchedule,
  Requirement,
  RequirementPriority,
} from "../../types";
import { PersonBadge } from "./people";

type PendingIteration = {
  sourceId: string;
  mode: "single" | "all";
};

type FormConfig = {
  icon: LucideIcon | null;
  color: string;
};

export const IterationDirectionSelectorModal = ({
  pendingIteration,
  source,
  iterationCount,
  selectedCreateType,
  schedules,
  requirements,
  onClose,
  onCreateIteration,
  getAssetTypeLabel,
  getFormConfig,
  getPriorityStyle,
}: {
  pendingIteration: PendingIteration;
  source: Requirement;
  iterationCount: number;
  selectedCreateType: CreativeForm;
  schedules: CreativeSchedule[];
  requirements: Requirement[];
  onClose: () => void;
  onCreateIteration: (scheduleId: string) => void;
  getAssetTypeLabel: (assetType: Requirement["assetType"]) => string;
  getFormConfig: (form: CreativeForm) => FormConfig;
  getPriorityStyle: (priority: RequirementPriority) => string;
}) => {
  const availableSchedules = schedules.filter(
    (sched) => sched.form === selectedCreateType,
  );

  return (
    <div className="fixed inset-0 z-[112] flex items-center justify-center bg-slate-900/60 p-6 backdrop-blur-md animate-in fade-in duration-200">
      <div className="flex max-h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-[32px] border border-slate-150 bg-white shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-8 py-6">
          <div className="min-w-0">
            <h3 className="text-xl font-black leading-tight text-slate-900">
              选择迭代方向
            </h3>
            <p className="mt-1 text-xs font-medium text-slate-500">
              {pendingIteration.mode === "all"
                ? `将迭代 ${iterationCount} 条版本，版本顺序与原需求保持一致。`
                : "将迭代当前单条需求，并生成新大版本的 -01。"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 transition-all hover:bg-slate-50 hover:text-slate-600"
          >
            <XCircle className="h-8 w-8" />
          </button>
        </div>

        <div className="border-b border-slate-100 bg-slate-50/50 px-8 py-4">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-black">
            <span className="rounded-xl bg-white px-3 py-1.5 text-slate-500 shadow-3xs">
              来源：{source.id}
            </span>
            <span className="rounded-xl bg-indigo-50 px-3 py-1.5 text-indigo-700">
              类型：{getAssetTypeLabel(source.assetType)}
            </span>
            <span className="rounded-xl bg-slate-100 px-3 py-1.5 text-slate-500">
              父需求字段将指向原需求
            </span>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-8 no-scrollbar">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-black text-slate-900">
                选择挂靠方向
              </h4>
              <p className="mt-1 text-[11px] font-semibold text-slate-400">
                新版本会跟随方向的制作类型、方向、负责人、优先级和渠道；描述、引用、预览等内容沿用原需求。
              </p>
            </div>
            <span className="rounded-xl bg-slate-100 px-3 py-1.5 text-[11px] font-black text-slate-500">
              当前筛选：{selectedCreateType === "Video" ? "视频" : selectedCreateType === "Image" ? "图片" : "试玩"}
            </span>
          </div>

          {availableSchedules.length === 0 ? (
            <div className="flex min-h-[220px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 text-center">
              <Inbox className="h-10 w-10 text-slate-300" />
              <p className="mt-3 text-xs font-black text-slate-500">
                暂无匹配该制作类型的方向
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {availableSchedules.map((sched) => {
                const associatedReqs = requirements.filter(
                  (req) => req.scheduleId === sched.id,
                );
                const remainingCount = Math.max(
                  0,
                  (sched.totalRequiredCount || 0) - associatedReqs.length,
                );
                const formConfig = getFormConfig(sched.form);
                const FormIcon = formConfig.icon || Video;

                return (
                  <button
                    key={sched.id}
                    type="button"
                    onClick={() => onCreateIteration(sched.id)}
                    className="group relative flex cursor-pointer flex-col gap-4 rounded-3xl border border-slate-150 bg-white p-5 text-left transition-all hover:border-indigo-300 hover:shadow-xl hover:shadow-slate-900/5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="mb-2 flex items-center gap-2">
                          <span className={`rounded-lg px-2 py-1 text-[10px] font-black shadow-sm ${getPriorityStyle(sched.priority)}`}>
                            {sched.priority === "Highest"
                              ? "最高"
                              : sched.priority === "High"
                                ? "高"
                                : sched.priority === "Low"
                                  ? "低"
                                  : "中"}
                          </span>
                          <span className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-black ${formConfig.color}`}>
                            <FormIcon className="h-3 w-3" />
                            {sched.form === "Video" ? "视频" : sched.form === "Image" ? "图片" : "试玩"}
                          </span>
                        </div>
                        <h5 className="truncate text-sm font-black text-slate-900 transition-colors group-hover:text-indigo-700">
                          {sched.directionName}
                        </h5>
                        <p className="mt-1 line-clamp-1 text-[11px] font-semibold text-slate-400">
                          {sched.validationGoal || "暂无验证目标"}
                        </p>
                      </div>
                      <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-indigo-600" />
                    </div>

                    <div className="grid grid-cols-4 gap-2 border-t border-slate-100 pt-4">
                      {[
                        ["负责人", sched.owner || "未指派"],
                        ["截止", sched.submissionDeadline || sched.requirementEnd || "--"],
                        ["渠道", sched.channels?.[0]?.toUpperCase() || "ALL"],
                        ["剩余", `${remainingCount}/${sched.totalRequiredCount || 0}`],
                      ].map(([label, value]) => (
                        <div key={label} className="rounded-2xl bg-slate-50 px-3 py-2">
                          <div className="text-[9px] font-black text-slate-400">
                            {label}
                          </div>
                          <div className="mt-1 truncate text-[11px] font-black text-slate-700">
                            {label === "负责人" ? (
                              <PersonBadge name={value} size="xs" />
                            ) : (
                              value
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
