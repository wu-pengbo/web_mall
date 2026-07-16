// ==================== 运费管理 - 共享 Mock 数据 ====================
import type { FreightTemplate } from '../types/freight'

/** 全国省份列表（用于地区选择） */
export const ALL_PROVINCES = [
  '北京', '天津', '上海', '重庆',
  '河北', '山西', '辽宁', '吉林', '黑龙江', '江苏', '浙江', '安徽',
  '福建', '江西', '山东', '河南', '湖北', '湖南', '广东', '广西',
  '海南', '四川', '贵州', '云南', '西藏', '陕西', '甘肃', '青海',
  '宁夏', '新疆', '内蒙古',
  '台湾', '香港', '澳门'
]

/** 偏远地区集合（常用） */
export const REMOTE_AREAS = ['新疆', '西藏', '内蒙古', '青海', '甘肃']

/** 运费模板 mock 数据 */
export const mockFreightTemplates: FreightTemplate[] = [
  {
    id: 1,
    name: '全国包邮',
    type: 'piece',
    status: 'active',
    defaultRule: { firstAmount: 1, firstFee: 0, nextAmount: 1, nextFee: 0 },
    specialRules: [],
    usedProductCount: 128,
    updatedAt: '2026-07-15 10:30:00',
    createdAt: '2026-01-05 09:00:00'
  },
  {
    id: 2,
    name: '基础运费（偏远加收）',
    type: 'piece',
    status: 'active',
    defaultRule: { firstAmount: 1, firstFee: 10, nextAmount: 1, nextFee: 5 },
    specialRules: [
      { areas: ['新疆', '西藏', '内蒙古'], firstAmount: 1, firstFee: 25, nextAmount: 1, nextFee: 15 }
    ],
    usedProductCount: 56,
    updatedAt: '2026-07-14 14:20:00',
    createdAt: '2026-01-10 10:00:00'
  },
  {
    id: 3,
    name: '大件商品按重量',
    type: 'weight',
    status: 'active',
    defaultRule: { firstAmount: 1, firstFee: 15, nextAmount: 1, nextFee: 8 },
    specialRules: [
      { areas: ['新疆', '西藏'], firstAmount: 1, firstFee: 30, nextAmount: 1, nextFee: 20 }
    ],
    usedProductCount: 23,
    updatedAt: '2026-07-12 09:15:00',
    createdAt: '2026-02-01 08:00:00'
  },
  {
    id: 4,
    name: '家具体积计费',
    type: 'volume',
    status: 'active',
    defaultRule: { firstAmount: 1, firstFee: 20, nextAmount: 1, nextFee: 10 },
    specialRules: [
      { areas: ['新疆', '西藏', '青海'], firstAmount: 1, firstFee: 50, nextAmount: 1, nextFee: 30 }
    ],
    usedProductCount: 8,
    updatedAt: '2026-07-10 16:45:00',
    createdAt: '2026-02-15 09:00:00'
  },
  {
    id: 5,
    name: '江浙沪包邮',
    type: 'piece',
    status: 'active',
    defaultRule: { firstAmount: 1, firstFee: 8, nextAmount: 1, nextFee: 4 },
    specialRules: [
      { areas: ['上海', '江苏', '浙江'], firstAmount: 1, firstFee: 0, nextAmount: 1, nextFee: 0 }
    ],
    usedProductCount: 42,
    updatedAt: '2026-07-08 11:30:00',
    createdAt: '2026-03-01 10:00:00'
  },
  {
    id: 6,
    name: '生鲜冷链运费',
    type: 'weight',
    status: 'active',
    defaultRule: { firstAmount: 1, firstFee: 18, nextAmount: 1, nextFee: 12 },
    specialRules: [
      { areas: ['新疆', '西藏', '内蒙古', '青海', '甘肃'], firstAmount: 1, firstFee: 35, nextAmount: 1, nextFee: 25 }
    ],
    usedProductCount: 15,
    updatedAt: '2026-07-06 08:00:00',
    createdAt: '2026-03-10 09:00:00'
  },
  {
    id: 7,
    name: '港澳台专线',
    type: 'piece',
    status: 'active',
    defaultRule: { firstAmount: 1, firstFee: 30, nextAmount: 1, nextFee: 15 },
    specialRules: [
      { areas: ['台湾', '香港', '澳门'], firstAmount: 1, firstFee: 25, nextAmount: 1, nextFee: 12 }
    ],
    usedProductCount: 5,
    updatedAt: '2026-07-05 14:00:00',
    createdAt: '2026-04-01 10:00:00'
  },
  {
    id: 8,
    name: '满99包邮（旧版）',
    type: 'piece',
    status: 'disabled',
    defaultRule: { firstAmount: 1, firstFee: 10, nextAmount: 1, nextFee: 5 },
    specialRules: [],
    usedProductCount: 0,
    updatedAt: '2026-06-30 17:00:00',
    createdAt: '2026-01-20 09:00:00'
  },
  {
    id: 9,
    name: '图书音像标准',
    type: 'piece',
    status: 'active',
    defaultRule: { firstAmount: 1, firstFee: 5, nextAmount: 1, nextFee: 2 },
    specialRules: [
      { areas: ['新疆', '西藏'], firstAmount: 1, firstFee: 12, nextAmount: 1, nextFee: 8 }
    ],
    usedProductCount: 67,
    updatedAt: '2026-07-03 10:20:00',
    createdAt: '2026-02-20 09:00:00'
  },
  {
    id: 10,
    name: '电子产品特惠',
    type: 'piece',
    status: 'active',
    defaultRule: { firstAmount: 1, firstFee: 0, nextAmount: 1, nextFee: 0 },
    specialRules: [],
    usedProductCount: 34,
    updatedAt: '2026-07-01 09:00:00',
    createdAt: '2026-03-15 10:00:00'
  },
  {
    id: 11,
    name: '建材重货按重量',
    type: 'weight',
    status: 'active',
    defaultRule: { firstAmount: 10, firstFee: 30, nextAmount: 10, nextFee: 15 },
    specialRules: [
      { areas: ['新疆', '西藏', '青海'], firstAmount: 10, firstFee: 60, nextAmount: 10, nextFee: 35 }
    ],
    usedProductCount: 11,
    updatedAt: '2026-06-28 11:00:00',
    createdAt: '2026-04-10 08:00:00'
  },
  {
    id: 12,
    name: '小饰品免邮',
    type: 'piece',
    status: 'disabled',
    defaultRule: { firstAmount: 1, firstFee: 0, nextAmount: 1, nextFee: 0 },
    specialRules: [],
    usedProductCount: 0,
    updatedAt: '2026-06-25 16:30:00',
    createdAt: '2026-05-01 09:00:00'
  },
  {
    id: 13,
    name: '海外代购运费',
    type: 'piece',
    status: 'active',
    defaultRule: { firstAmount: 1, firstFee: 50, nextAmount: 1, nextFee: 25 },
    specialRules: [],
    usedProductCount: 3,
    updatedAt: '2026-06-20 10:00:00',
    createdAt: '2026-05-10 10:00:00'
  },
  {
    id: 14,
    name: '东北地区特惠',
    type: 'piece',
    status: 'active',
    defaultRule: { firstAmount: 1, firstFee: 12, nextAmount: 1, nextFee: 6 },
    specialRules: [
      { areas: ['辽宁', '吉林', '黑龙江'], firstAmount: 1, firstFee: 6, nextAmount: 1, nextFee: 3 }
    ],
    usedProductCount: 19,
    updatedAt: '2026-06-18 15:00:00',
    createdAt: '2026-05-20 09:00:00'
  },
  {
    id: 15,
    name: '大家电配送',
    type: 'volume',
    status: 'active',
    defaultRule: { firstAmount: 1, firstFee: 40, nextAmount: 1, nextFee: 20 },
    specialRules: [
      { areas: ['新疆', '西藏', '内蒙古', '甘肃'], firstAmount: 1, firstFee: 80, nextAmount: 1, nextFee: 50 }
    ],
    usedProductCount: 7,
    updatedAt: '2026-06-15 09:00:00',
    createdAt: '2026-06-01 08:00:00'
  }
]
