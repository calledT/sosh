# Social Share
<img src="http://ww2.sinaimg.cn/bmiddle/68250c36gw1f0ldd5cq15j208w0dcmxr.jpg" alt="Mobile screenshot" height="160" title="Mobile screenshot">
<img src="http://ww3.sinaimg.cn/large/68250c36gw1f0ldd690ftj20dc08waaj.jpg" alt="PC screenshot" width="240" title="PC screenshot">

## 特性
* 使用iconfont当图标，容易自定义样式
* 样式打包在脚本里，减少http请求
* 支持初始化的时候传参或者使用`data-`属性传参数，后者优先级高
* PC端支持IE7以上浏览器,除了[qrcode](https://github.com/davidshimjs/qrcodejs)外，无其他库依赖
* 移动端支持微信、QQ、微博的原生应用分享(借用UC浏览器或者QQ浏览器进行)
* 移动端gzip之后仅5kb,PC端也仅10kb

### PC端(sosh.js)

#### 参数说明

1. `Sosh`构造函数第一个参数为字符串，代表selector，支持id和类名两种形式，如`#id`或者`.classname`
2. `Sosh`构造函数第二个参数对象字面量，代表分享组件初始化的配置
    - `url` 分享的地址，默认值为网页当前的地址 
    - `title` 分享的标题，默认值为当前网页`title`元素的内容
    - `digest` 分享的描述，默认值为当前网页`<meta name="description">`元素的content
    - `pic` 分享的图片，默认值为当前网页第一个`img`元素的图片地址
    - `sites` 页面上显示分享的网站，为数组类型，默认值为`['weixin', 'weibo', 'yixin', 'qzone']`

#### 使用说明
插入以下js引用到body标签结束前，默认初始化拥有类名`sosh`的元素
```html
<script src="dist/sosh.js"></script>
```

初始化的时候传参
```javascript
new Sosh('.sosh', {title: 'socail share', sites: ['weixin', 'weibo', 'yixin']})
```

也支持使用dataset进行配置,dataset配置优先级比函数参数高
```html
<div class="sosh" data-title="social share" data-site='weixin,weibo,yixin'></div>
```


### 移动端(msosh.js)

#### 参数说明
1. `Msosh`构造函数第一个参数为字符串，代表selector，支持`querySelectorAll`所支持的参数类型
2. `Msosh`构造函数第二个参数对象字面量，代表分享组件初始化的配置
    - `url` 分享的地址，默认值为网页当前的地址 
    - `title` 分享的标题，默认值为当前网页`title`元素的内容
    - `digest` 分享的描述，默认值为当前网页`<meta name="description">`元素的content
    - `pic` 分享的图片，默认值为当前网页第一个`img`元素的图片地址
    - `sites` 页面上显示分享的网站，为数组类型，默认值为`[weixin', 'weixintimeline', 'yixin', 'weibo', 'qq', 'qzone]`
    
#### 使用说明
插入以下js引用到body标签结束前
```html
<script src="dist/msosh.js"></script>
```
然后使用构造函数进行初始化,同样支持使用dataset进行配置
```javascript
var share = new Msosh('.msosh', {title: 'socail share', sites: ['weixin', 'weixintimeline', 'qq', 'qzone', 'weibo']);
```
在初始化之后，可以使用`share.popIn()`函数弹出分享网站列表浮层，调用这个函数的时候依然可以配置分享的参数和显示的网站，但配置仅在第一次调用的时候生效。

在UC浏览器和QQ浏览器里支持唤起微信、QQ、微博客户端进行分享。其他浏览器里支持唤起QQ客户端的分享，微博分享使用webapi进行，而微信分享需要借用QQ浏览器进行，如果用户没有安装，则点击无反应。

## 样式
因为CSS打包在js里所以无需另外引用，但是由于图标使用iconfont，所以还需要把图标放在网页能请求到的地方，当然也可以自定义优先级更高的样式覆盖默认的样式。

## License

MIT © calledT
