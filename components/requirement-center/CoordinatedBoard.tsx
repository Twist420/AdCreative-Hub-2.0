import type React from "react";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Compass,
  FileEdit,
  Gamepad2,
  Image as ImageIcon,
  Plus,
  Radio,
  Target,
  Trash2,
  User,
  Video,
} from "lucide-react";
import type { CreativeSchedule, Requirement } from "../../types";
import { CREATIVE_PEOPLE, getPersonAvatarUrl, PersonBadge } from "./people";
import { getSubmitDelayDays, openNativeDatePicker } from ".";

type ScheduleInsight = {
  status: string;
  statusTone: string;
  suggestion: string;
  completedNotLaunched: number;
};

type InstantTooltipPayload = {
  content: string;
  left: number;
  top: number;
} | null;

type CoordinatedBoardProps = {
  visibleSchedules: CreativeSchedule[];
  requirements: Requirement[];
  schedules: CreativeSchedule[];
  selectedWeekRange: string;
  editingScheduleId: string | null;
  todayDateString: string;
  scheduleInsights: Map<string, ScheduleInsight>;
  setSelectedScheduleForModal: (schedule: CreativeSchedule) => void;
  updateSchedule: (id: string, updates: Partial<CreativeSchedule>) => void;
  setEditingScheduleId: (id: string | null) => void;
  showInstantTooltip: (
    event: React.MouseEvent<HTMLElement> | React.FocusEvent<HTMLElement>,
    content: string,
  ) => void;
  setInstantTooltip: (tooltip: InstantTooltipPayload) => void;
  handleAddRequirementForDirection: (scheduleId: string) => void;
  setSchedules: React.Dispatch<React.SetStateAction<CreativeSchedule[]>>;
  addScheduleRow: (weekRange?: string, atTop?: boolean) => void;
};

export const CoordinatedBoard = ({
  visibleSchedules,
  requirements,
  schedules,
  selectedWeekRange,
  editingScheduleId,
  todayDateString,
  scheduleInsights,
  setSelectedScheduleForModal,
  updateSchedule,
  setEditingScheduleId,
  showInstantTooltip,
  setInstantTooltip,
  handleAddRequirementForDirection,
  setSchedules,
  addScheduleRow,
}: CoordinatedBoardProps) => (
  <>
                {/* 协同看板内容 */}
                <div className="flex-1 overflow-auto space-y-3 no-scrollbar pb-4">
                  {visibleSchedules.length === 0 ? (
                    <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center py-16">
                      <Calendar className="w-10 h-10 text-slate-200 mb-2" />
                      <p className="text-xs font-bold text-slate-400">
                        目前选定条件暂无具体排期，请调整勾选周期/筛选条件，或点击新周期开始
                      </p>
                    </div>
                  ) : (
                    <div className="grid min-w-[1360px] grid-cols-4 items-start gap-4 pb-2">
                      {visibleSchedules.map((s) => {
                        const associatedReqs = requirements.filter(
                          (r) => r.scheduleId === s.id,
                        );
                        const submissionPercent = Math.min(
                          100,
                          Math.round(
                            (s.validCount / (s.totalRequiredCount || 1)) * 100,
                          ),
                        );

                        // Calculate production progress stats
                        const totalReqs = associatedReqs.length;
                        const completedReqs = associatedReqs.filter(
                          (r) => r.prodStatus === "Completed",
                        ).length;
                        const inProgressReqs = associatedReqs.filter(
                          (r) => r.prodStatus === "InProgress",
                        ).length;
                        const scheduledReqs = associatedReqs.filter(
                          (r) => r.prodStatus === "Scheduled" || !r.prodStatus,
                        ).length;

                        const completedPercent =
                          totalReqs > 0 ? (completedReqs / totalReqs) * 100 : 0;
                        const inProgressPercent =
                          totalReqs > 0
                            ? (inProgressReqs / totalReqs) * 100
                            : 0;
                        const totalProdPercent =
                          totalReqs > 0
                            ? Math.round((completedReqs / totalReqs) * 100)
                            : 0;

                        const isEditing = editingScheduleId === s.id;
                        const scheduleDelayedItems = associatedReqs
                          .map((req) => {
                            const submitDate =
                              req.endDate ||
                              s.productionEnd ||
                              s.submissionDeadline ||
                              s.requirementEnd ||
                              "";
                            return {
                              req,
                              delayedDays: getSubmitDelayDays(submitDate, todayDateString),
                            };
                          })
                          .filter((item) => item.delayedDays > 0)
                          .sort((a, b) => b.delayedDays - a.delayedDays);
                        const scheduleInsight = scheduleInsights.get(s.id);
                        const visibleAssociatedReqs = associatedReqs.slice(0, 3);
                        const hiddenAssociatedReqCount = Math.max(
                          0,
                          associatedReqs.length - visibleAssociatedReqs.length,
                        );

                        const cardPriorityStyle =
                          "border-slate-150 shadow-xs hover:shadow-md";

                        return (
                          <div
                            key={s.id}
                            onClick={() => setSelectedScheduleForModal(s)}
                            className={`h-[470px] bg-white rounded-3xl border transition-all p-5 flex flex-col cursor-pointer group relative overflow-hidden min-w-0 ${cardPriorityStyle}`}
                          >
                            <div className="flex min-h-0 flex-1 flex-col">
                              {/* 头部信息 */}
                              <div className={`mb-3 ${
                                isEditing
                                  ? "flex items-start gap-1"
                                  : "flex flex-col pr-9 min-[480px]:flex-row min-[480px]:items-start justify-between gap-2"
                              }`}>
                                <div
                                  className={`flex min-w-0 gap-1.5 ${
                                    isEditing ? "flex-nowrap" : "flex-wrap"
                                  }`}
                                  onClick={
                                    isEditing
                                      ? (e: React.MouseEvent) =>
                                          e.stopPropagation()
                                      : undefined
                                  }
                                >
                                  {isEditing ? (
                                    <>
                                      {/* Form selector dropdown inside Edit Mode */}
                                      <div className="inline-flex h-[24px] w-[50px] shrink-0 items-center rounded-full border border-slate-200 bg-white px-1 py-0.5 text-[10px] font-bold text-slate-705">
                                        <select
                                          value={s.form || "Video"}
                                          onChange={(e) =>
                                            updateSchedule(s.id, {
                                              form: e.target.value as any,
                                            })
                                          }
                                          className="w-full cursor-pointer border-none bg-transparent p-0 text-[10px] font-extrabold text-inherit focus:outline-none focus:ring-0"
                                        >
                                          <option
                                            value="Playable"
                                            className="bg-white text-slate-850"
                                          >
                                            试玩
                                          </option>
                                          <option
                                            value="Image"
                                            className="bg-white text-slate-850"
                                          >
                                            图片
                                          </option>
                                          <option
                                            value="Video"
                                            className="bg-white text-slate-850"
                                          >
                                            视频
                                          </option>
                                        </select>
                                      </div>

                                      {/* Broad direction selector dropdown inside Edit Mode */}
                                      <div className="inline-flex h-[24px] w-[62px] shrink-0 items-center rounded-full border border-slate-200 bg-white px-1 py-0.5 text-[10px] font-bold text-slate-705">
                                        <select
                                          value={s.broadDirection || "原始玩法"}
                                          onChange={(e) =>
                                            updateSchedule(s.id, {
                                              broadDirection: e.target
                                                .value as any,
                                            })
                                          }
                                          className="w-full cursor-pointer border-none bg-transparent p-0 text-[10px] font-extrabold text-inherit focus:outline-none focus:ring-0"
                                        >
                                          <option
                                            value="3D玩法"
                                            className="bg-white text-slate-850"
                                          >
                                            3D玩法
                                          </option>
                                          <option
                                            value="大字报"
                                            className="bg-white text-slate-850"
                                          >
                                            大字报
                                          </option>
                                          <option
                                            value="原始玩法"
                                            className="bg-white text-slate-850"
                                          >
                                            原始玩法
                                          </option>
                                        </select>
                                      </div>

                                      {/* Material Stage selector dropdown inside Edit Mode (Requirement 3) */}
                                      <div className="inline-flex h-[24px] w-[38px] shrink-0 items-center rounded-full border border-slate-200 bg-white px-1 py-0.5 text-[10px] font-bold text-slate-705">
                                        <select
                                          value={s.materialStage || "新"}
                                          onChange={(e) =>
                                            updateSchedule(s.id, {
                                              materialStage: e.target
                                                .value as any,
                                            })
                                          }
                                          className="w-full cursor-pointer border-none bg-transparent p-0 text-[10px] font-extrabold text-inherit focus:outline-none focus:ring-0"
                                        >
                                          <option
                                            value="新"
                                            className="bg-white text-slate-850"
                                          >
                                            新
                                          </option>
                                          <option
                                            value="迭"
                                            className="bg-white text-slate-850"
                                          >
                                            迭
                                          </option>
                                          <option
                                            value="老"
                                            className="bg-white text-slate-850"
                                          >
                                            老
                                          </option>
                                        </select>
                                      </div>
                                    </>
                                  ) : (
                                    <>
                                      {/* Read-Only Form badge */}
                                      <span
                                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-extrabold h-[24px] shrink-0 whitespace-nowrap ${
                                          s.form === "Playable"
                                            ? "bg-indigo-50 border-indigo-150 text-indigo-700"
                                            : s.form === "Image"
                                              ? "bg-amber-50 border-amber-150 text-amber-700"
                                              : "bg-rose-50 border-rose-150 text-rose-700"
                                        }`}
                                      >
                                        {s.form === "Playable" ? (
                                          <Gamepad2 className="w-2.5 h-2.5 shrink-0" />
                                        ) : s.form === "Image" ? (
                                          <ImageIcon className="w-2.5 h-2.5 shrink-0" />
                                        ) : (
                                          <Video className="w-2.5 h-2.5 shrink-0" />
                                        )}
                                        {s.form === "Playable"
                                          ? "试玩"
                                          : s.form === "Image"
                                            ? "图片"
                                            : "视频"}
                                      </span>

                                      {/* Read-Only Broad Direction badge */}
                                      <span
                                        className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-extrabold h-[24px] shrink-0 whitespace-nowrap ${
                                          s.broadDirection === "3D玩法"
                                            ? "bg-violet-50 border-violet-150 text-violet-700"
                                            : s.broadDirection === "大字报"
                                              ? "bg-red-50 border-red-150 text-red-700"
                                              : "bg-slate-50 border-slate-150 text-slate-650"
                                        }`}
                                      >
                                        {s.broadDirection || "原始玩法"}
                                      </span>

                                      {/* Read-Only Material Stage badge (Requirement 3) */}
                                      <span
                                        className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-extrabold h-[24px] shrink-0 whitespace-nowrap ${
                                          s.materialStage === "新"
                                            ? "bg-emerald-50 border-emerald-150 text-emerald-700"
                                            : s.materialStage === "迭"
                                              ? "bg-indigo-50 border-indigo-150 text-indigo-700"
                                              : "bg-slate-50 border-slate-150 text-slate-600"
                                        }`}
                                      >
                                        #{s.materialStage || "新"}
                                      </span>
                                    </>
                                  )}
                                </div>

                                <div
                                  className={`flex shrink-0 items-center justify-end gap-1.5 self-start min-[480px]:self-auto ${
                                    isEditing ? "flex-nowrap" : "flex-wrap"
                                  }`}
                                  onClick={
                                    isEditing
                                      ? (e: React.MouseEvent) =>
                                          e.stopPropagation()
                                      : undefined
                                  }
                                >
                                  {/* Priority tag (Selector or Display dropdown) */}
                                  {isEditing ? (
                                    <select
                                      value={s.priority || "Mid"}
                                      onChange={(e) =>
                                        updateSchedule(s.id, {
                                          priority: e.target.value as any,
                                        })
                                      }
                                      className={`h-[24px] w-[66px] shrink-0 cursor-pointer whitespace-nowrap rounded-full border px-1 py-0.5 text-[10px] font-bold outline-none ${
                                        s.priority === "Highest"
                                          ? "bg-rose-50 border-rose-200 text-rose-700 font-extrabold"
                                          : s.priority === "High"
                                            ? "bg-orange-50 border-orange-200 text-orange-700"
                                            : s.priority === "Low"
                                              ? "bg-slate-50 border-slate-200 text-slate-500"
                                              : "bg-indigo-50 border-indigo-200 text-indigo-700"
                                      }`}
                                    >
                                      <option value="Highest">🔴 最高</option>
                                      <option value="High">🟠 高</option>
                                      <option value="Mid">🟡 中</option>
                                      <option value="Low">🟢 低</option>
                                    </select>
                                  ) : (
                                    <span
                                      className={`px-2 py-0.5 rounded-full border text-[10px] font-extrabold h-[24px] flex items-center leading-none shrink-0 whitespace-nowrap ${
                                        s.priority === "Highest"
                                          ? "bg-rose-50 border-rose-150 text-rose-700"
                                          : s.priority === "High"
                                            ? "bg-orange-50 border-orange-150 text-orange-705"
                                            : s.priority === "Low"
                                              ? "bg-slate-50 border-slate-150 text-slate-500"
                                              : "bg-indigo-50 border-indigo-150 text-indigo-700"
                                      }`}
                                    >
                                      {s.priority === "Highest"
                                        ? "🔴 最高"
                                        : s.priority === "High"
                                          ? "🟠 高"
                                          : s.priority === "Low"
                                            ? "🟢 低"
                                            : "🟡 中"}
                                    </span>
                                  )}

                                  {/* Beautiful Edit / Save toggle button */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (isEditing) {
                                        setEditingScheduleId(null);
                                      } else {
                                        setEditingScheduleId(s.id);
                                      }
                                    }}
                                    className={`flex h-[24px] shrink-0 cursor-pointer items-center justify-center gap-1 rounded-full border py-0.5 text-[10px] font-bold whitespace-nowrap transition-all ${
                                      isEditing
                                        ? "w-[50px] bg-emerald-50 border-emerald-200 px-1 hover:bg-emerald-100 text-emerald-700 font-black shadow-xs"
                                        : "bg-indigo-50 border-indigo-200 px-2.5 hover:bg-indigo-100 text-indigo-700 hover:border-indigo-300 shadow-3xs"
                                    }`}
                                    title={
                                      isEditing
                                        ? "保存修改企划并锁定"
                                        : "编辑此创意企划"
                                    }
                                  >
                                    {isEditing ? (
                                      <>
                                        <CheckCircle className="w-3 h-3 text-emerald-600 shrink-0" />
                                        <span>保存</span>
                                      </>
                                    ) : (
                                      <>
                                        <FileEdit className="w-3 h-3 text-indigo-600 shrink-0" />
                                        <span>编辑</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>

                              {/* 方向 & 目标 */}
                              <div
                                className="mb-2"
                                onClick={
                                  isEditing
                                    ? (e: React.MouseEvent) =>
                                        e.stopPropagation()
                                    : undefined
                                }
                              >
                                {isEditing ? (
                                  <input
                                    value={s.directionName || ""}
                                    onChange={(e) =>
                                      updateSchedule(s.id, {
                                        directionName: e.target.value,
                                      })
                                    }
                                    placeholder="输入方向名称..."
                                    className="h-[38px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-0 text-sm font-black leading-none tracking-tight text-slate-850 transition-all hover:bg-slate-100/80 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-150"
                                    title="修改方向名称"
                                  />
                                ) : (
                                  <div
                                    className={`h-[38px] px-3 py-0 rounded-xl border flex items-center justify-between gap-2 shadow-3xs ${
                                      s.priority === "Highest"
                                        ? "bg-rose-50/70 text-rose-900 border-rose-150/60"
                                        : s.priority === "High"
                                          ? "bg-amber-50/70 text-amber-900 border-amber-150/60"
                                          : s.priority === "Low"
                                            ? "bg-emerald-55/75 text-emerald-900 border-emerald-150/60"
                                            : "bg-slate-50 text-slate-800 border-slate-150"
                                    }`}
                                  >
                                    <h3
                                      className="min-w-0 text-sm font-black tracking-tight leading-snug truncate"
                                      title={s.directionName}
                                    >
                                      {s.directionName || "未命名方向"}
                                    </h3>
                                    {scheduleDelayedItems.length > 0 && (
                                      <span
                                        tabIndex={0}
                                        className="inline-flex h-6 shrink-0 items-center gap-1 rounded-full border border-rose-150 bg-white/90 px-2 text-[9px] font-black text-rose-600"
                                        aria-label={`延期需求 ${scheduleDelayedItems.length} 个：${scheduleDelayedItems[0].req.id} 已延期 ${scheduleDelayedItems[0].delayedDays} 天`}
                                        onMouseEnter={(event) =>
                                          showInstantTooltip(
                                            event,
                                            `延期需求 ${scheduleDelayedItems.length} 个：${scheduleDelayedItems[0].req.id} 已延期 ${scheduleDelayedItems[0].delayedDays} 天`,
                                          )
                                        }
                                        onMouseLeave={() => setInstantTooltip(null)}
                                        onFocus={(event) =>
                                          showInstantTooltip(
                                            event,
                                            `延期需求 ${scheduleDelayedItems.length} 个：${scheduleDelayedItems[0].req.id} 已延期 ${scheduleDelayedItems[0].delayedDays} 天`,
                                          )
                                        }
                                        onBlur={() => setInstantTooltip(null)}
                                      >
                                        <AlertCircle className="h-3 w-3" />
                                        {scheduleDelayedItems.length}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>

                              <div
                                className="mb-3 flex h-[34px] items-center gap-1 rounded-xl border border-slate-100 bg-slate-50 px-2.5 py-0"
                                onClick={
                                  isEditing
                                    ? (e: React.MouseEvent) =>
                                        e.stopPropagation()
                                    : undefined
                                }
                              >
                                <Target className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                {isEditing ? (
                                  <input
                                    value={s.validationGoal || ""}
                                    onChange={(e) =>
                                      updateSchedule(s.id, {
                                        validationGoal: e.target.value,
                                      })
                                    }
                                    placeholder="关联测试假说或检验目标..."
                                    className="h-7 w-full rounded border border-slate-200 bg-white px-2 py-0 text-[11px] font-bold text-slate-600 transition-all hover:border-slate-300 focus:border-indigo-505 focus:outline-none"
                                    title="修改测试目标"
                                  />
                                ) : (
                                  <p
                                    className="text-[11px] text-slate-600 font-bold leading-relaxed truncate block max-w-full"
                                    title={s.validationGoal}
                                  >
                                    {s.validationGoal ||
                                      "暂无验证假说或检验目标..."}
                                  </p>
                                )}
                              </div>

                              {/* 属性网格 */}
                              <div className="mb-3 grid grid-cols-1 gap-x-2 gap-y-2 rounded-xl border-t border-b border-slate-100/70 bg-slate-50/30 p-2 py-2 text-[10px] min-[440px]:grid-cols-2">
                                {/* 负责人 */}
                                <div
                                  className="flex items-center gap-1 text-slate-600"
                                  onClick={
                                    isEditing
                                      ? (e: React.MouseEvent) =>
                                          e.stopPropagation()
                                      : undefined
                                  }
                                >
                                  <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <span className="font-semibold text-slate-400 shrink-0">
                                    负责:
                                  </span>
                                  {isEditing ? (
                                    <div className="flex min-w-0 flex-1 items-center gap-1">
                                      <img
                                        src={getPersonAvatarUrl(s.owner)}
                                        alt={s.owner || "未指派"}
                                        className="h-5 w-5 shrink-0 rounded-full border border-slate-200 bg-white object-cover"
                                        referrerPolicy="no-referrer"
                                      />
                                      <select
                                        value={s.owner || ""}
                                        onChange={(e) =>
                                          updateSchedule(s.id, {
                                            owner: e.target.value,
                                          })
                                        }
                                        className="h-6 min-w-0 flex-1 rounded border border-slate-200 bg-white px-1 py-0.5 text-[10px] font-extrabold text-slate-705 hover:border-slate-300 focus:outline-none"
                                      >
                                        {CREATIVE_PEOPLE.map((person) => (
                                          <option key={person}>{person}</option>
                                        ))}
                                      </select>
                                    </div>
                                  ) : (
                                    <PersonBadge
                                      name={s.owner}
                                      size="xs"
                                      className="rounded border border-slate-100 bg-white px-1 py-0.5"
                                    />
                                  )}
                                </div>

                                {/* 场景 */}
                                <div
                                  className="flex items-center gap-1 text-slate-600"
                                  onClick={
                                    isEditing
                                      ? (e: React.MouseEvent) =>
                                          e.stopPropagation()
                                      : undefined
                                  }
                                >
                                  <Compass className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <span className="font-semibold text-slate-400 shrink-0">
                                    场景:
                                  </span>
                                  {isEditing ? (
                                    <select
                                      value={s.scenario || "Standard"}
                                      onChange={(e) =>
                                        updateSchedule(s.id, {
                                          scenario: e.target.value as any,
                                        })
                                      }
                                      className="bg-white border border-slate-200 hover:border-slate-300 px-1 py-0.5 rounded text-[10px] font-extrabold text-slate-705 focus:outline-none h-6 flex-1 min-w-[65px]"
                                    >
                                      <option value="Standard">通投</option>
                                      <option value="ASO">ASO</option>
                                      <option value="Localized">本地化</option>
                                    </select>
                                  ) : (
                                    <span
                                      className={`font-extrabold bg-white px-1.5 py-0.5 rounded border border-slate-100 font-sans ${
                                        s.scenario === "Localized"
                                          ? "text-blue-600 border-blue-100 bg-blue-50/10"
                                          : s.scenario === "ASO"
                                            ? "text-amber-600 border-amber-100 bg-amber-50/10"
                                            : "text-slate-655"
                                      }`}
                                    >
                                      {s.scenario === "Localized"
                                        ? "本地化"
                                        : s.scenario === "ASO"
                                          ? "ASO"
                                          : "通投"}
                                    </span>
                                  )}
                                </div>

                                {/* 渠道 */}
                                <div
                                  className="flex items-center gap-1 text-slate-600 min-[440px]:col-span-2"
                                  onClick={
                                    isEditing
                                      ? (e: React.MouseEvent) =>
                                          e.stopPropagation()
                                      : undefined
                                  }
                                >
                                  <Radio className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <span className="font-semibold text-slate-400 shrink-0">
                                    渠道:
                                  </span>
                                  {isEditing ? (
                                    <select
                                      value={s.channels?.[0] || "all"}
                                      onChange={(e) =>
                                        updateSchedule(s.id, {
                                          channels: [e.target.value],
                                        })
                                      }
                                      className="bg-white border border-slate-200 hover:border-slate-300 px-1.5 py-0.5 rounded text-[10px] font-extrabold text-slate-705 focus:outline-none h-6 flex-1 min-w-[125px] uppercase font-mono"
                                    >
                                      <option value="all">ALL</option>
                                      <option value="apl">APL</option>
                                      <option value="fb">FB</option>
                                      <option value="uac">UAC</option>
                                      <option value="adjoe">ADJOE</option>
                                      <option value="moloco">MOLOCO</option>
                                      <option value="unity">UNITY</option>
                                    </select>
                                  ) : (
                                    (() => {
                                      const chan = s.channels?.[0] || "all";
                                      const chanNorm = chan.toLowerCase();
                                      let colorClasses = "";
                                      if (chanNorm === "fb") {
                                        colorClasses =
                                          "text-blue-600 border-blue-100 bg-blue-50/40";
                                      } else if (chanNorm === "uac") {
                                        colorClasses =
                                          "text-emerald-600 border-emerald-100 bg-emerald-50/40";
                                      } else if (chanNorm === "apl") {
                                        colorClasses =
                                          "text-orange-600 border-orange-100 bg-orange-50/40";
                                      } else if (chanNorm === "adjoe") {
                                        colorClasses =
                                          "text-fuchsia-600 border-fuchsia-100 bg-fuchsia-50/40";
                                      } else if (chanNorm === "moloco") {
                                        colorClasses =
                                          "text-rose-600 border-rose-100 bg-rose-50/40";
                                      } else if (chanNorm === "unity") {
                                        colorClasses =
                                          "text-purple-600 border-purple-100 bg-purple-50/40";
                                      } else {
                                        colorClasses =
                                          "text-slate-600 border-slate-200 bg-slate-50/70";
                                      }
                                      return (
                                        <span
                                          className={`font-extrabold uppercase px-2 py-0.5 rounded border font-mono flex-1 text-center text-[10px] ${colorClasses}`}
                                        >
                                          {chan.toUpperCase()}
                                        </span>
                                      );
                                    })()
                                  )}
                                </div>

                                {/* 初版验收与截止时间 */}
                                <div
                                  className="grid grid-cols-1 min-[520px]:grid-cols-2 gap-2 text-slate-600 min-[440px]:col-span-2"
                                  onClick={
                                    isEditing
                                      ? (e: React.MouseEvent) =>
                                          e.stopPropagation()
                                      : undefined
                                  }
                                >
                                  {/* 初版 Acceptance Date */}
                                  <div className="flex items-center gap-1 min-w-0">
                                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    <span className="font-semibold text-slate-400 shrink-0">
                                      初版:
                                    </span>
                                    {isEditing ? (
                                      <input
                                        type="date"
                                        value={s.acceptanceDate || ""}
                                        onClick={openNativeDatePicker}
                                        onChange={(e) =>
                                          updateSchedule(s.id, {
                                            acceptanceDate: e.target.value,
                                          })
                                        }
                                        className="bg-white border border-slate-200 hover:border-slate-300 px-1 py-0.5 rounded text-[10px] font-bold text-slate-605 focus:outline-none flex-1 min-w-0 font-mono h-6"
                                        title="修改初版验收时间"
                                      />
                                    ) : (
                                      <span className="font-mono font-bold text-slate-650 bg-white px-1.5 py-0.5 rounded border border-slate-100 flex-1 text-[10px] text-center">
                                        {s.acceptanceDate || "--"}
                                      </span>
                                    )}
                                  </div>

                                  {/* 截止 Deadline */}
                                  <div className="flex items-center gap-1 min-w-0">
                                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    <span className="font-semibold text-slate-400 shrink-0">
                                      截止:
                                    </span>
                                    {isEditing ? (
                                      <input
                                        type="date"
                                        value={s.submissionDeadline || ""}
                                        onClick={openNativeDatePicker}
                                        onChange={(e) =>
                                          updateSchedule(s.id, {
                                            submissionDeadline: e.target.value,
                                          })
                                        }
                                        className="bg-white border border-slate-200 hover:border-slate-300 px-1 py-0.5 rounded text-[10px] font-bold text-slate-605 focus:outline-none flex-1 min-w-0 font-mono h-6"
                                        title="修改截止时间"
                                      />
                                    ) : (
                                      <span className="font-mono font-bold text-slate-650 bg-white px-1.5 py-0.5 rounded border border-slate-100 flex-1 text-[10px] text-center">
                                        {s.submissionDeadline || "--"}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* 两个部分进度条同时显示 */}
                            <div className="mt-auto shrink-0 space-y-3 pt-3 border-t border-slate-100">
                              {/* 1. 需求提交进度 (Requirement 5) */}
                              <div>
                                {(() => {
                                  const approvedReqsCount =
                                    associatedReqs.filter(
                                      (r) => r.reqStatus === "Approved",
                                    ).length;
                                  const pendingReqsCount =
                                    associatedReqs.filter(
                                      (r) =>
                                        r.reqStatus === "Pending" ||
                                        r.reqStatus === "Modification",
                                    ).length;
                                  const totalPlannedCount =
                                    s.totalRequiredCount || 1;
                                  const unsubmittedReqsCount = Math.max(
                                    0,
                                    totalPlannedCount -
                                      approvedReqsCount -
                                      pendingReqsCount,
                                  );

                                  const approvedPct = Math.min(
                                    100,
                                    (approvedReqsCount / totalPlannedCount) *
                                      100,
                                  );
                                  const pendingPct = Math.min(
                                    100 - approvedPct,
                                    (pendingReqsCount / totalPlannedCount) *
                                      100,
                                  );
                                  const localSubmissionPercent = Math.min(
                                    100,
                                    Math.round(
                                      ((approvedReqsCount + pendingReqsCount) /
                                        totalPlannedCount) *
                                        100,
                                    ),
                                  );

                                  return (
                                    <>
                                      <div
                                        className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 mb-1 text-[10px]"
                                        onClick={
                                          isEditing
                                            ? (e: React.MouseEvent) =>
                                                e.stopPropagation()
                                            : undefined
                                        }
                                      >
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          <span className="font-extrabold text-slate-500 uppercase tracking-tight flex items-center gap-1 shrink-0">
                                            <span className="w-1.5 h-1.5 bg-indigo-550 rounded-full inline-block shrink-0" />{" "}
                                            1. 需求提交进度
                                          </span>
                                          {isEditing ? (
                                            <div className="flex items-center gap-1 text-[9px] shrink-0">
                                              <div className="flex items-center gap-1 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                                                <span className="text-slate-400 font-bold">
                                                  有效:
                                                </span>
                                                <input
                                                  type="number"
                                                  min={0}
                                                  value={s.validCount}
                                                  onFocus={(e) =>
                                                    e.currentTarget.select()
                                                  }
                                                  onChange={(e) =>
                                                    updateSchedule(s.id, {
                                                      validCount:
                                                        Number.isNaN(
                                                          e.currentTarget
                                                            .valueAsNumber,
                                                        )
                                                          ? 0
                                                          : Math.max(
                                                              0,
                                                              e.currentTarget
                                                                .valueAsNumber,
                                                            ),
                                                    })
                                                  }
                                                  className="no-number-stepper h-4 w-8 rounded border border-slate-200 bg-white px-1 text-center font-mono text-[10px] font-bold text-slate-700 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                                                  title="输入有效个数"
                                                />
                                              </div>
                                              <span className="text-slate-300 font-bold">
                                                /
                                              </span>
                                              <div className="flex items-center gap-1 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                                                <span className="text-slate-400 font-bold">
                                                  总:
                                                </span>
                                                <input
                                                  type="number"
                                                  min={1}
                                                  value={s.totalRequiredCount}
                                                  onFocus={(e) =>
                                                    e.currentTarget.select()
                                                  }
                                                  onChange={(e) =>
                                                    updateSchedule(s.id, {
                                                      totalRequiredCount:
                                                        Number.isNaN(
                                                          e.currentTarget
                                                            .valueAsNumber,
                                                        )
                                                          ? 1
                                                          : Math.max(
                                                              1,
                                                              e.currentTarget
                                                                .valueAsNumber,
                                                            ),
                                                    })
                                                  }
                                                  className="no-number-stepper h-4 w-8 rounded border border-slate-200 bg-white px-1 text-center font-mono text-[10px] font-bold text-slate-700 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                                                  title="输入总计划数"
                                                />
                                              </div>
                                            </div>
                                          ) : (
                                            <span className="text-slate-500 font-bold ml-1 font-sans shrink-0">
                                              <span className="text-[9px] flex items-center gap-1 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100/70">
                                                <span>
                                                  有效:{" "}
                                                  <strong className="text-slate-700 font-bold">
                                                    {s.validCount}
                                                  </strong>
                                                </span>
                                                <span className="text-slate-300">
                                                  |
                                                </span>
                                                <span>
                                                  总:{" "}
                                                  <strong className="text-slate-705 font-bold">
                                                    {s.totalRequiredCount}
                                                  </strong>
                                                </span>
                                              </span>
                                            </span>
                                          )}
                                        </div>
                                        <span className="font-mono font-black text-emerald-600 shrink-0 font-sans">
                                          {localSubmissionPercent}%
                                        </span>
                                      </div>
                                      <div
                                        className="w-full h-2 bg-slate-150 rounded-full flex overflow-hidden border border-slate-200/60 shadow-3xs hover:opacity-90 transition-opacity"
                                        title={`审核通过: ${approvedReqsCount} | 待审核: ${pendingReqsCount} | 未提交: ${unsubmittedReqsCount}`}
                                      >
                                        {approvedPct > 0 && (
                                          <div
                                            className="h-full bg-emerald-500 transition-all duration-300 shrink-0"
                                            style={{ width: `${approvedPct}%` }}
                                          />
                                        )}
                                        {pendingPct > 0 && (
                                          <div
                                            className="h-full bg-amber-400 transition-all duration-300 shrink-0"
                                            style={{ width: `${pendingPct}%` }}
                                          />
                                        )}
                                      </div>
                                      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-[8px] font-bold text-slate-400 mt-1 uppercase select-none">
                                        <span className="flex items-center gap-0.5 text-slate-400 shrink-0">
                                          <span className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
                                          未提交:{unsubmittedReqsCount}
                                        </span>
                                        <span className="flex items-center gap-0.5 text-amber-500 font-sans shrink-0">
                                          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                                          待审核:{pendingReqsCount}
                                        </span>
                                        <span className="flex items-center gap-0.5 text-emerald-600 font-sans shrink-0">
                                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                          审核通过:{approvedReqsCount}
                                        </span>
                                      </div>
                                    </>
                                  );
                                })()}
                              </div>

                              {/* 2. 制作完成进度 */}
                              <div>
                                <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 mb-1 text-[10px]">
                                  <span className="font-extrabold text-slate-500 uppercase tracking-tight flex flex-wrap items-center gap-1">
                                    <span className="inline-flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 bg-emerald-505 rounded-full inline-block shrink-0" />{" "}
                                      2. 制作完成进度
                                    </span>
                                    {scheduleInsight && !isEditing && (
                                      <span
                                        className={`inline-flex h-5 items-center rounded-full border px-2 text-[9px] font-black ${scheduleInsight.statusTone}`}
                                        title={scheduleInsight.suggestion}
                                      >
                                        {scheduleInsight.status}
                                      </span>
                                    )}
                                    {scheduleInsight && scheduleInsight.completedNotLaunched > 0 && !isEditing && (
                                      <span
                                        className="inline-flex h-5 items-center rounded-full border border-emerald-150 bg-emerald-50 px-2 text-[9px] font-black text-emerald-700"
                                        title="已完成且未投放，可进入投放打包建议"
                                      >
                                        可打包 {scheduleInsight.completedNotLaunched}
                                      </span>
                                    )}
                                  </span>
                                  <span className="font-mono font-black text-emerald-600 font-sans">
                                    {totalProdPercent}%
                                  </span>
                                </div>
                                <div
                                  className="w-full h-2 bg-slate-150 rounded-full flex overflow-hidden border border-slate-200/60 shadow-3xs"
                                  title={`未开始: ${scheduledReqs} | 进行中: ${inProgressReqs} | 已完成: ${completedReqs}`}
                                >
                                  {completedPercent > 0 && (
                                    <div
                                      className="h-full bg-emerald-500 transition-all duration-300 shrink-0"
                                      style={{ width: `${completedPercent}%` }}
                                    />
                                  )}
                                  {inProgressPercent > 0 && (
                                    <div
                                      className="h-full bg-blue-500 transition-all duration-300 shrink-0"
                                      style={{ width: `${inProgressPercent}%` }}
                                    />
                                  )}
                                </div>
                                <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-[8px] font-bold text-slate-400 mt-1 uppercase select-none">
                                  <span className="flex items-center gap-0.5 shrink-0">
                                    <span className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
                                    未开始:{scheduledReqs}
                                  </span>
                                  <span className="flex items-center gap-0.5 text-blue-550 font-sans shrink-0">
                                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                    进行中:{inProgressReqs}
                                  </span>
                                  <span className="flex items-center gap-0.5 text-emerald-600 font-sans shrink-0">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                    已完成:{completedReqs}
                                  </span>
                                </div>
                              </div>

                              {/* 关联需求和详情按钮 (Requirement 6 & 7) */}
                              <div className="mt-auto flex min-h-10 items-center justify-between gap-3 pt-4">
                                <div className="flex min-w-0 flex-1 flex-nowrap items-center gap-1 overflow-hidden">
                                  {visibleAssociatedReqs.map((req) => {
                                    const baseId = req.id.split("-")[0];
                                    const statusColorClass =
                                      req.prodStatus === "Completed"
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-150"
                                        : req.prodStatus === "InProgress"
                                          ? "bg-sky-50 text-sky-700 border-sky-150"
                                          : "bg-slate-50 text-slate-550 border-slate-150";
                                    const statusLabel =
                                      req.prodStatus === "Completed"
                                        ? "已完成"
                                        : req.prodStatus === "InProgress"
                                          ? "进行中"
                                          : "未开始";

                                    return (
                                      <span
                                        key={req.id}
                                        className={`shrink-0 rounded-md border px-1.5 py-0.5 text-[9px] font-black font-mono shadow-3xs transition-all hover:scale-105 ${statusColorClass}`}
                                        title={`${req.id} (${req.name}) - 制作状态: ${statusLabel}`}
                                      >
                                        {baseId}
                                      </span>
                                    );
                                  })}
                                  {hiddenAssociatedReqCount > 0 && (
                                    <span
                                      className="shrink-0 rounded-md border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[8px] font-black text-slate-500 font-sans shadow-3xs"
                                      title={`还有 ${hiddenAssociatedReqCount} 个额外关联需求`}
                                    >
                                      +{hiddenAssociatedReqCount}
                                    </span>
                                  )}
                                  {associatedReqs.length === 0 && (
                                    <span className="truncate text-[10px] text-slate-450 italic font-sans font-medium">
                                      暂无关联需求
                                    </span>
                                  )}
                                </div>

                                <button
                                  type="button"
                                  disabled={isEditing}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (isEditing) return;
                                    handleAddRequirementForDirection(s.id);
                                  }}
                                  className={`relative z-20 inline-flex h-[34px] shrink-0 items-center justify-center gap-1.5 rounded-lg px-3 text-[10px] font-black whitespace-nowrap transition-all duration-200 ${
                                    isEditing
                                      ? "cursor-not-allowed bg-slate-100 text-slate-400 ring-1 ring-slate-200 shadow-none"
                                      : "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 ring-1 ring-indigo-500 hover:bg-slate-950 hover:ring-slate-950 hover:-translate-y-0.5"
                                  }`}
                                  title={isEditing ? "保存方向后再新建需求" : "新建需求"}
                                >
                                  <Plus className="w-3 h-3" />
                                  新建需求
                                </button>
                              </div>
                            </div>

                            {/* Hover删除垃圾箱 */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm("确定删除此排期及方向？"))
                                  setSchedules(
                                    schedules.filter(
                                      (item) => item.id !== s.id,
                                    ),
                                  );
                              }}
                              className={`absolute top-2.5 right-2.5 rounded-lg border border-slate-200 bg-white/95 p-1 text-slate-350 shadow-3xs transition-all hover:bg-rose-50 hover:text-rose-600 ${
                                isEditing
                                  ? "hidden"
                                  : "opacity-0 group-hover:opacity-100"
                              }`}
                              title="删除此方向"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* 创建新方向的横幅 */}
                  <div
                    onClick={() => addScheduleRow(selectedWeekRange, false)}
                    className="py-3 border border-dashed border-slate-300 hover:border-primary hover:bg-slate-50/50 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all group"
                  >
                    <Plus className="w-4 h-4 text-slate-400 group-hover:text-primary group-hover:scale-105 transition-all" />
                    <span className="text-[11px] font-bold text-slate-500 group-hover:text-primary transition-colors">
                      创建新的创意排期方向
                    </span>
                  </div>
                </div>
  </>
);
