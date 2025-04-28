"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FailedAny = FailedAny;
exports.Success = Success;
exports.SuccessAny = SuccessAny;
function Success(msg) {
    return {
        status: true,
        msg
    };
}
function SuccessAny(msg) {
    return {
        status: true,
        msg
    };
}
function FailedAny(msg) {
    return {
        status: false,
        msg
    };
}
