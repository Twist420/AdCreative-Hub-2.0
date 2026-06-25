import type { Producer } from "./people";
import type { ScheduledTaskView } from "./requirementUtils";

type CapacityRow = {
  producer: Producer;
  weekTasks: ScheduledTaskView[];
  loadRate: number;
  nextAvailable: string;
};

export const ProductionCapacityView = ({
  personnelCapacityGroups,
  onSelectProducer,
}: {
  personnelCapacityGroups: Record<string, CapacityRow[]>;
  onSelectProducer: (producerName: string) => void;
}) => (
  <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 2xl:grid-cols-3">
    {Object.entries(personnelCapacityGroups).map(([group, rows]) => {
      const groupTasks = rows.reduce(
        (sum, row) => sum + row.weekTasks.length,
        0,
      );
      const groupLoad = rows.length
        ? Math.round(
            rows.reduce((sum, row) => sum + row.loadRate, 0) / rows.length,
          )
        : 0;

      return (
        <div
          key={group}
          className="rounded-2xl border border-slate-150 bg-slate-50/70 p-3"
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-black text-slate-900">{group}</div>
              <div className="mt-0.5 text-[9px] font-black text-slate-400">
                {rows.length} 人 · {groupTasks} 个未来任务
              </div>
            </div>
            <span
              className={`rounded-full px-2.5 py-1 text-[9px] font-black ${
                groupLoad > 100
                  ? "bg-rose-50 text-rose-600"
                  : groupLoad > 80
                    ? "bg-amber-50 text-amber-700"
                    : "bg-emerald-50 text-emerald-600"
              }`}
            >
              均值 {groupLoad}%
            </span>
          </div>

          <div className="space-y-2">
            {rows.map((row) => (
              <button
                key={row.producer.name}
                type="button"
                onClick={() => onSelectProducer(row.producer.name)}
                className="w-full rounded-xl border border-white bg-white p-3 text-left shadow-3xs transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-[10px] font-black text-white">
                        {row.producer.name.slice(0, 1)}
                      </span>
                      <div className="min-w-0">
                        <div className="truncate text-xs font-black text-slate-900">
                          {row.producer.name}
                        </div>
                        <div className="mt-0.5 truncate text-[9px] font-bold text-slate-400">
                          最近空档 {row.nextAvailable}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div
                      className={`text-xs font-black ${
                        row.loadRate > 100
                          ? "text-rose-600"
                          : row.loadRate > 80
                            ? "text-amber-600"
                            : "text-emerald-600"
                      }`}
                    >
                      {row.loadRate}%
                    </div>
                    <div className="mt-0.5 text-[9px] font-bold text-slate-400">
                      {row.weekTasks.length} 任务
                    </div>
                  </div>
                </div>

                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${
                      row.loadRate > 100
                        ? "bg-rose-500"
                        : row.loadRate > 80
                          ? "bg-amber-400"
                          : "bg-emerald-500"
                    }`}
                    style={{ width: `${Math.min(row.loadRate, 100)}%` }}
                  />
                </div>

                <div className="mt-2 flex min-h-5 flex-wrap gap-1">
                  {row.weekTasks.length === 0 ? (
                    <span className="rounded-lg bg-emerald-50 px-2 py-1 text-[9px] font-black text-emerald-600">
                      本周可用
                    </span>
                  ) : (
                    row.weekTasks.slice(0, 3).map((task) => (
                      <span
                        key={task.id}
                        className="max-w-full truncate rounded-lg bg-slate-100 px-2 py-1 text-[9px] font-black text-slate-500"
                      >
                        {task.role} · {task.displayRequirementId}
                      </span>
                    ))
                  )}
                  {row.weekTasks.length > 3 && (
                    <span className="rounded-lg bg-slate-100 px-2 py-1 text-[9px] font-black text-slate-400">
                      +{row.weekTasks.length - 3}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      );
    })}
  </div>
);
