// ==================== 钱包管理 - 共享类型定义 ====================

export interface WalletConfig {
  enabled: boolean
  name: string
  minRecharge: number
  maxRecharge: number
  receiveMerchantId: string
  receiveMerchantName: string
  withdrawEnabled: boolean
  withdrawNeedReview: boolean
  withdrawMethod: string
  feeType: 'fixed' | 'percent'
  feeValue: number
  minWithdraw: number
  maxWithdraw: number
  dailyWithdrawLimit: number
  minBalanceAfterWithdraw: number
}

export interface UserWallet {
  walletId: string
  uid: string
  phone: string
  balance: number
  principalBalance: number
  bonusBalance: number
  frozenAmount: number
  withdrawFrozenAmount: number
  totalRecharge: number
  totalConsume: number
  totalRefund: number
  status: 'normal' | 'frozen'
  openTime: string
  frozenReason?: string
}

export interface RechargeRecord {
  id: string
  rechargeNo: string
  uid: string
  phone: string
  amount: number
  receivedAmount: number
  bonusAmount?: number
  paymentStatus: 'pending' | 'paid' | 'failed' | 'closed'
  rechargeStatus: 'pending' | 'success' | 'failed'
  receiveMerchantName: string
  paymentTime: string
  payOrderNo?: string
  rechargeTime: string
  applyTime: string
  remark: string
}

export interface WithdrawRecord {
  id: string
  withdrawNo: string
  uid: string
  phone: string
  amount: number
  refundType: 'full' | 'partial'
  relatedOrderNo: string
  relatedRechargeNo?: string
  originalPayMethod: 'wechat' | 'alipay' | 'bank'
  fee: number
  actualAmount: number
  status: 'pending' | 'approved' | 'refunded' | 'rejected'
  operator: string
  applyTime: string
  completeTime: string
  rejectReason?: string
  partialRefundReason?: string
}

export interface BucketLog {
  bucketNo: string
  bucketTime: string
  deductAmount: number
  remainAmount: number
}

export interface WalletTransaction {
  id: string
  transactionNo: string
  uid: string
  phone: string
  type: 'recharge' | 'refund' | 'consume' | 'withdraw' | 'freeze'
  amount: number
  balance: number
  relatedNo: string
  merchant: string
  operator: string
  time: string
  remark: string
  bucketLogs?: BucketLog[]
}

export interface RechargePreset {
  id: string
  amount: number
  sort: number
}

export interface RechargeActivity {
  id: string
  name: string
  type: 'bonus' | 'discount'
  conditionAmount: number
  bonusAmount?: number
  discountPercent?: number
  startTime: string
  endTime: string
  perUserLimit: number
  dailyLimit: number
  enabled: boolean
}

export interface RechargePlan {
  id: string
  name: string
  enabled: boolean
  activeTime: string
  presets: RechargePreset[]
  allowCustom: boolean
  customMin: number
  customMax: number
  activities: RechargeActivity[]
}

export interface ConfigSnapshot {
  name: string
  enabled: boolean
  withdrawEnabled: boolean
  withdrawNeedReview: boolean
  withdrawMethod: string
  feeType: string
  feeValue: number
  minWithdraw: number
  maxWithdraw: number
}

export interface ConfigHistoryRecord {
  id: number
  operator: string
  operateTime: string
  snapshot: ConfigSnapshot
}

export interface RechargeBucket {
  type: 'principal' | 'bonus'
  originalAmount: number
  remainingAmount: number
  withdrawable: boolean
  sourceRule: string
  consumptions: { orderNo: string; type: string; amount: number; time: string }[]
}

export interface MerchantSign {
  id: string
  merchantName: string
  status: 'signed' | 'terminated'
  contactPerson: string
  contactPhone: string
  signTime: string
  terminateTime?: string
  remark?: string
  agreement?: string
}
