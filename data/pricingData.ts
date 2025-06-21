// 价格计划数据定义文件
// 定义了所有可用的订阅计划及其特性

export const PRICE_PLANS = [
  {
    id: 'free',
    planId: 'free',
    title: 'Catme-Free',
    description: '免费体验基础功能',
    price: 'Free',
    period: '',
    features: [
      { text: '免费生成3次', included: true },
      { text: '基础风格', included: true },
      { text: '标准分辨率', included: true },
      { text: '个人使用', included: true },
      { text: '商业使用权', included: false },
    ],
  },
  {
    id: 'standard',
    planId: 'standard',
    title: 'Catme-standard',
    description: '适合日常使用',
    price: '9.9',
    period: '/月',
    popular: true,
    features: [
      { text: '每月50次生成', included: true },
      { text: '所有风格模板', included: true },
      { text: 'HD分辨率', included: true },
      { text: '商业使用权', included: false },
      { text: '优先处理', included: true },
    ],
  },
  {
    id: 'super',
    planId: 'super',
    title: 'Catme-super',
    description: '适合大型团队和企业用户',
    price: '49.9',
    period: '/月',
    features: [
      { text: '超级版套餐', included: true },
      { text: '自定义风格模板', included: true },
      { text: '超高清分辨率', included: true },
      { text: '扩展商业权限', included: true },
      { text: '专属客服支持', included: true },
      { text: 'API访问', included: true },
    ],
  },
]; 