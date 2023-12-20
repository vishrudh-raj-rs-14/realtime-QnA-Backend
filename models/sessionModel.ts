import e from "express";
import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, "Please enter your question"],
    maxLength: [100, "Your question cannot exceed 100 characters"],
  },
  upVotes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  askedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const sessionSchema = new mongoose.Schema({
  createdAt: {
    type: Date,
    default: Date.now,
  },
  questions: [questionSchema],
  locked: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  expiresAt: {
    type: Date,
    default: () => Date.now() + 3 * 60 * 60 * 1000, // Expires in 2 hours
  },
});

const Session = mongoose.model("Session", sessionSchema);

export default Session;
