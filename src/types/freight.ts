// ==================== 运费管理 - 共享类型 ====================

/** 计费方式 */
export type ChargeType = 'BY_QUANTITY' | 'BY_WEIGHT' | 'BY_ORDER_AMOUNT' | 'FIXED'

/** 模板状态 */
export type FreightStatus = 'active' | 'disabled'

// --- 各计费方式的配置接口 ---

export interface QuantityConfig {
  firstQty: number
  firstFee: number
  additionalQty: number
  additionalFee: number
}

export interface WeightConfig {
  firstWeight: number
  firstWeightUnit: 'kg' | 'g'
  firstFee: number
  additionalWeight: number
  additionalWeightUnit: 'kg' | 'g'
  additionalFee: number
}

export interface AmountRange {
  min: number
  max: number | null
  fee: number
}

export interface AmountConfig {
  amountRanges: AmountRange[]
}

export interface FixedConfig {
  fixedFee: number
}

export type ChargeConfig = QuantityConfig | WeightConfig | AmountConfig | FixedConfig

/** 运费规则（默认规则或特殊地区规则） */
export interface ShippingRule {
  id?: number
  regions: string[]
  isFreeShipping: boolean
  freeThreshold: number | null   // null = 无条件包邮, >0 = 满额包邮
  chargeConfig: ChargeConfig
}

/** 运费模板 */
export interface FreightTemplate {
  id: string
  name: string
  chargeType: ChargeType
  defaultRule: ShippingRule
  specialRules: ShippingRule[]
  status: FreightStatus
  productCount: number
  createdAt: string
  updatedAt: string
}

// ==================== 工具函数 ====================

/** 获取计费方式的默认配置 */
export function getDefaultChargeConfig(chargeType: ChargeType): ChargeConfig {
  switch (chargeType) {
    case 'BY_QUANTITY':
      return { firstQty: 1, firstFee: 8, additionalQty: 1, additionalFee: 3 } as QuantityConfig
    case 'BY_WEIGHT':
      return { firstWeight: 1, firstWeightUnit: 'kg', firstFee: 10, additionalWeight: 0.5, additionalWeightUnit: 'kg', additionalFee: 5 } as WeightConfig
    case 'BY_ORDER_AMOUNT':
      return { amountRanges: [{ min: 0, max: null, fee: 10 }] } as AmountConfig
    case 'FIXED':
      return { fixedFee: 15 } as FixedConfig
  }
}

/** 生成一个空的默认规则 */
export function createDefaultRule(chargeType: ChargeType): ShippingRule {
  return {
    regions: ['全国'],
    isFreeShipping: false,
    freeThreshold: null,
    chargeConfig: getDefaultChargeConfig(chargeType)
  }
}

/** 生成一个空的特殊规则 */
export function createSpecialRule(chargeType: ChargeType): ShippingRule {
  return {
    regions: [],
    isFreeShipping: false,
    freeThreshold: null,
    chargeConfig: getDefaultChargeConfig(chargeType)
  }
}

// ==================== 标签映射 ====================

export const CHARGE_TYPE_LABEL: Record<ChargeType, string> = {
  BY_QUANTITY: '按件计费',
  BY_WEIGHT: '按重量计费',
  BY_ORDER_AMOUNT: '按金额阶梯',
  FIXED: '固定邮费'
}

/** 获取计费配置的文字描述 */
export function getChargeConfigSummary(chargeType: ChargeType, config: ChargeConfig): string {
  switch (chargeType) {
    case 'BY_QUANTITY': {
      const c = config as QuantityConfig
      return `首${c.firstQty}件 / ${c.firstFee}元，续${c.additionalQty}件 / ${c.additionalFee}元`
    }
    case 'BY_WEIGHT': {
      const c = config as WeightConfig
      const u1 = c.firstWeightUnit
      const u2 = c.additionalWeightUnit
      return `首重${c.firstWeight}${u1} / ${c.firstFee}元，续重${c.additionalWeight}${u2} / ${c.additionalFee}元`
    }
    case 'BY_ORDER_AMOUNT': {
      const c = config as AmountConfig
      return c.amountRanges.map(r => {
        const maxStr = r.max === null ? '以上' : `～${r.max}元`
        return `${r.min}${maxStr}: ${r.fee}元`
      }).join('；')
    }
    case 'FIXED': {
      const c = config as FixedConfig
      return `固定运费 ${c.fixedFee} 元`
    }
  }
}
