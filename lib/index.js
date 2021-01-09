#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const path_1 = __importDefault(require("path"));
const commander_1 = __importDefault(require("commander"));
const globby_1 = __importDefault(require("globby"));
const axios_1 = __importDefault(require("axios"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const utils = __importStar(require("./utils"));
const utils_1 = require("./utils");
const exts = ['.jpg', '.png'];
const headers = {
    rejectUnauthorized: false,
    'Postman-Token': Date.now(),
    'Cache-Control': 'no-cache',
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36'
};
const cwd = process.cwd();
commander_1.default
    .option('-p, --patterns <patterns>', "patterns")
    .option('-d, --dist <dist>', "dist dir", "./dist")
    .option('-mz, --maxsize <maxsize>', "max size", '5200000')
    .option('-gi, --gitignore <gitignore>', "gitignore", '1')
    .parse(process.argv);
// patterns 和 dist成对， 如果dist少于patterns, 复用最后一个
const patterns = (commander_1.default.patterns ? commander_1.default.patterns : "./").split(",");
const dist = commander_1.default.dist.split(",");
const maxSize = Math.min(5200000, +commander_1.default.maxsize);
const gitignore = commander_1.default.gitignore == '0' ? false : true;
console.log(`patterns: ${patterns}`);
console.log(`dist: ${dist}`);
console.log(`maxSize: ${maxSize}`);
function startTiny() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            patterns.forEach((pattern, index) => __awaiter(this, void 0, void 0, function* () {
                const sourceDir = utils.ensureCh(pattern);
                const distDir = dist[index] || dist[dist.length - 1];
                const globbyPattern = sourceDir + "**/*.*";
                // console.log("--------")
                // console.log("distPath", distDir);
                // console.log("sourcePath", sourceDir);
                // console.log("globbyPattern", globbyPattern);
                // console.log("--------")
                const paths = yield globby_1.default(globbyPattern, {
                    gitignore,
                    expandDirectories: {
                        files: exts.map(ext => `*${ext}`),
                        extensions: ["png", "jpg"]
                    }
                });
                for (let i = 0; i < paths.length; i++) {
                    tiny(paths[i], sourceDir, distDir);
                }
            }));
        }
        catch (err) {
            console.log("tinypng error", err);
        }
    });
}
function checkFile(pathStr) {
    return __awaiter(this, void 0, void 0, function* () {
        const fullPath = path_1.default.join(cwd, pathStr);
        const stats = yield fs_extra_1.default.stat(fullPath);
        // 太大
        if (stats.size > maxSize) {
            console.log(pathStr, `:size larger than ${maxSize}`);
            return false;
        }
        // 不是文件
        if (!stats.isFile()) {
            console.log(pathStr, `:is not file`);
            return false;
        }
        // 格式不被支持
        if (!exts.includes(path_1.default.extname(pathStr))) {
            console.log(pathStr, `:${path_1.default.extname(pathStr)} is not supported`);
            return false;
        }
        return true;
    });
}
function tiny(pathStr, sourceDir, distDir) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const distPath = path_1.default.join(cwd, distDir, path_1.default.join(cwd, pathStr).replace(path_1.default.join(cwd, sourceDir), ''));
            // console.log("===", pathStr, distDir, distPath);
            const invalidFile = yield checkFile(pathStr);
            if (!invalidFile) {
                return;
            }
            const file = yield fs_extra_1.default.readFile(path_1.default.join(cwd, pathStr));
            const res = yield axios_1.default.post("https://tinypng.com/web/shrink", file, {
                headers: Object.assign(Object.assign({}, headers), { 'X-Forwarded-For': utils.getRandomIP() })
            });
            console.log(pathStr, `${utils_1.bitToKB(res.data.input.size)} kb=> ${utils_1.bitToKB(res.data.output.size)} kb`);
            const downloadUrl = res.data.output.url;
            const resStream = yield axios_1.default.get(downloadUrl, {
                responseType: 'stream'
            });
            const pDir = path_1.default.dirname(distPath);
            console.log(cwd, pathStr, distPath);
            const pathExists = yield fs_extra_1.default.pathExists(pDir);
            if (!pathExists) {
                yield fs_extra_1.default.mkdir(pDir, {
                    recursive: true
                });
            }
            resStream.data.pipe(fs_extra_1.default.createWriteStream(distPath));
        }
        catch (err) {
            console.log(`${pathStr} error`, err.message || "unkown error");
        }
    });
}
startTiny();
process.on("exit", () => {
    console.log("\t\n\r");
    console.log("tiny completed");
});
