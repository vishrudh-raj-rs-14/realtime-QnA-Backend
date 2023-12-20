"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const userSchema = new mongoose_1.default.Schema({
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
    lastQuestionAt: {
        type: Date,
        default: null,
    },
    role: {
        type: String,
        enum: ["USER", "ADMIN"],
        default: "USER",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});
userSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.isModified("password")) {
            next();
        }
        this.password = yield bcrypt_1.default.hash(this.password, 10);
        next();
    });
});
userSchema.methods.matchPassword = (given, actual) => __awaiter(void 0, void 0, void 0, function* () {
    return yield bcrypt_1.default.compare(given, actual);
});
const User = mongoose_1.default.model("User", userSchema);
exports.default = User;
