// Shim
if (!document.getElementsByClassName) {
  document.getElementsByClassName = function(search) {
    var d = document, elements, pattern, i, results = [];
    if (d.querySelectorAll) { // IE8
      return d.querySelectorAll("." + search);
    }
    if (d.evaluate) { // IE6, IE7
      pattern = ".//*[contains(concat(' ', @class, ' '), ' " + search + " ')]";
      elements = d.evaluate(pattern, d, null, 0, null);
      while ((i = elements.iterateNext())) {
        results.push(i);
      }
    } else {
      elements = d.getElementsByTagName("*");
      pattern = new RegExp("(^|\\s)" + search + "(\\s|$)");
      for (var i = 0; i < elements.length; i++) {
        if ( pattern.test(elements[i].className) ) {
          results.push(elements[i]);
        }
      }
    }
    return results;
  }
}

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.Sosh = factory();
  }
}(this, function() {
  var doc = document;
  var body = doc.body;
  var docElem = doc.documentElement;
  var hasOwn = Object.prototype.hasOwnProperty;
  var metaDesc = doc.getElementsByName('description')[0];
  var firstImg = doc.getElementsByTagName('img')[0];
  var datasetRegEx = /^data\-(.+)$/i;

  var pop = doc.createElement('div');
  pop.className = 'sosh-pop';
  pop.innerHTML = '<div class="sosh-qrcode-pic"></div><div class="sosh-qrcode-text">用微信扫描二维码<br>分享至好友和朋友圈</div><a href="javascript:;" target="_self" class="sosh-pop-close">&#10799;</a>';
  body.appendChild(pop);

  // 初始化二维码
  var qrcode = new QRCode($('.sosh-qrcode-pic')[0], {text: location.href, width: 120, height: 120});

  // 二维码扫码弹窗添加关闭事件
  addEvent($('.sosh-pop-close')[0], 'click', function() {
    removeClass(pop, 'sosh-pop-show');
  });

  var socialSites = {
    weixin: {
      name: '微信',
      icon: '&#xeA07;'
    },
    yixin: {
      name: '易信',
      icon: '&#xeA08;',
      api: 'http://open.yixin.im/share?url={{url}}&title={{title}}&pic={{pic}}&desc={{digest}}'
    },
    weibo: {
      name: '微博',
      icon: '&#xeA06;',
      api: 'http://service.weibo.com/share/share.php?url={{url}}&title={{title}}&pic={{pic}}'
    },
    qzone: {
      name: 'QQ空间',
      icon: '&#xeA02;',
      api: 'http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url={{url}}&title={{title}}&pics={{pic}}&desc={{digest}}'
    },
    tqq: {
      name: '腾讯微博',
      icon: '&#xeA05;',
      api: 'http://share.v.t.qq.com/index.php?c=share&a=index&url={{url}}&title={{title}}&pic={{pic}}'
    },
    renren: {
      name: '人人网',
      icon: '&#xeA03;',
      api: 'http://widget.renren.com/dialog/share?resourceUrl={{url}}&title={{title}}&pic={{pic}}&description={{digest}}'
    },
    douban: {
      name: '豆瓣',
      icon: '&#xeA01;',
      api: 'http://douban.com/recommend/?url={{url}}&title={{title}}&image={{pic}}'
    },
    tieba: {
      name: '百度贴吧',
      icon: '&#xeA04;',
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

  function Share (selector, opts) {
    if (typeof selector === 'string') {
      this.elems = $(selector);
      var length = this.elems.length;

      for(var i = 0; i < length; i++) {
        var elem = this.elems[i];

        var config = extend(defaults, opts, parseDataset(elem));

        elem.innerHTML = getSitesHtml(config.sites);

        handlerClick(elem, config);

        addClass(elem, 'sosh');
      }
    }
  }

  function parseDataset (elem) {
    var dataset = {}, attrs = elem.attributes, length = attrs.length;
    for (var i = 0; i < length; i++){
      var attr = attrs[i], attrName = attr.nodeName;

      if(datasetRegEx.test(attrName)) {
        dataset[attrName.replace(datasetRegEx, '$1')] = attr.nodeValue;
      }

      if(attrName === 'data-sites') {
        dataset['sites'] = attr.nodeValue.split(',');
      }
    }
    return dataset;
  }

  function getSitesHtml (sites) {
    var key, site, length = sites.length, html = '';
    for(var i = 0; i < length; i++) {
      key = sites[i];
      site = socialSites[key];
      if (site) {
        html += '<a class="sosh-item '+key+'" data-site="'+key +'" title="分享到'+site.name+'" href="javascript:;"><em class="sosh-icon-'+key+'">'+site.icon+'</em></a>';
      }
    }
    return html;
  }

  function handlerClick (agent, shareData) {
    delegate(agent, 'sosh-item', 'click', function() {
      var api = socialSites[this.getAttribute('data-site')].api;
      if (api) {
        for(var k in shareData) {
          api = api.replace(new RegExp('{{'+k+'}}', 'g'), encodeURIComponent(shareData[k]));
        }
        window.open(api, '_blank');
      } else {
        // 微信弹出二维码扫码气泡
        if(hasClass(this, 'weixin')) {
          var offset = getOffsetRect(this);
          pop.style.top = offset.top + this.offsetHeight + 10 + 'px';
          pop.style.left = offset.left + 'px';
          addClass(pop, 'sosh-pop-show');
          // 重新渲染二维码
          qrcode.clear();
          qrcode.makeCode(shareData.url);
        }
      }
    });
  }

  function hasClass (elem, className) {
    return new RegExp(' ' + className + ' ').test(' ' + elem.className + ' ');
  }

  function addClass (elem, className) {
    console.log();
    if (!hasClass(elem, className)) {
      elem.className += ' ' + className;
    }
  }

  function removeClass (elem, className) {
    var newClass = ' ' + elem.className.replace( /[\t\r\n]/g, ' ') + ' ';
    if (hasClass(elem, className)) {
      while (newClass.indexOf(' ' + className + ' ') >= 0 ) {
        newClass = newClass.replace(' ' + className + ' ', ' ');
      }
      elem.className = newClass.replace(/^\s+|\s+$/g, '');
    }
  }

  function addEvent (elem, event, fn) {
    if (elem.addEventListener) {
      return elem.addEventListener(event, fn, false);
    } else {
      return elem.attachEvent('on'+event, function(){fn.call(elem)});
    }
  }

  function delegate (agent, className, event, fn) {
    addEvent(agent, event, function(e) {
      e = e || window.event;
      var target = e.target || e.srcElement;
      while (target && target !== this) {
        if (hasClass(target, className)) {
          typeof fn === 'function' && fn.call(target, e);
          return;
        }
        target = target.parentNode;
      }
    });
  }

  function extend () {
    var target = {}, args = arguments, length = args.length;
    for (var i = 0; i < length; i++) {
        var source = args[i]
        for (var key in source) {
          if (hasOwn.call(source, key)) {
            target[key] = source[key]
          }
        }
    }
    return target
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

  function $ (selector) {
    var results = [];

    var isID = selector.indexOf('#') === 0;
    var isClass = selector.indexOf('.') === 0;
    selector = selector.substr(1);
    if (isID) {
      var elem = doc.getElementById(selector);
      if (elem) results.push(elem);
    } else if (isClass) {
      results = doc.getElementsByClassName(selector);
    }

    return results;
  }

  // 默认初始化有类名sosh的元素
  new Share('.sosh');

  return Share;
}));
