<script setup lang="ts">
import { ref, reactive, computed } from 'vue'

interface WithdrawRecord {
  id: string; withdrawNo: string; uid: string; phone: string; amount: number
  refundType: 'full' | 'partial'; relatedOrderNo: string; relatedRechargeNo?: string; payOrderNo?: string
  originalPayMethod: 'wechat' | 'alipay' | 'bank'; fee: number; actualAmount: number
  status: 'pending' | 'processing' | 'success' | 'failed' | 'rejected'; operator: string
  needsReview: boolean
  applyTime: string; completeTime: string; rejectReason?: string; partialRefundReason?: string
}

const mockWithdrawRecords = ref<WithdrawRecord[]>([
  // 场景1：待人工审核
  { id: '1', withdrawNo: 'WDR-20260611-001', uid: 'u10001', phone: '138****1234', amount: 200, refundType: 'full', relatedOrderNo: 'ORD-20260610-001', originalPayMethod: 'wechat', fee: 0, actualAmount: 200, status: 'pending', needsReview: true, operator: '', applyTime: '2026-06-11 09:00:00', completeTime: '', payOrderNo: 'PAY-20260611-001' },
  // 场景2：自动提现成功（无需审核，提交即自动执行）
  { id: '2', withdrawNo: 'WDR-20260611-002', uid: 'u10002', phone: '139****5678', amount: 500, refundType: 'partial', relatedOrderNo: 'ORD-20260608-003', originalPayMethod: 'alipay', fee: 2.50, actualAmount: 497.50, status: 'success', needsReview: false, operator: '系统', applyTime: '2026-06-11 10:30:00', completeTime: '2026-06-11 10:30:05', payOrderNo: 'PAY-20260611-003', partialRefundReason: '商品部分退货' },
  // 场景3：审核通过，自动提现成功
  { id: '3', withdrawNo: 'WDR-20260610-001', uid: 'u10005', phone: '135****7890', amount: 800, refundType: 'full', relatedOrderNo: 'ORD-20260605-002', originalPayMethod: 'wechat', fee: 0, actualAmount: 800, status: 'success', needsReview: true, operator: '张三', applyTime: '2026-06-10 08:00:00', completeTime: '2026-06-10 14:30:00', payOrderNo: 'PAY-20260610-001' },
  // 场景4：人工审核拒绝
  { id: '4', withdrawNo: 'WDR-20260610-002', uid: 'u10006', phone: '134****2345', amount: 1500, refundType: 'full', relatedOrderNo: 'ORD-20260609-001', originalPayMethod: 'bank', fee: 0, actualAmount: 1500, status: 'rejected', needsReview: true, operator: '李四', applyTime: '2026-06-10 11:00:00', completeTime: '2026-06-10 16:00:00', payOrderNo: 'PAY-20260609-001', rejectReason: '提现申请超出规定期限' },
  // 场景5：自动提现失败
  { id: '5', withdrawNo: 'WDR-20260609-001', uid: 'u10003', phone: '137****9012', amount: 89.50, refundType: 'full', relatedOrderNo: 'ORD-20260608-005', originalPayMethod: 'wechat', fee: 0, actualAmount: 89.50, status: 'failed', needsReview: false, operator: '系统', applyTime: '2026-06-09 15:00:00', completeTime: '', payOrderNo: 'PAY-20260609-002' },
  // 场景6：自动提现成功（无需审核）
  { id: '6', withdrawNo: 'WDR-20260608-001', uid: 'u10008', phone: '132****0123', amount: 300, refundType: 'full', relatedOrderNo: 'ORD-20260606-001', originalPayMethod: 'wechat', fee: 0, actualAmount: 300, status: 'success', needsReview: false, operator: '系统', applyTime: '2026-06-08 14:00:00', completeTime: '2026-06-08 14:00:05', payOrderNo: 'PAY-20260608-001' },
])

const withdrawSearchForm = reactive({ keyword: '', status: '' })
const filteredWithdraws = computed(() => mockWithdrawRecords.value.filter(w => {
  const kw = withdrawSearchForm.keyword
  return (!kw || w.withdrawNo.includes(kw) || w.uid.includes(kw) || w.phone.includes(kw) || w.relatedOrderNo.includes(kw))
    && (!withdrawSearchForm.status || w.status === withdrawSearchForm.status)
}))

const withdrawDetailModal = ref(false)
const withdrawDetailItem = ref<WithdrawRecord | null>(null)
const showWithdrawDetail = (item: WithdrawRecord) => { withdrawDetailItem.value = item; withdrawDetailModal.value = true }
const withdrawStatusLabel: Record<string, string> = { pending: '待审核', processing: '处理中', success: '提现成功', failed: '提现失败', rejected: '已拒绝' }

// 手动审核通过（审核后可自动执行提现）
const approveWithdraw = (item: WithdrawRecord) => {
  if (!confirm('确认审核通过提现单 ' + item.withdrawNo + '？\n提现金额：¥' + item.amount.toFixed(2))) return
  item.status = 'processing'; item.operator = '当前用户'
  // 模拟自动执行提现
  setTimeout(() => {
    if (Math.random() > 0.3) {
      item.status = 'success'; item.completeTime = new Date().toLocaleString('zh-CN', { hour12: false })
      alert('提现单 ' + item.withdrawNo + ' 自动提现成功')
    } else {
      item.status = 'failed'
      alert('提现单 ' + item.withdrawNo + ' 提现失败，可重新发起')
    }
  }, 1500)
  alert('提现单 ' + item.withdrawNo + ' 已审核通过，正在自动执行提现...')
}
// 重新发起
const retryWithdraw = (item: WithdrawRecord) => {
  if (!confirm('确认重新发起提现？\n提现金额：¥' + item.amount.toFixed(2))) return
  item.status = 'processing'
  setTimeout(() => {
    if (Math.random() > 0.3) {
      item.status = 'success'; item.completeTime = new Date().toLocaleString('zh-CN', { hour12: false })
      alert('提现单 ' + item.withdrawNo + ' 重新发起成功')
    } else {
      item.status = 'failed'
      alert('提现单 ' + item.withdrawNo + ' 提现再次失败，可重新发起')
    }
  }, 1500)
  alert('正在重新执行提现...')
}
const rejectWithdraw = (item: WithdrawRecord) => {
  const reason = prompt('请输入拒绝原因：')
  if (!reason) return
  item.status = 'rejected'; item.rejectReason = reason; item.operator = '当前用户'; item.completeTime = new Date().toLocaleString('zh-CN', { hour12: false }); alert('提现单 ' + item.withdrawNo + ' 已拒绝')
}
</script>

<template>
  <div class="content-panel">
    <div class="panel-header"><h2>提现管理</h2><span class="panel-subtitle">提现审核与自动打款</span></div>
    <div class="panel-body">
      <div class="filter-bar">
        <div class="filter-item"><label>搜索</label><input type="text" class="form-input" v-model="withdrawSearchForm.keyword" placeholder="提现单号 / UID / 关联充值单号" style="width: 220px" /></div>
        <div class="filter-item"><label>状态</label><select class="form-select" v-model="withdrawSearchForm.status" style="width: 140px"><option value="">全部</option><option value="pending">待审核</option><option value="processing">处理中</option><option value="success">提现成功</option><option value="failed">提现失败</option><option value="rejected">已拒绝</option></select></div>
        <div class="filter-item"><button class="btn btn-primary" @click="">查询</button><button class="btn btn-default" style="margin-left: 8px" @click="withdrawSearchForm.keyword = ''; withdrawSearchForm.status = ''">重置</button></div>
      </div>
      <table class="data-table">
        <thead><tr><th>提现单号</th><th>用户</th><th>提现金额</th><th>审核方式</th><th>关联充值单号</th><th>关联支付单号</th><th>状态</th><th>操作</th></tr></thead>
        <tbody>
          <tr v-for="w in filteredWithdraws" :key="w.id">
            <td>{{ w.withdrawNo }}</td><td>{{ w.uid }}<br/><span class="sub-text">{{ w.phone }}</span></td>
            <td class="price-text">¥{{ w.amount.toFixed(2) }}</td>
            <td><span class="review-badge" :class="w.needsReview ? 'manual' : 'auto'">{{ w.needsReview ? '人工审核' : '自动提现' }}</span></td>
            <td>{{ w.relatedOrderNo }}</td><td>{{ w.payOrderNo || '-' }}</td>
            <td><span class="status-tag" :class="w.status">{{ withdrawStatusLabel[w.status] }}</span></td>
            <td>
              <span class="action-link primary" @click="showWithdrawDetail(w)">详情</span>
              <span v-if="w.status === 'pending' && w.needsReview" class="action-link primary" @click="approveWithdraw(w)" style="margin-left: 8px">通过</span>
              <span v-if="w.status === 'pending' && w.needsReview" class="action-link danger" @click="rejectWithdraw(w)" style="margin-left: 8px">拒绝</span>
              <span v-if="w.status === 'failed'" class="action-link primary" @click="retryWithdraw(w)" style="margin-left: 8px">重新发起</span>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="pagination"><span>共 {{ filteredWithdraws.length }} 条记录</span><div class="page-btns"><button class="page-btn disabled">上一页</button><button class="page-btn active">1</button><button class="page-btn disabled">下一页</button></div></div>
    </div>

    <!-- 提现详情弹窗 -->
    <div v-if="withdrawDetailModal" class="modal-overlay" @click.self="withdrawDetailModal = false">
      <div class="modal-content modal-md">
        <div class="modal-header"><h3>提现详情</h3><span class="modal-close" @click="withdrawDetailModal = false"><svg class="modal-close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg></span></div>
        <div class="modal-body" v-if="withdrawDetailItem">
          <div class="detail-grid">
            <div><label>提现单号</label><span>{{ withdrawDetailItem.withdrawNo }}</span></div>
            <div><label>用户</label><span>{{ withdrawDetailItem.uid }} / {{ withdrawDetailItem.phone }}</span></div>
            <div><label>提现金额</label><span class="price-text">¥{{ withdrawDetailItem.amount.toFixed(2) }}</span></div>
            <div><label>手续费</label><span>{{ withdrawDetailItem.fee > 0 ? '¥' + withdrawDetailItem.fee.toFixed(2) : '免' }}</span></div>
            <div><label>实际到账</label><span>¥{{ withdrawDetailItem.actualAmount.toFixed(2) }}</span></div>
            <div><label>关联充值单号</label><span>{{ withdrawDetailItem.relatedOrderNo }}</span></div>
            <div><label>关联支付单号</label><span>{{ withdrawDetailItem.payOrderNo || '-' }}</span></div>
            <div><label>状态</label><span class="status-tag" :class="withdrawDetailItem.status">{{ withdrawStatusLabel[withdrawDetailItem.status] }}</span></div>
            <div><label>申请时间</label><span>{{ withdrawDetailItem.applyTime }}</span></div>
            <div><label>完成时间</label><span>{{ withdrawDetailItem.completeTime || '-' }}</span></div>
            <div><label>操作人</label><span>{{ withdrawDetailItem.operator || '-' }}</span></div>
            <div v-if="withdrawDetailItem.rejectReason"><label>拒绝原因</label><span>{{ withdrawDetailItem.rejectReason }}</span></div>
            <div v-if="withdrawDetailItem.partialRefundReason"><label>部分提现原因</label><span>{{ withdrawDetailItem.partialRefundReason }}</span></div>
          </div>
        </div>
        <div class="modal-footer"><button class="btn btn-default" @click="withdrawDetailModal = false">关闭</button></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sub-text { font-size: 12px; color: #86909C; }
.detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.detail-grid div { display: flex; flex-direction: column; gap: 4px; }
.detail-grid label { font-size: 12px; color: #86909C; }
.detail-grid span { font-size: 14px; color: #1D2129; font-weight: 500; }
.review-badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; }
.review-badge.manual { background: #FFF7E6; color: #D46B08; }
.review-badge.auto { background: #E8F3FF; color: #4F6EF7; }
</style>
