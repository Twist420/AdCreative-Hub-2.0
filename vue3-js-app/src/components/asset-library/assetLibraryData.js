export const FOLDER_TREE = [
    {
        name: '片段',
        children: [
            {
                name: '前贴',
                children: [
                    { name: 'AI前贴', isLeaf: true, prefix: 'AI-PRE-', defaultTags: ['AI生成', '冰雪', '空投'] },
                    { name: '真人前贴', isLeaf: true, prefix: 'LIVE-PRE-', defaultTags: ['真人实拍', '男性', '惊喜'] },
                    { name: '漫画前贴', isLeaf: true, prefix: 'COM-PRE-', defaultTags: ['漫画', '朋克'] },
                    { name: '玩法前贴', isLeaf: true, prefix: 'GP-PRE-', defaultTags: ['玩法', '合成'] },
                    { name: '大字报前贴', isLeaf: true, prefix: 'TXT-PRE-', defaultTags: ['大字报', '黑红'] },
                    { name: '奖励前贴', isLeaf: true, prefix: 'REW-PRE-', defaultTags: ['宝箱', '爆金币'] },
                    { name: '解压前贴', isLeaf: true, prefix: 'DEC-PRE-', defaultTags: ['解压', '太空沙'] },
                    { name: '剧情前贴', isLeaf: true, prefix: 'STORY-PRE-', defaultTags: ['剧情', '立绘'] }
                ]
            },
            { name: '玩法', isLeaf: true, prefix: 'PLAY-', defaultTags: ['核心玩法', '连爆'] },
            { name: '大字报', isLeaf: true, prefix: 'BILL-', defaultTags: ['文字', '全屏'] }
        ]
    },
    {
        name: '组件',
        children: [
            { name: '场景', isLeaf: true, prefix: 'SCENE-', defaultTags: ['场景', '背景', '3D'] },
            { name: '合成链', isLeaf: true, prefix: 'MERGE-', defaultTags: ['合成链', '图例'] },
            { name: 'UI', isLeaf: true, prefix: 'UI-', defaultTags: ['UI', '面板', '弹窗'] },
            { name: '特效', isLeaf: true, prefix: 'FX-', defaultTags: ['特效', '粒子'] },
            { name: '音效', isLeaf: true, prefix: 'SFX-', defaultTags: ['音效', '反馈'] },
            { name: 'BGM', isLeaf: true, prefix: 'BGM-', defaultTags: ['BGM', '音乐', '环境音'] },
            { name: '人物形象', isLeaf: true, prefix: 'CHAR-', defaultTags: ['形象', '二次元'] },
            { name: '动物形象', isLeaf: true, prefix: 'ANIMAL-', defaultTags: ['形象', '3D模型'] }
        ]
    }
];
export const PRESET_UPLOADS_PREVIEWS = [
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&h=400&fit=crop',
];
export const getLeafFolders = (nodes, path = []) => {
    let leaves = [];
    for (const node of nodes) {
        const curPath = [...path, node.name];
        const system = curPath[0] === '片段' ? 'Fragment' : 'Component';
        if (!node.children || node.children.length === 0) {
            leaves.push({
                name: node.name,
                path: curPath,
                system,
                prefix: node.prefix || (system === 'Component' ? 'COMP-' : 'FR-'),
                defaultTags: node.defaultTags || [],
            });
        }
        else {
            leaves.push(...getLeafFolders(node.children, curPath));
        }
    }
    return leaves;
};
export const getAllFoldersInTree = (nodes, path = []) => {
    let folders = [];
    for (const node of nodes) {
        if (node.children) {
            const curPath = [...path, node.name];
            folders.push({ name: node.name, path: curPath });
            folders.push(...getAllFoldersInTree(node.children, curPath));
        }
    }
    return folders;
};
const matchTerms = (terms) => (item) => {
    const content = [item.type, item.subType, item.name, ...item.tags].join(' ').toLowerCase();
    return terms.some(term => content.includes(term.toLowerCase()));
};
const createFacet = (id, label, categoryId, group, match) => ({ id, label, categoryId, group, match });
export const ASSET_FACET_CATEGORIES = [
    {
        id: 'popular',
        label: '热门推荐',
        groups: [
            {
                title: '常用入口',
                facets: [
                    createFacet('all', '全部资产', 'popular', '常用入口', () => true),
                    createFacet('recommended', '推荐资产', 'popular', '常用入口', item => item.status === 'Recommended'),
                    createFacet('with_data', '有投放数据', 'popular', '常用入口', item => Boolean(item.performance?.length)),
                    createFacet('high_citation', '高复用', 'popular', '常用入口', item => item.citationCount >= 40),
                    createFacet('recent', '近期上传', 'popular', '常用入口', item => new Date(item.createdAt).getTime() >= new Date('2026-05-01').getTime()),
                ],
            },
            {
                title: '高频广告素材',
                facets: [
                    createFacet('hot_ai_hook', 'AI前贴', 'popular', '高频广告素材', matchTerms(['AI前贴', 'AI生成'])),
                    createFacet('hot_live_hook', '真人前贴', 'popular', '高频广告素材', matchTerms(['真人前贴', '真人实拍', '真人'])),
                    createFacet('hot_gameplay', '玩法展示', 'popular', '高频广告素材', matchTerms(['玩法', '核心玩法', '合成'])),
                    createFacet('hot_billboard', '大字报', 'popular', '高频广告素材', matchTerms(['大字报', '文字'])),
                    createFacet('hot_reward', '奖励爆点', 'popular', '高频广告素材', matchTerms(['奖励', '爆金币', '宝箱'])),
                ],
            },
        ],
    },
    {
        id: 'resource',
        label: '资源类型',
        groups: [
            {
                title: '视频片段',
                facets: [
                    createFacet('fragment', '全部片段', 'resource', '视频片段', item => item.type === 'Fragment'),
                    createFacet('pre_hook', '前贴/Hook', 'resource', '视频片段', matchTerms(['前贴'])),
                    createFacet('gameplay_segment', '玩法段', 'resource', '视频片段', matchTerms(['玩法'])),
                    createFacet('story_segment', '剧情段', 'resource', '视频片段', matchTerms(['剧情'])),
                    createFacet('billboard_segment', '大字报段', 'resource', '视频片段', matchTerms(['大字报'])),
                ],
            },
            {
                title: '组件素材',
                facets: [
                    createFacet('component', '全部组件', 'resource', '组件素材', item => item.type === 'Component'),
                    createFacet('scene_asset', '场景/背景', 'resource', '组件素材', matchTerms(['场景', '背景'])),
                    createFacet('ui_asset', 'UI/面板', 'resource', '组件素材', matchTerms(['UI', '面板', '弹窗'])),
                    createFacet('effect_asset', '特效/粒子', 'resource', '组件素材', matchTerms(['特效', '粒子'])),
                    createFacet('audio_asset', '音效/BGM', 'resource', '组件素材', matchTerms(['音效', 'BGM', '音乐', '环境音'])),
                    createFacet('character_asset', '人物/形象', 'resource', '组件素材', matchTerms(['人物', '形象', '二次元'])),
                    createFacet('model_asset', '3D模型', 'resource', '组件素材', matchTerms(['3D模型', '高模', '3D'])),
                ],
            },
        ],
    },
    {
        id: 'theme',
        label: '主题题材',
        groups: [
            {
                title: '世界观/氛围',
                facets: [
                    createFacet('theme_fantasy', '奇幻魔法', 'theme', '世界观/氛围', matchTerms(['冰雪仙子', '恶魔', '龙族', '巨龙', '魔法'])),
                    createFacet('theme_ice', '冰雪极地', 'theme', '世界观/氛围', matchTerms(['冰雪', '冰原', '极地', '寒风'])),
                    createFacet('theme_fire', '火焰恶魔', 'theme', '世界观/氛围', matchTerms(['火焰', '恶魔', '变身'])),
                    createFacet('theme_tech', '科技极客', 'theme', '世界观/氛围', matchTerms(['极客', '电脑', '科技', '朋克'])),
                    createFacet('theme_cartoon', '漫画卡通', 'theme', '世界观/氛围', matchTerms(['漫画', '卡通', '二次元'])),
                ],
            },
            {
                title: '广告卖点',
                facets: [
                    createFacet('selling_surprise', '惊喜反应', 'theme', '广告卖点', matchTerms(['惊喜', '惊叹', '爆奖'])),
                    createFacet('selling_reward', '奖励反馈', 'theme', '广告卖点', matchTerms(['奖励', '宝箱', '爆金币', '欧皇'])),
                    createFacet('selling_relief', '解压爽感', 'theme', '广告卖点', matchTerms(['解压', '太空沙', 'ASMR', '舒适'])),
                    createFacet('selling_upgrade', '升级成长', 'theme', '广告卖点', matchTerms(['升级', '解锁', '合成链'])),
                    createFacet('selling_text', '强文案吸睛', 'theme', '广告卖点', matchTerms(['大字报', '文字', '吸睛', '震颤'])),
                ],
            },
        ],
    },
    {
        id: 'character',
        label: '角色生物',
        groups: [
            {
                title: '人物/身份',
                facets: [
                    createFacet('char_male', '男性', 'character', '人物/身份', matchTerms(['男性', '小哥'])),
                    createFacet('char_female', '女性', 'character', '人物/身份', matchTerms(['女性', '萌妹', '公主', '仙子'])),
                    createFacet('char_princess', '公主/王子', 'character', '人物/身份', matchTerms(['公主', '王子'])),
                    createFacet('char_wizard', '法师/巫师', 'character', '人物/身份', matchTerms(['法师', '巫师', 'wizard'])),
                ],
            },
            {
                title: '生物/怪物',
                facets: [
                    createFacet('creature_dragon', '龙/巨龙', 'character', '生物/怪物', matchTerms(['龙', '巨龙', '龙族'])),
                    createFacet('creature_demon', '恶魔', 'character', '生物/怪物', matchTerms(['恶魔'])),
                    createFacet('creature_unicorn', '独角兽', 'character', '生物/怪物', matchTerms(['独角兽', 'unicorn'])),
                    createFacet('creature_animal', '动物形象', 'character', '生物/怪物', matchTerms(['动物形象', '动物'])),
                ],
            },
        ],
    },
    {
        id: 'gameplay',
        label: '玩法机制',
        groups: [
            {
                title: '核心玩法',
                facets: [
                    createFacet('play_merge', '合成', 'gameplay', '核心玩法', matchTerms(['合成', '合成链'])),
                    createFacet('play_tower', '塔防', 'gameplay', '核心玩法', matchTerms(['塔防'])),
                    createFacet('play_match3', '三消', 'gameplay', '核心玩法', matchTerms(['三消', '消消乐', '连爆'])),
                    createFacet('play_boss', 'Boss战', 'gameplay', '核心玩法', matchTerms(['boss', '战斗', 'battle'])),
                    createFacet('play_unlock', '解锁升级', 'gameplay', '核心玩法', matchTerms(['解锁', '升级', '十级'])),
                ],
            },
            {
                title: '表现形式',
                facets: [
                    createFacet('format_3d', '3D表现', 'gameplay', '表现形式', matchTerms(['3D', '高模'])),
                    createFacet('format_live', '真人实拍', 'gameplay', '表现形式', matchTerms(['真人实拍', '真人'])),
                    createFacet('format_ai', 'AI生成', 'gameplay', '表现形式', matchTerms(['AI生成', 'AI前贴'])),
                    createFacet('format_text', '全屏文案', 'gameplay', '表现形式', matchTerms(['全屏', '文字', '大字报'])),
                ],
            },
        ],
    },
    {
        id: 'scene',
        label: '场景环境',
        groups: [
            {
                title: '自然/空间',
                facets: [
                    createFacet('scene_ice', '冰原/雪地', 'scene', '自然/空间', matchTerms(['冰原', '冰雪', '极地'])),
                    createFacet('scene_castle', '城堡', 'scene', '自然/空间', matchTerms(['城堡'])),
                    createFacet('scene_space', '太空/沙', 'scene', '自然/空间', matchTerms(['太空', '太空沙'])),
                    createFacet('scene_cyber', '朋克/科技', 'scene', '自然/空间', matchTerms(['朋克', '科技', '电脑'])),
                ],
            },
            {
                title: '画面部件',
                facets: [
                    createFacet('scene_background', '背景板', 'scene', '画面部件', matchTerms(['背景', '背景板'])),
                    createFacet('scene_panel', '面板弹窗', 'scene', '画面部件', matchTerms(['面板', '弹窗', 'UI'])),
                    createFacet('scene_particle', '粒子特效', 'scene', '画面部件', matchTerms(['粒子', '特效'])),
                ],
            },
        ],
    },
    {
        id: 'usage',
        label: '适用位置',
        groups: [
            {
                title: '视频结构',
                facets: [
                    createFacet('usage_a', 'A段 / Hook', 'usage', '视频结构', item => getAssetUsageSlots(item).includes('A段')),
                    createFacet('usage_mid', '中间段', 'usage', '视频结构', item => getAssetUsageSlots(item).includes('中间段')),
                    createFacet('usage_b', 'B段', 'usage', '视频结构', item => getAssetUsageSlots(item).includes('B段')),
                    createFacet('usage_cta', 'CTA', 'usage', '视频结构', item => getAssetUsageSlots(item).includes('CTA')),
                ],
            },
            {
                title: '组件用途',
                facets: [
                    createFacet('usage_background', '背景', 'usage', '组件用途', item => getAssetUsageSlots(item).includes('背景')),
                    createFacet('usage_ui', 'UI组件', 'usage', '组件用途', item => getAssetUsageSlots(item).includes('UI组件')),
                    createFacet('usage_fx', '特效', 'usage', '组件用途', item => getAssetUsageSlots(item).includes('特效')),
                    createFacet('usage_audio', '音效', 'usage', '组件用途', item => getAssetUsageSlots(item).includes('音效')),
                    createFacet('usage_character', '角色', 'usage', '组件用途', item => getAssetUsageSlots(item).includes('角色')),
                    createFacet('usage_image', '图片', 'usage', '组件用途', item => getAssetUsageSlots(item).includes('图片')),
                ],
            },
        ],
    },
    {
        id: 'keyword',
        label: '关键词',
        groups: [
            {
                title: '内容关键词',
                facets: [
                    createFacet('kw_ice', '冰雪', 'keyword', '内容关键词', matchTerms(['冰雪'])),
                    createFacet('kw_mystery', '神秘', 'keyword', '内容关键词', matchTerms(['神秘'])),
                    createFacet('kw_chest', '宝箱', 'keyword', '内容关键词', matchTerms(['宝箱'])),
                    createFacet('kw_gold', '金币', 'keyword', '内容关键词', matchTerms(['金币', '爆金币'])),
                    createFacet('kw_popup', '弹窗', 'keyword', '内容关键词', matchTerms(['弹窗'])),
                    createFacet('kw_music', '音乐', 'keyword', '内容关键词', matchTerms(['音乐', 'BGM'])),
                    createFacet('kw_asrm', 'ASMR', 'keyword', '内容关键词', matchTerms(['ASMR'])),
                ],
            },
            {
                title: '数据状态',
                facets: [
                    createFacet('kw_recommended', '推荐', 'keyword', '数据状态', item => item.status === 'Recommended'),
                    createFacet('kw_disabled', '停用', 'keyword', '数据状态', item => item.status === 'Disabled'),
                    createFacet('kw_insufficient', '数据不足', 'keyword', '数据状态', item => item.status === 'Insufficient Data'),
                    createFacet('kw_not_recommended', '不推荐', 'keyword', '数据状态', item => item.status === 'Not Recommended'),
                ],
            },
        ],
    },
];
export const ASSET_FACETS = ASSET_FACET_CATEGORIES.flatMap(category => category.groups.flatMap(group => group.facets));
export const getAssetUsageSlots = (item) => {
    const content = [item.type, item.subType, item.name, ...item.tags].join(' ').toLowerCase();
    const slots = new Set();
    if (item.type === 'Fragment') {
        if (content.includes('前贴') || content.includes('hook') || content.includes('ai生成') || content.includes('真人')) {
            slots.add('A段');
        }
        if (content.includes('玩法') || content.includes('合成') || content.includes('塔防') || content.includes('三消')) {
            slots.add('中间段');
        }
        if (content.includes('大字报') || content.includes('文字') || content.includes('奖励') || content.includes('宝箱')) {
            slots.add('B段');
        }
        if (content.includes('奖励') || content.includes('宝箱') || content.includes('结算')) {
            slots.add('CTA');
        }
    }
    if (content.includes('场景') || content.includes('背景'))
        slots.add('背景');
    if (content.includes('ui') || content.includes('面板') || content.includes('弹窗'))
        slots.add('UI组件');
    if (content.includes('特效') || content.includes('粒子'))
        slots.add('特效');
    if (content.includes('音效') || content.includes('bgm') || content.includes('音乐'))
        slots.add('音效');
    if (content.includes('人物') || content.includes('形象') || content.includes('3d模型'))
        slots.add('角色');
    if (content.includes('图片') || item.sourceFileUrl?.match(/\.(jpg|jpeg|png|webp)$/i))
        slots.add('图片');
    return Array.from(slots).slice(0, 4);
};
export const INITIAL_ITEMS = [
    {
        id: 'fr-ai-01',
        type: 'Fragment',
        subType: 'AI前贴',
        name: '3D冰雪仙子神秘空投',
        tags: ['AI生成', '冰雪', '神秘', '空投'],
        citationCount: 42,
        status: 'Recommended',
        createdAt: '2026-05-18 14:20',
        previewUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=400&fit=crop',
        sourceFileUrl: '/assets/hooks/fr-ai-01.mp4',
        duration: '00:05',
        referencedAssetIds: ['comp-scene-ice', 'comp-fx-gold'],
        parentComponent: '剧情片段-02',
        relatedRequirements: ['REQ-20260512-01', 'REQ-20260514-05'],
        positionInTimeline: '00:00 - 00:05',
        relatedComponents: ['场景-冰原', '特效-寒风'],
        performance: [
            { channel: 'applovin', spent: 12500, installs: 4500, paidUsers: 320, ir: 0.36, cpi: 2.7, cpm: 25.4, cpa: 39.1 },
        ]
    },
    {
        id: 'fr-ai-02',
        type: 'Fragment',
        subType: 'AI前贴',
        name: '火焰恶魔觉醒变身动画',
        tags: ['AI生成', '恶魔', '变身'],
        citationCount: 29,
        status: 'Recommended',
        createdAt: '2026-05-17 11:30',
        previewUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400&h=400&fit=crop',
        sourceFileUrl: '/assets/hooks/fr-ai-02.mp4',
        duration: '00:06',
        performance: []
    },
    {
        id: 'fr-live-01',
        type: 'Fragment',
        subType: '真人前贴',
        name: '极客小哥电脑屏震撼特写',
        tags: ['真人实拍', '惊叹', '男性'],
        citationCount: 15,
        status: 'Insufficient Data',
        createdAt: '2026-05-15 09:12',
        previewUrl: 'https://images.unsplash.com/photo-1516245834210-c4c142787335?w=400&h=400&fit=crop',
        sourceFileUrl: '/assets/hooks/fr-live-01.mp4',
        duration: '00:03',
        performance: []
    },
    {
        id: 'fr-live-02',
        type: 'Fragment',
        subType: '真人前贴',
        name: '青春萌妹游戏爆奖反应',
        tags: ['真人', '爆奖', '惊喜', '女性'],
        citationCount: 33,
        status: 'Recommended',
        createdAt: '2026-05-14 16:21',
        previewUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop',
        sourceFileUrl: '/assets/hooks/fr-live-02.mp4',
        duration: '00:05',
        performance: []
    },
    {
        id: 'fr-comic-01',
        type: 'Fragment',
        subType: '漫画前贴',
        name: '蒸汽朋克飞船突袭漫画',
        tags: ['漫画', '朋克', '大片'],
        citationCount: 11,
        status: 'Not Recommended',
        createdAt: '2026-05-12 10:00',
        previewUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=400&h=400&fit=crop',
        sourceFileUrl: '/assets/hooks/fr-comic-01.mp4',
        duration: '00:04',
        performance: []
    },
    {
        id: 'fr-gp-01',
        type: 'Fragment',
        subType: '玩法前贴',
        name: '塔防高能合成升级展示',
        tags: ['玩法', '塔防', '合成'],
        citationCount: 54,
        status: 'Recommended',
        createdAt: '2026-05-10 14:15',
        previewUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=400&fit=crop',
        sourceFileUrl: '/assets/hooks/fr-gp-01.mp4',
        duration: '00:07',
        performance: []
    },
    {
        id: 'fr-text-01',
        type: 'Fragment',
        subType: '大字报前贴',
        name: '经典震颤大字报提词前贴',
        tags: ['大字报', '震颤', '吸睛'],
        citationCount: 8,
        status: 'Disabled',
        createdAt: '2026-05-08 17:01',
        previewUrl: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=400&h=400&fit=crop',
        sourceFileUrl: '/assets/hooks/fr-text-01.mp4',
        duration: '00:03',
        performance: []
    },
    {
        id: 'fr-rew-01',
        type: 'Fragment',
        subType: '奖励前贴',
        name: '黄金宝箱喷涌十连抽奖励',
        tags: ['爆金币', '宝箱', '欧皇'],
        citationCount: 62,
        status: 'Recommended',
        createdAt: '2026-05-07 15:33',
        previewUrl: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400&h=400&fit=crop',
        sourceFileUrl: '/assets/hooks/fr-rew-01.mp4',
        duration: '00:05',
        performance: []
    },
    {
        id: 'fr-decomp-01',
        type: 'Fragment',
        subType: '解压前贴',
        name: '太空沙切割极度舒适声音',
        tags: ['解压', '太空沙', 'ASMR'],
        citationCount: 22,
        status: 'Recommended',
        createdAt: '2026-05-06 09:44',
        previewUrl: 'https://images.unsplash.com/photo-1551076805-e1869f36369c?w=400&h=400&fit=crop',
        sourceFileUrl: '/assets/hooks/fr-decomp-01.mp4',
        duration: '00:06',
        performance: []
    },
    {
        id: 'fr-story-01',
        type: 'Fragment',
        subType: '剧情前贴',
        name: '龙族公主宿命觉醒回忆录',
        tags: ['剧情', '龙族', '精制'],
        citationCount: 19,
        status: 'Insufficient Data',
        createdAt: '2026-05-05 13:11',
        previewUrl: 'https://images.unsplash.com/photo-1579783928591-7487140e4f8d?w=400&h=400&fit=crop',
        sourceFileUrl: '/assets/hooks/fr-story-01.mp4',
        duration: '00:08',
        performance: []
    },
    {
        id: 'fr-play-classic',
        type: 'Fragment',
        subType: '玩法',
        name: '开心三消满屏连爆高分盘',
        tags: ['玩法', '经典', '消消乐'],
        citationCount: 88,
        status: 'Recommended',
        createdAt: '2026-05-01 16:45',
        previewUrl: 'https://images.unsplash.com/photo-1553481187-be93c21490a9?w=400&h=400&fit=crop',
        sourceFileUrl: '/assets/gameplay/classic.mp4',
        duration: '00:15',
        performance: []
    },
    {
        id: 'fr-billboard-main',
        type: 'Fragment',
        subType: '大字报',
        name: '爆款素材全屏黑红吸睛文案',
        tags: ['大字报', '黑红', '文字'],
        citationCount: 45,
        status: 'Recommended',
        createdAt: '2026-04-28 12:22',
        previewUrl: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=400&fit=crop',
        sourceFileUrl: '/assets/billboard/main.mp4',
        duration: '00:10',
        performance: []
    },
    {
        id: 'comp-scene-ice',
        type: 'Component',
        subType: '场景',
        name: '极地冰原城堡3D精细背景板',
        tags: ['背景', '3D', '极地'],
        citationCount: 104,
        status: 'Recommended',
        createdAt: '2026-04-25 10:15',
        previewUrl: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=400&h=400&fit=crop',
        sourceFileUrl: '/assets/ui/scene-ice.jpg',
        performance: []
    },
    {
        id: 'comp-merge-dragon',
        type: 'Component',
        subType: '合成链',
        name: '冰河暴雪巨龙十级解锁图例',
        tags: ['合成链', '巨龙', '高模'],
        citationCount: 15,
        status: 'Insufficient Data',
        createdAt: '2026-04-22 14:15',
        previewUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&h=400&fit=crop',
        sourceFileUrl: '/assets/ui/dragon-chain.psd',
        performance: []
    },
    {
        id: 'comp-ui-settle',
        type: 'Component',
        subType: 'UI',
        name: '奢华巨额金币结算弹窗面板',
        tags: ['UI', '面板', '金币'],
        citationCount: 120,
        status: 'Recommended',
        createdAt: '2026-04-20 11:30',
        previewUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=400&fit=crop',
        sourceFileUrl: '/assets/ui/settle-panel.psd',
        performance: []
    },
    {
        id: 'comp-fx-gold',
        type: 'Component',
        subType: '特效',
        name: '金光爆闪全屏粒子特效动画包',
        tags: ['特效', '全屏', '爆裂粒子'],
        citationCount: 91,
        status: 'Recommended',
        createdAt: '2026-04-18 15:40',
        previewUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=400&fit=crop',
        sourceFileUrl: '/assets/effects/gold-burst.ae',
        performance: []
    },
    {
        id: 'comp-sound-coin',
        type: 'Component',
        subType: '音效',
        name: '爽快清脆满罐金币掉落音效合集',
        tags: ['音效', '金币', '解压'],
        citationCount: 300,
        status: 'Recommended',
        createdAt: '2026-04-15 08:30',
        previewUrl: 'https://images.unsplash.com/photo-1601042879364-f3947d3f9c16?w=400&h=400&fit=crop',
        sourceFileUrl: '/assets/audio/coin-falls.wav',
        performance: []
    },
    {
        id: 'comp-bgm',
        type: 'Component',
        subType: 'BGM',
        name: '战云密布管弦乐宏大背景音乐',
        tags: ['BGM', '管弦乐', '燃点'],
        citationCount: 75,
        status: 'Recommended',
        createdAt: '2026-04-10 13:45',
        previewUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop',
        sourceFileUrl: '/assets/audio/epic-battle.mp3',
        performance: []
    },
    {
        id: 'comp-char-wizard',
        type: 'Component',
        subType: '人物形象',
        name: 'Q版傲娇冰系大法师二次元立绘',
        tags: ['形象', '主角', '立绘'],
        citationCount: 110,
        status: 'Recommended',
        createdAt: '2026-04-05 11:20',
        previewUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&h=400&fit=crop',
        sourceFileUrl: '/assets/characters/ice-wizard.png',
        performance: []
    },
    {
        id: 'comp-animal-unicorn',
        type: 'Component',
        subType: '动物形象',
        name: '3D极地圣洁彩虹独角兽模型',
        tags: ['形象', '坐骑', '3D模型'],
        citationCount: 84,
        status: 'Recommended',
        createdAt: '2026-04-01 10:10',
        previewUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=400&h=400&fit=crop',
        sourceFileUrl: '/assets/characters/unicorn-3d.fbx',
        performance: []
    }
];
export const removeNodeAtPath = (nodes, path) => {
    if (path.length === 0)
        return nodes;
    return nodes.map(node => {
        if (node.name === path[0]) {
            if (path.length === 1) {
                return null;
            }
            else {
                return {
                    ...node,
                    children: removeNodeAtPath(node.children || [], path.slice(1))
                };
            }
        }
        return node;
    }).filter((n) => n !== null);
};
export const insertNodeAtPath = (nodes, path, newNode) => {
    if (path.length === 0) {
        return [...nodes, newNode];
    }
    return nodes.map(node => {
        if (node.name === path[0]) {
            if (path.length === 1) {
                return {
                    ...node,
                    isLeaf: false,
                    children: [...(node.children || []), newNode]
                };
            }
            else {
                return {
                    ...node,
                    children: insertNodeAtPath(node.children || [], path.slice(1), newNode)
                };
            }
        }
        return node;
    });
};
export const updateNodeDetailsAtPath = (nodes, path, updatedFields) => {
    if (path.length === 0)
        return nodes;
    return nodes.map(node => {
        if (node.name === path[0]) {
            if (path.length === 1) {
                return {
                    ...node,
                    ...updatedFields
                };
            }
            else {
                return {
                    ...node,
                    children: updateNodeDetailsAtPath(node.children || [], path.slice(1), updatedFields)
                };
            }
        }
        return node;
    });
};
export const parseDuration = (dur) => {
    if (!dur)
        return 0;
    const parts = dur.split(':').map(Number);
    if (parts.length === 2) {
        return parts[0] * 60 + parts[1];
    }
    if (parts.length === 3) {
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return 0;
};
// Generates stable deterministic performance statistics for channels (Google, Facebook, Applovin)
export const getEffectivePerformance = (item) => {
    const base = item.performance && item.performance.length > 0 ? item.performance : [];
    const channels = ['Applovin', 'Facebook', 'Google'];
    let seed = 0;
    for (let i = 0; i < item.id.length; i++) {
        seed += item.id.charCodeAt(i);
    }
    return channels.map((channel, idx) => {
        const existing = base.find(p => p.channel.toLowerCase() === channel.toLowerCase());
        if (existing)
            return existing;
        const scaleMultiplier = ((seed % 10) + 3) / 8;
        const spent = Math.round((12000 + (seed * (idx + 1) * 31) % 35000) * scaleMultiplier);
        const installs = Math.round((3500 + (seed * (idx + 2) * 23) % 12000) * scaleMultiplier);
        const ir = +(0.15 + ((seed + idx * 7) % 35) / 100).toFixed(3);
        const cpi = +(1.1 + ((seed * 3 + idx * 13) % 38) / 10).toFixed(2);
        return {
            channel,
            spent,
            installs,
            paidUsers: Math.round(installs * 0.08),
            ir,
            cpi,
            cpm: +(10.5 + ((seed + idx) % 20)).toFixed(1),
            cpa: +(15.0 + ((seed * 2 + idx) % 45)).toFixed(1)
        };
    });
};
// Generates stable deterministic creatives associated with the asset ordered by spend descending
export const getMockCreatives = (item) => {
    let seed = 0;
    for (let i = 0; i < item.id.length; i++) {
        seed += item.id.charCodeAt(i);
    }
    const count = 3 + (seed % 4);
    const channels = ['Applovin', 'Facebook', 'Google'];
    const creatives = Array.from({ length: count }).map((_, idx) => {
        const creativeId = `CR-${(seed * (idx + 1)) % 900 + 100}-${(idx + 1).toString().padStart(2, '0')}`;
        const channel = channels[(seed + idx) % channels.length];
        const spent = Math.round((1500 + (seed * (idx + 3) * 123) % 22000));
        return {
            id: creativeId,
            channel,
            spent
        };
    });
    return creatives.sort((a, b) => b.spent - a.spent);
};
