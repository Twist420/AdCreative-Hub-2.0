import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpDown, Check, ChevronLeft, ChevronRight, GripVertical, Play, Settings, X } from 'lucide-react';
import { AnalyticsDateRangeField, AnalyticsFilterBar, AnalyticsSearchField, AnalyticsSelectField, getRecentUtcRange } from './AnalyticsFilters';
import { MONTHLY_ANALYTICS_ROWS } from '../services/monthlyAnalyticsData';

type MaterialType = 'video' | 'playable' | 'image';
type SortDirection = 'asc' | 'desc';

interface MaterialSpend {
  id: string;
  name: string;
  contentId: string;
  thumbnail: string;
  type: MaterialType;
  channel: string;
  platform: 'Android' | 'iOS';
  launchTime: string;
  firstImpressionTime: string;
  spend: number;
  impressions: number;
  clicks: number;
  language: 'EN' | 'JA' | 'KO' | 'DE';
  size: '1080x1920' | '1920x1080' | '1080x1080';
  owner: string;
  designer: string;
  isNew: boolean;
  associatedSets: {
    setName: string;
    campaign: string;
    firstLaunch: string;
    campaignCount: number;
    status: 'Live' | 'Paused';
    spend: number;
  }[];
}

interface ColumnConfig {
  id: string;
  name: string;
  visible: boolean;
}

const materialTemplates = [
  '仙子举牌剧情',
  '克朗复刻买点',
  '奖励endingcard',
  '大字报无玩法',
  '精灵王子变蛇',
  '公告文案复盘',
  '三消树玩法植入',
  '剧情开场冲突',
  '资源收集试玩',
  '失败惩罚口播',
];

const thumbnails = [
  'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80',
];

const channels = ['Applovin', 'Google', 'Facebook', 'Adjoe', 'Moloco', 'Unity'];
const platforms: MaterialSpend['platform'][] = ['Android', 'iOS'];
const languages: MaterialSpend['language'][] = ['EN', 'JA', 'KO', 'DE'];
const sizes: MaterialSpend['size'][] = ['1080x1920', '1920x1080', '1080x1080'];
const owners = ['唐欣怡', '吉意煊', '马嘉良', '王杰华'];
const designers = ['王杰华', '唐欣怡', '李思晨', '周明'];
const types: MaterialType[] = ['video', 'playable', 'image'];

const buildMockSpends = (): MaterialSpend[] => {
  const setsByMaterial = MONTHLY_ANALYTICS_ROWS.reduce<Record<string, typeof MONTHLY_ANALYTICS_ROWS>>((groups, row) => {
    if (!groups[row.materialId]) groups[row.materialId] = [];
    groups[row.materialId].push(row);
    return groups;
  }, {});

  return MONTHLY_ANALYTICS_ROWS.map((row, index) => {
    const relatedSets = setsByMaterial[row.materialId] || [row];
    return {
      id: row.materialId,
      name: row.materialName,
      contentId: row.contentId,
      thumbnail: row.thumbnail,
      type: row.materialType,
      channel: row.channel,
      platform: row.platform,
      launchTime: row.launchTime,
      firstImpressionTime: `${row.launchTime} 00:00 UTC`,
      spend: row.spend,
      impressions: row.impressions,
      clicks: row.clicks,
      language: row.language,
      size: row.size,
      owner: row.owner,
      designer: row.designer,
      isNew: row.launchTime >= '2026-05-18',
      associatedSets: relatedSets.slice(0, 12).map((setRow, setIndex) => ({
        setName: setRow.creativeSet,
        campaign: setRow.campaignName,
        firstLaunch: setRow.launchTime,
        campaignCount: 1 + (setIndex % 3),
        status: setIndex % 4 === 0 ? 'Paused' : 'Live',
        spend: Math.round(setRow.spend),
      })),
    };
  });
};

const INITIAL_COLUMNS: ColumnConfig[] = [
  { id: 'id', name: '素材ID', visible: true },
  { id: 'name', name: '素材名称', visible: true },
  { id: 'contentId', name: '素材内容ID', visible: true },
  { id: 'thumbnail', name: '素材预览', visible: true },
  { id: 'sets', name: 'Set数量', visible: true },
  { id: 'firstImpressionTime', name: '投放时间', visible: true },
  { id: 'spend', name: '花费', visible: true },
  { id: 'spendRatio', name: '花费占比', visible: true },
  { id: 'impressions', name: '展示量', visible: true },
  { id: 'clicks', name: '点击', visible: true },
  { id: 'ctr', name: 'CTR', visible: true },
  { id: 'language', name: '语言', visible: true },
  { id: 'size', name: '尺寸', visible: false },
  { id: 'owner', name: '需求负责人', visible: false },
  { id: 'designer', name: '制作人员', visible: false },
];

const metricHelp: Record<string, string> = {
  id: '素材ID：按需求中心风格生成的素材编号。',
  name: '素材名称：素材投放命名，用于识别内容、语言、类型与尺寸。',
  contentId: '素材内容ID：同一内容资产的聚合标识。',
  sets: 'Set数量：使用该素材的 Ad Set 数量，点击查看具体 Set。',
  firstImpressionTime: '投放时间：素材首次投放日期。',
  spend: '花费：当前筛选周期内素材消耗金额。',
  spendRatio: '花费占比 = 素材花费 / 当前结果总花费。',
  impressions: '展示量：素材在投放周期内产生的曝光次数。',
  clicks: '点击：用户点击广告素材的次数。',
  ctr: 'CTR = 点击 / 展示。',
  language: '语言：素材投放语言。隐藏后按内容ID聚合。',
  size: '尺寸：素材尺寸。隐藏后按素材ID聚合。',
  owner: '需求负责人：素材需求侧负责人。',
  designer: '制作人员：素材制作执行人。',
};

const getTypeLabel = (type: MaterialType) => ({ video: '视频', playable: '试玩', image: '图片' }[type]);

const getSortValue = (row: MaterialSpend, key: string, totalSpend: number) => {
  if (key === 'sets') return row.associatedSets.length;
  if (key === 'spendRatio') return totalSpend > 0 ? row.spend / totalSpend : 0;
  if (key === 'ctr') return row.impressions > 0 ? row.clicks / row.impressions : 0;
  return row[key as keyof MaterialSpend] as string | number;
};

const ColumnConfigDropdown = ({
  columns,
  onClose,
  onDrag,
  onToggle,
  open,
}: {
  columns: ColumnConfig[];
  onClose: () => void;
  onDrag: (from: number, to: number) => void;
  onToggle: (id: string) => void;
  open: boolean;
}) => {
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
          <table className="w-full min-w-[1500px] table-fixed border-collapse text-left">
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
