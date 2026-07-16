// ==================== 运费管理 - 共享类型定义（v2） ====================

/** 计费维度 */
export type BillingDimension = 'quantity' | 'weight' | 'volume' | 'amount'

/** 多商品合并计算方式 */
export type CombineMode = 'by_order' | 'by_sku' | 'by_template'

/** 模板状态 */
export type FreightStatus = 'active' | 'disabled'

// ==================== 区域组 ====================

/** 区域组（可复用，绑定到多条运费规则） */
export interface RegionGroup {
  id: string
  name: string           // "华东"、"偏远地区"
  regions: string[]      // ['上海','江苏','浙江','安徽']
}

// ==================== 运费规则 ====================

/** 单条运费规则（首/续 + 上限） */
export interface FreightRule {
  firstQty: number       // 首件/重/体积/金额
  firstFee: number       // 首费
  additionalQty: number  // 续件/重/体积/金额
  additionalFee: number  // 续费
  feeCap?: number        // 运费上限（可选，封顶金额）
}

/** 区域运费规则（绑定一个区域组） */
export interface RegionRule extends FreightRule {
  regionGroupId: string  // 关联的区域组 ID
}

// ==================== 包邮规则 ====================

/** 包邮条件 */
export interface FreeShippingRule {
  enabled: boolean
  conditionType: 'amount' | 'quantity' | 'none'  // 满金额 / 满件数 / 无条件包邮
  threshold: number      // 门槛值（满 X 元/件）
  applyTo: 'all' | 'group'   // 全国 / 指定区域
  regionGroupId?: string     // 指定区域组 ID（applyTo='group' 时）
  excludeRemote: boolean     // 偏远地区不参与包邮
  remoteRegionGroupId?: string  // 偏远地区组 ID
}

// ==================== 运费模板（主） ====================

/** 运费模板 */
export interface ShippingTemplate {
  id: string
  name: string
  billingDimension: BillingDimension
  combineMode: CombineMode
  freeShipping: FreeShippingRule
  defaultRule: FreightRule        // 默认运费（全国兜底）
  regionRules: RegionRule[]       // 区域运费规则（多条）
  excludeRegions: string[]        // 不配送地区（直接拦截下单）
  status: FreightStatus
  productCount: number
  createdAt: string
  updatedAt: string
}

// ==================== 标签映射 ====================

export const BILLING_DIMENSION_LABEL: Record<BillingDimension, string> = {
  quantity: '按件数',
  weight: '按重量',
  volume: '按体积',
  amount: '按金额'
}

export const BILLING_DIMENSION_UNIT: Record<BillingDimension, string> = {
  quantity: '件',
  weight: 'kg',
  volume: 'm³',
  amount: '元'
}

export const COMBINE_MODE_LABEL: Record<CombineMode, string> = {
  by_order: '合并计算（整单）',
  by_sku: '独立计算（每件）',
  by_template: '按模板合并'
}

export const FREE_SHIPPING_TYPE_LABEL: Record<string, string> = {
  amount: '满金额包邮',
  quantity: '满件数包邮',
  none: '无条件包邮'
}
