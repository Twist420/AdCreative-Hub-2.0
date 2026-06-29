import type { ProductionTask, Requirement } from "../../../types";

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

export const formatScheduledRequirementId = (requirement: Requirement, task?: ProductionTask) => {
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
