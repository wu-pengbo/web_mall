<script setup lang="ts">
import { ref, reactive, computed } from 'vue'

interface BucketLog { bucketNo: string; bucketTime: string; deductAmount: number; remainAmount: number }
interface WalletTransaction {
  id: string; transactionNo: string; uid: string; phone: string; type: string
  amount: number; balance: number; relatedNo: string; relatedRechargeNo?: string
  merchant: string; operator: string; time: string; remark: string; bucketLogs?: BucketLog[]
}

const mockTransactions = ref<WalletTransaction[]>([
  { id: '1', transactionNo: 'TXN-20260611-001', uid: 'u10001', phone: '138****1234', type: 'recharge', amount: 1000, balance: 2280.50, relatedNo: 'RCH-20260611-001', relatedRechargeNo: 'RCH-20260601-001', merchant: '平台自营商户', operator: '系统', time: '2026-06-11 10:30:18', remark: '线上充值' },
  { id: '2', transactionNo: 'TXN-20260611-002', uid: 'u10001', phone: '138****1234', type: 'consume', amount: -188, balance: 2092.50, relatedNo: 'ORD-20260611-001', merchant: 'XX服饰专营店', operator: '系统', time: '2026-06-11 14:20:00', remark: '订单消费', bucketLogs: [{ bucketNo: 'RCH-20260601-001', bucketTime: '2026-06-01 10:00:00', deductAmount: 100, remainAmount: 0 }, { bucketNo: 'RCH-20260608-002', bucketTime: '2026-06-08 15:30:00', deductAmount: 88, remainAmount: 312 }] },
  { id: '3', transactionNo: 'TXN-20260610-001', uid: 'u10002', phone: '139****5678', type: 'recharge', amount: 500, balance: 4060, relatedNo: 'RCH-20260610-003', merchant: '平台自营商户', operator: '系统', time: '2026-06-10 16:00:00', remark: '线上充值' },
  { id: '4', transactionNo: 'TXN-20260610-002', uid: 'u10005', phone: '135****7890', type: 'refund', amount: 200, balance: 1000, relatedNo: 'ORD-20260609-005', merchant: 'XX服饰专营店', operator: '系统', time: '2026-06-10 14:30:00', remark: '订单退款', bucketLogs: [{ bucketNo: 'RCH-20260520-001', bucketTime: '2026-05-20 09:00:00', deductAmount: 200, remainAmount: 200 }] },
  { id: '5', transactionNo: 'TXN-20260609-001', uid: 'u10004', phone: '136****3456', type: 'withdraw', amount: -800, balance: 4400, relatedNo: 'WDR-20260609-001', merchant: '系统', operator: '张三', time: '2026-06-09 10:00:00', remark: '用户提现', bucketLogs: [{ bucketNo: 'RCH-20260520-001', bucketTime: '2026-05-20 09:00:00', deductAmount: 500, remainAmount: 0 }, { bucketNo: 'RCH-20260525-002', bucketTime: '2026-05-25 14:00:00', deductAmount: 300, remainAmount: 700 }] },
  { id: '6', transactionNo: 'TXN-20260609-002', uid: 'u10008', phone: '132****0123', type: 'recharge', amount: 1500, balance: 8300, relatedNo: 'RCH-20260609-002', merchant: '平台自营商户', operator: '系统', time: '2026-06-09 16:45:03', remark: '线上充值' },
  { id: '7', transactionNo: 'TXN-20260608-001', uid: 'u10002', phone: '139****5678', type: 'consume', amount: -129, balance: 3560, relatedNo: 'ORD-20260608-002', merchant: 'XX数码旗舰店', operator: '系统', time: '2026-06-08 11:30:00', remark: '订单消费', bucketLogs: [{ bucketNo: 'RCH-20260601-002', bucketTime: '2026-06-01 14:00:00', deductAmount: 129, remainAmount: 871 }] },
  { id: '8', transactionNo: 'TXN-20260607-001', uid: 'u10003', phone: '137****9012', type: 'consume', amount: -59, balance: 148.50, relatedNo: 'ORD-20260607-001', merchant: 'XX食品店', operator: '系统', time: '2026-06-07 09:15:00', remark: '订单消费', bucketLogs: [{ bucketNo: 'RCH-20260605-003', bucketTime: '2026-06-05 11:00:00', deductAmount: 59, remainAmount: 41 }] },
  { id: '9', transactionNo: 'TXN-20260605-001', uid: 'u10006', phone: '134****2345', type: 'recharge', amount: 2000, balance: 13500, relatedNo: 'RCH-20260605-001', merchant: '平台自营商户', operator: '系统', time: '2026-06-05 14:00:00', remark: '线上充值' },
  { id: '10', transactionNo: 'TXN-20260604-001', uid: 'u10006', phone: '134****2345', type: 'consume', amount: -500, balance: 11500, relatedNo: 'ORD-20260604-003', merchant: 'XX服饰专营店', operator: '系统', time: '2026-06-04 18:00:00', remark: '订单消费', bucketLogs: [{ bucketNo: 'RCH-20260520-005', bucketTime: '2026-05-20 16:00:00', deductAmount: 500, remainAmount: 1500 }] },
  { id: '11', transactionNo: 'TXN-20260603-001', uid: 'u10001', phone: '138****1234', type: 'refund', amount: 219.50, balance: 1280.50, relatedNo: 'ORD-20260530-002', merchant: 'XX数码旗舰店', operator: '系统', time: '2026-06-03 10:00:00', remark: '订单退款', bucketLogs: [{ bucketNo: 'RCH-20260608-002', bucketTime: '2026-06-08 15:30:00', deductAmount: 88, remainAmount: 400 }, { bucketNo: 'RCH-20260601-001', bucketTime: '2026-06-01 10:00:00', deductAmount: 131.50, remainAmount: 131.50 }] },
  { id: '12', transactionNo: 'TXN-20260602-001', uid: 'u10005', phone: '135****7890', type: 'withdraw', amount: -200, balance: 800, relatedNo: 'WDR-20260602-001', merchant: '系统', operator: '系统', time: '2026-06-02 15:00:00', remark: '用户提现', bucketLogs: [{ bucketNo: 'RCH-20260515-001', bucketTime: '2026-05-15 10:00:00', deductAmount: 200, remainAmount: 0 }] },
])

const txTypeLabel: Record<string, string> = { recharge: '充值', refund: '退款', consume: '消费', withdraw: '提现', freeze: '冻结' }

const ledgerSearchForm = reactive({ keyword: '', type: '', merchant: '' })
const filteredLedger = computed(() => mockTransactions.value.filter(tx => {
  const kw = ledgerSearchForm.keyword
  return (!kw || tx.transactionNo.includes(kw) || tx.uid.includes(kw) || tx.phone.includes(kw))
    && (!ledgerSearchForm.type || tx.type === ledgerSearchForm.type)
    && (!ledgerSearchForm.merchant || tx.merchant === ledgerSearchForm.merchant)
    && (tx.type === 'consume' || tx.type === 'refund')
}))

const merchantOptions = computed(() => [...new Set(mockTransactions.value.map(tx => tx.merchant))])

const txDetailModal = ref(false)
const txDetailItem = ref<WalletTransaction | null>(null)
const showTxDetail = (item: WalletTransaction) => { txDetailItem.value = item; txDetailModal.value = true }
</script>

<template>
  <div class="content-panel">
    <div class="panel-header"><h2>交易流水</h2></div>
    <div class="panel-body">
      <div class="filter-bar">
        <div class="filter-item"><label>搜索</label><input type="text" class="form-input" v-model="ledgerSearchForm.keyword" placeholder="流水号 / UID / 手机号" style="width: 200px" /></div>
        <div class="filter-item"><label>交易类型</label><select class="form-select" v-model="ledgerSearchForm.type" style="width: 120px"><option value="">全部</option><option value="consume">消费</option><option value="refund">退款</option></select></div>
        <div class="filter-item"><label>商户</label><select class="form-select" v-model="ledgerSearchForm.merchant" style="width: 140px"><option value="">全部商户</option><option v-for="m in merchantOptions" :key="m" :value="m">{{ m }}</option></select></div>
        <div class="filter-item"><button class="btn btn-primary" @click="">查询</button><button class="btn btn-default" style="margin-left: 8px" @click="ledgerSearchForm.keyword = ''; ledgerSearchForm.type = ''; ledgerSearchForm.merchant = ''">重置</button><button class="btn btn-default" style="margin-left: 8px" @click="alert('已导出 ' + filteredLedger.length + ' 条记录（模拟）')">导出</button></div>
      </div>
      <table class="data-table">
        <thead><tr><th>流水号</th><th>用户</th><th>商户</th><th>交易类型</th><th>金额</th><th>余额</th><th>关联单号</th><th>关联充值</th><th>时间</th><th>操作</th></tr></thead>
        <tbody>
          <template v-for="tx in filteredLedger" :key="tx.id">
            <tr>
              <td>{{ tx.transactionNo }}</td><td>{{ tx.uid }}<br/><span class="sub-text">{{ tx.phone }}</span></td><td>{{ tx.merchant }}</td>
              <td><span class="status-tag" :class="tx.type">{{ txTypeLabel[tx.type] }}</span></td>
              <td :class="{ 'amount-positive': tx.amount > 0, 'amount-negative': tx.amount < 0 }">{{ tx.amount > 0 ? '+' : '' }}¥{{ Math.abs(tx.amount).toFixed(2) }}</td>
              <td>¥{{ tx.balance.toFixed(2) }}</td><td>{{ tx.relatedNo || '-' }}</td><td>{{ tx.relatedRechargeNo || '-' }}</td>
              <td class="time-text">{{ tx.time }}</td><td><span class="action-link primary" @click="showTxDetail(tx)">详情</span></td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <!-- 交易流水详情弹窗 -->
    <div v-if="txDetailModal" class="modal-overlay" @click.self="txDetailModal = false">
      <div class="modal-content modal-md">
        <div class="modal-header"><h3>交易详情</h3><span class="modal-close" @click="txDetailModal = false"><svg class="modal-close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg></span></div>
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
          <div v-if="txDetailItem.bucketLogs && txDetailItem.bucketLogs.length" style="margin-top: 20px">
            <div class="form-section-title" style="margin-bottom: 12px">{{ txDetailItem.type === 'refund' ? '退款回充记录' : '资金来源（先进先出）' }}</div>
            <table class="bucket-table">
              <thead><tr><th>充值批次</th><th>充值时间</th><th>{{ txDetailItem.type === 'refund' ? '回充金额' : '扣减金额' }}</th><th>批次剩余</th></tr></thead>
              <tbody>
                <tr v-for="(bl, idx) in txDetailItem.bucketLogs" :key="idx">
                  <td>{{ bl.bucketNo }}</td><td class="time-text">{{ bl.bucketTime }}</td>
                  <td :class="txDetailItem.type === 'refund' ? 'amount-positive' : 'amount-negative'">{{ txDetailItem.type === 'refund' ? '+' : '-' }}¥{{ bl.deductAmount.toFixed(2) }}</td>
                  <td>¥{{ bl.remainAmount.toFixed(2) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="modal-footer"><button class="btn btn-default" @click="txDetailModal = false">关闭</button></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sub-text { font-size: 12px; color: #86909C; }
.amount-positive { color: #CF1322; }
.amount-negative { color: #0E7B3A; }
.time-text { font-family: 'Geist Mono', 'SF Mono', 'Menlo', monospace; font-size: 12px; color: #86909C; }
.detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.detail-grid div { display: flex; flex-direction: column; gap: 4px; }
.detail-grid label { font-size: 12px; color: #86909C; }
.detail-grid span { font-size: 14px; color: #1D2129; font-weight: 500; }
.form-section-title { font-size: 13px; font-weight: 700; color: #1D2129; letter-spacing: 0.02em; margin-bottom: 8px; }
.bucket-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.bucket-table th { text-align: left; padding: 8px 12px; font-weight: 500; color: #86909C; border-bottom: 1px solid #E5E6EB; white-space: nowrap; }
.bucket-table td { padding: 8px 12px; border-bottom: 1px solid #F2F3F5; }
</style>
