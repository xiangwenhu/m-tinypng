
# 欢迎使用 m-tinypng

**m-tinypng 图片压缩工具 使用tinypng压缩**


## 特点
* 支持多目录
* 支持本地测试


## 安装

```bash
$ npm install m-tinypng -D
```

## 配置示例

参数：
* -p, --patterns 
  源路径，多个用,分割
* -d, --dist 
  目标路径，多个用,分割
* -mz, --maxsize
  文件最大大小，不能超过5M
* -gi, --gitignore
  是否忽略.gitignore里面的文件，默认值1


```json
{
     "scripts": {
        "tiny": "tinypng -p ./src/images,./src/pages/aaa,./src/pages/bbb -d ./dist/images,./dist/aaa,./dist/bbb"
    }
}
```



## Authors

-   huxw
