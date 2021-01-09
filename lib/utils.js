"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureCh = exports.bitToKB = exports.getRandomIP = void 0;
function getRandomIP() {
    return Array.from(Array(4)).map(() => parseInt(Math.random() * 255 + '')).join('.');
}
exports.getRandomIP = getRandomIP;
function bitToKB(bit) {
    return (bit / 1024).toFixed(2);
}
exports.bitToKB = bitToKB;
function ensureCh(str, ch = "/") {
    if (str.endsWith(ch)) {
        return str;
    }
    return `${str}${ch}`;
}
exports.ensureCh = ensureCh;
