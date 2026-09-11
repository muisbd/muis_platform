export function errorHandler(err, _req, res, _next) {
  const status = err.status || 500;
  const message = err.message || 'Server error';
  if (status >= 500) console.error(err);
  res.status(status).json({ ok: false, message });
}
