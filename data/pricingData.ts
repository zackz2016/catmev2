// 价格计划数据定义文件
// 定义了所有可用的订阅计划及其特性

export const PRICE_PLANS = [
  {
    id: 'free',
    planId: 'free',
    title: 'Catme-Free',
    // description: '免费体验基础功能',
    price: 'Free',
    period: '',
    features: [
      { text: '未注册用户免费生成1次', included: true },
      { text: '新注册用户免费生成2次', included: true },
      { text: '标准分辨率', included: true },
      { text: '个人使用', included: true },
      { text: '商业使用权', included: false },
    ],
  },
  {
    id: 'standard',

    planId: 'standard',
    title: 'Catme-standard',
    // description: '适合创作者使用',
    price: '4.99',
    period: '/bundle',
    popular: true,
    features: [
      { text: '100次图片生成', included: true },
      { text: '图片下载和分享', included: true },
      { text: 'HD分辨率', included: true },
      { text: '商业使用权', included: true },
      { text: '优先处理', included: true },
    ],
  },
  {
    id: 'super',
    planId: 'super',
    title: 'Catme-super',
    // description: '适合大型团队和企业用户',
    price: '9.99',
    period: '/bundle',
    features: [
      { text: '300次图片生成', included: true },
      { text: '图片下载和分享', included: true },
      { text: 'HD分辨率', included: true },
      { text: '商业使用权', included: true },
      { text: '优先处理', included: true },    
    ],
  },
]; 