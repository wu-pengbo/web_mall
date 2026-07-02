<script setup lang="ts">
import { ref, reactive, computed } from 'vue'

interface RechargePreset { id: string; amount: number; sort: number }
interface RechargeActivity {
  id: string; name: string; type: 'bonus' | 'discount'
  conditionAmount: number; bonusAmount?: number; discountPercent?: number
  startTime: string; endTime: string; perUserLimit: number; dailyLimit: number; enabled: boolean
}
interface RechargePlan {
  id: string; name: string; enabled: boolean; activeTime: string
  presets: RechargePreset[]; allowCustom: boolean
  customMin: number; customMax: number; activities: RechargeActivity[]
}

const rechargePlans = ref<RechargePlan[]>([
  { id: '1', name: '默认充值方案', enabled: true, activeTime: '2026-06-01 10:00:00',
    presets: [{ id: 'p1', amount: 50, sort: 1 }, { id: 'p2', amount: 100, sort: 2 }, { id: 'p3', amount: 200, sort: 3 }, { id: 'p4', amount: 500, sort: 4 }, { id: 'p5', amount: 1000, sort: 5 }],
    allowCustom: true, customMin: 1, customMax: 50000,
    activities: [
      { id: 'a1', name: '充100送10', type: 'bonus', conditionAmount: 100, bonusAmount: 10, startTime: '', endTime: '', perUserLimit: 0, dailyLimit: 0, enabled: true },
      { id: 'a2', name: '充500送50', type: 'bonus', conditionAmount: 500, bonusAmount: 50, startTime: '', endTime: '', perUserLimit: 0, dailyLimit: 0, enabled: true },
      { id: 'a3', name: '充1000打95折', type: 'discount', conditionAmount: 1000, discountPercent: 95, startTime: '', endTime: '', perUserLimit: 0, dailyLimit: 0, enabled: true },
    ]},
  { id: '2', name: '五一充值活动', enabled: false, activeTime: '',
    presets: [{ id: 'p6', amount: 100, sort: 1 }, { id: 'p7', amount: 300, sort: 2 }, { id: 'p8', amount: 500, sort: 3 }],
    allowCustom: false, customMin: 1, customMax: 50000,
    activities: [
      { id: 'a4', name: '充300送40', type: 'bonus', conditionAmount: 300, bonusAmount: 40, startTime: '2026-05-01 00:00:00', endTime: '2026-05-05 23:59:59', perUserLimit: 1, dailyLimit: 100, enabled: true },
      { id: 'a5', name: '充500打9折', type: 'discount', conditionAmount: 500, discountPercent: 90, startTime: '2026-05-01 00:00:00', endTime: '2026-05-05 23:59:59', perUserLimit: 1, dailyLimit: 50, enabled: true },
    ]},
])

const planEditModal = ref(false)
const planEditMode = ref<'create' | 'edit'>('create')
const planEditData = reactive<RechargePlan>({ id: '', name: '', enabled: false, activeTime: '', presets: [], allowCustom: true, customMin: 1, customMax: 50000, activities: [] })
const planDetailModal = ref(false)
const planDetailId = ref('')
const activityEditModal = ref(false)
const activityEditIndex = ref(-1)
const activityEditData = reactive<RechargeActivity>({ id: '', name: '', type: 'bonus', conditionAmount: 0, bonusAmount: 0, discountPercent: 100, startTime: '', endTime: '', perUserLimit: 0, dailyLimit: 0, enabled: true })

const openPlanCreate = () => {
  planEditMode.value = 'create'
  Object.assign(planEditData, { id: '', name: '', enabled: false, activeTime: '', presets: [{ id: 'new_1', amount: 100, sort: 1 }], allowCustom: true, customMin: 1, customMax: 50000, activities: [] })
  planEditModal.value = true
}
const openPlanEdit = (plan: RechargePlan) => {
  planEditMode.value = 'edit'
  Object.assign(planEditData, JSON.parse(JSON.stringify(plan)))
  planEditModal.value = true
}
const savePlan = () => {
  if (!planEditData.name.trim()) { alert('请输入方案名称'); return }
  if (planEditData.presets.length === 0) { alert('请至少添加一个预选金额'); return }
  if (planEditMode.value === 'create') {
    rechargePlans.value.push({ ...JSON.parse(JSON.stringify(planEditData)), id: String(Date.now()), enabled: false, activeTime: '' })
    alert('充值方案已创建')
  } else {
    const idx = rechargePlans.value.findIndex(p => p.id === planEditData.id)
    if (idx > -1) rechargePlans.value[idx] = JSON.parse(JSON.stringify(planEditData))
    alert('充值方案已保存')
  }
  planEditModal.value = false
}
const togglePlanEnabled = (plan: RechargePlan) => {
  if (plan.enabled) { plan.enabled = false; plan.activeTime = '' }
  else {
    rechargePlans.value.forEach(p => { p.enabled = false; p.activeTime = '' })
    plan.enabled = true; plan.activeTime = new Date().toLocaleString('zh-CN', { hour12: false })
  }
}
const deletePlan = (plan: RechargePlan) => {
  if (plan.enabled) { alert('生效中的方案不能删除，请先禁用'); return }
  if (!confirm('确认删除方案「' + plan.name + '」？')) return
  rechargePlans.value = rechargePlans.value.filter(p => p.id !== plan.id)
}
const addPreset = () => { planEditData.presets.push({ id: 'new_' + Date.now(), amount: 0, sort: planEditData.presets.length + 1 }) }
const removePreset = (index: number) => { planEditData.presets.splice(index, 1); planEditData.presets.forEach((p, i) => { p.sort = i + 1 }) }
const movePresetUp = (index: number) => {
  if (index <= 0) return; const list = planEditData.presets; [list[index - 1], list[index]] = [list[index], list[index - 1]]; list.forEach((p, i) => { p.sort = i + 1 })
}
const movePresetDown = (index: number) => {
  if (index >= planEditData.presets.length - 1) return; const list = planEditData.presets; [list[index], list[index + 1]] = [list[index + 1], list[index]]; list.forEach((p, i) => { p.sort = i + 1 })
}
const openActivityCreate = () => {
  activityEditIndex.value = -1
  Object.assign(activityEditData, { id: 'act_' + Date.now(), name: '', type: 'bonus', conditionAmount: 0, bonusAmount: 0, discountPercent: 100, startTime: '', endTime: '', perUserLimit: 0, dailyLimit: 0, enabled: true })
  activityEditModal.value = true
}
const openActivityEdit = (index: number) => { activityEditIndex.value = index; Object.assign(activityEditData, JSON.parse(JSON.stringify(planEditData.activities[index]))); activityEditModal.value = true }
const saveActivity = () => {
  if (!activityEditData.name.trim()) { alert('请输入活动名称'); return }
  if (activityEditData.conditionAmount <= 0) { alert('触发条件金额必须大于0'); return }
  if (activityEditData.type === 'bonus' && (!activityEditData.bonusAmount || activityEditData.bonusAmount <= 0)) { alert('赠送金额必须大于0'); return }
  if (activityEditData.type === 'discount' && (!activityEditData.discountPercent || activityEditData.discountPercent <= 0 || activityEditData.discountPercent >= 100)) { alert('折扣比例须在1~99之间'); return }
  if (activityEditIndex.value === -1) planEditData.activities.push(JSON.parse(JSON.stringify(activityEditData)))
  else planEditData.activities[activityEditIndex.value] = JSON.parse(JSON.stringify(activityEditData))
  activityEditModal.value = false
}
const removeActivity = (index: number) => { planEditData.activities.splice(index, 1) }
const planDetailData = computed(() => rechargePlans.value.find(p => p.id === planDetailId.value))
const openPlanDetail = (plan: RechargePlan) => { planDetailId.value = plan.id; planDetailModal.value = true }
</script>

<template>
  <div class="content-panel">
    <div class="panel-header">
      <h2>充值方案</h2>
      <button class="btn btn-primary" @click="openPlanCreate">+ 新增方案</button>
    </div>
    <div class="panel-body">
      <div class="plan-tip" style="margin-bottom: 16px; padding: 10px 14px; background: #FFF7E6; border-radius: 6px; color: #D46B08; font-size: 13px;">同一时间仅有一个方案生效，启用新方案将自动停用当前生效方案。</div>
      <table class="data-table">
        <thead><tr><th>方案名称</th><th>预选金额</th><th>活动数量</th><th>状态</th><th>生效时间</th><th>操作</th></tr></thead>
        <tbody>
          <tr v-for="plan in rechargePlans" :key="plan.id">
            <td><strong>{{ plan.name }}</strong></td>
            <td><span v-for="(p, i) in plan.presets" :key="p.id">{{ i > 0 ? ' / ' : '' }}¥{{ p.amount }}</span><span v-if="plan.allowCustom" style="color: #86909C; margin-left: 4px">+ 自定义</span></td>
            <td><span v-if="plan.activities.length === 0" style="color: #86909C">无</span><span v-else>{{ plan.activities.filter(a => a.enabled).length }}/{{ plan.activities.length }} 启用</span></td>
            <td><span class="status-tag" :class="plan.enabled ? 'refunded' : 'closed'">{{ plan.enabled ? '生效中' : '已禁用' }}</span></td>
            <td>{{ plan.activeTime || '-' }}</td>
            <td>
              <span class="action-link primary" @click="openPlanEdit(plan)">编辑</span>
              <span class="action-link primary" @click="openPlanDetail(plan)" style="margin-left: 8px">详情</span>
              <span :class="plan.enabled ? 'action-link danger' : 'action-link primary'" @click="togglePlanEnabled(plan)" style="margin-left: 8px">{{ plan.enabled ? '禁用' : '启用' }}</span>
              <span v-if="!plan.enabled" class="action-link danger" @click="deletePlan(plan)" style="margin-left: 8px">删除</span>
            </td>
          </tr>
          <tr v-if="rechargePlans.length === 0"><td colspan="6" style="text-align: center; color: #86909C; padding: 40px">暂无充值方案，点击上方新增</td></tr>
        </tbody>
      </table>
    </div>

    <!-- 弹窗：充值方案编辑 -->
    <div v-if="planEditModal" class="modal-overlay" @click.self="planEditModal = false">
      <div class="modal-content modal-lg">
        <div class="modal-header"><h3>{{ planEditMode === 'create' ? '新增充值方案' : '编辑充值方案' }}</h3><span class="modal-close" @click="planEditModal = false"><svg class="modal-close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg></span></div>
        <div class="modal-body">
          <div class="plan-section">
            <div class="plan-section-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4F6EF7" stroke-width="2" stroke-linecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg><span>基础信息</span></div>
            <div class="plan-section-body">
              <div class="form-item"><label class="form-label required">方案名称</label><input type="text" class="form-input form-input-lg" v-model="planEditData.name" placeholder="如：默认充值方案" /></div>
            </div>
          </div>
          <div class="plan-section">
            <div class="plan-section-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4F6EF7" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg><span>预选金额</span><span class="plan-count-badge">{{ planEditData.presets.length }}</span></div>
            <div class="plan-section-body">
              <div v-for="(preset, index) in planEditData.presets" :key="preset.id" class="plan-preset-row">
                <div class="plan-preset-card">
                  <span class="plan-preset-index">{{ index + 1 }}</span><span class="plan-preset-yen">¥</span>
                  <input type="number" class="form-input form-input-sm" v-model.number="preset.amount" placeholder="金额" min="1" />
                  <div class="plan-preset-actions">
                    <button class="plan-icon-btn" @click="movePresetUp(index)" :disabled="index === 0" title="上移"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="18 15 12 9 6 15"/></svg></button>
                    <button class="plan-icon-btn" @click="movePresetDown(index)" :disabled="index === planEditData.presets.length - 1" title="下移"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg></button>
                    <button class="plan-icon-btn plan-icon-btn-danger" @click="removePreset(index)" :disabled="planEditData.presets.length <= 1" title="删除"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
                  </div>
                </div>
              </div>
              <button class="plan-add-btn" @click="addPreset"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> 添加预选金额</button>
              <div class="plan-divider"></div>
              <div class="plan-custom-row">
                <label class="plan-toggle-label"><label class="toggle-switch" style="margin-right: 8px"><input type="checkbox" v-model="planEditData.allowCustom" /><span class="toggle-slider"></span></label><span>允许用户自定义金额</span></label>
                <template v-if="planEditData.allowCustom">
                  <div class="plan-custom-fields">
                    <div class="plan-custom-field"><span>最低</span><input type="number" class="form-input form-input-xs" v-model.number="planEditData.customMin" min="1" /><span>元</span></div>
                    <div class="plan-custom-field"><span>最高</span><input type="number" class="form-input form-input-xs" v-model.number="planEditData.customMax" min="1" /><span>元</span></div>
                  </div>
                </template>
              </div>
            </div>
          </div>
          <div class="plan-section">
            <div class="plan-section-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4F6EF7" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg><span>充值活动</span><span class="plan-count-badge">{{ planEditData.activities.length }}</span></div>
            <div class="plan-section-body">
              <div v-if="planEditData.activities.length === 0" class="plan-empty">暂无充值活动</div>
              <table v-else class="plan-activity-table">
                <thead><tr><th>活动名称</th><th>类型</th><th>触发条件</th><th>优惠内容</th><th>有效期</th><th style="width: 60px">启用</th><th>操作</th></tr></thead>
                <tbody>
                  <tr v-for="(act, index) in planEditData.activities" :key="act.id">
                    <td>{{ act.name }}</td>
                    <td><span class="plan-type-tag" :class="act.type === 'bonus' ? 'bonus' : 'discount'">{{ act.type === 'bonus' ? '赠送' : '折扣' }}</span></td>
                    <td class="plan-mono">≥ ¥{{ act.conditionAmount.toLocaleString() }}</td>
                    <td class="plan-mono plan-discount-amount">{{ act.type === 'bonus' ? '送 ¥' + (act.bonusAmount || 0).toLocaleString() : ((act.discountPercent || 0) / 10).toFixed(1) + '折' }}</td>
                    <td class="plan-mono">{{ act.startTime || act.endTime ? (act.startTime || '—') + ' ~ ' + (act.endTime || '—') : '永久' }}</td>
                    <td style="text-align: center"><label class="toggle-switch" style="margin: 0"><input type="checkbox" v-model="act.enabled" /><span class="toggle-slider"></span></label></td>
                    <td><span class="action-link primary" @click="openActivityEdit(index)">编辑</span><span class="action-link danger" @click="removeActivity(index)" style="margin-left: 8px">删除</span></td>
                  </tr>
                </tbody>
              </table>
              <button class="btn btn-primary btn-xs" @click="openActivityCreate" style="margin-top: 8px">+ 添加活动</button>
            </div>
          </div>
        </div>
        <div class="modal-footer"><button class="btn btn-default" @click="planEditModal = false">取消</button><button class="btn btn-primary" @click="savePlan">保存方案</button></div>
      </div>
    </div>

    <!-- 弹窗：充值活动编辑 -->
    <div v-if="activityEditModal" class="modal-overlay" @click.self="activityEditModal = false">
      <div class="modal-content activity-modal-content">
        <div class="modal-header"><h3>{{ activityEditIndex === -1 ? '添加充值活动' : '编辑充值活动' }}</h3><span class="modal-close" @click="activityEditModal = false"><svg class="modal-close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg></span></div>
        <div class="modal-body activity-form-grid">
          <div class="af-group-title">基本信息</div>
          <div class="form-item"><label class="form-label required">活动名称</label><div class="af-field"><input type="text" class="form-input form-input-xl" v-model="activityEditData.name" placeholder="如：充100送10" /></div></div>
          <div class="form-item"><label class="form-label required">活动类型</label><div class="af-field"><div class="segmented-control"><button type="button" class="segmented-btn" :class="{ active: activityEditData.type === 'bonus' }" @click="activityEditData.type = 'bonus'">赠送</button><button type="button" class="segmented-btn" :class="{ active: activityEditData.type === 'discount' }" @click="activityEditData.type = 'discount'">折扣</button></div></div></div>
          <div class="form-item"><label class="form-label required">触发条件</label><div class="af-field"><div class="af-control-row"><span>充值满</span><input type="number" class="form-input form-input-xs" v-model.number="activityEditData.conditionAmount" min="1" /><span>元</span></div></div></div>
          <div class="af-group-divider"></div>
          <div class="af-group-title">优惠规则</div>
          <div v-if="activityEditData.type === 'bonus'" class="form-item"><label class="form-label required">赠送金额</label><div class="af-field"><div class="af-control-row"><span>赠送</span><input type="number" class="form-input form-input-sm" v-model.number="activityEditData.bonusAmount" min="1" /><span>元</span></div><div class="af-field-hint">自动计算：充值满 ¥{{ activityEditData.conditionAmount }} 得 ¥{{ ((activityEditData.conditionAmount || 0) + (activityEditData.bonusAmount || 0)).toFixed(2) }}</div></div></div>
          <div v-if="activityEditData.type === 'discount'" class="form-item"><label class="form-label required">折扣比例</label><div class="af-field"><div class="af-control-row"><input type="number" class="form-input form-input-sm" v-model.number="activityEditData.discountPercent" min="1" max="99" /><span>%</span><span>即 {{ activityEditData.discountPercent ? (activityEditData.discountPercent / 10).toFixed(1) : '0.0' }} 折</span></div><div class="af-field-hint">充值 ¥{{ activityEditData.conditionAmount }}以上，打{{ activityEditData.discountPercent ? (activityEditData.discountPercent / 10).toFixed(1) : '0.0' }}折，如支付¥{{ ((activityEditData.conditionAmount || 0) * (activityEditData.discountPercent || 0) / 100).toFixed(2) }}得¥{{ activityEditData.conditionAmount }}</div></div></div>
          <div class="form-item"><label class="form-label">活动时间</label><div class="af-field"><div class="af-time-row"><input type="datetime-local" class="form-input form-input-md" v-model="activityEditData.startTime" placeholder="开始时间" /><span class="af-sep">至</span><input type="datetime-local" class="form-input form-input-md" v-model="activityEditData.endTime" placeholder="结束时间" /></div><div class="af-field-hint">留空表示永久有效</div></div></div>
        </div>
        <div class="modal-footer"><button class="btn btn-default" @click="activityEditModal = false">取消</button><button class="btn btn-primary" @click="saveActivity">保存活动</button></div>
      </div>
    </div>

    <!-- 弹窗：充值方案详情 -->
    <div v-if="planDetailModal" class="modal-overlay" @click.self="planDetailModal = false">
      <div class="modal-content modal-md">
        <div class="modal-header"><h3>方案详情</h3><span class="modal-close" @click="planDetailModal = false"><svg class="modal-close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg></span></div>
        <div class="modal-body" v-if="planDetailData">
          <div class="detail-grid">
            <div><label>方案名称</label><span>{{ planDetailData.name }}</span></div>
            <div><label>状态</label><span class="status-tag" :class="planDetailData.enabled ? 'refunded' : 'closed'">{{ planDetailData.enabled ? '生效中' : '已禁用' }}</span></div>
            <div><label>生效时间</label><span>{{ planDetailData.activeTime || '-' }}</span></div>
            <div><label>自定义金额</label><span>{{ planDetailData.allowCustom ? '允许（¥' + planDetailData.customMin + ' ~ ¥' + planDetailData.customMax + '）' : '不允许' }}</span></div>
          </div>
          <div class="detail-section"><div class="form-section-title">预选金额</div><div class="preset-list"><span v-for="p in planDetailData.presets" :key="p.id" class="preset-tag">¥{{ p.amount }}</span><span v-if="planDetailData.allowCustom" class="preset-tag preset-tag-dashed">自定义</span></div></div>
          <div class="detail-section"><div class="form-section-title">充值活动</div><div v-if="planDetailData.activities.length === 0" class="empty-block">无充值活动</div><table v-else class="data-table" style="margin-top: 8px"><thead><tr><th>活动名称</th><th>类型</th><th>触发条件</th><th>优惠</th><th>有效期</th><th>状态</th></tr></thead><tbody><tr v-for="act in planDetailData.activities" :key="act.id"><td>{{ act.name }}</td><td>{{ act.type === 'bonus' ? '赠送' : '折扣' }}</td><td>充值满 ¥{{ act.conditionAmount }}</td><td><span v-if="act.type === 'bonus'">赠送 ¥{{ act.bonusAmount }}</span><span v-else>{{ (act.discountPercent / 10).toFixed(1) }} 折</span></td><td><span v-if="!act.startTime && !act.endTime">永久</span><span v-else class="sub-text">{{ act.startTime || '不限' }} ~ {{ act.endTime || '不限' }}</span></td><td><span class="status-tag" :class="act.enabled ? 'refunded' : 'closed'">{{ act.enabled ? '启用' : '禁用' }}</span></td></tr></tbody></table></div>
        </div>
        <div class="modal-footer"><button class="btn btn-default" @click="planDetailModal = false">关闭</button></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.plan-tip { margin-bottom: 16px; }
.plan-section { background: #F7F8FA; border: 1px solid #E5E6EB; border-radius: 8px; margin-bottom: 16px; overflow: hidden; }
.plan-section-title { display: flex; align-items: center; gap: 8px; padding: 10px 14px; font-size: 13px; font-weight: 600; color: #1D2129; background: #FFFFFF; border-bottom: 1px solid #E5E6EB; }
.plan-count-badge { margin-left: auto; background: #F2F3F5; color: #4E5969; font-size: 11px; padding: 1px 8px; border-radius: 10px; font-weight: 500; }
.plan-section-body { padding: 14px; }
.plan-preset-row { margin-bottom: 8px; }
.plan-preset-card { display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: #FFFFFF; border: 1px solid #E5E6EB; border-radius: 6px; }
.plan-preset-index { color: #86909C; font-size: 12px; width: 18px; text-align: center; flex-shrink: 0; }
.plan-preset-yen { color: #86909C; font-size: 14px; flex-shrink: 0; }
.plan-preset-actions { display: flex; gap: 4px; margin-left: auto; }
.plan-icon-btn { width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border: none; background: transparent; border-radius: 4px; cursor: pointer; color: #86909C; }
.plan-icon-btn:hover:not(:disabled) { background: #F2F3F5; color: #4E5969; }
.plan-icon-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.plan-icon-btn-danger:hover:not(:disabled) { color: #CF1322; background: #FFF0F0; }
.plan-add-btn { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border: 1px dashed #C9CDD4; background: transparent; border-radius: 6px; color: #86909C; font-size: 13px; cursor: pointer; font-family: inherit; }
.plan-add-btn:hover { border-color: #4F6EF7; color: #4F6EF7; }
.plan-divider { height: 1px; background: #E5E6EB; margin: 14px 0; }
.plan-custom-row { display: flex; flex-direction: column; gap: 8px; }
.plan-toggle-label { display: flex; align-items: center; font-size: 13px; color: #4E5969; cursor: pointer; }
.plan-custom-fields { display: flex; gap: 16px; padding-left: 4px; }
.plan-custom-field { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #4E5969; }
.plan-empty { text-align: center; color: #86909C; padding: 20px 0; font-size: 13px; }
.plan-activity-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.plan-activity-table th { text-align: left; padding: 8px 10px; font-weight: 500; color: #86909C; border-bottom: 1px solid #E5E6EB; white-space: nowrap; }
.plan-activity-table td { padding: 8px 10px; border-bottom: 1px solid #F2F3F5; }
.plan-type-tag { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; }
.plan-type-tag.bonus { background: #E8FFE8; color: #00A854; }
.plan-type-tag.discount { background: #FFF7E6; color: #D46B08; }
.plan-mono { font-family: 'Geist Mono', 'SF Mono', 'Menlo', monospace; font-size: 12px; }
.plan-discount-amount { color: #CF1322; }
.activity-modal-content .form-item { margin-bottom: 16px; }
.af-group-title { font-size: 14px; font-weight: 700; color: #1D2129; margin-bottom: 12px; }
.af-group-divider { height: 1px; background: #E5E6EB; margin: 16px 0; }
.af-field { flex: 1; }
.af-field-hint { font-size: 12px; color: #86909C; margin-top: 4px; }
.af-control-row { display: flex; align-items: center; gap: 8px; }
.af-time-row { display: flex; align-items: center; gap: 8px; }
.af-sep { color: #86909C; }
.detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.detail-grid div { display: flex; flex-direction: column; gap: 4px; }
.detail-grid label { font-size: 12px; color: #86909C; }
.detail-grid span { font-size: 14px; color: #1D2129; font-weight: 500; }
.detail-section { margin-top: 20px; }
.detail-section:first-child { margin-top: 0; }
.form-section-title { font-size: 13px; font-weight: 700; color: #1D2129; letter-spacing: 0.02em; margin-bottom: 8px; }
.empty-block { text-align: center; color: #86909C; padding: 24px 0; font-size: 13px; }
.sub-text { font-size: 12px; color: #86909C; }
.preset-tag { display: inline-block; padding: 4px 14px; border: 1px solid #E5E6EB; border-radius: 6px; font-size: 13px; background: #F7F8FA; color: #1D2129; font-family: 'Geist Mono', 'SF Mono', 'Menlo', monospace; margin-right: 8px; margin-bottom: 8px; }
.preset-tag-dashed { border-style: dashed; color: #86909C; font-family: inherit; }
</style>
