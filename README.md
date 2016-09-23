# Social Share

## 特性

- 仅需调用`sosh.js`，无其他库依赖
- 支持IE7以上浏览器
- 支持使用`dataset`配置

### 默认初始化
`Sosh`默认初始化带有类名`sosh`的元素，所以只需简单的三行代码就可以用上分享

```html
<link rel="stylesheet" href="dist/sosh.min.css">
<div class="sosh"></div>
<script src="dist/sosh.min.js"></script>
```

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

除了能在构造函数初始化的时候进行参数配置外，也可以用`[data-*]`的方式进行配置，并且优先级高于函数参数

```html
<div class="pcdataset" data-title="分享标题" data-sites="yixin,weibo,weixin,tqq,qzone"></div>
<script>
  new Sosh('.pcdataset', {
    sites: ['weixin,', 'weibo', 'yixin', 'qzone']
  })
</script>
```

## License

MIT © calledT
