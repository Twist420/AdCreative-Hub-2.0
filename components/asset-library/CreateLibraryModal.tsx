import { Dispatch, SetStateAction } from 'react';
import { Box, Plus, X, Layout as LayoutIcon } from 'lucide-react';
import { LibraryItem } from '../../types';
import { FolderNode, getAllFoldersInTree } from './assetLibraryData';

type CreateLibraryModalProps = {
  isLibModalOpen: boolean;
  setIsLibModalOpen: Dispatch<SetStateAction<boolean>>;
  libSystem: 'Fragment' | 'Component';
  setLibSystem: Dispatch<SetStateAction<'Fragment' | 'Component'>>;
  libParentPath: string[];
  setLibParentPath: Dispatch<SetStateAction<string[]>>;
  libName: string;
  setLibName: Dispatch<SetStateAction<string>>;
  libSelectedAssets: string[];
  setLibSelectedAssets: Dispatch<SetStateAction<string[]>>;
  assetSearchQuery: string;
  setAssetSearchQuery: Dispatch<SetStateAction<string>>;
  folderTree: FolderNode[];
  libraryItems: LibraryItem[];
  handleCreateLibrary: () => void;
};

export const CreateLibraryModal = ({
  isLibModalOpen,
  setIsLibModalOpen,
  libSystem,
  setLibSystem,
  libParentPath,
  setLibParentPath,
  libName,
  setLibName,
  libSelectedAssets,
  setLibSelectedAssets,
  assetSearchQuery,
  setAssetSearchQuery,
  folderTree,
  libraryItems,
  handleCreateLibrary,
}: CreateLibraryModalProps) => {
  if (!isLibModalOpen) return null;

  return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
              {/* Modal Header */}
              <div className="h-14 border-b border-slate-100 px-6 flex items-center justify-between shrink-0">
                 <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                       <Plus className="w-4 h-4" />
                    </div>
                    <div>
                       <h3 className="text-xs font-black text-slate-800 tracking-tight">新建微分子资产库</h3>
                       <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-0.5">Create Micro-Asset Library</p>
                    </div>
                 </div>
                 <button 
                   type="button"
                   onClick={() => setIsLibModalOpen(false)}
                   className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all cursor-pointer"
                 >
                    <X className="w-4 h-4" />
                 </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-4">
                 {/* System selection: Component or Fragment */}
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">资产领域系统</label>
                    <div className="grid grid-cols-2 gap-3">
                       {[
                          { value: 'Fragment', label: '片段 (Fragments)', icon: LayoutIcon },
                          { value: 'Component', label: '组件 (Components)', icon: Box }
                       ].map(elem => {
                          const isSel = libSystem === elem.value;
                          const IconComp = elem.icon;
                          return (
                             <button
                                key={elem.value}
                                type="button"
                                onClick={() => {
                                   setLibSystem(elem.value as any);
                                   setLibParentPath([elem.value === 'Fragment' ? '片段' : '组件']);
                                   setLibSelectedAssets([]);
                                }}
                                className={`p-3 rounded-2xl border flex items-center gap-3 transition-all cursor-pointer ${
                                   isSel 
                                      ? 'bg-slate-900 border-slate-900 text-white shadow-md' 
                                      : 'bg-slate-50 hover:bg-slate-100/70 border-slate-150 text-slate-600'
                                }`}
                             >
                                <IconComp className={`w-4 h-4 shrink-0 ${isSel ? 'text-white' : 'text-slate-400'}`} />
                                <span className="text-[11px] font-bold">{elem.label}</span>
                             </button>
                          );
                       })}
                    </div>
                 </div>

                 {/* Parent folder path select */}
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">上级目录路径</label>
                    <select
                       value={libParentPath.join('/')}
                       onChange={(e) => setLibParentPath(e.target.value.split('/'))}
                       className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 font-sans focus:outline-none focus:ring-2 focus:ring-slate-900/15"
                    >
                       {getAllFoldersInTree(folderTree)
                          .filter(f => {
                             const root = f.path[0];
                             const targetRoot = libSystem === 'Fragment' ? '片段' : '组件';
                             return root === targetRoot;
                          })
                          .map(f => (
                             <option key={f.path.join('/')} value={f.path.join('/')}>
                                {f.path.join(' > ')}
                             </option>
                          ))
                       }
                    </select>
                 </div>

                 {/* Library Name Input */}
                  <div className="space-y-3.5 text-left">
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">微分子资产库名称 *</label>
                        <input
                           type="text"
                           placeholder="例如: 智能AI解说, 冰原大厅"
                           value={libName}
                           onChange={(e) => setLibName(e.target.value)}
                           className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-705 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/15"
                        />
                     </div>
                     
                     <div className="p-3.5 bg-indigo-50/50 border border-indigo-100 rounded-2xl">
                        <p className="text-[10px] font-bold text-indigo-700 leading-relaxed font-sans">
                           💡 提示：在此处仅需输入名称即可发起创建。当您新建成功并进入对应页面后，系统会主动引导您首先一键配置该库的专属防冲突前缀及归属标签。
                        </p>
                     </div>
                  </div>

                  {/* Stock materials inclusion picker */}
                 <div className="space-y-2">
                    <div className="flex items-center justify-between">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">选择已有资产导入加入该资产库目录</label>
                       <span className="text-[9px] text-slate-400 font-bold">已选择 {libSelectedAssets.length} 项</span>
                    </div>
                    
                    <div className="border border-slate-150 rounded-2xl overflow-hidden bg-slate-50/50">
                       <div className="p-2.5 bg-slate-100/50 border-b border-slate-150 flex items-center justify-between">
                          <input 
                             type="text" 
                             placeholder="检索可用历史存量资产..." 
                             value={assetSearchQuery}
                             onChange={(e) => setAssetSearchQuery(e.target.value)}
                             className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-[10px] font-bold text-slate-700 placeholder-slate-400 w-full focus:outline-none focus:border-slate-400"
                          />
                       </div>

                       <div className="max-h-[160px] overflow-y-auto no-scrollbar p-2.5 space-y-1.5">
                          {libraryItems
                             .filter(item => {
                                const matchedType = libSystem === 'Fragment' ? 'Fragment' : 'Component';
                                if (item.type !== matchedType) return false;
                                
                                if (assetSearchQuery.trim()) {
                                   return item.name.toLowerCase().includes(assetSearchQuery.toLowerCase()) || item.id.toLowerCase().includes(assetSearchQuery.toLowerCase());
                                }
                                return true;
                             })
                             .map(item => {
                                const isChecked = libSelectedAssets.includes(item.id);
                                return (
                                   <label 
                                      key={item.id} 
                                      className={`flex items-center justify-between p-2 rounded-xl border text-left cursor-pointer transition-all ${
                                         isChecked 
                                            ? 'bg-white border-slate-900 shadow-sm' 
                                            : 'bg-white/40 border-slate-100 hover:bg-white'
                                      }`}
                                   >
                                      <div className="flex items-center gap-2.5 min-w-0">
                                         <input
                                            type="checkbox"
                                            checked={isChecked}
                                            onChange={() => {
                                               if (isChecked) {
                                                  setLibSelectedAssets(prev => prev.filter(id => id !== item.id));
                                               } else {
                                                  setLibSelectedAssets(prev => [...prev, item.id]);
                                               }
                                            }}
                                            className="rounded text-slate-900 focus:ring-slate-900 w-3.5 h-3.5 cursor-pointer accent-slate-900"
                                         />
                                         <div className="min-w-0 col-span-2">
                                            <p className="text-[11px] font-black text-slate-800 line-clamp-1 leading-tight">{item.name}</p>
                                            <div className="flex items-center gap-1.5 mt-0.5 text-[9px] text-slate-400 leading-none">
                                               <span>当前归属: {item.subType}</span>
                                            </div>
                                         </div>
                                      </div>
                                      <span className="text-[9px] font-bold text-slate-400 px-1.5 py-0.5 bg-slate-100 rounded leading-none shrink-0 font-sans">
                                         引用 {item.citationCount}次
                                      </span>
                                   </label>
                                );
                             })
                          }
                          {libraryItems.filter(item => item.type === (libSystem === 'Fragment' ? 'Fragment' : 'Component')).length === 0 && (
                             <p className="text-center text-[10px] font-bold text-slate-400 py-4">无历史资产可关联</p>
                          )}
                       </div>
                    </div>
                 </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-slate-50/50 p-4 border-t border-slate-100 flex items-center justify-end gap-2.5 shrink-0">
                 <button 
                    type="button"
                    onClick={() => setIsLibModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-xl text-[11px] font-bold hover:border-slate-350 transition-all cursor-pointer"
                 >
                    取消
                 </button>
                 <button 
                    type="button"
                    onClick={handleCreateLibrary}
                    className="px-5 py-2 bg-slate-900 text-white hover:bg-black rounded-xl text-[11px] font-black shadow-md hover:shadow-lg transition-all cursor-pointer"
                 >
                    完成并生成资产库
                 </button>
              </div>
           </div>
        </div>
  );
};
