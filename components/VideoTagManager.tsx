
import React, { useState, useRef, useEffect } from 'react';
import { TagNode } from '../types';
import { 
  Plus, Search, Edit2, Trash2, ChevronRight, 
  X, Check,
  GripVertical, MousePointer2, Settings2,
  ChevronDown, Layers, FileText, UserCircle2, Tag as TagIcon
} from 'lucide-react';

const initialData: TagNode[] = [
  {
    id: 'ab-tags', name: 'AB段标签', level: 1,
    children: [
      { id: 'a-seg', name: 'A段标签', level: 2, children: [
        { id: 'a-content', name: '标签内容', level: 3, children: [
          {id: 'a1', name: '卖点宣传', level: 4},
          {id: 'a2', name: '玩法', level: 4},
          {id: 'a3', name: '氛围贴片', level: 4},
          {id: 'a4', name: '热门视频', level: 4},
          {id: 'a5', name: '剧情', level: 4},
        ]}
      ]},
      { id: 'b-seg', name: 'B段标签', level: 2, children: [
        { id: 'b-content', name: '标签内容', level: 3, children: [
          {id: 'b1', name: '玩法主导', level: 4},
          {id: 'b2', name: '卖点主导', level: 4}
        ]}
      ]}
    ]
  },
  {
    id: 'universal-tags', name: '通用标签', level: 1,
    children: [
      { id: 'u1', name: '出现角色', level: 2, children: [
        { id: 'u1-1', name: '角色形象', level: 3, type: 'single', children: [
          { id: 'u1-1-1', name: '真人角色', level: 4, children: [
            {id: 'u1-1-1-1', name: '女boss', level: 5},
            {id: 'u1-1-1-2', name: '老爷子', level: 5},
            {id: 'u1-1-1-3', name: '帅哥', level: 5},
          ]},
          { id: 'u1-1-2', name: '卡通人物', level: 4, children: [
            {id: 'u1-1-2-1', name: '红仙子', level: 5}, 
            {id: 'u1-1-2-2', name: 'max', level: 5}
          ]},
          { id: 'u1-1-3', name: '动物角色', level: 4, children: [{id: 'u1-1-3-1', name: '其他', level: 5}]},
          { id: 'u1-1-4', name: '无', level: 4 }
        ]},
        { id: 'u1-2', name: '角色身份', level: 3, children: [
           {id: 'u1-2-1', name: 'Boss', level: 4}, {id: 'u1-2-2', name: '玩家', level: 4}, {id: 'u1-2-3', name: '宠物', level: 4}
        ]},
        { id: 'u1-3', name: '角色性别', level: 3, children: [{id: 'u1-3-1', name: '男性', level: 4}, {id: 'u1-3-2', name: '女性', level: 4}]},
        { id: 'u1-4', name: '角色年龄层', level: 3, children: [
           {id: 'u1-4-1', name: '幼年', level: 4}, {id: 'u1-4-2', name: '少年', level: 4}, {id: 'u1-4-3', name: '青年', level: 4}, {id: 'u1-4-4', name: '中年', level: 4}, {id: 'u1-4-5', name: '老年', level: 4}
        ]}
      ]},
      { id: 'u2', name: '玩法', level: 2, children: [
        { id: 'u2-1', name: '玩法类型', level: 3, type: 'multi', children: [
          {id: 'u2-1-1', name: '原始三合', level: 4}, {id: 'u2-1-2', name: '非原始三合', level: 4}, {id: 'u2-1-3', name: '整理', level: 4}, {id: 'u2-1-4', name: '其他', level: 4}, {id: 'u2-1-5', name: '无', level: 4}
        ]},
        { id: 'u2-2', name: '玩法体验', level: 3, children: [{id: 'u2-2-1', name: '成长感', level: 4}, {id: 'u2-2-2', name: '秩序感', level: 4}, {id: 'u2-2-3', name: '探索感', level: 4}]}
      ]},
      { id: 'u3', name: '情绪', level: 2, children: [
        { id: 'u3-1', name: '氛围情绪', level: 3, type: 'multi', children: [
          {id: 'u3-1-1', name: '舒缓', level: 4}, {id: 'u3-1-2', name: '激昂', level: 4}, {id: 'u3-1-3', name: '同情', level: 4}, {id: 'u3-1-4', name: '好奇', level: 4}, {id: 'u3-1-5', name: '愉悦', level: 4}, {id: 'u3-1-6', name: '解压', level: 4}, {id: 'u3-1-7', name: '爽感', level: 4}, {id: 'u3-1-8', name: '成就感', level: 4}, {id: 'u3-1-9', name: '紧迫', level: 4}, {id: 'u3-1-10', name: '搞笑', level: 4}, {id: 'u3-1-11', name: '其他', level: 4}
        ]}
      ]},
      { id: 'u4', name: '文案', level: 2, children: [
        { id: 'u4-1', name: '文案内容', level: 3, type: 'multi', children: [
          {id: 'u4-1-1', name: '权威引导', level: 4}, {id: 'u4-1-2', name: '身份认同', level: 4}, {id: 'u4-1-3', name: '奖励诱导', level: 4}, {id: 'u4-1-4', name: '解说', level: 4}, {id: 'u4-1-5', name: '基础卖点', level: 4}, {id: 'u4-1-6', name: '对比', level: 4}, {id: 'u4-1-7', name: '氛围渲染', level: 4}, {id: 'u4-1-8', name: '其他', level: 4}
        ]}
      ]},
      { id: 'u5', name: '形式', level: 2, children: [
        { id: 'u5-1', name: '传达形式', level: 3, type: 'multi', children: [
          {id: 'u5-1-1', name: '大字报', level: 4}, {id: 'u5-1-2', name: '口播', level: 4}, {id: 'u5-1-3', name: '真人剧情', level: 4}, {id: 'u5-1-4', name: '动画剧情', level: 4}, {id: 'u5-1-5', name: '模拟互动', level: 4}, {id: 'u5-1-6', name: '氛围画面', level: 4}, {id: 'u5-1-7', name: '其他', level: 4}
        ]},
        { id: 'u5-2', name: '视觉类型', level: 3, type: 'multi', children: [{id: 'u5-2-1', name: '2D', level: 4}, {id: 'u5-2-2', name: '3D', level: 4}, {id: 'u5-2-3', name: 'AI', level: 4}, {id: 'u5-2-4', name: '欧卡', level: 4}, {id: 'u5-2-5', name: '漫画', level: 4}, {id: 'u5-2-6', name: '写实', level: 4}]}
      ]},
      { id: 'u6', name: '落板', level: 2, children: [
        { id: 'u6-1', name: '落板类型', level: 3, type: 'single', children: [{id: 'u6-1-1', name: '关卡', level: 4}, {id: 'u6-1-2', name: '氛围', level: 4}]}
      ]},
      { id: 'u7', name: '节日/活动', level: 2, children: [
        { id: 'u7-1', name: '节日', level: 3, type: 'single', children: [
          {id: 'u7-1-1', name: '圣诞节', level: 4}, {id: 'u7-1-2', name: '春节', level: 4}, {id: 'u7-1-3', name: '情人节', level: 4}, {id: 'u7-1-4', name: '圣帕特里克节', level: 4}, {id: 'u7-1-5', name: '复活节', level: 4}, {id: 'u7-1-6', name: '母亲节', level: 4}, {id: 'u7-1-7', name: '独立日', level: 4}, {id: 'u7-1-8', name: '周年庆', level: 4}, {id: 'u7-1-9', name: '游戏大活', level: 4}
        ]}
      ]}
    ]
  },
  {
    id: 'creative-tags', name: '创意标签', level: 1,
    children: [
      { id: 'c1', name: '选择题', level: 2, children: [
        { id: 'c1-content', name: '标签内容', level: 3, children: [
          {id: 'c1-1', name: '手写', level: 4}, {id: 'c1-2', name: 'meme', level: 4}, {id: 'c1-3', name: '杯子', level: 4}, {id: 'c1-4', name: '真人手指卖点', level: 4}, {id: 'c1-5', name: '帅哥', level: 4},
        ]}
      ]}
    ]
  }
];

const TAG_TONES = [
  { bg: 'bg-rose-50', border: 'border-rose-100', text: 'text-rose-600', icon: 'text-rose-400', hover: 'hover:bg-rose-100/70' },
  { bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-700', icon: 'text-amber-500', hover: 'hover:bg-amber-100/70' },
  { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-700', icon: 'text-emerald-500', hover: 'hover:bg-emerald-100/70' },
  { bg: 'bg-sky-50', border: 'border-sky-100', text: 'text-sky-700', icon: 'text-sky-500', hover: 'hover:bg-sky-100/70' },
  { bg: 'bg-indigo-50', border: 'border-indigo-100', text: 'text-indigo-700', icon: 'text-indigo-500', hover: 'hover:bg-indigo-100/70' },
  { bg: 'bg-violet-50', border: 'border-violet-100', text: 'text-violet-700', icon: 'text-violet-500', hover: 'hover:bg-violet-100/70' },
  { bg: 'bg-fuchsia-50', border: 'border-fuchsia-100', text: 'text-fuchsia-700', icon: 'text-fuchsia-500', hover: 'hover:bg-fuchsia-100/70' },
  { bg: 'bg-slate-100', border: 'border-slate-200', text: 'text-slate-600', icon: 'text-slate-400', hover: 'hover:bg-slate-200/70' },
];

const getToneForNode = (id: string) => {
  const sum = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return TAG_TONES[sum % TAG_TONES.length];
};

const countLeafTags = (node: TagNode): number => {
  if (!node.children || node.children.length === 0) return node.level >= 4 ? 1 : 0;
  return node.children.reduce((sum, child) => sum + countLeafTags(child), 0);
};

interface InlineEditorProps {
  node: TagNode;
  editingId: string | null;
  tempName: string;
  setTempName: (val: string) => void;
  handleSaveEdit: () => void;
  setEditingId: (val: string | null) => void;
  inputRef: React.RefObject<HTMLInputElement>;
  handleStartEdit: (node: TagNode) => void;
}

const InlineEditor = ({ node, editingId, tempName, setTempName, handleSaveEdit, setEditingId, inputRef, handleStartEdit }: InlineEditorProps) => {
  const isEditing = editingId === node.id;
  const isRoot = node.level === 1;
  const isL2 = node.level === 2;
  const isL3 = node.level === 3;
  const isSub = node.level >= 5;

  if (isEditing) {
    return (
      <div className="flex items-center gap-1 bg-white p-0.5 rounded shadow-lg ring-1 ring-primary z-50">
        <input
          ref={inputRef}
          type="text"
          value={tempName}
          onChange={(e) => setTempName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSaveEdit(); if (e.key === 'Escape') setEditingId(null); }}
          className="text-[10px] font-bold outline-none border-none bg-slate-50 px-1 py-0.5 rounded w-auto min-w-[50px]"
        />
        <div className="flex gap-0.5 border-l border-slate-100 pl-1">
           <button onClick={handleSaveEdit} className="p-0.5 text-emerald-500 hover:bg-emerald-50 rounded"><Check className="w-3 h-3"/></button>
           <button onClick={() => setEditingId(null)} className="p-0.5 text-rose-400 hover:bg-rose-50 rounded"><X className="w-3 h-3"/></button>
        </div>
      </div>
    );
  }
  
  const fontStyle = isRoot ? 'text-[14px] font-black text-slate-900' :
                    isL2 ? 'text-[12px] font-black text-slate-800' :
                    isL3 ? 'text-[11px] font-black text-slate-700' : 
                    isSub ? 'text-[10px] font-black whitespace-nowrap' :
                    'text-[10.5px] font-black whitespace-nowrap';

  return (
    <div className="flex items-center gap-1 group/text">
      <span onDoubleClick={() => handleStartEdit(node)} className={`${fontStyle} cursor-text select-none group-hover/text:text-primary transition-colors`}>{node.name}</span>
      {node.type && node.type !== 'none' && (
        <span className={`text-[7px] px-1 py-0 rounded font-bold uppercase ${node.type === 'single' ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'}`}>
          {node.type === 'single' ? '单' : '多'}
        </span>
      )}
    </div>
  );
};

interface AdaptiveTagPillProps {
  node: TagNode;
  theme: any;
  expandedIds: Set<string>;
  toggleExpand: (id: string) => void;
  handleAddChild: (id: string) => void;
  handleDelete: (id: string) => void;
  draggingTagId: string | null;
  handleTagDragStart: (node: TagNode) => void;
  handleTagDragEnd: () => void;
  viewMode: 'card' | 'mindmap';
  inlineEditorProps: Omit<InlineEditorProps, 'node'>;
}

const AdaptiveTagPill: React.FC<AdaptiveTagPillProps> = ({ 
  node, theme, expandedIds, toggleExpand, handleAddChild, handleDelete,
  draggingTagId, handleTagDragStart, handleTagDragEnd, viewMode, inlineEditorProps
}) => {
  const isExpanded = expandedIds.has(node.id);
  const hasChildren = node.children && node.children.length > 0;
  const isLevel5Plus = node.level >= 5;
  const canDragTag = viewMode === 'card' && node.level >= 4;
  const tone = getToneForNode(node.id);
  
  const pillClasses = viewMode === 'card'
    ? `${tone.bg} ${tone.border} ${tone.text} ${tone.hover}`
    : isLevel5Plus
      ? `bg-white border-dashed ${theme.subBorder} hover:border-slate-300 hover:bg-slate-50`
      : isExpanded
        ? `${theme.pillActiveBg} ${theme.pillActiveBorder} ring-1 ${theme.ring}`
        : `${theme.pillBg} ${theme.pillBorder} hover:${theme.pillHoverBg} hover:${theme.pillHoverBorder}`;

  return (
    <div className="flex flex-wrap items-center gap-1 group/hier">
      <div 
        draggable={canDragTag}
        onDragStart={(event) => {
          if (!canDragTag) return;
          event.dataTransfer.effectAllowed = 'move';
          event.dataTransfer.setData('text/plain', node.id);
          handleTagDragStart(node);
        }}
        onDragEnd={handleTagDragEnd}
        className={`inline-flex h-7 items-center gap-1.5 rounded-lg border px-2 transition-all shadow-3xs cursor-pointer group/pill ${
          draggingTagId === node.id ? 'opacity-45 ring-2 ring-slate-300' : ''
        } ${canDragTag ? 'active:cursor-grabbing' : ''} ${pillClasses}`}
        onClick={(e) => {
          if (hasChildren) toggleExpand(node.id);
          else e.stopPropagation();
        }}
      >
        {canDragTag && (
          <GripVertical className={`h-3 w-3 shrink-0 opacity-45 ${tone.icon}`} />
        )}
        <div onClick={(e) => e.stopPropagation()}>
          <InlineEditor node={node} {...inlineEditorProps} />
        </div>
        
        {hasChildren && (
          <ChevronRight className={`w-3 h-3 transition-transform ${viewMode === 'card' ? tone.icon : theme.icon} group-hover/pill:${theme.iconActive} ${isExpanded ? 'rotate-90' : ''}`} />
        )}

        <div className="flex items-center opacity-0 group-hover/pill:opacity-100 transition-opacity gap-0.5" onClick={(e) => e.stopPropagation()}>
           <button onClick={() => handleAddChild(node.id)} className={`p-0.5 ${viewMode === 'card' ? tone.icon : theme.icon} hover:text-emerald-500`} title="添加子标签"><Plus className="w-3 h-3"/></button>
           <button onClick={() => handleDelete(node.id)} className={`p-0.5 ${viewMode === 'card' ? tone.icon : theme.icon} hover:text-rose-500`} title="删除标签"><X className="w-3 h-3"/></button>
        </div>
      </div>
      
      {isExpanded && hasChildren && viewMode === 'card' && (
        <div className={`flex flex-wrap items-center gap-1 border-l ${theme.guideLine} pl-1.5 animate-in slide-in-from-left-2 duration-300`}>
           {node.children!.map(child => (
             <AdaptiveTagPill 
               key={child.id} 
               node={child} 
               theme={theme} 
               expandedIds={expandedIds}
               toggleExpand={toggleExpand}
               handleAddChild={handleAddChild}
               handleDelete={handleDelete}
               draggingTagId={draggingTagId}
               handleTagDragStart={handleTagDragStart}
               handleTagDragEnd={handleTagDragEnd}
               viewMode={viewMode}
               inlineEditorProps={inlineEditorProps}
             />
           ))}
           
           <button 
              onClick={() => handleAddChild(node.id)} 
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white text-slate-300 transition-all hover:border-primary/50 hover:text-primary"
              title="新增子项"
            >
              <Plus className="w-3.5 h-3.5" />
           </button>
        </div>
      )}
    </div>
  );
};

interface MindmapNodeProps {
  node: TagNode;
  theme: any;
  expandedIds: Set<string>;
  toggleExpand: (id: string) => void;
  handleAddChild: (id: string) => void;
  handleDelete: (id: string) => void;
  draggingTagId: string | null;
  handleTagDragStart: (node: TagNode) => void;
  handleTagDragEnd: () => void;
  inlineEditorProps: Omit<InlineEditorProps, 'node'>;
}

const MindmapNode: React.FC<MindmapNodeProps> = ({
  node, theme, expandedIds, toggleExpand, handleAddChild, handleDelete,
  draggingTagId, handleTagDragStart, handleTagDragEnd, inlineEditorProps
}) => {
  const isExpanded = expandedIds.has(node.id);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="flex items-center relative py-2">
      {/* 节点主体 */}
      <div className="flex-shrink-0 z-10">
        <AdaptiveTagPill 
          node={node} 
          theme={theme} 
          expandedIds={expandedIds}
          toggleExpand={toggleExpand}
          handleAddChild={handleAddChild}
          handleDelete={handleDelete}
          draggingTagId={draggingTagId}
          handleTagDragStart={handleTagDragStart}
          handleTagDragEnd={handleTagDragEnd}
          viewMode="mindmap"
          inlineEditorProps={inlineEditorProps}
        />
      </div>

      {/* 递归子节点 */}
      {isExpanded && hasChildren && (
        <div className="flex flex-col gap-4 ml-12 relative before:absolute before:left-[-24px] before:top-4 before:bottom-4 before:w-px before:bg-slate-200">
          {node.children!.map((child, idx) => (
            <div key={child.id} className="relative flex items-center">
              {/* 连接线：从父节点中心到当前子节点 */}
              <div className="absolute left-[-24px] w-6 h-px bg-slate-200 top-1/2 -translate-y-1/2"></div>
              <MindmapNode 
                node={child} 
                theme={theme} 
                expandedIds={expandedIds}
                toggleExpand={toggleExpand}
                handleAddChild={handleAddChild}
                handleDelete={handleDelete}
                draggingTagId={draggingTagId}
                handleTagDragStart={handleTagDragStart}
                handleTagDragEnd={handleTagDragEnd}
                inlineEditorProps={inlineEditorProps}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const VideoTagManager: React.FC = () => {
  const [tags, setTags] = useState<TagNode[]>(initialData);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempName, setTempName] = useState('');
  const [tempType, setTempType] = useState<'single' | 'multi' | 'none'>('none');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['u1-1', 'u1-1-1', 'u2-1']));
  const [draggingTagId, setDraggingTagId] = useState<string | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const autoScrollFrameRef = useRef<number | null>(null);
  const autoScrollDeltaRef = useRef(0);

  const inlineEditorProps: Omit<InlineEditorProps, 'node'> = {
    editingId,
    tempName,
    setTempName,
    handleSaveEdit: () => handleSaveEdit(),
    setEditingId,
    inputRef,
    handleStartEdit: (node) => handleStartEdit(node)
  };

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  const stopDragAutoScroll = () => {
    autoScrollDeltaRef.current = 0;
    if (autoScrollFrameRef.current !== null) {
      cancelAnimationFrame(autoScrollFrameRef.current);
      autoScrollFrameRef.current = null;
    }
  };

  const runDragAutoScroll = () => {
    const container = scrollContainerRef.current;
    if (!container || !draggingTagId || autoScrollDeltaRef.current === 0) {
      stopDragAutoScroll();
      return;
    }

    container.scrollBy({ top: autoScrollDeltaRef.current, behavior: 'auto' });
    autoScrollFrameRef.current = requestAnimationFrame(runDragAutoScroll);
  };

  const handleDragAutoScroll = (event: React.DragEvent<HTMLDivElement>) => {
    if (!draggingTagId) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const edgeSize = 96;
    const maxSpeed = 18;
    const distanceToTop = event.clientY - rect.top;
    const distanceToBottom = rect.bottom - event.clientY;
    let nextDelta = 0;

    if (distanceToTop < edgeSize) {
      nextDelta = -Math.ceil((1 - Math.max(distanceToTop, 0) / edgeSize) * maxSpeed);
    } else if (distanceToBottom < edgeSize) {
      nextDelta = Math.ceil((1 - Math.max(distanceToBottom, 0) / edgeSize) * maxSpeed);
    }

    autoScrollDeltaRef.current = nextDelta;
    if (nextDelta !== 0 && autoScrollFrameRef.current === null) {
      autoScrollFrameRef.current = requestAnimationFrame(runDragAutoScroll);
    } else if (nextDelta === 0) {
      stopDragAutoScroll();
    }
  };

  useEffect(() => () => stopDragAutoScroll(), []);

  const findNodeAndParent = (nodes: TagNode[], id: string): { node: TagNode, parentList: TagNode[], index: number } | null => {
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].id === id) return { node: nodes[i], parentList: nodes, index: i };
      if (nodes[i].children) {
        const result = findNodeAndParent(nodes[i].children!, id);
        if (result) return result;
      }
    }
    return null;
  };

  const normalizeNodeLevel = (node: TagNode, level: number): TagNode => ({
    ...node,
    level,
    children: node.children?.map(child => normalizeNodeLevel(child, level + 1)),
  });

  const handleTagDragStart = (node: TagNode) => {
    if (node.level < 4) return;
    setDraggingTagId(node.id);
  };

  const handleTagDragEnd = () => {
    stopDragAutoScroll();
    setDraggingTagId(null);
  };

  const handleDropTagToGroup = (targetGroupId: string) => {
    stopDragAutoScroll();
    if (!draggingTagId || draggingTagId === targetGroupId) return;

    const newTags = [...tags];
    const dragged = findNodeAndParent(newTags, draggingTagId);
    const target = findNodeAndParent(newTags, targetGroupId);

    if (!dragged || !target || dragged.node.level < 4 || target.node.level !== 3) {
      setDraggingTagId(null);
      return;
    }

    if (dragged.parentList === target.node.children) {
      setDraggingTagId(null);
      return;
    }

    const [movedNode] = dragged.parentList.splice(dragged.index, 1);
    const normalizedNode = normalizeNodeLevel(movedNode, target.node.level + 1);
    target.node.children = [...(target.node.children || []), normalizedNode];
    setTags(newTags);
    setExpandedIds(prev => new Set(prev).add(targetGroupId));
    setDraggingTagId(null);
  };

  const toggleExpand = (id: string) => {
    const next = new Set(expandedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedIds(next);
  };

  const handleStartEdit = (node: TagNode) => {
    setEditingId(node.id);
    setTempName(node.name);
    setTempType(node.type || 'none');
  };

  const handleSaveEdit = () => {
    if (!tempName.trim()) return setEditingId(null);
    const newTags = [...tags];
    const found = findNodeAndParent(newTags, editingId!);
    if (found) {
      found.node.name = tempName;
      found.node.type = tempType;
      setTags(newTags);
    }
    setEditingId(null);
  };

  const handleAddChild = (parentId: string) => {
    const newTags = [...tags];
    const found = findNodeAndParent(newTags, parentId);
    if (found) {
      const newId = `tag-${Date.now()}`;
      const newNode: TagNode = {
        id: newId, name: '新项', level: found.node.level + 1, type: 'none', children: []
      };
      found.node.children = [...(found.node.children || []), newNode];
      setTags(newTags);
      setExpandedIds(prev => new Set(prev).add(parentId));
      handleStartEdit(newNode);
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm('确定删除吗？')) return;
    const newTags = [...tags];
    const found = findNodeAndParent(newTags, id);
    if (found) {
      found.parentList.splice(found.index, 1);
      setTags(newTags);
    }
  };

  const getModuleStyle = (name: string) => {
    if (name.includes('AB')) return { 
      bg: 'bg-indigo-600', 
      dot: 'bg-indigo-400', 
      card: 'border-indigo-100',
      pillBg: 'bg-indigo-50/50',
      pillBorder: 'border-indigo-100/50',
      pillHoverBg: 'bg-indigo-100/50',
      pillHoverBorder: 'border-indigo-200',
      pillActiveBg: 'bg-indigo-100',
      pillActiveBorder: 'border-indigo-300',
      ring: 'ring-indigo-500/10',
      icon: 'text-indigo-400',
      iconActive: 'text-indigo-600',
      guideLine: 'border-indigo-100',
      subBorder: 'border-indigo-100',
      line: 'stroke-indigo-200'
    };
    if (name.includes('通用')) return { 
      bg: 'bg-emerald-600', 
      dot: 'bg-emerald-400', 
      card: 'border-emerald-100',
      pillBg: 'bg-emerald-50/50',
      pillBorder: 'border-emerald-100/50',
      pillHoverBg: 'bg-emerald-100/50',
      pillHoverBorder: 'border-emerald-200',
      pillActiveBg: 'bg-emerald-100',
      pillActiveBorder: 'border-emerald-300',
      ring: 'ring-emerald-500/10',
      icon: 'text-emerald-400',
      iconActive: 'text-emerald-600',
      guideLine: 'border-emerald-100',
      subBorder: 'border-emerald-100',
      line: 'stroke-emerald-200'
    };
    return { 
      bg: 'bg-violet-600', 
      dot: 'bg-violet-400', 
      card: 'border-violet-100',
      pillBg: 'bg-violet-50/50',
      pillBorder: 'border-violet-100/50',
      pillHoverBg: 'bg-violet-100/50',
      pillHoverBorder: 'border-violet-200',
      pillActiveBg: 'bg-violet-100',
      pillActiveBorder: 'border-violet-300',
      ring: 'ring-violet-500/10',
      icon: 'text-violet-400',
      iconActive: 'text-violet-600',
      guideLine: 'border-violet-100',
      subBorder: 'border-violet-100',
      line: 'stroke-violet-200'
    };
  };

  return (
    <div className="h-full flex flex-col gap-3">
      {/* 顶部工具栏 */}
      <div className="bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between gap-4 shrink-0 transition-all">
        <div className="flex min-w-0 items-center gap-4">
          <div className="relative group">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="快速定位标签..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] focus:outline-none w-64 md:w-80 transition-all" />
          </div>
        </div>
        <button onClick={() => handleAddChild(tags[0].id)} className="px-4 py-2 bg-slate-900 text-white text-[11px] font-bold rounded-xl shadow-lg hover:bg-black transition-all flex items-center gap-1.5"><Plus className="w-3.5 h-3.5"/> 新增顶层分类</button>
      </div>

      {/* 标签管理内容区 */}
      <div
        ref={scrollContainerRef}
        onDragOver={handleDragAutoScroll}
        onDragLeave={stopDragAutoScroll}
        onDrop={stopDragAutoScroll}
        className="flex-1 overflow-auto no-scrollbar pb-10"
      >
          <div className="space-y-5">
            {tags.map(root => {
              const style = getModuleStyle(root.name);
              return (
                <div key={root.id} className={`rounded-2xl border ${style.card} bg-white p-3 shadow-sm`}>
                  <div className="mb-3 flex items-center gap-2 px-1">
                    <div className={`h-5 w-1.5 ${style.bg} rounded-full shadow-sm`}></div>
                    <InlineEditor node={root} {...inlineEditorProps} />
                    <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-black text-slate-400">
                      {countLeafTags(root)} 个标签
                    </span>
                    <button
                      onClick={() => handleAddChild(root.id)}
                      className="ml-auto inline-flex h-7 items-center gap-1 rounded-lg border border-slate-150 bg-slate-50 px-2 text-[10px] font-black text-slate-500 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600"
                    >
                      <Plus className="h-3 w-3" /> 子分组
                    </button>
                  </div>

                  <div className="space-y-3">
                    {root.children?.map(l2 => (
                      <div key={l2.id} className="rounded-xl border border-slate-100 bg-slate-50/50 p-2.5">
                        <div className="mb-2 flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${style.dot} opacity-80`}></div>
                          <InlineEditor node={l2} {...inlineEditorProps} />
                          <span className="rounded bg-white px-1.5 py-0.5 text-[9px] font-black text-slate-400 ring-1 ring-slate-100">
                            {countLeafTags(l2)}
                          </span>
                          <button
                            onClick={() => handleAddChild(l2.id)}
                            className="ml-auto inline-flex h-6 items-center gap-1 rounded-md px-1.5 text-[9px] font-black text-slate-400 hover:bg-white hover:text-emerald-600"
                          >
                            <Plus className="h-3 w-3" /> 内容组
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-2 lg:grid-cols-2 2xl:grid-cols-3">
                          {l2.children?.map(l3 => (
                            <div
                              key={l3.id}
                              onDragOver={(event) => {
                                if (!draggingTagId) return;
                                event.preventDefault();
                                event.dataTransfer.dropEffect = 'move';
                              }}
                              onDrop={(event) => {
                                event.preventDefault();
                                handleDropTagToGroup(l3.id);
                              }}
                              className={`group rounded-xl border bg-white p-2.5 shadow-3xs transition-all ${
                                draggingTagId ? 'border-dashed border-primary/40 bg-indigo-50/40 ring-1 ring-primary/10' : 'border-slate-100'
                              }`}
                            >
                              <div className="mb-2 flex items-center gap-1.5">
                                <InlineEditor node={l3} {...inlineEditorProps} />
                                {l3.type && l3.type !== 'none' && (
                                  <span className={`rounded px-1 py-0.5 text-[8px] font-black ${l3.type === 'single' ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                    {l3.type === 'single' ? '单选' : '多选'}
                                  </span>
                                )}
                                <span className="rounded bg-slate-50 px-1.5 py-0.5 text-[8px] font-black text-slate-400">
                                  {countLeafTags(l3)}
                                </span>
                                <button
                                  onClick={() => handleAddChild(l3.id)}
                                  className="ml-auto inline-flex h-6 items-center gap-1 rounded-md px-1.5 text-[9px] font-black text-slate-400 opacity-0 transition-all hover:bg-slate-50 hover:text-primary group-hover:opacity-100"
                                >
                                  <Plus className="h-3 w-3" /> 标签
                                </button>
                              </div>
                              
                              <div className="flex flex-wrap items-start gap-1.5">
                                {l3.children?.map(child => (
                                  <AdaptiveTagPill 
                                    key={child.id} 
                                    node={child} 
                                    theme={style} 
                                    expandedIds={expandedIds}
                                    toggleExpand={toggleExpand}
                                    handleAddChild={handleAddChild}
                                    handleDelete={handleDelete}
                                    draggingTagId={draggingTagId}
                                    handleTagDragStart={handleTagDragStart}
                                    handleTagDragEnd={handleTagDragEnd}
                                    viewMode="card"
                                    inlineEditorProps={inlineEditorProps}
                                  />
                                ))}
                                <button
                                  onClick={() => handleAddChild(l3.id)}
                                  className="inline-flex h-7 items-center gap-1 rounded-lg border border-dashed border-slate-200 bg-white px-2 text-[10px] font-black text-slate-400 transition-all hover:border-primary/50 hover:text-primary"
                                >
                                  <Plus className="h-3 w-3" /> 添加
                                </button>
                              </div>
                            </div>
                          ))}
                          <button
                            onClick={() => handleAddChild(l2.id)}
                            className="flex min-h-[76px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white/70 text-[10px] font-black text-slate-400 transition-all hover:border-primary/50 hover:text-primary"
                          >
                            <Plus className="mr-1 h-3 w-3" /> 新增内容组
                            </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </div>
  );
};

export default VideoTagManager;
