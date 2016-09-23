# Social Share

[移动版请查看](https://github.com/calledT/soshm)

## 特性

- 仅需调用`sosh.js`，无其他库依赖
- 支持IE7以上浏览器
- 支持微信分享使用二维码扫码
- 支持使用`dataset`配置
- 支持AMD、CommonJS和浏览器全局变量（使用UMD）
- 图标及样式打包在js里，无需额外请求

## 安装

通过npm进行安装

```shell
npm install -S sosh
```

或者把脚本引进你的页面里

```html
<script src="sosh.min.js"></script>
```

## 使用

`Sosh`默认初始化带有类名`sosh`的元素

### 使用构造函数初始化

使用`Sosh`构造函数进行初始化:

1. 第一个参数为字符串类型，代表选择器。支持简单的ID和Class两种形式，如：`#id`、`.classname`
2. 第二个参数为对象字面量，配置分享的相关内容

```html
<div id="soshid"></div>
<script>
  new Sosh('#soshid', {
    // 分享的链接，默认使用location.href
    url: '',
    // 分享的标题，默认使用document.title
    title: '',
    // 分享的摘要，默认使用<meta name="description" content="">content的值
    digest: '',
    // 分享的图片，默认获取本页面第一个img元素的src
    pic: '',
    // 选择要显示的分享站点，顺序同sites数组顺序，
    // 支持设置的站点有weixin,yixin,weibo,qzone,tqq,douban,renren,tieba
    sites: ['weixin,', 'weibo', 'yixin', 'qzone']
  })
</script>
```

### 使用dataset进行配置

除了能在构造函数初始化的时候进行参数配置外，也可以用`[data-*]`的方式进行配置，并且优先级高于函数参数。

```html
<div class="datasetconfig" data-title="分享标题" data-sites="yixin,weibo,weixin,tqq,qzone"></div>
<script>
  new Sosh('.datasetconfig', {
    sites: ['weixin,', 'weibo', 'yixin', 'qzone']
  })
</script>
```

## License

MIT © calledT
