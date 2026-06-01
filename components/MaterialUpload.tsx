
import React, { useState, useRef } from 'react';
import { 
  Upload, FileVideo, Gamepad2, Image as ImageIcon, 
  CheckCircle2, XCircle, Clock, AlertCircle, Trash2, 
  ChevronRight, Search, Filter, MoreHorizontal, Loader2,
  FileText, History, LayoutGrid, List
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type MaterialType = 'Video' | 'Playable' | 'Image';

interface UploadRecord {
  id: string;
  name: string;
  type: MaterialType;
  size: string;
  status: 'Uploading' | 'Success' | 'Failed' | 'Pending';
  progress: number;
  failureReason?: string;
  timestamp: string;
}

const INITIAL_RECORDS: UploadRecord[] = [
  {
    id: 'rec-1',
    name: 'Battle_Intro_V1_Final.mp4',
    type: 'Video',
    size: '45.2 MB',
    status: 'Success',
    progress: 100,
    timestamp: '2026-05-12 10:20',
  },
  {
    id: 'rec-2',
    name: 'Merge_Tutorial_ASO_Image.png',
    type: 'Image',
    size: '2.4 MB',
    status: 'Failed',
    progress: 0,
    failureReason: '命名错误：未包含渠道后缀',
    timestamp: '2026-05-12 10:15',
  },
  {
    id: 'rec-3',
    name: 'Interactive_Demo_Playable.zip',
    type: 'Playable',
    size: '12.8 MB',
    status: 'Success',
    progress: 100,
    timestamp: '2026-05-12 09:45',
  },
  {
    id: 'rec-4',
    name: 'Big_Asset_Large_Video.mp4',
    type: 'Video',
    size: '512 MB',
    status: 'Failed',
    progress: 0,
    failureReason: '大小超限：超过最大限制 (500MB)',
    timestamp: '2026-05-12 09:30',
  }
];

const MaterialUpload: React.FC = () => {
  const [activeType, setActiveType] = useState<MaterialType>('Video');
  const [records, setRecords] = useState<UploadRecord[]>(INITIAL_RECORDS);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const simulateUpload = (files: File[]) => {
    const newRecords: UploadRecord[] = files.map(file => {
      const type: MaterialType = file.type.includes('video') ? 'Video' : 
                                file.type.includes('image') ? 'Image' : 'Playable';
      
      const isTooLarge = file.size > 500 * 1024 * 1024;
      const namingFailed = !file.name.includes('_');

      return {
        id: `rec-new-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        type,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        status: isTooLarge || namingFailed ? 'Failed' : 'Pending',
        progress: 0,
        failureReason: isTooLarge ? '大小超限：超过最大限制 (500MB)' : 
                       namingFailed ? '命名错误：未按照规范命名 (需包含下划线)' : undefined,
        timestamp: new Date().toLocaleString().slice(0, 16),
      };
    });

    setRecords(prev => [...newRecords, ...prev]);

    // Simulate progress for pending ones
    newRecords.forEach(record => {
      if (record.status === 'Pending') {
        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.random() * 30;
          if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            setRecords(current => 
              current.map(r => r.id === record.id ? { ...r, status: 'Success', progress: 100 } : r)
            );
          } else {
            setRecords(current => 
              current.map(r => r.id === record.id ? { ...r, status: 'Uploading', progress: Math.floor(progress) } : r)
            );
          }
        }, 800);
      }
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      simulateUpload(files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      simulateUpload(files);
    }
  };

  const removeRecord = (id: string) => {
    setRecords(records.filter(r => r.id !== id));
  };

  const filteredRecords = records.filter(r => 
    (activeType === r.type) && 
    (r.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex-1 flex flex-col h-screen bg-slate-50/50">
      {/* Top Header */}
      <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Upload className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-sm font-black text-slate-800">素材上传中心</h1>
            <p className="text-[10px] font-bold text-slate-400">支持批量上传视频、试玩、图片素材</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
           {/* Upload Limitation Info */}
           <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-100 rounded-lg">
             <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
             <span className="text-[10px] font-bold text-amber-700">限制: 500MB以内, 命名规范 [项目]_[语言]_[方向]</span>
           </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex gap-6 p-6 overflow-hidden">
        {/* Left Section: Upload & Filters */}
        <div className="w-1/3 flex flex-col gap-6 overflow-hidden">
          {/* Categorization Tabs */}
          <div className="bg-white p-1 rounded-xl border border-slate-100 shadow-sm flex shrink-0">
            {(['Video', 'Playable', 'Image'] as MaterialType[]).map((type) => (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                className={`flex-1 py-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-2 ${
                  activeType === type 
                  ? 'bg-slate-900 text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                }`}
              >
                {type === 'Video' && <FileVideo className="w-4 h-4" />}
                {type === 'Playable' && <Gamepad2 className="w-4 h-4" />}
                {type === 'Image' && <ImageIcon className="w-4 h-4" />}
                {type === 'Video' ? '视频素材' : type === 'Playable' ? '试玩素材' : '图片素材'}
              </button>
            ))}
          </div>

          {/* Upload Area */}
          <div 
            className={`flex-1 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center p-8 transition-all cursor-pointer group ${
              isDragging 
              ? 'border-primary bg-primary/5' 
              : 'border-slate-200 bg-white hover:border-primary/50 hover:bg-slate-50 shadow-sm'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              multiple 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileSelect}
            />
            <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-4 transition-all ${
              isDragging ? 'bg-primary text-white scale-110' : 'bg-slate-50 text-slate-400 group-hover:bg-white group-hover:text-primary group-hover:scale-105'
            }`}>
              <Upload className="w-8 h-8" />
            </div>
            <h3 className="text-sm font-black text-slate-800 mb-1 group-hover:text-primary">点击或分发文件到此区域上传</h3>
            <p className="text-xs font-bold text-slate-400">支持批量选择，单文件最大 500MB</p>
            
            <div className="mt-8 flex items-center gap-6">
              <div className="flex flex-col items-center">
                 <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-1">
                   <FileVideo className="w-5 h-5" />
                 </div>
                 <span className="text-[10px] font-bold text-slate-400">MP4 / MOV</span>
              </div>
              <div className="flex flex-col items-center text-slate-300">
                 <ChevronRight className="w-4 h-4 mt-2" />
              </div>
              <div className="flex flex-col items-center">
                 <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-1">
                   <Gamepad2 className="w-5 h-5" />
                 </div>
                 <span className="text-[10px] font-bold text-slate-400">ZIP (HTML5)</span>
              </div>
              <div className="flex flex-col items-center text-slate-300">
                 <ChevronRight className="w-4 h-4 mt-2" />
              </div>
              <div className="flex flex-col items-center">
                 <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-1">
                   <ImageIcon className="w-5 h-5" />
                 </div>
                 <span className="text-[10px] font-bold text-slate-400">PNG / JPG</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section: Upload History */}
        <div className="flex-1 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
           <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <History className="w-5 h-5 text-slate-400" />
                 <h2 className="text-sm font-black text-slate-800">上传记录</h2>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="搜索素材名称..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-1.5 bg-slate-50 border-none rounded-lg text-xs w-48 focus:ring-1 focus:ring-primary/20"
                  />
                </div>
              </div>
           </div>

           <div className="flex-1 overflow-auto no-scrollbar">
              {filteredRecords.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-2">
                   <FileText className="w-12 h-12" />
                   <p className="text-xs font-bold">暂无上传记录</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50/50 sticky top-0 z-10 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4">素材详情</th>
                      <th className="px-6 py-4">进度/状态</th>
                      <th className="px-6 py-4">上传时间</th>
                      <th className="px-6 py-4 text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredRecords.map((record) => (
                      <motion.tr 
                        key={record.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="group hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                                record.type === 'Video' ? 'bg-indigo-50 text-indigo-500' :
                                record.type === 'Playable' ? 'bg-amber-50 text-amber-500' : 'bg-emerald-50 text-emerald-500'
                              }`}>
                                {record.type === 'Video' && <FileVideo className="w-5 h-5" />}
                                {record.type === 'Playable' && <Gamepad2 className="w-5 h-5" />}
                                {record.type === 'Image' && <ImageIcon className="w-5 h-5" />}
                              </div>
                              <div className="overflow-hidden">
                                 <h4 className="text-xs font-black text-slate-700 truncate mb-0.5">{record.name}</h4>
                                 <span className="text-[10px] font-bold text-slate-400">{record.size}</span>
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                           {record.status === 'Uploading' || record.status === 'Pending' ? (
                             <div className="flex flex-col gap-1.5 w-32">
                                <div className="flex items-center justify-between text-[10px] font-black">
                                   <span className="text-primary flex items-center gap-1.5">
                                      <Loader2 className="w-3 h-3 animate-spin" /> 上传中...
                                   </span>
                                   <span className="text-slate-400">{record.progress}%</span>
                                </div>
                                <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                                   <div 
                                    className="h-full bg-primary transition-all duration-300"
                                    style={{ width: `${record.progress}%` }}
                                   />
                                </div>
                             </div>
                           ) : record.status === 'Success' ? (
                             <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full w-fit">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-black whitespace-nowrap">上传成功</span>
                             </div>
                           ) : (
                             <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-600 rounded-full w-fit">
                                   <XCircle className="w-3.5 h-3.5" />
                                   <span className="text-[10px] font-black whitespace-nowrap">上传失败</span>
                                </div>
                                {record.failureReason && (
                                  <span className="text-[9px] font-bold text-rose-400 ml-1 italic">{record.failureReason}</span>
                                )}
                             </div>
                           )}
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-1.5 text-slate-400">
                              <Clock className="w-3.5 h-3.5" />
                              <span className="text-[10px] font-bold">{record.timestamp}</span>
                           </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <div className="flex items-center justify-end gap-2 text-slate-400 opacity-0 group-hover:opacity-100 transition-all">
                              <button className="p-1.5 hover:bg-slate-100 rounded-lg hover:text-slate-600">
                                 <MoreHorizontal className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => removeRecord(record.id)}
                                className="p-1.5 hover:bg-rose-50 rounded-lg hover:text-rose-500"
                              >
                                 <Trash2 className="w-4 h-4" />
                              </button>
                           </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialUpload;
