import React, { useState, useEffect } from 'react';
import { Plus, Copy, Search, Calendar, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { BenchmarkRule } from '../types';
import { generateBenchmarkData } from '../services/mockData';

const Benchmark: React.FC = () => {
  const [rules, setRules] = useState<BenchmarkRule[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<Partial<BenchmarkRule> | null>(null);
  const [channels] = useState(['Facebook', 'Google', 'TikTok', 'AppLovin', 'Unity', 'IronSource']);

  useEffect(() => {
    const data = generateBenchmarkData();
    setRules(data);
  }, []);

  // Update status based on effective time
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setRules(prevRules => {
        // Group by channel to find the latest effective rule that is <= now
        const channelGroups: { [key: string]: BenchmarkRule[] } = {};
        prevRules.forEach(rule => {
          if (!channelGroups[rule.channel]) channelGroups[rule.channel] = [];
          channelGroups[rule.channel].push(rule);
        });

        return prevRules.map(rule => {
          const channelRules = channelGroups[rule.channel];
          const effectiveTime = new Date(rule.effectiveTime.replace(' ', 'T'));
          
          // Find the active rule for this channel: the one with the latest effectiveTime that is <= now
          const activeRule = channelRules
            .filter(r => new Date(r.effectiveTime.replace(' ', 'T')) <= now)
            .sort((a, b) => new Date(b.effectiveTime.replace(' ', 'T')).getTime() - new Date(a.effectiveTime.replace(' ', 'T')).getTime())[0];

          return {
            ...rule,
            status: activeRule && rule.id === activeRule.id ? 'active' : 'expired'
          };
        });
      });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [rules.length]);

  const handleCreate = () => {
    setEditingRule({
      channel: channels[0],
      effectiveTime: '',
      cpi: 0,
      cpa7: 0,
      roi7: 0,
      payRate: 0,
      paidUsers: 0,
      newUsersPaid: 0,
      newUsersRecovery: 0
    });
    setIsModalOpen(true);
  };

  const handleCopy = (rule: BenchmarkRule) => {
    const { id, status, modifiedTime, ...rest } = rule;
    setEditingRule({
      ...rest,
      effectiveTime: '' // Clear effective time for the copy
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRule) return;

    // Validation
    const requiredFields: (keyof BenchmarkRule)[] = [
      'channel', 'effectiveTime', 'cpi', 'cpa7', 'roi7', 'payRate', 
      'paidUsers', 'newUsersPaid', 'newUsersRecovery'
    ];
    
    const isAnyEmpty = requiredFields.some(field => {
      const val = editingRule[field as keyof typeof editingRule];
      return val === undefined || val === '' || val === null;
    });

    if (isAnyEmpty) {
      alert('请填写所有必填字段');
      return;
    }

    const effectiveDate = new Date(editingRule.effectiveTime!.replace(' ', 'T'));
    const now = new Date();
    // Set now to start of hour for comparison if needed, but requirement says "today or later"
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (effectiveDate < today) {
      alert('生效时间必须为今天或今天以后的时间');
      return;
    }

    const newRule: BenchmarkRule = {
      ...(editingRule as BenchmarkRule),
      id: Math.random().toString(36).substr(2, 9),
      status: 'expired', // Will be updated by the effect
      modifiedTime: new Date().toLocaleString('zh-CN', { 
        year: 'numeric', month: '2-digit', day: '2-digit', 
        hour: '2-digit', minute: '2-digit', hour12: false 
      }).replace(/\//g, '-')
    };

    setRules([...rules, newRule]);
    setIsModalOpen(false);
    setEditingRule(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Benchmark 管理</h1>
          <p className="text-sm text-slate-500 mt-1">设置不同渠道的投放基准值与生效规则</p>
        </div>
        <button 
          onClick={handleCreate}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
        >
          <Plus className="w-4 h-4" /> 新建规则
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-bottom border-slate-100">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">渠道</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">状态</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">生效时间</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">CPI</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">CPA7</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">ROI7</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">付费率</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">付费用户</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">新增(付费)</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">新增(回收)</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">修改时间</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[...rules].sort((a, b) => {
                const dateA = new Date((a.modifiedTime || '').replace(' ', 'T')).getTime() || 0;
                const dateB = new Date((b.modifiedTime || '').replace(' ', 'T')).getTime() || 0;
                return dateB - dateA;
              }).map((rule) => (
                <tr key={rule.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-slate-900">{rule.channel}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      rule.status === 'active' 
                        ? 'bg-emerald-50 text-emerald-600' 
                        : 'bg-slate-100 text-slate-400'
                    }`}>
                      {rule.status === 'active' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {rule.status === 'active' ? '生效中' : '已失效'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium text-slate-600">{rule.effectiveTime}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-xs font-mono text-slate-600">${rule.cpi.toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-xs font-mono text-slate-600">${rule.cpa7.toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-xs font-mono text-slate-600">{rule.roi7}%</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-xs font-mono text-slate-600">{rule.payRate}%</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-xs font-mono text-slate-600">{rule.paidUsers}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-xs font-mono text-slate-600">{rule.newUsersPaid}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-xs font-mono text-slate-600">{rule.newUsersRecovery}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-medium text-slate-400">{rule.modifiedTime}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleCopy(rule)}
                      className="p-2 text-slate-400 hover:text-primary hover:bg-indigo-50 rounded-lg transition-all"
                      title="复制规则"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-900">新建 Benchmark 规则</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">渠道</label>
                  <select 
                    value={editingRule?.channel}
                    onChange={(e) => setEditingRule({...editingRule, channel: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                  >
                    {channels.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">生效时间 (北京时间)</label>
                  <input 
                    type="datetime-local" 
                    step="3600"
                    value={editingRule?.effectiveTime?.replace(' ', 'T')}
                    onChange={(e) => setEditingRule({...editingRule, effectiveTime: e.target.value.replace('T', ' ')})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">CPI (Float)</label>
                  <input 
                    type="number" step="0.01"
                    value={editingRule?.cpi}
                    onChange={(e) => setEditingRule({...editingRule, cpi: parseFloat(e.target.value)})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">CPA7 (Float)</label>
                  <input 
                    type="number" step="0.01"
                    value={editingRule?.cpa7}
                    onChange={(e) => setEditingRule({...editingRule, cpa7: parseFloat(e.target.value)})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">ROI7 (%)</label>
                  <input 
                    type="number" step="0.1"
                    value={editingRule?.roi7}
                    onChange={(e) => setEditingRule({...editingRule, roi7: parseFloat(e.target.value)})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">付费率 (%)</label>
                  <input 
                    type="number" step="0.1"
                    value={editingRule?.payRate}
                    onChange={(e) => setEditingRule({...editingRule, payRate: parseFloat(e.target.value)})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">付费用户数 (Int)</label>
                  <input 
                    type="number"
                    value={editingRule?.paidUsers}
                    onChange={(e) => setEditingRule({...editingRule, paidUsers: parseInt(e.target.value)})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">新增(付费标准)</label>
                  <input 
                    type="number"
                    value={editingRule?.newUsersPaid}
                    onChange={(e) => setEditingRule({...editingRule, newUsersPaid: parseInt(e.target.value)})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">新增用户数 (回收标准)</label>
                  <input 
                    type="number"
                    value={editingRule?.newUsersRecovery}
                    onChange={(e) => setEditingRule({...editingRule, newUsersRecovery: parseInt(e.target.value)})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-all"
                >
                  取消
                </button>
                <button 
                  type="submit"
                  className="px-8 py-2.5 rounded-xl text-sm font-bold bg-primary text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
                >
                  提交保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Benchmark;
