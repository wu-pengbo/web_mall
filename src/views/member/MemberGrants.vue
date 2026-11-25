<script setup lang="ts">
import { computed, ref } from 'vue'
import MemberModal from '@/components/member/MemberModal.vue'
import { getBenefit, getCoupon, getLevel, getMember, memberState, retryGrant } from '@/stores/member'
import { notifyMember } from '@/stores/member-ui'
import type { BenefitGrant } from '@/types/member'

const statusFilter = ref('')
const triggerFilter = ref('')
const keyword = ref('')
const detailGrant = ref<BenefitGrant | null>(null)
const filteredGrants = computed(() => memberState.grants.filter((grant) => {
  const member = getMember(grant.memberId)
  const query = keyword.value.trim().toLowerCase()
  return (!query || grant.id.toLowerCase().includes(query) || (member?.nickname ?? '').toLowerCase().includes(query) || grant.memberId.toLowerCase().includes(query) || (getBenefit(grant.benefitId)?.name ?? '').toLowerCase().includes(query)) &&
    (!statusFilter.value || grant.status === statusFilter.value) && (!triggerFilter.value || grant.triggerType === triggerFilter.value)
}))
const succeeded = computed(() => memberState.grants.filter((grant) => grant.status === 'success'))
const failed = computed(() => memberState.grants.filter((grant) => grant.status === 'failed'))
const expected = computed(() => memberState.grants.reduce((sum, grant) => sum + grant.expectedQuantity, 0))
const actual = computed(() => memberState.grants.reduce((sum, grant) => sum + grant.actualQuantity, 0))
const retry = (grant: BenefitGrant) => {
  const success = retryGrant(grant.id)
  notifyMember(success ? '补发成功，券库存已扣减' : `补发失败：${grant.failureReason}`, success ? 'success' : 'error')
}
</script>

<template>
  <div class="member-page">
    <header class="member-page-header"><div><h1>权益发放记录</h1><p>查看会员等级权益的发放状态。失败重试会更新原记录，不会创建重复记录。</p></div></header>
    <section class="member-stats">
      <article class="member-stat"><div class="member-stat-label">发放记录</div><div class="member-stat-value">{{ memberState.grants.length }}</div><div class="member-stat-note">按会员、等级和权益去重</div></article>
      <article class="member-stat"><div class="member-stat-label">成功记录</div><div class="member-stat-value">{{ succeeded.length }}</div><div class="member-stat-note">成功 {{ actual }} / 应发 {{ expected }} 张</div></article>
      <article class="member-stat"><div class="member-stat-label">失败待处理</div><div class="member-stat-value">{{ failed.length }}</div><div class="member-stat-note">可检查原因后重试</div></article>
      <article class="member-stat"><div class="member-stat-label">补发次数</div><div class="member-stat-value">{{ memberState.grants.reduce((sum, grant) => sum + grant.retryCount, 0) }}</div><div class="member-stat-note">重试沿用原发放记录</div></article>
    </section>
    <section class="member-card">
      <div class="member-toolbar"><div class="member-filters"><div class="filter-field"><label>搜索记录</label><input v-model="keyword" class="member-input input-search" placeholder="会员、权益名称或记录编号" /></div><div class="filter-field"><label>发放状态</label><select v-model="statusFilter" class="member-select"><option value="">全部状态</option><option value="success">成功</option><option value="failed">失败</option></select></div><div class="filter-field"><label>触发方式</label><select v-model="triggerFilter" class="member-select"><option value="">全部方式</option><option value="automatic">系统升级</option><option value="manual">人工调整</option></select></div></div><span class="member-pill pill-neutral">{{ filteredGrants.length }} 条记录</span></div>
      <div v-if="!memberState.grants.length" class="member-empty"><div style="color:#1d2129;font-size:15px;font-weight:600">暂无权益发放记录</div><p style="margin:6px 0 0">会员首次达到已绑定权益的等级后，将在这里生成发放记录。</p></div>
      <div v-else class="member-table-wrap"><table class="member-table"><thead><tr><th>发放记录</th><th>会员</th><th>达到等级</th><th>会员权益</th><th>优惠券</th><th>应发 / 已发</th><th>触发方式</th><th>状态 / 失败原因</th><th>发放时间</th><th>操作</th></tr></thead><tbody>
        <tr v-for="grant in filteredGrants" :key="grant.id"><td><span class="member-id">{{ grant.id }}</span><div class="member-person-meta">{{ grant.createdAt }}</div></td><td><div class="member-person-name">{{ getMember(grant.memberId)?.nickname ?? '会员已删除' }}</div><div class="member-person-meta member-id">{{ grant.memberId }}</div></td><td>{{ getLevel(grant.levelId)?.name ?? '等级已删除' }}</td><td>{{ getBenefit(grant.benefitId)?.name ?? '权益已删除' }}</td><td>{{ getCoupon(grant.couponId)?.name ?? '优惠券已删除' }}</td><td class="member-number">{{ grant.expectedQuantity }} / {{ grant.actualQuantity }}</td><td>{{ grant.triggerType === 'automatic' ? '系统自动升级' : '后台人工调整' }}</td><td><span class="member-pill" :class="grant.status === 'success' ? 'pill-success' : 'pill-failed'">{{ grant.status === 'success' ? '成功' : '发放失败' }}</span><div v-if="grant.failureReason" class="member-person-meta">{{ grant.failureReason }}</div></td><td class="member-time">{{ grant.grantedAt || '—' }}</td><td><div class="member-actions"><button class="member-link" @click="detailGrant = grant">详情</button><button v-if="grant.status === 'failed'" class="member-link" @click="retry(grant)">重试</button></div></td></tr>
        <tr v-if="filteredGrants.length === 0"><td colspan="10" class="member-empty">没有符合筛选条件的发放记录</td></tr>
      </tbody></table></div>
    </section>
    <MemberModal :open="!!detailGrant" title="权益发放详情" width="600px" @close="detailGrant = null">
      <template v-if="detailGrant"><div class="member-detail-grid"><div class="detail-field"><label>会员</label><strong>{{ getMember(detailGrant.memberId)?.nickname }} · {{ detailGrant.memberId }}</strong></div><div class="detail-field"><label>触发等级</label><strong>{{ getLevel(detailGrant.levelId)?.name }}</strong></div><div class="detail-field"><label>权益</label><strong>{{ getBenefit(detailGrant.benefitId)?.name }}</strong></div><div class="detail-field"><label>优惠券</label><strong>{{ getCoupon(detailGrant.couponId)?.name }}</strong></div><div class="detail-field"><label>应发数量</label><strong>{{ detailGrant.expectedQuantity }} 张</strong></div><div class="detail-field"><label>实际发放</label><strong>{{ detailGrant.actualQuantity }} 张</strong></div><div class="detail-field"><label>触发类型</label><strong>{{ detailGrant.triggerType === 'automatic' ? '系统自动升级' : '后台人工调整' }}</strong></div><div class="detail-field"><label>重试次数</label><strong>{{ detailGrant.retryCount }}</strong></div><div class="detail-field"><label>业务来源</label><strong>{{ detailGrant.triggerSourceId || '—' }}</strong></div><div class="detail-field"><label>创建时间</label><strong>{{ detailGrant.createdAt }}</strong></div><div class="detail-field"><label>发放时间</label><strong>{{ detailGrant.grantedAt || '—' }}</strong></div><div class="detail-field"><label>状态</label><strong>{{ detailGrant.status === 'success' ? '成功' : '失败' }}</strong></div></div><div v-if="detailGrant.failureReason" class="member-callout" style="margin-top:16px"><div><strong>失败原因：{{ detailGrant.failureReason }}</strong><p>检查优惠券状态和库存后，可从记录列表重试。</p></div></div></template>
      <template #footer><button class="btn btn-secondary" @click="detailGrant = null">关闭</button><button v-if="detailGrant?.status === 'failed'" class="btn btn-primary" @click="retry(detailGrant!)">重试发放</button></template>
    </MemberModal>
  </div>
</template>
