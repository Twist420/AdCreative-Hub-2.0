import { AlertCircle } from "lucide-react";

type InstantTooltip = {
  left: number;
  top: number;
  content: string;
};

export const RequirementToast = ({ message }: { message: string | null }) => {
  if (!message) return null;

  return (
    <div className="fixed right-6 top-6 z-[220] max-w-sm rounded-2xl border border-amber-100 bg-white px-4 py-3 text-xs font-black text-slate-700 shadow-2xl shadow-slate-900/12">
      <div className="flex items-start gap-2">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
        <span className="leading-relaxed">{message}</span>
      </div>
    </div>
  );
};

export const RequirementInstantTooltip = ({
  tooltip,
}: {
  tooltip: InstantTooltip | null;
}) => {
  if (!tooltip) return null;

  return (
    <div
      className="pointer-events-none fixed z-[240] max-w-[380px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold leading-relaxed text-slate-700 shadow-xl shadow-slate-900/12"
      style={{
        left: `${tooltip.left}px`,
        top: `${tooltip.top}px`,
      }}
    >
      {tooltip.content}
    </div>
  );
};
