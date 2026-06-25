import { AlertCircle, XCircle } from "lucide-react";
import type { Requirement } from "../../types";
import { PersonBadge } from "./people";

type DelayedProductionRiskItem = {
  req: Requirement;
  delayedDays: number;
};

export const ProductionRiskModal = ({
  items,
  onClose,
}: {
  items: DelayedProductionRiskItem[];
  onClose: () => void;
}) => (
  <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 p-6 backdrop-blur-md animate-in fade-in duration-200">
    <div className="flex min-h-[480px] w-full min-w-[760px] max-w-5xl max-h-[82vh] flex-col overflow-hidden rounded-[24px] border border-slate-150 bg-white shadow-2xl animate-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4">
        <div>
          <h3 className="text-base font-black text-slate-900">
            排期延期需求（{items.length}）
          </h3>
          <p className="mt-0.5 text-[10px] font-bold text-slate-400">
            仅显示延期需求编号、制作人员和已延期天数。
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-1.5 text-slate-400 transition-all hover:bg-slate-50 hover:text-slate-700"
          title="关闭"
        >
          <XCircle className="h-6 w-6" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto bg-slate-50/70 p-4 no-scrollbar">
        {items.length > 0 ? (
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
            {items.map(({ req, delayedDays }) => (
              <div
                key={req.id}
                className="rounded-xl border border-rose-100 bg-white px-3 py-2.5 shadow-3xs"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-[8.5px] font-black uppercase tracking-widest text-slate-400">
                      延期需求编号
                    </div>
                    <div className="mt-0.5 truncate font-mono text-[13px] font-black text-slate-900">
                      {req.id}
                    </div>
                    <div className="mt-2 flex min-w-0 items-center gap-1.5 rounded-lg bg-slate-50 px-2 py-1">
                      <span className="shrink-0 text-[8.5px] font-black uppercase tracking-widest text-slate-400">
                        制作
                      </span>
                      <span className="flex min-w-0 flex-wrap items-center gap-1">
                        {(req.productionPersonnel || []).length > 0 ? (
                          req.productionPersonnel.map((person) => (
                            <PersonBadge key={person} name={person} size="xs" muted />
                          ))
                        ) : (
                          <PersonBadge name="-" size="xs" muted />
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="flex h-14 w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-rose-50 text-center">
                    <div className="text-[8.5px] font-black text-rose-400">
                      已延期
                    </div>
                    <div className="mt-0.5 text-base font-black leading-none text-rose-600">
                      {delayedDays}天
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white text-center">
            <AlertCircle className="h-8 w-8 text-slate-300" />
            <p className="mt-3 text-xs font-black text-slate-500">
              当前没有已延期需求
            </p>
          </div>
        )}
      </div>
    </div>
  </div>
);
