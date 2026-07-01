<script setup lang="ts">
import { ref, reactive, computed } from 'vue'

// ==================== 侧边栏导航（分组结构，对齐积分管理） ====================
const menuList = [
  { key: 'wallet_overview', label: '钱包概览' },
  { key: 'wallet_config', label: '钱包设置' },
  { key: 'wallet_merchant_sign', label: '商户签约' },
  { key: 'wallet_recharge_plan', label: '充值方案' },
  { key: 'wallet_user', label: '用户钱包' },
  { key: 'wallet_ledger', label: '交易流水' },
  { key: 'wallet_recharge', label: '充值管理' },
  { key: 'wallet_withdraw', label: '提现管理' },
]

const activeMenu = ref('wallet_overview')


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
  principalBalance: number
  bonusBalance: number
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

interface WithdrawRecord {
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

// 子流水（FIFO 核销明细）
interface BucketLog {
  bucketNo: string      // 桶编号（对应充值批次单号）
  bucketTime: string    // 充值时间（越早排越前 = FIFO）
  deductAmount: number  // 本次从这个桶扣了多少
  remainAmount: number  // 扣后这个桶还剩多少
}

interface WalletTransaction {
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
  bucketLogs?: BucketLog[]  // 仅 consume / withdraw 有
}

// ==================== 充值方案接口定义 ====================
interface RechargePreset {
  id: string
  amount: number
  sort: number
}

interface RechargeActivity {
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

interface RechargePlan {
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

const configSaved = ref(true)
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

// ==================== 模块1.5：充值方案 ====================
const rechargePlans = ref<RechargePlan[]>([
  {
    id: '1',
    name: '默认充值方案',
    enabled: true,
    activeTime: '2026-06-01 10:00:00',
    presets: [
      { id: 'p1', amount: 50, sort: 1 },
      { id: 'p2', amount: 100, sort: 2 },
      { id: 'p3', amount: 200, sort: 3 },
      { id: 'p4', amount: 500, sort: 4 },
      { id: 'p5', amount: 1000, sort: 5 },
    ],
    allowCustom: true,
    customMin: 1,
    customMax: 50000,
    activities: [
      { id: 'a1', name: '充100送10', type: 'bonus', conditionAmount: 100, bonusAmount: 10, startTime: '', endTime: '', perUserLimit: 0, dailyLimit: 0, enabled: true },
      { id: 'a2', name: '充500送50', type: 'bonus', conditionAmount: 500, bonusAmount: 50, startTime: '', endTime: '', perUserLimit: 0, dailyLimit: 0, enabled: true },
      { id: 'a3', name: '充1000打95折', type: 'discount', conditionAmount: 1000, discountPercent: 95, startTime: '', endTime: '', perUserLimit: 0, dailyLimit: 0, enabled: true },
    ],
  },
  {
    id: '2',
    name: '五一充值活动',
    enabled: false,
    activeTime: '',
    presets: [
      { id: 'p6', amount: 100, sort: 1 },
      { id: 'p7', amount: 300, sort: 2 },
      { id: 'p8', amount: 500, sort: 3 },
    ],
    allowCustom: false,
    customMin: 1,
    customMax: 50000,
    activities: [
      { id: 'a4', name: '充300送40', type: 'bonus', conditionAmount: 300, bonusAmount: 40, startTime: '2026-05-01 00:00:00', endTime: '2026-05-05 23:59:59', perUserLimit: 1, dailyLimit: 100, enabled: true },
      { id: 'a5', name: '充500打9折', type: 'discount', conditionAmount: 500, discountPercent: 90, startTime: '2026-05-01 00:00:00', endTime: '2026-05-05 23:59:59', perUserLimit: 1, dailyLimit: 50, enabled: true },
    ],
  },
])

// 充值方案编辑状态
const planEditModal = ref(false)
const planEditMode = ref<'create' | 'edit'>('create')
const planEditData = reactive<RechargePlan>({
  id: '',
  name: '',
  enabled: false,
  activeTime: '',
  presets: [],
  allowCustom: true,
  customMin: 1,
  customMax: 50000,
  activities: [],
})

// 充值方案详情/活动编辑
const planDetailModal = ref(false)
const planDetailId = ref('')
const activityEditModal = ref(false)
const activityEditIndex = ref(-1) // -1 = 新增
const activityEditData = reactive<RechargeActivity>({
  id: '',
  name: '',
  type: 'bonus',
  conditionAmount: 0,
  bonusAmount: 0,
  discountPercent: 100,
  startTime: '',
  endTime: '',
  perUserLimit: 0,
  dailyLimit: 0,
  enabled: true,
})

const openPlanCreate = () => {
  planEditMode.value = 'create'
  Object.assign(planEditData, {
    id: '',
    name: '',
    enabled: false,
    activeTime: '',
    presets: [{ id: 'new_1', amount: 100, sort: 1 }],
    allowCustom: true,
    customMin: 1,
    customMax: 50000,
    activities: [],
  })
  planEditModal.value = true
}

const openPlanEdit = (plan: RechargePlan) => {
  planEditMode.value = 'edit'
  Object.assign(planEditData, JSON.parse(JSON.stringify(plan)))
  planEditModal.value = true
}

const savePlan = () => {
  if (!planEditData.name.trim()) {
    alert('请输入方案名称')
    return
  }
  if (planEditData.presets.length === 0) {
    alert('请至少添加一个预选金额')
    return
  }
  if (planEditMode.value === 'create') {
    const newId = String(Date.now())
    rechargePlans.value.push({
      ...JSON.parse(JSON.stringify(planEditData)),
      id: newId,
      enabled: false,
      activeTime: '',
    })
    alert('充值方案已创建')
  } else {
    const idx = rechargePlans.value.findIndex(p => p.id === planEditData.id)
    if (idx > -1) {
      rechargePlans.value[idx] = JSON.parse(JSON.stringify(planEditData))
    }
    alert('充值方案已保存')
  }
  planEditModal.value = false
}

const togglePlanEnabled = (plan: RechargePlan) => {
  if (plan.enabled) {
    // 禁用
    plan.enabled = false
    plan.activeTime = ''
  } else {
    // 启用：先停用其他方案
    rechargePlans.value.forEach(p => {
      p.enabled = false
      p.activeTime = ''
    })
    plan.enabled = true
    plan.activeTime = new Date().toLocaleString('zh-CN', { hour12: false })
  }
}

const deletePlan = (plan: RechargePlan) => {
  if (plan.enabled) {
    alert('生效中的方案不能删除，请先禁用')
    return
  }
  if (!confirm(`确认删除方案「${plan.name}」？`)) return
  rechargePlans.value = rechargePlans.value.filter(p => p.id !== plan.id)
}

// 预选金额操作
const addPreset = () => {
  const sort = planEditData.presets.length + 1
  planEditData.presets.push({ id: 'new_' + Date.now(), amount: 0, sort })
}

const removePreset = (index: number) => {
  planEditData.presets.splice(index, 1)
  // 重新排序
  planEditData.presets.forEach((p, i) => { p.sort = i + 1 })
}

const movePresetUp = (index: number) => {
  if (index <= 0) return
  const list = planEditData.presets
  ;[list[index - 1], list[index]] = [list[index], list[index - 1]]
  list.forEach((p, i) => { p.sort = i + 1 })
}

const movePresetDown = (index: number) => {
  if (index >= planEditData.presets.length - 1) return
  const list = planEditData.presets
  ;[list[index], list[index + 1]] = [list[index + 1], list[index]]
  list.forEach((p, i) => { p.sort = i + 1 })
}

// 充值活动操作
const openActivityCreate = () => {
  activityEditIndex.value = -1
  Object.assign(activityEditData, {
    id: 'act_' + Date.now(),
    name: '',
    type: 'bonus',
    conditionAmount: 0,
    bonusAmount: 0,
    discountPercent: 100,
    startTime: '',
    endTime: '',
    perUserLimit: 0,
    dailyLimit: 0,
    enabled: true,
  })
  activityEditModal.value = true
}

const openActivityEdit = (index: number) => {
  activityEditIndex.value = index
  Object.assign(activityEditData, JSON.parse(JSON.stringify(planEditData.activities[index])))
  activityEditModal.value = true
}

const saveActivity = () => {
  if (!activityEditData.name.trim()) {
    alert('请输入活动名称')
    return
  }
  if (activityEditData.conditionAmount <= 0) {
    alert('触发条件金额必须大于0')
    return
  }
  if (activityEditData.type === 'bonus' && (!activityEditData.bonusAmount || activityEditData.bonusAmount <= 0)) {
    alert('赠送金额必须大于0')
    return
  }
  if (activityEditData.type === 'discount' && (!activityEditData.discountPercent || activityEditData.discountPercent <= 0 || activityEditData.discountPercent >= 100)) {
    alert('折扣比例须在1~99之间')
    return
  }
  if (activityEditIndex.value === -1) {
    planEditData.activities.push(JSON.parse(JSON.stringify(activityEditData)))
  } else {
    planEditData.activities[activityEditIndex.value] = JSON.parse(JSON.stringify(activityEditData))
  }
  activityEditModal.value = false
}

const removeActivity = (index: number) => {
  planEditData.activities.splice(index, 1)
}

// 方案详情弹窗
const planDetailData = computed(() => {
  return rechargePlans.value.find(p => p.id === planDetailId.value)
})

const openPlanDetail = (plan: RechargePlan) => {
  planDetailId.value = plan.id
  planDetailModal.value = true
}

// ==================== 模块2：钱包概览 ====================
const mockOverviewStats = [
  { label: '平台总余额', value: '¥1,286,532.80', change: '+5.2%', up: true },
  { label: '总充值金额', value: '¥3,580,000.00', change: '+12.3%', up: true },
  { label: '总消费金额', value: '¥2,150,000.00', change: '+8.7%', up: true },
  { label: '总退款金额', value: '¥143,467.20', change: '-2.1%', up: false },
  { label: '待审核提现', value: '3 笔', change: '', up: true },
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
  { walletId: 'WLT-00001', uid: 'u10001', phone: '138****1234', balance: 1280.50, principalBalance: 1024, bonusBalance: 256.50, frozenAmount: 200, totalRecharge: 5000, totalConsume: 3500, totalRefund: 219.50, status: 'normal', openTime: '2026-01-15 10:30:00' },
  { walletId: 'WLT-00002', uid: 'u10002', phone: '139****5678', balance: 3560.00, principalBalance: 2848, bonusBalance: 712, frozenAmount: 0, totalRecharge: 8000, totalConsume: 4400, totalRefund: 40, status: 'normal', openTime: '2026-01-20 14:20:00' },
  { walletId: 'WLT-00003', uid: 'u10003', phone: '137****9012', balance: 89.50, principalBalance: 72, bonusBalance: 17.50, frozenAmount: 0, totalRecharge: 1000, totalConsume: 910.50, totalRefund: 0, status: 'normal', openTime: '2026-02-03 09:15:00' },
  { walletId: 'WLT-00004', uid: 'u10004', phone: '136****3456', balance: 5200.00, principalBalance: 4160, bonusBalance: 1040, frozenAmount: 1500, totalRecharge: 10000, totalConsume: 3300, totalRefund: 0, status: 'frozen', openTime: '2026-02-10 16:45:00', frozenReason: '疑似异常交易' },
  { walletId: 'WLT-00005', uid: 'u10005', phone: '135****7890', balance: 800.00, principalBalance: 640, bonusBalance: 160, frozenAmount: 0, totalRecharge: 2000, totalConsume: 1200, totalRefund: 0, status: 'normal', openTime: '2026-03-01 11:00:00' },
  { walletId: 'WLT-00006', uid: 'u10006', phone: '134****2345', balance: 12500.00, principalBalance: 10000, bonusBalance: 2500, frozenAmount: 500, totalRecharge: 20000, totalConsume: 7000, totalRefund: 0, status: 'normal', openTime: '2026-03-12 08:30:00' },
  { walletId: 'WLT-00007', uid: 'u10007', phone: '133****6789', balance: 0, principalBalance: 0, bonusBalance: 0, frozenAmount: 0, totalRecharge: 500, totalConsume: 500, totalRefund: 0, status: 'normal', openTime: '2026-04-05 13:20:00' },
  { walletId: 'WLT-00008', uid: 'u10008', phone: '132****0123', balance: 6800.00, principalBalance: 5440, bonusBalance: 1360, frozenAmount: 0, totalRecharge: 10000, totalConsume: 3000, totalRefund: 200, status: 'frozen', openTime: '2026-04-18 10:00:00', frozenReason: '用户主动申请冻结' },
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

// 流水弹窗中展开的子流水
const userFlowExpandedTxId = ref<string | null>(null)
const toggleUserFlowBucket = (txId: string) => {
  userFlowExpandedTxId.value = userFlowExpandedTxId.value === txId ? null : txId
}

const userFlowTab = ref<'recharge' | 'withdraw' | 'transaction'>('recharge')


const freezeModal = ref(false)
const freezeWalletTarget = ref<UserWallet | null>(null)
const freezeMode = ref<'freeze' | 'unfreeze'>('freeze')
const freezeForm = reactive({
  amount: 0,
  reason: '',
  reasonDetail: '',
})

const freezeReasonOptions = [
  { value: 'abnormal', label: '异常交易收回' },
  { value: 'duplicate', label: '重复发放收回' },
  { value: 'manual', label: '手动扣除' },
  { value: 'other', label: '其他' },
]

const unfreezeReasonOptions = [
  { value: 'risk_cleared', label: '风险解除' },
  { value: 'manual', label: '手动解冻' },
  { value: 'other', label: '其他' },
]

const showFreezeModal = (wallet: UserWallet, mode: 'freeze' | 'unfreeze') => {
  freezeWalletTarget.value = wallet
  freezeMode.value = mode
  freezeForm.amount = 0
  freezeForm.reason = ''
  freezeForm.reasonDetail = ''
  freezeModal.value = true
}

const confirmFreezeAction = () => {
  if (!freezeWalletTarget.value || !freezeForm.reason) return
  const target = mockUserWallets.value.find(w => w.walletId === freezeWalletTarget.value!.walletId)
  if (!target) return
  const isFreeze = freezeMode.value === 'freeze'
  const maxFreeze = target.balance - target.frozenAmount
  const maxUnfreeze = target.frozenAmount
  
  if (isFreeze) {
    if (freezeForm.amount <= 0 || freezeForm.amount > maxFreeze) {
      alert(`冻结金额必须在 1 到 ${maxFreeze.toFixed(2)} 之间`)
      return
    }
  } else {
    if (freezeForm.amount <= 0 || freezeForm.amount > maxUnfreeze) {
      alert(`解冻金额必须在 1 到 ${maxUnfreeze.toFixed(2)} 之间`)
      return
    }
  }
  
  const amt = isFreeze ? -freezeForm.amount : freezeForm.amount
  const reasonObj = (isFreeze ? freezeReasonOptions : unfreezeReasonOptions).find(o => o.value === freezeForm.reason)
  const reasonText = reasonObj ? reasonObj.label : freezeForm.reason
  const detailText = freezeForm.reason === 'other' && freezeForm.reasonDetail ? `（${freezeForm.reasonDetail}）` : ''
  
  if (isFreeze) {
    target.frozenAmount += freezeForm.amount
    target.status = 'frozen'
    target.frozenReason = `${reasonText}：冻结 ¥${freezeForm.amount.toFixed(2)}`
  } else {
    target.frozenAmount -= freezeForm.amount
    if (target.frozenAmount <= 0) {
      target.status = 'normal'
      target.frozenReason = undefined
    }
  }
  
  // Generate transaction record
  const nextId = Math.max(...mockTransactions.value.map(t => parseInt(t.id))) + 1
  mockTransactions.value.push({
    id: String(nextId),
    transactionNo: `TXN-FRZ-${nextId.toString().padStart(3, '0')}`,
    uid: target.uid,
    phone: target.phone,
    type: 'freeze',
    amount: amt,
    balance: target.balance,
    relatedNo: '',
    merchant: '系统',
    operator: '管理员',
    time: new Date().toISOString().replace('T', ' ').slice(0, 19),
    remark: `${isFreeze ? '冻结' : '解冻'}：${reasonText}${detailText}`,
  })
  
  freezeModal.value = false
  alert(`钱包 ${target.walletId} 已${isFreeze ? '冻结' : '解冻'}（${isFreeze ? '冻结' : '解冻'}金额：¥${freezeForm.amount.toFixed(2)}）`)
}

// ==================== 模块4：充值管理 ====================
const mockRechargeRecords = ref<RechargeRecord[]>([
  { id: '1', rechargeNo: 'RCH-20260611-001', uid: 'u10001', phone: '138****1234', amount: 1000, receivedAmount: 1050, paymentStatus: 'paid', rechargeStatus: 'success', receiveMerchantName: '平台自营商户', paymentTime: '2026-06-11 10:30:15', rechargeTime: '2026-06-11 10:30:18', applyTime: '2026-06-11 10:30:00', remark: '' , bonusAmount: 50, payOrderNo: 'PAY-20260611-001'},
  { id: '2', rechargeNo: 'RCH-20260611-002', uid: 'u10002', phone: '139****5678', amount: 500, receivedAmount: 500, paymentStatus: 'paid', rechargeStatus: 'pending', receiveMerchantName: '平台自营商户', paymentTime: '2026-06-11 11:00:00', rechargeTime: '', applyTime: '2026-06-11 10:59:45', remark: '支付回调已收到，入账处理中', payOrderNo: 'PAY-20260611-002'},
  { id: '3', rechargeNo: 'RCH-20260611-003', uid: 'u10005', phone: '135****7890', amount: 200, receivedAmount: 200, paymentStatus: 'pending', rechargeStatus: 'pending', receiveMerchantName: 'XX数码旗舰店', paymentTime: '', rechargeTime: '', applyTime: '2026-06-11 11:15:30', remark: '' },
  { id: '4', rechargeNo: 'RCH-20260611-004', uid: 'u10003', phone: '137****9012', amount: 3000, receivedAmount: 3000, paymentStatus: 'failed', rechargeStatus: 'pending', receiveMerchantName: '平台自营商户', paymentTime: '', rechargeTime: '', applyTime: '2026-06-11 12:00:00', remark: '支付接口返回失败' },
  { id: '5', rechargeNo: 'RCH-20260610-001', uid: 'u10006', phone: '134****2345', amount: 5000, receivedAmount: 5200, paymentStatus: 'paid', rechargeStatus: 'success', receiveMerchantName: '平台自营商户', paymentTime: '2026-06-10 09:20:00', rechargeTime: '2026-06-10 09:20:05', applyTime: '2026-06-10 09:19:50', remark: '' , bonusAmount: 200, payOrderNo: 'PAY-20260610-001'},
  { id: '6', rechargeNo: 'RCH-20260610-002', uid: 'u10007', phone: '133****6789', amount: 100, receivedAmount: 100, paymentStatus: 'closed', rechargeStatus: 'pending', receiveMerchantName: 'XX服饰专营店', paymentTime: '', rechargeTime: '', applyTime: '2026-06-10 15:00:00', remark: '用户超时关闭' },
  { id: '7', rechargeNo: 'RCH-20260609-001', uid: 'u10004', phone: '136****3456', amount: 10000, receivedAmount: 10000, paymentStatus: 'paid', rechargeStatus: 'failed', receiveMerchantName: '平台自营商户', paymentTime: '2026-06-09 14:30:00', rechargeTime: '', applyTime: '2026-06-09 14:29:30', remark: '支付成功但入账异常，需人工处理', payOrderNo: 'PAY-20260609-001'},
  { id: '8', rechargeNo: 'RCH-20260609-002', uid: 'u10008', phone: '132****0123', amount: 1500, receivedAmount: 1580, paymentStatus: 'paid', rechargeStatus: 'success', receiveMerchantName: '平台自营商户', paymentTime: '2026-06-09 16:45:00', rechargeTime: '2026-06-09 16:45:03', applyTime: '2026-06-09 16:44:50', remark: '' , bonusAmount: 80, payOrderNo: 'PAY-20260609-002'},
])

const rechargeSearchForm = reactive({ keyword: '', rechargeStatus: '' })

const filteredRecharges = computed(() => {
  return mockRechargeRecords.value.filter(r => {
    const kw = rechargeSearchForm.keyword
    const matchKw = !kw || r.rechargeNo.includes(kw) || r.uid.includes(kw) || r.phone.includes(kw)
    const matchPay = r.paymentStatus === 'paid'
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
  if (!confirm(`确认手动将 ¥${item.receivedAmount.toFixed(2)} 入账到用户 ${item.uid} 的钱包？`)) return
  item.rechargeStatus = 'success'
  item.rechargeTime = new Date().toLocaleString('zh-CN', { hour12: false })
  alert(`充值单 ${item.rechargeNo} 已手动入账成功`)
}

// ==================== 充值流水资金桶视图 ====================
interface RechargeBucket {
  type: 'principal' | 'bonus'
  originalAmount: number
  remainingAmount: number
  withdrawable: boolean
  sourceRule: string
  consumptions: { orderNo: string; type: string; amount: number; time: string }[]
}

const rechargeFlowModal = ref(false)
const rechargeFlowItem = ref<RechargeRecord | null>(null)
const rechargeFlowBuckets = ref<RechargeBucket[]>([])

const showRechargeFlow = (record: RechargeRecord) => {
  rechargeFlowItem.value = record
  const principal = record.amount
  rechargeFlowBuckets.value = [
    {
      type: 'principal',
      originalAmount: principal,
      remainingAmount: Math.round(principal * 0.65),
      withdrawable: true,
      sourceRule: '用户充值本金，按充值金额入账',
      consumptions: [
        { orderNo: 'ORD-20260615-001', type: 'consume', amount: Math.round(principal * 0.25), time: '2026-06-15 14:30:00' },
        { orderNo: 'ORD-20260618-002', type: 'consume', amount: Math.round(principal * 0.10), time: '2026-06-18 09:15:00' },
      ],
    },
  ]
  const bonus = record.bonusAmount || 0
  if (bonus > 0) {
    rechargeFlowBuckets.value.push({
      type: 'bonus',
      originalAmount: bonus,
      remainingAmount: Math.round(bonus * 0.80),
      withdrawable: false,
      sourceRule: '充值活动赠送，按活动规则入账',
      consumptions: [
        { orderNo: 'ORD-20260616-003', type: 'consume', amount: Math.round(bonus * 0.20), time: '2026-06-16 11:00:00' },
      ],
    })
  }
  rechargeFlowModal.value = true
}

const paymentStatusLabel: Record<string, string> = {
  pending: '待支付', paid: '支付成功', failed: '支付失败', closed: '已关闭',
}
const rechargeStatusLabel: Record<string, string> = {
  pending: '待入账', success: '已入账', failed: '入账失败',
}

// ==================== 模块5：提现管理 ====================
const mockWithdrawRecords = ref<WithdrawRecord[]>([
  { id: '1', withdrawNo: 'WDR-20260611-001', uid: 'u10001', phone: '138****1234', amount: 200, refundType: 'full', relatedOrderNo: 'ORD-20260610-001', relatedRechargeNo: 'RCH-2026060-001', originalPayMethod: 'wechat', fee: 0, actualAmount: 200, status: 'pending', operator: '', applyTime: '2026-06-11 09:00:00', completeTime: '' },
  { id: '2', withdrawNo: 'WDR-20260611-002', uid: 'u10002', phone: '139****5678', amount: 500, refundType: 'partial', relatedOrderNo: 'ORD-20260608-003', relatedRechargeNo: 'RCH-2026068-003', originalPayMethod: 'alipay', fee: 2.50, actualAmount: 497.50, status: 'approved', operator: '张三', applyTime: '2026-06-11 10:30:00', completeTime: '', partialRefundReason: '商品部分退货' },
  { id: '3', withdrawNo: 'WDR-20260610-001', uid: 'u10005', phone: '135****7890', amount: 800, refundType: 'full', relatedOrderNo: 'ORD-20260605-002', relatedRechargeNo: 'RCH-2026065-002', originalPayMethod: 'wechat', fee: 0, actualAmount: 800, status: 'refunded', operator: '张三', applyTime: '2026-06-10 08:00:00', completeTime: '2026-06-10 14:30:00' },
  { id: '4', withdrawNo: 'WDR-20260610-002', uid: 'u10006', phone: '134****2345', amount: 1500, refundType: 'full', relatedOrderNo: 'ORD-20260609-001', relatedRechargeNo: 'RCH-2026069-001', originalPayMethod: 'bank', fee: 0, actualAmount: 1500, status: 'rejected', operator: '李四', applyTime: '2026-06-10 11:00:00', completeTime: '2026-06-10 16:00:00', rejectReason: '提现申请超出规定期限' },
  { id: '5', withdrawNo: 'WDR-20260609-001', uid: 'u10003', phone: '137****9012', amount: 89.50, refundType: 'full', relatedOrderNo: 'ORD-20260608-005', relatedRechargeNo: 'RCH-2026068-005', originalPayMethod: 'wechat', fee: 0, actualAmount: 89.50, status: 'refunded', operator: '系统', applyTime: '2026-06-09 15:00:00', completeTime: '2026-06-09 15:05:00' },
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
  if (!confirm(`确认审核通过提现单 ${item.withdrawNo}？\n提现金额：¥${item.amount.toFixed(2)}`)) return
  item.status = 'approved'
  item.operator = '当前用户'
  alert(`提现单 ${item.withdrawNo} 已审核通过`)
}

const confirmRefund = (item: WithdrawRecord) => {
  if (!confirm(`确认已完成打款？\n到账金额：¥${item.actualAmount.toFixed(2)}`)) return
  item.status = 'refunded'
  item.completeTime = new Date().toLocaleString('zh-CN', { hour12: false })
  alert(`提现单 ${item.withdrawNo} 已完成打款`)
}

const rejectWithdraw = (item: WithdrawRecord) => {
  const reason = prompt('请输入拒绝原因：')
  if (!reason) return
  item.status = 'rejected'
  item.rejectReason = reason
  item.operator = '当前用户'
  item.completeTime = new Date().toLocaleString('zh-CN', { hour12: false })
  alert(`提现单 ${item.withdrawNo} 已拒绝`)
}

const withdrawStatusLabel: Record<string, string> = {
  pending: '待审核', approved: '审核通过待打款', refunded: '已打款', rejected: '已拒绝',
}
const payMethodLabel: Record<string, string> = {
  wechat: '微信', alipay: '支付宝', bank: '银行卡',
}

// ==================== 模块6：交易流水 ====================
const mockTransactions = ref<WalletTransaction[]>([
  {
    id: '1', transactionNo: 'TXN-20260611-001', uid: 'u10001', phone: '138****1234', relatedRechargeNo: 'RCH-20260601-001',
    type: 'recharge', amount: 1000, balance: 2280.50, relatedNo: 'RCH-20260611-001',
    merchant: '平台自营商户', operator: '系统', time: '2026-06-11 10:30:18', remark: '线上充值',
  },
  {
    id: '2', transactionNo: 'TXN-20260611-002', uid: 'u10001', phone: '138****1234', relatedRechargeNo: 'RCH-20260601-001',
    type: 'consume', amount: -188, balance: 2092.50, relatedNo: 'ORD-20260611-001',
    merchant: 'XX服饰专营店', operator: '系统', time: '2026-06-11 14:20:00', remark: '订单消费',
    bucketLogs: [
      { bucketNo: 'RCH-20260601-001', bucketTime: '2026-06-01 10:00:00', deductAmount: 100, remainAmount: 0 },
      { bucketNo: 'RCH-20260608-002', bucketTime: '2026-06-08 15:30:00', deductAmount: 88, remainAmount: 312 },
    ],
  },
  {
    id: '3', transactionNo: 'TXN-20260610-001', uid: 'u10002', phone: '139****5678', relatedRechargeNo: 'RCH-20260520-001',
    type: 'recharge', amount: 500, balance: 4060, relatedNo: 'RCH-20260610-003',
    merchant: '平台自营商户', operator: '系统', time: '2026-06-10 16:00:00', remark: '线上充值',
  },
  {
    id: '4', transactionNo: 'TXN-20260610-002', uid: 'u10005', phone: '135****7890', relatedRechargeNo: 'RCH-20260520-001',
    type: 'refund', amount: 200, balance: 1000, relatedNo: 'ORD-20260609-005',
    merchant: 'XX服饰专营店', operator: '系统', time: '2026-06-10 14:30:00', remark: '订单退款',
    bucketLogs: [
      { bucketNo: 'RCH-20260520-001', bucketTime: '2026-05-20 09:00:00', deductAmount: 200, remainAmount: 200 },
    ],
  },
  {
    id: '5', transactionNo: 'TXN-20260609-001', uid: 'u10004', phone: '136****3456', relatedRechargeNo: 'RCH-20260520-001',
    type: 'withdraw', amount: -800, balance: 4400, relatedNo: 'WDR-20260609-001',
    merchant: '系统', operator: '张三', time: '2026-06-09 10:00:00', remark: '用户提现',
    bucketLogs: [
      { bucketNo: 'RCH-20260520-001', bucketTime: '2026-05-20 09:00:00', deductAmount: 500, remainAmount: 0 },
      { bucketNo: 'RCH-20260525-002', bucketTime: '2026-05-25 14:00:00', deductAmount: 300, remainAmount: 700 },
    ],
  },
  {
    id: '6', transactionNo: 'TXN-20260609-002', uid: 'u10008', phone: '132****0123', relatedRechargeNo: 'RCH-20260601-002',
    type: 'recharge', amount: 1500, balance: 8300, relatedNo: 'RCH-20260609-002',
    merchant: '平台自营商户', operator: '系统', time: '2026-06-09 16:45:03', remark: '线上充值',
  },
  {
    id: '7', transactionNo: 'TXN-20260608-001', uid: 'u10002', phone: '139****5678', relatedRechargeNo: 'RCH-20260601-002',
    type: 'consume', amount: -129, balance: 3560, relatedNo: 'ORD-20260608-002',
    merchant: 'XX数码旗舰店', operator: '系统', time: '2026-06-08 11:30:00', remark: '订单消费',
    bucketLogs: [
      { bucketNo: 'RCH-20260601-002', bucketTime: '2026-06-01 14:00:00', deductAmount: 129, remainAmount: 871 },
    ],
  },
  {
    id: '8', transactionNo: 'TXN-20260607-001', uid: 'u10003', phone: '137****9012', relatedRechargeNo: 'RCH-20260605-003',
    type: 'consume', amount: -59, balance: 148.50, relatedNo: 'ORD-20260607-001',
    merchant: 'XX食品店', operator: '系统', time: '2026-06-07 09:15:00', remark: '订单消费',
    bucketLogs: [
      { bucketNo: 'RCH-20260605-003', bucketTime: '2026-06-05 11:00:00', deductAmount: 59, remainAmount: 41 },
    ],
  },
  {
    id: '9', transactionNo: 'TXN-20260605-001', uid: 'u10006', phone: '134****2345', relatedRechargeNo: 'RCH-20260520-005',
    type: 'recharge', amount: 2000, balance: 13500, relatedNo: 'RCH-20260605-001',
    merchant: '平台自营商户', operator: '系统', time: '2026-06-05 14:00:00', remark: '线上充值',
  },
  {
    id: '10', transactionNo: 'TXN-20260604-001', uid: 'u10006', phone: '134****2345', relatedRechargeNo: 'RCH-20260520-005',
    type: 'consume', amount: -500, balance: 11500, relatedNo: 'ORD-20260604-003',
    merchant: 'XX服饰专营店', operator: '系统', time: '2026-06-04 18:00:00', remark: '订单消费',
    bucketLogs: [
      { bucketNo: 'RCH-20260520-005', bucketTime: '2026-05-20 16:00:00', deductAmount: 500, remainAmount: 1500 },
    ],
  },
  {
    id: '11', transactionNo: 'TXN-20260603-001', uid: 'u10001', phone: '138****1234', relatedRechargeNo: 'RCH-20260515-001',
    type: 'refund', amount: 219.50, balance: 1280.50, relatedNo: 'ORD-20260530-002',
    merchant: 'XX数码旗舰店', operator: '系统', time: '2026-06-03 10:00:00', remark: '订单退款',
    bucketLogs: [
      { bucketNo: 'RCH-20260608-002', bucketTime: '2026-06-08 15:30:00', deductAmount: 88, remainAmount: 400 },
      { bucketNo: 'RCH-20260601-001', bucketTime: '2026-06-01 10:00:00', deductAmount: 131.50, remainAmount: 131.50 },
    ],
  },
  {
    id: '12', transactionNo: 'TXN-20260602-001', uid: 'u10005', phone: '135****7890', relatedRechargeNo: 'RCH-20260515-001',
    type: 'withdraw', amount: -200, balance: 800, relatedNo: 'WDR-20260602-001',
    merchant: '系统', operator: '系统', time: '2026-06-02 15:00:00', remark: '用户提现',
    bucketLogs: [
      { bucketNo: 'RCH-20260515-001', bucketTime: '2026-05-15 10:00:00', deductAmount: 200, remainAmount: 0 },
    ],
  },
])

const ledgerSearchForm = reactive({ keyword: '', type: '', merchant: '' })

const filteredLedger = computed(() => {
  return mockTransactions.value.filter(tx => {
    const kw = ledgerSearchForm.keyword
    const matchKw = !kw || tx.transactionNo.includes(kw) || tx.uid.includes(kw) || tx.phone.includes(kw)
    const matchType = !ledgerSearchForm.type || tx.type === ledgerSearchForm.type
    const matchMerchant = !ledgerSearchForm.merchant || tx.merchant === ledgerSearchForm.merchant
    return matchKw && matchType && matchMerchant && (tx.type === 'consume' || tx.type === 'refund')
  })
})

// 流水详情弹窗
const txDetailModal = ref(false)
const txDetailItem = ref<WalletTransaction | null>(null)

const showTxDetail = (item: WalletTransaction) => {
  txDetailItem.value = item
  txDetailModal.value = true
}

// 交易列表中展开的子流水行 ID


const txTypeLabel: Record<string, string> = {
  recharge: '充值', refund: '退款', consume: '消费', withdraw: '提现', freeze: '冻结',
}

// ==================== 模块：商户签约 ====================
interface MerchantSign {
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

const signList = ref<MerchantSign[]>([
  { id: 'ms-001', merchantName: '平台自营商户', status: 'signed', contactPerson: '张三', contactPhone: '138****0001', signTime: '2026-01-15', terminateTime: '', remark: '' },
  { id: 'ms-002', merchantName: 'XX数码旗舰店', status: 'signed', contactPerson: '李四', contactPhone: '139****0002', signTime: '2026-03-20', terminateTime: '', remark: '' },
  { id: 'ms-003', merchantName: 'XX服饰专营店', status: 'terminated', contactPerson: '王五', contactPhone: '137****0003', signTime: '2025-11-01', terminateTime: '2026-04-30', remark: '合作到期' },
])

const signFilter = reactive({
  keyword: '',
  status: '',
})

const signStatusOptions = [
  { value: '', label: '全部状态' },
  { value: 'signed', label: '已签约' },
  { value: 'terminated', label: '已解约' },
]

const filteredSignList = computed(() => {
  return signList.value.filter((s) => {
    const kw = signFilter.keyword
    const matchKw = !kw || s.merchantName.includes(kw) || s.contactPerson.includes(kw) || s.contactPhone.includes(kw)
    const matchStatus = !signFilter.status || s.status === signFilter.status
    return matchKw && matchStatus
  })
})

const showSignModal = ref(false)
const isEditSign = ref(false)
const editingSignId = ref('')
const signForm = reactive({
  merchantName: '',
  contactPerson: '',
  contactPhone: '',
  agreement: '',
  remark: '',
})

const openSignModal = (item?: MerchantSign) => {
  if (item) {
    isEditSign.value = true
    editingSignId.value = item.id
    signForm.merchantName = item.merchantName
    signForm.contactPerson = item.contactPerson
    signForm.contactPhone = item.contactPhone
    signForm.remark = item.remark || ''
    signForm.agreement = item.agreement || ''
  } else {
    isEditSign.value = false
    editingSignId.value = ''
    signForm.merchantName = ''
    signForm.contactPerson = ''
    signForm.contactPhone = ''
    signForm.remark = ''
    signForm.agreement = ''
  }
  showSignModal.value = true
}

const closeSignModal = () => {
  showSignModal.value = false
}

const handleAgreementUpload = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.pdf,.jpg,.png'
  input.onchange = () => {
    if (input.files && input.files[0]) {
      signForm.agreement = input.files[0].name
    }
  }
  input.click()
}


const submitSign = () => {
  if (!signForm.merchantName) {
    alert('请选择商户')
    return
  }
  if (isEditSign.value) {
    const target = signList.value.find((s) => s.id === editingSignId.value)
    if (target) {
      target.merchantName = signForm.merchantName
      target.contactPerson = signForm.contactPerson
      target.contactPhone = signForm.contactPhone
      target.remark = signForm.remark
    }
      target.agreement = signForm.agreement
    alert('签约信息已更新')
  } else {
    const newSign: MerchantSign = {
      id: 'ms-' + String(Date.now()),
      merchantName: signForm.merchantName,
      status: 'signed',
      contactPerson: signForm.contactPerson,
      contactPhone: signForm.contactPhone,
      signTime: new Date().toISOString().slice(0, 10),
      terminateTime: '',
      remark: signForm.remark,
    }
      agreement: signForm.agreement,
    signList.value.unshift(newSign)
    alert('签约成功')
  }
  closeSignModal()
}

const terminateSign = (item: MerchantSign) => {
  if (confirm('确认与「' + item.merchantName + '」解约？解约后该商户将不再参与结算。')) {
    item.status = 'terminated'
    item.terminateTime = new Date().toISOString().slice(0, 10)
    alert('已解约')
  }
}

// ==================== 收款流水 ====================
const showSettlementModal = ref(false)
const settlementMerchant = ref<MerchantSign | null>(null)
const settlementTab = ref<'consume' | 'refund'>('consume')

const settlementConsumeRecords = computed(() => {
  if (!settlementMerchant.value) return []
  return mockTransactions.value.filter(
    (tx) => tx.merchant === settlementMerchant.value!.merchantName && tx.type === 'consume',
  )
})

const settlementRefundRecords = computed(() => {
  if (!settlementMerchant.value) return []
  return mockTransactions.value.filter(
    (tx) => tx.merchant === settlementMerchant.value!.merchantName && tx.type === 'refund',
  )
})

const settlementTotalConsume = computed(() => {
  return settlementConsumeRecords.value.reduce((sum, r) => sum + Math.abs(r.amount), 0)
})

const settlementTotalRefund = computed(() => {
  return settlementRefundRecords.value.reduce((sum, r) => sum + Math.abs(r.amount), 0)
})

const settlementNet = computed(() => {
  return settlementTotalConsume.value - settlementTotalRefund.value
})

const openSettlementFlow = (item: MerchantSign) => {
  settlementMerchant.value = item
  settlementTab.value = 'consume'
  showSettlementModal.value = true
}

</script>

<template>
  <div class="wallet-management">
    <!-- 左侧导航 -->
    <div class="sidebar">
      <div class="sidebar-title">钱包管理</div>
      <div class="menu-list">
        <div
          v-for="menu in menuList"
          :key="menu.key"
          class="menu-item"
          :class="{ active: activeMenu === menu.key }"
          @click="handleMenuClick(menu.key)"
        >
          {{ menu.label }}
        </div>
      </div>
    </div>

    <!-- 右侧内容区 -->
    <div class="main-content">

            <!-- ===== 模块1：钱包设置 ===== -->
      <div v-if="activeMenu === 'wallet_config'" class="content-panel">
        <div class="panel-header">
          <h2>钱包设置</h2>
          <span class="panel-subtitle">全局钱包功能开关及业务规则配置</span>
          <button v-if="configSaved && !editingConfig" class="btn btn-primary btn-xs" @click="startEditConfig" style="margin-left: auto">编辑</button>
        </div>
        <div class="panel-body">
          <!-- ========== 编辑模式：表单编辑 ========== -->
          <template v-if="!configSaved || editingConfig">
            <div class="wcfg-card">
              <div class="wcfg-card-header">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4F6EF7" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="12" y2="17"/></svg>
                <span>基础设置</span>
              </div>
              <div class="wcfg-card-body">
                <div class="wcfg-row">
                  <div class="wcfg-field">
                    <label class="wcfg-label">钱包开关</label>
                    <label class="toggle-switch">
                      <input type="checkbox" v-model="walletConfig.enabled" />
                      <span class="toggle-slider"></span>
                    </label>
                  </div>
                  <div class="wcfg-field" v-if="walletConfig.enabled">
                    <label class="wcfg-label required">钱包名称</label>
                    <input type="text" class="form-input" v-model="walletConfig.name" placeholder="如：零钱、余额" />
                  </div>
                </div>
              </div>
            </div>

            <template v-if="walletConfig.enabled">
              <div class="wcfg-card">
                <div class="wcfg-card-header">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4F6EF7" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                  <span>充值设置</span>
                </div>
                <div class="wcfg-card-body">
                  <div class="wcfg-row">
                    <div class="wcfg-field">
                      <label class="wcfg-label required">最低充值金额</label>
                      <div class="wcfg-input-group">
                        <input type="number" class="form-input form-input-sm" v-model.number="walletConfig.minRecharge" min="0.01" step="0.01" />
                        <span class="wcfg-unit">元</span>
                      </div>
                    </div>
                    <div class="wcfg-field">
                      <label class="wcfg-label required">最高充值金额</label>
                      <div class="wcfg-input-group">
                        <input type="number" class="form-input form-input-sm" v-model.number="walletConfig.maxRecharge" min="1" step="0.01" />
                        <span class="wcfg-unit">元</span>
                      </div>
                    </div>
                  </div>
                  <div class="wcfg-field" style="margin-bottom: 0">
                    <label class="wcfg-label required">收款商户</label>
                    <select class="form-select" v-model="walletConfig.receiveMerchantId" style="width: 240px">
                      <option value="">请选择商户</option>
                      <option v-for="m in mockMerchants" :key="m.id" :value="m.id">{{ m.name }}</option>
                    </select>
                    <span class="wcfg-hint">用户充值时资金打入该商户账户</span>
                  </div>
                </div>
              </div>

              <div class="wcfg-card">
                <div class="wcfg-card-header">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4F6EF7" stroke-width="2" stroke-linecap="round"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                  <span>提现设置</span>
                </div>
                <div class="wcfg-card-body">
                  <div class="wcfg-row">
                    <div class="wcfg-field">
                      <label class="wcfg-label">是否支持提现</label>
                      <label class="toggle-switch">
                        <input type="checkbox" v-model="walletConfig.withdrawEnabled" />
                        <span class="toggle-slider"></span>
                      </label>
                    </div>
                    <div class="wcfg-field" v-if="walletConfig.withdrawEnabled">
                      <label class="wcfg-label">提现审核</label>
                      <label class="toggle-switch">
                        <input type="checkbox" v-model="walletConfig.withdrawNeedReview" />
                        <span class="toggle-slider"></span>
                      </label>
                      <span class="wcfg-hint">{{ walletConfig.withdrawNeedReview ? '开启（人工审批）' : '关闭（自动放行）' }}</span>
                    </div>
                  </div>
                  <template v-if="walletConfig.withdrawEnabled">
                    <div class="wcfg-divider"></div>
                    <div class="wcfg-row">
                      <div class="wcfg-field">
                        <label class="wcfg-label">手续费</label>
                        <div class="wcfg-input-group">
                          <select class="form-select form-input-sm" v-model="walletConfig.feeType" style="width: 100px">
                            <option value="fixed">固定</option>
                            <option value="percent">比例</option>
                          </select>
                          <input type="number" class="form-input form-input-sm" v-model.number="walletConfig.feeValue" min="0" step="0.01" style="width: 80px" />
                          <span class="wcfg-unit">{{ walletConfig.feeType === "fixed" ? "元/笔" : "%" }}</span>
                        </div>
                      </div>
                    </div>
                    <div class="wcfg-row">
                      <div class="wcfg-field">
                        <label class="wcfg-label required">最低提现金额</label>
                        <div class="wcfg-input-group">
                          <input type="number" class="form-input form-input-sm" v-model.number="walletConfig.minWithdraw" min="0.01" step="0.01" />
                          <span class="wcfg-unit">元</span>
                        </div>
                      </div>
                      <div class="wcfg-field">
                        <label class="wcfg-label required">最高提现金额</label>
                        <div class="wcfg-input-group">
                          <input type="number" class="form-input form-input-sm" v-model.number="walletConfig.maxWithdraw" min="1" step="0.01" />
                          <span class="wcfg-unit">元</span>
                        </div>
                      </div>
                    </div>
                    <div class="wcfg-row">
                      <div class="wcfg-field">
                        <label class="wcfg-label">日提现限额</label>
                        <div class="wcfg-input-group">
                          <input type="number" class="form-input form-input-sm" v-model.number="walletConfig.dailyWithdrawLimit" min="1" step="0.01" />
                          <span class="wcfg-unit">元</span>
                        </div>
                      </div>
                      <div class="wcfg-field">
                        <label class="wcfg-label">提现后余额下限</label>
                        <div class="wcfg-input-group">
                          <input type="number" class="form-input form-input-sm" v-model.number="walletConfig.minBalanceAfterWithdraw" min="0" step="0.01" />
                          <span class="wcfg-unit">元（0=不限制）</span>
                        </div>
                      </div>
                    </div>
                  </template>
                </div>
              </div>
            </template>

            <div style="display: flex; gap: 12px; margin-top: 24px">
              <button class="btn btn-primary" @click="saveConfig" :disabled="!walletConfig.receiveMerchantId">保存配置</button>
              <button class="btn btn-default" @click="cancelEditConfig">取消</button>
            </div>
          </template>

          <!-- ========== 查看模式：只读展示 ========== -->
          <template v-else>
            <div class="wcfg-view-grid">
              <div class="wcfg-view-card">
                <div class="wcfg-view-card-header">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4F6EF7" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="12" y2="17"/></svg>
                  <span>基础设置</span>
                </div>
                <div class="wcfg-view-card-body">
                  <div class="wcfg-view-field">
                    <span class="wcfg-view-label">钱包开关</span>
                    <span class="wcfg-view-value"><span class="wcfg-status-badge" :class="walletConfig.enabled ? 'on' : 'off'">{{ walletConfig.enabled ? '已开启' : '已关闭' }}</span></span>
                  </div>
                  <div class="wcfg-view-field">
                    <span class="wcfg-view-label">钱包名称</span>
                    <span class="wcfg-view-value">{{ walletConfig.name || '-' }}</span>
                  </div>
                </div>
              </div>
              <template v-if="walletConfig.enabled">
                <div class="wcfg-view-card">
                  <div class="wcfg-view-card-header">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4F6EF7" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                    <span>充值设置</span>
                  </div>
                  <div class="wcfg-view-card-body">
                    <div class="wcfg-view-field">
                      <span class="wcfg-view-label">最低充值金额</span>
                      <span class="wcfg-view-value price-text">¥{{ walletConfig.minRecharge.toFixed(2) }}</span>
                    </div>
                    <div class="wcfg-view-field">
                      <span class="wcfg-view-label">最高充值金额</span>
                      <span class="wcfg-view-value price-text">¥{{ walletConfig.maxRecharge.toFixed(2) }}</span>
                    </div>
                    <div class="wcfg-view-field">
                      <span class="wcfg-view-label">收款商户</span>
                      <span class="wcfg-view-value">{{ walletConfig.receiveMerchantName || '-' }}</span>
                    </div>
                  </div>
                </div>
                <div class="wcfg-view-card">
                  <div class="wcfg-view-card-header">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4F6EF7" stroke-width="2" stroke-linecap="round"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                    <span>提现设置</span>
                  </div>
                  <div class="wcfg-view-card-body">
                    <div class="wcfg-view-field">
                      <span class="wcfg-view-label">提现开关</span>
                      <span class="wcfg-view-value"><span class="wcfg-status-badge" :class="walletConfig.withdrawEnabled ? 'on' : 'off'">{{ walletConfig.withdrawEnabled ? '已开启' : '已关闭' }}</span></span>
                    </div>
                    <template v-if="walletConfig.withdrawEnabled">
                      <div class="wcfg-view-field">
                        <span class="wcfg-view-label">提现审核</span>
                        <span class="wcfg-view-value"><span class="wcfg-status-badge" :class="walletConfig.withdrawNeedReview ? 'on' : 'off'">{{ walletConfig.withdrawNeedReview ? '开启' : '关闭' }}</span></span>
                      </div>
                      <div class="wcfg-view-field">
                        <span class="wcfg-view-label">手续费</span>
                        <span class="wcfg-view-value">{{ walletConfig.feeType === 'fixed' ? walletConfig.feeValue + ' 元/笔' : walletConfig.feeValue + ' %' }}</span>
                      </div>
                      <div class="wcfg-view-field">
                        <span class="wcfg-view-label">最低提现金额</span>
                        <span class="wcfg-view-value price-text">¥{{ walletConfig.minWithdraw.toFixed(2) }}</span>
                      </div>
                      <div class="wcfg-view-field">
                        <span class="wcfg-view-label">最高提现金额</span>
                        <span class="wcfg-view-value price-text">¥{{ walletConfig.maxWithdraw.toFixed(2) }}</span>
                      </div>
                      <div class="wcfg-view-field">
                        <span class="wcfg-view-label">日提现限额</span>
                        <span class="wcfg-view-value price-text">¥{{ walletConfig.dailyWithdrawLimit.toFixed(2) }}</span>
                      </div>
                      <div class="wcfg-view-field">
                        <span class="wcfg-view-label">提现后余额下限</span>
                        <span class="wcfg-view-value price-text">¥{{ walletConfig.minBalanceAfterWithdraw.toFixed(2) }}</span>
                      </div>
                    </template>
                  </div>
                </div>
              </template>
            </div>

            <!-- 修改记录 -->
            <div class="history-section" style="margin-top: 32px">
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
          </template>
        </div>
      </div><!-- ===== 充值方案 ===== -->

      <!-- ===== 商户签约 ===== -->
      <div v-if="activeMenu === 'wallet_merchant_sign'" class="content-panel">
        <div class="panel-header">
          <h2>商户签约</h2>
          <button class="btn btn-primary" @click="openSignModal()">+ 新增签约</button>
        </div>
        <div class="panel-body">
          <div class="filter-bar">
            <div class="filter-item">
              <label>商户名称</label>
              <input type="text" class="form-input" v-model="signFilter.keyword" placeholder="商户名称/联系人/电话" style="width: 200px" />
            </div>
            <div class="filter-item">
              <label>签约状态</label>
              <select class="form-select" v-model="signFilter.status" style="width: 120px">
                <option v-for="opt in signStatusOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th>商户名称</th>
                <th>联系人</th>
                <th>联系电话</th>
                <th>签约状态</th>
                <th>签约时间</th>
                <th>解约时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in filteredSignList" :key="item.id">
                <td>{{ item.merchantName }}</td>
                <td>{{ item.contactPerson || '-' }}</td>
                <td>{{ item.contactPhone || '-' }}</td>
                <td>
                  <span :class="'status-badge ' + (item.status === 'signed' ? 'on' : 'off')">
                    {{ item.status === 'signed' ? '已签约' : '已解约' }}
                  </span>
                </td>
                <td>{{ item.signTime || '-' }}</td>
                <td>{{ item.terminateTime || '-' }}</td>
                <td>
                  <a class="action-link" @click="openSignModal(item)">编辑</a>
                  <a class="action-link primary" @click="openSettlementFlow(item)" style="margin-left: 8px">收款流水</a>
                  <a v-if="item.status === 'signed'" class="action-link danger" @click="terminateSign(item)" style="margin-left: 8px">解约</a>
                </td>
              </tr>
              <tr v-if="filteredSignList.length === 0">
                <td colspan="7" class="empty-text">暂无签约数据</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 新增/编辑签约弹窗 -->
        <div class="modal-overlay" v-if="showSignModal" @click="closeSignModal">
          <div class="modal-content modal-md" @click.stop>
            <div class="modal-header">
              <h3>{{ isEditSign ? '编辑签约' : '新增签约' }}</h3>
              <div class="modal-close" @click="closeSignModal">
                <svg class="modal-close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>
              </div>
            </div>
            <div class="modal-body">
              <div class="form-item">
                <label class="form-label required">商户</label>
                <select class="form-select" v-model="signForm.merchantName" :disabled="isEditSign" style="width: 100%">
                  <option value="">请选择商户</option>
                  <option v-for="m in mockMerchants" :key="m.id" :value="m.name">{{ m.name }}</option>
                </select>
              </div>
              <div class="form-item">
                <label class="form-label">联系人</label>
                <input type="text" class="form-input" v-model="signForm.contactPerson" placeholder="选填" style="width: 100%" />
              </div>
              <div class="form-item">
                <label class="form-label">联系电话</label>
                <input type="text" class="form-input" v-model="signForm.contactPhone" placeholder="选填" style="width: 100%" />
              </div>
              <div class="form-item">
                <label class="form-label">备注</label>
                <textarea class="form-textarea" v-model="signForm.remark" rows="2" placeholder="选填" style="width: 100%"></textarea>
              </div>
              <div class="form-item">
                <label class="form-label">签约协议</label>
                <div style="display: flex; align-items: center; gap: 10px;">
                  <button class="btn btn-default" style="height: 32px; padding: 0 16px; font-size: 13px; flex-shrink: 0;" @click="handleAgreementUpload">上传协议扫描件</button>
                  <span v-if="signForm.agreement" style="font-size: 13px; color: #00A854; white-space: nowrap;">已上传：{{ signForm.agreement }}</span>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-default" @click="closeSignModal">取消</button>
              <button class="btn btn-primary" @click="submitSign">{{ isEditSign ? '保存' : '确认签约' }}</button>
            </div>
          </div>
        </div>

        <!-- 收款流水弹窗 -->
        <div class="modal-overlay" v-if="showSettlementModal" @click="showSettlementModal = false">
          <div class="modal-content" style="width: auto; min-width: 720px; max-width: 90vw;" @click.stop>
            <div class="modal-header">
              <h3>收款流水 - {{ settlementMerchant?.merchantName }}</h3>
              <div class="modal-close" @click="showSettlementModal = false">
                <svg class="modal-close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>
              </div>
            </div>
            <div class="modal-body">
              <div class="settle-stats">
                <div class="settle-stat-card consume">
                  <div class="settle-stat-label">消费总额</div>
                  <div class="settle-stat-value">¥{{ settlementTotalConsume.toLocaleString() }}</div>
                </div>
                <div class="settle-stat-card refund">
                  <div class="settle-stat-label">退款总额</div>
                  <div class="settle-stat-value">¥{{ settlementTotalRefund.toLocaleString() }}</div>
                </div>
                <div class="settle-stat-card" :class="settlementNet >= 0 ? 'net-positive' : 'net-negative'">
                  <div class="settle-stat-label">净结算</div>
                  <div class="settle-stat-value">{{ settlementNet >= 0 ? '+' : '' }}¥{{ settlementNet.toLocaleString() }}</div>
                </div>
              </div>

              <div class="segmented-control">
                <button class="segmented-btn" :class="{ active: settlementTab === 'consume' }" @click="settlementTab = 'consume'">消费流水</button>
                <button class="segmented-btn" :class="{ active: settlementTab === 'refund' }" @click="settlementTab = 'refund'">退款流水</button>
              </div>
              <table class="data-table table-nowrap" v-if="settlementTab === 'consume'">
                <thead>
                  <tr>
                    <th>流水号</th>
                    <th>用户ID</th>
                    <th>手机号</th>
                    <th>消费金额</th>
                    <th>关联订单</th>
                    <th>时间</th>
                    <th>备注</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="r in settlementConsumeRecords" :key="r.id">
                    <td>{{ r.transactionNo }}</td>
                    <td>{{ r.uid }}</td>
                    <td>{{ r.phone }}</td>
                    <td class="amount-positive">¥{{ Math.abs(r.amount).toLocaleString() }}</td>
                    <td>{{ r.relatedNo }}</td>
                    <td class="time-text">{{ r.time }}</td>
                    <td>{{ r.remark || '-' }}</td>
                  </tr>
                  <tr v-if="settlementConsumeRecords.length === 0">
                    <td colspan="7" class="empty-text">暂无消费流水</td>
                  </tr>
                </tbody>
              </table>

              <table class="data-table table-nowrap" v-if="settlementTab === 'refund'">
                <thead>
                  <tr>
                    <th>流水号</th>
                    <th>用户ID</th>
                    <th>手机号</th>
                    <th>退款金额</th>
                    <th>关联订单</th>
                    <th>时间</th>
                    <th>备注</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="r in settlementRefundRecords" :key="r.id">
                    <td>{{ r.transactionNo }}</td>
                    <td>{{ r.uid }}</td>
                    <td>{{ r.phone }}</td>
                    <td class="amount-negative">¥{{ Math.abs(r.amount).toLocaleString() }}</td>
                    <td>{{ r.relatedNo }}</td>
                    <td class="time-text">{{ r.time }}</td>
                    <td>{{ r.remark || '-' }}</td>
                  </tr>
                  <tr v-if="settlementRefundRecords.length === 0">
                    <td colspan="7" class="empty-text">暂无退款流水</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeMenu === 'wallet_recharge_plan'" class="content-panel">
        <div class="panel-header">
          <h2>充值方案</h2>
          <button class="btn btn-primary" @click="openPlanCreate">+ 新增方案</button>
        </div>
        <div class="panel-body">
          <div class="plan-tip" style="margin-bottom: 16px; padding: 10px 14px; background: #FFF7E6; border-radius: 6px; color: #D46B08; font-size: 13px;">
            同一时间仅有一个方案生效，启用新方案将自动停用当前生效方案。
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th>方案名称</th>
                <th>预选金额</th>
                <th>活动数量</th>
                <th>状态</th>
                <th>生效时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="plan in rechargePlans" :key="plan.id">
                <td><strong>{{ plan.name }}</strong></td>
                <td>
                  <span v-for="(p, i) in plan.presets" :key="p.id">
                    {{ i > 0 ? ' / ' : '' }}¥{{ p.amount }}
                  </span>
                  <span v-if="plan.allowCustom" style="color: #86909C; margin-left: 4px">+ 自定义</span>
                </td>
                <td>
                  <span v-if="plan.activities.length === 0" style="color: #86909C">无</span>
                  <span v-else>{{ plan.activities.filter(a => a.enabled).length }}/{{ plan.activities.length }} 启用</span>
                </td>
                <td>
                  <span class="status-tag" :class="plan.enabled ? 'refunded' : 'closed'">
                    {{ plan.enabled ? '生效中' : '已禁用' }}
                  </span>
                </td>
                <td>{{ plan.activeTime || '-' }}</td>
                <td>
                  <span class="action-link primary" @click="openPlanEdit(plan)">编辑</span>
                  <span class="action-link primary" @click="openPlanDetail(plan)" style="margin-left: 8px">详情</span>
                  <span
                    :class="plan.enabled ? 'action-link danger' : 'action-link primary'"
                    @click="togglePlanEnabled(plan)"
                    style="margin-left: 8px"
                  >{{ plan.enabled ? '禁用' : '启用' }}</span>
                  <span v-if="!plan.enabled" class="action-link danger" @click="deletePlan(plan)" style="margin-left: 8px">删除</span>
                </td>
              </tr>
              <tr v-if="rechargePlans.length === 0">
                <td colspan="4" style="text-align: center; color: #86909C; padding: 40px">暂无充值方案，点击上方新增</td>
              </tr>
            </tbody>
          </table>
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
                <span class="legend-item"><i style="background: #4F6EF7"></i>充值</span>
                <span class="legend-item"><i style="background: #D46B08"></i>消费</span>
                <span class="legend-item"><i style="background: #0E7B3A"></i>退款</span>
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
                  <span class="action-link primary" @click="showUserFlow(w)">查看详情</span>
                  <span v-if="w.status === 'normal'" class="action-link danger" @click="showFreezeModal(w, 'freeze')" style="margin-left: 8px">冻结</span>
                  <span v-if="w.status === 'frozen'" class="action-link primary" @click="showFreezeModal(w, 'unfreeze')" style="margin-left: 8px">解冻</span>
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
              <button class="btn btn-default" style="margin-left: 8px" @click="rechargeSearchForm.keyword = ''; rechargeSearchForm.rechargeStatus = ''">重置</button>
            </div>
          </div>

          <table class="data-table">
            <thead>
              <tr>
                <th>充值单号</th>
                <th>支付单号</th>
                <th>用户</th>
                <th>支付金额</th>
                <th>到账金额</th>
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
                <td>{{ r.payOrderNo || '-' }}</td>
                <td>{{ r.uid }}<br/><span class="sub-text">{{ r.phone }}</span></td>
                <td class="price-text">¥{{ r.amount.toFixed(2) }}</td>
                <td class="price-text">¥{{ r.receivedAmount.toFixed(2) }}</td>
                <td>{{ r.receiveMerchantName }}</td>
                <td><span class="status-tag" :class="r.paymentStatus">{{ paymentStatusLabel[r.paymentStatus] }}</span></td>
                <td><span class="status-tag" :class="r.rechargeStatus === 'success' ? 'completed' : r.rechargeStatus">{{ rechargeStatusLabel[r.rechargeStatus] }}</span></td>
                <td class="time-text">{{ r.applyTime }}</td>
                <td>
                  <span class="action-link primary" @click="showRechargeDetail(r)">详情</span>
                  <span v-if="r.rechargeStatus === 'success'" class="action-link primary" @click="showRechargeFlow(r)" style="margin: 0 8px">查看流水</span>
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
          <span class="panel-subtitle">提现审核与打款</span>
        </div>
        <div class="panel-body">
          <div class="filter-bar">
            <div class="filter-item">
              <label>搜索</label>
              <input type="text" class="form-input" v-model="withdrawSearchForm.keyword" placeholder="提现单号 / UID / 关联订单号" style="width: 220px" />
            </div>
            <div class="filter-item">
              <label>提现类型</label>
              <select class="form-select" v-model="withdrawSearchForm.refundType" style="width: 120px">
                <option value="">全部</option>
                <option value="full">全额提现</option>
                <option value="partial">部分提现</option>
              </select>
            </div>
            <div class="filter-item">
              <label>状态</label>
              <select class="form-select" v-model="withdrawSearchForm.status" style="width: 140px">
                <option value="">全部</option>
                <option value="pending">待审核</option>
                <option value="approved">审核通过待打款</option>
                <option value="refunded">已打款</option>
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
                <th>提现单号</th>
                <th>用户</th>
                <th>提现金额</th>
                <th>提现类型</th>
                <th>关联订单</th>
                <th>关联充值</th>
                <th>到账方式</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="w in filteredWithdraws" :key="w.id">
                <td>{{ w.withdrawNo }}</td>
                <td>{{ w.uid }}<br/><span class="sub-text">{{ w.phone }}</span></td>
                <td class="price-text">¥{{ w.amount.toFixed(2) }}</td>
                <td><span class="status-tag" :class="w.refundType">{{ w.refundType === 'full' ? '全额提现' : '部分提现' }}</span></td>
                <td>{{ w.relatedOrderNo }}</td>
                <td>{{ w.relatedRechargeNo || '-' }}</td>
                <td>{{ payMethodLabel[w.originalPayMethod] }}</td>
                <td><span class="status-tag" :class="w.status">{{ withdrawStatusLabel[w.status] }}</span></td>
                <td>
                  <span class="action-link primary" @click="showWithdrawDetail(w)">详情</span>
                  <span v-if="w.status === 'pending'" class="action-link primary" @click="approveWithdraw(w)" style="margin-left: 8px">审核</span>
                  <span v-if="w.status === 'pending'" class="action-link danger" @click="rejectWithdraw(w)" style="margin-left: 8px">拒绝</span>
                  <span v-if="w.status === 'approved'" class="action-link primary" @click="confirmRefund(w)" style="margin-left: 8px">确认打款</span>
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
                <option value="consume">消费</option>
                <option value="refund">退款</option>
              </select>
            </div>
            <div class="filter-item">
              <label>商户</label>
              <select class="form-select" v-model="ledgerSearchForm.merchant" style="width: 140px">
                <option value=''>全部商户</option>
                <option v-for='m in merchantOptions' :key='m' :value='m'>{{ m }}</option>
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
                <th>商户</th>
                <th>交易类型</th>
                <th>金额</th>
                <th>余额</th>
                <th>关联单号</th>
                <th>关联充值</th>
                <th>时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="tx in filteredLedger" :key="tx.id">
                <!-- 主流水行 -->
                <tr>
                  <td>{{ tx.transactionNo }}</td>
                  <td>{{ tx.uid }}<br/><span class="sub-text">{{ tx.phone }}</span></td>
                  <td>{{ tx.merchant }}</td>
                  <td><span class="status-tag" :class="tx.type">{{ txTypeLabel[tx.type] }}</span></td>
                  <td :class="{ 'amount-positive': tx.amount > 0, 'amount-negative': tx.amount < 0 }">{{ tx.amount > 0 ? '+' : '' }}¥{{ Math.abs(tx.amount).toFixed(2) }}</td>
                  <td>¥{{ tx.balance.toFixed(2) }}</td>
                  <td>{{ tx.relatedNo || '-' }}</td>
                  <td>{{ tx.relatedRechargeNo || '-' }}</td>
                  <td class="time-text">{{ tx.time }}</td>
                  <td><span class="action-link primary" @click="showTxDetail(tx)">详情</span></td>
                </tr>
                </template>
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

        <!-- ==================== 弹窗：充值方案编辑 ==================== -->
    <div v-if="planEditModal" class="modal-overlay" @click.self="planEditModal = false">
      <div class="modal-content modal-lg">
        <div class="modal-header">
          <h3>{{ planEditMode === 'create' ? '新增充值方案' : '编辑充值方案' }}</h3>
          <span class="modal-close" @click="planEditModal = false">
            <svg class="modal-close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>
          </span>
        </div>
        <div class="modal-body">
          <!-- ===== 基础信息 ===== -->
          <div class="plan-section">
            <div class="plan-section-title">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4F6EF7" stroke-width="2" stroke-linecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
              <span>基础信息</span>
            </div>
            <div class="plan-section-body">
              <div class="form-item">
                <label class="form-label required">方案名称</label>
                <input type="text" class="form-input form-input-lg" v-model="planEditData.name" placeholder="如：默认充值方案" />
              </div>
            </div>
          </div>

          <!-- ===== 预选金额 ===== -->
          <div class="plan-section">
            <div class="plan-section-title">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4F6EF7" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              <span>预选金额</span>
              <span class="plan-count-badge">{{ planEditData.presets.length }}</span>
            </div>
            <div class="plan-section-body">
              <div v-for="(preset, index) in planEditData.presets" :key="preset.id" class="plan-preset-row">
                <div class="plan-preset-card">
                  <span class="plan-preset-index">{{ index + 1 }}</span>
                  <span class="plan-preset-yen">¥</span>
                  <input type="number" class="form-input form-input-sm" v-model.number="preset.amount" placeholder="金额" min="1" />
                  <div class="plan-preset-actions">
                    <button class="plan-icon-btn" @click="movePresetUp(index)" :disabled="index === 0" title="上移">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="18 15 12 9 6 15"/></svg>
                    </button>
                    <button class="plan-icon-btn" @click="movePresetDown(index)" :disabled="index === planEditData.presets.length - 1" title="下移">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg>
                    </button>
                    <button class="plan-icon-btn plan-icon-btn-danger" @click="removePreset(index)" :disabled="planEditData.presets.length <= 1" title="删除">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </div>
                </div>
              </div>
              <button class="plan-add-btn" @click="addPreset">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                添加预选金额
              </button>

              <div class="plan-divider"></div>

              <div class="plan-custom-row">
                <label class="plan-toggle-label">
                  <label class="toggle-switch" style="margin-right: 8px">
                    <input type="checkbox" v-model="planEditData.allowCustom" />
                    <span class="toggle-slider"></span>
                  </label>
                  <span>允许用户自定义金额</span>
                </label>
                <template v-if="planEditData.allowCustom">
                  <div class="plan-custom-fields">
                    <div class="plan-custom-field">
                      <span>最低</span>
                      <input type="number" class="form-input form-input-xs" v-model.number="planEditData.customMin" min="1" />
                      <span>元</span>
                    </div>
                    <div class="plan-custom-field">
                      <span>最高</span>
                      <input type="number" class="form-input form-input-xs" v-model.number="planEditData.customMax" min="1" />
                      <span>元</span>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </div>

          <!-- ===== 充值活动 ===== -->
          <div class="plan-section">
            <div class="plan-section-title">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4F6EF7" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <span>充值活动</span>
              <span class="plan-count-badge">{{ planEditData.activities.length }}</span>
            </div>
            <div class="plan-section-body">
              <div v-if="planEditData.activities.length === 0" class="plan-empty">暂无充值活动</div>
              <table v-else class="plan-activity-table">
                <thead>
                  <tr>
                    <th>活动名称</th>
                    <th>类型</th>
                    <th>触发条件</th>
                    <th>优惠内容</th>
                    <th>有效期</th>
                    <th style="width: 60px">启用</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(act, index) in planEditData.activities" :key="act.id">
                    <td>{{ act.name }}</td>
                    <td><span class="plan-type-tag" :class="act.type === 'bonus' ? 'bonus' : 'discount'">{{ act.type === 'bonus' ? '赠送' : '折扣' }}</span></td>
                    <td class="plan-mono">≥ ¥{{ act.conditionAmount.toLocaleString() }}</td>
                    <td class="plan-mono plan-discount-amount">{{ act.type === 'bonus' ? '送 ¥' + act.bonusAmount?.toLocaleString() : (act.discountPercent || 0) / 10 + '折' }}</td>
                    <td class="plan-mono">{{ act.startTime || act.endTime ? (act.startTime || '—') + ' ~ ' + (act.endTime || '—') : '永久' }}</td>
                    <td style="text-align: center">
                      <label class="toggle-switch" style="margin: 0">
                        <input type="checkbox" v-model="act.enabled" />
                        <span class="toggle-slider"></span>
                      </label>
                    </td>
                    <td>
                      <span class="action-link primary" @click="openActivityEdit(index)">编辑</span>
                      <span class="action-link danger" @click="removeActivity(index)" style="margin-left: 8px">删除</span>
                    </td>
                  </tr>
                </tbody>
              </table>
              <button class="btn btn-primary btn-xs" @click="openActivityCreate" style="margin-top: 8px">+ 添加活动</button>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-default" @click="planEditModal = false">取消</button>
          <button class="btn btn-primary" @click="savePlanEdit">保存方案</button>
        </div>
      </div>
    </div><!-- ==================== 弹窗：充值活动编辑 ==================== -->
    <div v-if="activityEditModal" class="modal-overlay" @click.self="activityEditModal = false">
      <div class="modal-content activity-modal-content">
        <div class="modal-header">
          <h3>{{ activityEditIndex === -1 ? '添加充值活动' : '编辑充值活动' }}</h3>
          <span class="modal-close" @click="activityEditModal = false">
            <svg class="modal-close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>
          </span>
        </div>
        <div class="modal-body activity-form-grid">
          <!-- ====== 分组1：基本信息 ====== -->
          <div class="af-group-title">基本信息</div>

          <!-- 活动名称 -->
          <div class="form-item">
            <label class="form-label required">活动名称</label>
            <div class="af-field">
              <input type="text" class="form-input form-input-xl" v-model="activityEditData.name" placeholder="如：充100送10" />
            </div>
          </div>

          <!-- 活动类型 — Segmented Button -->
          <div class="form-item">
            <label class="form-label required">活动类型</label>
            <div class="af-field">
              <div class="segmented-control">
                <button type="button" class="segmented-btn" :class="{ active: activityEditData.type === 'bonus' }" @click="activityEditData.type = 'bonus'">赠送</button>
                <button type="button" class="segmented-btn" :class="{ active: activityEditData.type === 'discount' }" @click="activityEditData.type = 'discount'">折扣</button>
              </div>
            </div>
          </div>

          <!-- 触发条件 -->
          <div class="form-item">
            <label class="form-label required">触发条件</label>
            <div class="af-field">
              <div class="af-control-row">
                <span>充值满</span>
                <input type="number" class="form-input form-input-xs" v-model.number="activityEditData.conditionAmount" min="1" />
                <span>元</span>
              </div>
            </div>
          </div>

          <!-- ====== 分组2：优惠规则 ====== -->
          <div class="af-group-divider"></div>
          <div class="af-group-title">优惠规则</div>

          <!-- 赠送金额 -->
          <div v-if="activityEditData.type === 'bonus'" class="form-item">
            <label class="form-label required">赠送金额</label>
            <div class="af-field">
              <div class="af-control-row">
                <span>赠送</span>
                <input type="number" class="form-input form-input-sm" v-model.number="activityEditData.bonusAmount" min="1" />
                <span>元</span>
              </div>
              <div class="af-field-hint">自动计算：充值满 ¥{{ activityEditData.conditionAmount }} 得 ¥{{ ((activityEditData.conditionAmount || 0) + (activityEditData.bonusAmount || 0)).toFixed(2) }}</div>
            </div>
          </div>

          <!-- 折扣比例 -->
          <div v-if="activityEditData.type === 'discount'" class="form-item">
            <label class="form-label required">折扣比例</label>
            <div class="af-field">
              <div class="af-control-row">
                <input type="number" class="form-input form-input-sm" v-model.number="activityEditData.discountPercent" min="1" max="99" />
                <span>%</span>
                <span>即 {{ activityEditData.discountPercent ? (activityEditData.discountPercent / 10).toFixed(1) : '0.0' }} 折</span>
              </div>
              <div class="af-field-hint">充值 ¥{{ activityEditData.conditionAmount }}以上，打{{ activityEditData.discountPercent ? (activityEditData.discountPercent / 10).toFixed(1) : '0.0' }}折，如支付¥{{ ((activityEditData.conditionAmount || 0) * (activityEditData.discountPercent || 0) / 100).toFixed(2) }}得¥{{ activityEditData.conditionAmount }}</div>
            </div>
          </div>

          <!-- 活动时间 -->
          <div class="form-item">
            <label class="form-label">活动时间</label>
            <div class="af-field">
              <div class="af-time-row">
                <input type="datetime-local" class="form-input form-input-md" v-model="activityEditData.startTime" placeholder="开始时间" />
                <span class="af-sep">至</span>
                <input type="datetime-local" class="form-input form-input-md" v-model="activityEditData.endTime" placeholder="结束时间" />
              </div>
              <div class="af-field-hint">留空表示永久有效</div>
            </div>
          </div>




        </div>
        <div class="modal-footer">
          <button class="btn btn-default" @click="activityEditModal = false">取消</button>
          <button class="btn btn-primary" @click="saveActivity">保存活动</button>
        </div>
      </div>
    </div>

    <!-- ==================== 弹窗：充值方案详情 ==================== -->
    <div v-if="planDetailModal" class="modal-overlay" @click.self="planDetailModal = false">
      <div class="modal-content modal-md">
        <div class="modal-header">
          <h3>方案详情</h3>
          <span class="modal-close" @click="planDetailModal = false">
            <svg class="modal-close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>
          </span>
        </div>
        <div class="modal-body" v-if="planDetailData">
          <div class="detail-grid">
            <div><label>方案名称</label><span>{{ planDetailData.name }}</span></div>
            <div><label>状态</label><span class="status-tag" :class="planDetailData.enabled ? 'refunded' : 'closed'">{{ planDetailData.enabled ? '生效中' : '已禁用' }}</span></div>
            <div><label>生效时间</label><span>{{ planDetailData.activeTime || '-' }}</span></div>
            <div><label>自定义金额</label><span>{{ planDetailData.allowCustom ? `允许（¥${planDetailData.customMin} ~ ¥${planDetailData.customMax}）` : '不允许' }}</span></div>
          </div>

          <div class="detail-section">
            <div class="form-section-title">预选金额</div>
            <div class="preset-list">
              <span v-for="p in planDetailData.presets" :key="p.id" class="preset-tag">¥{{ p.amount }}</span>
              <span v-if="planDetailData.allowCustom" class="preset-tag preset-tag-dashed">自定义</span>
            </div>
          </div>

          <div class="detail-section">
            <div class="form-section-title">充值活动</div>
            <div v-if="planDetailData.activities.length === 0" class="empty-block">无充值活动</div>
            <table v-else class="data-table" style="margin-top: 8px">
              <thead>
                <tr>
                  <th>活动名称</th>
                  <th>类型</th>
                  <th>触发条件</th>
                  <th>优惠</th>
                  <th>有效期</th>
                  <th>状态</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="act in planDetailData.activities" :key="act.id">
                  <td>{{ act.name }}</td>
                  <td>{{ act.type === 'bonus' ? '赠送' : '折扣' }}</td>
                  <td>充值满 ¥{{ act.conditionAmount }}</td>
                  <td>
                    <span v-if="act.type === 'bonus'">赠送 ¥{{ act.bonusAmount }}</span>
                    <span v-else>{{ (act.discountPercent / 10).toFixed(1) }} 折</span>
                  </td>
                  <td>
                    <span v-if="!act.startTime && !act.endTime">永久</span>
                    <span v-else class="sub-text">{{ act.startTime || '不限' }} ~ {{ act.endTime || '不限' }}</span>
                  </td>
                  <td>
                    <span class="status-tag" :class="act.enabled ? 'refunded' : 'closed'">{{ act.enabled ? '启用' : '禁用' }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-default" @click="planDetailModal = false">关闭</button>
        </div>
      </div>
    </div>

    <!-- ==================== 弹窗：用户流水 ==================== -->
    <div v-if="userFlowModal" class="modal-overlay" @click.self="userFlowModal = false">
      <div class="modal-content" style="width: auto; min-width: 720px; max-width: 90vw;">
        <div class="modal-header">
          <h3>{{ userFlowWallet?.walletId }} 流水明细 <span :class="'status-badge ' + (userFlowWallet?.status === 'normal' ? 'on' : 'off')" style="font-size: 12px; margin-left: 8px; vertical-align: middle">{{ userFlowWallet?.status === 'normal' ? '正常' : '已冻结' }}</span></h3>
          <span class="modal-close" @click="userFlowModal = false">
            <svg class="modal-close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>
          </span>
        </div>
        <div class="modal-body">
          <div style="display: flex; gap: 16px; margin-bottom: 16px;" v-if="userFlowWallet">
            <div style="flex: 1; background: #F7F8FA; border: 1px solid #E5E6EB; border-radius: 8px; padding: 14px 16px;">
              <div style="font-size: 12px; color: #86909C; margin-bottom: 6px; letter-spacing: 0.03em;">用户</div>
              <div style="font-size: 14px; color: #1D2129; font-weight: 500;">{{ userFlowWallet.uid }} / {{ userFlowWallet.phone }}</div>
            </div>
            <div style="flex: 1; background: #F0F5FF; border: 1px solid #D6E4FF; border-radius: 8px; padding: 14px 16px;">
              <div style="font-size: 12px; color: #86909C; margin-bottom: 6px; letter-spacing: 0.03em;">当前余额</div>
              <div style="font-size: 20px; color: #4F6EF7; font-weight: 700; font-family: 'Geist Mono', 'SF Mono', 'Menlo', monospace;">¥{{ userFlowWallet.balance.toFixed(2) }}</div>
              <div style="display: flex; justify-content: space-between; margin-top: 8px; padding-top: 8px; border-top: 1px solid #D6E4FF;">
                <span style="font-size: 12px; color: #4F6EF7;">本金(可提现)</span>
                <span style="font-size: 13px; color: #4F6EF7; font-weight: 600; font-family: 'Geist Mono', 'SF Mono', 'Menlo', monospace;">¥{{ userFlowWallet.principalBalance.toFixed(2) }}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-top: 4px;">
                <span style="font-size: 12px; color: #D46B08;">赠送</span>
                <span style="font-size: 13px; color: #D46B08; font-weight: 600; font-family: 'Geist Mono', 'SF Mono', 'Menlo', monospace;">¥{{ userFlowWallet.bonusBalance.toFixed(2) }}</span>
              </div>
            </div>
            <div style="flex: 1; background: #F7F8FA; border: 1px solid #E5E6EB; border-radius: 8px; padding: 14px 16px;">
              <div style="font-size: 12px; color: #86909C; margin-bottom: 6px; letter-spacing: 0.03em;">冻结金额</div>
              <div style="font-size: 14px; color: #1D2129; font-weight: 500;">{{ userFlowWallet.frozenAmount > 0 ? '¥' + userFlowWallet.frozenAmount.toFixed(2) : '-' }}</div>
            </div>
            <div style="flex: 1; background: #F7F8FA; border: 1px solid #E5E6EB; border-radius: 8px; padding: 14px 16px;">
              <div style="font-size: 12px; color: #86909C; margin-bottom: 6px; letter-spacing: 0.03em;">状态</div>
              <div><span :class="'status-badge ' + (userFlowWallet.status === 'normal' ? 'on' : 'off')" style="font-size: 12px; padding: 2px 10px; border-radius: 12px;">{{ userFlowWallet.status === 'normal' ? '正常' : '已冻结' }}</span></div>
            </div>
          </div>
          <div class="segmented-control" style="margin-top: 16px">
            <button class="segmented-btn" :class="{ active: userFlowTab === 'recharge' }" @click="userFlowTab = 'recharge'">充值流水</button>
            <button class="segmented-btn" :class="{ active: userFlowTab === 'withdraw' }" @click="userFlowTab = 'withdraw'">提现流水</button>
            <button class="segmented-btn" :class="{ active: userFlowTab === 'transaction' }" @click="userFlowTab = 'transaction'">交易流水</button>
          </div>

          <table class="data-table table-nowrap" style="margin-top: 16px" v-if="userFlowTab === 'recharge'">
            <thead>
              <tr>
                <th>充值单号</th>
                <th>支付单号</th>
                <th>支付金额</th>
                <th>到账金额</th>
                <th>支付状态</th>
                <th>充值状态</th>
                <th>申请时间</th>
                <th>入账时间</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in mockRechargeRecords.filter(r => r.uid === userFlowWallet?.uid)" :key="r.id">
                <td>{{ r.rechargeNo }}</td>
                <td>{{ r.payOrderNo || '-' }}</td>
                <td class="amount-positive">+¥{{ r.amount.toFixed(2) }}</td>
                <td class="amount-positive">+¥{{ r.receivedAmount.toFixed(2) }}</td>
                <td><span class="status-tag" :class="r.paymentStatus">{{ r.paymentStatus === 'paid' ? '已支付' : r.paymentStatus === 'pending' ? '待支付' : r.paymentStatus === 'failed' ? '支付失败' : '已关闭' }}</span></td>
                <td><span class="status-tag" :class="r.rechargeStatus">{{ r.rechargeStatus === 'success' ? '已入账' : r.rechargeStatus === 'pending' ? '待入账' : '入账失败' }}</span></td>
                <td class="time-text">{{ r.applyTime }}</td>
                <td class="time-text">{{ r.rechargeTime || '-' }}</td>
              </tr>
              <tr v-if="mockRechargeRecords.filter(r => r.uid === userFlowWallet?.uid).length === 0">
                <td colspan="8" class="empty-text">暂无充值记录</td>
              </tr>
            </tbody>
          </table>
          <table class="data-table" style="margin-top: 16px" v-if="userFlowTab === 'withdraw'">
            <thead>
              <tr>
                <th>流水号</th>
                <th>提现金额</th>
                <th>余额</th>
                <th>时间</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="tx in userFlowTxs.filter(t => t.type === 'withdraw')" :key="tx.id">
                <td>{{ tx.transactionNo }}</td>
                <td class="amount-negative">-¥{{ Math.abs(tx.amount).toFixed(2) }}</td>
                <td>¥{{ tx.balance.toFixed(2) }}</td>
                <td class="time-text">{{ tx.time }}</td>
              </tr>
              <tr v-if="userFlowTxs.filter(t => t.type === 'withdraw').length === 0">
                <td colspan="4" class="empty-text">暂无提现记录</td>
              </tr>
            </tbody>
          </table>


          <table class="data-table" style="margin-top: 16px" v-if="userFlowTab === 'transaction'">
            <thead>
              <tr>
                <th style="width: 30px"></th>
                <th>流水号</th>
                <th>类型</th>
                <th>金额</th>
                <th>余额</th>
                <th>时间</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="tx in userFlowTxs.filter(t => t.type !== 'recharge')" :key="tx.id">
                <tr>
                  <td>
                    <span v-if="tx.bucketLogs && tx.bucketLogs.length" class="expand-btn" @click="toggleUserFlowBucket(tx.id)">{{ userFlowExpandedTxId === tx.id ? '▼' : '▶' }}</span>
                  </td>
                  <td>{{ tx.transactionNo }}</td>
                  <td>{{ txTypeLabel[tx.type] }}</td>
                  <td :class="{ 'amount-positive': tx.amount > 0, 'amount-negative': tx.amount < 0 }">{{ tx.amount > 0 ? '+' : '' }}¥{{ Math.abs(tx.amount).toFixed(2) }}</td>
                  <td>¥{{ tx.balance.toFixed(2) }}</td>
                  <td class="time-text">{{ tx.time }}</td>
                </tr>
                <tr v-if="userFlowExpandedTxId === tx.id && tx.bucketLogs" class="bucket-row">
                  <td></td>
                  <td colspan="5" style="padding: 0">
                    <div class="bucket-panel">
                      <div class="bucket-header">{{ tx.type === 'refund' ? '退款回充记录' : '资金来源（先进先出）' }}</div>
                      <table class="bucket-table">
                        <thead>
                          <tr>
                            <th>充值批次</th>
                            <th>充值时间</th>
                            <th>{{ tx.type === 'refund' ? '回充金额' : '扣减金额' }}</th>
                            <th>批次剩余</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="(bl, idx) in tx.bucketLogs" :key="idx">
                            <td>{{ bl.bucketNo }}</td>
                            <td class="time-text">{{ bl.bucketTime }}</td>
                            <td :class="tx.type === 'refund' ? 'amount-positive' : 'amount-negative'">{{ tx.type === 'refund' ? '+' : '-' }}¥{{ bl.deductAmount.toFixed(2) }}</td>
                            <td>¥{{ bl.remainAmount.toFixed(2) }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </td>
                </tr>
              </template>
              <tr v-if="userFlowTxs.filter(t => t.type !== 'recharge').length === 0">
                <td colspan="4" class="empty-text">暂无交易记录</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ==================== 弹窗：冻结/解冻 ==================== -->
    <div v-if="freezeModal" class="modal-overlay" @click.self="freezeModal = false">
      <div class="modal-content modal-md">
        <div class="modal-header">
          <h3>{{ freezeMode === 'freeze' ? '冻结' : '解冻' }}钱包</h3>
          <span class="modal-close" @click="freezeModal = false">
            <svg class="modal-close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>
          </span>
        </div>
        <div class="modal-body">
          <!-- 用户信息 -->
          <div class="detail-grid" style="margin-bottom: 16px; padding: 12px; background: #F7F8FA; border-radius: 8px;">
            <div><label>钱包ID</label><span>{{ freezeWalletTarget?.walletId }}</span></div>
            <div><label>用户</label><span>{{ freezeWalletTarget?.phone }}（{{ freezeWalletTarget?.uid }}）</span></div>
            <div><label>当前余额</label><span>¥{{ freezeWalletTarget?.balance.toFixed(2) }}</span></div>
            <div><label>冻结金额</label><span>¥{{ freezeWalletTarget?.frozenAmount.toFixed(2) }}</span></div>
            <div><label>可{{ freezeMode === 'freeze' ? '冻结' : '解冻' }}金额</label><span style="color: #4F6EF7; font-weight: 600;">¥{{ (freezeMode === 'freeze' ? (freezeWalletTarget ? freezeWalletTarget.balance - freezeWalletTarget.frozenAmount : 0) : (freezeWalletTarget?.frozenAmount || 0)).toFixed(2) }}</span></div>
          </div>
          
          <!-- 模式切换 -->
          <div style="text-align: center; margin-bottom: 16px;">
            <div class="segmented-control">
              <button class="segmented-btn" :class="{ active: freezeMode === 'freeze' }" @click="freezeMode = 'freeze'">冻结</button>
              <button class="segmented-btn" :class="{ active: freezeMode === 'unfreeze' }" @click="freezeMode = 'unfreeze'">解冻</button>
            </div>
          </div>
          
          <!-- 金额 -->
          <div class="form-item">
            <label class="form-label required">金额</label>
            <div class="form-control-row">
              <input type="number" class="form-input" v-model.number="freezeForm.amount" min="0.01" :max="freezeMode === 'freeze' ? (freezeWalletTarget ? freezeWalletTarget.balance - freezeWalletTarget.frozenAmount : 0) : (freezeWalletTarget?.frozenAmount || 0)" step="0.01" placeholder="请输入金额" style="width: 200px" />
              <span class="form-tip">（可{{ freezeMode === 'freeze' ? '冻结' : '解冻' }}：¥{{ (freezeMode === 'freeze' ? (freezeWalletTarget ? freezeWalletTarget.balance - freezeWalletTarget.frozenAmount : 0) : (freezeWalletTarget?.frozenAmount || 0)).toFixed(2) }}）</span>
            </div>
          </div>
          
          <!-- 原因 -->
          <div class="form-item">
            <label class="form-label required">原因备注</label>
            <div style="flex: 1">
              <select class="form-select" v-model="freezeForm.reason" style="width: 100%; margin-bottom: 8px">
                <option value="" disabled>请选择原因</option>
                <option v-for="opt in (freezeMode === 'freeze' ? freezeReasonOptions : unfreezeReasonOptions)" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
              </select>
              <textarea v-if="freezeForm.reason === 'other'" class="form-textarea" v-model="freezeForm.reasonDetail" rows="2" placeholder="请补充详细描述" style="width: 100%"></textarea>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-default" @click="freezeModal = false">取消</button>
          <button class="btn btn-primary" @click="confirmFreezeAction" :disabled="!freezeForm.amount || !freezeForm.reason">{{ freezeMode === 'freeze' ? '确认冻结' : '确认解冻' }}</button>
        </div>
      </div>
    </div>

    <!-- ==================== 弹窗：充值详情 ==================== -->
    <div v-if="rechargeDetailModal" class="modal-overlay" @click.self="rechargeDetailModal = false">
      <div class="modal-content modal-md">
        <div class="modal-header">
          <h3>充值详情</h3>
          <span class="modal-close" @click="rechargeDetailModal = false">
            <svg class="modal-close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>
          </span>
        </div>
        <div class="modal-body" v-if="rechargeDetailItem">
          <div class="detail-grid">
            <div><label>充值单号</label><span>{{ rechargeDetailItem.rechargeNo }}</span></div>
            <div><label>支付单号</label><span>{{ rechargeDetailItem.payOrderNo || '-' }}</span></div>
            <div><label>用户</label><span>{{ rechargeDetailItem.uid }} / {{ rechargeDetailItem.phone }}</span></div>
            <div><label>支付金额</label><span class="price-text">¥{{ rechargeDetailItem.amount.toFixed(2) }}</span></div>
            <div><label>到账金额</label><span class="price-text">¥{{ rechargeDetailItem.receivedAmount.toFixed(2) }}</span></div>
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

    <!-- ==================== 弹窗：充值流水 ==================== -->
    <div v-if="rechargeFlowModal" class="modal-overlay" @click.self="rechargeFlowModal = false">
      <div class="modal-content recharge-flow-modal">
        <div class="modal-header">
          <h3>充值流水详情</h3>
          <span class="modal-close" @click="rechargeFlowModal = false">
            <svg class="modal-close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>
          </span>
        </div>
        <div class="modal-body">
          <!-- 摘要卡片 -->
          <div class="flow-summary" v-if="rechargeFlowItem">
            <div class="flow-summary-row"><span class="flow-summary-label">用户</span><span class="flow-summary-value">{{ rechargeFlowItem.phone }}</span></div>
            <div class="flow-summary-row"><span class="flow-summary-label">充值单号</span><span class="flow-summary-value">{{ rechargeFlowItem.rechargeNo }}</span></div>
            <div class="flow-summary-row"><span class="flow-summary-label">支付单号</span><span class="flow-summary-value">{{ rechargeFlowItem.payOrderNo || '-' }}</span></div>
            <div class="flow-summary-row"><span class="flow-summary-label">充值时间</span><span class="flow-summary-value">{{ rechargeFlowItem.rechargeTime || rechargeFlowItem.applyTime }}</span></div>
            <div class="flow-summary-divider"></div>
            <div class="flow-summary-amounts">
              <div class="flow-summary-amount-item"><span class="flow-summary-amount-label">支付金额</span><span class="flow-summary-amount-value">¥{{ rechargeFlowItem.amount.toFixed(2) }}</span></div>
              <div class="flow-summary-amount-item" v-if="(rechargeFlowItem.bonusAmount || 0) > 0"><span class="flow-summary-amount-label">赠送金额</span><span class="flow-summary-amount-value bonus">+¥{{ (rechargeFlowItem.bonusAmount || 0).toFixed(2) }}</span></div>
              <div class="flow-summary-amount-item"><span class="flow-summary-amount-label">到账金额</span><span class="flow-summary-amount-value">¥{{ (rechargeFlowItem.amount + (rechargeFlowItem.bonusAmount || 0)).toFixed(2) }}</span></div>
              <div class="flow-summary-amount-item total"><span class="flow-summary-amount-label">流水剩余总额</span><span class="flow-summary-amount-value total">¥{{ rechargeFlowBuckets.reduce((s, b) => s + b.remainingAmount, 0).toFixed(2) }}</span></div>
            </div>
          </div>
          <!-- 资金桶 -->
          <div class="flow-buckets-row">
            <div class="flow-bucket" v-for="bucket in rechargeFlowBuckets" :key="bucket.type">
              <div class="flow-bucket-header">
                <span class="flow-bucket-type" :class="bucket.type">{{ bucket.type === 'principal' ? '本金' : '赠送' }}</span>
                <span class="flow-bucket-status" :class="{ empty: bucket.remainingAmount <= 0 }">{{ bucket.remainingAmount <= 0 ? '已耗尽' : '可用' }}</span>
                <span class="flow-bucket-withdrawable" :class="{ yes: bucket.withdrawable }">{{ bucket.withdrawable ? '可提现' : '不可提现' }}</span>
              </div>
              <div class="flow-bucket-body">
                <div class="flow-bucket-bar-area">
                  <div class="flow-bucket-bar"><div class="flow-bucket-bar-fill" :class="bucket.type" :style="{ width: ((bucket.originalAmount - bucket.remainingAmount) / bucket.originalAmount * 100) + '%' }"></div></div>
                  <div class="flow-bucket-bar-labels"><span>已用 <strong>¥{{ (bucket.originalAmount - bucket.remainingAmount).toFixed(2) }}</strong></span><span>剩余 <strong>¥{{ bucket.remainingAmount.toFixed(2) }}</strong></span></div>
                </div>
                <div class="flow-detail-label">消耗明细</div>
                <div v-if="bucket.consumptions.length">
                  <table class="flow-consumption-table">
                    <thead><tr><th>类型</th><th>关联单号</th><th>金额</th><th>时间</th></tr></thead>
                    <tbody>
                      <tr v-for="(item, ci) in bucket.consumptions" :key="ci">
                        <td><span class="status-tag consume-type-tag" :class="item.type === 'consume' ? 'consume' : 'withdraw'">{{ item.type === 'consume' ? '消费' : item.type === 'withdraw' ? '提现' : item.type === 'refund' ? '退款' : item.type }}</span></td>
                        <td class="order-no-cell">{{ item.orderNo }}</td>
                        <td class="amount-negative" style="text-align:right; white-space:nowrap">-¥{{ item.amount.toFixed(2) }}</td>
                        <td class="time-text">{{ item.time }}</td>
                      </tr>
                    </tbody>
                  </table>
                  </div>
                  <div v-else class="flow-no-data">暂无消耗记录</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- ==================== 弹窗：提现详情 ==================== -->
    <div v-if="withdrawDetailModal" class="modal-overlay" @click.self="withdrawDetailModal = false">
      <div class="modal-content modal-md">
        <div class="modal-header">
          <h3>提现详情</h3>
          <span class="modal-close" @click="withdrawDetailModal = false">
            <svg class="modal-close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>
          </span>
        </div>
        <div class="modal-body" v-if="withdrawDetailItem">
          <div class="detail-grid">
            <div><label>提现单号</label><span>{{ withdrawDetailItem.withdrawNo }}</span></div>
            <div><label>用户</label><span>{{ withdrawDetailItem.uid }} / {{ withdrawDetailItem.phone }}</span></div>
            <div><label>提现金额</label><span class="price-text">¥{{ withdrawDetailItem.amount.toFixed(2) }}</span></div>
            <div><label>手续费</label><span>{{ withdrawDetailItem.fee > 0 ? '¥' + withdrawDetailItem.fee.toFixed(2) : '免' }}</span></div>
            <div><label>实际到账</label><span>¥{{ withdrawDetailItem.actualAmount.toFixed(2) }}</span></div>
            <div><label>提现类型</label><span>{{ withdrawDetailItem.refundType === 'full' ? '全额提现' : '部分提现' }}</span></div>
            <div><label>关联订单</label><span>{{ withdrawDetailItem.relatedOrderNo }}</span></div>
            <div><label>到账方式</label><span>{{ payMethodLabel[withdrawDetailItem.originalPayMethod] }}</span></div>
            <div><label>状态</label><span class="status-tag" :class="withdrawDetailItem.status">{{ withdrawStatusLabel[withdrawDetailItem.status] }}</span></div>
            <div><label>申请时间</label><span>{{ withdrawDetailItem.applyTime }}</span></div>
            <div><label>完成时间</label><span>{{ withdrawDetailItem.completeTime || '-' }}</span></div>
            <div><label>操作人</label><span>{{ withdrawDetailItem.operator || '-' }}</span></div>
            <div v-if="withdrawDetailItem.rejectReason"><label>拒绝原因</label><span>{{ withdrawDetailItem.rejectReason }}</span></div>
            <div v-if="withdrawDetailItem.partialRefundReason"><label>部分提现原因</label><span>{{ withdrawDetailItem.partialRefundReason }}</span></div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-default" @click="withdrawDetailModal = false">关闭</button>
        </div>
      </div>
    </div>

    <!-- ==================== 弹窗：交易流水详情 ==================== -->
    <div v-if="txDetailModal" class="modal-overlay" @click.self="txDetailModal = false">
      <div class="modal-content modal-md">
        <div class="modal-header">
          <h3>交易详情</h3>
          <span class="modal-close" @click="txDetailModal = false">
            <svg class="modal-close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>
          </span>
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
          <!-- 子流水详情 -->
          <div v-if="txDetailItem.bucketLogs && txDetailItem.bucketLogs.length" style="margin-top: 20px">
            <div class="form-section-title" style="margin-bottom: 12px">{{ txDetailItem.type === 'refund' ? '退款回充记录' : '资金来源（先进先出）' }}</div>
            <table class="bucket-table">
              <thead>
                <tr>
                  <th>充值批次</th>
                  <th>充值时间</th>
                  <th>{{ txDetailItem.type === 'refund' ? '回充金额' : '扣减金额' }}</th>
                  <th>批次剩余</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(bl, idx) in txDetailItem.bucketLogs" :key="idx">
                  <td>{{ bl.bucketNo }}</td>
                  <td class="time-text">{{ bl.bucketTime }}</td>
                  <td :class="txDetailItem.type === 'refund' ? 'amount-positive' : 'amount-negative'">{{ txDetailItem.type === 'refund' ? '+' : '-' }}¥{{ bl.deductAmount.toFixed(2) }}</td>
                  <td>¥{{ bl.remainAmount.toFixed(2) }}</td>
                </tr>
              </tbody>
            </table>
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
/* ==================== Design Tokens ==================== */
/* Bright Modern — Ant Design / Element Pro style */

/* ==================== 页面整体布局 ==================== */
.wallet-management {
  display: flex;
  min-height: 100vh;
  background-color: #F0F2F5;
  color: #1D2129;
  font-family: 'SF Pro Display', 'Geist Sans', 'Helvetica Neue', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  line-height: 1.6;
}

/* ==================== 左侧导航 ==================== */
.sidebar {
  width: 210px;
  background-color: #FFFFFF;
  border-right: 1px solid #E5E6EB;
  padding: 0;
  flex-shrink: 0;
}
.sidebar-title {
  height: 56px;
  line-height: 56px;
  padding: 0 20px;
  font-size: 15px;
  font-weight: 700;
  color: #1D2129;
  letter-spacing: -0.01em;
  border-bottom: 1px solid #E5E6EB;
}
.menu-list {
  padding: 8px 0;
}
.menu-group-title {
  padding: 10px 20px;
  font-size: 11px;
  color: #86909C;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  user-select: none;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
.menu-group-title:hover {
  color: #4E5969;
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
  color: #86909C;
  cursor: pointer;
  transition: all 0.15s ease;
}
.menu-item:hover {
  color: #1D2129;
  background-color: #FAFAFA;
}
.menu-item.active {
  color: #4F6EF7;
  background-color: #E8F3FF;
  font-weight: 600;
  position: relative;
}
.menu-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background-color: #4F6EF7;
  border-radius: 0 3px 3px 0;
}

/* ==================== 右侧内容区 ==================== */
.main-content {
  flex: 1;
  padding: 28px;
  overflow-y: auto;
}
.content-panel {
  background-color: #FFFFFF;
  border-radius: 10px;
  border: 1px solid #E5E6EB;
}
.panel-header {
  padding: 18px 28px;
  border-bottom: 1px solid #E5E6EB;
  display: flex;
  align-items: baseline;
  gap: 12px;
}
.panel-header h2 {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: #1D2129;
  letter-spacing: -0.01em;
}
.panel-subtitle {
  font-size: 13px;
  color: #86909C;
}
.panel-body {
  padding: 24px 28px;
}

/* ==================== 配置表单 ==================== */
.config-form {
  max-width: 720px;
}
.form-section-title {
  font-size: 13px;
  font-weight: 700;
  color: #1D2129;
  padding: 16px 0 8px;
  margin-top: 4px;
  border-bottom: 1px solid #E5E6EB;
  margin-bottom: 20px;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}
.form-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16px;
}
.activity-modal-content {
  width: 680px;
  max-height: none;
}
.activity-form-grid {
  display: flex;
  flex-direction: column;
  padding: 18px 28px;
}
.activity-form-grid .form-item { align-items: flex-start; margin-bottom: 14px; }
.af-row {
  display: flex;
  gap: 20px;
}
.af-col {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.af-hint {
  color: #86909C;
  font-size: 12px;
  margin-left: 4px;
  white-space: nowrap;
  flex-shrink: 0;
}
.af-time-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 6px;
  flex-wrap: wrap;
}
.af-time-row input {
  width: 200px;
  flex-shrink: 0;
}
.af-sep {
  color: #86909C;
  white-space: nowrap;
  flex-shrink: 0;
}
.form-label {
  width: 120px;
  text-align: right;
  padding-right: 12px;
  line-height: 32px;
  font-size: 14px;
  color: #4E5969;
  flex-shrink: 0;
}
.form-label.required::before {
  content: '*';
  color: #CF1322;
  margin-right: 4px;
}
.form-control-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  line-height: 32px;
  font-size: 14px;
  color: #86909C;
}
.form-input {
  height: 32px;
  border: 1px solid #E5E6EB;
  border-radius: 6px;
  padding: 0 12px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.15s ease;
  width: 200px;
  font-family: inherit;
}
.form-input:focus {
  border-color: #4F6EF7;
}
.form-input:disabled {
  background-color: #F2F3F5;
  color: #86909C;
  cursor: not-allowed;
}
.form-select {
  height: 32px;
  border: 1px solid #E5E6EB;
  border-radius: 6px;
  padding: 0 12px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.15s ease;
  width: 140px;
  font-family: inherit;
}
.form-select:focus {
  border-color: #4F6EF7;
}
.form-select:disabled {
  background-color: #F2F3F5;
  color: #86909C;
  cursor: not-allowed;
}
.form-textarea {
  width: 100%;
  border: 1px solid #E5E6EB;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 14px;
  outline: none;
  resize: vertical;
  transition: border-color 0.15s ease;
  font-family: inherit;
}
.form-textarea:focus {
  border-color: #4F6EF7;
}
.form-tip {
  font-size: 12px;
  color: #86909C;
}
.form-divider {
  height: 1px;
  background-color: #E5E6EB;
  margin: 24px 0;
}
.form-actions {
  margin-top: 28px;
  padding-top: 20px;
  border-top: 1px solid #E5E6EB;
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
  accent-color: #4F6EF7;
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
  background-color: #E5E6EB;
  transition: 0.25s ease;
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
  transition: 0.25s ease;
  border-radius: 50%;
}
.toggle-switch input:checked + .toggle-slider {
  background-color: #4F6EF7;
}
.toggle-switch input:checked + .toggle-slider::before {
  transform: translateX(22px);
}
.toggle-switch input:disabled + .toggle-slider {
  opacity: 0.4;
  cursor: not-allowed;
}

/* ==================== 按钮 ==================== */
.btn {
  height: 32px;
  border-radius: 6px;
  border: none;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.15s ease;
  padding: 0 16px;
  font-weight: 500;
  font-family: inherit;
}
.btn:active {
  transform: scale(0.98);
}
.btn-primary {
  background-color: #4F6EF7;
  color: #FFFFFF;
}
.btn-primary:hover {
  background-color: #6B8BF5;
}
.btn-primary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
}
.btn-default {
  background-color: #FFFFFF;
  color: #4E5969;
  border: 1px solid #E5E6EB;
}
.btn-default:hover {
  border-color: #4E5969;
  color: #1D2129;}

/* ==================== 筛选栏 ==================== */
.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #E5E6EB;
}
.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
}
.filter-item label {
  font-size: 14px;
  color: #86909C;
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
  border-bottom: 1px solid #E5E6EB;
  padding: 14px 10px;
  text-align: left;
}
.data-table th {
  background-color: #FAFAFA;
  color: #86909C;
  font-weight: 600;
  font-size: 12px;
  white-space: nowrap;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}
.data-table tbody tr {
  transition: background-color 0.15s ease;
}

.data-table.table-nowrap th,
.data-table.table-nowrap td {
  white-space: nowrap;
}

.data-table tbody tr:hover {
  background-color: #FAFAFA;
}
.time-text {
  color: #86909C;
  font-size: 13px;
  font-family: 'Geist Mono', 'SF Mono', 'Menlo', monospace;
}
.sub-text {
  font-size: 12px;
  color: #86909C;
}
.price-text {
  color: #CF1322;
  font-weight: 600;
  font-family: 'Geist Mono', 'SF Mono', 'Menlo', monospace;
}
.empty-text {
  text-align: center;
  padding: 64px 0;
  color: #86909C;
  font-size: 14px;
}

/* ==================== 展开按钮（子流水） ==================== */
.expand-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  cursor: pointer;
  color: #86909C;
  font-size: 10px;
  border-radius: 4px;
  transition: all 0.15s ease;
}
.expand-btn:hover {
  color: #4F6EF7;
  background-color: #E8F3FF;
}

/* ==================== 子流水面板 ==================== */
.bucket-row td {
  background-color: #FAFAFA;
}
.bucket-panel {
  padding: 12px 16px 16px 24px;
}
.bucket-header {
  font-size: 12px;
  font-weight: 600;
  color: #86909C;
  margin-bottom: 8px;
  letter-spacing: 0.03em;
}
.bucket-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.bucket-table th {
  background-color: #F2F3F5;
  color: #86909C;
  font-weight: 500;
  font-size: 12px;
  padding: 8px 10px;
  text-align: left;
  border-bottom: 1px solid #E5E6EB;
}
.bucket-table td {
  padding: 8px 10px;
  border-bottom: 1px solid #E5E6EB;
  color: #4E5969;
}

/* ==================== 状态标签 ==================== */
.status-tag {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.03em;
  border: none;
}
/* 正常/启用/完成/成功 → Pale Blue */
.status-tag.normal, .status-tag.on, .status-tag.completed, .status-tag.success {
  background-color: #E8F3FF;
  color: #4F6EF7;
}
/* 冻结/停用/失败 → Pale Red */
.status-tag.frozen, .status-tag.off, .status-tag.failed {
  background-color: #FFF1F0;
  color: #CF1322;
}
/* 待处理/草稿 → Pale Yellow */
.status-tag.pending, .status-tag.draft {
  background-color: #FFF7E6;
  color: #D46B08;
}
/* 已支付 → Pale Green */
.status-tag.paid {
  background-color: #E8F8EE;
  color: #0E7B3A;
}
/* 已关闭 → Neutral */
.status-tag.closed {
  background-color: #F2F3F5;
  color: #86909C;
}
/* 已审核 → Pale Blue */
.status-tag.approved {
  background-color: #E8F3FF;
  color: #4F6EF7;
}
/* 已退款 → Pale Green */
.status-tag.refunded {
  background-color: #E8F8EE;
  color: #0E7B3A;
}
/* 已拒绝 → Pale Red */
.status-tag.rejected {
  background-color: #FFF1F0;
  color: #CF1322;
}
/* 全额 → Pale Blue */
.status-tag.full {
  background-color: #E8F3FF;
  color: #4F6EF7;
}
/* 部分 → Pale Yellow */
.status-tag.partial {
  background-color: #FFF7E6;
  color: #D46B08;
}
/* 交易类型标签 */
.status-tag.recharge {
  background-color: #E8F3FF;
  color: #4F6EF7;
}
.status-tag.consume {
  background-color: #FFF7E6;
  color: #D46B08;
}
.status-tag.refund {
  background-color: #E8F8EE;
  color: #0E7B3A;
}
.status-tag.withdraw {
  background-color: #FFF1F0;
  color: #CF1322;
}

/* ==================== 金额颜色 ==================== */
.amount-positive {
  color: #CF1322;
  font-weight: 600;
  font-family: 'Geist Mono', 'SF Mono', 'Menlo', monospace;
}
.amount-negative {
  color: #0E7B3A;
  font-weight: 600;
  font-family: 'Geist Mono', 'SF Mono', 'Menlo', monospace;
}

/* ==================== 操作链接 ==================== */
.action-link {
  color: #4F6EF7;
  cursor: pointer;
  font-size: 13px;
  transition: color 0.15s ease;
}
.action-link:hover {
  color: #4F6EF7;
  text-decoration: underline;
}
.action-link.primary {
  color: #4F6EF7;
}
.action-link.danger {
  color: #CF1322;
}

/* ==================== 分页 ==================== */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  font-size: 14px;
  color: #86909C;
}
.page-btns {
  display: flex;
  gap: 6px;
}
.page-btn {
  height: 28px;
  padding: 0 12px;
  border: 1px solid #E5E6EB;
  background-color: #FFFFFF;
  border-radius: 6px;
  cursor: pointer;
  color: #4E5969;
  font-size: 13px;
  transition: all 0.15s ease;
  font-family: inherit;
}
.page-btn:hover:not(.disabled) {
  border-color: #4F6EF7;
  color: #4F6EF7;
}
.page-btn:active:not(.disabled) {
  transform: scale(0.97);
}
.page-btn.active {
  background-color: #4F6EF7;
  color: #FFFFFF;
  border-color: #4F6EF7;
}
.page-btn.disabled {
  color: #E5E6EB;
  background-color: #F2F3F5;
  cursor: not-allowed;
}

/* ==================== 概览卡片 ==================== */
.overview-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 28px;
}
.overview-card {
  background-color: #FFFFFF;
  border-radius: 10px;
  padding: 24px;
  border: 1px solid #E5E6EB;
  transition: box-shadow 0.2s ease;
}
.overview-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
.stat-label {
  font-size: 12px;
  color: #86909C;
  margin-bottom: 10px;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}
.stat-value {
  font-size: 22px;
  font-weight: 700;
  color: #1D2129;
  margin-bottom: 4px;
  letter-spacing: -0.02em;
  font-family: 'Geist Mono', 'SF Mono', 'Menlo', monospace;
}
.stat-change {
  font-size: 12px;
  font-family: 'Geist Mono', 'SF Mono', 'Menlo', monospace;
}
.stat-change.up {
  color: #CF1322;
}
.stat-change.down {
  color: #0E7B3A;
}

/* ==================== 趋势图 ==================== */
.trend-section {
  margin-bottom: 28px;
}
.trend-section h3 {
  font-size: 13px;
  font-weight: 700;
  color: #1D2129;
  margin: 0 0 16px;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}
.trend-chart {
  background-color: #FFFFFF;
  border-radius: 10px;
  padding: 24px;
  border: 1px solid #E5E6EB;
}
.trend-legend {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
  font-size: 13px;
  color: #86909C;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}
.legend-item i {
  display: inline-block;
  width: 10px;
  height: 10px;
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
  transition: height 0.3s ease;
}
.bar-recharge {
  background-color: #4F6EF7;
}
.bar-consume {
  background-color: #D46B08;
}
.bar-refund {
  background-color: #0E7B3A;
}
.trend-label {
  margin-top: 8px;
  font-size: 12px;
  color: #86909C;
  font-family: 'Geist Mono', 'SF Mono', 'Menlo', monospace;
}

/* ==================== 最近交易 ==================== */
.recent-section h3 {
  font-size: 13px;
  font-weight: 700;
  color: #1D2129;
  margin: 0 0 16px;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

/* ==================== 修改记录 ==================== */
.history-section {
  margin-top: 36px;
  border-top: 1px solid #E5E6EB;
  padding-top: 20px;
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
  color: #86909C;
}
.history-title {
  font-size: 13px;
  font-weight: 700;
  color: #1D2129;
  letter-spacing: 0.02em;
}
.history-count {
  font-size: 12px;
  color: #86909C;
  font-family: 'Geist Mono', 'SF Mono', 'Menlo', monospace;
}
.history-body {
  margin-top: 8px;
}
.snapshot-row td {
  background-color: #FAFAFA;
}
.snapshot-detail {
  padding: 16px;
}
.snapshot-header {
  font-size: 12px;
  font-weight: 600;
  color: #86909C;
  margin-bottom: 12px;
  letter-spacing: 0.03em;
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
  color: #86909C;
}
.snapshot-value {
  font-size: 14px;
  color: #4E5969;
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
  animation: fadeIn 0.2s ease;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.modal-content {
  background-color: #FFFFFF;
  border-radius: 10px;
  border: 1px solid #E5E6EB;
  box-shadow: 0 6px 30px rgba(0, 0, 0, 0.08);
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
.modal-sm { width: 440px; }
.modal-md { width: 560px; }
.modal-lg { width: 720px; max-height: 85vh; }
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 28px;
  border-bottom: 1px solid #E5E6EB;
}
.modal-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1D2129;
  letter-spacing: -0.01em;
}
.modal-close {
  cursor: pointer;
  line-height: 1;
  transition: all 0.15s ease;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  color: #86909C;
}
.modal-close:hover {
  color: #1D2129;
  background-color: #F2F3F5;
}
.modal-close-icon {
  width: 16px;
  height: 16px;
}
.modal-body {
  padding: 24px 28px;
  overflow-y: auto;
  flex: 1;
}
.modal-footer {
  padding: 14px 28px;
  border-top: 1px solid #E5E6EB;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* ==================== 详情区块 ==================== */
.detail-section {
  margin-top: 24px;
}
.detail-section:first-child {
  margin-top: 0;
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
  font-size: 11px;
  color: #86909C;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}
.detail-grid span {
  font-size: 14px;
  color: #4E5969;
}

/* ==================== 空态占位 ==================== */
.empty-block {
  text-align: center;
  color: #86909C;
  padding: 24px 0;
  background-color: #F2F3F5;
  border-radius: 6px;
  margin-top: 8px;
  font-size: 13px;
}

/* ==================== 预选金额 ==================== */
.preset-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 8px;
}
.preset-tag {
  padding: 6px 16px;
  border: 1px solid #E5E6EB;
  border-radius: 6px;
  font-size: 14px;
  background-color: #F2F3F5;
  color: #1D2129;
  font-family: 'Geist Mono', 'SF Mono', 'Menlo', monospace;
}
.preset-tag-dashed {
  border-style: dashed;
  color: #86909C;
  font-family: inherit;
}
.preset-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.preset-index {
  color: #86909C;
  width: 20px;
  text-align: center;
  font-size: 13px;
  flex-shrink: 0;
}
.preset-yen {
  color: #86909C;
  font-size: 14px;
  flex-shrink: 0;
}

/* ==================== 按钮尺寸 ==================== */
.btn-xs {
  height: 24px;
  padding: 0 8px;
  font-size: 12px;
  border-radius: 4px;
}
.btn-text-danger {
  color: #CF1322;
}

/* ==================== 表单输入尺寸 ==================== */
.form-input-xs { width: 80px; }
.form-input-sm { width: 120px; }
.form-input-md { width: 190px; flex-shrink: 0; }
.form-input-lg { width: 320px; }
.form-input-xl { width: 420px; }

/* ==================== 活动表单辅助 ==================== */
.af-control-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 6px;
}

/* ==================== 活动弹窗分组 ==================== */
.af-group-title {
  font-size: 13px;
  font-weight: 600;
  color: #1D2129;
  padding: 0;
  margin-bottom: 14px;
  letter-spacing: 0.01em;
}
.af-group-divider {
  height: 1px;
  background-color: #E5E6EB;
  margin: 18px 0 14px;
}

/* ==================== Segmented Control ==================== */
.segmented-control {
  display: inline-flex;
  background-color: #F2F3F5;
  border-radius: 8px;
  padding: 3px;
  gap: 2px;
}
.segmented-btn {
  height: 30px;
  padding: 0 20px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #4E5969;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  line-height: 30px;
}
.segmented-btn:hover {
  color: #1D2129;
}
.segmented-btn.active {
  background-color: #FFFFFF;
  color: #4F6EF7;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

/* ==================== 活动表单字段容器 ==================== */
.af-field {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.af-field-hint {
  font-size: 12px;
  color: #86909C;
  margin-top: 6px;
  line-height: 1.5;
}

/* ==================== 限额行 ==================== */
.af-limit-row {
  display: flex;
  gap: 24px;
  padding-top: 6px;
}
.af-limit-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #4E5969;
}

/* ==================== 开关文字标签 ==================== */
.af-toggle-label {
  font-size: 13px;
  color: #86909C;
  margin-left: 10px;
  line-height: 22px;
}

/* ==================== 钱包设置卡片 ==================== */
.wcfg-card {
  background: #F7F8FA;
  border: 1px solid #E5E6EB;
  border-radius: 8px;
  margin-bottom: 16px;
  overflow: hidden;
}
.wcfg-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  color: #1D2129;
  background: #FFFFFF;
  border-bottom: 1px solid #E5E6EB;
}
.wcfg-card-body {
  padding: 16px;
}
.wcfg-row {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
}
.wcfg-row:last-child {
  margin-bottom: 0;
}
.wcfg-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}
.wcfg-label {
  font-size: 13px;
  font-weight: 500;
  color: #4E5969;
}
.wcfg-label.required::after {
  content: " *";
  color: #CF1322;
}
.wcfg-input-group {
  display: flex;
  align-items: center;
  gap: 6px;
}
.wcfg-unit {
  font-size: 13px;
  color: #86909C;
  white-space: nowrap;
}
.wcfg-hint {
  font-size: 12px;
  color: #86909C;
  margin-top: 4px;
}
.wcfg-divider {
  height: 1px;
  background: #E5E6EB;
  margin: 12px 0;
}

/* ==================== 钱包设置查看模式 ==================== */
.wcfg-view-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}
.wcfg-view-card {
  border: 1px solid #E5E6EB;
  border-radius: 8px;
  overflow: hidden;
  background: #FFFFFF;
}
.wcfg-view-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  color: #1D2129;
  background: #FAFAFA;
  border-bottom: 1px solid #E5E6EB;
}
.wcfg-view-card-body {
  padding: 12px 16px;
}
.wcfg-view-field {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #F2F3F5;
}
.wcfg-view-field:last-child {
  border-bottom: none;
}
.wcfg-view-label {
  font-size: 13px;
  color: #86909C;
}
.wcfg-view-value {
  font-size: 14px;
  color: #1D2129;
  font-weight: 500;
}
.wcfg-status-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}
.wcfg-status-badge.on {
  background: #E8FFE8;
  color: #00A854;
}
.wcfg-status-badge.off {
  background: #FFF0F0;
  color: #CF1322;
}


/* ==================== 充值方案弹窗 ==================== */
.plan-section {
  background: #F7F8FA;
  border: 1px solid #E5E6EB;
  border-radius: 8px;
  margin-bottom: 16px;
  overflow: hidden;
}
.plan-section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 600;
  color: #1D2129;
  background: #FFFFFF;
  border-bottom: 1px solid #E5E6EB;
}
.plan-count-badge {
  margin-left: auto;
  background: #F2F3F5;
  color: #4E5969;
  font-size: 11px;
  padding: 1px 8px;
  border-radius: 10px;
  font-weight: 500;
}
.plan-section-body {
  padding: 14px;
}
.plan-preset-row {
  margin-bottom: 8px;
}
.plan-preset-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #FFFFFF;
  border: 1px solid #E5E6EB;
  border-radius: 6px;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.plan-preset-card:focus-within {
  border-color: #4F6EF7;
  box-shadow: 0 0 0 2px rgba(79, 110, 247, 0.1);
}
.plan-preset-index {
  color: #86909C;
  font-size: 12px;
  width: 18px;
  text-align: center;
  flex-shrink: 0;
}
.plan-preset-yen {
  color: #86909C;
  font-size: 14px;
  flex-shrink: 0;
}
.plan-preset-actions {
  display: flex;
  gap: 4px;
  margin-left: auto;
}
.plan-icon-btn {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  color: #86909C;
  transition: all 0.15s;
}
.plan-icon-btn:hover:not(:disabled) {
  background: #F2F3F5;
  color: #4E5969;
}
.plan-icon-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
.plan-icon-btn-danger:hover:not(:disabled) {
  color: #CF1322;
  background: #FFF0F0;
}
.plan-add-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border: 1px dashed #C9CDD4;
  background: transparent;
  border-radius: 6px;
  color: #86909C;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
}
.plan-add-btn:hover {
  border-color: #4F6EF7;
  color: #4F6EF7;
}
.plan-divider {
  height: 1px;
  background: #E5E6EB;
  margin: 14px 0;
}
.plan-custom-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.plan-toggle-label {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #4E5969;
  cursor: pointer;
}
.plan-custom-fields {
  display: flex;
  gap: 16px;
  padding-left: 4px;
}
.plan-custom-field {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #4E5969;
}
.plan-empty {
  text-align: center;
  color: #86909C;
  padding: 20px 0;
  font-size: 13px;
}
.plan-activity-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.plan-activity-table th {
  text-align: left;
  padding: 8px 10px;
  font-weight: 500;
  color: #86909C;
  border-bottom: 1px solid #E5E6EB;
  white-space: nowrap;
}
.plan-activity-table td {
  padding: 8px 10px;
  border-bottom: 1px solid #F2F3F5;
}
.plan-type-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}
.plan-type-tag.bonus {
  background: #E8FFE8;
  color: #00A854;
}
.plan-type-tag.discount {
  background: #FFF7E6;
  color: #D46B08;
}
.plan-mono {
  font-family: "Geist Mono", "SF Mono", "Menlo", monospace;
  font-size: 12px;
}
.plan-discount-amount {
  color: #CF1322;
}
.plan-act-status {
  font-size: 12px;
  font-weight: 500;
}
.plan-act-status.on {
  color: #00A854;
}
.plan-act-status.off {
  color: #86909C;
}


.plan-preset-tag {
  padding: 4px 14px;
  border: 1px solid #E5E6EB;
  border-radius: 6px;
  font-size: 13px;
  background: #F7F8FA;
  color: #1D2129;
  font-family: "Geist Mono", "SF Mono", "Menlo", monospace;
}
.plan-preset-tag-dashed {
  border-style: dashed;
  color: #86909C;
  font-family: inherit;
}


/* ==================== 充值流水资金桶弹窗 ==================== */
.recharge-flow-modal { max-width: 1200px !important; }
.flow-summary { background: #f7f8fa; border: 1px solid #e5e6eb; border-radius: 8px; padding: 14px 36px; margin-bottom: 24px; }
.flow-summary-row { display: flex; align-items: center; gap: 12px; font-size: 15px; line-height: 2; }
.flow-summary-label { color: #86909c; width: 72px; flex-shrink: 0; }
.flow-summary-value { color: #1d2129; font-weight: 500; font-size: 15px; }
.flow-summary-divider { height: 1px; background: #e5e6eb; margin: 14px 0; }
.flow-summary-amounts { display: flex; gap: 40px; flex-wrap: wrap; }
.flow-summary-amount-item { display: flex; flex-direction: column; gap: 6px; }
.flow-summary-amount-label { font-size: 13px; color: #86909c; white-space: nowrap; }
.flow-summary-amount-value { font-size: 19px; font-weight: 600; color: #1d2129; font-family: 'Geist Mono', 'SF Mono', 'Menlo', monospace; }
.flow-summary-amount-value.bonus { color: #d46b08; }
.flow-summary-amount-item.total { margin-left: auto; }
.flow-summary-amount-value.total { color: #1677ff; font-size: 21px; }
.flow-buckets-row { display: flex; gap: 20px; }
.flow-bucket { flex: 1; min-width: 0; background: #fff; border: 1px solid #e5e6eb; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 2px rgba(0,0,0,0.04); }
.flow-bucket-header { display: flex; align-items: center; gap: 10px; padding: 10px 36px; border-bottom: 1px solid #f2f3f5; font-size: 14px; flex-wrap: wrap; }
.flow-bucket-type { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 13px; font-weight: 600; white-space: nowrap; }
.flow-bucket-type.principal { background: #e8f4ff; color: #1677ff; }
.flow-bucket-type.bonus { background: #fff7e6; color: #d46b08; }
.flow-bucket-status { font-size: 12px; padding: 1px 5px; border-radius: 3px; background: #e8ffe8; color: #00a854; white-space: nowrap; }
.flow-bucket-status.empty { background: #fff0f0; color: #cf1322; }
.flow-bucket-withdrawable { font-size: 12px; padding: 1px 5px; border-radius: 3px; background: #f2f3f5; color: #86909c; margin-left: auto; white-space: nowrap; }
.flow-bucket-withdrawable.yes { background: #e8ffe8; color: #00a854; }
.flow-bucket-body { padding: 10px 36px; }
.flow-bucket-bar-area { margin-bottom: 16px; }
.flow-bucket-bar { height: 6px; background: #f2f3f5; border-radius: 3px; overflow: hidden; margin-bottom: 4px; }
.flow-bucket-bar-fill { height: 100%; border-radius: 3px; transition: width 0.3s ease; min-width: 0%; }
.flow-bucket-bar-fill.principal { background: linear-gradient(90deg, #1677ff, #4096ff); }
.flow-bucket-bar-fill.bonus { background: linear-gradient(90deg, #d46b08, #fa8c16); }
.flow-bucket-bar-labels { display: flex; justify-content: space-between; font-size: 13px; color: #86909c; }
.flow-bucket-bar-labels strong { color: #1d2129; font-size: 15px; font-family: 'Geist Mono', 'SF Mono', 'Menlo', monospace; }
.flow-detail-label { font-size: 14px; color: #86909c; margin-bottom: 10px; font-weight: 500; }
.flow-consumption-table { width: 100%; border-collapse: collapse; font-size: 14px; }
.flow-consumption-table th { text-align: left; padding: 4px 16px; color: #86909c; font-weight: 500; border-bottom: 1px solid #e5e6eb; white-space: nowrap; font-size: 13px; }
.flow-consumption-table td { padding: 4px 16px; border-bottom: 1px solid #f2f3f5; white-space: nowrap; }
.consume-type-tag { font-size: 13px !important; padding: 1px 5px !important; }
.order-no-cell { font-family: 'Geist Mono', 'SF Mono', 'Menlo', monospace; font-size: 13px; max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.flow-no-data { text-align: center; color: #c9cdd4; font-size: 15px; padding: 20px 0; }

/* ==================== 收款流水统计卡片 ==================== */
.settle-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}
.settle-stat-card {
  flex: 1;
  background: #F7F8FA;
  border: 1px solid #E5E6EB;
  border-radius: 8px;
  padding: 16px 20px;
  transition: box-shadow 0.2s ease;
}
.settle-stat-card:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.settle-stat-label {
  font-size: 12px;
  color: #86909C;
  margin-bottom: 8px;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}
.settle-stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #1D2129;
  font-family: 'Geist Mono', 'SF Mono', 'Menlo', monospace;
  letter-spacing: -0.02em;
}
.settle-stat-card.consume {
  background: #F0F5FF;
  border-color: #D6E4FF;
}
.settle-stat-card.consume .settle-stat-value {
  color: #4F6EF7;
}
.settle-stat-card.refund {
  background: #FFF7E6;
  border-color: #FFE0B2;
}
.settle-stat-card.refund .settle-stat-value {
  color: #D46B08;
}
.settle-stat-card.net-positive {
  background: #E8FFE8;
  border-color: #B7EB8F;
}
.settle-stat-card.net-positive .settle-stat-value {
  color: #00A854;
}
.settle-stat-card.net-negative {
  background: #FFF0F0;
  border-color: #FFCCC7;
}
.settle-stat-card.net-negative .settle-stat-value {
  color: #CF1322;
}
</style>






