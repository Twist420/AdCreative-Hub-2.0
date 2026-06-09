import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import {
  Requirement,
  RequirementReqStatus,
  RequirementProdStatus,
  RequirementDeliveryStatus,
  RequirementPriority,
  ProductionTask,
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

const createDefaultProductionTasks = (
  requirementId: string,
  assetType: CreativeForm,
  broadDirection: Requirement["broadDirection"],
): ProductionTask[] => {
  const createTask = (
    idSuffix: string,
    type: ProductionTask["type"],
    role: string,
    dependencyIds: string[] = [],
    estimatedWorkDays = 1,
  ): ProductionTask => ({
    id: `${requirementId}-${idSuffix}`,
    type,
    role,
    status: "待排期",
    designer: "",
    startDate: "",
    endDate: "",
    duration: `${estimatedWorkDays}天`,
    estimatedWorkDays,
    dependencyIds,
  });

  const graphicTask = createTask("graphic", "Graphic", "平面", [], 1);
  const videoTask = createTask("video", "Composition", "视频", [graphicTask.id], 2);

  if (assetType === "Image") {
    return [graphicTask];
  }
  if (assetType === "Playable") {
    return [
      graphicTask,
      videoTask,
      createTask("program", "Program", "程序", [graphicTask.id, videoTask.id], 2),
    ];
  }
  if (broadDirection === "3D玩法") {
    const modelTask = createTask("model3d", "Model3D", "模型", [], 2);
    const sceneTask = createTask("scene3d", "Scene3D", "地编", [], 2);
    return [
      modelTask,
      sceneTask,
      createTask("video", "Composition", "视频", [modelTask.id, sceneTask.id], 2),
    ];
  }
  return [graphicTask, videoTask];
};

const summarizeProductionStatus = (
  requirement: Requirement,
): RequirementProdStatus => {
  const tasks = requirement.tasks || [];
  if (tasks.length === 0) return requirement.prodStatus || "Scheduled";
  if (tasks.every((task) => task.status === "已完成")) return "Completed";
  if (tasks.some((task) => task.status === "制作中")) return "InProgress";
  return "Scheduled";
};

interface ScheduledTaskView {
  id: string;
  requirement: Requirement;
  task?: ProductionTask;
  producer: string;
  role: string;
  status: string;
  startDate: string;
  endDate: string;
  estimatedWorkDays: number;
}

const getTaskProductionType = (
  requirement: Requirement,
  task?: ProductionTask,
): string => {
  if (!task) return getReqType(requirement);
  if (task.type === "Graphic") return "平面";
  if (task.type === "Program") return "Playable";
  if (task.type === "Model3D" || task.type === "Scene3D") return "3D";
  return getReqType(requirement);
};

const getScheduledTaskViews = (requirement: Requirement): ScheduledTaskView[] => {
  const taskViews = (requirement.tasks || [])
    .filter((task) => task.designer && task.startDate && task.endDate)
    .map((task): ScheduledTaskView => ({
      id: `${requirement.id}:${task.id}`,
      requirement,
      task,
      producer: task.designer,
      role: task.role || task.type,
      status: task.status || "已排期",
      startDate: task.startDate,
      endDate: task.endDate,
      estimatedWorkDays:
        task.estimatedWorkDays || Number.parseFloat(task.duration) || 1,
    }));

  if (taskViews.length > 0) return taskViews;
  if (!requirement.startDate || !requirement.endDate) return [];

  return (requirement.productionPersonnel || [])
    .filter(Boolean)
    .map((producer): ScheduledTaskView => ({
      id: `${requirement.id}:legacy:${producer}`,
      requirement,
      producer,
      role: getReqType(requirement),
      status:
        requirement.prodStatus === "Completed"
          ? "已完成"
          : requirement.prodStatus === "InProgress"
            ? "制作中"
            : "已排期",
      startDate: requirement.startDate || "",
      endDate: requirement.endDate || "",
      estimatedWorkDays: Number.parseFloat(requirement.duration || "") || 1,
    }));
};

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
  const todayString = formatCalendarDate(new Date());
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
      
      const isToday = formattedDate === todayString;
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

const parseDateValue = (dateStr?: string) => {
  if (!dateStr) return null;
  const timestamp = new Date(`${dateStr}T00:00:00`).getTime();
  return Number.isNaN(timestamp) ? null : timestamp;
};

const parseWeekRangeDates = (weekRange: string) => {
  const [start, end] = weekRange.split("~").map((part) => part.trim());
  return {
    start,
    end,
    startTime: parseDateValue(start) ?? 0,
    endTime: parseDateValue(end) ?? 0,
  };
};

const formatCalendarDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const rangesOverlap = (
  itemStart?: string,
  itemEnd?: string,
  filterStart?: string,
  filterEnd?: string,
) => {
  const filterStartTime = parseDateValue(filterStart);
  const filterEndTime = parseDateValue(filterEnd);
  if (filterStartTime === null && filterEndTime === null) return true;

  const itemStartTime = parseDateValue(itemStart) ?? parseDateValue(itemEnd);
  const itemEndTime = parseDateValue(itemEnd) ?? itemStartTime;
  if (itemStartTime === null || itemEndTime === null) return false;

  return (
    (filterStartTime === null || itemEndTime >= filterStartTime) &&
    (filterEndTime === null || itemStartTime <= filterEndTime)
  );
};

const getDateRangeDays = (startDate: string, endDate: string) => {
  const startTime = parseDateValue(startDate);
  const endTime = parseDateValue(endDate);
  if (startTime === null || endTime === null) return 0;
  return Math.max(1, Math.round((endTime - startTime) / 86400000) + 1);
};

const addDaysToDateString = (dateStr: string, days: number) => {
  const base = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(base.getTime())) return dateStr;
  base.setDate(base.getDate() + days);
  return formatCalendarDate(base);
};

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
  const productionTasks = useMemo(
    () => requirements.flatMap(getScheduledTaskViews),
    [requirements],
  );

  // States belonging to Production Scheduling Board
  const [selectedProducer, setSelectedProducer] = useState<string>("张欢");
  const [productionView, setProductionView] = useState<"calendar" | "gantt">(
    "calendar",
  );
  const [showPersonnelScheduleModal, setShowPersonnelScheduleModal] = useState(false);

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
  const [difficultyWorkHours] = useState<
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

  const [selectedReq, setSelectedReq] = useState<Requirement | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMoreDropdown, setShowMoreDropdown] = useState(false);
  const [showScheduleSelector, setShowScheduleSelector] = useState(false);
  const [selectedCreateType, setSelectedCreateType] =
    useState<CreativeForm>("Video");
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
    return ranges.sort((a, b) => {
      const aRange = parseWeekRangeDates(a);
      const bRange = parseWeekRangeDates(b);
      return bRange.endTime - aRange.endTime || bRange.startTime - aRange.startTime;
    });
  }, [schedules]);

  const pinnedWeekRanges = useMemo(() => weekRanges.slice(0, 4), [weekRanges]);
  const overflowWeekRanges = useMemo(() => weekRanges.slice(4), [weekRanges]);

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
  const [dateRangeStart, setDateRangeStart] = useState("");
  const [dateRangeEnd, setDateRangeEnd] = useState("");
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
    const hasDateRange = Boolean(dateRangeStart || dateRangeEnd);
    let list = hasDateRange
      ? schedules
      : schedules.filter((s) => s.weekRange === selectedWeekRange);
    if (dateRangeStart || dateRangeEnd) {
      list = list.filter((s) =>
        rangesOverlap(
          s.requirementStart || parseWeekRangeDates(s.weekRange).start,
          s.requirementEnd || parseWeekRangeDates(s.weekRange).end,
          dateRangeStart,
          dateRangeEnd,
        ),
      );
    }
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
    dateRangeStart,
    dateRangeEnd,
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
    }
  }, [weekRanges, selectedWeekRange]);

  const toggleDirection = (id: string) => {
    setCollapsedDirections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const buildRequirementFromSchedule = (
    schedule: CreativeSchedule,
    requirementIndex: number,
    overrides: Partial<Requirement> = {},
  ): Requirement => {
    const assetIndex = 3377 + requirementIndex;
    const directionType = schedule.directionType || "";
    const broadDirection =
      schedule.broadDirection ||
      (directionType.includes("3D")
        ? "3D玩法"
        : schedule.directionName?.includes("大字报")
          ? "大字报"
          : "原始玩法");
    const assetType = (overrides.assetType ||
      schedule.form ||
      "Video") as Requirement["assetType"];
    const idPrefix =
      assetType === "Video" ? "cp" : assetType === "Image" ? "tp" : "sw";
    const requirementId = `${idPrefix}${assetIndex}-01`;
    const defaultTasks = createDefaultProductionTasks(
      requirementId,
      assetType,
      broadDirection,
    );

    return {
      id: requirementId,
      scheduleId: schedule.id,
      name: `${schedule.directionName} - 需求`,
      assetType,
      assetIndex,
      assetVersion: "01",
      projectName: "Panthia",
      materialStage: schedule.materialStage || "新",
      broadDirection,
      creativePersonnel: schedule.owner,
      productionPersonnel: ["张欢"],
      language: "en",
      channels: schedule.channels?.length ? schedule.channels : ["all"],
      testDirections: ["前贴"],
      dimensions: ["9:16"],
      previews: [`https://picsum.photos/100/100?random=${requirementIndex}`],
      duration: "0:30",
      goal: schedule.validationGoal || `验证${schedule.directionName}`,
      template: "A+B",
      has3DPlot: directionType.includes("3D") || broadDirection === "3D玩法",
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
      tasks: defaultTasks,
      ...overrides,
    };
  };

  const handleAddRequirementForDirection = (
    scheduleId: string,
    assetTypeOverride?: CreativeForm,
  ) => {
    const schedule = schedules.find((s) => s.id === scheduleId);
    if (!schedule) return;

    const newReqIdx = requirements.length + 1;
    const newReq = buildRequirementFromSchedule(schedule, newReqIdx, {
      name: `新创意需求 - ${schedule.directionName}`,
      assetType: assetTypeOverride || schedule.form || "Video",
    });
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
  const [newWeekStart, setNewWeekStart] = useState("");
  const [newWeekEnd, setNewWeekEnd] = useState("");
  const [newWeekCalendarYear, setNewWeekCalendarYear] = useState(2026);
  const [newWeekCalendarMonth, setNewWeekCalendarMonth] = useState(6);
  const [viewingSpecificRequirements, setViewingSpecificRequirements] =
    useState<Requirement[] | null>(null);
  const [selectedScheduleForModal, setSelectedScheduleForModal] =
    useState<CreativeSchedule | null>(null);
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(
    null,
  );

  const [showWeekFilterDropdown, setShowWeekFilterDropdown] = useState(false);
  const weekFilterRef = useRef<HTMLDivElement>(null);
  const todayDateString = formatCalendarDate(new Date());
  const productionInsights = useMemo(() => {
    const weekStart = todayDateString;
    const weekEnd = addDaysToDateString(todayDateString, 6);
    const upcomingTasks = productionTasks.filter((task) =>
      rangesOverlap(task.startDate, task.endDate, weekStart, weekEnd),
    );
    const activeProducerCount = PRODUCERS.filter((producer) => producer.status === "在职").length;
    const weeklyCapacity = activeProducerCount * 5;
    const scheduledWorkDays = upcomingTasks.reduce((sum, task) => sum + (task.estimatedWorkDays || 1), 0);
    const scheduledProducerCount = new Set(upcomingTasks.map((task) => task.producer).filter(Boolean)).size;
    const highRiskRequirements = requirements
      .filter((req) => (req.priority === "Highest" || req.priority === "High") && req.prodStatus !== "Completed")
      .map((req) => {
        const schedule = schedules.find((item) => item.id === req.scheduleId);
        const dueDate = schedule?.productionEnd || req.endDate || "";
        const taskViews = getScheduledTaskViews(req);
        const hasUpcomingTask = taskViews.some((task) =>
          rangesOverlap(task.startDate, task.endDate, weekStart, weekEnd),
        );
        const hasDeadlineOverflow = !!dueDate && taskViews.some((task) => task.endDate > dueDate);
        const hasNoPlan = taskViews.length === 0;
        return {
          req,
          dueDate,
          reason: hasNoPlan
            ? "未排期"
            : hasDeadlineOverflow
              ? "超过方向截止"
              : !hasUpcomingTask
                ? "未来7天无任务"
                : "",
        };
      })
      .filter((item) => item.reason);

    return {
      weekStart,
      weekEnd,
      upcomingTaskCount: upcomingTasks.length,
      scheduledWorkDays,
      weeklyCapacity,
      loadRate: weeklyCapacity > 0 ? Math.round((scheduledWorkDays / weeklyCapacity) * 100) : 0,
      scheduledProducerCount,
      highRiskRequirements,
    };
  }, [productionTasks, requirements, schedules, todayDateString]);

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
      const matchAssetType =
        filters.assetType === "全部" || r.assetType === filters.assetType;

      return (
        matchSearch &&
        matchStage &&
        matchDirection &&
        matchCreative &&
        matchPriority &&
        matchReqStatus &&
        matchProdStatus &&
        matchAssetType
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

  const hasActiveRequirementQuery = useMemo(
    () =>
      Boolean(searchQuery.trim()) ||
      Object.values(filters).some((value) => value !== "全部"),
    [filters, searchQuery],
  );

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

    const newReq = buildRequirementFromSchedule(
      schedule,
      requirements.length + 1,
      {
        name: `新创意需求 - ${schedule.directionName}`,
        assetType: schedule.form || "Video",
      },
    );

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
    const mergeRequirement = (req: Requirement) => {
      const next = { ...req, ...updates };
      return { ...next, prodStatus: summarizeProductionStatus(next) };
    };
    setRequirements((prev) =>
      prev.map((r) => (r.id === id ? mergeRequirement(r) : r)),
    );
    setSelectedReq((prev) => (prev?.id === id ? mergeRequirement(prev) : prev));
  };

  const handleRequirementDetailChange = useCallback((updatedReq: Requirement) => {
    const normalizedReq = {
      ...updatedReq,
      prodStatus: summarizeProductionStatus(updatedReq),
    };
    setSelectedReq(normalizedReq);
    setRequirements((prev) =>
      prev.map((r) => (r.id === normalizedReq.id ? normalizedReq : r)),
    );
  }, []);

  const handleRequirementDetailDelete = useCallback((requirementId: string) => {
    setRequirements((prev) => prev.filter((r) => r.id !== requirementId));
    setSelectedReq((prev) => (prev?.id === requirementId ? null : prev));
  }, []);

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

  const openAddWeekPopup = () => {
    const today = new Date();
    setNewWeekCalendarYear(today.getFullYear());
    setNewWeekCalendarMonth(today.getMonth() + 1);
    setNewWeekStart("");
    setNewWeekEnd("");
    setNewWeekRange("");
    setShowAddWeekPopup(true);
  };

  const jumpNewWeekCalendarToToday = () => {
    const today = new Date();
    setNewWeekCalendarYear(today.getFullYear());
    setNewWeekCalendarMonth(today.getMonth() + 1);
  };

  const handleSelectNewWeekDay = (dateString: string) => {
    if (!newWeekStart || (newWeekStart && newWeekEnd)) {
      setNewWeekStart(dateString);
      setNewWeekEnd("");
      setNewWeekRange("");
      return;
    }

    const startTime = parseDateValue(newWeekStart) ?? 0;
    const selectedTime = parseDateValue(dateString) ?? 0;
    const start = selectedTime < startTime ? dateString : newWeekStart;
    const end = selectedTime < startTime ? newWeekStart : dateString;
    setNewWeekStart(start);
    setNewWeekEnd(end);
    setNewWeekRange(`${start} ~ ${end}`);
  };

  const handlePrevNewWeekMonth = () => {
    if (newWeekCalendarMonth === 1) {
      setNewWeekCalendarYear((prev) => prev - 1);
      setNewWeekCalendarMonth(12);
    } else {
      setNewWeekCalendarMonth((prev) => prev - 1);
    }
  };

  const handleNextNewWeekMonth = () => {
    if (newWeekCalendarMonth === 12) {
      setNewWeekCalendarYear((prev) => prev + 1);
      setNewWeekCalendarMonth(1);
    } else {
      setNewWeekCalendarMonth((prev) => prev + 1);
    }
  };

  const handleAddWeek = () => {
    if (!newWeekStart || !newWeekEnd) return;
    const range = `${newWeekStart} ~ ${newWeekEnd}`;
    // Add a dummy schedule for that week to make the row appear
    addScheduleRow(range);
    setSelectedWeekRange(range);
    setDateRangeStart("");
    setDateRangeEnd("");
    setShowAddWeekPopup(false);
    setNewWeekRange("");
    setNewWeekStart("");
    setNewWeekEnd("");
  };

  const newWeekCalendarWeeks = useMemo(
    () => getMonthWeeks(newWeekCalendarYear, newWeekCalendarMonth),
    [newWeekCalendarYear, newWeekCalendarMonth],
  );

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
                    <div className="flex flex-wrap items-center gap-2 pb-1 max-w-full sm:max-w-[75%] md:max-w-[80%] overflow-visible">
                      {pinnedWeekRanges.map((w) => {
                        const isActive =
                          !dateRangeStart &&
                          !dateRangeEnd &&
                          selectedWeekRange === w;
                        const status = weekStatusMap[w] || "inprogress";
                        return (
                          <button
                            key={w}
                            onClick={() => {
                              setSelectedWeekRange(w);
                              setDateRangeStart("");
                              setDateRangeEnd("");
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

                      {overflowWeekRanges.length > 0 && (
                        <div className="relative shrink-0" ref={weekFilterRef}>
                          <button
                            type="button"
                            onClick={() =>
                              setShowWeekFilterDropdown((prev) => !prev)
                            }
                            className={`h-[34px] px-3 rounded-xl text-[11px] font-black transition-all border outline-none flex items-center gap-1.5 ${
                              overflowWeekRanges.includes(selectedWeekRange) &&
                              !dateRangeStart &&
                              !dateRangeEnd
                                ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                            }`}
                          >
                            <span>更多周期</span>
                            <span className="px-1.5 py-0.5 rounded-full bg-slate-100 text-[10px] text-slate-500">
                              {overflowWeekRanges.length}
                            </span>
                            <ChevronDown
                              className={`w-3 h-3 transition-transform ${
                                showWeekFilterDropdown ? "rotate-180" : ""
                              }`}
                            />
                          </button>

                          {showWeekFilterDropdown && (
                            <div className="absolute left-0 top-full z-[100] mt-2 w-64 rounded-2xl border border-slate-100 bg-white p-1.5 shadow-2xl shadow-slate-900/10">
                              {overflowWeekRanges.map((w) => {
                                const isActive =
                                  !dateRangeStart &&
                                  !dateRangeEnd &&
                                  selectedWeekRange === w;
                                const status = weekStatusMap[w] || "inprogress";
                                return (
                                  <button
                                    key={w}
                                    type="button"
                                    onClick={() => {
                                      setSelectedWeekRange(w);
                                      setDateRangeStart("");
                                      setDateRangeEnd("");
                                      setShowWeekFilterDropdown(false);
                                    }}
                                    className={`w-full flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-[11px] font-black transition-colors ${
                                      isActive
                                        ? "bg-indigo-50 text-indigo-700"
                                        : "text-slate-600 hover:bg-slate-50"
                                    }`}
                                  >
                                    <span className="font-mono">{w}</span>
                                    <span
                                      className={`w-1.5 h-1.5 rounded-full ${
                                        status === "completed"
                                          ? "bg-emerald-500"
                                          : "bg-amber-500"
                                      }`}
                                    />
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}

                      <button
                        onClick={openAddWeekPopup}
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

                        {/* 时间范围 */}
                        <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-150 text-slate-700 font-bold">
                          <span className="text-slate-400 font-semibold whitespace-nowrap">
                            时间范围:
                          </span>
                          <input
                            type="date"
                            value={dateRangeStart}
                            onChange={(e) => setDateRangeStart(e.target.value)}
                            className="bg-transparent border-none p-0 focus:ring-0 text-[10px] font-extrabold text-slate-700 outline-none cursor-pointer w-[104px]"
                          />
                          <span className="text-slate-300 font-black">~</span>
                          <input
                            type="date"
                            value={dateRangeEnd}
                            onChange={(e) => setDateRangeEnd(e.target.value)}
                            className="bg-transparent border-none p-0 focus:ring-0 text-[10px] font-extrabold text-slate-700 outline-none cursor-pointer w-[104px]"
                          />
                        </div>

                        <button
                          onClick={() => {
                            setFilters({
                              ...filters,
                              creativePersonnel: "全部",
                              assetType: "全部",
                              broadDirection: "全部",
                            });
                            setDateRangeStart("");
                            setDateRangeEnd("");
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
                                  onClick={
                                    isEditing
                                      ? (e: React.MouseEvent) =>
                                          e.stopPropagation()
                                      : undefined
                                  }
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
                                  onClick={
                                    isEditing
                                      ? (e: React.MouseEvent) =>
                                          e.stopPropagation()
                                      : undefined
                                  }
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
                                onClick={
                                  isEditing
                                    ? (e: React.MouseEvent) =>
                                        e.stopPropagation()
                                    : undefined
                                }
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
                                onClick={
                                  isEditing
                                    ? (e: React.MouseEvent) =>
                                        e.stopPropagation()
                                    : undefined
                                }
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
                                  onClick={
                                    isEditing
                                      ? (e: React.MouseEvent) =>
                                          e.stopPropagation()
                                      : undefined
                                  }
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
                                  onClick={
                                    isEditing
                                      ? (e: React.MouseEvent) =>
                                          e.stopPropagation()
                                      : undefined
                                  }
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
                                  onClick={
                                    isEditing
                                      ? (e: React.MouseEvent) =>
                                          e.stopPropagation()
                                      : undefined
                                  }
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
                                  onClick={
                                    isEditing
                                      ? (e: React.MouseEvent) =>
                                          e.stopPropagation()
                                      : undefined
                                  }
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
                                        onClick={
                                          isEditing
                                            ? (e: React.MouseEvent) =>
                                                e.stopPropagation()
                                            : undefined
                                        }
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

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddRequirementForDirection(s.id);
                                  }}
                                  className="relative z-20 inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-[11px] font-black shadow-lg shadow-indigo-600/20 ring-1 ring-indigo-500 hover:bg-slate-950 hover:ring-slate-950 hover:-translate-y-0.5 transition-all duration-200 shrink-0 whitespace-nowrap"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  新建需求
                                </button>
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
                  {!hasActiveRequirementQuery ? (
                    <div className="h-full min-h-[520px] flex items-center justify-center p-8 bg-gradient-to-b from-white to-slate-50/70">
                      <div className="w-full max-w-xl text-center flex flex-col items-center">
                        <div className="w-16 h-16 rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shadow-sm mb-5">
                          <PlusCircle className="w-8 h-8 text-indigo-600" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                          新建需求
                        </h2>
                        <p className="mt-2 text-sm font-semibold text-slate-500 leading-relaxed max-w-md">
                          先创建新的创意需求；需要查历史需求时，再使用上方搜索或筛选条件展开对应列表。
                        </p>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCreateType("Video");
                            setShowScheduleSelector(true);
                          }}
                          className="mt-8 inline-flex items-center justify-center gap-3 rounded-3xl bg-indigo-600 px-10 py-5 text-base font-black text-white shadow-xl shadow-indigo-600/20 ring-1 ring-indigo-500 transition-all hover:-translate-y-0.5 hover:bg-slate-950 hover:ring-slate-950 active:translate-y-0"
                        >
                          <Plus className="w-5 h-5" />
                          创建新需求
                        </button>

                        <div className="mt-8 grid grid-cols-3 gap-3 w-full max-w-lg text-left">
                          {[
                            ["Video", "视频", "进入视频需求脚本模板"],
                            ["Image", "图片", "进入图片需求模板"],
                            ["Playable", "试玩", "进入试玩需求模板"],
                          ].map(([type, label, desc]) => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => {
                                setSelectedCreateType(type as CreativeForm);
                                setShowScheduleSelector(true);
                              }}
                              className="rounded-2xl border border-slate-150 bg-white px-4 py-3 text-left shadow-3xs transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-50/40 hover:shadow-md"
                            >
                              <div className="text-xs font-black text-slate-800">
                                {label}
                              </div>
                              <div className="mt-1 text-[10px] font-semibold text-slate-400">
                                {desc}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : viewMode === "list" ? (
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
                      <p className="text-[10px] text-slate-400 font-bold mt-0.5">用于手动排期时查看人员占用、任务风险和团队工时负荷</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowPersonnelScheduleModal(true)}
                      className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-black text-white shadow-sm transition-all hover:bg-black"
                    >
                      <Calendar className="h-4 w-4" />
                      查看人员排期情况
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 shrink-0">
                  <div className="rounded-2xl border border-slate-150 bg-white px-4 py-3 shadow-3xs">
                    <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">未来7天任务</div>
                    <div className="mt-1 flex items-end justify-between gap-2">
                      <span className="text-2xl font-black text-slate-900">{productionInsights.upcomingTaskCount}</span>
                      <span className="pb-1 text-[10px] font-bold text-slate-400">
                        {productionInsights.weekStart} ~ {productionInsights.weekEnd}
                      </span>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-150 bg-white px-4 py-3 shadow-3xs">
                    <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">团队产能占用</div>
                    <div className="mt-1 flex items-end justify-between gap-2">
                      <span className={`text-2xl font-black ${productionInsights.loadRate > 100 ? "text-rose-600" : productionInsights.loadRate > 80 ? "text-amber-600" : "text-emerald-600"}`}>
                        {productionInsights.loadRate}%
                      </span>
                      <span className="pb-1 text-[10px] font-bold text-slate-400">
                        {productionInsights.scheduledWorkDays.toFixed(1)} / {productionInsights.weeklyCapacity}天
                      </span>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-150 bg-white px-4 py-3 shadow-3xs">
                    <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">排期人员数</div>
                    <div className="mt-1 flex items-end justify-between gap-2">
                      <span className="text-2xl font-black text-indigo-600">{productionInsights.scheduledProducerCount}</span>
                      <span className="pb-1 text-[10px] font-bold text-slate-400">未来7天有任务</span>
                    </div>
                  </div>
                  <div className={`rounded-2xl border px-4 py-3 shadow-3xs ${productionInsights.highRiskRequirements.length > 0 ? "border-rose-200 bg-rose-50" : "border-slate-150 bg-white"}`}>
                    <div className={`text-[9px] font-black uppercase tracking-widest ${productionInsights.highRiskRequirements.length > 0 ? "text-rose-500" : "text-slate-400"}`}>
                      最高/高优风险
                    </div>
                    <div className="mt-1 flex items-end justify-between gap-2">
                      <span className={`text-2xl font-black ${productionInsights.highRiskRequirements.length > 0 ? "text-rose-600" : "text-slate-900"}`}>
                        {productionInsights.highRiskRequirements.length}
                      </span>
                      <span className="pb-1 text-[10px] font-bold text-slate-400">
                        {productionInsights.highRiskRequirements.length > 0 ? "需优先处理" : "暂无风险"}
                      </span>
                    </div>
                  </div>
                </div>

                {productionInsights.highRiskRequirements.length > 0 && (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-[11px] font-bold text-rose-700 shadow-3xs shrink-0">
                    <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-rose-500">
                      <AlertCircle className="h-3.5 w-3.5" />
                      排期预警
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {productionInsights.highRiskRequirements.slice(0, 4).map(({ req, dueDate, reason }) => (
                        <button
                          key={req.id}
                          type="button"
                          onClick={() => setSelectedReq(req)}
                          className="rounded-xl border border-rose-200 bg-white px-3 py-1.5 text-left text-[10px] font-black text-rose-700 transition-all hover:border-rose-300 hover:bg-rose-50"
                        >
                          {req.id} · {reason}
                          {dueDate && <span className="ml-1 font-bold text-rose-400">截止 {dueDate}</span>}
                        </button>
                      ))}
                      {productionInsights.highRiskRequirements.length > 4 && (
                        <span className="rounded-xl bg-rose-100 px-3 py-1.5 text-[10px] font-black text-rose-500">
                          +{productionInsights.highRiskRequirements.length - 4} 个
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex-1 rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center shadow-3xs">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                    <Calendar className="h-7 w-7" />
                  </div>
                  <h3 className="mt-4 text-base font-black text-slate-900">人员排期情况</h3>
                  <p className="mx-auto mt-2 max-w-xl text-xs font-bold leading-6 text-slate-400">
                    手动排期时打开弹窗查看所有制作人员的日历和甘特图。同一天同一个人允许存在多条任务，日历中会按泳道堆叠展示。
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowPersonnelScheduleModal(true)}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-black text-white shadow-sm transition-all hover:bg-black"
                  >
                    <Calendar className="h-4 w-4" />
                    打开人员排期弹窗
                  </button>
                </div>

                {showPersonnelScheduleModal ? (
                  <div className="fixed inset-0 z-[180] flex items-center justify-center bg-slate-950/45 p-6 backdrop-blur-sm">
                    <div className="flex h-[88vh] w-full max-w-[1280px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
                      <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-4">
                        <div>
                          <h3 className="text-base font-black text-slate-900">人员排期情况</h3>
                          <p className="mt-1 text-[10px] font-bold text-slate-400">手动排期时查看人员占用，同一天同一人可显示多条任务。</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex rounded-xl bg-slate-100 p-1">
                            <button
                              type="button"
                              onClick={() => setProductionView('calendar')}
                              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-black transition-all ${productionView === 'calendar' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                              <Calendar className="h-3.5 w-3.5" /> 日历视图
                            </button>
                            <button
                              type="button"
                              onClick={() => setProductionView('gantt')}
                              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-black transition-all ${productionView === 'gantt' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                              <Layers className="h-3.5 w-3.5" /> 甘特图
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowPersonnelScheduleModal(false)}
                            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-400 transition-all hover:bg-slate-50 hover:text-slate-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex-1 overflow-auto bg-slate-50/70 p-5">
                        {productionView === 'calendar' ? (
                          <div className="grid gap-4 lg:grid-cols-2">
                            {PRODUCERS.filter(prod => prod.status === '在职').map(prod => {
                              const producerTasks = productionTasks
                                .filter(task => task.producer === prod.name)
                                .sort((a, b) => a.startDate.localeCompare(b.startDate) || a.endDate.localeCompare(b.endDate));
                              return (
                                <div key={prod.name} className="rounded-2xl border border-slate-150 bg-white p-4 shadow-3xs">
                                  <div className="mb-3 flex items-center justify-between gap-3">
                                    <div>
                                      <div className="text-sm font-black text-slate-900">{prod.name}</div>
                                      <div className="mt-0.5 text-[9px] font-black text-slate-400">{prod.group}</div>
                                    </div>
                                    <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[9px] font-black text-slate-500">{producerTasks.length} 个任务</span>
                                  </div>
                                  <div className="space-y-2">
                                    {producerTasks.length === 0 ? (
                                      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-[10px] font-bold text-slate-400">暂无排期</div>
                                    ) : producerTasks.slice(0, 8).map(task => (
                                      <button
                                        key={task.id}
                                        type="button"
                                        onClick={() => setSelectedReq(task.requirement)}
                                        className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-150 bg-slate-50 px-3 py-2 text-left transition-all hover:border-indigo-200 hover:bg-indigo-50/40"
                                      >
                                        <div className="min-w-0">
                                          <div className="flex items-center gap-2">
                                            <span className="rounded-md bg-slate-900 px-1.5 py-0.5 text-[8px] font-black text-white">{task.role}</span>
                                            <span className="truncate text-[10px] font-black text-slate-800">{task.requirement.id}</span>
                                          </div>
                                          <div className="mt-0.5 truncate text-[9px] font-bold text-slate-400">{task.requirement.name}</div>
                                        </div>
                                        <div className="shrink-0 text-right text-[9px] font-black text-slate-500">
                                          <div>{task.startDate} ~ {task.endDate}</div>
                                          <div className="mt-0.5 text-[8px] text-slate-350">{task.status}</div>
                                        </div>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {PRODUCERS.map(prod => {
                              const producerTasks = productionTasks
                                .filter(task => task.producer === prod.name)
                                .sort((a, b) => a.startDate.localeCompare(b.startDate));
                              return (
                                <div key={prod.name} className="rounded-2xl border border-slate-150 bg-white p-4 shadow-3xs">
                                  <div className="mb-3 flex items-center justify-between">
                                    <div className="text-xs font-black text-slate-800">{prod.name}</div>
                                    <div className="text-[9px] font-black text-slate-400">{producerTasks.length} 个任务</div>
                                  </div>
                                  <div className="flex min-h-12 gap-2 overflow-x-auto pb-1">
                                    {producerTasks.length === 0 ? (
                                      <div className="text-[10px] font-bold text-slate-350">暂无排期</div>
                                    ) : producerTasks.map(task => (
                                      <button
                                        key={task.id}
                                        type="button"
                                        onClick={() => setSelectedReq(task.requirement)}
                                        className="min-w-[220px] rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2 text-left text-[10px] font-bold text-indigo-900"
                                      >
                                        <div className="flex items-center justify-between gap-2">
                                          <span className="font-black">{task.requirement.id}</span>
                                          <span className="rounded bg-white/70 px-1.5 py-0.5 text-[8px] font-black">{task.role}</span>
                                        </div>
                                        <div className="mt-1 truncate text-[9px] text-indigo-700/70">{task.startDate} ~ {task.endDate}</div>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : null}
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
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-5xl max-h-[85vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-900 leading-tight">
                  创建需求
                </h3>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  先按制作类型筛选方向，再选择要挂靠的方向；创建后的需求类型会跟随方向规定。
                </p>
              </div>
              <button
                onClick={() => setShowScheduleSelector(false)}
                className="p-2 hover:bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-all"
              >
                <XCircle className="w-8 h-8" />
              </button>
            </div>

            <div className="px-8 pt-6 pb-4 border-b border-slate-100 bg-slate-50/40">
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest shrink-0">
                  制作类型
                </span>
                {[
                  {
                    type: "Video" as CreativeForm,
                    label: "视频",
                    desc: "进入视频脚本模板",
                    icon: Video,
                  },
                  {
                    type: "Image" as CreativeForm,
                    label: "图片",
                    desc: "进入图片需求模板",
                    icon: ImageIcon,
                  },
                  {
                    type: "Playable" as CreativeForm,
                    label: "试玩",
                    desc: "进入试玩需求模板",
                    icon: Gamepad2,
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = selectedCreateType === item.type;
                  return (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => setSelectedCreateType(item.type)}
                      className={`flex-1 min-w-0 rounded-2xl border px-4 py-3 text-left transition-all ${
                        isActive
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/15"
                          : "bg-white text-slate-600 border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/40"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isActive ? "bg-white/15" : "bg-slate-50"
                          }`}
                        >
                          <Icon
                            className={`w-4.5 h-4.5 ${
                              isActive ? "text-white" : "text-indigo-600"
                            }`}
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-black">{item.label}</div>
                          <div
                            className={`mt-0.5 text-[10px] font-semibold ${
                              isActive ? "text-indigo-100" : "text-slate-400"
                            }`}
                          >
                            {item.desc}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-4 no-scrollbar">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-slate-900">
                    选择挂靠方向
                  </h4>
                  <p className="text-[11px] font-semibold text-slate-400 mt-1">
                    只展示创建时需要判断的关键信息：方向、优先级、负责人、截止和剩余容量。
                  </p>
                </div>
                <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-[11px] font-black text-slate-500">
                  筛选方向类型：{selectedCreateType === "Video" ? "视频" : selectedCreateType === "Image" ? "图片" : "试玩"}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {schedules
                  .filter((sched) => sched.form === selectedCreateType)
                  .map((sched) => {
                  const associatedReqs = requirements.filter(
                    (req) => req.scheduleId === sched.id,
                  );
                  const remainingCount = Math.max(
                    0,
                    (sched.totalRequiredCount || 0) - associatedReqs.length,
                  );
                  const formConfig = getFormConfig(sched.form);
                  const FormIcon = formConfig.icon || Video;

                  return (
                    <button
                      key={sched.id}
                      type="button"
                      onClick={() => handleAddRequirementFromSchedule(sched.id)}
                      className="group relative bg-white p-5 rounded-3xl border border-slate-150 hover:border-indigo-300 hover:shadow-xl hover:shadow-slate-900/5 transition-all cursor-pointer flex flex-col gap-4 text-left"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-1 rounded-lg text-[10px] font-black ${getPriorityStyle(sched.priority)} shadow-sm`}>
                              {sched.priority === "Highest"
                                ? "最高"
                                : sched.priority === "High"
                                  ? "高"
                                  : sched.priority === "Low"
                                    ? "低"
                                    : "中"}
                            </span>
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] font-black ${formConfig.color}`}>
                              <FormIcon className="w-3 h-3" />
                              方向类型 {sched.form === "Video" ? "视频" : sched.form === "Image" ? "图片" : "试玩"}
                            </span>
                          </div>
                          <h5 className="text-sm font-black text-slate-900 group-hover:text-indigo-700 transition-colors truncate">
                            {sched.directionName}
                          </h5>
                          <p className="mt-1 line-clamp-1 text-[11px] font-semibold text-slate-400">
                            {sched.validationGoal || "暂无验证目标"}
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all shrink-0 mt-1" />
                      </div>

                      <div className="grid grid-cols-4 gap-2 border-t border-slate-100 pt-4">
                        {[
                          ["负责人", sched.owner || "未指派"],
                          ["截止", sched.submissionDeadline || sched.requirementEnd || "--"],
                          ["渠道", sched.channels?.[0]?.toUpperCase() || "ALL"],
                          ["剩余", `${remainingCount}/${sched.totalRequiredCount || 0}`],
                        ].map(([label, value]) => (
                          <div key={label} className="rounded-2xl bg-slate-50 px-3 py-2">
                            <div className="text-[9px] font-black text-slate-400">
                              {label}
                            </div>
                            <div className="mt-1 truncate text-[11px] font-black text-slate-700">
                              {value}
                            </div>
                          </div>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div
                className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex items-center justify-center p-6 gap-4 hover:border-primary/50 hover:bg-white transition-all group cursor-pointer"
                onClick={() => {
                  const assetIndex = 3377 + requirements.length;
                  const newReq: Requirement = {
                    id: `${selectedCreateType === "Video" ? "cp" : selectedCreateType === "Image" ? "tp" : "sw"}${assetIndex}-01`,
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
                    dimensions: ["9:16"],
                    assetType: selectedCreateType,
                    assetIndex,
                    assetVersion: "01",
                    projectName: "Panthia",
                    script: "",
                    aTags: [],
                    bTags: [],
                    difficulty: "C",
                    tasks: createDefaultProductionTasks(
                      `${selectedCreateType === "Video" ? "cp" : selectedCreateType === "Image" ? "tp" : "sw"}${assetIndex}-01`,
                      selectedCreateType,
                      "原始玩法",
                    ),
                  };
                  setRequirements([...requirements, newReq]);
                  setSelectedReq(newReq);
                  setShowScheduleSelector(false);
                }}
              >
                <div className="w-12 h-12 rounded-2xl border-2 border-dashed border-slate-350 flex items-center justify-center group-hover:border-primary group-hover:text-primary transition-all group-hover:scale-110">
                  <Plus className="w-6 h-6 text-slate-400 group-hover:text-primary" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-slate-800 uppercase tracking-tight group-hover:text-primary transition-colors">
                    不关联，直接创建空模版
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    使用当前制作类型：{selectedCreateType === "Video" ? "视频" : selectedCreateType === "Image" ? "图片" : "试玩"}
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
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[420px] overflow-hidden flex flex-col p-6 gap-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">创建排期周期</h3>
                <p className="text-[11px] font-bold text-slate-400 mt-1">
                  点击开始日期，再点击结束日期。
                </p>
              </div>
              <button
                onClick={() => setShowAddWeekPopup(false)}
                className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/70 px-4 py-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span className="text-[11px] font-black text-slate-500">
                  今天
                </span>
                <span className="font-mono text-xs font-black text-indigo-700">
                  {todayDateString}
                </span>
              </div>
              <button
                onClick={jumpNewWeekCalendarToToday}
                className="px-2.5 py-1 rounded-lg bg-white text-[10px] font-black text-indigo-600 border border-indigo-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all"
              >
                回到今天
              </button>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3">
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={handlePrevNewWeekMonth}
                  className="w-8 h-8 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-all flex items-center justify-center"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="text-sm font-black text-slate-800">
                  {newWeekCalendarYear} 年 {newWeekCalendarMonth} 月
                </div>
                <button
                  onClick={handleNextNewWeekMonth}
                  className="w-8 h-8 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-all flex items-center justify-center"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black text-slate-400 mb-1">
                {["一", "二", "三", "四", "五", "六", "日"].map((day) => (
                  <span key={day} className="py-1">
                    {day}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {newWeekCalendarWeeks.flatMap((week) =>
                  week.days.map((day) => {
                    const dateString = day.dateString;
                    const dayTime = parseDateValue(dateString) ?? 0;
                    const startTime = parseDateValue(newWeekStart);
                    const endTime = parseDateValue(newWeekEnd);
                    const isStart = dateString === newWeekStart;
                    const isEnd = dateString === newWeekEnd;
                    const isInRange =
                      startTime !== null &&
                      endTime !== null &&
                      dayTime >= startTime &&
                      dayTime <= endTime;
                    const isSelected = isStart || isEnd;

                    return (
                      <button
                        key={dateString}
                        onClick={() => handleSelectNewWeekDay(dateString)}
                        title={day.isToday ? `今天 ${dateString}` : dateString}
                        className={`relative h-9 rounded-xl text-[11px] font-black transition-all border ${
                          isSelected
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/15"
                            : isInRange
                              ? "bg-indigo-50 text-indigo-700 border-indigo-100"
                              : day.isToday
                                ? "bg-white text-indigo-700 border-indigo-300 ring-2 ring-indigo-100"
                              : day.isCurrentMonth
                                ? "bg-white text-slate-700 border-slate-200 hover:border-indigo-200 hover:text-indigo-600"
                                : "bg-transparent text-slate-300 border-transparent hover:bg-white/70"
                        }`}
                      >
                        {day.dayNum}
                        {day.isToday && !isSelected && (
                          <span className="absolute left-1/2 bottom-0.5 h-1 w-1 -translate-x-1/2 rounded-full bg-indigo-500" />
                        )}
                      </button>
                    );
                  }),
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 flex items-center justify-between gap-3">
              <div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  已选时间范围
                </div>
                <div className="text-xs font-black text-slate-800 mt-1 font-mono">
                  {newWeekRange || "请选择开始与结束日期"}
                </div>
              </div>
              {newWeekStart && newWeekEnd && (
                <span className="px-2.5 py-1 rounded-xl bg-indigo-50 text-indigo-700 text-[11px] font-black shrink-0">
                  {getDateRangeDays(newWeekStart, newWeekEnd)} 天
                </span>
              )}
            </div>

            <div className="flex gap-2">
                <button
                  onClick={() => setShowAddWeekPopup(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 transition-all"
                >
                  取消
                </button>
                <button
                  onClick={handleAddWeek}
                  disabled={!newWeekStart || !newWeekEnd}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-slate-900 transition-all disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
                >
                  确认创建
                </button>
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
	                          方向下需求列表 ({associatedReqs.length})
	                        </h3>
	                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
	                          字段顺序与需求大表保持一致，点击任意行进入需求详情
	                        </p>
                      </div>

                      <button
                        onClick={() => handleAddRequirementForDirection(s.id)}
                        className="px-3.5 py-1.8 bg-white hover:bg-slate-50 text-indigo-650 border border-slate-200 hover:border-indigo-300 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-3xs active:scale-95 cursor-pointer"
                      >
	                        <Plus className="w-3.5 h-3.5" /> 新建需求
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
	                              <th className="px-5 py-3.5 pl-8">编号</th>
	                              <th className="px-5 py-3.5">预览</th>
	                              <th className="px-5 py-3.5">需求名称</th>
	                              <th className="px-5 py-3.5 text-center">
	                                优先级
	                              </th>
	                              <th className="px-5 py-3.5">创意人员</th>
	                              <th className="px-5 py-3.5 text-center">需求状态</th>
	                              <th className="px-5 py-3.5 text-center">制作状态</th>
	                              <th className="px-5 py-3.5 text-center">
	                                测试状态
	                              </th>
	                              <th className="px-5 py-3.5 text-center">
	                                投放状态
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
	                                      制作人员:{" "}
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
	                                      审核通过 Approved
	                                    </option>
	                                    <option value="Modification">
	                                      需求修改 Modification
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
	                                    <option value="Scheduled">已排期</option>
	                                    <option value="InProgress">
	                                      进行中
	                                    </option>
	                                    <option value="Completed">已完成</option>
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
	                                      <option value="待测试">
	                                        待测试
	                                      </option>
	                                      <option value="测试中">
	                                        测试中
	                                      </option>
	                                      <option value="数据合格">
	                                        数据合格
	                                      </option>
	                                      <option value="不达标">
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
	                                          <span>暂停投放</span>
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
              onChange={handleRequirementDetailChange}
              onDelete={handleRequirementDetailDelete}
              scheduleDeadline={
                (() => {
                  const selectedSchedule = schedules.find(
                    (schedule) => schedule.id === selectedReq.scheduleId,
                  );
                  return (
                    selectedSchedule?.productionEnd ||
                    selectedSchedule?.submissionDeadline ||
                    selectedSchedule?.requirementEnd ||
                    selectedReq.endDate ||
                    ""
                  );
                })()
              }
              productionScheduleContext={productionTasks.map((task) => ({
                id: task.id,
                requirementId: task.requirement.id,
                requirementName: task.requirement.name,
                priority: task.requirement.priority,
                role: task.role,
                producer: task.producer,
                status: task.status,
                startDate: task.startDate,
                endDate: task.endDate,
              }))}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default RequirementCenter;
