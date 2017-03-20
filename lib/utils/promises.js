"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _delay = (milliSeconds) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => resolve(), milliSeconds);
    });
};
exports.delay = _delay;
