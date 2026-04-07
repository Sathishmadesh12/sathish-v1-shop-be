const { apiResponse } = require('../utils/apiResponse');
const notFound = (req, res) => apiResponse(res, 404, false, `Route not found: ${req.originalUrl}`);
const errorHandler = (err, req, res, next) => {
  console.error(err.message);
  let status = err.statusCode || 500;
  let msg = err.message || 'Server error';
  if (err.name === 'ValidationError') { status = 400; msg = Object.values(err.errors).map(e => e.message).join(', '); }
  if (err.code === 11000) { status = 409; msg = `${Object.keys(err.keyValue)[0]} already exists`; }
  if (err.name === 'CastError') { status = 400; msg = `Invalid ID`; }
  apiResponse(res, status, false, msg);
};
module.exports = { notFound, errorHandler };
