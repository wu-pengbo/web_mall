<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { mockTemplates, ALL_PROVINCES } from '../data/freight'
import { CHARGE_TYPE_LABEL, CHARGE_TYPE_UNIT, BILLING_MODE_LABEL } from '../types/freight'
import type { ChargeType, BillingMode, FreeShippingMode, FreightTemplate, CustomAreaRule } from '../types/freight'

const router = useRouter()
const route = useRoute()
const isEdit = !!route.query.id

// --- 表单 ---
const form = reactive({
  name: '',
  chargeType: 'piece' as ChargeType,
  billingMode: 'tiered' as BillingMode,
  fixedFee: 10,
  freeShippingMode: 'none' as FreeShippingMode,
  freeShippingThreshold: 99,
  freeShippingExcludeRemote: true,
  defaultRule: { firstQty: 1, firstFee: 10, additionalQty: 1, additionalFee: 5 },
  customRules: [] as (CustomAreaRule & { _open: boolean })[]
})

const unitLabel = computed(() => CHARGE_TYPE_UNIT[form.chargeType] || '件')
const showFeeSection = computed(() => form.freeShippingMode !== 'all')

const firstLabel = computed(() => {
  const map: Record<string, string> = { piece: '首件', weight: '首重', amount: '首金额' }
  return map[form.chargeType] || '首件'
})
const additionalLabel = computed(() => {
  const map: Record<string, string> = { piece: '续件', weight: '续重', amount: '续金额' }
  return map[form.chargeType] || '续件'
})

const handleFreeShippingModeChange = () => {
  if (form.freeShippingMode === 'all') {
    form.defaultRule = { firstQty: 1, firstFee: 0, additionalQty: 1, additionalFee: 0 }
    form.customRules = []
  } else if (form.freeShippingMode === 'none') {
    form.defaultRule = { firstQty: 1, firstFee: 10, additionalQty: 1, additionalFee: 5 }
  }
}

// --- 自定义地区规则 ---
let ruleIdCounter = 100
const addCustomRule = () => {
  form.customRules.push({
    id: `cr_${++ruleIdCounter}`,
    name: '',
    provinces: [],
    firstQty: 1,
    firstFee: 10,
    additionalQty: 1,
    additionalFee: 5,
    fixedFee: 10,
    _open: true
  })
}

const removeCustomRule = (index: number) => {
  form.customRules.splice(index, 1)
}

// --- 省份选择弹窗 ---
const showProvinceModal = ref(false)
const editingRuleIndex = ref(-1)
const tempProvinces = ref<string[]>([])
const provinceSearch = ref('')

const filteredProvinces = computed(() => {
  if (!provinceSearch.value) return ALL_PROVINCES
  return ALL_PROVINCES.filter(p => p.includes(provinceSearch.value))
})

const openProvinceSelector = (index: number) => {
  editingRuleIndex.value = index
  tempProvinces.value = [...form.customRules[index].provinces]
  provinceSearch.value = ''
  showProvinceModal.value = true
}

const toggleProvince = (p: string) => {
  const idx = tempProvinces.value.indexOf(p)
  if (idx >= 0) tempProvinces.value.splice(idx, 1)
  else tempProvinces.value.push(p)
}

const confirmProvinces = () => {
  form.customRules[editingRuleIndex.value].provinces = [...tempProvinces.value]
  showProvinceModal.value = false
}

// --- 校验 ---
const formErrors = ref<string[]>([])
const validate = (): boolean => {
  formErrors.value = []
  if (!form.name.trim()) formErrors.value.push('请填写模板名称')
  if (showFeeSection.value) {
    if (form.billingMode === 'fixed') {
      if (form.fixedFee < 0) formErrors.value.push('固定运费不能为负数')
    } else {
      if (form.defaultRule.firstQty < 1) formErrors.value.push(`${firstLabel.value}不能小于1`)
      if (form.defaultRule.firstFee < 0) formErrors.value.push('首运费不能为负数')
      if (form.defaultRule.additionalQty < 1) formErrors.value.push(`${additionalLabel.value}不能小于1`)
      if (form.defaultRule.additionalFee < 0) formErrors.value.push('续运费不能为负数')
    }
  }
  for (let i = 0; i < form.customRules.length; i++) {
    const r = form.customRules[i]
    if (!r.name.trim()) formErrors.value.push(`自定义地区 #${i + 1}：请输入地区名称`)
    if (r.provinces.length === 0) formErrors.value.push(`自定义地区 #${i + 1}：请选择省份`)
    if (form.billingMode === 'fixed' && (r.fixedFee ?? 0) < 0) {
      formErrors.value.push(`自定义地区 #${i + 1}：运费不能为负数`)
    }
  }
  return formErrors.value.length === 0
}

const saveTemplate = () => {
  if (!validate()) return
  alert('运费模板保存成功！')
  router.push('/freight')
}

const goBack = () => router.push('/freight')

// --- 预览 ---
const previewExamples = computed(() => {
  const results: { label: string; fee: string }[] = []
  if (!showFeeSection.value) return results
  if (form.billingMode === 'fixed') {
    results.push({ label: `默认地区`, fee: `¥${(form.fixedFee ?? 0).toFixed(2)}` })
    for (const cr of form.customRules) {
      if (cr.fixedFee != null) {
        results.push({ label: cr.name, fee: `¥${cr.fixedFee.toFixed(2)}` })
      }
    }
  } else {
    const d = form.defaultRule
    const unit = unitLabel.value
    for (const qty of [1, 3, 5]) {
      const extra = Math.max(0, Math.ceil((qty - d.firstQty) / d.additionalQty))
      const fee = d.firstFee + extra * d.additionalFee
      results.push({ label: `默认·${qty}${unit}`, fee: `¥${fee.toFixed(2)}` })
    }
    for (const cr of form.customRules) {
      if (cr.firstQty != null && cr.firstFee != null) {
        for (const qty of [1, 3]) {
          const extra = Math.max(0, Math.ceil((qty - cr.firstQty) / (cr.additionalQty ?? 1)))
          const fee = cr.firstFee + extra * (cr.additionalFee ?? 0)
          results.push({ label: `${cr.name}·${qty}${unit}`, fee: `¥${fee.toFixed(2)}` })
        }
      }
    }
  }
  return results
})

// --- 编辑加载 ---
onMounted(() => {
  if (isEdit) {
    const tpl = mockTemplates.find(t => t.id === route.query.id)
    if (tpl) {
      form.name = tpl.name
      form.chargeType = tpl.chargeType
      form.billingMode = tpl.billingMode
      form.fixedFee = tpl.fixedFee ?? 10
      form.freeShippingMode = tpl.freeShippingMode
      form.freeShippingThreshold = tpl.freeShippingThreshold ?? 99
      form.freeShippingExcludeRemote = tpl.freeShippingExcludeRemote
      form.defaultRule = { ...tpl.defaultRule }
      form.customRules = (tpl.customRules ?? []).map(r => ({ ...r, _open: false }))
    }
  }
})
</script>

<template>
  <div class="fp">
    <div class="fp-top">
      <div class="fp-header">
        <div class="fp-bread">
          <span class="fp-link" @click="goBack">运费模板管理</span>
          <span class="fp-sep">/</span>
          <span>{{ isEdit ? '编辑模板' : '新建模板' }}</span>
        </div>
        <div class="fp-actions">
          <button class="btn btn-default" @click="goBack">取消</button>
          <button class="btn btn-primary" @click="saveTemplate">保存模板</button>
        </div>
      </div>
    </div>

    <div class="fp-body">
      <div v-if="formErrors.length > 0" class="err-bar">
        <span>表单有 {{ formErrors.length }} 处问题：</span>
        <ul style="margin: 4px 0 0 16px;">
          <li v-for="(e, i) in formErrors" :key="i">{{ e }}</li>
        </ul>
      </div>

      <div class="panel">
        <div class="panel-inner">

          <!-- ① 基础设置 -->
          <div class="sec-title">① 基础设置</div>
          <div class="fi">
            <label class="fl">模板名称</label>
            <input type="text" class="fi-input" v-model="form.name" placeholder="如：全国包邮、满99包邮" style="width: 320px;" />
          </div>
          <div class="fi" style="margin-top: 16px;">
            <label class="fl">计费维度</label>
            <div style="display: flex; gap: 10px;">
              <label v-for="(lb, key) in CHARGE_TYPE_LABEL" :key="key" class="rc" :class="{ on: form.chargeType === key }" @click="form.chargeType = key as ChargeType">
                <input type="radio" :value="key" :checked="form.chargeType === key" style="display: none;" />
                <span>{{ lb }}</span>
              </label>
            </div>
          </div>

          <div class="sd"></div>

          <!-- ② 包邮策略 -->
          <div class="sec-title">② 包邮策略</div>
          <div class="pcards">
            <div class="pcard" :class="{ on: form.freeShippingMode === 'all' }" @click="form.freeShippingMode = 'all'; handleFreeShippingModeChange()">
              <div class="pcard-tt">完全包邮</div>
              <div class="pcard-desc">买家全部免运费</div>
            </div>
            <div class="pcard" :class="{ on: form.freeShippingMode === 'amount' }" @click="form.freeShippingMode = 'amount'">
              <div class="pcard-tt">满额包邮</div>
              <div class="pcard-desc">满一定金额/数量免运费</div>
            </div>
            <div class="pcard" :class="{ on: form.freeShippingMode === 'none' }" @click="form.freeShippingMode = 'none'; handleFreeShippingModeChange()">
              <div class="pcard-tt">不包邮</div>
              <div class="pcard-desc">买家自付运费</div>
            </div>
          </div>

          <!-- 满额包邮配置 -->
          <div v-if="form.freeShippingMode === 'amount'" class="nested">
            <div class="fi">
              <label class="fl" style="width: 80px;">包邮门槛</label>
              <div style="display: flex; align-items: center; gap: 6px;">
                <span class="tip">满</span>
                <input type="number" class="fi-input" v-model.number="form.freeShippingThreshold" min="0" style="width: 80px; text-align: center;" />
                <span class="tip">{{ unitLabel }}</span>
              </div>
            </div>
            <div class="fi" style="margin-top: 12px;">
              <label class="fl" style="width: 80px;">偏远除外</label>
              <label class="toggle-switch">
                <input type="checkbox" v-model="form.freeShippingExcludeRemote" />
                <span class="toggle-slider"></span>
              </label>
              <span class="tip" style="margin-left: 8px;">新疆、西藏、内蒙古、青海、甘肃不参与包邮</span>
            </div>
          </div>

          <!-- ③ 运费规则 -->
          <template v-if="showFeeSection">
            <div class="sd"></div>
            <div class="sec-title">③ 运费规则</div>

            <!-- 计费模式 -->
            <div class="fi">
              <label class="fl">计费模式</label>
              <div style="display: flex; gap: 10px;">
                <label class="rc sm" :class="{ on: form.billingMode === 'tiered' }" @click="form.billingMode = 'tiered'"><span>阶梯运费</span></label>
                <label class="rc sm" :class="{ on: form.billingMode === 'fixed' }" @click="form.billingMode = 'fixed'"><span>固定运费</span></label>
              </div>
            </div>

            <!-- 默认运费 -->
            <div class="def-rule">
              <div class="def-label">默认运费（覆盖未自定义的地区）</div>
              <template v-if="form.billingMode === 'tiered'">
                <table class="rt">
                  <thead><tr><th>{{ firstLabel }}（{{ unitLabel }}）</th><th>首运费（元）</th><th>{{ additionalLabel }}（{{ unitLabel }}）</th><th>续运费（元）</th></tr></thead>
                  <tbody><tr>
                    <td><input type="number" class="ri" v-model.number="form.defaultRule.firstQty" min="1" /></td>
                    <td><input type="number" class="ri" v-model.number="form.defaultRule.firstFee" min="0" step="0.01" /></td>
                    <td><input type="number" class="ri" v-model.number="form.defaultRule.additionalQty" min="1" /></td>
                    <td><input type="number" class="ri" v-model.number="form.defaultRule.additionalFee" min="0" step="0.01" /></td>
                  </tr></tbody>
                </table>
              </template>
              <template v-else>
                <div class="fee-row">
                  <span>每单统一收取</span>
                  <span style="display: flex; align-items: center; gap: 2px;">
                    <span class="tip">¥</span>
                    <input type="number" class="fi-input" v-model.number="form.fixedFee" min="0" step="0.01" style="width: 100px; text-align: center;" />
                  </span>
                </div>
              </template>
            </div>

            <!-- 自定义地区 -->
            <div class="cus-rules">
              <div class="cus-header">
                <span>自定义地区运费</span>
                <button class="btn btn-default btn-xs" @click="addCustomRule">+ 添加地区</button>
              </div>
              <div v-if="form.customRules.length === 0" class="cus-empty">尚未添加自定义地区，默认运费将应用于全国</div>

              <div v-for="(rule, idx) in form.customRules" :key="rule.id" class="cus-card">
                <div class="cus-card-hd">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span class="cus-idx">{{ idx + 1 }}</span>
                    <input type="text" class="fi-input" v-model="rule.name" placeholder="地区名称，如：偏远地区" style="width: 160px;" />
                    <span class="action-link" @click="openProvinceSelector(idx)">
                      {{ rule.provinces.length > 0 ? `已选 ${rule.provinces.length} 省` : '选择省份' }}
                    </span>
                    <span v-if="rule.provinces.length > 0" class="tip" style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ rule.provinces.join('、') }}</span>
                  </div>
                  <span class="action-link danger" @click="removeCustomRule(idx)">删除</span>
                </div>

                <template v-if="form.billingMode === 'tiered'">
                  <table class="rt" style="margin-top: 10px;">
                    <thead><tr><th>{{ firstLabel }}（{{ unitLabel }}）</th><th>首运费（元）</th><th>{{ additionalLabel }}（{{ unitLabel }}）</th><th>续运费（元）</th></tr></thead>
                    <tbody><tr>
                      <td><input type="number" class="ri" v-model.number="rule.firstQty" min="1" /></td>
                      <td><input type="number" class="ri" v-model.number="rule.firstFee" min="0" step="0.01" /></td>
                      <td><input type="number" class="ri" v-model.number="rule.additionalQty" min="1" /></td>
                      <td><input type="number" class="ri" v-model.number="rule.additionalFee" min="0" step="0.01" /></td>
                    </tr></tbody>
                  </table>
                </template>
                <template v-else>
                  <div class="fee-row" style="margin-top: 10px;">
                    <span>每单统一收取</span>
                    <span style="display: flex; align-items: center; gap: 2px;">
                      <span class="tip">¥</span>
                      <input type="number" class="fi-input" v-model.number="rule.fixedFee" min="0" step="0.01" style="width: 100px; text-align: center;" />
                    </span>
                  </div>
                </template>
              </div>
            </div>
          </template>

          <!-- 完全包邮提示 -->
          <div v-if="form.freeShippingMode === 'all'" class="all-free">完全包邮，所有买家免运费</div>

          <!-- ④ 运费预览 -->
          <template v-if="showFeeSection && previewExamples.length > 0">
            <div class="sd"></div>
            <div class="sec-title">④ 运费预览</div>
            <div class="pv-grid">
              <div v-for="(ex, i) in previewExamples" :key="i" class="pv-item">
                <span class="pv-label">{{ ex.label }}</span>
                <span class="pv-fee">{{ ex.fee }}</span>
              </div>
            </div>
          </template>

        </div>
      </div>
    </div>

    <!-- 省份选择弹窗 -->
    <div v-if="showProvinceModal" class="modal-overlay" @click.self="showProvinceModal = false">
      <div class="modal-content modal-md">
        <div class="modal-header">
          <h3>选择省份</h3>
          <span class="modal-close" @click="showProvinceModal = false">
            <svg class="modal-close-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 4l8 8M12 4l-8 8" /></svg>
          </span>
        </div>
        <div class="modal-body">
          <input type="text" class="fi-input" v-model="provinceSearch" placeholder="搜索省份…" style="width: 100%; margin-bottom: 12px;" />
          <div class="pv-grid">
            <div v-for="p in filteredProvinces" :key="p" class="pv-item" :class="{ on: tempProvinces.includes(p) }" @click="toggleProvince(p)">
              <span class="cb" :class="{ chk: tempProvinces.includes(p) }"><span v-if="tempProvinces.includes(p)">✓</span></span>
              {{ p }}
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-default" @click="showProvinceModal = false">取消</button>
          <button class="btn btn-primary" @click="confirmProvinces">确定 ({{ tempProvinces.length }})</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import '../assets/wallet-common.css';

.fp { background-color: #F5F7FA; min-height: calc(100vh - 60px); color: #1D2129; font-family: -apple-system, 'SF Pro Display', 'PingFang SC', 'Microsoft YaHei', sans-serif; }
.fp-top { position: sticky; top: 0; z-index: 999; background: #F5F7FA; }
.fp-header { height: 60px; background: #FFF; box-shadow: 0 1px 2px rgba(0,0,0,0.06); display: flex; justify-content: space-between; align-items: center; padding: 0 24px; }
.fp-bread { font-size: 15px; font-weight: 600; color: #1D2129; }
.fp-link { color: #4F6EF7; cursor: pointer; }
.fp-link:hover { text-decoration: underline; }
.fp-sep { margin: 0 10px; color: #86909C; }
.fp-actions { display: flex; gap: 8px; }
.fp-body { padding: 20px 24px 40px; max-width: 750px; }
.err-bar { background: #FFF1F0; border: 1px solid #FFCCC7; border-radius: 8px; padding: 12px 16px; font-size: 13px; color: #CF1322; margin-bottom: 16px; }
.panel { background: #FFF; border-radius: 10px; border: 1px solid #E5E6EB; }
.panel-inner { padding: 28px; max-width: 680px; }
.sec-title { font-size: 15px; font-weight: 700; color: #4F6EF7; margin-bottom: 20px; padding-bottom: 8px; border-bottom: 2px solid #E8F3FF; }
.sd { height: 1px; background: #E5E6EB; margin: 24px 0; }
.fi { display: flex; align-items: center; }
.fl { width: 90px; font-size: 14px; color: #4E5969; flex-shrink: 0; }
.fi-input { height: 32px; border: 1px solid #E5E6EB; border-radius: 6px; padding: 0 12px; font-size: 14px; outline: none; transition: border-color 0.1s; }
.fi-input:focus { border-color: #4F6EF7; }
.tip { font-size: 13px; color: #86909C; }

/* 单选卡片 */
.rc { display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 10px 18px; border: 2px solid #E5E6EB; border-radius: 10px; cursor: pointer; font-size: 14px; color: #4E5969; transition: all 0.12s; min-width: 80px; }
.rc.sm { flex-direction: row; padding: 6px 14px; border-radius: 6px; min-width: auto; }
.rc:hover { border-color: #4F6EF7; }
.rc.on { border-color: #4F6EF7; background: #F0F5FF; color: #4F6EF7; font-weight: 600; }

/* 包邮策略卡片 */
.pcards { display: flex; gap: 12px; }
.pcard { flex: 1; padding: 16px 12px; border: 2px solid #E5E6EB; border-radius: 12px; cursor: pointer; transition: all 0.12s; text-align: center; }
.pcard:hover { border-color: #4F6EF7; }
.pcard.on { border-color: #4F6EF7; background: #F0F5FF; }
.pcard-tt { font-size: 14px; font-weight: 600; color: #1D2129; margin-bottom: 4px; }
.pcard.on .pcard-tt { color: #4F6EF7; }
.pcard-desc { font-size: 11px; color: #86909C; }

/* 嵌套区 */
.nested { background: #F7F8FA; border-radius: 10px; padding: 20px; margin-top: 12px; border-left: 3px solid #4F6EF7; }

/* 默认运费 */
.def-rule { margin-top: 20px; }
.def-label { font-size: 13px; font-weight: 600; color: #4E5969; margin-bottom: 10px; }

/* 规则表格 */
.rt { width: 100%; border-collapse: collapse; font-size: 13px; border: 1px solid #E5E6EB; border-radius: 6px; }
.rt th, .rt td { border: 1px solid #E5E6EB; padding: 8px; text-align: left; }
.rt th { background: #FAFAFA; color: #86909C; font-weight: 600; font-size: 11px; white-space: nowrap; }
.ri { width: 68px !important; text-align: center; border: 1px solid #E5E6EB; border-radius: 4px; padding: 4px; font-size: 13px; outline: none; }
.ri:focus { border-color: #4F6EF7; }

/* 固定运费行 */
.fee-row { display: flex; align-items: center; gap: 8px; padding: 14px; background: #FAFAFA; border-radius: 8px; border: 1px solid #E5E6EB; }

/* 自定义地区 */
.cus-rules { margin-top: 20px; }
.cus-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; font-size: 13px; font-weight: 600; color: #4E5969; }
.cus-empty { padding: 24px; text-align: center; background: #FAFAFA; border-radius: 8px; color: #86909C; font-size: 13px; border: 1px dashed #E5E6EB; }
.cus-card { border: 1px solid #E5E6EB; border-radius: 10px; padding: 14px; margin-bottom: 10px; background: #FDFDFD; }
.cus-card-hd { display: flex; justify-content: space-between; align-items: center; }
.cus-idx { width: 22px; height: 22px; border-radius: 50%; background: #4F6EF7; color: #FFF; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0; }
.cb { width: 14px; height: 14px; border-radius: 3px; border: 2px solid #C9CDD4; display: inline-flex; align-items: center; justify-content: center; font-size: 10px; flex-shrink: 0; }
.cb.chk { background: #4F6EF7; border-color: #4F6EF7; color: #FFF; }

/* 完成包邮 */
.all-free { text-align: center; font-size: 15px; color: #0E7B3A; font-weight: 500; padding: 32px 0; background: #E8F8EE; border-radius: 10px; margin-top: 20px; }

/* 预览 */
.pv-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 8px; }
.pv-item { display: flex; flex-direction: column; gap: 4px; padding: 10px; background: #FAFAFA; border-radius: 8px; border: 1px solid #E5E6EB; cursor: default; }
.pv-item.on { background: #E8F3FF; border-color: #4F6EF7; }
.pv-label { font-size: 11px; color: #86909C; }
.pv-fee { font-size: 15px; font-weight: 700; color: #CF1322; }
</style>
