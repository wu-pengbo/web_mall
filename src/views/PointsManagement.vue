<script setup lang="ts">
import { ref, reactive, computed } from 'vue'

// ==================== 侧边栏导航 ====================
const menuList = [
  {
    key: 'config',
    label: '配置管理',
    children: [
      { key: 'points_config', label: '积分配置' },
      { key: 'points_batch', label: '积分批次' },
    ],
  },
  {
    key: 'merchant',
    label: '商户管理',
    children: [
      { key: 'merchant_sign', label: '商户签约' },
      { key: 'quota_manage', label: '额度管理' },
    ],
  },
  {
    key: 'user',
    label: '用户管理',
    children: [
      { key: 'user_balance', label: '用户余额' },
      { key: 'points_distribute', label: '积分变更流水' },
    ],
  },
  {
    key: 'activity',
    label: '积分活动',
    children: [
      { key: 'activity_config', label: '活动配置' },
      { key: 'consume_points', label: '消费积分管理' },
      { key: 'photo_points', label: '拍照积分管理' },
    ],
  },
  {
    key: 'settlement',
    label: '结算与报表',
    children: [
      { key: 'merchant_settlement', label: '商户结算' },
      { key: 'reconciliation', label: '对账报表' },
    ],
  },
]

const activeMenu = ref('points_config')
const expandedMenus = ref<string[]>(['config', 'merchant', 'user', 'activity', 'settlement'])

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

// ==================== 模块1：积分配置 ====================
const pointsConfig = reactive({
  name: '平台通用积分',
  enabled: false,
  code: 'PTS-20260604-001',
  exchangeRate: 100, // N积分 = 1元
  validityType: 'forever' as 'yearly' | 'dynamic' | 'forever',
  dynamicDays: 365,
  yearlyClearDate: '12-31',
})

const configSaved = ref(false)
const editingConfig = ref(false)
const editEnabled = ref(false)
type PointsConfig = typeof pointsConfig
const configBackup = ref<PointsConfig | null>(null)

const savePointsConfig = () => {
  pointsConfig.enabled = editEnabled.value
  configSaved.value = true
  editingConfig.value = false
  alert('积分配置保存成功！')
  console.log('Points config saved:', { ...pointsConfig })
}

const startEditConfig = () => {
  configBackup.value = { ...pointsConfig }
  editingConfig.value = true
  editEnabled.value = pointsConfig.enabled
}

const cancelEditConfig = () => {
  if (!configSaved.value) {
    pointsConfig.enabled = false
    editingConfig.value = false
    return
  }
  if (configBackup.value) {
    Object.assign(pointsConfig, configBackup.value)
  }
  editingConfig.value = false
}

const enablePoints = () => {
  configSaved.value = false
  editingConfig.value = true
  pointsConfig.enabled = true
  editEnabled.value = false
}
const validityTypeText = computed(() => {
  switch (pointsConfig.validityType) {
    case 'forever':
      return '永久有效'
    case 'dynamic':
      return `自获取之日起 ${pointsConfig.dynamicDays} 天内有效`
    case 'yearly':
      return `每年 ${pointsConfig.yearlyClearDate} 统一清零`
    default:
      return ''
  }
})


// ==================== 积分配置-修改记录 ====================
interface ConfigSnapshot {
  name: string
  code: string
  exchangeRate: number
  validityType: string
  dynamicDays: number
  yearlyClearDate: string
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
    snapshot: {
      name: '平台通用积分',
      code: 'PTS-20260604-001',
      exchangeRate: 100,
      validityType: 'dynamic',
      dynamicDays: 365,
      yearlyClearDate: '12-31',
    },
  },
  {
    id: 2,
    operator: '李四',
    operateTime: '2026-06-09 10:00',
    snapshot: {
      name: '平台积分',
      code: 'PTS-20260604-001',
      exchangeRate: 100,
      validityType: 'forever',
      dynamicDays: 365,
      yearlyClearDate: '12-31',
    },
  },
  {
    id: 3,
    operator: '王五',
    operateTime: '2026-06-07 16:45',
    snapshot: {
      name: '平台积分',
      code: 'PTS-20260603-001',
      exchangeRate: 200,
      validityType: 'forever',
      dynamicDays: 365,
      yearlyClearDate: '12-31',
    },
  },
])

const configHistoryExpandedId = ref<number | null>(null)
const configHistorySectionOpen = ref(false)

const toggleConfigHistory = (id: number) => {
  configHistoryExpandedId.value = configHistoryExpandedId.value === id ? null : id
}

// ==================== 模块2：积分批次 ====================
const batchFilter = reactive({
  merchantName: '',
  status: '',
})

const batchStatusOptions = [
  { value: '', label: '全部状态' },
  { value: 'active', label: '启用' },
  { value: 'disabled', label: '已停用' },
]

interface BatchItem {
  id: string
  batchNo: string
  merchantName: string
  batchName: string
  issuedPoints: number
  validityType: 'inherit' | 'forever' | 'dynamic' | 'yearly'
  validDays: number
  yearlyClearDate: string
  status: string
  createTime: string
  remark?: string
}

const batchList = ref<BatchItem[]>([
  {
    id: '1',
    batchNo: 'BATCH-20260603-001',
    merchantName: '总部直营店',
    batchName: '2026年Q2季度额度',
    issuedPoints: 35000,
    validityType: 'inherit',
    validDays: 365,
    yearlyClearDate: '12-31',
    status: 'active',
    createTime: '2026-06-03 10:00:00',
  },
  {
    id: '2',
    batchNo: 'BATCH-20260603-002',
    merchantName: '总部加盟店',
    batchName: '开业活动专项额度',
    issuedPoints: 50000,
    validityType: 'dynamic',
    validDays: 180,
    yearlyClearDate: '12-31',
    status: 'active',
    createTime: '2026-06-03 14:30:00',
  },
  {
    id: '3',
    batchNo: 'BATCH-20260501-001',
    merchantName: '总部直营店',
    batchName: '2026年Q1剩余额度',
    issuedPoints: 8000,
    validityType: 'yearly',
    validDays: 365,
    yearlyClearDate: '12-31',
    status: 'disabled',
    createTime: '2026-05-01 09:00:00',
  },
])

const showBatchModal = ref(false)
const batchForm = reactive({
  merchantName: '',
  batchName: '',
  validityType: 'inherit' as 'inherit' | 'forever' | 'dynamic' | 'yearly',
  validDays: 365,
  yearlyClearDate: '12-31',
  remark: '',
})

const batchFilteredList = computed(() => {
  return batchList.value.filter((b) => {
    if (batchFilter.merchantName && !b.merchantName.includes(batchFilter.merchantName)) return false
    if (batchFilter.status && b.status !== batchFilter.status) return false
    return true
  })
})

const openBatchModal = () => {
  batchForm.merchantName = ''
  batchForm.batchName = ''
  batchForm.validityType = 'inherit'
  batchForm.validDays = 365
  batchForm.yearlyClearDate = '12-31'
  batchForm.remark = ''
  showBatchModal.value = true
}

const closeBatchModal = () => {
  showBatchModal.value = false
}

const submitBatch = () => {
  if (!batchForm.merchantName || !batchForm.batchName) {
    alert('请填写必填项')
    return
  }
  if (batchForm.validityType === 'dynamic' && !batchForm.validDays) {
    alert('请填写有效期天数')
    return
  }
  const newBatch: BatchItem = {
    id: String(Date.now()),
    batchNo: `BATCH-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(batchList.value.length + 1).padStart(3, '0')}`,
    merchantName: batchForm.merchantName,
    batchName: batchForm.batchName,
    issuedPoints: 0,
    validityType: batchForm.validityType,
    validDays: batchForm.validityType === 'inherit' ? 365 : batchForm.validDays,
    yearlyClearDate: batchForm.validityType === 'yearly' ? batchForm.yearlyClearDate : '12-31',
    status: 'active',
    createTime: new Date().toLocaleString(),
  }
  batchList.value.unshift(newBatch)
  alert('批次创建成功！')
  closeBatchModal()
}

const toggleBatchStatus = (batch: BatchItem) => {
  if (batch.status === 'active') {
    batch.status = 'disabled'
  } else if (batch.status === 'disabled') {
    batch.status = 'active'
  }
}

const deleteBatch = (batch: BatchItem) => {
  if (batch.issuedPoints > 0) {
    alert('该批次已有发放记录，无法删除')
    return
  }
  if (confirm('确定删除该批次吗？')) {
    const idx = batchList.value.indexOf(batch)
    if (idx > -1) batchList.value.splice(idx, 1)
  }
}

// ==================== 批次流水明细弹窗 ====================
const showBatchLedgerModal = ref(false)
const currentBatchLedger = ref<BatchItem | null>(null)
const batchLedgerTab = ref<'issue' | 'consume'>('issue')

// 模拟发放流水数据（FlowRecord）
const mockIssueRecords: FlowRecord[] = [
  {
    id: 'BI-001',
    type: 'earn',
    reason: 'activity',
    reasonDetail: '618大促活动',
    amount: 5000,
    balance: 12500,
    batch: '2026年Q2季度额度',
    userUid: 'U10001',
    userPhone: '138****5678',
    merchant: '总部直营店',
    operator: '运营张三',
    orderNo: '',
    expireTime: '2027-06-03',
    time: '2026-06-03 15:30:00',
  },
  {
    id: 'BI-002',
    type: 'earn',
    reason: 'manual',
    reasonDetail: '客诉补偿发放',
    amount: 3000,
    balance: 8000,
    batch: '2026年Q2季度额度',
    userUid: 'U10002',
    userPhone: '139****1234',
    merchant: '总部直营店',
    operator: '运营张三',
    orderNo: '',
    expireTime: '2027-06-04',
    time: '2026-06-04 10:00:00',
  },
  {
    id: 'BI-003',
    type: 'earn',
    reason: 'activity',
    reasonDetail: '交易奖励',
    amount: 8000,
    balance: 16000,
    batch: '2026年Q2季度额度',
    userUid: 'U10003',
    userPhone: '137****9012',
    merchant: '总部直营店',
    operator: '系统自动',
    orderNo: '',
    expireTime: '2027-06-05',
    time: '2026-06-05 18:30:00',
  },
  {
    id: 'BI-004',
    type: 'earn',
    reason: 'activity',
    reasonDetail: '新用户注册活动',
    amount: 2000,
    balance: 6000,
    batch: '2026年Q2季度额度',
    userUid: 'U10004',
    userPhone: '136****3456',
    merchant: '总部直营店',
    operator: '运营李四',
    orderNo: '',
    expireTime: '2027-06-06',
    time: '2026-06-06 09:00:00',
  },
]

// 模拟消耗流水数据（FlowRecord）
const mockConsumeRecords: FlowRecord[] = [
  {
    id: 'BC-001',
    type: 'burn',
    reason: 'consume',
    reasonDetail: '订单消费抵扣',
    amount: -1500,
    balance: 11000,
    batch: '2026年Q2季度额度',
    userUid: 'U10001',
    userPhone: '138****5678',
    merchant: '总部直营店',
    operator: '系统',
    orderNo: 'ORD20260604001',
    expireTime: '',
    time: '2026-06-07 14:30:00',
  },
  {
    id: 'BC-002',
    type: 'burn',
    reason: 'consume',
    reasonDetail: '订单消费抵扣',
    amount: -3000,
    balance: 13000,
    batch: '2026年Q2季度额度',
    userUid: 'U10003',
    userPhone: '137****9012',
    merchant: '总部直营店',
    operator: '系统',
    orderNo: 'ORD20260606002',
    expireTime: '',
    time: '2026-06-08 11:00:00',
  },
  {
    id: 'BC-003',
    type: 'burn',
    reason: 'expire',
    reasonDetail: '年度过期回收',
    amount: -500,
    balance: 10500,
    batch: '2026年Q2季度额度',
    userUid: 'U10001',
    userPhone: '138****5678',
    merchant: '总部直营店',
    operator: '系统',
    orderNo: '',
    expireTime: '2025-12-31',
    time: '2026-06-09 00:00:00',
  },
]

const openBatchLedger = (batch: BatchItem) => {
  currentBatchLedger.value = batch
  batchLedgerTab.value = 'issue'
  showBatchLedgerModal.value = true
}

// ==================== 模块3：商户签约 ====================
const signFilter = reactive({
  merchantName: '',
  status: '',
})

const signStatusOptions = [
  { value: '', label: '全部状态' },
  { value: 'signed', label: '已签约' },
  { value: 'terminated', label: '已解约' },
]

interface SignItem {
  id: string
  merchantName: string
  status: string
  currentQuota: number
  signTime: string
  terminateTime: string
}

const signList = ref<SignItem[]>([
  {
    id: '1',
    merchantName: '总部直营店',
    status: 'signed',
    currentQuota: 77000,
    signTime: '2026-01-15',
    terminateTime: '',
  },
  {
    id: '2',
    merchantName: '总部加盟店',
    status: 'signed',
    currentQuota: 0,
    signTime: '2026-03-20',
    terminateTime: '',
  },
  {
    id: '3',
    merchantName: '社区便利店A',
    status: 'signed',
    currentQuota: 0,
    signTime: '',
    terminateTime: '',
  },
])

const showSignModal = ref(false)
const isEditSign = ref(false)
const editingSignId = ref('')
const signForm = reactive({
  merchantName: '',
  agreement: '',
  remark: '',
})

const filteredSignList = computed(() => {
  return signList.value.filter((s) => {
    if (signFilter.merchantName && !s.merchantName.includes(signFilter.merchantName)) return false
    if (signFilter.status && s.status !== signFilter.status) return false
    return true
  })
})

const openSignModal = (item?: SignItem) => {
  if (item) {
    isEditSign.value = true
    editingSignId.value = item.id
    signForm.merchantName = item.merchantName
  } else {
    isEditSign.value = false
    editingSignId.value = ''
    signForm.merchantName = ''
  }
  signForm.agreement = ''
  signForm.remark = ''
  showSignModal.value = true
}

const closeSignModal = () => {
  showSignModal.value = false
}

const submitSign = () => {
  if (!signForm.merchantName) {
    alert('请选择商户')
    return
  }
  if (isEditSign.value) {
    // 编辑模式：无需额外字段更新
  } else {
    const newSign: SignItem = {
      id: String(Date.now()),
      merchantName: signForm.merchantName,
      status: 'signed',
      currentQuota: 0,
      signTime: new Date().toISOString().slice(0, 10),
      terminateTime: '',
    }
    signList.value.unshift(newSign)
  }
  alert(isEditSign.value ? '签约信息更新成功！' : '商户签约成功！')
  closeSignModal()
}

const terminateSign = (item: SignItem) => {
  if (confirm(`确定与「${item.merchantName}」解约吗？解约后该商户所有批次将自动停用。`)) {
    item.status = 'terminated'
    item.terminateTime = new Date().toISOString().slice(0, 10)
    alert('已解约')
  }
}

// ==================== 商户流水弹窗 ====================
const showMerchantLedgerModal = ref(false)
const currentMerchantLedger = ref<SignItem | null>(null)
const merchantLedgerTab = ref<'issue' | 'consume'>('issue')

const merchantIssueRecords = computed(() => {
  if (!currentMerchantLedger.value) return []
  return distributeRecordList.value.filter(
    (r) => r.merchant === currentMerchantLedger.value!.merchantName,
  )
})

const merchantConsumeRecords = computed(() => {
  if (!currentMerchantLedger.value) return []
  return allLedgerList.value.filter(
    (r) => r.merchant === currentMerchantLedger.value!.merchantName && r.type === 'burn',
  )
})

const openMerchantLedger = (item: SignItem) => {
  currentMerchantLedger.value = item
  merchantLedgerTab.value = 'issue'
  showMerchantLedgerModal.value = true
}

// 商户流水摘要统计
const merchantTotalIssued = computed(() => {
  return merchantIssueRecords.value.reduce((sum, r) => sum + r.amount, 0)
})

const merchantTotalConsumed = computed(() => {
  return merchantConsumeRecords.value.reduce((sum, r) => sum + Math.abs(r.amount), 0)
})

const merchantRemainingQuota = computed(() => {
  return merchantTotalIssued.value - merchantTotalConsumed.value
})

// ==================== 模块4：额度管理 ====================
const quotaFilter = reactive({
  merchantName: '',
  action: '',
  changeStatus: '',
})

const quotaActionOptions = [
  { value: '', label: '全部操作' },
  { value: 'recharge', label: '充值' },
  { value: 'recycle', label: '回收' },
]

const quotaChangeOptions = [
  { value: '', label: '全部状态' },
  { value: 'pending', label: '待变更' },
  { value: 'completed', label: '已变更' },
  { value: 'rejected', label: '已拒绝' },
]

interface QuotaItem {
  id: string
  recordNo: string
  merchantName: string
  action: 'recharge' | 'recycle'
  rechargeType: 'buy' | 'gift'
  amount: number
  payMethod: 'cash' | 'transfer' | 'online' | ''
  payAmount: number
  payStatus: 'unpaid' | 'paid' | ''
  changeStatus: 'pending' | 'completed' | 'rejected'
  source: 'platform' | 'merchant'
  operator: string
  operateTime: string
  remark: string
}

const quotaList = ref<QuotaItem[]>([
  {
    id: '1',
    recordNo: 'QUOTA-20260603-001',
    merchantName: '总部直营店',
    action: 'recharge',
    rechargeType: 'buy',
    amount: 100000,
    payMethod: 'transfer',
    payAmount: 10000,
    payStatus: 'paid',
    changeStatus: 'completed',
    source: 'platform',
    operator: '运营小王',
    operateTime: '2026-06-03 10:00:00',
    remark: 'Q2季度额度采购',
  },
  {
    id: '3',
    recordNo: 'QUOTA-20260605-001',
    merchantName: '总部直营店',
    action: 'recharge',
    rechargeType: 'gift',
    amount: 20000,
    payMethod: '',
    payAmount: 0,
    payStatus: 'paid',
    changeStatus: 'pending',
    source: 'platform',
    operator: '运营小李',
    operateTime: '2026-06-05 09:00:00',
    remark: '平台推广补贴',
  },
  {
    id: '4',
    recordNo: 'QUOTA-20260606-001',
    merchantName: '总部加盟店',
    action: 'recycle',
    rechargeType: 'buy',
    amount: 10000,
    payMethod: '',
    payAmount: 0,
    payStatus: '',
    changeStatus: 'pending',
    source: 'platform',
    operator: '运营小王',
    operateTime: '2026-06-06 11:00:00',
    remark: '回收超额额度',
  },
])

const showQuotaModal = ref(false)

const quotaForm = reactive({
  merchantName: '',
  action: 'recharge' as string,
  rechargeType: 'buy' as string,
  amount: null as number | null,
  payMethod: 'cash' as string,
  payAmount: null as number | null,
  remark: '',
})

const filteredQuotaList = computed(() => {
  return quotaList.value.filter((q) => {
    if (quotaFilter.merchantName && !q.merchantName.includes(quotaFilter.merchantName)) return false
    if (quotaFilter.action && q.action !== quotaFilter.action) return false
    if (quotaFilter.changeStatus && q.changeStatus !== quotaFilter.changeStatus) return false
    return true
  })
})

const getActionText = (action: string) => {
  const map: Record<string, string> = { recharge: '充值', recycle: '回收' }
  return map[action] || action
}

const getRechargeTypeText = (type: string) => {
  const map: Record<string, string> = { buy: '购买', gift: '赠送' }
  return map[type] || type
}

const getPayMethodText = (method: string) => {
  const map: Record<string, string> = { cash: '现金', transfer: '转账', online: '线上付款' }
  return map[method] || '-'
}

const getPayStatusText = (status: string) => {
  const map: Record<string, string> = { unpaid: '未支付', paid: '已支付' }
  return map[status] || '-'
}

const getChangeStatusText = (status: string) => {
  const map: Record<string, string> = { pending: '待变更', completed: '已变更', rejected: '已拒绝' }
  return map[status] || status
}

const getSourceText = (source: string) => {
  const map: Record<string, string> = { platform: '平台', merchant: '商户' }
  return map[source] || source
}

const exchangeRate = 10 // 1元 = 10积分

const openQuotaModal = () => {
  quotaForm.merchantName = ''
  quotaForm.action = 'recharge'
  quotaForm.rechargeType = 'buy'
  quotaForm.amount = null
  quotaForm.payMethod = 'cash'
  quotaForm.payAmount = null
  quotaForm.remark = ''
  showQuotaModal.value = true
}

const autoPayAmount = computed(() => {
  if (quotaForm.action === 'recharge' && quotaForm.rechargeType === 'buy' && quotaForm.amount) {
    return Math.ceil(quotaForm.amount / exchangeRate)
  }
  return null
})

const closeQuotaModal = () => {
  showQuotaModal.value = false
}

const submitQuota = () => {
  if (!quotaForm.merchantName || !quotaForm.amount) {
    alert('请填写必填项')
    return
  }

  const isRecycle = quotaForm.action === 'recycle'
  const isBuy = quotaForm.action === 'recharge' && quotaForm.rechargeType === 'buy'
  const newQuota: QuotaItem = {
    id: String(Date.now()),
    recordNo: `QUOTA-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(quotaList.value.length + 1).padStart(3, '0')}`,
    merchantName: quotaForm.merchantName,
    action: quotaForm.action as 'recharge' | 'recycle',
    rechargeType: isRecycle ? 'buy' : (quotaForm.rechargeType as 'buy' | 'gift'),
    amount: quotaForm.amount,
    payMethod: isBuy ? (quotaForm.payMethod as 'cash' | 'transfer') : '',
    payAmount: isBuy ? autoPayAmount.value || 0 : 0,
    payStatus: isBuy ? 'unpaid' : '',
    changeStatus: 'pending',
    source: 'platform',
    operator: '当前用户',
    operateTime: new Date().toLocaleString(),
    remark: quotaForm.remark,
  }
  quotaList.value.unshift(newQuota)
  alert('额度流水已生成！')
  closeQuotaModal()
}

// 财务确认弹窗
const showFinanceModal = ref(false)
const financeTarget = ref<QuotaItem | null>(null)
const financePayStatus = ref('')
const financeChangeAction = ref('')

const openFinanceModal = (item: QuotaItem) => {
  financeTarget.value = item
  financePayStatus.value = item.payStatus
  financeChangeAction.value = item.changeStatus === 'pending' ? '' : item.changeStatus
  showFinanceModal.value = true
}

const closeFinanceModal = () => {
  showFinanceModal.value = false
  financeTarget.value = null
}

const saveFinance = () => {
  if (!financeTarget.value) return

  const hasPayChange =
    financeTarget.value.payStatus === 'unpaid' && financePayStatus.value === 'paid'
  const hasChangeAction =
    financeTarget.value.changeStatus === 'pending' && financeChangeAction.value !== ''

  if (!hasPayChange && !hasChangeAction) {
    alert('未做任何修改')
    return
  }

  if (hasPayChange) {
    financeTarget.value.payStatus = 'paid'
  }
  if (hasChangeAction) {
    financeTarget.value.changeStatus = financeChangeAction.value as 'completed' | 'rejected'
  }

  const msgs: string[] = []
  if (hasPayChange) msgs.push('支付状态已更新为已支付')
  if (hasChangeAction)
    msgs.push(`变更已${financeChangeAction.value === 'completed' ? '确认' : '拒绝'}`)
  alert(msgs.join('，') + '！')
  closeFinanceModal()
}

// ==================== 模块5：用户余额 ====================
const userBalanceFilter = reactive({
  keyword: '',
})

interface UserBalanceItem {
  uid: string
  phone: string
  currentPoints: number
  expiringPoints: number
  totalEarned: number
  totalBurned: number
}

const userBalanceList = ref<UserBalanceItem[]>([
  {
    uid: 'U10001',
    phone: '138****1234',
    currentPoints: 2350,
    expiringPoints: 150,
    totalEarned: 5200,
    totalBurned: 2850,
  },
  {
    uid: 'U10002',
    phone: '139****5678',
    currentPoints: 1800,
    expiringPoints: 0,
    totalEarned: 3500,
    totalBurned: 1700,
  },
  {
    uid: 'U10003',
    phone: '136****9999',
    currentPoints: 5000,
    expiringPoints: 800,
    totalEarned: 10000,
    totalBurned: 5000,
  },
  {
    uid: 'U10004',
    phone: '137****4444',
    currentPoints: 800,
    expiringPoints: 200,
    totalEarned: 1200,
    totalBurned: 400,
  },
  {
    uid: 'U10005',
    phone: '135****2222',
    currentPoints: 600,
    expiringPoints: 0,
    totalEarned: 600,
    totalBurned: 0,
  },
  {
    uid: 'U10006',
    phone: '133****3333',
    currentPoints: 4400,
    expiringPoints: 800,
    totalEarned: 5000,
    totalBurned: 600,
  },
])

const filteredUserBalanceList = computed(() => {
  if (!userBalanceFilter.keyword) return userBalanceList.value
  const kw = userBalanceFilter.keyword.toLowerCase()
  return userBalanceList.value.filter(
    (u) => u.uid.toLowerCase().includes(kw) || u.phone.includes(kw),
  )
})

// ==================== 统一流水记录接口 ====================
interface FlowRecord {
  id: string
  batch: string // 关联批次名称
  userUid: string // 用户UID
  userPhone: string // 用户手机号
  type: 'earn' | 'burn' // 类型：发放/消耗
  reason: string // 原因编码: activity|manual|refund|consume|expire|deduct
  reasonDetail: string // 原因备注
  amount: number // 变动数值（正=发放，负=消耗）
  balance: number // 变动后余额
  merchant: string // 来源商户
  operator: string // 操作人
  orderNo: string // 关联订单号
  time: string // 发生时间
  expireTime: string // 过期时间（发放才有）
}

const showUserLedgerModal = ref(false)
const currentLedgerUser = ref<UserBalanceItem | null>(null)
const currentUserLedgerList = ref<FlowRecord[]>([])

const mockUserLedgerMap: Record<string, FlowRecord[]> = {
  U10001: [
    {
      id: 'L001',
      type: 'earn',
      reason: 'activity',
      reasonDetail: '618大促活动',
      amount: 200,
      balance: 2350,
      batch: 'BATCH-20260603-001',
      userUid: 'U10001',
      userPhone: '138****1234',
      merchant: '总部直营店',
      operator: '系统',
      orderNo: 'ORD-20260603-001',
      expireTime: '2027-06-03',
      time: '2026-06-03 15:30:00',
    },
    {
      id: 'L002',
      type: 'burn',
      reason: 'consume',
      reasonDetail: '订单消费抵扣',
      amount: -100,
      balance: 2150,
      batch: '',
      userUid: 'U10001',
      userPhone: '138****1234',
      merchant: '总部加盟店',
      operator: '系统',
      orderNo: 'ORD-20260602-005',
      expireTime: '',
      time: '2026-06-02 11:20:00',
    },
    {
      id: 'L003',
      type: 'earn',
      reason: 'activity',
      reasonDetail: '签到活动奖励',
      amount: 500,
      balance: 2250,
      batch: 'BATCH-20260501-001',
      userUid: 'U10001',
      userPhone: '138****1234',
      merchant: '总部直营店',
      operator: '系统',
      orderNo: 'ORD-20260520-003',
      expireTime: '2026-12-31',
      time: '2026-05-20 14:00:00',
    },
  ],
  U10002: [
    {
      id: 'L004',
      type: 'earn',
      reason: 'activity',
      reasonDetail: '新店开业活动',
      amount: 300,
      balance: 1800,
      batch: 'BATCH-20260603-002',
      userUid: 'U10002',
      userPhone: '139****5678',
      merchant: '总部加盟店',
      operator: '系统',
      orderNo: 'ORD-20260601-001',
      expireTime: '2026-11-28',
      time: '2026-06-01 10:00:00',
    },
    {
      id: 'L005',
      type: 'burn',
      reason: 'consume',
      reasonDetail: '商品消费',
      amount: -150,
      balance: 1500,
      batch: '',
      userUid: 'U10002',
      userPhone: '139****5678',
      merchant: '总部直营店',
      operator: '系统',
      orderNo: 'ORD-20260520-002',
      expireTime: '',
      time: '2026-05-20 16:00:00',
    },
  ],
  U10003: [
    {
      id: 'L006',
      type: 'earn',
      reason: 'manual',
      reasonDetail: '手动补发',
      amount: 1000,
      balance: 5000,
      batch: 'BATCH-20260603-001',
      userUid: 'U10003',
      userPhone: '136****9999',
      merchant: '总部直营店',
      operator: '运营小王',
      orderNo: '',
      expireTime: '永久有效',
      time: '2026-06-01 09:00:00',
    },
    {
      id: 'L007',
      type: 'earn',
      reason: 'activity',
      reasonDetail: '积分翻倍活动',
      amount: 400,
      balance: 4000,
      batch: 'BATCH-20260501-001',
      userUid: 'U10003',
      userPhone: '136****9999',
      merchant: '总部直营店',
      operator: '系统',
      orderNo: 'ORD-20260415-010',
      expireTime: '2025-12-31',
      time: '2026-04-15 11:00:00',
    },
  ],
  U10004: [
    {
      id: 'L008',
      type: 'earn',
      reason: 'refund',
      reasonDetail: '退货退款退回',
      amount: 200,
      balance: 800,
      batch: '',
      userUid: 'U10004',
      userPhone: '137****4444',
      merchant: '总部加盟店',
      operator: '系统',
      orderNo: 'ORD-20260515-008',
      expireTime: '',
      time: '2026-05-16 10:00:00',
    },
  ],
  U10005: [
    {
      id: 'L009',
      type: 'earn',
      reason: 'activity',
      reasonDetail: '注册奖励活动',
      amount: 600,
      balance: 600,
      batch: 'BATCH-20260603-001',
      userUid: 'U10005',
      userPhone: '135****2222',
      merchant: '总部直营店',
      operator: '系统',
      orderNo: 'ORD-20260301-001',
      expireTime: '2026-03-01',
      time: '2026-03-01 14:00:00',
    },
  ],
  U10006: [
    {
      id: 'L010',
      type: 'earn',
      reason: 'activity',
      reasonDetail: '满减活动奖励',
      amount: 800,
      balance: 5000,
      batch: 'BATCH-20260603-001',
      userUid: 'U10006',
      userPhone: '133****3333',
      merchant: '总部直营店',
      operator: '系统',
      orderNo: 'ORD-20260610-001',
      expireTime: '2026-07-10',
      time: '2026-06-10 09:00:00',
    },
    {
      id: 'L011',
      type: 'burn',
      reason: 'expire',
      reasonDetail: '年度过期回收',
      amount: -200,
      balance: 4200,
      batch: 'BATCH-20260501-001',
      userUid: 'U10006',
      userPhone: '133****3333',
      merchant: '总部直营店',
      operator: '系统',
      orderNo: '',
      expireTime: '2025-12-31',
      time: '2026-06-01 00:00:00',
    },
    {
      id: 'L012',
      type: 'earn',
      reason: 'activity',
      reasonDetail: '年中大促活动',
      amount: 1200,
      balance: 4400,
      batch: 'BATCH-20260603-001',
      userUid: 'U10006',
      userPhone: '133****3333',
      merchant: '总部直营店',
      operator: '系统',
      orderNo: 'ORD-20260615-003',
      expireTime: '永久有效',
      time: '2026-06-15 14:00:00',
    },
  ],
}

const userLedgerFilter = ref<'all' | 'earn' | 'burn'>('all')

const openUserLedger = (user: UserBalanceItem) => {
  currentLedgerUser.value = user
  const raw = mockUserLedgerMap[user.uid] || []
  // 排序：有过期时间的按过期时间升序（永久有效排最后），无过期时间的保持原序
  currentUserLedgerList.value = [...raw].sort((a, b) => {
    if (!a.expireTime && !b.expireTime) return 0
    if (!a.expireTime) return 1
    if (!b.expireTime) return -1
    if (a.expireTime === '永久有效' && b.expireTime === '永久有效') return 0
    if (a.expireTime === '永久有效') return 1
    if (b.expireTime === '永久有效') return -1
    if (a.expireTime === '已过期' && b.expireTime === '已过期') return 0
    if (a.expireTime === '已过期') return -1
    if (b.expireTime === '已过期') return 1
    return a.expireTime.localeCompare(b.expireTime)
  })
  userLedgerFilter.value = 'all'
  showUserLedgerModal.value = true
}

const filteredUserLedgerList = computed(() => {
  if (userLedgerFilter.value === 'all') return currentUserLedgerList.value
  if (userLedgerFilter.value === 'earn')
    return currentUserLedgerList.value.filter((i) => i.type === 'earn')
  if (userLedgerFilter.value === 'burn')
    return currentUserLedgerList.value.filter((i) => i.type === 'burn')
  return currentUserLedgerList.value
})

const getExpireTimeClass = (item: { expireTime?: string }) => {
  if (!item.expireTime) return ''
  if (item.expireTime === '已过期') return 'expire-expired'
  if (item.expireTime === '永久有效') return ''
  const expireDate = new Date(item.expireTime)
  const today = new Date()
  const diffDays = Math.ceil((expireDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays <= 30) return 'expire-danger'
  if (diffDays <= 90) return 'expire-warning'
  return ''
}

const getExpireTimeDisplay = (item: { reason: string; expireTime?: string }) => {
  if (item.reason === 'expire') return '已过期'
  return item.expireTime || '-'
}

const closeUserLedgerModal = () => {
  showUserLedgerModal.value = false
  currentLedgerUser.value = null
}

// ==================== 模块6：积分发放 ====================
const distributeFilter = reactive({
  keyword: '',
  changeType: '', // '' | 'issue' | 'deduct'
  reason: '',
  merchant: '',
  startDate: '',
  endDate: '',
})

interface DistributeUser {
  uid: string
  phone: string
  currentPoints: number
}

// 发放弹窗
const showDistributeModal = ref(false)
const distributeForm = reactive({
  userSearch: '',
  selectedUser: null as DistributeUser | null,
  batchId: '',
  amount: null as number | null,
  changeType: 'issue', // 'issue' | 'deduct'
  reasonType: 'manual',
  reasonDetail: '',
})

const changeTypeOptions = [
  { value: 'issue', label: '发放' },
  { value: 'deduct', label: '扣除' },
]

// 可用的启用批次（模拟）
const availableBatches = computed(() => {
  return batchList.value.filter((b) => b.status === 'active')
})

const selectedBatchInfo = computed(() => {
  return availableBatches.value.find((b) => b.id === distributeForm.batchId)
})

// 变更原因选项（按变更类型）
const changeReasonOptions = computed(() => {
  if (distributeForm.changeType === 'deduct') {
    return [
      { value: 'none', label: '无' },
      { value: 'manual_deduct', label: '手动扣除' },
      { value: 'fraud_recovery', label: '异常交易收回' },
      { value: 'duplicate_recovery', label: '重复发放收回' },
      { value: 'other', label: '其他' },
    ]
  }
  return [
    { value: 'none', label: '无' },
    { value: 'complaint', label: '客诉补偿' },
    { value: 'activity', label: '活动奖励' },
    { value: 'supplement', label: '补发' },
    { value: 'other', label: '其他' },
  ]
})

// 变更后余额预览
const previewBalance = computed(() => {
  const user = distributeForm.selectedUser
  const amount = distributeForm.amount || 0
  if (!user) return 0
  if (distributeForm.changeType === 'deduct') {
    return user.currentPoints - amount
  }
  return user.currentPoints + amount
})

const openDistributeModal = (user?: UserBalanceItem) => {
  distributeForm.userSearch = ''
  distributeForm.selectedUser = null
  distributeForm.batchId = ''
  distributeForm.amount = null
  distributeForm.changeType = 'issue'
  distributeForm.reasonType = 'none'
  distributeForm.reasonDetail = ''
  if (user) {
    distributeForm.selectedUser = {
      uid: user.uid,
      phone: user.phone,
      currentPoints: user.currentPoints,
    }
  }
  showDistributeModal.value = true
}

const closeDistributeModal = () => {
  showDistributeModal.value = false
}

const searchDistributeUser = () => {
  if (!distributeForm.userSearch) {
    alert('请输入手机号或UID')
    return
  }
  distributeForm.selectedUser = { uid: 'U10006', phone: '133****3333', currentPoints: 1200 }
}

const submitDistribute = () => {
  const user = distributeForm.selectedUser
  if (!user) {
    alert('请先搜索并选择用户')
    return
  }
  if (!distributeForm.amount || distributeForm.amount <= 0) {
    alert('请输入有效的变更数量')
    return
  }

  const isDeduct = distributeForm.changeType === 'deduct'

  // 扣除不需要批次
  if (!isDeduct) {
    if (!distributeForm.batchId) {
      alert('请选择积分批次')
      return
    }
  }

  const batch = isDeduct ? null : selectedBatchInfo.value
  if (!isDeduct && !batch) return

  // 扣除校验：不能超过当前余额
  if (isDeduct && distributeForm.amount > user.currentPoints) {
    alert(`扣除数量（${distributeForm.amount}）超过用户当前积分（${user.currentPoints}）`)
    return
  }

  // 发放校验：商户剩余额度
  if (!isDeduct) {
    const merchantQuota = quotaList.value
      .filter((q) => q.merchantName === batch.merchantName && q.changeStatus === 'completed')
      .reduce((sum, q) => sum + q.amount, 0)
    const merchantIssued = batchList.value
      .filter((b) => b.merchantName === batch.merchantName)
      .reduce((sum, b) => sum + b.issuedPoints, 0)
    const merchantRemaining = merchantQuota - merchantIssued

    if (distributeForm.amount > merchantRemaining) {
      alert(
        `发放数量（${distributeForm.amount}）超过该商户剩余可用额度（${merchantRemaining.toLocaleString()}），请先为商户增加额度`,
      )
      return
    }
    batch.issuedPoints += distributeForm.amount
  }

  // 变更原因映射（UI选项全部映射到 manual/deduct）
  const getReason = () => {
    if (isDeduct) return 'deduct'
    return 'manual'
  }

  distributeRecordList.value.unshift({
    id: `DIS-${String(distributeRecordList.value.length + 1).padStart(3, '0')}`,
    batch: isDeduct ? '' : batch.batchName,
    userUid: user.uid,
    userPhone: user.phone,
    type: isDeduct ? 'burn' : 'earn',
    reason: getReason(),
    reasonDetail: distributeForm.reasonDetail,
    amount: isDeduct ? -distributeForm.amount : distributeForm.amount,
    balance: isDeduct
      ? user.currentPoints - distributeForm.amount
      : user.currentPoints + distributeForm.amount,
    merchant: isDeduct ? '' : batch.merchantName,
    operator: '当前用户',
    orderNo: '',
    expireTime: isDeduct ? '' : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    time: new Date().toLocaleString(),
  })
  const actionText = isDeduct ? '扣除' : '发放'
  alert(`成功向用户 ${user.phone} ${actionText} ${distributeForm.amount} 积分！`)
  closeDistributeModal()
}

const distributeRecordList = ref<FlowRecord[]>([
  {
    id: 'DIS-001',
    type: 'earn',
    reason: 'manual',
    reasonDetail: '手动补发',
    amount: 1000,
    balance: 2500,
    batch: '2026年Q2季度额度',
    userUid: 'U10003',
    userPhone: '136****9999',
    merchant: '总部直营店',
    operator: '运营小王',
    orderNo: '',
    expireTime: '2027-06-01',
    time: '2026-06-01 09:00:00',
  },
  {
    id: 'DIS-002',
    type: 'earn',
    reason: 'manual',
    reasonDetail: '客诉补偿手动发放',
    amount: 500,
    balance: 1800,
    batch: '开业活动专项额度',
    userUid: 'U10007',
    userPhone: '133****7777',
    merchant: '总部加盟店',
    operator: '运营小李',
    orderNo: '',
    expireTime: '2026-11-28',
    time: '2026-05-28 16:30:00',
  },
  {
    id: 'DIS-003',
    type: 'earn',
    reason: 'manual',
    reasonDetail: '订单异常手动补发',
    amount: 200,
    balance: 3200,
    batch: '2026年Q1剩余额度',
    userUid: 'U10008',
    userPhone: '131****8888',
    merchant: '总部直营店',
    operator: '运营小王',
    orderNo: '',
    expireTime: '2027-05-15',
    time: '2026-05-15 11:00:00',
  },
  {
    id: 'DIS-004',
    type: 'earn',
    reason: 'manual',
    reasonDetail: '新店开业手动发放',
    amount: 3000,
    balance: 8000,
    batch: '2026年Q2季度额度',
    userUid: 'U10009',
    userPhone: '130****6666',
    merchant: '总部直营店',
    operator: '超级管理员',
    orderNo: '',
    expireTime: '2027-05-10',
    time: '2026-05-10 14:00:00',
  },
])

const filteredDistributeList = computed(() => {
  return distributeRecordList.value.filter((r) => {
    if (distributeFilter.keyword) {
      const kw = distributeFilter.keyword.toLowerCase()
      if (!r.userUid.toLowerCase().includes(kw) && !r.userPhone.includes(kw)) return false
    }
    if (distributeFilter.changeType === 'issue' && r.type !== 'earn') return false
    if (distributeFilter.changeType === 'deduct' && r.type !== 'burn') return false
    if (distributeFilter.reason && r.reason !== distributeFilter.reason) return false
    if (distributeFilter.merchant && !r.merchant.includes(distributeFilter.merchant)) return false
    if (distributeFilter.startDate && r.time < distributeFilter.startDate) return false
    if (distributeFilter.endDate && r.time > distributeFilter.endDate + ' 23:59:59') return false
    return true
  })
})

const getReasonTypeText = (reason: string) => {
  const map: Record<string, string> = {
    activity: '活动奖励',
    manual: '手动发放',
    refund: '退款退回',
    consume: '消费',
    expire: '过期回收',
    deduct: '手动扣除',
  }
  return map[reason] || reason
}

const getLedgerTypeText = (type: string) => {
  const map: Record<string, string> = {
    earn: '发放',
    burn: '消耗',
  }
  return map[type] || type
}

// ==================== 模块8：商户结算 ====================
const settlementMonth = ref('2026-06')

interface SettlementItem {
  id: string
  settleNo: string
  period: string
  merchantName: string
  issuedPoints: number
  issuedCost: number
  deductedPoints: number
  deductedValue: number
  settleAmount: number
  status: string
}

const settlementList = ref<SettlementItem[]>([
  {
    id: '1',
    settleNo: 'SETTLE-2026-06-001',
    period: '2026年6月',
    merchantName: '总部直营店',
    issuedPoints: 35000,
    issuedCost: 3500,
    deductedPoints: 15000,
    deductedValue: 1500,
    settleAmount: -2000,
    status: 'pending',
  },
  {
    id: '2',
    settleNo: 'SETTLE-2026-06-002',
    period: '2026年6月',
    merchantName: '总部加盟店',
    issuedPoints: 50000,
    issuedCost: 5000,
    deductedPoints: 80000,
    deductedValue: 8000,
    settleAmount: 3000,
    status: 'confirmed',
  },
  {
    id: '3',
    settleNo: 'SETTLE-2026-05-001',
    period: '2026年5月',
    merchantName: '总部直营店',
    issuedPoints: 8000,
    issuedCost: 800,
    deductedPoints: 20000,
    deductedValue: 2000,
    settleAmount: 1200,
    status: 'paid',
  },
])

const generateSettlement = () => {
  alert(`${settlementMonth.value} 结算单已生成！`)
}

const confirmSettlement = (item: SettlementItem) => {
  if (confirm('确认该结算单无误？确认后将进入打款流程。')) {
    item.status = 'confirmed'
    alert('已确认')
  }
}

const markPaid = (item: SettlementItem) => {
  if (confirm('确认已打款完成？')) {
    item.status = 'paid'
    alert('已标记为已打款')
  }
}

const disputeSettlement = (item: SettlementItem) => {
  const reason = prompt('请输入争议原因：')
  if (reason) {
    item.status = 'disputed'
    alert('已标记为有争议')
  }
}

// ==================== 模块9：对账报表 ====================
const reportDateRange = ref('6m')

// 平台大盘数据
const platformOverview = reactive({
  totalIssued: 520000,
  totalBurned: 310000,
  currentActive: 180000,
  burnRate: 59.6,
  expiringSoon: 25000,
  activeUsers: 1280,
})

// 商户维度统计
const merchantStats = ref([
  {
    merchantName: '总部直营店',
    issued: 350000,
    deducted: 200000,
    active: 120000,
    cost: 35000,
    subsidy: 20000,
    netSettle: -15000,
  },
  {
    merchantName: '总部加盟店',
    issued: 170000,
    deducted: 110000,
    active: 60000,
    cost: 17000,
    subsidy: 11000,
    netSettle: -6000,
  },
])

// 简化的趋势图数据
const trendMonths = ['1月', '2月', '3月', '4月', '5月', '6月']
const trendIssued = [60000, 55000, 80000, 95000, 110000, 120000]
const trendBurned = [30000, 40000, 45000, 60000, 75000, 95000]

const maxTrendValue = computed(() => Math.max(...trendIssued, ...trendBurned))

const getBarHeight = (val: number) => {
  return (val / maxTrendValue.value) * 180
}

// 商家搜索下拉（模拟）
const merchantOptions = ['总部直营店', '总部加盟店', '社区便利店A', '品牌旗舰店B']
</script>

<template>
  <div class="points-management">
    <!-- 左侧导航 -->
    <div class="sidebar">
      <div class="sidebar-title">积分管理</div>
      <div class="menu-list">
        <template v-for="menu in menuList" :key="menu.key">
          <!-- 叶子菜单（积分流水） -->
          <div
            v-if="'leaf' in menu"
            class="menu-item leaf"
            :class="{ active: activeMenu === menu.key }"
            @click="handleMenuClick(menu.key)"
          >
            <span>{{ menu.label }}</span>
          </div>
          <!-- 父级菜单 -->
          <template v-else>
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
        </template>
      </div>
    </div>

    <!-- 右侧内容区 -->
    <div class="main-content">
      <!-- ===== 模块1：积分配置 ===== -->
      <!-- ===== 模块1：积分配置 ===== -->
      <div v-if="activeMenu === 'points_config'" class="content-panel">
        <div class="panel-header">
          <h2>积分配置</h2>
          <span class="panel-subtitle">全局积分汇率及有效期策略管理</span>
        </div>
        <div class="panel-body">
          <div class="config-form">
            <!-- 开关行 -->
            <div class="form-item">
              <label class="form-label">积分开关</label>
              <div class="form-control-row">
                <label class="toggle-switch">
                  <input type="checkbox"
                    :checked="editingConfig ? editEnabled : pointsConfig.enabled"
                    @change="editEnabled = $event.target.checked"
                    :disabled="!editingConfig"
                  />
                  <span class="toggle-slider"></span>
                </label>
                <span style="margin-left: 8px; font-size: 13px; color: #666;">
                  {{ editingConfig ? (editEnabled ? '已开启' : '已关闭') : (pointsConfig.enabled ? '已开启' : '已关闭') }}
                </span>
              </div>
            </div>

            <!-- View 1: 关闭状态 -->
            <template v-if="!pointsConfig.enabled">
              <div class="form-item">
                <div class="form-control-row" style="flex-direction: column; align-items: flex-start; gap: 12px;">
                  <span style="color: #999; font-size: 13px;">积分系统已停用，点击下方按钮开启</span>
                  <button class="btn btn-primary" @click="enablePoints">开启积分系统</button>
                </div>
              </div>
            </template>

            <!-- View 2 & 4: 编辑模式（首次开启 或 修改中） -->
            <template v-if="pointsConfig.enabled && (!configSaved || editingConfig)">
              <template v-if="editEnabled">
              <div class="form-item">
                <label class="form-label required">积分名称</label>
                <div class="form-control-row">
                  <input
                    type="text"
                    class="form-input"
                    style="width: 280px"
                    v-model="pointsConfig.name"
                    placeholder="请输入积分名称"
                  />
                </div>
              </div>

              <div class="form-item">
                <label class="form-label">编码</label>
                <div class="form-control-row">
                  <input
                    type="text"
                    class="form-input"
                    style="width: 280px"
                    :value="pointsConfig.code"
                    disabled
                  />
                  <span class="form-tip">（系统自动生成）</span>
                </div>
              </div>

              <div class="form-divider"></div>

              <div class="form-item">
                <label class="form-label required">积分汇率</label>
                <div class="form-control-row">
                  <input
                    type="number"
                    class="form-input"
                    style="width: 120px"
                    v-model.number="pointsConfig.exchangeRate"
                    min="1"
                  />
                  <span>积分 = 1 元</span>
                  <span class="form-tip">（用于商品价格自动换算展示）</span>
                </div>
              </div>

              <div class="form-divider"></div>

              <div class="form-item">
                <label class="form-label required">有效期策略</label>
                <div class="form-control-row" style="flex-wrap: wrap; gap: 12px;">
                  <label class="radio-label">
                    <input type="radio" v-model="pointsConfig.validityType" value="forever" />
                    永久有效
                  </label>
                  <label class="radio-label">
                    <input type="radio" v-model="pointsConfig.validityType" value="dynamic" />
                    动态有效期
                  </label>
                  <label class="radio-label">
                    <input type="radio" v-model="pointsConfig.validityType" value="yearly" />
                    自然年清零
                  </label>
                </div>
              </div>

              <div class="form-item" v-if="pointsConfig.validityType === 'dynamic'">
                <label class="form-label required">有效期天数</label>
                <div class="form-control-row">
                  <input
                    type="number"
                    class="form-input"
                    style="width: 100px"
                    v-model.number="pointsConfig.dynamicDays"
                    min="1"
                  />
                  <span>天（自用户获得积分之日起计算）</span>
                </div>
              </div>

              <div class="form-item" v-if="pointsConfig.validityType === 'yearly'">
                <label class="form-label required">清零日期</label>
                <div class="form-control-row">
                  <span>每年</span>
                  <input
                    type="text"
                    class="form-input"
                    style="width: 80px"
                    v-model="pointsConfig.yearlyClearDate"
                    placeholder="12-31"
                  />
                  <span>统一清零上一年度积分</span>
                </div>
              </div>

              </template>
              <div class="form-actions">
                <button class="btn btn-primary" @click="savePointsConfig">保存</button>
                <button class="btn btn-default" style="margin-left: 8px" @click="cancelEditConfig">取消</button>
              </div>
            </template>

            <!-- View 3: 已开启只读模式 -->
            <template v-if="pointsConfig.enabled && configSaved && !editingConfig">
              <div class="form-item">
                <label class="form-label">积分名称</label>
                <div class="form-control-row">
                  <span class="display-value">{{ pointsConfig.name }}</span>
                </div>
              </div>

              <div class="form-item">
                <label class="form-label">编码</label>
                <div class="form-control-row">
                  <span class="display-value">{{ pointsConfig.code }}</span>
                </div>
              </div>

              <div class="form-divider"></div>

              <div class="form-item">
                <label class="form-label">积分汇率</label>
                <div class="form-control-row">
                  <span class="display-value">{{ pointsConfig.exchangeRate }} 积分 = 1 元</span>
                </div>
              </div>

              <div class="form-divider"></div>

              <div class="form-item">
                <label class="form-label">有效期策略</label>
                <div class="form-control-row">
                  <span class="display-value">{{ validityTypeText }}</span>
                </div>
              </div>

              <div class="form-actions">
                <button class="btn btn-primary" @click="startEditConfig">修改</button>
              </div>
            </template>

          </div>

          <!-- 修改记录 -->
          <div class="history-section">
            <div
              class="history-header"
              @click="configHistorySectionOpen = !configHistorySectionOpen"
            >
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
                        <a class="action-link primary" @click="toggleConfigHistory(record.id)">
                          {{ configHistoryExpandedId === record.id ? '收起' : '展开' }}
                        </a>
                      </td>
                    </tr>
                    <tr v-show="configHistoryExpandedId === record.id" class="snapshot-row">
                      <td colspan="4" style="padding: 0">
                        <div class="snapshot-detail">
                          <div class="snapshot-header">完整配置快照（只读）</div>
                          <div class="snapshot-grid">
                            <div class="snapshot-field">
                              <span class="snapshot-label">积分名称</span>
                              <span class="snapshot-value">{{ record.snapshot.name }}</span>
                            </div>
                            <div class="snapshot-field">
                              <span class="snapshot-label">编码</span>
                              <span class="snapshot-value">{{ record.snapshot.code }}</span>
                            </div>
                            <div class="snapshot-field">
                              <span class="snapshot-label">价值比例</span>
                              <span class="snapshot-value">{{ record.snapshot.exchangeRate }}:1</span>
                            </div>
                            <div class="snapshot-field">
                              <span class="snapshot-label">有效期策略</span>
                              <span class="snapshot-value">
                                {{
                                  record.snapshot.validityType === 'forever'
                                    ? '永久有效'
                                    : record.snapshot.validityType === 'dynamic'
                                      ? '动态有效期（' + record.snapshot.dynamicDays + '天）'
                                      : '自然年清零（每年' + record.snapshot.yearlyClearDate + '）'
                                }}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </template>
                  <tr v-if="configHistoryList.length === 0">
                    <td colspan="4" class="empty-text">暂无修改记录</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <!-- ===== 模块2：积分批次 ===== -->
      <div v-if="activeMenu === 'points_batch'" class="content-panel">
        <div class="panel-header">
          <h2>积分批次</h2>
          <button class="btn btn-primary" @click="openBatchModal">+ 新建批次</button>
        </div>
        <div class="panel-body">
          <div class="filter-bar">
            <div class="filter-item">
              <label>商户名称</label>
              <input
                type="text"
                class="form-input"
                v-model="batchFilter.merchantName"
                placeholder="输入商户名称"
                style="width: 160px"
              />
            </div>
            <div class="filter-item">
              <label>状态</label>
              <select class="form-select" v-model="batchFilter.status" style="width: 120px">
                <option v-for="opt in batchStatusOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th>批次编号</th>
                <th>所属商户</th>
                <th>批次名称</th>
                <th>已发放</th>
                <th>有效期策略</th>
                <th>状态</th>
                <th>创建时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="batch in batchFilteredList" :key="batch.id">
                <td>{{ batch.batchNo }}</td>
                <td>{{ batch.merchantName }}</td>
                <td>{{ batch.batchName }}</td>
                <td>{{ batch.issuedPoints.toLocaleString() }}</td>
                <td>
                  <span v-if="batch.validityType === 'inherit'" class="form-tip">继承全局</span>
                  <span v-else-if="batch.validityType === 'forever'">永久有效</span>
                  <span v-else-if="batch.validityType === 'dynamic'"
                    >{{ batch.validDays }}天后过期</span
                  >
                  <span v-else-if="batch.validityType === 'yearly'"
                    >每年{{ batch.yearlyClearDate }}清零</span
                  >
                </td>
                <td>
                  <span class="status-tag" :class="batch.status">
                    {{ batch.status === 'active' ? '启用' : '已停用' }}
                  </span>
                </td>
                <td>{{ batch.createTime }}</td>
                <td>
                  <a class="action-link primary" @click="openBatchLedger(batch)">流水明细</a>
                  <a class="action-link" @click="toggleBatchStatus(batch)" style="margin-left: 8px">
                    {{
                      batch.status === 'active' ? '停用' : batch.status === 'disabled' ? '启用' : ''
                    }}
                  </a>
                  <a
                    class="action-link danger"
                    v-if="batch.issuedPoints === 0"
                    @click="deleteBatch(batch)"
                    style="margin-left: 8px"
                    >删除</a
                  >
                </td>
              </tr>
              <tr v-if="batchFilteredList.length === 0">
                <td colspan="8" class="empty-text">暂无批次数据</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 新建批次弹窗 -->
        <div class="modal-overlay" v-if="showBatchModal" @click="closeBatchModal">
          <div class="modal-content" @click.stop>
            <div class="modal-header">
              <h3>新建积分批次</h3>
              <button class="close-btn" @click="closeBatchModal">✕</button>
            </div>
            <div class="modal-body">
              <div class="form-item">
                <label class="form-label required">所属商户</label>
                <select class="form-select" v-model="batchForm.merchantName" style="width: 100%">
                  <option value="">请选择商户</option>
                  <option v-for="m in merchantOptions" :key="m" :value="m">{{ m }}</option>
                </select>
              </div>
              <div class="form-item">
                <label class="form-label required">批次名称</label>
                <input
                  type="text"
                  class="form-input"
                  v-model="batchForm.batchName"
                  placeholder="如：2026年Q2季度额度"
                  style="width: 100%"
                />
              </div>
              <div class="form-divider"></div>

              <div class="form-item">
                <label class="form-label">有效期策略</label>
                <select class="form-select" v-model="batchForm.validityType" style="width: 100%">
                  <option value="inherit">继承全局配置</option>
                  <option value="forever">永久有效</option>
                  <option value="dynamic">动态有效期</option>
                  <option value="yearly">自然年清零</option>
                </select>
                <span class="form-tip">默认继承全局积分配置，也可单独覆盖</span>
              </div>

              <div class="form-item" v-if="batchForm.validityType === 'dynamic'">
                <label class="form-label required">有效期天数</label>
                <input
                  type="number"
                  class="form-input"
                  v-model.number="batchForm.validDays"
                  min="1"
                  placeholder="自用户获得积分之日起"
                  style="width: 100%"
                />
              </div>

              <div class="form-item" v-if="batchForm.validityType === 'yearly'">
                <label class="form-label required">清零日期</label>
                <input
                  type="text"
                  class="form-input"
                  v-model="batchForm.yearlyClearDate"
                  placeholder="12-31"
                  style="width: 100%"
                />
              </div>

              <div class="form-item">
                <label class="form-label">备注</label>
                <textarea
                  class="form-textarea"
                  v-model="batchForm.remark"
                  rows="2"
                  placeholder="内部备注"
                  style="width: 100%"
                ></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-default" @click="closeBatchModal">取消</button>
              <button class="btn btn-primary" @click="submitBatch">确认创建</button>
            </div>
          </div>
        </div>

        <!-- 批次流水明细弹窗 -->
        <div
          class="modal-overlay"
          v-if="showBatchLedgerModal"
          @click="showBatchLedgerModal = false"
        >
          <div class="modal-content" style="width: 750px" @click.stop>
            <div class="modal-header">
              <h3>批次流水明细 - {{ currentBatchLedger?.batchName }}</h3>
              <button class="close-btn" @click="showBatchLedgerModal = false">✕</button>
            </div>
            <div class="modal-body">
              <div
                style="margin-bottom: 16px; display: flex; gap: 16px; color: #666; font-size: 13px"
              >
                <span>批次编号：{{ currentBatchLedger?.batchNo }}</span>
                <span>所属商户：{{ currentBatchLedger?.merchantName }}</span>
                <span
                  >已发放：<strong>{{
                    currentBatchLedger?.issuedPoints?.toLocaleString()
                  }}</strong></span
                >
              </div>
              <div class="tab-bar" style="margin-bottom: 16px">
                <button
                  class="tab-btn"
                  :class="{ active: batchLedgerTab === 'issue' }"
                  @click="batchLedgerTab = 'issue'"
                >
                  发放流水
                </button>
                <button
                  class="tab-btn"
                  :class="{ active: batchLedgerTab === 'consume' }"
                  @click="batchLedgerTab = 'consume'"
                >
                  消耗流水
                </button>
              </div>
              <table class="data-table" v-if="batchLedgerTab === 'issue'">
                <thead>
                  <tr>
                    <th>流水编号</th>
                    <th>用户UID</th>
                    <th>手机号</th>
                    <th>发放数量</th>
                    <th>变动后余额</th>
                    <th>发放原因</th>
                    <th>原因备注</th>
                    <th>操作人</th>
                    <th>发放时间</th>
                    <th>过期时间</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="rec in mockIssueRecords" :key="rec.id">
                    <td>{{ rec.id }}</td>
                    <td>{{ rec.userUid }}</td>
                    <td>{{ rec.userPhone }}</td>
                    <td style="color: #52c41a">+{{ rec.amount.toLocaleString() }}</td>
                    <td>{{ rec.balance.toLocaleString() }}</td>
                    <td>{{ getReasonTypeText(rec.reason) }}</td>
                    <td>{{ rec.reasonDetail || '-' }}</td>
                    <td>{{ rec.operator }}</td>
                    <td>{{ rec.time }}</td>
                    <td>{{ rec.expireTime || '-' }}</td>
                  </tr>
                </tbody>
              </table>
              <table class="data-table" v-if="batchLedgerTab === 'consume'">
                <thead>
                  <tr>
                    <th>流水编号</th>
                    <th>用户UID</th>
                    <th>手机号</th>
                    <th>消耗数量</th>
                    <th>变动后余额</th>
                    <th>消耗原因</th>
                    <th>原因备注</th>
                    <th>关联订单</th>
                    <th>操作人</th>
                    <th>消耗时间</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="rec in mockConsumeRecords" :key="rec.id">
                    <td>{{ rec.id }}</td>
                    <td>{{ rec.userUid }}</td>
                    <td>{{ rec.userPhone }}</td>
                    <td style="color: #ff4d4f">{{ rec.amount }}</td>
                    <td>{{ rec.balance.toLocaleString() }}</td>
                    <td>{{ getReasonTypeText(rec.reason) }}</td>
                    <td>{{ rec.reasonDetail || '-' }}</td>
                    <td>{{ rec.orderNo || '-' }}</td>
                    <td>{{ rec.operator }}</td>
                    <td>{{ rec.time }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== 模块3：商户签约 ===== -->
      <div v-if="activeMenu === 'merchant_sign'" class="content-panel">
        <div class="panel-header">
          <h2>商户签约</h2>
          <button class="btn btn-primary" @click="openSignModal()">+ 新增签约</button>
        </div>
        <div class="panel-body">
          <div class="filter-bar">
            <div class="filter-item">
              <label>商户名称</label>
              <input
                type="text"
                class="form-input"
                v-model="signFilter.merchantName"
                placeholder="输入商户名称"
                style="width: 160px"
              />
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
                <th>签约状态</th>
                <th>当前额度</th>
                <th>签约时间</th>
                <th>解约时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in filteredSignList" :key="item.id">
                <td>{{ item.merchantName }}</td>
                <td>
                    {{
                      item.status === 'signed' ? '已签约' : '已解约'
                    }}
                </td>
                <td>{{ item.currentQuota.toLocaleString() }}</td>
                <td>{{ item.signTime || '-' }}</td>
                <td>{{ item.terminateTime || '-' }}</td>
                <td>
                  <a class="action-link primary" @click="openMerchantLedger(item)">查看流水</a>
                  <a class="action-link" @click="openSignModal(item)" style="margin-left: 8px"
                    >编辑</a
                  >
                  <a
                    class="action-link danger"
                    v-if="item.status === 'signed'"
                    @click="terminateSign(item)"
                    style="margin-left: 8px"
                    >解约</a
                  >
                </td>
              </tr>
              <tr v-if="filteredSignList.length === 0">
                <td colspan="6" class="empty-text">暂无签约数据</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 新增/编辑签约弹窗 -->
        <div class="modal-overlay" v-if="showSignModal" @click="closeSignModal">
          <div class="modal-content" @click.stop>
            <div class="modal-header">
              <h3>{{ isEditSign ? '编辑签约' : '新增签约' }}</h3>
              <button class="close-btn" @click="closeSignModal">✕</button>
            </div>
            <div class="modal-body">
              <div class="form-item">
                <label class="form-label required">商户</label>
                <select
                  class="form-select"
                  v-model="signForm.merchantName"
                  :disabled="isEditSign"
                  style="width: 100%"
                >
                  <option value="">请选择商户</option>
                  <option v-for="m in merchantOptions" :key="m" :value="m">{{ m }}</option>
                </select>
              </div>
              <div class="form-item">
                <label class="form-label">签约协议</label>
                <button class="btn btn-default" style="width: auto; height: 32px; font-size: 13px">
                  上传协议扫描件
                </button>
              </div>
              <div class="form-item">
                <label class="form-label">备注</label>
                <textarea
                  class="form-textarea"
                  v-model="signForm.remark"
                  rows="2"
                  placeholder="备注信息"
                  style="width: 100%"
                ></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-default" @click="closeSignModal">取消</button>
              <button class="btn btn-primary" @click="submitSign">
                {{ isEditSign ? '保存' : '确认签约' }}
              </button>
            </div>
          </div>
        </div>

        <!-- 商户流水弹窗 -->
        <div
          class="modal-overlay"
          v-if="showMerchantLedgerModal"
          @click="showMerchantLedgerModal = false"
        >
          <div class="modal-content modal-auto-wide" @click.stop>
            <div class="modal-header">
              <h3>商户流水明细</h3>
              <button class="close-btn" @click="showMerchantLedgerModal = false">
                <svg class="modal-close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>
              </button>
            </div>
            <div class="modal-body">
              <!-- 商户概要 -->
              <div class="merchant-summary">
                <div class="summary-row">
                  <span class="summary-item"><span class="summary-label">商户名称：</span>{{ currentMerchantLedger?.merchantName }}</span>
                  <span class="summary-item"><span class="summary-label">已发放：</span><span class="summary-value">{{ merchantTotalIssued.toLocaleString() }}</span></span>
                  <span class="summary-item"><span class="summary-label">已消耗：</span><span class="summary-value">{{ merchantTotalConsumed.toLocaleString() }}</span></span>
                  <span class="summary-item"><span class="summary-label">剩余额度：</span><span class="summary-value">{{ merchantRemainingQuota.toLocaleString() }}</span></span>
                </div>
                <button class="btn btn-primary btn-sm summary-export-btn">导出账单</button>
              </div>

              <!-- Tab 切换 -->
              <div class="tab-bar">
                <button
                  class="tab-btn"
                  :class="{ active: merchantLedgerTab === 'issue' }"
                  @click="merchantLedgerTab = 'issue'"
                >
                  发放流水
                </button>
                <button
                  class="tab-btn"
                  :class="{ active: merchantLedgerTab === 'consume' }"
                  @click="merchantLedgerTab = 'consume'"
                >
                  消耗流水
                </button>
              </div>

              <!-- 发放流水表格 -->
              <table class="data-table table-nowrap" v-if="merchantLedgerTab === 'issue'">
                <thead>
                  <tr>
                    <th>流水编号</th>
                    <th>用户id</th>
                    <th>手机号</th>
                    <th class="cell-wrap">所属批次</th>
                    <th>发放数量</th>
                    <th>发放原因</th>
                    <th class="cell-wrap">原因备注</th>
                    <th>关联订单号</th>
                    <th>操作人</th>
                    <th>发放时间</th>
                    <th>过期时间</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="r in merchantIssueRecords" :key="r.id">
                    <td>{{ r.id }}</td>
                    <td>{{ r.userUid }}</td>
                    <td>{{ r.userPhone }}</td>
                    <td class="cell-wrap">{{ r.batch }}</td>
                    <td class="amount-positive">+{{ r.amount.toLocaleString() }}</td>
                    <td>{{ getReasonTypeText(r.reason) }}</td>
                    <td class="cell-wrap">{{ r.reasonDetail || '-' }}</td>
                    <td>{{ r.orderNo || '-' }}</td>
                    <td>{{ r.operator }}</td>
                    <td class="time-text">{{ r.time }}</td>
                    <td>{{ r.expireTime || '-' }}</td>
                  </tr>
                  <tr v-if="merchantIssueRecords.length === 0">
                    <td colspan="11" class="empty-text">暂无发放记录</td>
                  </tr>
                </tbody>
              </table>

              <!-- 消耗流水表格 -->
              <table class="data-table table-nowrap" v-if="merchantLedgerTab === 'consume'">
                <thead>
                  <tr>
                    <th>流水编号</th>
                    <th>用户id</th>
                    <th>手机号</th>
                    <th class="cell-wrap">所属批次</th>
                    <th>消耗数量</th>
                    <th>消耗原因</th>
                    <th class="cell-wrap">原因备注</th>
                    <th>关联订单号</th>
                    <th>操作人</th>
                    <th>发生时间</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="r in merchantConsumeRecords" :key="r.id">
                    <td>{{ r.id }}</td>
                    <td>{{ r.userUid }}</td>
                    <td>{{ r.userPhone }}</td>
                    <td class="cell-wrap">{{ r.batch || '-' }}</td>
                    <td class="amount-negative">{{ Math.abs(r.amount).toLocaleString() }}</td>
                    <td>{{ getReasonTypeText(r.reason) }}</td>
                    <td class="cell-wrap">{{ r.reasonDetail || '-' }}</td>
                    <td>{{ r.orderNo || '-' }}</td>
                    <td>{{ r.operator }}</td>
                    <td class="time-text">{{ r.time }}</td>
                  </tr>
                  <tr v-if="merchantConsumeRecords.length === 0">
                    <td colspan="10" class="empty-text">暂无消耗记录</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== 模块4：额度管理 ===== -->
      <div v-if="activeMenu === 'quota_manage'" class="content-panel">
        <div class="panel-header">
          <h2>额度管理</h2>
          <button class="btn btn-primary" @click="openQuotaModal()">+ 新增</button>
        </div>
        <div class="panel-body">
          <div class="filter-bar">
            <div class="filter-item">
              <label>商户名称</label>
              <input
                type="text"
                class="form-input"
                v-model="quotaFilter.merchantName"
                placeholder="输入商户名称"
                style="width: 140px"
              />
            </div>
            <div class="filter-item">
              <label>操作</label>
              <select class="form-select" v-model="quotaFilter.action" style="width: 100px">
                <option v-for="opt in quotaActionOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>
            <div class="filter-item">
              <label>额度变更状态</label>
              <select class="form-select" v-model="quotaFilter.changeStatus" style="width: 110px">
                <option v-for="opt in quotaChangeOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th>记录编号</th>
                <th>商户名称</th>
                <th>操作</th>
                <th>充值类型</th>
                <th>来源</th>
                <th>变动数值</th>
                <th>付款方式</th>
                <th>金额（元）</th>
                <th>支付状态</th>
                <th>额度变更状态</th>
                <th>操作人</th>
                <th>操作时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in filteredQuotaList" :key="item.id">
                <td>{{ item.recordNo }}</td>
                <td>{{ item.merchantName }}</td>
                <td>{{ getActionText(item.action) }}</td>
                <td>
                  {{ item.action === 'recharge' ? getRechargeTypeText(item.rechargeType) : '-' }}
                </td>
                <td>{{ getSourceText(item.source) }}</td>
                <td :class="item.action === 'recycle' ? 'text-danger' : 'text-success'">
                  {{ item.action === 'recycle' ? '-' : '+' }}{{ item.amount.toLocaleString() }}
                </td>
                <td>{{ item.payMethod ? getPayMethodText(item.payMethod) : '-' }}</td>
                <td>{{ item.payAmount ? '¥' + item.payAmount.toLocaleString() : '-' }}</td>
                <td>
                  <span class="status-tag" :class="item.payStatus" v-if="item.payStatus">
                    {{ getPayStatusText(item.payStatus) }}
                  </span>
                  <span v-else>-</span>
                </td>
                <td>
                  <span class="status-tag" :class="item.changeStatus">
                    {{ getChangeStatusText(item.changeStatus) }}
                  </span>
                </td>
                <td>{{ item.operator }}</td>
                <td>{{ item.operateTime }}</td>
                <td>
                  <a
                    v-if="item.payStatus === 'unpaid' || item.changeStatus === 'pending'"
                    class="action-link primary"
                    @click="openFinanceModal(item)"
                    >财务确认</a
                  >
                  <span v-else class="text-muted">-</span>
                </td>
              </tr>
              <tr v-if="filteredQuotaList.length === 0">
                <td colspan="13" class="empty-text">暂无额度记录</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 平台新增弹窗 -->
        <div class="modal-overlay" v-if="showQuotaModal" @click="closeQuotaModal">
          <div class="modal-content" @click.stop>
            <div class="modal-header">
              <h3>平台新增额度</h3>
              <button class="close-btn" @click="closeQuotaModal">✕</button>
            </div>
            <div class="modal-body">
              <div class="form-item">
                <label class="form-label required">商户</label>
                <select class="form-select" v-model="quotaForm.merchantName" style="width: 100%">
                  <option value="">请选择已签约商户</option>
                  <option v-for="m in merchantOptions" :key="m" :value="m">{{ m }}</option>
                </select>
              </div>
              <div class="form-item">
                <label class="form-label required">操作</label>
                <select class="form-select" v-model="quotaForm.action" style="width: 100%">
                  <option value="recharge">充值</option>
                  <option value="recycle">回收</option>
                </select>
              </div>

              <template v-if="quotaForm.action === 'recharge'">
                <div class="form-item">
                  <label class="form-label required">充值类型</label>
                  <div class="radio-group">
                    <label class="radio-label">
                      <input type="radio" v-model="quotaForm.rechargeType" value="buy" /> 购买
                    </label>
                    <label class="radio-label">
                      <input type="radio" v-model="quotaForm.rechargeType" value="gift" /> 赠送
                    </label>
                  </div>
                </div>
              </template>

              <div class="form-item">
                <label class="form-label required">变动数值（积分）</label>
                <input
                  type="number"
                  class="form-input"
                  v-model.number="quotaForm.amount"
                  min="1"
                  placeholder="请输入积分数量"
                  style="width: 100%"
                />
              </div>

              <template v-if="quotaForm.action === 'recharge' && quotaForm.rechargeType === 'buy'">
                <div class="form-divider"></div>
                <div class="form-item">
                  <label class="form-label required">付款方式</label>
                  <div class="radio-group">
                    <label class="radio-label">
                      <input type="radio" v-model="quotaForm.payMethod" value="cash" /> 现金
                    </label>
                    <label class="radio-label">
                      <input type="radio" v-model="quotaForm.payMethod" value="transfer" /> 转账
                    </label>
                  </div>
                </div>
                <div class="form-item">
                  <label class="form-label">金额（元）</label>
                  <div
                    class="form-input"
                    style="
                      background: #f5f5f5;
                      width: 100%;
                      padding: 8px 12px;
                      border-radius: 4px;
                      color: #ff4d4f;
                      font-weight: 600;
                    "
                  >
                    ¥{{ autoPayAmount !== null ? autoPayAmount.toLocaleString() : '0' }}
                  </div>
                  <div style="font-size: 12px; color: #999; margin-top: 4px">
                    按汇率 {{ exchangeRate }}:1 自动换算
                  </div>
                </div>
              </template>

              <div class="form-item">
                <label class="form-label required">备注</label>
                <textarea
                  class="form-textarea"
                  v-model="quotaForm.remark"
                  rows="2"
                  placeholder="请说明操作原因"
                  style="width: 100%"
                ></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-default" @click="closeQuotaModal">取消</button>
              <button class="btn btn-primary" @click="submitQuota">生成流水</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 财务确认弹窗 -->
      <div class="modal-overlay" v-if="showFinanceModal" @click="closeFinanceModal">
        <div class="modal-content" style="width: 460px" @click.stop>
          <div class="modal-header">
            <h3>财务确认</h3>
            <button class="close-btn" @click="closeFinanceModal">✕</button>
          </div>
          <div class="modal-body">
            <div style="font-size: 14px; color: #666; margin-bottom: 16px">
              商户：<strong>{{ financeTarget?.merchantName }}</strong
              >&nbsp;&nbsp; 操作：<strong>{{
                financeTarget ? getActionText(financeTarget.action) : ''
              }}</strong
              >&nbsp;&nbsp;
              {{
                financeTarget?.action === 'recharge'
                  ? financeTarget
                    ? getRechargeTypeText(financeTarget.rechargeType)
                    : ''
                  : ''
              }}
            </div>

            <!-- 支付状态 -->
            <div class="form-item" v-if="financeTarget?.payStatus !== ''">
              <label class="form-label">支付状态</label>
              <div class="radio-group">
                <label
                  class="radio-label"
                  :class="{ 'radio-disabled': financeTarget?.payStatus === 'paid' }"
                >
                  <input
                    type="radio"
                    v-model="financePayStatus"
                    value="unpaid"
                    :disabled="financeTarget?.payStatus === 'paid'"
                  />
                  待支付
                </label>
                <label
                  class="radio-label"
                  :class="{ 'radio-disabled': financeTarget?.payStatus === 'paid' }"
                >
                  <input
                    type="radio"
                    v-model="financePayStatus"
                    value="paid"
                    :disabled="financeTarget?.payStatus === 'paid'"
                  />
                  已支付
                </label>
                <span
                  v-if="financeTarget?.payStatus === 'paid'"
                  style="font-size: 12px; color: #52c41a; margin-left: 4px"
                  >（不可逆）</span
                >
              </div>
            </div>

            <div class="form-divider"></div>

            <!-- 额度变更确认 -->
            <div class="form-item">
              <label class="form-label">是否确认变更</label>
              <div v-if="financeTarget?.changeStatus === 'pending'" class="radio-group">
                <label class="radio-label">
                  <input type="radio" v-model="financeChangeAction" value="completed" /> 确认变更
                </label>
                <label class="radio-label">
                  <input type="radio" v-model="financeChangeAction" value="rejected" /> 拒绝变更
                </label>
              </div>
              <div v-else style="font-size: 13px; color: #999">
                {{ financeTarget ? getChangeStatusText(financeTarget.changeStatus) : '' }}（不可逆）
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-default" @click="closeFinanceModal">取消</button>
            <button class="btn btn-primary" @click="saveFinance">保存</button>
          </div>
        </div>
      </div>

      <!-- ===== 模块5：用户余额 ===== -->
      <div v-if="activeMenu === 'user_balance'" class="content-panel">
        <div class="panel-header">
          <h2>用户余额</h2>
        </div>
        <div class="panel-body">
          <div class="filter-bar">
            <div class="filter-item">
              <label>搜索</label>
              <input
                type="text"
                class="form-input"
                v-model="userBalanceFilter.keyword"
                placeholder="输入UID或手机号搜索"
                style="width: 200px"
              />
            </div>
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th>UID</th>
                <th>手机号</th>
                <th>当前积分</th>
                <th>即将过期</th>
                <th>累计发放</th>
                <th>累计消耗</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in filteredUserBalanceList" :key="user.uid">
                <td>{{ user.uid }}</td>
                <td>{{ user.phone }}</td>
                <td>
                  <strong style="color: #1677ff">{{ user.currentPoints.toLocaleString() }}</strong>
                </td>
                <td :class="{ 'text-danger': user.expiringPoints > 0 }">
                  {{ user.expiringPoints > 0 ? user.expiringPoints.toLocaleString() : '-' }}
                </td>
                <td>{{ user.totalEarned.toLocaleString() }}</td>
                <td>{{ user.totalBurned.toLocaleString() }}</td>
                <td>
                  <a class="action-link primary" @click="openUserLedger(user)">明细</a>
                  <a
                    class="action-link"
                    style="margin-left: 8px; color: #0E7B3A"
                    @click="openDistributeModal(user)"
                    >变更</a
                  >
                </td>
              </tr>
              <tr v-if="filteredUserBalanceList.length === 0">
                <td colspan="7" class="empty-text">暂无用户数据</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ===== 模块6：积分变更流水 ===== -->
      <div v-if="activeMenu === 'points_distribute'" class="content-panel">
        <div class="panel-header">
          <h2>积分变更流水</h2>
          <button class="btn btn-primary" style="width: auto" @click="openDistributeModal()">
            + 手动变更
          </button>
        </div>
        <div class="panel-body">
          <div class="filter-bar" style="flex-wrap: wrap">
            <div class="filter-item">
              <label>搜索</label>
              <input
                type="text"
                class="form-input"
                v-model="distributeFilter.keyword"
                placeholder="输入UID或手机号"
                style="width: 150px"
              />
            </div>
            <div class="filter-item">
              <label>变更类型</label>
              <select class="form-select" v-model="distributeFilter.changeType" style="width: 100px">
                <option value="">全部</option>
                <option value="issue">发放</option>
                <option value="deduct">扣除</option>
              </select>
            </div>
            <div class="filter-item">
              <label>来源商户</label>
              <input
                type="text"
                class="form-input"
                v-model="distributeFilter.merchant"
                placeholder="输入商户名"
                style="width: 130px"
              />
            </div>
            <div class="filter-item">
              <label>发生时间</label>
              <input
                type="date"
                class="form-input"
                v-model="distributeFilter.startDate"
                style="width: 130px"
              />
              <span>至</span>
              <input
                type="date"
                class="form-input"
                v-model="distributeFilter.endDate"
                style="width: 130px"
              />
            </div>
          </div>
          <table class="data-table table-nowrap">
              <thead>
                <tr>
                  <th>流水编号</th>
                  <th>用户id</th>
                  <th>手机号</th>
                  <th>类型</th>
                  <th>原因</th>
                  <th class="cell-wrap">原因备注</th>
                  <th>变动数值</th>
                  <th>变动后余额</th>
                  <th>来源商户</th>
                  <th class="cell-wrap">关联批次</th>
                  <th>关联订单号</th>
                  <th>发生时间</th>
                  <th>过期时间</th>
                  <th>操作人</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in filteredDistributeList" :key="item.id">
                  <td>{{ item.id }}</td>
                  <td>{{ item.userUid }}</td>
                  <td>{{ item.userPhone }}</td>
                  <td>{{ getLedgerTypeText(item.type) }}</td>
                  <td>{{ getReasonTypeText(item.reason) }}</td>
                  <td class="cell-wrap">{{ item.reasonDetail || '-' }}</td>
                  <td :class="item.amount > 0 ? 'amount-positive' : 'amount-negative'">
                    {{ item.amount > 0 ? '+' : '' }}{{ item.amount.toLocaleString() }}
                  </td>
                  <td>{{ item.balance.toLocaleString() }}</td>
                  <td>{{ item.merchant || '-' }}</td>
                  <td class="cell-wrap">{{ item.batch || '-' }}</td>
                  <td>{{ item.orderNo || '-' }}</td>
                  <td class="time-text">{{ item.time }}</td>
                  <td>{{ item.expireTime || '-' }}</td>
                  <td>{{ item.operator }}</td>
                </tr>
                <tr v-if="filteredDistributeList.length === 0">
                  <td colspan="14" class="empty-text">暂无变更记录</td>
                </tr>
              </tbody>
            </table>
          <div class="pagination-bar">
            <span class="page-info">共 {{ filteredDistributeList.length }} 条记录</span>
          </div>
        </div>
      </div>

      <!-- ===== 模块8：商户结算 ===== -->
      <div v-if="activeMenu === 'merchant_settlement'" class="content-panel">
        <div class="panel-header">
          <h2>商户结算</h2>
          <div style="display: flex; gap: 12px; align-items: center">
            <input type="month" class="form-input" v-model="settlementMonth" style="width: 160px" />
            <button class="btn btn-primary" style="width: auto" @click="generateSettlement">
              生成结算单
            </button>
          </div>
        </div>
        <div class="panel-body">
          <table class="data-table">
            <thead>
              <tr>
                <th>结算单编号</th>
                <th>结算周期</th>
                <th>商户名称</th>
                <th>本期发行</th>
                <th>发行成本</th>
                <th>本期抵扣</th>
                <th>抵扣价值</th>
                <th>应结算金额</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in settlementList" :key="item.id">
                <td>{{ item.settleNo }}</td>
                <td>{{ item.period }}</td>
                <td>{{ item.merchantName }}</td>
                <td>{{ item.issuedPoints.toLocaleString() }}</td>
                <td>¥{{ item.issuedCost.toLocaleString() }}</td>
                <td>{{ item.deductedPoints.toLocaleString() }}</td>
                <td>¥{{ item.deductedValue.toLocaleString() }}</td>
                <td :class="item.settleAmount >= 0 ? 'text-success' : 'text-danger'">
                  ¥{{ item.settleAmount.toLocaleString() }}
                </td>
                <td>
                  <span class="status-tag" :class="item.status">
                    {{
                      item.status === 'pending'
                        ? '待确认'
                        : item.status === 'confirmed'
                          ? '已确认'
                          : item.status === 'paid'
                            ? '已打款'
                            : '有争议'
                    }}
                  </span>
                </td>
                <td>
                  <a
                    class="action-link"
                    v-if="item.status === 'pending'"
                    @click="confirmSettlement(item)"
                    >确认</a
                  >
                  <a class="action-link" v-if="item.status === 'confirmed'" @click="markPaid(item)"
                    >标记已打款</a
                  >
                  <a
                    class="action-link warning"
                    v-if="item.status === 'pending' || item.status === 'confirmed'"
                    @click="disputeSettlement(item)"
                    style="margin-left: 8px"
                    >争议</a
                  >
                  <span
                    v-if="item.status === 'paid' || item.status === 'disputed'"
                    class="text-muted"
                    >-</span
                  >
                </td>
              </tr>
              <tr v-if="settlementList.length === 0">
                <td colspan="10" class="empty-text">暂无结算数据</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ===== 模块9：对账报表 ===== -->
      <div v-if="activeMenu === 'reconciliation'" class="content-panel">
        <div class="panel-header">
          <h2>对账报表</h2>
          <select class="form-select" v-model="reportDateRange" style="width: 140px">
            <option value="6m">近6个月</option>
            <option value="1y">近1年</option>
          </select>
        </div>
        <div class="panel-body">
          <h3 class="section-title">平台积分总览</h3>
          <div class="overview-cards">
            <div class="overview-card">
              <div class="card-value">{{ platformOverview.totalIssued.toLocaleString() }}</div>
              <div class="card-label">累计发行积分</div>
            </div>
            <div class="overview-card">
              <div class="card-value">{{ platformOverview.totalBurned.toLocaleString() }}</div>
              <div class="card-label">累计消耗积分</div>
            </div>
            <div class="overview-card">
              <div class="card-value" style="color: #1677ff">
                {{ platformOverview.currentActive.toLocaleString() }}
              </div>
              <div class="card-label">当前沉淀积分</div>
            </div>
            <div class="overview-card">
              <div class="card-value">{{ platformOverview.burnRate }}%</div>
              <div class="card-label">积分消耗率</div>
            </div>
            <div class="overview-card">
              <div class="card-value" style="color: #ff4d4f">
                {{ platformOverview.expiringSoon.toLocaleString() }}
              </div>
              <div class="card-label">即将过期积分（30天内）</div>
            </div>
            <div class="overview-card">
              <div class="card-value">{{ platformOverview.activeUsers.toLocaleString() }}</div>
              <div class="card-label">积分活跃用户</div>
            </div>
          </div>

          <h3 class="section-title" style="margin-top: 32px">近6个月积分趋势</h3>
          <div class="chart-container">
            <div class="bar-chart">
              <div class="chart-bars">
                <div class="bar-group" v-for="(month, idx) in trendMonths" :key="month">
                  <div class="bar-wrapper">
                    <div
                      class="bar issued"
                      :style="{ height: getBarHeight(trendIssued[idx] ?? 0) + 'px' }"
                      :title="'发行: ' + (trendIssued[idx] ?? 0).toLocaleString()"
                    ></div>
                    <div
                      class="bar burned"
                      :style="{ height: getBarHeight(trendBurned[idx] ?? 0) + 'px' }"
                      :title="'消耗: ' + (trendBurned[idx] ?? 0).toLocaleString()"
                    ></div>
                  </div>
                  <div class="bar-label">{{ month }}</div>
                </div>
              </div>
              <div class="chart-legend">
                <span><span class="legend-dot issued"></span>发行积分</span>
                <span><span class="legend-dot burned"></span>消耗积分</span>
              </div>
            </div>
          </div>

          <h3 class="section-title" style="margin-top: 32px">商户维度统计</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th>商户名称</th>
                <th>发行积分</th>
                <th>抵扣积分</th>
                <th>活跃积分</th>
                <th>发行成本（元）</th>
                <th>补贴金额（元）</th>
                <th>净结算（元）</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in merchantStats" :key="item.merchantName">
                <td>{{ item.merchantName }}</td>
                <td>{{ item.issued.toLocaleString() }}</td>
                <td>{{ item.deducted.toLocaleString() }}</td>
                <td>{{ item.active.toLocaleString() }}</td>
                <td>¥{{ item.cost.toLocaleString() }}</td>
                <td>¥{{ item.subsidy.toLocaleString() }}</td>
                <td :class="item.netSettle >= 0 ? 'text-success' : 'text-danger'">
                  ¥{{ item.netSettle.toLocaleString() }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ===== 全局弹窗：积分变更弹窗 ===== -->
    <div class="modal-overlay" v-if="showDistributeModal" @click="closeDistributeModal">
      <div class="modal-content modal-md" @click.stop>
        <div class="modal-header">
          <h3>变更</h3>
          <button class="close-btn" @click="closeDistributeModal">
            <svg class="modal-close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>
          </button>
        </div>
        <div class="modal-body">
          <div
            v-if="!distributeForm.selectedUser"
            style="display: flex; gap: 8px; margin-bottom: 12px"
          >
            <input
              type="text"
              class="form-input"
              v-model="distributeForm.userSearch"
              placeholder="输入手机号或UID搜索用户"
              style="flex: 1"
              @keyup.enter="searchDistributeUser"
            />
            <button
              class="btn btn-primary"
              style="width: auto; height: 32px"
              @click="searchDistributeUser"
            >
              搜索
            </button>
          </div>
          <div v-if="distributeForm.selectedUser" class="selected-user-card">
            <span
              >已选用户：<strong>{{ distributeForm.selectedUser.phone }}</strong
              >（当前积分：{{ distributeForm.selectedUser.currentPoints.toLocaleString() }}）</span
            >
          </div>
          <div class="form-item" v-if="distributeForm.selectedUser">
            <label class="form-label required">变更</label>
            <select class="form-select" v-model="distributeForm.changeType" style="flex: 1">
              <option value="issue">发放</option>
              <option value="deduct">扣除</option>
            </select>
          </div>
          <div class="form-item" v-if="distributeForm.selectedUser && distributeForm.changeType === 'issue'">
            <label class="form-label required">所属批次</label>
            <select class="form-select" v-model="distributeForm.batchId" style="flex: 1">
              <option value="">请选择积分批次</option>
              <option v-for="b in availableBatches" :key="b.id" :value="b.id">
                {{ b.batchName }}（{{ b.merchantName }}）
              </option>
            </select>
          </div>
          <div class="form-item" v-if="distributeForm.selectedUser">
            <label class="form-label required">变更数量</label>
            <div class="form-control-row">
              <input
                type="number"
                class="form-input"
                style="width: 160px"
                v-model.number="distributeForm.amount"
                min="1"
                placeholder="请输入积分数量"
              />
              <span class="form-tip"
                >（变更后：<strong>{{ previewBalance.toLocaleString() }}</strong> 积分）</span
              >
            </div>
          </div>
          <div class="form-item" v-if="distributeForm.selectedUser">
            <label class="form-label required">原因备注</label>
            <div style="flex: 1">
              <select
                class="form-select"
                v-model="distributeForm.reasonType"
                style="width: 100%; margin-bottom: 8px"
              >
                <option
                  v-for="opt in changeReasonOptions"
                  :key="opt.value"
                  :value="opt.value"
                >
                  {{ opt.label }}
                </option>
              </select>
              <textarea
                v-if="distributeForm.reasonType === 'other'"
                class="form-textarea"
                v-model="distributeForm.reasonDetail"
                rows="2"
                placeholder="请补充详细描述"
                style="width: 100%"
              ></textarea>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-default" @click="closeDistributeModal">取消</button>
          <button
            class="btn btn-primary"
            :disabled="!distributeForm.selectedUser"
            @click="submitDistribute"
          >
            确认变更
          </button>
        </div>
      </div>
    </div>

    <!-- ===== 全局弹窗：商户充值财务确认弹窗 ===== -->
    <div class="modal-overlay" v-if="showFinanceModal" @click="closeFinanceModal">
      <div class="modal-content" style="width: 480px" @click.stop>
        <div class="modal-header">
          <h3>商户充值财务确认</h3>
          <button class="close-btn" @click="closeFinanceModal">✕</button>
        </div>
        <div class="modal-body">
          <div
            style="
              margin-bottom: 16px;
              padding: 12px;
              background: #fafafa;
              border-radius: 6px;
              font-size: 13px;
              line-height: 1.8;
            "
          >
            <div>商户：{{ financeTarget?.merchantName }}</div>
            <div>记录编号：{{ financeTarget?.recordNo }}</div>
            <div>操作：{{ getActionText(financeTarget?.action || '') }}</div>
            <div>变动数值：{{ financeTarget?.amount?.toLocaleString() }}</div>
            <div>
              付款方式：{{
                financeTarget?.payMethod ? getPayMethodText(financeTarget.payMethod) : '-'
              }}
            </div>
            <div v-if="financeTarget?.payAmount">
              金额：¥{{ financeTarget.payAmount.toLocaleString() }}
            </div>
          </div>
          <div
            class="form-item"
            v-if="financeTarget?.payStatus === 'unpaid'"
            style="flex-direction: column; gap: 8px"
          >
            <label class="form-label" style="width: 100%; text-align: left">支付状态</label>
            <select class="form-select" v-model="financePayStatus" style="width: 100%">
              <option value="unpaid">未支付</option>
              <option value="paid">已支付</option>
            </select>
          </div>
          <div
            class="form-item"
            v-if="financeTarget?.changeStatus === 'pending'"
            style="flex-direction: column; gap: 8px; margin-top: 12px"
          >
            <label class="form-label" style="width: 100%; text-align: left">变更确认</label>
            <select class="form-select" v-model="financeChangeAction" style="width: 100%">
              <option value="">请选择</option>
              <option value="completed">确认变更</option>
              <option value="rejected">拒绝变更</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-default" @click="closeFinanceModal">取消</button>
          <button class="btn btn-primary" @click="saveFinance">保存</button>
        </div>
      </div>
    </div>

    <!-- ===== 全局弹窗：用户流水弹窗 ===== -->
    <div class="modal-overlay" v-if="showUserLedgerModal" @click="closeUserLedgerModal">
      <div class="modal-content modal-auto-wide" @click.stop>
        <div class="modal-header">
          <h3>积分流水明细</h3>
          <button class="close-btn" @click="closeUserLedgerModal">
            <svg class="modal-close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>
          </button>
        </div>
        <div class="modal-body">
          <!-- 用户概要 -->
          <div class="merchant-summary">
            <div class="summary-row">
              <span class="summary-item"><span class="summary-label">用户ID：</span>{{ currentLedgerUser?.uid }}</span>
              <span class="summary-item"><span class="summary-label">手机号：</span>{{ currentLedgerUser?.phone }}</span>
              <span class="summary-item"><span class="summary-label">当前余额：</span><span class="summary-value">{{ currentLedgerUser?.currentPoints.toLocaleString() }}</span></span>
            </div>
            <button class="btn btn-primary btn-sm summary-export-btn">导出全部</button>
          </div>

          <!-- Tab 切换 -->
          <div class="tab-bar">
            <button
              class="tab-btn"
              :class="{ active: userLedgerFilter === 'all' }"
              @click="userLedgerFilter = 'all'"
            >
              全部
            </button>
            <button
              class="tab-btn"
              :class="{ active: userLedgerFilter === 'earn' }"
              @click="userLedgerFilter = 'earn'"
            >
              发放
            </button>
            <button
              class="tab-btn"
              :class="{ active: userLedgerFilter === 'burn' }"
              @click="userLedgerFilter = 'burn'"
            >
              消耗
            </button>
          </div>

          <table class="data-table table-nowrap">
            <thead>
              <tr>
                <th>流水编号</th>
                <th>类型</th>
                <th>原因</th>
                <th class="cell-wrap">原因备注</th>
                <th>变动数值</th>
                <th>变动后余额</th>
                <th>来源商户</th>
                <th class="cell-wrap">关联批次</th>
                <th>关联订单号</th>
                <th>发生时间</th>
                <th>过期时间</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in filteredUserLedgerList" :key="item.id">
                <td>{{ item.id }}</td>
                <td>{{ getLedgerTypeText(item.type) }}</td>
                <td>{{ getReasonTypeText(item.reason) }}</td>
                <td class="cell-wrap">{{ item.reasonDetail || '-' }}</td>
                <td :class="item.amount > 0 ? 'amount-positive' : 'amount-negative'">
                  {{ item.amount > 0 ? '+' : '' }}{{ item.amount.toLocaleString() }}
                </td>
                <td>{{ item.balance.toLocaleString() }}</td>
                <td>{{ item.merchant || '-' }}</td>
                <td class="cell-wrap">{{ item.batch || '-' }}</td>
                <td>{{ item.orderNo || '-' }}</td>
                <td class="time-text">{{ item.time }}</td>
                <td :class="getExpireTimeClass(item)">{{ getExpireTimeDisplay(item) }}</td>
              </tr>
              <tr v-if="filteredUserLedgerList.length === 0">
                <td colspan="11" class="empty-text">暂无流水记录</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.points-management {
  display: flex;
  height: calc(100vh - 60px);
  background: #f5f7fa;

  /* 积分过期时间视觉警示 */
}
.sidebar {
  width: 220px;
  background: #fff;
  border-right: 1px solid #e8e8e8;
  overflow-y: auto;
  flex-shrink: 0;
}
.sidebar-title {
  padding: 20px 20px 12px;
  font-size: 16px;
  font-weight: bold;
  color: #333;
  border-bottom: 1px solid #f0f0f0;
}
.menu-list {
  padding: 8px 0;
}
.menu-group-title {
  /* 批次悬浮提示 */
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  user-select: none;
}
.menu-group-title:hover {
  background: #f5f5f5;
}
.expand-icon {
  font-size: 10px;
  color: #999;
}
.menu-item {
  padding: 9px 20px 9px 36px;
  font-size: 13px;
  color: #666;
  cursor: pointer;
  transition: all 0.15s;
}
.menu-item:hover {
  background: #e6f4ff;
  color: #1677ff;
}
.menu-item.active {
  background: #e6f4ff;
  color: #1677ff;
  font-weight: 500;
  border-right: 3px solid #1677ff;
}
.menu-item.leaf {
  padding-left: 20px;
}
.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}
.content-panel {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
.panel-header {
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
}
.panel-header h2 {
  margin: 0;
  font-size: 16px;
  color: #333;
}
.panel-subtitle {
  font-size: 12px;
  color: #999;
  margin-left: 12px;
}
.panel-body {
  padding: 20px 24px;
}
.config-form {
  max-width: 600px;
}
.form-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 20px;
  gap: 12px;
}
.form-label {
  width: 120px;
  text-align: right;
  padding-top: 6px;
  font-size: 14px;
  color: #666;
  flex-shrink: 0;
}
.form-label.required::before {
  content: '* ';
  color: #ff4d4f;
}
.form-control-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}
.form-tip {
  font-size: 12px;
  color: #999;
}
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
  content: "";
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
.display-value {
  font-size: 14px;
  color: #1D2129;
  font-weight: 500;
  padding: 4px 0;
}
.form-divider {
  height: 1px;
  background: #eee;
  margin: 8px 0 16px;
}
.radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding-top: 4px;
}
.radio-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
}
.radio-disabled {
  color: #999;
  cursor: not-allowed;
}
.form-actions {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px dashed #eee;
}
.form-input,
.form-select {
  box-sizing: border-box;
  height: 32px;
  padding: 0 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  outline: none;
  font-size: 14px;
}
.form-input:focus,
.form-select:focus {
  border-color: #1677ff;
}
.form-textarea {
  box-sizing: border-box;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  outline: none;
  font-size: 14px;
  resize: vertical;
  font-family: inherit;
}
.form-textarea:focus {
  border-color: #1677ff;
}
.filter-bar {
  display: flex;
  gap: 20px;
  margin-bottom: 16px;
  flex-wrap: wrap;
  align-items: center;
}
.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
}
.filter-item label {
  font-size: 13px;
  color: #666;
  white-space: nowrap;
}
.data-table {
  width: 100%;
  border-collapse: collapse;
}
.data-table th,
.data-table td {
  padding: 12px 16px;

  text-align: left;
  border-bottom: 1px solid #f0f0f0;
  font-size: 13px;
}
.data-table th {
  background: #fafafa;
  font-weight: 500;
  color: #333;
}
.data-table tr:hover {
  background: #fcfcfc;
}
.empty-text {
  text-align: center;
  color: #999;
  padding: 40px !important;
}
.action-link {
  color: #1677ff;
  cursor: pointer;
  font-size: 13px;
}
.action-link:hover {
  color: #4096ff;
}
.action-link.primary {
  color: #1677ff;
  font-weight: 500;
}

.action-link.danger {
  color: #ff4d4f;
}
.action-link.success {
  color: #52c41a;
}
.action-link.warning {
  color: #faad14;
}
.tab-bar {
  display: flex;
  gap: 0;
  border-bottom: 1px solid #e8e8e8;
}
.tab-btn {
  padding: 8px 20px;
  border: none;
  background: none;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}
.tab-btn.active {
  color: #1677ff;
  border-bottom-color: #1677ff;
}
.tab-btn:hover {
  color: #1677ff;
}
.text-success {
  color: #52c41a;
  font-weight: 500;
}
.text-danger {
  color: #ff4d4f;
  font-weight: 500;
}
.text-warning {
  color: #faad14;
}
.text-muted {
  color: #ccc;
  font-size: 13px;
}
.expire-warning {
  color: #faad14 !important;
  font-weight: 600;
}
.expire-danger {
  color: #ff4d4f !important;
  font-weight: 700;
}
.expire-expired {
  color: #ff4d4f !important;
  font-weight: 700;
  text-decoration: line-through;
}
.row-expire-warn {
  background-color: #fffbe6;
}
.row-expire-danger {
  background-color: #fff2f0;
}
.batch-tip {
  cursor: help;
  border-bottom: 1px dashed #1677ff;
}
.status-tag {
  border: 1px solid #ffe58f;
}
.status-tag.confirmed {
  background: #e6f4ff;
  color: #1677ff;
  border: 1px solid #91caff;
}
.status-tag.disputed,
.status-tag.rejected {
  background: #fff2f0;
  color: #ff4d4f;
  border: 1px solid #ffccc7;
}
.btn {
  height: 36px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  border: 1px solid transparent;
  transition: all 0.2s;
  padding: 0 16px;
}
.btn-primary {
  background-color: #1677ff;
  color: #fff;
}
.btn-primary:hover {
  background-color: #4096ff;
}
.btn-default {
  background-color: #fff;
  border-color: #d9d9d9;
  color: #333;
}
.btn-default:hover {
  color: #1677ff;
  border-color: #1677ff;
}
.status-tag.active {
  background: #e6f4ff;
  color: #1677ff;
  border: 1px solid #91caff;
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 13px;
}
.status-tag.closed {
  background: #f5f5f5;
  color: #999;
  border: 1px solid #d9d9d9;
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 13px;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
}
.modal-content {
  background: #fff;
  border-radius: 10px;
  border: 1px solid #E5E6EB;
  box-shadow: 0 6px 30px rgba(0, 0, 0, 0.08);
  width: 520px;
  max-height: 80vh;
  overflow-y: auto;
}
.modal-header {
  padding: 16px 28px;
  border-bottom: 1px solid #E5E6EB;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.modal-header h3 {
  margin: 0;
  font-size: 16px;
}
.close-btn {
  background: none;
  border: none;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.15s ease;
}
.close-btn:hover {
  background-color: #F2F3F5;
}
.modal-close-icon {
  width: 16px;
  height: 16px;
  color: #86909C;
}
.modal-lg {
  width: 720px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
}
.modal-body {
  padding: 24px 28px;
  overflow-y: auto;
  flex: 1;
}
.merchant-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.summary-row {
  display: flex;
  gap: 28px;
  flex-wrap: wrap;
}
.summary-item {
  font-size: 14px;
  color: #4E5969;
  white-space: nowrap;
}
.summary-label {
  color: #86909C;
}
.summary-value {
  color: #1D2129;
  font-weight: 600;
}
.summary-export-btn {
  flex-shrink: 0;
}
.modal-auto-wide {
  width: auto;
  min-width: 560px;
  max-width: 90vw;
  display: flex;
  flex-direction: column;
}
.table-nowrap th,
.table-nowrap td {
  white-space: nowrap;
}
.table-nowrap .cell-wrap {
  white-space: normal;
  word-break: break-all;
  min-width: 100px;
  max-width: 180px;
}
.amount-positive {
  color: #CF1322;
  font-weight: 500;
}
.amount-negative {
  color: #0E7B3A;
  font-weight: 500;
}
.time-text {
  color: #86909C;
  white-space: nowrap;
}
.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
.search-row {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  align-items: center;
}
.user-info-card {
  background: #fafafa;
  border-radius: 8px;
  padding: 16px 20px;
  margin-bottom: 8px;
}
.user-info-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 24px;
  align-items: center;
}
.info-item {
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.info-label {
  font-size: 13px;
  color: #999;
}
.info-value {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}
.info-value.large {
  font-size: 22px;
  color: #1677ff;
}
.info-value.warning {
  color: #ff4d4f;
}
.info-divider {
  width: 1px;
  height: 16px;
  background: #e0e0e0;
}
.selected-user-card {
  background: #e6f4ff;
  padding: 10px 16px;
  border-radius: 6px;
  margin: 8px 0 16px;
  font-size: 14px;
  color: #1677ff;
}
.empty-state {
  text-align: center;
  padding: 40px;
  color: #999;
}
.empty-icon {
  font-size: 36px;
  margin-bottom: 8px;
}
.overview-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.overview-card {
  background: #fafafa;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
}
.card-value {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin-bottom: 6px;
}
.card-label {
  font-size: 13px;
  color: #999;
}
.section-title {
  font-size: 15px;
  font-weight: bold;
  color: #333;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}
.chart-container {
  background: #fafafa;
  border-radius: 8px;
  padding: 20px;
}
.bar-chart {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.chart-bars {
  display: flex;
  gap: 24px;
  align-items: flex-end;
  height: 200px;
}
.bar-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.bar-wrapper {
  display: flex;
  gap: 4px;
  align-items: flex-end;
  height: 180px;
}
.bar {
  width: 30px;
  border-radius: 4px 4px 0 0;
  transition: height 0.3s;
}
.bar.issued {
  background: #1677ff;
}
.bar.burned {
  background: #52c41a;
}
.bar-label {
  font-size: 12px;
  color: #666;
}
.chart-legend {
  display: flex;
  gap: 20px;
  margin-top: 16px;
  font-size: 13px;
  color: #666;
  align-items: center;
}
.legend-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 2px;
  margin-right: 4px;
}
.legend-dot.issued {
  background: #1677ff;
}
.legend-dot.burned {
  background: #52c41a;
}
.pagination-bar {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  font-size: 13px;
  color: #666;
}
/* 修改记录样式 */
.history-section {
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  overflow: hidden;
  margin-top: 24px;
}
.history-header {
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fafafa;
  border-bottom: 1px solid #e8e8e8;
  user-select: none;
}
.history-header:hover {
  background: #f0f0f0;
}
.history-body {
  padding: 0;
}
.history-toggle {
  font-size: 10px;
  color: #999;
  flex-shrink: 0;
}
.history-title {
  font-weight: 500;
  color: #333;
}
.history-count {
  font-size: 12px;
  color: #999;
  font-weight: normal;
}
.snapshot-row td {
  border-bottom: none;
  background: #fcfcff;
}
.snapshot-row .snapshot-detail {
  border-bottom: 1px solid #e8e8e8;
  background: #fcfcff;
}
.snapshot-header {
  font-size: 13px;
  font-weight: 500;
  color: #333;
  padding: 12px 16px;
  border-bottom: 1px solid #e8e8e8;
  background: #f5f5ff;
}
.snapshot-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  background: #e8e8e8;
}
.snapshot-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 16px;
  background: #fff;
}
.snapshot-label {
  font-size: 12px;
  color: #999;
}
.snapshot-value {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}
</style>
