import React, { useEffect, useMemo, useState } from 'react';
import { ArrowUpDown, ChevronLeft, ChevronRight, Play, Settings, X } from 'lucide-react';
import { AnalyticsDateRangeField, AnalyticsFilterBar, AnalyticsSearchField, AnalyticsSelectField, getRecentUtcRange } from './analytics/AnalyticsFilters';
import { ColumnConfigDropdown } from './analytics/ColumnConfigDropdown';
import { INITIAL_COLUMNS, buildMockSpends, channels, getSortValue, getTypeLabel, languages, metricHelp, platforms, type MaterialSpend, type MaterialType, type SortDirection } from './analytics/consumptionDataModel';
import { getColumnWidth, useResizableColumns } from './analytics/useResizableColumns';

export const ConsumptionDataPage: React.FC = () => {
  const [launchStart, setLaunchStart] = useState('');
  const [launchEnd, setLaunchEnd] = useState('');
  const [spendStart, setSpendStart] = useState(() => getRecentUtcRange(30).start);
  const [spendEnd, setSpendEnd] = useState(() => getRecentUtcRange(30).end);
  const [selectedChannel, setSelectedChannel] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [campaignQuery, setCampaignQuery] = useState('');
  const [setQuery, setSetQuery] = useState('');
  const [materialIdQuery, setMaterialIdQuery] = useState('');
  const [materialNameQuery, setMaterialNameQuery] = useState('');
  const [activeTypeTab, setActiveTypeTab] = useState<'all' | MaterialType>('all');
  const [modalMaterialUses, setModalMaterialUses] = useState<MaterialSpend | null>(null);
  const [columns, setColumns] = useState(INITIAL_COLUMNS);
  const [showConfig, setShowConfig] = useState(false);
  const [sortKey, setSortKey] = useState('spend');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [tooltip, setTooltip] = useState<{ left: number; text: string; top: number } | null>(null);

  const allSpends = useMemo(() => buildMockSpends(), []);
  const showLangCol = columns.find((column) => column.id === 'language')?.visible ?? true;
  const showSizeCol = columns.find((column) => column.id === 'size')?.visible ?? false;
  const visibleColumns = columns.filter((column) => column.visible);
  const { startResize, tableWidth } = useResizableColumns(visibleColumns, setColumns, 1500);

  const filteredMaterials = useMemo(() => {
    let rows = allSpends.filter((item) => {
      if (selectedChannel) {
        if (item.channel !== selectedChannel) return false;
      }
      if (selectedPlatform && item.platform !== selectedPlatform) return false;
      if (selectedLanguage && item.language !== selectedLanguage) return false;
      if (activeTypeTab !== 'all' && item.type !== activeTypeTab) return false;
      if (campaignQuery && !item.associatedSets.some((set) => set.campaign.toLowerCase().includes(campaignQuery.toLowerCase()))) return false;
      if (setQuery && !item.associatedSets.some((set) => set.setName.toLowerCase().includes(setQuery.toLowerCase()))) return false;
      const materialQuery = materialNameQuery || materialIdQuery;
      if (materialQuery) {
        const normalizedQuery = materialQuery.toLowerCase();
        if (!item.id.toLowerCase().includes(normalizedQuery) && !item.name.toLowerCase().includes(normalizedQuery)) return false;
      }
      return true;
    });

    if (!showLangCol) {
      const grouped: Record<string, MaterialSpend> = {};
      rows.forEach((item) => {
        if (!grouped[item.contentId]) {
          grouped[item.contentId] = { ...item, associatedSets: [...item.associatedSets] };
        } else {
          grouped[item.contentId].spend += item.spend;
          grouped[item.contentId].impressions += item.impressions;
          grouped[item.contentId].clicks += item.clicks;
          grouped[item.contentId].associatedSets.push(...item.associatedSets);
        }
      });
      rows = Object.values(grouped);
    } else if (!showSizeCol) {
      const grouped: Record<string, MaterialSpend> = {};
      rows.forEach((item) => {
        if (!grouped[item.id]) {
          grouped[item.id] = { ...item, associatedSets: [...item.associatedSets] };
        } else {
          grouped[item.id].spend += item.spend;
          grouped[item.id].impressions += item.impressions;
          grouped[item.id].clicks += item.clicks;
          grouped[item.id].associatedSets.push(...item.associatedSets);
        }
      });
      rows = Object.values(grouped);
    }

    const totalSpend = rows.reduce((sum, row) => sum + row.spend, 0);
    rows.sort((a, b) => {
      const valA = getSortValue(a, sortKey, totalSpend);
      const valB = getSortValue(b, sortKey, totalSpend);
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return rows;
  }, [activeTypeTab, allSpends, campaignQuery, materialIdQuery, materialNameQuery, selectedChannel, selectedLanguage, selectedPlatform, setQuery, showLangCol, showSizeCol, sortDirection, sortKey]);

  const totalSpend = useMemo(() => filteredMaterials.reduce((sum, row) => sum + row.spend, 0), [filteredMaterials]);
  const totalPages = Math.max(1, Math.ceil(filteredMaterials.length / pageSize));
  const pagedMaterials = filteredMaterials.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [activeTypeTab, campaignQuery, materialIdQuery, materialNameQuery, pageSize, selectedChannel, selectedLanguage, selectedPlatform, setQuery, showLangCol, showSizeCol]);

  const toggleSort = (key: string) => {
    setSortKey(key);
    setSortDirection((current) => (sortKey === key && current === 'asc' ? 'desc' : 'asc'));
  };

  const toggleColumnVisible = (id: string) => {
    setColumns((current) => current.map((column) => (column.id === id ? { ...column, visible: !column.visible } : column)));
  };

  const moveColumn = (from: number, to: number) => {
    setColumns((current) => {
      const next = [...current];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const renderCell = (columnId: string, material: MaterialSpend) => {
    const pct = totalSpend > 0 ? (material.spend / totalSpend) * 100 : 0;
    const ctr = material.impressions > 0 ? (material.clicks / material.impressions) * 100 : 0;

    switch (columnId) {
      case 'id':
        return <span className="font-mono text-[11px] font-black text-slate-500">{material.id}</span>;
      case 'name':
        return <span className="block truncate font-bold text-slate-800" title={material.name}>{material.name}</span>;
      case 'contentId':
        return <span className="font-mono text-[11px] text-slate-400">{material.contentId}</span>;
      case 'thumbnail':
        return (
          <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
            <img src={material.thumbnail} className="h-full w-full object-cover" alt="" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/35 opacity-0 transition-opacity hover:opacity-100">
              <Play className="h-3.5 w-3.5 text-white" />
            </div>
          </div>
        );
      case 'sets':
        return (
          <button
            type="button"
            onClick={() => setModalMaterialUses(material)}
            className="font-black text-indigo-600 hover:text-indigo-800 hover:underline"
          >
            {material.associatedSets.length} 个 set
          </button>
        );
      case 'firstImpressionTime':
        return <span className="font-mono text-[11px] text-slate-500">{material.launchTime}</span>;
      case 'spend':
        return <span className="font-mono font-black">${material.spend.toLocaleString()}</span>;
      case 'spendRatio':
        return <span className="font-mono font-black text-pink-600">{pct.toFixed(2)}%</span>;
      case 'impressions':
        return <span className="font-mono">{material.impressions.toLocaleString()}</span>;
      case 'clicks':
        return <span className="font-mono">{material.clicks.toLocaleString()}</span>;
      case 'ctr':
        return <span className="font-mono font-black">{ctr.toFixed(2)}%</span>;
      case 'language':
        return <span className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-black text-slate-600">{material.language}</span>;
      case 'size':
        return <span className="font-mono text-[11px] text-slate-500">{material.size}</span>;
      case 'owner':
        return material.owner;
      case 'designer':
        return material.designer;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-3 pb-6">
      <AnalyticsFilterBar>
        <AnalyticsDateRangeField
          start={spendStart}
          end={spendEnd}
          onChange={({ start, end }) => {
            setSpendStart(start);
            setSpendEnd(end);
          }}
        />
        <AnalyticsDateRangeField
          mode="launch"
          start={launchStart}
          end={launchEnd}
          onChange={({ start, end }) => {
            setLaunchStart(start);
            setLaunchEnd(end);
          }}
        />
        <AnalyticsSelectField placeholder="渠道" value={selectedChannel} onChange={setSelectedChannel} options={channels.map((channel) => ({ value: channel, label: channel }))} className="w-[140px]" />
        <AnalyticsSelectField placeholder="Platform" value={selectedPlatform} onChange={setSelectedPlatform} options={platforms.map((platform) => ({ value: platform, label: platform }))} className="w-[130px]" />
        <AnalyticsSelectField placeholder="语言" value={selectedLanguage} onChange={setSelectedLanguage} options={languages.map((language) => ({ value: language, label: language }))} className="w-[120px]" />
        <AnalyticsSearchField placeholder="Campaign" value={campaignQuery} onChange={setCampaignQuery} className="w-[170px]" />
        <AnalyticsSearchField placeholder="Set 名称" value={setQuery} onChange={setSetQuery} className="w-[170px]" />
        <AnalyticsSelectField
          placeholder="素材类型"
          value={activeTypeTab === 'all' ? '' : activeTypeTab}
          onChange={(value) => setActiveTypeTab((value || 'all') as 'all' | MaterialType)}
          options={[
            { value: 'video', label: '视频' },
            { value: 'playable', label: '试玩' },
            { value: 'image', label: '图片' },
          ]}
          className="w-[130px]"
        />
        <AnalyticsSearchField placeholder="素材名称 / ID" value={materialNameQuery || materialIdQuery} onChange={(value) => {
          setMaterialNameQuery(value);
          setMaterialIdQuery(value);
        }} className="w-[190px]" />
      </AnalyticsFilterBar>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-3 py-2">
          <div className="text-xs font-bold text-slate-400">
            共 <span className="font-black text-slate-700">{filteredMaterials.length}</span> 条素材消耗
          </div>
          <div className="flex items-center gap-2">
            <select
              value={pageSize}
              onChange={(event) => setPageSize(Number(event.target.value))}
              className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs font-bold text-slate-600 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
            >
              {[20, 50, 100, 200].map((size) => <option key={size} value={size}>{size} 行/页</option>)}
            </select>
            <div className="relative">
              <button
                type="button"
                data-column-config-trigger="true"
                onClick={() => setShowConfig((value) => !value)}
                className="flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-black text-slate-600 hover:border-indigo-200 hover:bg-slate-50"
              >
                <Settings className="h-3.5 w-3.5" />
                字段配置
              </button>
              <ColumnConfigDropdown columns={columns} onClose={() => setShowConfig(false)} onDrag={moveColumn} onToggle={toggleColumnVisible} open={showConfig} />
            </div>
          </div>
        </div>

        <div className="max-h-[calc(100vh-245px)] overflow-auto">
          <table className="table-fixed border-collapse text-left" style={{ width: tableWidth }}>
            <colgroup>
              {visibleColumns.map((column) => (
                <col key={column.id} style={{ width: getColumnWidth(column) }} />
              ))}
            </colgroup>
            <thead className="sticky top-0 z-20 bg-slate-100 text-[11px] font-black text-slate-600">
              <tr>
                {visibleColumns.map((column) => (
                  <th key={column.id} className="relative border-b border-r border-slate-200 px-3 py-2 pr-5 align-middle last:border-r-0">
                    <button
                      type="button"
                      onClick={() => toggleSort(column.id)}
                      onMouseEnter={(event) => {
                        const rect = event.currentTarget.getBoundingClientRect();
                        setTooltip({ left: rect.left + rect.width / 2, top: rect.top - 10, text: metricHelp[column.id] });
                      }}
                      onMouseLeave={() => setTooltip(null)}
                      className="flex w-full items-center justify-between gap-1 text-left leading-tight"
                    >
                      <span className="whitespace-normal">{column.name}</span>
                      <ArrowUpDown className={`h-3 w-3 shrink-0 ${sortKey === column.id ? 'text-indigo-500' : 'text-slate-300'}`} />
                    </button>
                    <span
                      role="separator"
                      aria-label={`调整${column.name}列宽`}
                      aria-orientation="vertical"
                      onPointerDown={(event) => startResize(column.id, event)}
                      className="absolute bottom-0 right-0 top-0 z-10 w-2 cursor-col-resize touch-none transition-colors hover:bg-indigo-200/70"
                    />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {pagedMaterials.map((material) => (
                <tr key={`${material.id}-${material.contentId}`} className="hover:bg-slate-50">
                  {visibleColumns.map((column) => (
                    <td key={column.id} className="truncate border-r border-slate-100 px-3 py-2 last:border-r-0">
                      {renderCell(column.id, material)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-3 py-2">
          <span className="text-xs font-bold text-slate-400">{page} / {totalPages}</span>
          <button type="button" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-30">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button type="button" disabled={page >= totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-30">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {tooltip && (
        <div
          className="pointer-events-none fixed z-[80] max-w-xs -translate-x-1/2 -translate-y-full rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium leading-relaxed text-white shadow-xl"
          style={{ left: tooltip.left, top: tooltip.top }}
        >
          {tooltip.text}
        </div>
      )}

      {modalMaterialUses && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="flex max-h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
              <div>
                <h3 className="max-w-2xl truncate text-sm font-black text-slate-800">{modalMaterialUses.name}</h3>
                <p className="mt-1 text-xs font-bold text-slate-400">被 {modalMaterialUses.associatedSets.length} 个 Set 使用</p>
              </div>
              <button onClick={() => setModalMaterialUses(null)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-[62vh] overflow-auto px-5 py-4">
              <table className="w-full table-fixed border-collapse text-left text-xs">
                <thead className="bg-slate-100 text-slate-600">
                  <tr>
                    <th className="border border-slate-200 px-3 py-3 text-left font-black">Ad Set 名称</th>
                    <th className="w-32 border border-slate-200 px-3 py-3 text-center font-black">首次投放</th>
                    <th className="w-28 border border-slate-200 px-3 py-3 text-right font-black">Campaign数</th>
                    <th className="w-32 border border-slate-200 px-3 py-3 text-right font-black">总消耗</th>
                  </tr>
                </thead>
                <tbody>
                  {modalMaterialUses.associatedSets.map((set) => (
                    <tr key={set.setName} className="hover:bg-slate-50">
                      <td className="border border-slate-100 px-3 py-3">
                        <div className="font-black text-slate-800">{set.setName}</div>
                        <div className="mt-1 text-[11px] font-bold text-slate-400">Campaign: {set.campaign}</div>
                      </td>
                      <td className="border border-slate-100 px-3 py-3 text-center font-mono text-slate-500">{set.firstLaunch}</td>
                      <td className="border border-slate-100 px-3 py-3 text-right font-mono">{set.campaignCount}</td>
                      <td className="border border-slate-100 px-3 py-3 text-right font-mono font-black">${set.spend.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsumptionDataPage;
