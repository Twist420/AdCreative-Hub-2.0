import { Dispatch, SetStateAction } from 'react';
import { Upload, X } from 'lucide-react';
type ClipUploadModalProps = {
  showClipUploadModal: boolean;
  setShowClipUploadModal: Dispatch<SetStateAction<boolean>>;
  isClipDragActive: boolean;
  setIsClipDragActive: Dispatch<SetStateAction<boolean>>;
  handleClipUploadFiles: (files: FileList | File[]) => void;
};

export const ClipUploadModal = ({
  showClipUploadModal,
  setShowClipUploadModal,
  isClipDragActive,
  setIsClipDragActive,
  handleClipUploadFiles,
}: ClipUploadModalProps) => {
  if (!showClipUploadModal) return null;

  return (
        <div className="fixed inset-0 z-[290] flex items-center justify-center bg-slate-950/55 p-6 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-6 py-5">
              <div>
                <h3 className="text-sm font-black text-slate-900">上传成片</h3>
                <p className="mt-1 text-[10px] font-bold text-slate-400">
                  支持拖拽上传，也可以点击选择视频或图片文件。
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowClipUploadModal(false);
                  setIsClipDragActive(false);
                }}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 transition-all hover:bg-slate-200 hover:text-slate-600"
                title="关闭"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="p-6">
              <label
                className={`flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-[28px] border-2 border-dashed px-6 py-8 text-center transition-all ${
                  isClipDragActive
                    ? 'border-indigo-400 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 bg-slate-50/70 text-slate-500 hover:border-indigo-200 hover:bg-indigo-50/60'
                }`}
                onDragEnter={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setIsClipDragActive(true);
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setIsClipDragActive(true);
                }}
                onDragLeave={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  if (event.currentTarget === event.target) {
                    setIsClipDragActive(false);
                  }
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  handleClipUploadFiles(event.dataTransfer.files);
                }}
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-white text-indigo-600 shadow-sm">
                  <Upload className="h-7 w-7" />
                </div>
                <div className="text-sm font-black text-slate-800">
                  拖拽成片文件到这里
                </div>
                <div className="mt-2 text-[11px] font-bold text-slate-400">
                  或点击选择文件，支持视频和图片，多文件上传
                </div>
                <input
                  type="file"
                  accept="video/*,image/*"
                  multiple
                  className="hidden"
                  onChange={(event) => {
                    if (event.target.files) {
                      handleClipUploadFiles(event.target.files);
                    }
                    event.currentTarget.value = '';
                  }}
                />
              </label>
            </div>
          </div>
        </div>
  );
};
