'use strict';

/**
 * Build a paginated response object.
 * @param {object} opts
 * @param {Array} opts.data
 * @param {number} opts.total - total documents matching query
 * @param {number} opts.page - current page (1-indexed)
 * @param {number} opts.limit - items per page
 */
function paginate({ data, total, page, limit }) {
  const totalPages = Math.ceil(total / limit);
  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}

/**
 * Extract pagination params from query string with defaults.
 * @param {object} query - req.query
 * @param {number} defaultLimit
 * @returns {{ page, limit, skip }}
 */
function getPaginationParams(query, defaultLimit = 12) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || defaultLimit));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

/**
 * Standard success response.
 */
function successResponse(res, data, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    ...data,
  });
}

module.exports = { paginate, getPaginationParams, successResponse };
