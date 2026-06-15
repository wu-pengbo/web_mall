<script setup lang="ts">
import { ref, reactive, computed } from 'vue'

// ==================== 侧边栏导航（分组结构，对齐积分管理） ====================
const menuList = [
  {
    key: 'config',
    label: '配置管理',
    children: [
      { key: 'wallet_config', label: '钱包设置' },
    ],
  },
  {
    key: 'business',
    label: '业务管理',
    children: [
      { key: 'wallet_overview', label: '钱包概览' },
      { key: 'wallet_user', label: '用户钱包' },
    ],
  },
  {
    key: 'transaction',
    label: '交易管理',
    children: [
      { key: 'wallet_recharge', label: '充值管理' },
      { key: 'wallet_withdraw', label: '提现管理' },
      { key: 'wallet_ledger', label: '交易流水' },
    ],
  },
]

const activeMenu = ref('wallet_config')
const expandedMenus = ref<string[]>(['config', 'business', 'transaction'])

const toggleExpand = (key: string) => {
  const idx = expandedMenus.value.indexOf(key)
  if (idx > -1) {
    expandedMenus.value.splice(idx, 1)
  } else {
    expandedMenus.value.push(key)
  }
}

const handleMenuClick = (menuKey: string) => {
  activeMenu.value = menuKey
}

// ==================== 接口定义 ====================
interface WalletConfig {
  enabled: boolean
  name: string
  minRecharge: number
  maxRecharge: number
  receiveMerchantId: string
  receiveMerchantName: string
  withdrawEnabled: boolean
  withdrawNeedReview: boolean
  feeType: 'fixed' | 'percent'
  feeValue: number
  minWithdraw: number
  maxWithdraw: number
  dailyWithdrawLimit: number
  minBalanceAfterWithdraw: number
}

interface UserWallet {
  walletId: string
  uid: string
  phone: string
  balance: number
  frozenAmount: number
  totalRecharge: number
  totalConsume: number
  totalRefund: number
  status: 'normal' | 'frozen'
  openTime: string
  frozenReason?: string
}

interface RechargeRecord {
  id: string
  rechargeNo: string
  uid: string
  phone: string
  amount: number
  paymentStatus: 'pending' | 'paid' | 'failed' | 'closed'
  rechargeStatus: 'pending' | 'success' | 'failed'
  receiveMerchantName: string
  paymentTime: string
  rechargeTime: string
  applyTime: string
  remark: string
}

interface WithdrawRecord {
  id: string
  withdrawNo: string
  uid: string
  phone: string
  amount: number
  refundType: 'full' | 'partial'
  relatedOrderNo: string
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

interface WalletTransaction {
  id: string
  transactionNo: string
  uid: string
  phone: string
  type: 'recharge' | 'consume' | 'refund' | 'freeze' | 'unfreeze' | 'adjust'
  amount: number
  balance: number
  relatedNo: string
  merchant: string
  operator: string
  time: string
  remark: string
}

// ==================== Mock 商户列表 ====================
const mockMerchants = [
  { id: 'mer_001', name: '平台自营商户' },
  { id: 'mer_002', name: 'XX数码旗舰店' },
  { id: 'mer_003', name: 'XX服饰专营店' },
  { id: 'mer_004', name: 'XX食品店' },
]

// ==================== 模块1：钱包设置 ====================
const walletConfig = reactive<WalletConfig>({
  enabled: false,
  name: '我的钱包',
  minRecharge: 1,
  maxRecharge: 50000,
  receiveMerchantId: '',
  receiveMerchantName: '',
  withdrawEnabled: true,
  withdrawNeedReview: true,
  feeType: 'fixed',
  feeValue: 0,
  minWithdraw: 10,
  maxWithdraw: 50000,
  dailyWithdrawLimit: 100000,
  minBalanceAfterWithdraw: 0,
})

const configSaved = ref(false)
const editingConfig = ref(false)
type WalletConfigType = typeof walletConfig
const configBackup = ref<WalletConfigType | null>(null)

const startEditConfig = () => {
  configBackup.value = JSON.parse(JSON.stringify(walletConfig))
  editingConfig.value = true
}

const cancelEditConfig = () => {
  if (configBackup.value) {
    Object.assign(walletConfig, configBackup.value)
  }
  editingConfig.value = false
}

const saveConfig = () => {
  const merchant = mockMerchants.find(m => m.id === walletConfig.receiveMerchantId)
  walletConfig.receiveMerchantName = merchant ? merchant.name : ''
  configSaved.value = true
  editingConfig.value = false
  alert('钱包配置保存成功！')
  console.log('Wallet config saved:', JSON.parse(JSON.stringify(walletConfig)))
}

// ==================== 钱包设置-修改记录 ====================
interface ConfigSnapshot {
  name: string
  enabled: boolean
  withdrawEnabled: boolean
  withdrawNeedReview: boolean
  feeType: string
  feeValue: number
  minWithdraw: number
  maxWithdraw: number
}

interface ConfigHistoryRecord {
  id: number
  operator: string
  operateTime: string
  snapshot: ConfigSnapshot
}

const configHistoryList = ref<ConfigHistoryRecord[]>([
  {
    id: 1,
    operator: '张三',
    operateTime: '2026-06-10 14:30',
    snapshot: { name: '我的钱包', enabled: true, withdrawEnabled: true, withdrawNeedReview: true, feeType: 'fixed', feeValue: 0, minWithdraw: 10, maxWithdraw: 50000 },
  },
  {
    id: 2,
    operator: '李四',
    operateTime: '2026-06-09 10:00',
    snapshot: { name: '零钱', enabled: false, withdrawEnabled: false, withdrawNeedReview: false, feeType: 'percent', feeValue: 0.1, minWithdraw: 100, maxWithdraw: 10000 },
  },
])

const configHistoryExpandedId = ref<number | null>(null)
const configHistorySectionOpen = ref(false)

const toggleConfigHistory = (id: number) => {
  configHistoryExpandedId.value = configHistoryExpandedId.value === id ? null : id
}

// ==================== 模块2：钱包概览 ====================
const mockOverviewStats = [
  { label: '平台总余额', value: '¥1,286,532.80', change: '+5.2%', up: true },
  { label: '总充值金额', value: '¥3,580,000.00', change: '+12.3%', up: true },
  { label: '总消费金额', value: '¥2,150,000.00', change: '+8.7%', up: true },
  { label: '总退款金额', value: '¥143,467.20', change: '-2.1%', up: false },
  { label: '待审核退款', value: '3 笔', change: '', up: true },
  { label: '钱包用户数', value: '8,356 人', change: '+3.8%', up: true },
  { label: '冻结账户数', value: '23 个', change: '-1', up: false },
  { label: '今日充值', value: '¥45,230.00', change: '+15.6%', up: true },
]

const trendData = [
  { month: '1月', recharge: 320000, consume: 280000, refund: 18000 },
  { month: '2月', recharge: 380000, consume: 310000, refund: 22000 },
  { month: '3月', recharge: 350000, consume: 290000, refund: 20000 },
  { month: '4月', recharge: 420000, consume: 350000, refund: 25000 },
  { month: '5月', recharge: 480000, consume: 410000, refund: 28000 },
  { month: '6月', recharge: 450000, consume: 380000, refund: 23000 },
]

const maxTrend = computed(() => {
  let max = 0
  trendData.forEach(d => {
    ;['recharge', 'consume', 'refund'].forEach(k => {
      if (d[k as keyof typeof d] > max) max = d[k as keyof typeof d]
    })
  })
  return max
})

// ==================== 模块3：用户钱包 ====================
const mockUserWallets = ref<UserWallet[]>([
  { walletId: 'WLT-00001', uid: 'u10001', phone: '138****1234', balance: 1280.50, frozenAmount: 200, totalRecharge: 5000, totalConsume: 3500, totalRefund: 219.50, status: 'normal', openTime: '2026-01-15 10:30:00' },
  { walletId: 'WLT-00002', uid: 'u10002', phone: '139****5678', balance: 3560.00, frozenAmount: 0, totalRecharge: 8000, totalConsume: 4400, totalRefund: 40, status: 'normal', openTime: '2026-01-20 14:20:00' },
  { walletId: 'WLT-00003', uid: 'u10003', phone: '137****9012', balance: 89.50, frozenAmount: 0, totalRecharge: 1000, totalConsume: 910.50, totalRefund: 0, status: 'normal', openTime: '2026-02-03 09:15:00' },
  { walletId: 'WLT-00004', uid: 'u10004', phone: '136****3456', balance: 5200.00, frozenAmount: 1500, totalRecharge: 10000, totalConsume: 3300, totalRefund: 0, status: 'frozen', openTime: '2026-02-10 16:45:00', frozenReason: '疑似异常交易' },
  { walletId: 'WLT-00005', uid: 'u10005', phone: '135****7890', balance: 800.00, frozenAmount: 0, totalRecharge: 2000, totalConsume: 1200, totalRefund: 0, status: 'normal', openTime: '2026-03-01 11:00:00' },
  { walletId: 'WLT-00006', uid: 'u10006', phone: '134****2345', balance: 12500.00, frozenAmount: 500, totalRecharge: 20000, totalConsume: 7000, totalRefund: 0, status: 'normal', openTime: '2026-03-12 08:30:00' },
  { walletId: 'WLT-00007', uid: 'u10007', phone: '133****6789', balance: 0, frozenAmount: 0, totalRecharge: 500, totalConsume: 500, totalRefund: 0, status: 'normal', openTime: '2026-04-05 13:20:00' },
  { walletId: 'WLT-00008', uid: 'u10008', phone: '132****0123', balance: 6800.00, frozenAmount: 0, totalRecharge: 10000, totalConsume: 3000, totalRefund: 200, status: 'frozen', openTime: '2026-04-18 10:00:00', frozenReason: '用户主动申请冻结' },
])

const walletSearchForm = reactive({ keyword: '', status: '' })

const filteredWallets = computed(() => {
  return mockUserWallets.value.filter(w => {
    const kw = walletSearchForm.keyword
    const matchKw = !kw || w.walletId.includes(kw) || w.uid.includes(kw) || w.phone.includes(kw)
    const matchStatus = !walletSearchForm.status || w.status === walletSearchForm.status
    return matchKw && matchStatus
  })
})

const userFlowModal = ref(false)
const userFlowWallet = ref<UserWallet | null>(null)
const userFlowTxs = ref<WalletTransaction[]>([])

const showUserFlow = (wallet: UserWallet) => {
  userFlowWallet.value = wallet
  userFlowTxs.value = mockTransactions.value.filter(tx => tx.uid === wallet.uid).slice(0, 20)
  userFlowModal.value = true
}

const freezeModal = ref(false)
const freezeWalletTarget = ref<UserWallet | null>(null)
const freezeReason = ref('')

const showFreezeModal = (wallet: UserWallet) => {
  freezeWalletTarget.value = wallet
  freezeReason.value = ''
  freezeModal.value = true
}

const confirmFreeze = () => {
  if (!freezeWalletTarget.value || !freezeReason.value) return
  const target = mockUserWallets.value.find(w => w.walletId === freezeWalletTarget.value!.walletId)
  if (target) {
    target.status = 'frozen'
    target.frozenReason = freezeReason.value
  }
  freezeModal.value = false
  alert(`钱包 ${freezeWalletTarget.value.walletId} 已冻结`)
}

const showUnfreezeModal = (wallet: UserWallet) => {
  if (!confirm(`确定解冻钱包 ${wallet.walletId}？`)) return
  const target = mockUserWallets.value.find(w => w.walletId === wallet.walletId)
  if (target) {
    target.status = 'normal'
    target.frozenReason = undefined
  }
  alert(`钱包 ${wallet.walletId} 已解冻`)
}

// ==================== 模块4：充值管理 ====================
const mockRechargeRecords = ref<RechargeRecord[]>([
  { id: '1', rechargeNo: 'RCH-20260611-001', uid: 'u10001', phone: '138****1234', amount: 1000, paymentStatus: 'paid', rechargeStatus: 'success', receiveMerchantName: '平台自营商户', paymentTime: '2026-06-11 10:30:15', rechargeTime: '2026-06-11 10:30:18', applyTime: '2026-06-11 10:30:00', remark: '' },
  { id: '2', rechargeNo: 'RCH-20260611-002', uid: 'u10002', phone: '139****5678', amount: 500, paymentStatus: 'paid', rechargeStatus: 'pending', receiveMerchantName: '平台自营商户', paymentTime: '2026-06-11 11:00:00', rechargeTime: '', applyTime: '2026-06-11 10:59:45', remark: '支付回调已收到，入账处理中' },
  { id: '3', rechargeNo: 'RCH-20260611-003', uid: 'u10005', phone: '135****7890', amount: 200, paymentStatus: 'pending', rechargeStatus: 'pending', receiveMerchantName: 'XX数码旗舰店', paymentTime: '', rechargeTime: '', applyTime: '2026-06-11 11:15:30', remark: '' },
  { id: '4', rechargeNo: 'RCH-20260611-004', uid: 'u10003', phone: '137****9012', amount: 3000, paymentStatus: 'failed', rechargeStatus: 'pending', receiveMerchantName: '平台自营商户', paymentTime: '', rechargeTime: '', applyTime: '2026-06-11 12:00:00', remark: '支付接口返回失败' },
  { id: '5', rechargeNo: 'RCH-20260610-001', uid: 'u10006', phone: '134****2345', amount: 5000, paymentStatus: 'paid', rechargeStatus: 'success', receiveMerchantName: '平台自营商户', paymentTime: '2026-06-10 09:20:00', rechargeTime: '2026-06-10 09:20:05', applyTime: '2026-06-10 09:19:50', remark: '' },
  { id: '6', rechargeNo: 'RCH-20260610-002', uid: 'u10007', phone: '133****6789', amount: 100, paymentStatus: 'closed', rechargeStatus: 'pending', receiveMerchantName: 'XX服饰专营店', paymentTime: '', rechargeTime: '', applyTime: '2026-06-10 15:00:00', remark: '用户超时关闭' },
  { id: '7', rechargeNo: 'RCH-20260609-001', uid: 'u10004', phone: '136****3456', amount: 10000, paymentStatus: 'paid', rechargeStatus: 'failed', receiveMerchantName: '平台自营商户', paymentTime: '2026-06-09 14:30:00', rechargeTime: '', applyTime: '2026-06-09 14:29:30', remark: '支付成功但入账异常，需人工处理' },
  { id: '8', rechargeNo: 'RCH-20260609-002', uid: 'u10008', phone: '132****0123', amount: 1500, paymentStatus: 'paid', rechargeStatus: 'success', receiveMerchantName: '平台自营商户', paymentTime: '2026-06-09 16:45:00', rechargeTime: '2026-06-09 16:45:03', applyTime: '2026-06-09 16:44:50', remark: '' },
])

const rechargeSearchForm = reactive({ keyword: '', paymentStatus: '', rechargeStatus: '' })

const filteredRecharges = computed(() => {
  return mockRechargeRecords.value.filter(r => {
    const kw = rechargeSearchForm.keyword
    const matchKw = !kw || r.rechargeNo.includes(kw) || r.uid.includes(kw) || r.phone.includes(kw)
    const matchPay = !rechargeSearchForm.paymentStatus || r.paymentStatus === rechargeSearchForm.paymentStatus
    const matchRech = !rechargeSearchForm.rechargeStatus || r.rechargeStatus === rechargeSearchForm.rechargeStatus
    return matchKw && matchPay && matchRech
  })
})

const rechargeDetailModal = ref(false)
const rechargeDetailItem = ref<RechargeRecord | null>(null)

const showRechargeDetail = (item: RechargeRecord) => {
  rechargeDetailItem.value = item
  rechargeDetailModal.value = true
}

const manualRecharge = (item: RechargeRecord) => {
  if (!confirm(`确认手动将 ¥${item.amount.toFixed(2)} 入账到用户 ${item.uid} 的钱包？`)) return
  item.rechargeStatus = 'success'
  item.rechargeTime = new Date().toLocaleString('zh-CN', { hour12: false })
  alert(`充值单 ${item.rechargeNo} 已手动入账成功`)
}

const paymentStatusLabel: Record<string, string> = {
  pending: '待支付', paid: '支付成功', failed: '支付失败', closed: '已关闭',
}
const rechargeStatusLabel: Record<string, string> = {
  pending: '待入账', success: '已入账', failed: '入账失败',
}

// ==================== 模块5：提现管理 ====================
const mockWithdrawRecords = ref<WithdrawRecord[]>([
  { id: '1', withdrawNo: 'WDR-20260611-001', uid: 'u10001', phone: '138****1234', amount: 200, refundType: 'full', relatedOrderNo: 'ORD-20260610-001', originalPayMethod: 'wechat', fee: 0, actualAmount: 200, status: 'pending', operator: '', applyTime: '2026-06-11 09:00:00', completeTime: '' },
  { id: '2', withdrawNo: 'WDR-20260611-002', uid: 'u10002', phone: '139****5678', amount: 500, refundType: 'partial', relatedOrderNo: 'ORD-20260608-003', originalPayMethod: 'alipay', fee: 2.50, actualAmount: 497.50, status: 'approved', operator: '张三', applyTime: '2026-06-11 10:30:00', completeTime: '', partialRefundReason: '商品部分退货' },
  { id: '3', withdrawNo: 'WDR-20260610-001', uid: 'u10005', phone: '135****7890', amount: 800, refundType: 'full', relatedOrderNo: 'ORD-20260605-002', originalPayMethod: 'wechat', fee: 0, actualAmount: 800, status: 'refunded', operator: '张三', applyTime: '2026-06-10 08:00:00', completeTime: '2026-06-10 14:30:00' },
  { id: '4', withdrawNo: 'WDR-20260610-002', uid: 'u10006', phone: '134****2345', amount: 1500, refundType: 'full', relatedOrderNo: 'ORD-20260609-001', originalPayMethod: 'bank', fee: 0, actualAmount: 1500, status: 'rejected', operator: '李四', applyTime: '2026-06-10 11:00:00', completeTime: '2026-06-10 16:00:00', rejectReason: '退款申请超出退货期限' },
  { id: '5', withdrawNo: 'WDR-20260609-001', uid: 'u10003', phone: '137****9012', amount: 89.50, refundType: 'full', relatedOrderNo: 'ORD-20260608-005', originalPayMethod: 'wechat', fee: 0, actualAmount: 89.50, status: 'refunded', operator: '系统', applyTime: '2026-06-09 15:00:00', completeTime: '2026-06-09 15:05:00' },
])

const withdrawSearchForm = reactive({ keyword: '', refundType: '', status: '' })

const filteredWithdraws = computed(() => {
  return mockWithdrawRecords.value.filter(w => {
    const kw = withdrawSearchForm.keyword
    const matchKw = !kw || w.withdrawNo.includes(kw) || w.uid.includes(kw) || w.phone.includes(kw) || w.relatedOrderNo.includes(kw)
    const matchType = !withdrawSearchForm.refundType || w.refundType === withdrawSearchForm.refundType
    const matchStatus = !withdrawSearchForm.status || w.status === withdrawSearchForm.status
    return matchKw && matchType && matchStatus
  })
})

const withdrawDetailModal = ref(false)
const withdrawDetailItem = ref<WithdrawRecord | null>(null)

const showWithdrawDetail = (item: WithdrawRecord) => {
  withdrawDetailItem.value = item
  withdrawDetailModal.value = true
}

const approveWithdraw = (item: WithdrawRecord) => {
  if (!confirm(`确认审核通过退款单 ${item.withdrawNo}？\n退款金额：¥${item.amount.toFixed(2)}`)) return
  item.status = 'approved'
  item.operator = '当前用户'
  alert(`退款单 ${item.withdrawNo} 已审核通过`)
}

const confirmRefund = (item: WithdrawRecord) => {
  if (!confirm(`确认已完成原路退回？\n退款金额：¥${item.actualAmount.toFixed(2)}`)) return
  item.status = 'refunded'
  item.completeTime = new Date().toLocaleString('zh-CN', { hour12: false })
  alert(`退款单 ${item.withdrawNo} 已完成退款`)
}

const rejectWithdraw = (item: WithdrawRecord) => {
  const reason = prompt('请输入拒绝原因：')
  if (!reason) return
  item.status = 'rejected'
  item.rejectReason = reason
  item.operator = '当前用户'
  item.completeTime = new Date().toLocaleString('zh-CN', { hour12: false })
  alert(`退款单 ${item.withdrawNo} 已拒绝`)
}

const withdrawStatusLabel: Record<string, string> = {
  pending: '待审核', approved: '审核通过待退款', refunded: '已退款', rejected: '已拒绝',
}
const payMethodLabel: Record<string, string> = {
  wechat: '微信', alipay: '支付宝', bank: '银行卡',
}

// ==================== 模块6：交易流水 ====================
const mockTransactions = ref<WalletTransaction[]>([
  { id: '1', transactionNo: 'TXN-20260611-001', uid: 'u10001', phone: '138****1234', type: 'recharge', amount: 1000, balance: 2280.50, relatedNo: 'RCH-20260611-001', merchant: '平台自营商户', operator: '系统', time: '2026-06-11 10:30:18', remark: '线上充值' },
  { id: '2', transactionNo: 'TXN-20260611-002', uid: 'u10001', phone: '138****1234', type: 'consume', amount: -89, balance: 2191.50, relatedNo: 'ORD-20260611-001', merchant: 'XX服饰专营店', operator: '系统', time: '2026-06-11 14:20:00', remark: '订单消费' },
  { id: '3', transactionNo: 'TXN-20260610-001', uid: 'u10002', phone: '139****5678', type: 'recharge', amount: 500, balance: 4060, relatedNo: 'RCH-20260610-003', merchant: '平台自营商户', operator: '系统', time: '2026-06-10 16:00:00', remark: '线上充值' },
  { id: '4', transactionNo: 'TXN-20260610-002', uid: 'u10005', phone: '135****7890', type: 'refund', amount: 200, balance: 1000, relatedNo: 'WDR-20260610-001', merchant: '系统', operator: '张三', time: '2026-06-10 14:30:00', remark: '原路退回' },
  { id: '5', transactionNo: 'TXN-20260609-001', uid: 'u10004', phone: '136****3456', type: 'freeze', amount: -1500, balance: 3700, relatedNo: '', merchant: '系统', operator: '运营王五', time: '2026-06-09 10:00:00', remark: '疑似异常交易，冻结部分金额' },
  { id: '6', transactionNo: 'TXN-20260609-002', uid: 'u10008', phone: '132****0123', type: 'recharge', amount: 1500, balance: 8300, relatedNo: 'RCH-20260609-002', merchant: '平台自营商户', operator: '系统', time: '2026-06-09 16:45:03', remark: '线上充值' },
  { id: '7', transactionNo: 'TXN-20260608-001', uid: 'u10002', phone: '139****5678', type: 'consume', amount: -129, balance: 3560, relatedNo: 'ORD-20260608-002', merchant: 'XX数码旗舰店', operator: '系统', time: '2026-06-08 11:30:00', remark: '订单消费' },
  { id: '8', transactionNo: 'TXN-20260607-001', uid: 'u10003', phone: '137****9012', type: 'consume', amount: -59, balance: 148.50, relatedNo: 'ORD-20260607-001', merchant: 'XX食品店', operator: '系统', time: '2026-06-07 09:15:00', remark: '订单消费' },
  { id: '9', transactionNo: 'TXN-20260605-001', uid: 'u10006', phone: '134****2345', type: 'recharge', amount: 2000, balance: 13500, relatedNo: 'RCH-20260605-001', merchant: '平台自营商户', operator: '系统', time: '2026-06-05 14:00:00', remark: '线上充值' },
  { id: '10', transactionNo: 'TXN-20260604-001', uid: 'u10006', phone: '134****2345', type: 'consume', amount: -500, balance: 11500, relatedNo: 'ORD-20260604-003', merchant: 'XX服饰专营店', operator: '系统', time: '2026-06-04 18:00:00', remark: '订单消费' },
])

const ledgerSearchForm = reactive({ keyword: '', type: '' })

const filteredLedger = computed(() => {
  return mockTransactions.value.filter(tx => {
    const kw = ledgerSearchForm.keyword
    const matchKw = !kw || tx.transactionNo.includes(kw) || tx.uid.includes(kw) || tx.phone.includes(kw)
    const matchType = !ledgerSearchForm.type || tx.type === ledgerSearchForm.type
    return matchKw && matchType
  })
})

const txDetailModal = ref(false)
const txDetailItem = ref<WalletTransaction | null>(null)

const showTxDetail = (item: WalletTransaction) => {
  txDetailItem.value = item
  txDetailModal.value = true
}

const txTypeLabel: Record<string, string> = {
  recharge: '充值', consume: '消费', refund: '退款', freeze: '冻结', unfreeze: '解冻', adjust: '调整',
}
</script>

<template>
  <div class="wallet-management">
    <!-- 左侧导航 -->
    <div class="sidebar">
      <div class="sidebar-title">钱包管理</div>
      <div class="menu-list">
        <template v-for="menu in menuList" :key="menu.key">
          <!-- 父级菜单 -->
          <div class="menu-group-title" @click="toggleExpand(menu.key)">
            <span class="expand-icon">{{ expandedMenus.includes(menu.key) ? '▼' : '▶' }}</span>
            <span>{{ menu.label }}</span>
          </div>
          <div v-show="expandedMenus.includes(menu.key)" class="menu-children">
            <div
              v-for="child in menu.children"
              :key="child.key"
              class="menu-item"
              :class="{ active: activeMenu === child.key }"
              @click="handleMenuClick(child.key)"
            >
              {{ child.label }}
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- 右侧内容区 -->
    <div class="main-content">

      <!-- ===== 模块1：钱包设置 ===== -->
      <div v-if="activeMenu === 'wallet_config'" class="content-panel">
        <div class="panel-header">
          <h2>钱包设置</h2>
          <span class="panel-subtitle">全局钱包功能开关及业务规则配置</span>
        </div>
        <div class="panel-body">
          <div class="config-form">
            <!-- ========== 基础设置 ========== -->
            <div class="form-section-title">基础设置</div>

            <div class="form-item">
              <label class="form-label">钱包开关</label>
              <div class="form-control-row">
                <label class="toggle-switch">
                  <input type="checkbox" v-model="walletConfig.enabled" :disabled="configSaved && !editingConfig" />
                  <span class="toggle-slider"></span>
                </label>
                <span class="form-tip">{{ walletConfig.enabled ? '已开启' : '已关闭' }}（关闭后用户端不可见钱包功能）</span>
              </div>
            </div>

            <template v-if="walletConfig.enabled">
              <div class="form-item">
                <label class="form-label required">钱包名称</label>
                <div class="form-control-row">
                  <input type="text" class="form-input" style="width: 280px" v-model="walletConfig.name" placeholder="请输入钱包名称" :disabled="configSaved && !editingConfig" />
                  <span class="form-tip">（用户端展示的钱包名称，如"零钱"、"余额"）</span>
                </div>
              </div>

              <div class="form-divider"></div>

              <!-- ========== 充值设置 ========== -->
              <div class="form-section-title">充值设置</div>

              <div class="form-item">
                <label class="form-label required">最低充值金额</label>
                <div class="form-control-row">
                  <input type="number" class="form-input" style="width: 120px" v-model.number="walletConfig.minRecharge" min="0.01" step="0.01" :disabled="configSaved && !editingConfig" />
                  <span>元</span>
                </div>
              </div>

              <div class="form-item">
                <label class="form-label required">最高充值金额</label>
                <div class="form-control-row">
                  <input type="number" class="form-input" style="width: 120px" v-model.number="walletConfig.maxRecharge" min="1" step="0.01" :disabled="configSaved && !editingConfig" />
                  <span>元</span>
                </div>
              </div>

              <div class="form-item">
                <label class="form-label required">收款商户</label>
                <div class="form-control-row">
                  <select class="form-select" style="width: 200px" v-model="walletConfig.receiveMerchantId" :disabled="configSaved && !editingConfig">
                    <option value="">请选择商户</option>
                    <option v-for="m in mockMerchants" :key="m.id" :value="m.id">{{ m.name }}</option>
                  </select>
                  <span class="form-tip">（用户充值时资金打入该商户账户）</span>
                </div>
              </div>

              <div class="form-divider"></div>

              <!-- ========== 提现设置 ========== -->
              <div class="form-section-title">提现设置</div>

              <div class="form-item">
                <label class="form-label">是否支持提现</label>
                <div class="form-control-row">
                  <label class="toggle-switch">
                    <input type="checkbox" v-model="walletConfig.withdrawEnabled" :disabled="configSaved && !editingConfig" />
                    <span class="toggle-slider"></span>
                  </label>
                  <span class="form-tip">{{ walletConfig.withdrawEnabled ? '已开启（原路退回）' : '已关闭' }}</span>
                </div>
              </div>

              <template v-if="walletConfig.withdrawEnabled">
                <div class="form-item">
                  <label class="form-label">退款审核</label>
                  <div class="form-control-row">
                    <label class="toggle-switch">
                      <input type="checkbox" v-model="walletConfig.withdrawNeedReview" :disabled="configSaved && !editingConfig" />
                      <span class="toggle-slider"></span>
                    </label>
                    <span class="form-tip">{{ walletConfig.withdrawNeedReview ? '需审核后退款' : '自动退款，无需审核' }}</span>
                  </div>
                </div>

                <div class="form-item">
                  <label class="form-label required">手续费类型</label>
                  <div class="radio-group">
                    <label class="radio-label">
                      <input type="radio" v-model="walletConfig.feeType" value="fixed" :disabled="configSaved && !editingConfig" />
                      固定金额
                    </label>
                    <label class="radio-label">
                      <input type="radio" v-model="walletConfig.feeType" value="percent" :disabled="configSaved && !editingConfig" />
                      按比例
                    </label>
                  </div>
                </div>

                <div class="form-item">
                  <label class="form-label required">手续费</label>
                  <div class="form-control-row">
                    <input type="number" class="form-input" style="width: 120px" v-model.number="walletConfig.feeValue" min="0" :step="walletConfig.feeType === 'percent' ? 0.01 : 0.1" :disabled="configSaved && !editingConfig" />
                    <span>{{ walletConfig.feeType === 'fixed' ? '元/笔' : '%' }}</span>
                    <span class="form-tip" v-if="walletConfig.feeType === 'fixed'">（固定金额：每笔退款收取固定手续费）</span>
                    <span class="form-tip" v-else>（按比例：按退款金额的百分比收取）</span>
                  </div>
                </div>

                <div class="form-item">
                  <label class="form-label required">最低退款金额</label>
                  <div class="form-control-row">
                    <input type="number" class="form-input" style="width: 120px" v-model.number="walletConfig.minWithdraw" min="0.01" step="0.01" :disabled="configSaved && !editingConfig" />
                    <span>元</span>
                  </div>
                </div>

                <div class="form-item">
                  <label class="form-label required">最高退款金额</label>
                  <div class="form-control-row">
                    <input type="number" class="form-input" style="width: 120px" v-model.number="walletConfig.maxWithdraw" min="1" step="0.01" :disabled="configSaved && !editingConfig" />
                    <span>元</span>
                  </div>
                </div>

                <div class="form-item">
                  <label class="form-label required">每日退款限额</label>
                  <div class="form-control-row">
                    <input type="number" class="form-input" style="width: 120px" v-model.number="walletConfig.dailyWithdrawLimit" min="0" step="0.01" :disabled="configSaved && !editingConfig" />
                    <span>元（0 表示不限）</span>
                  </div>
                </div>

                <div class="form-item">
                  <label class="form-label required">退款后最低余额</label>
                  <div class="form-control-row">
                    <input type="number" class="form-input" style="width: 120px" v-model.number="walletConfig.minBalanceAfterWithdraw" min="0" step="0.01" :disabled="configSaved && !editingConfig" />
                    <span>元</span>
                  </div>
                </div>
              </template>
            </template>

            <!-- 操作按钮 -->
            <div class="form-actions">
              <button v-if="!configSaved" class="btn btn-primary" @click="saveConfig">保存配置</button>
              <template v-else-if="!editingConfig">
                <button class="btn btn-primary" @click="startEditConfig">修改</button>
              </template>
              <template v-else>
                <button class="btn btn-default" @click="cancelEditConfig">取消</button>
                <button class="btn btn-primary" style="margin-left: 8px" @click="saveConfig">保存</button>
              </template>
            </div>
          </div>

          <!-- 修改记录 -->
          <div class="history-section">
            <div class="history-header" @click="configHistorySectionOpen = !configHistorySectionOpen">
              <span class="history-toggle">{{ configHistorySectionOpen ? '▼' : '▶' }}</span>
              <span class="history-title">修改记录</span>
              <span class="history-count">共 {{ configHistoryList.length }} 条</span>
            </div>
            <div v-show="configHistorySectionOpen" class="history-body">
              <table class="data-table">
                <thead>
                  <tr>
                    <th style="width: 60px">序号</th>
                    <th style="width: 100px">修改人</th>
                    <th style="width: 160px">修改时间</th>
                    <th style="width: 80px">操作</th>
                  </tr>
                </thead>
                <tbody>
                  <template v-for="(record, index) in configHistoryList" :key="record.id">
                    <tr>
                      <td>{{ index + 1 }}</td>
                      <td>{{ record.operator }}</td>
                      <td>{{ record.operateTime }}</td>
                      <td>
                        <span class="action-link primary" @click="toggleConfigHistory(record.id)">
                          {{ configHistoryExpandedId === record.id ? '收起' : '展开' }}
                        </span>
                      </td>
                    </tr>
                    <tr v-show="configHistoryExpandedId === record.id" class="snapshot-row">
                      <td colspan="4" style="padding: 0">
                        <div class="snapshot-detail">
                          <div class="snapshot-header">完整配置快照（只读）</div>
                          <div class="snapshot-grid">
                            <div class="snapshot-field">
                              <span class="snapshot-label">钱包名称</span>
                              <span class="snapshot-value">{{ record.snapshot.name }}</span>
                            </div>
                            <div class="snapshot-field">
                              <span class="snapshot-label">钱包开关</span>
                              <span class="snapshot-value">{{ record.snapshot.enabled ? '开启' : '关闭' }}</span>
                            </div>
                            <div class="snapshot-field">
                              <span class="snapshot-label">提现开关</span>
                              <span class="snapshot-value">{{ record.snapshot.withdrawEnabled ? '开启' : '关闭' }}</span>
                            </div>
                            <div class="snapshot-field">
                              <span class="snapshot-label">手续费</span>
                              <span class="snapshot-value">{{ record.snapshot.feeType === 'fixed' ? record.snapshot.feeValue + '元/笔' : record.snapshot.feeValue + '%' }}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </template>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== 模块2：钱包概览 ===== -->
      <div v-if="activeMenu === 'wallet_overview'" class="content-panel">
        <div class="panel-header">
          <h2>钱包概览</h2>
        </div>
        <div class="panel-body">
          <!-- 统计卡片 -->
          <div class="overview-cards">
            <div v-for="stat in mockOverviewStats" :key="stat.label" class="overview-card">
              <div class="stat-label">{{ stat.label }}</div>
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-change" :class="{ up: stat.up, down: !stat.up }" v-if="stat.change">
                {{ stat.change }}
              </div>
            </div>
          </div>

          <!-- 趋势图 -->
          <div class="trend-section">
            <h3>近6个月趋势</h3>
            <div class="trend-chart">
              <div class="trend-legend">
                <span class="legend-item"><i style="background: #1677ff"></i>充值</span>
                <span class="legend-item"><i style="background: #52c41a"></i>消费</span>
                <span class="legend-item"><i style="background: #faad14"></i>退款</span>
              </div>
              <div class="trend-bars">
                <div v-for="d in trendData" :key="d.month" class="trend-group">
                  <div class="bar-cluster">
                    <div class="bar bar-recharge" :style="{ height: (d.recharge / maxTrend * 180) + 'px' }"></div>
                    <div class="bar bar-consume" :style="{ height: (d.consume / maxTrend * 180) + 'px' }"></div>
                    <div class="bar bar-refund" :style="{ height: (d.refund / maxTrend * 180) + 'px' }"></div>
                  </div>
                  <div class="trend-label">{{ d.month }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 最近交易 -->
          <div class="recent-section">
            <h3>最近交易</h3>
            <table class="data-table">
              <thead>
                <tr>
                  <th>流水号</th>
                  <th>用户</th>
                  <th>类型</th>
                  <th>金额</th>
                  <th>时间</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="tx in mockTransactions.slice(0, 8)" :key="tx.id">
                  <td>{{ tx.transactionNo }}</td>
                  <td>{{ tx.phone }}</td>
                  <td><span class="status-tag" :class="tx.type">{{ txTypeLabel[tx.type] }}</span></td>
                  <td :class="{ 'amount-positive': tx.amount > 0, 'amount-negative': tx.amount < 0 }">{{ tx.amount > 0 ? '+' : '' }}¥{{ Math.abs(tx.amount).toFixed(2) }}</td>
                  <td class="time-text">{{ tx.time }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ===== 模块3：用户钱包 ===== -->
      <div v-if="activeMenu === 'wallet_user'" class="content-panel">
        <div class="panel-header">
          <h2>用户钱包</h2>
        </div>
        <div class="panel-body">
          <div class="filter-bar">
            <div class="filter-item">
              <label>搜索</label>
              <input type="text" class="form-input" v-model="walletSearchForm.keyword" placeholder="钱包ID / UID / 手机号" style="width: 200px" />
            </div>
            <div class="filter-item">
              <label>状态</label>
              <select class="form-select" v-model="walletSearchForm.status" style="width: 120px">
                <option value="">全部</option>
                <option value="normal">正常</option>
                <option value="frozen">已冻结</option>
              </select>
            </div>
            <div class="filter-item">
              <button class="btn btn-primary" @click="">查询</button>
              <button class="btn btn-default" style="margin-left: 8px" @click="walletSearchForm.keyword = ''; walletSearchForm.status = ''">重置</button>
            </div>
          </div>

          <table class="data-table">
            <thead>
              <tr>
                <th>钱包ID</th>
                <th>用户UID</th>
                <th>手机号</th>
                <th>余额</th>
                <th>冻结金额</th>
                <th>累计充值</th>
                <th>状态</th>
                <th>开通时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="w in filteredWallets" :key="w.walletId">
                <td>{{ w.walletId }}</td>
                <td>{{ w.uid }}</td>
                <td>{{ w.phone }}</td>
                <td class="price-text">¥{{ w.balance.toFixed(2) }}</td>
                <td>{{ w.frozenAmount > 0 ? '¥' + w.frozenAmount.toFixed(2) : '-' }}</td>
                <td>¥{{ w.totalRecharge.toFixed(2) }}</td>
                <td><span class="status-tag" :class="w.status">{{ w.status === 'normal' ? '正常' : '已冻结' }}</span></td>
                <td class="time-text">{{ w.openTime }}</td>
                <td>
                  <span class="action-link primary" @click="showUserFlow(w)">流水</span>
                  <span v-if="w.status === 'normal'" class="action-link danger" @click="showFreezeModal(w)" style="margin-left: 8px">冻结</span>
                  <span v-if="w.status === 'frozen'" class="action-link primary" @click="showUnfreezeModal(w)" style="margin-left: 8px">解冻</span>
                </td>
              </tr>
              <tr v-if="filteredWallets.length === 0">
                <td colspan="9" class="empty-text">暂无符合条件的钱包</td>
              </tr>
            </tbody>
          </table>

          <div class="pagination">
            <span>共 {{ filteredWallets.length }} 条记录</span>
            <div class="page-btns">
              <button class="page-btn disabled">上一页</button>
              <button class="page-btn active">1</button>
              <button class="page-btn disabled">下一页</button>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== 模块4：充值管理 ===== -->
      <div v-if="activeMenu === 'wallet_recharge'" class="content-panel">
        <div class="panel-header">
          <h2>充值管理</h2>
          <span class="panel-subtitle">追踪支付状态与充值入账双状态</span>
        </div>
        <div class="panel-body">
          <div class="filter-bar">
            <div class="filter-item">
              <label>搜索</label>
              <input type="text" class="form-input" v-model="rechargeSearchForm.keyword" placeholder="充值单号 / UID / 手机号" style="width: 200px" />
            </div>
            <div class="filter-item">
              <label>支付状态</label>
              <select class="form-select" v-model="rechargeSearchForm.paymentStatus" style="width: 120px">
                <option value="">全部</option>
                <option value="pending">待支付</option>
                <option value="paid">支付成功</option>
                <option value="failed">支付失败</option>
                <option value="closed">已关闭</option>
              </select>
            </div>
            <div class="filter-item">
              <label>充值状态</label>
              <select class="form-select" v-model="rechargeSearchForm.rechargeStatus" style="width: 120px">
                <option value="">全部</option>
                <option value="pending">待入账</option>
                <option value="success">已入账</option>
                <option value="failed">入账失败</option>
              </select>
            </div>
            <div class="filter-item">
              <button class="btn btn-primary" @click="">查询</button>
              <button class="btn btn-default" style="margin-left: 8px" @click="rechargeSearchForm.keyword = ''; rechargeSearchForm.paymentStatus = ''; rechargeSearchForm.rechargeStatus = ''">重置</button>
            </div>
          </div>

          <table class="data-table">
            <thead>
              <tr>
                <th>充值单号</th>
                <th>用户</th>
                <th>金额</th>
                <th>收款商户</th>
                <th>支付状态</th>
                <th>充值状态</th>
                <th>申请时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in filteredRecharges" :key="r.id">
                <td>{{ r.rechargeNo }}</td>
                <td>{{ r.uid }}<br/><span class="sub-text">{{ r.phone }}</span></td>
                <td class="price-text">¥{{ r.amount.toFixed(2) }}</td>
                <td>{{ r.receiveMerchantName }}</td>
                <td><span class="status-tag" :class="r.paymentStatus">{{ paymentStatusLabel[r.paymentStatus] }}</span></td>
                <td><span class="status-tag" :class="r.rechargeStatus === 'success' ? 'completed' : r.rechargeStatus">{{ rechargeStatusLabel[r.rechargeStatus] }}</span></td>
                <td class="time-text">{{ r.applyTime }}</td>
                <td>
                  <span class="action-link primary" @click="showRechargeDetail(r)">详情</span>
                  <span v-if="r.paymentStatus === 'paid' && r.rechargeStatus === 'failed'" class="action-link danger" @click="manualRecharge(r)" style="margin-left: 8px">手动入账</span>
                </td>
              </tr>
            </tbody>
          </table>

          <div class="pagination">
            <span>共 {{ filteredRecharges.length }} 条记录</span>
            <div class="page-btns">
              <button class="page-btn disabled">上一页</button>
              <button class="page-btn active">1</button>
              <button class="page-btn disabled">下一页</button>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== 模块5：提现管理 ===== -->
      <div v-if="activeMenu === 'wallet_withdraw'" class="content-panel">
        <div class="panel-header">
          <h2>提现管理</h2>
          <span class="panel-subtitle">原路退回（全额退款 / 部分退款）</span>
        </div>
        <div class="panel-body">
          <div class="filter-bar">
            <div class="filter-item">
              <label>搜索</label>
              <input type="text" class="form-input" v-model="withdrawSearchForm.keyword" placeholder="退款单号 / UID / 关联订单号" style="width: 220px" />
            </div>
            <div class="filter-item">
              <label>退款类型</label>
              <select class="form-select" v-model="withdrawSearchForm.refundType" style="width: 120px">
                <option value="">全部</option>
                <option value="full">全额退款</option>
                <option value="partial">部分退款</option>
              </select>
            </div>
            <div class="filter-item">
              <label>状态</label>
              <select class="form-select" v-model="withdrawSearchForm.status" style="width: 140px">
                <option value="">全部</option>
                <option value="pending">待审核</option>
                <option value="approved">审核通过待退款</option>
                <option value="refunded">已退款</option>
                <option value="rejected">已拒绝</option>
              </select>
            </div>
            <div class="filter-item">
              <button class="btn btn-primary" @click="">查询</button>
              <button class="btn btn-default" style="margin-left: 8px" @click="withdrawSearchForm.keyword = ''; withdrawSearchForm.refundType = ''; withdrawSearchForm.status = ''">重置</button>
            </div>
          </div>

          <table class="data-table">
            <thead>
              <tr>
                <th>退款单号</th>
                <th>用户</th>
                <th>退款金额</th>
                <th>退款类型</th>
                <th>关联订单</th>
                <th>原支付方式</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="w in filteredWithdraws" :key="w.id">
                <td>{{ w.withdrawNo }}</td>
                <td>{{ w.uid }}<br/><span class="sub-text">{{ w.phone }}</span></td>
                <td class="price-text">¥{{ w.amount.toFixed(2) }}</td>
                <td><span class="status-tag" :class="w.refundType">{{ w.refundType === 'full' ? '全额退款' : '部分退款' }}</span></td>
                <td>{{ w.relatedOrderNo }}</td>
                <td>{{ payMethodLabel[w.originalPayMethod] }}</td>
                <td><span class="status-tag" :class="w.status">{{ withdrawStatusLabel[w.status] }}</span></td>
                <td>
                  <span class="action-link primary" @click="showWithdrawDetail(w)">详情</span>
                  <span v-if="w.status === 'pending'" class="action-link primary" @click="approveWithdraw(w)" style="margin-left: 8px">审核</span>
                  <span v-if="w.status === 'pending'" class="action-link danger" @click="rejectWithdraw(w)" style="margin-left: 8px">拒绝</span>
                  <span v-if="w.status === 'approved'" class="action-link primary" @click="confirmRefund(w)" style="margin-left: 8px">确认退款</span>
                </td>
              </tr>
            </tbody>
          </table>

          <div class="pagination">
            <span>共 {{ filteredWithdraws.length }} 条记录</span>
            <div class="page-btns">
              <button class="page-btn disabled">上一页</button>
              <button class="page-btn active">1</button>
              <button class="page-btn disabled">下一页</button>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== 模块6：交易流水 ===== -->
      <div v-if="activeMenu === 'wallet_ledger'" class="content-panel">
        <div class="panel-header">
          <h2>交易流水</h2>
        </div>
        <div class="panel-body">
          <div class="filter-bar">
            <div class="filter-item">
              <label>搜索</label>
              <input type="text" class="form-input" v-model="ledgerSearchForm.keyword" placeholder="流水号 / UID / 手机号" style="width: 200px" />
            </div>
            <div class="filter-item">
              <label>交易类型</label>
              <select class="form-select" v-model="ledgerSearchForm.type" style="width: 120px">
                <option value="">全部</option>
                <option value="recharge">充值</option>
                <option value="consume">消费</option>
                <option value="refund">退款</option>
                <option value="freeze">冻结</option>
                <option value="unfreeze">解冻</option>
                <option value="adjust">调整</option>
              </select>
            </div>
            <div class="filter-item">
              <button class="btn btn-primary" @click="">查询</button>
              <button class="btn btn-default" style="margin-left: 8px" @click="ledgerSearchForm.keyword = ''; ledgerSearchForm.type = ''">重置</button>
              <button class="btn btn-default" style="margin-left: 8px" @click="alert(`已导出 ${filteredLedger.length} 条记录（模拟）`)">导出</button>
            </div>
          </div>

          <table class="data-table">
            <thead>
              <tr>
                <th>流水号</th>
                <th>用户</th>
                <th>交易类型</th>
                <th>金额</th>
                <th>余额</th>
                <th>关联单号</th>
                <th>时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="tx in filteredLedger" :key="tx.id">
                <td>{{ tx.transactionNo }}</td>
                <td>{{ tx.uid }}<br/><span class="sub-text">{{ tx.phone }}</span></td>
                <td><span class="status-tag" :class="tx.type">{{ txTypeLabel[tx.type] }}</span></td>
                <td :class="{ 'amount-positive': tx.amount > 0, 'amount-negative': tx.amount < 0 }">{{ tx.amount > 0 ? '+' : '' }}¥{{ Math.abs(tx.amount).toFixed(2) }}</td>
                <td>¥{{ tx.balance.toFixed(2) }}</td>
                <td>{{ tx.relatedNo || '-' }}</td>
                <td class="time-text">{{ tx.time }}</td>
                <td><span class="action-link primary" @click="showTxDetail(tx)">详情</span></td>
              </tr>
            </tbody>
          </table>

          <div class="pagination">
            <span>共 {{ filteredLedger.length }} 条记录</span>
            <div class="page-btns">
              <button class="page-btn disabled">上一页</button>
              <button class="page-btn active">1</button>
              <button class="page-btn disabled">下一页</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== 弹窗：用户流水 ==================== -->
    <div v-if="userFlowModal" class="modal-overlay" @click.self="userFlowModal = false">
      <div class="modal-content" style="width: 700px">
        <div class="modal-header">
          <h3>{{ userFlowWallet?.walletId }} 流水明细</h3>
          <span class="modal-close" @click="userFlowModal = false">&times;</span>
        </div>
        <div class="modal-body">
          <div class="detail-grid" v-if="userFlowWallet">
            <div><label>用户</label><span>{{ userFlowWallet.uid }} / {{ userFlowWallet.phone }}</span></div>
            <div><label>当前余额</label><span>¥{{ userFlowWallet.balance.toFixed(2) }}</span></div>
            <div><label>冻结金额</label><span>{{ userFlowWallet.frozenAmount > 0 ? '¥' + userFlowWallet.frozenAmount.toFixed(2) : '-' }}</span></div>
            <div><label>状态</label><span>{{ userFlowWallet.status === 'normal' ? '正常' : '已冻结' }}</span></div>
          </div>
          <table class="data-table" style="margin-top: 16px">
            <thead>
              <tr>
                <th>流水号</th>
                <th>类型</th>
                <th>金额</th>
                <th>余额</th>
                <th>时间</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="tx in userFlowTxs" :key="tx.id">
                <td>{{ tx.transactionNo }}</td>
                <td>{{ txTypeLabel[tx.type] }}</td>
                <td :class="{ 'amount-positive': tx.amount > 0, 'amount-negative': tx.amount < 0 }">{{ tx.amount > 0 ? '+' : '' }}¥{{ Math.abs(tx.amount).toFixed(2) }}</td>
                <td>¥{{ tx.balance.toFixed(2) }}</td>
                <td class="time-text">{{ tx.time }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ==================== 弹窗：冻结钱包 ==================== -->
    <div v-if="freezeModal" class="modal-overlay" @click.self="freezeModal = false">
      <div class="modal-content" style="width: 440px">
        <div class="modal-header">
          <h3>冻结钱包</h3>
          <span class="modal-close" @click="freezeModal = false">&times;</span>
        </div>
        <div class="modal-body">
          <div class="form-item" style="margin-bottom: 0">
            <label class="form-label required">冻结原因</label>
            <div class="form-control-row">
              <textarea class="form-textarea" v-model="freezeReason" placeholder="请输入冻结原因" rows="3"></textarea>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-default" @click="freezeModal = false">取消</button>
          <button class="btn btn-primary" @click="confirmFreeze" :disabled="!freezeReason">确认冻结</button>
        </div>
      </div>
    </div>

    <!-- ==================== 弹窗：充值详情 ==================== -->
    <div v-if="rechargeDetailModal" class="modal-overlay" @click.self="rechargeDetailModal = false">
      <div class="modal-content" style="width: 520px">
        <div class="modal-header">
          <h3>充值详情</h3>
          <span class="modal-close" @click="rechargeDetailModal = false">&times;</span>
        </div>
        <div class="modal-body" v-if="rechargeDetailItem">
          <div class="detail-grid">
            <div><label>充值单号</label><span>{{ rechargeDetailItem.rechargeNo }}</span></div>
            <div><label>用户</label><span>{{ rechargeDetailItem.uid }} / {{ rechargeDetailItem.phone }}</span></div>
            <div><label>金额</label><span class="price-text">¥{{ rechargeDetailItem.amount.toFixed(2) }}</span></div>
            <div><label>收款商户</label><span>{{ rechargeDetailItem.receiveMerchantName }}</span></div>
            <div><label>支付状态</label><span class="status-tag" :class="rechargeDetailItem.paymentStatus">{{ paymentStatusLabel[rechargeDetailItem.paymentStatus] }}</span></div>
            <div><label>充值状态</label><span class="status-tag" :class="rechargeDetailItem.rechargeStatus">{{ rechargeStatusLabel[rechargeDetailItem.rechargeStatus] }}</span></div>
            <div><label>申请时间</label><span>{{ rechargeDetailItem.applyTime }}</span></div>
            <div><label>支付时间</label><span>{{ rechargeDetailItem.paymentTime || '-' }}</span></div>
            <div><label>入账时间</label><span>{{ rechargeDetailItem.rechargeTime || '-' }}</span></div>
            <div><label>备注</label><span>{{ rechargeDetailItem.remark || '-' }}</span></div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-default" @click="rechargeDetailModal = false">关闭</button>
          <button v-if="rechargeDetailItem?.paymentStatus === 'paid' && rechargeDetailItem?.rechargeStatus === 'failed'" class="btn btn-primary" @click="manualRecharge(rechargeDetailItem!)">手动入账</button>
        </div>
      </div>
    </div>

    <!-- ==================== 弹窗：退款详情 ==================== -->
    <div v-if="withdrawDetailModal" class="modal-overlay" @click.self="withdrawDetailModal = false">
      <div class="modal-content" style="width: 560px">
        <div class="modal-header">
          <h3>退款详情</h3>
          <span class="modal-close" @click="withdrawDetailModal = false">&times;</span>
        </div>
        <div class="modal-body" v-if="withdrawDetailItem">
          <div class="detail-grid">
            <div><label>退款单号</label><span>{{ withdrawDetailItem.withdrawNo }}</span></div>
            <div><label>用户</label><span>{{ withdrawDetailItem.uid }} / {{ withdrawDetailItem.phone }}</span></div>
            <div><label>退款金额</label><span class="price-text">¥{{ withdrawDetailItem.amount.toFixed(2) }}</span></div>
            <div><label>手续费</label><span>{{ withdrawDetailItem.fee > 0 ? '¥' + withdrawDetailItem.fee.toFixed(2) : '免' }}</span></div>
            <div><label>实际退款</label><span>¥{{ withdrawDetailItem.actualAmount.toFixed(2) }}</span></div>
            <div><label>退款类型</label><span>{{ withdrawDetailItem.refundType === 'full' ? '全额退款' : '部分退款' }}</span></div>
            <div><label>关联订单</label><span>{{ withdrawDetailItem.relatedOrderNo }}</span></div>
            <div><label>原支付方式</label><span>{{ payMethodLabel[withdrawDetailItem.originalPayMethod] }}</span></div>
            <div><label>状态</label><span class="status-tag" :class="withdrawDetailItem.status">{{ withdrawStatusLabel[withdrawDetailItem.status] }}</span></div>
            <div><label>申请时间</label><span>{{ withdrawDetailItem.applyTime }}</span></div>
            <div><label>完成时间</label><span>{{ withdrawDetailItem.completeTime || '-' }}</span></div>
            <div><label>操作人</label><span>{{ withdrawDetailItem.operator || '-' }}</span></div>
            <div v-if="withdrawDetailItem.rejectReason"><label>拒绝原因</label><span>{{ withdrawDetailItem.rejectReason }}</span></div>
            <div v-if="withdrawDetailItem.partialRefundReason"><label>部分退款原因</label><span>{{ withdrawDetailItem.partialRefundReason }}</span></div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-default" @click="withdrawDetailModal = false">关闭</button>
        </div>
      </div>
    </div>

    <!-- ==================== 弹窗：交易流水详情 ==================== -->
    <div v-if="txDetailModal" class="modal-overlay" @click.self="txDetailModal = false">
      <div class="modal-content" style="width: 520px">
        <div class="modal-header">
          <h3>交易详情</h3>
          <span class="modal-close" @click="txDetailModal = false">&times;</span>
        </div>
        <div class="modal-body" v-if="txDetailItem">
          <div class="detail-grid">
            <div><label>流水号</label><span>{{ txDetailItem.transactionNo }}</span></div>
            <div><label>用户</label><span>{{ txDetailItem.uid }} / {{ txDetailItem.phone }}</span></div>
            <div><label>交易类型</label><span>{{ txTypeLabel[txDetailItem.type] }}</span></div>
            <div><label>金额</label><span :class="{ 'amount-positive': txDetailItem.amount > 0, 'amount-negative': txDetailItem.amount < 0 }">{{ txDetailItem.amount > 0 ? '+' : '' }}¥{{ Math.abs(txDetailItem.amount).toFixed(2) }}</span></div>
            <div><label>余额</label><span>¥{{ txDetailItem.balance.toFixed(2) }}</span></div>
            <div><label>关联单号</label><span>{{ txDetailItem.relatedNo || '-' }}</span></div>
            <div><label>商户</label><span>{{ txDetailItem.merchant }}</span></div>
            <div><label>操作人</label><span>{{ txDetailItem.operator }}</span></div>
            <div><label>时间</label><span>{{ txDetailItem.time }}</span></div>
            <div><label>备注</label><span>{{ txDetailItem.remark || '-' }}</span></div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-default" @click="txDetailModal = false">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ==================== 页面整体布局（对齐积分管理） ==================== */
.wallet-management {
  display: flex;
  min-height: 100vh;
  background-color: #f5f7fa;
  color: #333;
  font-family: 'Microsoft YaHei', sans-serif;
}

/* ==================== 左侧导航 ==================== */
.sidebar {
  width: 200px;
  background-color: #fff;
  border-right: 1px solid #e8e8e8;
  padding: 0;
  flex-shrink: 0;
}
.sidebar-title {
  height: 56px;
  line-height: 56px;
  padding: 0 20px;
  font-size: 16px;
  font-weight: bold;
  color: #333;
  border-bottom: 1px solid #e8e8e8;
}
.menu-list {
  padding: 8px 0;
}
.menu-group-title {
  padding: 10px 20px;
  font-size: 12px;
  color: #999;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  user-select: none;
}
.menu-group-title:hover {
  color: #666;
}
.expand-icon {
  font-size: 10px;
}
.menu-children {
  padding: 0;
}
.menu-item {
  padding: 0 20px 0 32px;
  height: 40px;
  line-height: 40px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}
.menu-item:hover {
  color: #1677ff;
  background-color: #f0f5ff;
}
.menu-item.active {
  color: #1677ff;
  background-color: #e6f4ff;
  font-weight: 500;
  position: relative;
}
.menu-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background-color: #1677ff;
  border-radius: 0 3px 3px 0;
}

/* ==================== 右侧内容区 ==================== */
.main-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}
.content-panel {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}
.panel-header {
  padding: 16px 24px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: baseline;
  gap: 12px;
}
.panel-header h2 {
  margin: 0;
  font-size: 16px;
  font-weight: bold;
  color: #333;
}
.panel-subtitle {
  font-size: 13px;
  color: #999;
}
.panel-body {
  padding: 20px 24px;
}

/* ==================== 配置表单（对齐积分管理） ==================== */
.config-form {
  max-width: 720px;
}
.form-section-title {
  font-size: 14px;
  font-weight: bold;
  color: #1677ff;
  padding: 12px 0 8px;
  margin-top: 4px;
  border-bottom: 1px solid #e6f4ff;
  margin-bottom: 16px;
}
.form-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16px;
}
.form-label {
  width: 120px;
  text-align: right;
  padding-right: 12px;
  line-height: 32px;
  font-size: 14px;
  color: #333;
  flex-shrink: 0;
}
.form-label.required::before {
  content: '*';
  color: #ff4d4f;
  margin-right: 4px;
}
.form-control-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  line-height: 32px;
  font-size: 14px;
  color: #666;
}
.form-input {
  height: 32px;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 0 12px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
  width: 200px;
}
.form-input:focus {
  border-color: #1677ff;
}
.form-input:disabled {
  background-color: #f5f5f5;
  color: #999;
  cursor: not-allowed;
}
.form-select {
  height: 32px;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 0 12px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
  width: 140px;
}
.form-select:focus {
  border-color: #1677ff;
}
.form-select:disabled {
  background-color: #f5f5f5;
  color: #999;
  cursor: not-allowed;
}
.form-textarea {
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 14px;
  outline: none;
  resize: vertical;
  transition: border-color 0.2s;
  font-family: inherit;
}
.form-textarea:focus {
  border-color: #1677ff;
}
.form-tip {
  font-size: 12px;
  color: #999;
}
.form-divider {
  height: 1px;
  background-color: #f0f0f0;
  margin: 20px 0;
}
.form-actions {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  gap: 8px;
}
.radio-group {
  display: flex;
  gap: 24px;
  line-height: 32px;
}
.radio-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  cursor: pointer;
}
.radio-label input[type="radio"] {
  accent-color: #1677ff;
}

/* ==================== 开关组件 ==================== */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 22px;
  flex-shrink: 0;
}
.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}
.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.3s;
  border-radius: 22px;
}
.toggle-slider::before {
  position: absolute;
  content: '';
  height: 18px;
  width: 18px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}
.toggle-switch input:checked + .toggle-slider {
  background-color: #1677ff;
}
.toggle-switch input:checked + .toggle-slider::before {
  transform: translateX(22px);
}
.toggle-switch input:disabled + .toggle-slider {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ==================== 按钮 ==================== */
.btn {
  height: 32px;
  border-radius: 6px;
  border: none;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0 16px;
  font-weight: 500;
}
.btn-primary {
  background-color: #1677ff;
  color: #fff;
}
.btn-primary:hover {
  box-shadow: 0 2px 8px rgba(22, 119, 255, 0.2);
}
.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.btn-default {
  background-color: #fff;
  color: #333;
  border: 1px solid #ddd;
}
.btn-default:hover {
  border-color: #1677ff;
  color: #1677ff;
}

/* ==================== 筛选栏 ==================== */
.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}
.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
}
.filter-item label {
  font-size: 14px;
  color: #666;
  white-space: nowrap;
}

/* ==================== 数据表格 ==================== */
.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
.data-table th,
.data-table td {
  border-bottom: 1px solid #f0f0f0;
  padding: 12px 8px;
  text-align: left;
}
.data-table th {
  background-color: #fafafa;
  color: #666;
  font-weight: 600;
  font-size: 13px;
  white-space: nowrap;
}
.data-table tbody tr:hover {
  background-color: #f5f7fa;
}
.time-text {
  color: #999;
  font-size: 13px;
}
.sub-text {
  font-size: 12px;
  color: #999;
}
.price-text {
  color: #ff4d4f;
  font-weight: bold;
}
.empty-text {
  text-align: center;
  padding: 60px 0;
  color: #999;
}

/* ==================== 状态标签 ==================== */
.status-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}
.status-tag.normal, .status-tag.on, .status-tag.completed, .status-tag.success {
  background-color: #e6f4ff;
  color: #1677ff;
  border: 1px solid #91caff;
}
.status-tag.frozen, .status-tag.off, .status-tag.failed {
  background-color: #fff1f0;
  color: #ff4d4f;
  border: 1px solid #ffa39e;
}
.status-tag.pending, .status-tag.draft {
  background-color: #fff7e6;
  color: #fa8c16;
  border: 1px solid #ffd591;
}
.status-tag.paid {
  background-color: #f6ffed;
  color: #52c41a;
  border: 1px solid #b7eb8f;
}
.status-tag.closed {
  background-color: #f5f5f5;
  color: #999;
  border: 1px solid #d9d9d9;
}
.status-tag.approved {
  background-color: #f9f0ff;
  color: #722ed1;
  border: 1px solid #d3adf7;
}
.status-tag.refunded {
  background-color: #f6ffed;
  color: #52c41a;
  border: 1px solid #b7eb8f;
}
.status-tag.rejected {
  background-color: #fff1f0;
  color: #ff4d4f;
  border: 1px solid #ffa39e;
}
.status-tag.full {
  background-color: #e6f4ff;
  color: #1677ff;
  border: 1px solid #91caff;
}
.status-tag.partial {
  background-color: #f9f0ff;
  color: #722ed1;
  border: 1px solid #d3adf7;
}
.status-tag.recharge {
  background-color: #e6f4ff;
  color: #1677ff;
  border: 1px solid #91caff;
}
.status-tag.consume {
  background-color: #fff7e6;
  color: #fa8c16;
  border: 1px solid #ffd591;
}
.status-tag.refund {
  background-color: #f6ffed;
  color: #52c41a;
  border: 1px solid #b7eb8f;
}
.status-tag.freeze {
  background-color: #fff1f0;
  color: #ff4d4f;
  border: 1px solid #ffa39e;
}
.status-tag.unfreeze {
  background-color: #f6ffed;
  color: #52c41a;
  border: 1px solid #b7eb8f;
}
.status-tag.adjust {
  background-color: #f5f5f5;
  color: #666;
  border: 1px solid #d9d9d9;
}

/* ==================== 金额颜色 ==================== */
.amount-positive {
  color: #ff4d4f;
  font-weight: bold;
}
.amount-negative {
  color: #52c41a;
  font-weight: bold;
}

/* ==================== 操作链接 ==================== */
.action-link {
  color: #1677ff;
  cursor: pointer;
  font-size: 13px;
}
.action-link:hover {
  text-decoration: underline;
}
.action-link.primary {
  color: #1677ff;
}
.action-link.danger {
  color: #ff4d4f;
}

/* ==================== 分页 ==================== */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  font-size: 14px;
  color: #666;
}
.page-btns {
  display: flex;
  gap: 8px;
}
.page-btn {
  height: 28px;
  padding: 0 12px;
  border: 1px solid #ddd;
  background-color: #fff;
  border-radius: 4px;
  cursor: pointer;
  color: #333;
  font-size: 13px;
}
.page-btn:hover:not(.disabled) {
  border-color: #1677ff;
  color: #1677ff;
}
.page-btn.active {
  background-color: #1677ff;
  color: #fff;
  border-color: #1677ff;
}
.page-btn.disabled {
  color: #ccc;
  background-color: #f5f5f5;
  cursor: not-allowed;
}

/* ==================== 概览卡片 ==================== */
.overview-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}
.overview-card {
  background-color: #fafafa;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #f0f0f0;
}
.stat-label {
  font-size: 13px;
  color: #999;
  margin-bottom: 8px;
}
.stat-value {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}
.stat-change {
  font-size: 12px;
}
.stat-change.up {
  color: #ff4d4f;
}
.stat-change.down {
  color: #52c41a;
}

/* ==================== 趋势图 ==================== */
.trend-section {
  margin-bottom: 24px;
}
.trend-section h3 {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin: 0 0 16px;
}
.trend-chart {
  background-color: #fafafa;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #f0f0f0;
}
.trend-legend {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
  font-size: 13px;
  color: #666;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}
.legend-item i {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 2px;
}
.trend-bars {
  display: flex;
  align-items: flex-end;
  gap: 20px;
  height: 200px;
  padding: 0 10px;
}
.trend-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.bar-cluster {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  height: 180px;
}
.bar {
  width: 20px;
  border-radius: 3px 3px 0 0;
  transition: height 0.3s;
}
.bar-recharge {
  background-color: #1677ff;
}
.bar-consume {
  background-color: #52c41a;
}
.bar-refund {
  background-color: #faad14;
}
.trend-label {
  margin-top: 8px;
  font-size: 12px;
  color: #999;
}

/* ==================== 最近交易 ==================== */
.recent-section h3 {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin: 0 0 16px;
}

/* ==================== 修改记录 ==================== */
.history-section {
  margin-top: 32px;
  border-top: 1px solid #f0f0f0;
  padding-top: 16px;
}
.history-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  cursor: pointer;
  user-select: none;
}
.history-toggle {
  font-size: 12px;
  color: #999;
}
.history-title {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}
.history-count {
  font-size: 12px;
  color: #999;
}
.history-body {
  margin-top: 8px;
}
.snapshot-row td {
  background-color: #fafafa;
}
.snapshot-detail {
  padding: 16px;
}
.snapshot-header {
  font-size: 13px;
  font-weight: bold;
  color: #666;
  margin-bottom: 12px;
}
.snapshot-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.snapshot-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.snapshot-label {
  font-size: 12px;
  color: #999;
}
.snapshot-value {
  font-size: 14px;
  color: #333;
}

/* ==================== 弹窗 ==================== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-content {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #f0f0f0;
}
.modal-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: bold;
}
.modal-close {
  font-size: 20px;
  color: #999;
  cursor: pointer;
  line-height: 1;
}
.modal-close:hover {
  color: #333;
}
.modal-body {
  padding: 20px 24px;
  overflow-y: auto;
  flex: 1;
}
.modal-footer {
  padding: 12px 24px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.detail-grid div {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.detail-grid label {
  font-size: 12px;
  color: #999;
}
.detail-grid span {
  font-size: 14px;
  color: #333;
}
</style>
