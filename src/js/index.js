// Shim For Webpack Addstyle
if(!Function.prototype.bind){
  Function.prototype.bind = function(){
    var fn = this,
    args = [].slice.call(arguments),
    object = args.shift();
    return function(){
      return fn.apply(object,args.concat([].slice.call(arguments)));
    }
  }
}

if (!Array.prototype.filter){
  Array.prototype.filter = function(fun /*, thisp*/){
    var len = this.length;
    if (typeof fun != "function") throw new TypeError();
    var res = new Array();
    var thisp = arguments[1];
    for (var i = 0; i < len; i++){
      if (i in this){
        var val = this[i]; // in case fun mutates this
        if (fun.call(thisp, val, i, this)) res.push(val);
      }
    }
    return res;
  }
}

require('../scss/index');
var extend = require('xtend');
var classlist = require('easy-classlist');
var QRCode = require('./qrcode');
var sitesObj = require('./sites');

var doc = document;
var body = doc.body;
var docElem = doc.documentElement;
var datasetRegexp = /^data\-(.+)$/i;
var templateStr =
  '<div class="sosh-item {{site}}" data-site="{{site}}" title="分享到{{name}}">' +
    '<span class="sosh-item-icon">' +
      '<img src="{{icon}}" alt="{{name}}">' +
    '</span>' +
    '<span class="sosh-item-text">{{name}}</span>' +
  '</div>';

// Sosh Default Configs
var metaDesc = doc.getElementsByName('description')[0];
var firstImg = doc.getElementsByTagName('img')[0];
var defaults = {
  'title': doc.title,
  'url': location.href,
  'digest': metaDesc && metaDesc.content || '',
  'pic': firstImg && firstImg.src || '',
  'sites': ['weixin', 'weibo', 'yixin', 'qzone']
};

var pop = doc.createElement('div');
pop.className = 'sosh-pop';
pop.innerHTML =
  '<div class="sosh-qrcode-pic"></div>' +
  '<div class="sosh-qrcode-text">用微信扫描二维码<br>分享至好友和朋友圈</div>' +
  '<a href="javascript:;" target="_self" class="sosh-pop-close">&#10799;</a>';

body.appendChild(pop);

var qrcodePic = $('.sosh-qrcode-pic')[0];
var qrcodeClose = $('.sosh-pop-close')[0];

// 初始化二维码
var qrcode = new QRCode(qrcodePic, {
  text: location.href,
  width: 120,
  height: 120
});

// 二维码扫码弹窗添加关闭事件
addEvent(qrcodeClose, 'click', function() {
  classlist(pop).remove('sosh-pop-show');
});

var sosh = function(selector, opts) {
  if (typeof selector === 'string') {
    var elems = $(selector);
    for(var i = 0, length = elems.length; i < length; i++) {
      var elem = elems[i];
      var status = elem.getAttribute('sosh-status');

      if (status !== 'initialized') {
        var config = extend(defaults, opts, parseDataset(elem));

        elem.innerHTML = getSitesHtml(config.sites);

        handlerClick(elem, config);

        elem.setAttribute('sosh-status', 'initialized');

        classlist(elem).add('sosh');
      }
    }
  }
}

/**
 * 分享按钮点击事件处理函数
 * @param  {Element} agent    [初始化分享组件元素]
 * @param  {Object} shareData [分享的数据]
 */
function handlerClick(agent, shareData) {
  delegate(agent, 'sosh-item', 'click', function() {
    var api = sitesObj[this.getAttribute('data-site')].api;
    if (api) {
      for(var k in shareData) {
        api = api.replace(new RegExp('{{' + k + '}}', 'g'), encodeURIComponent(shareData[k]));
      }
      window.open(api, '_blank');
    } else {
      // 微信弹出二维码扫码气泡
      if(classlist(this).contains('weixin')) {
        var offset = getOffsetRect(this);
        pop.style.top = offset.top + this.offsetHeight + 10 + 'px';
        pop.style.left = offset.left + 'px';
        classlist(pop).add('sosh-pop-show');

        // 重新渲染二维码
        qrcode.clear();
        qrcode.makeCode(shareData.url);
      }
    }
  });
}

/**
 * 简易选择器
 * @param  {String} selector [ID或者单个类名选择器]
 * @return {Array}          [元素数组]
 */
function $(selector) {
  var str = selector.substr(1);

  if (selector.indexOf('#') === 0) {
    var elem = doc.getElementById(str);
    return elem ? [elem] : [];
  }

  return getElementsByClassName(str);
}

/**
 * 通过选择器的classname获取元素数组
 * @param  {String} classname [类名]
 * @return {Array}            [元素数组]
 */
function getElementsByClassName(classname) {
  var elements;
  var pattern;
  var i;
  var results = [];

  if (doc.querySelectorAll) { // IE8
    return doc.querySelectorAll('.' + classname);
  }

  if (doc.evaluate) { // IE6, IE7
    pattern = './/*[contains(concat(" ", @class, " "), " " + classname + " ")]';
    elements = doc.evaluate(pattern, d, null, 0, null);
    while ((i = elements.iterateNext())) {
      results.push(i);
    }
  } else {
    elements = doc.getElementsByTagName('*');
    pattern = new RegExp('(^|\\s)' + classname + '(\\s|$)');
    for (var i = 0, length = elements.length; i < length; i++) {
      if (pattern.test(elements[i].className)) {
        results.push(elements[i]);
      }
    }
  }

  return results;
}

/**
 * 解析元素的[data-*]属性成hashmap对象
 * @param  {Element} elem [html元素]
 * @return {Object}
 */
function parseDataset(elem) {
  var dataset = {};
  var attrs = elem.attributes;
  for (var i = 0, length = attrs.length; i < length; i++){
    var attr = attrs[i];
    var attrName = attr.nodeName;

    if(datasetRegexp.test(attrName)) {
      dataset[attrName.replace(datasetRegexp, '$1')] = attr.nodeValue;
    }

    if(attrName === 'data-sites') {
      dataset['sites'] = attr.nodeValue.split(',');
    }
  }
  return dataset;
}

/**
 * 转换sites对象配置为html字符串
 * @param  {Object} sites [分享站点配置]
 * @return {string}       [html字符串]
 */
function getSitesHtml(sites) {
  var html = '';
  for(var i = 0, length = sites.length; i < length; i++) {
    var key = sites[i];
    var siteObj = sitesObj[key];
    if (siteObj) {
      html += templateStr
        .replace(/\{\{site\}\}/g, key)
        .replace(/\{\{icon\}\}/g, siteObj.icon)
        .replace(/\{\{name\}\}/g, siteObj.name);
    } else {
      console.warn('site [' + key + '] not exist.');
    }
  }
  return html;
}

/**
 * 事件绑定
 * @param {Element}   elem [html元素]
 * @param {String}   event [事件名称]
 * @param {Function} fn    [事件处理函数]
 */
function addEvent(elem, event, fn) {
  if (elem.addEventListener) {
    return elem.addEventListener(event, fn, false);
  } else {
    return elem.attachEvent('on'+event, function(){fn.call(elem)});
  }
}

/**
 * 事件委托
 * @param  {Element}   agent    [被委托的html元素]
 * @param  {String}   classname [类名]
 * @param  {String}   event     [事件名称]
 * @param  {Function} fn        [事件处理函数]
 */
function delegate(agent, classname, event, fn) {
  addEvent(agent, event, function(e) {
    e = e || window.event;
    var target = e.target || e.srcElement;
    while (target && target !== this) {
      if (classlist(target).contains(classname)) {
        typeof fn === 'function' && fn.call(target, e);
        return;
      }
      target = target.parentNode;
    }
  });
}

/**
 * 获取html元素的左上角位置数值
 * @param  {Element} elem [html元素]
 * @return {Object}      [带有top和left属性的对象]
 */
function getOffsetRect(elem) {
  var box = elem.getBoundingClientRect()

  var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
  var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;

  var clientTop = docElem.clientTop || body.clientTop || 0;
  var clientLeft = docElem.clientLeft || body.clientLeft || 0;

  var top  = box.top +  scrollTop - clientTop;
  var left = box.left + scrollLeft - clientLeft;

  return {
    top: Math.round(top),
    left: Math.round(left)
  };
}

module.exports = sosh;
