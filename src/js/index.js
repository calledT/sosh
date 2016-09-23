// shim
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
var QRCode = require('qrcode');
var extend = require('xtend');
var classlist = require('easy-classlist');

var doc = document;
var body = doc.body;
var docElem = doc.documentElement;
var hasOwn = Object.prototype.hasOwnProperty;
var metaDesc = doc.getElementsByName('description')[0];
var firstImg = doc.getElementsByTagName('img')[0];
var datasetRegexp = /^data\-(.+)$/i;

var pop = doc.createElement('div');
pop.className = 'sosh-pop';
pop.innerHTML =
  '<div class="sosh-qrcode-pic"></div>' +
  '<div class="sosh-qrcode-text">用微信扫描二维码<br>分享至好友和朋友圈</div>' +
  '<a href="javascript:;" target="_self" class="sosh-pop-close">&#10799;</a>';

body.appendChild(pop);

// 初始化二维码
var qrcode = new QRCode($('.sosh-qrcode-pic')[0], {
  text: location.href,
  width: 120,
  height: 120
});

// 二维码扫码弹窗添加关闭事件
addEvent($('.sosh-pop-close')[0], 'click', function() {
  classlist(pop).remove('sosh-pop-show');
});

var socialSites = {
  weixin: {
    name: '微信',
    icon: require('../img/weixin.png')
  },
  yixin: {
    name: '易信',
    icon: require('../img/yixin.png'),
    api: 'http://open.yixin.im/share?url={{url}}&title={{title}}&pic={{pic}}&desc={{digest}}'
  },
  weibo: {
    name: '微博',
    icon: require('../img/weibo.png'),
    api: 'http://service.weibo.com/share/share.php?url={{url}}&title={{title}}&pic={{pic}}'
  },
  qzone: {
    name: 'QQ空间',
    icon: require('../img/qzone.png'),
    api: 'http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url={{url}}&title={{title}}&pics={{pic}}&desc={{digest}}'
  },
  tqq: {
    name: '腾讯微博',
    icon: require('../img/tqq.png'),
    api: 'http://share.v.t.qq.com/index.php?c=share&a=index&url={{url}}&title={{title}}&pic={{pic}}'
  },
  renren: {
    name: '人人网',
    icon: require('../img/renren.png'),
    api: 'http://widget.renren.com/dialog/share?resourceUrl={{url}}&title={{title}}&pic={{pic}}&description={{digest}}'
  },
  douban: {
    name: '豆瓣',
    icon: require('../img/douban.png'),
    api: 'http://douban.com/recommend/?url={{url}}&title={{title}}&image={{pic}}'
  },
  tieba: {
    name: '百度贴吧',
    icon: require('../img/tieba.png'),
    api: 'http://tieba.baidu.com/f/commit/share/openShareApi?url={{url}}&title={{title}}&desc={{digest}}'
  }
};

var defaults = {
  'title': doc.title,
  'url': location.href,
  'digest': metaDesc && metaDesc.content || '',
  'pic': firstImg && firstImg.src || '',
  'sites': ['weixin', 'weibo', 'yixin', 'qzone']
};

var Sosh = function(selector, opts) {
  if (typeof selector === 'string') {
    this.elems = $(selector);
    var length = this.elems.length;

    for(var i = 0; i < length; i++) {
      var elem = this.elems[i];

      var config = extend(defaults, opts, parseDataset(elem));

      elem.innerHTML = getSitesHtml(config.sites);

      handlerClick(elem, config);

      classlist(elem).add('sosh');
    }
  }
}

function $(selector) {
  var isID = selector.indexOf('#') === 0;
  selector = selector.substr(1);

  if (isID) {
    return [doc.getElementById(selector)];
  }

  return getElementsByClassName(selector);
}

function parseDataset(elem) {
  var dataset = {}, attrs = elem.attributes, length = attrs.length;
  for (var i = 0; i < length; i++){
    var attr = attrs[i], attrName = attr.nodeName;

    if(datasetRegexp.test(attrName)) {
      dataset[attrName.replace(datasetRegexp, '$1')] = attr.nodeValue;
    }

    if(attrName === 'data-sites') {
      dataset['sites'] = attr.nodeValue.split(',');
    }
  }
  return dataset;
}

function getSitesHtml(sites) {
  var key;
  var site;
  var html = '';
  var length = sites.length;

  for(var i = 0; i < length; i++) {
    key = sites[i];
    site = socialSites[key];
    if (site) {
      html +=
      '<div class="sosh-item ' + key + '" data-site="' + key + '" title="分享到' + site.name + '">' +
        '<img class="sosh-item-icon" src="' + site.icon + '">' +
        '<span class="sosh-item-text">' + site.name + '</span>' +
      '</div>';
    }
  }

  return html;
}

function handlerClick(agent, shareData) {
  delegate(agent, 'sosh-item', 'click', function() {
    var api = socialSites[this.getAttribute('data-site')].api;
    if (api) {
      for(var k in shareData) {
        api = api.replace(new RegExp('{{'+k+'}}', 'g'), encodeURIComponent(shareData[k]));
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

function addEvent(elem, event, fn) {
  if (elem.addEventListener) {
    return elem.addEventListener(event, fn, false);
  } else {
    return elem.attachEvent('on'+event, function(){fn.call(elem)});
  }
}

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

function getOffsetRect(elem) {
  var box = elem.getBoundingClientRect()

  var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
  var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;

  var clientTop = docElem.clientTop || body.clientTop || 0;
  var clientLeft = docElem.clientLeft || body.clientLeft || 0;

  var top  = box.top +  scrollTop - clientTop;
  var left = box.left + scrollLeft - clientLeft;

  return { top: Math.round(top), left: Math.round(left) };
}

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
    for (var i = 0; i < elements.length; i++) {
      if (pattern.test(elements[i].className)) {
        results.push(elements[i]);
      }
    }
  }

  return results;
}

new Sosh('.sosh');

module.exports = Sosh;
