<script setup lang="ts">
import { ref, reactive, computed } from 'vue'

interface RechargeRecord {
  id: string; rechargeNo: string; uid: string; phone: string; amount: number
  receivedAmount: number; bonusAmount?: number; paymentStatus: 'pending' | 'paid' | 'failed' | 'closed'
  rechargeStatus: 'pending' | 'success' | 'failed'; receiveMerchantName: string
  paymentTime: string; payOrderNo?: string; rechargeTime: string; applyTime: string; remark: string
}
interface RechargeBucket {
  type: 'principal' | 'bonus'; originalAmount: number; remainingAmount: number
  withdrawable: boolean; sourceRule: string
  consumptions: { orderNo: string; type: string; amount: number; time: string }[]
}

const mockRechargeRecords = ref<RechargeRecord[]>([
  { id: '1', rechargeNo: 'RCH-20260611-001', uid: 'u10001', phone: '138****1234', amount: 1000, receivedAmount: 1050, paymentStatus: 'paid', rechargeStatus: 'success', receiveMerchantName: '平台自营商户', paymentTime: '2026-06-11 10:30:15', rechargeTime: '2026-06-11 10:30:18', applyTime: '2026-06-11 10:30:00', remark: '', bonusAmount: 50, payOrderNo: 'PAY-20260611-001' },
  { id: '2', rechargeNo: 'RCH-20260611-002', uid: 'u10002', phone: '139****5678', amount: 500, receivedAmount: 500, paymentStatus: 'paid', rechargeStatus: 'pending', receiveMerchantName: '平台自营商户', paymentTime: '2026-06-11 11:00:00', rechargeTime: '', applyTime: '2026-06-11 10:59:45', remark: '支付回调已收到，入账处理中', payOrderNo: 'PAY-20260611-002' },
  { id: '3', rechargeNo: 'RCH-20260611-003', uid: 'u10005', phone: '135****7890', amount: 200, receivedAmount: 200, paymentStatus: 'pending', rechargeStatus: 'pending', receiveMerchantName: 'XX数码旗舰店', paymentTime: '', rechargeTime: '', applyTime: '2026-06-11 11:15:30', remark: '' },
  { id: '4', rechargeNo: 'RCH-20260611-004', uid: 'u10003', phone: '137****9012', amount: 3000, receivedAmount: 3000, paymentStatus: 'failed', rechargeStatus: 'pending', receiveMerchantName: '平台自营商户', paymentTime: '', rechargeTime: '', applyTime: '2026-06-11 12:00:00', remark: '支付接口返回失败' },
  { id: '5', rechargeNo: 'RCH-20260610-001', uid: 'u10006', phone: '134****2345', amount: 5000, receivedAmount: 5200, paymentStatus: 'paid', rechargeStatus: 'success', receiveMerchantName: '平台自营商户', paymentTime: '2026-06-10 09:20:00', rechargeTime: '2026-06-10 09:20:05', applyTime: '2026-06-10 09:19:50', remark: '', bonusAmount: 200, payOrderNo: 'PAY-20260610-001' },
  { id: '6', rechargeNo: 'RCH-20260610-002', uid: 'u10007', phone: '133****6789', amount: 100, receivedAmount: 100, paymentStatus: 'closed', rechargeStatus: 'pending', receiveMerchantName: 'XX服饰专营店', paymentTime: '', rechargeTime: '', applyTime: '2026-06-10 15:00:00', remark: '用户超时关闭' },
  { id: '7', rechargeNo: 'RCH-20260609-001', uid: 'u10004', phone: '136****3456', amount: 10000, receivedAmount: 10000, paymentStatus: 'paid', rechargeStatus: 'failed', receiveMerchantName: '平台自营商户', paymentTime: '2026-06-09 14:30:00', rechargeTime: '', applyTime: '2026-06-09 14:29:30', remark: '支付成功但入账异常，需人工处理', payOrderNo: 'PAY-20260609-001' },
  { id: '8', rechargeNo: 'RCH-20260609-002', uid: 'u10008', phone: '132****0123', amount: 1500, receivedAmount: 1580, paymentStatus: 'paid', rechargeStatus: 'success', receiveMerchantName: '平台自营商户', paymentTime: '2026-06-09 16:45:00', rechargeTime: '2026-06-09 16:45:03', applyTime: '2026-06-09 16:44:50', remark: '', bonusAmount: 80, payOrderNo: 'PAY-20260609-002' },
])

const rechargeSearchForm = reactive({ keyword: '', rechargeStatus: '' })
const filteredRecharges = computed(() => mockRechargeRecords.value.filter(r => {
  const kw = rechargeSearchForm.keyword
  return (!kw || r.rechargeNo.includes(kw) || r.uid.includes(kw) || r.phone.includes(kw))
    && r.paymentStatus === 'paid'
    && (!rechargeSearchForm.rechargeStatus || r.rechargeStatus === rechargeSearchForm.rechargeStatus)
}))

const rechargeDetailModal = ref(false)
const rechargeDetailItem = ref<RechargeRecord | null>(null)
const showRechargeDetail = (item: RechargeRecord) => { rechargeDetailItem.value = item; rechargeDetailModal.value = true }

const manualRecharge = (item: RechargeRecord) => {
  if (!confirm('确认手动将 ¥' + item.receivedAmount.toFixed(2) + ' 入账到用户 ' + item.uid + ' 的钱包？')) return
  item.rechargeStatus = 'success'; item.rechargeTime = new Date().toLocaleString('zh-CN', { hour12: false })
  alert('充值单 ' + item.rechargeNo + ' 已手动入账成功')
}

const rechargeFlowModal = ref(false)
const rechargeFlowItem = ref<RechargeRecord | null>(null)
const rechargeFlowBuckets = ref<RechargeBucket[]>([])
const showRechargeFlow = (record: RechargeRecord) => {
  rechargeFlowItem.value = record
  const principal = record.amount
  rechargeFlowBuckets.value = [
    { type: 'principal', originalAmount: principal, remainingAmount: Math.round(principal * 0.65), withdrawable: true, sourceRule: '用户充值本金，按充值金额入账', consumptions: [{ orderNo: 'ORD-20260615-001', type: 'consume', amount: Math.round(principal * 0.25), time: '2026-06-15 14:30:00' }, { orderNo: 'ORD-20260618-002', type: 'consume', amount: Math.round(principal * 0.10), time: '2026-06-18 09:15:00' }] },
  ]
  const bonus = record.bonusAmount || 0
  if (bonus > 0) {
    rechargeFlowBuckets.value.push({ type: 'bonus', originalAmount: bonus, remainingAmount: Math.round(bonus * 0.80), withdrawable: false, sourceRule: '充值活动赠送，按活动规则入账', consumptions: [{ orderNo: 'ORD-20260616-003', type: 'consume', amount: Math.round(bonus * 0.20), time: '2026-06-16 11:00:00' }] })
  }
  rechargeFlowModal.value = true
}

const paymentStatusLabel: Record<string, string> = { pending: '待支付', paid: '支付成功', failed: '支付失败', closed: '已关闭' }
const rechargeStatusLabel: Record<string, string> = { pending: '待入账', success: '已入账', failed: '入账失败' }
</script>

<template>
  <div class="content-panel">
    <div class="panel-header"><h2>充值管理</h2><span class="panel-subtitle">追踪支付状态与充值入账双状态</span></div>
    <div class="panel-body">
      <div class="filter-bar">
        <div class="filter-item"><label>搜索</label><input type="text" class="form-input" v-model="rechargeSearchForm.keyword" placeholder="充值单号 / UID / 手机号" style="width: 200px" /></div>
        <div class="filter-item"><label>充值状态</label><select class="form-select" v-model="rechargeSearchForm.rechargeStatus" style="width: 120px"><option value="">全部</option><option value="pending">待入账</option><option value="success">已入账</option><option value="failed">入账失败</option></select></div>
        <div class="filter-item"><button class="btn btn-primary" @click="">查询</button><button class="btn btn-default" style="margin-left: 8px" @click="rechargeSearchForm.keyword = ''; rechargeSearchForm.rechargeStatus = ''">重置</button></div>
      </div>
      <table class="data-table">
        <thead><tr><th>充值单号</th><th>支付单号</th><th>用户</th><th>支付金额</th><th>到账金额</th><th>收款商户</th><th>支付状态</th><th>充值状态</th><th>申请时间</th><th>操作</th></tr></thead>
        <tbody>
          <tr v-for="r in filteredRecharges" :key="r.id">
            <td>{{ r.rechargeNo }}</td><td>{{ r.payOrderNo || '-' }}</td>
            <td>{{ r.uid }}<br/><span class="sub-text">{{ r.phone }}</span></td>
            <td class="price-text">¥{{ r.amount.toFixed(2) }}</td><td class="price-text">¥{{ r.receivedAmount.toFixed(2) }}</td>
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
      <div class="pagination"><span>共 {{ filteredRecharges.length }} 条记录</span><div class="page-btns"><button class="page-btn disabled">上一页</button><button class="page-btn active">1</button><button class="page-btn disabled">下一页</button></div></div>
    </div>

    <!-- 充值详情弹窗 -->
    <div v-if="rechargeDetailModal" class="modal-overlay" @click.self="rechargeDetailModal = false">
      <div class="modal-content modal-md">
        <div class="modal-header"><h3>充值详情</h3><span class="modal-close" @click="rechargeDetailModal = false"><svg class="modal-close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg></span></div>
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
        <div class="modal-footer"><button class="btn btn-default" @click="rechargeDetailModal = false">关闭</button><button v-if="rechargeDetailItem?.paymentStatus === 'paid' && rechargeDetailItem?.rechargeStatus === 'failed'" class="btn btn-primary" @click="manualRecharge(rechargeDetailItem!)">手动入账</button></div>
      </div>
    </div>

    <!-- 充值流水弹窗 -->
    <div v-if="rechargeFlowModal" class="modal-overlay" @click.self="rechargeFlowModal = false">
      <div class="modal-content recharge-flow-modal">
        <div class="modal-header"><h3>充值流水详情</h3><span class="modal-close" @click="rechargeFlowModal = false"><svg class="modal-close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg></span></div>
        <div class="modal-body">
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
          <div class="flow-buckets-row">
            <div class="flow-bucket" v-for="bucket in rechargeFlowBuckets" :key="bucket.type">
              <div class="flow-bucket-header"><span class="flow-bucket-type" :class="bucket.type">{{ bucket.type === 'principal' ? '本金' : '赠送' }}</span><span class="flow-bucket-status" :class="{ empty: bucket.remainingAmount <= 0 }">{{ bucket.remainingAmount <= 0 ? '已耗尽' : '可用' }}</span><span class="flow-bucket-withdrawable" :class="{ yes: bucket.withdrawable }">{{ bucket.withdrawable ? '可提现' : '不可提现' }}</span></div>
              <div class="flow-bucket-body">
                <div class="flow-bucket-bar-area"><div class="flow-bucket-bar"><div class="flow-bucket-bar-fill" :class="bucket.type" :style="{ width: ((bucket.originalAmount - bucket.remainingAmount) / bucket.originalAmount * 100) + '%' }"></div></div><div class="flow-bucket-bar-labels"><span>已用 <strong>¥{{ (bucket.originalAmount - bucket.remainingAmount).toFixed(2) }}</strong></span><span>剩余 <strong>¥{{ bucket.remainingAmount.toFixed(2) }}</strong></span></div></div>
                <div class="flow-detail-label">消耗明细</div>
                <div v-if="bucket.consumptions.length"><table class="flow-consumption-table"><thead><tr><th>类型</th><th>关联单号</th><th>金额</th><th>时间</th></tr></thead><tbody><tr v-for="(item, ci) in bucket.consumptions" :key="ci"><td><span class="status-tag consume-type-tag" :class="item.type === 'consume' ? 'consume' : 'withdraw'">{{ item.type === 'consume' ? '消费' : item.type === 'withdraw' ? '提现' : item.type === 'refund' ? '退款' : item.type }}</span></td><td class="order-no-cell">{{ item.orderNo }}</td><td class="amount-negative" style="text-align:right; white-space:nowrap">-¥{{ item.amount.toFixed(2) }}</td><td class="time-text">{{ item.time }}</td></tr></tbody></table></div>
                <div v-else class="flow-no-data">暂无消耗记录</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sub-text { font-size: 12px; color: #86909C; }
.time-text { font-family: 'Geist Mono', 'SF Mono', 'Menlo', monospace; font-size: 12px; color: #86909C; }
.detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.detail-grid div { display: flex; flex-direction: column; gap: 4px; }
.detail-grid label { font-size: 12px; color: #86909C; }
.detail-grid span { font-size: 14px; color: #1D2129; font-weight: 500; }
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
</style>
