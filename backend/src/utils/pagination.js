const DEFAULT_LIMIT = 10
const MAX_LIMIT = 100

export function parsePagination(query) {
  const page = Number(query.page ?? 1)
  const limit = Number(query.limit ?? DEFAULT_LIMIT)

  if (!Number.isInteger(page) || page < 1) {
    return { error: 'page must be a positive integer.' }
  }
  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT) {
    return { error: `limit must be an integer between 1 and ${MAX_LIMIT}.` }
  }

  return { page, limit, skip: (page - 1) * limit }
}

export function buildPagination(page, limit, total) {
  const totalPages = Math.ceil(total / limit)
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1 && totalPages > 0,
  }
}
