import React, { useEffect, useRef, useState } from 'react';
import { Check, GripVertical, X } from 'lucide-react';

export interface ColumnConfig {
  id: string;
  name: string;
  visible: boolean;
  width?: number;
}

interface ColumnConfigDropdownProps {
  columns: ColumnConfig[];
  onClose: () => void;
  onDrag: (from: number, to: number) => void;
  onToggle: (id: string) => void;
  open: boolean;
}

export const ColumnConfigDropdown = ({
  columns,
  onClose,
  onDrag,
  onToggle,
  open,
}: ColumnConfigDropdownProps) => {
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target;
      if (target instanceof Element && target.closest('[data-column-config-trigger="true"]')) return;
      if (!rootRef.current?.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div ref={rootRef} className="absolute right-0 top-[calc(100%+8px)] z-40 w-72 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-200/80">
      <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
        <span className="text-xs font-black text-slate-700">字段配置</span>
        <button type="button" onClick={onClose} className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="max-h-80 overflow-y-auto p-1.5">
        {columns.map((column, index) => (
          <div
            key={column.id}
            draggable
            onDragStart={() => setDraggingIndex(index)}
            onDragEnd={() => {
              setDraggingIndex(null);
              setDragOverIndex(null);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              setDragOverIndex(index);
            }}
            onDragLeave={() => setDragOverIndex((current) => (current === index ? null : current))}
            onDrop={() => {
              if (draggingIndex !== null && draggingIndex !== index) onDrag(draggingIndex, index);
              setDraggingIndex(null);
              setDragOverIndex(null);
            }}
            className={`flex h-9 cursor-grab items-center gap-2 rounded-lg px-2 text-xs font-bold text-slate-600 transition-all duration-200 ease-out hover:bg-slate-50 active:cursor-grabbing ${
              draggingIndex === index ? 'scale-[0.98] bg-indigo-50 text-indigo-700 opacity-70 shadow-sm' : ''
            } ${
              dragOverIndex === index && draggingIndex !== index ? 'translate-y-0.5 bg-slate-100 ring-2 ring-indigo-100' : ''
            }`}
          >
            <GripVertical className="h-3.5 w-3.5 shrink-0 text-slate-300" />
            <button
              type="button"
              onClick={() => onToggle(column.id)}
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                column.visible ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-slate-300 bg-white'
              }`}
            >
              {column.visible && <Check className="h-3 w-3" />}
            </button>
            <span className="min-w-0 flex-1 truncate">{column.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
