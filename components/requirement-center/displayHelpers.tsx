import { Gamepad2, Image as ImageIcon, Video } from "lucide-react";
import type {
  CreativeDifficulty,
  CreativeDirectionType,
  CreativeForm,
  CreativeScenario,
  RequirementDeliveryStatus,
  RequirementPriority,
  RequirementProdStatus,
  RequirementReqStatus,
} from "../../types";

export const getAssetTypeLabel = (assetType: CreativeForm) => {
  if (assetType === "Image") return "图片";
  if (assetType === "Playable") return "试玩";
  return "视频";
};

export const getStatusStyle = (status: RequirementReqStatus) => {
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

export const getProdStatusStyle = (status: RequirementProdStatus) => {
  switch (status) {
    case "Unscheduled":
      return "bg-slate-50 text-slate-400 border-slate-100";
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

export const getDeliveryStatusStyle = (status: RequirementDeliveryStatus) => {
  switch (status) {
    case "Delivering":
      return "text-emerald-600 border-emerald-200 bg-emerald-50";
    case "Paused":
      return "text-slate-500 border-slate-200 bg-slate-50";
    case "NotLaunched":
    default:
      return "text-slate-400 border-slate-200 bg-slate-50";
  }
};

export const getDeliveryStatusLabel = (status: RequirementDeliveryStatus) => {
  if (status === "Delivering") return "投放中";
  if (status === "Paused") return "暂停投放";
  return "未投放";
};

export const getPriorityStyle = (priority: RequirementPriority) => {
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

export const getDifficultyStyle = (difficulty: CreativeDifficulty) => {
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

export const getFormConfig = (form: CreativeForm) => {
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

export const getScenarioStyle = (scenario: CreativeScenario) => {
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

export const getDirectionTypeStyle = (type: CreativeDirectionType) => {
  if (type.startsWith("Original"))
    return "bg-teal-50 text-teal-700 border-teal-200";
  if (type.startsWith("Scaling"))
    return "bg-indigo-50 text-indigo-700 border-indigo-200";
  if (type.startsWith("Test"))
    return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-slate-100 text-slate-600";
};

export const getDifficultyLabel = (difficulty: CreativeDifficulty) => {
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

export const getDirectionTypeLabel = (type: CreativeDirectionType) => {
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
