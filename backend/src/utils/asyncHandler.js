export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
