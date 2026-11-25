<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import MemberModal from '@/components/member/MemberModal.vue'
import { countMembersAtLevel, deleteLevel, memberState, moveLevel, recalculateAllMembers, saveLevel, setGrowthPerYuan, toggleLevelStatus } from '@/stores/member'
import { notifyMember } from '@/stores/member-ui'
import type { ActiveStatus, ConditionRelation, MemberLevel, UpgradeMode } from '@/types/member'

const advancedLevels = computed(() => memberState.levels.filter((level) => !level.isDefault).sort((a, b) => a.order - b.order))
const modeName = computed(() => memberState.upgradeMode === 'growth' ? '成长值升级' : memberState.upgradeMode === 'condition' ? '条件升级' : '尚未选择')
const editorOpen = ref(false)
const editingId = ref('')
const firstMode = ref<Exclude<UpgradeMode, null>>('growth')
const growthRateInput = ref(memberState.growthPerYuan)
const recalcOpen = ref(false)
const deleteTarget = ref<MemberLevel | null>(null)
const deleteOpen = ref(false)
const form = reactive({ name: '', growthThreshold: 1000, paidAmount: 1000, validOrderCount: 5, relation: 'all' as ConditionRelation, description: '', status: 'enabled' as ActiveStatus })
const editingLevel = computed(() => memberState.levels.find((level) => level.id === editingId.value))

const openCreate = () => {
  editingId.value = ''
  firstMode.value = memberState.upgradeMode ?? 'growth'
  Object.assign(form, { name: '', growthThreshold: 1000, paidAmount: 1000, validOrderCount: 5, relation: 'all', description: '', status: 'enabled' })
  editorOpen.value = true
}
const openEdit = (level: MemberLevel) => {
  editingId.value = level.id
  Object.assign(form, { name: level.name, growthThreshold: level.growthThreshold, paidAmount: level.condition.paidAmount, validOrderCount: level.condition.validOrderCount, relation: level.condition.relation, description: level.description, status: level.status })
  editorOpen.value = true
}
const validateForm = () => {
  if (!form.name.trim()) return '请输入等级名称'
  if ([...form.name.trim()].length > 20) return '等级名称最多 20 个字符'
  if (memberState.levels.some((level) => level.name === form.name.trim() && level.id !== editingId.value)) return '等级名称不可重复'
  if (memberState.upgradeMode === 'growth' || (!editingId.value && firstMode.value === 'growth')) {
    if (!Number.isFinite(form.growthThreshold) || form.growthThreshold <= 0) return '成长值门槛必须大于 0'
    const higher = advancedLevels.value.filter((level) => level.id !== editingId.value).map((level) => level.growthThreshold)
    if (higher.length && form.growthThreshold <= Math.max(...higher)) return '新等级成长值门槛必须高于现有等级'
  } else {
    if (form.paidAmount <= 0 || form.validOrderCount <= 0) return '累计实付金额和有效订单数门槛都必须大于 0'
    const existing = advancedLevels.value.filter((level) => level.id !== editingId.value)
    if (existing.length) {
      const maxPaid = Math.max(...existing.map((level) => level.condition.paidAmount))
      const maxOrders = Math.max(...existing.map((level) => level.condition.validOrderCount))
      if (form.paidAmount < maxPaid || form.validOrderCount < maxOrders || (form.paidAmount === maxPaid && form.validOrderCount === maxOrders)) return '高等级条件门槛不得低于现有等级'
    }
  }
  return ''
}
const save = () => {
  const error = validateForm()
  if (error) return notifyMember(error, 'error')
  const selectedMode = memberState.upgradeMode ?? firstMode.value
  const success = saveLevel({
    name: form.name.trim(),
    growthThreshold: selectedMode === 'growth' ? Number(form.growthThreshold) : 0,
    condition: { paidAmount: Number(form.paidAmount), validOrderCount: Number(form.validOrderCount), relation: form.relation },
    description: form.description.trim(),
    status: form.status,
  }, editingId.value || undefined, firstMode.value)
  if (!success) return notifyMember('等级保存失败，请检查当前配置', 'error')
  editorOpen.value = false
  notifyMember(editingId.value ? '等级已更新' : '高级等级已创建', 'success')
}
const saveGrowthRate = () => {
  if (!setGrowthPerYuan(Number(growthRateInput.value))) return notifyMember('成长值汇率必须大于 0', 'error')
  notifyMember(`已设置每实际支付 1 元获得 ${growthRateInput.value} 成长值`, 'success')
}
const confirmLevelStatus = (level: MemberLevel) => {
  const next = level.status === 'enabled' ? 'disabled' : 'enabled'
  if (!toggleLevelStatus(level.id, next)) return notifyMember('仍有会员处于该等级，暂不能停用', 'error')
  notifyMember(next === 'enabled' ? '等级已启用' : '等级已停用', 'success')
}
const changeOrder = (level: MemberLevel, direction: -1 | 1) => {
  if (!moveLevel(level.id, direction)) return notifyMember('调整顺序会破坏当前门槛递增关系，请先调整等级条件', 'error')
  notifyMember('等级顺序已调整', 'success')
}
const askDelete = (level: MemberLevel) => {
  deleteTarget.value = level
  deleteOpen.value = true
}
const remove = () => {
  if (!deleteTarget.value) return
  const success = deleteLevel(deleteTarget.value.id)
  if (!success) return notifyMember('该等级已有会员、等级记录或权益发放记录，不能删除', 'error')
  deleteOpen.value = false
  notifyMember('等级已删除', 'success')
}
const recalculate = () => {
  const count = recalculateAllMembers()
  recalcOpen.value = false
  notifyMember(`重新计算完成，${count} 位会员升级`, 'success')
}
const conditionText = (level: MemberLevel) => `${level.condition.relation === 'all' ? '全部' : '任一'}：实付 ¥${level.condition.paidAmount.toLocaleString()} · 有效订单 ${level.condition.validOrderCount} 单`
</script>

<template>
  <div class="member-page">
    <header class="member-page-header"><div><h1>会员等级</h1><p>配置等级顺序与全局升级方式。普通会员由系统固定提供，不能删除或停用。</p></div><div class="member-head-actions"><button class="btn btn-secondary" :disabled="!advancedLevels.length" @click="recalcOpen = true">重新计算会员等级</button><button class="btn btn-primary" @click="openCreate">新建高级等级</button></div></header>
    <section class="member-stats">
      <article class="member-stat"><div class="member-stat-label">等级数量</div><div class="member-stat-value">{{ memberState.levels.length }}</div><div class="member-stat-note">含系统默认普通会员</div></article>
      <article class="member-stat"><div class="member-stat-label">高级等级</div><div class="member-stat-value">{{ advancedLevels.length }}</div><div class="member-stat-note">按从低到高顺序展示</div></article>
      <article class="member-stat"><div class="member-stat-label">当前升级方式</div><div class="member-stat-value" style="font-size:17px;line-height:1.3">{{ modeName }}</div><div class="member-stat-note">{{ advancedLevels.length ? '所有高级等级统一使用' : '首次创建高级等级时选择' }}</div></article>
      <article class="member-stat"><div class="member-stat-label">已绑定权益</div><div class="member-stat-value">{{ memberState.benefits.filter((benefit) => benefit.status === 'enabled').length }}</div><div class="member-stat-note">权益在会员权益模块配置</div></article>
    </section>

    <section class="member-card">
      <div class="member-section-row"><div><h2 class="member-card-title">升级方式</h2><p class="member-card-subtitle">全商城统一选择一种升级规则；仅有普通会员时可以暂不选择。</p></div><span class="member-pill" :class="advancedLevels.length ? 'pill-warning' : 'pill-neutral'">{{ advancedLevels.length ? '已锁定' : '待首次创建等级' }}</span></div>
      <div class="member-mode-grid">
        <div class="member-mode-option" :class="{ selected: memberState.upgradeMode === 'growth' }"><strong>成长值升级</strong><p>会员累计消费成长值达到等级门槛后自动升级。退款可扣回成长值，等级不自动降级。</p></div>
        <div class="member-mode-option" :class="{ selected: memberState.upgradeMode === 'condition' }"><strong>条件升级</strong><p>根据累计有效实付金额和有效订单数升级，支持“满足全部”或“满足任一”条件。</p></div>
      </div>
      <div v-if="advancedLevels.length" class="member-hint" style="margin-top:12px">当前升级方式：<strong>{{ modeName }}</strong>。存在高级等级时不可直接切换。</div>
      <div v-else class="member-hint" style="margin-top:12px">首次保存高级等级时选择升级方式；保存后该模式与等级配置一起锁定。</div>
      <template v-if="memberState.upgradeMode === 'growth'">
        <div class="member-divider"></div>
        <div class="member-section-row"><div><div class="member-card-title">消费成长值规则</div><div class="member-card-subtitle">按订单实付金额计算，金额小数部分向下取整。</div></div><div class="member-inline"><span>每 ¥1 实付 =</span><input v-model.number="growthRateInput" class="member-input" type="number" min="0.01" step="0.1" style="width:100px" /><span>成长值</span><button class="btn btn-secondary" @click="saveGrowthRate">保存规则</button></div></div>
      </template>
    </section>

    <section class="member-card">
      <div class="member-section-row"><div><h2 class="member-card-title">等级列表</h2><p class="member-card-subtitle">会员自动计算只升级不降级；一次跨越多个等级时会一次到达最高满足等级。</p></div><span class="member-pill pill-info">{{ memberState.levels.length }} 个等级</span></div>
      <div class="member-table-wrap"><table class="member-table"><thead><tr><th>等级顺序</th><th>等级名称</th><th>升级条件</th><th>会员人数</th><th>权益数量</th><th>状态</th><th>操作</th></tr></thead><tbody>
        <tr v-for="level in memberState.levels" :key="level.id"><td><div class="member-inline"><span class="member-number">{{ String(level.order).padStart(2, '0') }}</span><template v-if="!level.isDefault"><button class="member-link" aria-label="上移" :disabled="level.order <= 2" @click="changeOrder(level, -1)">↑</button><button class="member-link" aria-label="下移" :disabled="level.order >= memberState.levels.length" @click="changeOrder(level, 1)">↓</button></template></div></td><td><div class="member-person-name">{{ level.name }} <span v-if="level.isDefault" class="member-pill pill-info">系统默认</span></div><div class="member-person-meta">{{ level.description || '—' }}</div></td><td><span v-if="level.isDefault" class="member-person-meta">注册后自动获得，无门槛</span><span v-else-if="memberState.upgradeMode === 'growth'" class="member-number">{{ level.growthThreshold.toLocaleString() }} 成长值</span><span v-else>{{ conditionText(level) }}</span></td><td><span class="member-number">{{ countMembersAtLevel(level.id) }}</span></td><td><span class="member-number">{{ memberState.benefits.filter((benefit) => benefit.levelId === level.id).length }}</span></td><td><span class="member-pill" :class="level.status === 'enabled' ? 'pill-enabled' : 'pill-disabled'">{{ level.isDefault ? '固定启用' : level.status === 'enabled' ? '启用' : '停用' }}</span></td><td><div v-if="!level.isDefault" class="member-actions"><button class="member-link" @click="openEdit(level)">编辑</button><button class="member-link" :disabled="level.status === 'enabled' && countMembersAtLevel(level.id) > 0" @click="confirmLevelStatus(level)">{{ level.status === 'enabled' ? '停用' : '启用' }}</button><button class="member-link danger" @click="askDelete(level)">删除</button></div><span v-else class="member-person-meta">不可编辑 · 不可删除</span></td></tr>
      </tbody></table></div>
    </section>

    <MemberModal :open="editorOpen" :title="editingLevel ? `编辑${editingLevel.name}` : '新建高级等级'" width="700px" @close="editorOpen = false">
      <div class="member-form-grid">
        <template v-if="!editingId && !advancedLevels.length">
          <div class="form-field span-2"><label class="field-required">选择全局升级方式</label><div class="member-mode-grid"><button type="button" class="member-mode-option" :class="{ selected: firstMode === 'growth' }" @click="firstMode = 'growth'"><strong>成长值升级</strong><p>会员累计成长值达到对应等级门槛后升级。</p></button><button type="button" class="member-mode-option" :class="{ selected: firstMode === 'condition' }" @click="firstMode = 'condition'"><strong>条件升级</strong><p>会员达到实付金额或有效订单数条件后升级。</p></button></div></div>
        </template>
        <div class="form-field"><label class="field-required">等级名称</label><input v-model="form.name" class="member-input" maxlength="20" placeholder="例如：银卡会员" /></div>
        <div class="form-field"><label>等级状态</label><select v-model="form.status" class="member-select"><option value="enabled">启用</option><option value="disabled">停用</option></select></div>
        <div v-if="memberState.upgradeMode === 'growth' || (!editingId && firstMode === 'growth')" class="form-field span-2"><label class="field-required">升级所需成长值</label><input v-model.number="form.growthThreshold" class="member-input" type="number" min="1" /><div class="member-hint">等级门槛必须高于普通会员及所有较低等级。</div></div>
        <template v-else>
          <div class="form-field"><label>累计有效实付金额（元）</label><input v-model.number="form.paidAmount" class="member-input" type="number" min="0" step="0.01" /></div>
          <div class="form-field"><label>累计有效订单数</label><input v-model.number="form.validOrderCount" class="member-input" type="number" min="0" step="1" /></div>
          <div class="form-field span-2"><label>多条件关系</label><div class="segmented-control"><button class="segmented-btn" :class="{ active: form.relation === 'all' }" @click="form.relation = 'all'">满足全部条件（AND）</button><button class="segmented-btn" :class="{ active: form.relation === 'any' }" @click="form.relation = 'any'">满足任一条件（OR）</button></div><div class="member-hint">金额和订单条件均为 0 时无法保存。</div></div>
        </template>
        <div class="form-field span-2"><label>等级说明</label><textarea v-model="form.description" class="member-textarea" maxlength="100" placeholder="填写等级说明（选填）"></textarea></div>
        <div class="span-2 member-callout"><div><strong>新等级默认不绑定任何权益</strong><p>保存后可到“会员权益”配置该等级首次达成时发放的优惠券。</p></div></div>
      </div>
      <template #footer><button class="btn btn-secondary" @click="editorOpen = false">取消</button><button class="btn btn-primary" @click="save">保存等级</button></template>
    </MemberModal>

    <MemberModal :open="recalcOpen" title="重新计算会员等级" width="520px" @close="recalcOpen = false"><div class="member-callout"><div><strong>将按当前等级规则检查全部 {{ memberState.members.length }} 位会员</strong><p>仅为满足更高等级条件的会员升级，不会自动降级；符合跨级条件时直接到达最高等级，并尝试发放途经等级中尚未发过的权益。</p></div></div><template #footer><button class="btn btn-secondary" @click="recalcOpen = false">取消</button><button class="btn btn-primary" @click="recalculate">开始重新计算</button></template></MemberModal>

    <MemberModal :open="deleteOpen" title="删除会员等级" width="500px" @close="deleteOpen = false"><div class="member-callout"><div><strong>确认删除“{{ deleteTarget?.name }}”？</strong><p>只有从未有会员达到、没有等级记录和权益发放记录的等级才可删除。默认普通会员始终保留。</p></div></div><template #footer><button class="btn btn-secondary" @click="deleteOpen = false">取消</button><button class="btn btn-danger" @click="remove">确认删除</button></template></MemberModal>
  </div>
</template>
