import type { AssetVersionItem, CreativeSchedule, Requirement } from "../../types";
import RequirementDetail from "../RequirementDetail";
import type { ScheduledTaskView } from "./requirementUtils";
import { parseRequirementVersionId } from "./requirementUtils";

const getVersionSortValue = (version: string) => Number(version.replace(/\D/g, "")) || 0;

const formatLocalizationSourceId = (sourceId: string) => {
  const parsed = parseRequirementVersionId(sourceId);
  if (!parsed) return sourceId;
  return `${parsed.majorId}(${String(parsed.version).padStart(2, "0")})`;
};

const formatLocalizationVersionName = (
  requirement: Requirement,
  item: Requirement,
  sourceSubVersion?: AssetVersionItem,
) => {
  const sourceId = item.sourceRequirementId || sourceSubVersion?.sourceRequirementId;
  if (!sourceId) return item.name || sourceSubVersion?.name || `v${item.assetVersion}`;

  const createdDate = (item.createdAt || requirement.createdAt || "").slice(0, 10).replaceAll("-", "");
  const languageLabel =
    item.localizationLanguageLabel ||
    requirement.localizationLanguageLabel ||
    item.localizationLanguage ||
    requirement.localizationLanguage ||
    "";

  if (!createdDate || !languageLabel) {
    return item.name || sourceSubVersion?.name || formatLocalizationSourceId(sourceId);
  }

  return `${createdDate}${languageLabel}本地化${formatLocalizationSourceId(sourceId)}`;
};

const getLocalizedDetailVersions = (
  requirement: Requirement,
  requirements: Requirement[],
): AssetVersionItem[] | undefined => {
  if (!requirement.isLocalization || !requirement.localizationBatchId) {
    return undefined;
  }

  const localizedSiblings = requirements
    .filter((item) => {
      if (!item.isLocalization) return false;
      if (item.localizationBatchId !== requirement.localizationBatchId) return false;
      if (requirement.localizationLanguage) {
        return item.localizationLanguage === requirement.localizationLanguage;
      }
      return item.assetIndex === requirement.assetIndex;
    })
    .sort((a, b) => getVersionSortValue(a.assetVersion) - getVersionSortValue(b.assetVersion));

  if (localizedSiblings.length <= 1) {
    return requirement.subVersions;
  }

  return localizedSiblings.map((item) => {
    const sourceSubVersion = item.subVersions?.[0];
    return {
      ...(sourceSubVersion || {}),
      version: item.assetVersion,
      name: formatLocalizationVersionName(requirement, item, sourceSubVersion),
      sourceRequirementId: item.sourceRequirementId || sourceSubVersion?.sourceRequirementId,
      sourceRequirementName: sourceSubVersion?.sourceRequirementName || sourceSubVersion?.name || item.name,
      testDirections: item.testDirections?.length
        ? item.testDirections
        : sourceSubVersion?.testDirections || [],
      finishedReferenceIds: sourceSubVersion?.finishedReferenceIds,
    };
  });
};

export const RequirementDetailOverlay = ({
  requirement,
  requirements,
  schedules,
  productionTasks,
  onClose,
  onChange,
  onDelete,
}: {
  requirement: Requirement;
  requirements: Requirement[];
  schedules: CreativeSchedule[];
  productionTasks: ScheduledTaskView[];
  onClose: () => void;
  onChange: (requirement: Requirement) => void;
  onDelete: (requirementId: string) => void;
}) => {
  const selectedSchedule = schedules.find(
    (schedule) => schedule.id === requirement.scheduleId,
  );
  const scheduleDeadline =
    selectedSchedule?.productionEnd ||
    selectedSchedule?.submissionDeadline ||
    selectedSchedule?.requirementEnd ||
    requirement.endDate ||
    "";
  const detailSubVersions = getLocalizedDetailVersions(requirement, requirements);

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full h-full bg-white overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <RequirementDetail
          requirement={requirement}
          detailSubVersions={detailSubVersions}
          onClose={onClose}
          onChange={onChange}
          onDelete={onDelete}
          scheduleDeadline={scheduleDeadline}
          productionScheduleContext={productionTasks.map((task) => ({
            id: task.id,
            requirementId: task.requirement.id,
            displayRequirementId: task.displayRequirementId,
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
  );
};
