export default function PaginationControls({ pagination, onPageChange }) {
  if (!pagination || pagination.totalPages <= 1) return null

  return (
    <nav aria-label="Pagination" className="flex flex-col gap-3 border-t border-line px-3 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted">
        Page {pagination.page} of {pagination.totalPages} · {pagination.total} total
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={!pagination.hasPreviousPage}
          onClick={() => onPageChange(pagination.page - 1)}
          className="rounded-lg border border-line px-3.5 py-2 text-sm font-semibold text-ink hover:bg-page disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>
        <button
          type="button"
          disabled={!pagination.hasNextPage}
          onClick={() => onPageChange(pagination.page + 1)}
          className="rounded-lg border border-line px-3.5 py-2 text-sm font-semibold text-ink hover:bg-page disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </nav>
  )
}
