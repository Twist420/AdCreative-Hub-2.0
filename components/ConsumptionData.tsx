import React, { useState, useMemo } from 'react';
import { Search, Play, ArrowUpDown, X } from 'lucide-react';
import DateRangePicker from './DateRangePicker';

interface MaterialSpend {
  id: string; // m_01
  name: string; // US_Hook_D01
  contentId: string; // origin_en_01
  thumbnail: string;
  type: 'video' | 'playable' | 'image';
  launchTime: string;
  firstImpressionTime: string; // UTC String
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
    status: 'Live' | 'Paused';
    createdAt: string;
    spend: number;
  }[];
}

const INITIAL_SPENDS: MaterialSpend[] = [
  {
    id: 'm_01',
    name: 'US_Hook_Rescue_V01',
    contentId: 'origin_en_101',
    thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=150&q=80',
    type: 'video',
    launchTime: '2026-05-15',
    firstImpressionTime: '2026-05-15 04:00 UTC',
    spend: 4500,
    impressions: 250000,
    clicks: 7500,
    language: 'EN',
    size: '1080x1920',
    owner: '唐欣怡',
    designer: '王杰华',
    isNew: true,
    associatedSets: [
      { setName: 'cp4124-03-en-m-txy-wjh-原始玩法_20260515', status: 'Live', createdAt: '2026-05-15', spend: 7800 },
      { setName: 'cp4124-04-en-m-txy-wjh-玩法迭代_20260517', status: 'Paused', createdAt: '2026-05-17', spend: 1200 },
    ]
  },
  {
    id: 'm_02',
    name: 'US_3D_Boss_fight_V02',
    contentId: 'origin_en_102',
    thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=150&q=80',
    type: 'video',
    launchTime: '2026-05-18',
    firstImpressionTime: '2026-05-18 08:30 UTC',
    spend: 3300,
    impressions: 200000,
    clicks: 5000,
    language: 'EN',
    size: '1080x1920',
    owner: '唐欣怡',
    designer: '王杰华',
    isNew: true,
    associatedSets: [
      { setName: 'cp4124-03-en-m-txy-wjh-原始玩法_20260515', status: 'Live', createdAt: '2026-05-15', spend: 7800 }
    ]
  },
  {
    id: 'm_03',
    name: 'JP_Intro_Cute_Neko_V01',
    contentId: 'origin_ja_201',
    thumbnail: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=150&q=80',
    type: 'video',
    launchTime: '2026-05-28',
    firstImpressionTime: '2026-05-28 02:15 UTC',
    spend: 2100,
    impressions: 150000,
    clicks: 4500,
    language: 'JA',
    size: '1080x1080',
    owner: '吉意煊',
    designer: '唐欣怡',
    isNew: false,
    associatedSets: [
      { setName: 'cp4128-02-jp-m-txy-原始玩法_20260528', status: 'Live', createdAt: '2026-05-28', spend: 2100 }
    ]
  },
  {
    id: 'm_04',
    name: 'US_Bigtext_Hyper_Speed',
    contentId: 'origin_en_103',
    thumbnail: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&w=150&q=80',
    type: 'video',
    launchTime: '2026-05-20',
    firstImpressionTime: '2026-05-20 12:00 UTC',
    spend: 8900,
    impressions: 550000,
    clicks: 20000,
    language: 'EN',
    size: '1920x1080',
    owner: '唐欣怡',
    designer: '马嘉良',
    isNew: true,
    associatedSets: [
      { setName: 'cp4120-05-en-m-jt-吸量大字报_20260520', status: 'Live', createdAt: '2026-05-20', spend: 15400 }
    ]
  },
  {
    id: 'm_05',
    name: 'CA_Minigame_Match3_Playable',
    contentId: 'playable_en_match3',
    thumbnail: 'https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?auto=format&fit=crop&w=150&q=80',
    type: 'playable',
    launchTime: '2026-05-20',
    firstImpressionTime: '2026-05-21 00:00 UTC',
    spend: 6500,
    impressions: 430000,
    clicks: 14000,
    language: 'EN',
    size: '1080x1920',
    owner: '吉意煊',
    designer: '王杰华',
    isNew: true,
    associatedSets: [
      { setName: 'cp4120-05-en-m-jt-吸量大字报_20260520', status: 'Live', createdAt: '2026-05-20', spend: 15400 }
    ]
  },
  {
    id: 'm_06',
    name: 'DE_Rewards_Showcase_Bnt',
    contentId: 'image_de_banner',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80',
    type: 'image',
    launchTime: '2026-05-22',
    firstImpressionTime: '2026-05-22 15:45 UTC',
    spend: 3800,
    impressions: 210000,
    clicks: 8600,
    language: 'DE',
    size: '1080x1080',
    owner: '马嘉良',
    designer: '王杰华',
    isNew: false,
    associatedSets: [
      { setName: 'cp4126-01-de-m-mlg-其他玩法_20260522', status: 'Live', createdAt: '2026-05-22', spend: 3800 }
    ]
  },
  {
    id: 'm_07',
    name: 'KR_Plot_3D_Cinema_Intro',
    contentId: 'origin_kr_301',
    thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=150&q=80',
    type: 'video',
    launchTime: '2026-05-10',
    firstImpressionTime: '2026-05-10 10:10 UTC',
    spend: 0,
    impressions: 0,
    clicks: 0,
    language: 'KO',
    size: '1920x1080',
    owner: '唐欣怡',
    designer: '王杰华',
    isNew: false,
    associatedSets: [
      { setName: 'cp4130-01-kr-m-jyx-3D玩法_20260510', status: 'Paused', createdAt: '2026-05-10', spend: 6400 }
    ]
  }
];

export const ConsumptionDataPage: React.FC = () => {
  // Filter conditions
  const [launchStart, setLaunchStart] = useState('2026-05-10');
  const [launchEnd, setLaunchEnd] = useState('2026-06-03');
  const [filterOutsideLaunch, setFilterOutsideLaunch] = useState(false);

  const [spendStart, setSpendStart] = useState('2026-05-10');
  const [spendEnd, setSpendEnd] = useState('2026-06-03');
  const [selectedChannel, setSelectedChannel] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');

  // Table Search Filters
  const [setQuery, setSetQuery] = useState('');
  const [materialIdQuery, setMaterialIdQuery] = useState('');
  const [materialNameQuery, setMaterialNameQuery] = useState('');

  // Column visibility / toggle aggregation properties
  const [showLangCol, setShowLangCol] = useState(true);
  const [showSizeCol, setShowSizeCol] = useState(false);
  const [showOwnerCol, setShowOwnerCol] = useState(false);
  const [showDesignerCol, setShowDesignerCol] = useState(false);

  // Tab filters inside Table: Videos, Playables, Images
  const [activeTypeTab, setActiveTypeTab] = useState<'all' | 'video' | 'playable' | 'image'>('all');

  // Popup state for showing material set uses
  const [modalMaterialUses, setModalMaterialUses] = useState<MaterialSpend | null>(null);

  // Table Sorting
  const [sortKey, setSortKey] = useState<string>('spend');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Filter rows
  const filteredMaterials = useMemo(() => {
    let rows = INITIAL_SPENDS.filter(item => {
      // Channel
      if (selectedChannel !== 'All') {
        const matchesChannel = item.associatedSets.some(set => set.setName.toLowerCase().includes(selectedChannel.toLowerCase()));
        if (!matchesChannel) return false;
      }

      // Language
      if (selectedLanguage !== 'All' && item.language !== selectedLanguage) return false;

      // Filter launch
      if (filterOutsideLaunch) {
        if (item.launchTime < launchStart || item.launchTime > launchEnd) return false;
      }

      // Type tabs
      if (activeTypeTab !== 'all' && item.type !== activeTypeTab) return false;

      // Header inputs
      if (setQuery) {
        const matchesSet = item.associatedSets.some(set => set.setName.toLowerCase().includes(setQuery.toLowerCase()));
        if (!matchesSet) return false;
      }
      if (materialIdQuery && !item.id.toLowerCase().includes(materialIdQuery.toLowerCase())) return false;
      if (materialNameQuery && !item.name.toLowerCase().includes(materialNameQuery.toLowerCase())) return false;

      return true;
    });

    // Handle Aggregations as specified in the document!
    // 1. "当隐藏语言列时，素材的【花费、展示、点击】按照内容id (content_id)聚合，CTR重新按照聚合后的点击/展示计算"
    // 2. "当隐藏尺寸列该列隐藏时，【花费、展示、点击】按照素材id (material_id)聚合"
    // Let's implement real aggregation algorithm!
    if (!showLangCol) {
      // Group by contentId
      const grouped: Record<string, MaterialSpend> = {};
      rows.forEach(item => {
        if (!grouped[item.contentId]) {
          grouped[item.contentId] = { ...item };
        } else {
          grouped[item.contentId].spend += item.spend;
          grouped[item.contentId].impressions += item.impressions;
          grouped[item.contentId].clicks += item.clicks;
        }
      });
      rows = Object.values(grouped);
    } else if (!showSizeCol) {
      // Group by id (materialId)
      const grouped: Record<string, MaterialSpend> = {};
      rows.forEach(item => {
        if (!grouped[item.id]) {
          grouped[item.id] = { ...item };
        } else {
          grouped[item.id].spend += item.spend;
          grouped[item.id].impressions += item.impressions;
          grouped[item.id].clicks += item.clicks;
        }
      });
      rows = Object.values(grouped);
    }

    // Sort rows
    rows.sort((a, b) => {
      let valA: any = a[sortKey as keyof MaterialSpend];
      let valB: any = b[sortKey as keyof MaterialSpend];
      
      // Calculate special values
      if (sortKey === 'ctr') {
        valA = a.impressions > 0 ? (a.clicks / a.impressions) : 0;
        valB = b.impressions > 0 ? (b.clicks / b.impressions) : 0;
      } else if (sortKey === 'spendRatio') {
        valA = a.spend;
        valB = b.spend;
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return rows;
  }, [
    selectedChannel, selectedLanguage, filterOutsideLaunch, launchStart, launchEnd,
    activeTypeTab, setQuery, materialIdQuery, materialNameQuery, showLangCol, showSizeCol, sortKey, sortDirection
  ]);

  // Total sums of entire periods
  const globalTotalSpend = useMemo(() => {
    return INITIAL_SPENDS.reduce((sum, x) => sum + x.spend, 0);
  }, []);

  const totalSummary = useMemo(() => {
    let newMaterialSpend = 0;
    let totalImpressions = 0;
    let totalClicks = 0;
    let totalFilteredSpend = 0;

    filteredMaterials.forEach(m => {
      if (m.isNew) newMaterialSpend += m.spend;
      totalImpressions += m.impressions;
      totalClicks += m.clicks;
      totalFilteredSpend += m.spend;
    });

    return {
      newMaterialSpend,
      newMaterialSpendRatio: totalFilteredSpend > 0 ? (newMaterialSpend / totalFilteredSpend) * 100 : 0,
      totalImpressions,
      totalClicks,
      totalFilteredSpend
    };
  }, [filteredMaterials]);

  return (
    <div className="space-y-6 pb-20">
      {/* 👑 Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center">
            <span className="w-1.5 h-6 bg-pink-500 rounded-full mr-3"></span>
            消耗数据看板
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            监控投放创意素材消耗明细，支持筛选、聚合、排序与关联创意组查看。
          </p>
        </div>
      </div>

      {/* 🔍 Global Filter Area */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-6 shadow-sm">
        {/* Launch Time + Toggle Checkbox */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold text-slate-700">投放时间</span>
          <DateRangePicker
            start={launchStart}
            end={launchEnd}
            onChange={({ start, end }) => {
              setLaunchStart(start);
              setLaunchEnd(end);
            }}
            compact
          />
          <label className="flex items-center gap-2 mt-1 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={filterOutsideLaunch}
              onChange={e => setFilterOutsideLaunch(e.target.checked)}
              className="rounded border-slate-300 text-pink-500 w-3.5 h-3.5 focus:ring-0"
            />
            <span className="text-[10px] font-bold text-slate-500">过滤投放时间之外的数据</span>
          </label>
        </div>

        {/* Spend Period */}
        <div className="flex flex-col gap-2 border-l-0 md:border-l border-slate-100 md:px-4">
          <span className="text-xs font-bold text-slate-700">花费周期</span>
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
        </div>

        {/* Channel Selection */}
        <div className="flex flex-col gap-2 border-l-0 md:border-l border-slate-100 md:px-4">
          <span className="text-xs font-bold text-slate-700">渠道</span>
          <select
            value={selectedChannel}
            onChange={e => setSelectedChannel(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold rounded-lg px-2.5 py-2 focus:outline-none mt-0.5"
          >
            <option value="All">全部渠道 (All)</option>
            <option value="Applovin">AppLovin (AL)</option>
            <option value="Google">Google Ads</option>
            <option value="Facebook">Facebook</option>
            <option value="Adjoe">Adjoe</option>
            <option value="Moloco">Moloco</option>
            <option value="Unity">Unity</option>
          </select>
        </div>

        {/* Language Selection */}
        <div className="flex flex-col gap-2 border-l-0 md:border-l border-slate-100 md:pl-4">
          <span className="text-xs font-bold text-slate-700">语言 (Language)</span>
          <select
            value={selectedLanguage}
            onChange={e => setSelectedLanguage(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold rounded-lg px-2.5 py-2 focus:outline-none mt-0.5"
          >
            <option value="All">All Languages</option>
            <option value="EN">英语 (EN)</option>
            <option value="JA">日语 (JA)</option>
            <option value="KO">韩语 (KO)</option>
            <option value="DE">德语 (DE)</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-5">
          {/* Upper Table Filters (set name, material id, material name) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="搜索 Set 名称..."
                value={setQuery}
                onChange={e => setSetQuery(e.target.value)}
                className="bg-slate-50 border border-slate-200 pl-9 pr-3 py-2 text-xs font-semibold rounded-xl focus:outline-none w-full"
              />
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="搜索素材 ID..."
                value={materialIdQuery}
                onChange={e => setMaterialIdQuery(e.target.value)}
                className="bg-slate-50 border border-slate-200 pl-9 pr-3 py-2 text-xs font-semibold rounded-xl focus:outline-none w-full"
              />
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="搜索素材名称..."
                value={materialNameQuery}
                onChange={e => setMaterialNameQuery(e.target.value)}
                className="bg-slate-50 border border-slate-200 pl-9 pr-3 py-2 text-xs font-semibold rounded-xl focus:outline-none w-full"
              />
            </div>
          </div>

          <div className="h-px bg-slate-200 my-1"></div>

          {/* Type filters tabs + Custom display switch toggles */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Playables, Videos, Images type tab */}
            <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
              {[
                { id: 'all', label: '全部' },
                { id: 'video', label: '视频 (Videos)' },
                { id: 'playable', label: '试玩 (Playables)' },
                { id: 'image', label: '图片 (Images)' }
              ].map(type => (
                <button
                  key={type.id}
                  onClick={() => setActiveTypeTab(type.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTypeTab === type.id ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  {type.label}
                </button>
              ))}
            </div>

            {/* Custom aggregation columns switches */}
            <div className="flex flex-wrap items-center gap-3.5 bg-slate-50 p-2 rounded-xl border border-slate-150">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">列聚合与显示控制:</span>
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showLangCol}
                  onChange={e => setShowLangCol(e.target.checked)}
                  className="rounded text-pink-500 focus:ring-0 w-3.5 h-3.5"
                />
                <span className="text-xs font-bold text-slate-600">语言 (Language聚合)</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showSizeCol}
                  onChange={e => setShowSizeCol(e.target.checked)}
                  className="rounded text-pink-500 focus:ring-0 w-3.5 h-3.5"
                />
                <span className="text-xs font-bold text-slate-600">尺寸列聚合</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showOwnerCol}
                  onChange={e => setShowOwnerCol(e.target.checked)}
                  className="rounded text-pink-500 focus:ring-0 w-3.5 h-3.5"
                />
                <span className="text-xs font-bold text-slate-600">负责人</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showDesignerCol}
                  onChange={e => setShowDesignerCol(e.target.checked)}
                  className="rounded text-pink-500 focus:ring-0 w-3.5 h-3.5"
                />
                <span className="text-xs font-bold text-slate-600">制作人</span>
              </label>
            </div>
          </div>

          {/* Main List Table (Freezed headers) */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left border-collapse table-fixed min-w-[1400px]">
              <thead className="bg-slate-900 text-white text-[11px] font-bold uppercase sticky top-0 z-20 shadow-md">
                <tr>
                  <th className="py-3 px-4 w-24">素材ID</th>
                  <th className="py-3 px-4 w-44">素材名称</th>
                  <th className="py-3 px-4 w-32 justify-between">
                    <span>素材内容ID [E.id]</span>
                  </th>
                  <th className="py-3 px-4 w-28">素材预览</th>
                  <th className="py-3 px-4 w-48">Creative Set</th>
                  <th className="py-3 px-4 w-32">首次展示时间</th>
                  <th className="py-3 px-4 w-28 text-right cursor-pointer" onClick={() => { setSortKey('spend'); setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc'); }}>
                    花费 <ArrowUpDown className="w-3 h-3 inline-block ml-1" />
                  </th>
                  <th className="py-3 px-4 w-28 text-right cursor-pointer text-pink-300" onClick={() => { setSortKey('spendRatio'); setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc'); }}>
                    花费占比 (%) <ArrowUpDown className="w-3 h-3 inline-block ml-1" />
                  </th>
                  <th className="py-3 px-4 w-28 text-right">展示量</th>
                  <th className="py-3 px-4 w-28 text-right">点击</th>
                  <th className="py-3 px-4 w-24 text-right cursor-pointer" onClick={() => { setSortKey('ctr'); setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc'); }}>
                    CTR (%) <ArrowUpDown className="w-3 h-3 inline-block ml-1" />
                  </th>
                  {showLangCol && <th className="py-3 px-4 w-20">语言</th>}
                  {showSizeCol && <th className="py-3 px-4 w-24">尺寸</th>}
                  {showOwnerCol && <th className="py-3 px-4 w-24">需求负责人</th>}
                  {showDesignerCol && <th className="py-3 px-4 w-24">制作人员</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-700">
                {filteredMaterials.map(m => {
                  const pct = globalTotalSpend > 0 ? (m.spend / globalTotalSpend) * 100 : 0;
                  const ctr = m.impressions > 0 ? (m.clicks / m.impressions) * 100 : 0;
                  const firstSet = m.associatedSets[0];

                  // Highlight in blue if date falls into launching ranges and checked
                  const launchDateInside = m.launchTime >= launchStart && m.launchTime <= launchEnd;
                  const highlightBlue = !filterOutsideLaunch && launchDateInside;

                  return (
                    <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[10px] text-slate-500">{m.id}</td>
                      <td className={`py-3 px-4 truncate ${highlightBlue ? 'text-blue-600 font-bold' : ''}`} title={m.name}>
                        {m.name}
                      </td>
                      <td className="py-3 px-4 truncate font-mono text-slate-400">{m.contentId}</td>
                      <td className="py-3 px-4">
                        <div className="w-10 h-10 bg-slate-200 border border-slate-300 rounded overflow-hidden flex items-center justify-center relative group">
                          <img src={m.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Play className="w-3.5 h-3.5 text-white" />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {firstSet ? (
                          <button
                            onClick={() => setModalMaterialUses(m)}
                            className="text-left text-primary hover:underline hover:text-indigo-600 block font-black truncate max-w-[180px]"
                            title={firstSet.setName}
                          >
                            {firstSet.setName}
                          </button>
                        ) : (
                          <span className="text-slate-400 italic">No usage sets</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-medium font-mono text-[10px]">{m.firstImpressionTime}</td>
                      <td className="py-3 px-4 text-right font-mono">${m.spend.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right text-pink-600 font-mono">{pct.toFixed(2)}%</td>
                      <td className="py-3 px-4 text-right font-mono">{m.impressions.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right font-mono">{m.clicks.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right font-mono font-black text-slate-900">{ctr.toFixed(2)}%</td>
                      
                      {showLangCol && (
                        <td className="py-3 px-4">
                          <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-bold border border-slate-200">{m.language}</span>
                        </td>
                      )}
                      
                      {showSizeCol && <td className="py-3 px-4 font-mono text-slate-500">{m.size}</td>}
                      {showOwnerCol && <td className="py-3 px-4 text-slate-600">{m.owner}</td>}
                      {showDesignerCol && <td className="py-3 px-4 text-slate-600">{m.designer}</td>}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Fixed bottom summary row on table section */}
          {filteredMaterials.length > 0 && (
            <div className="bg-slate-900 text-white rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-bold leading-none">
              <div className="flex justify-between border-b md:border-b-0 border-slate-800 pb-2 md:pb-0 md:border-r md:pr-4">
                <span className="text-slate-450 mr-2 uppercase tracking-wide">新素材投放花费/总花费:</span>
                <span className="font-mono text-sky-400">${totalSummary.newMaterialSpend.toLocaleString()} / ${totalSummary.totalFilteredSpend.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-b md:border-b-0 border-slate-800 pb-2 md:pb-0 md:border-r md:pr-4">
                <span className="text-slate-450 mr-2 uppercase tracking-wide">新素材花费占比:</span>
                <span className="font-mono text-pink-400">{totalSummary.newMaterialSpendRatio.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between border-b md:border-b-0 border-slate-800 pb-2 md:pb-0 md:border-r md:pr-4">
                <span className="text-slate-450 mr-2 uppercase tracking-wide">汇总展示:</span>
                <span className="font-mono text-slate-300">{totalSummary.totalImpressions.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-450 mr-2 uppercase tracking-wide">汇总点击:</span>
                <span className="font-mono text-slate-300">{totalSummary.totalClicks.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>

      {/* 👑 Display material's associated sets Popup Modal */}
      {modalMaterialUses && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6 relative gap-4 flex flex-col shadow-2xl">
            <button onClick={() => setModalMaterialUses(null)} className="absolute right-5 top-5 p-1 text-slate-450 hover:text-slate-600 bg-slate-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] uppercase font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full inline-block">Material In Sets Report</span>
              <h3 className="text-sm font-black text-slate-800 mt-2">素材关联创意组：{modalMaterialUses.name}</h3>
              <p className="text-xs text-slate-400 mt-1">
                素材ID: {modalMaterialUses.id} • 内容ID: {modalMaterialUses.contentId}
              </p>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left font-medium text-xs">
                <thead className="bg-slate-100 text-slate-500 font-bold text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Set名称</th>
                    <th className="py-2.5 px-3 w-28">状态 (可筛选)</th>
                    <th className="py-2.5 px-3 w-32 cursor-pointer">创建日期 (可排)</th>
                    <th className="py-2.5 px-3 w-28 text-right cursor-pointer">周期花费 (可排)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  {modalMaterialUses.associatedSets.map((set, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-bold text-slate-800 truncate max-w-[220px]">{set.setName}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${set.status === 'Live' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'}`}>
                          {set.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-400">{set.createdAt}</td>
                      <td className="py-3 px-3 text-right font-bold text-indigo-600 font-mono">${set.spend.toLocaleString()}</td>
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
