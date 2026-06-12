import React, { useState, useEffect, useMemo } from 'react';
import { 
  Folder, FileText, ChevronRight, ChevronDown, 
  Search, Grid, List, Plus, Filter,
  Play, Tag, History, MoreHorizontal,
  Layout as LayoutIcon, Box, User, Music, Zap, Image as ImageIcon,
  Monitor, Info, BarChart2, DollarSign, Users, MousePointer2,
  Calendar, Link as LinkIcon, Clock, Check, X, ArrowUpRight,
  ExternalLink, PlayCircle, Activity, ArrowUp, ArrowDown, Layers, RefreshCw,
  Paperclip, ClipboardList, Edit3, Star, Share2
} from 'lucide-react';
import { LibraryItem } from '../types';
import { DetailModal } from './DetailModal';

const FolderIcon = Folder;

// Hierarchical folder definition
interface FolderNode {
  name: string;
  isLeaf?: boolean;
  children?: FolderNode[];
  prefix?: string;
  defaultTags?: string[];
}

const FOLDER_TREE: FolderNode[] = [
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

interface AssetFacet {
  id: string;
  label: string;
  categoryId: string;
  group: string;
  match: (item: LibraryItem) => boolean;
}

interface AssetFacetGroup {
  title: string;
  facets: AssetFacet[];
}

interface AssetFacetCategory {
  id: string;
  label: string;
  groups: AssetFacetGroup[];
}

const matchTerms = (terms: string[]) => (item: LibraryItem) => {
  const content = [item.type, item.subType, item.name, ...item.tags].join(' ').toLowerCase();
  return terms.some(term => content.includes(term.toLowerCase()));
};

const createFacet = (
  id: string,
  label: string,
  categoryId: string,
  group: string,
  match: (item: LibraryItem) => boolean
): AssetFacet => ({ id, label, categoryId, group, match });

const ASSET_FACET_CATEGORIES: AssetFacetCategory[] = [
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

const ASSET_FACETS = ASSET_FACET_CATEGORIES.flatMap(category =>
  category.groups.flatMap(group => group.facets)
);

const getAssetUsageSlots = (item: LibraryItem): string[] => {
  const content = [item.type, item.subType, item.name, ...item.tags].join(' ').toLowerCase();
  const slots = new Set<string>();

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

  if (content.includes('场景') || content.includes('背景')) slots.add('背景');
  if (content.includes('ui') || content.includes('面板') || content.includes('弹窗')) slots.add('UI组件');
  if (content.includes('特效') || content.includes('粒子')) slots.add('特效');
  if (content.includes('音效') || content.includes('bgm') || content.includes('音乐')) slots.add('音效');
  if (content.includes('人物') || content.includes('形象') || content.includes('3d模型')) slots.add('角色');
  if (content.includes('图片') || item.sourceFileUrl?.match(/\.(jpg|jpeg|png|webp)$/i)) slots.add('图片');

  return Array.from(slots).slice(0, 4);
};

const INITIAL_ITEMS: LibraryItem[] = [
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

const removeNodeAtPath = (nodes: FolderNode[], path: string[]): FolderNode[] => {
  if (path.length === 0) return nodes;
  return nodes.map(node => {
    if (node.name === path[0]) {
      if (path.length === 1) {
        return null;
      } else {
        return {
          ...node,
          children: removeNodeAtPath(node.children || [], path.slice(1))
        };
      }
    }
    return node;
  }).filter((n): n is FolderNode => n !== null);
};

const insertNodeAtPath = (nodes: FolderNode[], path: string[], newNode: FolderNode): FolderNode[] => {
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
      } else {
        return {
          ...node,
          children: insertNodeAtPath(node.children || [], path.slice(1), newNode)
        };
      }
    }
    return node;
  });
};

const updateNodeDetailsAtPath = (
  nodes: FolderNode[],
  path: string[],
  updatedFields: Partial<FolderNode>
): FolderNode[] => {
  if (path.length === 0) return nodes;
  return nodes.map(node => {
    if (node.name === path[0]) {
      if (path.length === 1) {
        return {
          ...node,
          ...updatedFields
        };
      } else {
        return {
          ...node,
          children: updateNodeDetailsAtPath(node.children || [], path.slice(1), updatedFields)
        };
      }
    }
    return node;
  });
};

const parseDuration = (dur?: string): number => {
  if (!dur) return 0;
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
const getEffectivePerformance = (item: LibraryItem) => {
  const base = item.performance && item.performance.length > 0 ? item.performance : [];
  const channels = ['Applovin', 'Facebook', 'Google'];
  
  let seed = 0;
  for (let i = 0; i < item.id.length; i++) {
    seed += item.id.charCodeAt(i);
  }

  return channels.map((channel, idx) => {
    const existing = base.find(p => p.channel.toLowerCase() === channel.toLowerCase());
    if (existing) return existing;

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
const getMockCreatives = (item: LibraryItem) => {
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

const AssetLibrary: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [selectedDetailItem, setSelectedDetailItem] = useState<LibraryItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFacetIds, setActiveFacetIds] = useState<string[]>([]);
  
  // Custom states for Asset Detail View enhancement & direct card play
  const [playingCardId, setPlayingCardId] = useState<string | null>(null);
  
  // Interactive Folder states
  const [folderTree, setFolderTree] = useState<FolderNode[]>(FOLDER_TREE);
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>(INITIAL_ITEMS);
  const [sortField, setSortField] = useState<string>('citationCount');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // New library configuration states
  const [isLibModalOpen, setIsLibModalOpen] = useState(false);
  const [editingNodePath, setEditingNodePath] = useState<string[] | null>(null);
  const [libName, setLibName] = useState('');
  const [libSystem, setLibSystem] = useState<'Fragment' | 'Component'>('Fragment');
  const [libParentPath, setLibParentPath] = useState<string[]>(['片段']);
  const [libPrefix, setLibPrefix] = useState('');
  const [libTagsString, setLibTagsString] = useState('');
  const [libSelectedAssets, setLibSelectedAssets] = useState<string[]>([]);
  const [assetSearchQuery, setAssetSearchQuery] = useState('');

  // Inline subfolder creation states
  const [inlineAddingParentPath, setInlineAddingParentPath] = useState<string[] | null>(null);
  const [inlineNewName, setInlineNewName] = useState('');

  // Right pane subfolder control states
  const [isFolderControlOpen, setIsFolderControlOpen] = useState(false);
  const [controlNodePath, setControlNodePath] = useState<string[]>([]);
  const [controlNodeName, setControlNodeName] = useState('');
  const [controlNodePrefix, setControlNodePrefix] = useState('');
  const [controlNodeTags, setControlNodeTags] = useState('');
  const [showAdminConfirm, setShowAdminConfirm] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');

  const handleCreateLibraryInline = () => {
    if (!inlineNewName.trim() || !inlineAddingParentPath) {
      setInlineAddingParentPath(null);
      setInlineNewName('');
      return;
    }
    
    // Create new folder node
    const newNode: FolderNode = {
      name: inlineNewName.trim(),
      isLeaf: true,
      prefix: '',
      defaultTags: []
    };

    // Insert into folder tree
    const updatedTree = insertNodeAtPath(folderTree, inlineAddingParentPath, newNode);
    setFolderTree(updatedTree);

    // Set new current path so we go there
    setCurrentPath([...inlineAddingParentPath, inlineNewName.trim()]);

    // reset inline state
    setInlineAddingParentPath(null);
    setInlineNewName('');
  };

  const handleSaveFolderControl = () => {
    if (!controlNodeName.trim()) {
      alert('资产库名称不能为空');
      return;
    }

    const oldName = controlNodePath[controlNodePath.length - 1];
    const newName = controlNodeName.trim();
    const updatedTags = controlNodeTags.split(',').map(t => t.trim()).filter(Boolean);

    // Update folder node properties
    setFolderTree(prev => updateNodeDetailsAtPath(prev, controlNodePath, {
      name: newName,
      prefix: controlNodePrefix.trim(),
      defaultTags: updatedTags
    }));

    // If the folder name changed, rename it in currentPath if it's currently selected
    if (oldName !== newName) {
      if (isPathEqual(currentPath, controlNodePath)) {
        setCurrentPath([...controlNodePath.slice(0, -1), newName]);
      }
      
      // Update items that are subType matching oldName
      setLibraryItems(prev => prev.map(item => {
        if (item.subType === oldName) {
          return {
            ...item,
            subType: newName
          };
        }
        return item;
      }));
    }

    setIsFolderControlOpen(false);
  };

  const handleDeleteFolderWithPass = () => {
    if (adminPassword !== 'admin' && adminPassword !== 'admin888') {
      alert('管理员密码错误，无权执行此敏感删除操作！');
      return;
    }

    // Perform deleting
    setFolderTree(prev => removeNodeAtPath(prev, controlNodePath));
    
    // Reset path if we are in it or under it
    const subNodePathStr = controlNodePath.join('/');
    const currentPathStr = currentPath.join('/');
    if (currentPathStr === subNodePathStr || currentPathStr.startsWith(subNodePathStr + '/')) {
      setCurrentPath([]);
    }

    setIsFolderControlOpen(false);
    setShowAdminConfirm(false);
    setAdminPassword('');
  };

  // Upload asset states
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadName, setUploadName] = useState('');
  const [uploadTagsString, setUploadTagsString] = useState('');
  const [uploadCitation, setUploadCitation] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'Recommended' | 'Not Recommended' | 'Disabled' | 'Insufficient Data'>('Insufficient Data');
  const [uploadDuration, setUploadDuration] = useState('00:05');
  const [uploadPreviewUrl, setUploadPreviewUrl] = useState('https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=400&fit=crop');
  const [uploadSourceUrl, setUploadSourceUrl] = useState('/assets/uploads/file.mp4');
  const [selectedUploadFolder, setSelectedUploadFolder] = useState('AI前贴');

  // Batch Uploading / Multi-select state
  const [isBatchUpload, setIsBatchUpload] = useState(false);
  const [batchNamesText, setBatchNamesText] = useState('');
  const [uploadAttachments, setUploadAttachments] = useState<{ name: string; size: number; sizeStr: string }[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
  
  // Setup Folder properties
  const [setupPrefix, setSetupPrefix] = useState('');
  const [setupTags, setSetupTags] = useState('');

  // Move Modal States
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [targetMoveFolder, setTargetMoveFolder] = useState('');
  const [isCreatingInMove, setIsCreatingInMove] = useState(false);
  const [newMoveLibParentPath, setNewMoveLibParentPath] = useState<string[]>(['片段']);
  const [newMoveLibName, setNewMoveLibName] = useState('');
  const [newMoveLibSystem, setNewMoveLibSystem] = useState<'Fragment' | 'Component'>('Fragment');

  const PRESET_UPLOADS_PREVIEWS = [
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&h=400&fit=crop'
  ];

  const getLeafFolders = (nodes: FolderNode[], path: string[] = []): { name: string; path: string[]; system: 'Fragment' | 'Component' }[] => {
    let leaves: { name: string; path: string[]; system: 'Fragment' | 'Component' }[] = [];
    for (const node of nodes) {
      const curPath = [...path, node.name];
      const system = curPath[0] === '片段' ? 'Fragment' : 'Component';
      if (!node.children || node.children.length === 0) {
        leaves.push({ name: node.name, path: curPath, system });
      } else {
        leaves.push(...getLeafFolders(node.children, curPath));
      }
    }
    return leaves;
  };

  const getAllFoldersInTree = (nodes: FolderNode[], path: string[] = []): { name: string; path: string[] }[] => {
    let folders: { name: string; path: string[] }[] = [];
    for (const node of nodes) {
      if (node.children) {
        const curPath = [...path, node.name];
        folders.push({ name: node.name, path: curPath });
        folders.push(...getAllFoldersInTree(node.children, curPath));
      }
    }
    return folders;
  };

  // Toggled expanded folders in left navigation
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    '片段': true,
    '组件': true,
    '片段/前贴': true,
  });

  // Automatically expand parent folders of currentPath to ensure highlight is always visible
  useEffect(() => {
    if (currentPath.length > 0) {
      setExpandedFolders(prev => {
        const next = { ...prev };
        let pathAccumulator: string[] = [];
        for (let i = 0; i < currentPath.length; i++) {
          pathAccumulator.push(currentPath[i]);
          const key = pathAccumulator.join('/');
          next[key] = true;
        }
        return next;
      });
    }
  }, [currentPath]);

  

  // Recursively search directory by targetName
  const findFolderNodeByName = (nodes: FolderNode[], targetName: string): FolderNode | null => {
    for (const node of nodes) {
      if (node.name === targetName) return node;
      if (node.children) {
        const result = findFolderNodeByName(node.children, targetName);
        if (result) return result;
      }
    }
    return null;
  };

  const findPathInTree = (nodes: FolderNode[], targetName: string, path: string[] = []): string[] | null => {
    for (const node of nodes) {
      const currentPath = [...path, node.name];
      if (node.name === targetName) {
        return currentPath;
      }
      if (node.children) {
        const result = findPathInTree(node.children, targetName, currentPath);
        if (result) return result;
      }
    }
    return null;
  };

  const getItemPath = (item: LibraryItem): string[] => {
    const p = findPathInTree(folderTree, item.subType);
    if (p) return p;
    return [item.type === 'Fragment' ? '片段' : '组件', item.subType];
  };

  const isItemInPath = (itemPath: string[], targetPath: string[]): boolean => {
    if (targetPath.length === 0) return true;
    if (itemPath.length < targetPath.length) return false;
    for (let i = 0; i < targetPath.length; i++) {
      if (itemPath[i] !== targetPath[i]) return false;
    }
    return true;
  };

  const getFolderStatistics = (targetPath: string[]) => {
    const matchedAssets = libraryItems.filter(item => {
      const itemPath = getItemPath(item);
      return isItemInPath(itemPath, targetPath);
    });
    return {
      totalCount: matchedAssets.length,
      previews: matchedAssets.slice(0, 4)
    };
  };

  const isPathEqual = (p1: string[], p2: string[]): boolean => {
    if (p1.length !== p2.length) return false;
    return p1.every((val, index) => val === p2[index]);
  };

  const toggleFolder = (pathKey: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [pathKey]: !prev[pathKey]
    }));
  };

  const getNodeByPath = (path: string[]): FolderNode | null => {
    if (path.length === 0) return { name: 'Root', children: folderTree };
    let current: FolderNode | undefined = undefined;
    for (const segment of path) {
      const list: FolderNode[] = current ? (current.children || []) : folderTree;
      current = list.find(node => node.name === segment);
      if (!current) return null;
    }
    return current;
  };

  const activeNode = getNodeByPath(currentPath);
  const isLeaf = !activeNode || activeNode.isLeaf || !activeNode.children || activeNode.children.length === 0;
  const needsSetup = !!(activeNode && currentPath.length > 0 && isLeaf && (!activeNode.prefix || !activeNode.defaultTags || activeNode.defaultTags.length === 0));

// Sync state when entering a new folder that needs setup
  useEffect(() => {
    if (activeNode) {
      setSetupPrefix(activeNode.prefix || '');
      setSetupTags(activeNode.defaultTags ? activeNode.defaultTags.join(', ') : '');
    }
  }, [currentPath, activeNode]);

  const handleSaveFolderSetup = () => {
    if (!setupPrefix.trim()) {
      alert('请输入微分子资产库默认前缀，如 "AI-PRE-"');
      return;
    }
    if (!setupTags.trim()) {
      alert('请输入微分子资产库默认标签，如 "AI生成, 爆点"');
      return;
    }

    const cleanTags = setupTags.split(',').map(s => s.trim()).filter(Boolean);

    // Recursively update node at currentPath in folderTree
    const updateNodeInTree = (nodes: FolderNode[], path: string[]): FolderNode[] => {
      if (path.length === 0) return nodes;
      return nodes.map(node => {
        if (node.name === path[0]) {
          if (path.length === 1) {
            return {
              ...node,
              prefix: setupPrefix.trim().toUpperCase(),
              defaultTags: cleanTags
            };
          } else {
            return {
              ...node,
              children: updateNodeInTree(node.children || [], path.slice(1))
            };
          }
        }
        return node;
      });
    };

    setFolderTree(prev => updateNodeInTree(prev, currentPath));
    alert('资产库已成功配置并激活！');
  };

  const handleToggleAssetSelection = (id: string) => {
    setSelectedAssetIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSaveName = (itemId: string, newName: string) => {
    if (!newName.trim()) return;
    setLibraryItems(prevItems => 
      prevItems.map(item => item.id === itemId ? { ...item, name: newName.trim() } : item)
    );
    setSelectedDetailItem(prev => prev && prev.id === itemId ? { ...prev, name: newName.trim() } : prev);
  };

  const activeFacets = activeFacetIds
    .map(id => ASSET_FACETS.find(facet => facet.id === id))
    .filter((facet): facet is AssetFacet => Boolean(facet));
  const activeFacetLabel = activeFacets.length ? activeFacets.map(facet => facet.label).join(' / ') : '全部资产';
  const activeFacetLabels = activeFacets.map(facet => ({ id: facet.id, label: facet.label }));

  const toggleAssetFacet = (facetId: string) => {
    if (facetId === 'all') {
      setActiveFacetIds([]);
      return;
    }
    setActiveFacetIds(prev => (
      prev.includes(facetId)
        ? prev.filter(id => id !== facetId)
        : [...prev, facetId]
    ));
  };

  const removeAssetFacet = (facetId: string) => {
    setActiveFacetIds(prev => prev.filter(id => id !== facetId));
  };

  const facetCounts = useMemo(() => {
    const scopedItems = libraryItems.filter(item => isItemInPath(getItemPath(item), currentPath));
    return ASSET_FACETS.reduce<Record<string, number>>((acc, facet) => {
      acc[facet.id] = scopedItems.filter(facet.match).length;
      return acc;
    }, {} as Record<string, number>);
  }, [libraryItems, currentPath, folderTree]);

  const filteredItems = libraryItems.filter(item => {
    const itemPath = getItemPath(item);
    const isInActivePath = isItemInPath(itemPath, currentPath);
    const matchesFacet = activeFacets.length === 0 || activeFacets.every(facet => facet.match(item));

    if (!isInActivePath || !matchesFacet) return false;
    
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      return item.name.toLowerCase().includes(query) || 
        item.id.toLowerCase().includes(query) ||
        item.tags.some(t => t.toLowerCase().includes(query)) ||
        item.subType.toLowerCase().includes(query);
    }
    return true;
  });

  const sortedItems = useMemo(() => {
    const items = [...filteredItems];
    return items.sort((a, b) => {
      let valA: any = 0;
      let valB: any = 0;

      if (sortField === 'citationCount') {
        valA = a.citationCount;
        valB = b.citationCount;
      } else if (sortField === 'createdAt') {
        valA = new Date(a.createdAt).getTime();
        valB = new Date(b.createdAt).getTime();
      } else if (sortField === 'duration') {
        valA = parseDuration(a.duration);
        valB = parseDuration(b.duration);
      } else if (sortField === 'spent') {
        valA = a.performance?.reduce((acc, p) => acc + p.spent, 0) || 0;
        valB = b.performance?.reduce((acc, p) => acc + p.spent, 0) || 0;
      } else if (sortField === 'installs') {
        valA = a.performance?.reduce((acc, p) => acc + p.installs, 0) || 0;
        valB = b.performance?.reduce((acc, p) => acc + p.installs, 0) || 0;
      } else if (sortField === 'ir') {
        valA = a.performance?.[0]?.ir || 0;
        valB = b.performance?.[0]?.ir || 0;
      } else if (sortField === 'cpi') {
        valA = a.performance?.[0]?.cpi ?? 999999;
        valB = b.performance?.[0]?.cpi ?? 999999;
      }

      if (valA === valB) return 0;

      if (sortField === 'cpi') {
        // Lower CPI is better, so desc = lowest first, asc = highest first
        if (sortDirection === 'desc') {
          return valA < valB ? -1 : 1;
        } else {
          return valA > valB ? -1 : 1;
        }
      }

      // For other fields, higher value is usually preferred/better, so desc = highest first
      if (sortDirection === 'desc') {
        return valA > valB ? -1 : 1;
      } else {
        return valA < valB ? -1 : 1;
      }
    });
  }, [filteredItems, sortField, sortDirection]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Recommended': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Not Recommended': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'Disabled': return 'bg-slate-50 text-slate-400 border-slate-100';
      default: return 'bg-amber-50 text-amber-600 border-amber-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Recommended': return '推荐';
      case 'Not Recommended': return '不推荐';
      case 'Disabled': return '停用';
      default: return '数据不足';
    }
  };

  const handleCreateLibrary = () => {
    if (!libName.trim()) {
      alert('请输入资产库名称');
      return;
    }
    
    // Create new folder node (empty prefix/tags to trigger needsSetup)
    const newNode = {
      name: libName.trim(),
      isLeaf: true,
      prefix: '',
      defaultTags: []
    };

    // Insert into folder tree
    const updatedTree = insertNodeAtPath(folderTree, libParentPath, newNode);
    setFolderTree(updatedTree);

    // Update subtype and tags of selected items if copy selected has been enabled
    if (libSelectedAssets.length > 0) {
      setLibraryItems(prevItems => 
        prevItems.map(item => {
          if (libSelectedAssets.includes(item.id)) {
            return {
              ...item,
              type: libParentPath[0] === '片段' ? 'Fragment' : 'Component',
              subType: libName.trim()
            };
          }
          return item;
        })
      );
    }

    // Set new current path to see it instantly!
    setCurrentPath([...libParentPath, libName.trim()]);

    // Close and reset
    setIsLibModalOpen(false);
    setLibName('');
    setLibPrefix('');
    setLibTagsString('');
    setLibSelectedAssets([]);
  };

  const handleUploadAsset = () => {
    // Find the selected leaf path and details
    const leaves = getLeafFolders(folderTree);
    const targetLeaf = leaves.find(l => l.name === selectedUploadFolder) || leaves[0];
    
    if (!targetLeaf) {
      alert('请选择归类的缩微资产库目录');
      return;
    }

    const leafNode = findFolderNodeByName(folderTree, targetLeaf.name);
    const prefix = leafNode?.prefix || 'CUSTOM-';

    if (!batchNamesText.trim()) {
      alert('请输入素材名称（可录入单个或换行批量录入）');
      return;
    }
    
    const names = batchNamesText.split('\n').map(n => n.trim()).filter(Boolean);
    if (names.length === 0) {
      alert('没有检测到有效的素材名称。');
      return;
    }

    const newItems = names.map((nameStr, idx) => {
      const randId = prefix.toLowerCase() + Math.random().toString(36).substr(2, 5) + '_' + idx;
      return {
        id: randId,
        type: targetLeaf.system,
        subType: targetLeaf.name,
        name: nameStr,
        tags: leafNode?.defaultTags || [],
        citationCount: 0,
        status: 'Insufficient Data' as const,
        createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
        previewUrl: PRESET_UPLOADS_PREVIEWS[Math.floor(Math.random() * PRESET_UPLOADS_PREVIEWS.length)],
        sourceFileUrl: `/assets/uploads/${randId}.mp4`,
        duration: '00:05',
        performance: [
          { channel: 'applovin', spent: Math.floor(Math.random() * 5000) + 1200, installs: Math.floor(Math.random() * 2005) + 400, paidUsers: 120, ir: +(0.15 + Math.random() * 0.25).toFixed(2), cpi: +(1.2 + Math.random() * 2).toFixed(2), cpm: 15.2, cpa: 22.4 }
        ]
      };
    });

    setLibraryItems(prev => [...newItems, ...prev]);
    alert(`成功上传了 ${newItems.length} 个创意素材至 〖${targetLeaf.name}〗 资产库！`);

    // Navigate to see the target folder where we uploaded
    setCurrentPath(targetLeaf.path);
    
    // Clear & Close
    setIsUploadModalOpen(false);
    setUploadName('');
    setBatchNamesText('');
    setUploadAttachments([]);
    setUploadTagsString('');
    setUploadCitation(0);
    setUploadStatus('Insufficient Data');
    setUploadDuration('00:05');
  };

  const handleBatchMove = () => {
    let finalTargetFolder = targetMoveFolder;
    let finalSystem: 'Fragment' | 'Component' = newMoveLibSystem;

    if (isCreatingInMove) {
      if (!newMoveLibName.trim()) {
        alert('请输入新建资产库名称');
        return;
      }
      
      const newLibNameClean = newMoveLibName.trim();
      const newNode: FolderNode = {
        name: newLibNameClean,
        isLeaf: true,
        prefix: '',
        defaultTags: []
      };

      // Insert new directory under the chosen parent path
      const updatedTree = insertNodeAtPath(folderTree, newMoveLibParentPath, newNode);
      setFolderTree(updatedTree);
      
      finalTargetFolder = newLibNameClean;
      finalSystem = newMoveLibParentPath[0] === '片段' ? 'Fragment' : 'Component';
    }

    if (!finalTargetFolder) {
      alert('请选择或指定目标资产库目录');
      return;
    }

    // Move selected asset IDs
    setLibraryItems(prev => 
      prev.map(item => {
        if (selectedAssetIds.includes(item.id)) {
          return {
            ...item,
            type: finalSystem,
            subType: finalTargetFolder
          };
        }
        return item;
      })
    );

    alert(`已成功将 ${selectedAssetIds.length} 个资产批量移动至 〖${finalTargetFolder}〗 目录！`);
    setSelectedAssetIds([]);
    setIsMoveModalOpen(false);
    setNewMoveLibName('');
    setIsCreatingInMove(false);
  };

  const handleCreateIterationAsset = (sourceItem: LibraryItem) => {
    const now = new Date();
    const newId = `${sourceItem.id}-iter-${now.getTime().toString().slice(-5)}`;
    const newItem: LibraryItem = {
      ...sourceItem,
      id: newId,
      name: `${sourceItem.name} 迭代版`,
      citationCount: 0,
      status: 'Insufficient Data',
      createdAt: now.toISOString().slice(0, 16).replace('T', ' '),
      parentAssetId: sourceItem.id,
      referencedAssetIds: [...(sourceItem.referencedAssetIds || [])],
      relatedAssets: [...(sourceItem.relatedAssets || [])],
      relatedComponents: [...(sourceItem.relatedComponents || [])],
      performance: [],
    };

    setLibraryItems(prev => [newItem, ...prev]);
    setCurrentPath(getItemPath(sourceItem));
    setSelectedDetailItem(newItem);
    setSearchQuery('');
  };

  // Recursively render left directory explorer trees
  const renderLeftSidebarNode = (node: FolderNode, parentPath: string[] = []): React.ReactNode => {
    const nodePath = [...parentPath, node.name];
    const hasChildren = node.children && node.children.length > 0;
    
    const isSelected = isPathEqual(nodePath, currentPath);
    const pathKey = nodePath.join('/');
    const isExpanded = expandedFolders[pathKey] || false;
    
    const Icon = node.name === '片段' ? LayoutIcon : node.name === '组件' ? Box : Folder;
    const { totalCount } = getFolderStatistics(nodePath);

    const isAddingHere = isPathEqual(nodePath, inlineAddingParentPath || []);

    return (
      <div key={pathKey} className="flex flex-col animate-in fade-in duration-150">
        <div
          className={`flex items-center justify-between px-3 py-1.5 rounded-lg group transition-all select-none ${
            isSelected 
              ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10' 
              : 'text-slate-600 hover:bg-slate-100/85'
          }`}
          style={{ marginLeft: `${parentPath.length * 10}px` }}
        >
          <button
            onClick={() => {
              setCurrentPath(nodePath);
            }}
            className="flex items-center gap-2 text-left flex-1 py-0.5"
          >
            <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
            <span className={`text-[11px] font-bold line-clamp-1 truncate ${isSelected ? 'text-white' : 'text-slate-707 font-medium'}`}>
              {node.name}
            </span>
            <span className={`text-[9px] font-mono px-1 rounded-sm ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'}`}>
              {totalCount}
            </span>
          </button>
          
          {/* Create Library (+) inline on hover - available for all level nodes */}
          <button
             onClick={(e) => {
                e.stopPropagation();
                setInlineAddingParentPath(nodePath);
                setInlineNewName('');
                setExpandedFolders(prev => ({
                   ...prev,
                   [pathKey]: true
                }));
             }}
             className={`p-1 rounded transition-all shrink-0 ml-1 opacity-0 group-hover:opacity-100 ${
                isSelected ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-150'
             }`}
             title="新建子资产库"
          >
             <Plus className="w-3 h-3" />
          </button>

          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFolder(pathKey);
              }}
              className={`p-1 rounded hover:bg-black/5 transition-colors shrink-0 ${isSelected ? 'text-white/80' : 'text-slate-300 hover:text-slate-600'}`}
            >
              {isExpanded ? <ChevronDown className="w-3" /> : <ChevronRight className="w-3" />}
            </button>
          )}
        </div>
        
        {((hasChildren && isExpanded) || isAddingHere) && (
          <div className="mt-1 space-y-0.5">
            {hasChildren && isExpanded && node.children!.map(child => renderLeftSidebarNode(child, nodePath))}
            
            {/* Inline Add Input Row */}
            {isAddingHere && (
              <div 
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200/50 animate-in fade-in slide-in-from-top-1 duration-150 mr-1"
                style={{ marginLeft: `${(parentPath.length + 1) * 10}px` }}
                onClick={(e) => e.stopPropagation()}
              >
                <Folder className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="子分类名称"
                  value={inlineNewName}
                  onChange={(e) => setInlineNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCreateLibraryInline();
                    } else if (e.key === 'Escape') {
                      setInlineAddingParentPath(null);
                      setInlineNewName('');
                    }
                  }}
                  className="bg-transparent border-0 p-0 text-[10.5px] font-bold text-slate-700 w-full focus:outline-none focus:ring-0 placeholder-slate-400"
                  autoFocus
                />
                <button
                  onClick={handleCreateLibraryInline}
                  className="p-0.5 text-emerald-600 hover:bg-white rounded transition-colors"
                  title="确认"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </button>
                <button
                  onClick={() => {
                    setInlineAddingParentPath(null);
                    setInlineNewName('');
                  }}
                  className="p-0.5 text-rose-500 hover:bg-white rounded transition-colors"
                  title="取消"
                >
                  <X className="w-3.5 h-3.5 stroke-[3]" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Check total usage
  const totalUsageData = useMemo(() => {
    const fragmentCount = libraryItems.filter(item => item.type === 'Fragment').length;
    const componentCount = libraryItems.filter(item => item.type === 'Component').length;
    return { fragmentCount, componentCount };
  }, [libraryItems]);

  return (
    <div className="flex bg-white rounded-3xl border border-slate-100 h-full overflow-hidden shadow-sm relative">
      {/* Left Sidebar Layout */}
      <aside className="w-60 border-r border-slate-100 flex flex-col shrink-0 bg-slate-50/50 p-4 overflow-y-auto no-scrollbar py-5">
        <div 
          onClick={() => {
             setCurrentPath([]);
             setSearchQuery('');
          }}
          className="flex items-center gap-3 mb-6 px-2 py-1.5 -mx-1 rounded-xl cursor-pointer group hover:bg-slate-200/50 active:scale-98 transition-all select-none"
          title="点击返回最上层级"
        >
           <div className="w-8 h-8 bg-slate-900 group-hover:bg-indigo-605 text-white rounded-lg flex items-center justify-center shadow-md transition-colors">
              <FolderIcon className="w-4.5 h-4.5" />
           </div>
           <div>
              <h2 className="text-xs font-black text-slate-800 leading-none font-sans group-hover:text-indigo-600 transition-colors">资产库目录</h2>
              <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-widest leading-none group-hover:text-indigo-400 transition-colors">Library Explorer</p>
           </div>
        </div>

        {/* Directory trees */}
        <nav className="space-y-5">
           {folderTree.map(rootNode => (
             <div key={rootNode.name} className="space-y-1.5">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1 mb-1 font-sans">{rootNode.name}体系</p>
                {renderLeftSidebarNode(rootNode)}
             </div>
           ))}
        </nav>

        {/* Local Storage Indicator */}
        <div className="mt-auto pt-4 border-t border-slate-100 px-1 space-y-3">
           <div className="bg-white rounded-xl p-3 border border-slate-100 shadow-sm">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">系统配额</p>
              <div className="space-y-2">
                 <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-slate-500">片段总量</span>
                    <span className="text-[9px] font-black text-slate-800">{totalUsageData.fragmentCount} / 5,000</span>
                 </div>
                 <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-900" style={{ width: `${(totalUsageData.fragmentCount / 5000) * 100}%` }}></div>
                 </div>
                 <div className="flex items-center justify-between mt-1">
                    <span className="text-[9px] font-bold text-slate-500">组件总量</span>
                    <span className="text-[9px] font-black text-slate-800">{totalUsageData.componentCount} / 5,000</span>
                 </div>
                 <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-900" style={{ width: `${(totalUsageData.componentCount / 5000) * 100}%` }}></div>
                 </div>
              </div>
           </div>
        </div>
      </aside>

      {/* Main Content Explorer Area */}
      <main className="flex-1 flex flex-col bg-white overflow-hidden">
         {/* Top toolbar */}
         <div className="h-16 border-b border-slate-100 px-6 flex items-center justify-between shrink-0 bg-white z-10 gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
               <div className="relative w-56 shrink-0">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="在当前目录下模糊定位..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-9 pr-4 py-1.5 text-[10.5px] font-bold font-sans focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-all font-medium text-slate-800 placeholder-slate-400"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
               </div>
               
               {searchQuery && (
                 <button 
                    onClick={() => setSearchQuery('')}
                    className="text-[9px] font-black text-slate-400 hover:text-slate-800 bg-slate-100 px-2 py-1 rounded"
                 >
                    清除
                 </button>
               )}

               <div className="h-4 w-px bg-slate-205"></div>

               {/* Advanced Multi-Sort selection block (Flat field pills with toggles) */}
               <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-slate-400 shrink-0 font-sans tracking-tight">排序方式:</span>
                  <div className="flex flex-wrap gap-1">
                     {[
                        { field: 'citationCount', label: '引用' },
                        { field: 'spent', label: '预算' },
                        { field: 'installs', label: '安装' },
                        { field: 'ir', label: 'IR' },
                        { field: 'cpi', label: 'CPI' },
                        { field: 'createdAt', label: '更新时间' },
                        { field: 'duration', label: '视频长度' }
                     ].map(opt => {
                        const isCurrent = sortField === opt.field;
                        return (
                           <button
                              key={opt.field}
                              onClick={() => {
                                 if (isCurrent) {
                                    setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc');
                                 } else {
                                    setSortField(opt.field);
                                    setSortDirection('desc');
                                 }
                              }}
                              className={`px-2.5 py-1 text-[10px] font-black rounded-lg border transition-all duration-150 flex items-center gap-1 cursor-pointer font-sans select-none ${
                                 isCurrent
                                    ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600'
                              }`}
                           >
                              <span>{opt.label}</span>
                              {isCurrent && (
                                 sortDirection === 'desc' ? (
                                    <ArrowDown className="w-2.5 h-2.5 shrink-0 text-white" />
                                 ) : (
                                    <ArrowUp className="w-2.5 h-2.5 shrink-0 text-white" />
                                 )
                              )}
                           </button>
                        );
                     })}
                  </div>
               </div>
            </div>

            {/* Enlarged Buttons action area */}
            <div className="flex items-center gap-2 shrink-0">
               <button 
                  onClick={() => {
                     setUploadName('');
                     setUploadTagsString('');
                     setUploadCitation(1);
                     setUploadStatus('Insufficient Data');
                     setUploadDuration('00:05');
                     setUploadAttachments([]);
                     // Pick random template image URL
                     setUploadPreviewUrl(PRESET_UPLOADS_PREVIEWS[Math.floor(Math.random() * PRESET_UPLOADS_PREVIEWS.length)]);
                     setUploadSourceUrl(`/assets/uploads/item-${Date.now().toString().slice(-4)}.mp4`);
                     
                     // Pre-select correct label leaf category
                     if (currentPath.length > 0 && isLeaf) {
                        setSelectedUploadFolder(currentPath[currentPath.length - 1]);
                     } else {
                        const leaves = getLeafFolders(folderTree);
                        if (leaves.length > 0) {
                           setSelectedUploadFolder(leaves[0].name);
                        }
                     }
                     setIsUploadModalOpen(true);
                  }}
                  className="px-6 py-2.5 bg-slate-900 border border-slate-900 text-white rounded-xl text-[11px] font-black hover:bg-black hover:scale-101 shadow-md hover:shadow-lg transition-all h-11 flex items-center justify-center gap-1.5 font-sans cursor-pointer"
               >
                  <Plus className="w-4 h-4 shrink-0" />
                  上传素材
               </button>
            </div>
         </div>

         <div className="border-b border-slate-100 bg-slate-50/80">
            <div className="max-h-64 overflow-y-auto px-6 py-4 no-scrollbar">
               <div className="space-y-3">
                  {ASSET_FACET_CATEGORIES.map(category => (
                     <div key={category.id} className="grid grid-cols-[112px_minmax(0,1fr)] gap-6 border-b border-slate-100 py-3 first:pt-0 last:border-b-0 last:pb-0">
                        <div className="pt-1">
                           <p className="text-[12px] font-black text-indigo-600">{category.label}</p>
                        </div>
                        <div className="space-y-2.5">
                           {category.groups.map(group => (
                              <div key={`${category.id}-${group.title}`} className="grid grid-cols-[104px_minmax(0,1fr)] gap-5">
                                 <p className="pt-0.5 text-[10px] font-black leading-6 text-slate-400">{group.title}</p>
                                 <div className="flex flex-wrap items-center gap-x-7 gap-y-2">
                                    {group.facets.map(facet => {
                                       const isActive = facet.id === 'all' ? activeFacetIds.length === 0 : activeFacetIds.includes(facet.id);
                                       const count = facetCounts[facet.id] || 0;
                                       return (
                                          <button
                                             key={facet.id}
                                             type="button"
                                             onClick={() => toggleAssetFacet(facet.id)}
                                             className={`group inline-flex h-6 items-center gap-1 whitespace-nowrap text-[11px] font-black leading-6 transition-all ${
                                                isActive
                                                   ? 'text-indigo-600'
                                                   : 'text-slate-700 hover:text-indigo-600'
                                             }`}
                                          >
                                             <span className={isActive ? 'border-b-2 border-indigo-500 pb-0.5' : 'pb-0.5'}>
                                                {facet.label}
                                             </span>
                                             <span className={`text-[9px] font-black ${isActive ? 'text-indigo-400' : 'text-slate-300 group-hover:text-indigo-300'}`}>
                                                {count}
                                             </span>
                                          </button>
                                       );
                                    })}
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  ))}
               </div>
            </div>
            <div className="border-t border-slate-100 bg-white/80 px-6 py-3">
               <div className="flex min-h-7 flex-wrap items-center gap-2">
                  <span className="mr-1 text-[10px] font-black text-slate-400">已选标签</span>
                  {activeFacetLabels.length === 0 ? (
                     <span className="rounded-xl bg-slate-50 px-3 py-1.5 text-[10px] font-black text-slate-300">全部资产</span>
                  ) : (
                     activeFacetLabels.map(facet => (
                        <button
                           key={facet.id}
                           type="button"
                           onClick={() => removeAssetFacet(facet.id)}
                           className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-[10px] font-black text-indigo-600 transition-all hover:border-rose-100 hover:bg-rose-50 hover:text-rose-500"
                           title="移除此筛选标签"
                        >
                           {facet.label}
                           <X className="h-3 w-3" />
                        </button>
                     ))
                  )}
                  {(activeFacetLabels.length > 0 || searchQuery.trim()) && (
                     <button
                        type="button"
                        onClick={() => {
                           setActiveFacetIds([]);
                           setSearchQuery('');
                        }}
                        className="ml-auto rounded-xl px-3 py-1.5 text-[10px] font-black text-slate-400 hover:bg-slate-50 hover:text-slate-700"
                     >
                        清除全部
                     </button>
                  )}
               </div>
            </div>
         </div>

         {/* Navigation, Breadcrumbs and folder grid content */}
         <div className="flex-1 overflow-y-auto no-scrollbar p-6">
            
            {/* Multi-select Batch Actions Bar */}
            {selectedAssetIds.length > 0 && (
               <div className="flex items-center justify-between bg-indigo-50/90 backdrop-blur-md p-3.5 mb-6 rounded-2xl border border-indigo-100 shadow-md animate-in slide-in-from-top-4 duration-300 font-sans">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-md">
                        <Layers className="w-4 h-4 shrink-0" />
                     </div>
                     <div>
                        <p className="text-xs font-black text-slate-800 tracking-tight leading-none text-left">
                           已批量选中 <span className="text-indigo-600 font-extrabold text-sm">{selectedAssetIds.length}</span> 个微分子资产
                        </p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1 text-left">Multi-Select Batch Actions Mode Activated</p>
                     </div>
                  </div>

                  <div className="flex items-center gap-2">
                     <button
                        onClick={() => {
                           const leaves = getLeafFolders(folderTree);
                           if (leaves.length > 0) {
                              setTargetMoveFolder(leaves[0].name);
                           }
                           setIsCreatingInMove(false);
                           setNewMoveLibName('');
                           setNewMoveLibParentPath(['片段']);
                           setIsMoveModalOpen(true);
                        }}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-black rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-1.5 cursor-pointer"
                     >
                        <RefreshCw className="w-3.5 h-3.5 shrink-0" />
                        批量移动到其它资产库...
                     </button>

                     <button
                        onClick={() => setSelectedAssetIds([])}
                        className="px-3.5 py-2 border border-slate-200 text-slate-505 bg-white hover:bg-slate-50 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                     >
                        <X className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        取消操作
                     </button>
                  </div>
               </div>
            )}

            {/* Folder Exploration Mode or Search Results/Concrete Asset List */}
            {needsSetup ? (
               <div className="max-w-md mx-auto my-12 bg-white rounded-3xl border border-slate-200/60 p-8 shadow-xl relative animate-in zoom-in-95 duration-200 flex flex-col text-left font-sans">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5 border border-indigo-100 shadow-sm animate-pulse">
                     <Info className="w-6 h-6" />
                  </div>
                  
                  <h3 className="text-sm font-black text-slate-800 tracking-tight">配置并激活您的微分子资产库</h3>
                  <p className="text-[9px] text-indigo-600 font-bold uppercase tracking-widest leading-none mt-1 mb-3">Activate Micro-Asset Library</p>
                  
                  <p className="text-[11px] text-slate-500 leading-relaxed mb-6">
                     该资产库是初始创建的，需要首先配置其内属资产的<strong className="text-slate-900 font-extrabold">“默认标识前缀”</strong>与<strong className="text-slate-900 font-extrabold">“推荐应用默认标签”</strong>才可解锁上传以及查看功能。
                  </p>

                  <div className="space-y-4 mb-6 text-left">
                     <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block font-bold leading-none">格式标识前缀 (所有内属新建资产自动应用)</label>
                        <input
                           type="text"
                           placeholder="例: AI-PRE-, PROD-"
                           value={setupPrefix}
                           onChange={(e) => setSetupPrefix(e.target.value.toUpperCase())}
                           className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold font-mono text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/15"
                        />
                     </div>

                     <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block font-bold leading-none">默认初始标签 (英文逗号分隔)</label>
                        <input
                           type="text"
                           placeholder="如: 真人, 冰雪, 爆点"
                           value={setupTags}
                           onChange={(e) => setSetupTags(e.target.value)}
                           className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-750 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/15"
                        />
                      </div>
                   </div>

                   <button
                      onClick={handleSaveFolderSetup}
                      className="w-full h-11 bg-slate-900 hover:bg-black text-white text-xs font-black rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                   >
                      <Check className="w-4 h-4" />
                      保存设置并激活此资产库
                   </button>
                </div>
             ) : (!isLeaf && searchQuery.trim() === '' && activeFacetIds.length === 0) ? (
              /* Display sub-folder grids */
              <div className="space-y-6">
                <div>
                   <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">子文件夹结构</h3>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                      {(activeNode?.children || []).map(subNode => {
                        const folderPath = [...currentPath, subNode.name];
                        const { totalCount, previews } = getFolderStatistics(folderPath);

                        return (
                          <div
                             key={subNode.name}
                             onClick={() => {
                               // Open sub-folder and trigger Left highlight synchronicity 
                               setCurrentPath(folderPath);
                             }}
                             className="group bg-slate-50/50 hover:bg-white rounded-3xl border border-slate-100 p-4 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/50 transition-all cursor-pointer flex flex-col justify-between hover:-translate-y-1 duration-300"
                          >
                             <div>
                                <div className="flex items-center justify-between mb-4">
                                   <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
                                      <Folder className="w-4.5 h-4.5 fill-white/10" />
                                   </div>
                                   <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                      <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-100 px-2.5 py-0.5 rounded-full">
                                         {totalCount} 个资产
                                      </span>
                                      <button
                                         onClick={(e) => {
                                            e.stopPropagation();
                                            setControlNodePath(folderPath);
                                            setControlNodeName(subNode.name);
                                            setControlNodePrefix(subNode.prefix || '');
                                            setControlNodeTags((subNode.defaultTags || []).join(', '));
                                            setIsFolderControlOpen(true);
                                            setShowAdminConfirm(false);
                                            setAdminPassword('');
                                         }}
                                         className="p-1 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-100 border border-slate-200/50 transition-all cursor-pointer bg-white flex items-center justify-center"
                                         title="管理资产库与配置"
                                      >
                                         <MoreHorizontal className="w-3.5 h-3.5" />
                                      </button>
                                   </div>
                                </div>
                                <h4 className="text-sm font-black text-slate-800 group-hover:text-primary transition-colors">{subNode.name}</h4>
                                <span className="text-[8px] font-black text-slate-400 font-mono tracking-widest uppercase">
                                   {folderPath.join(' / ')}
                                </span>
                             </div>

                             {/* 2x2 Square image previews of internal components */}
                             <div className="grid grid-cols-2 gap-2 mt-5 bg-white p-2 rounded-2xl border border-slate-200/50">
                                {previews.map(item => (
                                   <div key={item.id} className="relative aspect-square rounded-lg overflow-hidden bg-slate-50 border border-slate-100">
                                      <img src={item.previewUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                      <div className="absolute inset-x-0 bottom-0 bg-black/50 px-1 py-0.5 text-center">
                                         <p className="text-[7px] text-white font-black truncate leading-none">{item.name}</p>
                                      </div>
                                   </div>
                                ))}
                                {Array.from({ length: Math.max(0, 4 - previews.length) }).map((_, idx) => (
                                   <div key={`empty-${idx}`} className="aspect-square rounded-lg bg-slate-50 border border-dashed border-slate-200/60 flex items-center justify-center text-slate-300">
                                      <Box className="w-4 h-4 opacity-30" />
                                   </div>
                                ))}
                             </div>
                          </div>
                        );
                      })}
                   </div>
                 </div>
              </div>
            ) : (
              <div>
                {(activeFacetIds.length > 0 || searchQuery.trim()) && (
                  <div className="mb-4 flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <p className="text-[11px] font-bold text-slate-500">
                      当前查看：<span className="font-black text-slate-800">{activeFacetLabel}</span>
                      {searchQuery.trim() ? <span> / 搜索 “{searchQuery.trim()}”</span> : null}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveFacetIds([]);
                        setSearchQuery('');
                      }}
                      className="text-[10px] font-black text-indigo-600 hover:text-indigo-700"
                    >
                      清除筛选
                    </button>
                  </div>
                )}
                {sortedItems.length === 0 ? (
                  <div className="h-64 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-400 font-bold font-sans">
                     <Box className="w-10 h-10 text-slate-300 mb-2.5" />
                     <p className="text-xs">当前目录下没有符合「{activeFacetLabel}」的资产</p>
                     <p className="text-[10px] text-slate-400 font-normal mt-1">可以清除筛选，或上传素材并补充类型标签。</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
                     {sortedItems.map(item => {
                        return (
                          <div 
                            key={item.id}
                            onClick={() => {
                               // If not playing, default to detail list modal trigger
                               setSelectedDetailItem(item);
                            }}
                            className="group bg-white rounded-xl border border-slate-100 overflow-hidden hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/40 transition-all cursor-pointer flex flex-col font-sans"
                          >
                             {/* Preview Area (aspect-square for perfect square layout) */}
                             <div className="relative aspect-square bg-slate-900 overflow-hidden">
                                {playingCardId === item.id ? (
                                   <div className="absolute inset-0 z-30 bg-black flex items-center justify-center">
                                      <video 
                                         src={item.sourceFileUrl} 
                                         controls 
                                         autoPlay 
                                         className="w-full h-full object-contain" 
                                         onClick={(e) => e.stopPropagation()} 
                                         onEnded={(e) => {
                                            e.stopPropagation();
                                            setPlayingCardId(null);
                                         }}
                                      />
                                      <button 
                                         onClick={(e) => {
                                            e.stopPropagation();
                                            setPlayingCardId(null);
                                         }}
                                         className="absolute top-1.5 right-1.5 z-40 w-6 h-6 rounded-full bg-slate-950/80 backdrop-blur-md text-white flex items-center justify-center hover:bg-slate-900 shadow-lg text-xs"
                                         title="关闭预览"
                                      >
                                         <X className="w-3.5 h-3.5" />
                                      </button>
                                   </div>
                                ) : (
                                   <>
                                      {/* Hover/Selection Checkbox */}
                                      <div 
                                         className={`absolute top-1.5 right-1.5 z-20 transition-all duration-200 ${
                                            selectedAssetIds.includes(item.id) 
                                               ? 'opacity-100 scale-100' 
                                               : 'opacity-0 group-hover:opacity-100 scale-95'
                                         }`}
                                         onClick={(e) => {
                                            e.stopPropagation();
                                            handleToggleAssetSelection(item.id);
                                         }}
                                      >
                                         <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all shadow-sm ${
                                            selectedAssetIds.includes(item.id)
                                               ? 'bg-indigo-600 border-indigo-600 text-white animate-in scale-in duration-100'
                                               : 'bg-white/95 backdrop-blur-sm border-slate-350 hover:bg-white active:scale-95'
                                         }`}>
                                            {selectedAssetIds.includes(item.id) && (
                                               <Check className="w-3.5 h-3.5 stroke-[3.5]" />
                                            )}
                                         </div>
                                      </div>

                                      <img 
                                         src={item.previewUrl} 
                                         alt={item.name} 
                                         className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500"
                                         referrerPolicy="no-referrer"
                                      />
                                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>
                                      
                                      <div className="absolute top-1.5 left-1.5 flex gap-1">
                                         <span className={`px-1.5 py-0.5 rounded text-[7.5px] font-black border backdrop-blur-md ${getStatusColor(item.status)}`}>
                                            {getStatusText(item.status)}
                                         </span>
                                      </div>

                                      {/* Play overlay for video files */}
                                      {(item.sourceFileUrl?.endsWith('.mp4') || item.sourceFileUrl?.endsWith('.mov') || item.duration) && (
                                         <div 
                                            onClick={(e) => {
                                               e.stopPropagation();
                                               setPlayingCardId(item.id);
                                            }}
                                            className="absolute inset-0 flex items-center justify-center bg-black/5 group-hover:bg-black/30 transition-all z-10"
                                            title="点击在卡片内直接预览播放"
                                         >
                                            <div className="w-9 h-9 rounded-full bg-indigo-600/90 text-white flex items-center justify-center shadow-lg transform scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all hover:bg-indigo-500 active:scale-95">
                                               <Play className="w-4 h-4 fill-current ml-0.5" />
                                            </div>
                                         </div>
                                      )}

                                      <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between">
                                         <div className="flex items-center gap-1 text-white/95 text-[8px] font-black bg-slate-900/45 px-1.5 py-0.5 rounded backdrop-blur-sm">
                                            <PlayCircle className="w-3 h-3 text-indigo-400" />
                                            <span>{item.duration || '视频'}</span>
                                         </div>
                                         <div className="w-4.5 h-4.5 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all">
                                            <ArrowUpRight className="w-2.5 h-2.5" />
                                         </div>
                                      </div>
                                   </>
                                )}
                             </div>

                             {/* Info Area */}
                             <div className="p-2 flex-1 flex flex-col gap-1.5 bg-slate-50/20 text-left">
                                <div className="space-y-0.5 font-sans">
                                    <p className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest leading-none font-mono">
                                       {item.subType}
                                    </p>
                                    <h4 className="text-[10px] font-black text-slate-800 line-clamp-1 group-hover:text-slate-900 transition-colors leading-tight">
                                       {item.name}
                                    </h4>
                                 </div>

                                 <div className="flex flex-wrap gap-1">
                                    {getAssetUsageSlots(item).slice(0, 3).map(slot => (
                                      <span key={slot} className="rounded-md bg-indigo-50 px-1.5 py-0.5 text-[7px] font-black leading-none text-indigo-600">
                                         {slot}
                                      </span>
                                    ))}
                                 </div>

                                 <div className="flex flex-wrap gap-0.5">
                                    {item.tags.slice(0, 2).map(tag => (
                                      <span key={tag} className="px-1 py-0.5 bg-white text-slate-500 rounded text-[7px] font-bold border border-slate-100/60 leading-none">
                                         #{tag}
                                      </span>
                                    ))}
                                    {item.tags.length > 2 && <span className="text-[7px] font-bold text-slate-400 leading-none">+{item.tags.length - 2}</span>}
                                 </div>

                                 <div className="mt-auto pt-1.5 border-t border-slate-150/40 flex items-center justify-between text-[8px]">
                                    <div className="flex items-center gap-0.5 text-slate-400 font-bold">
                                       <History className="w-2.5 h-2.5" />
                                       <span>引用 {item.citationCount}次</span>
                                    </div>
                                    <button
                                       type="button"
                                       onClick={(e) => {
                                          e.stopPropagation();
                                          handleCreateIterationAsset(item);
                                       }}
                                       className="inline-flex items-center gap-0.5 rounded-md border border-indigo-100 bg-indigo-50 px-1.5 py-0.5 text-[7.5px] font-black text-indigo-650 opacity-0 transition-all hover:border-indigo-200 hover:bg-indigo-100 group-hover:opacity-100"
                                       title="从该资产创建迭代资产"
                                    >
                                       <RefreshCw className="h-2.5 w-2.5" />
                                       迭代
                                    </button>
                                 </div>
                              </div>
                           </div>
                         );
                      })}
                   </div>
                 )}
              </div>
            )}
         </div>
      </main>
      {selectedDetailItem && (
         <DetailModal
            selectedDetailItem={selectedDetailItem}
            availableAssets={libraryItems}
            getAssetPath={getItemPath}
            onCreateIteration={handleCreateIterationAsset}
            onClose={() => setSelectedDetailItem(null)}
            onSave={(updated) => {
               setLibraryItems(prev => prev.map(item => item.id === selectedDetailItem.id ? updated : item));
               setSelectedDetailItem(updated);
            }}
         />
      )}
       {/* Create Library Modal */}
      {isLibModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
              {/* Modal Header */}
              <div className="h-14 border-b border-slate-100 px-6 flex items-center justify-between shrink-0">
                 <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                       <Plus className="w-4 h-4" />
                    </div>
                    <div>
                       <h3 className="text-xs font-black text-slate-800 tracking-tight">新建微分子资产库</h3>
                       <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-0.5">Create Micro-Asset Library</p>
                    </div>
                 </div>
                 <button 
                   type="button"
                   onClick={() => setIsLibModalOpen(false)}
                   className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all cursor-pointer"
                 >
                    <X className="w-4 h-4" />
                 </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-4">
                 {/* System selection: Component or Fragment */}
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">资产领域系统</label>
                    <div className="grid grid-cols-2 gap-3">
                       {[
                          { value: 'Fragment', label: '片段 (Fragments)', icon: LayoutIcon },
                          { value: 'Component', label: '组件 (Components)', icon: Box }
                       ].map(elem => {
                          const isSel = libSystem === elem.value;
                          const IconComp = elem.icon;
                          return (
                             <button
                                key={elem.value}
                                type="button"
                                onClick={() => {
                                   setLibSystem(elem.value as any);
                                   setLibParentPath([elem.value === 'Fragment' ? '片段' : '组件']);
                                   setLibSelectedAssets([]);
                                }}
                                className={`p-3 rounded-2xl border flex items-center gap-3 transition-all cursor-pointer ${
                                   isSel 
                                      ? 'bg-slate-900 border-slate-900 text-white shadow-md' 
                                      : 'bg-slate-50 hover:bg-slate-100/70 border-slate-150 text-slate-600'
                                }`}
                             >
                                <IconComp className={`w-4 h-4 shrink-0 ${isSel ? 'text-white' : 'text-slate-400'}`} />
                                <span className="text-[11px] font-bold">{elem.label}</span>
                             </button>
                          );
                       })}
                    </div>
                 </div>

                 {/* Parent folder path select */}
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">上级目录路径</label>
                    <select
                       value={libParentPath.join('/')}
                       onChange={(e) => setLibParentPath(e.target.value.split('/'))}
                       className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 font-sans focus:outline-none focus:ring-2 focus:ring-slate-900/15"
                    >
                       {getAllFoldersInTree(folderTree)
                          .filter(f => {
                             const root = f.path[0];
                             const targetRoot = libSystem === 'Fragment' ? '片段' : '组件';
                             return root === targetRoot;
                          })
                          .map(f => (
                             <option key={f.path.join('/')} value={f.path.join('/')}>
                                {f.path.join(' > ')}
                             </option>
                          ))
                       }
                    </select>
                 </div>

                 {/* Library Name Input */}
                  <div className="space-y-3.5 text-left">
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">微分子资产库名称 *</label>
                        <input
                           type="text"
                           placeholder="例如: 智能AI解说, 冰原大厅"
                           value={libName}
                           onChange={(e) => setLibName(e.target.value)}
                           className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-705 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/15"
                        />
                     </div>
                     
                     <div className="p-3.5 bg-indigo-50/50 border border-indigo-100 rounded-2xl">
                        <p className="text-[10px] font-bold text-indigo-700 leading-relaxed font-sans">
                           💡 提示：在此处仅需输入名称即可发起创建。当您新建成功并进入对应页面后，系统会主动引导您首先一键配置该库的专属防冲突前缀及归属标签。
                        </p>
                     </div>
                  </div>

                  {/* Stock materials inclusion picker */}
                 <div className="space-y-2">
                    <div className="flex items-center justify-between">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">选择已有资产导入加入该资产库目录</label>
                       <span className="text-[9px] text-slate-400 font-bold">已选择 {libSelectedAssets.length} 项</span>
                    </div>
                    
                    <div className="border border-slate-150 rounded-2xl overflow-hidden bg-slate-50/50">
                       <div className="p-2.5 bg-slate-100/50 border-b border-slate-150 flex items-center justify-between">
                          <input 
                             type="text" 
                             placeholder="检索可用历史存量资产..." 
                             value={assetSearchQuery}
                             onChange={(e) => setAssetSearchQuery(e.target.value)}
                             className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-[10px] font-bold text-slate-700 placeholder-slate-400 w-full focus:outline-none focus:border-slate-400"
                          />
                       </div>

                       <div className="max-h-[160px] overflow-y-auto no-scrollbar p-2.5 space-y-1.5">
                          {libraryItems
                             .filter(item => {
                                const matchedType = libSystem === 'Fragment' ? 'Fragment' : 'Component';
                                if (item.type !== matchedType) return false;
                                
                                if (assetSearchQuery.trim()) {
                                   return item.name.toLowerCase().includes(assetSearchQuery.toLowerCase()) || item.id.toLowerCase().includes(assetSearchQuery.toLowerCase());
                                }
                                return true;
                             })
                             .map(item => {
                                const isChecked = libSelectedAssets.includes(item.id);
                                return (
                                   <label 
                                      key={item.id} 
                                      className={`flex items-center justify-between p-2 rounded-xl border text-left cursor-pointer transition-all ${
                                         isChecked 
                                            ? 'bg-white border-slate-900 shadow-sm' 
                                            : 'bg-white/40 border-slate-100 hover:bg-white'
                                      }`}
                                   >
                                      <div className="flex items-center gap-2.5 min-w-0">
                                         <input
                                            type="checkbox"
                                            checked={isChecked}
                                            onChange={() => {
                                               if (isChecked) {
                                                  setLibSelectedAssets(prev => prev.filter(id => id !== item.id));
                                               } else {
                                                  setLibSelectedAssets(prev => [...prev, item.id]);
                                               }
                                            }}
                                            className="rounded text-slate-900 focus:ring-slate-900 w-3.5 h-3.5 cursor-pointer accent-slate-900"
                                         />
                                         <div className="min-w-0 col-span-2">
                                            <p className="text-[11px] font-black text-slate-800 line-clamp-1 leading-tight">{item.name}</p>
                                            <div className="flex items-center gap-1.5 mt-0.5 text-[9px] text-slate-400 leading-none">
                                               <span>当前归属: {item.subType}</span>
                                            </div>
                                         </div>
                                      </div>
                                      <span className="text-[9px] font-bold text-slate-400 px-1.5 py-0.5 bg-slate-100 rounded leading-none shrink-0 font-sans">
                                         引用 {item.citationCount}次
                                      </span>
                                   </label>
                                );
                             })
                          }
                          {libraryItems.filter(item => item.type === (libSystem === 'Fragment' ? 'Fragment' : 'Component')).length === 0 && (
                             <p className="text-center text-[10px] font-bold text-slate-400 py-4">无历史资产可关联</p>
                          )}
                       </div>
                    </div>
                 </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-slate-50/50 p-4 border-t border-slate-100 flex items-center justify-end gap-2.5 shrink-0">
                 <button 
                    type="button"
                    onClick={() => setIsLibModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-xl text-[11px] font-bold hover:border-slate-350 transition-all cursor-pointer"
                 >
                    取消
                 </button>
                 <button 
                    type="button"
                    onClick={handleCreateLibrary}
                    className="px-5 py-2 bg-slate-900 text-white hover:bg-black rounded-xl text-[11px] font-black shadow-md hover:shadow-lg transition-all cursor-pointer"
                 >
                    完成并生成资产库
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Upload Material Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
              {/* Modal Header */}
              <div className="h-14 border-b border-slate-100 px-6 flex items-center justify-between shrink-0">
                 <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                       <Plus className="w-4 h-4" />
                    </div>
                    <div>
                       <h3 className="text-xs font-black text-slate-800 tracking-tight">上传广告创意素材</h3>
                       <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-0.5">Upload Asset Module</p>
                    </div>
                 </div>
                 <button 
                   type="button"
                   onClick={() => setIsUploadModalOpen(false)}
                   className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all cursor-pointer"
                 >
                    <X className="w-4 h-4" />
                 </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-4">
                 {/* Unified Material Names Input */}
                 <div className="space-y-1.5 text-left animate-in fade-in duration-200">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-sans mb-1.5">本地附件/素材上传 *</label>
                     <div className="mb-4">
                        {/* File Upload / Attachment Dropzone */}
                        <div
                           onDragOver={(e) => {
                              e.preventDefault();
                              setIsDragging(true);
                           }}
                           onDragLeave={() => setIsDragging(false)}
                           onDrop={(e) => {
                              e.preventDefault();
                              setIsDragging(false);
                              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                                 const filesList = Array.from(e.dataTransfer.files);
                                 const newAttachments = filesList.map(file => {
                                    const sizeMb = file.size / (1024 * 1024);
                                    return {
                                       name: file.name,
                                       size: file.size,
                                       sizeStr: sizeMb < 0.1 ? `${(file.size / 1024).toFixed(1)} KB` : `${sizeMb.toFixed(2)} MB`
                                    };
                                 });
                                 setUploadAttachments(prev => [...prev, ...newAttachments]);
                                 
                                 // Automatically generate or append names in batchNamesText
                                 const namesList = filesList.map(f => {
                                    const dotIdx = f.name.lastIndexOf('.');
                                    return dotIdx > 0 ? f.name.substring(0, dotIdx) : f.name;
                                 });
                                 
                                 setBatchNamesText(prev => {
                                    const currentNames = prev.split('\n').map(n => n.trim()).filter(Boolean);
                                    const updated = [...currentNames, ...namesList];
                                    return updated.join('\n');
                                 });
                              }
                           }}
                           onClick={() => {
                              const fileInput = document.getElementById('attachment-file-input');
                              if (fileInput) fileInput.click();
                           }}
                           className={`border-2 border-dashed rounded-2xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all select-none hover:bg-slate-50/50 ${
                              isDragging ? 'border-zinc-800 bg-slate-100/50' : 'border-slate-205 bg-slate-50/30'
                           }`}
                        >
                           <input
                              id="attachment-file-input"
                              type="file"
                              multiple
                              className="hidden"
                              onChange={(e) => {
                                 if (e.target.files && e.target.files.length > 0) {
                                    const filesList = Array.from(e.target.files);
                                    const newAttachments = filesList.map(file => {
                                       const sizeMb = file.size / (1024 * 1024);
                                       return {
                                          name: file.name,
                                          size: file.size,
                                          sizeStr: sizeMb < 0.1 ? `${(file.size / 1024).toFixed(1)} KB` : `${sizeMb.toFixed(2)} MB`
                                       };
                                    });
                                    setUploadAttachments(prev => [...prev, ...newAttachments]);
                                    
                                    // Automatically generate or append names in batchNamesText
                                    const namesList = filesList.map(f => {
                                       const dotIdx = f.name.lastIndexOf('.');
                                       return dotIdx > 0 ? f.name.substring(0, dotIdx) : f.name;
                                    });
                                    
                                    setBatchNamesText(prev => {
                                       const currentNames = prev.split('\n').map(n => n.trim()).filter(Boolean);
                                       const updated = [...currentNames, ...namesList];
                                       return updated.join('\n');
                                    });
                                 }
                              }}
                           />
                           <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-550 shadow-inner">
                              <Paperclip className="w-4.5 h-4.5 text-slate-500" />
                           </div>
                           <div className="text-center font-sans">
                              <p className="text-[11px] font-bold text-slate-705">将本地素材与创意附件拖拽至此，或 <span className="text-indigo-650 font-black hover:text-indigo-805 hover:underline decoration-1">点击浏览文件</span></p>
                              <p className="text-[9px] text-slate-400 font-bold tracking-tight mt-0.5">支持 MP4, MOV, PNG, JPG, GIF, JSON 等所有格式附件</p>
                            </div>
                         </div>


                        {/* Uploaded Attachments List Display */}
                        {uploadAttachments.length > 0 && (
                           <div className="space-y-1.5 text-left mt-3.5 animate-in fade-in duration-150">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-sans">已添加的附件列表 ({uploadAttachments.length})</label>
                              <div className="border border-slate-110 rounded-2xl max-h-32 overflow-y-auto divide-y divide-slate-100 bg-white no-scrollbar">
                                 {uploadAttachments.map((att, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-2.5 hover:bg-slate-50">
                                       <div className="flex items-center gap-2 min-w-0">
                                          <FileText className="w-4 h-4 text-slate-450 shrink-0" />
                                          <div className="truncate">
                                             <p className="text-[11px] font-bold text-slate-705 truncate font-sans">{att.name}</p>
                                             <p className="text-[8.5px] text-slate-450 font-bold font-mono tracking-wider">{att.sizeStr}</p>
                                          </div>
                                       </div>
                                       <button
                                          type="button"
                                          onClick={(e) => {
                                             e.stopPropagation();
                                             setUploadAttachments(prev => prev.filter((_, i) => i !== idx));
                                             
                                             // Remove from list
                                             const names = batchNamesText.split('\n').map(n => n.trim()).filter(Boolean);
                                             const dotIdx = att.name.lastIndexOf('.');
                                             const nameToDel = dotIdx > 0 ? att.name.substring(0, dotIdx) : att.name;
                                             const updatedNames = names.filter(n => n !== nameToDel);
                                             setBatchNamesText(updatedNames.join('\n'));
                                          }}
                                          className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded transition-all cursor-pointer animate-in fade-in duration-100"
                                       >
                                          <X className="w-3.5 h-3.5" />
                                       </button>
                                    </div>
                                 ))}
                              </div>
                           </div>
                        )}
                     </div>

                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-sans mt-4">素材创意名称 *（随附件自动解析，并支持手动修改）</label>
                    <textarea
                       placeholder="请输入素材名称。每行输入一个创意，若上传单个创意则只输入一行。"
                       value={batchNamesText}
                       onChange={(e) => setBatchNamesText(e.target.value)}
                       className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-3 text-xs font-bold font-sans text-slate-700 min-h-[160px] focus:outline-none focus:ring-2 focus:ring-slate-900/15 placeholder-slate-400"
                    />
                    <p className="text-[10.5px] text-slate-400 font-medium">支持多行输入（批量上传模式），每行代表一个独立的创意素材。</p>
                 </div>

                 {/* Select Leaf Category */}
                 <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-sans">归属资产微分子库 *</label>
                    <select
                       value={selectedUploadFolder}
                       onChange={(e) => setSelectedUploadFolder(e.target.value)}
                       className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/15 cursor-pointer"
                    >
                       {getLeafFolders(folderTree).map(leaf => (
                          <option key={leaf.path.join('/')} value={leaf.name}>
                             {leaf.system === 'Fragment' ? '🎬' : '📦'} {leaf.path.join(' > ')}
                          </option>
                       ))}
                    </select>
                 </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-slate-50/50 p-4 border-t border-slate-100 flex items-center justify-end gap-2.5 shrink-0">
                 <button 
                    type="button"
                    onClick={() => setIsUploadModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-xl text-[11px] font-bold hover:border-slate-350 transition-all cursor-pointer"
                 >
                    取消
                 </button>
                 <button 
                    type="button"
                    onClick={handleUploadAsset}
                    className="px-5 py-2 bg-slate-900 text-white hover:bg-black rounded-xl text-[11px] font-black shadow-md hover:shadow-lg transition-all cursor-pointer"
                 >
                    确认并上传
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Move Material Modal */}
      {isMoveModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
               {/* Modal Header */}
               <div className="h-14 border-b border-slate-100 px-6 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2.5">
                     <div className="w-7 h-7 rounded-lg bg-indigo-650 text-white flex items-center justify-center">
                        <Layers className="w-4 h-4" />
                     </div>
                     <div>
                        <h3 className="text-xs font-black text-slate-805 tracking-tight">批量整理移动资产</h3>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-0.5">Move & Reorganize Module</p>
                     </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setIsMoveModalOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-655 hover:bg-slate-50 rounded-lg transition-all cursor-pointer"
                  >
                     <X className="w-4 h-4" />
                  </button>
               </div>

               {/* Modal Body */}
               <div className="p-6 space-y-5 text-left flex-1 overflow-y-auto no-scrollbar">
                  <div className="bg-slate-55 p-3.5 rounded-2xl border border-slate-100/80">
                     <p className="text-xs font-bold text-slate-600">
                        当前已选择 <strong className="text-indigo-600 font-black">{selectedAssetIds.length}</strong> 个广告资产。
                     </p>
                     <p className="text-[10px] text-slate-400 mt-1">请选择目的微分子库。移动后，这些资产将彻底划归该资产库旗下。</p>
                  </div>

                  {!isCreatingInMove ? (
                     <div className="space-y-4 animate-in fade-in duration-150">
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-sans">选择已有目的微分子库 *</label>
                           <select
                              value={targetMoveFolder}
                              onChange={(e) => setTargetMoveFolder(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-205 rounded-xl px-3 py-2 text-xs font-bold text-slate-705 focus:outline-none focus:ring-2 focus:ring-indigo-600/10 cursor-pointer"
                           >
                              {getLeafFolders(folderTree).map(leaf => (
                                 <option key={leaf.path.join('/')} value={leaf.name}>
                                    {leaf.system === 'Fragment' ? '🎬' : '📦'} {leaf.path.join(' > ')}
                                 </option>
                              ))}
                           </select>
                        </div>

                        <div className="pt-2 text-center">
                           <button
                              type="button"
                              onClick={() => {
                                 setIsCreatingInMove(true);
                                 setNewMoveLibName('');
                                 setNewMoveLibParentPath(['片段']);
                                 setNewMoveLibSystem('Fragment');
                              }}
                              className="text-xs font-black text-indigo-600 hover:text-indigo-805 underline inline-flex items-center gap-1 cursor-pointer"
                           >
                              ➕ 新建目的资产库并移入资产
                           </button>
                        </div>
                     </div>
                  ) : (
                     <div className="space-y-4 animate-in fade-in duration-150">
                        <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/55">
                           <p className="text-[10px] text-indigo-705 font-bold">
                              💡 您正在创建一个全新的资产库并将选中的 {selectedAssetIds.length} 个资产进行存入。
                           </p>
                        </div>

                        <div className="space-y-1.5">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-sans">目的微分子库分类体系 *</label>
                           <select
                              value={newMoveLibSystem}
                              onChange={(e) => {
                                 const sys = e.target.value as 'Fragment' | 'Component';
                                 setNewMoveLibSystem(sys);
                                 setNewMoveLibParentPath(sys === 'Fragment' ? ['片段'] : ['组件']);
                              }}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-705 focus:outline-none cursor-pointer"
                           >
                              <option value="Fragment">🎬 片段分类层级 (Fragments Hierarchy)</option>
                              <option value="Component">📦 组件分类层级 (Components Hierarchy)</option>
                           </select>
                        </div>

                        <div className="space-y-1.5">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-sans">新建目的资产库名称 *</label>
                           <input
                              type="text"
                              placeholder="请输入资产库名称"
                              value={newMoveLibName}
                              onChange={(e) => setNewMoveLibName(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-1.5 text-xs font-bold text-slate-700 focus:outline-none"
                           />
                        </div>

                        <div className="pt-2 text-center">
                           <button
                              type="button"
                              onClick={() => setIsCreatingInMove(false)}
                              className="text-xs font-bold text-slate-500 hover:text-slate-800 underline inline-flex items-center gap-1 cursor-pointer"
                           >
                              🔙 返回选择已有资产库
                           </button>
                        </div>
                     </div>
                  )}
               </div>

               {/* Modal Footer */}
               <div className="bg-slate-50/50 p-4 border-t border-slate-100 flex items-center justify-end gap-2.5 shrink-0">
                  <button 
                     type="button"
                     onClick={() => setIsMoveModalOpen(false)}
                     className="px-4 py-2 border border-slate-205 text-slate-705 bg-white hover:bg-slate-50 rounded-xl text-[11px] font-bold hover:border-slate-350 transition-all cursor-pointer"
                  >
                     取消
                  </button>
                  <button 
                     type="button"
                     onClick={handleBatchMove}
                     className="px-5 py-2 bg-slate-900 text-white hover:bg-black rounded-xl text-[11px] font-black shadow-md hover:shadow-lg transition-all cursor-pointer"
                  >
                     确认并移动
                  </button>
               </div>
            </div>
         </div>
      )}

      {/* Folder Control & Administration Modal */}
      {isFolderControlOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
              {/* Modal Header */}
              <div className="h-14 border-b border-slate-100 px-6 flex items-center justify-between shrink-0">
                 <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                       <MoreHorizontal className="w-4 h-4" />
                    </div>
                    <div>
                       <h3 className="text-xs font-black text-slate-800 tracking-tight">资产库属性信息与安全配置</h3>
                       <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-0.5">Asset Library Properties & Administration</p>
                    </div>
                 </div>
                 <button 
                   type="button"
                   onClick={() => setIsFolderControlOpen(false)}
                   className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all cursor-pointer"
                 >
                    <X className="w-4 h-4" />
                 </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-5 text-left">
                 
                 {/* Basic fields */}
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-sans">资产库名称 *</label>
                    <input
                       type="text"
                       placeholder="请输入创意资产库名称"
                       value={controlNodeName}
                       onChange={(e) => setControlNodeName(e.target.value)}
                       className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/15"
                    />
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-sans">默认初始前缀</label>
                       <input
                          type="text"
                          placeholder="例如: AI-PRE-"
                          value={controlNodePrefix}
                          onChange={(e) => setControlNodePrefix(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-700 placeholder-slate-400 focus:outline-none"
                       />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-sans">默认初始标签 (逗号分隔)</label>
                       <input
                          type="text"
                          placeholder="如: 真人, 冰雪"
                          value={controlNodeTags}
                          onChange={(e) => setControlNodeTags(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-700 placeholder-slate-403 focus:outline-none"
                       />
                    </div>
                 </div>

                 <div className="border-t border-slate-100 pt-4">
                    <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-4 space-y-3">
                       <div className="flex items-start gap-2.5">
                          <Info className="w-4.5 h-4.5 text-rose-500 shrink-0 mt-0.5" />
                          <div>
                             <h4 className="text-[11px] font-black text-slate-800 leading-none">敏感管理员操作：强制删除子资产库</h4>
                             <p className="text-[10px] text-slate-450 font-semibold mt-1 leading-snug">删除该分属资产库为极度高危动作，将永久移除与之关联的分类结构！此动作需要通过超级管理员授权并输入特权凭证。</p>
                          </div>
                       </div>

                       {!showAdminConfirm ? (
                          <button
                             type="button"
                             onClick={() => setShowAdminConfirm(true)}
                             className="w-full py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200/60 text-rose-600 rounded-xl text-[10.5px] font-bold transition-all focus:outline-none flex items-center justify-center gap-1 cursor-pointer"
                          >
                             🔒 解锁删除此资产库
                          </button>
                       ) : (
                          <div className="space-y-3 p-1 animate-in fade-in duration-150">
                             <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block font-sans">超级管理员特权密码确认 *</label>
                                <input
                                   type="password"
                                   placeholder="请输入超级管理员密码（默认：admin）"
                                   value={adminPassword}
                                   onChange={(e) => setAdminPassword(e.target.value)}
                                   className="w-full bg-white border border-rose-200/80 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-rose-200"
                                   autoFocus
                                />
                             </div>
                             <div className="flex gap-2">
                                <button
                                   type="button"
                                   onClick={handleDeleteFolderWithPass}
                                   className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[10.5px] font-black shadow-sm transition-all focus:outline-none cursor-pointer"
                                >
                                   💥 确认强制删除
                                </button>
                                <button
                                   type="button"
                                   onClick={() => {
                                      setShowAdminConfirm(false);
                                      setAdminPassword('');
                                   }}
                                   className="px-4 py-2 border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-500 rounded-xl text-[10.5px] font-bold transition-all focus:outline-none cursor-pointer"
                                >
                                   取消
                                </button>
                             </div>
                          </div>
                       )}
                    </div>
                 </div>

              </div>

              {/* Modal Footer */}
              <div className="bg-slate-50/50 p-4 border-t border-slate-100 flex items-center justify-end gap-2.5 shrink-0">
                 <button 
                    type="button"
                    onClick={() => setIsFolderControlOpen(false)}
                    className="px-4 py-2 border border-slate-205 text-slate-705 bg-white hover:bg-slate-50 rounded-xl text-[11px] font-bold hover:border-slate-350 transition-all cursor-pointer"
                 >
                    放弃保存
                 </button>
                 <button 
                    type="button"
                    onClick={handleSaveFolderControl}
                    className="px-5 py-2 bg-slate-900 text-white hover:bg-black rounded-xl text-[11px] font-black shadow-md hover:shadow-lg transition-all cursor-pointer"
                  >
                     保存资产库配置
                  </button>
               </div>
            </div>
         </div>
       )}
    </div>
  );
};

/* Internal Modal helper components */
const DetailRow = ({ label, value, icon: Icon, mono, badge }: any) => (
  <div className="flex items-center gap-3 group/row p-1 font-sans">
     <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover/row:bg-slate-900 group-hover/row:text-white transition-all shrink-0">
        <Icon className="w-3.5 h-3.5" />
     </div>
     <div className="flex-1 min-w-0">
        <p className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest leading-none">{label}</p>
        {badge ? (
           <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-black border ${
              badge === 'Recommended' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
              badge === 'Not Recommended' ? 'bg-rose-50 text-rose-600 border-rose-100' :
              badge === 'Disabled' ? 'bg-slate-50 text-slate-400 border-slate-100' :
              'bg-amber-50 text-amber-600 border-amber-100'
           }`}>
             {value}
           </span>
        ) : (
           <p className={`text-xs font-bold text-slate-700 mt-1 truncate ${mono ? 'font-mono tracking-tight text-[10.5px]' : ''}`}>{value}</p>
        )}
     </div>
  </div>
);

const MetricBox = ({ label, value, icon: Icon }: any) => (
  <div className="bg-white p-3 flex flex-col gap-1.5 hover:bg-slate-50 transition-colors font-sans">
     <div className="flex items-center gap-1.5 min-w-0">
        <Icon className="w-3 h-3 text-slate-400 shrink-0" />
        <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest line-clamp-1 truncate">{label}</span>
     </div>
     <p className="text-xs font-black text-slate-900 tracking-tight">{value}</p>
  </div>
);

export default AssetLibrary;
