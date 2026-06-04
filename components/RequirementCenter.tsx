import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Requirement,
  RequirementReqStatus,
  RequirementProdStatus,
  RequirementDeliveryStatus,
  RequirementPriority,
  CreativeSchedule,
  CreativeDifficulty,
  CreativeForm,
  CreativeScenario,
  CreativeDirectionType,
} from "../types";
import { generateRequirements, generateSchedules } from "../services/mockData";
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  ChevronDown,
  Trash2,
  ExternalLink,
  Clock,
  User,
  Filter,
  MoreHorizontal,
  CheckCircle2,
  AlertCircle,
  XCircle,
  X,
  FileEdit,
  Star,
  ChevronLeft,
  ChevronRight,
  ListTodo,
  Inbox,
  Video,
  Image as ImageIcon,
  Gamepad2,
  Layers,
  Layout,
  Play,
  Pause,
  Hammer,
  CheckCircle,
  Calendar,
  ClipboardList,
  PlusCircle,
  Upload,
  Target,
  Compass,
  Award,
  Activity,
  Eye,
  Radio,
  Link2,
  Settings,
} from "lucide-react";
import RequirementDetail from "./RequirementDetail";
import MaterialUpload from "./MaterialUpload";
import { RequirementStageType } from "../types";

interface Producer {
  name: string;
  alias: string;
  group: "美宣-平面" | "美宣-AI" | "美宣-2D" | "美宣-3D" | "程序";
  status: "在职" | "离职";
}

const PRODUCERS: Producer[] = [
  // 美宣-平面 (5人)
  { name: "宋子仪", alias: "szy", group: "美宣-平面", status: "在职" },
  { name: "吕远林", alias: "lyl", group: "美宣-平面", status: "在职" },
  { name: "王金瑞", alias: "wjr", group: "美宣-平面", status: "在职" },
  { name: "王春华", alias: "wch", group: "美宣-平面", status: "离职" },
  { name: "李珊姗", alias: "lss", group: "美宣-平面", status: "离职" },
  // 美宣-AI (1人)
  { name: "宋爽", alias: "ss", group: "美宣-AI", status: "离职" },
  // 美宣-2D (11人)
  { name: "曲冬丽", alias: "qdl", group: "美宣-2D", status: "在职" },
  { name: "张欢", alias: "zh", group: "美宣-2D", status: "在职" },
  { name: "郭峰", alias: "gf", group: "美宣-2D", status: "在职" },
  { name: "王佳鸿", alias: "wjh", group: "美宣-2D", status: "在职" },
  { name: "吴楠", alias: "wn", group: "美宣-2D", status: "在职" },
  { name: "周进易", alias: "zjy", group: "美宣-2D", status: "离职" },
  { name: "邓莉", alias: "dl", group: "美宣-2D", status: "离职" },
  { name: "蒋天宇", alias: "jty", group: "美宣-2D", status: "离职" },
  { name: "张雨学", alias: "zyx", group: "美宣-2D", status: "离职" },
  { name: "张澳", alias: "za", group: "美宣-2D", status: "离职" },
  { name: "朱奇杰", alias: "zqj", group: "美宣-2D", status: "离职" },
  // 美宣-3D (3人)
  { name: "刘洋", alias: "ly", group: "美宣-3D", status: "在职" },
  { name: "孙崇洋", alias: "scy", group: "美宣-3D", status: "在职" },
  { name: "张永进", alias: "zyj", group: "美宣-3D", status: "在职" },
  // 程序 (2人)
  { name: "李嘉鑫", alias: "ljx", group: "程序", status: "在职" },
  { name: "肖环宇", alias: "xhy", group: "程序", status: "在职" }
];

interface PipelineStage {
  name: string;
  status: "pending" | "inprogress" | "completed";
}

function getRequirementPipeline(req: Requirement): PipelineStage[] {
  const is3D = req.has3DPlot || req.name?.toLowerCase().includes("3d") || (req.assetType as string) === "3D" || (req as any).is3DVideo;
  if (req.assetType === "Playable") {
    const idNum = parseInt(req.id.replace(/\D/g, "")) || 0;
    const s1 = idNum % 3 === 0 ? "completed" : idNum % 3 === 1 ? "inprogress" : "pending";
    const s2 = idNum % 3 === 0 ? "inprogress" : idNum % 3 === 1 ? "pending" : "pending";
    const s3 = idNum % 3 === 0 ? "pending" : "pending";
    return [
      { name: "平面", status: s1 },
      { name: "视频", status: s2 },
      { name: "程序", status: s3 },
    ];
  } else if (is3D) {
    const idNum = parseInt(req.id.replace(/\D/g, "")) || 0;
    const s1 = idNum % 2 === 0 ? "completed" : "inprogress";
    const s2 = idNum % 4 === 0 ? "completed" : idNum % 2 === 0 ? "inprogress" : "pending";
    const s3 = idNum % 4 === 0 ? "inprogress" : "pending";
    return [
      { name: "平面", status: s1 },
      { name: "3D", status: s2 },
      { name: "2D", status: s3 },
    ];
  } else {
    const idNum = parseInt(req.id.replace(/\D/g, "")) || 0;
    const s1 = idNum % 2 === 0 ? "completed" : "inprogress";
    const s2 = idNum % 2 === 0 ? "inprogress" : "pending";
    return [
      { name: "平面", status: s1 },
      { name: "2D视频", status: s2 },
    ];
  }
}

function getReqType(req: Requirement): string {
  const is3D = req.has3DPlot || req.name?.toLowerCase().includes("3d") || (req.assetType as string) === "3D" || (req as any).is3DVideo;
  if (req.assetType === "Playable") return "Playable";
  if (is3D) return "3D";
  if (req.assetType === "Image") return "平面";
  return "视频";
}

interface CalendarDay {
  dayNum: number;
  dateString: string;
  isToday: boolean;
  isWeekend: boolean;
  isCurrentMonth: boolean;
}

interface CalendarWeek {
  days: CalendarDay[];
}

function getMonthWeeks(year: number, month: number): CalendarWeek[] {
  const weeks: CalendarWeek[] = [];
  const firstDayOfMonth = new Date(year, month - 1, 1);
  const dayOfWeek = firstDayOfMonth.getDay(); 
  const startOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  
  const startDate = new Date(year, month - 1, 1 - startOffset);
  let currentDate = new Date(startDate);
  
  for (let w = 0; w < 6; w++) {
    const weekDays: CalendarDay[] = [];
    for (let d = 0; d < 7; d++) {
      const yearVal = currentDate.getFullYear();
      const monthVal = currentDate.getMonth() + 1;
      const dayVal = currentDate.getDate();
      const formattedDate = `${yearVal}-${String(monthVal).padStart(2, '0')}-${String(dayVal).padStart(2, '0')}`;
      
      const isToday = yearVal === 2026 && monthVal === 6 && dayVal === 3;
      const dayOfWeekVal = currentDate.getDay();
      const isWeekend = dayOfWeekVal === 0 || dayOfWeekVal === 6;
      const isCurrentMonth = monthVal === month;
      
      weekDays.push({
        dayNum: dayVal,
        dateString: formattedDate,
        isToday,
        isWeekend,
        isCurrentMonth
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    if (w < 5 || weekDays.some(day => day.isCurrentMonth)) {
      weeks.push({ days: weekDays });
    }
  }
  
  return weeks;
}

interface RequirementCenterProps {
  subView?: "coordinated" | "list" | "production" | "upload";
  onSubViewChange?: (
    view: "coordinated" | "list" | "production" | "upload",
  ) => void;
}

const RequirementCenter: React.FC<RequirementCenterProps> = ({
  subView,
  onSubViewChange,
}) => {
  const [localSubView, setLocalSubView] = useState<
    "coordinated" | "list" | "production" | "upload"
  >("coordinated");
  const combinedSubView = subView || localSubView;
  const setCombinedSubView = onSubViewChange || setLocalSubView;
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [requirements, setRequirements] = useState<Requirement[]>(() => {
    const raw = generateRequirements();
    const activeProducersList = PRODUCERS.filter(p => p.status === "在职").map(p => p.name);
    const difficultyOptions: ("S" | "A" | "B" | "C")[] = ["S", "A", "B", "C"];
    return raw.map((r, i) => {
      const prodName =
        r.productionPersonnel && r.productionPersonnel[0]
          ? r.productionPersonnel[0]
          : activeProducersList[i % activeProducersList.length];
      const diff =
        r.difficulty || difficultyOptions[i % difficultyOptions.length];

      const startDay = 1 + (i % 6) * 4 + (i % 2);
      const spanDays =
        diff === "S" ? 4 : diff === "A" ? 3 : diff === "B" ? 2 : 1;
      const endDay = startDay + spanDays;

      const startDateStr = `2026-06-${startDay < 10 ? "0" + startDay : startDay}`;
      const endDateStr = `2026-06-${endDay < 10 ? "0" + endDay : endDay}`;
      return {
        ...r,
        difficulty: diff,
        productionPersonnel: [prodName],
        startDate: (r as any).startDate || startDateStr,
        endDate: (r as any).endDate || endDateStr,
      };
    });
  });
  const [schedules, setSchedules] =
    useState<CreativeSchedule[]>(generateSchedules());

  // States belonging to Production Scheduling Board
  const [selectedProducer, setSelectedProducer] = useState<string>("张欢");
  const [productionView, setProductionView] = useState<"calendar" | "gantt">(
    "calendar",
  );
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);

  // Calendar Year and Month states
  const [calendarYear, setCalendarYear] = useState<number>(2026);
  const [calendarMonth, setCalendarMonth] = useState<number>(6);

  // Group collapsed states for the personnel side menu
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({
    "美宣-平面": false,
    "美宣-AI": false,
    "美宣-2D": false,
    "美宣-3D": false,
    "程序": false,
  });

  const handlePrevMonth = () => {
    if (calendarMonth === 1) {
      setCalendarMonth(12);
      setCalendarYear((prev) => prev - 1);
    } else {
      setCalendarMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (calendarMonth === 12) {
      setCalendarMonth(1);
      setCalendarYear((prev) => prev + 1);
    } else {
      setCalendarMonth((prev) => prev + 1);
    }
  };

  // Work hours for S, A, B, C difficulty level per designer and production type
  const [difficultyWorkHours, setDifficultyWorkHours] = useState<
    Record<string, Record<string, Record<string, number>>>
  >(() => {
    const hours: Record<string, Record<string, Record<string, number>>> = {};
    const productionTypes = ["视频", "Playable", "3D", "平面"];
    PRODUCERS.forEach((prod) => {
      hours[prod.name] = {};
      productionTypes.forEach((type) => {
        if (type === "视频") {
          hours[prod.name][type] = { S: 4, A: 3, B: 2, C: 1 };
        } else if (type === "Playable") {
          hours[prod.name][type] = { S: 5, A: 4, B: 3, C: 2 };
        } else if (type === "3D") {
          hours[prod.name][type] = { S: 6, A: 4.5, B: 3, C: 1.5 };
        } else {
          hours[prod.name][type] = { S: 3, A: 2, B: 1.5, C: 1 };
        }
      });
    });
    return hours;
  });

  // Priority weights for S, A, B, C difficulty level per designer and production type
  const [difficultyPriorityWeights, setDifficultyPriorityWeights] = useState<
    Record<string, Record<string, Record<string, number>>>
  >(() => {
    const weights: Record<string, Record<string, Record<string, number>>> = {};
    const productionTypes = ["视频", "Playable", "3D", "平面"];
    PRODUCERS.forEach((prod) => {
      weights[prod.name] = {};
      productionTypes.forEach((type) => {
        if (prod.status === "在职") {
          if (prod.name === "张欢") {
            weights[prod.name][type] = { S: 9, A: 8, B: 7, C: 6 };
          } else if (prod.name === "吴楠") {
            weights[prod.name][type] = { S: 8, A: 7, B: 6, C: 5 };
          } else {
            weights[prod.name][type] = { S: 5, A: 4, B: 3, C: 2 };
          }
        } else {
          weights[prod.name][type] = { S: 1, A: 1, B: 1, C: 1 };
        }
      });
    });
    return weights;
  });

  const [showResignedProducers, setShowResignedProducers] = useState<boolean>(false);
  const [configModalTab, setConfigModalTab] = useState<"hours" | "weights">("hours");

  // Assign priority for S, A, B, C difficulty level per designer
  const [difficultyPriorities, setDifficultyPriorities] = useState<
    Record<string, string[]>
  >(() => {
    const activeNames = PRODUCERS.filter((p) => p.status === "在职").map((p) => p.name);
    return {
      S: activeNames,
      A: activeNames,
      B: activeNames,
      C: activeNames,
    };
  });
  const [selectedReq, setSelectedReq] = useState<Requirement | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMoreDropdown, setShowMoreDropdown] = useState(false);
  const [showScheduleSelector, setShowScheduleSelector] = useState(false);
  const [expandedGanttRelations, setExpandedGanttRelations] = useState<Record<string, boolean>>({});
  const [expandedPostReqs, setExpandedPostReqs] = useState<Record<string, boolean>>({});
  const ganttContainerRef = useRef<HTMLDivElement>(null);

  const scrollGantt = (direction: "left" | "right") => {
    if (ganttContainerRef.current) {
      const scrollAmount = 440; // 10 days scroll width
      ganttContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  // Clean states for combined layout
  const weekRanges = useMemo(() => {
    const ranges = Array.from(
      new Set(schedules.map((s) => s.weekRange)),
    ).filter(Boolean);
    return ranges.sort();
  }, [schedules]);

  const weekStatusMap = useMemo(() => {
    const statusMap: Record<string, "completed" | "inprogress"> = {};
    weekRanges.forEach((w) => {
      const weekSchedules = schedules.filter((s) => s.weekRange === w);
      if (weekSchedules.length === 0) {
        statusMap[w] = "completed";
        return;
      }
      let hasRequirements = false;
      let allCompleted = true;
      weekSchedules.forEach((s) => {
        const aReqs = requirements.filter((r) => r.scheduleId === s.id);
        if (aReqs.length > 0) {
          hasRequirements = true;
          if (!aReqs.every((r) => r.prodStatus === "Completed")) {
            allCompleted = false;
          }
        } else if ((s.totalRequiredCount || 0) > 0) {
          allCompleted = false;
        }
      });
      statusMap[w] =
        hasRequirements && allCompleted ? "completed" : "inprogress";
    });
    return statusMap;
  }, [weekRanges, schedules, requirements]);

  const { inProgressWeeks, completedWeeks } = useMemo(() => {
    const inProgress: string[] = [];
    const completed: string[] = [];
    weekRanges.forEach((w) => {
      if (weekStatusMap[w] === "completed") {
        completed.push(w);
      } else {
        inProgress.push(w);
      }
    });
    return { inProgressWeeks: inProgress, completedWeeks: completed };
  }, [weekRanges, weekStatusMap]);

  const [selectedWeekRange, setSelectedWeekRange] = useState<string>("");
  const [selectedWeekRanges, setSelectedWeekRanges] = useState<string[]>([]);
  const [currentSort, setCurrentSort] = useState<
    "priority" | "form" | "progress" | "broadDirection" | "none"
  >("none");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [collapsedDirections, setCollapsedDirections] = useState<
    Record<string, boolean>
  >({});

  // Filter states
  const [filters, setFilters] = useState({
    materialStage: "全部",
    broadDirection: "全部",
    creativePersonnel: "全部",
    priority: "全部",
    reqStatus: "全部",
    prodStatus: "全部",
    assetType: "全部",
  });

  const visibleSchedules = useMemo(() => {
    let list = schedules.filter((s) => s.weekRange === selectedWeekRange);
    if (filters.creativePersonnel !== "全部") {
      list = list.filter((s) => s.owner === filters.creativePersonnel);
    }
    if (filters.assetType !== "全部") {
      list = list.filter((s) => s.form === filters.assetType);
    }
    if (filters.broadDirection !== "全部") {
      list = list.filter((s) => s.broadDirection === filters.broadDirection);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter((s) => {
        const matchDir =
          s.directionName?.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q);
        const associated = requirements.filter((r) => r.scheduleId === s.id);
        const matchReq = associated.some(
          (r) =>
            r.id.toLowerCase().includes(q) || r.name.toLowerCase().includes(q),
        );
        return matchDir || matchReq;
      });
    }
    if (currentSort !== "none") {
      list = [...list].sort((a, b) => {
        let comparison = 0;
        if (currentSort === "priority") {
          const priorityOrder = { Highest: 4, High: 3, Mid: 2, Low: 1, "": 0 };
          const aVal =
            priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
          const bVal =
            priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
          comparison = aVal - bVal;
        } else if (currentSort === "form") {
          comparison = (a.form || "").localeCompare(b.form || "");
        } else if (currentSort === "progress") {
          const aReqs = requirements.filter((r) => r.scheduleId === a.id);
          const aCompleted = aReqs.filter(
            (r) => r.prodStatus === "Completed",
          ).length;
          const aPercent = aReqs.length > 0 ? aCompleted / aReqs.length : 0;
          const bReqs = requirements.filter((r) => r.scheduleId === b.id);
          const bCompleted = bReqs.filter(
            (r) => r.prodStatus === "Completed",
          ).length;
          const bPercent = bReqs.length > 0 ? bCompleted / bReqs.length : 0;
          comparison = aPercent - bPercent;
        } else if (currentSort === "broadDirection") {
          comparison = (a.broadDirection || "").localeCompare(
            b.broadDirection || "",
          );
        }
        return sortOrder === "asc" ? comparison : -comparison;
      });
    }
    return list;
  }, [
    schedules,
    selectedWeekRange,
    filters,
    currentSort,
    sortOrder,
    searchQuery,
    requirements,
  ]);

  useEffect(() => {
    if (weekRanges.length > 0) {
      if (!selectedWeekRange || !weekRanges.includes(selectedWeekRange)) {
        setSelectedWeekRange(weekRanges[0]);
      }
      if (selectedWeekRanges.length === 0) {
        setSelectedWeekRanges(weekRanges);
      }
    }
  }, [weekRanges, selectedWeekRange, selectedWeekRanges]);

  const toggleDirection = (id: string) => {
    setCollapsedDirections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddRequirementForDirection = (scheduleId: string) => {
    const schedule = schedules.find((s) => s.id === scheduleId);
    if (!schedule) return;

    const newReqIdx = requirements.length + 1;
    const newReq: Requirement = {
      id: `cp${3377 + newReqIdx}-01`,
      scheduleId: schedule.id,
      name: `新创意需求 - ${schedule.directionName}`,
      assetType: schedule.form || "Video",
      assetIndex: 3377 + newReqIdx,
      assetVersion: "01",
      projectName: "Panthia",
      materialStage: "新",
      broadDirection: schedule.directionType?.includes("3D")
        ? "3D玩法"
        : "原始玩法",
      creativePersonnel: schedule.owner,
      productionPersonnel: ["张欢"],
      language: "en",
      channels: ["all"],
      testDirections: ["前贴"],
      dimensions: ["9:16"],
      previews: [`https://picsum.photos/100/100?random=${newReqIdx}`],
      duration: "0:30",
      goal: "新增具体创意需求描述",
      template: "A+B",
      has3DPlot: schedule.directionType?.includes("3D") || false,
      direction: schedule.directionName,
      owner: schedule.owner,
      priority: schedule.priority || "Mid",
      reqStatus: "Draft",
      prodStatus: "Scheduled",
      deliveryStatus: "Paused",
      status: "Draft",
      rating: 0,
      createdAt: new Date().toISOString().slice(0, 19).replace("T", " "),
      completedAt: "",
      stageType: "Original Gameplay",
      script: "",
      aTags: [],
      bTags: [],
      difficulty: "C",
      tasks: [],
    };
    setRequirements([newReq, ...requirements]);
    setSelectedReq(newReq);
  };

  const [activeFilterDropdown, setActiveFilterDropdown] = useState<
    string | null
  >(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  const filterConfigs = [
    {
      key: "materialStage",
      label: "素材阶段",
      options: ["全部", "新", "老", "迭"],
    },
    {
      key: "broadDirection",
      label: "大方向",
      options: ["全部", "大字报", "原始玩法", "3D玩法"],
    },
    {
      key: "creativePersonnel",
      label: "创意人员",
      options: ["全部", "唐欣怡", "吉意煊", "马嘉良"],
    },
    {
      key: "priority",
      label: "优先级",
      options: ["全部", "Low", "Mid", "High", "Highest"],
    },
    {
      key: "reqStatus",
      label: "需求状态",
      options: ["全部", "Draft", "Pending", "Approved", "Modification"],
    },
    {
      key: "prodStatus",
      label: "制作状态",
      options: ["全部", "Scheduled", "InProgress", "Completed"],
    },
  ];

  const [showAddWeekPopup, setShowAddWeekPopup] = useState(false);
  const [newWeekRange, setNewWeekRange] = useState("");
  const [viewingSpecificRequirements, setViewingSpecificRequirements] =
    useState<Requirement[] | null>(null);
  const [selectedScheduleForModal, setSelectedScheduleForModal] =
    useState<CreativeSchedule | null>(null);
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(
    null,
  );

  const [showWeekFilterDropdown, setShowWeekFilterDropdown] = useState(false);
  const weekFilterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        weekFilterRef.current &&
        !weekFilterRef.current.contains(event.target as Node)
      ) {
        setShowWeekFilterDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedScheduleForModal(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filteredRequirements = useMemo(() => {
    const list = requirements.filter((r) => {
      const matchSearch =
        !searchQuery ||
        r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStage =
        filters.materialStage === "全部" ||
        r.materialStage === filters.materialStage;
      const matchDirection =
        filters.broadDirection === "全部" ||
        r.broadDirection === filters.broadDirection;
      const matchCreative =
        filters.creativePersonnel === "全部" ||
        r.creativePersonnel === filters.creativePersonnel;
      const matchPriority =
        filters.priority === "全部" || r.priority === filters.priority;
      const matchReqStatus =
        filters.reqStatus === "全部" || r.reqStatus === filters.reqStatus;
      const matchProdStatus =
        filters.prodStatus === "全部" || r.prodStatus === filters.prodStatus;

      return (
        matchSearch &&
        matchStage &&
        matchDirection &&
        matchCreative &&
        matchPriority &&
        matchReqStatus &&
        matchProdStatus
      );
    });

    // Handle hierarchy for display
    const roots = list.filter((r) => !r.parentId);
    const result: (Requirement & { level: number })[] = [];

    const flatten = (req: Requirement, level: number) => {
      result.push({ ...req, level });
      const children = list.filter((c) => c.parentId === req.id);
      children.forEach((c) => flatten(c, level + 1));
    };

    roots.forEach((r) => flatten(r, 0));
    return result;
  }, [requirements, searchQuery, filters]);

  const handleAddSubRequirement = (
    parent: Requirement,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    const newReq: Requirement = {
      id: `${parent.id}-sub${Math.floor(Math.random() * 100)}`,
      parentId: parent.id,
      scheduleId: parent.scheduleId,
      name: `子需求 - ${parent.name}`,
      assetType: parent.assetType,
      assetIndex: parent.assetIndex,
      assetVersion: `${parseInt(parent.assetVersion) + 1}`.padStart(2, "0"),
      projectName: parent.projectName,
      materialStage: parent.materialStage,
      broadDirection: parent.broadDirection,
      creativePersonnel: parent.creativePersonnel,
      productionPersonnel: parent.productionPersonnel,
      language: parent.language,
      channels: parent.channels,
      testDirections: parent.testDirections,
      dimensions: parent.dimensions,
      previews: [],
      owner: parent.owner,
      duration: "0:30",
      goal: "子需求描述",
      template: parent.template,
      has3DPlot: parent.has3DPlot,
      direction: parent.direction,
      priority: parent.priority,
      reqStatus: "Draft",
      prodStatus: "Scheduled",
      deliveryStatus: "Paused",
      status: "Draft",
      rating: 0,
      createdAt: new Date().toISOString().slice(0, 19).replace("T", " "),
      completedAt: "",
      stageType: parent.stageType,
      script: "",
      aTags: [],
      bTags: [],
      difficulty: "C",
      tasks: [],
    };
    setRequirements([newReq, ...requirements]);
    setSelectedReq(newReq);
  };

  const handleAddRequirementFromSchedule = (scheduleId: string) => {
    const schedule = schedules.find((s) => s.id === scheduleId);
    if (!schedule) return;

    const newReq: Requirement = {
      id: `cp${3377 + requirements.length}-01`,
      name: `${schedule.directionName} - 需求`,
      assetType: schedule.form as any,
      assetIndex: 3377 + requirements.length,
      assetVersion: "01",
      projectName: "Panthia",
      materialStage: "新",
      broadDirection: schedule.directionType.includes("3D")
        ? "3D玩法"
        : "原始玩法",
      creativePersonnel: schedule.owner,
      productionPersonnel: ["张欢"],
      language: "en",
      channels: ["all"],
      testDirections: ["前贴"],
      dimensions: ["916"],

      duration: "0:30",
      goal: "根据创意排期新建",
      template: "A+B",
      has3DPlot: schedule.directionType.includes("3D"),
      direction: schedule.directionName,
      owner: schedule.owner,
      priority: schedule.priority,
      reqStatus: "Draft",
      prodStatus: "Scheduled",
      deliveryStatus: "Paused",
      status: "Draft",
      rating: 0,
      createdAt: new Date().toISOString().slice(0, 19).replace("T", " "),
      completedAt: "",
      stageType: "Original Gameplay",
      script: "",
      aTags: [],
      bTags: [],
      difficulty: "C",
      tasks: [],
      scheduleId: schedule.id,
      previews: [`https://picsum.photos/100/100?random=${requirements.length}`],
    };

    setRequirements([newReq, ...requirements]);
    setSelectedReq(newReq);
    setShowScheduleSelector(false);
    setCombinedSubView("list");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowMoreDropdown(false);
      }
      if (
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(event.target as Node)
      ) {
        setActiveFilterDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getStatusStyle = (status: RequirementReqStatus) => {
    switch (status) {
      case "Approved":
        return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "Pending":
        return "bg-amber-50 text-amber-600 border-amber-100";
      case "Modification":
        return "bg-orange-50 text-orange-600 border-orange-100";
      default:
        return "bg-slate-50 text-slate-500 border-slate-100";
    }
  };

  const getProdStatusStyle = (status: RequirementProdStatus) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "InProgress":
        return "bg-blue-50 text-blue-600 border-blue-100";
      case "Scheduled":
        return "bg-slate-50 text-slate-500 border-slate-100";
      default:
        return "bg-slate-50 text-slate-500 border-slate-100";
    }
  };

  const getWeekRange = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "Other";
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Monday
    const monday = new Date(date.setDate(diff));
    const nextMonday = new Date(date.setDate(diff + 7));

    const formatDate = (d: Date) => d.toISOString().split("T")[0];
    return `${formatDate(monday)} ~ ${formatDate(nextMonday)}`;
  };

  const addScheduleRow = (weekRange?: string, atTop: boolean = false) => {
    const defaultWeek = weekRange || "2026-05-20 ~ 2026-05-27";
    const newSchedule: CreativeSchedule = {
      id: `sched-new-${Date.now()}`,
      weekRange: defaultWeek,
      directionName: "新方向",
      priority: "" as any,
      difficulty: "" as any,
      form: "" as any,
      scenario: "" as any,
      directionType: "" as any,
      validCount: 0,
      totalRequiredCount: 0,
      submittedCount: 0,
      owner: "唐欣怡",
      requirementStart: "",
      requirementEnd: "",
      productionEnd: "",
    };
    if (atTop) {
      setSchedules([newSchedule, ...schedules]);
    } else {
      setSchedules([...schedules, newSchedule]);
    }
  };

  const updateSchedule = (id: string, updates: Partial<CreativeSchedule>) => {
    setSchedules((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const updated = { ...s, ...updates };
          // If requirementEnd changed, automatically determine the weekRange
          if (updates.requirementEnd) {
            updated.weekRange = getWeekRange(updates.requirementEnd);
          }
          return updated;
        }
        return s;
      }),
    );
  };

  const getPriorityStyle = (priority: RequirementPriority) => {
    switch (priority) {
      case "Highest":
        return "bg-rose-600 text-white";
      case "High":
        return "bg-rose-500 text-white";
      case "Mid":
        return "bg-amber-500 text-white";
      case "Low":
        return "bg-emerald-500 text-white";
      default:
        return "bg-slate-300 text-white";
    }
  };

  const updateRequirement = (id: string, updates: Partial<Requirement>) => {
    setRequirements((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    );
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("确定删除该需求吗？")) {
      setRequirements((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const [collapsedWeeks, setCollapsedWeeks] = useState<Record<string, boolean>>(
    {},
  );
  const [scheduleSearchQuery, setScheduleSearchQuery] = useState("");
  const [scheduleFilters, setScheduleFilters] = useState({
    priority: "全部",
    difficulty: "全部",
    form: "全部",
    scenario: "全部",
    directionType: "全部",
    owner: "全部",
  });

  const PRIORITY_ORDER = { Highest: 0, High: 1, Mid: 2, Low: 3, "": 4 };

  const groupedSchedules = useMemo(() => {
    const filtered = schedules.filter((s) => {
      const matchSearch =
        !scheduleSearchQuery ||
        requirements.some(
          (r) =>
            r.scheduleId === s.id &&
            r.id.toLowerCase().includes(scheduleSearchQuery.toLowerCase()),
        );

      const matchWeek = filters.materialStage === "全部" || true; // Placeholder for week filter if needed
      const matchPriority =
        scheduleFilters.priority === "全部" ||
        s.priority === scheduleFilters.priority;
      const matchDifficulty =
        scheduleFilters.difficulty === "全部" ||
        s.difficulty === scheduleFilters.difficulty;
      const matchForm =
        scheduleFilters.form === "全部" || s.form === scheduleFilters.form;
      const matchScenario =
        scheduleFilters.scenario === "全部" ||
        s.scenario === scheduleFilters.scenario;
      const matchType =
        scheduleFilters.directionType === "全部" ||
        s.directionType === scheduleFilters.directionType;
      const matchOwner =
        scheduleFilters.owner === "全部" || s.owner === scheduleFilters.owner;

      return (
        matchSearch &&
        matchPriority &&
        matchDifficulty &&
        matchForm &&
        matchScenario &&
        matchType &&
        matchOwner
      );
    });

    const groups: Record<string, CreativeSchedule[]> = {};
    filtered.forEach((s) => {
      if (!groups[s.weekRange]) groups[s.weekRange] = [];
      groups[s.weekRange].push(s);
    });

    // Sort within each week by priority
    Object.keys(groups).forEach((week) => {
      groups[week].sort((a, b) => {
        const valA =
          PRIORITY_ORDER[a.priority as keyof typeof PRIORITY_ORDER] ?? 99;
        const valB =
          PRIORITY_ORDER[b.priority as keyof typeof PRIORITY_ORDER] ?? 99;
        return valA - valB;
      });
    });

    // Sort groups by week range
    const sortedWeeks = Object.keys(groups).sort();
    const sortedGroups: Record<string, CreativeSchedule[]> = {};
    sortedWeeks.forEach((week) => {
      sortedGroups[week] = groups[week];
    });

    return sortedGroups;
  }, [schedules, scheduleFilters]);

  const toggleWeek = (week: string) => {
    setCollapsedWeeks((prev) => ({ ...prev, [week]: !prev[week] }));
  };

  const handleAddWeek = () => {
    if (!newWeekRange) return;
    // Add a dummy schedule for that week to make the row appear
    addScheduleRow(newWeekRange);
    setShowAddWeekPopup(false);
    setNewWeekRange("");
  };

  const getDifficultyStyle = (difficulty: CreativeDifficulty) => {
    switch (difficulty) {
      case "Senior":
        return "bg-purple-50 text-purple-600 border-purple-100";
      case "Junior":
        return "bg-blue-50 text-blue-600 border-blue-100";
      case "Test":
        return "bg-amber-50 text-amber-600 border-amber-100";
      default:
        return "bg-slate-50 text-slate-600";
    }
  };

  const getFormConfig = (form: CreativeForm) => {
    switch (form) {
      case "Video":
        return {
          icon: Video,
          color: "bg-indigo-50 text-indigo-600 border-indigo-100",
        };
      case "Playable":
        return {
          icon: Gamepad2,
          color: "bg-emerald-50 text-emerald-600 border-emerald-100",
        };
      case "Image":
        return {
          icon: ImageIcon,
          color: "bg-orange-50 text-orange-600 border-orange-100",
        };
      default:
        return {
          icon: null,
          color: "bg-slate-50 text-slate-400 border-slate-100",
        };
    }
  };

  const getScenarioStyle = (scenario: CreativeScenario) => {
    switch (scenario) {
      case "Standard":
        return "bg-slate-100 text-slate-600";
      case "Localized":
        return "bg-sky-50 text-sky-600 border-sky-200";
      case "ASO":
        return "bg-pink-50 text-pink-600 border-pink-200";
      default:
        return "bg-slate-50";
    }
  };

  const getDirectionTypeStyle = (type: CreativeDirectionType) => {
    if (type.startsWith("Original"))
      return "bg-teal-50 text-teal-700 border-teal-200";
    if (type.startsWith("Scaling"))
      return "bg-indigo-50 text-indigo-700 border-indigo-200";
    if (type.startsWith("Test"))
      return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-slate-100 text-slate-600";
  };

  const getDifficultyLabel = (difficulty: CreativeDifficulty) => {
    switch (difficulty) {
      case "Senior":
        return "高级";
      case "Junior":
        return "初级";
      case "Test":
        return "测试";
      default:
        return difficulty;
    }
  };

  const getDirectionTypeLabel = (type: CreativeDirectionType) => {
    switch (type) {
      case "Original-Gameplay":
        return "原创-玩法";
      case "Original-Hook":
        return "原创-吸量";
      case "Original-Master":
        return "原创-母版";
      case "Scaling-Iteration":
        return "放量-迭代";
      case "Scaling-Editing":
        return "放量-剪辑";
      case "Test-Hook":
        return "测试-吸量";
      case "Test-Gameplay":
        return "测试-玩法";
      default:
        return type;
    }
  };

  return (
    <div className="w-full flex bg-slate-50/50 min-h-screen">
      {/* 主内容区域 */}
      <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
        {combinedSubView === "upload" ? (
          <MaterialUpload />
        ) : (
          <>
            {/* 当选择“协同看板”时 */}
            {combinedSubView === "coordinated" ? (
              <div className="flex-1 flex flex-col gap-3 overflow-hidden">
                {/* 周期切换与全局搜索与过滤 */}
                <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-3">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1 no-scrollbar max-w-full sm:max-w-[75%] md:max-w-[80%]">
                      <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-indigo-505" />{" "}
                        运行周期 (Period Target):
                      </span>
                      {weekRanges.map((w) => {
                        const isActive = selectedWeekRange === w;
                        const status = weekStatusMap[w] || "inprogress";
                        return (
                          <button
                            key={w}
                            onClick={() => {
                              setSelectedWeekRange(w);
                              setSelectedWeekRanges([w]);
                            }}
                            className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition-all border outline-none shrink-0 flex items-center gap-1.5 ${
                              isActive
                                ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/15"
                                : "bg-white text-slate-705 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                status === "completed"
                                  ? "bg-emerald-500"
                                  : "bg-amber-500"
                              }`}
                            />
                            <span className="font-mono">{w}</span>
                          </button>
                        );
                      })}

                      <button
                        onClick={() => setShowAddWeekPopup(true)}
                        className="px-2.5 py-1.5 bg-slate-50 border border-dashed border-slate-200 hover:border-slate-400 rounded-xl text-[11px] font-extrabold text-slate-450 hover:text-slate-650 flex items-center gap-1 transition-all shrink-0"
                      >
                        <Plus className="w-3 h-3" /> 新周期
                      </button>
                    </div>

                    <div className="relative group min-w-[200px]">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                      <input
                        type="text"
                        placeholder="在当前周期搜索需求或方向..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[11px] w-full focus:outline-none focus:ring-2 focus:ring-indigo-100/50 focus:border-indigo-500 transition-all text-slate-900 font-bold"
                      />
                    </div>
                  </div>

                  {/* 现在的筛选部分分为 排序 和 筛选 */}
                  <div className="flex flex-col gap-3 bg-white border-t border-slate-100 pt-3">
                    <div className="flex flex-wrap items-center justify-between gap-3 text-[10px]">
                      {/* Left: Filters */}
                      <div className="flex flex-wrap items-center gap-2 text-slate-600">
                        <span className="font-extrabold text-slate-400 flex items-center gap-1 shrink-0 uppercase tracking-wider">
                          <Filter className="w-3 h-3 text-indigo-505" />{" "}
                          筛选条件 Filter:
                        </span>

                        {/* 创意人员 */}
                        <div className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-150 text-slate-700 font-bold">
                          <span className="text-slate-400 font-semibold">
                            创意人员:
                          </span>
                          <select
                            value={filters.creativePersonnel}
                            onChange={(e) =>
                              setFilters({
                                ...filters,
                                creativePersonnel: e.target.value,
                              })
                            }
                            className="bg-transparent border-none p-0 focus:ring-0 text-[10px] font-extrabold text-slate-700 outline-none cursor-pointer"
                          >
                            <option value="全部">全部</option>
                            <option value="唐欣怡">唐欣怡</option>
                            <option value="吉意煊">吉意煊</option>
                            <option value="马嘉良">马嘉良</option>
                          </select>
                        </div>

                        {/* 制作类型 */}
                        <div className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-150 text-slate-700 font-bold">
                          <span className="text-slate-400 font-semibold">
                            制作类型:
                          </span>
                          <select
                            value={filters.assetType || "全部"}
                            onChange={(e) =>
                              setFilters({
                                ...filters,
                                assetType: e.target.value,
                              })
                            }
                            className="bg-transparent border-none p-0 focus:ring-0 text-[10px] font-extrabold text-slate-700 outline-none cursor-pointer"
                          >
                            <option value="全部">全部</option>
                            <option value="Video">音频/视频 (Video)</option>
                            <option value="Playable">
                              互动试玩 (Playable)
                            </option>
                            <option value="Image">图片视觉 (Image)</option>
                          </select>
                        </div>

                        {/* 大方向 */}
                        <div className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-150 text-slate-700 font-bold">
                          <span className="text-slate-400 font-semibold">
                            大方向:
                          </span>
                          <select
                            value={filters.broadDirection}
                            onChange={(e) =>
                              setFilters({
                                ...filters,
                                broadDirection: e.target.value,
                              })
                            }
                            className="bg-transparent border-none p-0 focus:ring-0 text-[10px] font-extrabold text-slate-700 outline-none cursor-pointer"
                          >
                            <option value="全部">全部</option>
                            <option value="原始玩法">原始玩法</option>
                            <option value="3D玩法">3D玩法</option>
                            <option value="大字报">大字报</option>
                          </select>
                        </div>

                        <button
                          onClick={() => {
                            setFilters({
                              ...filters,
                              creativePersonnel: "全部",
                              assetType: "全部",
                              broadDirection: "全部",
                            });
                          }}
                          className="text-[10px] font-bold text-slate-400 hover:text-rose-500 transition-colors cursor-pointer pl-1.5"
                        >
                          重置筛选
                        </button>
                      </div>

                      {/* Right: Sorters */}
                      <div className="flex flex-wrap items-center gap-2 text-slate-600">
                        <span className="font-extrabold text-slate-400 flex items-center gap-1 shrink-0 uppercase tracking-wider text-[11px] mr-1">
                          <Activity className="w-3.5 h-3.5 text-amber-500" />{" "}
                          排序方式 (Sort By):
                        </span>

                        <div className="flex flex-wrap items-center gap-2">
                          {[
                            { key: "priority", label: "按优先级" },
                            { key: "form", label: "按类型" },
                            { key: "progress", label: "按进度" },
                            { key: "broadDirection", label: "按大方向" },
                          ].map((sortOption) => {
                            const isActive = currentSort === sortOption.key;
                            return (
                              <button
                                key={sortOption.key}
                                onClick={() => {
                                  if (isActive) {
                                    setSortOrder((prev) =>
                                      prev === "asc" ? "desc" : "asc",
                                    );
                                  } else {
                                    setCurrentSort(sortOption.key as any);
                                    setSortOrder("desc");
                                  }
                                }}
                                className={`px-3 py-1.5 rounded-xl text-[11px] font-black flex items-center gap-1.5 border transition-all shadow-3xs hover:-translate-y-0.5 ${
                                  isActive
                                    ? "bg-indigo-600 text-white border-indigo-650 font-extrabold shadow-md shadow-indigo-600/10"
                                    : "bg-white text-slate-705 border-slate-200 hover:bg-slate-50 hover:border-slate-350"
                                }`}
                              >
                                <span>{sortOption.label}</span>
                                {isActive && (
                                  <span className="text-[10px] bg-black/10 px-1 py-0.2 rounded font-mono">
                                    {sortOrder === "desc" ? "▼" : "▲"}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                          {currentSort !== "none" && (
                            <button
                              onClick={() => setCurrentSort("none")}
                              className="px-2.5 py-1.5 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-200 rounded-xl text-[11px] font-black transition-all shadow-3xs flex items-center gap-1"
                              title="取消排序"
                            >
                              重置排序 ✕
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 协同看板内容 */}
                <div className="flex-1 overflow-auto space-y-3 no-scrollbar pb-4">
                  {visibleSchedules.length === 0 ? (
                    <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center py-16">
                      <Calendar className="w-10 h-10 text-slate-200 mb-2" />
                      <p className="text-xs font-bold text-slate-400">
                        目前选定条件暂无具体排期，请调整勾选周期/筛选条件，或点击新周期开始
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-2">
                      {visibleSchedules.map((s) => {
                        const associatedReqs = requirements.filter(
                          (r) => r.scheduleId === s.id,
                        );
                        const submissionPercent = Math.min(
                          100,
                          Math.round(
                            (s.validCount / (s.totalRequiredCount || 1)) * 100,
                          ),
                        );

                        // Calculate production progress stats
                        const totalReqs = associatedReqs.length;
                        const completedReqs = associatedReqs.filter(
                          (r) => r.prodStatus === "Completed",
                        ).length;
                        const inProgressReqs = associatedReqs.filter(
                          (r) => r.prodStatus === "InProgress",
                        ).length;
                        const scheduledReqs = associatedReqs.filter(
                          (r) => r.prodStatus === "Scheduled" || !r.prodStatus,
                        ).length;

                        const completedPercent =
                          totalReqs > 0 ? (completedReqs / totalReqs) * 100 : 0;
                        const inProgressPercent =
                          totalReqs > 0
                            ? (inProgressReqs / totalReqs) * 100
                            : 0;
                        const totalProdPercent =
                          totalReqs > 0
                            ? Math.round((completedReqs / totalReqs) * 100)
                            : 0;

                        const isEditing = editingScheduleId === s.id;

                        const cardPriorityStyle =
                          "border-slate-150 shadow-xs hover:shadow-md";

                        return (
                          <div
                            key={s.id}
                            onClick={() => setSelectedScheduleForModal(s)}
                            className={`bg-white rounded-3xl border transition-all p-5 flex flex-col justify-between cursor-pointer group relative overflow-hidden ${cardPriorityStyle}`}
                          >
                            <div>
                              {/* 头部信息 */}
                              <div className="flex items-center justify-between gap-1.5 mb-3">
                                <div
                                  className="flex flex-wrap gap-1.5"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {isEditing ? (
                                    <>
                                      {/* Form selector dropdown inside Edit Mode */}
                                      <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border border-slate-200 bg-white text-slate-705 text-[10px] font-bold h-[24px]">
                                        <select
                                          value={s.form || "Video"}
                                          onChange={(e) =>
                                            updateSchedule(s.id, {
                                              form: e.target.value as any,
                                            })
                                          }
                                          className="bg-transparent border-none p-0 focus:ring-0 text-[10px] font-extrabold cursor-pointer focus:outline-none w-10 text-inherit"
                                        >
                                          <option
                                            value="Playable"
                                            className="bg-white text-slate-850"
                                          >
                                            试玩
                                          </option>
                                          <option
                                            value="Image"
                                            className="bg-white text-slate-850"
                                          >
                                            图片
                                          </option>
                                          <option
                                            value="Video"
                                            className="bg-white text-slate-850"
                                          >
                                            视频
                                          </option>
                                        </select>
                                      </div>

                                      {/* Broad direction selector dropdown inside Edit Mode */}
                                      <div className="inline-flex items-center px-1.5 py-0.5 rounded-full border border-slate-200 bg-white text-slate-705 text-[10px] font-bold h-[24px]">
                                        <select
                                          value={s.broadDirection || "原始玩法"}
                                          onChange={(e) =>
                                            updateSchedule(s.id, {
                                              broadDirection: e.target
                                                .value as any,
                                            })
                                          }
                                          className="bg-transparent border-none p-0 focus:ring-0 text-[10px] font-extrabold cursor-pointer focus:outline-none text-inherit"
                                        >
                                          <option
                                            value="3D玩法"
                                            className="bg-white text-slate-850"
                                          >
                                            3D玩法
                                          </option>
                                          <option
                                            value="大字报"
                                            className="bg-white text-slate-850"
                                          >
                                            大字报
                                          </option>
                                          <option
                                            value="原始玩法"
                                            className="bg-white text-slate-850"
                                          >
                                            原始玩法
                                          </option>
                                        </select>
                                      </div>

                                      {/* Material Stage selector dropdown inside Edit Mode (Requirement 3) */}
                                      <div className="inline-flex items-center px-1.5 py-0.5 rounded-full border border-slate-200 bg-white text-slate-705 text-[10px] font-bold h-[24px]">
                                        <select
                                          value={s.materialStage || "新"}
                                          onChange={(e) =>
                                            updateSchedule(s.id, {
                                              materialStage: e.target
                                                .value as any,
                                            })
                                          }
                                          className="bg-transparent border-none p-0 focus:ring-0 text-[10px] font-extrabold cursor-pointer focus:outline-none text-inherit"
                                        >
                                          <option
                                            value="新"
                                            className="bg-white text-slate-850"
                                          >
                                            新
                                          </option>
                                          <option
                                            value="迭"
                                            className="bg-white text-slate-850"
                                          >
                                            迭
                                          </option>
                                          <option
                                            value="老"
                                            className="bg-white text-slate-850"
                                          >
                                            老
                                          </option>
                                        </select>
                                      </div>
                                    </>
                                  ) : (
                                    <>
                                      {/* Read-Only Form badge */}
                                      <span
                                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-extrabold h-[24px] ${
                                          s.form === "Playable"
                                            ? "bg-indigo-50 border-indigo-150 text-indigo-700"
                                            : s.form === "Image"
                                              ? "bg-amber-50 border-amber-150 text-amber-700"
                                              : "bg-rose-50 border-rose-150 text-rose-700"
                                        }`}
                                      >
                                        {s.form === "Playable" ? (
                                          <Gamepad2 className="w-2.5 h-2.5 shrink-0" />
                                        ) : s.form === "Image" ? (
                                          <ImageIcon className="w-2.5 h-2.5 shrink-0" />
                                        ) : (
                                          <Video className="w-2.5 h-2.5 shrink-0" />
                                        )}
                                        {s.form === "Playable"
                                          ? "试玩"
                                          : s.form === "Image"
                                            ? "图片"
                                            : "视频"}
                                      </span>

                                      {/* Read-Only Broad Direction badge */}
                                      <span
                                        className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-extrabold h-[24px] ${
                                          s.broadDirection === "3D玩法"
                                            ? "bg-violet-50 border-violet-150 text-violet-700"
                                            : s.broadDirection === "大字报"
                                              ? "bg-red-50 border-red-150 text-red-700"
                                              : "bg-slate-50 border-slate-150 text-slate-650"
                                        }`}
                                      >
                                        {s.broadDirection || "原始玩法"}
                                      </span>

                                      {/* Read-Only Material Stage badge (Requirement 3) */}
                                      <span
                                        className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-extrabold h-[24px] ${
                                          s.materialStage === "新"
                                            ? "bg-emerald-50 border-emerald-150 text-emerald-700"
                                            : s.materialStage === "迭"
                                              ? "bg-indigo-50 border-indigo-150 text-indigo-700"
                                              : "bg-slate-50 border-slate-150 text-slate-600"
                                        }`}
                                      >
                                        #{s.materialStage || "新"}
                                      </span>
                                    </>
                                  )}
                                </div>

                                <div
                                  className="flex items-center gap-1.5"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {/* Priority tag (Selector or Display dropdown) */}
                                  {isEditing ? (
                                    <select
                                      value={s.priority || "Mid"}
                                      onChange={(e) =>
                                        updateSchedule(s.id, {
                                          priority: e.target.value as any,
                                        })
                                      }
                                      className={`px-2 py-0.5 rounded-full border text-[10px] font-bold cursor-pointer h-[24px] outline-none ${
                                        s.priority === "Highest"
                                          ? "bg-rose-50 border-rose-200 text-rose-700 font-extrabold"
                                          : s.priority === "High"
                                            ? "bg-orange-50 border-orange-200 text-orange-700"
                                            : s.priority === "Low"
                                              ? "bg-slate-50 border-slate-200 text-slate-500"
                                              : "bg-indigo-50 border-indigo-200 text-indigo-700"
                                      }`}
                                    >
                                      <option value="Highest">🔴 最高</option>
                                      <option value="High">🟠 高</option>
                                      <option value="Mid">🟡 中</option>
                                      <option value="Low">🟢 低</option>
                                    </select>
                                  ) : (
                                    <span
                                      className={`px-2 py-0.5 rounded-full border text-[10px] font-extrabold h-[24px] flex items-center leading-none ${
                                        s.priority === "Highest"
                                          ? "bg-rose-50 border-rose-150 text-rose-700"
                                          : s.priority === "High"
                                            ? "bg-orange-50 border-orange-150 text-orange-705"
                                            : s.priority === "Low"
                                              ? "bg-slate-50 border-slate-150 text-slate-500"
                                              : "bg-indigo-50 border-indigo-150 text-indigo-700"
                                      }`}
                                    >
                                      {s.priority === "Highest"
                                        ? "🔴 最高"
                                        : s.priority === "High"
                                          ? "🟠 高"
                                          : s.priority === "Low"
                                            ? "🟢 低"
                                            : "🟡 中"}
                                    </span>
                                  )}

                                  {/* Beautiful Edit / Save toggle button */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (isEditing) {
                                        setEditingScheduleId(null);
                                      } else {
                                        setEditingScheduleId(s.id);
                                      }
                                    }}
                                    className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold cursor-pointer h-[24px] flex items-center gap-1 transition-all ${
                                      isEditing
                                        ? "bg-emerald-50 border-emerald-200 hover:bg-emerald-100 text-emerald-700 font-black shadow-xs"
                                        : "bg-indigo-50 border-indigo-200 hover:bg-indigo-100 text-indigo-700 hover:border-indigo-300 shadow-3xs"
                                    }`}
                                    title={
                                      isEditing
                                        ? "保存修改企划并锁定"
                                        : "编辑此创意企划"
                                    }
                                  >
                                    {isEditing ? (
                                      <>
                                        <CheckCircle className="w-3 h-3 text-emerald-600 shrink-0" />
                                        <span>保存</span>
                                      </>
                                    ) : (
                                      <>
                                        <FileEdit className="w-3 h-3 text-indigo-600 shrink-0" />
                                        <span>编辑</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>

                              {/* 方向 & 目标 - 采用精美的高级背景色块作为底色 */}
                              <div
                                className="mb-3"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {isEditing ? (
                                  <input
                                    value={s.directionName || ""}
                                    onChange={(e) =>
                                      updateSchedule(s.id, {
                                        directionName: e.target.value,
                                      })
                                    }
                                    placeholder="输入方向名称..."
                                    className="text-sm font-black text-slate-850 tracking-tight leading-snug bg-slate-50 hover:bg-slate-100/80 focus:bg-white focus:ring-1 focus:ring-indigo-150 p-1.5 w-full rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none transition-all"
                                    title="修改方向名称"
                                  />
                                ) : (
                                  <div
                                    className={`px-3 py-2 rounded-xl border flex items-center shadow-3xs ${
                                      s.priority === "Highest"
                                        ? "bg-rose-50/70 text-rose-900 border-rose-150/60"
                                        : s.priority === "High"
                                          ? "bg-amber-50/70 text-amber-900 border-amber-150/60"
                                          : s.priority === "Low"
                                            ? "bg-emerald-55/75 text-emerald-900 border-emerald-150/60"
                                            : "bg-indigo-50/50 text-indigo-905 border-indigo-150/50"
                                    }`}
                                  >
                                    <h3
                                      className="text-sm font-black tracking-tight leading-snug truncate"
                                      title={s.directionName}
                                    >
                                      {s.directionName || "未命名方向"}
                                    </h3>
                                  </div>
                                )}
                              </div>

                              <div
                                className="mb-4 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-100 flex items-start gap-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Target className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                                {isEditing ? (
                                  <input
                                    value={s.validationGoal || ""}
                                    onChange={(e) =>
                                      updateSchedule(s.id, {
                                        validationGoal: e.target.value,
                                      })
                                    }
                                    placeholder="关联测试假说或检验目标..."
                                    className="bg-white text-[11px] text-slate-600 font-bold p-1 w-[92%] border border-slate-200 hover:border-slate-300 focus:border-indigo-505 focus:outline-none rounded transition-all"
                                    title="修改测试目标"
                                  />
                                ) : (
                                  <p
                                    className="text-[11px] text-slate-600 font-bold leading-relaxed truncate block max-w-full"
                                    title={s.validationGoal}
                                  >
                                    {s.validationGoal ||
                                      "暂无验证假说或检验目标..."}
                                  </p>
                                )}
                              </div>

                              {/* 属性网格 */}
                              <div className="grid grid-cols-2 gap-y-2.5 gap-x-2 text-[10px] py-2.5 border-t border-b border-slate-100/70 mb-4 bg-slate-50/30 p-2.5 rounded-xl">
                                {/* 负责人 */}
                                <div
                                  className="flex items-center gap-1 text-slate-600"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <span className="font-semibold text-slate-400 shrink-0">
                                    负责:
                                  </span>
                                  {isEditing ? (
                                    <select
                                      value={s.owner || ""}
                                      onChange={(e) =>
                                        updateSchedule(s.id, {
                                          owner: e.target.value,
                                        })
                                      }
                                      className="bg-white border border-slate-200 hover:border-slate-300 px-1 py-0.5 rounded text-[10px] font-extrabold text-slate-705 focus:outline-none h-6 flex-1 min-w-[65px]"
                                    >
                                      <option>唐欣怡</option>
                                      <option>吉意煊</option>
                                      <option>马嘉良</option>
                                    </select>
                                  ) : (
                                    <span className="font-extrabold text-slate-705 bg-white px-1.5 py-0.5 rounded border border-slate-100 font-sans">
                                      {s.owner || "未指派"}
                                    </span>
                                  )}
                                </div>

                                {/* 场景 */}
                                <div
                                  className="flex items-center gap-1 text-slate-600"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Compass className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <span className="font-semibold text-slate-400 shrink-0">
                                    场景:
                                  </span>
                                  {isEditing ? (
                                    <select
                                      value={s.scenario || "Standard"}
                                      onChange={(e) =>
                                        updateSchedule(s.id, {
                                          scenario: e.target.value as any,
                                        })
                                      }
                                      className="bg-white border border-slate-200 hover:border-slate-300 px-1 py-0.5 rounded text-[10px] font-extrabold text-slate-705 focus:outline-none h-6 flex-1 min-w-[65px]"
                                    >
                                      <option value="Standard">通投</option>
                                      <option value="ASO">ASO</option>
                                      <option value="Localized">本地化</option>
                                    </select>
                                  ) : (
                                    <span
                                      className={`font-extrabold bg-white px-1.5 py-0.5 rounded border border-slate-100 font-sans ${
                                        s.scenario === "Localized"
                                          ? "text-blue-600 border-blue-100 bg-blue-50/10"
                                          : s.scenario === "ASO"
                                            ? "text-amber-600 border-amber-100 bg-amber-50/10"
                                            : "text-slate-655"
                                      }`}
                                    >
                                      {s.scenario === "Localized"
                                        ? "本地化"
                                        : s.scenario === "ASO"
                                          ? "ASO"
                                          : "通投"}
                                    </span>
                                  )}
                                </div>

                                {/* 渠道 */}
                                <div
                                  className="flex items-center gap-1 text-slate-600 col-span-2"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Radio className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <span className="font-semibold text-slate-400 shrink-0">
                                    渠道:
                                  </span>
                                  {isEditing ? (
                                    <select
                                      value={s.channels?.[0] || "all"}
                                      onChange={(e) =>
                                        updateSchedule(s.id, {
                                          channels: [e.target.value],
                                        })
                                      }
                                      className="bg-white border border-slate-200 hover:border-slate-300 px-1.5 py-0.5 rounded text-[10px] font-extrabold text-slate-705 focus:outline-none h-6 flex-1 min-w-[125px] uppercase font-mono"
                                    >
                                      <option value="all">ALL</option>
                                      <option value="apl">APL</option>
                                      <option value="fb">FB</option>
                                      <option value="uac">UAC</option>
                                      <option value="adjoe">ADJOE</option>
                                      <option value="moloco">MOLOCO</option>
                                      <option value="unity">UNITY</option>
                                    </select>
                                  ) : (
                                    (() => {
                                      const chan = s.channels?.[0] || "all";
                                      const chanNorm = chan.toLowerCase();
                                      let colorClasses = "";
                                      if (chanNorm === "fb") {
                                        colorClasses =
                                          "text-blue-600 border-blue-100 bg-blue-50/40";
                                      } else if (chanNorm === "uac") {
                                        colorClasses =
                                          "text-emerald-600 border-emerald-100 bg-emerald-50/40";
                                      } else if (chanNorm === "apl") {
                                        colorClasses =
                                          "text-orange-600 border-orange-100 bg-orange-50/40";
                                      } else if (chanNorm === "adjoe") {
                                        colorClasses =
                                          "text-fuchsia-600 border-fuchsia-100 bg-fuchsia-50/40";
                                      } else if (chanNorm === "moloco") {
                                        colorClasses =
                                          "text-rose-600 border-rose-100 bg-rose-50/40";
                                      } else if (chanNorm === "unity") {
                                        colorClasses =
                                          "text-purple-600 border-purple-100 bg-purple-50/40";
                                      } else {
                                        colorClasses =
                                          "text-slate-600 border-slate-200 bg-slate-50/70";
                                      }
                                      return (
                                        <span
                                          className={`font-extrabold uppercase px-2 py-0.5 rounded border font-mono flex-1 text-center text-[10px] ${colorClasses}`}
                                        >
                                          {chan.toUpperCase()}
                                        </span>
                                      );
                                    })()
                                  )}
                                </div>

                                {/* 初版验收与截止时间 */}
                                <div
                                  className="flex items-center gap-x-3 gap-y-1.5 text-slate-600 col-span-2 flex-wrap"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {/* 初版 Acceptance Date */}
                                  <div className="flex items-center gap-1 flex-1 min-w-[124px]">
                                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    <span className="font-semibold text-slate-400 shrink-0">
                                      初版:
                                    </span>
                                    {isEditing ? (
                                      <input
                                        type="date"
                                        value={s.acceptanceDate || ""}
                                        onChange={(e) =>
                                          updateSchedule(s.id, {
                                            acceptanceDate: e.target.value,
                                          })
                                        }
                                        className="bg-white border border-slate-200 hover:border-slate-300 px-1 py-0.5 rounded text-[10px] font-bold text-slate-605 focus:outline-none flex-1 min-w-0 font-mono h-6"
                                        title="修改初版验收时间"
                                      />
                                    ) : (
                                      <span className="font-mono font-bold text-slate-650 bg-white px-1.5 py-0.5 rounded border border-slate-100 flex-1 text-[10px] text-center">
                                        {s.acceptanceDate || "--"}
                                      </span>
                                    )}
                                  </div>

                                  {/* 截止 Deadline */}
                                  <div className="flex items-center gap-1 flex-1 min-w-[124px]">
                                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    <span className="font-semibold text-slate-400 shrink-0">
                                      截止:
                                    </span>
                                    {isEditing ? (
                                      <input
                                        type="date"
                                        value={s.submissionDeadline || ""}
                                        onChange={(e) =>
                                          updateSchedule(s.id, {
                                            submissionDeadline: e.target.value,
                                          })
                                        }
                                        className="bg-white border border-slate-200 hover:border-slate-300 px-1 py-0.5 rounded text-[10px] font-bold text-slate-605 focus:outline-none flex-1 min-w-0 font-mono h-6"
                                        title="修改截止时间"
                                      />
                                    ) : (
                                      <span className="font-mono font-bold text-slate-650 bg-white px-1.5 py-0.5 rounded border border-slate-100 flex-1 text-[10px] text-center">
                                        {s.submissionDeadline || "--"}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* 两个部分进度条同时显示 */}
                            <div className="mt-auto space-y-3 pt-3 border-t border-slate-100">
                              {/* 1. 需求提交进度 (Requirement 5) */}
                              <div>
                                {(() => {
                                  const approvedReqsCount =
                                    associatedReqs.filter(
                                      (r) => r.reqStatus === "Approved",
                                    ).length;
                                  const pendingReqsCount =
                                    associatedReqs.filter(
                                      (r) =>
                                        r.reqStatus === "Pending" ||
                                        r.reqStatus === "Modification",
                                    ).length;
                                  const totalPlannedCount =
                                    s.totalRequiredCount || 1;
                                  const unsubmittedReqsCount = Math.max(
                                    0,
                                    totalPlannedCount -
                                      approvedReqsCount -
                                      pendingReqsCount,
                                  );

                                  const approvedPct = Math.min(
                                    100,
                                    (approvedReqsCount / totalPlannedCount) *
                                      100,
                                  );
                                  const pendingPct = Math.min(
                                    100 - approvedPct,
                                    (pendingReqsCount / totalPlannedCount) *
                                      100,
                                  );
                                  const localSubmissionPercent = Math.min(
                                    100,
                                    Math.round(
                                      ((approvedReqsCount + pendingReqsCount) /
                                        totalPlannedCount) *
                                        100,
                                    ),
                                  );

                                  return (
                                    <>
                                      <div
                                        className="flex items-center justify-between mb-1 text-[10px]"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          <span className="font-extrabold text-slate-500 uppercase tracking-tight flex items-center gap-1 shrink-0">
                                            <span className="w-1.5 h-1.5 bg-indigo-550 rounded-full inline-block shrink-0" />{" "}
                                            1. 需求提交进度
                                          </span>
                                          {isEditing ? (
                                            <div className="flex items-center gap-1 text-[9px] shrink-0 select-none">
                                              <div className="flex items-center gap-1 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                                                <span className="text-slate-400 font-bold">
                                                  有效:
                                                </span>
                                                <button
                                                  onClick={() =>
                                                    updateSchedule(s.id, {
                                                      validCount: Math.max(
                                                        0,
                                                        s.validCount - 1,
                                                      ),
                                                    })
                                                  }
                                                  className="w-3.5 h-3.5 flex items-center justify-center text-slate-400 hover:text-indigo-650 font-black border border-slate-200 rounded-sm bg-white hover:bg-slate-50"
                                                  title="减少已提交个数"
                                                >
                                                  -
                                                </button>
                                                <span className="font-mono font-bold text-slate-700 min-w-[8px] text-center">
                                                  {s.validCount}
                                                </span>
                                                <button
                                                  onClick={() =>
                                                    updateSchedule(s.id, {
                                                      validCount:
                                                        s.validCount + 1,
                                                    })
                                                  }
                                                  className="w-3.5 h-3.5 flex items-center justify-center text-slate-400 hover:text-indigo-650 font-black border border-slate-200 rounded-sm bg-white hover:bg-slate-50"
                                                  title="增加已提交个数"
                                                >
                                                  +
                                                </button>
                                              </div>
                                              <span className="text-slate-300 font-bold">
                                                /
                                              </span>
                                              <div className="flex items-center gap-1 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                                                <span className="text-slate-400 font-bold">
                                                  总:
                                                </span>
                                                <button
                                                  onClick={() =>
                                                    updateSchedule(s.id, {
                                                      totalRequiredCount:
                                                        Math.max(
                                                          1,
                                                          s.totalRequiredCount -
                                                            1,
                                                        ),
                                                    })
                                                  }
                                                  className="w-3.5 h-3.5 flex items-center justify-center text-slate-400 hover:text-indigo-650 font-black border border-slate-200 rounded-sm bg-white hover:bg-slate-50"
                                                  title="减少总计划数"
                                                >
                                                  -
                                                </button>
                                                <span className="font-mono font-bold text-slate-700 min-w-[8px] text-center">
                                                  {s.totalRequiredCount}
                                                </span>
                                                <button
                                                  onClick={() =>
                                                    updateSchedule(s.id, {
                                                      totalRequiredCount:
                                                        s.totalRequiredCount +
                                                        1,
                                                    })
                                                  }
                                                  className="w-3.5 h-3.5 flex items-center justify-center text-slate-400 hover:text-indigo-650 font-black border border-slate-200 rounded-sm bg-white hover:bg-slate-50"
                                                  title="增加总计划数"
                                                >
                                                  +
                                                </button>
                                              </div>
                                            </div>
                                          ) : (
                                            <span className="text-slate-500 font-bold ml-1 font-sans shrink-0">
                                              <span className="text-[9px] flex items-center gap-1 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100/70">
                                                <span>
                                                  有效:{" "}
                                                  <strong className="text-slate-700 font-bold">
                                                    {s.validCount}
                                                  </strong>
                                                </span>
                                                <span className="text-slate-300">
                                                  |
                                                </span>
                                                <span>
                                                  总:{" "}
                                                  <strong className="text-slate-705 font-bold">
                                                    {s.totalRequiredCount}
                                                  </strong>
                                                </span>
                                              </span>
                                            </span>
                                          )}
                                        </div>
                                        <span className="font-mono font-black text-emerald-600 shrink-0 font-sans">
                                          {localSubmissionPercent}%
                                        </span>
                                      </div>
                                      <div
                                        className="w-full h-2 bg-slate-150 rounded-full flex overflow-hidden border border-slate-200/60 shadow-3xs hover:opacity-90 transition-opacity"
                                        title={`审核通过: ${approvedReqsCount} | 待审核: ${pendingReqsCount} | 未提交: ${unsubmittedReqsCount}`}
                                      >
                                        {approvedPct > 0 && (
                                          <div
                                            className="h-full bg-emerald-500 transition-all duration-300 shrink-0"
                                            style={{ width: `${approvedPct}%` }}
                                          />
                                        )}
                                        {pendingPct > 0 && (
                                          <div
                                            className="h-full bg-amber-400 transition-all duration-300 shrink-0"
                                            style={{ width: `${pendingPct}%` }}
                                          />
                                        )}
                                      </div>
                                      <div className="flex items-center justify-between text-[8px] font-bold text-slate-400 mt-1 uppercase select-none">
                                        <span className="flex items-center gap-0.5 text-slate-400 shrink-0">
                                          <span className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
                                          未提交:{unsubmittedReqsCount}
                                        </span>
                                        <span className="flex items-center gap-0.5 text-amber-500 font-sans shrink-0">
                                          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                                          待审核:{pendingReqsCount}
                                        </span>
                                        <span className="flex items-center gap-0.5 text-emerald-600 font-sans shrink-0">
                                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                          审核通过:{approvedReqsCount}
                                        </span>
                                      </div>
                                    </>
                                  );
                                })()}
                              </div>

                              {/* 2. 制作完成进度 */}
                              <div>
                                <div className="flex items-center justify-between mb-1 text-[10px]">
                                  <span className="font-extrabold text-slate-500 uppercase tracking-tight flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-emerald-505 rounded-full inline-block shrink-0" />{" "}
                                    2. 制作完成进度
                                  </span>
                                  <span className="font-mono font-black text-emerald-600 font-sans">
                                    {totalProdPercent}%
                                  </span>
                                </div>
                                <div
                                  className="w-full h-2 bg-slate-150 rounded-full flex overflow-hidden border border-slate-200/60 shadow-3xs"
                                  title={`未开始: ${scheduledReqs} | 进行中: ${inProgressReqs} | 已完成: ${completedReqs}`}
                                >
                                  {completedPercent > 0 && (
                                    <div
                                      className="h-full bg-emerald-500 transition-all duration-300 shrink-0"
                                      style={{ width: `${completedPercent}%` }}
                                    />
                                  )}
                                  {inProgressPercent > 0 && (
                                    <div
                                      className="h-full bg-blue-500 transition-all duration-300 shrink-0"
                                      style={{ width: `${inProgressPercent}%` }}
                                    />
                                  )}
                                </div>
                                <div className="flex items-center justify-between text-[8px] font-bold text-slate-400 mt-1 uppercase select-none">
                                  <span className="flex items-center gap-0.5 shrink-0">
                                    <span className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
                                    未开始:{scheduledReqs}
                                  </span>
                                  <span className="flex items-center gap-0.5 text-blue-550 font-sans shrink-0">
                                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                    进行中:{inProgressReqs}
                                  </span>
                                  <span className="flex items-center gap-0.5 text-emerald-600 font-sans shrink-0">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                    已完成:{completedReqs}
                                  </span>
                                </div>
                              </div>

                              {/* 关联需求和详情按钮 (Requirement 6 & 7) */}
                              <div className="flex items-center justify-between pt-1">
                                <div className="flex flex-wrap gap-1 max-w-[70%]">
                                  {associatedReqs.slice(0, 5).map((req) => {
                                    const baseId = req.id.split("-")[0];
                                    const statusColorClass =
                                      req.prodStatus === "Completed"
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-150"
                                        : req.prodStatus === "InProgress"
                                          ? "bg-sky-50 text-sky-700 border-sky-150"
                                          : "bg-slate-50 text-slate-550 border-slate-150";
                                    const statusLabel =
                                      req.prodStatus === "Completed"
                                        ? "已完成"
                                        : req.prodStatus === "InProgress"
                                          ? "进行中"
                                          : "未开始";

                                    return (
                                      <span
                                        key={req.id}
                                        className={`px-1.5 py-0.5 rounded-md border text-[9px] font-black font-mono shadow-3xs hover:scale-105 transition-all ${statusColorClass}`}
                                        title={`${req.id} (${req.name}) - 制作状态: ${statusLabel}`}
                                      >
                                        {baseId}
                                      </span>
                                    );
                                  })}
                                  {associatedReqs.length > 5 && (
                                    <span
                                      className="px-1.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[8px] font-black text-slate-500 font-sans shrink-0 shadow-3xs"
                                      title={`还有 ${associatedReqs.length - 5} 个额外关联需求`}
                                    >
                                      +{associatedReqs.length - 5}
                                    </span>
                                  )}
                                  {associatedReqs.length === 0 && (
                                    <span className="text-[10px] text-slate-450 italic font-sans font-medium">
                                      暂无关联需求
                                    </span>
                                  )}
                                </div>

                                <span className="text-[10px] font-extrabold text-indigo-600 ring-1 ring-indigo-100/50 py-1 shadow-3xs px-2 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-all duration-200 shrink-0 text-right whitespace-nowrap">
                                  查看需求详情 📑
                                </span>
                              </div>
                            </div>

                            {/* Hover删除垃圾箱 */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm("确定删除此排期及方向？"))
                                  setSchedules(
                                    schedules.filter(
                                      (item) => item.id !== s.id,
                                    ),
                                  );
                              }}
                              className="absolute top-2.5 right-2.5 p-1 bg-white/95 hover:bg-rose-50 text-slate-350 hover:text-rose-600 rounded-lg border border-slate-200 opacity-0 group-hover:opacity-100 transition-all shadow-3xs"
                              title="删除此方向"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* 创建新方向的横幅 */}
                  <div
                    onClick={() => addScheduleRow(selectedWeekRange, false)}
                    className="py-3 border border-dashed border-slate-300 hover:border-primary hover:bg-slate-50/50 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all group"
                  >
                    <Plus className="w-4 h-4 text-slate-400 group-hover:text-primary group-hover:scale-105 transition-all" />
                    <span className="text-[11px] font-bold text-slate-500 group-hover:text-primary transition-colors">
                      创建新的创意排期方向 (ADD NEW DIRECTION)
                    </span>
                  </div>
                </div>
              </div>
            ) : combinedSubView === "list" ? (
              <>
                {/* 顶部工具栏 (Flat list search/filter) */}
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    {/* 左侧：视图切换与搜索 */}
                    <div className="flex items-center gap-4">
                      <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button
                          onClick={() => setViewMode("list")}
                          className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${viewMode === "list" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                        >
                          <List className="w-3.5 h-3.5" /> 列表
                        </button>
                        <button
                          onClick={() => setViewMode("grid")}
                          className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${viewMode === "grid" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                        >
                          <LayoutGrid className="w-3.5 h-3.5" /> 网格
                        </button>
                      </div>

                      <div className="relative group">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-primary transition-colors" />
                        <input
                          type="text"
                          placeholder="搜索编号、名称..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs w-60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                      </div>
                    </div>

                    {/* 右侧：操作按钮组 */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowScheduleSelector(true)}
                        className="px-4 py-2 bg-primary text-white text-[11px] font-bold rounded-xl hover:bg-slate-900 transition-all flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" /> 新增需求 (New Request)
                      </button>
                    </div>
                  </div>

                  {/* 快捷筛选行 */}
                  <div className="flex flex-wrap gap-2 items-center text-[11px] text-slate-500 font-medium border-t border-slate-50 pt-4">
                    <span className="mr-2 text-slate-400">快速过滤:</span>
                    {filterConfigs.map((config) => (
                      <div key={config.key} className="relative">
                        <div
                          onClick={() =>
                            setActiveFilterDropdown(
                              activeFilterDropdown === config.key
                                ? null
                                : config.key,
                            )
                          }
                          className={`px-3 py-1.5 bg-slate-50 border rounded-lg flex items-center gap-2 cursor-pointer transition-all ${filters[config.key as keyof typeof filters] !== "全部" ? "border-primary bg-primary/5 text-primary font-bold" : "border-slate-200 hover:border-primary/30"}`}
                        >
                          {config.label}:{" "}
                          {filters[config.key as keyof typeof filters]}
                          <ChevronDown className="w-3 h-3 opacity-40" />
                        </div>

                        {activeFilterDropdown === config.key && (
                          <div className="absolute top-full left-0 mt-1 w-32 bg-white border border-slate-100 rounded-xl shadow-xl z-[80] py-1 overflow-hidden">
                            {config.options.map((opt) => (
                              <button
                                key={opt}
                                onClick={() => {
                                  setFilters({ ...filters, [config.key]: opt });
                                  setActiveFilterDropdown(null);
                                }}
                                className={`w-full px-3 py-1.5 text-left hover:bg-slate-50 transition-colors ${filters[config.key as keyof typeof filters] === opt ? "bg-primary/10 text-primary font-bold" : ""}`}
                              >
                                {opt === "Draft"
                                  ? "草稿"
                                  : opt === "Pending"
                                    ? "待审核"
                                    : opt === "Approved"
                                      ? "通过"
                                      : opt === "Modification"
                                        ? "修改"
                                        : opt}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}

                    <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2 cursor-pointer">
                      提出时间 <ChevronDown className="w-3 h-3 opacity-40" />
                    </div>
                    <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2 cursor-pointer">
                      完成时间 <ChevronDown className="w-3 h-3 opacity-40" />
                    </div>

                    <button
                      onClick={() =>
                        setFilters({
                          materialStage: "全部",
                          broadDirection: "全部",
                          creativePersonnel: "全部",
                          priority: "全部",
                          reqStatus: "全部",
                          prodStatus: "全部",
                          assetType: "全部",
                        })
                      }
                      className="text-slate-400 hover:text-rose-500 text-[10px] ml-2 font-bold transition-colors"
                    >
                      清除筛选
                    </button>
                  </div>
                </div>

                {/* 主视图 */}
                <div className="flex-1 overflow-hidden bg-white rounded-2xl border border-slate-100 shadow-sm">
                  {viewMode === "list" ? (
                    <div className="h-full overflow-auto no-scrollbar">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-100">
                          <tr className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
                            <th className="px-4 py-3 font-sans">编号</th>
                            <th className="px-4 py-3 font-sans">预览</th>
                            <th className="px-4 py-3 font-sans">需求名称</th>
                            <th className="px-4 py-3 text-center font-sans">
                              优先级
                            </th>
                            <th className="px-4 py-3 font-sans">创意人员</th>
                            <th className="px-4 py-3 text-center font-sans">
                              需求状态
                            </th>
                            <th className="px-4 py-3 text-center font-sans">
                              制作状态
                            </th>
                            <th className="px-4 py-3 text-center font-sans">
                              测试状态
                            </th>
                            <th className="px-4 py-3 text-center font-sans">
                              投放状态
                            </th>
                            <th className="px-4 py-3 text-right font-sans">
                              操作
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-[11px]">
                          {filteredRequirements.map((req) => (
                            <tr
                              key={req.id}
                              onClick={() => setSelectedReq(req)}
                              className="group hover:bg-slate-50/80 transition-all cursor-pointer"
                            >
                              <td className="px-4 py-3 text-slate-400 font-medium group-hover:text-primary relative font-mono">
                                {req.level > 0 && (
                                  <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center">
                                    <div className="w-3 h-[1px] bg-slate-200 ml-2"></div>
                                    <div className="w-[1px] h-full bg-slate-200 absolute -left-1 bottom-1/2"></div>
                                  </div>
                                )}
                                <span className={req.level > 0 ? "ml-4" : ""}>
                                  {req.id}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex gap-1">
                                  {(req.previews || [])
                                    .slice(0, 2)
                                    .map((p, i) => (
                                      <div
                                        key={i}
                                        className="w-6 h-6 rounded bg-slate-100 overflow-hidden border border-slate-200 shrink-0"
                                      >
                                        <img
                                          src={p}
                                          className="w-full h-full object-cover"
                                          referrerPolicy="no-referrer"
                                        />
                                      </div>
                                    ))}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-slate-700 font-bold max-w-[150px] truncate font-sans">
                                <div className="flex items-center gap-2">
                                  {req.level > 0 && (
                                    <span className="bg-slate-100 text-slate-400 px-1 py-0.5 rounded text-[8px] font-black uppercase">
                                      Sub
                                    </span>
                                  )}
                                  {req.name}
                                </div>
                              </td>

                              {/* 优先级 */}
                              <td
                                className="px-4 py-3"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="flex justify-center font-sans">
                                  <select
                                    value={req.priority}
                                    onChange={(e) =>
                                      updateRequirement(req.id, {
                                        priority: e.target
                                          .value as RequirementPriority,
                                      })
                                    }
                                    className={`px-2 py-1 rounded text-[10px] font-black border-none focus:ring-0 cursor-pointer transition-all ${getPriorityStyle(req.priority)}`}
                                  >
                                    <option
                                      value="Low"
                                      className="text-slate-900 bg-white"
                                    >
                                      低
                                    </option>
                                    <option
                                      value="Mid"
                                      className="text-slate-900 bg-white"
                                    >
                                      中
                                    </option>
                                    <option
                                      value="High"
                                      className="text-slate-900 bg-white"
                                    >
                                      高
                                    </option>
                                    <option
                                      value="Highest"
                                      className="text-slate-900 bg-white"
                                    >
                                      最高
                                    </option>
                                  </select>
                                </div>
                              </td>

                              <td className="px-4 py-3 text-slate-600 font-semibold font-sans">
                                {req.creativePersonnel}
                              </td>

                              {/* 需求状态 */}
                              <td
                                className="px-4 py-3"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="flex justify-center font-sans">
                                  <select
                                    value={req.reqStatus}
                                    onChange={(e) =>
                                      updateRequirement(req.id, {
                                        reqStatus: e.target
                                          .value as RequirementReqStatus,
                                      })
                                    }
                                    className={`px-2 py-0.5 rounded-full border text-[10px] font-bold border-none focus:ring-0 cursor-pointer ${getStatusStyle(req.reqStatus)}`}
                                  >
                                    <option value="Draft">草稿</option>
                                    <option value="Pending">待审核</option>
                                    <option value="Approved">审核通过</option>
                                    <option value="Modification">
                                      需求修改
                                    </option>
                                  </select>
                                </div>
                              </td>

                              {/* 制作状态 */}
                              <td
                                className="px-4 py-3"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="flex justify-center font-sans">
                                  <select
                                    value={req.prodStatus}
                                    onChange={(e) =>
                                      updateRequirement(req.id, {
                                        prodStatus: e.target
                                          .value as RequirementProdStatus,
                                      })
                                    }
                                    className={`px-2 py-1 border rounded text-[10px] font-bold focus:ring-0 cursor-pointer transition-all ${getProdStatusStyle(req.prodStatus)}`}
                                  >
                                    <option value="Scheduled">已排期</option>
                                    <option value="InProgress">进行中</option>
                                    <option value="Completed">已完成</option>
                                  </select>
                                </div>
                              </td>

                              {/* 测试状态 */}
                              <td
                                className="px-4 py-3 text-center"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {req.assetType === "Playable" ? (
                                  <select
                                    value={req.testStatus || "待测试"}
                                    onChange={(e) =>
                                      updateRequirement(req.id, {
                                        testStatus: e.target.value as any,
                                      })
                                    }
                                    className="bg-purple-50 text-purple-700 font-bold px-2 py-0.5 rounded text-[10px] border border-purple-250 focus:ring-1 focus:ring-purple-200 cursor-pointer font-sans"
                                  >
                                    <option value="待测试">待测试</option>
                                    <option value="测试中">测试中</option>
                                    <option value="数据合格">数据合格</option>
                                    <option value="不达标">不达标</option>
                                  </select>
                                ) : (
                                  <span className="text-slate-350 italic text-[10px]">
                                    -
                                  </span>
                                )}
                              </td>

                              {/* 投放状态 */}
                              <td
                                className="px-4 py-3"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="flex justify-center font-sans">
                                  <button
                                    onClick={() =>
                                      updateRequirement(req.id, {
                                        deliveryStatus:
                                          req.deliveryStatus === "Delivering"
                                            ? "Paused"
                                            : "Delivering",
                                      })
                                    }
                                    className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all font-bold ${req.deliveryStatus === "Delivering" ? "text-emerald-600 bg-emerald-50" : "text-slate-400 bg-slate-50"}`}
                                  >
                                    {req.deliveryStatus === "Delivering" ? (
                                      <Play className="w-2.5 h-2.5 fill-current" />
                                    ) : (
                                      <Pause className="w-2.5 h-2.5 fill-current" />
                                    )}
                                    {req.deliveryStatus === "Delivering"
                                      ? "投放中"
                                      : "暂停投放"}
                                  </button>
                                </div>
                              </td>

                              <td
                                className="px-4 py-3 text-right"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="relative group/action inline-block font-sans">
                                  <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition-all">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </button>
                                  <div className="absolute right-0 top-full mt-1 w-24 bg-white border border-slate-100 rounded-xl shadow-xl z-[80] py-1 hidden group-hover/action:block">
                                    <button
                                      onClick={(e) => handleDelete(req.id, e)}
                                      className="w-full px-3 py-1.5 text-left text-rose-500 hover:bg-rose-50 flex items-center gap-2 font-bold transition-colors"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" /> 删除
                                    </button>
                                    {!req.parentId && (
                                      <button
                                        onClick={(e) =>
                                          handleAddSubRequirement(req, e)
                                        }
                                        className="w-full px-3 py-1.5 text-left text-primary hover:bg-primary/5 flex items-center gap-2 font-bold transition-colors"
                                      >
                                        <Plus className="w-3.5 h-3.5" /> 子需求
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="h-full overflow-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 no-scrollbar">
                      {filteredRequirements.map((req) => (
                        <div
                          key={req.id}
                          onClick={() => setSelectedReq(req)}
                          className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all cursor-pointer flex flex-col group overflow-hidden"
                        >
                          <div className="aspect-video relative overflow-hidden bg-slate-100">
                            <img
                              src={
                                req.previews?.[0] ||
                                "https://picsum.photos/400/225"
                              }
                              className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                            />
                            <div className="absolute top-2 right-2">
                              <span
                                className={`px-2 py-0.5 rounded-full border text-[10px] font-bold bg-white/90 backdrop-blur ${getStatusStyle(req.reqStatus)}`}
                              >
                                {req.reqStatus === "Approved"
                                  ? "通过"
                                  : req.reqStatus === "Pending"
                                    ? "待定"
                                    : req.reqStatus === "Modification"
                                      ? "修改"
                                      : "草稿"}
                              </span>
                            </div>
                          </div>
                          <div className="p-4 flex flex-col gap-2">
                            <div className="flex justify-between items-start">
                              <span className="text-[10px] text-slate-400 font-bold">
                                {req.id}
                              </span>
                              <div className="flex gap-0.5">
                                {[1, 2, 3].map((s) => (
                                  <Star
                                    key={s}
                                    className={`w-2.5 h-2.5 ${s <= req.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-xs font-black text-slate-805 line-clamp-2 leading-snug mt-1 flex-1">
                              {req.name}
                            </p>
                            <div className="flex items-center justify-between text-[9px] text-slate-400 mt-2 font-mono border-t border-slate-100 pt-2">
                              <span className="bg-indigo-50 text-indigo-650 px-1.5 py-0.5 rounded font-black origin-left scale-90 uppercase">
                                {req.difficulty}级
                              </span>
                              <span className="text-slate-400">
                                {req.startDate}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : combinedSubView === "production" ? (
              <div className="flex-1 flex flex-col gap-4 overflow-hidden relative">
                {/* 制作排期头部工具栏 */}
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <Calendar className="w-5 h-5 text-indigo-550" />
                    </div>
                    <div>
                      <h2 className="text-sm font-black text-slate-800 leading-tight">制作排期</h2>
                      <p className="text-[10px] text-slate-400 font-bold mt-0.5">用来辅助自动排期与管理制作团队包的排产与工时负荷</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* 视图切换：日历 & 甘特图 */}
                    <div className="flex bg-slate-100 p-1 rounded-xl mr-2">
                      <button 
                        onClick={() => setProductionView('calendar')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all ${productionView === 'calendar' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        <Calendar className="w-3.5 h-3.5" /> 日历视图
                      </button>
                      <button 
                        onClick={() => setProductionView('gantt')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all ${productionView === 'gantt' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        <Layers className="w-3.5 h-3.5" /> 甘特图
                      </button>
                    </div>

                    {/* 配置与自动排期按钮 */}
                    <button
                      onClick={() => setShowConfigModal(true)}
                      className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 hover:border-indigo-300 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-3xs"
                    >
                      <Hammer className="w-3.5 h-3.5 text-indigo-605" />
                      辅助排期配置
                    </button>

                    <button
                      onClick={() => {
                        const activeNames = PRODUCERS.filter(p => p.status === '在职').map(p => p.name);
                        const nextAvailDay: Record<string, number> = {};
                        activeNames.forEach(name => { nextAvailDay[name] = 1; });
                        
                        const prioWeights = { 'Highest': 4, 'High': 3, 'Mid': 2, 'Low': 1, '': 0 };
                        const sorted = [...requirements].sort((a, b) => {
                          const wA = prioWeights[a.priority as RequirementPriority] || 0;
                          const wB = prioWeights[b.priority as RequirementPriority] || 0;
                          return wB - wA;
                        });

                        const updated = sorted.map(req => {
                          const diff = (req.difficulty || 'B') as string;
                          const reqType = getReqType(req);
                          
                          // Sort active designers by Priority weight (descending)
                          // If weights are equal (or for fallback), sort by their next available day (accomplished load balancing!)
                          const sortedDesigners = [...activeNames].sort((nameA, nameB) => {
                            const wA = difficultyPriorityWeights[nameA]?.[reqType]?.[diff] ?? 5;
                            const wB = difficultyPriorityWeights[nameB]?.[reqType]?.[diff] ?? 5;
                            
                            if (wB !== wA) {
                              return wB - wA; // highest weight first
                            }
                            return nextAvailDay[nameA] - nextAvailDay[nameB]; // earliest available first
                          });
                          
                          const bestDesigner = sortedDesigners[0] || activeNames[0];
                          const start = nextAvailDay[bestDesigner] || 1;
                          
                          // Look up dynamic effort based on designer + type + difficulty
                          const effortVal = difficultyWorkHours[bestDesigner]?.[reqType]?.[diff] || 2;
                          const end = start + Math.ceil(effortVal) - 1;
                          const daysInMonth = new Date(calendarYear, calendarMonth, 0).getDate();
                          const finalEnd = Math.min(daysInMonth, end);

                          nextAvailDay[bestDesigner] = finalEnd + 1;

                          const startStr = `${calendarYear}-${String(calendarMonth).padStart(2, '0')}-${start < 10 ? '0' + start : start}`;
                          const endStr = `${calendarYear}-${String(calendarMonth).padStart(2, '0')}-${finalEnd < 10 ? '0' + finalEnd : finalEnd}`;

                          return {
                            ...req,
                            productionPersonnel: [bestDesigner],
                            startDate: startStr,
                            endDate: endStr,
                            prodStatus: 'InProgress' as RequirementProdStatus
                          };
                        });

                        setRequirements(updated);
                        const summaryText = activeNames.map(des => `- ${des} 排产至: ${calendarMonth}月${nextAvailDay[des] - 1}日`).join('\n');
                        alert(`🎉 智能算法自动排期成功！已结合 [每个设计制作类型的分级工时工日] 与 [每个人各类型难度的承接优先级权重（${activeNames.length}位可派单人员）] 重新编排 ${updated.length} 项产品材料需求排程：\n\n${summaryText}\n\n排期看板与日历已实时计算构建重塑！`);
                      }}
                      className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-indigo-600/10 hover:-translate-y-0.5"
                    >
                      <PlusCircle className="w-3.5 h-3.5 text-indigo-200" />
                      辅助自动排期
                    </button>
                  </div>
                </div>

                {/* 制作排期核心工作区：顶段是人员横向切换面板，下方是工作区 (日历或甘特图) */}
                <div className="flex-1 flex flex-col gap-4 overflow-hidden min-h-0">
                  {/* 顶部人员横向切换面板，只有在日历视图下渲染；且为一体化一排极简横滑布局 */}
                  {productionView === "calendar" && (
                    <div className="bg-white p-2.5 px-4 rounded-2xl border border-slate-100 shadow-3xs flex flex-col gap-1.5 shrink-0">
                      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 select-none w-full shrink-0">
                        {(() => {
                          const activeProducers = PRODUCERS.filter(p => p.status === '在职');
                          return (
                            <div className="flex items-center gap-1.5">
                              {activeProducers.map(prod => {
                                const isSelected = selectedProducer === prod.name;
                                const pendingCount = requirements.filter(r => r.productionPersonnel?.includes(prod.name) && r.prodStatus !== "Completed").length;
                                
                                let colorTag = "bg-slate-100 text-slate-700";
                                if (prod.group === "美宣-平面") colorTag = "bg-purple-50 text-purple-650 border border-purple-100";
                                else if (prod.group === "美宣-AI") colorTag = "bg-amber-50 text-amber-650 border border-amber-100";
                                else if (prod.group === "美宣-2D") colorTag = "bg-rose-50 text-rose-650 border border-rose-100";
                                else if (prod.group === "美宣-3D") colorTag = "bg-blue-50 text-blue-650 border border-blue-105";
                                else colorTag = "bg-emerald-50 text-emerald-650 border border-emerald-100";

                                return (
                                  <button
                                    type="button"
                                    key={prod.name}
                                    onClick={() => setSelectedProducer(prod.name)}
                                    className={`px-3 py-1.5 rounded-xl border flex items-center gap-2.5 text-[11.5px] font-extrabold transition-all relative shrink-0 ${
                                      isSelected
                                        ? 'bg-slate-900 border-slate-900 text-white shadow-md'
                                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                    }`}
                                  >
                                    <div className="flex flex-col items-start leading-[1.3]">
                                      <span className="text-[11.5px] font-black">{prod.name}</span>
                                      <span className={`text-[7.5px] font-black font-sans px-1 rounded mt-0.5 ${isSelected ? 'bg-white/20 text-white' : colorTag}`}>
                                        {prod.group.replace("美宣-", "")}
                                      </span>
                                    </div>
                                    <span className={`text-[9.5px] font-black font-mono px-1.5 py-0.5 rounded-lg ${isSelected ? 'bg-white/20 text-indigo-100' : 'bg-slate-100 text-slate-600 border border-slate-150'}`}>
                                      {pendingCount}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          );
                        })()}

                        {(() => {
                          const resignedProducers = PRODUCERS.filter(p => p.status === '离职');
                          if (resignedProducers.length === 0) return null;
                          return (
                            <div className="relative inline-block select-none shrink-0 pl-2 border-l border-slate-150">
                              <select
                                onChange={(e) => {
                                  const name = e.target.value;
                                  if (name) {
                                    setSelectedProducer(name);
                                    e.target.value = "";
                                  }
                                }}
                                className="h-9 pl-2.5 pr-8 py-1 rounded-lg border border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 text-[11px] font-black text-slate-600 cursor-pointer focus:ring-0 focus:outline-none transition-all appearance-none outline-none"
                                defaultValue=""
                              >
                                <option value="" disabled>📁 离职归档 ({resignedProducers.length})</option>
                                {resignedProducers.map(r => {
                                  const pendingCount = requirements.filter(eq => eq.productionPersonnel?.includes(r.name) && eq.prodStatus !== "Completed").length;
                                  return (
                                    <option key={r.name} value={r.name} className="text-slate-705 bg-white font-bold">
                                      {r.name} ({r.group.replace("美宣-", "")}) [待完成: {pendingCount}]
                                    </option>
                                  );
                                })}
                              </select>
                              <span className="absolute right-2.5 top-2.5 pointer-events-none text-[8px] text-slate-400 font-bold">▼</span>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  )}

                  {/* 下方工作区 (自适应高度) */}
                  <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                    {/* 1. 日历视图 */}
                    {productionView === "calendar" ? (
                      <div className="flex-1 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-4 overflow-hidden animate-in fade-in duration-200">
                        {/* 顶部指示条 */}
                        <div className="flex flex-wrap items-center justify-end gap-3 border-b border-slate-100 pb-2.5 shrink-0">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 font-mono">
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                              已完成
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                              制作中
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                              待开始
                            </span>
                          </div>
                        </div>

                        {/* 月换页操作条 */}
                        <div className="flex items-center justify-between px-1 shrink-0">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={handlePrevMonth}
                              className="p-1 hover:bg-slate-100 active:bg-slate-200 border border-slate-200 rounded-lg text-slate-600 transition-all cursor-pointer"
                              title="上个月"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="text-sm font-black text-slate-800 font-sans tracking-tight">
                              {calendarYear}年 {calendarMonth}月 ({new Date(calendarYear, calendarMonth - 1, 1).toLocaleString('en-US', { month: 'long' })} {calendarYear})
                            </span>
                            <button
                              type="button"
                              onClick={handleNextMonth}
                              className="p-1 hover:bg-slate-100 active:bg-slate-200 border border-slate-200 rounded-lg text-slate-600 transition-all cursor-pointer"
                              title="下个月"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                          <span className="text-[10px] bg-indigo-50 text-indigo-650 px-2.5 py-1 rounded-xl font-black font-mono">
                            {calendarYear === 2026 && calendarMonth === 6 ? "🎯 本日 (2026-06-03)" : `📅 浏览阅览中`}
                          </span>
                        </div>

                        {/* 动态日长周维度移动通道：周排期泳道图 (同一天可承载多条任务并行流动，条状拉伸，极高清晰度) */}
                        <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-3.5 bg-slate-50/10 p-1.5 rounded-2xl border border-slate-150 min-h-[450px]">
                          {/* 星期标头 */}
                          <div className="grid grid-cols-7 gap-2 bg-slate-100/85 p-2 rounded-xl text-center select-none shrink-0 border border-slate-200">
                            {[
                              "周一 (Mon)",
                              "周二 (Tue)",
                              "周三 (Wed)",
                              "周四 (Thu)",
                              "周五 (Fri)",
                              "周六 (Sat)",
                              "周日 (Sun)",
                            ].map((d) => (
                              <div
                                key={d}
                                className="text-[10px] font-black text-slate-500 uppercase tracking-wider font-mono"
                              >
                                {d}
                              </div>
                            ))}
                          </div>

                          {/* 泳道通道网格主内容 (以周为单元独立进行非重叠跑道排布) */}
                          <div className="flex flex-col gap-4 flex-1 animate-in fade-in duration-200">
                            {(() => {
                              const weeks = getMonthWeeks(calendarYear, calendarMonth);
                              return weeks.map((week, wIdx) => {
                                const weekStart = week.days[0].dateString;
                                const weekEnd = week.days[6].dateString;

                                const weekReqs = requirements.filter(req => {
                                  const isAssigned = req.productionPersonnel?.includes(selectedProducer);
                                  if (!isAssigned) return false;
                                  return (req.startDate || "") <= weekEnd && (req.endDate || "") >= weekStart;
                                });

                                // 分配不重叠的泳道 (tracks)
                                const tracks: Requirement[][] = [];
                                const sortedWeekReqs = [...weekReqs].sort((a, b) => 
                                  (a.startDate || "").localeCompare(b.startDate || "") || a.id.localeCompare(b.id)
                                );

                                sortedWeekReqs.forEach(req => {
                                  let assignedTrackIndex = -1;
                                  for (let t = 0; t < tracks.length; t++) {
                                    const trackReqs = tracks[t];
                                    const lastReqInTrack = trackReqs[trackReqs.length - 1];
                                    if ((lastReqInTrack.endDate || "") < (req.startDate || "")) {
                                      assignedTrackIndex = t;
                                      break;
                                    }
                                  }
                                  if (assignedTrackIndex === -1) {
                                    tracks.push([req]);
                                  } else {
                                    tracks[assignedTrackIndex].push(req);
                                  }
                                });

                                return (
                                  <div key={wIdx} className="border border-slate-200 rounded-2xl bg-white shadow-3xs overflow-hidden flex flex-col shrink-0">
                                    {/* 日期数字行 */}
                                    <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-55/60 py-2 px-2 select-none">
                                      {week.days.map((day, dIdx) => (
                                        <div key={dIdx} className={`text-center flex flex-col items-center justify-center ${day.isWeekend ? 'text-rose-500 font-extrabold' : 'text-slate-500 font-bold'}`}>
                                          <div className="flex items-center gap-1">
                                            <span className={`text-[11px] font-mono px-1.5 py-0.5 rounded ${
                                              day.isToday 
                                                ? "bg-indigo-600 text-white font-black shadow-3xs rounded-full px-2.5" 
                                                : day.isCurrentMonth ? "text-slate-700 font-bold" : "text-slate-350 font-normal"
                                            }`}>
                                              {day.dayNum}
                                            </span>
                                            {day.isToday && (
                                              <span className="text-[7.5px] bg-indigo-100 text-indigo-700 px-1 rounded font-black origin-left scale-90">本日</span>
                                            )}
                                            {day.isWeekend && day.isCurrentMonth && (
                                              <span className="text-[7.5px] bg-rose-50 text-rose-500 border border-rose-100/50 px-1 rounded origin-left scale-90 font-black">放假</span>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>

                                    {/* 泳道区域 */}
                                    <div className="p-3 relative min-h-[60px] bg-slate-50/10 space-y-2.5">
                                      {/* 背景垂直虚线分隔 */}
                                      <div className="absolute inset-0 grid grid-cols-7 pointer-events-none divide-x divide-slate-100/80 pb-0.5">
                                        <div className="h-full"></div>
                                        <div className="h-full"></div>
                                        <div className="h-full"></div>
                                        <div className="h-full"></div>
                                        <div className="h-full"></div>
                                        <div className="h-full"></div>
                                        <div className="h-full"></div>
                                      </div>

                                      {tracks.length === 0 ? (
                                        <div className="flex items-center justify-center py-3 text-[10px] text-slate-350 font-bold italic">
                                          暂无制作中需求
                                        </div>
                                      ) : (
                                        tracks.map((track, tIdx) => (
                                          <div key={tIdx} className="grid grid-cols-7 gap-2 relative z-10 min-h-[30px]">
                                            {track.map(req => {
                                              const startIdx = week.days.findIndex(d => d.dateString === req.startDate);
                                              const endIdx = week.days.findIndex(d => d.dateString === req.endDate);
                                              
                                              const sIdx = startIdx === -1 ? 0 : startIdx;
                                              const eIdx = endIdx === -1 ? 6 : endIdx;
                                              const colSpan = eIdx - sIdx + 1;

                                              let statusBg = "bg-indigo-50 hover:bg-indigo-100/60 text-indigo-905 border-indigo-200 border-l-4 border-l-indigo-600 font-extrabold";
                                              if (req.prodStatus === "Completed") {
                                                statusBg = "bg-emerald-50 hover:bg-emerald-100/60 text-emerald-800 border-emerald-200 border-l-4 border-l-emerald-500";
                                              } else if (req.prodStatus === "InProgress") {
                                                statusBg = "bg-indigo-50 hover:bg-indigo-100/60 text-indigo-905 border-indigo-205 border-l-4 border-l-indigo-600 font-extrabold";
                                              } else {
                                                statusBg = "bg-amber-50 hover:bg-amber-100/60 text-amber-805 border-amber-200 border-l-4 border-l-amber-500";
                                              }

                                              const isLeftClipped = (req.startDate || "") < week.days[0].dateString;
                                              const isRightClipped = (req.endDate || "") > week.days[6].dateString;
                                              const pipeline = getRequirementPipeline(req);

                                              return (
                                                <button
                                                  type="button"
                                                  key={req.id}
                                                  onClick={() => setSelectedReq(req)}
                                                  style={{ gridColumnStart: sIdx + 1, gridColumnEnd: eIdx + 2 }}
                                                  className={`rounded-xl border p-1.5 flex items-center justify-between text-[11px] font-black cursor-pointer shadow-3xs transition-all hover:scale-[1.01] overflow-hidden ${statusBg}`}
                                                  title={`${req.id}: ${req.name} (制作期限: ${req.startDate} 至 ${req.endDate})`}
                                                >
                                                  <div className="flex items-center gap-2 min-w-0">
                                                    <span className="font-mono text-[10px] text-slate-805 shrink-0 font-black">
                                                      {isLeftClipped && "◀ "}{req.id}{isRightClipped && " ▶"}
                                                    </span>
                                                    <span className="truncate text-slate-700 text-[10px] font-bold hidden sm:inline">
                                                      {req.name}
                                                    </span>
                                                  </div>

                                                  <div className="flex items-center gap-0.5 shrink-0 pl-1 scale-90">
                                                    {pipeline.map((stage, s1Idx) => (
                                                      <span
                                                        key={s1Idx}
                                                        className={`w-4 h-4 rounded flex items-center justify-center text-[8px] font-black ${
                                                          stage.status === 'completed' ? 'bg-emerald-500 text-white' :
                                                          stage.status === 'inprogress' ? 'bg-amber-400 text-slate-900 animate-pulse' :
                                                          'bg-slate-200 text-slate-405'
                                                        }`}
                                                        title={`${stage.name}: ${stage.status === 'completed' ? '已完成' : stage.status === 'inprogress' ? '制作中' : '未开始'}`}
                                                      >
                                                        {stage.name[0]}
                                                      </span>
                                                    ))}
                                                  </div>
                                                </button>
                                              );
                                            })}
                                          </div>
                                        ))
                                      )}
                                    </div>
                                  </div>
                                );
                              });
                            })()}
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* 2. 甘特图视图 (Gantt View - Stick Left and Horizontal Scroll Workspace) */
                      <div className="flex-1 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-4 overflow-hidden animate-in fade-in duration-200">
                        <div className="flex flex-wrap items-center justify-between border-b border-slate-105 pb-3 gap-3">
                          <div>
                            <h4 className="text-sm font-black text-slate-800 flex items-center gap-1.5 font-sans tracking-tight">
                              <Hammer className="w-4 h-4 text-indigo-550" />
                              全球全员排期进度双向检索甘特图
                            </h4>
                            <p className="text-[10px] text-slate-400 font-bold mt-0.5 font-mono">
                              支持横向拖滑 / 触控左右滑动 / 点击下方快进按钮，不限量追溯 60 天长跨度排程
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* 滑动控制栏 */}
                            <div className="flex items-center gap-1 mr-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
                              <button
                                type="button"
                                onClick={() => scrollGantt("left")}
                                className="px-2 py-1 text-[10px] font-black bg-white hover:bg-slate-50 rounded-lg border border-slate-205 text-slate-705 cursor-pointer shadow-3xs flex items-center gap-1"
                                title="向左滚动10天"
                              >
                                ◀ 前期
                              </button>
                              <button
                                type="button"
                                onClick={() => scrollGantt("right")}
                                className="px-2 py-1 text-[10px] font-black bg-white hover:bg-slate-50 rounded-lg border border-slate-205 text-slate-705 cursor-pointer shadow-3xs flex items-center gap-1"
                                title="向右滚动10天"
                              >
                                后期 ▶
                              </button>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-[9px] font-bold font-mono text-slate-400 bg-slate-50 border border-slate-150 px-3 py-1.5 rounded-xl select-none">
                              <span className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 bg-rose-500 rounded-sm"></span>
                                S级高难
                              </span>
                              <span className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 bg-amber-500 rounded-sm"></span>
                                A级中难
                              </span>
                              <span className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 bg-indigo-500 rounded-sm"></span>
                                B级标准
                              </span>
                              <span className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm"></span>
                                C级基础
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Gantt Area - Highly optimized layout with horizontal scroll and sticky rows */}
                        <div ref={ganttContainerRef} className="flex-1 overflow-auto border border-slate-150 rounded-2xl bg-white flex flex-col select-none relative min-h-[400px]">
                          {/* 1. Month header line (Scrollable) */}
                          {(() => {
                            const daysCount = 60;
                            const ganttStartDate = new Date(calendarYear, calendarMonth - 1, 1);
                            const ganttDays: { dateStr: string; dayNum: number; isWeekend: boolean; isToday: boolean; monthName: string }[] = [];

                            for (let i = 0; i < daysCount; i++) {
                              const d = new Date(ganttStartDate);
                              d.setDate(ganttStartDate.getDate() + i);
                              const y = d.getFullYear();
                              const m = d.getMonth() + 1;
                              const dayVal = d.getDate();
                              const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(dayVal).padStart(2, '0')}`;
                              
                              const dayOfWeek = d.getDay();
                              const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                              const isToday = y === 2026 && m === 6 && dayVal === 3;
                              const monthName = `${y}年${m}月`;
                              
                              ganttDays.push({
                                dateStr,
                                dayNum: dayVal,
                                isWeekend,
                                isToday,
                                monthName
                              });
                            }

                            const monthsSpan: { name: string; count: number }[] = [];
                            ganttDays.forEach(day => {
                              const last = monthsSpan[monthsSpan.length - 1];
                              if (last && last.name === day.monthName) {
                                last.count++;
                              } else {
                                monthsSpan.push({ name: day.monthName, count: 1 });
                              }
                            });

                            return (
                              <>
                                {/* Table header row */}
                                <div className="flex border-b border-slate-150 bg-slate-50 shrink-0 sticky top-0 z-20">
                                  {/* Sticky Left placeholder */}
                                  <div className="w-[220px] bg-slate-50 border-r border-slate-205 flex items-center justify-center font-black text-[11px] text-slate-500 sticky left-0 z-30 shrink-0 select-none">
                                    设计制作人员 (Producers)
                                  </div>
                                  {/* Horizontal Month Headers */}
                                  <div className="flex relative" style={{ width: `${daysCount * 44}px` }}>
                                    {monthsSpan.map((ms, idx) => (
                                      <div 
                                        key={idx} 
                                        style={{ width: `${ms.count * 44}px` }}
                                        className="shrink-0 bg-indigo-50/50 border-r border-slate-200/60 p-2 text-center text-[10.5px] font-black text-indigo-750 border-b select-none font-mono tracking-wider truncate"
                                      >
                                        📅 {ms.name} ({ms.count}天)
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Day list header row */}
                                <div className="flex border-b border-slate-200 bg-white sticky top-[34px] z-20 shrink-0 select-none">
                                  {/* Sticky Left placeholder */}
                                  <div className="w-[220px] bg-white border-r border-slate-205 flex flex-col justify-center px-4 sticky left-0 z-30 shrink-0 font-bold">
                                    <div className="text-[10px] text-slate-400 font-mono">岗位类型 / 排产工时</div>
                                  </div>
                                  {/* Day Numbers */}
                                  <div className="flex relative" style={{ width: `${daysCount * 44}px` }}>
                                    {ganttDays.map((day, dIdx) => (
                                      <div
                                        key={dIdx}
                                        style={{ width: "44px" }}
                                        className={`shrink-0 flex flex-col justify-center items-center py-1 text-[10px] border-r border-slate-150/60 font-mono ${
                                          day.isToday
                                            ? "bg-indigo-600 text-white font-extrabold"
                                            : day.isWeekend
                                            ? "bg-rose-50 text-rose-500 font-extrabold"
                                            : "text-slate-600 font-bold"
                                        }`}
                                        title={day.dateStr}
                                      >
                                        <span>{day.dayNum}</span>
                                        <span className="text-[7.5px] scale-90">{day.isWeekend ? "休" : "作"}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Rows body block */}
                                <div className="flex-1 flex flex-col min-h-0 overflow-y-auto no-scrollbar">
                                  {PRODUCERS.map((prod) => {
                                    const producer = prod.name;
                                    
                                    // 过滤得出与 60 天时间轴有交集的该人所有需求
                                    const producerReqs = requirements.filter(r => {
                                      const isAssigned = r.productionPersonnel?.includes(producer);
                                      if (!isAssigned) return false;
                                      return (r.startDate || "") <= ganttDays[daysCount - 1].dateStr && (r.endDate || "") >= ganttDays[0].dateStr;
                                    });

                                    // 计算此人在本时间段内的工负
                                    const totalEffort = producerReqs.reduce((sum, r) => {
                                      const diff = (r.difficulty || "B") as string;
                                      const reqType = getReqType(r);
                                      const hours = difficultyWorkHours[producer]?.[reqType]?.[diff];
                                      const val = typeof hours === 'number' ? hours : 2;
                                      return sum + val;
                                    }, 0);

                                    // 按开始日期排序
                                    const sortedReqs = [...producerReqs].sort((a, b) => 
                                      (a.startDate || "").localeCompare(b.startDate || "") || a.id.localeCompare(b.id)
                                    );

                                    // 编译出绝对定位可视条和对应的高度
                                    const producerLayoutElements: Array<
                                      | { type: 'parent'; req: Requirement; y: number; hasSub: boolean; isExpanded: boolean; relationSubReqsCount: number }
                                      | { type: 'pre-sub'; parentReq: Requirement; subReqs: Requirement[]; y: number }
                                      | { type: 'post-lane-and-toggle'; parentReq: Requirement; subReqs: Requirement[]; isPostExpanded: boolean; y: number }
                                    > = [];
                                    let currentYOffset = 10;

                                    sortedReqs.forEach((req) => {
                                      // 筛选由其他人承接的前置和后置子需求
                                      const relationSubReqs = requirements.filter(sr => 
                                        sr.parentId === req.id && 
                                        sr.productionPersonnel && 
                                        sr.productionPersonnel.some(p => p !== producer)
                                      );

                                      const hasSub = relationSubReqs.length > 0;
                                      const isExpanded = !!expandedGanttRelations[req.id];

                                      // 1. 添加主/父需求
                                      producerLayoutElements.push({
                                        type: 'parent',
                                        req,
                                        y: currentYOffset,
                                        hasSub,
                                        isExpanded,
                                        relationSubReqsCount: relationSubReqs.length
                                      });
                                      currentYOffset += 38;

                                      if (hasSub && isExpanded) {
                                        const preSubReqs = relationSubReqs.filter(sr => {
                                          if (sr.name?.includes("后置")) return false;
                                          if (sr.name?.includes("前置")) return true;
                                          if (sr.endDate && req.startDate) {
                                            return sr.endDate <= req.startDate;
                                          }
                                          return true; // 默认前置
                                        });

                                        const postSubReqs = relationSubReqs.filter(sr => !preSubReqs.includes(sr));
                                        const isPostExpanded = !!expandedPostReqs[req.id];

                                        // 2. 前置子需求 (默认显示)
                                        if (preSubReqs.length > 0) {
                                          producerLayoutElements.push({
                                            type: 'pre-sub',
                                            parentReq: req,
                                            subReqs: preSubReqs,
                                            y: currentYOffset
                                          });
                                          currentYOffset += 38;
                                        }

                                        // 3. 后置子需求 (默认收起，点击后再展开)
                                        if (postSubReqs.length > 0) {
                                          producerLayoutElements.push({
                                            type: 'post-lane-and-toggle',
                                            parentReq: req,
                                            subReqs: postSubReqs,
                                            isPostExpanded,
                                            y: currentYOffset
                                          });
                                          currentYOffset += 38;
                                        }
                                      }
                                    });

                                    const rowHeight = Math.max(76, currentYOffset + 14);

                                    return (
                                      <div 
                                        key={producer}
                                        className={`flex border-b border-slate-150 relative transition-all ${
                                          prod.status === "离职" ? "bg-amber-50/10" : "bg-white hover:bg-slate-50/30"
                                        }`}
                                        style={{ height: `${rowHeight}px` }}
                                      >
                                        {/* Sticky Left producer info */}
                                        <div className="w-[220px] bg-white border-r border-slate-200 flex flex-col justify-between p-3 sticky left-0 z-10 shrink-0 shadow-xs h-full select-none">
                                          <div className="flex flex-col gap-1.5 h-full">
                                            <div className="flex items-center gap-2">
                                              <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-white text-[10px] font-black ${
                                                prod.status === "离职" ? "bg-slate-350" : "bg-slate-900 shadow-sm"
                                              }`}>
                                                {producer.charAt(0)}
                                              </div>
                                              <div className="flex flex-col truncate leading-none mt-0.5">
                                                <span className={`text-[12.5px] font-black ${prod.status === "离职" ? "text-slate-400 line-through" : "text-slate-800"}`}>
                                                  {producer}
                                                </span>
                                                <span className="text-[8.5px] text-indigo-600 font-bold mt-0.5">
                                                  {prod.alias} · {prod.group.replace("美宣-", "")}
                                                </span>
                                              </div>
                                            </div>

                                            {/* Sub schedule togglers on the left column */}
                                            {sortedReqs.map(req => {
                                              const rels = requirements.filter(sr => sr.parentId === req.id && sr.productionPersonnel?.some(p => p !== producer));
                                              if (rels.length === 0) return null;
                                              const isExpanded = !!expandedGanttRelations[req.id];
                                              return (
                                                <div key={req.id} className="text-[8px] bg-indigo-50/35 border border-indigo-100/60 p-1.5 rounded-xl flex flex-col gap-1 select-none animate-in fade-in duration-200">
                                                  <div className="font-extrabold text-indigo-805 truncate text-[8px] leading-tight font-sans">
                                                    🔗 关联子排期: {req.id}
                                                  </div>
                                                  <button
                                                    type="button"
                                                    onClick={() => setExpandedGanttRelations(prev => ({...prev, [req.id]: !isExpanded}))}
                                                    className={`w-full py-0.5 px-1 rounded text-[7.5px] font-black border cursor-pointer select-none transition-all text-center ${
                                                      isExpanded 
                                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-3xs' 
                                                        : 'bg-white text-indigo-600 border-indigo-200 hover:bg-slate-50'
                                                    }`}
                                                  >
                                                    {isExpanded ? '收起子排期' : '展开子排期'}
                                                  </button>
                                                </div>
                                              );
                                            })}
                                          </div>
                                          
                                          <div className="flex items-center justify-between gap-1 mt-1.5 pt-1.5 border-t border-slate-100 font-mono shrink-0">
                                            <span className="text-[8.5px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md font-bold">
                                              {producerReqs.length}个任务
                                            </span>
                                            <span className="text-[9.5px] font-bold text-slate-500">
                                              负荷: <span className="text-indigo-650 font-black">{totalEffort}天</span>
                                            </span>
                                          </div>
                                        </div>

                                        {/* Right scrollable timeline container for bars */}
                                        <div className="flex-1 relative" style={{ width: `${daysCount * 44}px` }}>
                                          {/* Daily columns background indicator marks */}
                                          <div className="absolute inset-0 flex pointer-events-none h-full bg-slate-50/10">
                                            {ganttDays.map((day, dIdx) => (
                                              <div
                                                key={dIdx}
                                                style={{ width: "44px" }}
                                                className={`h-full border-r border-slate-150/40 shrink-0 ${
                                                  day.isWeekend ? "bg-rose-50/20" : ""
                                                } ${day.isToday ? "bg-indigo-500/5 ring-1 ring-inset ring-indigo-500/10" : ""}`}
                                              ></div>
                                            ))}
                                          </div>

                                          {/* Render Dynamic Layout Elements */}
                                          {producerLayoutElements.map((el, elIdx) => {
                                            if (el.type === 'parent') {
                                              const { req, y, hasSub, isExpanded, relationSubReqsCount } = el;
                                              const sIdx = ganttDays.findIndex(d => d.dateStr === req.startDate);
                                              const eIdx = ganttDays.findIndex(d => d.dateStr === req.endDate);

                                              const startPosIndex = sIdx !== -1 ? sIdx : 0;
                                              const endPosIndex = eIdx !== -1 ? eIdx : (req.startDate && req.startDate < ganttDays[0].dateStr ? 0 : daysCount - 1);

                                              const isClippedStart = sIdx === -1 && req.startDate && req.startDate < ganttDays[0].dateStr;
                                              const isClippedEnd = eIdx === -1 && req.endDate && req.endDate > ganttDays[daysCount - 1].dateStr;

                                              const barLeft = startPosIndex * 44;
                                              const barWidth = Math.max(28, (endPosIndex - startPosIndex + 1) * 44);
                                              const spanDays = Math.round(
                                                (new Date(req.endDate || "").getTime() - new Date(req.startDate || "").getTime()) / (1000 * 60 * 60 * 24)
                                              ) + 1;

                                              let bgClass = "bg-indigo-50 hover:bg-indigo-100/90 text-indigo-900 border-indigo-200 border-l-4 border-l-indigo-600";
                                              if (req.difficulty === "S") {
                                                bgClass = "bg-rose-50 hover:bg-rose-100/90 text-rose-900 border-rose-200 border-l-4 border-l-rose-500";
                                              } else if (req.difficulty === "A") {
                                                bgClass = "bg-amber-50 hover:bg-amber-100/90 text-amber-900 border-amber-200 border-l-4 border-l-amber-500";
                                              } else if (req.difficulty === "C") {
                                                bgClass = "bg-emerald-50 hover:bg-emerald-100/90 text-emerald-950 border-emerald-205 border-l-4 border-l-emerald-555";
                                              }

                                              return (
                                                <div 
                                                  key={req.id}
                                                  className={`absolute h-8 rounded-lg border flex items-center justify-between px-2.5 py-0.5 text-[9.5px] font-black cursor-pointer transition-all shadow-3xs overflow-hidden leading-tight text-left ${bgClass}`}
                                                  style={{
                                                    left: `${barLeft}px`,
                                                    width: `${barWidth}px`,
                                                    top: `${y}px`,
                                                  }}
                                                  onClick={() => setSelectedReq(req)}
                                                  title={`${req.id}: ${req.name} (${req.startDate} 至 ${req.endDate})`}
                                                >
                                                  <div className="flex flex-col justify-center truncate mr-1">
                                                    <div className="flex items-center gap-1.5">
                                                      <span className="font-mono text-[9px] font-black shrink-0">
                                                        {isClippedStart && "◀ "}{req.id} {isClippedEnd && " ▶"}
                                                      </span>
                                                      <span className="text-[7.5px] font-bold opacity-80 font-mono shrink-0">
                                                        {spanDays}天
                                                      </span>
                                                    </div>
                                                    <div className="truncate text-slate-700/95 text-[8.5px] font-medium font-sans">
                                                      {req.name}
                                                    </div>
                                                  </div>

                                                  {hasSub && (
                                                    <button
                                                      type="button"
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        setExpandedGanttRelations(prev => ({...prev, [req.id]: !isExpanded}));
                                                      }}
                                                      className={`px-1.5 py-0.5 rounded text-[8px] font-black border flex items-center gap-1 transition-all ${
                                                        isExpanded 
                                                          ? 'bg-indigo-650 text-white border-indigo-600 shadow-3xs' 
                                                          : 'bg-white text-indigo-750 border-indigo-200 hover:bg-indigo-50'
                                                      }`}
                                                    >
                                                      <span>🔗</span>
                                                      <span>{isExpanded ? '收起' : `关联(${relationSubReqsCount})`}</span>
                                                    </button>
                                                  )}
                                                </div>
                                              );
                                            }

                                            if (el.type === 'pre-sub') {
                                              const { subReqs, y, parentReq } = el;
                                              return (
                                                <div key={`pre-sub-${parentReq.id}`} style={{ top: `${y}px` }} className="absolute left-0 right-0 h-8 flex items-center bg-slate-50/20 border-y border-dashed border-slate-100 pointer-events-none">
                                                  {/* Reference horizontal guide line strip */}
                                                  {subReqs.map(sub => {
                                                    const sIdx = ganttDays.findIndex(d => d.dateStr === sub.startDate);
                                                    const eIdx = ganttDays.findIndex(d => d.dateStr === sub.endDate);
                                                    const startPosIndex = sIdx !== -1 ? sIdx : 0;
                                                    const endPosIndex = eIdx !== -1 ? eIdx : (sub.startDate && sub.startDate < ganttDays[0].dateStr ? 0 : daysCount - 1);
                                                    const barLeft = startPosIndex * 44;
                                                    const barWidth = Math.max(28, (endPosIndex - startPosIndex + 1) * 44);

                                                    return (
                                                      <div
                                                        key={sub.id}
                                                        className="absolute h-7.5 rounded-md border border-dashed border-indigo-300 bg-indigo-50/80 text-indigo-950 flex flex-col justify-center px-2 py-0.5 text-[8.5px] font-black select-none pointer-events-auto shadow-4xs truncate transition-all leading-tight text-left cursor-pointer hover:bg-indigo-100"
                                                        style={{
                                                          left: `${barLeft}px`,
                                                          width: `${barWidth}px`,
                                                          top: '1px'
                                                        }}
                                                        onClick={() => setSelectedReq(sub)}
                                                        title={`[前置子需求] ${sub.id}: ${sub.name} (承接人: ${sub.productionPersonnel?.join(', ') || '暂无'})`}
                                                      >
                                                        <div className="flex items-center gap-1.5 truncate">
                                                          <span className="px-1 bg-indigo-600 text-white rounded-[4px] text-[7px] font-sans font-black scale-90 tracking-tighter self-center shrink-0">前置</span>
                                                          <span className="px-1 bg-white border border-indigo-200 text-indigo-700 rounded-[4px] text-[7.5px] font-black max-w-[50px] truncate shrink-0">👤 {sub.productionPersonnel?.[0] || '待定'}</span>
                                                          <span className="truncate opacity-90 text-[8.2px] font-extrabold">{sub.name}</span>
                                                        </div>
                                                      </div>
                                                    );
                                                  })}
                                                </div>
                                              );
                                            }

                                            if (el.type === 'post-lane-and-toggle') {
                                              const { subReqs, isPostExpanded, y, parentReq } = el;
                                              return (
                                                <div key={`post-sub-${parentReq.id}`} style={{ top: `${y}px` }} className="absolute left-0 right-0 h-8 flex items-center bg-slate-50/20 border-y border-dashed border-slate-100 pointer-events-none">
                                                  {/* Inline Toggle Button */}
                                                  <div className="absolute left-4 top-1.5 z-10 pointer-events-auto">
                                                    <button
                                                      type="button"
                                                      onClick={() => setExpandedPostReqs(prev => ({...prev, [parentReq.id]: !isPostExpanded}))}
                                                      className={`px-2 py-0.5 rounded-lg text-[8px] font-black flex items-center gap-1 hover:scale-105 border cursor-pointer select-none shadow-3xs transition-all ${
                                                        isPostExpanded 
                                                          ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100' 
                                                          : 'bg-indigo-50 text-indigo-805 border-indigo-220 hover:bg-indigo-100'
                                                      }`}
                                                    >
                                                      <span>{isPostExpanded ? '收起后置 ◀' : `展开后置子需求 (${subReqs.length}) ▶`}</span>
                                                    </button>
                                                  </div>

                                                  {isPostExpanded && subReqs.map(sub => {
                                                    const sIdx = ganttDays.findIndex(d => d.dateStr === sub.startDate);
                                                    const eIdx = ganttDays.findIndex(d => d.dateStr === sub.endDate);
                                                    const startPosIndex = sIdx !== -1 ? sIdx : 0;
                                                    const endPosIndex = eIdx !== -1 ? eIdx : (sub.startDate && sub.startDate < ganttDays[0].dateStr ? 0 : daysCount - 1);
                                                    const barLeft = startPosIndex * 44;
                                                    const barWidth = Math.max(28, (endPosIndex - startPosIndex + 1) * 44);

                                                    return (
                                                      <div
                                                        key={sub.id}
                                                        className="absolute h-7.5 rounded-md border border-dashed border-rose-300 bg-rose-50/80 text-rose-950 flex flex-col justify-center px-2 py-0.5 text-[8.5px] font-black select-none pointer-events-auto shadow-4xs truncate transition-all leading-tight text-left cursor-pointer hover:bg-rose-100"
                                                        style={{
                                                          left: `${barLeft}px`,
                                                          width: `${barWidth}px`,
                                                          top: '1px'
                                                        }}
                                                        onClick={() => setSelectedReq(sub)}
                                                        title={`[后置子需求] ${sub.id}: ${sub.name} (承接人: ${sub.productionPersonnel?.join(', ') || '暂无'})`}
                                                      >
                                                        <div className="flex items-center gap-1.5 truncate">
                                                          <span className="px-1 bg-rose-500 text-white rounded-[4px] text-[7px] font-sans font-black scale-90 tracking-tighter self-center shrink-0">后置</span>
                                                          <span className="px-1 bg-white border border-rose-200 text-rose-600 rounded-[4px] text-[7.5px] font-black max-w-[50px] truncate shrink-0">👤 {sub.productionPersonnel?.[0] || '待定'}</span>
                                                          <span className="truncate opacity-90 text-[8.2px] font-extrabold">{sub.name}</span>
                                                        </div>
                                                      </div>
                                                    );
                                                  })}
                                                </div>
                                              );
                                            }

                                            return null;
                                          })}

                                          {producerReqs.length === 0 && (
                                            <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-350 italic font-bold select-none">
                                              🌿 暂无排产需求，轻松休假
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
              </div>

              {/* 3. 辅助排期配置模态窗 / Panel Flyout */}
                {showConfigModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300 select-none">
                    <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl flex flex-col p-6 animate-in zoom-in-95 duration-250 max-h-[90vh] overflow-hidden border border-slate-150">
                      
                      {/* Modal Header */}
                      <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
                        <div className="flex items-center gap-2">
                          <Settings className="w-5 h-5 text-indigo-600 font-black animate-spin-slow" />
                          <div>
                            <h3 className="text-sm font-black text-slate-800">
                              辅助排期系统参数设定
                            </h3>
                            <p className="text-[10px] text-slate-400 font-bold mt-0.5 font-mono">配置全岗位所有人在每种设计类型的各级难度工期与自动分单优先级权重</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowConfigModal(false)}
                          className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                        >
                          <X className="w-5 h-5 font-black" />
                        </button>
                      </div>

                      {/* Modal Tabs Switching Header layout */}
                      <div className="flex border-b border-slate-150 my-4 shrink-0 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
                        <button
                          type="button"
                          onClick={() => setConfigModalTab("hours")}
                          className={`flex-1 text-center py-2 text-xs font-black rounded-xl transition-all ${
                            configModalTab === "hours"
                              ? "bg-white text-indigo-700 font-extrabold shadow-sm"
                              : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          🕒 1. 每个人按类型/难度划分工期 (工期设置)
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfigModalTab("weights")}
                          className={`flex-1 text-center py-2 text-xs font-black rounded-xl transition-all ${
                            configModalTab === "weights"
                              ? "bg-white text-indigo-700 font-extrabold shadow-sm"
                              : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          🎯 2. 每个人按类型/难度不同优先级 (权重分数)
                        </button>
                      </div>

                      {/* Scrollable Main Area */}
                      <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 pr-1 my-2">
                        
                        {configModalTab === "hours" ? (
                          /* Tab A: Estimated Work Hours per Designer, production type and difficulty level */
                          <div className="space-y-6">
                            <div className="flex items-center justify-between pl-1">
                              <div>
                                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider pl-1.5 border-l-2 border-indigo-650">
                                  单项难度制作耗时工期设定 (单位: 天)
                                </h4>
                                <span className="text-[10px] text-slate-400 font-extrabold block mt-0.5">
                                  用于系统自动排期根据选定设计师与材料类型折算工期
                                </span>
                              </div>
                              <span className="text-[10px] bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-lg text-slate-500 font-black">
                                双向实时联动
                              </span>
                            </div>

                            {/* Outer Group by Positions loop */}
                            {(["美宣-平面", "美宣-AI", "美宣-2D", "美宣-3D", "程序"] as const).map(groupName => {
                              const groupActiveProducers = PRODUCERS.filter(p => p.group === groupName && (p.status === '在职' || showResignedProducers));
                              if (groupActiveProducers.length === 0) return null;

                              return (
                                <div key={groupName} className="space-y-3 bg-slate-50/45 p-4 rounded-3xl border border-slate-200/60 shadow-3xs">
                                  <div className="flex items-center gap-1.5 pb-1">
                                    <span className={`px-2.5 py-0.5 text-[10px] font-black rounded-lg ${
                                      groupName === "美宣-平面" ? "bg-purple-100 text-purple-700" :
                                      groupName === "美宣-AI" ? "bg-amber-100 text-amber-700" :
                                      groupName === "美宣-2D" ? "bg-rose-100 text-rose-700" :
                                      groupName === "美宣-3D" ? "bg-blue-100 text-blue-700" :
                                      "bg-emerald-100 text-emerald-700"
                                    }`}>
                                      {groupName} 岗位
                                    </span>
                                    <span className="text-[9px] text-slate-400 font-bold">该岗位可编辑成员数: {groupActiveProducers.length}人</span>
                                  </div>

                                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                    {groupActiveProducers.map(prod => (
                                      <div key={prod.name} className="bg-white rounded-2xl border border-slate-150 p-3 shadow-3xs hover:border-slate-200 transition-all">
                                        <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-2 font-black text-xs text-slate-800">
                                          <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[9px] text-white shrink-0">
                                            {prod.name.charAt(0)}
                                          </div>
                                          <span>{prod.name}</span>
                                          <span className="text-[9.5px] font-mono font-bold text-slate-400">({prod.alias})</span>
                                          {prod.status === '离职' && (
                                            <span className="text-[8px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-md ml-auto">离职</span>
                                          )}
                                        </div>

                                        <table className="w-full text-left border-collapse text-[10px] text-slate-650">
                                          <thead>
                                            <tr className="border-b border-slate-100 font-bold text-slate-400">
                                              <th className="py-1">制作类型</th>
                                              <th className="text-center py-1">S 级</th>
                                              <th className="text-center py-1">A 级</th>
                                              <th className="text-center py-1">B 级</th>
                                              <th className="text-center py-1">C 级</th>
                                            </tr>
                                          </thead>
                                          <tbody className="divide-y divide-slate-100/50">
                                            {["视频", "Playable", "3D", "平面"].map(type => (
                                              <tr key={type} className="hover:bg-slate-50/50 font-bold">
                                                <td className="py-2 text-slate-700 font-extrabold">{type}</td>
                                                {["S", "A", "B", "C"].map(diff => (
                                                  <td key={diff} className="text-center py-2">
                                                    <input
                                                      type="number"
                                                      step="0.5"
                                                      min="0.5"
                                                      max="30"
                                                      value={difficultyWorkHours[prod.name]?.[type]?.[diff] ?? 1.5}
                                                      onChange={(e) => {
                                                        const val = parseFloat(e.target.value) || 0.5;
                                                        setDifficultyWorkHours(prev => ({
                                                          ...prev,
                                                          [prod.name]: {
                                                            ...prev[prod.name],
                                                            [type]: {
                                                              ...prev[prod.name]?.[type],
                                                              [diff]: val
                                                            }
                                                          }
                                                        }));
                                                      }}
                                                      className="w-11 text-center bg-white border border-slate-200 hover:border-slate-350 px-1 py-0.5 rounded-md text-[10.5px] font-black font-mono focus:outline-none focus:ring-1 focus:ring-indigo-100"
                                                    />
                                                  </td>
                                                ))}
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          /* Tab B: Priority Weight Assignment with tie support */
                          <div className="space-y-6">
                            <div className="p-3 bg-amber-50/40 border border-amber-200/50 rounded-2xl text-[10px] text-amber-800 leading-relaxed font-semibold shrink-0">
                              💡 <strong>算法说明 (优先级分数数值权重系统):</strong>{" "}
                              此处使用数值权重(1~10分数)表示当某类难度需求到达时，设计师的接单优先级，<strong>分数越高表示接单顺位越靠前</strong>。
                              支持多个设计师设置<strong>完全相同的优先级分数</strong>，此时自动排期算法会进行<strong>负载均衡（谁先空闲谁接单）</strong>，完美规避排空或爆工期问题。
                            </div>

                            <div className="flex items-center justify-between pl-1">
                              <div>
                                <h4 className="text-xs font-black text-slate-805 uppercase tracking-wider pl-1.5 border-l-2 border-indigo-650">
                                  每个人/每个类型的分配优先级分数 (权重值范围: 1 ~ 100)
                                </h4>
                                <span className="text-[10px] text-slate-400 font-extrabold block mt-0.5">
                                  用于自动排班在同类型同难度需求下对在职组员进行权重优先配单
                                </span>
                              </div>
                            </div>

                            {/* Outer Group by Positions loop */}
                            {(["美宣-平面", "美宣-AI", "美宣-2D", "美宣-3D", "程序"] as const).map(groupName => {
                              const groupActiveProducers = PRODUCERS.filter(p => p.group === groupName && (p.status === '在职' || showResignedProducers));
                              if (groupActiveProducers.length === 0) return null;

                              return (
                                <div key={groupName} className="space-y-3 bg-slate-50/45 p-4 rounded-3xl border border-slate-200/60 shadow-3xs">
                                  <div className="flex items-center gap-1.5 pb-1">
                                    <span className={`px-2.5 py-0.5 text-[10px] font-black rounded-lg ${
                                      groupName === "美宣-平面" ? "bg-purple-100 text-purple-700" :
                                      groupName === "美宣-AI" ? "bg-amber-100 text-amber-700" :
                                      groupName === "美宣-2D" ? "bg-rose-100 text-rose-700" :
                                      groupName === "美宣-3D" ? "bg-blue-100 text-blue-700" :
                                      "bg-emerald-100 text-emerald-700"
                                    }`}>
                                      {groupName} 岗位
                                    </span>
                                    <span className="text-[9px] text-slate-400 font-bold">该岗位可编辑成员数: {groupActiveProducers.length}人</span>
                                  </div>

                                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                    {groupActiveProducers.map(prod => (
                                      <div key={prod.name} className="bg-white rounded-2xl border border-slate-150 p-3 shadow-3xs hover:border-slate-200 transition-all">
                                        <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-2 font-black text-xs text-slate-800">
                                          <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-[9px] text-white shrink-0 font-mono">
                                            {prod.name.charAt(0)}
                                          </div>
                                          <span>{prod.name}</span>
                                          <span className="text-[9.5px] font-mono font-bold text-indigo-405">({prod.alias})</span>
                                          {prod.status === '离职' && (
                                            <span className="text-[8px] bg-amber-105 text-amber-700 px-1.5 py-0.5 rounded-md ml-auto">离职</span>
                                          )}
                                        </div>

                                        <table className="w-full text-left border-collapse text-[10px] text-slate-650">
                                          <thead>
                                            <tr className="border-b border-slate-100 font-bold text-slate-400">
                                              <th className="py-1">制作类型</th>
                                              <th className="text-center py-1">S 级权重</th>
                                              <th className="text-center py-1">A 级权重</th>
                                              <th className="text-center py-1">B 级权重</th>
                                              <th className="text-center py-1">C 级权重</th>
                                            </tr>
                                          </thead>
                                          <tbody className="divide-y divide-slate-100/50 font-bold">
                                            {["视频", "Playable", "3D", "平面"].map(type => (
                                              <tr key={type} className="hover:bg-slate-50/50 font-bold">
                                                <td className="py-2 text-slate-700 font-extrabold">{type}</td>
                                                {["S", "A", "B", "C"].map(diff => (
                                                  <td key={diff} className="text-center py-2">
                                                    <input
                                                      type="number"
                                                      min="1"
                                                      max="100"
                                                      value={difficultyPriorityWeights[prod.name]?.[type]?.[diff] ?? 5}
                                                      onChange={(e) => {
                                                        const val = parseInt(e.target.value) || 1;
                                                        setDifficultyPriorityWeights(prev => ({
                                                          ...prev,
                                                          [prod.name]: {
                                                            ...prev[prod.name],
                                                            [type]: {
                                                              ...prev[prod.name]?.[type],
                                                              ...prev[prod.name]?.[type],
                                                              [diff]: val
                                                            }
                                                          }
                                                        }));
                                                      }}
                                                      className="w-11 text-center bg-indigo-25 text-indigo-700 border border-indigo-200 hover:border-indigo-350 px-1 py-0.5 rounded-md text-[10.5px] font-black font-mono focus:outline-none focus:ring-1 focus:ring-indigo-150"
                                                    />
                                                  </td>
                                                ))}
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Help Guide Box */}
                        <div className="p-4 bg-indigo-50/30 border border-indigo-100 rounded-2xl flex gap-3 text-[10.5px] text-indigo-850 leading-relaxed font-bold shrink-0">
                          <span className="text-base scale-110 shrink-0 select-none">💡</span>
                          <p>
                            辅助一键自动分配排期程序，首先将当前月份所有待待定待制的需求进行优先级（Highest &gt; High &gt; Mid &gt; Low）全局重排序。
                            针对某项特定需求，根据对应【制作类型】与需求【分级工时】，对当前岗位所有活动中在职的设计师进行各阶级【承接优先级权重】排序。
                            若权重分数相同，将自动按照负载分担策略（哪位设计师目前累计接单工期排期结束时间最前）来就近调优负载平衡！
                          </p>
                        </div>
                      </div>

                      {/* Modal Footer */}
                      <div className="border-t border-slate-100 pt-4 mt-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setShowConfigModal(false)}
                          className="w-full py-2.5 bg-slate-900 hover:bg-slate-850 text-white text-xs font-black rounded-xl transition-all shadow-md shadow-slate-900/10 hover:-translate-y-0.5 uppercase tracking-wide cursor-pointer"
                        >
                          保存排期规则权重配置 · 重新校对智能排期
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
                <div className="hidden">
                  <div className="p-0">
                    {Object.entries(groupedSchedules).map(
                      ([week, weekSchedules]) => (
                        <div key={week} className="mb-6">
                          {/* 按周分组展示 */}
                          <div
                            onClick={() => toggleWeek(week)}
                            className="sticky top-0 z-20 border-l-4 border-primary bg-primary/5 px-6 py-4 flex items-center justify-between cursor-pointer group"
                          >
                            <div className="flex items-center gap-4">
                              <Calendar className="w-5 h-5 text-primary" />
                              <input
                                value={week}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setSchedules((prev) =>
                                    prev.map((s) =>
                                      s.weekRange === week
                                        ? { ...s, weekRange: val }
                                        : s,
                                    ),
                                  );
                                }}
                                className="text-lg font-black text-slate-800 bg-transparent border-none focus:ring-0 p-0 w-64"
                              />
                              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                                {weekSchedules.length} 个方向
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addScheduleRow(week, true);
                                }}
                                className="ml-4 bg-primary text-white border border-primary/20 rounded-lg shadow-md hover:bg-slate-900 transition-all flex items-center justify-center gap-1.5 px-4 py-1.5"
                              >
                                <Plus className="w-4 h-4" />
                                <span className="text-[11px] font-black">
                                  添加排期方向
                                </span>
                              </button>
                            </div>
                            <ChevronDown
                              className={`w-5 h-5 text-slate-400 transition-all ${collapsedWeeks[week] ? "-rotate-90" : ""}`}
                            />
                          </div>

                          {!collapsedWeeks[week] && (
                            <table className="w-full text-left border-collapse">
                              <thead className="bg-slate-50 sticky top-[60px] z-10 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider shadow-sm">
                                <tr>
                                  <th className="px-4 py-4 w-[200px]">
                                    方向名称
                                  </th>
                                  <th className="px-4 py-4">时间节点</th>
                                  <th className="px-4 py-4">对应需求</th>
                                  <th className="px-4 py-4">优先级</th>
                                  <th className="px-4 py-4">难度</th>
                                  <th className="px-4 py-4">形式</th>
                                  <th className="px-4 py-4">场景</th>
                                  <th className="px-4 py-4">类型</th>
                                  <th className="px-4 py-4 text-center">
                                    排期进度 (提审/总需)
                                  </th>
                                  <th className="px-4 py-4">负责人</th>
                                  <th className="px-4 py-4 text-right">操作</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50 text-[11px]">
                                {weekSchedules.map((row) => {
                                  const formConfig = getFormConfig(row.form);
                                  return (
                                    <tr
                                      key={row.id}
                                      className="hover:bg-slate-50/50 transition-colors"
                                    >
                                      <td className="px-4 py-4">
                                        <input
                                          value={row.directionName}
                                          onChange={(e) =>
                                            updateSchedule(row.id, {
                                              directionName: e.target.value,
                                            })
                                          }
                                          className="w-full bg-transparent border-none font-black text-slate-800 focus:ring-0 p-0 text-sm"
                                        />
                                      </td>
                                      <td className="px-4 py-4 text-[10px] text-slate-500 space-y-1 min-w-[140px]">
                                        <div className="flex items-center gap-2">
                                          <span className="w-12 text-slate-400 font-bold">
                                            需求截止:
                                          </span>
                                          <input
                                            type="date"
                                            value={row.requirementEnd}
                                            onChange={(e) =>
                                              updateSchedule(row.id, {
                                                requirementEnd: e.target.value,
                                              })
                                            }
                                            className="bg-slate-50 px-1 border border-slate-100 rounded text-[10px] font-mono focus:ring-0"
                                          />
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className="w-12 text-slate-400 font-bold">
                                            制作截止:
                                          </span>
                                          <input
                                            type="date"
                                            value={row.productionEnd}
                                            onChange={(e) =>
                                              updateSchedule(row.id, {
                                                productionEnd: e.target.value,
                                              })
                                            }
                                            className="bg-slate-50 px-1 border border-slate-100 rounded text-[10px] font-mono focus:ring-0"
                                          />
                                        </div>
                                      </td>
                                      <td className="px-4 py-4">
                                        <div className="flex flex-wrap gap-1 max-w-[120px]">
                                          {requirements
                                            .filter(
                                              (r) => r.scheduleId === row.id,
                                            )
                                            .slice(0, 2)
                                            .map((r) => (
                                              <button
                                                key={r.id}
                                                onClick={() =>
                                                  setSelectedReq(r)
                                                }
                                                className="px-1.5 py-0.5 bg-slate-100 hover:bg-primary/10 hover:text-primary rounded text-[9px] font-mono font-bold text-slate-500 transition-all border border-slate-200 shadow-sm"
                                              >
                                                {r.id.split("-")[0]}
                                              </button>
                                            ))}
                                          {requirements.filter(
                                            (r) => r.scheduleId === row.id,
                                          ).length > 2 && (
                                            <button
                                              onClick={() =>
                                                setViewingSpecificRequirements(
                                                  requirements.filter(
                                                    (r) =>
                                                      r.scheduleId === row.id,
                                                  ),
                                                )
                                              }
                                              className="px-1.5 py-0.5 bg-indigo-50 border border-indigo-100 rounded text-[9px] font-black text-indigo-500 hover:bg-indigo-100 transition-all shadow-sm"
                                            >
                                              +
                                              {requirements.filter(
                                                (r) => r.scheduleId === row.id,
                                              ).length - 2}
                                            </button>
                                          )}
                                          {requirements.filter(
                                            (r) => r.scheduleId === row.id,
                                          ).length === 0 && (
                                            <span className="text-[10px] text-slate-300 italic">
                                              未关联
                                            </span>
                                          )}
                                        </div>
                                      </td>

                                      <td className="px-4 py-4">
                                        <select
                                          value={row.priority}
                                          onChange={(e) =>
                                            updateSchedule(row.id, {
                                              priority: e.target.value as any,
                                            })
                                          }
                                          className={`px-2 py-1 rounded font-black border-none text-[10px] focus:ring-0 cursor-pointer ${getPriorityStyle(row.priority)}`}
                                        >
                                          <option
                                            value=""
                                            className="text-slate-400 bg-white italic"
                                          >
                                            请选择
                                          </option>
                                          <option
                                            value="Low"
                                            className="text-slate-900 bg-white"
                                          >
                                            低
                                          </option>
                                          <option
                                            value="Mid"
                                            className="text-slate-900 bg-white"
                                          >
                                            中
                                          </option>
                                          <option
                                            value="High"
                                            className="text-slate-900 bg-white"
                                          >
                                            高
                                          </option>
                                          <option
                                            value="Highest"
                                            className="text-slate-900 bg-white"
                                          >
                                            最高
                                          </option>
                                        </select>
                                      </td>
                                      <td className="px-4 py-4">
                                        <select
                                          value={row.difficulty}
                                          onChange={(e) =>
                                            updateSchedule(row.id, {
                                              difficulty: e.target.value as any,
                                            })
                                          }
                                          className={`px-2 py-1 rounded-lg border text-[10px] font-bold focus:ring-0 ${getDifficultyStyle(row.difficulty)}`}
                                        >
                                          <option
                                            value=""
                                            className="text-slate-400 bg-white"
                                          >
                                            请选择
                                          </option>
                                          <option value="Senior">高级</option>
                                          <option value="Junior">初级</option>
                                          <option value="Test">测试</option>
                                        </select>
                                      </td>
                                      <td className="px-4 py-4">
                                        <div
                                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black ${formConfig.color}`}
                                        >
                                          {formConfig.icon && (
                                            <formConfig.icon className="w-3 h-3" />
                                          )}
                                          <select
                                            value={row.form}
                                            onChange={(e) =>
                                              updateSchedule(row.id, {
                                                form: e.target.value as any,
                                              })
                                            }
                                            className="bg-transparent border-none p-0 focus:ring-0 text-[10px] font-black"
                                          >
                                            <option
                                              value=""
                                              className="text-slate-400 bg-white italic"
                                            >
                                              请选择
                                            </option>
                                            <option value="Video">视频</option>
                                            <option value="Playable">
                                              试玩
                                            </option>
                                            <option value="Image">图片</option>
                                          </select>
                                        </div>
                                      </td>
                                      <td className="px-4 py-4">
                                        <select
                                          value={row.scenario}
                                          onChange={(e) =>
                                            updateSchedule(row.id, {
                                              scenario: e.target.value as any,
                                            })
                                          }
                                          className={`px-2 py-1 rounded-lg text-[10px] font-bold focus:ring-0 border-none ${getScenarioStyle(row.scenario)}`}
                                        >
                                          <option
                                            value=""
                                            className="text-slate-400 bg-white italic"
                                          >
                                            请选择
                                          </option>
                                          <option value="Standard">通投</option>
                                          <option value="Localized">
                                            本地化
                                          </option>
                                          <option value="ASO">ASO</option>
                                        </select>
                                      </td>
                                      <td className="px-4 py-4">
                                        <select
                                          value={row.directionType}
                                          onChange={(e) =>
                                            updateSchedule(row.id, {
                                              directionType: e.target
                                                .value as any,
                                            })
                                          }
                                          className={`px-2 py-1 rounded-lg border text-[10px] font-bold focus:ring-0 ${getDirectionTypeStyle(row.directionType)}`}
                                        >
                                          <option
                                            value=""
                                            className="text-slate-400 bg-white italic"
                                          >
                                            请选择
                                          </option>
                                          <option value="Original-Gameplay">
                                            原创-玩法
                                          </option>
                                          <option value="Original-Hook">
                                            原创-吸量
                                          </option>
                                          <option value="Original-Master">
                                            原创-母版
                                          </option>
                                          <option value="Scaling-Iteration">
                                            放量-迭代
                                          </option>
                                          <option value="Scaling-Editing">
                                            放量-剪辑
                                          </option>
                                          <option value="Test-Hook">
                                            测试-吸量
                                          </option>
                                          <option value="Test-Gameplay">
                                            测试-玩法
                                          </option>
                                        </select>
                                      </td>
                                      <td className="px-4 py-4">
                                        <div className="flex flex-col gap-2 w-full max-w-[140px] mx-auto">
                                          {/* 总提审进度 */}
                                          <div className="space-y-1">
                                            <div className="flex justify-between items-center text-[9px] font-bold">
                                              <span className="text-slate-400">
                                                总需求数
                                              </span>
                                              <div className="flex items-center gap-1">
                                                <span className="text-slate-900">
                                                  {row.submittedCount}
                                                </span>
                                                <span className="text-slate-300">
                                                  /
                                                </span>
                                                <input
                                                  type="number"
                                                  value={row.totalRequiredCount}
                                                  onChange={(e) =>
                                                    updateSchedule(row.id, {
                                                      totalRequiredCount:
                                                        parseInt(
                                                          e.target.value,
                                                        ) || 0,
                                                    })
                                                  }
                                                  className="w-8 bg-transparent border-none p-0 text-slate-400 focus:ring-0 text-[10px] font-bold"
                                                />
                                              </div>
                                            </div>
                                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                              <div
                                                className="h-full bg-primary"
                                                style={{
                                                  width: `${(row.submittedCount / (row.totalRequiredCount || 1)) * 100}%`,
                                                }}
                                              ></div>
                                            </div>
                                          </div>
                                          {/* 有效产出进度 */}
                                          <div className="space-y-1">
                                            <div className="flex justify-between items-center text-[9px] font-bold">
                                              <span className="text-emerald-500">
                                                有效产出
                                              </span>
                                              <div className="flex items-center gap-1">
                                                <input
                                                  type="number"
                                                  value={row.validCount}
                                                  onChange={(e) =>
                                                    updateSchedule(row.id, {
                                                      validCount:
                                                        parseInt(
                                                          e.target.value,
                                                        ) || 0,
                                                    })
                                                  }
                                                  className="w-8 bg-white border border-emerald-100 rounded px-1 py-0.5 text-emerald-600 focus:ring-1 focus:ring-emerald-200 text-[10px] font-black"
                                                />
                                                <span className="text-slate-300">
                                                  /
                                                </span>
                                                <input
                                                  type="number"
                                                  value={row.totalRequiredCount}
                                                  onChange={(e) =>
                                                    updateSchedule(row.id, {
                                                      totalRequiredCount:
                                                        parseInt(
                                                          e.target.value,
                                                        ) || 0,
                                                    })
                                                  }
                                                  className="w-8 bg-transparent border-none p-0 text-slate-400 focus:ring-0 text-[10px] font-bold"
                                                />
                                              </div>
                                            </div>
                                            <div className="h-1.5 bg-emerald-50 rounded-full overflow-hidden">
                                              <div
                                                className="h-full bg-emerald-500"
                                                style={{
                                                  width: `${(row.validCount / (row.totalRequiredCount || 1)) * 100}%`,
                                                }}
                                              ></div>
                                            </div>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="px-4 py-4">
                                        <div className="flex items-center gap-2">
                                          <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[8px] font-bold border border-slate-200">
                                            {row.owner.charAt(0)}
                                          </div>
                                          <span className="font-bold text-slate-600">
                                            {row.owner}
                                          </span>
                                        </div>
                                      </td>
                                      <td className="px-4 py-4 text-[9px] text-slate-400 space-y-1">
                                        <div className="flex items-center gap-2">
                                          <span className="w-12">
                                            需求截止:
                                          </span>
                                          <input
                                            type="date"
                                            value={row.requirementEnd}
                                            onChange={(e) =>
                                              updateSchedule(row.id, {
                                                requirementEnd: e.target.value,
                                              })
                                            }
                                            className="bg-slate-50 px-1 border-none rounded text-[9px] font-mono focus:ring-0"
                                          />
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className="w-12">
                                            制作截止:
                                          </span>
                                          <input
                                            type="date"
                                            value={row.productionEnd}
                                            onChange={(e) =>
                                              updateSchedule(row.id, {
                                                productionEnd: e.target.value,
                                              })
                                            }
                                            className="bg-slate-50 px-1 border-none rounded text-[9px] font-mono focus:ring-0"
                                          />
                                        </div>
                                      </td>
                                      <td className="px-4 py-4 text-right">
                                        <button
                                          onClick={() => {
                                            if (confirm("确定删除此行？"))
                                              setSchedules(
                                                schedules.filter(
                                                  (s) => s.id !== row.id,
                                                ),
                                              );
                                          }}
                                          className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          )}
                        </div>
                      ),
                    )}
                  </div>

                  {/* 底部新增周期 按钮 */}
                  <div
                    className="p-8 flex flex-col items-center justify-center border-t-4 border-slate-100 bg-slate-50/30 text-slate-400 group cursor-pointer hover:bg-slate-50 transition-all"
                    onClick={() => addScheduleRow()}
                  >
                    <div className="w-12 h-12 rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center group-hover:border-primary group-hover:text-primary transition-all group-hover:scale-110 group-hover:rotate-90">
                      <Plus className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-black mt-3 group-hover:text-primary transition-colors tracking-tight">
                      创建排期周期 (ADD NEW WEEK)
                    </p>
                  </div>
                </div>
              )}
          </>
        )}
      </div>

      {/* 排期卡片选择器 (新增需求的第一步) */}
      {showScheduleSelector && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300 p-6">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-900 leading-tight">
                  选择创意排期方向
                </h3>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  请先选择一个排期方向来创建具体的需求 (2026-05-12 ~ 2026-05-19)
                </p>
              </div>
              <button
                onClick={() => setShowScheduleSelector(false)}
                className="p-2 hover:bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-all"
              >
                <XCircle className="w-8 h-8" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-6 no-scrollbar">
              {schedules.map((sched) => (
                <div
                  key={sched.id}
                  onClick={() => handleAddRequirementFromSchedule(sched.id)}
                  className="group relative bg-slate-50 p-6 rounded-3xl border-2 border-transparent hover:border-primary hover:bg-white hover:shadow-xl transition-all cursor-pointer flex flex-col gap-4"
                >
                  <div className="flex justify-between items-start">
                    <div
                      className={`px-2 py-1 rounded text-[9px] font-black ${getPriorityStyle(sched.priority)} shadow-sm`}
                    >
                      {sched.priority === "High"
                        ? "高"
                        : sched.priority === "Mid"
                          ? "中"
                          : "低"}
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] text-slate-400 font-bold">
                        需求截止
                      </span>
                      <span className="text-xs font-black text-slate-800">
                        {sched.requirementEnd}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-base font-black text-slate-900 group-hover:text-primary transition-colors">
                      {sched.directionName}
                    </h4>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="px-2 py-0.5 bg-slate-200 rounded text-[9px] font-bold text-slate-600">
                        {sched.directionType}
                      </span>
                      <span className="px-2 py-0.5 bg-slate-200 rounded text-[9px] font-bold text-slate-600">
                        {sched.form}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 font-bold">
                        负责人
                      </span>
                      <span className="text-xs font-black text-slate-700">
                        {sched.owner}
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] text-slate-400 font-bold">
                        进度 (已提/总需)
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-primary">
                          {sched.submittedCount}
                        </span>
                        <span className="text-slate-300">/</span>
                        <span className="text-sm font-black text-slate-800">
                          {sched.totalRequiredCount}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-2">
                    <ChevronRight className="w-8 h-8 text-primary" />
                  </div>
                </div>
              ))}

              <div
                className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center p-8 gap-4 hover:border-primary/50 transition-all group cursor-pointer"
                onClick={() => {
                  const newReq: Requirement = {
                    id: `cp${3377 + requirements.length}-01`,
                    name: `未关联方向需求 - ${requirements.length + 1}`,
                    previews: ["https://picsum.photos/270/480?random=none"],
                    duration: "0:30",
                    goal: "直接创建，不关联方向",
                    template: "A+B",
                    has3DPlot: false,
                    direction: "未关联方向",
                    owner: "唐欣怡",
                    creativePersonnel: "唐欣怡",
                    productionPersonnel: ["张欢"],
                    materialStage: "新",
                    broadDirection: "原始玩法",
                    priority: "Mid",
                    reqStatus: "Draft",
                    prodStatus: "Scheduled",
                    deliveryStatus: "Paused",
                    status: "Draft",
                    rating: 0,
                    createdAt: new Date()
                      .toISOString()
                      .slice(0, 19)
                      .replace("T", " "),
                    completedAt: "",
                    stageType: "Original Gameplay",
                    language: "en",
                    channels: ["all"],
                    testDirections: ["前贴"],
                    dimensions: ["916"],
                    assetType: "Video",
                    assetIndex: 3377 + requirements.length,
                    assetVersion: "01",
                    projectName: "Panthia",
                    script: "",
                    aTags: [],
                    bTags: [],
                    difficulty: "C",
                    tasks: [],
                  };
                  setRequirements([...requirements, newReq]);
                  setSelectedReq(newReq);
                  setShowScheduleSelector(false);
                }}
              >
                <div className="w-12 h-12 rounded-2xl border-2 border-dashed border-slate-350 flex items-center justify-center group-hover:border-primary group-hover:text-primary transition-all group-hover:scale-110">
                  <Plus className="w-6 h-6 text-slate-400 group-hover:text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-extrabold text-slate-800 uppercase tracking-tight group-hover:text-primary transition-colors">
                    不关联，直接创建空模版
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    自主设计非标/测试类需求
                  </p>
                </div>
              </div>
            </div>

            <div className="px-8 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50/50">
              <p className="text-[10px] text-slate-400 font-extrabold uppercase">
                提示: 双击需求号可快捷绑定关联至所选的创意方向
              </p>
              <button
                onClick={() => setShowScheduleSelector(false)}
                className="px-6 py-2 text-xs font-black text-slate-400 hover:text-slate-600 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 创建周周期弹窗 */}
      {showAddWeekPopup && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-6">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col p-6 gap-4">
            <h3 className="text-lg font-black text-slate-900">创建排期周期</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1.5">
                  时间范围 (如: 2026-05-20 ~ 2026-05-27)
                </label>
                <input
                  type="text"
                  placeholder="YYYY-MM-DD ~ YYYY-MM-DD"
                  value={newWeekRange}
                  onChange={(e) => setNewWeekRange(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-primary/20 focus:outline-none"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowAddWeekPopup(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 transition-all"
                >
                  取消
                </button>
                <button
                  onClick={handleAddWeek}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-slate-900 transition-all"
                >
                  确认创建
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 弹窗排期需求详情 */}
      {selectedScheduleForModal &&
        (() => {
          const s =
            schedules.find((item) => item.id === selectedScheduleForModal.id) ||
            selectedScheduleForModal;
          const associatedReqs = requirements.filter(
            (r) => r.scheduleId === s.id,
          );

          return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200 font-sans">
              <div className="w-full max-w-7xl h-[88vh] bg-white rounded-3xl shadow-2xl border border-slate-200/80 flex flex-col overflow-hidden relative animate-in zoom-in-95 duration-200">
                {/* 高档一体化白底弹窗 Header (White-backed Premium Header) */}
                <div className="px-6 py-5 md:px-8 md:py-6 bg-slate-50/50 border-b border-slate-100 flex flex-col gap-4 shrink-0 select-none">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    {/* 标题 & 周期/分类徽章 */}
                    <div className="space-y-2.5 max-w-full md:max-w-[70%]">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 border border-indigo-100 rounded-lg text-[10px] font-bold text-indigo-700 shadow-3xs">
                          <Target className="w-3 h-3 text-indigo-500" />
                          <span>排期方向分类 & ID:</span>
                          <span className="text-indigo-900 font-extrabold">
                            {s.id}
                          </span>
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-sky-50 border border-sky-100 rounded-lg text-[10px] font-mono font-bold text-sky-700 shadow-3xs">
                          <span>📅 排期周期:</span>
                          <span className="text-sky-900 font-black">
                            {s.weekRange || "通用周期"}
                          </span>
                        </span>
                      </div>

                      <h2 className="text-xl md:text-2xl font-black text-slate-850 tracking-tight break-words leading-tight">
                        {s.directionName || "未命名方向"}
                      </h2>
                    </div>

                    {/* 顶栏操作区域 */}
                    <div className="flex items-center gap-3 shrink-0 self-end md:self-start">
                      <button
                        onClick={() => handleAddRequirementForDirection(s.id)}
                        className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-550 active:scale-95 text-white text-xs font-black rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-600/10 transition-all cursor-pointer"
                      >
                        <Plus className="w-4 h-4" /> 关联增加新创意需求
                      </button>
                      <button
                        onClick={() => setSelectedScheduleForModal(null)}
                        className="p-2.5 bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-150 text-slate-500 hover:text-rose-600 rounded-xl transition-all active:scale-95 cursor-pointer flex items-center justify-center shadow-3xs"
                        title="关闭 [Esc]"
                      >
                        <X className="w-4 h-4 stroke-[2.5]" />
                      </button>
                    </div>
                  </div>

                  {/* 目标策略横幅卡片 */}
                  <div className="p-3.5 bg-rose-50/50 border border-rose-100/50 rounded-2xl flex items-start gap-2.5 text-xs">
                    <span className="text-base leading-none shrink-0">🎯</span>
                    <div className="space-y-0.5">
                      <span className="font-bold text-rose-800">目标策略:</span>
                      <p className="text-slate-700 font-medium leading-relaxed select-text">
                        {s.validationGoal || "暂无详细目标说明..."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 主体内置滚动展示区 */}
                <div className="flex-1 overflow-auto p-4 md:p-8 bg-slate-50/15 flex flex-col">
                  {/* 第二部分：关联的所有项 (Requirements List Table) */}
                  <div className="bg-white rounded-2xl border border-slate-150 shadow-sm flex flex-col overflow-hidden">
                    <div className="px-6 py-5 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-xs font-black text-slate-850 uppercase tracking-wider flex items-center gap-1.5">
                          <ListTodo className="w-4 h-4 text-indigo-550" />
                          关联具体创意需求契约列表 ({associatedReqs.length}{" "}
                          REQUIRES)
                        </h3>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                          点击各行可在右侧全屏展开具体创意设计稿/子版本信息/物料历史
                        </p>
                      </div>

                      <button
                        onClick={() => handleAddRequirementForDirection(s.id)}
                        className="px-3.5 py-1.8 bg-white hover:bg-slate-50 text-indigo-650 border border-slate-200 hover:border-indigo-300 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-3xs active:scale-95 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> 快速追加一行创意
                      </button>
                    </div>

                    {associatedReqs.length === 0 ? (
                      <div className="py-20 text-center flex flex-col items-center justify-center text-slate-400 px-6">
                        <Inbox className="w-10 h-10 text-slate-200 mb-3" />
                        <p className="text-xs font-extrabold text-slate-450 mb-4">
                          该方向中目前尚未创建任何需求合约
                        </p>
                        <button
                          onClick={() => handleAddRequirementForDirection(s.id)}
                          className="px-5 py-2.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100/85 border border-indigo-200 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all"
                        >
                          <Plus className="w-4 h-4" /> 马上新建并关联该方向
                        </button>
                      </div>
                    ) : (
                      <div className="overflow-x-auto no-scrollbar">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-slate-55 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 select-none">
                              <th className="px-5 py-3.5 pl-8">需求编号</th>
                              <th className="px-5 py-3.5">预览设计图</th>
                              <th className="px-5 py-3.5">创意需求名称</th>
                              <th className="px-5 py-3.5 text-center">
                                设计优先级
                              </th>
                              <th className="px-5 py-3.5">核心创意人</th>
                              <th className="px-5 py-3.5">交付状态</th>
                              <th className="px-5 py-3.5">制作生命周期</th>
                              <th className="px-5 py-3.5 text-center">
                                本地提审测试
                              </th>
                              <th className="px-5 py-3.5 text-center">
                                推广投放
                              </th>
                              <th className="px-5 py-3.5 text-right pr-8">
                                操作
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {associatedReqs.map((req) => (
                              <tr
                                key={req.id}
                                className="hover:bg-indigo-50/15 cursor-pointer transition-all group"
                                onClick={() => setSelectedReq(req)}
                              >
                                {/* ID */}
                                <td className="px-5 py-3.5 font-mono font-bold text-slate-400 relative pl-8">
                                  {req.parentId && (
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center">
                                      <div className="w-3.5 h-[1.5px] bg-slate-300"></div>
                                    </div>
                                  )}
                                  <span
                                    className={
                                      req.parentId
                                        ? "ml-4 bg-slate-100 text-slate-500 px-1 py-0.5 rounded text-[8px] font-bold"
                                        : "text-indigo-600"
                                    }
                                  >
                                    {req.id}
                                  </span>
                                </td>

                                {/* Previews */}
                                <td className="px-5 py-3.5">
                                  <div className="flex gap-1">
                                    {(req.previews || [])
                                      .slice(0, 3)
                                      .map((p, idx) => (
                                        <div
                                          key={idx}
                                          className="w-8 h-8 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 shrink-0 shadow-3xs hover:scale-110 hover:z-10 transition-transform"
                                        >
                                          <img
                                            src={p}
                                            className="w-full h-full object-cover"
                                            referrerPolicy="no-referrer"
                                          />
                                        </div>
                                      ))}
                                  </div>
                                </td>

                                {/* Name */}
                                <td className="px-5 py-3.5 font-bold text-slate-800 max-w-[180px] break-words">
                                  <div className="flex flex-col gap-0.5">
                                    <div className="flex items-center gap-1.5 truncate">
                                      {req.parentId && (
                                        <span className="bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded text-[8px] font-black uppercase tracking-wider">
                                          Sub
                                        </span>
                                      )}
                                      <span>{req.name}</span>
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-medium font-mono">
                                      {req.projectName} · {req.assetType} (
                                      {req.dimensions?.[0] || "16:9"})
                                    </span>
                                  </div>
                                </td>

                                {/* Priority Select */}
                                <td
                                  className="px-5 py-3.5 text-center"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <div className="flex justify-center">
                                    <select
                                      value={req.priority}
                                      onChange={(e) =>
                                        updateRequirement(req.id, {
                                          priority: e.target
                                            .value as RequirementPriority,
                                        })
                                      }
                                      className={`px-2 py-1 rounded-lg text-[10px] font-bold focus:ring-0 border border-transparent hover:border-slate-200 cursor-pointer text-center w-20 transition-all ${getPriorityStyle(req.priority)}`}
                                    >
                                      <option value="Low">低 Low</option>
                                      <option value="Mid">中 Mid</option>
                                      <option value="High">高 High</option>
                                      <option value="Highest">
                                        最高 Highest
                                      </option>
                                    </select>
                                  </div>
                                </td>

                                {/* Personnel */}
                                <td className="px-5 py-3.5">
                                  <div className="flex flex-col gap-0.5 font-sans">
                                    <span className="font-extrabold text-slate-705">
                                      {req.creativePersonnel}
                                    </span>
                                    <span className="text-[9.5px] text-slate-400 font-semibold italic">
                                      制作方:{" "}
                                      {(req.productionPersonnel || ["-"]).join(
                                        ", ",
                                      )}
                                    </span>
                                  </div>
                                </td>

                                {/* reqStatus */}
                                <td
                                  className="px-5 py-3.5"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <select
                                    value={req.reqStatus}
                                    onChange={(e) =>
                                      updateRequirement(req.id, {
                                        reqStatus: e.target
                                          .value as RequirementReqStatus,
                                      })
                                    }
                                    className={`px-2.5 py-1 rounded-full text-[10px] font-black cursor-pointer border-none shadow-3xs ${getStatusStyle(req.reqStatus)}`}
                                  >
                                    <option value="Draft">草稿 Draft</option>
                                    <option value="Pending">
                                      待审核 Pending
                                    </option>
                                    <option value="Approved">
                                      通过 Approved
                                    </option>
                                    <option value="Modification">
                                      修改 Modification
                                    </option>
                                  </select>
                                </td>

                                {/* prodStatus */}
                                <td
                                  className="px-5 py-3.5"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <select
                                    value={req.prodStatus}
                                    onChange={(e) =>
                                      updateRequirement(req.id, {
                                        prodStatus: e.target
                                          .value as RequirementProdStatus,
                                      })
                                    }
                                    className={`px-2 py-1 border rounded-lg text-[10px] font-bold focus:ring-1 focus:ring-slate-150 cursor-pointer tracking-tight transition-all ${getProdStatusStyle(req.prodStatus)}`}
                                  >
                                    <option value="Scheduled">🕓 排期中</option>
                                    <option value="InProgress">
                                      🚀 制作中
                                    </option>
                                    <option value="Completed">✅ 已完成</option>
                                  </select>
                                </td>

                                {/* Test status */}
                                <td
                                  className="px-5 py-3.5 text-center"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {req.assetType === "Playable" ? (
                                    <select
                                      value={req.testStatus || "待测试"}
                                      onChange={(e) =>
                                        updateRequirement(req.id, {
                                          testStatus: e.target.value as any,
                                        })
                                      }
                                      className="bg-purple-50 text-purple-700 font-black px-2 py-1 rounded-lg text-[10px] border border-purple-200 focus:outline-none cursor-pointer"
                                    >
                                      <option value="待测试 font-bold">
                                        待测试
                                      </option>
                                      <option value="测试中 font-bold">
                                        测试中
                                      </option>
                                      <option value="数据合格 font-bold">
                                        数据合格
                                      </option>
                                      <option value="不达标 font-bold">
                                        不达标
                                      </option>
                                    </select>
                                  ) : (
                                    <span className="text-slate-350 italic text-[10px]">
                                      -
                                    </span>
                                  )}
                                </td>

                                {/* Delivery Play/Pause */}
                                <td
                                  className="px-5 py-3.5 text-center"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <div className="flex justify-center">
                                    <button
                                      onClick={() =>
                                        updateRequirement(req.id, {
                                          deliveryStatus:
                                            req.deliveryStatus === "Delivering"
                                              ? "Paused"
                                              : "Delivering",
                                        })
                                      }
                                      className={`flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-slate-50 border rounded-xl shadow-3xs transition-all font-black text-[10px] ${
                                        req.deliveryStatus === "Delivering"
                                          ? "text-emerald-600 border-emerald-250 bg-emerald-50/20"
                                          : "text-slate-400 border-slate-200"
                                      }`}
                                    >
                                      {req.deliveryStatus === "Delivering" ? (
                                        <>
                                          <Play className="w-2.5 h-2.5 fill-current text-emerald-600" />
                                          <span>投放中</span>
                                        </>
                                      ) : (
                                        <>
                                          <Pause className="w-2.5 h-2.5 fill-current text-slate-400" />
                                          <span>暂停</span>
                                        </>
                                      )}
                                    </button>
                                  </div>
                                </td>

                                {/* Deletion */}
                                <td
                                  className="px-5 py-3.5 text-right pr-8"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button
                                    onClick={(e) => {
                                      if (confirm("确定要删除这行需求合约吗？"))
                                        handleDelete(req.id, e);
                                    }}
                                    className="p-2 text-slate-350 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-transparent hover:border-rose-100 transition-all opacity-40 group-hover:opacity-100"
                                    title="从列表中删除"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

      {selectedReq && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full h-full bg-white overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <RequirementDetail
              requirement={selectedReq}
              onClose={() => setSelectedReq(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default RequirementCenter;
