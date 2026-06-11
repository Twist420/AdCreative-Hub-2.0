import React, { useState, useMemo } from 'react';
import { 
  Filter, Settings, Search, Check, Play, Eye, 
  ChevronDown, ChevronUp, RefreshCw, Layers, ArrowUpDown, X 
} from 'lucide-react';
import DateRangePicker from './DateRangePicker';

// Define structures matching types.ts
interface SetItem {
  id: string;
  channel: string;
  platform: 'Android' | 'iOS';
  campaign: string;
  setName: string;
  launchTime: string; // "2026-05-18" etc
  direction: '大字报' | '原始玩法' | '3D玩法' | '其他玩法';
  impressions: number;
  clicks: number;
  installs: number;
  spend: number;
  d7PaidUsers: number;
  d7TotalRev: number;
  d7IapRev: number;
  d7Ret: number; // percentage
  // Materals within set
  materials: {
    id: string;
    name: string;
    contentId: string;
    previewUrl: string;
    spend: number;
    impressions: number;
    clicks: number;
    type: 'video' | 'playable' | 'image';
  }[];
}

const INITIAL_SETS: SetItem[] = [
  {
    id: 'set_01',
    channel: 'Applovin',
    platform: 'Android',
    campaign: 'Panthia_Android_US_Unon',
    setName: 'cp4124-03-en-m-txy-wjh-原始玩法_20260515',
    launchTime: '2026-05-15',
    direction: '原始玩法',
    impressions: 450000,
    clicks: 12500,
    installs: 3200,
    spend: 7800,
    d7PaidUsers: 140,
    d7TotalRev: 2100,
    d7IapRev: 1850,
    d7Ret: 38.5,
    materials: [
      { id: 'mat_101', name: 'US_Gameplay_Intro_01', contentId: 'v_en_01', previewUrl: 'https://assets.mixkit.co/videos/preview/mixkit-playing-mobile-game-in-vertical-mode-40118-large.mp4', spend: 4500, impressions: 250000, clicks: 7500, type: 'video' },
      { id: 'mat_102', name: 'US_Gameplay_3D_Boss', contentId: 'v_en_02', previewUrl: 'https://assets.mixkit.co/videos/preview/mixkit-holding-a-smartphone-playing-a-game-40119-large.mp4', spend: 3300, impressions: 200000, clicks: 5000, type: 'video' }
    ]
  },
  {
    id: 'set_02',
    channel: 'Google',
    platform: 'Android',
    campaign: 'Panthia_UAC_Android_CA_Tier1',
    setName: 'cp4120-05-en-m-jt-吸量大字报_20260520',
    launchTime: '2026-05-20',
    direction: '大字报',
    impressions: 980000,
    clicks: 34000,
    installs: 8500,
    spend: 15400,
    d7PaidUsers: 480,
    d7TotalRev: 6200,
    d7IapRev: 5500,
    d7Ret: 44.2,
    materials: [
      { id: 'mat_103', name: 'CA_Bigtext_Splash_V1', contentId: 'v_en_03', previewUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-hands-holding-phone-playing-a-game-40120-large.mp4', spend: 8900, impressions: 550000, clicks: 20000, type: 'video' },
      { id: 'mat_104', name: 'CA_Playable_Minigame_Html', contentId: 'p_en_01', previewUrl: 'https://interactive-examples.mdn.mozilla.net/pages/js/embedded-playable-demo.html', spend: 6500, impressions: 430000, clicks: 14000, type: 'playable' }
    ]
  },
  {
    id: 'set_03',
    channel: 'Facebook',
    platform: 'iOS',
    campaign: 'Panthia_iOS_US_Value',
    setName: 'cp4122-01-en-m-giy-3D剧情_20260524',
    launchTime: '2026-05-24',
    direction: '3D玩法',
    impressions: 320000,
    clicks: 9800,
    installs: 2100,
    spend: 5200,
    d7PaidUsers: 95,
    d7TotalRev: 1480,
    d7IapRev: 1200,
    d7Ret: 31.9,
    materials: [
      { id: 'mat_105', name: 'US_Plot_3D_Cinema', contentId: 'v_en_04', previewUrl: 'https://assets.mixkit.co/videos/preview/mixkit-vertical-video-of-a-smartphone-game-screen-40121-large.mp4', spend: 5200, impressions: 320000, clicks: 9800, type: 'video' }
    ]
  },
  {
    id: 'set_04',
    channel: 'Adjoe',
    platform: 'Android',
    campaign: 'Panthia_Adjoe_DE_Rewarded',
    setName: 'cp4126-01-de-m-mlg-其他玩法_20260522',
    launchTime: '2026-05-22',
    direction: '其他玩法',
    impressions: 210000,
    clicks: 8600,
    installs: 1980,
    spend: 3800,
    d7PaidUsers: 60,
    d7TotalRev: 1100,
    d7IapRev: 1000,
    d7Ret: 29.5,
    materials: [
      { id: 'mat_106', name: 'DE_Rewards_Showcase_Png', contentId: 'i_de_01', previewUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=400&q=80', spend: 3800, impressions: 210000, clicks: 8600, type: 'image' }
    ]
  },
  {
    id: 'set_05',
    channel: 'Moloco',
    platform: 'iOS',
    campaign: 'Panthia_Moloco_JP_Tier1',
    setName: 'cp4128-02-jp-m-txy-原始玩法_20260528',
    launchTime: '2026-05-28',
    direction: '原始玩法',
    impressions: 150000,
    clicks: 4500,
    installs: 980,
    spend: 2100,
    d7PaidUsers: 25,
    d7TotalRev: 310,
    d7IapRev: 250,
    d7Ret: 25.0,
    materials: [
      { id: 'mat_107', name: 'JP_Gameplay_Raw_02', contentId: 'v_jp_01', previewUrl: 'https://assets.mixkit.co/videos/preview/mixkit-playing-mobile-game-20042-large.mp4', spend: 2100, impressions: 150000, clicks: 4500, type: 'video' }
    ]
  },
  {
    id: 'set_06',
    channel: 'Unity',
    platform: 'Android',
    campaign: 'Panthia_Unity_KR_Core',
    setName: 'cp4130-01-kr-m-jyx-3D玩法_20260510',
    launchTime: '2026-05-10',
    direction: '3D玩法',
    impressions: 410000,
    clicks: 11000,
    installs: 2450,
    spend: 6400,
    d7PaidUsers: 80,
    d7TotalRev: 950,
    d7IapRev: 810,
    d7Ret: 30.1,
    materials: [
      { id: 'mat_108', name: 'KR_Plot_3D_Boss_Fight', contentId: 'v_kr_01', previewUrl: 'https://assets.mixkit.co/videos/preview/mixkit-close-up-of-hands-playing-smartphone-game-40122-large.mp4', spend: 0, impressions: 0, clicks: 0, type: 'video' }
    ]
  }
];

// Default Benchmarks mapping per channel (configurable on Page 4 / Benchmark)
const DEFAULT_BENCHMARKS: Record<string, {
  cpi: number;
  cpa7: number;
  roi7: number;
  payRate: number;
  paidUsers: number;
  newUsersPaying: number;
  newUsersRecovery: number;
  arppu7: number;
}> = {
  All: { cpi: 3.0, cpa7: 15.0, roi7: 12.0, payRate: 8.0, paidUsers: 100, newUsersPaying: 2000, newUsersRecovery: 1000, arppu7: 12.0 },
  Applovin: { cpi: 2.8, cpa7: 14.5, roi7: 13.0, payRate: 8.5, paidUsers: 120, newUsersPaying: 2500, newUsersRecovery: 1200, arppu7: 15.0 },
  Google: { cpi: 3.2, cpa7: 18.0, roi7: 10.5, payRate: 7.5, paidUsers: 150, newUsersPaying: 3000, newUsersRecovery: 1500, arppu7: 11.5 },
  Facebook: { cpi: 2.5, cpa7: 15.0, roi7: 12.5, payRate: 8.0, paidUsers: 100, newUsersPaying: 2200, newUsersRecovery: 1100, arppu7: 12.0 },
  Adjoe: { cpi: 2.0, cpa7: 12.0, roi7: 15.0, payRate: 9.0, paidUsers: 80, newUsersPaying: 1800, newUsersRecovery: 900, arppu7: 16.0 },
  Moloco: { cpi: 2.4, cpa7: 13.0, roi7: 14.0, payRate: 8.8, paidUsers: 90, newUsersPaying: 2100, newUsersRecovery: 950, arppu7: 14.2 },
  Unity: { cpi: 2.7, cpa7: 16.0, roi7: 11.0, payRate: 8.2, paidUsers: 110, newUsersPaying: 2400, newUsersRecovery: 1150, arppu7: 13.0 }
};

export const RecoveryDataPage: React.FC = () => {
  // Filter States
  const [launchStart, setLaunchStart] = useState('2026-05-10');
  const [launchEnd, setLaunchEnd] = useState('2026-06-03');
  const [filterOutsideLaunch, setFilterOutsideLaunch] = useState(false);

  const [spendStart, setSpendStart] = useState('2026-05-10');
  const [spendEnd, setSpendEnd] = useState('2026-06-03');

  const [selectedPlatform, setSelectedPlatform] = useState<string>('All');
  const [selectedChannel, setSelectedChannel] = useState<string>('All');

  const [setSearch, setSetSearch] = useState('');
  const [campaignSearch, setCampaignSearch] = useState('');
  const [materialSearch, setMaterialSearch] = useState('');

  // Selected multi elements
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [selectedSets, setSelectedSets] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);

  // Columns & Order State
  const initialColumns = [
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
    { id: 'd7TotalRev', name: 'D7 total_rev', visible: true },
    { id: 'd0Roi', name: 'D0 roi', visible: true },
    { id: 'd7Roi', name: 'D7 roi', visible: true },
    { id: 'd7IapRev', name: 'D7 iap_rev', visible: true },
    { id: 'd7IapRoi', name: 'D7 iap_roi', visible: true },
    { id: 'd7Ret', name: 'D7 ret(留存)', visible: true },
    { id: 'd7Arppu', name: 'D7 ARPPU', visible: true },
  ];

  const [columns, setColumns] = useState(initialColumns);
  const [showConfig, setShowConfig] = useState(false);

  // Material Modal Popup details
  const [selectedMaterialForModal, setSelectedMaterialForModal] = useState<SetItem | null>(null);

  // Spend Shortcuts
  const applySpendShortcut = (shortcut: 'this_month' | 'last_7' | 'last_30' | 'last_90' | 'last_month') => {
    const today = new Date();
    const endStr = today.toISOString().slice(0, 10);
    
    if (shortcut === 'this_month') {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      setSpendStart(start.toISOString().slice(0, 10));
      setSpendEnd(endStr);
    } else if (shortcut === 'last_7') {
      const start = new Date();
      start.setDate(today.getDate() - 7);
      setSpendStart(start.toISOString().slice(0, 10));
      setSpendEnd(endStr);
    } else if (shortcut === 'last_30') {
      const start = new Date();
      start.setDate(today.getDate() - 30);
      setSpendStart(start.toISOString().slice(0, 10));
      setSpendEnd(endStr);
    } else if (shortcut === 'last_90') {
      const start = new Date();
      start.setDate(today.getDate() - 90);
      setSpendStart(start.toISOString().slice(0, 10));
      setSpendEnd(endStr);
    } else if (shortcut === 'last_month') {
      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const end = new Date(today.getFullYear(), today.getMonth(), 0);
      setSpendStart(start.toISOString().slice(0, 10));
      setSpendEnd(end.toISOString().slice(0, 10));
    }
  };

  // Reordering Columns Helper
  const moveColumn = (index: number, direction: 'up' | 'down') => {
    const nextIndex = direction === 'up' ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= columns.length) return;
    const newCols = [...columns];
    const [moved] = newCols.splice(index, 1);
    newCols.splice(nextIndex, 0, moved);
    setColumns(newCols);
  };

  const toggleColumnVisible = (id: string) => {
    setColumns(
      columns.map(col => col.id === id ? { ...col, visible: !col.visible } : col)
    );
  };

  // Multi Selection toggles
  const toggleMultiSelect = (item: string, list: string[], setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (list.includes(item)) {
      setter(list.filter(i => i !== item));
    } else {
      setter([...list, item]);
    }
  };

  // Apply Filters to mock rows
  const filteredRows = useMemo(() => {
    return INITIAL_SETS.filter(item => {
      // 1. Platform Filter
      if (selectedPlatform !== 'All' && item.platform !== selectedPlatform) return false;

      // 2. Channel Filter
      if (selectedChannel !== 'All' && item.channel.toLowerCase() !== selectedChannel.toLowerCase()) return false;

      // 3. Launch Time filtering if active
      if (filterOutsideLaunch) {
        if (item.launchTime < launchStart || item.launchTime > launchEnd) return false;
      }

      // 4. Set Name fuzzy check and multi check
      if (setSearch && !item.setName.toLowerCase().includes(setSearch.toLowerCase())) return false;
      if (selectedSets.length > 0 && !selectedSets.includes(item.setName)) return false;

      // 5. Campaign fuzzy check and multi check
      if (campaignSearch && !item.campaign.toLowerCase().includes(campaignSearch.toLowerCase())) return false;
      if (selectedCampaigns.length > 0 && !selectedCampaigns.includes(item.campaign)) return false;

      // 6. Material Name/id search
      if (materialSearch || selectedMaterials.length > 0) {
        const matchesMaterial = item.materials.some(mat => {
          const matchFuzzy = mat.name.toLowerCase().includes(materialSearch.toLowerCase()) || mat.id.toLowerCase().includes(materialSearch.toLowerCase());
          const matchMulti = selectedMaterials.length === 0 || selectedMaterials.includes(mat.name);
          return matchFuzzy && matchMulti;
        });
        if (!matchesMaterial) return false;
      }

      return true;
    });
  }, [
    selectedPlatform, selectedChannel, filterOutsideLaunch, launchStart, launchEnd,
    setSearch, selectedSets, campaignSearch, selectedCampaigns, materialSearch, selectedMaterials
  ]);

  // Aggregate Metrics for Sum Row
  const totalSummary = useMemo(() => {
    let imps = 0;
    let clicks = 0;
    let installs = 0;
    let spend = 0;
    filteredRows.forEach(r => {
      imps += r.impressions;
      clicks += r.clicks;
      installs += r.installs;
      spend += r.spend;
    });
    return { imps, clicks, installs, spend };
  }, [filteredRows]);

  // Check if a launch Date falls inside checked range to highlight font
  const shouldHighlightLaunch = (launchTime: string) => {
    if (!filterOutsideLaunch) {
      // Highlight in-range materials info
      return launchTime >= launchStart && launchTime <= launchEnd;
    }
    return false;
  };

  // Cell color helper based on active benchmark values
  const getCellClassName = (field: string, val: number, channel: string) => {
    // Get benchmark standard based on channel or fallback to ALL
    const bench = DEFAULT_BENCHMARKS[channel] || DEFAULT_BENCHMARKS['All'];
    if (!bench) return '';

    switch (field) {
      case 'cpi':
        return val <= bench.cpi
          ? 'bg-emerald-50 text-emerald-700 border-emerald-100 font-semibold'
          : 'bg-rose-50 text-rose-700 border-rose-100 font-semibold';
      case 'cpa7':
        return val <= bench.cpa7
          ? 'bg-emerald-50 text-emerald-700 border-emerald-100 font-semibold'
          : 'bg-rose-50 text-rose-700 border-rose-100 font-semibold';
      case 'roi7':
        return val >= bench.roi7
          ? 'bg-emerald-50 text-emerald-700 border-emerald-100 font-semibold'
          : 'bg-rose-50 text-rose-700 border-rose-100 font-semibold';
      case 'payRate':
        return val >= bench.payRate
          ? 'bg-emerald-50 text-emerald-700 border-emerald-100 font-semibold'
          : 'bg-rose-50 text-rose-700 border-rose-100 font-semibold';
      case 'paidUsers':
        return val >= bench.paidUsers
          ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
          : ''; // No change
      case 'installs':
        // New installs metric highlighting
        // When Paid Users metric >= standard, if Installs >= standard newUsersPaying => green
        // else if Installs >= standard newUsersRecovery => yellow/orange
        if (val >= bench.newUsersPaying) {
          return 'bg-emerald-50 text-emerald-700 border-emerald-100';
        } else if (val >= bench.newUsersRecovery) {
          return 'bg-amber-50 text-amber-700 border-amber-100';
        }
        return '';
      case 'arppu':
        return val >= bench.arppu7
          ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
          : '';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6 pb-20 relative">
      {/* 👑 Header Block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center">
            <span className="w-1.5 h-6 bg-primary rounded-full mr-3"></span>
            回收数据看板
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            聚合投放数据以及回收留存等多维统计深度追踪。
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Custom Columns Panel Toggle */}
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="flex items-center gap-2 px-3.5 py-2 bg-white text-slate-600 text-xs font-bold rounded-xl border border-slate-200 hover:shadow-sm transition-all"
          >
            <Settings className="w-4 h-4" />
            自定义表列
          </button>
        </div>
      </div>

      {/* 📊 Column Configuration Panel (Dropdown/Settings) */}
      {showConfig && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-lg space-y-4 animate-in slide-in-from-top duration-200">
          <div className="flex items-center justify-between border-b pb-2">
            <span className="text-xs font-bold text-slate-700">自定义列显示与位置顺序</span>
            <button onClick={() => setShowConfig(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {columns.map((col, idx) => (
              <div key={col.id} className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={col.visible}
                    onChange={() => toggleColumnVisible(col.id)}
                    className="rounded border-slate-300 text-primary focus:ring-primary w-3.5 h-3.5"
                  />
                  <span className="text-xs font-bold text-slate-600">{col.name}</span>
                </label>
                <div className="flex items-center gap-1">
                  <button onClick={() => moveColumn(idx, 'up')} disabled={idx === 0} className="p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-30">
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => moveColumn(idx, 'down')} disabled={idx === columns.length - 1} className="p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-30">
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🔍 Top Filtering Area (3 Column Grid) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-6 shadow-sm">
        
        {/* 1. Launch Time and filter toggle */}
        <div className="flex flex-col gap-2.5">
          <label className="text-xs font-bold text-slate-700">投放时间围度</label>
          <DateRangePicker
            start={launchStart}
            end={launchEnd}
            onChange={({ start, end }) => {
              setLaunchStart(start);
              setLaunchEnd(end);
            }}
            compact
          />
          <label className="flex items-center gap-2 cursor-pointer mt-1 select-none">
            <input
              type="checkbox"
              checked={filterOutsideLaunch}
              onChange={(e) => setFilterOutsideLaunch(e.target.checked)}
              className="rounded border-slate-300 text-primary w-3.5 h-3.5"
            />
            <span className="text-xs font-bold text-slate-500">过滤投放时间之外的数据</span>
          </label>
        </div>

        {/* 2. Spend Period (花费周期) */}
        <div className="flex flex-col gap-2.5 border-l-0 md:border-l md:px-4 border-slate-150">
          <label className="text-xs font-bold text-slate-700">花费周期</label>
          <DateRangePicker
            start={spendStart}
            end={spendEnd}
            onChange={({ start, end }) => {
              setSpendStart(start);
              setSpendEnd(end);
            }}
            align="right"
            compact
          />
          {/* Quick choices: 本月, 近7天, 近30天, 近90天, 上月 */}
          <div className="flex flex-wrap gap-1 mt-1">
            {[
              { id: 'this_month', label: '本月' },
              { id: 'last_7', label: '近7天' },
              { id: 'last_30', label: '近30天' },
              { id: 'last_90', label: '近90天' },
              { id: 'last_month', label: '上月' },
            ].map(shortcut => (
              <button
                key={shortcut.id}
                onClick={() => applySpendShortcut(shortcut.id as any)}
                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-bold rounded-md transition-colors"
              >
                {shortcut.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Platform and Channel dropdowns */}
        <div className="flex flex-col gap-2.5 border-l-0 md:border-l md:pl-6 border-slate-150">
          <label className="text-xs font-bold text-slate-700">Platform & 渠道列表</label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Platform</span>
              <select
                value={selectedPlatform}
                onChange={e => setSelectedPlatform(e.target.value)}
                className="w-full mt-1 bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold rounded-lg px-2.5 py-1.5 focus:outline-none"
              >
                <option value="All">All Platforms</option>
                <option value="Android">Android</option>
                <option value="iOS">iOS</option>
              </select>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">渠道</span>
              {/* Order must be exactly as described: All, Applovin, Google, Facebook, Adjoe, Moloco, Unity */}
              <select
                value={selectedChannel}
                onChange={e => setSelectedChannel(e.target.value)}
                className="w-full mt-1 bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold rounded-lg px-2.5 py-1.5 focus:outline-none"
              >
                <option value="All">All</option>
                <option value="Applovin">AppLovin</option>
                <option value="Google">Google</option>
                <option value="Facebook">Facebook</option>
                <option value="Adjoe">Adjoe</option>
                <option value="Moloco">Moloco</option>
                <option value="Unity">Unity</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 🔍 Set Multi-Select & Campaign & Material Search Panels */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Set Search */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-slate-400" /> Set 名称检索 (支持多选)
          </span>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="模糊检索组名称..."
              value={setSearch}
              onChange={(e) => setSetSearch(e.target.value)}
              className="bg-white border border-slate-200 pl-8 pr-2.5 py-2 rounded-xl text-xs font-medium focus:outline-none w-full"
            />
          </div>
          <div className="mt-1 max-h-16 overflow-y-auto bg-white border border-slate-100 rounded-lg p-1.5 space-y-1 no-scrollbar">
            {INITIAL_SETS.map(x => (
              <label key={x.id} className="flex items-center gap-2 cursor-pointer select-none px-1">
                <input
                  type="checkbox"
                  checked={selectedSets.includes(x.setName)}
                  onChange={() => toggleMultiSelect(x.setName, selectedSets, setSelectedSets)}
                  className="rounded border-slate-300 text-primary w-3 h-3"
                />
                <span className="text-[10px] font-medium text-slate-600 truncate">{x.setName}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Campaign Search */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
            <Search className="w-3.5 h-3.5 text-slate-400" /> Campaign 检索 (支持多选)
          </span>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="输入广告系列名..."
              value={campaignSearch}
              onChange={(e) => setCampaignSearch(e.target.value)}
              className="bg-white border border-slate-200 pl-8 pr-2.5 py-2 rounded-xl text-xs font-medium focus:outline-none w-full"
            />
          </div>
          <div className="mt-1 max-h-16 overflow-y-auto bg-white border border-slate-100 rounded-lg p-1.5 space-y-1 no-scrollbar">
            {Array.from(new Set(INITIAL_SETS.map(x => x.campaign))).map(camp => (
              <label key={camp} className="flex items-center gap-2 cursor-pointer select-none px-1">
                <input
                  type="checkbox"
                  checked={selectedCampaigns.includes(camp)}
                  onChange={() => toggleMultiSelect(camp, selectedCampaigns, setSelectedCampaigns)}
                  className="rounded border-slate-300 text-primary w-3 h-3"
                />
                <span className="text-[10px] font-medium text-slate-600 truncate">{camp}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Material ID/Name Search */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
            <Play className="w-3.5 h-3.5 text-slate-400" /> 素材名称 / ID 检索 (支持多选)
          </span>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="输入素材名称/Id并筛选Set..."
              value={materialSearch}
              onChange={(e) => setMaterialSearch(e.target.value)}
              className="bg-white border border-slate-200 pl-8 pr-2.5 py-2 rounded-xl text-xs font-medium focus:outline-none w-full"
            />
          </div>
          <div className="mt-1 max-h-16 overflow-y-auto bg-white border border-slate-100 rounded-lg p-1.5 space-y-1 no-scrollbar">
            {Array.from(new Set(INITIAL_SETS.flatMap(x => x.materials.map(m => m.name)))).map(mName => (
              <label key={mName} className="flex items-center gap-2 cursor-pointer select-none px-1">
                <input
                  type="checkbox"
                  checked={selectedMaterials.includes(mName)}
                  onChange={() => toggleMultiSelect(mName, selectedMaterials, setSelectedMaterials)}
                  className="rounded border-slate-300 text-primary w-3 h-3"
                />
                <span className="text-[10px] font-medium text-slate-600 truncate">{mName}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* 📊 Freezable Table Container */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col no-scrollbar">
        <div className="overflow-x-auto overflow-y-auto max-h-[550px] relative no-scrollbar">
          <table className="w-full text-left border-collapse table-fixed min-w-[2800px]">
            {/* Header section (Frozen first row) */}
            <thead className="bg-slate-900 text-white text-[11px] font-bold tracking-wider uppercase sticky top-0 z-20 shadow-md">
              <tr>
                {/* Check columns in visible state */}
                {columns.filter(col => col.visible).map((col, idx) => {
                  const isFirstCol = idx === 0;
                  return (
                    <th 
                      key={col.id} 
                      className={`py-3 px-4 text-left border-b border-slate-800 ${isFirstCol ? 'sticky left-0 bg-slate-950 z-30 min-w-[120px] w-[140px]' : 'min-w-[140px]'}`}
                    >
                      {col.name}
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* Table Rows */}
            <tbody className="divide-y divide-slate-150 text-xs font-medium text-slate-700">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={columns.filter(c => c.visible).length} className="text-center py-12 text-slate-400 text-sm italic">
                    暂无匹配的回收统计组素材数据
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => {
                  // Find or calculate values
                  const isHighlight = shouldHighlightLaunch(row.launchTime);
                  
                  // Primary Metrics calculations
                  const ctr = row.impressions > 0 ? (row.clicks / row.impressions) * 100 : 0;
                  const cvr = row.clicks > 0 ? (row.installs / row.clicks) * 100 : 0;
                  const cpi = row.installs > 0 ? row.spend / row.installs : 0;
                  const cpm = row.impressions > 0 ? (row.spend / row.impressions) * 1000 : 0;
                  const ir = row.clicks > 0 ? (row.installs / row.clicks) * 100 : 0;
                  
                  const d7PayRate = row.installs > 0 ? (row.d7PaidUsers / row.installs) * 100 : 0;
                  const d7Cpa = row.d7PaidUsers > 0 ? row.spend / row.d7PaidUsers : 0;
                  const d0Roi = row.spend > 0 ? (row.d7TotalRev * 0.15 / row.spend) * 100 : 0; // Simulated D0 fraction
                  const d7Roi = row.spend > 0 ? (row.d7TotalRev / row.spend) * 100 : 0;
                  const d7IapRoi = row.spend > 0 ? (row.d7IapRev / row.spend) * 100 : 0;
                  const d7Arppu = row.d7PaidUsers > 0 ? row.d7TotalRev / row.d7PaidUsers : 0;

                  // Find highest-spend material preview
                  const highestSpendMaterial = [...row.materials].sort((a,b) => b.spend - a.spend)[0];
                  const hasSpend = row.spend > 0;
                  const hasActiveMaterial = highestSpendMaterial && highestSpendMaterial.spend > 0;

                  return (
                    <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                      {columns.filter(col => col.visible).map((col, idx) => {
                        const isFirst = idx === 0;
                        const defaultCellClass = isFirst 
                          ? 'sticky left-0 bg-white hover:bg-slate-50 font-bold text-slate-800 border-r border-slate-100 shadow-sm z-15' 
                          : '';

                        const contentClass = isHighlight ? 'text-blue-600 font-bold' : '';

                        return (
                          <td 
                            key={col.id} 
                            className={`py-3 px-4 truncate border-r border-slate-100 ${defaultCellClass} `}
                          >
                            <span className={contentClass}>
                              {col.id === 'channel' && row.channel}
                              {col.id === 'platform' && (
                                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${row.platform === 'iOS' ? 'bg-slate-100 text-slate-600 border border-slate-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                                  {row.platform}
                                </span>
                              )}
                              {col.id === 'campaign' && row.campaign}
                              {col.id === 'setName' && (
                                <button
                                  onClick={() => setSelectedMaterialForModal(row)}
                                  className="text-left text-primary hover:underline hover:text-indigo-600 font-bold truncate max-w-[200px] block"
                                  title={row.setName}
                                >
                                  {row.setName}
                                </button>
                              )}
                              {col.id === 'launchTime' && row.launchTime}
                              {col.id === 'direction' && (
                                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px]">
                                  {row.direction}
                                </span>
                              )}
                              {col.id === 'preview' && (
                                <div className="flex items-center gap-2">
                                  {highestSpendMaterial ? (
                                    <>
                                      <div className="w-8 h-8 rounded bg-slate-200 overflow-hidden shrink-0 border border-slate-300 relative flex items-center justify-center">
                                        {highestSpendMaterial.type === 'video' ? (
                                          <Play className="w-3.5 h-3.5 text-slate-500" />
                                        ) : highestSpendMaterial.type === 'image' ? (
                                          <img src={highestSpendMaterial.previewUrl} className="w-full h-full object-cover" />
                                        ) : (
                                          <Eye className="w-3.5 h-3.5 text-indigo-500" />
                                        )}
                                      </div>
                                      <div className="flex flex-col min-w-0">
                                        <span className="text-[10px] font-bold text-slate-700 truncate">{highestSpendMaterial.id}</span>
                                        {hasActiveMaterial ? (
                                          <span className="text-[9px] text-slate-400">视频播放</span>
                                        ) : hasSpend ? (
                                          <span className="text-[9px] text-amber-500 font-bold">【试玩出量】</span>
                                        ) : (
                                          <span className="text-[9px] text-rose-500 font-bold">【没有消耗】</span>
                                        )}
                                      </div>
                                    </>
                                  ) : (
                                    <span className="text-slate-400 font-normal italic">暂无素材</span>
                                  )}
                                </div>
                              )}
                              {col.id === 'impressions' && row.impressions.toLocaleString()}
                              {col.id === 'clicks' && row.clicks.toLocaleString()}
                              {col.id === 'ctr' && `${ctr.toFixed(2)}%`}
                              
                              {col.id === 'installs' && (
                                <span className={`px-2 py-1 rounded block text-center ${getCellClassName('installs', row.installs, row.channel)}`}>
                                  {row.installs.toLocaleString()}
                                </span>
                              )}
                              
                              {col.id === 'cvr' && `${cvr.toFixed(2)}%`}
                              {col.id === 'spend' && `$${row.spend.toLocaleString()}`}
                              
                              {col.id === 'cpi' && (
                                <span className={`px-2 py-1 rounded block text-center ${getCellClassName('cpi', cpi, row.channel)}`}>
                                  ${cpi.toFixed(2)}
                                </span>
                              )}
                              
                              {col.id === 'cpm' && `$${cpm.toFixed(2)}`}
                              {col.id === 'ir' && `${ir.toFixed(2)}%`}
                              
                              {col.id === 'd7PaidUsers' && (
                                <span className={`px-2 py-1 rounded block text-center ${getCellClassName('paidUsers', row.d7PaidUsers, row.channel)}`}>
                                  {row.d7PaidUsers}
                                </span>
                              )}
                              {col.id === 'd7PayRate' && (
                                <span className={`px-2 py-1 rounded block text-center ${getCellClassName('payRate', d7PayRate, row.channel)}`}>
                                  {d7PayRate.toFixed(2)}%
                                </span>
                              )}
                              {col.id === 'd7Cpa' && (
                                <span className={`px-2 py-1 rounded block text-center ${getCellClassName('cpa7', d7Cpa, row.channel)}`}>
                                  ${d7Cpa.toFixed(2)}
                                </span>
                              )}
                              
                              {col.id === 'd7TotalRev' && `$${row.d7TotalRev.toLocaleString()}`}
                              {col.id === 'd0Roi' && `${d0Roi.toFixed(2)}%`}
                              
                              {col.id === 'd7Roi' && (
                                <span className={`px-2 py-1 rounded block text-center ${getCellClassName('roi7', d7Roi, row.channel)}`}>
                                  {d7Roi.toFixed(2)}%
                                </span>
                              )}
                              
                              {col.id === 'd7IapRev' && `$${row.d7IapRev.toLocaleString()}`}
                              {col.id === 'd7IapRoi' && `${d7IapRoi.toFixed(2)}%`}
                              {col.id === 'd7Ret' && `${row.d7Ret.toFixed(1)}%`}
                              
                              {col.id === 'd7Arppu' && (
                                <span className={`px-2 py-1 rounded block text-center ${getCellClassName('arppu', d7Arppu, row.channel)}`}>
                                  ${d7Arppu.toFixed(1)}
                                </span>
                              )}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 🧮 Frozen Bottom Row (Summary Row) */}
        {filteredRows.length > 0 && (
          <div className="bg-slate-100 border-t border-slate-300 py-3 px-4 font-bold text-slate-800 text-[11px] grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex justify-between border-r pr-4 border-slate-350">
              <span className="text-slate-500">汇总展示量 (Impressions):</span>
              <span className="font-mono text-slate-800">{totalSummary.imps.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-r pr-4 border-slate-350">
              <span className="text-slate-500">汇总点击量 (Clicks):</span>
              <span className="font-mono text-slate-800">{totalSummary.clicks.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-r pr-4 border-slate-350">
              <span className="text-slate-500">汇总安装用户 (Installs):</span>
              <span className="font-mono text-slate-800">{totalSummary.installs.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">汇总花费总计 (Spend):</span>
              <span className="font-mono text-indigo-600">${totalSummary.spend.toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>

      {/* 📹 Material Content Modal Details Popup */}
      {selectedMaterialForModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-y-auto flex flex-col p-6 relative gap-5 shadow-2xl">
            <button 
              onClick={() => setSelectedMaterialForModal(null)}
              className="absolute right-5 top-5 p-1 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] uppercase tracking-widest font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full inline-block">Ad Group Material Set Details</span>
              <h3 className="text-base font-bold text-slate-800 mt-2 flex items-center">
                <Layers className="w-5 h-5 mr-2 text-indigo-500 animate-pulse" />
                {selectedMaterialForModal.setName}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Campaign: {selectedMaterialForModal.campaign} • 渠道: {selectedMaterialForModal.channel}
              </p>
            </div>

            {/* Structured Table and Preview Group */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Media Player Playable Box */}
              <div className="lg:col-span-5 space-y-4">
                <span className="text-xs font-bold text-slate-700 block border-b pb-1.5">核心出量素材预览</span>
                <div className="aspect-[9/16] w-full max-w-[240px] mx-auto bg-slate-950 rounded-xl overflow-hidden shadow-lg border border-slate-800 flex flex-col justify-between p-3 relative">
                  
                  {/* Real interactive video / iframe preview */}
                  <div className="absolute inset-0 z-0">
                    {selectedMaterialForModal.materials[0]?.type === 'playable' ? (
                      <iframe 
                        src={selectedMaterialForModal.materials[0].previewUrl}
                        className="w-full h-full border-0 rounded-lg bg-white"
                        title="Playable Preview" 
                      />
                    ) : (
                      <video 
                        src={selectedMaterialForModal.materials[0]?.previewUrl}
                        controls 
                        className="w-full h-full object-cover" 
                        onCanPlayThrough={(e) => e.currentTarget.volume = 0.2}
                      />
                    )}
                  </div>

                  {/* Absolute overlays just for UI quality */}
                  <div className="z-10 flex justify-between">
                    <span className="bg-slate-900/80 text-[9px] font-bold text-pink-400 px-2 py-0.5 rounded-full uppercase">
                      {selectedMaterialForModal.materials[0]?.type === 'playable' ? '互动 HTML 试玩' : 'MP4 视频'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Mat detail lists grouped by Channels & sorted by Spend desc */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-xs font-bold text-slate-700">Set内具体关联素材列表 (按花费降序)</span>
                  <span className="text-[10px] font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                    当前Set渠道: {selectedMaterialForModal.channel}
                  </span>
                </div>

                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 no-scrollbar">
                  {[...selectedMaterialForModal.materials]
                    .sort((a,b) => b.spend - a.spend)
                    .map((mat) => {
                      const isTargetChannel = selectedMaterialForModal.channel === 'Applovin' || selectedMaterialForModal.channel === 'Google';
                      return (
                        <div 
                          key={mat.id} 
                          className={`p-3.5 rounded-xl border flex flex-col gap-2.5 transition-all ${isTargetChannel ? 'bg-indigo-50/50 border-indigo-200/60 ring-1 ring-indigo-150' : 'bg-slate-50 border-slate-200/50 hover:bg-slate-100/50'}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                              <span className="text-xs font-bold text-slate-800">{mat.name}</span>
                            </div>
                            <span className="text-[9px] font-bold font-mono text-slate-400">ID: {mat.id}</span>
                          </div>

                          <div className="grid grid-cols-4 gap-2 text-center">
                            <div className="bg-white p-1 rounded-lg border border-slate-100">
                              <span className="text-[9px] text-slate-400 block pb-0.5">花费 (Spend)</span>
                              <span className="text-xs font-bold text-slate-700 font-mono">${mat.spend.toLocaleString()}</span>
                            </div>
                            <div className="bg-white p-1 rounded-lg border border-slate-100">
                              <span className="text-[9px] text-slate-400 block pb-0.5">展示 (Imps)</span>
                              <span className="text-xs font-bold text-slate-700 font-mono">{mat.impressions.toLocaleString()}</span>
                            </div>
                            <div className="bg-white p-1 rounded-lg border border-slate-100">
                              <span className="text-[9px] text-slate-400 block pb-0.5">点击 (Clicks)</span>
                              <span className="text-xs font-bold text-slate-700 font-mono">{mat.clicks.toLocaleString()}</span>
                            </div>
                            <div className="bg-white p-1 rounded-lg border border-slate-100">
                              <span className="text-[9px] text-slate-400 block pb-0.5">CTR (%)</span>
                              <span className="text-xs font-bold text-indigo-600 font-mono">
                                {(mat.impressions > 0 ? (mat.clicks / mat.impressions) * 100 : 0).toFixed(2)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecoveryDataPage;
