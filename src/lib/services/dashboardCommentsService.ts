import {
  getDashboardCommentById,
  countDashboardComments,
  getDashboardComments,
} from "@/lib/repositories/commentsRepository";

/**
 * Dashboard: listování všech komentářů napříč platformou.
 *
 * @param {Object} [input] - Parametry listování.
 * @param {number} [input.limit] - Limit počtu položek.
 * @param {number} [input.offset] - Offset (paginace).
 * @param {string} [input.query] - Vyhledávací dotaz (autor / obsah / článek).
 * @returns {Promise<Array>} Seznam komentářů pro dashboard.
 */
export async function listDashboardCommentsService(input?: {
  limit?: number;
  offset?: number;
  query?: string;
}) {
  const [items, total] = await Promise.all([
    getDashboardComments(input),
    countDashboardComments({ query: input?.query }),
  ]);

  return { items, total };
}

/**
 * Dashboard: detail komentáře (pro modaly/reporty).
 *
 * @param {string} commentId - ID komentáře.
 * @returns {Promise<Object|null>} Detail komentáře nebo `null`.
 */
export async function getDashboardCommentService(commentId: string) {
  return await getDashboardCommentById(commentId);
}

