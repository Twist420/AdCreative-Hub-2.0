import React, { useEffect, useMemo, useState } from 'react';
import { ArrowUpDown, Check, ChevronLeft, ChevronRight, GripVertical, Play, Settings, X } from 'lucide-react';
import { AnalyticsDateRangeField, AnalyticsFilterBar, AnalyticsMultiSearchField, AnalyticsSelectField, getRecentUtcRange } from './AnalyticsFilters';

type SortDirection = 'asc' | 'desc';
type MaterialType = 'video' | 'playable' | 'image';
type Language = 'EN' | 'JA' | 'KO' | 'DE';

interface SetItem {
  id: string;
  channel: string;
  platform: 'Android' | 'iOS';
  language: Language;
  campaign: string;
  setName: string;
  launchTime: string;
  direction: '大字报' | '原始玩法' | '3D玩法' | '其他玩法';
  impressions: number;
  clicks: number;
  installs: number;
  spend: number;
  d7PaidUsers: number;
  d7TotalRev: number;
  d7IapRev: number;
  d7Ret: number;
  materials: {
    id: string;
    name: string;
    contentId: string;
    previewUrl: string;
    spend: number;
    impressions: number;
    clicks: number;
    type: MaterialType;
  }[];
}

interface ColumnConfig {
  id: string;
  name: string;
  visible: boolean;
}

const channels = ['Applovin', 'Google', 'Facebook', 'Adjoe', 'Moloco', 'Unity'];
const platforms: SetItem['platform'][] = ['Android', 'iOS'];
const languages: Language[] = ['EN', 'JA', 'KO', 'DE'];
const materialTypes: MaterialType[] = ['video', 'playable', 'image'];
const directions: SetItem['direction'][] = ['大字报', '原始玩法', '3D玩法', '其他玩法'];
const materialNames = ['仙子举牌剧情', '克朗复刻买点', '奖励endingcard', '大字报无玩法', '精灵王子变蛇', '剧情开场冲突'];

const buildMockSets = (): SetItem[] =>
  Array.from({ length: 148 }, (_, index) => {
    const channel = channels[index % channels.length];
    const platform = index % 3 === 0 ? 'iOS' : 'Android';
    const language = languages[index % languages.length];
    const cp = 3097 + (index * 41) % 900;
    const date = new Date(Date.UTC(2026, 4, 8 + (index % 38))).toISOString().slice(0, 10);
    const impressions = 88000 + ((index * 58921) % 980000);
    const clicks = Math.floor(impressions * (0.014 + (index % 15) * 0.0024));
    const installs = Math.max(32, Math.floor(clicks * (0.18 + (index % 7) * 0.015)));
    const spend = 980 + ((index * 1709) % 33000);
    const paidUsers = Math.max(3, Math.floor(installs * (0.025 + (index % 8) * 0.006)));
    const totalRev = Math.round(spend * (0.06 + (index % 9) * 0.011));
    const iapRev = Math.round(totalRev * (0.68 + (index % 5) * 0.04));

    return {
      id: `set_${String(index + 1).padStart(3, '0')}`,
      channel,
      platform,
      language,
      campaign: `Panthia_${platform}_${channel}_${String(40 + (index % 15)).padStart(3, '0')}`,
      setName: `cp${cp}-${String((index % 9) + 1).padStart(2, '0')}-${index % 2 ? 'en' : 'jp'}-m-${materialNames[index % materialNames.length]}-${index % 3 ? 'cpp reward' : 'cpp relax'}`,
      launchTime: date,
      direction: directions[index % directions.length],
      impressions,
      clicks,
      installs,
      spend,
      d7PaidUsers: paidUsers,
      d7TotalRev: totalRev,
      d7IapRev: iapRev,
      d7Ret: 18 + (index % 24) * 0.9,
      materials: Array.from({ length: 1 + (index % 4) }, (_, materialIndex) => ({
        id: `cp${cp}-${String(materialIndex + 1).padStart(2, '0')}`,
        name: `${materialNames[(index + materialIndex) % materialNames.length]}_${platform}_${channel}`,
        contentId: `content_${cp}_${materialIndex}`,
        previewUrl: materialIndex % 3 === 0
          ? 'https://assets.mixkit.co/videos/preview/mixkit-playing-mobile-game-in-vertical-mode-40118-large.mp4'
          : 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=400&q=80',
        spend: Math.round(spend * (0.32 + materialIndex * 0.11)),
        impressions: Math.round(impressions * (0.28 + materialIndex * 0.08)),
        clicks: Math.round(clicks * (0.28 + materialIndex * 0.08)),
        type: materialTypes[(index + materialIndex) % materialTypes.length],
      })),
    };
  });

const INITIAL_COLUMNS: ColumnConfig[] = [
  { id: 'channel', name: '渠道', visible: true },
  { id: 'platform', name: 'Platform', visible: true },
  { id: 'campaign', name: 'Campaign', visible: true },
  { id: 'setName', name: 'Set名称', visible: true },
  { id: 'launchTime', name: '投放时间', visible: true },
  { id: 'direction', name: '大方向', visible: true },
  { id: 'preview', name: '出量素材预览', visible: true },
  { id: 'impressions', name: '展示', visible: true },
  { id: 'clicks', name: '点击', visible: true },
  { id: 'ctr', name: 'CTR', visible: true },
  { id: 'installs', name: '新增用户数', visible: true },
  { id: 'cvr', name: 'CVR', visible: true },
  { id: 'spend', name: '花费', visible: true },
  { id: 'cpi', name: 'CPI', visible: true },
  { id: 'cpm', name: 'CPM', visible: true },
  { id: 'ir', name: 'IR', visible: true },
  { id: 'd7PaidUsers', name: 'D7付费用户数', visible: true },
  { id: 'd7PayRate', name: 'D7付费率', visible: true },
  { id: 'd7Cpa', name: 'D7 CPA', visible: true },
  { id: 'd7TotalRev', name: 'D7 total ROAS', visible: true },
  { id: 'd0Roi', name: 'D0 total ROAS', visible: true },
  { id: 'd7Roi', name: 'D7 total ROAS', visible: true },
  { id: 'd7IapRev', name: 'D7 iap_rev', visible: true },
  { id: 'd7IapRoi', name: 'D7 iap_roi', visible: true },
  { id: 'd7Ret', name: 'D7 ret 留存', visible: true },
  { id: 'd7Arppu', name: 'D7 ARPPU', visible: true },
];

const metricHelp: Record<string, string> = {
  channel: '渠道：Set 所属投放渠道。',
  platform: 'Platform：投放设备平台。',
  campaign: 'Campaign：Set 所属 Campaign。',
  setName: 'Set名称：投放组名称，点击可查看关联素材。',
  launchTime: '投放时间：Set 首次投放日期。',
  direction: '大方向：创意内容方向分类。',
  preview: '出量素材预览：Set 内花费最高素材。',
  impressions: '展示：广告被曝光的次数。',
  clicks: '点击：用户点击广告的次数。',
  ctr: 'CTR = 点击 / 展示。',
  installs: '新增用户数：广告带来的安装用户。',
  cvr: 'CVR = 新增用户数 / 点击。',
  spend: '花费：统计周期内 Set 消耗金额。',
  cpi: 'CPI = 花费 / 新增用户数。',
  cpm: 'CPM = 花费 / 展示 * 1000。',
  ir: 'IR = 新增用户数 / 点击。',
  d7PaidUsers: 'D7付费用户数：安装后7日内完成付费的用户。',
  d7PayRate: 'D7付费率 = D7付费用户数 / 新增用户数。',
  d7Cpa: 'D7 CPA = 花费 / D7付费用户数。',
  d7TotalRev: 'D7 total ROAS 使用的7日总收入。',
  d0Roi: 'D0 total ROAS = D0模拟收入 / 花费。',
  d7Roi: 'D7 total ROAS = D7总收入 / 花费。',
  d7IapRev: 'D7 iap_rev：7日内购收入。',
  d7IapRoi: 'D7 iap_roi = D7内购收入 / 花费。',
  d7Ret: 'D7 ret 留存：第7日仍活跃用户占比。',
  d7Arppu: 'D7 ARPPU = D7总收入 / D7付费用户数。',
};

const getMetrics = (row: SetItem) => {
  const ctr = row.impressions > 0 ? (row.clicks / row.impressions) * 100 : 0;
  const cvr = row.clicks > 0 ? (row.installs / row.clicks) * 100 : 0;
  const cpi = row.installs > 0 ? row.spend / row.installs : 0;
  const cpm = row.impressions > 0 ? (row.spend / row.impressions) * 1000 : 0;
  const ir = row.clicks > 0 ? (row.installs / row.clicks) * 100 : 0;
  const d7PayRate = row.installs > 0 ? (row.d7PaidUsers / row.installs) * 100 : 0;
  const d7Cpa = row.d7PaidUsers > 0 ? row.spend / row.d7PaidUsers : 0;
  const d0Roi = row.spend > 0 ? (row.d7TotalRev * 0.15 / row.spend) * 100 : 0;
  const d7Roi = row.spend > 0 ? (row.d7TotalRev / row.spend) * 100 : 0;
  const d7IapRoi = row.spend > 0 ? (row.d7IapRev / row.spend) * 100 : 0;
  const d7Arppu = row.d7PaidUsers > 0 ? row.d7TotalRev / row.d7PaidUsers : 0;
  return { ctr, cvr, cpi, cpm, ir, d7PayRate, d7Cpa, d0Roi, d7Roi, d7IapRoi, d7Arppu };
};

const getSortValue = (row: SetItem, key: string) => {
  const metrics = getMetrics(row);
  if (key in metrics) return metrics[key as keyof typeof metrics];
  if (key === 'preview') return row.materials[0]?.spend ?? 0;
  return row[key as keyof SetItem] as string | number;
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

  if (!open) return null;

  return (
    <div className="absolute right-0 top-[calc(100%+8px)] z-40 w-72 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-200/80">
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
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => {
              if (draggingIndex !== null && draggingIndex !== index) onDrag(draggingIndex, index);
              setDraggingIndex(null);
            }}
            className="flex h-9 cursor-grab items-center gap-2 rounded-lg px-2 text-xs font-bold text-slate-600 hover:bg-slate-50 active:cursor-grabbing"
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
        return row.installs.toLocaleString();
      case 'cvr':
        return `${metrics.cvr.toFixed(2)}%`;
      case 'spend':
        return `$${row.spend.toLocaleString()}`;
      case 'cpi':
        return `$${metrics.cpi.toFixed(2)}`;
      case 'cpm':
        return `$${metrics.cpm.toFixed(2)}`;
      case 'ir':
        return `${metrics.ir.toFixed(2)}%`;
      case 'd7PaidUsers':
        return row.d7PaidUsers.toLocaleString();
      case 'd7PayRate':
        return `${metrics.d7PayRate.toFixed(2)}%`;
      case 'd7Cpa':
        return `$${metrics.d7Cpa.toFixed(2)}`;
      case 'd7TotalRev':
        return `$${row.d7TotalRev.toLocaleString()}`;
      case 'd0Roi':
        return `${metrics.d0Roi.toFixed(2)}%`;
      case 'd7Roi':
        return `${metrics.d7Roi.toFixed(2)}%`;
      case 'd7IapRev':
        return `$${row.d7IapRev.toLocaleString()}`;
      case 'd7IapRoi':
        return `${metrics.d7IapRoi.toFixed(2)}%`;
      case 'd7Ret':
        return `${row.d7Ret.toFixed(1)}%`;
      case 'd7Arppu':
        return `$${metrics.d7Arppu.toFixed(1)}`;
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
              <button type="button" onClick={() => setShowConfig((value) => !value)} className="flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-black text-slate-600 hover:border-indigo-200 hover:bg-slate-50">
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
