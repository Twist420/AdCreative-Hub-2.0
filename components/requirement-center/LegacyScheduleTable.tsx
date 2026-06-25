import { Calendar, ChevronDown, Plus, Trash2 } from "lucide-react";
import type { CreativeDifficulty, CreativeForm, CreativeScenario, CreativeDirectionType, CreativeSchedule, Requirement, RequirementPriority } from "../../types";
import { PersonBadge } from "./people";
import { openNativeDatePicker } from "./dateUtils";

type FormConfig = {
  icon: React.ComponentType<{ className?: string }> | null;
  color: string;
};

type LegacyScheduleTableProps = {
  groupedSchedules: Record<string, CreativeSchedule[]>;
  collapsedWeeks: Record<string, boolean>;
  schedules: CreativeSchedule[];
  requirements: Requirement[];
  toggleWeek: (week: string) => void;
  setSchedules: React.Dispatch<React.SetStateAction<CreativeSchedule[]>>;
  addScheduleRow: (weekRange?: string, atTop?: boolean) => void;
  updateSchedule: (id: string, updates: Partial<CreativeSchedule>) => void;
  setSelectedReq: (requirement: Requirement) => void;
  setViewingSpecificRequirements: (requirements: Requirement[]) => void;
  getPriorityStyle: (priority: RequirementPriority) => string;
  getDifficultyStyle: (difficulty: CreativeDifficulty) => string;
  getFormConfig: (form: CreativeForm) => FormConfig;
  getScenarioStyle: (scenario: CreativeScenario) => string;
  getDirectionTypeStyle: (type: CreativeDirectionType) => string;
};

export const LegacyScheduleTable = ({
  groupedSchedules,
  collapsedWeeks,
  schedules,
  requirements,
  toggleWeek,
  setSchedules,
  addScheduleRow,
  updateSchedule,
  setSelectedReq,
  setViewingSpecificRequirements,
  getPriorityStyle,
  getDifficultyStyle,
  getFormConfig,
  getScenarioStyle,
  getDirectionTypeStyle,
}: LegacyScheduleTableProps) => (
                <div className="hidden">
                  <div className="p-0">
                    {Object.entries(groupedSchedules).map(
                      ([week, weekSchedules]) => (
                        <div key={week} className="mb-6">
                          {/* 按周分组展示 */}
                          <div
                            onClick={() => toggleWeek(week)}
                            className="sticky top-0 z-20 border-l-4 border-primary bg-primary/5 px-6 py-4 flex items-center justify-between cursor-pointer group"
                          >
                            <div className="flex items-center gap-4">
                              <Calendar className="w-5 h-5 text-primary" />
                              <input
                                value={week}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setSchedules((prev) =>
                                    prev.map((s) =>
                                      s.weekRange === week
                                        ? { ...s, weekRange: val }
                                        : s,
                                    ),
                                  );
                                }}
                                className="text-lg font-black text-slate-800 bg-transparent border-none focus:ring-0 p-0 w-64"
                              />
                              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                                {weekSchedules.length} 个方向
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addScheduleRow(week, true);
                                }}
                                className="ml-4 bg-primary text-white border border-primary/20 rounded-lg shadow-md hover:bg-slate-900 transition-all flex items-center justify-center gap-1.5 px-4 py-1.5"
                              >
                                <Plus className="w-4 h-4" />
                                <span className="text-[11px] font-black">
                                  添加排期方向
                                </span>
                              </button>
                            </div>
                            <ChevronDown
                              className={`w-5 h-5 text-slate-400 transition-all ${collapsedWeeks[week] ? "-rotate-90" : ""}`}
                            />
                          </div>

                          {!collapsedWeeks[week] && (
                            <table className="w-full text-left border-collapse">
                              <thead className="bg-slate-50 sticky top-[60px] z-10 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider shadow-sm">
                                <tr>
                                  <th className="px-4 py-4 w-[200px]">
                                    方向名称
                                  </th>
                                  <th className="px-4 py-4">时间节点</th>
                                  <th className="px-4 py-4">对应需求</th>
                                  <th className="px-4 py-4">优先级</th>
                                  <th className="px-4 py-4">难度</th>
                                  <th className="px-4 py-4">形式</th>
                                  <th className="px-4 py-4">场景</th>
                                  <th className="px-4 py-4">类型</th>
                                  <th className="px-4 py-4 text-center">
                                    排期进度 (提审/总需)
                                  </th>
                                  <th className="px-4 py-4">负责人</th>
                                  <th className="px-4 py-4 text-right">操作</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50 text-[11px]">
                                {weekSchedules.map((row) => {
                                  const formConfig = getFormConfig(row.form);
                                  return (
                                    <tr
                                      key={row.id}
                                      className="hover:bg-slate-50/50 transition-colors"
                                    >
                                      <td className="px-4 py-4">
                                        <input
                                          value={row.directionName}
                                          onChange={(e) =>
                                            updateSchedule(row.id, {
                                              directionName: e.target.value,
                                            })
                                          }
                                          className="w-full bg-transparent border-none font-black text-slate-800 focus:ring-0 p-0 text-sm"
                                        />
                                      </td>
                                      <td className="px-4 py-4 text-[10px] text-slate-500 space-y-1 min-w-[140px]">
                                        <div className="flex items-center gap-2">
                                          <span className="w-12 text-slate-400 font-bold">
                                            需求截止:
                                          </span>
                                          <input
                                            type="date"
                                            value={row.requirementEnd}
                                            onClick={openNativeDatePicker}
                                            onChange={(e) =>
                                              updateSchedule(row.id, {
                                                requirementEnd: e.target.value,
                                              })
                                            }
                                            className="bg-slate-50 px-1 border border-slate-100 rounded text-[10px] font-mono focus:ring-0"
                                          />
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className="w-12 text-slate-400 font-bold">
                                            制作截止:
                                          </span>
                                          <input
                                            type="date"
                                            value={row.productionEnd}
                                            onClick={openNativeDatePicker}
                                            onChange={(e) =>
                                              updateSchedule(row.id, {
                                                productionEnd: e.target.value,
                                              })
                                            }
                                            className="bg-slate-50 px-1 border border-slate-100 rounded text-[10px] font-mono focus:ring-0"
                                          />
                                        </div>
                                      </td>
                                      <td className="px-4 py-4">
                                        <div className="flex flex-wrap gap-1 max-w-[120px]">
                                          {requirements
                                            .filter(
                                              (r) => r.scheduleId === row.id,
                                            )
                                            .slice(0, 2)
                                            .map((r) => (
                                              <button
                                                key={r.id}
                                                onClick={() =>
                                                  setSelectedReq(r)
                                                }
                                                className="px-1.5 py-0.5 bg-slate-100 hover:bg-primary/10 hover:text-primary rounded text-[9px] font-mono font-bold text-slate-500 transition-all border border-slate-200 shadow-sm"
                                              >
                                                {r.id.split("-")[0]}
                                              </button>
                                            ))}
                                          {requirements.filter(
                                            (r) => r.scheduleId === row.id,
                                          ).length > 2 && (
                                            <button
                                              onClick={() =>
                                                setViewingSpecificRequirements(
                                                  requirements.filter(
                                                    (r) =>
                                                      r.scheduleId === row.id,
                                                  ),
                                                )
                                              }
                                              className="px-1.5 py-0.5 bg-indigo-50 border border-indigo-100 rounded text-[9px] font-black text-indigo-500 hover:bg-indigo-100 transition-all shadow-sm"
                                            >
                                              +
                                              {requirements.filter(
                                                (r) => r.scheduleId === row.id,
                                              ).length - 2}
                                            </button>
                                          )}
                                          {requirements.filter(
                                            (r) => r.scheduleId === row.id,
                                          ).length === 0 && (
                                            <span className="text-[10px] text-slate-300 italic">
                                              未关联
                                            </span>
                                          )}
                                        </div>
                                      </td>

                                      <td className="px-4 py-4">
                                        <select
                                          value={row.priority}
                                          onChange={(e) =>
                                            updateSchedule(row.id, {
                                              priority: e.target.value as any,
                                            })
                                          }
                                          className={`px-2 py-1 rounded font-black border-none text-[10px] focus:ring-0 cursor-pointer ${getPriorityStyle(row.priority)}`}
                                        >
                                          <option
                                            value=""
                                            className="text-slate-400 bg-white italic"
                                          >
                                            请选择
                                          </option>
                                          <option
                                            value="Low"
                                            className="text-slate-900 bg-white"
                                          >
                                            低
                                          </option>
                                          <option
                                            value="Mid"
                                            className="text-slate-900 bg-white"
                                          >
                                            中
                                          </option>
                                          <option
                                            value="High"
                                            className="text-slate-900 bg-white"
                                          >
                                            高
                                          </option>
                                          <option
                                            value="Highest"
                                            className="text-slate-900 bg-white"
                                          >
                                            最高
                                          </option>
                                        </select>
                                      </td>
                                      <td className="px-4 py-4">
                                        <select
                                          value={row.difficulty}
                                          onChange={(e) =>
                                            updateSchedule(row.id, {
                                              difficulty: e.target.value as any,
                                            })
                                          }
                                          className={`px-2 py-1 rounded-lg border text-[10px] font-bold focus:ring-0 ${getDifficultyStyle(row.difficulty)}`}
                                        >
                                          <option
                                            value=""
                                            className="text-slate-400 bg-white"
                                          >
                                            请选择
                                          </option>
                                          <option value="Senior">高级</option>
                                          <option value="Junior">初级</option>
                                          <option value="Test">测试</option>
                                        </select>
                                      </td>
                                      <td className="px-4 py-4">
                                        <div
                                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black ${formConfig.color}`}
                                        >
                                          {formConfig.icon && (
                                            <formConfig.icon className="w-3 h-3" />
                                          )}
                                          <select
                                            value={row.form}
                                            onChange={(e) =>
                                              updateSchedule(row.id, {
                                                form: e.target.value as any,
                                              })
                                            }
                                            className="bg-transparent border-none p-0 focus:ring-0 text-[10px] font-black"
                                          >
                                            <option
                                              value=""
                                              className="text-slate-400 bg-white italic"
                                            >
                                              请选择
                                            </option>
                                            <option value="Video">视频</option>
                                            <option value="Playable">
                                              试玩
                                            </option>
                                            <option value="Image">图片</option>
                                          </select>
                                        </div>
                                      </td>
                                      <td className="px-4 py-4">
                                        <select
                                          value={row.scenario}
                                          onChange={(e) =>
                                            updateSchedule(row.id, {
                                              scenario: e.target.value as any,
                                            })
                                          }
                                          className={`px-2 py-1 rounded-lg text-[10px] font-bold focus:ring-0 border-none ${getScenarioStyle(row.scenario)}`}
                                        >
                                          <option
                                            value=""
                                            className="text-slate-400 bg-white italic"
                                          >
                                            请选择
                                          </option>
                                          <option value="Standard">通投</option>
                                          <option value="Localized">
                                            本地化
                                          </option>
                                          <option value="ASO">ASO</option>
                                        </select>
                                      </td>
                                      <td className="px-4 py-4">
                                        <select
                                          value={row.directionType}
                                          onChange={(e) =>
                                            updateSchedule(row.id, {
                                              directionType: e.target
                                                .value as any,
                                            })
                                          }
                                          className={`px-2 py-1 rounded-lg border text-[10px] font-bold focus:ring-0 ${getDirectionTypeStyle(row.directionType)}`}
                                        >
                                          <option
                                            value=""
                                            className="text-slate-400 bg-white italic"
                                          >
                                            请选择
                                          </option>
                                          <option value="Original-Gameplay">
                                            原创-玩法
                                          </option>
                                          <option value="Original-Hook">
                                            原创-吸量
                                          </option>
                                          <option value="Original-Master">
                                            原创-母版
                                          </option>
                                          <option value="Scaling-Iteration">
                                            放量-迭代
                                          </option>
                                          <option value="Scaling-Editing">
                                            放量-剪辑
                                          </option>
                                          <option value="Test-Hook">
                                            测试-吸量
                                          </option>
                                          <option value="Test-Gameplay">
                                            测试-玩法
                                          </option>
                                        </select>
                                      </td>
                                      <td className="px-4 py-4">
                                        <div className="flex flex-col gap-2 w-full max-w-[140px] mx-auto">
                                          {/* 总提审进度 */}
                                          <div className="space-y-1">
                                            <div className="flex justify-between items-center text-[9px] font-bold">
                                              <span className="text-slate-400">
                                                总需求数
                                              </span>
                                              <div className="flex items-center gap-1">
                                                <span className="text-slate-900">
                                                  {row.submittedCount}
                                                </span>
                                                <span className="text-slate-300">
                                                  /
                                                </span>
                                                <input
                                                  type="number"
                                                  value={row.totalRequiredCount}
                                                  onChange={(e) =>
                                                    updateSchedule(row.id, {
                                                      totalRequiredCount:
                                                        parseInt(
                                                          e.target.value,
                                                        ) || 0,
                                                    })
                                                  }
                                                  className="w-8 bg-transparent border-none p-0 text-slate-400 focus:ring-0 text-[10px] font-bold"
                                                />
                                              </div>
                                            </div>
                                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                              <div
                                                className="h-full bg-primary"
                                                style={{
                                                  width: `${(row.submittedCount / (row.totalRequiredCount || 1)) * 100}%`,
                                                }}
                                              ></div>
                                            </div>
                                          </div>
                                          {/* 有效产出进度 */}
                                          <div className="space-y-1">
                                            <div className="flex justify-between items-center text-[9px] font-bold">
                                              <span className="text-emerald-500">
                                                有效产出
                                              </span>
                                              <div className="flex items-center gap-1">
                                                <input
                                                  type="number"
                                                  value={row.validCount}
                                                  onChange={(e) =>
                                                    updateSchedule(row.id, {
                                                      validCount:
                                                        parseInt(
                                                          e.target.value,
                                                        ) || 0,
                                                    })
                                                  }
                                                  className="w-8 bg-white border border-emerald-100 rounded px-1 py-0.5 text-emerald-600 focus:ring-1 focus:ring-emerald-200 text-[10px] font-black"
                                                />
                                                <span className="text-slate-300">
                                                  /
                                                </span>
                                                <input
                                                  type="number"
                                                  value={row.totalRequiredCount}
                                                  onChange={(e) =>
                                                    updateSchedule(row.id, {
                                                      totalRequiredCount:
                                                        parseInt(
                                                          e.target.value,
                                                        ) || 0,
                                                    })
                                                  }
                                                  className="w-8 bg-transparent border-none p-0 text-slate-400 focus:ring-0 text-[10px] font-bold"
                                                />
                                              </div>
                                            </div>
                                            <div className="h-1.5 bg-emerald-50 rounded-full overflow-hidden">
                                              <div
                                                className="h-full bg-emerald-500"
                                                style={{
                                                  width: `${(row.validCount / (row.totalRequiredCount || 1)) * 100}%`,
                                                }}
                                              ></div>
                                            </div>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="px-4 py-4">
                                        <PersonBadge name={row.owner} />
                                      </td>
                                      <td className="px-4 py-4 text-[9px] text-slate-400 space-y-1">
                                        <div className="flex items-center gap-2">
                                          <span className="w-12">
                                            需求截止:
                                          </span>
                                          <input
                                            type="date"
                                            value={row.requirementEnd}
                                            onClick={openNativeDatePicker}
                                            onChange={(e) =>
                                              updateSchedule(row.id, {
                                                requirementEnd: e.target.value,
                                              })
                                            }
                                            className="bg-slate-50 px-1 border-none rounded text-[9px] font-mono focus:ring-0"
                                          />
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className="w-12">
                                            制作截止:
                                          </span>
                                          <input
                                            type="date"
                                            value={row.productionEnd}
                                            onClick={openNativeDatePicker}
                                            onChange={(e) =>
                                              updateSchedule(row.id, {
                                                productionEnd: e.target.value,
                                              })
                                            }
                                            className="bg-slate-50 px-1 border-none rounded text-[9px] font-mono focus:ring-0"
                                          />
                                        </div>
                                      </td>
                                      <td className="px-4 py-4 text-right">
                                        <button
                                          onClick={() => {
                                            if (confirm("确定删除此行？"))
                                              setSchedules(
                                                schedules.filter(
                                                  (s) => s.id !== row.id,
                                                ),
                                              );
                                          }}
                                          className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          )}
                        </div>
                      ),
                    )}
                  </div>

                  {/* 底部新增周期 按钮 */}
                  <div
                    className="p-8 flex flex-col items-center justify-center border-t-4 border-slate-100 bg-slate-50/30 text-slate-400 group cursor-pointer hover:bg-slate-50 transition-all"
                    onClick={() => addScheduleRow()}
                  >
                    <div className="w-12 h-12 rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center group-hover:border-primary group-hover:text-primary transition-all group-hover:scale-110 group-hover:rotate-90">
                      <Plus className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-black mt-3 group-hover:text-primary transition-colors tracking-tight">
                      创建排期周期
                    </p>
                  </div>
                </div>
);
