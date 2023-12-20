import { io } from "..";
import Session from "../models/sessionModel";
import expressAsyncHandler from "express-async-handler";

export const createSession = expressAsyncHandler(async (req: any, res) => {
  const expiresAt = req.body.expiresAt || Date.now() + 3 * 60 * 60 * 1000;
  const session = await Session.create({
    createdBy: req.user._id,
  });

  io.to("main").emit("session", session);

  res.status(201).json({
    status: "success",
    session,
  });
});

export const getSessions = expressAsyncHandler(async (req: any, res) => {
  const sessions = await Session.find().sort("-createdAt");
  res.status(200).json({
    status: "success",
    sessions,
  });
});

export const getSession = expressAsyncHandler(async (req: any, res) => {
  const session = await Session.findById(req.params.id).populate({
    path: "questions.askedBy",
  });
  res.status(200).json({
    status: "success",
    session,
  });
});

export const deleteSession = expressAsyncHandler(async (req: any, res) => {
  await Session.findByIdAndDelete(req.params.id);
  res.status(204).json({
    status: "success",
  });
});

export const toggleLock = expressAsyncHandler(async (req: any, res) => {
  const session = await Session.findById(req.params.id);
  if (!session) {
    res.status(404).json({
      status: "fail",
      message: "Session not found",
    });
    return;
  }
  session.locked = !session.locked;
  await session.save();

  io.to(session.id).emit("lock", session.locked);

  res.status(200).json({
    status: "success",
    session,
  });
});

export const changeVote = expressAsyncHandler(async (req: any, res) => {
  const { questionId, sessionId } = req.params;
  const session = req.session;
  let upVoted = false;
  session.questions.forEach((question: any) => {
    if (question._id == questionId) {
      if (question.upVotes.includes(req.user._id)) {
        question.upVotes.pull(req.user._id);
        upVoted = false;
      } else {
        question.upVotes.push(req.user._id);
        upVoted = true;
      }
    }
  });
  console.log(session.id, "asda");
  io.to(session.id).emit("vote", { session, upVoted });

  await session.save();
  res.status(200).json({
    status: "success",
    session,
    upVoted,
  });
});
