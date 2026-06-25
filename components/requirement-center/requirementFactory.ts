import {
  AssetVersionItem,
  CreativeForm,
  CreativeSchedule,
  FinishedCreativePerformance,
  Requirement,
} from "../../types";
import { createDefaultProductionTasks, formatRequirementId } from "./requirementUtils";

export const getRequirementIdPrefix = (assetType: CreativeForm) => {
  if (assetType === "Image") return "tp";
  if (assetType === "Playable") return "sw";
  return "cp";
};

export const getNextLocalizationAssetIndex = (requirements: Requirement[]) => {
  const usedIndexes = requirements
    .map((req) => req.assetIndex)
    .filter((index) => index >= 8000);
  return usedIndexes.length > 0 ? Math.max(...usedIndexes) + 1 : 8000;
};

export const getNextAssetIndexForType = (
  requirements: Requirement[],
  assetType: CreativeForm,
) => {
  const prefix = getRequirementIdPrefix(assetType);
  const usedIndexes = requirements
    .filter((req) => req.id.startsWith(prefix))
    .map((req) => req.assetIndex)
    .filter((index) => Number.isFinite(index));
  return usedIndexes.length > 0 ? Math.max(...usedIndexes) + 1 : 3377;
};

export const buildRequirementIteration = (
  source: Requirement,
  schedule: CreativeSchedule,
  assetIndex: number,
  version: string,
): Requirement => {
  const assetType = schedule.form || source.assetType;
  const broadDirection =
    schedule.broadDirection ||
    (schedule.directionType?.includes("3D")
      ? "3D玩法"
      : schedule.directionName?.includes("大字报")
        ? "大字报"
        : source.broadDirection);
  const nextId = formatRequirementId(assetType, assetIndex, version);

  return {
    ...source,
    id: nextId,
    parentId: undefined,
    parentRequirementId: source.id,
    sourceRequirementId: source.id,
    sourceRequirementIds: [source.id],
    scheduleId: schedule.id,
    assetType,
    assetIndex,
    assetVersion: version,
    materialStage: "迭",
    broadDirection,
    creativePersonnel: schedule.owner || source.creativePersonnel,
    owner: schedule.owner || source.owner,
    direction: schedule.directionName || source.direction,
    channels: schedule.channels?.length ? schedule.channels : source.channels,
    priority: schedule.priority || source.priority,
    reqStatus: "Pending",
    prodStatus: "Unscheduled",
    deliveryStatus: "NotLaunched",
    status: "Pending",
    rating: 0,
    createdAt: new Date().toISOString().slice(0, 19).replace("T", " "),
    completedAt: "",
    tasks: createDefaultProductionTasks(nextId, assetType, broadDirection),
  };
};

export const buildLocalizationSubVersions = (
  sources: Requirement[],
  finishedCreativePerformance: FinishedCreativePerformance[],
): AssetVersionItem[] =>
  sources.map((source, index) => {
    const rows = finishedCreativePerformance.filter(
      (item) => item.requirementId === source.id,
    );
    return {
      version: String(index + 1).padStart(2, "0"),
      name: source.name,
      testDirections: source.testDirections || [],
      sourceRequirementId: source.id,
      sourceRequirementName: source.name,
      finishedReferenceIds:
        rows.length > 0
          ? rows.map((item) => item.id)
          : [`FIN-${source.assetIndex}-${source.assetVersion || "01"}`],
    };
  });

export const buildStandaloneRequirementDraft = (
  selectedCreateType: CreativeForm,
  requirementCount: number,
): Requirement => {
  const assetIndex = 3377 + requirementCount;
  const requirementId = `${
    selectedCreateType === "Video"
      ? "cp"
      : selectedCreateType === "Image"
        ? "tp"
        : "sw"
  }${assetIndex}-01`;

  return {
    id: requirementId,
    name: `未关联方向需求 - ${requirementCount + 1}`,
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
    reqStatus: "Pending",
    prodStatus: "Unscheduled",
    deliveryStatus: "NotLaunched",
    status: "Pending",
    rating: 0,
    createdAt: new Date().toISOString().slice(0, 19).replace("T", " "),
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
      requirementId,
      selectedCreateType,
      "原始玩法",
    ),
  };
};
