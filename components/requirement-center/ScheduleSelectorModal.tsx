import type { LucideIcon } from "lucide-react";
import {
  ChevronRight,
  Gamepad2,
  Image as ImageIcon,
  Plus,
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

type FormConfig = {
  icon: LucideIcon | null;
  color: string;
};

export const ScheduleSelectorModal = ({
  selectedCreateType,
  schedules,
  requirements,
  onSelectCreateType,
  onClose,
  onSelectSchedule,
  onCreateStandalone,
  getFormConfig,
  getPriorityStyle,
}: {
  selectedCreateType: CreativeForm;
  schedules: CreativeSchedule[];
  requirements: Requirement[];
  onSelectCreateType: (type: CreativeForm) => void;
  onClose: () => void;
  onSelectSchedule: (scheduleId: string) => void;
  onCreateStandalone: () => void;
  getFormConfig: (form: CreativeForm) => FormConfig;
  getPriorityStyle: (priority: RequirementPriority) => string;
}) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300 p-6">
    <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-5xl max-h-[85vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
      <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-black text-slate-900 leading-tight">
            创建需求
          </h3>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            先按制作类型筛选方向，再选择要挂靠的方向；创建后的需求类型会跟随方向规定。
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-all"
        >
          <XCircle className="w-8 h-8" />
        </button>
      </div>

      <div className="px-8 pt-6 pb-4 border-b border-slate-100 bg-slate-50/40">
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest shrink-0">
            制作类型
          </span>
          {[
            {
              type: "Video" as CreativeForm,
              label: "视频",
              desc: "进入视频脚本模板",
              icon: Video,
            },
            {
              type: "Image" as CreativeForm,
              label: "图片",
              desc: "进入图片需求模板",
              icon: ImageIcon,
            },
            {
              type: "Playable" as CreativeForm,
              label: "试玩",
              desc: "进入试玩需求模板",
              icon: Gamepad2,
            },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = selectedCreateType === item.type;
            return (
              <button
                key={item.type}
                type="button"
                onClick={() => onSelectCreateType(item.type)}
                className={`flex-1 min-w-0 rounded-2xl border px-4 py-3 text-left transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/15"
                    : "bg-white text-slate-600 border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/40"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isActive ? "bg-white/15" : "bg-slate-50"
                    }`}
                  >
                    <Icon
                      className={`w-4.5 h-4.5 ${
                        isActive ? "text-white" : "text-indigo-600"
                      }`}
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-black">{item.label}</div>
                    <div
                      className={`mt-0.5 text-[10px] font-semibold ${
                        isActive ? "text-indigo-100" : "text-slate-400"
                      }`}
                    >
                      {item.desc}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-4 no-scrollbar">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-black text-slate-900">
              选择挂靠方向
            </h4>
            <p className="text-[11px] font-semibold text-slate-400 mt-1">
              只展示创建时需要判断的关键信息：方向、优先级、负责人、截止和剩余容量。
            </p>
          </div>
          <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-[11px] font-black text-slate-500">
            筛选方向类型：{selectedCreateType === "Video" ? "视频" : selectedCreateType === "Image" ? "图片" : "试玩"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {schedules
            .filter((sched) => sched.form === selectedCreateType)
            .map((sched) => {
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
                  onClick={() => onSelectSchedule(sched.id)}
                  className="group relative bg-white p-5 rounded-3xl border border-slate-150 hover:border-indigo-300 hover:shadow-xl hover:shadow-slate-900/5 transition-all cursor-pointer flex flex-col gap-4 text-left"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-black ${getPriorityStyle(sched.priority)} shadow-sm`}>
                          {sched.priority === "Highest"
                            ? "最高"
                            : sched.priority === "High"
                              ? "高"
                              : sched.priority === "Low"
                                ? "低"
                                : "中"}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] font-black ${formConfig.color}`}>
                          <FormIcon className="w-3 h-3" />
                          方向类型 {sched.form === "Video" ? "视频" : sched.form === "Image" ? "图片" : "试玩"}
                        </span>
                      </div>
                      <h5 className="text-sm font-black text-slate-900 group-hover:text-indigo-700 transition-colors truncate">
                        {sched.directionName}
                      </h5>
                      <p className="mt-1 line-clamp-1 text-[11px] font-semibold text-slate-400">
                        {sched.validationGoal || "暂无验证目标"}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all shrink-0 mt-1" />
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

        <div
          className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex items-center justify-center p-6 gap-4 hover:border-primary/50 hover:bg-white transition-all group cursor-pointer"
          onClick={onCreateStandalone}
        >
          <div className="w-12 h-12 rounded-2xl border-2 border-dashed border-slate-350 flex items-center justify-center group-hover:border-primary group-hover:text-primary transition-all group-hover:scale-110">
            <Plus className="w-6 h-6 text-slate-400 group-hover:text-primary" />
          </div>
          <div>
            <p className="text-xs font-extrabold text-slate-800 uppercase tracking-tight group-hover:text-primary transition-colors">
              不关联，直接创建空模版
            </p>
            <p className="text-[10px] text-slate-400 mt-1">
              使用当前制作类型：{selectedCreateType === "Video" ? "视频" : selectedCreateType === "Image" ? "图片" : "试玩"}
            </p>
          </div>
        </div>
      </div>

      <div className="px-8 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50/50">
        <p className="text-[10px] text-slate-400 font-extrabold uppercase">
          提示: 双击需求号可快捷绑定关联至所选的创意方向
        </p>
        <button
          onClick={onClose}
          className="px-6 py-2 text-xs font-black text-slate-400 hover:text-slate-600 transition-colors"
        >
          取消
        </button>
      </div>
    </div>
  </div>
);
