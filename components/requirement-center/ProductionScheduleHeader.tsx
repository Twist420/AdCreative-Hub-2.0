import {
  AlertCircle,
  Calendar,
  ExternalLink,
  Layers,
  Users,
} from "lucide-react";

type ProductionView = "capacity" | "calendar" | "gantt";

export const ProductionScheduleHeader = ({
  productionView,
  delayedCount,
  selectedProducers,
  onProductionViewChange,
  onOpenRiskModal,
  onClearSelectedProducers,
}: {
  productionView: ProductionView;
  delayedCount: number;
  selectedProducers: string[];
  onProductionViewChange: (view: ProductionView) => void;
  onOpenRiskModal: () => void;
  onClearSelectedProducers: () => void;
}) => (
  <>
    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
          <Calendar className="w-5 h-5 text-indigo-550" />
        </div>
        <div>
          <h2 className="text-sm font-black text-slate-800 leading-tight">
            制作排期
          </h2>
          <p className="text-[10px] text-slate-400 font-bold mt-0.5">
            用于手动排期时查看人员占用、任务风险和团队工时负荷
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-2xl bg-slate-100 p-1">
        {[
          { id: "gantt" as const, label: "甘特视图", icon: Layers },
          { id: "calendar" as const, label: "日历视图", icon: Calendar },
          { id: "capacity" as const, label: "岗位产能", icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onProductionViewChange(tab.id)}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-black transition-all ${
                productionView === tab.id
                  ? "bg-white text-indigo-600 shadow-xs"
                  : "text-slate-400 hover:text-slate-700"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>

    {delayedCount > 0 && (
      <div className="shrink-0 rounded-2xl border border-rose-100 bg-rose-50/70 px-3 py-2 text-[10px] font-bold text-rose-700 shadow-3xs">
        <button
          type="button"
          onClick={onOpenRiskModal}
          className="flex w-full items-center justify-between gap-3 text-left"
        >
          <span className="flex min-w-0 items-center gap-2">
            <AlertCircle className="h-3.5 w-3.5 shrink-0 text-rose-500" />
            <span className="shrink-0 font-black">排期预警</span>
            <span className="truncate text-rose-500/80">
              {delayedCount} 个已延期需求
            </span>
            <span className="hidden truncate text-slate-400 lg:inline">
              点击查看延期需求
            </span>
          </span>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[9px] font-black text-rose-500">
            查看
            <ExternalLink className="h-3 w-3" />
          </span>
        </button>
      </div>
    )}

    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h3 className="text-sm font-black text-slate-900">
          {productionView === "capacity"
            ? "岗位 / 人员产能视图"
            : productionView === "calendar"
              ? "日历视图"
              : "甘特视图"}
        </h3>
        <p className="mt-1 text-[10px] font-bold text-slate-400">
          {productionView === "capacity"
            ? "先按岗位判断未来 7 天占用，点击人员可切到日历定位。"
            : `手动排期时查看人员占用，同一天同一人可显示多条任务。${
                selectedProducers.length > 0
                  ? ` 当前筛选：${selectedProducers.join("、")}`
                  : ""
              }`}
        </p>
      </div>
      {productionView !== "capacity" && selectedProducers.length > 0 && (
        <button
          type="button"
          onClick={onClearSelectedProducers}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[10px] font-black text-slate-500 transition-all hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
        >
          清除定位
        </button>
      )}
    </div>
  </>
);
