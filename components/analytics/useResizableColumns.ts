import { useMemo, useRef, type Dispatch, type PointerEvent as ReactPointerEvent, type SetStateAction } from 'react';
import type { ColumnConfig } from './ColumnConfigDropdown';

const DEFAULT_COLUMN_WIDTH = 120;
const MIN_COLUMN_WIDTH = 72;
const MAX_COLUMN_WIDTH = 420;

export const getColumnWidth = (column: ColumnConfig) => column.width ?? DEFAULT_COLUMN_WIDTH;

export const useResizableColumns = (
  visibleColumns: ColumnConfig[],
  setColumns: Dispatch<SetStateAction<ColumnConfig[]>>,
  minTableWidth: number,
) => {
  const resizingRef = useRef<{
    columnId: string;
    startX: number;
    startWidth: number;
  } | null>(null);

  const tableWidth = useMemo(
    () => Math.max(minTableWidth, visibleColumns.reduce((sum, column) => sum + getColumnWidth(column), 0)),
    [minTableWidth, visibleColumns],
  );

  const startResize = (columnId: string, event: ReactPointerEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const column = visibleColumns.find((item) => item.id === columnId);
    if (!column) return;

    resizingRef.current = {
      columnId,
      startX: event.clientX,
      startWidth: getColumnWidth(column),
    };

    const previousCursor = document.body.style.cursor;
    const previousUserSelect = document.body.style.userSelect;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const resizing = resizingRef.current;
      if (!resizing) return;
      const nextWidth = Math.min(
        MAX_COLUMN_WIDTH,
        Math.max(MIN_COLUMN_WIDTH, resizing.startWidth + moveEvent.clientX - resizing.startX),
      );
      setColumns((current) =>
        current.map((item) => (item.id === resizing.columnId ? { ...item, width: nextWidth } : item)),
      );
    };

    const handlePointerUp = () => {
      resizingRef.current = null;
      document.body.style.cursor = previousCursor;
      document.body.style.userSelect = previousUserSelect;
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
  };

  return { startResize, tableWidth };
};
