// ==================== 运费管理 - 共享 Mock 数据 ====================
import type { FreightTemplate } from '../types/freight'

export const ALL_PROVINCES = [
  '北京市', '天津市', '河北省', '山西省', '内蒙古自治区',
  '辽宁省', '吉林省', '黑龙江省',
  '上海市', '江苏省', '浙江省', '安徽省', '福建省', '江西省', '山东省',
  '河南省', '湖北省', '湖南省', '广东省', '广西壮族自治区', '海南省',
  '重庆市', '四川省', '贵州省', '云南省', '西藏自治区',
  '陕西省', '甘肃省', '青海省', '宁夏回族自治区', '新疆维吾尔自治区',
  '台湾省', '香港特别行政区', '澳门特别行政区'
]

export const mockTemplates: FreightTemplate[] = [
  {
    id: 'tpl_001', name: '全国包邮',
    chargeType: 'BY_QUANTITY',
    defaultRule: {
      regions: ['全国'], isFreeShipping: true, freeThreshold: null,
      chargeConfig: { firstQty: 1, firstFee: 0, additionalQty: 1, additionalFee: 0 }
    },
    specialRules: [],
    status: 'active', productCount: 128,
    createdAt: '2026-01-05 09:00:00', updatedAt: '2026-07-15 10:30:00'
  },
  {
    id: 'tpl_002', name: '阶梯运费+偏远加收',
    chargeType: 'BY_WEIGHT',
    defaultRule: {
      regions: ['全国'], isFreeShipping: true, freeThreshold: 99,
      chargeConfig: { firstWeight: 1, firstWeightUnit: 'kg', firstFee: 10, additionalWeight: 0.5, additionalWeightUnit: 'kg', additionalFee: 5 }
    },
    specialRules: [
      { id: 1, regions: ['新疆维吾尔自治区', '西藏自治区', '内蒙古自治区', '青海省', '甘肃省'], isFreeShipping: false, freeThreshold: null,
        chargeConfig: { firstWeight: 1, firstWeightUnit: 'kg', firstFee: 20, additionalWeight: 0.5, additionalWeightUnit: 'kg', additionalFee: 15 } }
    ],
    status: 'active', productCount: 56,
    createdAt: '2026-01-10 10:00:00', updatedAt: '2026-07-14 14:20:00'
  },
  {
    id: 'tpl_003', name: '图书按件计费',
    chargeType: 'BY_QUANTITY',
    defaultRule: {
      regions: ['全国'], isFreeShipping: false, freeThreshold: null,
      chargeConfig: { firstQty: 1, firstFee: 5, additionalQty: 1, additionalFee: 2 }
    },
    specialRules: [
      { id: 2, regions: ['新疆维吾尔自治区', '西藏自治区', '青海省'], isFreeShipping: false, freeThreshold: null,
        chargeConfig: { firstQty: 1, firstFee: 12, additionalQty: 1, additionalFee: 8 } }
    ],
    status: 'active', productCount: 67,
    createdAt: '2026-02-20 09:00:00', updatedAt: '2026-07-03 10:20:00'
  },
  {
    id: 'tpl_004', name: '固定运费10元',
    chargeType: 'FIXED',
    defaultRule: {
      regions: ['全国'], isFreeShipping: false, freeThreshold: null,
      chargeConfig: { fixedFee: 10 }
    },
    specialRules: [
      { id: 3, regions: ['新疆维吾尔自治区', '西藏自治区', '青海省'], isFreeShipping: false, freeThreshold: null,
        chargeConfig: { fixedFee: 20 } }
    ],
    status: 'active', productCount: 35,
    createdAt: '2026-04-01 09:00:00', updatedAt: '2026-07-10 14:00:00'
  },
  {
    id: 'tpl_005', name: '金额阶梯满199包邮',
    chargeType: 'BY_ORDER_AMOUNT',
    defaultRule: {
      regions: ['全国'], isFreeShipping: true, freeThreshold: 199,
      chargeConfig: { amountRanges: [{ min: 0, max: 199, fee: 10 }] }
    },
    specialRules: [],
    status: 'disabled', productCount: 0,
    createdAt: '2026-01-20 09:00:00', updatedAt: '2026-06-30 17:00:00'
  }
]
