"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOne = exports.checkIfSessionExpired = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const sessionModel_1 = __importDefault(require("../models/sessionModel"));
const userModel_1 = __importDefault(require("../models/userModel"));
const __1 = require("..");
function formatDateTime(date) {
    const options = {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    };
    return new Intl.DateTimeFormat("en-US", options).format(date);
}
exports.checkIfSessionExpired = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const sessionId = req.params.id;
    const session = yield sessionModel_1.default.findById(sessionId).populate({
        path: "questions.askedBy",
    });
    if (!session) {
        res.status(404).json({
            status: "fail",
            message: "Session not found",
        });
        return;
    }
    if (new Date(session.expiresAt) < new Date()) {
        res.status(401).json({
            status: "fail",
            message: "Session expired",
        });
        return;
    }
    req.session = session;
    next();
}));
exports.createOne = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const session = req.session;
    const lastQuestionAt = req.user.lastQuestionAt;
    if (lastQuestionAt) {
        const timeDiff = new Date().getTime() - lastQuestionAt.getTime();
        if (timeDiff < 30000 && req.user.role != "ADMIN") {
            res.status(429).json({
                status: "fail",
                message: `You can only create a question every 30 seconds. Please wait for ${formatDateTime(new Date(lastQuestionAt.getTime() + 30000))}`,
            });
            return;
        }
    }
    if (session.locked && req.user.role != "ADMIN") {
        res.status(400).json({
            status: "fail",
            message: "Session is locked",
        });
        return;
    }
    const question = req.body.question;
    if (!question) {
        res.status(400).json({
            status: "fail",
            message: "Question is required",
        });
        return;
    }
    let newQuestion = yield sessionModel_1.default.findByIdAndUpdate(session._id, {
        $push: {
            questions: {
                question,
                askedBy: req.user._id,
            },
        },
    }, {
        new: true,
    });
    const newUser = yield userModel_1.default.findByIdAndUpdate(req.user._id, {
        lastQuestionAt: new Date(),
    });
    const updatedSession = yield sessionModel_1.default.findById(session._id).populate({
        path: "questions.askedBy",
    });
    __1.io.to(session.id).emit("question", updatedSession);
    res.status(201).json({
        status: "success",
        session: updatedSession,
    });
}));
