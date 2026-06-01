

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { generateMaterialDetails } from '../services/mockData';
import { Filter, Settings, ChevronDown, ChevronUp, Plus, Trash2, X, Check, Calendar, Clock, Search, Globe, Layers } from 'lucide-react';
import { MaterialDetailRow } from '../types';

type SortDirection = 'asc' | 'desc' | null;

interface SortConfig {
  key: keyof MaterialDetailRow | null;
  direction: SortDirection;
}

interface FilterCondition {
  id: string;
  field: keyof MaterialDetailRow;
  operator: '>' | '<' | '=' | '>=' | '<=';
  value: string;
}

const MaterialDetails: React.FC = () => {
  // --- Dual Date Filters State ---
  const [launchStart, setLaunchStart] = useState<string>(() => {
    const d = new Date();
    d.setDate(1); 
    return d.toISOString().slice(0, 10);
  });
  const [launchEnd, setLaunchEnd] = useState<string>(new Date().toISOString().slice(0, 10));

  const [spendStart, setSpendStart] = useState<string>(() => {
     const d = new Date();
     d.setDate(d.getDate() - 30);
     return d.toISOString().slice(0, 10);
  });
  const [spendEnd, setSpendEnd] = useState<string>(new Date().toISOString().slice(0, 10));

  // Language Filter
  const [language, setLanguage] = useState<'all' | 'en' | 'localized'>('all');
  const [channel, setChannel] = useState<string>('all');

  const [rawData, setRawData] = useState<MaterialDetailRow[]>([]);

  // Search
  const [searchQuery, setSearchQuery] = useState('');

  // Refresh data when date ranges change
  useEffect(() => {
    setRawData(generateMaterialDetails(launchStart, launchEnd, spendStart, spendEnd, language, channel));
  }, [launchStart, launchEnd, spendStart, spendEnd, language, channel]);
  
  // -- Column Configuration --
  const allHeaders = [
    { key: 'date', label: '时间', width: 'w-24', isNum: false },
    { key: 'thumbnail', label: '素材预览', width: 'w-16', isNum: false },
    { key: 'title', label: '素材内容标题', width: 'min-w-[200px] flex-1', isNum: false },
    { key: 'direction', label: '方向', width: 'w-24', isNum: false },
    { key: 'language', label: '语言', width: 'w-16', isNum: false },
    { key: 'owner', label: '创意负责人', width: 'w-24', isNum: false },
    { key: 'cost', label: '花费', width: 'w-20', isNum: true },
    { key: 'costRatio', label: '花费占比', width: 'w-20', isNum: true },
    { key: 'cpm', label: 'CPM', width: 'w-16', isNum: true },
    { key: 'cpi', label: 'CPI', width: 'w-16', isNum: true },
    { key: 'ctr', label: 'CTR', width: 'w-16', isNum: true },
    { key: 'cvr', label: 'CVR', width: 'w-16', isNum: true },
    { key: 'roas', label: 'D0/D7 ROAS', width: 'w-24', isNum: true },
    { key: 'installs', label: '安装数', width: 'w-20', isNum: true },
    { key: 'payingUsers', label: '付费用户数量', width: 'w-24', isNum: true },
    { key: 'diffHighestCost', label: '偏差值(Top)', width: 'w-24', isNum: true },
    { key: 'diffAvgCost', label: '偏差值(Avg)', width: 'w-24', isNum: true },
  ];

  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(allHeaders.map(h => h.key))
  );
  const [showColConfig, setShowColConfig] = useState(false);
  const colConfigRef = useRef<HTMLDivElement>(null);

  // -- Filtering --
  const [filters, setFilters] = useState<FilterCondition[]>([]);
  const [showFilterConfig, setShowFilterConfig] = useState(false);
  const filterConfigRef = useRef<HTMLDivElement>(null);

  // -- Sorting --
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: null });

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (colConfigRef.current && !colConfigRef.current.contains(event.target as Node)) {
        setShowColConfig(false);
      }
      if (filterConfigRef.current && !filterConfigRef.current.contains(event.target as Node)) {
        setShowFilterConfig(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // -- Handlers --

  const toggleColumn = (key: string) => {
    const newSet = new Set(visibleColumns);
    if (newSet.has(key)) {
      if (newSet.size > 1) newSet.delete(key); // Prevent hiding all columns
    } else {
      newSet.add(key);
    }
    setVisibleColumns(newSet);
  };

  const handleSort = (key: keyof MaterialDetailRow) => {
    let direction: SortDirection = 'asc';
    if (sortConfig.key === key) {
      if (sortConfig.direction === 'asc') direction = 'desc';
      else if (sortConfig.direction === 'desc') direction = null;
    }
    setSortConfig({ key: direction ? key : null, direction });
  };

  const addFilter = () => {
    const newFilter: FilterCondition = {
      id: Math.random().toString(36).substr(2, 9),
      field: 'cvr',
      operator: '>',
      value: ''
    };
    setFilters([...filters, newFilter]);
  };

  const removeFilter = (id: string) => {
    setFilters(filters.filter(f => f.id !== id));
  };

  const updateFilter = (id: string, updates: Partial<FilterCondition>) => {
    setFilters(filters.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const setQuickRange = (type: 'launch' | 'spend', days: number | 'month') => {
     const end = new Date();
     let start = new Date();
     
     if (days === 'month') {
        start = new Date(end.getFullYear(), end.getMonth(), 1);
     } else {
        start.setDate(end.getDate() - days);
     }

     const sStr = start.toISOString().slice(0, 10);
     const eStr = end.toISOString().slice(0, 10);

     if (type === 'launch') {
        setLaunchStart(sStr);
        setLaunchEnd(eStr);
     } else {
        setSpendStart(sStr);
        setSpendEnd(eStr);
     }
  };

  // -- Derived Data --

  const processedData = useMemo(() => {
    let result = [...rawData];

    // 0. Global Search
    if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        result = result.filter(row => 
            row.title.toLowerCase().includes(query) || 
            row.owner.toLowerCase().includes(query) ||
            row.id.toLowerCase().includes(query) ||
            row.direction.toLowerCase().includes(query)
        );
    }

    // 1. Filter
    if (filters.length > 0) {
      result = result.filter(row => {
        return filters.every(filter => {
          const rawVal = row[filter.field];
          const colDef = allHeaders.find(h => h.key === filter.field);
          const isNumericField = colDef?.isNum;

          let val: number | string = rawVal as any;
          let filterVal: number | string = filter.value;

          if (isNumericField) {
             val = Number(rawVal);
             filterVal = Number(filter.value);
             if (isNaN(filterVal)) return true;
          } else {
             val = String(rawVal).toLowerCase();
             filterVal = String(filter.value).toLowerCase();
          }

          switch (filter.operator) {
            case '>': return val > filterVal;
            case '<': return val < filterVal;
            case '=': return isNumericField ? val === filterVal : String(val).includes(String(filterVal));
            case '>=': return val >= filterVal;
            case '<=': return val <= filterVal;
            default: return true;
          }
        });
      });
    }

    // 2. Sort
    if (sortConfig.key && sortConfig.direction) {
      result.sort((a, b) => {
        const valA = a[sortConfig.key!];
        const valB = b[sortConfig.key!];

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [rawData, filters, sortConfig, searchQuery]);

  const visibleHeaders = allHeaders.filter(h => visibleColumns.has(h.key));

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden relative">
      
      {/* Top Filter Bar (Dual Ranges) */}
      <div className="px-6 py-4 border-b border-slate-100 bg-white z-20 space-y-4">
        
        <div className="flex flex-col xl:flex-row gap-4 justify-between">
            {/* Left: Launch Time Filter */}
            <div className="flex flex-col gap-2 min-w-0">
                <div className="flex items-center gap-2 text-slate-700 font-bold text-xs">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="whitespace-nowrap">投放开始时间</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200">
                        <input 
                            type="date" 
                            value={launchStart}
                            onChange={(e) => setLaunchStart(e.target.value)}
                            className="bg-transparent text-xs font-medium text-slate-700 focus:outline-none w-24 sm:w-auto"
                        />
                        <span className="text-slate-400 text-[10px] font-bold">-</span>
                        <input 
                            type="date" 
                            value={launchEnd}
                            onChange={(e) => setLaunchEnd(e.target.value)}
                            className="bg-transparent text-xs font-medium text-slate-700 focus:outline-none w-24 sm:w-auto"
                        />
                    </div>
                    {/* Quick Selects */}
                    <div className="flex bg-slate-50 p-0.5 rounded-lg border border-slate-100 hidden sm:flex">
                        {[
                            { label: '本月', val: 'month' },
                            { label: '近30天', val: 30 },
                            { label: '近90天', val: 90 },
                        ].map((item) => (
                            <button 
                                key={item.label}
                                onClick={() => setQuickRange('launch', item.val as any)}
                                className="px-2 py-1 rounded text-[10px] font-bold transition-all text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-sm whitespace-nowrap"
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Middle: Language Filter */}
            <div className="flex flex-col gap-2 xl:border-l border-slate-100 xl:px-4 min-w-[140px]">
                <div className="flex items-center gap-2 text-slate-700 font-bold text-xs">
                    <Globe className="w-3.5 h-3.5 text-sky-600" />
                    <span className="whitespace-nowrap">语言</span>
                </div>
                <div className="flex bg-slate-50 p-1 rounded-lg w-full">
                    {[
                        { id: 'all', label: '全部' },
                        { id: 'en', label: '英语' },
                        { id: 'localized', label: '本地' },
                    ].map((opt) => (
                        <button
                            key={opt.id}
                            onClick={() => setLanguage(opt.id as any)}
                            className={`flex-1 px-2 py-1 rounded text-[10px] font-bold transition-all ${
                                language === opt.id 
                                ? 'bg-white text-sky-600 shadow-sm' 
                                : 'text-slate-500 hover:text-sky-600'
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Middle: Channel Filter */}
            <div className="flex flex-col gap-2 xl:border-l border-slate-100 xl:px-4 min-w-[140px]">
                <div className="flex items-center gap-2 text-slate-700 font-bold text-xs">
                    <Layers className="w-3.5 h-3.5 text-orange-600" />
                    <span className="whitespace-nowrap">渠道</span>
                </div>
                <div className="h-[32px]">
                   <select 
                     value={channel} 
                     onChange={e => setChannel(e.target.value)}
                     className="w-full h-full bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg focus:ring-primary focus:border-primary block px-2.5"
                   >
                     <option value="all">全部渠道</option>
                     <option value="applovin">AppLovin</option>
                     <option value="unity">Unity</option>
                     <option value="google">Google</option>
                     <option value="facebook">Facebook</option>
                     <option value="tiktok">TikTok</option>
                   </select>
                </div>
            </div>

            {/* Right: Spend Period Filter */}
            <div className="flex flex-col gap-2 min-w-0 xl:border-l border-slate-100 xl:pl-4">
                <div className="flex items-center gap-2 text-slate-700 font-bold text-xs">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="whitespace-nowrap">花费周期</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200">
                        <input 
                            type="date" 
                            value={spendStart}
                            onChange={(e) => setSpendStart(e.target.value)}
                            className="bg-transparent text-xs font-medium text-slate-700 focus:outline-none w-24 sm:w-auto"
                        />
                        <span className="text-slate-400 text-[10px] font-bold">-</span>
                        <input 
                            type="date" 
                            value={spendEnd}
                            onChange={(e) => setSpendEnd(e.target.value)}
                            className="bg-transparent text-xs font-medium text-slate-700 focus:outline-none w-24 sm:w-auto"
                        />
                    </div>
                    {/* Quick Selects */}
                    <div className="flex bg-slate-50 p-0.5 rounded-lg border border-slate-100 hidden sm:flex">
                         {[
                            { label: '本月', val: 'month' },
                            { label: '近7天', val: 7 },
                            { label: '近30天', val: 30 },
                        ].map((item) => (
                            <button 
                                key={item.label}
                                onClick={() => setQuickRange('spend', item.val as any)}
                                className="px-2 py-1 rounded text-[10px] font-bold transition-all text-slate-400 hover:text-emerald-600 hover:bg-white hover:shadow-sm whitespace-nowrap"
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        {/* Toolbar Row 2: Search & Configs */}
        <div className="flex items-center justify-between pt-2">
            
            {/* Search Bar */}
            <div className="relative group max-w-md w-full mr-4">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 group-hover:text-primary transition-colors" />
                <input 
                    type="text" 
                    placeholder="Search materials by title, ID or owner..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
            </div>

            <div className="flex items-center gap-3">
                 {/* Field Config Dropdown */}
                <div className="relative" ref={colConfigRef}>
                    <button 
                    onClick={() => setShowColConfig(!showColConfig)}
                    className={`flex items-center px-3 py-2 rounded-lg text-xs font-bold transition-colors border ${showColConfig ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                    <Settings className="w-3.5 h-3.5 mr-2" />
                    字段配置
                    </button>
                    {showColConfig && (
                    <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-slate-200 rounded-lg shadow-xl z-50 p-2 max-h-96 overflow-y-auto">
                        <div className="text-xs font-semibold text-slate-400 px-2 py-1 mb-1">显示列</div>
                        {allHeaders.map(col => (
                        <label key={col.key} className="flex items-center px-2 py-1.5 hover:bg-slate-50 rounded cursor-pointer">
                            <input 
                            type="checkbox" 
                            checked={visibleColumns.has(col.key)}
                            onChange={() => toggleColumn(col.key)}
                            className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                            />
                            <span className="ml-2 text-sm text-slate-700">{col.label}</span>
                        </label>
                        ))}
                    </div>
                    )}
                </div>

                {/* Filter Dropdown */}
                <div className="relative" ref={filterConfigRef}>
                    <button 
                    onClick={() => setShowFilterConfig(!showFilterConfig)}
                    className={`flex items-center px-3 py-2 rounded-lg text-xs font-bold transition-colors border ${showFilterConfig || filters.length > 0 ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                    <Filter className="w-3.5 h-3.5 mr-2" />
                    筛选 {filters.length > 0 && <span className="ml-1 bg-primary text-white text-[10px] px-1.5 py-0.5 rounded-full">{filters.length}</span>}
                    </button>
                    
                    {showFilterConfig && (
                    <div className="absolute top-full right-0 mt-2 w-[450px] bg-white border border-slate-200 rounded-lg shadow-xl z-50 p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-slate-800">设置筛选条件</h3>
                            <button onClick={addFilter} className="text-xs flex items-center text-primary hover:text-primary/80 font-medium">
                            <Plus className="w-3 h-3 mr-1" /> 添加条件
                            </button>
                        </div>
                        
                        {filters.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-4">暂无筛选条件，点击右上角添加</p>
                        ) : (
                        <div className="space-y-3">
                            {filters.map((filter) => (
                            <div key={filter.id} className="flex items-center gap-2">
                                <select 
                                    value={filter.field}
                                    onChange={(e) => updateFilter(filter.id, { field: e.target.value as any })}
                                    className="text-xs border border-slate-300 rounded px-2 py-1.5 w-36 focus:outline-none focus:border-primary truncate"
                                >
                                {allHeaders.filter(h => h.key !== 'thumbnail').map(h => (
                                    <option key={h.key} value={h.key}>{h.label}</option>
                                ))}
                                </select>
                                <select 
                                    value={filter.operator}
                                    onChange={(e) => updateFilter(filter.id, { operator: e.target.value as any })}
                                    className="text-xs border border-slate-300 rounded px-2 py-1.5 w-20 focus:outline-none focus:border-primary"
                                >
                                <option value=">">&gt;</option>
                                <option value="<">&lt;</option>
                                <option value="=">=</option>
                                <option value=">=">&ge;</option>
                                <option value="<=">&le;</option>
                                </select>
                                <input 
                                type="text" 
                                value={filter.value}
                                onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
                                className="text-xs border border-slate-300 rounded px-2 py-1.5 flex-1 focus:outline-none focus:border-primary w-24"
                                placeholder="Value"
                                />
                                <button onClick={() => removeFilter(filter.id)} className="p-1 text-slate-400 hover:text-rose-500">
                                <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            ))}
                        </div>
                        )}
                    </div>
                    )}
                </div>
            </div>
        </div>

      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
            <tr>
              {visibleHeaders.map((header) => {
                 const isSorted = sortConfig.key === header.key;
                 return (
                  <th 
                    key={header.key}
                    onClick={() => handleSort(header.key as keyof MaterialDetailRow)}
                    className={`px-3 py-3 text-xs font-semibold text-slate-500 border-b border-r border-slate-200 last:border-r-0 whitespace-normal cursor-pointer select-none hover:bg-slate-100 transition-colors ${header.width} ${header.isNum ? 'text-right' : 'text-left'}`}
                  >
                    <div className={`flex items-center gap-1 ${header.isNum ? 'justify-end' : 'justify-start'} h-full group`}>
                      <span>{header.label}</span>
                      <div className="flex flex-col ml-1 w-3">
                         {isSorted ? (
                           sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3 text-primary" /> : <ChevronDown className="w-3 h-3 text-primary" />
                         ) : (
                           <div className="opacity-0 group-hover:opacity-40 flex flex-col -space-y-1">
                              <ChevronUp className="w-2.5 h-2.5" />
                              <ChevronDown className="w-2.5 h-2.5" />
                           </div>
                         )}
                      </div>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {processedData.length > 0 ? (
              processedData.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50 transition-colors group">
                  {visibleHeaders.map((header) => (
                    <td 
                      key={`${row.id}-${header.key}`} 
                      className={`px-3 py-2 text-xs border-r border-slate-100 last:border-r-0 ${header.isNum ? 'text-right' : 'text-left'} ${header.key === 'title' ? 'break-all' : 'whitespace-nowrap'} text-slate-600`}
                    >
                      {header.key === 'thumbnail' ? (
                        <div className="w-8 h-12 bg-slate-200 rounded overflow-hidden shadow-sm mx-auto cursor-pointer hover:scale-150 transition-transform origin-center z-0 hover:z-50 relative">
                          <img src={row.thumbnail} alt="" className="w-full h-full object-cover" />
                        </div>
                      ) : header.key === 'cost' ? (
                        <span className="font-medium text-slate-700">${row.cost}</span>
                      ) : (
                        // @ts-ignore
                        row[header.key]
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={visibleHeaders.length} className="px-6 py-12 text-center text-slate-400 text-sm">
                   没有找到符合条件的数据
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Footer / Pagination (Mock) */}
      <div className="px-6 py-3 border-t border-slate-100 bg-white flex justify-between items-center text-xs text-slate-500">
          <div>共 {processedData.length} 条数据</div>
          <div className="flex gap-2">
              <button disabled className="px-3 py-1 bg-slate-100 rounded text-slate-400 cursor-not-allowed">上一页</button>
              <button className="px-3 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50">下一页</button>
          </div>
      </div>
    </div>
  );
};

export default MaterialDetails;
