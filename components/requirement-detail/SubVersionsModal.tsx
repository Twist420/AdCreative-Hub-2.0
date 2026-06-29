import { Check, Copy, X } from 'lucide-react';
import { Requirement } from '../../types';
import { getSubVersionFormatName, getSubVersionSizedFormatName } from './requirementDetailUtils';
type SubVersionsModalProps = {
  showSubVersionsModal: boolean;
  setShowSubVersionsModal: (open: boolean) => void;
  subVersions: Array<{ version: string; name: string }>;
  previewDimensions: string[];
  currentReq: Requirement;
  copiedText: string | null;
  handleCopyText: (text: string) => void;
};

export const SubVersionsModal = ({
  showSubVersionsModal,
  setShowSubVersionsModal,
  subVersions,
  previewDimensions,
  currentReq,
  copiedText,
  handleCopyText,
}: SubVersionsModalProps) => {
  if (!showSubVersionsModal) return null;

  return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-6 md:p-8 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-[24px] shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-lg shadow-sm">
                  📁
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                    小版本名称列表 <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100/50 px-2 py-0.5 rounded-lg">{subVersions.length} 个版本</span>
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">按版本和尺寸分别复制创意文件名</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSubVersionsModal(false)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 transition-all hover:bg-slate-200 hover:text-slate-600"
                title="关闭"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Modal Body / Scroll List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
              {subVersions.map((sub, idx) => {
                const dimensionsForCopy = previewDimensions.length > 0 ? previewDimensions : ['9:16'];
                return (
                  <div 
                    key={idx} 
                    className="flex flex-col gap-3 bg-slate-50 hover:bg-indigo-50/20 border border-slate-150 hover:border-indigo-150 p-4 rounded-2xl transition-all group relative border-l-4 border-l-slate-300 hover:border-l-indigo-500"
                  >
                    <div className="min-w-0 pr-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 bg-indigo-50/80 border border-indigo-100 text-indigo-700 text-[9px] font-black rounded-lg uppercase tracking-wide">
                          版本 {Number(sub.version)}
                        </span>
                        <span className="text-[11px] font-black text-slate-600 truncate" title={sub.name}>
                          {sub.name}
                        </span>
                      </div>
                      <div
                        className="mt-2 font-mono text-[10.5px] font-bold text-slate-700 select-all break-all bg-white border border-slate-205 rounded-xl px-3 py-2 shadow-4xs group-hover:border-indigo-100 transition-all cursor-text leading-relaxed"
                        title={getSubVersionFormatName(currentReq, sub)}
                      >
                        {getSubVersionFormatName(currentReq, sub)}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {dimensionsForCopy.map((dimension) => {
                        const compactDimension = dimension.replace(/[^0-9]/g, '');
                        const dimensionLabel = dimension.includes(':') ? dimension : dimension.replace(/^(\d+)(\d{2})$/, '$1:$2');
                        const sizedName = getSubVersionSizedFormatName(currentReq, sub, dimension);
                        const isCopied = copiedText === sizedName;
                        return (
                          <button
                            key={`${sub.version}-${dimension}`}
                            type="button"
                            onClick={() => handleCopyText(sizedName)}
                            title={sizedName}
                            className={`h-8 w-auto min-w-[88px] rounded-xl px-3 text-[10px] font-black inline-flex items-center justify-center gap-1.5 shadow-3xs cursor-pointer select-none transition-all border ${
                              isCopied
                                ? 'bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-600'
                                : 'bg-white hover:bg-slate-50 text-indigo-600 border-slate-200 hover:border-indigo-100/50 hover:text-indigo-700'
                            }`}
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>已复制 {dimensionLabel}</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>复制 {dimensionLabel}</span>
                              </>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
  );
};
