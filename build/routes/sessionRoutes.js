"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const sessionController_1 = require("../controllers/sessionController");
const questionController_1 = require("../controllers/questionController");
const sessionRouter = express_1.default.Router();
sessionRouter
    .route("/")
    .post(userController_1.protect, (0, userController_1.restricTo)("ADMIN"), sessionController_1.createSession)
    .get(userController_1.protect, sessionController_1.getSessions)
    .delete(userController_1.protect, (0, userController_1.restricTo)("ADMIN"), sessionController_1.deleteSession);
sessionRouter.route("/:id").get(userController_1.protect, sessionController_1.getSession);
sessionRouter.route("/:id").post(userController_1.protect, sessionController_1.toggleLock);
sessionRouter
    .route("/:id/questions")
    .post(userController_1.protect, questionController_1.checkIfSessionExpired, questionController_1.createOne);
sessionRouter
    .route("/:id/questions/:questionId")
    .post(userController_1.protect, questionController_1.checkIfSessionExpired, sessionController_1.changeVote);
exports.default = sessionRouter;
