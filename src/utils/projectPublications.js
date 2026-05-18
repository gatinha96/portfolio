export function getRelatedPublicationsForProject(projectId, publications = []) {
  if (!projectId) {
    return [];
  }

  return publications.filter((publication) =>
    publication?.tags?.some((tag) =>
      String(tag)
        .split(",")
        .map((token) => token.trim())
        .includes(projectId)
    )
  );
}

export function hasRelatedPublicationsForProject(projectId, publications = []) {
  return getRelatedPublicationsForProject(projectId, publications).length > 0;
}