"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.BankRouter = void 0;
const prisma_1 = __importStar(require("../../prisma"));
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const responseModels_1 = require("../../models/responseModels");
const BankRouter = (0, express_1.Router)();
exports.BankRouter = BankRouter;
const authenticate = (req, res, next) => {
    var _a;
    const token = (_a = req.headers['authorization']) === null || _a === void 0 ? void 0 : _a.split(' ')[1]; // 'Bearer <token>'
    if (!token) {
        res.status(401).json({ message: 'No token provided' });
        return;
    }
    // Step 2: Verify the token
    try {
        const ver = jsonwebtoken_1.default.verify(token, prisma_1.SECRET); // Verify the token
        if (typeof ver !== 'string') {
            req.headers.id = ver.userId;
            console.log(ver.userId);
            next();
        }
    }
    catch (err) {
        console.error('Invalid token:', err);
    }
};
BankRouter.get("/get-user-info", authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield prisma_1.default.user.findFirst({
            where: {
                id: parseInt(req.headers.id, 10),
            },
            include: {
                notif: true
            }
        });
        res.status(200).send((0, responseModels_1.SuccessAny)({
            msg: "User Found With Bank Balane is " + (user === null || user === void 0 ? void 0 : user.BankBalance),
            username: user === null || user === void 0 ? void 0 : user.username,
            email: user === null || user === void 0 ? void 0 : user.email,
            balance: user === null || user === void 0 ? void 0 : user.BankBalance,
            notif: user === null || user === void 0 ? void 0 : user.notif
        }));
    }
    catch (err) {
        res.status(200).send((0, responseModels_1.FailedAny)(err));
    }
}));
BankRouter.post("/get-filter", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const search = req.body.search;
    try {
        const users = yield prisma_1.default.user.findMany({
            where: {
                username: {
                    contains: search,
                }
            },
            select: {
                id: true,
                username: true,
                email: true,
            }
        });
        res.status(200).send((0, responseModels_1.SuccessAny)({
            msg: "Available Data",
            users: users
        }));
    }
    catch (err) {
        res.status(200).send((0, responseModels_1.FailedAny)(err));
    }
}));
BankRouter.post("/pay", authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const receiverId = parseInt(req.body.receiverId);
    const senderId = parseInt(req.headers.id);
    const amount = parseInt(req.body.amount);
    if (isNaN(receiverId) || isNaN(senderId) || isNaN(amount)) {
        res.status(400).send({ message: "Invalid input" });
        return;
    }
    try {
        const sender = yield prisma_1.default.user.findFirst({
            where: {
                id: senderId
            }
        });
        if (sender) {
            if (sender.BankBalance < amount) {
                res.status(400).json((0, responseModels_1.FailedAny)("Not Enogh Balance" + sender.BankBalance));
                return;
            }
        }
        const transaction = yield prisma_1.default.$transaction([
            prisma_1.default.user.update({
                where: {
                    id: senderId
                },
                data: {
                    BankBalance: {
                        decrement: amount
                    }
                }
            }),
            prisma_1.default.user.update({
                where: {
                    id: receiverId
                },
                data: {
                    BankBalance: {
                        increment: amount
                    }
                }
            })
        ]);
        res.status(200).json((0, responseModels_1.Success)("Tranaction Successfull"));
    }
    catch (err) {
        res.status(400).json((0, responseModels_1.FailedAny)(err));
    }
}));
BankRouter.post('/messages', authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const receiverId = parseInt(req.headers.id, 10);
    const senderId = parseInt(req.body.senderId, 10);
    try {
        const messages = yield prisma_1.default.user.findFirst({
            where: {
                id: receiverId
            },
            include: {
                messages: true,
            }
        });
        const msgs = messages === null || messages === void 0 ? void 0 : messages.messages.filter(obj => obj.senderId == senderId);
        res.status(200).json((0, responseModels_1.SuccessAny)({
            msg: "Tranaction Successfull",
            data: msgs
        }));
    }
    catch (err) {
        res.status(400).json((0, responseModels_1.FailedAny)(err));
    }
}));
