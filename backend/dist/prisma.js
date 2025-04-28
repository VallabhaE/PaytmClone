"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SECRET = void 0;
const client_1 = require("@prisma/client");
const PrismaCl = new client_1.PrismaClient();
exports.default = PrismaCl;
exports.SECRET = "!@#$%^&*()";
