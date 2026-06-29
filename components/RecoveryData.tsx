import React, { useEffect, useMemo, useState } from 'react';
import { ArrowUpDown, ChevronLeft, ChevronRight, Play, Settings, X } from 'lucide-react';
import { AnalyticsDateRangeField, AnalyticsFilterBar, AnalyticsMultiSearchField, AnalyticsSelectField, getRecentUtcRange } from './analytics/AnalyticsFilters';
import { ColumnConfigDropdown } from './analytics/ColumnConfigDropdown';
import { INITIAL_COLUMNS, buildMockSets, channels, getActiveBenchmarkRules, getBenchmarkCellClassName, getMetrics, getSortValue, languages, metricHelp, normalizeBenchmarkChannel, normalizeBenchmarkPlatform, platforms, type SetItem, type SortDirection } from './analytics/recoveryDataModel';

export const RecoveryDataPage: React.FC = () => {
  const [launchStart, setLaunchStart] = useState('');
  const [launchEnd, setLaunchEnd] = useState('');
  const [spendStart, setSpendStart] = useState(() => getRecentUtcRange(30).start);
  const [spendEnd, setSpendEnd] = useState(() => getRecentUtcRange(30).end);
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedMaterialType, setSelectedMaterialType] = useState('');
  const [setSearch, setSetSearch] = useState('');
  const [campaignSearch, setCampaignSearch] = useState('');
  const [materialSearch, setMaterialSearch] = useState('');
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [selectedSets, setSelectedSets] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [columns, setColumns] = useState(INITIAL_COLUMNS);
  const [showConfig, setShowConfig] = useState(false);
  const [selectedMaterialForModal, setSelectedMaterialForModal] = useState<SetItem | null>(null);
  const [sortKey, setSortKey] = useState('spend');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [tooltip, setTooltip] = useState<{ left: number; text: string; top: number } | null>(null);

  const allSets = useMemo(() => buildMockSets(), []);
  const visibleColumns = columns.filter((column) => column.visible);
  const activeBenchmarkRules = useMemo(() => getActiveBenchmarkRules(), []);
  const resolveBenchmarkRule = (channel: string, platform: SetItem['platform']) => {
    const normalizedChannel = normalizeBenchmarkChannel(channel || 'All');
    const normalizedPlatform = normalizeBenchmarkPlatform(platform);
    return (
      activeBenchmarkRules[`${normalizedChannel}__${normalizedPlatform}`] ||
      activeBenchmarkRules[`${normalizedChannel}__${normalizeBenchmarkPlatform('全部')}`] ||
      activeBenchmarkRules[`${normalizeBenchmarkChannel('All')}__${normalizedPlatform}`] ||
      activeBenchmarkRules[`${normalizeBenchmarkChannel('All')}__${normalizeBenchmarkPlatform('全部')}`]
    );
  };

  const toggleMultiSelect = (item: string, list: string[], setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(list.includes(item) ? list.filter((value) => value !== item) : [...list, item]);
  };

  const filteredRows = useMemo(() => {
    const rows = allSets.filter((item) => {
      if (selectedPlatform && item.platform !== selectedPlatform) return false;
      if (selectedChannel && item.channel.toLowerCase() !== selectedChannel.toLowerCase()) return false;
      if (selectedLanguage && item.language !== selectedLanguage) return false;
      if (selectedMaterialType && !item.materials.some((material) => material.type === selectedMaterialType)) return false;
      if (setSearch && !item.setName.toLowerCase().includes(setSearch.toLowerCase())) return false;
      if (selectedSets.length > 0 && !selectedSets.includes(item.setName)) return false;
      if (campaignSearch && !item.campaign.toLowerCase().includes(campaignSearch.toLowerCase())) return false;
      if (selectedCampaigns.length > 0 && !selectedCampaigns.includes(item.campaign)) return false;
      if (materialSearch || selectedMaterials.length > 0) {
        const matchesMaterial = item.materials.some((material) => {
          const fuzzy = material.name.toLowerCase().includes(materialSearch.toLowerCase()) || material.id.toLowerCase().includes(materialSearch.toLowerCase());
          const selected = selectedMaterials.length === 0 || selectedMaterials.includes(material.name);
          return fuzzy && selected;
        });
        if (!matchesMaterial) return false;
      }
      return true;
    });

    rows.sort((a, b) => {
      const valA = getSortValue(a, sortKey);
      const valB = getSortValue(b, sortKey);
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return rows;
  }, [allSets, campaignSearch, materialSearch, selectedCampaigns, selectedChannel, selectedLanguage, selectedMaterialType, selectedMaterials, selectedPlatform, selectedSets, setSearch, sortDirection, sortKey]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const pagedRows = filteredRows.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [campaignSearch, materialSearch, pageSize, selectedCampaigns, selectedChannel, selectedLanguage, selectedMaterialType, selectedMaterials, selectedPlatform, selectedSets, setSearch]);

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

  const renderCell = (columnId: string, row: SetItem) => {
    const metrics = getMetrics(row);
    const topMaterial = [...row.materials].sort((a, b) => b.spend - a.spend)[0];
    const benchmark = resolveBenchmarkRule(selectedChannel || 'All', row.platform);
    const benchmarkBadge = (metric: string, value: number, content: React.ReactNode) => (
      <span className={`block rounded-md px-2 py-1 text-center ${benchmark ? getBenchmarkCellClassName(metric, value, benchmark) : ''}`}>
        {content}
      </span>
    );

    switch (columnId) {
      case 'channel':
        return row.channel;
      case 'platform':
        return <span className={`rounded border px-2 py-0.5 text-[10px] font-black ${row.platform === 'iOS' ? 'border-slate-200 bg-slate-50 text-slate-600' : 'border-emerald-100 bg-emerald-50 text-emerald-600'}`}>{row.platform}</span>;
      case 'campaign':
        return <span className="block truncate" title={row.campaign}>{row.campaign}</span>;
      case 'setName':
        return (
          <button type="button" onClick={() => setSelectedMaterialForModal(row)} className="block max-w-[240px] truncate text-left font-black text-indigo-600 hover:underline" title={row.setName}>
            {row.setName}
          </button>
        );
      case 'launchTime':
        return <span className="font-mono text-[11px] text-slate-500">{row.launchTime}</span>;
      case 'direction':
        return <span className="rounded bg-slate-50 px-2 py-0.5 text-[10px] font-black text-slate-600">{row.direction}</span>;
      case 'preview':
        return topMaterial ? (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
              {topMaterial.type === 'image' ? <img src={topMaterial.previewUrl} alt="" className="h-full w-full object-cover" /> : <Play className="h-3.5 w-3.5 text-slate-500" />}
            </div>
            <span className="min-w-0 truncate text-[11px] font-bold text-slate-600">{topMaterial.id}</span>
          </div>
        ) : null;
      case 'impressions':
        return row.impressions.toLocaleString();
      case 'clicks':
        return row.clicks.toLocaleString();
      case 'ctr':
        return `${metrics.ctr.toFixed(2)}%`;
      case 'installs':
        return benchmarkBadge('installs', row.installs, row.installs.toLocaleString());
      case 'cvr':
        return `${metrics.cvr.toFixed(2)}%`;
      case 'spend':
        return `$${row.spend.toLocaleString()}`;
      case 'cpi':
        return benchmarkBadge('cpi', metrics.cpi, `$${metrics.cpi.toFixed(2)}`);
      case 'cpm':
        return `$${metrics.cpm.toFixed(2)}`;
      case 'ir':
        return `${metrics.ir.toFixed(2)}%`;
      case 'd7PaidUsers':
        return benchmarkBadge('d7PaidUsers', row.d7PaidUsers, row.d7PaidUsers.toLocaleString());
      case 'd7PayRate':
        return benchmarkBadge('d7PayRate', metrics.d7PayRate, `${metrics.d7PayRate.toFixed(2)}%`);
      case 'd7Cpa':
        return benchmarkBadge('d7Cpa', metrics.d7Cpa, `$${metrics.d7Cpa.toFixed(2)}`);
      case 'd7TotalRev':
        return `$${row.d7TotalRev.toLocaleString()}`;
      case 'd0Roi':
        return `${metrics.d0Roi.toFixed(2)}%`;
      case 'd7Roi':
        return benchmarkBadge('d7Roi', metrics.d7Roi, `${metrics.d7Roi.toFixed(2)}%`);
      case 'd7IapRev':
        return `$${row.d7IapRev.toLocaleString()}`;
      case 'd7IapRoi':
        return `${metrics.d7IapRoi.toFixed(2)}%`;
      case 'd7Ret':
        return `${row.d7Ret.toFixed(1)}%`;
      case 'd7Arppu':
        return benchmarkBadge('d7Arppu', metrics.d7Arppu, `$${metrics.d7Arppu.toFixed(1)}`);
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
        <AnalyticsMultiSearchField placeholder="Campaign" searchValue={campaignSearch} onSearchChange={setCampaignSearch} selectedValues={selectedCampaigns} onToggle={(value) => toggleMultiSelect(value, selectedCampaigns, setSelectedCampaigns)} options={Array.from(new Set(allSets.map((item) => item.campaign))).map((campaign) => ({ value: campaign, label: campaign }))} className="w-[200px]" />
        <AnalyticsMultiSearchField placeholder="Set 名称" searchValue={setSearch} onSearchChange={setSetSearch} selectedValues={selectedSets} onToggle={(value) => toggleMultiSelect(value, selectedSets, setSelectedSets)} options={allSets.map((item) => ({ value: item.setName, label: item.setName }))} className="w-[220px]" />
        <AnalyticsSelectField
          placeholder="素材类型"
          value={selectedMaterialType}
          onChange={setSelectedMaterialType}
          options={[
            { value: 'video', label: '视频' },
            { value: 'playable', label: '试玩' },
            { value: 'image', label: '图片' },
          ]}
          className="w-[130px]"
        />
        <AnalyticsMultiSearchField placeholder="素材名称 / ID" searchValue={materialSearch} onSearchChange={setMaterialSearch} selectedValues={selectedMaterials} onToggle={(value) => toggleMultiSelect(value, selectedMaterials, setSelectedMaterials)} options={Array.from(new Set(allSets.flatMap((item) => item.materials.map((material) => material.name)))).map((materialName) => ({ value: materialName, label: materialName }))} className="w-[220px]" />
      </AnalyticsFilterBar>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-3 py-2">
          <div className="text-xs font-bold text-slate-400">
            共 <span className="font-black text-slate-700">{filteredRows.length}</span> 条回收数据
          </div>
          <div className="flex items-center gap-2">
            <select value={pageSize} onChange={(event) => setPageSize(Number(event.target.value))} className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs font-bold text-slate-600 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100">
              {[20, 50, 100, 200].map((size) => <option key={size} value={size}>{size} 行/页</option>)}
            </select>
            <div className="relative">
              <button type="button" data-column-config-trigger="true" onClick={() => setShowConfig((value) => !value)} className="flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-black text-slate-600 hover:border-indigo-200 hover:bg-slate-50">
                <Settings className="h-3.5 w-3.5" />
                字段配置
              </button>
              <ColumnConfigDropdown columns={columns} onClose={() => setShowConfig(false)} onDrag={moveColumn} onToggle={toggleColumnVisible} open={showConfig} />
            </div>
          </div>
        </div>

        <div className="max-h-[calc(100vh-245px)] overflow-auto">
          <table className="w-full min-w-[2800px] table-fixed border-collapse text-left">
            <thead className="sticky top-0 z-20 bg-slate-100 text-[11px] font-black text-slate-600">
              <tr>
                {visibleColumns.map((column) => (
                  <th key={column.id} className="border-b border-r border-slate-200 px-3 py-2 align-middle last:border-r-0">
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
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {pagedRows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50">
                  {visibleColumns.map((column) => (
                    <td key={column.id} className="truncate border-r border-slate-100 px-3 py-2 last:border-r-0">
                      {renderCell(column.id, row)}
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

      {selectedMaterialForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h3 className="max-w-2xl truncate text-sm font-black text-slate-800">{selectedMaterialForModal.setName}</h3>
                <p className="mt-1 text-xs font-bold text-slate-400">Campaign: {selectedMaterialForModal.campaign} · 渠道: {selectedMaterialForModal.channel}</p>
              </div>
              <button onClick={() => setSelectedMaterialForModal(null)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-[62vh] overflow-auto p-5">
              <table className="w-full table-fixed border-collapse text-left text-xs">
                <thead className="bg-slate-100 text-slate-600">
                  <tr>
                    <th className="border border-slate-200 px-3 py-3 font-black">素材名称</th>
                    <th className="w-32 border border-slate-200 px-3 py-3 font-black">素材ID</th>
                    <th className="w-28 border border-slate-200 px-3 py-3 text-right font-black">花费</th>
                    <th className="w-28 border border-slate-200 px-3 py-3 text-right font-black">展示</th>
                    <th className="w-24 border border-slate-200 px-3 py-3 text-right font-black">CTR</th>
                  </tr>
                </thead>
                <tbody>
                  {[...selectedMaterialForModal.materials].sort((a, b) => b.spend - a.spend).map((material) => (
                    <tr key={material.id} className="hover:bg-slate-50">
                      <td className="border border-slate-100 px-3 py-3 font-black text-slate-800">{material.name}</td>
                      <td className="border border-slate-100 px-3 py-3 font-mono text-slate-500">{material.id}</td>
                      <td className="border border-slate-100 px-3 py-3 text-right font-mono">${material.spend.toLocaleString()}</td>
                      <td className="border border-slate-100 px-3 py-3 text-right font-mono">{material.impressions.toLocaleString()}</td>
                      <td className="border border-slate-100 px-3 py-3 text-right font-mono">{(material.impressions > 0 ? (material.clicks / material.impressions) * 100 : 0).toFixed(2)}%</td>
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

export default RecoveryDataPage;
