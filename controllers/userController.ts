import expressAsyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/userModel";

const login = expressAsyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  console.log(user, password);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401).json({
      status: "fail",
      message: "Invalid email or password",
    });
    return;
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, {
    expiresIn: "30d",
  });

  res
    .status(200)
    .cookie("ospbl", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
    })
    .json({
      status: "success",
      user,
    });
});

const register = expressAsyncHandler(async (req, res) => {
  const { name, email, password, confirmPassword, role, mobileNo } = req.body;
  if (password !== confirmPassword) {
    res.status(400).json({
      status: "fail",
      message: "Passwords do not match",
    });
  }
  if (role == "ADMIN") {
    res.status(400).json({
      status: "fail",
      message: "Cannot register as admin",
    });
  }
  const checkExists = await User.findOne({ email });
  if (checkExists) {
    console.log(checkExists);
    res.status(400).json({
      status: "fail",
      message: "User already exists",
    });
  }
  const user = await User.create({ name, email, password, mobileNo });
  if (process.env.ENV != "DEV") {
    user.password = "";
  }
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, {
    expiresIn: "30d",
  });
  res
    .status(201)
    .cookie("ospbl", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV != "DEV",
    })
    .json({
      status: "success",
      user,
    });
});

const logout = expressAsyncHandler(async (req, res) => {
  res
    .status(200)
    .cookie("ospbl", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV != "DEV",
      expires: new Date(0),
    })
    .json({
      status: "success",
    });
});

const protect = expressAsyncHandler(async (req: any, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (req.cookies.ospbl) {
    token = req.cookies.ospbl;
  }
  if (!token) {
    res.status(401).json({
      status: "fail",
      message: "Not authorized, no token",
    });
  }
  const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
  req.user = await User.findById(decoded.id).select("-password");
  next();
});

const restricTo = (...roles: string[]) => {
  return (req: any, res: any, next: any) => {
    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        status: "fail",
        message: "You do not have permission to perform this action",
      });
    }
    next();
  };
};

export { login, register, logout, protect, restricTo };
