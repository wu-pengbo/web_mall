// ==================== 钱包管理 - 共享数据 ====================
import type { WalletConfig, UserWallet, RechargeRecord, WithdrawRecord, WalletTransaction, RechargePlan, MerchantSign, ConfigHistoryRecord } from '../types/wallet'

/** 商户列表（各模块通用） */
export const mockMerchants = [
  { id: 'mer_001', name: '平台自营商户' },
  { id: 'mer_002', name: 'XX数码旗舰店' },
  { id: 'mer_003', name: 'XX服饰专营店' },
  { id: 'mer_004', name: 'XX食品店' },
]
