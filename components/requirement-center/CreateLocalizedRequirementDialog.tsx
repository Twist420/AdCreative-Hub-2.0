import { CheckCircle, Search, XCircle } from "lucide-react";
import type { CreativeSchedule, Requirement } from "../../types";
import {
  LOCALIZATION_LANGUAGES,
  formatCurrencyCompact,
} from "./requirementUtils";

export const CreateLocalizedRequirementDialog = ({
  schedule,
  selectedLanguageCodes,
  selectedLanguageCount,
  selectedSourceIds,
  searchQuery,
  candidates,
  recentSpendMap,
  disabledReason,
  submitDisabled,
  onClose,
  onSearchChange,
  onToggleLanguage,
  onToggleSource,
  onCreateStandard,
  onCreateLocalized,
  getAssetTypeLabel,
}: {
  schedule: CreativeSchedule;
  selectedLanguageCodes: string[];
  selectedLanguageCount: number;
  selectedSourceIds: string[];
  searchQuery: string;
  candidates: Requirement[];
  recentSpendMap: Record<string, number>;
  disabledReason: string;
  submitDisabled: boolean;
  onClose: () => void;
  onSearchChange: (value: string) => void;
  onToggleLanguage: (languageCode: string) => void;
  onToggleSource: (requirementId: string) => void;
  onCreateStandard: () => void;
  onCreateLocalized: () => void;
  getAssetTypeLabel: (assetType: Requirement["assetType"]) => string;
}) => (
  <div className="fixed inset-0 z-[115] flex items-center justify-center bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200 p-6">
    <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-5xl max-h-[88vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
      <div className="px-7 py-5 border-b border-slate-100 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-xl bg-indigo-50 px-3 py-1 text-[10px] font-black text-indigo-700">
              本地化方向
            </span>
            <span className="rounded-xl bg-slate-100 px-3 py-1 text-[10px] font-black text-slate-500">
              {schedule.form === "Image" ? "图片" : schedule.form === "Playable" ? "试玩" : "视频"}
            </span>
          </div>
          <h3 className="mt-2 truncate text-xl font-black text-slate-900">
            创建需求：{schedule.directionName}
          </h3>
          <p className="mt-1 text-xs font-semibold text-slate-400">
            先选择本地化语言，再选择来源需求；确认后按语言生成本地化大版本。
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-full text-slate-400 transition-all hover:bg-slate-50 hover:text-slate-700"
        >
          <XCircle className="h-8 w-8" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto bg-slate-50/60 p-6 no-scrollbar">
        <div className="space-y-4">
          <section className="rounded-3xl border border-slate-150 bg-white p-5 shadow-3xs">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-black text-slate-900">选择语言</h4>
                <p className="mt-1 text-[11px] font-semibold text-slate-400">
                  同一批中，每个语言生成 1 条本地化大版本需求。
                </p>
              </div>
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-[10px] font-black text-indigo-600">
                已选 {selectedLanguageCount} 个
              </span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {LOCALIZATION_LANGUAGES.map((item) => {
                const selected = selectedLanguageCodes.includes(item.code);
                return (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => onToggleLanguage(item.code)}
                    className={`rounded-xl border px-4 py-2 text-xs font-black transition-all ${
                      selected
                        ? "border-indigo-500 bg-indigo-600 text-white shadow-md shadow-indigo-600/15"
                        : "border-slate-200 bg-white text-slate-500 hover:border-indigo-200 hover:text-indigo-600"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="flex min-h-[420px] flex-col rounded-3xl border border-slate-150 bg-white shadow-3xs">
            <div className="border-b border-slate-100 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-black text-slate-900">选择需求</h4>
                  <p className="mt-1 text-[11px] font-semibold text-slate-400">
                    可多选，默认按最近 30 天花费倒序；支持搜索编号、名称和方向。
                  </p>
                </div>
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <input
                    value={searchQuery}
                    onChange={(event) => onSearchChange(event.target.value)}
                    placeholder="搜索来源需求..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-8 pr-3 text-xs font-bold text-slate-800 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-3 no-scrollbar">
              {candidates.length === 0 ? (
                <div className="flex h-full min-h-[240px] items-center justify-center text-center text-xs font-bold text-slate-400">
                  暂无可作为本地化来源的需求
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2 xl:grid-cols-2">
                  {candidates.map((req) => {
                    const selected = selectedSourceIds.includes(req.id);
                    const recentSpend = recentSpendMap[req.id] || 0;
                    const typeLabel = getAssetTypeLabel(req.assetType);
                    return (
                      <button
                        key={req.id}
                        type="button"
                        onClick={() => onToggleSource(req.id)}
                        className={`w-full rounded-2xl border p-3 text-left transition-all ${
                          selected
                            ? "border-indigo-300 bg-indigo-50 shadow-sm"
                            : "border-slate-150 bg-white hover:border-indigo-200 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono text-xs font-black text-slate-900">
                                {req.id}
                              </span>
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-black text-slate-500">
                                {req.language.toUpperCase()}
                              </span>
                              <span className={`rounded-full px-2 py-0.5 text-[9px] font-black ${
                                req.assetType === "Image"
                                  ? "bg-amber-50 text-amber-700"
                                  : req.assetType === "Playable"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-indigo-50 text-indigo-700"
                              }`}>
                                {typeLabel}
                              </span>
                              {selected && (
                                <CheckCircle className="h-4 w-4 text-indigo-600" />
                              )}
                            </div>
                            <div className="mt-1 truncate text-xs font-black text-slate-700">
                              {req.name}
                            </div>
                            <div className="mt-1 truncate text-[10px] font-bold text-slate-400">
                              {req.direction}
                            </div>
                          </div>
                          <div className="shrink-0 text-right">
                            <div className="text-[9px] font-black text-slate-400">
                              近 30 天花费
                            </div>
                            <div className="mt-1 font-mono text-xs font-black text-emerald-600">
                              {formatCurrencyCompact(recentSpend)}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {disabledReason && (
            <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-xs font-black text-rose-600">
              {disabledReason}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-slate-100 bg-slate-50/80 px-7 py-4 flex items-center justify-between gap-4">
        <p className="text-[10px] font-bold text-slate-400">
          命名规则：创建日期 + 语言本地化 + 原始需求编号；本地化需求编号从 8000 开始。
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCreateStandard}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-black text-slate-600 transition-all hover:border-indigo-200 hover:text-indigo-600"
          >
            创建全新需求
          </button>
          <button
            type="button"
            disabled={submitDisabled}
            onClick={onCreateLocalized}
            className={`rounded-xl px-6 py-2.5 text-xs font-black text-white shadow-lg transition-all ${
              submitDisabled
                ? "bg-slate-300 shadow-none"
                : "bg-indigo-600 shadow-indigo-600/20 hover:bg-slate-950"
            }`}
          >
            确认创建
          </button>
        </div>
      </div>
    </div>
  </div>
);
