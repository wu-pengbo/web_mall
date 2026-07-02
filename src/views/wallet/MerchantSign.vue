<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { mockMerchants } from '../../data/wallet'

interface MerchantSign {
  id: string; merchantName: string; status: 'signed' | 'terminated'
  contactPerson: string; contactPhone: string; signTime: string
  terminateTime?: string; remark?: string; agreement?: string
}

const signList = ref<MerchantSign[]>([
  { id: 'ms-001', merchantName: '平台自营商户', status: 'signed', contactPerson: '张三', contactPhone: '138****0001', signTime: '2026-01-15', terminateTime: '', remark: '' },
  { id: 'ms-002', merchantName: 'XX数码旗舰店', status: 'signed', contactPerson: '李四', contactPhone: '139****0002', signTime: '2026-03-20', terminateTime: '', remark: '' },
  { id: 'ms-003', merchantName: 'XX服饰专营店', status: 'terminated', contactPerson: '王五', contactPhone: '137****0003', signTime: '2025-11-01', terminateTime: '2026-04-30', remark: '合作到期' },
])

const signFilter = reactive({ keyword: '', status: '' })
const signStatusOptions = [
  { value: '', label: '全部状态' }, { value: 'signed', label: '已签约' }, { value: 'terminated', label: '已解约' },
]
const filteredSignList = computed(() => signList.value.filter(s => {
  const kw = signFilter.keyword
  const matchKw = !kw || s.merchantName.includes(kw) || s.contactPerson.includes(kw) || s.contactPhone.includes(kw)
  return matchKw && (!signFilter.status || s.status === signFilter.status)
}))

const showSignModal = ref(false)
const isEditSign = ref(false)
const editingSignId = ref('')
const signForm = reactive({ merchantName: '', contactPerson: '', contactPhone: '', agreement: '', remark: '' })

const openSignModal = (item?: MerchantSign) => {
  if (item) {
    isEditSign.value = true; editingSignId.value = item.id
    signForm.merchantName = item.merchantName; signForm.contactPerson = item.contactPerson
    signForm.contactPhone = item.contactPhone; signForm.remark = item.remark || ''; signForm.agreement = item.agreement || ''
  } else {
    isEditSign.value = false; editingSignId.value = ''
    Object.assign(signForm, { merchantName: '', contactPerson: '', contactPhone: '', remark: '', agreement: '' })
  }
  showSignModal.value = true
}
const closeSignModal = () => { showSignModal.value = false }
const handleAgreementUpload = () => {
  const input = document.createElement('input')
  input.type = 'file'; input.accept = '.pdf,.jpg,.png'
  input.onchange = () => { if (input.files && input.files[0]) signForm.agreement = input.files[0].name }
  input.click()
}
const submitSign = () => {
  if (!signForm.merchantName) { alert('请选择商户'); return }
  if (isEditSign.value) {
    const target = signList.value.find(s => s.id === editingSignId.value)
    if (target) {
      target.merchantName = signForm.merchantName; target.contactPerson = signForm.contactPerson
      target.contactPhone = signForm.contactPhone; target.remark = signForm.remark; target.agreement = signForm.agreement
    }
    alert('签约信息已更新')
  } else {
    signList.value.unshift({
      id: 'ms-' + Date.now(), merchantName: signForm.merchantName, status: 'signed',
      contactPerson: signForm.contactPerson, contactPhone: signForm.contactPhone,
      signTime: new Date().toISOString().slice(0, 10), terminateTime: '', remark: signForm.remark, agreement: signForm.agreement,
    })
    alert('签约成功')
  }
  closeSignModal()
}
const terminateSign = (item: MerchantSign) => {
  if (confirm('确认与「' + item.merchantName + '」解约？')) { item.status = 'terminated'; item.terminateTime = new Date().toISOString().slice(0, 10); alert('已解约') }
}

// 收款流水
const showSettlementModal = ref(false)
const settlementMerchant = ref<MerchantSign | null>(null)
const settlementTab = ref<'consume' | 'refund'>('consume')

const mockSettlementTx = [
  { id: '1', transactionNo: 'TXN-20260611-002', uid: 'u10001', phone: '138****1234', type: 'consume', amount: -188, relatedNo: 'ORD-20260611-001', merchant: 'XX服饰专营店', time: '2026-06-11 14:20:00', remark: '订单消费' },
  { id: '2', transactionNo: 'TXN-20260610-002', uid: 'u10005', phone: '135****7890', type: 'refund', amount: 200, relatedNo: 'ORD-20260609-005', merchant: 'XX服饰专营店', time: '2026-06-10 14:30:00', remark: '订单退款' },
  { id: '3', transactionNo: 'TXN-20260608-001', uid: 'u10002', phone: '139****5678', type: 'consume', amount: -129, relatedNo: 'ORD-20260608-002', merchant: 'XX数码旗舰店', time: '2026-06-08 11:30:00', remark: '订单消费' },
  { id: '4', transactionNo: 'TXN-20260607-001', uid: 'u10003', phone: '137****9012', type: 'consume', amount: -59, relatedNo: 'ORD-20260607-001', merchant: 'XX食品店', time: '2026-06-07 09:15:00', remark: '订单消费' },
  { id: '5', transactionNo: 'TXN-20260604-001', uid: 'u10006', phone: '134****2345', type: 'consume', amount: -500, relatedNo: 'ORD-20260604-003', merchant: 'XX服饰专营店', time: '2026-06-04 18:00:00', remark: '订单消费' },
  { id: '6', transactionNo: 'TXN-20260603-001', uid: 'u10001', phone: '138****1234', type: 'refund', amount: 219.50, relatedNo: 'ORD-20260530-002', merchant: 'XX数码旗舰店', time: '2026-06-03 10:00:00', remark: '订单退款' },
]

const settlementConsumeRecords = computed(() => {
  if (!settlementMerchant.value) return []
  return mockSettlementTx.filter(tx => tx.merchant === settlementMerchant.value!.merchantName && tx.type === 'consume')
})
const settlementRefundRecords = computed(() => {
  if (!settlementMerchant.value) return []
  return mockSettlementTx.filter(tx => tx.merchant === settlementMerchant.value!.merchantName && tx.type === 'refund')
})
const settlementTotalConsume = computed(() => settlementConsumeRecords.value.reduce((s, r) => s + Math.abs(r.amount), 0))
const settlementTotalRefund = computed(() => settlementRefundRecords.value.reduce((s, r) => s + Math.abs(r.amount), 0))
const settlementNet = computed(() => settlementTotalConsume.value - settlementTotalRefund.value)
const openSettlementFlow = (item: MerchantSign) => { settlementMerchant.value = item; settlementTab.value = 'consume'; showSettlementModal.value = true }
</script>

<template>
  <div class="content-panel">
    <div class="panel-header">
      <h2>商户签约</h2>
      <button class="btn btn-primary" @click="openSignModal()">+ 新增签约</button>
    </div>
    <div class="panel-body">
      <div class="filter-bar">
        <div class="filter-item"><label>商户名称</label><input type="text" class="form-input" v-model="signFilter.keyword" placeholder="商户名称/联系人/电话" style="width: 200px" /></div>
        <div class="filter-item"><label>签约状态</label><select class="form-select" v-model="signFilter.status" style="width: 120px"><option v-for="opt in signStatusOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option></select></div>
      </div>
      <table class="data-table">
        <thead><tr><th>商户名称</th><th>联系人</th><th>联系电话</th><th>签约状态</th><th>签约时间</th><th>解约时间</th><th>操作</th></tr></thead>
        <tbody>
          <tr v-for="item in filteredSignList" :key="item.id">
            <td>{{ item.merchantName }}</td><td>{{ item.contactPerson || '-' }}</td><td>{{ item.contactPhone || '-' }}</td>
            <td><span :class="'status-badge ' + (item.status === 'signed' ? 'on' : 'off')">{{ item.status === 'signed' ? '已签约' : '已解约' }}</span></td>
            <td>{{ item.signTime || '-' }}</td><td>{{ item.terminateTime || '-' }}</td>
            <td>
              <a class="action-link" @click="openSignModal(item)">编辑</a>
              <a class="action-link primary" @click="openSettlementFlow(item)" style="margin-left: 8px">收款流水</a>
              <a v-if="item.status === 'signed'" class="action-link danger" @click="terminateSign(item)" style="margin-left: 8px">解约</a>
            </td>
          </tr>
          <tr v-if="filteredSignList.length === 0"><td colspan="7" class="empty-text">暂无签约数据</td></tr>
        </tbody>
      </table>
    </div>

    <!-- 新增/编辑签约弹窗 -->
    <div class="modal-overlay" v-if="showSignModal" @click="closeSignModal">
      <div class="modal-content modal-md" @click.stop>
        <div class="modal-header"><h3>{{ isEditSign ? '编辑签约' : '新增签约' }}</h3><div class="modal-close" @click="closeSignModal"><svg class="modal-close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg></div></div>
        <div class="modal-body">
          <div class="form-item"><label class="form-label required">商户</label><select class="form-select" v-model="signForm.merchantName" :disabled="isEditSign" style="width: 100%"><option value="">请选择商户</option><option v-for="m in mockMerchants" :key="m.id" :value="m.name">{{ m.name }}</option></select></div>
          <div class="form-item"><label class="form-label">联系人</label><input type="text" class="form-input" v-model="signForm.contactPerson" placeholder="选填" style="width: 100%" /></div>
          <div class="form-item"><label class="form-label">联系电话</label><input type="text" class="form-input" v-model="signForm.contactPhone" placeholder="选填" style="width: 100%" /></div>
          <div class="form-item"><label class="form-label">备注</label><textarea class="form-textarea" v-model="signForm.remark" rows="2" placeholder="选填" style="width: 100%"></textarea></div>
          <div class="form-item"><label class="form-label">签约协议</label><div style="display: flex; align-items: center; gap: 10px;"><button class="btn btn-default" style="height: 32px; padding: 0 16px; font-size: 13px; flex-shrink: 0;" @click="handleAgreementUpload">上传协议扫描件</button><span v-if="signForm.agreement" style="font-size: 13px; color: #00A854; white-space: nowrap;">已上传：{{ signForm.agreement }}</span></div></div>
        </div>
        <div class="modal-footer"><button class="btn btn-default" @click="closeSignModal">取消</button><button class="btn btn-primary" @click="submitSign">{{ isEditSign ? '保存' : '确认签约' }}</button></div>
      </div>
    </div>

    <!-- 收款流水弹窗 -->
    <div class="modal-overlay" v-if="showSettlementModal" @click="showSettlementModal = false">
      <div class="modal-content" style="width: auto; min-width: 720px; max-width: 90vw;" @click.stop>
        <div class="modal-header"><h3>收款流水 - {{ settlementMerchant?.merchantName }}</h3><div class="modal-close" @click="showSettlementModal = false"><svg class="modal-close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg></div></div>
        <div class="modal-body">
          <div class="settle-stats">
            <div class="settle-stat-card consume"><div class="settle-stat-label">消费总额</div><div class="settle-stat-value">¥{{ settlementTotalConsume.toLocaleString() }}</div></div>
            <div class="settle-stat-card refund"><div class="settle-stat-label">退款总额</div><div class="settle-stat-value">¥{{ settlementTotalRefund.toLocaleString() }}</div></div>
            <div class="settle-stat-card" :class="settlementNet >= 0 ? 'net-positive' : 'net-negative'"><div class="settle-stat-label">净结算</div><div class="settle-stat-value">{{ settlementNet >= 0 ? '+' : '' }}¥{{ settlementNet.toLocaleString() }}</div></div>
          </div>
          <div class="segmented-control">
            <button class="segmented-btn" :class="{ active: settlementTab === 'consume' }" @click="settlementTab = 'consume'">消费流水</button>
            <button class="segmented-btn" :class="{ active: settlementTab === 'refund' }" @click="settlementTab = 'refund'">退款流水</button>
          </div>
          <table class="data-table table-nowrap" v-if="settlementTab === 'consume'">
            <thead><tr><th>流水号</th><th>用户ID</th><th>手机号</th><th>消费金额</th><th>关联订单</th><th>时间</th><th>备注</th></tr></thead>
            <tbody>
              <tr v-for="r in settlementConsumeRecords" :key="r.id">
                <td>{{ r.transactionNo }}</td><td>{{ r.uid }}</td><td>{{ r.phone }}</td>
                <td class="amount-positive">¥{{ Math.abs(r.amount).toLocaleString() }}</td><td>{{ r.relatedNo }}</td>
                <td class="time-text">{{ r.time }}</td><td>{{ r.remark || '-' }}</td>
              </tr>
              <tr v-if="settlementConsumeRecords.length === 0"><td colspan="7" class="empty-text">暂无消费流水</td></tr>
            </tbody>
          </table>
          <table class="data-table table-nowrap" v-if="settlementTab === 'refund'">
            <thead><tr><th>流水号</th><th>用户ID</th><th>手机号</th><th>退款金额</th><th>关联订单</th><th>时间</th><th>备注</th></tr></thead>
            <tbody>
              <tr v-for="r in settlementRefundRecords" :key="r.id">
                <td>{{ r.transactionNo }}</td><td>{{ r.uid }}</td><td>{{ r.phone }}</td>
                <td class="amount-negative">¥{{ Math.abs(r.amount).toLocaleString() }}</td><td>{{ r.relatedNo }}</td>
                <td class="time-text">{{ r.time }}</td><td>{{ r.remark || '-' }}</td>
              </tr>
              <tr v-if="settlementRefundRecords.length === 0"><td colspan="7" class="empty-text">暂无退款流水</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settle-stats { display: flex; gap: 16px; margin-bottom: 20px; }
.settle-stat-card { flex: 1; background: #F7F8FA; border: 1px solid #E5E6EB; border-radius: 8px; padding: 16px 20px; }
.settle-stat-label { font-size: 12px; color: #86909C; margin-bottom: 8px; letter-spacing: 0.03em; text-transform: uppercase; }
.settle-stat-value { font-size: 20px; font-weight: 700; color: #1D2129; font-family: 'Geist Mono', 'SF Mono', 'Menlo', monospace; letter-spacing: -0.02em; }
.settle-stat-card.consume { background: #F0F5FF; border-color: #D6E4FF; }
.settle-stat-card.consume .settle-stat-value { color: #4F6EF7; }
.settle-stat-card.refund { background: #FFF7E6; border-color: #FFE0B2; }
.settle-stat-card.refund .settle-stat-value { color: #D46B08; }
.settle-stat-card.net-positive { background: #E8FFE8; border-color: #B7EB8F; }
.settle-stat-card.net-positive .settle-stat-value { color: #00A854; }
.settle-stat-card.net-negative { background: #FFF0F0; border-color: #FFCCC7; }
.settle-stat-card.net-negative .settle-stat-value { color: #CF1322; }
</style>
