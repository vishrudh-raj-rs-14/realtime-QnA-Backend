import expressAsyncHandler from "express-async-handler";
import Session from "../models/sessionModel";
import zod from "zod";
import User from "../models/userModel";
import { io } from "..";

function formatDateTime(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  };

  return new Intl.DateTimeFormat("en-US", options).format(date);
}

export const checkIfSessionExpired = expressAsyncHandler(
  async (req: any, res, next) => {
    const sessionId = req.params.id;
    const session = await Session.findById(sessionId).populate({
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
  }
);

export const createOne = expressAsyncHandler(async (req: any, res) => {
  const session = req.session;
  const lastQuestionAt = req.user.lastQuestionAt;
  if (lastQuestionAt) {
    const timeDiff = new Date().getTime() - lastQuestionAt.getTime();
    if (timeDiff < 30000 && req.user.role != "ADMIN") {
      res.status(429).json({
        status: "fail",
        message: `You can only create a question every 30 seconds. Please wait for ${formatDateTime(
          new Date(lastQuestionAt.getTime() + 30000)
        )}`,
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
  let newQuestion: any = await Session.findByIdAndUpdate(
    session._id,
    {
      $push: {
        questions: {
          question,
          askedBy: req.user._id,
        },
      },
    },
    {
      new: true,
    }
  );

  const newUser = await User.findByIdAndUpdate(req.user._id, {
    lastQuestionAt: new Date(),
  });

  const updatedSession = await Session.findById(session._id).populate({
    path: "questions.askedBy",
  });

  io.to(session.id).emit("question", updatedSession);

  res.status(201).json({
    status: "success",
    session: updatedSession,
  });
});
