"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const questionSchema = new mongoose_1.default.Schema({
    question: {
        type: String,
        required: [true, "Please enter your question"],
        maxLength: [100, "Your question cannot exceed 100 characters"],
    },
    upVotes: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    askedBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
    },
});
const sessionSchema = new mongoose_1.default.Schema({
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
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
    },
    expiresAt: {
        type: Date,
        default: () => Date.now() + 3 * 60 * 60 * 1000, // Expires in 2 hours
    },
});
const Session = mongoose_1.default.model("Session", sessionSchema);
exports.default = Session;
