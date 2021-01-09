import shelljs from "shelljs";
import path from "path";
import cmdShim from "cmd-shim";

function toPath(...paths: string[]) {
    return path.join(__dirname, ...paths);
}

function toModulesPath(...paths: string[]) {
    return toPath("./test/", "node_modules", ...paths);
}

// create test/node_modules
const modulesPath = toModulesPath("");


shelljs.rm("-rf", modulesPath);
shelljs.mkdir(toModulesPath(""));
shelljs.mkdir(toModulesPath("/m-tinypng"));
shelljs.mkdir(toModulesPath("/m-tinypng/lib"));

// copy package.json
shelljs.cp(toPath("package.json"), toModulesPath("m-tinypng/package.json"));


// copy lib
shelljs.cp("-R", toPath("lib/"), toModulesPath("m-tinypng"));

// shelljs.cd(toModulesPath("/m-tinypng"));

// test在其目录下，可以不安装, 自己会找父目录
// shelljs.exec("cnpm install");
// shelljs.exec("npm unlink");

cmdShim(toModulesPath("m-tinypng/lib/index.js"), toModulesPath(".bin/tinypng"), (err) => {
    // shims are created!
    console.log("err", err);
})