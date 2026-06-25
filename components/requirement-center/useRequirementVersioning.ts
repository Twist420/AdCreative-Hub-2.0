import { useCallback } from "react";
import { Requirement } from "../../types";
import { getRequirementMajorId, parseRequirementVersionId } from "./requirementUtils";

export const useRequirementVersioning = (requirements: Requirement[]) => {
  const getRequirementVersionGroup = useCallback(
    (source: Requirement) => {
      const majorId = getRequirementMajorId(source);
      return requirements
        .filter((req) => getRequirementMajorId(req) === majorId)
        .sort((a, b) => {
          const aVersion =
            parseRequirementVersionId(a.id)?.version ||
            Number.parseInt(a.assetVersion, 10) ||
            0;
          const bVersion =
            parseRequirementVersionId(b.id)?.version ||
            Number.parseInt(b.assetVersion, 10) ||
            0;
          return aVersion - bVersion;
        });
    },
    [requirements],
  );

  const isBlankRequirementDraft = useCallback((req: Requirement) => {
    if (req.reqStatus !== "Draft") return false;
    const hasCustomName =
      req.name.trim() &&
      !["新子需求", "未命名子需求", "子需求"].some((marker) =>
        req.name.includes(marker),
      );
    return (
      !hasCustomName &&
      !(req.description || "").trim() &&
      !(req.script || "").trim() &&
      (req.previews || []).length === 0
    );
  }, []);

  const stripBlankVersionsForReview = useCallback(
    (list: Requirement[], activeRequirement: Requirement) => {
      const activeMajorId = getRequirementMajorId(activeRequirement);
      return list.filter(
        (item) =>
          item.id === activeRequirement.id ||
          getRequirementMajorId(item) !== activeMajorId ||
          !isBlankRequirementDraft(item),
      );
    },
    [isBlankRequirementDraft],
  );

  return {
    getRequirementVersionGroup,
    isBlankRequirementDraft,
    stripBlankVersionsForReview,
  };
};
