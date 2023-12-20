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
exports.changeVote = exports.toggleLock = exports.deleteSession = exports.getSession = exports.getSessions = exports.createSession = void 0;
const __1 = require("..");
const sessionModel_1 = __importDefault(require("../models/sessionModel"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
exports.createSession = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const expiresAt = req.body.expiresAt || Date.now() + 3 * 60 * 60 * 1000;
    const session = yield sessionModel_1.default.create({
        createdBy: req.user._id,
    });
    __1.io.to("main").emit("session", session);
    res.status(201).json({
        status: "success",
        session,
    });
}));
exports.getSessions = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const sessions = yield sessionModel_1.default.find().sort("-createdAt");
    res.status(200).json({
        status: "success",
        sessions,
    });
}));
exports.getSession = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield sessionModel_1.default.findById(req.params.id).populate({
        path: "questions.askedBy",
    });
    res.status(200).json({
        status: "success",
        session,
    });
}));
exports.deleteSession = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield sessionModel_1.default.findByIdAndDelete(req.params.id);
    res.status(204).json({
        status: "success",
    });
}));
exports.toggleLock = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield sessionModel_1.default.findById(req.params.id);
    if (!session) {
        res.status(404).json({
            status: "fail",
            message: "Session not found",
        });
        return;
    }
    session.locked = !session.locked;
    yield session.save();
    __1.io.to(session.id).emit("lock", session.locked);
    res.status(200).json({
        status: "success",
        session,
    });
}));
exports.changeVote = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { questionId, sessionId } = req.params;
    const session = req.session;
    let upVoted = false;
    session.questions.forEach((question) => {
        if (question._id == questionId) {
            if (question.upVotes.includes(req.user._id)) {
                question.upVotes.pull(req.user._id);
                upVoted = false;
            }
            else {
                question.upVotes.push(req.user._id);
                upVoted = true;
            }
        }
    });
    console.log(session.id, "asda");
    __1.io.to(session.id).emit("vote", { session, upVoted });
    yield session.save();
    res.status(200).json({
        status: "success",
        session,
        upVoted,
    });
}));
