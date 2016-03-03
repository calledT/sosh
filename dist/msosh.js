/*
 * $Id: base64.js,v 2.15 2014/04/05 12:58:57 dankogai Exp dankogai $
 *
 *  Licensed under the BSD 3-Clause License.
 *    http://opensource.org/licenses/BSD-3-Clause
 *
 *  References:
 *    http://en.wikipedia.org/wiki/Base64
 */

(function(global) {
    'use strict';
    // existing version for noConflict()
    var _Base64 = global.Base64;
    var version = "2.1.9";
    // if node.js, we use Buffer
    var buffer;
    if (typeof module !== 'undefined' && module.exports) {
        try {
            buffer = require('buffer').Buffer;
        } catch (err) {}
    }
    // constants
    var b64chars
        = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    var b64tab = function(bin) {
        var t = {};
        for (var i = 0, l = bin.length; i < l; i++) t[bin.charAt(i)] = i;
        return t;
    }(b64chars);
    var fromCharCode = String.fromCharCode;
    // encoder stuff
    var cb_utob = function(c) {
        if (c.length < 2) {
            var cc = c.charCodeAt(0);
            return cc < 0x80 ? c
                : cc < 0x800 ? (fromCharCode(0xc0 | (cc >>> 6))
                                + fromCharCode(0x80 | (cc & 0x3f)))
                : (fromCharCode(0xe0 | ((cc >>> 12) & 0x0f))
                   + fromCharCode(0x80 | ((cc >>>  6) & 0x3f))
                   + fromCharCode(0x80 | ( cc         & 0x3f)));
        } else {
            var cc = 0x10000
                + (c.charCodeAt(0) - 0xD800) * 0x400
                + (c.charCodeAt(1) - 0xDC00);
            return (fromCharCode(0xf0 | ((cc >>> 18) & 0x07))
                    + fromCharCode(0x80 | ((cc >>> 12) & 0x3f))
                    + fromCharCode(0x80 | ((cc >>>  6) & 0x3f))
                    + fromCharCode(0x80 | ( cc         & 0x3f)));
        }
    };
    var re_utob = /[\uD800-\uDBFF][\uDC00-\uDFFFF]|[^\x00-\x7F]/g;
    var utob = function(u) {
        return u.replace(re_utob, cb_utob);
    };
    var cb_encode = function(ccc) {
        var padlen = [0, 2, 1][ccc.length % 3],
        ord = ccc.charCodeAt(0) << 16
            | ((ccc.length > 1 ? ccc.charCodeAt(1) : 0) << 8)
            | ((ccc.length > 2 ? ccc.charCodeAt(2) : 0)),
        chars = [
            b64chars.charAt( ord >>> 18),
            b64chars.charAt((ord >>> 12) & 63),
            padlen >= 2 ? '=' : b64chars.charAt((ord >>> 6) & 63),
            padlen >= 1 ? '=' : b64chars.charAt(ord & 63)
        ];
        return chars.join('');
    };
    var btoa = global.btoa ? function(b) {
        return global.btoa(b);
    } : function(b) {
        return b.replace(/[\s\S]{1,3}/g, cb_encode);
    };
    var _encode = buffer ? function (u) {
        return (u.constructor === buffer.constructor ? u : new buffer(u))
        .toString('base64')
    }
    : function (u) { return btoa(utob(u)) }
    ;
    var encode = function(u, urisafe) {
        return !urisafe
            ? _encode(String(u))
            : _encode(String(u)).replace(/[+\/]/g, function(m0) {
                return m0 == '+' ? '-' : '_';
            }).replace(/=/g, '');
    };
    var encodeURI = function(u) { return encode(u, true) };
    // decoder stuff
    var re_btou = new RegExp([
        '[\xC0-\xDF][\x80-\xBF]',
        '[\xE0-\xEF][\x80-\xBF]{2}',
        '[\xF0-\xF7][\x80-\xBF]{3}'
    ].join('|'), 'g');
    var cb_btou = function(cccc) {
        switch(cccc.length) {
        case 4:
            var cp = ((0x07 & cccc.charCodeAt(0)) << 18)
                |    ((0x3f & cccc.charCodeAt(1)) << 12)
                |    ((0x3f & cccc.charCodeAt(2)) <<  6)
                |     (0x3f & cccc.charCodeAt(3)),
            offset = cp - 0x10000;
            return (fromCharCode((offset  >>> 10) + 0xD800)
                    + fromCharCode((offset & 0x3FF) + 0xDC00));
        case 3:
            return fromCharCode(
                ((0x0f & cccc.charCodeAt(0)) << 12)
                    | ((0x3f & cccc.charCodeAt(1)) << 6)
                    |  (0x3f & cccc.charCodeAt(2))
            );
        default:
            return  fromCharCode(
                ((0x1f & cccc.charCodeAt(0)) << 6)
                    |  (0x3f & cccc.charCodeAt(1))
            );
        }
    };
    var btou = function(b) {
        return b.replace(re_btou, cb_btou);
    };
    var cb_decode = function(cccc) {
        var len = cccc.length,
        padlen = len % 4,
        n = (len > 0 ? b64tab[cccc.charAt(0)] << 18 : 0)
            | (len > 1 ? b64tab[cccc.charAt(1)] << 12 : 0)
            | (len > 2 ? b64tab[cccc.charAt(2)] <<  6 : 0)
            | (len > 3 ? b64tab[cccc.charAt(3)]       : 0),
        chars = [
            fromCharCode( n >>> 16),
            fromCharCode((n >>>  8) & 0xff),
            fromCharCode( n         & 0xff)
        ];
        chars.length -= [0, 0, 2, 1][padlen];
        return chars.join('');
    };
    var atob = global.atob ? function(a) {
        return global.atob(a);
    } : function(a){
        return a.replace(/[\s\S]{1,4}/g, cb_decode);
    };
    var _decode = buffer ? function(a) {
        return (a.constructor === buffer.constructor
                ? a : new buffer(a, 'base64')).toString();
    }
    : function(a) { return btou(atob(a)) };
    var decode = function(a){
        return _decode(
            String(a).replace(/[-_]/g, function(m0) { return m0 == '-' ? '+' : '/' })
                .replace(/[^A-Za-z0-9\+\/]/g, '')
        );
    };
    var noConflict = function() {
        var Base64 = global.Base64;
        global.Base64 = _Base64;
        return Base64;
    };
    // export Base64
    global.Base64 = {
        VERSION: version,
        atob: atob,
        btoa: btoa,
        fromBase64: decode,
        toBase64: encode,
        utob: utob,
        encode: encode,
        encodeURI: encodeURI,
        btou: btou,
        decode: decode,
        noConflict: noConflict
    };
    // if ES5 is available, make Base64.extendString() available
    if (typeof Object.defineProperty === 'function') {
        var noEnum = function(v){
            return {value:v,enumerable:false,writable:true,configurable:true};
        };
        global.Base64.extendString = function () {
            Object.defineProperty(
                String.prototype, 'fromBase64', noEnum(function () {
                    return decode(this)
                }));
            Object.defineProperty(
                String.prototype, 'toBase64', noEnum(function (urisafe) {
                    return encode(this, urisafe)
                }));
            Object.defineProperty(
                String.prototype, 'toBase64URI', noEnum(function () {
                    return encode(this, true)
                }));
        };
    }
    // that's it!
    if (global['Meteor']) {
       Base64 = global.Base64; // for normal export in Meteor.js
    }
})(this);

!function(){var a="@font-face{font-family:soshfont;src:url(./iconfont/soshfont.eot);src:url(./iconfont/soshfont.eot?#iefix) format(\"eot\"),url(./iconfont/soshfont.woff2) format(\"woff2\"),url(./iconfont/soshfont.woff) format(\"woff\"),url(./iconfont/soshfont.ttf) format(\"truetype\"),url(./iconfont/soshfont.svg#soshfont) format(\"svg\");font-weight:400;font-style:normal}.msosh-item-icon,.sosh-item-icon{font-family:soshfont;font-style:normal;font-weight:400;font-variant:normal;text-transform:none;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}.msosh{*zoom:1;text-align:center}.msosh:after,.msosh:before{content:\" \";display:table}.msosh:after{clear:both}.msosh-item{float:left;line-height:0;margin:5px;text-decoration:none;cursor:pointer;-webkit-tap-highlight-color:transparent}.msosh-item-icon{color:#fff;font-size:20px;display:inline-block;text-decoration:none;width:36px;height:36px;line-height:36px;border-radius:50%;text-align:center}.msosh-item-text{display:none}.msosh-item.weixin .msosh-item-icon{background:#49b233}.msosh-item.weixin:hover .msosh-item-icon{background:#398a28}.msosh-item.yixin .msosh-item-icon{background:#23cfaf}.msosh-item.yixin:hover .msosh-item-icon{background:#1ca38a}.msosh-item.weibo .msosh-item-icon{background:#f04e59}.msosh-item.weibo:hover .msosh-item-icon{background:#ec1f2d}.msosh-item.qzone .msosh-item-icon{background:#fdbe3d}.msosh-item.qzone:hover .msosh-item-icon{background:#fcad0b}.msosh-item.renren .msosh-item-icon{background:#1f7fc9}.msosh-item.renren:hover .msosh-item-icon{background:#18639d}.msosh-item.tieba .msosh-item-icon{background:#5b95f0}.msosh-item.tieba:hover .msosh-item-icon{background:#2c77ec}.msosh-item.douban .msosh-item-icon{background:#228a31}.msosh-item.douban:hover .msosh-item-icon{background:#186122}.msosh-item.tqq .msosh-item-icon{background:#97cbe1}.msosh-item.tqq:hover .msosh-item-icon{background:#6fb7d6}.msosh-item.qq .msosh-item-icon{background:#4081e1}.msosh-item.qq:hover .msosh-item-icon{background:#2066ce}.msosh-item.weixintimeline .msosh-item-icon{background:#1cb526}.msosh-item.weixintimeline:hover .msosh-item-icon{background:#15891d}.msosh-group{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-pack:justify;-webkit-justify-content:space-between;-ms-flex-pack:justify;justify-content:space-between;padding:15px 20px}.msosh-group .msosh-item{display:block;float:none;margin:0}.msosh-pop{display:none;position:fixed;z-index:9999;top:0;bottom:0;left:0;right:0;height:100%;width:100%;background:rgba(0,0,0,.65);opacity:0}.msosh-pop-show{opacity:1;-webkit-transition:opacity .8s ease-in;transition:opacity .8s ease-in}.msosh-pop-show .group1{-webkit-animation:a 1.2s 1 ease;animation:a 1.2s 1 ease}.msosh-pop-show .group2{-webkit-animation:a 1.8s 1 ease;animation:a 1.8s 1 ease}.msosh-pop-show .group3{-webkit-animation:a 2.4s 1 ease;animation:a 2.4s 1 ease}.msosh-pop-hide{opacity:0;-webkit-transition:opacity .8s ease-in;transition:opacity .8s ease-in}.msosh-pop-hide .group1{-webkit-animation:b .7s 1 cubic-bezier(.68,-.55,.265,1.55) 0ms;animation:b .7s 1 cubic-bezier(.68,-.55,.265,1.55) 0ms}.msosh-pop-hide .group2{-webkit-animation:b .7s 1 cubic-bezier(.68,-.55,.265,1.55) .3s;animation:b .7s 1 cubic-bezier(.68,-.55,.265,1.55) .3s}.msosh-pop-hide .group3{-webkit-animation:b .7s 1 cubic-bezier(.68,-.55,.265,1.55) .6s;animation:b .7s 1 cubic-bezier(.68,-.55,.265,1.55) .6s}.msosh-pop-sites{position:absolute;top:50%;left:0;width:100%;-webkit-transform:translateY(-50%);transform:translateY(-50%)}.msosh-pop .msosh-item-icon{width:60px;height:60px;line-height:60px;font-size:28px;text-align:center}.msosh-wxsharetip{position:fixed;top:5px;right:5px;height:60px;width:189px;background-image:url(./img/msoshwxtip.png);background-size:contain;background-repeat:no-repeat;opacity:0;visibility:hidden;-webkit-transition:all .6s ease-out;transition:all .6s ease-out;z-index:-1}.msosh-wxsharetip.wxsharetip-show{z-index:9999;opacity:1;visibility:visible}@-webkit-keyframes a{0%{-webkit-transform:translate3d(0,1136px,0);transform:translate3d(0,1136px,0)}50%,60%,to{-webkit-transform:translateZ(0);transform:translateZ(0)}}@keyframes a{0%{-webkit-transform:translate3d(0,1136px,0);transform:translate3d(0,1136px,0)}50%,60%,to{-webkit-transform:translateZ(0);transform:translateZ(0)}}@-webkit-keyframes b{0%{opacity:1;-webkit-transform:translateZ(0);transform:translateZ(0)}to{opacity:0;-webkit-transform:translate3d(0,500%,0);transform:translate3d(0,500%,0)}}@keyframes b{0%{opacity:1;-webkit-transform:translateZ(0);transform:translateZ(0)}to{opacity:0;-webkit-transform:translate3d(0,500%,0);transform:translate3d(0,500%,0)}}",b=document.createElement("style");b.type="text/css",b.styleSheet?b.styleSheet.cssText=a:b.appendChild(document.createTextNode(a)),(document.head||document.getElementsByTagName("head")[0]).appendChild(b)}();
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.Msosh = factory();
  }
}(this, function() {
  var hasOwn = Object.prototype.hasOwnProperty;
  var toString = Object.prototype.toString;
  var doc = document;
  var body = doc.body;
  var metaDesc = doc.getElementsByName('description')[0];
  var firstImg = doc.getElementsByTagName('img')[0];

  var ua = navigator.userAgent.toLowerCase();
  var isIOS = deviceDetect('iPhone') || deviceDetect('iPad') || deviceDetect('iPod');
  var isAndroid = deviceDetect('Android');
  var isUCBrowser = deviceDetect('UCBrowser');
  var isQQBrowser = deviceDetect('MQQBrowser');
  var isWeixin = deviceDetect('MicroMessenger');
  var qqBrowserVersion = isQQBrowser ? getVersion(ua.split('mqqbrowser/')[1]) : 0;
  var ucBrowserVersion = isUCBrowser ? getVersion(ua.split('ucbrowser/')[1]) : 0;
  var iOSVersion = isIOS ? parseInt(ua.match(/\s*os\s*\d/gi)[0].split(' ')[2], 10) : 0;

  var supportNativeShare = false;

  if ((isIOS && ucBrowserVersion >= 10.2) || (isAndroid && ucBrowserVersion >= 9.7) || qqBrowserVersion >= 5.4) supportNativeShare = true;

  if (isWeixin) body.insertAdjacentHTML('beforeend', '<div class="msosh-wxsharetip"></div>');

  var template = '<a class="msosh-item {{site}}" data-site="{{site}}" href="javascript:;"><em class="msosh-item-icon">{{icon}}</em><span class="msosh-item-text">{{name}}</span></a>';

  var socialSites = {
    weixin: {
      name: '微信好友',
      icon: '&#xeA07;'
    },
    weixintimeline: {
      name: '朋友圈',
      icon: '&#xeA10;'
    },
    qq: {
      name: 'QQ好友',
      icon: '&#xeA09;',
      scheme: 'mqqapi://share/to_fri?src_type=web&version=1&file_type=news'
    },
    qzone: {
      name: 'QQ空间',
      icon: '&#xeA02;',
      api: 'http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url={{url}}&title={{title}}&pics={{pic}}&desc={{digest}}',
      scheme: isIOS ?
      'mqqapi://share/to_fri?file_type=news&src_type=web&version=1&generalpastboard=1&shareType=1&cflag=1&objectlocation=pasteboard&callback_type=scheme&callback_name=QQ41AF4B2A' :
      'mqqapi://share/to_qzone?src_type=app&version=1&file_type=news&req_type=1'
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

  // 支持浏览器原生分享的APP
  var nativeShareApps = {
    weibo: ['kSinaWeibo', 'SinaWeibo', 11],
    weixin: ['kWeixin', 'WechatFriends', 1],
    weixintimeline: ['kWeixinFriend', 'WechatTimeline', 8],
    qq: ['kQQ', 'QQ', 4],
    qzone: ['kQZone', 'Qzone', 3]
  };

  var defaults = {
    title: doc.title,
    url: location.href,
    digest: metaDesc && metaDesc.content || '',
    pic: firstImg && firstImg.src || '',
    from: location.host,
    sites: ['weixin', 'weixintimeline', 'yixin', 'weibo', 'qq', 'qzone']
  };

  function Share() {
    var args = arguments;
    this.opts = {};
    if (getType(args[0]) === 'string') {
      this.elems = doc.querySelectorAll(args[0]);
      this.length = this.elems.length;
      this.opts = args[1];
      this.init(this.opts);
    } else if (getType(args[0]) === 'object') {
      this.opts = args[0]
    }
  }

  Share.prototype = {
    constructor: this,
    init: function(opts) {
      // 普通浏览器没有webapi的分享是通过QQ浏览器当桥梁进行的，
      // 需要通过URL参数判断分享到哪个地方
      var site = getQueryVariable('__msoshbridge');
      if (site) {
        if (typeof history.replaceState === 'function') {
          var url = location.href.replace(new RegExp('[&?]__msoshbridge='+site, 'gi'), '');
          history.replaceState(null, doc.title, url);
          this.shareTo(site, extend(defaults, opts));
        }
      }

      if (this.length) {
        for(i=0; i<this.length; i++) {
          var elem = this.elems[i];

          var dataset = extend(elem.dataset);

          if (dataset.sites) dataset.sites = dataset.sites.split(',');

          var config = extend(defaults, opts, dataset);

          var sitesHtml = this.getSitesHtml(config.sites);

          elem.insertAdjacentHTML('beforeend', sitesHtml);

          elem.classList.add('msosh');

          this._handlerClick(elem, config);
        }
      }
    },
    getSitesHtml: function (sites, groupsize) {
      var i = 0, html = '',length = sites.length,
          groupsize = getType(groupsize) === 'number' && groupsize !== 0 ? groupsize : 0;

      for (; i<length; i++) {
        if (groupsize && i%groupsize === 0) {
          html += '<div class="msosh-group group'+((i/groupsize) + 1)+'">'
        };

        html += this.parseTemplate(sites[i]);

        if (groupsize && (i%groupsize === groupsize-1 || i === length-1)) {
          html += '</div>'
        };
      }
      return html;
    },
    parseTemplate: function (site) {
      if (socialSites[site]) {
        return template.replace(/\{\{site\}\}/g, site)
          .replace(/\{\{icon\}\}/g, socialSites[site].icon)
          .replace(/\{\{name\}\}/g, socialSites[site].name);
      } else {
        console.warn('site [' + site + '] not exist.');
        return '';
      }
    },
    shareTo: function (site, data) {
      var app, shareInfo, _this = this, api = socialSites[site].api;

      // 在UC和QQ浏览器里，对支持的应用调用原生分享
      if (supportNativeShare) {
        if (isUCBrowser) {
          if (nativeShareApps[site]) {
            app = isIOS ? nativeShareApps[site][0] : nativeShareApps[site][1];
          }

          if (app !== undefined) {
            shareInfo = [data.title, data.digest, data.url, app, '', '@'+data.from, ''];

            // android
            if (window.ucweb) {
              ucweb.startRequest && ucweb.startRequest('shell.page_share', shareInfo);
            }

            // ios
            if (window.ucbrowser) {
              ucbrowser.web_share && ucbrowser.web_share.apply(null, shareInfo);
            }
            return;
          }
        }

        if (isQQBrowser) {
          if (nativeShareApps[site]) app = nativeShareApps[site][2];
          if (app !== undefined) {
            if (window.browser) {
              shareInfo = {
                url: data.url,
                title: data.title,
                description: data.digest,
                img_url: data.pic,
                img_title: data.title,
                to_app: app,
                cus_txt: ''
              };

              browser.app && browser.app.share(shareInfo);
            } else {
              loadScript('//jsapi.qq.com/get?api=app.share', function() {
                _this.shareTo(site, data);
              });
            }
            return;
          }
        }
      }

      // 在普通浏览器里，使用URL Scheme唤起QQ客户端进行分享
      if (site === 'qzone' || site == 'qq') {
        var scheme = appendToQuerysting(socialSites[site].scheme, {
          share_id: '1101685683',
          url: Base64.encode(data.url),
          title: Base64.encode(data.title),
          description: Base64.encode(data.digest),
          previewimageUrl: Base64.encode(data.pic), //For IOS
          image_url: Base64.encode(data.pic) //For Android
        });
        openAppByScheme(scheme);
        return;
      }

      // 在普通浏览器里点击微信分享，通过QQ浏览器当桥梁唤起微信客户端
      // 如果没有安装QQ浏览器则点击无反应
      if (site.indexOf('weixin') !== -1) {
        var mttbrowserURL = appendToQuerysting(location.href, {__msoshbridge: site});
        openAppByScheme('mttbrowser://url=' + mttbrowserURL);
      }

      // 在微信里点微信分享，弹出右上角提示
      if (isWeixin && (site.indexOf('weixin') !== -1)) {
        Share.wxShareTip();
        return;
      }

      // 对于没有原生分享的网站，使用webapi进行分享
      if (api) {
        for (k in data) {
          api = api.replace(new RegExp('{{'+k+'}}', 'g'), encodeURIComponent(data[k]));
        }
        window.open(api, '_blank');
      }
    },
    popIn: function (opts) {
      if (!this.popElem) {
        var config = extend(defaults, this.opts, opts);
        var html = '<div class="msosh-pop"><div class="msosh-pop-sites">' + this.getSitesHtml(config.sites, 3) + '</div></div>';
        body.insertAdjacentHTML('beforeend', html);
        this.popElem = doc.querySelector('.msosh-pop');
        this.popClass = this.popElem.classList;
        this._handlerClick(this.popElem, config);
        this.popElem.onclick = function() {
          this.popOut();
        }.bind(this);
      }
      this.popClass.remove('msosh-pop-hide');
      this.popElem.style.display = 'block';
      setTimeout(function() {
        this.popClass.add('msosh-pop-show');
      }.bind(this), 0);
    },
    popOut: function () {
      if (this.popElem) {
        this.popClass.remove('msosh-pop-show');
        this.popClass.add('msosh-pop-hide');
        setTimeout(function() {
          this.popElem.style.display = 'none';
        }.bind(this), 800);
      }
    },
    _handlerClick: function(agent, data) {
      var _this = this;
      delegate(agent, '.msosh-item', 'click', function() {
        _this.shareTo(this.dataset.site, data);
      });
    }
  };

  Share.wxShareTip = function (duration) {
    if (getType(duration) !== 'number') duration = 2000;
    if (isWeixin) {
      var tipElem = doc.querySelector('.msosh-wxsharetip');
      tipElem.classList.add('wxsharetip-show');
      setTimeout(function() {
        tipElem.classList.remove('wxsharetip-show');
      }, duration);
    }
  };

  function extend () {
    var target = {}
    for (var i = 0; i < arguments.length; i++) {
      var source = arguments[i]
      for (var key in source) {
        if (hasOwn.call(source, key)) {
          target[key] = source[key]
        }
      }
    }
    return target
  }

  function getType(obj) {
    if (obj === null) return 'null';
    if (typeof obj === undefined) return 'undefined';

    return toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
  }

  function appendToQuerysting(url, data) {
    var arr = [];
    for(var k in data) {
      arr.push(k+'='+data[k]);
    }
    return url + (url.indexOf('?') !== -1 ? '&' : '?') + arr.join('&');
  }

  function getQueryVariable(variable) {
    var query = location.search.substring(1);
    var vars = query.split('&'), length = vars.length;
    for (var i = 0; i < length; i++) {
      var pair = vars[i].split('=');
      if (decodeURIComponent(pair[0]) == variable) {
        return decodeURIComponent(pair[1]);
      }
    }
  }

  function delegate(agent, selector, type, fn) {
    agent.addEventListener(type, function(e) {
      var target = e.target;
      var ctarget = e.currentTarget;
      while (target && target !== ctarget) {
        if (selectorMatches(target, selector)) {
          fn.call(target, e);
          return;
        }
        target = target.parentNode;
      }
    }, false);
  }

  function selectorMatches(elem, selector) {
    var p = Element.prototype;
    var f = p.matches ||
            p.webkitMatchesSelector ||
            p.mozMatchesSelector ||
            p.msMatchesSelector ||
            function(s) {
              return [].indexOf.call(doc.querySelectorAll(s), this) !== -1;
            };

    return f.call(elem, selector);
  }

  function loadScript(url, cb) {
    var script = doc.createElement('script');
    script.src = url;
    script.onload = onreadystatechange = function() {
      if (!this.readyState || this.readyState === 'load' || this.readyState === 'complete') {
        cb && cb();
        script.onload = onreadystatechange
        script.parentNode.removeChild(script);
      }
    };
    body.appendChild(script);
  }

  function deviceDetect(needle) {
    needle = needle.toLowerCase();
    return ua.indexOf(needle) !== -1;
  }

  function getVersion(nece) {
    var arr = nece.split('.');
    return parseFloat(arr[0] + '.' + arr[1]);
  }

  function openAppByScheme(scheme) {
    if (iOSVersion > 8) {
      window.location.href = scheme;
    } else {
      var iframe = doc.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = scheme;
      body.appendChild(iframe);
      setTimeout(function() {
        iframe && iframe.parentNode && iframe.parentNode.removeChild(iframe);
      }, 5000);
    }
  }

  // Make :active work on IOS
  body.addEventListener('touchstart', function(){}, false);

  return Share;
}));
