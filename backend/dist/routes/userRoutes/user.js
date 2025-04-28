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
exports.UserRouter = void 0;
const express_1 = require("express");
const zod_1 = __importDefault(require("zod"));
const responseModels_1 = require("../../models/responseModels");
const prisma_1 = __importStar(require("../../prisma"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const signInSchema = zod_1.default.object({
    username: zod_1.default.string().min(5),
    password: zod_1.default.string().min(5)
});
const signUpSchema = zod_1.default.object({
    username: zod_1.default.string().min(5),
    password: zod_1.default.string().min(5),
    phoneNumber: zod_1.default.string().length(10),
    email: zod_1.default.string().email()
});
const UserRouter = (0, express_1.Router)();
exports.UserRouter = UserRouter;
UserRouter.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const body = signInSchema.parse(req.body);
        const username = body.username;
        const password = body.password;
        const user = yield prisma_1.default.user.findFirst({
            where: {
                password: password,
                username: username
            }
        });
        const signature = jsonwebtoken_1.default.sign({
            userId: user === null || user === void 0 ? void 0 : user.id
        }, prisma_1.SECRET);
        res.status(200).send((0, responseModels_1.SuccessAny)({
            msg: "User Found With Bank Balane is " + (user === null || user === void 0 ? void 0 : user.BankBalance),
            username: user === null || user === void 0 ? void 0 : user.username,
            email: user === null || user === void 0 ? void 0 : user.email,
            balance: user === null || user === void 0 ? void 0 : user.BankBalance,
            payload: signature
        }));
    }
    catch (err) {
        res.status(200).send((0, responseModels_1.FailedAny)(err));
    }
}));
UserRouter.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const body = signUpSchema.parse(req.body);
        const username = body.username;
        const email = body.email;
        const phoneNumber = body.phoneNumber;
        const password = body.password;
        const user = yield prisma_1.default.user.create({
            data: {
                email: email,
                username: username,
                password: password,
                BankBalance: 0
            },
        });
        res.status(200).json((0, responseModels_1.Success)(user.email + "Has been created Successfully with bank balance " + user.BankBalance));
    }
    catch (err) {
        res.status(400).json((0, responseModels_1.FailedAny)(err));
    }
}));
