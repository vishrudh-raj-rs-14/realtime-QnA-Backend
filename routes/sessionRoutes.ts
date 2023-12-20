import express from "express";
import { protect, restricTo } from "../controllers/userController";
import {
  createSession,
  deleteSession,
  getSession,
  getSessions,
  toggleLock,
  changeVote,
} from "../controllers/sessionController";
import {
  checkIfSessionExpired,
  createOne,
} from "../controllers/questionController";

const sessionRouter = express.Router();

sessionRouter
  .route("/")
  .post(protect, restricTo("ADMIN"), createSession)
  .get(protect, getSessions)
  .delete(protect, restricTo("ADMIN"), deleteSession);

sessionRouter.route("/:id").get(protect, getSession);
sessionRouter.route("/:id").post(protect, toggleLock);

sessionRouter
  .route("/:id/questions")
  .post(protect, checkIfSessionExpired, createOne);

sessionRouter
  .route("/:id/questions/:questionId")
  .post(protect, checkIfSessionExpired, changeVote);

export default sessionRouter;
