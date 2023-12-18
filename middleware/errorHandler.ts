const notFoundErr = (req: any, res: any, next: any) => {
  res.statusCode = 404;
  const error = new Error(`Route not found :${req.originalUrl}`);
  next(error);
};

const errorHandler = (err: any, req: any, res: any, next: any) => {
  let statusCode = String(res.statusCode)[0] != "2" ? res.statusCode : 500;

  if (err.name === "CastError" && err.kind === "ObjectId") {
    statusCode = 404;
    err.message = "Resource not found";
  }

  const stack = process.env.ENV == "DEV" ? err.stack : null;
  res.status(statusCode).json({
    status: "fail",
    message: err.message,
    stack,
  });
};

export { notFoundErr, errorHandler };
