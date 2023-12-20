import express from "express";
import dotenv from "dotenv";
import connectDatabase from "./utils/connectDatabase";
import userRouter from "./routes/userRouter";
import http from "http";
import { errorHandler, notFoundErr } from "./middleware/errorHandler";
import { protect, restricTo } from "./controllers/userController";
import cookieParser from "cookie-parser";
import cors from "cors";
import sessionRouter from "./routes/sessionRoutes";
import jwt from "jsonwebtoken";
import { Server } from "socket.io";
const socketio = require("socket.io");
dotenv.config();

connectDatabase(process.env.DATABASE_NAME as string);
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
});
app.use(
  cors({
    origin: ["http://localhost:5173", process.env.FRONTEND_URL as string],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const port = process.env.PORT || 3000;

app.use("/api/users", userRouter);
app.use("/api/sessions", sessionRouter);

app.use("/test", protect, restricTo("ADMIN"), (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Protected route",
  });
});

app.use(notFoundErr);
app.use(errorHandler);

io.use((socket, next) => {
  const cokkieString = socket.request.headers.cookie
    ?.split(";")
    .filter((x) => x.includes("qna"));
  if (cokkieString?.length) {
    const cookie = cokkieString[0].split("=")[1];
    const decoded: any = jwt.verify(cookie, process.env.JWT_SECRET as string);
    next();
    return;
  }
  console.log("Error connecting");
  // console.log(JSON.parse(socket.request.headers.cookie as string));
  next(new Error("invalid"));
});

io.on("connection", (socket) => {
  console.log("-------------------");
  console.log(`Socket ${socket.id} connected`);
  console.log(socket.rooms);
  console.log("-------------------");

  socket.on("joinMain", (data) => {
    console.log("here");
    socket.join(String("main"));
    console.log("Joined main", socket.rooms);
  });

  socket.on("leaveMain", (data) => {
    socket.leave("main");
    console.log("Left main");
  });

  socket.on("joinSession", (data) => {
    socket.join(String(data.sessionId));
    console.log("Joined session", socket.rooms);
  });

  socket.on("leaveSession", (data) => {
    socket.leave(String(data.sessionId));
    console.log("Left session");
  });

  socket.on("disconnect", () => {
    console.log(`Socket ${socket.id} disconnected`);
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export { io };
