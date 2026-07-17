<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { mockTemplates, ALL_PROVINCES } from '../data/freight'
import {
  CHARGE_TYPE_LABEL, getChargeConfigSummary, getDefaultChargeConfig, createDefaultRule, createSpecialRule
} from '../types/freight'
import type { ChargeType, ShippingRule, ChargeConfig, QuantityConfig, WeightConfig, AmountConfig, FixedConfig } from '../types/freight'

const router = useRouter()
const route = useRoute()
const isEdit = !!route.query.id

// --- 判断规则是否为空（新建时无数据） ---
function isEmptyRule(rule: ShippingRule): boolean {
  const c = rule.chargeConfig
  switch (chargeType.value) {
    case 'FIXED': return (c as FixedConfig).fixedFee === 0
    case 'BY_QUANTITY': {
      const q = c as QuantityConfig
      return q.firstFee === 0 && q.additionalFee === 0
    }
    case 'BY_WEIGHT': {
      const w = c as WeightConfig
      return w.firstFee === 0 && w.additionalFee === 0
    }
    case 'BY_ORDER_AMOUNT': {
      const a = c as AmountConfig
      return a.amountRanges.length === 1 && a.amountRanges[0].fee === 0
    }
  }
}

function createEmptyDefaultRule(type: ChargeType): ShippingRule {
  const rule = createDefaultRule(type)
  // 将费用字段置零
  const c = rule.chargeConfig
  switch (type) {
    case 'FIXED': (c as FixedConfig).fixedFee = 0; break
    case 'BY_QUANTITY': {
      const q = c as QuantityConfig
      q.firstFee = 0; q.additionalFee = 0; break
    }
    case 'BY_WEIGHT': {
      const w = c as WeightConfig
      w.firstFee = 0; w.additionalFee = 0; break
    }
    case 'BY_ORDER_AMOUNT': {
      const a = c as AmountConfig
      if (a.amountRanges.length > 0) a.amountRanges[0].fee = 0; break
    }
  }
  return rule
}

// --- 主状态 ---
const templateName = ref('')
const chargeType = ref<ChargeType>('FIXED')
const defaultRule = ref<ShippingRule>(createEmptyDefaultRule('FIXED'))
const specialRules = ref<ShippingRule[]>([])

// --- 弹窗状态 ---
const showModal = ref(false)
const modalMode = ref<'default' | 'addSpecial' | 'editSpecial'>('default')
const editingRuleId = ref<number | null>(null)
const tempForm = ref<ShippingRule>(createSpecialRule('BY_WEIGHT'))
let nextRuleId = 100

// --- 保存 & 校验 ---
const saveTemplate = () => {
  if (!templateName.value.trim()) { alert('请填写模板名称'); return }
  alert('运费模板保存成功！')
  router.push('/freight')
}

const goBack = () => router.push('/freight')

// --- 编辑模式加载 ---
onMounted(() => {
  if (isEdit) {
    const tpl = mockTemplates.find(t => t.id === route.query.id)
    if (tpl) {
      templateName.value = tpl.name
      chargeType.value = tpl.chargeType
      defaultRule.value = JSON.parse(JSON.stringify(tpl.defaultRule))
      specialRules.value = JSON.parse(JSON.stringify(tpl.specialRules))
      nextRuleId = Math.max(100, ...specialRules.value.map(r => r.id ?? 0)) + 1
    }
  }
})

// --- 切换计费方式 ---
const switchChargeType = async (newType: ChargeType) => {
  if (newType === chargeType.value) return
  if (!isEmptyRule(defaultRule.value) || specialRules.value.length > 0) {
    if (!confirm(`切换计费方式将清空所有已配置的费率参数，是否继续？`)) return
  }
  chargeType.value = newType
  defaultRule.value = createEmptyDefaultRule(newType)
  specialRules.value = []
}

// --- 获取被占用的地区（用于冲突检测） ---
function getOccupiedRegions(excludeRuleId: number | null = null): Set<string> {
  const occupied = new Set<string>()
  specialRules.value.forEach(r => {
    if (excludeRuleId !== null && r.id === excludeRuleId) return
    r.regions.forEach(reg => occupied.add(reg))
  })
  return occupied
}

// --- 打开弹窗 ---
function openModal(mode: 'default' | 'addSpecial' | 'editSpecial', rule?: ShippingRule) {
  modalMode.value = mode
  showModal.value = true

  if (mode === 'default') {
    tempForm.value = JSON.parse(JSON.stringify(defaultRule.value))
    if (!tempForm.value.regions || tempForm.value.regions.length === 0) tempForm.value.regions = ['全国']
    editingRuleId.value = null
  } else if (mode === 'addSpecial') {
    tempForm.value = createSpecialRule(chargeType.value)
    editingRuleId.value = null
  } else if (mode === 'editSpecial' && rule) {
    tempForm.value = JSON.parse(JSON.stringify(rule))
    editingRuleId.value = rule.id ?? null
  }
}

// --- 关闭弹窗 ---
function closeModal() {
  showModal.value = false
  tempForm.value = createSpecialRule(chargeType.value)
}

// --- 确认弹窗 ---
function confirmModal() {
  const form = tempForm.value
  if (modalMode.value !== 'default') {
    if (!form.regions || form.regions.length === 0) { alert('请至少选择一个地区'); return }
    const occupied = getOccupiedRegions(editingRuleId.value)
    const overlap = form.regions.filter(r => occupied.has(r))
    if (overlap.length > 0) { alert(`地区「${overlap.join('、')}」已被其他特殊规则占用`); return }
  }
  if (form.isFreeShipping && form.freeThreshold !== null && form.freeThreshold < 0) {
    alert('包邮门槛不能为负数')
    return
  }
  // 验证计费参数
  if (!(form.isFreeShipping && form.freeThreshold === 0)) {
    if (!validateChargeConfig(form.chargeConfig)) return
  }

  if (modalMode.value === 'default') {
    defaultRule.value = JSON.parse(JSON.stringify(form))
  } else if (modalMode.value === 'addSpecial') {
    const newRule = JSON.parse(JSON.stringify(form))
    newRule.id = nextRuleId++
    specialRules.value.push(newRule)
  } else if (modalMode.value === 'editSpecial') {
    const idx = specialRules.value.findIndex(r => r.id === editingRuleId.value)
    if (idx >= 0) {
      specialRules.value[idx] = JSON.parse(JSON.stringify(form))
      specialRules.value[idx].id = editingRuleId.value!
    }
  }
  closeModal()
}

function validateChargeConfig(config: ChargeConfig): boolean {
  switch (chargeType.value) {
    case 'BY_QUANTITY': {
      const c = config as QuantityConfig
      if (!c.firstQty || c.firstQty < 1) { alert('首件数量必须>=1'); return false }
      if (c.firstFee < 0) { alert('首件运费不能为负'); return false }
      if (!c.additionalQty || c.additionalQty < 1) { alert('续件数量必须>=1'); return false }
      if (c.additionalFee < 0) { alert('续件运费不能为负'); return false }
      return true
    }
    case 'BY_WEIGHT': {
      const c = config as WeightConfig
      if (!c.firstWeight || c.firstWeight <= 0) { alert('首重必须>0'); return false }
      if (c.firstFee < 0) { alert('首重运费不能为负'); return false }
      if (!c.additionalWeight || c.additionalWeight <= 0) { alert('续重必须>0'); return false }
      if (c.additionalFee < 0) { alert('续重运费不能为负'); return false }
      return true
    }
    case 'BY_ORDER_AMOUNT': {
      const c = config as AmountConfig
      const ranges = c.amountRanges
      if (!ranges || ranges.length === 0) { alert('至少需要一个金额区间'); return false }
      for (let i = 0; i < ranges.length; i++) {
        if (ranges[i].fee < 0) { alert(`区间${i + 1}运费不能为负`); return false }
        if (i < ranges.length - 1 && (ranges[i].max === null || ranges[i].max === undefined || ranges[i].max! <= ranges[i].min)) {
          alert(`区间${i + 1}的最高金额必须大于最低金额`); return false
        }
        if (i > 0 && ranges[i].min !== ranges[i - 1].max) { alert('金额区间必须连续'); return false }
      }
      return true
    }
    case 'FIXED': {
      const c = config as FixedConfig
      if (c.fixedFee < 0) { alert('固定运费不能为负'); return false }
      return true
    }
  }
}

// --- 弹窗内辅助函数 ---
const toggleFreeShipping = () => {
  tempForm.value.isFreeShipping = !tempForm.value.isFreeShipping
  if (!tempForm.value.isFreeShipping) {
    tempForm.value.freeThreshold = null
  } else {
    tempForm.value.freeThreshold = tempForm.value.freeThreshold !== null ? tempForm.value.freeThreshold : 99
  }
  // 金额阶梯联动
  syncAmountRanges()
}

const updateFreeThreshold = (val: string) => {
  const num = parseFloat(val)
  tempForm.value.freeThreshold = (val === '' || isNaN(num)) ? null : Math.max(0, num)
  syncAmountRanges()
}

function syncAmountRanges() {
  if (chargeType.value !== 'BY_ORDER_AMOUNT') return
  const form = tempForm.value
  const config = form.chargeConfig as AmountConfig
  const threshold = form.isFreeShipping && form.freeThreshold !== null && form.freeThreshold > 0 ? form.freeThreshold : null
  if (!config.amountRanges) config.amountRanges = [{ min: 0, max: null, fee: 10 }]

  if (threshold !== null) {
    // 移除所有 min >= threshold 的区间
    config.amountRanges = config.amountRanges.filter(r => r.min < threshold)
    if (config.amountRanges.length === 0) {
      config.amountRanges = [{ min: 0, max: threshold, fee: 10 }]
    } else {
      config.amountRanges[config.amountRanges.length - 1].max = threshold
    }
  } else {
    if (config.amountRanges.length > 0) config.amountRanges[config.amountRanges.length - 1].max = null
  }
}

const addRangeRow = () => {
  const config = tempForm.value.chargeConfig as AmountConfig
  const ranges = config.amountRanges
  const last = ranges[ranges.length - 1]
  if (last.max === null) last.max = (last.min || 0) + 50
  ranges.push({ min: last.max, max: null, fee: last.fee })
}

const addRangeRowWithThreshold = () => {
  const config = tempForm.value.chargeConfig as AmountConfig
  const ranges = config.amountRanges
  const threshold = tempForm.value.isFreeShipping && tempForm.value.freeThreshold !== null && tempForm.value.freeThreshold > 0 ? tempForm.value.freeThreshold : null
  if (!threshold) { addRangeRow(); return }
  const last = ranges[ranges.length - 1]
  if (last.max! >= threshold) { alert('已达到包邮门槛上限，无法添加更多区间'); return }
  const newMax = Math.min((last.min || 0) + Math.ceil((threshold - last.min) / 2), threshold - 1)
  if (newMax <= last.min) { alert('区间间距太小'); return }
  const oldMin = last.min
  const oldFee = last.fee
  last.min = newMax
  last.max = threshold
  ranges.splice(ranges.length - 1, 0, { min: oldMin, max: newMax, fee: oldFee })
}

const removeRangeRow = (index: number) => {
  const config = tempForm.value.chargeConfig as AmountConfig
  const ranges = config.amountRanges
  if (ranges.length <= 1) { alert('至少保留一个金额区间'); return }
  ranges.splice(index, 1)
  const threshold = tempForm.value.isFreeShipping && tempForm.value.freeThreshold !== null && tempForm.value.freeThreshold > 0 ? tempForm.value.freeThreshold : null
  if (threshold) {
    ranges[ranges.length - 1].max = threshold
  } else {
    ranges[ranges.length - 1].max = null
  }
  for (let i = 1; i < ranges.length; i++) ranges[i].min = ranges[i - 1].max!
}

const updateRangeMax = (index: number, val: string) => {
  const config = tempForm.value.chargeConfig as AmountConfig
  const ranges = config.amountRanges
  const numVal = parseFloat(val)
  const threshold = tempForm.value.isFreeShipping && tempForm.value.freeThreshold !== null && tempForm.value.freeThreshold > 0 ? tempForm.value.freeThreshold : null
  if (index < ranges.length - 1) {
    let finalVal: number | null = (val === '' || isNaN(numVal)) ? null : numVal
    if (threshold && finalVal !== null && finalVal > threshold) finalVal = threshold
    ranges[index].max = finalVal
    for (let i = index + 1; i < ranges.length; i++) {
      ranges[i].min = ranges[i - 1].max!
      if (threshold && ranges[i].min! >= threshold) { ranges.splice(i); break }
    }
    if (threshold) ranges[ranges.length - 1].max = threshold
  }
}

const updateRangeFee = (index: number, val: string) => {
  const config = tempForm.value.chargeConfig as AmountConfig
  config.amountRanges[index].fee = parseFloat(val) || 0
}

const toggleProvince = (prov: string) => {
  const idx = tempForm.value.regions.indexOf(prov)
  if (idx >= 0) tempForm.value.regions.splice(idx, 1)
  else tempForm.value.regions.push(prov)
}

const shouldShowChargeConfig = computed(() => {
  const form = tempForm.value
  return !(form.isFreeShipping && form.freeThreshold === 0)
})

// --- 工具函数暴露到模板 ---
const summary_ = (cfg: ChargeConfig) => getChargeConfigSummary(chargeType.value, cfg)
const cfgToFixed = (c: ChargeConfig) => (c as FixedConfig).fixedFee ?? 0
const isOccupied = (prov: string) => {
  if (modalMode.value === 'default') return false
  const occupied = getOccupiedRegions(editingRuleId.value)
  return occupied.has(prov)
}
</script>

<template>
  <div class="fp">
    <div class="fp-top">
      <div class="fp-bar">
        <div class="fp-bread"><span class="link" @click="goBack">运费模板管理</span><span class="sep">/</span><span>{{ isEdit ? '编辑模板' : '新建模板' }}</span></div>
        <button class="btn btn-primary" @click="saveTemplate">保存模板</button>
      </div>
    </div>

    <div class="fp-body">
      <!-- 模板名称 -->
      <div class="card">
        <div class="form-group" style="margin-bottom:0;">
          <label class="fl">模板名称</label>
          <input type="text" class="fi" v-model="templateName" placeholder="请输入模板名称" style="max-width:400px;" />
        </div>
      </div>

      <!-- 计费方式 -->
      <div class="card">
        <div class="card-tt" style="margin-bottom:12px;">计费方式（全局统一）</div>
        <div class="rc-group">
          <label v-for="(lb, t) in CHARGE_TYPE_LABEL" :key="t" class="rc" :class="{ on: chargeType === t }" @click="switchChargeType(t as ChargeType)">
            <input type="radio" :value="t" :checked="chargeType === t" style="display:none;" />
            <span>{{ lb }}</span>
            <span v-if="chargeType === t" class="check">✓</span>
          </label>
        </div>
      </div>

      <!-- 默认运费 -->
      <div class="card">
        <div class="card-hd">
          <div class="card-tt"><span class="dot def"></span> 默认运费（全国适用） <span class="badge info">兜底规则</span></div>
          <button class="btn btn-default btn-sm" @click="openModal('default', defaultRule)">编辑</button>
        </div>
        <div class="summary-box">
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
            <span class="tag def">全国适用</span>
            <span class="free-badge" :class="defaultRule.isFreeShipping ? 'yes' : 'no'">
              {{ defaultRule.isFreeShipping ? (defaultRule.freeThreshold === 0 || defaultRule.freeThreshold === null ? '无条件包邮' : `满${defaultRule.freeThreshold}元包邮`) : '不包邮' }}
            </span>
          </div>
          <div style="margin-top:6px;color:var(--c2);font-size:13px;">{{ summary_(defaultRule.chargeConfig) }}</div>
        </div>
      </div>

      <!-- 特殊地区规则 -->
      <div class="card">
        <div class="card-hd">
          <div class="card-tt"><span class="dot sp"></span> 特殊地区规则（覆盖默认） <span class="badge warn">{{ specialRules.length }}条</span></div>
          <button class="btn btn-primary btn-sm" @click="openModal('addSpecial')">+ 添加特殊地区</button>
        </div>
        <div v-if="specialRules.length === 0" class="empty-hint">暂无特殊地区规则，点击上方按钮添加</div>
        <div v-for="rule in specialRules" :key="rule.id" class="rule-card">
          <div class="rule-card-hd">
            <div class="tags">{{ rule.regions.map(r => ({name:r,cls:'sp'})).map(t => `<span class="tag sp">${t.name}</span>`).join(' ') }}</div>
            <div><button class="btn-link" @click="openModal('editSpecial', rule)">编辑</button><button class="btn-link danger" @click="specialRules = specialRules.filter(r => r.id !== rule.id)">删除</button></div>
          </div>
          <div class="rule-card-bd">
            <span class="free-badge" :class="rule.isFreeShipping ? 'yes' : 'no'">{{ rule.isFreeShipping ? (rule.freeThreshold === 0 || rule.freeThreshold === null ? '无条件包邮' : `满${rule.freeThreshold}元包邮`) : '不包邮' }}</span>
            <span style="margin-left:8px;font-size:13px;color:var(--c2);">{{ summary_(rule.chargeConfig) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 规则编辑弹窗 -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-dialog">
        <div class="modal-hd">
          <span class="modal-tt">{{ modalMode === 'default' ? '编辑默认规则' : modalMode === 'addSpecial' ? '添加特殊地区规则' : '编辑特殊地区规则' }}</span>
          <button class="modal-x" @click="closeModal">&times;</button>
        </div>
        <div class="modal-body">
          <!-- 地区选择 -->
          <div v-if="modalMode === 'default'" class="form-group">
            <label class="fl">适用地区</label>
            <div class="region-default-display">全国适用（默认兜底规则）</div>
          </div>
          <div v-else class="form-group">
            <label class="fl">选择适用地区 <span class="tip">（可多选）</span></label>
            <div class="region-grid">
              <span
                v-for="prov in ALL_PROVINCES"
                :key="prov"
                class="region-chip"
                :class="{ selected: tempForm.regions.includes(prov), disabled: isOccupied(prov) }"
                @click="isOccupied(prov) || toggleProvince(prov)"
              >{{ prov }}</span>
            </div>
            <div v-if="modalMode !== 'default'" class="tip" style="margin-top:4px;">灰色划线地区已被其他特殊规则占用</div>
          </div>

          <!-- 包邮设置 -->
          <div class="form-group" style="margin-top:16px;">
            <label class="fl">包邮设置</label>
            <div style="display:flex;align-items:center;gap:10px;">
              <label class="sw"><input type="checkbox" :checked="tempForm.isFreeShipping" @change="toggleFreeShipping" /><span class="sl"></span></label>
              <span style="font-size:14px;font-weight:500;">{{ tempForm.isFreeShipping ? '开启包邮' : '不包邮' }}</span>
            </div>
          </div>
          <div v-if="tempForm.isFreeShipping" class="form-group">
            <label class="fl">包邮门槛（元）<span class="tip">填0表示无条件包邮</span></label>
            <input type="number" class="fi fi-sm" :value="tempForm.freeThreshold !== null ? tempForm.freeThreshold : ''" min="0" step="0.01" placeholder="0=无条件包邮" @input="updateFreeThreshold(($event.target as HTMLInputElement).value)" />
          </div>

          <!-- 计费参数 -->
          <div v-if="shouldShowChargeConfig" class="form-group">
            <label class="fl">计费参数 <span class="tip">（未达包邮门槛时生效）</span></label>

            <!-- BY_QUANTITY -->
            <template v-if="chargeType === 'BY_QUANTITY'">
              <div class="form-row">
                <span>首</span>
                <input type="number" class="fi fi-sm" v-model.number="(tempForm.chargeConfig as QuantityConfig).firstQty" min="1" />
                <span>件，运费</span>
                <input type="number" class="fi fi-sm" v-model.number="(tempForm.chargeConfig as QuantityConfig).firstFee" min="0" step="0.01" />
                <span>元</span>
              </div>
              <div class="form-row" style="margin-top:8px;">
                <span>续</span>
                <input type="number" class="fi fi-sm" v-model.number="(tempForm.chargeConfig as QuantityConfig).additionalQty" min="1" />
                <span>件，运费</span>
                <input type="number" class="fi fi-sm" v-model.number="(tempForm.chargeConfig as QuantityConfig).additionalFee" min="0" step="0.01" />
                <span>元</span>
              </div>
            </template>

            <!-- BY_WEIGHT -->
            <template v-if="chargeType === 'BY_WEIGHT'">
              <div class="form-row">
                <span>首重</span>
                <input type="number" class="fi fi-sm" v-model.number="(tempForm.chargeConfig as WeightConfig).firstWeight" min="0.01" step="0.01" />
                <select class="fs" v-model="(tempForm.chargeConfig as WeightConfig).firstWeightUnit" style="width:70px;"><option value="kg">kg</option><option value="g">g</option></select>
                <span>，运费</span>
                <input type="number" class="fi fi-sm" v-model.number="(tempForm.chargeConfig as WeightConfig).firstFee" min="0" step="0.01" />
                <span>元</span>
              </div>
              <div class="form-row" style="margin-top:8px;">
                <span>续重</span>
                <input type="number" class="fi fi-sm" v-model.number="(tempForm.chargeConfig as WeightConfig).additionalWeight" min="0.01" step="0.01" />
                <select class="fs" v-model="(tempForm.chargeConfig as WeightConfig).additionalWeightUnit" style="width:70px;"><option value="kg">kg</option><option value="g">g</option></select>
                <span>，运费</span>
                <input type="number" class="fi fi-sm" v-model.number="(tempForm.chargeConfig as WeightConfig).additionalFee" min="0" step="0.01" />
                <span>元</span>
              </div>
            </template>

            <!-- BY_ORDER_AMOUNT -->
            <template v-if="chargeType === 'BY_ORDER_AMOUNT'">
              <div style="overflow-x:auto;">
                <table class="rt" style="min-width:300px;">
                  <thead><tr><th>最低金额(元)</th><th></th><th>最高金额(元)</th><th>运费(元)</th><th></th></tr></thead>
                  <tbody>
                    <tr v-for="(r, i) in (tempForm.chargeConfig as AmountConfig).amountRanges" :key="i">
                      <td><input type="number" class="fi fi-sm" :value="r.min" disabled style="background:#f5f7fa;" /></td>
                      <td class="sep">~</td>
                      <td>
                        <input
                          type="number" class="fi fi-sm"
                          :value="r.max === null ? '' : r.max"
                          :disabled="i === (tempForm.chargeConfig as AmountConfig).amountRanges.length - 1"
                          placeholder="以上"
                          @change="updateRangeMax(i, ($event.target as HTMLInputElement).value)"
                        />
                      </td>
                      <td><input type="number" class="fi fi-sm" :value="r.fee" min="0" step="0.01" @change="updateRangeFee(i, ($event.target as HTMLInputElement).value)" /></td>
                      <td>
                        <button v-if="(tempForm.chargeConfig as AmountConfig).amountRanges.length > 1" class="btn-link danger" @click="removeRangeRow(i)">&times;</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <button class="btn-link" style="margin-top:6px;" @click="addRangeRowWithThreshold()">+ 添加区间</button>
            </template>

            <!-- FIXED -->
            <template v-if="chargeType === 'FIXED'">
              <div class="form-row">
                <span>固定运费</span>
                <input type="number" class="fi fi-sm" v-model.number="(tempForm.chargeConfig as FixedConfig).fixedFee" min="0" step="0.01" />
                <span>元</span>
              </div>
            </template>
          </div>

          <!-- 无条件包邮提示 -->
          <div v-if="tempForm.isFreeShipping && tempForm.freeThreshold === 0" class="free-hint">无条件包邮，无需配置计费参数。</div>
        </div>
        <div class="modal-ft">
          <button class="btn btn-default" @click="closeModal">取消</button>
          <button class="btn btn-primary" @click="confirmModal">确定</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
@import '../assets/wallet-common.css';

:root {
  --c1: #303133; --c2: #606266; --c3: #909399;
  --primary: #409eff; --pl: #ecf5ff; --pd: #337ecc;
  --danger: #f56c6c;
  --success: #67c23a; --sl: #f0f9eb;
  --warning: #e6a23c;
  --border: #e4e7ed; --bg: #f5f6f8;
}
</style>

<style scoped>
.fp { background: var(--bg); min-height: calc(100vh - 60px); color: var(--c1); font-family: -apple-system,'SF Pro Display','PingFang SC','Microsoft YaHei',sans-serif; }
.fp-top { position: sticky; top: 0; z-index: 100; background: var(--bg); }
.fp-bar { height: 60px; background: #fff; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; padding: 0 24px; }
.fp-bread { font-size: 15px; font-weight: 600; }
.fp-bread .link { color: var(--primary); cursor: pointer; }
.fp-bread .sep { margin: 0 10px; color: var(--c3); }
.fp-body { max-width: 880px; margin: 0 auto; padding: 20px 16px 40px; }

/* 通用 */
.card { background: #fff; border-radius: 8px; border: 1px solid var(--border); padding: 20px 24px; margin-bottom: 16px; }
.card-hd { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; flex-wrap: wrap; gap: 8px; }
.card-tt { font-size: 15px; font-weight: 600; display: flex; align-items: center; gap: 8px; }
.dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
.dot.def { background: var(--primary); }
.dot.sp { background: var(--warning); }
.badge { display: inline-block; padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: 500; }
.badge.info { background: var(--pl); color: var(--primary); }
.badge.warn { background: #fdf6ec; color: var(--warning); }
.tag { display: inline-block; padding: 3px 10px; border-radius: 4px; font-size: 12px; font-weight: 500; }
.tag.def { background: #e3f2fd; color: #1565c0; font-weight: 600; }
.tag.sp { background: #fff3e0; color: #e65100; }
.empty-hint { text-align: center; padding: 30px; color: var(--c3); }
.summary-box { font-size: 14px; }

/* 标签 */
.free-badge { display: inline-block; padding: 2px 8px; border-radius: 3px; font-size: 11px; font-weight: 600; }
.free-badge.yes { background: var(--sl); color: var(--success); }
.free-badge.no { background: #fafafa; color: #757575; }

/* 表单 */
.form-group { margin-bottom: 14px; }
.fl { display: block; font-size: 13px; font-weight: 600; color: var(--c2); margin-bottom: 6px; }
.fi { padding: 9px 12px; border: 1px solid var(--border); border-radius: 6px; font-size: 14px; color: var(--c1); background: #fff; outline: none; transition: border-color 0.2s; }
.fi:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(64,158,255,0.1); }
.fi-sm { width: 100px; padding: 7px 10px; font-size: 13px; }
.fs { padding: 7px 10px; border: 1px solid var(--border); border-radius: 6px; font-size: 13px; background: #fff; outline: none; }
.tip { font-size: 12px; color: var(--c3); font-weight: 400; margin-left: 4px; }

/* 单选卡片 */
.rc-group { display: flex; gap: 8px; flex-wrap: wrap; }
.rc { position: relative; cursor: pointer; border: 2px solid var(--border); border-radius: 6px; padding: 10px 20px; text-align: center; font-size: 13px; font-weight: 500; transition: all 0.2s; background: #fff; user-select: none; min-width: 100px; flex: 1; }
.rc:hover { border-color: #b3d8ff; }
.rc.on { border-color: var(--primary); background: var(--pl); color: var(--primary); font-weight: 600; }
.check { position: absolute; top: 6px; right: 8px; font-size: 14px; color: var(--primary); }

/* 规则卡片 */
.rule-card { background: #fafbfc; border: 1px solid var(--border); border-radius: 6px; padding: 14px 16px; margin-bottom: 10px; }
.rule-card-hd { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; flex-wrap: wrap; }
.rule-card-bd { margin-top: 8px; }
.btn-link { background: none; border: none; color: var(--primary); cursor: pointer; font-size: 13px; padding: 4px 6px; border-radius: 4px; }
.btn-link:hover { background: var(--pl); }
.btn-link.danger { color: var(--danger); }
.btn-link.danger:hover { background: #fef0f0; }

/* 弹窗 */
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.2s; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.modal-dialog { background: #fff; border-radius: 12px; width: 92%; max-width: 680px; max-height: 85vh; overflow-y: auto; box-shadow: 0 8px 32px rgba(0,0,0,0.16); animation: slideUp 0.25s; }
@keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
.modal-hd { display: flex; align-items: center; justify-content: space-between; padding: 18px 20px; border-bottom: 1px solid var(--border); position: sticky; top: 0; background: #fff; z-index: 1; border-radius: 12px 12px 0 0; }
.modal-tt { font-size: 16px; font-weight: 700; }
.modal-x { width: 32px; height: 32px; border-radius: 50%; border: none; background: #f5f5f5; cursor: pointer; font-size: 18px; display: flex; align-items: center; justify-content: center; color: #666; }
.modal-x:hover { background: #e8e8e8; }
.modal-body { padding: 20px; }
.modal-ft { padding: 14px 20px; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 8px; position: sticky; bottom: 0; background: #fff; border-radius: 0 0 12px 12px; }

/* 地区选择 */
.region-default-display { padding: 10px 14px; background: #f5f7fa; border-radius: 6px; border: 1px solid var(--border); font-weight: 600; color: #1565c0; font-size: 14px; }
.region-grid { display: flex; flex-wrap: wrap; gap: 6px; max-height: 240px; overflow-y: auto; padding: 10px; border: 1px solid var(--border); border-radius: 6px; background: #fafbfc; }
.region-chip { padding: 6px 13px; border-radius: 20px; font-size: 13px; cursor: pointer; border: 1.5px solid var(--border); background: #fff; transition: all 0.2s; user-select: none; white-space: nowrap; font-weight: 500; }
.region-chip:hover { border-color: var(--primary); transform: translateY(-1px); }
.region-chip.selected { background: var(--primary); color: #fff; border-color: var(--primary); box-shadow: 0 2px 6px rgba(64,158,255,0.3); }
.region-chip.disabled { background: #f0f0f0; color: #bbb; cursor: not-allowed; border-color: #e0e0e0; text-decoration: line-through; pointer-events: none; }

/* 金额阶梯表 */
.rt { width: 100%; border-collapse: collapse; font-size: 13px; }
.rt th { text-align: left; padding: 6px 4px; color: var(--c3); font-weight: 500; font-size: 12px; }
.rt td { padding: 5px 4px; vertical-align: middle; }
.sep { text-align: center; color: var(--c3); width: 20px; }

/* 表单行 */
.form-row { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }

/* 无条件包邮提示 */
.free-hint { padding: 14px; background: var(--sl); border-radius: 6px; color: var(--success); font-size: 13px; }

/* 开关 */
.sw { position: relative; width: 44px; height: 24px; cursor: pointer; display: inline-block; }
.sw input { opacity: 0; width: 0; height: 0; }
.sw .sl { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: #c0c4cc; border-radius: 24px; transition: all 0.2s; }
.sw .sl::before { content: ''; position: absolute; width: 18px; height: 18px; left: 3px; bottom: 3px; background: #fff; border-radius: 50%; transition: all 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
.sw input:checked + .sl { background: var(--primary); }
.sw input:checked + .sl::before { transform: translateX(20px); }
</style>
