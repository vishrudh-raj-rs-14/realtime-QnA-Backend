"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const connectDatabase_1 = __importDefault(require("./utils/connectDatabase"));
const userRouter_1 = __importDefault(require("./routes/userRouter"));
const http_1 = __importDefault(require("http"));
const errorHandler_1 = require("./middleware/errorHandler");
const userController_1 = require("./controllers/userController");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const sessionRoutes_1 = __importDefault(require("./routes/sessionRoutes"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const socket_io_1 = require("socket.io");
const socketio = require("socket.io");
dotenv_1.default.config();
(0, connectDatabase_1.default)(process.env.DATABASE_NAME);
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL,
        credentials: true,
    },
});
exports.io = io;
app.use((0, cors_1.default)({
    origin: ["http://localhost:5173", process.env.FRONTEND_URL],
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
const port = process.env.PORT || 3000;
app.use("/api/users", userRouter_1.default);
app.use("/api/sessions", sessionRoutes_1.default);
app.use("/test", userController_1.protect, (0, userController_1.restricTo)("ADMIN"), (req, res) => {
    res.status(200).json({
        status: "success",
        message: "Protected route",
    });
});
app.use(errorHandler_1.notFoundErr);
app.use(errorHandler_1.errorHandler);
io.use((socket, next) => {
    var _a;
    const cokkieString = (_a = socket.request.headers.cookie) === null || _a === void 0 ? void 0 : _a.split(";").filter((x) => x.includes("qna"));
    if (cokkieString === null || cokkieString === void 0 ? void 0 : cokkieString.length) {
        const cookie = cokkieString[0].split("=")[1];
        const decoded = jsonwebtoken_1.default.verify(cookie, process.env.JWT_SECRET);
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
