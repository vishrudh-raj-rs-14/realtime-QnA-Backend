"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.notFoundErr = void 0;
const notFoundErr = (req, res, next) => {
    res.statusCode = 404;
    const error = new Error(`Route not found :${req.originalUrl}`);
    next(error);
};
exports.notFoundErr = notFoundErr;
const errorHandler = (err, req, res, next) => {
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
exports.errorHandler = errorHandler;
