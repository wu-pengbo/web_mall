// ==================== 运费管理 - 共享类型定义 ====================

/** 计费方式 */
export type ChargeType = 'piece' | 'weight' | 'volume'

/** 运费规则（首/续） */
export interface FreightRule {
  firstAmount: number
  firstFee: number
  nextAmount: number
  nextFee: number
}

/** 特殊地区规则 */
export interface AreaRule extends FreightRule {
  areas: string[]
}

/** 运费模板状态 */
export type FreightStatus = 'active' | 'disabled'

/** 运费模板 */
export interface FreightTemplate {
  id: number
  name: string
  type: ChargeType
  status: FreightStatus
  defaultRule: FreightRule
  specialRules: AreaRule[]
  usedProductCount: number
  updatedAt: string
  createdAt: string
}

/** 计费方式标签映射 */
export const CHARGE_TYPE_LABEL: Record<ChargeType, string> = {
  piece: '按件数',
  weight: '按重量',
  volume: '按体积'
}

/** 计费方式单位映射 */
export const CHARGE_TYPE_UNIT: Record<ChargeType, string> = {
  piece: '件',
  weight: 'kg',
  volume: 'm³'
}
