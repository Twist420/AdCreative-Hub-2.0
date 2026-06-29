import { MONTHLY_ANALYTICS_ROWS } from '../../services/monthlyAnalyticsData';
export const channels = ['Applovin', 'Google', 'Facebook', 'Adjoe', 'Moloco', 'Unity'];
export const platforms = ['Android', 'iOS'];
export const languages = ['EN', 'JA', 'KO', 'DE'];
export const buildMockSpends = () => {
    const setsByMaterial = MONTHLY_ANALYTICS_ROWS.reduce((groups, row) => {
        if (!groups[row.materialId])
            groups[row.materialId] = [];
        groups[row.materialId].push(row);
        return groups;
    }, {});
    return MONTHLY_ANALYTICS_ROWS.map((row) => {
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
export const INITIAL_COLUMNS = [
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
export const metricHelp = {
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
export const getTypeLabel = (type) => ({ video: '视频', playable: '试玩', image: '图片' }[type]);
export const getSortValue = (row, key, totalSpend) => {
    if (key === 'sets')
        return row.associatedSets.length;
    if (key === 'spendRatio')
        return totalSpend > 0 ? row.spend / totalSpend : 0;
    if (key === 'ctr')
        return row.impressions > 0 ? row.clicks / row.impressions : 0;
    return row[key];
};
