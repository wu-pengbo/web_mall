<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import MemberModal from '@/components/member/MemberModal.vue'
import { getCoupon, getLevel, memberState, restoreCouponAvailability, saveBenefit, toggleBenefitStatus } from '@/stores/member'
import { notifyMember } from '@/stores/member-ui'
import type { MemberBenefit } from '@/types/member'

const editorOpen = ref(false)
const editingId = ref('')
const statusFilter = ref('')
const keyword = ref('')
const form = reactive({ name: '', couponId: '', couponQuantity: 1, levelId: '', status: 'enabled' as 'enabled' | 'disabled', description: '' })
const editingBenefit = computed(() => memberState.benefits.find((benefit) => benefit.id === editingId.value))
const activeLevels = computed(() => memberState.levels.filter((level) => level.status === 'enabled').sort((a, b) => a.order - b.order))
const filteredBenefits = computed(() => memberState.benefits.filter((benefit) =>
  (!keyword.value.trim() || benefit.name.includes(keyword.value.trim()) || (getLevel(benefit.levelId)?.name ?? '').includes(keyword.value.trim())) &&
  (!statusFilter.value || benefit.status === statusFilter.value),
))
const usedBenefits = computed(() => memberState.benefits.filter((benefit) => memberState.grants.some((grant) => grant.benefitId === benefit.id)).length)

const openCreate = () => {
  editingId.value = ''
  Object.assign(form, { name: '', couponId: memberState.coupons.find((coupon) => coupon.status === 'enabled')?.id ?? '', couponQuantity: 1, levelId: activeLevels.value.at(-1)?.id ?? '', status: 'enabled', description: '' })
  editorOpen.value = true
}
const openEdit = (benefit: MemberBenefit) => {
  editingId.value = benefit.id
  Object.assign(form, { name: benefit.name, couponId: benefit.couponId, couponQuantity: benefit.couponQuantity, levelId: benefit.levelId, status: benefit.status, description: benefit.description })
  editorOpen.value = true
}
const save = () => {
  if (!form.name.trim()) return notifyMember('请输入权益名称', 'error')
  if ([...form.name.trim()].length > 30) return notifyMember('权益名称最多 30 个字符', 'error')
  if (!form.couponId || !form.levelId) return notifyMember('请选择优惠券和绑定等级', 'error')
  if (!Number.isInteger(Number(form.couponQuantity)) || form.couponQuantity < 1) return notifyMember('发放张数必须是正整数', 'error')
  const success = saveBenefit({ ...form, couponQuantity: Number(form.couponQuantity), name: form.name.trim() }, editingId.value || undefined)
  if (!success) return notifyMember('保存失败，请检查权益配置', 'error')
  editorOpen.value = false
  notifyMember(editingId.value ? '权益已更新' : '权益已创建', 'success')
}
const switchStatus = (benefit: MemberBenefit) => {
  const status = benefit.status === 'enabled' ? 'disabled' : 'enabled'
  toggleBenefitStatus(benefit.id, status)
  notifyMember(status === 'enabled' ? '权益已启用' : '权益已停用', 'success')
}
const restoreCoupon = (couponId: string) => {
  if (!restoreCouponAvailability(couponId)) return notifyMember('该优惠券当前不可用', 'error')
  notifyMember('优惠券已启用，库存已补充', 'success')
}
</script>

<template>
  <div class="member-page">
    <header class="member-page-header"><div><h1>会员权益</h1><p>V1 仅支持按会员等级赠送优惠券。权益首次达到时发放，失败不影响等级，可在发放记录中重试。</p></div><button class="btn btn-primary" :disabled="!activeLevels.length" @click="openCreate">新建送券权益</button></header>
    <section class="member-stats">
      <article class="member-stat"><div class="member-stat-label">权益总数</div><div class="member-stat-value">{{ memberState.benefits.length }}</div><div class="member-stat-note">优惠券权益配置</div></article>
      <article class="member-stat"><div class="member-stat-label">启用中</div><div class="member-stat-value">{{ memberState.benefits.filter((benefit) => benefit.status === 'enabled').length }}</div><div class="member-stat-note">达到等级时触发</div></article>
      <article class="member-stat"><div class="member-stat-label">已绑定等级</div><div class="member-stat-value">{{ new Set(memberState.benefits.map((benefit) => benefit.levelId)).size }}</div><div class="member-stat-note">等级可绑定多项权益</div></article>
      <article class="member-stat"><div class="member-stat-label">产生发放记录</div><div class="member-stat-value">{{ usedBenefits }}</div><div class="member-stat-note">修改权益不会追溯补发</div></article>
    </section>
    <section class="member-card">
      <div class="member-toolbar"><div class="member-filters"><div class="filter-field"><label>搜索权益</label><input v-model="keyword" class="member-input input-search" placeholder="权益名称或绑定等级" /></div><div class="filter-field"><label>状态</label><select v-model="statusFilter" class="member-select"><option value="">全部状态</option><option value="enabled">启用</option><option value="disabled">停用</option></select></div></div><span class="member-pill pill-neutral">{{ filteredBenefits.length }} 项权益</span></div>
      <div v-if="!memberState.benefits.length" class="member-empty"><div style="color:#1d2129;font-size:15px;font-weight:600">暂未配置会员权益</div><p style="margin:6px 0 14px">系统初始化不创建默认权益；选择等级和优惠券后即可添加送券规则。</p><button class="btn btn-primary" :disabled="!activeLevels.length" @click="openCreate">创建第一项权益</button></div>
      <div v-else class="member-table-wrap"><table class="member-table"><thead><tr><th>权益名称</th><th>权益类型</th><th>绑定优惠券</th><th>发放数量</th><th>绑定等级</th><th>发放时机</th><th>状态</th><th>操作</th></tr></thead><tbody>
        <tr v-for="benefit in filteredBenefits" :key="benefit.id"><td><div class="member-person-name">{{ benefit.name }}</div><div class="member-person-meta">{{ benefit.description || '—' }}</div></td><td><span class="member-pill pill-info">送优惠券</span></td><td><div class="member-person-name">{{ getCoupon(benefit.couponId)?.name ?? '优惠券已删除' }}</div><div v-if="getCoupon(benefit.couponId)" class="member-person-meta">面额 ¥{{ getCoupon(benefit.couponId)!.faceValue }} · 库存 {{ getCoupon(benefit.couponId)!.stock }}</div></td><td class="member-number">{{ benefit.couponQuantity }} 张 / 次</td><td>{{ getLevel(benefit.levelId)?.name ?? '等级已删除' }}</td><td>首次达到等级</td><td><span class="member-pill" :class="benefit.status === 'enabled' ? 'pill-enabled' : 'pill-disabled'">{{ benefit.status === 'enabled' ? '启用' : '停用' }}</span></td><td><div class="member-actions"><button class="member-link" @click="openEdit(benefit)">编辑</button><button class="member-link" @click="switchStatus(benefit)">{{ benefit.status === 'enabled' ? '停用' : '启用' }}</button></div></td></tr>
        <tr v-if="filteredBenefits.length === 0"><td colspan="8" class="member-empty">没有符合筛选条件的权益</td></tr>
      </tbody></table></div>
    </section>
    <section class="member-card">
      <div class="member-section-row"><div><h2 class="member-card-title">可选优惠券</h2><p class="member-card-subtitle">创建权益前，请确认优惠券状态和库存。</p></div></div>
      <div class="member-table-wrap"><table class="member-table"><thead><tr><th>优惠券</th><th>面额</th><th>使用门槛</th><th>有效期</th><th>库存</th><th>状态</th><th>操作</th></tr></thead><tbody>
        <tr v-for="coupon in memberState.coupons" :key="coupon.id"><td class="strong-cell">{{ coupon.name }}</td><td class="member-number">¥{{ coupon.faceValue }}</td><td>{{ coupon.threshold ? `满 ¥${coupon.threshold} 可用` : '无门槛' }}</td><td>{{ coupon.validDays ? `${coupon.validDays} 天` : '已过期' }}</td><td class="member-number">{{ coupon.stock.toLocaleString() }}</td><td><span class="member-pill" :class="coupon.status === 'enabled' ? 'pill-enabled' : 'pill-disabled'">{{ coupon.status === 'enabled' ? '可用' : '失效' }}</span></td><td><button v-if="coupon.validDays > 0 && (coupon.status === 'disabled' || coupon.stock === 0)" class="member-link" @click="restoreCoupon(coupon.id)">启用并补充库存</button><span v-else class="member-person-meta">—</span></td></tr>
      </tbody></table></div>
    </section>

    <MemberModal :open="editorOpen" :title="editingBenefit ? '编辑送券权益' : '新建送券权益'" width="700px" @close="editorOpen = false">
      <div class="member-form-grid">
        <div class="form-field span-2"><div class="member-card-title">基本信息</div><div class="member-divider"></div></div>
        <div class="form-field"><label class="field-required">权益名称</label><input v-model="form.name" class="member-input" maxlength="30" placeholder="例如：银卡升级礼" /></div>
        <div class="form-field"><label>权益状态</label><select v-model="form.status" class="member-select"><option value="enabled">启用</option><option value="disabled">停用</option></select></div>
        <div class="form-field span-2"><label>权益说明</label><textarea v-model="form.description" class="member-textarea" maxlength="100" placeholder="描述本项送券权益（选填）"></textarea></div>
        <div class="form-field span-2"><div class="member-card-title">优惠规则</div><div class="member-divider"></div></div>
        <div class="form-field span-2"><label class="field-required">关联优惠券</label><select v-model="form.couponId" class="member-select"><option value="">请选择优惠券</option><option v-for="coupon in memberState.coupons" :key="coupon.id" :value="coupon.id">{{ coupon.name }} · ¥{{ coupon.faceValue }} · {{ coupon.status === 'enabled' ? `库存 ${coupon.stock}` : '已失效' }}</option></select><div class="member-hint">不可用或库存不足的优惠券会记录发放失败原因。</div></div>
        <div class="form-field"><label class="field-required">每次发放张数</label><input v-model.number="form.couponQuantity" class="member-input" type="number" min="1" step="1" /></div>
        <div class="form-field"><label class="field-required">绑定会员等级</label><select v-model="form.levelId" class="member-select"><option value="">请选择等级</option><option v-for="level in activeLevels" :key="level.id" :value="level.id">{{ level.name }}</option></select></div>
        <div class="span-2 member-callout"><div><strong>触发时机：首次达到等级</strong><p>跨级时按途经等级逐个检查；历史已发记录不会重复发放。权益配置修改后不追溯补发。</p></div></div>
      </div>
      <template #footer><button class="btn btn-secondary" @click="editorOpen = false">取消</button><button class="btn btn-primary" @click="save">保存权益</button></template>
    </MemberModal>
  </div>
</template>
