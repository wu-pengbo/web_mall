// ==================== 运费管理 - 共享类型定义（v3 简化版） ====================

/** 计费方式 */
export type ChargeType = 'piece' | 'weight' | 'amount'

/** 计费模式 */
export type BillingMode = 'tiered' | 'fixed'

/** 包邮模式 */
export type FreeShippingMode = 'all' | 'amount' | 'none'

/** 模板状态 */
export type FreightStatus = 'active' | 'disabled'

/** 运费规则 */
export interface FreightRule {
  firstQty: number
  firstFee: number
  additionalQty: number
  additionalFee: number
}

/** 运费模板 */
export interface FreightTemplate {
  id: string
  name: string
  chargeType: ChargeType
  billingMode: BillingMode
  fixedFee?: number
  freeShippingMode: FreeShippingMode        // 包邮模式：完全包邮/满额包邮/不包邮
  freeShippingThreshold?: number            // 满额包邮门槛
  freeShippingExcludeRemote: boolean        // 满额包邮时偏远除外？
  defaultRule: FreightRule                  // 默认运费
  remoteRule?: FreightRule                  // 偏远加收（可选）
  status: FreightStatus
  productCount: number
  createdAt: string
  updatedAt: string
}

// ==================== 标签映射 ====================

export const CHARGE_TYPE_LABEL: Record<ChargeType, string> = {
  piece: '按件数',
  weight: '按重量',
  amount: '按金额'
}

export const CHARGE_TYPE_UNIT: Record<ChargeType, string> = {
  piece: '件',
  weight: 'kg',
  amount: '元'
}

export const BILLING_MODE_LABEL: Record<BillingMode, string> = {
  tiered: '阶梯运费',
  fixed: '固定运费'
}

export const FREE_SHIPPING_MODE_LABEL: Record<FreeShippingMode, string> = {
  all: '完全包邮',
  amount: '满额包邮',
  none: '不包邮'
}

/** 内置偏远地区 */
export const DEFAULT_REMOTE_AREAS = ['新疆', '西藏', '内蒙古', '青海', '甘肃']
