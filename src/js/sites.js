module.exports = {
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
