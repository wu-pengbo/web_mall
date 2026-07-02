<script setup lang="ts">
import { ref, reactive, computed } from 'vue'

interface UserWallet { walletId: string; uid: string; phone: string; balance: number; principalBalance: number; bonusBalance: number; frozenAmount: number; withdrawFrozenAmount: number; totalRecharge: number; totalConsume: number; totalRefund: number; status: 'normal' | 'frozen'; openTime: string; frozenReason?: string }
interface WalletTransaction { id: string; transactionNo: string; uid: string; phone: string; type: string; amount: number; balance: number; relatedNo: string; merchant: string; operator: string; time: string; remark: string; bucketLogs?: any[] }
interface RechargeRecord { id: string; rechargeNo: string; uid: string; phone: string; amount: number; receivedAmount: number; bonusAmount?: number; paymentStatus: string; rechargeStatus: string; receiveMerchantName: string; paymentTime: string; payOrderNo?: string; rechargeTime: string; applyTime: string; remark: string }
interface WithdrawRecord { id: string; withdrawNo: string; uid: string; phone: string; amount: number; refundType: string; relatedOrderNo: string; relatedRechargeNo?: string; originalPayMethod: string; fee: number; actualAmount: number; status: string; operator: string; applyTime: string; completeTime: string; rejectReason?: string }

const mockUserWallets = ref<UserWallet[]>([
  { walletId: 'WLT-00001', uid: 'u10001', phone: '138****1234', balance: 1280.50, principalBalance: 1024, bonusBalance: 256.50, frozenAmount: 200, withdrawFrozenAmount: 50, totalRecharge: 5000, totalConsume: 3500, totalRefund: 219.50, status: 'normal', openTime: '2026-01-15 10:30:00' },
  { walletId: 'WLT-00002', uid: 'u10002', phone: '139****5678', balance: 3560.00, principalBalance: 2848, bonusBalance: 712, frozenAmount: 0, withdrawFrozenAmount: 0, totalRecharge: 8000, totalConsume: 4400, totalRefund: 40, status: 'normal', openTime: '2026-01-20 14:20:00' },
  { walletId: 'WLT-00003', uid: 'u10003', phone: '137****9012', balance: 89.50, principalBalance: 72, bonusBalance: 17.50, frozenAmount: 0, withdrawFrozenAmount: 0, totalRecharge: 1000, totalConsume: 910.50, totalRefund: 0, status: 'normal', openTime: '2026-02-03 09:15:00' },
  { walletId: 'WLT-00004', uid: 'u10004', phone: '136****3456', balance: 5200.00, principalBalance: 4160, bonusBalance: 1040, frozenAmount: 1500, withdrawFrozenAmount: 300, totalRecharge: 10000, totalConsume: 3300, totalRefund: 0, status: 'frozen', openTime: '2026-02-10 16:45:00', frozenReason: '疑似异常交易' },
  { walletId: 'WLT-00005', uid: 'u10005', phone: '135****7890', balance: 800.00, principalBalance: 640, bonusBalance: 160, frozenAmount: 0, withdrawFrozenAmount: 0, totalRecharge: 2000, totalConsume: 1200, totalRefund: 0, status: 'normal', openTime: '2026-03-01 11:00:00' },
  { walletId: 'WLT-00006', uid: 'u10006', phone: '134****2345', balance: 12500.00, principalBalance: 10000, bonusBalance: 2500, frozenAmount: 500, withdrawFrozenAmount: 200, totalRecharge: 20000, totalConsume: 7000, totalRefund: 0, status: 'normal', openTime: '2026-03-12 08:30:00' },
  { walletId: 'WLT-00007', uid: 'u10007', phone: '133****6789', balance: 0, principalBalance: 0, bonusBalance: 0, frozenAmount: 0, withdrawFrozenAmount: 0, totalRecharge: 500, totalConsume: 500, totalRefund: 0, status: 'normal', openTime: '2026-04-05 13:20:00' },
  { walletId: 'WLT-00008', uid: 'u10008', phone: '132****0123', balance: 6800.00, principalBalance: 5440, bonusBalance: 1360, frozenAmount: 0, withdrawFrozenAmount: 0, totalRecharge: 10000, totalConsume: 3000, totalRefund: 200, status: 'frozen', openTime: '2026-04-18 10:00:00', frozenReason: '用户主动申请冻结' },
])
const walletSearchForm = reactive({ keyword: '', status: '' })
const filteredWallets = computed(() => mockUserWallets.value.filter(w => {
  const kw = walletSearchForm.keyword
  return (!kw || w.walletId.includes(kw) || w.uid.includes(kw) || w.phone.includes(kw)) && (!walletSearchForm.status || w.status === walletSearchForm.status)
}))

// 流水弹窗
const userFlowModal = ref(false); const userFlowWallet = ref<UserWallet | null>(null); const userFlowTxs = ref<WalletTransaction[]>([]); const userFlowTab = ref<'recharge' | 'withdraw' | 'transaction'>('recharge')
const userFlowExpandedTxId = ref<string | null>(null)
const toggleUserFlowBucket = (txId: string) => { userFlowExpandedTxId.value = userFlowExpandedTxId.value === txId ? null : txId }
const txTypeLabel: Record<string, string> = { recharge: '充值', refund: '退款', consume: '消费', withdraw: '提现', freeze: '冻结' }

const mockTransactions = ref<WalletTransaction[]>([
  { id: '1', transactionNo: 'TXN-20260611-001', uid: 'u10001', phone: '138****1234', type: 'recharge', amount: 1000, balance: 2280.50, relatedNo: 'RCH-20260611-001', merchant: '平台自营商户', operator: '系统', time: '2026-06-11 10:30:18', remark: '线上充值' },
  { id: '2', transactionNo: 'TXN-20260611-002', uid: 'u10001', phone: '138****1234', type: 'consume', amount: -188, balance: 2092.50, relatedNo: 'ORD-20260611-001', merchant: 'XX服饰专营店', operator: '系统', time: '2026-06-11 14:20:00', remark: '订单消费', bucketLogs: [{ bucketNo: 'RCH-20260601-001', bucketTime: '2026-06-01 10:00:00', deductAmount: 100, remainAmount: 0 }, { bucketNo: 'RCH-20260608-002', bucketTime: '2026-06-08 15:30:00', deductAmount: 88, remainAmount: 312 }] },
  { id: '7', transactionNo: 'TXN-20260608-001', uid: 'u10002', phone: '139****5678', type: 'consume', amount: -129, balance: 3560, relatedNo: 'ORD-20260608-002', merchant: 'XX数码旗舰店', operator: '系统', time: '2026-06-08 11:30:00', remark: '订单消费', bucketLogs: [{ bucketNo: 'RCH-20260601-002', bucketTime: '2026-06-01 14:00:00', deductAmount: 129, remainAmount: 871 }] },
])

const mockRechargeRecords = ref<RechargeRecord[]>([
  { id: '1', rechargeNo: 'RCH-20260611-001', uid: 'u10001', phone: '138****1234', amount: 1000, receivedAmount: 1050, paymentStatus: 'paid', rechargeStatus: 'success', receiveMerchantName: '平台自营商户', paymentTime: '2026-06-11 10:30:15', rechargeTime: '2026-06-11 10:30:18', applyTime: '2026-06-11 10:30:00', remark: '', bonusAmount: 50, payOrderNo: 'PAY-20260611-001' },
  { id: '5', rechargeNo: 'RCH-20260610-001', uid: 'u10006', phone: '134****2345', amount: 5000, receivedAmount: 5200, paymentStatus: 'paid', rechargeStatus: 'success', receiveMerchantName: '平台自营商户', paymentTime: '2026-06-10 09:20:00', rechargeTime: '2026-06-10 09:20:05', applyTime: '2026-06-10 09:19:50', remark: '', bonusAmount: 200, payOrderNo: 'PAY-20260610-001' },
])

const mockWithdrawRecords = ref<WithdrawRecord[]>([
  { id: '1', withdrawNo: 'WDR-20260611-001', uid: 'u10001', phone: '138****1234', amount: 200, refundType: 'full', relatedOrderNo: 'ORD-20260610-001', originalPayMethod: 'wechat', fee: 0, actualAmount: 200, status: 'pending', operator: '', applyTime: '2026-06-11 09:00:00', completeTime: '' },
  { id: '2', withdrawNo: 'WDR-20260611-002', uid: 'u10002', phone: '139****5678', amount: 500, refundType: 'partial', relatedOrderNo: 'ORD-20260608-003', originalPayMethod: 'alipay', fee: 2.50, actualAmount: 497.50, status: 'approved', operator: '张三', applyTime: '2026-06-11 10:30:00', completeTime: '' },
])

const withdrawStatusLabel: Record<string, string> = { pending: '待审核', approved: '审核通过待打款', refunded: '已打款', rejected: '已拒绝' }

const showUserFlow = (wallet: UserWallet) => {
  userFlowWallet.value = wallet
  userFlowTxs.value = mockTransactions.value.filter(tx => tx.uid === wallet.uid).slice(0, 20)
  userFlowModal.value = true
}

// 冻结弹窗
const freezeModal = ref(false); const freezeWalletTarget = ref<UserWallet | null>(null); const freezeMode = ref<'freeze' | 'unfreeze'>('freeze')
const freezeForm = reactive({ amount: 0, reason: '', reasonDetail: '' })
const freezeReasonOptions = [{ value: 'abnormal', label: '异常交易收回' }, { value: 'duplicate', label: '重复发放收回' }, { value: 'manual', label: '手动扣除' }, { value: 'other', label: '其他' }]
const unfreezeReasonOptions = [{ value: 'risk_cleared', label: '风险解除' }, { value: 'manual', label: '手动解冻' }, { value: 'other', label: '其他' }]

const showFreezeModal = (wallet: UserWallet, mode: 'freeze' | 'unfreeze') => {
  freezeWalletTarget.value = wallet; freezeMode.value = mode; freezeForm.amount = 0; freezeForm.reason = ''; freezeForm.reasonDetail = ''; freezeModal.value = true
}
const confirmFreezeAction = () => {
  if (!freezeWalletTarget.value || !freezeForm.reason) return
  const target = mockUserWallets.value.find(w => w.walletId === freezeWalletTarget.value!.walletId)
  if (!target) return
  const isFreeze = freezeMode.value === 'freeze'
  const maxFreeze = target.balance - target.frozenAmount; const maxUnfreeze = target.frozenAmount
  if (isFreeze) { if (freezeForm.amount <= 0 || freezeForm.amount > maxFreeze) { alert('冻结金额必须在 1 到 ' + maxFreeze.toFixed(2) + ' 之间'); return } }
  else { if (freezeForm.amount <= 0 || freezeForm.amount > maxUnfreeze) { alert('解冻金额必须在 1 到 ' + maxUnfreeze.toFixed(2) + ' 之间'); return } }
  const amt = isFreeze ? -freezeForm.amount : freezeForm.amount
  const reasonObj = (isFreeze ? freezeReasonOptions : unfreezeReasonOptions).find(o => o.value === freezeForm.reason)
  const reasonText = reasonObj ? reasonObj.label : freezeForm.reason
  const detailText = freezeForm.reason === 'other' && freezeForm.reasonDetail ? '(' + freezeForm.reasonDetail + ')' : ''
  if (isFreeze) { target.frozenAmount += freezeForm.amount; target.frozenReason = reasonText + '：冻结 ¥' + freezeForm.amount.toFixed(2) }
  else { target.frozenAmount -= freezeForm.amount }
  const nextId = String(Math.max(...mockTransactions.value.map(t => parseInt(t.id))) + 1)
  mockTransactions.value.push({ id: nextId, transactionNo: 'TXN-FRZ-' + nextId.padStart(3, '0'), uid: target.uid, phone: target.phone, type: 'freeze', amount: amt, balance: target.balance, relatedNo: '', merchant: '系统', operator: '管理员', time: new Date().toISOString().replace('T', ' ').slice(0, 19), remark: (isFreeze ? '冻结' : '解冻') + '：' + reasonText + detailText })
  freezeModal.value = false; alert('钱包 ' + target.walletId + ' 已' + (isFreeze ? '冻结' : '解冻') + '（金额：¥' + freezeForm.amount.toFixed(2) + '）')
}
const freezeWallet = (item: UserWallet) => { if (confirm('确认冻结钱包「' + item.walletId + '」？')) { item.status = 'frozen'; item.frozenReason = '管理员冻结钱包'; alert('钱包已冻结') } }
const unfreezeWallet = (item: UserWallet) => { if (confirm('确认解冻钱包「' + item.walletId + '」？')) { item.status = 'normal'; item.frozenReason = undefined; alert('钱包已解冻') } }
</script>

<template>
  <div class="content-panel">
    <div class="panel-header"><h2>用户钱包</h2></div>
    <div class="panel-body">
      <div class="filter-bar">
        <div class="filter-item"><label>搜索</label><input type="text" class="form-input" v-model="walletSearchForm.keyword" placeholder="钱包ID / UID / 手机号" style="width: 200px" /></div>
        <div class="filter-item"><label>状态</label><select class="form-select" v-model="walletSearchForm.status" style="width: 120px"><option value="">全部</option><option value="normal">正常</option><option value="frozen">已冻结</option></select></div>
        <div class="filter-item"><button class="btn btn-primary" @click="">查询</button><button class="btn btn-default" style="margin-left: 8px" @click="walletSearchForm.keyword = ''; walletSearchForm.status = ''">重置</button></div>
      </div>
      <table class="data-table">
        <thead><tr><th>钱包ID</th><th>用户UID</th><th>手机号</th><th>余额</th><th>冻结金额</th><th>累计充值</th><th>状态</th><th>开通时间</th><th>操作</th></tr></thead>
        <tbody>
          <tr v-for="w in filteredWallets" :key="w.walletId">
            <td>{{ w.walletId }}</td><td>{{ w.uid }}</td><td>{{ w.phone }}</td>
            <td class="price-text">¥{{ w.balance.toFixed(2) }}</td><td>{{ w.frozenAmount > 0 ? '¥' + w.frozenAmount.toFixed(2) : '-' }}</td>
            <td>¥{{ w.totalRecharge.toFixed(2) }}</td><td><span class="status-tag" :class="w.status">{{ w.status === 'normal' ? '正常' : '已冻结' }}</span></td>
            <td class="time-text">{{ w.openTime }}</td>
            <td><span class="action-link primary" @click="showUserFlow(w)">查看详情</span><span v-if="w.status === 'normal'" class="action-link danger" @click="showFreezeModal(w, 'freeze')" style="margin-left: 8px">冻结余额</span></td>
          </tr>
          <tr v-if="filteredWallets.length === 0"><td colspan="9" class="empty-text">暂无符合条件的钱包</td></tr>
        </tbody>
      </table>
      <div class="pagination"><span>共 {{ filteredWallets.length }} 条记录</span><div class="page-btns"><button class="page-btn disabled">上一页</button><button class="page-btn active">1</button><button class="page-btn disabled">下一页</button></div></div>
    </div>

    <!-- 用户流水弹窗 -->
    <div v-if="userFlowModal" class="modal-overlay" @click.self="userFlowModal = false">
      <div class="modal-content" style="width: auto; min-width: 720px; max-width: 90vw;">
        <div class="modal-header"><h3>{{ userFlowWallet?.walletId }} 资金流水 <span :class="'status-badge ' + (userFlowWallet?.status === 'normal' ? 'on' : 'off')" style="font-size: 12px; margin-left: 8px; vertical-align: middle">{{ userFlowWallet?.status === 'normal' ? '正常' : '已冻结' }}</span></h3><span class="modal-close" @click="userFlowModal = false"><svg class="modal-close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg></span></div>
        <div class="modal-body">
          <div style="margin-bottom: 12px;" v-if="userFlowWallet">
            <div style="display: flex; gap: 16px; margin-bottom: 16px;">
              <div style="flex: 1; background: #F7F8FA; border: 1px solid #E5E6EB; border-radius: 8px; padding: 12px 16px;"><div style="font-size: 12px; color: #86909C; margin-bottom: 4px; letter-spacing: 0.03em;">用户</div><div style="font-size: 14px; color: #1D2129; font-weight: 500;">{{ userFlowWallet.uid }} / {{ userFlowWallet.phone }}</div></div>
              <div style="flex: 1; background: #F7F8FA; border: 1px solid #E5E6EB; border-radius: 8px; padding: 12px 16px; display: flex; align-items: center; justify-content: space-between;"><div><div style="font-size: 12px; color: #86909C; margin-bottom: 4px; letter-spacing: 0.03em;">状态</div><span :class="'status-badge ' + (userFlowWallet.status === 'normal' ? 'on' : 'off')" style="font-size: 12px; padding: 2px 10px; border-radius: 12px;">{{ userFlowWallet.status === 'normal' ? '正常' : '已冻结' }}</span></div><label class="toggle-switch" :title="userFlowWallet.status === 'normal' ? '冻结钱包' : '解冻钱包'"><input type="checkbox" :checked="userFlowWallet.status === 'normal'" @click.prevent="userFlowWallet.status === 'normal' ? freezeWallet(userFlowWallet) : unfreezeWallet(userFlowWallet)" /><span class="toggle-slider"></span></label></div>
            </div>
            <div style="display: flex; gap: 16px;">
              <div style="flex: 1; background: #F0F5FF; border: 1px solid #D6E4FF; border-radius: 8px; padding: 14px 16px;"><div style="font-size: 12px; color: #4F6EF7; margin-bottom: 6px; letter-spacing: 0.03em;">可用余额</div><div style="font-size: 20px; color: #4F6EF7; font-weight: 700; font-family: 'Geist Mono', 'SF Mono', 'Menlo', monospace;">¥{{ userFlowWallet.balance.toFixed(2) }}</div><div style="display: flex; justify-content: space-between; margin-top: 8px; padding-top: 8px; border-top: 1px solid #D6E4FF;"><span style="font-size: 12px; color: #4F6EF7;">本金(可提现)</span><span style="font-size: 13px; color: #4F6EF7; font-weight: 600; font-family: 'Geist Mono', 'SF Mono', 'Menlo', monospace;">¥{{ userFlowWallet.principalBalance.toFixed(2) }}</span></div><div style="display: flex; justify-content: space-between; margin-top: 4px;"><span style="font-size: 12px; color: #D46B08;">赠送</span><span style="font-size: 13px; color: #D46B08; font-weight: 600; font-family: 'Geist Mono', 'SF Mono', 'Menlo', monospace;">¥{{ userFlowWallet.bonusBalance.toFixed(2) }}</span></div></div>
              <div style="flex: 1; background: #E8FFE8; border: 1px solid #B7EB8F; border-radius: 8px; padding: 14px 16px;"><div style="font-size: 12px; color: #00A854; margin-bottom: 6px; letter-spacing: 0.03em;">消费金额</div><div style="font-size: 20px; color: #00A854; font-weight: 700; font-family: 'Geist Mono', 'SF Mono', 'Menlo', monospace;">¥{{ (userFlowWallet.totalConsume - userFlowWallet.totalRefund).toFixed(2) }}</div><div style="display: flex; justify-content: space-between; margin-top: 8px; padding-top: 8px; border-top: 1px solid #B7EB8F;"><span style="font-size: 12px; color: #00A854;">消费总额</span><span style="font-size: 13px; color: #00A854; font-weight: 600; font-family: 'Geist Mono', 'SF Mono', 'Menlo', monospace;">¥{{ userFlowWallet.totalConsume.toFixed(2) }}</span></div><div style="display: flex; justify-content: space-between; margin-top: 4px;"><span style="font-size: 12px; color: #CF1322;">已退款</span><span style="font-size: 13px; color: #CF1322; font-weight: 600; font-family: 'Geist Mono', 'SF Mono', 'Menlo', monospace;">¥{{ userFlowWallet.totalRefund.toFixed(2) }}</span></div></div>
              <div style="flex: 1; background: #FFF7E6; border: 1px solid #FFE0B2; border-radius: 8px; padding: 14px 16px;"><div style="font-size: 12px; color: #D46B08; margin-bottom: 6px; letter-spacing: 0.03em;">冻结金额</div><div style="font-size: 20px; color: #D46B08; font-weight: 700; font-family: 'Geist Mono', 'SF Mono', 'Menlo', monospace;">¥{{ (userFlowWallet.frozenAmount + userFlowWallet.withdrawFrozenAmount).toFixed(2) }}</div><div style="display: flex; justify-content: space-between; margin-top: 8px; padding-top: 8px; border-top: 1px solid #FFE0B2;"><span style="font-size: 12px; color: #D46B08;">系统冻结</span><span style="font-size: 13px; color: #D46B08; font-weight: 600; font-family: 'Geist Mono', 'SF Mono', 'Menlo', monospace;">¥{{ userFlowWallet.frozenAmount.toFixed(2) }}</span></div><div style="display: flex; justify-content: space-between; margin-top: 4px;"><span style="font-size: 12px; color: #86909C;">提现中</span><span style="font-size: 13px; color: #86909C; font-weight: 600; font-family: 'Geist Mono', 'SF Mono', 'Menlo', monospace;">¥{{ userFlowWallet.withdrawFrozenAmount.toFixed(2) }}</span></div></div>
            </div>
          </div>
          <div class="segmented-control" style="margin-top: 16px"><button class="segmented-btn" :class="{ active: userFlowTab === 'recharge' }" @click="userFlowTab = 'recharge'">充值流水</button><button class="segmented-btn" :class="{ active: userFlowTab === 'withdraw' }" @click="userFlowTab = 'withdraw'">提现流水</button><button class="segmented-btn" :class="{ active: userFlowTab === 'transaction' }" @click="userFlowTab = 'transaction'">交易流水</button></div>
          <table class="data-table table-nowrap" style="margin-top: 16px" v-if="userFlowTab === 'recharge'"><thead><tr><th>充值单号</th><th>支付单号</th><th>支付金额</th><th>到账金额</th><th>支付状态</th><th>充值状态</th><th>申请时间</th><th>入账时间</th></tr></thead><tbody><tr v-for="r in mockRechargeRecords.filter(r => r.uid === userFlowWallet?.uid)" :key="r.id"><td>{{ r.rechargeNo }}</td><td>{{ r.payOrderNo || '-' }}</td><td class="amount-positive">+¥{{ r.amount.toFixed(2) }}</td><td class="amount-positive">+¥{{ r.receivedAmount.toFixed(2) }}</td><td><span class="status-tag" :class="r.paymentStatus">{{ r.paymentStatus === 'paid' ? '已支付' : r.paymentStatus === 'pending' ? '待支付' : r.paymentStatus === 'failed' ? '支付失败' : '已关闭' }}</span></td><td><span class="status-tag" :class="r.rechargeStatus">{{ r.rechargeStatus === 'success' ? '已入账' : r.rechargeStatus === 'pending' ? '待入账' : '入账失败' }}</span></td><td class="time-text">{{ r.applyTime }}</td><td class="time-text">{{ r.rechargeTime || '-' }}</td></tr><tr v-if="mockRechargeRecords.filter(r => r.uid === userFlowWallet?.uid).length === 0"><td colspan="8" class="empty-text">暂无充值记录</td></tr></tbody></table>
          <table class="data-table" style="margin-top: 16px" v-if="userFlowTab === 'withdraw'"><thead><tr><th>提现单号</th><th>提现金额</th><th>关联订单</th><th>关联充值</th><th>状态</th><th>申请时间</th></tr></thead><tbody><tr v-for="w in mockWithdrawRecords.filter(wr => wr.uid === userFlowWallet?.uid)" :key="w.id"><td>{{ w.withdrawNo }}</td><td class="amount-negative">-¥{{ w.amount.toFixed(2) }}</td><td>{{ w.relatedOrderNo || '-' }}</td><td>{{ w.relatedRechargeNo || '-' }}</td><td><span class="status-tag" :class="w.status">{{ withdrawStatusLabel[w.status] }}</span></td><td class="time-text">{{ w.applyTime }}</td></tr><tr v-if="mockWithdrawRecords.filter(wr => wr.uid === userFlowWallet?.uid).length === 0"><td colspan="6" class="empty-text">暂无提现记录</td></tr></tbody></table>
          <table class="data-table" style="margin-top: 16px" v-if="userFlowTab === 'transaction'"><thead><tr><th style="width: 30px"></th><th>流水号</th><th>类型</th><th>金额</th><th>余额</th><th>时间</th></tr></thead><tbody><template v-for="tx in userFlowTxs.filter(t => t.type !== 'recharge')" :key="tx.id"><tr><td><span v-if="tx.bucketLogs && tx.bucketLogs.length" class="expand-btn" @click="toggleUserFlowBucket(tx.id)">{{ userFlowExpandedTxId === tx.id ? '▼' : '▶' }}</span></td><td>{{ tx.transactionNo }}</td><td>{{ txTypeLabel[tx.type] }}</td><td :class="{ 'amount-positive': tx.amount > 0, 'amount-negative': tx.amount < 0 }">{{ tx.amount > 0 ? '+' : '' }}¥{{ Math.abs(tx.amount).toFixed(2) }}</td><td>¥{{ tx.balance.toFixed(2) }}</td><td class="time-text">{{ tx.time }}</td></tr><tr v-if="userFlowExpandedTxId === tx.id && tx.bucketLogs" class="bucket-row"><td></td><td colspan="5" style="padding: 0"><div class="bucket-panel"><div class="bucket-header">{{ tx.type === 'refund' ? '退款回充记录' : '资金来源（先进先出）' }}</div><table class="bucket-table"><thead><tr><th>充值批次</th><th>充值时间</th><th>{{ tx.type === 'refund' ? '回充金额' : '扣减金额' }}</th><th>批次剩余</th></tr></thead><tbody><tr v-for="(bl, idx) in tx.bucketLogs" :key="idx"><td>{{ bl.bucketNo }}</td><td class="time-text">{{ bl.bucketTime }}</td><td :class="tx.type === 'refund' ? 'amount-positive' : 'amount-negative'">{{ tx.type === 'refund' ? '+' : '-' }}¥{{ bl.deductAmount.toFixed(2) }}</td><td>¥{{ bl.remainAmount.toFixed(2) }}</td></tr></tbody></table></div></td></tr></template><tr v-if="userFlowTxs.filter(t => t.type !== 'recharge').length === 0"><td colspan="6" class="empty-text">暂无交易记录</td></tr></tbody></table>
        </div>
      </div>
    </div>

    <!-- 冻结/解冻弹窗 -->
    <div v-if="freezeModal" class="modal-overlay" @click.self="freezeModal = false">
      <div class="modal-content modal-md">
        <div class="modal-header"><h3>{{ freezeMode === 'freeze' ? '冻结' : '解冻' }}余额</h3><span class="modal-close" @click="freezeModal = false"><svg class="modal-close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg></span></div>
        <div class="modal-body">
          <div class="detail-grid" style="margin-bottom: 16px; padding: 12px; background: #F7F8FA; border-radius: 8px;">
            <div><label>钱包ID</label><span>{{ freezeWalletTarget?.walletId }}</span></div><div><label>用户</label><span>{{ freezeWalletTarget?.phone }}（{{ freezeWalletTarget?.uid }}）</span></div>
            <div><label>当前余额</label><span>¥{{ freezeWalletTarget?.balance.toFixed(2) }}</span></div><div><label>冻结金额</label><span>¥{{ freezeWalletTarget?.frozenAmount.toFixed(2) }}</span></div>
            <div><label>可{{ freezeMode === 'freeze' ? '冻结' : '解冻' }}金额</label><span style="color: #4F6EF7; font-weight: 600;">¥{{ (freezeMode === 'freeze' ? (freezeWalletTarget ? freezeWalletTarget.balance - freezeWalletTarget.frozenAmount : 0) : (freezeWalletTarget?.frozenAmount || 0)).toFixed(2) }}</span></div>
          </div>
          <div style="text-align: center; margin-bottom: 16px;"><div class="segmented-control"><button class="segmented-btn" :class="{ active: freezeMode === 'freeze' }" @click="freezeMode = 'freeze'">冻结</button><button class="segmented-btn" :class="{ active: freezeMode === 'unfreeze' }" @click="freezeMode = 'unfreeze'">解冻</button></div></div>
          <div class="form-item"><label class="form-label required">金额</label><div class="form-control-row"><input type="number" class="form-input" v-model.number="freezeForm.amount" min="0.01" :max="freezeMode === 'freeze' ? (freezeWalletTarget ? freezeWalletTarget.balance - freezeWalletTarget.frozenAmount : 0) : (freezeWalletTarget?.frozenAmount || 0)" step="0.01" placeholder="请输入金额" style="width: 200px" /><span class="form-tip">（可{{ freezeMode === 'freeze' ? '冻结' : '解冻' }}：¥{{ (freezeMode === 'freeze' ? (freezeWalletTarget ? freezeWalletTarget.balance - freezeWalletTarget.frozenAmount : 0) : (freezeWalletTarget?.frozenAmount || 0)).toFixed(2) }}）</span></div></div>
          <div class="form-item"><label class="form-label required">原因备注</label><div style="flex: 1"><select class="form-select" v-model="freezeForm.reason" style="width: 100%; margin-bottom: 8px"><option value="" disabled>请选择原因</option><option v-for="opt in (freezeMode === 'freeze' ? freezeReasonOptions : unfreezeReasonOptions)" :key="opt.value" :value="opt.value">{{ opt.label }}</option></select><textarea v-if="freezeForm.reason === 'other'" class="form-textarea" v-model="freezeForm.reasonDetail" rows="2" placeholder="请补充详细描述" style="width: 100%"></textarea></div></div>
          <div style="margin-top: 20px; border-top: 1px solid #E5E6EB; padding-top: 16px;"><div style="font-size: 13px; font-weight: 600; color: #1D2129; margin-bottom: 12px;">冻结流水</div><table class="bucket-table" style="width: 100%;"><thead><tr><th>流水号</th><th>操作</th><th>金额</th><th>原因</th><th>时间</th></tr></thead><tbody><tr v-for="ftx in mockTransactions.filter(t => t.type === 'freeze' && t.uid === freezeWalletTarget?.uid)" :key="ftx.id"><td>{{ ftx.transactionNo }}</td><td>{{ ftx.amount < 0 ? '冻结' : '解冻' }}</td><td :class="{ 'amount-negative': ftx.amount < 0 }">¥{{ Math.abs(ftx.amount).toFixed(2) }}</td><td>{{ ftx.remark || '-' }}</td><td class="time-text">{{ ftx.time }}</td></tr><tr v-if="mockTransactions.filter(t => t.type === 'freeze' && t.uid === freezeWalletTarget?.uid).length === 0"><td colspan="5" style="text-align: center; color: #86909C; padding: 20px;">暂无冻结记录</td></tr></tbody></table></div>
        </div>
        <div class="modal-footer"><button class="btn btn-default" @click="freezeModal = false">取消</button><button class="btn btn-primary" @click="confirmFreezeAction" :disabled="!freezeForm.amount || !freezeForm.reason">{{ freezeMode === 'freeze' ? '确认冻结' : '确认解冻' }}</button></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.time-text { font-family: 'Geist Mono', 'SF Mono', 'Menlo', monospace; font-size: 12px; color: #86909C; }
.amount-positive { color: #CF1322; }
.amount-negative { color: #0E7B3A; }
.detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.detail-grid div { display: flex; flex-direction: column; gap: 4px; }
.detail-grid label { font-size: 12px; color: #86909C; }
.detail-grid span { font-size: 14px; color: #1D2129; font-weight: 500; }
.bucket-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.bucket-table th { text-align: left; padding: 8px 12px; font-weight: 500; color: #86909C; border-bottom: 1px solid #E5E6EB; }
.bucket-table td { padding: 8px 12px; border-bottom: 1px solid #F2F3F5; }
.bucket-panel { padding: 12px 16px; background: #FAFAFA; }
.bucket-header { font-size: 12px; font-weight: 600; color: #86909C; margin-bottom: 8px; }
.expand-btn { cursor: pointer; color: #86909C; font-size: 12px; user-select: none; }
.expand-btn:hover { color: #4F6EF7; }
.form-tip { font-size: 12px; color: #86909C; }
</style>
