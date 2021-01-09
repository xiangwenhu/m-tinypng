#!/usr/bin/env node
import path from "path";

import commander from "commander";
import globby from "globby";
import axios from "axios";
import fs from "fs-extra";

import * as utils from "./utils";
import { bitToKB } from "./utils";

const exts = ['.jpg', '.png'];
const headers = {
    rejectUnauthorized: false,
    'Postman-Token': Date.now(),
    'Cache-Control': 'no-cache',
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent':
        'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36'
}

const cwd = process.cwd();

commander
    .option('-p, --patterns <patterns>', "patterns")
    .option('-d, --dist <dist>', "dist dir", "./dist")
    .option('-mz, --maxsize <maxsize>', "max size", '5200000')
    .option('-gi, --gitignore <gitignore>', "gitignore", '1')
    .parse(process.argv);


// patterns 和 dist成对， 如果dist少于patterns, 复用最后一个
const patterns: string[] = (commander.patterns ? commander.patterns : "./").split(",");
const dist: string[] = commander.dist.split(",");

const maxSize = Math.min(5200000, +commander.maxsize);
const gitignore = commander.gitignore == '0' ? false : true;

console.log(`patterns: ${patterns}`);
console.log(`dist: ${dist}`);
console.log(`maxSize: ${maxSize}`);

async function startTiny() {
    try {

        patterns.forEach(async (pattern, index) => {

            const sourceDir = utils.ensureCh(pattern);
            const distDir = dist[index] || dist[dist.length - 1];

            const globbyPattern = sourceDir + "**/*.*";

            // console.log("--------")
            // console.log("distPath", distDir);
            // console.log("sourcePath", sourceDir);

            // console.log("globbyPattern", globbyPattern);
            // console.log("--------")

            const paths = await globby(globbyPattern, {
                gitignore,
                expandDirectories: {
                    files: exts.map(ext => `*${ext}`),
                    extensions: ["png", "jpg"]
                }
            });     

            for (let i = 0; i < paths.length; i++) {
                tiny(paths[i], sourceDir, distDir);
            }
        })



    } catch (err) {
        console.log("tinypng error", err);
    }
}

async function checkFile(pathStr: string) {

    const fullPath = path.join(cwd, pathStr);

    const stats = await fs.stat(fullPath);

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
    if (!exts.includes(path.extname(pathStr))) {
        console.log(pathStr, `:${path.extname(pathStr)} is not supported`);
        return false;
    }

    return true;
}

async function tiny(pathStr: string, sourceDir, distDir: string) {
    try {


        const distPath = path.join(cwd, distDir, path.join(cwd, pathStr).replace(path.join(cwd, sourceDir), ''));

        // console.log("===", pathStr, distDir, distPath);

        const invalidFile = await checkFile(pathStr);

        if (!invalidFile) {
            return;
        }

        const file = await fs.readFile(path.join(cwd, pathStr));

        const res = await axios.post("https://tinypng.com/web/shrink", file, {
            headers: {
                ...headers,
                'X-Forwarded-For': utils.getRandomIP()
            }
        });
     
        console.log(pathStr, `${bitToKB(res.data.input.size)} kb=> ${bitToKB(res.data.output.size)} kb`);

        const downloadUrl = res.data.output.url;

        const resStream = await axios.get(downloadUrl, {
            responseType: 'stream'
        });

        const pDir = path.dirname(distPath);

        console.log(cwd, pathStr, distPath);

        const pathExists = await fs.pathExists(pDir);

        if (!pathExists) {
            await fs.mkdir(pDir, {
                recursive: true
            })
        }

        resStream.data.pipe(fs.createWriteStream(distPath));

    } catch (err) {
        console.log(`${pathStr} error`, err.message || "unkown error")
    }
}

startTiny();

process.on("exit", () => {
    console.log("\t\n\r");
    console.log("tiny completed");
})
