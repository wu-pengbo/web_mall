// ==================== 运费管理 - 共享 Mock 数据（v2） ====================
import type { RegionGroup, ShippingTemplate } from '../types/freight'

/** 全国省份列表 */
export const ALL_PROVINCES = [
  '北京', '天津', '上海', '重庆',
  '河北', '山西', '辽宁', '吉林', '黑龙江', '江苏', '浙江', '安徽',
  '福建', '江西', '山东', '河南', '湖北', '湖南', '广东', '广西',
  '海南', '四川', '贵州', '云南', '西藏', '陕西', '甘肃', '青海',
  '宁夏', '新疆', '内蒙古',
  '台湾', '香港', '澳门'
]

/** 预设区域组（系统内置，可扩展） */
export const mockRegionGroups: RegionGroup[] = [
  { id: 'rg_east',    name: '华东地区',   regions: ['上海', '江苏', '浙江', '安徽', '山东'] },
  { id: 'rg_south',   name: '华南地区',   regions: ['广东', '广西', '福建', '海南'] },
  { id: 'rg_north',   name: '华北地区',   regions: ['北京', '天津', '河北', '山西', '内蒙古'] },
  { id: 'rg_central', name: '华中地区',   regions: ['河南', '湖北', '湖南', '江西'] },
  { id: 'rg_northeast', name: '东北地区', regions: ['辽宁', '吉林', '黑龙江'] },
  { id: 'rg_southwest', name: '西南地区', regions: ['四川', '重庆', '贵州', '云南', '西藏'] },
  { id: 'rg_northwest', name: '西北地区', regions: ['陕西', '甘肃', '青海', '宁夏', '新疆'] },
  { id: 'rg_remote',  name: '偏远地区',   regions: ['新疆', '西藏', '内蒙古', '青海', '甘肃'] },
  { id: 'rg_hmt',     name: '港澳台',     regions: ['香港', '澳门', '台湾'] },
]

/** 区域组 ID → 名称映射 */
export const regionGroupNameMap = Object.fromEntries(
  mockRegionGroups.map(g => [g.id, g.name])
) as Record<string, string>

/** 运费模板 mock 数据 */
export const mockShippingTemplates: ShippingTemplate[] = [
  {
    id: 'tpl_001',
    name: '全国包邮',
    billingDimension: 'quantity',
    combineMode: 'by_order',
    freeShipping: { enabled: true, conditionType: 'none', threshold: 0, applyTo: 'all', excludeRemote: false },
    defaultRule: { firstQty: 1, firstFee: 0, additionalQty: 1, additionalFee: 0 },
    regionRules: [],
    excludeRegions: [],
    status: 'active',
    productCount: 128,
    createdAt: '2026-01-05 09:00:00',
    updatedAt: '2026-07-15 10:30:00'
  },
  {
    id: 'tpl_002',
    name: '满99包邮（偏远加收）',
    billingDimension: 'quantity',
    combineMode: 'by_order',
    freeShipping: {
      enabled: true, conditionType: 'amount', threshold: 99,
      applyTo: 'all', excludeRemote: true, remoteRegionGroupId: 'rg_remote'
    },
    defaultRule: { firstQty: 1, firstFee: 10, additionalQty: 1, additionalFee: 5 },
    regionRules: [
      { regionGroupId: 'rg_remote', firstQty: 1, firstFee: 20, additionalQty: 1, additionalFee: 15 }
    ],
    excludeRegions: [],
    status: 'active',
    productCount: 56,
    createdAt: '2026-01-10 10:00:00',
    updatedAt: '2026-07-14 14:20:00'
  },
  {
    id: 'tpl_003',
    name: '大件商品按重量',
    billingDimension: 'weight',
    combineMode: 'by_sku',
    freeShipping: { enabled: false, conditionType: 'none', threshold: 0, applyTo: 'all', excludeRemote: false },
    defaultRule: { firstQty: 1, firstFee: 15, additionalQty: 1, additionalFee: 8 },
    regionRules: [
      { regionGroupId: 'rg_remote', firstQty: 1, firstFee: 30, additionalQty: 1, additionalFee: 20 }
    ],
    excludeRegions: [],
    status: 'active',
    productCount: 23,
    createdAt: '2026-02-01 08:00:00',
    updatedAt: '2026-07-12 09:15:00'
  },
  {
    id: 'tpl_004',
    name: '家具体积计费',
    billingDimension: 'volume',
    combineMode: 'by_sku',
    freeShipping: { enabled: false, conditionType: 'none', threshold: 0, applyTo: 'all', excludeRemote: false },
    defaultRule: { firstQty: 1, firstFee: 20, additionalQty: 1, additionalFee: 10 },
    regionRules: [
      { regionGroupId: 'rg_remote', firstQty: 1, firstFee: 50, additionalQty: 1, additionalFee: 30, feeCap: 120 }
    ],
    excludeRegions: ['台湾', '香港', '澳门'],
    status: 'active',
    productCount: 8,
    createdAt: '2026-02-15 09:00:00',
    updatedAt: '2026-07-10 16:45:00'
  },
  {
    id: 'tpl_005',
    name: '江浙沪满49包邮',
    billingDimension: 'quantity',
    combineMode: 'by_order',
    freeShipping: {
      enabled: true, conditionType: 'amount', threshold: 49,
      applyTo: 'group', regionGroupId: 'rg_east', excludeRemote: false
    },
    defaultRule: { firstQty: 1, firstFee: 8, additionalQty: 1, additionalFee: 4 },
    regionRules: [],
    excludeRegions: [],
    status: 'active',
    productCount: 42,
    createdAt: '2026-03-01 10:00:00',
    updatedAt: '2026-07-08 11:30:00'
  },
  {
    id: 'tpl_006',
    name: '生鲜冷链运费',
    billingDimension: 'weight',
    combineMode: 'by_order',
    freeShipping: { enabled: false, conditionType: 'none', threshold: 0, applyTo: 'all', excludeRemote: false },
    defaultRule: { firstQty: 1, firstFee: 18, additionalQty: 1, additionalFee: 12, feeCap: 80 },
    regionRules: [
      { regionGroupId: 'rg_remote', firstQty: 1, firstFee: 35, additionalQty: 1, additionalFee: 25 },
      { regionGroupId: 'rg_hmt', firstQty: 1, firstFee: 50, additionalQty: 1, additionalFee: 30 }
    ],
    excludeRegions: [],
    status: 'active',
    productCount: 15,
    createdAt: '2026-03-10 09:00:00',
    updatedAt: '2026-07-06 08:00:00'
  },
  {
    id: 'tpl_007',
    name: '满99包邮（旧版）',
    billingDimension: 'quantity',
    combineMode: 'by_order',
    freeShipping: { enabled: true, conditionType: 'amount', threshold: 99, applyTo: 'all', excludeRemote: false },
    defaultRule: { firstQty: 1, firstFee: 10, additionalQty: 1, additionalFee: 5 },
    regionRules: [],
    excludeRegions: [],
    status: 'disabled',
    productCount: 0,
    createdAt: '2026-01-20 09:00:00',
    updatedAt: '2026-06-30 17:00:00'
  },
  {
    id: 'tpl_008',
    name: '图书音像标准',
    billingDimension: 'quantity',
    combineMode: 'by_order',
    freeShipping: { enabled: false, conditionType: 'none', threshold: 0, applyTo: 'all', excludeRemote: false },
    defaultRule: { firstQty: 1, firstFee: 5, additionalQty: 1, additionalFee: 2 },
    regionRules: [
      { regionGroupId: 'rg_remote', firstQty: 1, firstFee: 12, additionalQty: 1, additionalFee: 8 }
    ],
    excludeRegions: [],
    status: 'active',
    productCount: 67,
    createdAt: '2026-02-20 09:00:00',
    updatedAt: '2026-07-03 10:20:00'
  },
  {
    id: 'tpl_009',
    name: '电子产品全国包邮',
    billingDimension: 'quantity',
    combineMode: 'by_order',
    freeShipping: { enabled: true, conditionType: 'none', threshold: 0, applyTo: 'all', excludeRemote: false },
    defaultRule: { firstQty: 1, firstFee: 0, additionalQty: 1, additionalFee: 0 },
    regionRules: [],
    excludeRegions: [],
    status: 'active',
    productCount: 34,
    createdAt: '2026-03-15 10:00:00',
    updatedAt: '2026-07-01 09:00:00'
  },
  {
    id: 'tpl_010',
    name: '建材重货按重量',
    billingDimension: 'weight',
    combineMode: 'by_sku',
    freeShipping: { enabled: false, conditionType: 'none', threshold: 0, applyTo: 'all', excludeRemote: false },
    defaultRule: { firstQty: 10, firstFee: 30, additionalQty: 10, additionalFee: 15 },
    regionRules: [
      { regionGroupId: 'rg_remote', firstQty: 10, firstFee: 60, additionalQty: 10, additionalFee: 35 }
    ],
    excludeRegions: ['台湾', '香港', '澳门'],
    status: 'active',
    productCount: 11,
    createdAt: '2026-04-10 08:00:00',
    updatedAt: '2026-06-28 11:00:00'
  },
  {
    id: 'tpl_011',
    name: '小饰品免邮（已停用）',
    billingDimension: 'quantity',
    combineMode: 'by_order',
    freeShipping: { enabled: true, conditionType: 'none', threshold: 0, applyTo: 'all', excludeRemote: false },
    defaultRule: { firstQty: 1, firstFee: 0, additionalQty: 1, additionalFee: 0 },
    regionRules: [],
    excludeRegions: [],
    status: 'disabled',
    productCount: 0,
    createdAt: '2026-05-01 09:00:00',
    updatedAt: '2026-06-25 16:30:00'
  },
  {
    id: 'tpl_012',
    name: '东北特惠（满2件包邮）',
    billingDimension: 'quantity',
    combineMode: 'by_order',
    freeShipping: {
      enabled: true, conditionType: 'quantity', threshold: 2,
      applyTo: 'group', regionGroupId: 'rg_northeast', excludeRemote: false
    },
    defaultRule: { firstQty: 1, firstFee: 12, additionalQty: 1, additionalFee: 6 },
    regionRules: [
      { regionGroupId: 'rg_northeast', firstQty: 1, firstFee: 6, additionalQty: 1, additionalFee: 3 }
    ],
    excludeRegions: [],
    status: 'active',
    productCount: 19,
    createdAt: '2026-05-20 09:00:00',
    updatedAt: '2026-06-18 15:00:00'
  },
  {
    id: 'tpl_013',
    name: '大家电配送（有上限）',
    billingDimension: 'volume',
    combineMode: 'by_sku',
    freeShipping: { enabled: false, conditionType: 'none', threshold: 0, applyTo: 'all', excludeRemote: false },
    defaultRule: { firstQty: 1, firstFee: 40, additionalQty: 1, additionalFee: 20, feeCap: 100 },
    regionRules: [
      { regionGroupId: 'rg_remote', firstQty: 1, firstFee: 80, additionalQty: 1, additionalFee: 50, feeCap: 200 }
    ],
    excludeRegions: ['台湾', '香港', '澳门'],
    status: 'active',
    productCount: 7,
    createdAt: '2026-06-01 08:00:00',
    updatedAt: '2026-06-15 09:00:00'
  },
  {
    id: 'tpl_014',
    name: '按金额阶梯运费',
    billingDimension: 'amount',
    combineMode: 'by_order',
    freeShipping: {
      enabled: true, conditionType: 'amount', threshold: 199,
      applyTo: 'all', excludeRemote: true, remoteRegionGroupId: 'rg_remote'
    },
    defaultRule: { firstQty: 50, firstFee: 8, additionalQty: 50, additionalFee: 4 },
    regionRules: [
      { regionGroupId: 'rg_remote', firstQty: 50, firstFee: 15, additionalQty: 50, additionalFee: 8 }
    ],
    excludeRegions: [],
    status: 'active',
    productCount: 12,
    createdAt: '2026-06-10 09:00:00',
    updatedAt: '2026-06-20 10:00:00'
  }
]
