import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your name"],
    maxLength: [30, "Your name cannot exceed 30 characters"],
  },
  email: {
    type: String,
    required: [true, "Please enter your email"],
    unique: true,
    match: [
      // eslint-disable-next-line no-control-regex
      /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
      "Please enter a valid email address",
    ],
  },
  password: {
    type: String,
    required: [true, "Please enter your password"],
    minLength: [8, "Your password must be longer than 6 characters"],
    select: false,
  },
  role: {
    type: String,
    enum: ["USER", "ADMIN", "SECURITY", "GRADE-CHECKER"],
    default: "USER",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  mobileNo: {
    type: String,
    maxLength: [10, "Your mobile number cannot exceed 10 characters"],
    match: [/^[0-9]{10}$/, "Please enter a valid mobile number"],
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = async (given: string, actual: string) => {
  return await bcrypt.compare(given, actual);
};

const User = mongoose.model("User", userSchema);

export default User;
