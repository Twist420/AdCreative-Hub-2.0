import { getRequirementMajorId, parseRequirementVersionId } from './requirementUtils'

export const useRequirementVersioning = ({ requirements }) => {
  const getRequirementVersionGroup = (source) => {
    if (!source) return []
    const majorId = getRequirementMajorId(source)
    return requirements.value
      .filter((requirement) => getRequirementMajorId(requirement) === majorId)
      .sort((a, b) => {
        const aVersion = parseRequirementVersionId(a.id)?.version || Number.parseInt(a.assetVersion, 10) || 0
        const bVersion = parseRequirementVersionId(b.id)?.version || Number.parseInt(b.assetVersion, 10) || 0
        return aVersion - bVersion
      })
  }

  const isBlankRequirementDraft = (requirement) => {
    if (requirement.reqStatus !== 'Draft') return false
    const hasCustomName =
      String(requirement.name || '').trim() &&
      !['新子需求', '未命名子需求', '子需求'].some((marker) => String(requirement.name || '').includes(marker))
    return (
      !hasCustomName &&
      !String(requirement.description || '').trim() &&
      !String(requirement.script || '').trim() &&
      (requirement.previews || []).length === 0
    )
  }

  const hasBlankDraftVersion = (source) => getRequirementVersionGroup(source).some(isBlankRequirementDraft)

  const stripBlankVersionsForReview = (list, activeRequirement) => {
    const activeMajorId = getRequirementMajorId(activeRequirement)
    return list.filter(
      (item) =>
        item.id === activeRequirement.id ||
        getRequirementMajorId(item) !== activeMajorId ||
        !isBlankRequirementDraft(item),
    )
  }

  return {
    getRequirementVersionGroup,
    isBlankRequirementDraft,
    hasBlankDraftVersion,
    stripBlankVersionsForReview,
  }
}
