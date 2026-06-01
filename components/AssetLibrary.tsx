import React, { useState, useEffect, useMemo } from 'react';
import { 
  Folder, FileText, ChevronRight, ChevronDown, 
  Search, Grid, List, Plus, Filter,
  Play, Tag, History, MoreHorizontal,
  Layout as LayoutIcon, Box, User, Music, Zap, Image as ImageIcon,
  Monitor, Info, BarChart2, DollarSign, Users, MousePointer2,
  Calendar, Link as LinkIcon, Clock, Check, X, ArrowUpRight,
  ExternalLink, PlayCircle, Activity, ArrowUp, ArrowDown, Layers, RefreshCw,
  Paperclip, ClipboardList, Edit3
} from 'lucide-react';
import { LibraryItem } from '../types';

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
  
  // Custom states for Asset Detail View enhancement & direct card play
  const [playingCardId, setPlayingCardId] = useState<string | null>(null);
  const [selectedRatio, setSelectedRatio] = useState<'9:16' | '1:1' | '16:9' | '4:5'>('16:9');
  const [activeDetailTab, setActiveDetailTab] = useState<'performance' | 'relations'>('performance');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  
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
    if (selectedDetailItem) {
      setTempName(selectedDetailItem.name);
      setIsEditingName(false);
    }
  }, [selectedDetailItem]);

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

  const filteredItems = libraryItems.filter(item => {
    const itemPath = getItemPath(item);
    const isInActivePath = isItemInPath(itemPath, currentPath);
    
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      const matchesSearch = item.name.toLowerCase().includes(query) || 
                            item.id.toLowerCase().includes(query) ||
                            item.tags.some(t => t.toLowerCase().includes(query)) ||
                            item.subType.toLowerCase().includes(query);
      return isInActivePath && matchesSearch;
    }
    return isInActivePath;
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
             ) : (!isLeaf && searchQuery.trim() === '') ? (
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
                {sortedItems.length === 0 ? (
                  <div className="h-64 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-400 font-bold font-sans">
                     <Box className="w-10 h-10 text-slate-300 mb-2.5" />
                     <p className="text-xs">该目录下暂无资产数据</p>
                     <p className="text-[10px] text-slate-400 font-normal mt-1">您可以点击右上角“上传素材”来进行添加</p>
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
                                   <p className="text-[8px] font-bold text-slate-400 font-mono tracking-tight leading-none">
                                      {item.id}
                                   </p>
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
                                   <p className="text-slate-350 font-bold">{item.createdAt.split(' ')[0]}</p>
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

      {/* Detail Modal view */}
      {selectedDetailItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
           <div className="w-full max-w-6xl h-[90vh] max-h-[90vh] flex flex-col relative animate-in zoom-in-95 duration-200">
              
              {/* Backing Plate Header tightly immediately above the popup board */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2 pb-4 shrink-0 select-none">
                 <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                       <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 border border-slate-700/60 rounded-md text-[10px] font-bold text-slate-300">
                          <FolderIcon className="w-3 text-indigo-400" />
                          <span>微分子库分类:</span>
                          <span className="text-slate-200 font-extrabold">{getItemPath(selectedDetailItem).join(' / ')}</span>
                       </span>
                       <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 border border-slate-700/60 rounded-md text-[10px] font-mono font-bold text-slate-300">
                          <Layers className="w-3 text-sky-400" />
                          <span>物料资产编号:</span>
                          <span className="text-sky-305 font-extrabold">{selectedDetailItem.id}</span>
                       </span>
                    </div>

                    {/* Editable Asset Name on Backing Plate */}
                    <div className="mt-2.5">
                       {isEditingName ? (
                          <div className="flex items-center gap-2 max-w-xl">
                             <input
                                type="text"
                                value={tempName}
                                onChange={(e) => setTempName(e.target.value)}
                                onKeyDown={(e) => {
                                   if (e.key === 'Enter') {
                                      handleSaveName(selectedDetailItem.id, tempName);
                                      setIsEditingName(false);
                                   } else if (e.key === 'Escape') {
                                      setIsEditingName(false);
                                   }
                                }}
                                className="flex-1 px-3 py-1 bg-white text-slate-900 border border-indigo-200 text-sm font-black rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/80"
                                autoFocus
                             />
                             <button 
                                onClick={() => {
                                   handleSaveName(selectedDetailItem.id, tempName);
                                   setIsEditingName(false);
                                }}
                                className="p-1 px-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                                title="保存"
                             >
                                保存
                             </button>
                             <button 
                                onClick={() => {
                                   setTempName(selectedDetailItem.name);
                                   setIsEditingName(false);
                                }}
                                className="p-1 px-2.5 bg-slate-700 hover:bg-slate-650 text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                                title="取消"
                             >
                                取消
                             </button>
                          </div>
                       ) : (
                          <div className="flex items-center gap-2 group max-w-xl text-left cursor-pointer" onClick={() => setIsEditingName(true)}>
                             <h2 className="text-xl font-black text-white hover:text-indigo-300 transition-colors tracking-tight truncate">
                                {selectedDetailItem.name}
                             </h2>
                             <button className="p-1 text-slate-400 hover:text-white rounded transition-all shrink-0 opacity-0 group-hover:opacity-100">
                                <Edit3 className="w-4 h-4" />
                              </button>
                          </div>
                       )}
                    </div>
                 </div>

                 {/* Top Auxiliary Metadata Info Block */}
                 <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[10px] font-bold text-slate-300 bg-slate-900/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-850">
                       🕒 上传归档日期: {selectedDetailItem.createdAt || '2026-05-21 15:16:48'}
                    </span>
                 </div>
              </div>

              {/* The White Board */}
              <div className="flex-1 bg-white rounded-3xl shadow-2xl border border-slate-150 flex flex-col overflow-hidden relative">
                 {/* Close Button floating right on top of the plate */}
                 <button 
                    onClick={() => {
                       setIsEditingName(false);
                       setSelectedDetailItem(null);
                    }}
                    className="absolute top-5 right-5 z-20 p-2.5 bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-150 rounded-2xl text-slate-500 hover:text-rose-600 shadow-3xs transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    title="关闭弹窗"
                 >
                    <X className="w-5 h-5 stroke-[2.5]" />
                 </button>

                 {/* Modal Inner Content */}
                 <div className="flex-1 overflow-y-auto no-scrollbar p-8 flex flex-col lg:flex-row gap-8">
                 
                 {/* Left Column: Screen-prominent Preview Frame & Attributes Information Grid */}
                 <div className="lg:flex-[6] flex flex-col gap-5 h-full min-w-0">
                    
                    {/* Widescreen / Maximize layout Visual Stage */}
                    <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 flex flex-col items-center justify-center relative overflow-hidden flex-1 min-h-[380px] shadow-2xl">
                       {/* Blurred Ambient Backdrop Glow */}
                       <div className="absolute inset-0 opacity-15 filter blur-3xl scale-150 z-0 pointer-events-none select-none">
                          <img 
                             src={selectedDetailItem.previewUrl} 
                             alt="" 
                             className="w-full h-full object-cover" 
                             referrerPolicy="no-referrer" 
                          />
                       </div>

                       {/* Interactive Render Stage matching ratio perfectly */}
                       <div className="relative w-full h-full flex items-center justify-center z-10">
                          <div className={`shadow-xl border border-white/10 rounded-xl overflow-hidden bg-black flex items-center justify-center transition-all duration-300 max-h-full max-w-full ${
                             selectedRatio === '16:9' ? 'aspect-[16/9] w-full' :
                             selectedRatio === '9:16' ? 'aspect-[9/16] h-[340px] shadow-[0_0_24px_rgba(0,0,0,0.4)]' :
                             selectedRatio === '1:1' ? 'aspect-square h-[340px]' :
                             'aspect-[4/5] h-[340px]'
                          }`}>
                             {selectedDetailItem.sourceFileUrl?.endsWith('.mp4') || selectedDetailItem.sourceFileUrl?.endsWith('.mov') || selectedDetailItem.duration ? (
                                <video 
                                   src={selectedDetailItem.sourceFileUrl} 
                                   controls 
                                   className="w-full h-full object-cover select-none"
                                />
                             ) : (
                                <img 
                                   src={selectedDetailItem.previewUrl} 
                                   alt="" 
                                   className="w-full h-full object-cover select-none"
                                   referrerPolicy="no-referrer"
                                />
                             )}
                          </div>
                       </div>
                    </div>

                    {/* Dimensional aspect ratios presets selector */}
                    <div className="flex items-center justify-between bg-slate-50 border border-slate-150/80 px-4 py-2.5 rounded-2xl shrink-0 font-sans shadow-sm">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">适配规格画布预览</span>
                       <div className="flex bg-slate-200/55 p-1 rounded-xl">
                          {(['9:16', '1:1', '16:9', '4:5'] as const).map(ratio => (
                             <button
                                key={ratio}
                                onClick={() => setSelectedRatio(ratio)}
                                className={`px-4 py-1.5 rounded-lg text-[11px] font-black tracking-wider transition-all cursor-pointer ${
                                   selectedRatio === ratio 
                                      ? 'bg-slate-900 text-white shadow-md' 
                                      : 'text-slate-500 hover:text-slate-900'
                                }`}
                             >
                                {ratio}
                             </button>
                          ))}
                       </div>
                    </div>

                    {/* Auxiliary metadata & asset properties pane: Tags, path, upload date */}
                    <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-150/80 space-y-4 text-left font-sans shadow-sm">
                       {/* Paths & Upload dates */}
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block font-mono">
                                📤 上传归档日期 (Upload Date)
                             </span>
                             <p className="text-xs font-bold text-slate-700 font-mono tracking-tight flex items-center gap-1.5 bg-white px-3 py-2 rounded-xl border border-slate-100">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                {selectedDetailItem.createdAt || '2026-05-21 15:16:48'}
                             </p>
                          </div>
                          
                          <div className="space-y-1">
                             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block font-mono">
                                🎬 视频播放时长 (Duration)
                             </span>
                             <p className="text-xs font-bold text-slate-700 font-mono tracking-tight flex items-center gap-1.5 bg-white px-3 py-2 rounded-xl border border-slate-100">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                {selectedDetailItem.duration || '00:05 秒视频'}
                             </p>
                          </div>
                       </div>

                       {/* File Server Path */}
                       <div className="space-y-1">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block font-mono">
                             💾 存储服务原片路径 (Storage Asset Path)
                          </span>
                          <p className="text-[10px] font-mono font-bold text-slate-600 break-all bg-white px-3 py-2.5 rounded-xl border border-slate-150/50 flex items-center gap-1.5">
                             <LinkIcon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                             <span className="truncate">{selectedDetailItem.sourceFileUrl}</span>
                          </p>
                       </div>

                       {/* Custom Asset Tags */}
                       <div className="space-y-2">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block font-mono">
                             🏷️ 分分子类资产标签 (Asset Tags)
                          </span>
                          <div className="flex flex-wrap gap-1.5 bg-white p-3 rounded-xl border border-slate-150/50">
                             {selectedDetailItem.tags.map(tag => (
                                <span key={tag} className="px-2.5 py-1 bg-slate-50 border border-slate-150 rounded-lg text-[10px] font-sans font-bold text-slate-600 hover:bg-slate-100/50 transition-colors">
                                   #{tag}
                                </span>
                             ))}
                             {selectedDetailItem.tags.length === 0 && (
                                <span className="text-[10px] text-slate-400 font-bold font-sans">暂未匹配标签</span>
                             )}
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Right Column: Tabbed Performance statistics / associated channels, list creatives, and requirements */}
                 <div className="lg:flex-[5] flex flex-col gap-6 h-full min-w-0 font-sans border-l border-slate-100 lg:pl-6">
                    {/* Modern Custom Tabs List Header with active indicators, data status, citation count */}
                    <div className="flex border-b border-slate-155 pb-px gap-2 font-sans overflow-hidden shrink-0 pr-14 lg:pr-0">
                       <button
                          onClick={() => setActiveDetailTab('performance')}
                          className={`pb-3 px-3 text-xs font-black select-none tracking-tight transition-all border-b-2 -mb-px flex items-center gap-1.5 cursor-pointer ${
                             activeDetailTab === 'performance'
                                ? 'border-indigo-650 text-indigo-700'
                                : 'border-transparent text-slate-400 hover:text-slate-700'
                          }`}
                       >
                          <BarChart2 className="w-4 h-4 text-indigo-500 shrink-0" />
                          <span>渠道投放数据</span>
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-md ${
                             selectedDetailItem.status === 'Recommended' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                             selectedDetailItem.status === 'Not Recommended' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                             selectedDetailItem.status === 'Disabled' ? 'bg-slate-50 text-slate-400 border border-slate-100' :
                             'bg-amber-50 text-amber-600 border border-amber-100'
                          }`}>
                             {getStatusText(selectedDetailItem.status)}
                          </span>
                       </button>
                       
                       <button
                          onClick={() => setActiveDetailTab('relations')}
                          className={`pb-3 px-3 text-xs font-black select-none tracking-tight transition-all border-b-2 -mb-px flex items-center gap-1.5 cursor-pointer ${
                             activeDetailTab === 'relations'
                                ? 'border-indigo-650 text-indigo-700'
                                : 'border-transparent text-slate-400 hover:text-slate-700'
                          }`}
                       >
                          <ClipboardList className="w-4 h-4 text-sky-500 shrink-0" />
                          <span>关联创意需求</span>
                          <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                             引用 {selectedDetailItem.citationCount}次
                          </span>
                       </button>
                    </div>

                    {/* Tab Panes content */}
                    {activeDetailTab === 'performance' ? (
                       <div className="flex-1 flex flex-col gap-6 animate-in fade-in duration-150">
                          
                          {/* Channel deliveries in one big flat horizontally scrollable container */}
                          <div className="space-y-2.5 text-left shrink-0">
                             <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                                   ⚡ 投放状态与多渠道汇总 (Horizontally Pinned Channels)
                                </span>
                             </div>

                             <div className="relative group/scroll">
                                <div className="flex gap-4 overflow-x-auto pb-3 snap-x scroll-smooth no-scrollbar scroll-thin">
                                   {getEffectivePerformance(selectedDetailItem).map(perf => (
                                      <div 
                                         key={perf.channel} 
                                         className="bg-slate-50 border border-slate-200 rounded-2xl w-[260px] shrink-0 snap-start shadow-sm flex flex-col overflow-hidden hover:border-indigo-300 hover:shadow-md transition-all duration-200"
                                      >
                                         <div className="px-4 py-2.5 bg-slate-100/50 border-b border-slate-150 flex items-center justify-between shrink-0 font-sans">
                                            <span className="text-[11px] font-extrabold text-slate-800 uppercase flex items-center gap-1.5">
                                               <span className={`w-2 h-2 rounded-full ${
                                                  perf.channel.toLowerCase() === 'applovin' ? 'bg-blue-600' : 
                                                  perf.channel.toLowerCase() === 'facebook' ? 'bg-indigo-600' : 'bg-rose-500'
                                               }`}></span>
                                               {perf.channel}
                                            </span>
                                            <span className="text-[9px] font-bold text-slate-400">实时投放中</span>
                                         </div>

                                         <div className="p-4 grid grid-cols-2 gap-3 flex-1 font-sans">
                                            <div className="space-y-0.5">
                                               <span className="text-[9px] text-slate-400 font-bold tracking-tight">花费总额 (Spent)</span>
                                               <p className="text-sm font-black text-slate-900">${perf.spent?.toLocaleString()}</p>
                                            </div>
                                            <div className="space-y-0.5">
                                               <span className="text-[9px] text-slate-400 font-bold tracking-tight">安装数 (Installs)</span>
                                               <p className="text-sm font-black text-slate-900">{perf.installs?.toLocaleString()}</p>
                                            </div>
                                            <div className="space-y-0.5">
                                               <span className="text-[9px] text-slate-400 font-bold tracking-tight">创意安装率 (IR)</span>
                                               <p className="text-sm font-black text-slate-900">{(perf.ir * 100).toFixed(1)}%</p>
                                            </div>
                                            <div className="space-y-0.5">
                                               <span className="text-[9px] text-slate-400 font-bold tracking-tight">CPI 单价</span>
                                               <p className="text-sm font-black text-indigo-600">${perf.cpi}</p>
                                            </div>
                                            
                                            <div className="space-y-0.5 col-span-2 border-t border-slate-150/60 pt-2 flex items-center justify-between">
                                               <span className="text-[9px] text-slate-400 font-bold">
                                                  付费用户: <strong className="text-slate-700">{perf.paidUsers}人</strong>
                                               </span>
                                               <span className="text-[9px] text-slate-400 font-bold">
                                                  CPA计费: <strong className="text-slate-700">${perf.cpa}</strong>
                                               </span>
                                            </div>
                                         </div>
                                      </div>
                                   ))}
                                </div>
                                {/* Pagination scroll hint element */}
                                <div className="absolute right-1 bottom-0 flex items-center gap-1 opacity-0 group-hover/scroll:opacity-100 transition-opacity">
                                   <span className="text-[9px] text-slate-400 bg-white/90 backdrop-blur-md border border-slate-150 px-2 py-0.5 rounded-md font-bold shadow shadow-slate-100">
                                      向右侧滑动阅览 ⮕
                                   </span>
                                </div>
                             </div>
                          </div>

                          {/* Associated creatives listed sorted by budget spent in descending order */}
                          <div className="flex-1 flex flex-col min-h-[180px] text-left">
                             <div className="flex items-center justify-between mb-2 shrink-0">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-bold leading-none">
                                   🔗 关联广告创意 (已自动按消耗金额倒序排列)
                                </span>
                             </div>

                             <div className="flex-1 border border-slate-150 rounded-2xl overflow-hidden bg-white shadow-sm flex flex-col">
                                <div className="overflow-y-auto overflow-x-hidden no-scrollbar divide-y divide-slate-100 flex-1 max-h-[260px]">
                                   {getMockCreatives(selectedDetailItem).map((cr, idx) => (
                                      <div key={cr.id} className="flex items-center justify-between p-3.5 hover:bg-slate-50/80 transition-all">
                                         <div className="flex items-center gap-3">
                                            <div className="w-6.5 h-6.5 rounded-lg bg-slate-100 text-slate-500 font-mono font-bold flex items-center justify-center text-[10px]">
                                               {idx + 1}
                                            </div>
                                            <div>
                                               <p className="text-xs font-black text-slate-800 tracking-tight font-mono">{cr.id}</p>
                                               <div className="flex items-center gap-1.5 text-[9.5px] font-bold text-slate-405 font-sans leading-none mt-1">
                                                  <span>投放大类:</span>
                                                  <span className="text-slate-600 font-bold uppercase">{cr.channel}</span>
                                               </div>
                                            </div>
                                         </div>
                                         
                                         <div className="text-right">
                                            <p className="text-xs font-black text-slate-900 font-mono">${cr.spent?.toLocaleString()}</p>
                                            <p className="text-[8.5px] text-slate-400 font-bold uppercase leading-none mt-1">
                                               渠道累计消耗
                                            </p>
                                         </div>
                                      </div>
                                   ))}
                                   {getMockCreatives(selectedDetailItem).length === 0 && (
                                      <div className="py-8 text-center text-xs font-bold text-slate-400">
                                         无关联广告创意
                                      </div>
                                   )}
                                </div>
                             </div>
                          </div>
                       </div>
                    ) : (
                       <div className="flex-1 flex flex-col text-left animate-in fade-in duration-150">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 leading-none">
                             📁 关联创意需求汇总 (The Associated Requirement Tracks)
                          </span>
                          
                          <div className="flex-1 border border-slate-150 rounded-2xl overflow-hidden bg-white shadow-sm flex flex-col max-h-[360px]">
                             <div className="overflow-y-auto no-scrollbar divide-y divide-slate-100 flex-1">
                                {(selectedDetailItem.relatedRequirements && selectedDetailItem.relatedRequirements.length > 0
                                   ? selectedDetailItem.relatedRequirements
                                   : ['REQ-20260512-01', 'REQ-20260514-05']
                                ).map((reqId) => {
                                   let seed = 0;
                                   for (let i = 0; i < reqId.length; i++) {
                                      seed += reqId.charCodeAt(i);
                                   }

                                   const titles = [
                                      '冰原大陆前贴片A段高频剪尾替换',
                                      '巨龙满屏冰霜粒子特效与爆率测试',
                                      '引导仙子手指指示转化测试高分包',
                                      '3D太空沙高拟真拟声解压视频剪合',
                                      '真人演绎实测高ROI多场景拼接',
                                      '爆金币福利高亮放大倍率画面剪辑'
                                   ];

                                   const owners = ['安妮拉', '吉世勋', '董小颖', '周若彤'];
                                   const statusOptions = ['Finished', 'In Production', 'Finished', 'Approved'];

                                   const title = titles[seed % titles.length];
                                   const owner = owners[seed % owners.length];
                                   const status = statusOptions[seed % statusOptions.length];

                                   return (
                                      <div key={reqId} className="flex items-center justify-between p-4 hover:bg-slate-50/80 transition-all font-sans">
                                         <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-650 shrink-0">
                                               <ClipboardList className="w-4 h-4 text-indigo-505" />
                                            </div>
                                            <div>
                                               <p className="text-xs font-black text-slate-800 tracking-tight font-sans block">{title}</p>
                                               <div className="flex items-center gap-2 mt-1 text-[9.5px] font-bold text-slate-400">
                                                  <span className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-500 font-black">{reqId}</span>
                                                  <span>•</span>
                                                  <span>产品负责人: {owner}</span>
                                               </div>
                                            </div>
                                         </div>
                                         
                                         <div className="text-right shrink-0 ml-3">
                                            <span className={`inline-block px-2 py-0.5 rounded text-[8.5px] font-black uppercase border ${
                                               status === 'Finished' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                               status === 'Approved' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                               'bg-amber-50 text-amber-600 border-amber-100'
                                            }`}>
                                               {status === 'Finished' ? '完成归档' : status === 'Approved' ? '待执行' : '执行中'}
                                            </span>
                                            <p className="text-[8.5px] text-slate-400 font-medium leading-none mt-1">2026-05-{10 + (seed % 10)}</p>
                                         </div>
                                      </div>
                                   );
                                })}
                             </div>
                          </div>
                       </div>
                    )}
                 </div>
              </div>
           </div>
        </div>
     </div>
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
                                            <div className="flex items-center gap-1.5 mt-0.5 text-[9px] font-mono text-slate-400 leading-none">
                                               <span>ID: {item.id}</span>
                                               <span>•</span>
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
