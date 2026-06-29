export const DetailRow = ({ label, value, icon: Icon, mono, badge }: any) => (
  <div className="flex items-center gap-3 group/row p-1 font-sans">
    <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover/row:bg-slate-900 group-hover/row:text-white transition-all shrink-0">
      <Icon className="w-3.5 h-3.5" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[9.5px] font-bold text-slate-400 uppercase tracking-widest leading-none">{label}</p>
      {badge ? (
        <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[9.5px] font-bold border ${
          badge === 'Recommended' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
          badge === 'Not Recommended' ? 'bg-rose-50 text-rose-600 border-rose-100' :
          badge === 'Disabled' ? 'bg-slate-50 text-slate-400 border-slate-100' :
          'bg-amber-50 text-amber-600 border-amber-100'
        }`}>
          {value}
        </span>
      ) : (
        <p className={`mt-1 truncate text-xs font-medium text-slate-700 ${mono ? 'font-mono tracking-tight' : ''}`}>{value}</p>
      )}
    </div>
  </div>
);

export const MetricBox = ({ label, value, icon: Icon }: any) => (
  <div className="bg-white p-3 flex flex-col gap-1.5 hover:bg-slate-50 transition-colors font-sans">
    <div className="flex items-center gap-1.5 min-w-0">
      <Icon className="w-3 h-3 text-slate-400 shrink-0" />
      <span className="truncate text-[9.5px] font-bold uppercase tracking-widest text-slate-400 line-clamp-1">{label}</span>
    </div>
    <p className="text-xs font-black text-slate-900 tracking-tight">{value}</p>
  </div>
);
