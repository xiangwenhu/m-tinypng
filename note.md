### 如何不发布测试你的包

* copy你的build后的文件到测试目录
```
    [test-folder] 
        node_modules
            [your-test-module]

```

* 使用 cmd-shim 创建shim

```js
cmdShim(toModulesPath("m-tinypng/lib/index.js"), toModulesPath(".bin/tinypng"), (err) => {
    // shims are created!
    console.log("err", err);
})
```