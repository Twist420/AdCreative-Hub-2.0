import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import {
  Requirement,
  RequirementReqStatus,
  RequirementProdStatus,
  RequirementDeliveryStatus,
  ProductionTask,
  CreativeSchedule,
  CreativeDifficulty,
  CreativeForm,
  CreativeScenario,
  CreativeDirectionType,
  FinishedCreativePerformance,
  DeliverySet,
} from "../types";
import {
  generateRequirements,
  generateSchedules,
  generateFinishedCreativePerformance,
} from "../services/mockData";
import {
  Plus,
  Search,
  Trash2,
  ExternalLink,
  Clock,
  User,
  Filter,
  MoreHorizontal,
  Copy,
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
  Check,
  CheckCircle,
  Calendar,
  ClipboardList,
  PlusCircle,
  Upload,
  Target,
  Hash,
  Compass,
  Award,
  Activity,
  Eye,
  Radio,
  Users,
  Tag,
} from "lucide-react";
import MaterialUpload from "./MaterialUpload";
import DateRangePicker from "./DateRangePicker";
import { RequirementStageType } from "../types";
import {
  COORDINATED_FLEXIBLE_FILTER_FIELDS,
  COORDINATED_FLEXIBLE_FILTER_OPERATORS,
  CREATIVE_PEOPLE,
  CoordinatedBoard,
  CoordinatedToolbar,
  CreateLocalizedRequirementDialog,
  DeliveryChannelsCell,
  DropdownCheckbox,
  AddWeekModal,
  FILTER_DROPDOWN_ALL_IDLE_CLASS,
  FILTER_DROPDOWN_PANEL_CLASS,
  FILTER_ALL,
  LOCALIZATION_LANGUAGES,
  PRODUCERS,
  PersonAvatarStack,
  PersonBadge,
  ProductionSubmitDateDisplay,
  ProductionRiskModal,
  ProductionWorkspace,
  RequirementDetailOverlay,
  RequirementInlineDropdown,
  RequirementInstantTooltip,
  RequirementListView,
  RequirementToast,
  ScheduleDetailModal,
  ScheduleSelectorModal,
  WeekRangeRuleInfo,
  addDaysToDateString,
  createCoordinatedFlexibleFilter,
  createDefaultProductionTasks,
  formatCalendarDate,
  formatCurrencyCompact,
  formatDateCompact,
  formatRequirementId,
  getAssetTypeLabel,
  getDeliveryStatusLabel,
  getDeliveryStatusStyle,
  getDifficultyStyle,
  getDirectionTypeStyle,
  getDateRangeDays,
  getDefaultWeekRanges,
  getFormConfig,
  getPersonAvatarUrl,
  getPriorityStyle,
  getRequirementMajorId,
  getRequirementPipeline,
  getProdStatusStyle,
  getScenarioStyle,
  getStatusStyle,
  getSubmitDelayDays,
  getSubmitTimeBadge,
  IterationDirectionSelectorModal,
  LegacyScheduleTable,
  openNativeDatePicker,
  parseRequirementVersionId,
  parseDateValue,
  summarizeProductionStatus,
  type CoordinatedFlexibleFilter,
  type CoordinatedFlexibleFilterField,
  type CoordinatedFlexibleFilterOperator,
  type Producer,
  type WeekRangeVisualTone,
  useProductionPlanning,
  useCoordinatedPlanning,
  useRequirementListFilters,
  useScheduleInsights,
  useLegacyScheduleGroups,
  useAddWeekModal,
  useRequirementVersioning,
  useScheduleActions,
  buildStandaloneRequirementDraft,
  getNextAssetIndexForType,
  getNextLocalizationAssetIndex,
  getRequirementIdPrefix,
  buildRequirementIteration,
  buildLocalizationSubVersions,
} from "./requirement-center";

interface RequirementCenterProps {
  subView?: "coordinated" | "list" | "production" | "upload";
  onSubViewChange?: (
    view: "coordinated" | "list" | "production" | "upload",
  ) => void;
}

const INITIAL_REQUIREMENT_FILTERS = {
  materialStage: "全部",
  broadDirection: "全部",
  creativePersonnel: "全部",
  priority: "全部",
  reqStatus: "全部",
  prodStatus: "全部",
  assetType: "全部",
  scheduleRisk: "全部",
};

const formatLocalizationSourceId = (sourceId: string) => {
  const parsed = parseRequirementVersionId(sourceId);
  if (!parsed) return sourceId;
  return `${parsed.majorId}(${String(parsed.version).padStart(2, "0")})`;
};

const formatLocalizationRequirementName = (
  createdDate: string,
  languageLabel: string,
  sourceId: string,
) => `${formatDateCompact(createdDate)}${languageLabel}本地化${formatLocalizationSourceId(sourceId)}`;

const RequirementCenter: React.FC<RequirementCenterProps> = ({
  subView,
  onSubViewChange,
}) => {
  const [localSubView, setLocalSubView] = useState<
    "coordinated" | "list" | "production" | "upload"
  >("coordinated");
  const combinedSubView = subView || localSubView;
  const setCombinedSubView = onSubViewChange || setLocalSubView;
  const [requirements, setRequirements] = useState<Requirement[]>(() => {
    const raw = generateRequirements();
    const activeProducersList = PRODUCERS.filter(p => p.status === "在职").map(p => p.name);
    const difficultyOptions: ("S" | "A" | "B" | "C")[] = ["S", "A", "B", "C"];
    return raw.map((r, i) => {
      const activeProductionPersonnel = (r.productionPersonnel || []).filter((person) =>
        activeProducersList.includes(person),
      );
      const productionPersonnel =
        activeProductionPersonnel.length > 0
          ? activeProductionPersonnel
          : [activeProducersList[i % activeProducersList.length]];
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
        productionPersonnel,
        startDate: (r as any).startDate || startDateStr,
        endDate: (r as any).endDate || endDateStr,
      };
    });
  });
  const [openRequirementFilterKey, setOpenRequirementFilterKey] = useState<string | null>(null);
  const requirementFilterRef = useRef<HTMLDivElement>(null);
  const [openCoordinatedFilterKey, setOpenCoordinatedFilterKey] = useState<string | null>(null);
  const coordinatedFilterRef = useRef<HTMLDivElement>(null);
  const [schedules, setSchedules] =
    useState<CreativeSchedule[]>(generateSchedules());
  const todayDateString = formatCalendarDate(new Date());
  const defaultDateRangeStart = useMemo(
    () => addDaysToDateString(todayDateString, -90),
    [todayDateString],
  );
  const defaultDateRangeEnd = todayDateString;
  const finishedCreativePerformance = useMemo<FinishedCreativePerformance[]>(
    () => generateFinishedCreativePerformance(requirements),
    [requirements],
  );
  const [deliverySets, setDeliverySets] = useState<DeliverySet[]>([]);
  const recentRequirementSpendMap = useMemo(() => {
    const sinceDate = addDaysToDateString(todayDateString, -30);
    return finishedCreativePerformance
      .filter((item) => item.launchedAt >= sinceDate)
      .reduce<Record<string, number>>((acc, item) => {
        acc[item.requirementId] = (acc[item.requirementId] || 0) + item.spent;
        return acc;
      }, {});
  }, [finishedCreativePerformance, todayDateString]);

  const {
    productionTasks,
    selectedProducers,
    setSelectedProducers,
    isProductionProducerFilterOpen,
    setIsProductionProducerFilterOpen,
    productionProducerFilterRef,
    productionView,
    setProductionView,
    showProductionRiskModal,
    setShowProductionRiskModal,
    calendarYear,
    setCalendarYear,
    calendarMonth,
    setCalendarMonth,
    handlePrevMonth,
    handleNextMonth,
    productionInsights,
    delayedProductionRiskItems,
    activeProducers,
    personnelCapacityGroups,
    productionGanttStart,
    productionGanttDays,
    productionGanttRows,
    productionCalendarWeeks,
  } = useProductionPlanning({ requirements, schedules, todayDateString });
  // Group collapsed states for the personnel side menu
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({
    "美宣-平面": false,
    "美宣-AI": false,
    "美宣-2D": false,
    "美宣-3D": false,
    "程序": false,
  });
  const previousSubViewRef = useRef(combinedSubView);

  useEffect(() => {
    if (
      previousSubViewRef.current !== "coordinated" &&
      combinedSubView === "coordinated"
    ) {
      setSearchQuery("");
      setFilters({ ...INITIAL_REQUIREMENT_FILTERS });
      setCreatedRangeStart("");
      setCreatedRangeEnd("");
      setCompletedRangeStart("");
      setCompletedRangeEnd("");
      setCurrentSort("none");
    }
    previousSubViewRef.current = combinedSubView;
  }, [combinedSubView]);

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
  const [showScheduleSelector, setShowScheduleSelector] = useState(false);
  const [selectedCreateType, setSelectedCreateType] =
    useState<CreativeForm>("Video");
  const [createDialogScheduleId, setCreateDialogScheduleId] = useState<string | null>(null);
  const [pendingIteration, setPendingIteration] = useState<{
    mode: "single" | "all";
    sourceId: string;
  } | null>(null);
  const [selectedLocalizationLanguages, setSelectedLocalizationLanguages] = useState<string[]>(["de"]);
  const [selectedLocalizationSourceIds, setSelectedLocalizationSourceIds] = useState<string[]>([]);
  const [localizationSearchQuery, setLocalizationSearchQuery] = useState("");
  const [expandedGanttRelations, setExpandedGanttRelations] = useState<Record<string, boolean>>({});
  const [expandedPostReqs, setExpandedPostReqs] = useState<Record<string, boolean>>({});
  const ganttContainerRef = useRef<HTMLDivElement>(null);
  const [filters, setFilters] = useState({ ...INITIAL_REQUIREMENT_FILTERS });

  const scrollGantt = (direction: "left" | "right") => {
    if (ganttContainerRef.current) {
      const scrollAmount = 440; // 10 days scroll width
      ganttContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  const {
    allWeekRanges,
    pinnedWeekRanges,
    overflowWeekRanges,
    weekVisualMap,
    selectedWeekRange,
    setSelectedWeekRange,
    selectedWeekRanges,
    setSelectedWeekRanges,
    dateRangeStart,
    setDateRangeStart,
    dateRangeEnd,
    setDateRangeEnd,
    currentSort,
    setCurrentSort,
    sortOrder,
    setSortOrder,
    coordinatedFlexibleFilters,
    setCoordinatedFlexibleFilters,
    isFlexibleFilterPanelOpen,
    setIsFlexibleFilterPanelOpen,
    openFlexibleFilterMenu,
    setOpenFlexibleFilterMenu,
    visibleSchedules,
    scheduleMatchesFlexibleFilter,
    toggleSelectedWeekRange,
    resetCoordinatedFilters,
  } = useCoordinatedPlanning({
    schedules,
    requirements,
    todayDateString,
    filters,
    searchQuery,
    defaultDateRangeStart,
    defaultDateRangeEnd,
  });

  const {
    filterConfigs,
    createdRangeStart,
    setCreatedRangeStart,
    createdRangeEnd,
    setCreatedRangeEnd,
    completedRangeStart,
    setCompletedRangeStart,
    completedRangeEnd,
    setCompletedRangeEnd,
    filteredRequirements,
    hasActiveRequirementQuery,
    getFilterOptionLabel,
    getFilterDisplayText,
    toggleRequirementFilterOption,
  } = useRequirementListFilters({
    requirements,
    highRiskRequirements: productionInsights.highRiskRequirements,
    searchQuery,
    currentSort,
    sortOrder,
    filters,
    setFilters,
  });

  const [cycleAdjustScheduleId, setCycleAdjustScheduleId] = useState<string | null>(null);
  const [cycleAdjustTargetWeekRange, setCycleAdjustTargetWeekRange] = useState("");
  const [cycleAdjustRequirementIds, setCycleAdjustRequirementIds] = useState<string[]>([]);
  const [isCycleAdjustWeekPickerOpen, setIsCycleAdjustWeekPickerOpen] = useState(false);
  const cycleAdjustWeekPickerRef = useRef<HTMLDivElement>(null);
  const [collapsedDirections, setCollapsedDirections] = useState<
    Record<string, boolean>
  >({});

  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, 2600);
  }, []);

  const scheduleInsights = useScheduleInsights({
    schedules,
    requirements,
    deliverySets,
    todayDateString,
  });

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
      reqStatus: "Pending",
      prodStatus: "Unscheduled",
      deliveryStatus: "NotLaunched",
      status: "Pending",
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

  const {
    getRequirementVersionGroup,
    isBlankRequirementDraft,
    stripBlankVersionsForReview,
  } = useRequirementVersioning(requirements);

  const closeCreateDialog = () => {
    setCreateDialogScheduleId(null);
    setLocalizationSearchQuery("");
  };

  const openCreateRequirementDialog = (scheduleId: string) => {
    const schedule = schedules.find((item) => item.id === scheduleId);
    if (!schedule) return;
    setSelectedCreateType(schedule.form || "Video");
    setCreateDialogScheduleId(scheduleId);
    setSelectedLocalizationSourceIds([]);
    setSelectedLocalizationLanguages((prev) => (prev.length ? prev : ["de"]));
    setShowScheduleSelector(false);
  };

  const createStandardRequirementFromDialog = () => {
    const schedule = createDialogSchedule;
    if (!schedule) return;
    const newReq = buildRequirementFromSchedule(
      schedule,
      requirements.length + 1,
      {
        name: `新创意需求 - ${schedule.directionName}`,
        assetType: schedule.form || selectedCreateType || "Video",
      },
    );

    setRequirements([newReq, ...requirements]);
    setSelectedReq(null);
    closeCreateDialog();
    resetCoordinatedFilters();
    setSearchQuery(newReq.id);
    setCombinedSubView("list");
  };

  const createLocalizedRequirementFromDialog = () => {
    const schedule = createDialogSchedule;
    const sources = selectedLocalizationSources;
    if (!schedule || sources.length === 0 || selectedLocalizationLanguages.length === 0 || hasMixedLocalizationAssetTypes) return;

    const baseAssetIndex = getNextLocalizationAssetIndex(requirements);
    const primarySource = sources[0];
    const assetType = primarySource.assetType || schedule.form || selectedCreateType || "Video";
    const broadDirection = schedule.broadDirection || primarySource.broadDirection;
    const batchId = `loc-${Date.now()}`;
    const subVersions = buildLocalizationSubVersions(
      sources,
      finishedCreativePerformance,
    );
    const allLocalizationSourceIds = subVersions
      .map((subVersion) => subVersion.sourceRequirementId)
      .filter((sourceId): sourceId is string => Boolean(sourceId));
    const createdAt = new Date().toISOString().slice(0, 19).replace("T", " ");

    const newRequirements = selectedLocalizationLanguages.flatMap((languageCode, index) => {
      const languageMeta =
        LOCALIZATION_LANGUAGES.find((item) => item.code === languageCode) ||
        LOCALIZATION_LANGUAGES[0];
      const assetIndex = baseAssetIndex + index;
      return subVersions.map((subVersion, subVersionIndex) => {
        const source =
          sources.find((item) => item.id === subVersion.sourceRequirementId) ||
          primarySource;
        const assetVersion = String(subVersionIndex + 1).padStart(2, "0");
        const requirementId = `${getRequirementIdPrefix(assetType)}${assetIndex}-${assetVersion}`;
        const localizedSubVersion = {
          ...subVersion,
          version: assetVersion,
        };
        return {
          ...source,
          id: requirementId,
          parentId: undefined,
          parentRequirementId: undefined,
          sourceRequirementId: source.id,
          sourceRequirementIds: allLocalizationSourceIds,
          createMode: "LocalizedFromExisting",
          localizationBatchId: batchId,
          isLocalization: true,
          scheduleId: schedule.id,
          name: formatLocalizationRequirementName(
            todayDateString,
            languageMeta.label,
            source.id,
          ),
          assetType,
          assetIndex,
          assetVersion,
          subVersions: [localizedSubVersion],
          broadDirection,
          materialStage: schedule.materialStage || source.materialStage,
          creativePersonnel: schedule.owner || source.creativePersonnel,
          productionPersonnel: ["张欢"],
          language: languageCode,
          localizationLanguage: languageCode,
          localizationLanguageLabel: languageMeta.label,
          channels: schedule.channels?.length ? schedule.channels : source.channels,
          testDirections: subVersion.testDirections || source.testDirections || [],
          dimensions: source.dimensions || ["9:16"],
          previews: source.previews || [],
          direction: schedule.directionName || source.direction,
          goal: schedule.validationGoal || source.goal,
          owner: schedule.owner || source.owner,
          priority: schedule.priority || source.priority,
          reqStatus: "Pending",
          prodStatus: "Unscheduled",
          deliveryStatus: "NotLaunched",
          status: "Pending",
          rating: 0,
          createdAt,
          completedAt: "",
          template: assetType === "Video" ? "自由模板" : source.template,
          script: source.script || "",
          difficulty: "C",
          tasks: [],
        } satisfies Requirement;
      });
    });

    setRequirements([...newRequirements, ...requirements]);
    setSelectedReq(null);
    closeCreateDialog();
    resetCoordinatedFilters();
    setSearchQuery(formatDateCompact(todayDateString));
    setCombinedSubView("list");
  };

  const handleAddRequirementForDirection = (
    scheduleId: string,
    assetTypeOverride?: CreativeForm,
  ) => {
    if (editingScheduleId === scheduleId) return;
    const schedule = schedules.find((s) => s.id === scheduleId);
    if (!schedule) return;

    if (schedule.scenario === "Localized") {
      setSelectedCreateType(assetTypeOverride || schedule.form || "Video");
      openCreateRequirementDialog(scheduleId);
      return;
    }

    const newReqIdx = requirements.length + 1;
    const newReq = buildRequirementFromSchedule(schedule, newReqIdx, {
      name: `新创意需求 - ${schedule.directionName}`,
      assetType: assetTypeOverride || schedule.form || "Video",
    });
    setRequirements([newReq, ...requirements]);
    setSelectedReq(newReq);
  };

  const [viewingSpecificRequirements, setViewingSpecificRequirements] =
    useState<Requirement[] | null>(null);
  const [selectedScheduleForModal, setSelectedScheduleForModal] =
    useState<CreativeSchedule | null>(null);
  const [instantTooltip, setInstantTooltip] = useState<{
    content: string;
    left: number;
    top: number;
  } | null>(null);
  const [scheduleTagInput, setScheduleTagInput] = useState("");
  const [openScheduleInfoMenuKey, setOpenScheduleInfoMenuKey] = useState<string | null>(null);
  const [openRequirementCellDropdown, setOpenRequirementCellDropdown] =
    useState<string | null>(null);
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    setScheduleTagInput("");
    setOpenScheduleInfoMenuKey(null);
    setOpenRequirementCellDropdown(null);
  }, [selectedScheduleForModal?.id]);

  useEffect(() => {
    const closeRequirementCellDropdown = () => {
      setOpenRequirementCellDropdown(null);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenRequirementCellDropdown(null);
      }
    };
    document.addEventListener("click", closeRequirementCellDropdown);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("click", closeRequirementCellDropdown);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  const showInstantTooltip = (
    event: React.MouseEvent<HTMLElement> | React.FocusEvent<HTMLElement>,
    content: string,
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setInstantTooltip({
      content,
      left: Math.min(rect.left, window.innerWidth - 420),
      top: rect.bottom + 8,
    });
  };

  const [showWeekFilterDropdown, setShowWeekFilterDropdown] = useState(false);
  const weekFilterRef = useRef<HTMLDivElement>(null);
  const createDialogSchedule = useMemo(
    () => schedules.find((schedule) => schedule.id === createDialogScheduleId) || null,
    [createDialogScheduleId, schedules],
  );

  const localizationCandidateRequirements = useMemo(() => {
    const query = localizationSearchQuery.trim().toLowerCase();
    const targetAssetType = createDialogSchedule?.form || selectedCreateType;
    return requirements
      .filter((req) => !req.isLocalization && !req.sourceRequirementId)
      .filter((req) => !targetAssetType || req.assetType === targetAssetType)
      .filter((req) => {
        if (!query) return true;
        return (
          req.id.toLowerCase().includes(query) ||
          req.name.toLowerCase().includes(query) ||
          req.direction.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        const spendDiff =
          (recentRequirementSpendMap[b.id] || 0) -
          (recentRequirementSpendMap[a.id] || 0);
        if (spendDiff !== 0) return spendDiff;
        return b.assetIndex - a.assetIndex;
      });
  }, [createDialogSchedule?.form, localizationSearchQuery, recentRequirementSpendMap, requirements, selectedCreateType]);

  const selectedLocalizationSources = useMemo(
    () =>
      selectedLocalizationSourceIds
        .map((id) => requirements.find((req) => req.id === id))
        .filter((req): req is Requirement => Boolean(req)),
    [
      localizationCandidateRequirements,
      selectedLocalizationSourceIds,
      requirements,
    ],
  );

  const selectedLocalizationLanguageMetas = useMemo(
    () =>
      selectedLocalizationLanguages
        .map((code) => LOCALIZATION_LANGUAGES.find((item) => item.code === code))
        .filter((item): item is (typeof LOCALIZATION_LANGUAGES)[number] => Boolean(item)),
    [selectedLocalizationLanguages],
  );

  const selectedLocalizationAssetTypes = useMemo(
    () => Array.from(new Set(selectedLocalizationSources.map((source) => source.assetType))),
    [selectedLocalizationSources],
  );

  const hasMixedLocalizationAssetTypes = selectedLocalizationAssetTypes.length > 1;
  const toggleLocalizationSource = (requirementId: string) => {
    setSelectedLocalizationSourceIds((prev) =>
      prev.includes(requirementId)
        ? prev.filter((id) => id !== requirementId)
        : [...prev, requirementId],
    );
  };

  const toggleLocalizationLanguage = (languageCode: string) => {
    setSelectedLocalizationLanguages((prev) =>
      prev.includes(languageCode)
        ? prev.filter((code) => code !== languageCode)
        : [...prev, languageCode],
    );
  };

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
    const handleRequirementFilterClickOutside = (event: MouseEvent) => {
      if (
        requirementFilterRef.current &&
        !requirementFilterRef.current.contains(event.target as Node)
      ) {
        setOpenRequirementFilterKey(null);
      }
    };
    document.addEventListener("mousedown", handleRequirementFilterClickOutside);
    return () => document.removeEventListener("mousedown", handleRequirementFilterClickOutside);
  }, []);

  useEffect(() => {
    const handleCoordinatedFilterClickOutside = (event: MouseEvent) => {
      if (
        coordinatedFilterRef.current &&
        !coordinatedFilterRef.current.contains(event.target as Node)
      ) {
        setOpenCoordinatedFilterKey(null);
        setIsFlexibleFilterPanelOpen(false);
        setOpenFlexibleFilterMenu(null);
      }
    };
    document.addEventListener("mousedown", handleCoordinatedFilterClickOutside);
    return () => document.removeEventListener("mousedown", handleCoordinatedFilterClickOutside);
  }, []);

  useEffect(() => {
    const handleCycleAdjustWeekPickerClickOutside = (event: MouseEvent) => {
      if (
        cycleAdjustWeekPickerRef.current &&
        !cycleAdjustWeekPickerRef.current.contains(event.target as Node)
      ) {
        setIsCycleAdjustWeekPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleCycleAdjustWeekPickerClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleCycleAdjustWeekPickerClickOutside);
  }, []);

  useEffect(() => {
    const handleProductionProducerFilterClickOutside = (event: MouseEvent) => {
      if (
        productionProducerFilterRef.current &&
        !productionProducerFilterRef.current.contains(event.target as Node)
      ) {
        setIsProductionProducerFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleProductionProducerFilterClickOutside);
    return () => document.removeEventListener("mousedown", handleProductionProducerFilterClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
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

  const handleAddSubRequirement = (
    parent: Requirement,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    const group = getRequirementVersionGroup(parent);
    const blankChild = group.find(
      (item) => item.id !== parent.id && isBlankRequirementDraft(item),
    );
    if (blankChild) {
      setSelectedReq(blankChild);
      return;
    }
    const majorId = getRequirementMajorId(parent);
    const nextVersionNumber =
      group.reduce((maxVersion, item) => {
        const parsedVersion =
          parseRequirementVersionId(item.id)?.version ||
          Number.parseInt(item.assetVersion, 10) ||
          0;
        return Math.max(maxVersion, parsedVersion);
      }, 0) + 1;
    const assetVersion = String(nextVersionNumber).padStart(2, "0");
    const nextId = `${majorId}-${assetVersion}`;
    const newReq: Requirement = {
      ...parent,
      id: nextId,
      parentId: parent.id,
      parentRequirementId: parent.id,
      name: "新子需求",
      assetVersion,
      previews: [],
      description: "",
      script: "",
      sections: undefined,
      reqStatus: "Draft",
      prodStatus: "Unscheduled",
      deliveryStatus: "NotLaunched",
      status: "Draft",
      rating: 0,
      createdAt: new Date().toISOString().slice(0, 19).replace("T", " "),
      completedAt: "",
      tasks: [],
    };
    setRequirements([newReq, ...requirements]);
    setSelectedReq(newReq);
  };

  const openIterationDirectionSelector = (
    source: Requirement,
    mode: "single" | "all",
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    setSelectedCreateType(source.assetType);
    setPendingIteration({ mode, sourceId: source.id });
  };

  const closeIterationDirectionSelector = () => {
    setPendingIteration(null);
  };

  const createIterationFromSchedule = (scheduleId: string) => {
    const source = requirements.find((item) => item.id === pendingIteration?.sourceId);
    const schedule = schedules.find((item) => item.id === scheduleId);
    if (!source || !schedule || !pendingIteration) return;

    const sources =
      pendingIteration.mode === "all"
        ? getRequirementVersionGroup(source)
        : [source];
    const assetType = schedule.form || source.assetType;
    const assetIndex = getNextAssetIndexForType(requirements, assetType);
    const newRequirements = sources.map((item, index) => {
      const sourceVersion =
        pendingIteration.mode === "all"
          ? parseRequirementVersionId(item.id)?.version ||
            Number.parseInt(item.assetVersion, 10) ||
            index + 1
          : 1;
      const version = String(sourceVersion).padStart(2, "0");
      return buildRequirementIteration(item, schedule, assetIndex, version);
    });

    setRequirements((prev) => [...newRequirements, ...prev]);
    setSelectedReq(newRequirements[0] || null);
    setSearchQuery(formatRequirementId(assetType, assetIndex, "01").split("-")[0]);
    resetCoordinatedFilters();
    setCombinedSubView("list");
    closeIterationDirectionSelector();
  };

  const handleAddRequirementFromSchedule = (scheduleId: string) => {
    if (editingScheduleId === scheduleId) return;
    const schedule = schedules.find((s) => s.id === scheduleId);
    if (!schedule) return;

    if (schedule.scenario === "Localized") {
      openCreateRequirementDialog(scheduleId);
      return;
    }

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

  const {
    addScheduleRow,
    updateSchedule,
    addScheduleDirectionTag,
    removeScheduleDirectionTag,
    openCycleAdjustPanel,
    toggleCycleAdjustRequirement,
    applyCycleAdjustment,
    updateSchedulePriority,
    createDeliverySetDraft,
  } = useScheduleActions({
    schedules,
    setSchedules,
    requirements,
    setRequirements,
    setDeliverySets,
    filters,
    coordinatedFlexibleFilters,
    scheduleMatchesFlexibleFilter,
    searchQuery,
    dateRangeStart,
    dateRangeEnd,
    combinedSubView,
    todayDateString,
    allWeekRanges,
    selectedWeekRange,
    setSelectedWeekRange,
    setSelectedWeekRanges,
    setDateRangeStart,
    setDateRangeEnd,
    scheduleInsights,
    scheduleTagInput,
    setScheduleTagInput,
    cycleAdjustTargetWeekRange,
    cycleAdjustRequirementIds,
    setCycleAdjustScheduleId,
    setCycleAdjustTargetWeekRange,
    setCycleAdjustRequirementIds,
    setIsCycleAdjustWeekPickerOpen,
    setSelectedScheduleForModal,
    setEditingScheduleId,
    showToast,
  });

  const {
    showAddWeekPopup,
    setShowAddWeekPopup,
    newWeekRange,
    newWeekStart,
    newWeekEnd,
    newWeekCalendarYear,
    newWeekCalendarMonth,
    newWeekCalendarWeeks,
    openAddWeekPopup,
    jumpNewWeekCalendarToToday,
    handleSelectNewWeekDay,
    handlePrevNewWeekMonth,
    handleNextNewWeekMonth,
    handleAddWeek,
  } = useAddWeekModal({
    addScheduleRow,
    setSelectedWeekRange,
    setSelectedWeekRanges,
    setDateRangeStart,
    setDateRangeEnd,
  });

  const renderRequirementInlineDropdown = <T extends string>(props: {
    menuKey: string;
    value: T;
    options: Array<{ value: T; label: string }>;
    onSelect: (value: T) => void;
    triggerClassName: string;
    panelClassName?: string;
  }) => (
    <RequirementInlineDropdown
      {...props}
      openMenuKey={openRequirementCellDropdown}
      setOpenMenuKey={setOpenRequirementCellDropdown}
    />
  );

  const updateRequirement = (id: string, updates: Partial<Requirement>) => {
    const mergeRequirement = (req: Requirement) => {
      const next = { ...req, ...updates };
      return { ...next, prodStatus: summarizeProductionStatus(next) };
    };
    const entersReview =
      updates.reqStatus !== undefined && updates.reqStatus !== "Draft";
    setRequirements((prev) => {
      const nextList = prev.map((r) => (r.id === id ? mergeRequirement(r) : r));
      const active = nextList.find((item) => item.id === id);
      return entersReview && active
        ? stripBlankVersionsForReview(nextList, active)
        : nextList;
    });
    setSelectedReq((prev) => (prev?.id === id ? mergeRequirement(prev) : prev));
  };

  const handleRequirementDetailChange = useCallback((updatedReq: Requirement) => {
    const normalizedReq = {
      ...updatedReq,
      prodStatus: summarizeProductionStatus(updatedReq),
    };
    setSelectedReq(normalizedReq);
    setRequirements((prev) => {
      const nextList = prev.map((r) =>
        r.id === normalizedReq.id ? normalizedReq : r,
      );
      return normalizedReq.reqStatus !== "Draft"
        ? stripBlankVersionsForReview(nextList, normalizedReq)
        : nextList;
    });
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

  const { collapsedWeeks, groupedSchedules, toggleWeek } = useLegacyScheduleGroups({
    schedules,
    requirements,
    materialStageFilter: filters.materialStage,
  });

  const localizationCreateDisabledReason =
    selectedLocalizationSources.length === 0
      ? "请至少选择 1 条来源需求"
      : selectedLocalizationLanguages.length === 0
        ? "请至少选择 1 个本地化语言"
        : hasMixedLocalizationAssetTypes
          ? "同一批本地化不能混选视频、图片和试玩"
          : "";
  const isCreateSubmitDisabled = Boolean(localizationCreateDisabledReason);

  const createStandaloneRequirement = () => {
    const newReq = buildStandaloneRequirementDraft(
      selectedCreateType,
      requirements.length,
    );
    setRequirements([...requirements, newReq]);
    setSelectedReq(newReq);
    setShowScheduleSelector(false);
  };

  return (
    <div className="w-full flex bg-slate-50/50 min-h-screen">
      <RequirementToast message={toast} />
      <RequirementInstantTooltip tooltip={instantTooltip} />
      {/* 主内容区域 */}
      <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
        {combinedSubView === "upload" ? (
          <MaterialUpload />
        ) : (
          <>
            {/* 当选择“协同看板”时 */}
            {combinedSubView === "coordinated" ? (
              <div className="flex-1 flex flex-col gap-3 overflow-hidden">
                <CoordinatedToolbar
                  pinnedWeekRanges={pinnedWeekRanges}
                  overflowWeekRanges={overflowWeekRanges}
                  selectedWeekRanges={selectedWeekRanges}
                  weekVisualMap={weekVisualMap}
                  weekFilterRef={weekFilterRef}
                  showWeekFilterDropdown={showWeekFilterDropdown}
                  searchQuery={searchQuery}
                  coordinatedFilterRef={coordinatedFilterRef}
                  coordinatedFlexibleFilters={coordinatedFlexibleFilters}
                  isFlexibleFilterPanelOpen={isFlexibleFilterPanelOpen}
                  openFlexibleFilterMenu={openFlexibleFilterMenu}
                  filters={filters}
                  openCoordinatedFilterKey={openCoordinatedFilterKey}
                  dateRangeStart={dateRangeStart}
                  dateRangeEnd={dateRangeEnd}
                  currentSort={currentSort}
                  sortOrder={sortOrder}
                  visibleScheduleCount={visibleSchedules.length}
                  toggleSelectedWeekRange={toggleSelectedWeekRange}
                  setShowWeekFilterDropdown={setShowWeekFilterDropdown}
                  openAddWeekPopup={openAddWeekPopup}
                  setSearchQuery={setSearchQuery}
                  setIsFlexibleFilterPanelOpen={setIsFlexibleFilterPanelOpen}
                  setOpenCoordinatedFilterKey={setOpenCoordinatedFilterKey}
                  setOpenFlexibleFilterMenu={setOpenFlexibleFilterMenu}
                  setCoordinatedFlexibleFilters={setCoordinatedFlexibleFilters}
                  getFilterOptionLabel={getFilterOptionLabel}
                  setFilters={setFilters}
                  toggleRequirementFilterOption={toggleRequirementFilterOption}
                  setDateRangeStart={setDateRangeStart}
                  setDateRangeEnd={setDateRangeEnd}
                  resetCoordinatedFilters={resetCoordinatedFilters}
                  setCurrentSort={setCurrentSort}
                  setSortOrder={setSortOrder}
                />

                <CoordinatedBoard
                  visibleSchedules={visibleSchedules}
                  requirements={requirements}
                  schedules={schedules}
                  selectedWeekRange={selectedWeekRange}
                  editingScheduleId={editingScheduleId}
                  todayDateString={todayDateString}
                  scheduleInsights={scheduleInsights}
                  setSelectedScheduleForModal={setSelectedScheduleForModal}
                  updateSchedule={updateSchedule}
                  setEditingScheduleId={setEditingScheduleId}
                  showInstantTooltip={showInstantTooltip}
                  setInstantTooltip={setInstantTooltip}
                  handleAddRequirementForDirection={handleAddRequirementForDirection}
                  setSchedules={setSchedules}
                  addScheduleRow={addScheduleRow}
                />
              </div>
            ) : combinedSubView === "list" ? (
              <RequirementListView
                searchQuery={searchQuery}
                filters={filters}
                filterConfigs={filterConfigs}
                openRequirementFilterKey={openRequirementFilterKey}
                createdRangeStart={createdRangeStart}
                createdRangeEnd={createdRangeEnd}
                completedRangeStart={completedRangeStart}
                completedRangeEnd={completedRangeEnd}
                requirementFilterRef={requirementFilterRef}
                hasActiveRequirementQuery={hasActiveRequirementQuery}
                filteredRequirements={filteredRequirements}
                todayDateString={todayDateString}
                onSearchQueryChange={setSearchQuery}
                onOpenCreate={() => setShowScheduleSelector(true)}
                onOpenCreateType={(type) => {
                  setSelectedCreateType(type);
                  setShowScheduleSelector(true);
                }}
                onOpenRequirementFilter={(key) =>
                  setOpenRequirementFilterKey((prev) =>
                    prev === key ? null : key,
                  )
                }
                onClearRequirementFilter={(key) => {
                  setFilters((prev) => ({ ...prev, [key]: FILTER_ALL }));
                  if (openRequirementFilterKey === key) {
                    setOpenRequirementFilterKey(null);
                  }
                }}
                onToggleRequirementFilterOption={toggleRequirementFilterOption}
                onCreatedRangeChange={({ start, end }) => {
                  setCreatedRangeStart(start);
                  setCreatedRangeEnd(end);
                }}
                onCompletedRangeChange={({ start, end }) => {
                  setCompletedRangeStart(start);
                  setCompletedRangeEnd(end);
                }}
                onResetFilters={() => {
                  setFilters({ ...INITIAL_REQUIREMENT_FILTERS });
                  setOpenRequirementFilterKey(null);
                  setCreatedRangeStart("");
                  setCreatedRangeEnd("");
                  setCompletedRangeStart("");
                  setCompletedRangeEnd("");
                }}
                getFilterDisplayText={getFilterDisplayText}
                getFilterOptionLabel={getFilterOptionLabel}
                getRequirementVersionGroup={getRequirementVersionGroup}
                onOpenIterationDirectionSelector={openIterationDirectionSelector}
                onAddSubRequirement={handleAddSubRequirement}
                renderRequirementInlineDropdown={renderRequirementInlineDropdown}
                updateRequirement={updateRequirement}
                getPriorityStyle={getPriorityStyle}
                getStatusStyle={getStatusStyle}
                getProdStatusStyle={getProdStatusStyle}
                getDeliveryStatusStyle={getDeliveryStatusStyle}
                getDeliveryStatusLabel={getDeliveryStatusLabel}
                onOpenRequirement={setSelectedReq}
                onDeleteRequirement={handleDelete}
              />
            ) : combinedSubView === "production" ? (
              <ProductionWorkspace
                productionView={productionView}
                delayedCount={delayedProductionRiskItems.length}
                selectedProducers={selectedProducers}
                personnelCapacityGroups={personnelCapacityGroups}
                calendarYear={calendarYear}
                calendarMonth={calendarMonth}
                calendarWeeks={productionCalendarWeeks}
                productionTasks={productionTasks}
                isProducerFilterOpen={isProductionProducerFilterOpen}
                producerFilterRef={productionProducerFilterRef}
                activeProducers={activeProducers}
                ganttStart={productionGanttStart}
                ganttDays={productionGanttDays}
                ganttRows={productionGanttRows}
                onProductionViewChange={setProductionView}
                onOpenRiskModal={() => setShowProductionRiskModal(true)}
                onSelectedProducersChange={setSelectedProducers}
                onJumpToday={() => {
                  const today = new Date();
                  setCalendarYear(today.getFullYear());
                  setCalendarMonth(today.getMonth() + 1);
                }}
                onPrevMonth={handlePrevMonth}
                onNextMonth={handleNextMonth}
                onToggleProducerFilter={() =>
                  setIsProductionProducerFilterOpen((prev) => !prev)
                }
                onClearProducerFilter={() => {
                  setSelectedProducers([]);
                  setIsProductionProducerFilterOpen(false);
                }}
                onToggleProducer={(producerName) => {
                  setSelectedProducers((prev) =>
                    prev.includes(producerName)
                      ? prev.filter((name) => name !== producerName)
                      : [...prev, producerName],
                  );
                }}
                onOpenRequirement={setSelectedReq}
              />
            ) : (
                <LegacyScheduleTable
                  groupedSchedules={groupedSchedules}
                  collapsedWeeks={collapsedWeeks}
                  schedules={schedules}
                  requirements={requirements}
                  toggleWeek={toggleWeek}
                  setSchedules={setSchedules}
                  addScheduleRow={addScheduleRow}
                  updateSchedule={updateSchedule}
                  setSelectedReq={setSelectedReq}
                  setViewingSpecificRequirements={setViewingSpecificRequirements}
                  getPriorityStyle={getPriorityStyle}
                  getDifficultyStyle={getDifficultyStyle}
                  getFormConfig={getFormConfig}
                  getScenarioStyle={getScenarioStyle}
                  getDirectionTypeStyle={getDirectionTypeStyle}
                />
            )}

          </>
        )}
      </div>

      {/* 排期卡片选择器 (新增需求的第一步) */}
      {showScheduleSelector && (
        <ScheduleSelectorModal
          selectedCreateType={selectedCreateType}
          schedules={schedules}
          requirements={requirements}
          onSelectCreateType={setSelectedCreateType}
          onClose={() => setShowScheduleSelector(false)}
          onSelectSchedule={handleAddRequirementFromSchedule}
          onCreateStandalone={createStandaloneRequirement}
          getFormConfig={getFormConfig}
          getPriorityStyle={getPriorityStyle}
        />
      )}

      {pendingIteration &&
        (() => {
          const source = requirements.find(
            (item) => item.id === pendingIteration.sourceId,
          );
          if (!source) return null;
          const sourceGroup = getRequirementVersionGroup(source);
          const iterationCount =
            pendingIteration.mode === "all" ? sourceGroup.length : 1;

          return (
            <IterationDirectionSelectorModal
              pendingIteration={pendingIteration}
              source={source}
              iterationCount={iterationCount}
              selectedCreateType={selectedCreateType}
              schedules={schedules}
              requirements={requirements}
              onClose={closeIterationDirectionSelector}
              onCreateIteration={createIterationFromSchedule}
              getAssetTypeLabel={getAssetTypeLabel}
              getFormConfig={getFormConfig}
              getPriorityStyle={getPriorityStyle}
            />
          );
        })()}

      {showProductionRiskModal && (
        <ProductionRiskModal
          items={delayedProductionRiskItems}
          onClose={() => setShowProductionRiskModal(false)}
        />
      )}

      {createDialogSchedule?.scenario === "Localized" && (
        <CreateLocalizedRequirementDialog
          schedule={createDialogSchedule}
          selectedLanguageCodes={selectedLocalizationLanguages}
          selectedLanguageCount={selectedLocalizationLanguageMetas.length}
          selectedSourceIds={selectedLocalizationSourceIds}
          searchQuery={localizationSearchQuery}
          candidates={localizationCandidateRequirements}
          recentSpendMap={recentRequirementSpendMap}
          disabledReason={localizationCreateDisabledReason}
          submitDisabled={isCreateSubmitDisabled}
          onClose={closeCreateDialog}
          onSearchChange={setLocalizationSearchQuery}
          onToggleLanguage={toggleLocalizationLanguage}
          onToggleSource={toggleLocalizationSource}
          onCreateStandard={createStandardRequirementFromDialog}
          onCreateLocalized={createLocalizedRequirementFromDialog}
          getAssetTypeLabel={getAssetTypeLabel}
        />
      )}

      {/* 创建周周期弹窗 */}
      {showAddWeekPopup && (
        <AddWeekModal
          todayDateString={todayDateString}
          calendarYear={newWeekCalendarYear}
          calendarMonth={newWeekCalendarMonth}
          calendarWeeks={newWeekCalendarWeeks}
          newWeekStart={newWeekStart}
          newWeekEnd={newWeekEnd}
          newWeekRange={newWeekRange}
          onClose={() => setShowAddWeekPopup(false)}
          onJumpToday={jumpNewWeekCalendarToToday}
          onPrevMonth={handlePrevNewWeekMonth}
          onNextMonth={handleNextNewWeekMonth}
          onSelectDay={handleSelectNewWeekDay}
          onConfirm={handleAddWeek}
        />
      )}

      <ScheduleDetailModal
        selectedScheduleForModal={selectedScheduleForModal}
        schedules={schedules}
        requirements={requirements}
        scheduleInsights={scheduleInsights}
        deliverySets={deliverySets}
        cycleAdjustScheduleId={cycleAdjustScheduleId}
        cycleAdjustTargetWeekRange={cycleAdjustTargetWeekRange}
        cycleAdjustRequirementIds={cycleAdjustRequirementIds}
        cycleAdjustWeekPickerRef={cycleAdjustWeekPickerRef}
        isCycleAdjustWeekPickerOpen={isCycleAdjustWeekPickerOpen}
        todayDateString={todayDateString}
        allWeekRanges={allWeekRanges}
        weekVisualMap={weekVisualMap}
        openScheduleInfoMenuKey={openScheduleInfoMenuKey}
        scheduleTagInput={scheduleTagInput}
        editingScheduleId={editingScheduleId}
        setSelectedScheduleForModal={setSelectedScheduleForModal}
        setOpenScheduleInfoMenuKey={setOpenScheduleInfoMenuKey}
        setScheduleTagInput={setScheduleTagInput}
        setCycleAdjustTargetWeekRange={setCycleAdjustTargetWeekRange}
        setIsCycleAdjustWeekPickerOpen={setIsCycleAdjustWeekPickerOpen}
        setCycleAdjustRequirementIds={setCycleAdjustRequirementIds}
        setCycleAdjustScheduleId={setCycleAdjustScheduleId}
        setSelectedReq={setSelectedReq}
        updateSchedule={updateSchedule}
        updateSchedulePriority={updateSchedulePriority}
        addScheduleDirectionTag={addScheduleDirectionTag}
        removeScheduleDirectionTag={removeScheduleDirectionTag}
        openCycleAdjustPanel={openCycleAdjustPanel}
        applyCycleAdjustment={applyCycleAdjustment}
        createDeliverySetDraft={createDeliverySetDraft}
        handleAddRequirementForDirection={handleAddRequirementForDirection}
        toggleCycleAdjustRequirement={toggleCycleAdjustRequirement}
        renderRequirementInlineDropdown={renderRequirementInlineDropdown}
        updateRequirement={updateRequirement}
        handleDelete={handleDelete}
        getPriorityStyle={getPriorityStyle}
        getStatusStyle={getStatusStyle}
        getProdStatusStyle={getProdStatusStyle}
        getDeliveryStatusStyle={getDeliveryStatusStyle}
        getDeliveryStatusLabel={getDeliveryStatusLabel}
      />

      {selectedReq && (
        <RequirementDetailOverlay
          requirement={selectedReq}
          requirements={requirements}
          schedules={schedules}
          productionTasks={productionTasks}
          onClose={() => setSelectedReq(null)}
          onChange={handleRequirementDetailChange}
          onDelete={handleRequirementDetailDelete}
        />
      )}
    </div>
  );
};

export default RequirementCenter;
