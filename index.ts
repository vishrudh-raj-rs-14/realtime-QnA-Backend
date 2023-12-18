import express from "express";
import dotenv from "dotenv";
import connectDatabase from "./utils/connectDatabase";
import userRouter from "./routes/userRouter";
import { errorHandler, notFoundErr } from "./middleware/errorHandler";
import { protect, restricTo } from "./controllers/userController";
import cookieParser from "cookie-parser";
dotenv.config();

connectDatabase(process.env.DATABASE_NAME as string);
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const port = process.env.PORT || 3000;

app.use("/api/users", userRouter);

app.use("/test", protect, restricTo("ADMIN"), (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Protected route",
  });
});

app.use(notFoundErr);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
