export const parseRequirementVersionId = (id) => {
  const match = String(id || '').match(/^([a-z]+\d+)-(\d{2})(?:$|-)/i)
  if (!match) return null
  return {
    majorId: match[1],
    version: Number.parseInt(match[2], 10),
  }
}

export const getRequirementMajorId = (requirement = {}) => {
  const parsed = parseRequirementVersionId(requirement.id)
  if (parsed) return parsed.majorId
  const prefix = requirement.assetType === 'Image' ? 'tp' : requirement.assetType === 'Playable' ? 'sw' : 'cp'
  return `${prefix}${requirement.assetIndex || ''}`
}

export const formatScheduledRequirementId = (requirement = {}, task) => {
  if (task?.version) return requirement.id
  const subVersions = requirement.subVersions || []
  if (subVersions.length <= 1) return requirement.id

  const versionNumbers = subVersions
    .map((item) => Number.parseInt(item.version, 10))
    .filter((value) => Number.isFinite(value))
  const majorId = getRequirementMajorId(requirement)

  if (versionNumbers.length > 0) {
    return `${majorId}（${Math.min(...versionNumbers)}-${Math.max(...versionNumbers)}）`
  }

  return `${majorId}（${subVersions.length}个）`
}
