import React, { useEffect, useRef, useState } from 'react';
import { ChevronsLeft, ChevronsRight, GripVertical, LucideIcon } from 'lucide-react';

interface ResizableSidebarProps {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  storageKey: string;
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  collapsedWidth?: number;
  children: (collapsed: boolean) => React.ReactNode;
  footer?: (collapsed: boolean) => React.ReactNode;
}

const ResizableSidebar: React.FC<ResizableSidebarProps> = ({
  title,
  subtitle,
  icon: Icon,
  storageKey,
  defaultWidth = 240,
  minWidth = 196,
  maxWidth = 360,
  collapsedWidth = 44,
  children,
  footer,
}) => {
  const [width, setWidth] = useState(defaultWidth);
  const [collapsed, setCollapsed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const draggingRef = useRef(false);

  useEffect(() => {
    const savedWidth = Number(window.localStorage.getItem(`${storageKey}:width`));
    const savedCollapsed = window.localStorage.getItem(`${storageKey}:collapsed`);

    if (!Number.isNaN(savedWidth) && savedWidth >= minWidth && savedWidth <= maxWidth) {
      setWidth(savedWidth);
    }
    if (savedCollapsed !== null) {
      setCollapsed(savedCollapsed === 'true');
    }
  }, [maxWidth, minWidth, storageKey]);

  useEffect(() => {
    window.localStorage.setItem(`${storageKey}:width`, String(width));
  }, [storageKey, width]);

  useEffect(() => {
    window.localStorage.setItem(`${storageKey}:collapsed`, String(collapsed));
  }, [storageKey, collapsed]);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (!draggingRef.current) return;
      const sidebarLeft = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const nextWidth = Math.min(maxWidth, Math.max(minWidth, event.clientX - sidebarLeft));
      setWidth(nextWidth);
    };

    const handlePointerUp = () => {
      draggingRef.current = false;
      setIsDragging(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [maxWidth, minWidth]);

  const startResize = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (collapsed) return;
    event.preventDefault();
    draggingRef.current = true;
    setIsDragging(true);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  return (
    <aside
      ref={sidebarRef}
      className={`relative flex shrink-0 flex-col border-r border-slate-200 bg-white transition-[width] duration-200 ${
        isDragging ? 'transition-none' : ''
      }`}
      style={{ width: collapsed ? collapsedWidth : width }}
    >
      <div className={`flex h-14 shrink-0 items-center border-b border-slate-100 ${collapsed ? 'justify-center px-0' : 'gap-2 px-3'}`}>
        {collapsed ? (
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-800"
            title="展开侧边栏"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        ) : (
          <>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
              <Icon className="h-4 w-4" />
            </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-black tracking-tight text-slate-900">{title}</div>
            {subtitle && <div className="mt-0.5 truncate text-[9.5px] font-bold uppercase tracking-widest text-slate-400">{subtitle}</div>}
          </div>
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-800"
              title="收起侧边栏"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      <div className={`flex-1 no-scrollbar ${collapsed ? 'overflow-visible px-1.5 py-3' : 'overflow-y-auto p-3'}`}>
        {children(collapsed)}
      </div>

      {!collapsed && footer && (
        <div className="shrink-0 border-t border-slate-100 p-3">
          {footer(false)}
        </div>
      )}

      {!collapsed && (
        <button
          type="button"
          onPointerDown={startResize}
          className={`absolute -right-1 top-0 z-10 flex h-full w-2 cursor-col-resize items-center justify-center transition-colors ${
            isDragging ? 'bg-indigo-100' : 'hover:bg-indigo-50'
          }`}
          title="拖动调整侧边栏宽度"
        >
          <GripVertical className={`h-4 w-4 ${isDragging ? 'text-indigo-500' : 'text-slate-300'}`} />
        </button>
      )}
    </aside>
  );
};

export default ResizableSidebar;
