<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import MemberModal from '@/components/member/MemberModal.vue'
import { memberState, adjustMemberLevel, assignTag, getBenefit, getLevel, getMember, getTag, recordOrderCompletion, recordRefund, removeTag } from '@/stores/member'
import { notifyMember } from '@/stores/member-ui'
import type { Member } from '@/types/member'

const filters = reactive({ keyword: '', levelId: '', tagId: String(new URLSearchParams(window.location.search).get('tagId') ?? ''), status: '', paidMin: '', paidMax: '', orderMin: '', orderMax: '', growthMin: '', registeredFrom: '', registeredTo: '' })
const page = ref(1)
const pageSize = 8
const selectedIds = ref<string[]>([])
const selectedTagId = ref('')
const batchAction = ref<'add' | 'remove'>('add')
const batchOpen = ref(false)
const detailId = ref('')
const detailTab = ref('overview')
const adjustOpen = ref(false)
const adjustLevelId = ref('')
const adjustReason = ref('')
const orderAmount = ref(100)
const refundAmount = ref(100)
const refundFull = ref(false)
const detailTagId = ref('')
const selectedMember = computed(() => getMember(detailId.value) ?? null)
const activeTags = computed(() => memberState.tags.filter((tag) => tag.status === 'enabled'))
const activeLevels = computed(() => [...memberState.levels].filter((level) => level.status === 'enabled').sort((a, b) => a.order - b.order))

const filteredMembers = computed(() => {
  const query = filters.keyword.trim().toLowerCase()
  return memberState.members.filter((member) => {
    const matchQuery = !query || member.id.toLowerCase().includes(query) || member.nickname.toLowerCase().includes(query) || member.phone.toLowerCase().includes(query)
    const paidMin = filters.paidMin === '' ? -Infinity : Number(filters.paidMin)
    const paidMax = filters.paidMax === '' ? Infinity : Number(filters.paidMax)
    const orderMin = filters.orderMin === '' ? -Infinity : Number(filters.orderMin)
    const orderMax = filters.orderMax === '' ? Infinity : Number(filters.orderMax)
    const growthMin = filters.growthMin === '' ? -Infinity : Number(filters.growthMin)
    return matchQuery && (!filters.levelId || member.currentLevelId === filters.levelId) &&
      (!filters.tagId || member.tagIds.includes(filters.tagId)) && (!filters.status || member.status === filters.status) &&
      member.totalPaid >= paidMin && member.totalPaid <= paidMax && member.validOrderCount >= orderMin &&
      member.validOrderCount <= orderMax && (memberState.upgradeMode !== 'growth' || member.growthValue >= growthMin) &&
      (!filters.registeredFrom || member.registeredAt.slice(0, 10) >= filters.registeredFrom) &&
      (!filters.registeredTo || member.registeredAt.slice(0, 10) <= filters.registeredTo)
  })
})
const pageCount = computed(() => Math.max(1, Math.ceil(filteredMembers.value.length / pageSize)))
const pagedMembers = computed(() => filteredMembers.value.slice((page.value - 1) * pageSize, page.value * pageSize))
const totalPaid = computed(() => memberState.members.reduce((sum, member) => sum + member.totalPaid, 0))
const totalGrowth = computed(() => memberState.members.reduce((sum, member) => sum + member.growthValue, 0))
const nextLevel = computed(() => {
  if (!selectedMember.value) return undefined
  const current = getLevel(selectedMember.value.currentLevelId)
  return current ? activeLevels.value.find((level) => level.order > current.order) : undefined
})
const nextProgress = computed(() => {
  const member = selectedMember.value
  const level = nextLevel.value
  if (!member || !level) return 0
  if (memberState.upgradeMode === 'growth') return Math.min(100, Math.round((member.growthValue / Math.max(level.growthThreshold, 1)) * 100))
  if (memberState.upgradeMode === 'condition') {
    const amountRatio = Math.min(1, member.totalPaid / Math.max(level.condition.paidAmount, 1))
    const orderRatio = Math.min(1, member.validOrderCount / Math.max(level.condition.validOrderCount, 1))
    return Math.round((level.condition.relation === 'all' ? (amountRatio + orderRatio) / 2 : Math.max(amountRatio, orderRatio)) * 100)
  }
  return 0
})

const resetFilters = () => {
  Object.assign(filters, { keyword: '', levelId: '', tagId: '', status: '', paidMin: '', paidMax: '', orderMin: '', orderMax: '', growthMin: '', registeredFrom: '', registeredTo: '' })
  page.value = 1
}
const toggleMember = (memberId: string) => {
  selectedIds.value = selectedIds.value.includes(memberId) ? selectedIds.value.filter((id) => id !== memberId) : [...selectedIds.value, memberId]
}
const togglePageSelection = () => {
  const pageIds = pagedMembers.value.map((member) => member.id)
  const allSelected = pageIds.every((id) => selectedIds.value.includes(id))
  selectedIds.value = allSelected ? selectedIds.value.filter((id) => !pageIds.includes(id)) : [...new Set([...selectedIds.value, ...pageIds])]
}
const openDetails = (member: Member) => {
  detailId.value = member.id
  detailTab.value = 'overview'
  detailTagId.value = ''
}
const saveBatchTags = () => {
  if (!selectedTagId.value) return notifyMember('请选择一个标签', 'error')
  const changed = batchAction.value === 'add' ? assignTag(selectedIds.value, selectedTagId.value) : removeTag(selectedIds.value, selectedTagId.value)
  batchOpen.value = false
  selectedIds.value = []
  notifyMember(`已更新 ${changed} 位会员的标签`, 'success')
}
const addDetailTag = () => {
  if (!selectedMember.value || !detailTagId.value) return
  const changed = assignTag([selectedMember.value.id], detailTagId.value)
  notifyMember(changed ? '标签已添加' : '标签已存在或当前不可用', changed ? 'success' : 'info')
  detailTagId.value = ''
}
const applyManualLevel = () => {
  if (!selectedMember.value) return
  if (!adjustLevelId.value || !adjustReason.value.trim()) return notifyMember('请选择等级并填写调整原因', 'error')
  const success = adjustMemberLevel(selectedMember.value.id, adjustLevelId.value, adjustReason.value)
  if (!success) return notifyMember('等级调整未完成，请确认目标等级有效', 'error')
  adjustOpen.value = false
  adjustReason.value = ''
  notifyMember('会员等级已调整，跨级权益已按规则处理', 'success')
}
const applyOrder = () => {
  if (!selectedMember.value) return
  const success = recordOrderCompletion(selectedMember.value.id, Number(orderAmount.value))
  if (!success) return notifyMember('请输入大于 0 的实付金额，且会员需处于正常状态', 'error')
  notifyMember('消费记录已更新，会员统计与等级已重新计算', 'success')
}
const applyRefund = () => {
  if (!selectedMember.value) return
  const success = recordRefund(selectedMember.value.id, Number(refundAmount.value), refundFull.value)
  if (!success) return notifyMember('退款金额必须大于 0，且不能超过当前累计实付金额', 'error')
  notifyMember('退款记录已更新，会员等级保持不变', 'success')
  refundFull.value = false
}
const fmtMoney = (amount: number) => `¥${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
</script>

<template>
  <div class="member-page">
    <header class="member-page-header">
      <div><h1>会员管理</h1><p>查看注册会员资料、等级成长、会员标签及消费记录。</p></div>
      <div class="member-head-actions"><span class="member-pill pill-info">注册即会员</span></div>
    </header>

    <section class="member-stats">
      <article class="member-stat"><div class="member-stat-label">会员总数</div><div class="member-stat-value">{{ memberState.members.length }}</div><div class="member-stat-note">全部注册用户</div></article>
      <article class="member-stat"><div class="member-stat-label">正常会员</div><div class="member-stat-value">{{ memberState.members.filter((m) => m.status === 'normal').length }}</div><div class="member-stat-note">可正常参与会员运营</div></article>
      <article class="member-stat"><div class="member-stat-label">累计有效实付</div><div class="member-stat-value">{{ fmtMoney(totalPaid) }}</div><div class="member-stat-note">按当前会员汇总</div></article>
      <article class="member-stat"><div class="member-stat-label">累计成长值</div><div class="member-stat-value">{{ memberState.upgradeMode === 'growth' ? totalGrowth.toLocaleString() : '—' }}</div><div class="member-stat-note">{{ memberState.upgradeMode === 'growth' ? '当前成长值升级口径' : '成长值模式开启后显示' }}</div></article>
    </section>

    <section class="member-card">
      <div class="member-toolbar">
        <div class="member-filters">
          <div class="filter-field"><label>会员搜索</label><input v-model="filters.keyword" class="member-input input-search" placeholder="会员ID、昵称或手机号" @input="page = 1" /></div>
          <div class="filter-field"><label>会员等级</label><select v-model="filters.levelId" class="member-select" @change="page = 1"><option value="">全部等级</option><option v-for="level in memberState.levels" :key="level.id" :value="level.id">{{ level.name }}</option></select></div>
          <div class="filter-field"><label>会员标签</label><select v-model="filters.tagId" class="member-select" @change="page = 1"><option value="">全部标签</option><option v-for="tag in memberState.tags" :key="tag.id" :value="tag.id">{{ tag.name }}</option></select></div>
          <div class="filter-field"><label>会员状态</label><select v-model="filters.status" class="member-select" @change="page = 1"><option value="">全部状态</option><option value="normal">正常</option><option value="disabled">禁用</option></select></div>
          <div class="filter-field"><label>累计实付（元）</label><div class="member-inline"><input v-model="filters.paidMin" class="member-input" type="number" min="0" placeholder="最低" @input="page = 1" /><input v-model="filters.paidMax" class="member-input" type="number" min="0" placeholder="最高" @input="page = 1" /></div></div>
          <div class="filter-field"><label>有效订单数</label><div class="member-inline"><input v-model="filters.orderMin" class="member-input" type="number" min="0" placeholder="最低" @input="page = 1" /><input v-model="filters.orderMax" class="member-input" type="number" min="0" placeholder="最高" @input="page = 1" /></div></div>
          <div class="filter-field"><label>注册时间</label><div class="member-inline"><input v-model="filters.registeredFrom" class="member-input" type="date" aria-label="注册开始日期" @change="page = 1" /><input v-model="filters.registeredTo" class="member-input" type="date" aria-label="注册结束日期" @change="page = 1" /></div></div>
          <div v-if="memberState.upgradeMode === 'growth'" class="filter-field"><label>成长值至少</label><input v-model="filters.growthMin" class="member-input" type="number" min="0" placeholder="不限" @input="page = 1" /></div>
          <button class="btn btn-secondary" @click="resetFilters">重置</button>
        </div>
      </div>
      <div class="member-section-row">
        <div class="member-inline"><span class="member-card-title">会员列表</span><span class="member-pill pill-neutral">{{ filteredMembers.length }} 位会员</span></div>
        <div class="member-head-actions"><button class="btn btn-secondary" :disabled="!selectedIds.length" @click="batchOpen = true">批量打标签<span v-if="selectedIds.length">（{{ selectedIds.length }}）</span></button></div>
      </div>
      <div class="member-table-wrap">
        <table class="member-table">
          <thead><tr>
            <th><input type="checkbox" :checked="pagedMembers.length > 0 && pagedMembers.every((m) => selectedIds.includes(m.id))" @change="togglePageSelection" /></th>
            <th>会员</th><th>会员等级</th><th v-if="memberState.upgradeMode === 'growth'">成长值</th><th>会员标签</th><th>累计实付</th><th>有效订单</th><th>注册时间</th><th>最近消费</th><th>状态</th><th>操作</th>
          </tr></thead>
          <tbody>
            <tr v-for="member in pagedMembers" :key="member.id">
              <td><input type="checkbox" :checked="selectedIds.includes(member.id)" @change="toggleMember(member.id)" /></td>
              <td><div class="member-person"><span class="member-avatar" :style="{ backgroundColor: member.avatarColor }">{{ member.nickname.slice(0, 1) }}</span><div><div class="member-person-name">{{ member.nickname }}</div><div class="member-person-meta member-id">{{ member.id }} · {{ member.phone }}</div></div></div></td>
              <td><span class="member-pill pill-info">{{ getLevel(member.currentLevelId)?.name ?? '未知等级' }}</span></td>
              <td v-if="memberState.upgradeMode === 'growth'" class="member-number">{{ member.growthValue.toLocaleString() }}</td>
              <td><div v-if="member.tagIds.length" class="member-tags"><span v-for="(tagId, index) in member.tagIds.slice(0, 2)" :key="tagId" class="member-tag-chip" :class="['blue', 'green', 'gold'][index % 3]">{{ getTag(tagId)?.name }}</span><span v-if="member.tagIds.length > 2" class="member-tag-chip">+{{ member.tagIds.length - 2 }}</span></div><span v-else class="member-person-meta">—</span></td>
              <td class="member-number">{{ fmtMoney(member.totalPaid) }}</td><td class="member-number">{{ member.validOrderCount }}</td><td class="member-time">{{ member.registeredAt.slice(0, 10) }}</td><td class="member-time">{{ member.lastConsumedAt ? member.lastConsumedAt.slice(0, 10) : '—' }}</td>
              <td><span class="member-pill" :class="member.status === 'normal' ? 'pill-normal' : 'pill-disabled'">{{ member.status === 'normal' ? '正常' : '禁用' }}</span></td>
              <td><button class="member-link" @click="openDetails(member)">查看详情</button></td>
            </tr>
            <tr v-if="pagedMembers.length === 0"><td colspan="11" class="member-empty">没有符合筛选条件的会员</td></tr>
          </tbody>
        </table>
      </div>
      <div class="member-pagination"><span>显示 {{ filteredMembers.length ? (page - 1) * pageSize + 1 : 0 }}–{{ Math.min(page * pageSize, filteredMembers.length) }} 条，共 {{ filteredMembers.length }} 条</span><div class="pagination-buttons"><button class="pagination-button" :disabled="page <= 1" @click="page--">上一页</button><button v-for="n in pageCount" :key="n" class="pagination-button" :class="{ active: page === n }" @click="page = n">{{ n }}</button><button class="pagination-button" :disabled="page >= pageCount" @click="page++">下一页</button></div></div>
    </section>

    <MemberModal :open="batchOpen" title="批量调整会员标签" @close="batchOpen = false">
      <div class="member-form-grid">
        <div class="form-field"><label>操作方式</label><div class="segmented-control"><button class="segmented-btn" :class="{ active: batchAction === 'add' }" @click="batchAction = 'add'">添加标签</button><button class="segmented-btn" :class="{ active: batchAction === 'remove' }" @click="batchAction = 'remove'">移除标签</button></div></div>
        <div class="form-field"><label class="field-required">选择标签</label><select v-model="selectedTagId" class="member-select"><option value="">请选择</option><option v-for="tag in memberState.tags.filter((item) => batchAction === 'remove' || item.status === 'enabled')" :key="tag.id" :value="tag.id">{{ tag.name }}{{ tag.status === 'disabled' ? '（停用）' : '' }}</option></select></div>
        <div class="span-2 member-callout"><div><strong>将应用于 {{ selectedIds.length }} 位已选择会员</strong><p>重复添加会自动跳过；移除标签不会影响会员的等级和消费记录。</p></div></div>
      </div>
      <template #footer><button class="btn btn-secondary" @click="batchOpen = false">取消</button><button class="btn btn-primary" @click="saveBatchTags">确认更新</button></template>
    </MemberModal>

    <MemberModal :open="!!selectedMember" title="会员详情" width="820px" @close="detailId = ''">
      <template v-if="selectedMember">
        <div class="member-person" style="margin-bottom: 18px"><span class="member-avatar large" :style="{ backgroundColor: selectedMember.avatarColor }">{{ selectedMember.nickname.slice(0, 1) }}</span><div><div class="member-person-name" style="font-size: 17px">{{ selectedMember.nickname }} <span class="member-pill pill-info">{{ getLevel(selectedMember.currentLevelId)?.name }}</span></div><div class="member-person-meta">{{ selectedMember.id }} · {{ selectedMember.phone }} · 注册于 {{ selectedMember.registeredAt }}</div></div><button class="btn btn-secondary" style="margin-left: auto" :disabled="activeLevels.length < 2" @click="adjustLevelId = selectedMember.currentLevelId; adjustReason = ''; adjustOpen = true">调整等级</button></div>
        <div class="member-tabs"><button v-for="tab in [{id:'overview',label:'会员概况'},{id:'benefits',label:'权益记录'},{id:'levels',label:'等级记录'},{id:'growth',label:'成长值记录'}]" :key="tab.id" class="member-tab" :class="{ active: detailTab === tab.id }" @click="detailTab = tab.id">{{ tab.label }}</button></div>
        <template v-if="detailTab === 'overview'">
          <div class="member-detail-grid"><div class="detail-field"><label>当前等级</label><strong>{{ getLevel(selectedMember.currentLevelId)?.name }}</strong></div><div class="detail-field"><label>等级获得时间</label><strong>{{ selectedMember.levelObtainedAt }}</strong></div><div class="detail-field"><label>注册来源 / 账号状态</label><strong>{{ selectedMember.registerSource }} · {{ selectedMember.status === 'normal' ? '正常' : '禁用' }}</strong></div><div class="detail-field"><label>累计有效实付</label><strong>{{ fmtMoney(selectedMember.totalPaid) }}</strong></div><div class="detail-field"><label>有效订单数</label><strong>{{ selectedMember.validOrderCount }} 单</strong></div><div class="detail-field"><label>成长值</label><strong>{{ selectedMember.growthValue.toLocaleString() }}</strong></div></div>
          <div class="member-divider"></div>
          <div class="member-section-row"><div><div class="member-card-title">等级成长</div><div class="member-card-subtitle">{{ memberState.upgradeMode === 'growth' ? `当前成长值 ${selectedMember.growthValue.toLocaleString()}` : memberState.upgradeMode === 'condition' ? '按累计实付金额和有效订单规则计算' : '创建第一个高级等级后即可配置升级方式' }}</div></div></div>
          <template v-if="memberState.levels.length === 1"><div class="member-callout"><div><strong>当前仅有普通会员</strong><p>暂不显示下一等级或升级进度。创建高级等级并设置升级方式后，这里会展示相应进度。</p></div></div></template>
          <template v-else-if="nextLevel"><div class="member-inline" style="justify-content:space-between;margin-bottom:8px"><span>距离 {{ nextLevel.name }} · {{ nextProgress }}%</span><span v-if="memberState.upgradeMode === 'growth'">{{ Math.max(0, nextLevel.growthThreshold - selectedMember.growthValue).toLocaleString() }} 成长值</span></div><div class="member-progress"><span :style="{ width: `${nextProgress}%` }"></span></div><div v-if="memberState.upgradeMode === 'condition'" class="member-hint">累计实付 {{ fmtMoney(selectedMember.totalPaid) }} / {{ fmtMoney(nextLevel.condition.paidAmount) }} · 有效订单 {{ selectedMember.validOrderCount }} / {{ nextLevel.condition.validOrderCount }} · {{ nextLevel.condition.relation === 'all' ? '需满足全部条件' : '满足任一条件即可' }}</div></template>
          <template v-else><div class="member-callout"><div><strong>已达到当前最高等级</strong><p>新增更高级别后，会员将继续按全局升级模式判断。</p></div></div></template>
          <div class="member-divider"></div>
          <div class="member-section-row"><div><div class="member-card-title">会员标签</div><div class="member-card-subtitle">停用标签仍保留在会员资料中，不能继续添加。</div></div><div class="member-inline"><select v-model="detailTagId" class="member-select"><option value="">选择启用中的标签</option><option v-for="tag in activeTags" :key="tag.id" :value="tag.id">{{ tag.name }}</option></select><button class="btn btn-secondary" :disabled="!detailTagId" @click="addDetailTag">添加</button></div></div>
          <div class="member-tags"> <span v-for="tagId in selectedMember.tagIds" :key="tagId" class="member-tag-chip blue">{{ getTag(tagId)?.name ?? '已删除标签' }}<button class="member-link" style="margin-left:6px" @click="removeTag([selectedMember!.id], tagId)">×</button></span><span v-if="!selectedMember.tagIds.length" class="member-person-meta">暂无标签</span></div>
          <div class="member-divider"></div>
          <div class="member-section-row"><div><div class="member-card-title">消费与退款记录</div><div class="member-card-subtitle">订单完成和退款数据会按当前升级规则更新会员成长与等级。</div></div></div>
          <div class="member-form-grid"><div class="form-field"><label>订单实付金额</label><div class="member-inline"><input v-model.number="orderAmount" class="member-input" type="number" min="0.01" step="0.01" /><button class="btn btn-primary" @click="applyOrder">登记订单完成</button></div><div class="member-hint">成长值模式按实付金额和设置汇率计算；条件模式更新消费金额与有效订单数。</div></div><div class="form-field"><label>退款金额</label><div class="member-inline"><input v-model.number="refundAmount" class="member-input" type="number" min="0.01" step="0.01" /><button class="btn btn-secondary" @click="applyRefund">登记退款</button></div><label class="member-inline" style="margin-top:4px"><input v-model="refundFull" type="checkbox" />全额退款（有效订单数减 1）</label></div></div>
        </template>
        <template v-else-if="detailTab === 'benefits'"><div v-if="memberState.grants.filter((grant) => grant.memberId === selectedMember!.id).length"><div v-for="grant in memberState.grants.filter((item) => item.memberId === selectedMember!.id)" :key="grant.id" class="member-benefit-card"><div><div class="member-benefit-title">{{ getBenefit(grant.benefitId)?.name ?? '会员券权益' }}</div><div class="member-benefit-meta">{{ getLevel(grant.levelId)?.name }} · 应发 {{ grant.expectedQuantity }} 张 / 已发 {{ grant.actualQuantity }} 张 · {{ grant.createdAt }}</div></div><span class="member-pill" :class="grant.status === 'success' ? 'pill-success' : 'pill-failed'">{{ grant.status === 'success' ? '发放成功' : `发放失败：${grant.failureReason}` }}</span></div></div><div v-else class="member-empty">暂无等级权益发放记录</div></template>
        <template v-else-if="detailTab === 'levels'"><div v-if="selectedMember.levelLogs.length" class="member-table-wrap"><table class="member-table"><thead><tr><th>原等级</th><th>新等级</th><th>变更方式</th><th>触发原因</th><th>操作人</th><th>时间</th></tr></thead><tbody><tr v-for="log in selectedMember.levelLogs" :key="log.id"><td>{{ getLevel(log.fromLevelId)?.name }}</td><td class="strong-cell">{{ getLevel(log.toLevelId)?.name }}</td><td>{{ log.changeType === 'automatic' ? '系统自动升级' : '后台人工调整' }}</td><td>{{ log.reason }}</td><td>{{ log.operator }}</td><td class="member-time">{{ log.createdAt }}</td></tr></tbody></table></div><div v-else class="member-empty">暂无等级变更记录</div></template>
        <template v-else><div v-if="selectedMember.growthLogs.length" class="member-table-wrap"><table class="member-table"><thead><tr><th>变动时间</th><th>变动类型</th><th>变动值</th><th>变动前</th><th>变动后</th><th>来源 / 关联记录</th><th>备注</th></tr></thead><tbody><tr v-for="log in selectedMember.growthLogs" :key="log.id"><td class="member-time">{{ log.createdAt }}</td><td>{{ log.changeValue >= 0 ? '获得' : '退款扣回' }}</td><td class="member-number">{{ log.changeValue > 0 ? '+' : '' }}{{ log.changeValue }}</td><td>{{ log.beforeValue }}</td><td>{{ log.afterValue }}</td><td>{{ log.source }}<div class="member-person-meta">{{ log.relatedOrder }}</div></td><td>{{ log.remark }}</td></tr></tbody></table></div><div v-else class="member-empty">暂无成长值变更记录；订单完成后将自动生成记录。</div></template>
      </template>
    </MemberModal>

    <MemberModal :open="adjustOpen" title="调整会员等级" width="520px" @close="adjustOpen = false">
      <div class="member-form-grid"><div class="form-field span-2"><label>当前等级</label><input class="member-input" :value="getLevel(selectedMember?.currentLevelId ?? '')?.name" disabled /></div><div class="form-field span-2"><label class="field-required">调整后等级</label><select v-model="adjustLevelId" class="member-select"><option value="">请选择等级</option><option v-for="level in activeLevels" :key="level.id" :value="level.id">{{ level.name }}</option></select></div><div class="form-field span-2"><label class="field-required">调整原因</label><textarea v-model="adjustReason" class="member-textarea" maxlength="120" placeholder="请说明本次调整原因，最多 120 字"></textarea></div><div class="span-2 member-callout"><div><strong>人工升至更高等级会触发首次权益</strong><p>降级不会回收已发优惠券；后续自动升级仍按当前规则判断。</p></div></div></div>
      <template #footer><button class="btn btn-secondary" @click="adjustOpen = false">取消</button><button class="btn btn-primary" @click="applyManualLevel">确认调整</button></template>
    </MemberModal>
  </div>
</template>
