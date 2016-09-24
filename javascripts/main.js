  new Sosh('#soshid', {
    url: location.href, // 默认使用location.href
    title: '分享的标题', // 默认使用document.title
    digest: '分享的摘要', // 默认使用<meta name="description" content="">content的值
    pic: '分享的图片', // 默认获取本页面第一个img元素的src
    sites: ['weixin', 'weibo', 'yixin', 'qzone', 'tqq', 'douban', 'renren', 'tieba'] // 选择要显示的分享站点，顺序同sites数组顺序，支持设置的站点有weixin、yixin、weibo、qzone、tqq、douban、renren、tieba
  });

new Sosh('.pcdataset', {
  url: location.href,
  title: '分享的标题',
  digest: '分享的摘要',
  pic: '分享的图片',
  sites: ['weixin', 'weibo', 'yixin', 'qzone']
});
