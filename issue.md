### node_modules .bin 目录哪里来的
https://www.zhihu.com/question/333901187


### 如何创建 node_modules .bin 链接
```js
cmdShim(toModulesPath("m-tinypng/lib/index.js"), toModulesPath(".bin/tinypng"), (err) => {
    // shims are created!
    console.log("err", err);
})
```

这波骚操作之后，你就可以不发布你的npm包，而进行测试