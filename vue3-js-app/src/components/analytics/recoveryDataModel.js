import { generateBenchmarkData } from '../../services/mockData';
import { MONTHLY_ANALYTICS_ROWS } from '../../services/monthlyAnalyticsData';
export const channels = ['Applovin', 'Google', 'Facebook', 'Adjoe', 'Moloco', 'Unity'];
export const platforms = ['Android', 'iOS'];
export const languages = ['EN', 'JA', 'KO', 'DE'];
const materialTypes = ['video', 'playable', 'image'];
export const buildMockSets = () => MONTHLY_ANALYTICS_ROWS.map((row, index) => ({
    id: row.id,
    channel: row.channel,
    platform: row.platform,
    language: row.language,
    campaign: row.campaignName,
    setName: row.creativeSet,
    launchTime: row.launchTime,
    direction: row.direction,
    impressions: row.impressions,
    clicks: row.clicks,
    installs: row.installs,
    spend: row.spend,
    d7PaidUsers: row.d7PaidUsers,
    d7TotalRev: Math.round(row.spend * row.d7Roas / 100),
    d7IapRev: row.d7IapRev,
    d7Ret: row.d7Ret,
    materials: [
        {
            id: row.materialId,
            name: row.materialName,
            contentId: row.contentId,
            previewUrl: row.thumbnail,
            spend: row.spend,
            impressions: row.impressions,
            clicks: row.clicks,
            type: row.materialType,
        },
        {
            id: `${row.materialId}-b`,
            name: `${row.materialName}-拓展素材`,
            contentId: `${row.contentId}_b`,
            previewUrl: row.thumbnail,
            spend: Math.round(row.spend * (0.12 + (index % 3) * 0.04)),
            impressions: Math.round(row.impressions * (0.12 + (index % 3) * 0.04)),
            clicks: Math.round(row.clicks * (0.12 + (index % 3) * 0.04)),
            type: materialTypes[(index + 1) % materialTypes.length],
        },
    ],
}));
export const INITIAL_COLUMNS = [
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
export const metricHelp = {
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
export const getMetrics = (row) => {
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
export const getSortValue = (row, key) => {
    const metrics = getMetrics(row);
    if (key in metrics)
        return metrics[key];
    if (key === 'preview')
        return row.materials[0]?.spend ?? 0;
    return row[key];
};
export const normalizeBenchmarkChannel = (channel) => {
    const normalized = channel.toLowerCase().replace(/\s+/g, '');
    if (normalized === 'applovin')
        return 'applovin_int';
    return normalized;
};
export const normalizeBenchmarkPlatform = (platform) => platform.toLowerCase();
export const getActiveBenchmarkRules = () => {
    const now = new Date();
    return generateBenchmarkData().reduce((rules, rule) => {
        const effectiveTime = new Date(rule.effectiveTime.replace(' ', 'T'));
        if (effectiveTime > now)
            return rules;
        const key = `${normalizeBenchmarkChannel(rule.channel)}__${normalizeBenchmarkPlatform(rule.platform)}`;
        const current = rules[key];
        if (!current || new Date(rule.effectiveTime.replace(' ', 'T')) > new Date(current.effectiveTime.replace(' ', 'T'))) {
            rules[key] = rule;
        }
        return rules;
    }, {});
};
export const getBenchmarkCellClassName = (metric, value, benchmark) => {
    switch (metric) {
        case 'cpi':
            return value <= benchmark.cpi ? 'bg-emerald-50 text-emerald-700 font-black' : 'bg-rose-50 text-rose-700 font-black';
        case 'd7Cpa':
            return value <= benchmark.cpa7 ? 'bg-emerald-50 text-emerald-700 font-black' : 'bg-rose-50 text-rose-700 font-black';
        case 'd7Roi':
            return value >= benchmark.roi7 ? 'bg-emerald-50 text-emerald-700 font-black' : 'bg-rose-50 text-rose-700 font-black';
        case 'd7PayRate':
            return value >= benchmark.payRate ? 'bg-emerald-50 text-emerald-700 font-black' : 'bg-rose-50 text-rose-700 font-black';
        case 'd7PaidUsers':
            return value >= benchmark.paidUsers ? 'bg-emerald-50 text-emerald-700 font-black' : 'text-slate-700';
        case 'd7Arppu':
            if (benchmark.arppu7 == null)
                return 'text-slate-700';
            return value >= benchmark.arppu7 ? 'bg-emerald-50 text-emerald-700 font-black' : 'bg-rose-50 text-rose-700 font-black';
        case 'installs':
            if (value >= benchmark.newUsersPaid)
                return 'bg-emerald-50 text-emerald-700 font-black';
            if (value >= benchmark.newUsersRecovery)
                return 'bg-amber-50 text-amber-700 font-black';
            return 'text-slate-700';
        default:
            return '';
    }
};
