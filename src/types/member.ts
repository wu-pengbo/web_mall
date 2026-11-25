export type MemberStatus = 'normal' | 'disabled'
export type ActiveStatus = 'enabled' | 'disabled'
export type UpgradeMode = 'growth' | 'condition' | null
export type ConditionRelation = 'all' | 'any'
export type GrantStatus = 'success' | 'failed'
export type GrantTrigger = 'automatic' | 'manual'

export interface MemberTag {
  id: string
  name: string
  description: string
  status: ActiveStatus
  createdAt: string
  updatedAt: string
}

export interface LevelCondition {
  paidAmount: number
  validOrderCount: number
  relation: ConditionRelation
}

export interface MemberLevel {
  id: string
  name: string
  order: number
  isDefault: boolean
  status: ActiveStatus
  growthThreshold: number
  condition: LevelCondition
  description: string
  createdAt: string
  updatedAt: string
}

export interface MemberLevelLog {
  id: string
  fromLevelId: string
  toLevelId: string
  changeType: 'automatic' | 'manual'
  reason: string
  operator: string
  createdAt: string
}

export interface MemberGrowthLog {
  id: string
  changeValue: number
  beforeValue: number
  afterValue: number
  source: string
  relatedOrder: string
  remark: string
  createdAt: string
}

export interface Member {
  id: string
  nickname: string
  phone: string
  avatarColor: string
  registeredAt: string
  registerSource: string
  lastConsumedAt: string
  status: MemberStatus
  currentLevelId: string
  levelObtainedAt: string
  growthValue: number
  totalPaid: number
  validOrderCount: number
  tagIds: string[]
  levelLogs: MemberLevelLog[]
  growthLogs: MemberGrowthLog[]
}

export interface CouponOption {
  id: string
  name: string
  faceValue: number
  threshold: number
  stock: number
  validDays: number
  status: ActiveStatus
}

export interface MemberBenefit {
  id: string
  name: string
  couponId: string
  couponQuantity: number
  levelId: string
  status: ActiveStatus
  description: string
  createdAt: string
  updatedAt: string
}

export interface BenefitGrant {
  id: string
  memberId: string
  levelId: string
  benefitId: string
  couponId: string
  expectedQuantity: number
  actualQuantity: number
  status: GrantStatus
  triggerType: GrantTrigger
  triggerSourceId: string
  failureReason: string
  retryCount: number
  createdAt: string
  grantedAt: string
}

export interface MemberState {
  members: Member[]
  tags: MemberTag[]
  levels: MemberLevel[]
  coupons: CouponOption[]
  benefits: MemberBenefit[]
  grants: BenefitGrant[]
  upgradeMode: UpgradeMode
  growthPerYuan: number
}
