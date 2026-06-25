import type {
  CreativeForm,
  ProductionTask,
  Requirement,
  RequirementProdStatus,
} from "../../types";

interface PipelineStage {
  name: string;
  status: "pending" | "inprogress" | "completed";
}

export const LOCALIZATION_LANGUAGES = [
  { code: "de", label: "德语" },
  { code: "fr", label: "法语" },
  { code: "es", label: "西语" },
  { code: "pt", label: "葡语" },
  { code: "it", label: "意语" },
  { code: "jp", label: "日语" },
  { code: "kr", label: "韩语" },
  { code: "th", label: "泰语" },
  { code: "id", label: "印尼语" },
  { code: "tr", label: "土耳其语" },
];

export function getRequirementPipeline(req: Requirement): PipelineStage[] {
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
  }
  if (is3D) {
    const idNum = parseInt(req.id.replace(/\D/g, "")) || 0;
    const s1 = idNum % 2 === 0 ? "completed" : "inprogress";
    const s2 = idNum % 4 === 0 ? "completed" : idNum % 2 === 0 ? "inprogress" : "pending";
    const s3 = idNum % 4 === 0 ? "inprogress" : "pending";
    return [
      { name: "平面", status: s1 },
      { name: "3D", status: s2 },
      { name: "2D", status: s3 },
    ];
  }

  const idNum = parseInt(req.id.replace(/\D/g, "")) || 0;
  const s1 = idNum % 2 === 0 ? "completed" : "inprogress";
  const s2 = idNum % 2 === 0 ? "inprogress" : "pending";
  return [
    { name: "平面", status: s1 },
    { name: "2D视频", status: s2 },
  ];
}

export function getReqType(req: Requirement): string {
  const is3D = req.has3DPlot || req.name?.toLowerCase().includes("3d") || (req.assetType as string) === "3D" || (req as any).is3DVideo;
  if (req.assetType === "Playable") return "Playable";
  if (is3D) return "3D";
  if (req.assetType === "Image") return "平面";
  return "视频";
}

export const createDefaultProductionTasks = (
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

export const summarizeProductionStatus = (
  requirement: Requirement,
): RequirementProdStatus => {
  const tasks = requirement.tasks || [];
  if (tasks.length === 0) return requirement.prodStatus || "Unscheduled";
  if (tasks.every((task) => task.status === "已完成")) return "Completed";
  if (tasks.some((task) => task.status === "制作中")) return "InProgress";
  if (requirement.prodStatus === "Unscheduled") return "Unscheduled";
  return "Scheduled";
};

export interface ScheduledTaskView {
  id: string;
  requirement: Requirement;
  task?: ProductionTask;
  displayRequirementId: string;
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

export const parseRequirementVersionId = (id: string) => {
  const match = id.match(/^([a-z]+\d+)-(\d{2})(?:$|-)/i);
  if (!match) return null;
  return {
    majorId: match[1],
    version: Number.parseInt(match[2], 10),
  };
};

export const getRequirementMajorId = (req: Pick<Requirement, "id" | "assetIndex" | "assetType">) => {
  const parsed = parseRequirementVersionId(req.id);
  if (parsed) return parsed.majorId;
  const prefix = req.assetType === "Image" ? "tp" : req.assetType === "Playable" ? "sw" : "cp";
  return `${prefix}${req.assetIndex}`;
};

const formatScheduledRequirementId = (requirement: Requirement, task?: ProductionTask) => {
  if (task?.version) return requirement.id;
  const subVersions = requirement.subVersions || [];
  if (subVersions.length <= 1) return requirement.id;

  const versionNumbers = subVersions
    .map((item) => Number.parseInt(item.version, 10))
    .filter((value) => Number.isFinite(value));
  const majorId = getRequirementMajorId(requirement);

  if (versionNumbers.length > 0) {
    return `${majorId}（${Math.min(...versionNumbers)}-${Math.max(...versionNumbers)}）`;
  }

  return `${majorId}（${subVersions.length}个）`;
};

export const getScheduledTaskViews = (requirement: Requirement): ScheduledTaskView[] => {
  const taskViews = (requirement.tasks || [])
    .filter((task) => task.designer && task.startDate && task.endDate)
    .map((task): ScheduledTaskView => ({
      id: `${requirement.id}:${task.id}`,
      requirement,
      task,
      displayRequirementId: formatScheduledRequirementId(requirement, task),
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
      displayRequirementId: formatScheduledRequirementId(requirement),
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

export const formatDateCompact = (dateStr: string) => dateStr.replaceAll("-", "");

export const formatRequirementId = (
  assetType: CreativeForm,
  assetIndex: number,
  assetVersion: string,
) => {
  const prefix = assetType === "Image" ? "tp" : assetType === "Playable" ? "sw" : "cp";
  return `${prefix}${assetIndex}-${assetVersion}`;
};

export const formatCurrencyCompact = (value: number) => {
  if (value >= 10000) return `$${(value / 10000).toFixed(1)}w`;
  return `$${Math.round(value).toLocaleString()}`;
};
