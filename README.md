## 特性

- 针对PC和手机分为两个版本，移动版gzip之后仅5kb，PC版也仅10kb
- 仅需调用`sosh.js`或者`msosh.js`，无其他库依赖
- PC版支持IE7以上浏览器
- 移动端支持`微信`,`QQ`,`微博`的原生应用分享(借用UC浏览器或者QQ浏览器或者URL scheme进行)
- 样式包含在脚本里，减少http请求
- 使用iconfont当图标
- 支持使用`dataset`配置

## PC版（sosh.js)

### 默认初始化
`Sosh`默认初始化带有类名`sosh`的元素，所以只需简单的两行代码就可以用上分享

```html
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

## 移动版（msosh.js）

### 使用构造函数初始化
移动版的构造函数为`Msosh`，移动版不会进行默认的初始化调用，需要手动初始化，构造函数的参数和PC版类似，第一个参数代表`selector`，支持`querySelectorAll`所支持的参数类型，第二个参数配置分享相关的内容。同样也支持使用`dataset`配置。

```html
<div class="msosh"></div>
<script src="dist/msosh.min.js"></script>
<script>
	var msosh = new Msosh('.msosh', {
		// 默认显示的网站为以下六个个,支持设置的网站有
		// weixin,weixintimeline,qq,qzone,yixin,weibo,tqq,renren,douban,tieba
		sites: ['weixin', 'weixintimeline', 'yixin', 'weibo', 'qq', 'qzone']
	});

	// 初始化过后可以调用popIn函数来弹出分享窗口，一般用来做更多分享的用途
	// 在第一个调用这个函数的时候可以传入配置参数，不传则使用初始化时
	// 所使用的配置，参数仅在第一个调用的时候生效。
	msosh.popIn({
		sites: ['weixin', 'weixintimeline', 'yixin', 'weibo', 'qq', 'qzone', 'tqq', 'renren', 'teiba']
	})
</script>
```

在微信里点击微信分享会在右上角浮出分享操作的提示，也可以手动调用`Msosh.wxShareTip()`函数，此函数仅在微信里生效。

在UC浏览器和QQ浏览器里支持唤起微信、QQ、微博客户端进行分享。其他浏览器里支持唤起QQ客户端的分享，微博分享使用webapi进行，而微信分享需要借用QQ浏览器进行，如果用户没有安装，则点击无反应。


