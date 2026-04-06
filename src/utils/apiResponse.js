const apiResponse = (
  res,
  statusCode,
  success,
  message,
  data = null,
  meta = null,
) => {
  const r = { success, message };
  if (data !== null) r.data = data;
  if (meta !== null) r.meta = meta;
  return res.status(statusCode).json(r);
};
const paginate = (page, limit, total) => ({
  page: +page,
  limit: +limit,
  total,
  totalPages: Math.ceil(total / limit),
  hasNext: page * limit < total,
  hasPrev: page > 1,
});
module.exports = { apiResponse, paginate };
