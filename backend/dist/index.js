"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_1 = require("./routes/userRoutes/user");
const ws_1 = require("ws");
const http_1 = require("http");
const bank_1 = require("./routes/bankRoutes/bank");
const cors_1 = __importDefault(require("cors"));
let mp = new Map();
const app = (0, express_1.default)();
const wss1 = new ws_1.WebSocketServer({ noServer: true });
const server = (0, http_1.createServer)(app);
wss1.on('connection', function connection(ws) {
    ws.on('error', console.error);
    ws.on("message", (message) => {
        var _a;
        const parsedMessage = JSON.parse(message);
        if (parsedMessage.type === "init") {
            mp.set(parsedMessage.id, ws);
        }
        else if (parsedMessage.type === "message") {
            (_a = mp.get(parsedMessage.senderId)) === null || _a === void 0 ? void 0 : _a.send(parsedMessage);
            // const create = async ()=>{
            //     await PrismaCl.messages.create({
            //         data: {
            //             senderId: parseInt(parsedMessage.senderId,10),
            //             receiverId: parseInt(parsedMessage.senderId),
            //             message: parsedMessage.message
            //         }
            //     })
            // }
            // PrismaCl.messages.create({
            //     data: {
            //         userId: parsedMessage.receiverId,
            //         message: parsedMessage.message
            //     }
            // })
        }
    });
});
server.on('upgrade', (request, socket, head) => {
    wss1.handleUpgrade(request, socket, head, (ws) => {
        wss1.emit('connection', ws, request);
    });
});
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use("/api/v1/user", user_1.UserRouter);
app.use("/api/v1/bank", bank_1.BankRouter);
app.listen(3000, () => {
    console.log("listening....");
});
