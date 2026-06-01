
import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { 
  ZoomIn, ZoomOut, Maximize, MousePointer2, 
  Play, FileVideo, ChevronRight, Share2, Download,
  Plus, Search, Filter, X
} from 'lucide-react';

interface TreeNodeData {
  id: string;
  name: string;
  type?: 'root' | 'category' | 'master' | 'direction' | 'point' | 'module' | 'iteration';
  videos?: string[];
  previewUrl?: string;
  children?: TreeNodeData[];
}

const INITIAL_TESTING_DATA: TreeNodeData = {
  id: "test-root",
  name: "测试阶段",
  type: 'root',
  children: [
    {
      id: "test-cat-1",
      name: "母版",
      type: 'category',
      children: [
        {
          id: "test-master-1",
          name: "母版1",
          type: 'master',
          previewUrl: "https://picsum.photos/seed/m1/200/120",
          children: [
            {
              id: "test-dir-1",
              name: "复测改动方向1",
              type: 'direction',
              children: [
                { id: "test-pt-1", name: "方向1 - 验证点1", type: 'point', videos: ["视频A", "视频B"] },
                { id: "test-pt-2", name: "方向1 - 验证点2", type: 'point', videos: ["视频C"] }
              ]
            },
            {
              id: "test-dir-2",
              name: "复测改动方向2",
              type: 'direction',
              children: [
                { id: "test-pt-3", name: "方向1 - 验证点1", type: 'point', videos: ["视频D", "视频E"] },
                { id: "test-pt-4", name: "方向1 - 验证点2", type: 'point', videos: ["视频F"] }
              ]
            }
          ]
        }
      ]
    }
  ]
};

const INITIAL_EXISTING_DATA: TreeNodeData = {
  id: "existing-root",
  name: "已有母版",
  type: 'root',
  children: [
    {
      id: "existing-master-1",
      name: "大字报v1",
      type: 'master',
      videos: ["预览视频1", "预览视频2"],
      children: [
        {
          id: "existing-mod-1",
          name: "模块1",
          type: 'module',
          children: [
            { id: "existing-iter-1", name: "迭代1", type: 'iteration', videos: ["视频1", "视频2"] },
            { id: "existing-iter-2", name: "迭代2", type: 'iteration', videos: ["视频3"] }
          ]
        }
      ]
    }
  ]
};

const IterationRecord: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [activeTab, setActiveTab] = useState<'testing' | 'existing'>('testing');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [playingVideo, setPlayingVideo] = useState<{ name: string; id: string } | null>(null);
  
  const [testingData, setTestingData] = useState<TreeNodeData>(INITIAL_TESTING_DATA);
  const [existingData, setExistingData] = useState<TreeNodeData>(INITIAL_EXISTING_DATA);

  const currentData = activeTab === 'testing' ? testingData : existingData;

  // Filter logic
  const filteredData = useMemo(() => {
    if (!searchQuery && filterLevel === 'all') return currentData;

    const filterNode = (node: TreeNodeData): TreeNodeData | null => {
      const matchesSearch = node.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLevel = filterLevel === 'all' || node.type === filterLevel;
      
      const filteredChildren = node.children 
        ? node.children.map(filterNode).filter((n): n is TreeNodeData => n !== null)
        : [];

      if (matchesSearch && matchesLevel) {
        return { ...node, children: filteredChildren };
      }

      if (filteredChildren.length > 0) {
        return { ...node, children: filteredChildren };
      }

      return null;
    };

    return filterNode(currentData) || { ...currentData, children: [] };
  }, [currentData, searchQuery, filterLevel]);

  const addNode = (parentId: string) => {
    const newNode: TreeNodeData = {
      id: `node-${Date.now()}`,
      name: "新节点",
      type: 'iteration',
      children: []
    };

    const updateTree = (node: TreeNodeData): TreeNodeData => {
      if (node.id === parentId) {
        return { ...node, children: [...(node.children || []), newNode] };
      }
      if (node.children) {
        return { ...node, children: node.children.map(updateTree) };
      }
      return node;
    };

    if (activeTab === 'testing') {
      setTestingData(updateTree(testingData));
    } else {
      setExistingData(updateTree(existingData));
    }
  };

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg.append("g");

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 3])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
        setZoomLevel(Math.round(event.transform.k * 100));
      });

    svg.call(zoom);

    const root = d3.hierarchy(filteredData);
    
    // Dynamic node sizing based on content
    const treeLayout = d3.tree<TreeNodeData>().nodeSize([250, 400]);
    treeLayout(root);

    // Links
    g.append("g")
      .attr("fill", "none")
      .attr("stroke", "#cbd5e1")
      .attr("stroke-opacity", 0.4)
      .attr("stroke-width", 1.5)
      .selectAll("path")
      .data(root.links())
      .join("path")
      .attr("d", d3.linkHorizontal<d3.HierarchyLink<TreeNodeData>, d3.HierarchyPointNode<TreeNodeData>>()
        .x(d => d.y)
        .y(d => d.x)
      );

    // Nodes
    const node = g.append("g")
      .selectAll("g")
      .data(root.descendants())
      .join("g")
      .attr("transform", d => `translate(${d.y},${d.x})`);

    // Node content
    node.each(function(d) {
      const el = d3.select(this);
      const isRoot = d.depth === 0;
      const isLeaf = !d.children || d.children.length === 0;
      const data = d.data;

      // Card dimensions
      const cardWidth = 220;
      let cardHeight = 40;
      
      const hasVideos = data.videos && data.videos.length > 0;
      const hasPreview = !!data.previewUrl;

      if (isRoot) {
        if (hasPreview || hasVideos) {
          cardHeight = 160;
        }
      } else {
        if (hasVideos) {
          cardHeight = 40 + (data.videos!.length * 20) + 10;
        }
      }

      // Background card
      el.append("rect")
        .attr("x", 0)
        .attr("y", -cardHeight / 2)
        .attr("width", cardWidth)
        .attr("height", cardHeight)
        .attr("rx", 12)
        .attr("fill", isRoot ? "#0f172a" : "#ffffff")
        .attr("stroke", isRoot ? "#0f172a" : "#e2e8f0")
        .attr("stroke-width", 1)
        .attr("class", "shadow-sm transition-all hover:shadow-md");

      // Title
      el.append("text")
        .attr("x", 12)
        .attr("y", -cardHeight / 2 + 24)
        .attr("fill", isRoot ? "#ffffff" : "#1e293b")
        .attr("font-size", "12px")
        .attr("font-weight", "bold")
        .text(data.name);

      // Add Button
      const addBtn = el.append("g")
        .attr("transform", `translate(${cardWidth - 30}, ${-cardHeight / 2 + 10})`)
        .attr("class", "cursor-pointer group")
        .on("click", (e) => {
          e.stopPropagation();
          addNode(data.id);
        });

      addBtn.append("circle")
        .attr("r", 10)
        .attr("fill", isRoot ? "rgba(255,255,255,0.1)" : "#f1f5f9")
        .attr("class", "group-hover:fill-primary/10 transition-colors");

      addBtn.append("text")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .attr("fill", isRoot ? "#ffffff" : "#64748b")
        .attr("font-size", "14px")
        .attr("font-weight", "bold")
        .text("+");

      // Video Preview ONLY for Root Node
      if (isRoot) {
        if (data.previewUrl || (data.videos && data.videos.length > 0)) {
          const previewWidth = cardWidth - 24;
          const previewHeight = 100;
          
          el.append("rect")
            .attr("x", 12)
            .attr("y", -cardHeight / 2 + 36)
            .attr("width", previewWidth)
            .attr("height", previewHeight)
            .attr("rx", 8)
            .attr("fill", "#f8fafc");

          el.append("image")
            .attr("href", data.previewUrl || `https://picsum.photos/seed/${data.id}/200/120`)
            .attr("x", 12)
            .attr("y", -cardHeight / 2 + 36)
            .attr("width", previewWidth)
            .attr("height", previewHeight)
            .attr("preserveAspectRatio", "xMidYMid slice")
            .attr("style", "clip-path: inset(0% round 8px);");

          // Play button overlay
          el.append("circle")
            .attr("cx", cardWidth / 2)
            .attr("cy", -cardHeight / 2 + 36 + previewHeight / 2)
            .attr("r", 15)
            .attr("fill", "rgba(0,0,0,0.4)")
            .attr("class", "cursor-pointer hover:fill-black/60 transition-colors")
            .on("click", () => {
              setPlayingVideo({ name: data.name, id: data.id });
            });
          
          el.append("path")
            .attr("d", "M-4,-5 L6,0 L-4,5 Z")
            .attr("transform", `translate(${cardWidth / 2}, ${-cardHeight / 2 + 36 + previewHeight / 2})`)
            .attr("fill", "#ffffff")
            .attr("pointer-events", "none");
        }
      } else if (data.videos && data.videos.length > 0) {
        // Videos list as clickable text for non-root nodes
        const videoGroup = el.append("g")
          .attr("transform", `translate(12, ${-cardHeight / 2 + 40})`);
        
        data.videos.forEach((v, i) => {
          const vItem = videoGroup.append("g")
            .attr("transform", `translate(0, ${i * 20})`)
            .attr("class", "cursor-pointer group")
            .on("click", (e) => {
              e.stopPropagation();
              setPlayingVideo({ name: v, id: `${data.id}-${i}` });
            });

          vItem.append("rect")
            .attr("x", -4)
            .attr("y", -12)
            .attr("width", cardWidth - 16)
            .attr("height", 18)
            .attr("rx", 4)
            .attr("fill", "transparent")
            .attr("class", "group-hover:fill-slate-100 transition-colors");

          vItem.append("text")
            .attr("x", 0)
            .attr("y", 2)
            .attr("fill", "#64748b")
            .attr("font-size", "10px")
            .attr("class", "group-hover:fill-primary group-hover:font-bold transition-all")
            .text(`▶ ${v}`);
        });
      }
    });

    // Initial center
    const initialTransform = d3.zoomIdentity.translate(100, height / 2).scale(0.6);
    svg.call(zoom.transform, initialTransform);

  }, [filteredData, activeTab]);

  const handleZoomIn = () => {
    if (!svgRef.current) return;
    d3.select(svgRef.current).transition().call(d3.zoom<SVGSVGElement, unknown>().scaleBy, 1.2);
  };

  const handleZoomOut = () => {
    if (!svgRef.current) return;
    d3.select(svgRef.current).transition().call(d3.zoom<SVGSVGElement, unknown>().scaleBy, 0.8);
  };

  const handleResetZoom = () => {
    if (!svgRef.current || !containerRef.current) return;
    const height = containerRef.current.clientHeight;
    const initialTransform = d3.zoomIdentity.translate(100, height / 2).scale(0.6);
    d3.select(svgRef.current).transition().call(d3.zoom<SVGSVGElement, unknown>().transform, initialTransform);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-slate-900">迭代记录</h2>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button 
                onClick={() => setActiveTab('testing')}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'testing' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                测试阶段
              </button>
              <button 
                onClick={() => setActiveTab('existing')}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'existing' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                已有母版
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-100 rounded-xl p-1 mr-4">
              <button onClick={handleZoomOut} className="p-1.5 text-slate-500 hover:bg-white hover:text-slate-900 rounded-lg transition-all"><ZoomOut className="w-4 h-4" /></button>
              <span className="text-[10px] font-bold text-slate-600 px-2 min-w-[40px] text-center">{zoomLevel}%</span>
              <button onClick={handleZoomIn} className="p-1.5 text-slate-500 hover:bg-white hover:text-slate-900 rounded-lg transition-all"><ZoomIn className="w-4 h-4" /></button>
              <div className="w-px h-4 bg-slate-200 mx-1"></div>
              <button onClick={handleResetZoom} className="p-1.5 text-slate-500 hover:bg-white hover:text-slate-900 rounded-lg transition-all"><Maximize className="w-4 h-4" /></button>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all">
              <Share2 className="w-4 h-4" /> 分享画板
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all">
              <Download className="w-4 h-4" /> 导出
            </button>
          </div>
        </div>

        {/* Toolbar: Search & Filter */}
        <div className="px-6 pb-4 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="搜索节点名称..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select 
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            >
              <option value="all">所有层级</option>
              <option value="master">母版层</option>
              <option value="direction">方向层</option>
              <option value="point">验证点层</option>
              <option value="module">模块层</option>
              <option value="iteration">迭代层</option>
            </select>
          </div>

          <div className="text-[10px] font-bold text-slate-400 ml-auto">
            共 {filteredData.children?.length || 0} 个主分支
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative bg-slate-100 overflow-hidden" ref={containerRef}>
        {/* Grid Background */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#000 1px, transparent 1px)`,
            backgroundSize: `${20 * (zoomLevel / 100)}px ${20 * (zoomLevel / 100)}px`
          }}
        ></div>

        <svg 
          ref={svgRef} 
          className="w-full h-full cursor-grab active:cursor-grabbing"
        />

        {/* Video Player Modal */}
        {playingVideo && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-10">
            <div className="bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-w-4xl w-full h-full max-h-[800px]">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Play className="w-4 h-4 text-primary fill-primary" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{playingVideo.name}</h3>
                </div>
                <button 
                  onClick={() => setPlayingVideo(null)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <div className="flex-1 bg-slate-900 flex items-center justify-center relative group">
                {/* 9:16 Aspect Ratio Container */}
                <div className="h-full aspect-[9/16] bg-black relative shadow-2xl">
                  <img 
                    src={`https://picsum.photos/seed/${playingVideo.id}/1080/1920`}
                    alt="Video Preview"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform cursor-pointer">
                      <Play className="w-8 h-8 text-white fill-white" />
                    </div>
                  </div>
                  {/* Progress Bar Mockup */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                    <div className="h-full bg-primary w-1/3 shadow-[0_0_10px_rgba(var(--primary),0.5)]"></div>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                  <button className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-2">
                    <Download className="w-4 h-4" /> 下载视频
                  </button>
                  <button className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-2">
                    <Share2 className="w-4 h-4" /> 分享
                  </button>
                </div>
                <div className="text-[10px] font-bold text-slate-400">
                  分辨率: 1080 x 1920 (9:16)
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Legend / Controls Overlay */}
        <div className="absolute bottom-6 left-6 flex flex-col gap-2">
          <div className="bg-white/80 backdrop-blur-md border border-slate-200 p-3 rounded-2xl shadow-xl flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
              <MousePointer2 className="w-3 h-3" /> 拖拽移动，滚轮缩放
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
              <Plus className="w-3 h-3" /> 点击节点右上角添加子节点
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IterationRecord;

