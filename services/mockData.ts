
import { 
  AdMaterial, AnalysisDimension, ChartDataPoint, PersonnelData, 
  MaterialDetailRow, KeywordAnalysisData, Requirement, BenchmarkRule,
  RequirementReqStatus, RequirementProdStatus, RequirementDeliveryStatus, RequirementPriority,
  CreativeSchedule, CreativeDifficulty, CreativeForm, CreativeScenario, CreativeDirectionType,
  FinishedCreativePerformance, RequirementFeedbackSummary, DirectionFeedbackSummary,
  CreativeFeedbackStatus, CreativeFeedbackNextAction
} from '../types';

// Helper for deterministic random based on seed
const seedRandom = (seed: string) => {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return function() {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h >>> 0) / 4294967296;
  }
};

const getFallbackDateRange = (days = 30) => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - days + 1);
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
};

const normalizeDateRange = (start: string, end: string) => {
  const fallback = getFallbackDateRange();
  return {
    start: start || fallback.start,
    end: end || fallback.end,
  };
};

const getFeedbackStatus = (cpi: number, ir: number, roasD7: number): CreativeFeedbackStatus => {
  if (roasD7 >= 0.85 || (cpi <= 3.2 && ir >= 0.18)) return 'Winner';
  if (roasD7 < 0.35 || cpi >= 8) return 'Failed';
  if (roasD7 < 0.55) return 'Flat';
  return 'Learning';
};

const getNextAction = (status: CreativeFeedbackStatus): CreativeFeedbackNextAction => {
  if (status === 'Winner') return 'Scale';
  if (status === 'Failed') return 'Pause';
  if (status === 'Flat') return 'Iterate';
  return 'Observe';
};

const getFeedbackInsight = (status: CreativeFeedbackStatus, versionName: string): string => {
  if (status === 'Winner') return `${versionName} 已出现放量信号，建议优先扩渠道并保留核心表达。`;
  if (status === 'Failed') return `${versionName} 转化效率偏低，建议暂停或回到需求侧重拆卖点。`;
  if (status === 'Flat') return `${versionName} 数据平平，建议小步迭代 hook、节奏或 CTA。`;
  if (status === 'Paused') return `${versionName} 已暂停，保留复盘记录但不继续观察。`;
  return `${versionName} 仍在学习期，先观察消耗和付费回收趋势。`;
};

export const generateSchedules = (): CreativeSchedule[] => {
  const rng = seedRandom('schedules');
  const owners = ['唐欣怡', '吉意煊', '马嘉良'];
  const priorities: RequirementPriority[] = ['Low', 'Mid', 'High', 'Highest'];
  const difficulties: CreativeDifficulty[] = ['Senior', 'Junior', 'Test'];
  const forms: CreativeForm[] = ['Video', 'Playable', 'Image'];
  const scenarios: CreativeScenario[] = ['Standard', 'Localized', 'ASO'];
  const types: CreativeDirectionType[] = ['Original-Gameplay', 'Original-Hook', 'Scaling-Iteration'];
  const scheduleWeeks = [
    { range: '2026-06-24 ~ 2026-07-01', start: '2026-06-24', end: '2026-07-01', count: 3 },
    { range: '2026-06-17 ~ 2026-06-24', start: '2026-06-17', end: '2026-06-24', count: 3 },
    { range: '2026-06-10 ~ 2026-06-17', start: '2026-06-10', end: '2026-06-17', count: 3 },
    { range: '2026-06-03 ~ 2026-06-10', start: '2026-06-03', end: '2026-06-10', count: 2 },
    { range: '2026-05-27 ~ 2026-06-03', start: '2026-05-27', end: '2026-06-03', count: 2 },
    { range: '2026-05-20 ~ 2026-05-27', start: '2026-05-20', end: '2026-05-27', count: 2 },
    { range: '2026-05-13 ~ 2026-05-20', start: '2026-05-13', end: '2026-05-20', count: 2 },
    { range: '2026-05-06 ~ 2026-05-13', start: '2026-05-06', end: '2026-05-13', count: 1 },
    { range: '2026-04-29 ~ 2026-05-06', start: '2026-04-29', end: '2026-05-06', count: 1 },
    { range: '2026-04-22 ~ 2026-04-29', start: '2026-04-22', end: '2026-04-29', count: 1 },
  ].flatMap((week) => Array.from({ length: week.count }, () => week));

  return scheduleWeeks.map((week, i) => {
    const totalRequiredCount = 4 + Math.floor(rng() * 6);
    const submittedCount = Math.floor(rng() * totalRequiredCount);
    const directionText = ['展示新玩法', '角色互动', '场景融合', '吸量大字报', '3D剧情'][i % 5];
    const directionTagPresets = [
      ['新玩法', '机制验证'],
      ['角色', '互动'],
      ['场景', '融合'],
      ['大字报', '转化'],
      ['3D', '剧情'],
    ];
    const formVal = forms[i % forms.length];
    const weekRange = week.range;
    const reqStart = week.start;
    const reqEnd = week.end;

    const scheduleId = `sched-${i}`;
    const rolloverMeta: Partial<CreativeSchedule> =
      i === 12
        ? {
            inheritedFromScheduleId: 'sched-2',
            inheritanceLabel: '继承自 2026-06-17 ~ 2026-06-24',
            rolloverStatus: 'CarriedOver',
            decisionNote: '延续场景融合方向，优先收口未完成素材。',
          }
        : i === 2
          ? {
              inheritedToScheduleIds: ['sched-12'],
              rolloverStatus: 'PartialCompleted',
              decisionNote: '部分素材结转到 2026-06-03 周期继续推进。',
            }
          : i === 16
            ? {
                rolloverStatus: 'Deferred',
                decisionNote: '等待新素材素材包后恢复。',
              }
            : i === 17
              ? {
                  rolloverStatus: 'Closed',
                  closePermissionRole: 'Owner',
                  closeReason: '方向验证价值不足，本周期关闭。',
                }
              : { rolloverStatus: 'None' };

    return {
      id: scheduleId,
      weekRange,
      directionName: `方向${i + 1}: ${directionText}`,
      priority: priorities[Math.floor(rng() * priorities.length)],
      difficulty: difficulties[Math.floor(rng() * difficulties.length)],
      form: formVal,
      scenario: scenarios[Math.floor(rng() * scenarios.length)],
      directionType: types[Math.floor(rng() * types.length)],
      validCount: Math.floor(submittedCount * 0.8),
      totalRequiredCount,
      submittedCount,
      owner: owners[Math.floor(rng() * owners.length)],
      requirementStart: reqStart,
      requirementEnd: reqEnd,
      productionEnd: reqEnd,
      validationGoal: `验证${directionText}转化表现与Cvr`,
      directionTags: directionTagPresets[i % directionTagPresets.length],
      broadDirection: (i % 5 === 3 ? '大字报' : i % 5 === 4 ? '3D玩法' : '原始玩法') as any,
      materialStage: (i % 3 === 0 ? '新' : i % 3 === 1 ? '老' : '迭') as any,
      channels: [i % 2 === 0 ? 'all' : 'fb'],
      campaign: `global_android_cam_${100 + i}`,
      submissionDeadline: reqEnd,
      acceptanceDate: reqStart,
      ...rolloverMeta,
    };
  });
};

export const generateRequirements = (): Requirement[] => {
  const rng = seedRandom('requirements');
  const schedules = generateSchedules();
  const reqStatuses: RequirementReqStatus[] = ['Approved', 'Pending', 'Draft', 'Modification'];
  const prodStatuses: RequirementProdStatus[] = ['Scheduled', 'InProgress', 'Completed'];
  const deliveryStatuses: RequirementDeliveryStatus[] = ['NotLaunched', 'Delivering', 'Paused'];
  const priorities: RequirementPriority[] = ['Low', 'Mid', 'High', 'Highest'];
  const creators = ['唐欣怡', '吉意煊', '马嘉良'];
  const producers = ['张欢', '吴楠', '曲冬丽', '刘洋', '孙崇洋', '张永进'];
  const materialStages: ('新' | '老' | '迭')[] = ['新', '老', '迭'];
  const broadDirections: ('大字报' | '原始玩法' | '3D玩法')[] = ['大字报', '原始玩法', '3D玩法'];
  const languages = ['en', 'zh', 'jp', 'kr'];
  const channels = ['all', 'apl', 'fb', 'uac'];
  const testStatuses: ('待测试' | '测试中' | '数据合格' | '不达标')[] = ['待测试', '测试中', '数据合格', '不达标'];

  const buildRequirement = ({
    index,
    assetIndex,
    assetVersion,
    scheduleId,
    parentId,
  }: {
    index: number;
    assetIndex: number;
    assetVersion: string;
    scheduleId: string;
    parentId?: string;
  }): Requirement => {
    const typeVal: CreativeForm = index % 3 === 0 ? 'Playable' : index % 3 === 1 ? 'Video' : 'Image';
    const producerStart = Math.floor(rng() * producers.length);
    const productionPersonnel = Array.from(
      new Set([
        producers[producerStart],
        ...(index % 4 === 0 ? [producers[(producerStart + 1) % producers.length]] : []),
        ...(index % 7 === 0 ? [producers[(producerStart + 2) % producers.length]] : []),
      ]),
    );
    const channelStart = Math.floor(rng() * channels.length);
    const syncedChannels = Array.from(
      new Set([
        channels[channelStart],
        ...(index % 3 === 0 ? [channels[(channelStart + 1) % channels.length]] : []),
        ...(index % 5 === 0 ? [channels[(channelStart + 2) % channels.length]] : []),
      ]),
    );
    const prodStatus: RequirementProdStatus =
      scheduleId === 'sched-14'
        ? 'Completed'
        : scheduleId === 'sched-12'
          ? (index % 5 === 0 ? 'Completed' : index % 2 === 0 ? 'InProgress' : 'Scheduled')
          : prodStatuses[Math.floor(rng() * prodStatuses.length)];
    const deliveryStatus: RequirementDeliveryStatus =
      prodStatus === 'Completed'
        ? scheduleId === 'sched-14'
          ? 'NotLaunched'
          : deliveryStatuses[Math.floor(rng() * deliveryStatuses.length)]
        : 'NotLaunched';

    return {
      id: `cp${assetIndex}-${assetVersion}`,
      parentId,
      parentRequirementId: parentId,
      name: index % 2 === 0 ? '新玩法A段神好奇物合' : '精灵王子变 (蛇)',
      assetType: typeVal,
      assetIndex,
      assetVersion,
      projectName: 'Panthia',
      previews: [`https://picsum.photos/100/100?random=${index}`, `https://picsum.photos/100/100?random=${index+100}`],
      broadDirection: broadDirections[Math.floor(rng() * broadDirections.length)],
      materialStage: materialStages[Math.floor(rng() * materialStages.length)],
      creativePersonnel: creators[Math.floor(rng() * creators.length)],
      productionPersonnel,
      language: languages[Math.floor(rng() * languages.length)],
      channels: syncedChannels,
      testDirections: ['前贴', '奖励'],
      dimensions: ['9:16'],
      testStatus: typeVal === 'Playable' ? testStatuses[Math.floor(rng() * testStatuses.length)] : undefined,
      
      duration: index % 4 === 0 ? '0:48' : '0:36',
      goal: '新玩法A段神奇动物合',
      template: 'A+B',
      has3DPlot: rng() > 0.5,
      direction: '拼接-新A',
      owner: creators[Math.floor(rng() * creators.length)],
      
      priority: priorities[Math.floor(rng() * priorities.length)],
      scheduleId,
      reqStatus: reqStatuses[Math.floor(rng() * reqStatuses.length)],
      prodStatus,
      deliveryStatus,
      status: 'Approved',
      rating: Math.floor(rng() * 3),
      createdAt: '2025-12-16 16:43:47',
      completedAt: index % 3 === 0 ? '2025-12-20 10:30:00' : undefined,
      startDate: index % 4 === 0 ? '2026-06-22' : index % 4 === 1 ? '2026-06-23' : '2026-06-24',
      endDate: index % 6 === 0 ? '2026-06-23' : index % 5 === 0 ? '2026-06-24' : index % 4 === 0 ? '2026-06-25' : '2026-06-30',
      description: '在仙子举牌里播放地面钥匙组合，从第19秒开始，配合仙子说卖点，接重大通知'
    };
  };

  const sched12VersionPlan = [
    { assetIndex: 3376, versions: ['01', '02', '03', '04'] },
    { assetIndex: 3375, versions: ['01', '02', '03'] },
    { assetIndex: 3374, versions: ['01', '02', '03'] },
    { assetIndex: 3373, versions: ['01', '02', '03', '04'] },
    { assetIndex: 3372, versions: ['01', '02', '03'] },
    { assetIndex: 3371, versions: ['01', '02', '03'] },
  ];
  let directionRequirementsSeedIndex = 0;
  const directionRequirements = sched12VersionPlan.flatMap((group) =>
    group.versions.map((version) => {
      const parentId = version === '01' ? undefined : `cp${group.assetIndex}-01`;
      return buildRequirement({
        index: directionRequirementsSeedIndex++,
        assetIndex: group.assetIndex,
        assetVersion: version,
        scheduleId: 'sched-12',
        parentId,
      });
    }),
  );

  const otherRequirements = Array.from({ length: 18 }).map((_, i) => {
    const fallbackSchedules = schedules.filter((schedule) => schedule.id !== 'sched-12');
    const scheduleId =
      i <= 2
        ? 'sched-2'
        : i <= 4
          ? 'sched-14'
          : i === 5
            ? 'sched-4'
            : i === 6
              ? 'sched-5'
              : fallbackSchedules[Math.floor(rng() * fallbackSchedules.length)].id;
    return buildRequirement({
      index: i + directionRequirements.length,
      assetIndex: 3368 - i,
      assetVersion: '01',
      scheduleId,
    });
  });

  return [...directionRequirements, ...otherRequirements];
};

export const generateFinishedCreativePerformance = (
  requirements: Requirement[],
): FinishedCreativePerformance[] => {
  return requirements.flatMap((requirement, requirementIndex) => {
    const versions = requirement.subVersions?.length
      ? requirement.subVersions
      : [{ version: requirement.assetVersion || '01', name: requirement.name, testDirections: requirement.testDirections || [] }];

    return versions.slice(0, 3).map((version, versionIndex) => {
      const spent = 1200 + requirementIndex * 260 + versionIndex * 420;
      const impressions = 48000 + requirementIndex * 3200 + versionIndex * 5400;
      const installs = Math.max(80, Math.round(spent / (2.8 + ((requirementIndex + versionIndex) % 5))));
      const paidUsers = Math.max(4, Math.round(installs * (0.08 + ((requirementIndex + versionIndex) % 4) * 0.035)));
      const cpi = Number((spent / installs).toFixed(2));
      const cpa = Number((spent / paidUsers).toFixed(2));
      const ctr = Number((0.85 + ((requirementIndex + versionIndex) % 6) * 0.18).toFixed(2));
      const cvr = Number((8.5 + ((requirementIndex + versionIndex) % 5) * 1.6).toFixed(2));
      const ir = Number((paidUsers / installs).toFixed(3));
      const cpm = Number(((spent / impressions) * 1000).toFixed(2));
      const roasD7 = Number((0.32 + ((requirementIndex + versionIndex) % 7) * 0.11).toFixed(2));
      const status = getFeedbackStatus(cpi, ir, roasD7);
      const versionName = version.name || `版本 ${version.version}`;
      const previewCount = Math.max(requirement.previews?.length || 0, 1);

      return {
        id: `fc-${requirement.id}-${version.version}`,
        requirementId: requirement.id,
        scheduleId: requirement.scheduleId,
        version: version.version,
        versionName,
        creativeName: `${requirement.name} / ${versionName}`,
        thumbnail: requirement.previews?.[versionIndex % previewCount] || `https://picsum.photos/seed/${requirement.id}-${version.version}/320/568`,
        channel: requirement.channels?.[versionIndex % Math.max(requirement.channels.length, 1)] || 'all',
        country: ['US', 'JP', 'KR', 'TW'][versionIndex % 4],
        language: requirement.language || 'EN',
        ratio: requirement.assetType === 'Image' ? '1:1' : '9:16',
        launchedAt: `2026-05-${String(12 + ((requirementIndex + versionIndex) % 15)).padStart(2, '0')}`,
        daysRunning: 2 + ((requirementIndex + versionIndex) % 12),
        spent,
        impressions,
        installs,
        paidUsers,
        cpm,
        cpi,
        cpa,
        ctr,
        cvr,
        ir,
        roasD7,
        status,
        insight: getFeedbackInsight(status, versionName),
        nextAction: getNextAction(status),
      };
    });
  });
};

export const summarizeRequirementFeedback = (
  performances: FinishedCreativePerformance[],
): RequirementFeedbackSummary[] => {
  const grouped = performances.reduce<Record<string, FinishedCreativePerformance[]>>((acc, item) => {
    acc[item.requirementId] = [...(acc[item.requirementId] || []), item];
    return acc;
  }, {});

  return Object.entries(grouped).map(([requirementId, items]) => {
    const best = [...items].sort((a, b) => b.roasD7 - a.roasD7 || a.cpi - b.cpi)[0];
    const totalSpent = items.reduce((sum, item) => sum + item.spent, 0);
    const totalInstalls = items.reduce((sum, item) => sum + item.installs, 0);

    return {
      requirementId,
      totalSpent,
      totalInstalls,
      bestVersion: best?.version,
      bestChannel: best?.channel,
      status: best?.status || 'Learning',
      insight: best?.insight || '暂无投放数据，等待成片上线后回流。',
      nextAction: best?.nextAction || 'Observe',
    };
  });
};

export const summarizeDirectionFeedback = (
  performances: FinishedCreativePerformance[],
): DirectionFeedbackSummary[] => {
  const grouped = performances.reduce<Record<string, FinishedCreativePerformance[]>>((acc, item) => {
    if (!item.scheduleId) return acc;
    acc[item.scheduleId] = [...(acc[item.scheduleId] || []), item];
    return acc;
  }, {});

  return Object.entries(grouped).map(([scheduleId, items]) => {
    const totalSpent = items.reduce((sum, item) => sum + item.spent, 0);
    const totalInstalls = items.reduce((sum, item) => sum + item.installs, 0);
    const winnerCount = items.filter((item) => item.status === 'Winner').length;
    const failedCount = items.filter((item) => item.status === 'Failed').length;
    const avgCpi = totalInstalls > 0 ? Number((totalSpent / totalInstalls).toFixed(2)) : 0;
    const avgCpa = Number((items.reduce((sum, item) => sum + item.cpa, 0) / items.length).toFixed(2));
    const avgIr = Number((items.reduce((sum, item) => sum + item.ir, 0) / items.length).toFixed(3));
    const status: CreativeFeedbackStatus = winnerCount > 0 ? 'Winner' : failedCount >= Math.ceil(items.length / 2) ? 'Failed' : 'Learning';

    return {
      scheduleId,
      requirementCount: new Set(items.map((item) => item.requirementId)).size,
      launchedCreativeCount: items.length,
      totalSpent,
      totalInstalls,
      winnerCount,
      failedCount,
      avgCpi,
      avgCpa,
      avgIr,
      status,
      insight: status === 'Winner'
        ? '该方向已有可放量版本，建议复盘共性表达并继续扩量。'
        : status === 'Failed'
          ? '该方向多数版本未达标，建议回到方向假设重新拆解。'
          : '该方向仍在观察期，继续积累版本和渠道表现。',
    };
  });
};

export interface OverviewMetric {
  label: string;
  value: number;
  format: 'currency' | 'percent' | 'number';
  trend: number;
  history: { date: string; value: number }[];
}

export const generateOverviewData = (
  launchStart: string, 
  launchEnd: string,
  spendStart: string,
  spendEnd: string,
  language: string = 'all',
  channel: string = 'all'
) => {
  const rng = seedRandom(launchStart + launchEnd + spendStart + spendEnd + language + channel);
  const rngTotalCost = seedRandom(spendStart + spendEnd + language + channel);
  const sDate = new Date(spendStart);
  const eDate = new Date(spendEnd);
  const diffTime = Math.abs(eDate.getTime() - sDate.getTime());
  const days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);
  let volumeModifier = 1.0;
  if (language === 'en') volumeModifier *= 0.6;
  if (language === 'localized') volumeModifier *= 0.4;
  if (channel !== 'all') volumeModifier *= 0.3;
  const createMetric = (
    label: string, 
    baseValue: number, 
    format: 'currency' | 'percent' | 'number',
    volatility: number,
    customRng?: () => number
  ): OverviewMetric => {
    const useRng = customRng || rng;
    const dailyHistory: { date: string; value: number }[] = [];
    let adjustedBase = baseValue;
    if (format !== 'percent') { adjustedBase = baseValue * volumeModifier; }
    let dailyBase = adjustedBase;
    if (format !== 'percent') { dailyBase = adjustedBase / Math.max(1, days); }
    for (let i = 0; i < days; i++) {
        const d = new Date(sDate);
        d.setDate(d.getDate() + i);
        const dateStr = d.toISOString().slice(0, 10);
        const noise = (useRng() - 0.5) * volatility;
        const spike = useRng() > 0.92 ? (useRng() * 1.5) : 0;
        let val = dailyBase * (1 + noise + spike);
        val = Math.max(0, val);
        dailyHistory.push({ date: dateStr, value: val });
    }
    const mid = Math.floor(dailyHistory.length / 2);
    const recentSum = dailyHistory.slice(mid).reduce((acc, c) => acc + c.value, 0);
    const oldSum = dailyHistory.slice(0, mid).reduce((acc, c) => acc + c.value, 0);
    const trend = oldSum > 0 ? ((recentSum - oldSum) / oldSum) * 100 : 0;
    const totalValue = format === 'percent' ? dailyHistory.reduce((acc, c) => acc + c.value, 0) / days : dailyHistory.reduce((acc, c) => acc + c.value, 0);
    return { label, value: totalValue, format, trend, history: dailyHistory };
  };
  const totalCostVal = 450000;
  const newCostVal = totalCostVal * (0.3 + rng() * 0.2); 
  const totalCountVal = 850;
  const successCountVal = totalCountVal * (0.05 + rng() * 0.1); 
  return {
    totalCost: createMetric('素材总花费', totalCostVal, 'currency', 0.8, rngTotalCost),
    newCost: createMetric('新素材总花费', newCostVal, 'currency', 0.9),
    newCostShare: createMetric('新素材花费占比', (newCostVal/totalCostVal) * 100, 'percent', 0.2),
    totalCount: createMetric('素材总量', totalCountVal, 'number', 0.5),
    successCount: createMetric('素材成功量', successCountVal, 'number', 0.7),
    successCost: createMetric('成功素材总花费', totalCostVal * (0.4 + rng() * 0.1), 'currency', 0.6),
    successRate: createMetric('素材成功率', (successCountVal/totalCountVal) * 100, 'percent', 0.4),
  };
};

export const generateTopMaterials = (launchStart: string, launchEnd: string, channel: string = 'all'): AdMaterial[] => {
  const launchRange = normalizeDateRange(launchStart, launchEnd);
  const rng = seedRandom(launchRange.start + launchRange.end + channel); 
  const creators = ['苏雅', '顺子', '雅萱', '苗雪'];
  const data: AdMaterial[] = [];
  const langs = ['EN', 'ZH', 'JP', 'KR', 'DE'];
  const goodCount = Math.floor(rng() * 3) + 8;
  const sTime = new Date(launchRange.start).getTime();
  const eTime = new Date(launchRange.end).getTime(); 
  for (let i = 0; i < goodCount; i++) {
    const cost = Math.floor(rng() * 50000) + 10000;
    const liveCost = Math.floor(cost * (0.6 + rng() * 0.3)); 
    const randTime = sTime + Math.random() * (eTime - sTime);
    const launchDate = new Date(randTime).toISOString().slice(0, 10);
    data.push({
      id: `good-${i}`,
      name: `Core_Gameplay_Var_${i + 1}_Win`,
      thumbnail: `https://picsum.photos/270/480?random=${Math.floor(rng() * 1000) + i}`,
      cost: cost,
      creator: creators[i % creators.length],
      launchDate: launchDate,
      daysRunning: Math.floor(rng() * 30) + 10,
      tags: ['High ROI', '3D', 'Action'],
      description: 'High intensity action sequence with immediate CTA.',
      isGood: true,
      isPlot: rng() > 0.5,
      result: rng() > 0.8 ? 'Big Win' : 'Win',
      liveCampCost: liveCost,
      liveCampShare: Math.floor((liveCost / cost) * 100),
      language: langs[Math.floor(rng() * langs.length)]
    });
  }
  for (let i = 0; i < 4; i++) {
    const cost = Math.floor(rng() * 5000) + 500;
    const randTime = sTime + Math.random() * (eTime - sTime);
    const launchDate = new Date(randTime).toISOString().slice(0, 10);
    data.push({
      id: `bad-${i}`,
      name: `Static_Test_Fail_${i}`,
      thumbnail: `https://picsum.photos/270/480?random=${Math.floor(rng() * 1000) + 10 + i}`,
      cost: cost,
      creator: creators[i % creators.length],
      launchDate: launchDate,
      daysRunning: Math.floor(rng() * 5) + 1,
      tags: ['Static', 'Low CTR'],
      description: 'Static image with text overlay, low engagement.',
      isGood: false,
      isPlot: false,
      result: 'Fail',
      liveCampCost: cost,
      liveCampShare: 100,
      language: langs[Math.floor(rng() * langs.length)]
    });
  }
  return data;
};

const getDimensionCategories = (dimension: AnalysisDimension): string[] => {
  switch (dimension) {
    case AnalysisDimension.DIRECTION: return ['拼接-已有', '拼接-新A', '迭代', '自由发挥'];
    case AnalysisDimension.PLOT_3D: return ['包含3D剧情', '不含3D剧情'];
    case AnalysisDimension.GAMEPLAY_TYPE: return ['原始3合', '非原始三合', '其他玩法'];
    case AnalysisDimension.GAMEPLAY_CORE: return ['资源获取', '成长', '探索', '找物', '开图', '其他'];
    case AnalysisDimension.VOICEOVER: return ['口播形象', '口播声线'];
    case AnalysisDimension.COPYWRITING: return ['卖点', 'Boss文案', '奖励真金诱导', '身份认同', '解说', '其他'];
    case AnalysisDimension.SECTION_A: return ['大字报', '3D剧情', '3D片头', '真人口播', '玩法', '选择题'];
    case AnalysisDimension.SECTION_B: return ['大字报', '3D剧情玩法', '真人口播', '玩法', '其他'];
    case AnalysisDimension.STRUCTURE: return ['B', 'A+B', 'B+A', 'A+A+B', '其他'];
    default: return ['Type A', 'Type B', 'Type C'];
  }
};

export const generateCreativeAnalysisData = (
  dimensions: AnalysisDimension[],
  launchStart: string,
  launchEnd: string,
  spendStart: string,
  spendEnd: string,
  language: string = 'all',
  channel: string = 'all'
): { data: ChartDataPoint[], subKeys: string[] } => {
  const rng = seedRandom(dimensions.join('') + launchStart + launchEnd + spendStart + spendEnd + language + channel);
  const primaryDim = dimensions[0];
  const secondaryDim = dimensions[1]; 
  const primaryCats = getDimensionCategories(primaryDim);
  const secondaryCats = secondaryDim ? getDimensionCategories(secondaryDim) : [];
  let volumeModifier = 1.0;
  if (language === 'en') volumeModifier *= 0.6;
  if (language === 'localized') volumeModifier *= 0.4;
  if (channel !== 'all') volumeModifier *= 0.5;
  const data = primaryCats.map(pCat => {
    const row: any = { name: pCat };
    const baseTotalCost = (Math.floor(rng() * 100000) + 20000) * volumeModifier;
    const baseCount = (Math.floor(rng() * 200) + 20) * volumeModifier;
    if (secondaryDim && secondaryCats.length > 0) {
      let totalCostAccum = 0;
      let totalCountAccum = 0;
      let totalPayersAccum = 0;
      secondaryCats.forEach(sCat => {
        const factor = rng(); 
        const subCost = Math.floor((baseTotalCost / secondaryCats.length) * (0.5 + factor));
        const subCount = Math.floor((baseCount / secondaryCats.length) * (0.5 + factor));
        const subAvgCost = Math.floor(subCost / (subCount || 1)); 
        const subCPM = Math.floor(rng() * 20) + 5;
        const subCPI = Math.floor(rng() * 10) + 2;
        const subPayers = Math.floor(subCount * rng() * 0.3); 
        const subAvgPayers = Math.floor(rng() * 50);
        row[`${sCat}_totalCost`] = subCost;
        row[`${sCat}_count`] = subCount;
        row[`${sCat}_avgCost`] = subAvgCost; 
        row[`${sCat}_avgCPM`] = subCPM;
        row[`${sCat}_avgCPI`] = subCPI;
        row[`${sCat}_totalPayers`] = subPayers;
        row[`${sCat}_avgPayers`] = subAvgPayers;
        row[`${sCat}_countShare`] = Math.floor(rng() * 30);
        row[`${sCat}_successRate`] = Math.floor(rng() * 15);
        totalCostAccum += subCost;
        totalCountAccum += subCount;
        totalPayersAccum += subPayers;
      });
      row.totalCost = totalCostAccum;
      row.count = totalCountAccum;
      row.totalPayers = totalPayersAccum;
      row.avgCost = Math.floor(totalCostAccum / (totalCountAccum || 1));
      row.avgCPM = Math.floor(rng() * 20) + 5;
      row.avgCPI = Math.floor(rng() * 10) + 2;
      row.payerRate = parseFloat(((totalPayersAccum / (totalCountAccum || 1)) * 100).toFixed(1));
      row.costShare = Math.floor(rng() * 40);
      row.countShare = Math.floor(rng() * 30);
      row.successRate = Math.floor(rng() * 15);
      row.avgPayers = Math.floor(totalPayersAccum / (secondaryCats.length || 1)); 
    } else {
      row.totalCost = baseTotalCost;
      row.count = baseCount;
      row.costShare = Math.floor(rng() * 40);
      row.avgCost = Math.floor(baseTotalCost / baseCount);
      row.avgCPM = Math.floor(rng() * 20) + 5;
      row.avgCPI = Math.floor(rng() * 10) + 2;
      row.totalPayers = Math.floor(baseCount * 0.15); 
      row.payerRate = 15;
      row.avgPayers = Math.floor(rng() * 50);
      row.countShare = Math.floor(rng() * 30);
      row.successRate = Math.floor(rng() * 15);
    }
    return row;
  });
  return { data, subKeys: secondaryCats };
};

export const generateMaterialDetails = (
  launchStart: string,
  launchEnd: string,
  spendStart: string,
  spendEnd: string,
  language: string = 'all',
  channel: string = 'all'
): MaterialDetailRow[] => {
  const launchRange = normalizeDateRange(launchStart, launchEnd);
  const rng = seedRandom(launchRange.start + launchRange.end + spendStart + spendEnd + language + channel);
  const directions = ['拼接-新A', '3D-剧情', '口播-真人', '实录-混剪'];
  const owners = ['mx', 'sy', 'sz', 'yx'];
  let allowedLangs = ['en', 'zh', 'jp', 'kr'];
  if (language === 'en') allowedLangs = ['en'];
  if (language === 'localized') allowedLangs = ['zh', 'jp', 'kr'];
  const rows: MaterialDetailRow[] = [];
  const sLaunch = new Date(launchRange.start).getTime();
  const eLaunch = new Date(launchRange.end).getTime();
  const launchDuration = Math.max(1, (eLaunch - sLaunch) / (1000 * 3600 * 24));
  const count = Math.min(100, Math.floor(launchDuration / 2) + 10); 
  const sSpend = new Date(spendStart).getTime();
  const eSpend = new Date(spendEnd).getTime();
  const spendDuration = Math.max(1, (eSpend - sSpend) / (1000 * 3600 * 24));
  const spendMultiplier = spendDuration / 30; 
  for (let i = 0; i < count; i++) {
    const randTime = sLaunch + rng() * (eLaunch - sLaunch);
    const dateStr = new Date(randTime).toISOString().slice(0, 10);
    const cost = Math.floor((rng() * 500 + 50) * spendMultiplier);
    const lang = allowedLangs[Math.floor(rng() * allowedLangs.length)];
    rows.push({
      id: `mat-${i}`,
      date: dateStr,
      thumbnail: `https://picsum.photos/200/355?random=${Math.floor(rng() * 1000) + i}`,
      title: `cp947-apanthia-mx-${lang}-629接大字报-版本二(9×16)_${i}.mp4`,
      direction: directions[Math.floor(rng() * directions.length)],
      language: lang,
      owner: owners[Math.floor(rng() * owners.length)],
      cost: cost,
      costRatio: Math.floor(rng() * 100),
      cpm: Math.floor(rng() * 20) + 10,
      cpi: Math.floor(rng() * 5) + 1,
      ctr: parseFloat((rng() * 2).toFixed(2)),
      cvr: parseFloat((rng() * 5).toFixed(2)),
      roas: parseFloat((rng() * 1).toFixed(2)),
      installs: Math.floor(rng() * 200 * spendMultiplier),
      payingUsers: Math.floor(rng() * 20 * spendMultiplier),
      diffHighestCost: 123,
      diffAvgCost: 123
    });
  }
  return rows;
};

export const generatePersonnelData = (
  launchStart: string,
  launchEnd: string,
  spendStart: string,
  spendEnd: string,
  language: string = 'all',
  channel: string = 'all'
): PersonnelData[] => {
  const rng = seedRandom(launchStart + launchEnd + spendStart + spendEnd + language + channel);
  const sSpend = new Date(spendStart).getTime();
  const eSpend = new Date(spendEnd).getTime();
  const spendDays = Math.max(1, (eSpend - sSpend) / (1000 * 3600 * 24));
  const multiplier = spendDays / 30; 
  let volMod = 1.0;
  if (language === 'en') volMod *= 0.6;
  if (language === 'localized') volMod *= 0.4;
  if (channel !== 'all') volMod *= 0.5;
  const baseData = [
    { name: '苏雅', baseHigh: 42, baseRate: 5.8, baseCost: 154000 },
    { name: '顺子', baseHigh: 35, baseRate: 4.2, baseCost: 98000 },
    { name: '雅萱', baseHigh: 58, baseRate: 6.5, baseCost: 210000 },
    { name: '苗雪', baseHigh: 28, baseRate: 3.8, baseCost: 82000 },
  ];
  const totalCost = baseData.reduce((acc, curr) => acc + curr.baseCost, 0);
  return baseData.map(p => {
    const variability = 0.9 + (rng() * 0.2); 
    const adjustedCost = Math.floor(p.baseCost * multiplier * variability * volMod);
    const share = ((adjustedCost / (totalCost * multiplier * variability * volMod)) * 100);
    const rate = parseFloat((p.baseRate * variability).toFixed(2));
    const count = Math.floor((p.baseHigh * multiplier * variability * volMod) * 2.5); 
    const avgCost = Math.floor(adjustedCost / (count || 1));
    const efficiencyScore = Math.min(100, Math.floor((rate * 20000) / avgCost)); 
    return {
      name: p.name,
      costHigh: Math.floor(p.baseHigh * multiplier * variability * volMod),
      successRate: rate,
      successCost: adjustedCost,
      successCostShare: parseFloat(share.toFixed(2)),
      totalMaterialCount: count,
      avgMaterialCost: avgCost,
      efficiencyScore: efficiencyScore
    };
  });
};

export const generatePersonnelHistory = (
    launchStart: string,
    launchEnd: string,
    spendStart: string,
    spendEnd: string,
    language: string = 'all',
    channel: string = 'all'
) => {
  const rng = seedRandom(launchStart + launchEnd + spendStart + spendEnd + language + channel + 'history');
  const personnel = ['苏雅', '顺子', '雅萱', '苗雪'];
  const history = [];
  const sSpend = new Date(spendStart);
  const eSpend = new Date(spendEnd);
  const spendDays = Math.max(1, Math.ceil((eSpend.getTime() - sSpend.getTime()) / (1000 * 3600 * 24))) + 1;
  const step = spendDays <= 31 ? 1 : spendDays <= 90 ? 3 : 7;
  let prevValues: any = {};
  personnel.forEach(name => {
      prevValues[name] = {
          cost: name === '雅萱' ? 5000 : name === '苏雅' ? 4000 : 2500,
          rate: name === '苏雅' ? 6 : name === '雅萱' ? 5.5 : 4
      }
  });
  for (let i = 0; i < spendDays; i += step) {
    const d = new Date(sSpend);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);
    const point: any = { date: dateStr };
    let dailyTotalCost = 0;
    personnel.forEach(name => {
      const change = (rng() - 0.5) * 0.4;
      let newCost = prevValues[name].cost * (1 + change);
      let newRate = prevValues[name].rate * (1 + (change * 0.5)); 
      newCost = Math.max(500, newCost);
      newRate = Math.max(1, Math.min(10, newRate));
      if (rng() > 0.95) newCost *= 1.3;
      prevValues[name] = { cost: newCost, rate: newRate };
      point[`${name}_successCost`] = Math.floor(newCost);
      point[`${name}_successRate`] = parseFloat(newRate.toFixed(2));
      point[`${name}_costHigh`] = Math.floor(newCost / 500); 
      dailyTotalCost += newCost;
    });
    personnel.forEach(name => {
      const cost = point[`${name}_successCost`];
      const share = dailyTotalCost > 0 ? (cost / dailyTotalCost) * 100 : 0;
      point[`${name}_successCostShare`] = parseFloat(share.toFixed(2));
    });
    history.push(point);
  }
  return history;
};

export const generateBenchmarkData = (): BenchmarkRule[] => {
  return [
    {
      id: 'all_android',
      channel: 'All',
      platform: 'Android',
      status: 'active',
      effectiveTime: '2026-06-11 00:00',
      cpi: 30.0,
      cpa7: 300.0,
      roi7: 5.0,
      payRate: 10.0,
      paidUsers: 5,
      arppu7: 20.0,
      newUsersPaid: 20,
      newUsersRecovery: 50,
      modifiedTime: '2026-06-11 00:00'
    },
    {
      id: 'all_ios',
      channel: 'All',
      platform: 'iOS',
      status: 'active',
      effectiveTime: '2026-06-11 00:00',
      cpi: 30.0,
      cpa7: 450.0,
      roi7: 5.0,
      payRate: 10.0,
      paidUsers: 5,
      arppu7: 30.0,
      newUsersPaid: 20,
      newUsersRecovery: 50,
      modifiedTime: '2026-06-11 00:00'
    },
    {
      id: 'applovin_int_all',
      channel: 'applovin_int',
      platform: '全部',
      status: 'active',
      effectiveTime: '2026-06-03 00:00',
      cpi: 30.0,
      cpa7: 300.0,
      roi7: 5.0,
      payRate: 10.0,
      paidUsers: 5,
      arppu7: null,
      newUsersPaid: 20,
      newUsersRecovery: 50,
      modifiedTime: '2026-06-03 00:00'
    }
  ];
};

export const mockKeywordAnalysis: KeywordAnalysisData = {
  positiveTags: [
    { name: "Boss Battle", score: 95 },
    { name: "High Damage", score: 88 },
    { name: "Gacha Pull", score: 82 },
    { name: "Character Reveal", score: 78 },
    { name: "ASMR", score: 75 }
  ],
  negativeTags: [
    { name: "Long Tutorial", score: 20 },
    { name: "Static Image", score: 15 },
    { name: "Complex UI", score: 25 },
    { name: "Slow Pacing", score: 10 }
  ],
  summary: "本月 \"Boss Battle\" 类素材表现优异，建议加大投放。避免使用 \"Long Tutorial\" 结构，用户流失率较高。"
};
