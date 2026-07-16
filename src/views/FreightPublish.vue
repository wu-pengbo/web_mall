<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ALL_PROVINCES, mockRegionGroups, regionGroupNameMap } from '../data/freight'
import { BILLING_DIMENSION_LABEL, BILLING_DIMENSION_UNIT, COMBINE_MODE_LABEL } from '../types/freight'
import type { BillingDimension, CombineMode, FreightRule, RegionRule, FreeShippingRule, ShippingTemplate } from '../types/freight'

const router = useRouter()
const route = useRoute()
const isEdit = !!route.query.id

// ==================== 表单数据 ====================
const form = reactive({
  name: '',
  billingDimension: 'quantity' as BillingDimension,
  combineMode: 'by_order' as CombineMode,
  freeShipping: {
    enabled: false,
    conditionType: 'amount' as 'amount' | 'quantity' | 'none',
    threshold: 99,
    applyTo: 'all' as 'all' | 'group',
    regionGroupId: '',
    excludeRemote: true,
    remoteRegionGroupId: 'rg_remote'
  } as FreeShippingRule,
  defaultRule: {
    firstQty: 1, firstFee: 10, additionalQty: 1, additionalFee: 5, feeCap: undefined as number | undefined
  },
  regionRules: [] as (RegionRule & { _open: boolean })[],
  excludeRegions: [] as string[]
})

// ==================== 步骤管理 ====================
const currentStep = ref(1)
const totalSteps = 5

const stepLabels = ['基础设置', '包邮规则', '默认运费', '区域运费', '不配送地区']

const goStep = (step: number) => {
  if (step >= 1 && step <= totalSteps) currentStep.value = step
}

// ==================== 第1步：基础设置 ====================
const unitLabel = computed(() => BILLING_DIMENSION_UNIT[form.billingDimension])

const handleDimensionChange = () => {
  form.defaultRule = { firstQty: 1, firstFee: 0, additionalQty: 1, additionalFee: 0, feeCap: undefined }
  form.regionRules = []
}

// ==================== 第2步：包邮规则 ====================
const toggleFreeShipping = () => {
  form.freeShipping.enabled = !form.freeShipping.enabled
  if (!form.freeShipping.enabled) {
    form.freeShipping.conditionType = 'none'
    form.freeShipping.threshold = 0
    form.freeShipping.applyTo = 'all'
    form.freeShipping.regionGroupId = ''
  }
}

// ==================== 第3步：默认运费 ====================
const hasDefaultCap = ref(false)

// ==================== 第4步：区域运费 ====================
const addRegionRule = () => {
  // 找一个还没用过的区域组
  const usedIds = new Set(form.regionRules.map(r => r.regionGroupId))
  const available = mockRegionGroups.find(g => !usedIds.has(g.id))
  form.regionRules.push({
    regionGroupId: available?.id || '',
    firstQty: 1, firstFee: 20, additionalQty: 1, additionalFee: 10,
    feeCap: undefined, _open: true
  })
}

const removeRegionRule = (index: number) => {
  form.regionRules.splice(index, 1)
}

const hasCap = ref<Record<number, boolean>>({})

const getRegionName = (id: string) => regionGroupNameMap[id] || '请选择'

// ==================== 第5步：不配送地区 ====================
const excludeSelectorOpen = ref(false)
const tempExcludeSelected = ref<string[]>([])
const excludeSearch = ref('')

const filteredExcludeProvinces = computed(() => {
  if (!excludeSearch.value) return ALL_PROVINCES
  return ALL_PROVINCES.filter(p => p.includes(excludeSearch.value))
})

const openExcludeSelector = () => {
  tempExcludeSelected.value = [...form.excludeRegions]
  excludeSearch.value = ''
  excludeSelectorOpen.value = true
}

const toggleExcludeProvince = (p: string) => {
  const idx = tempExcludeSelected.value.indexOf(p)
  if (idx >= 0) tempExcludeSelected.value.splice(idx, 1)
  else tempExcludeSelected.value.push(p)
}

const confirmExclude = () => {
  form.excludeRegions = [...tempExcludeSelected.value]
  excludeSelectorOpen.value = false
}

// ==================== 表单校验 ====================
interface FormError { field: string; message: string }
const formErrors = ref<FormError[]>([])

const validate = (): boolean => {
  formErrors.value = []
  if (!form.name.trim()) formErrors.value.push({ field: 'name', message: '请填写模板名称' })

  const d = form.defaultRule
  if (d.firstQty < 1) formErrors.value.push({ field: 'default', message: '默认运费：首件/重/体积不能小于 1' })
  if (d.firstFee < 0) formErrors.value.push({ field: 'default', message: '默认运费：首费不能为负数' })
  if (d.additionalQty < 1) formErrors.value.push({ field: 'default', message: '默认运费：续件/重/体积不能小于 1' })
  if (d.additionalFee < 0) formErrors.value.push({ field: 'default', message: '默认运费：续费不能为负数' })

  for (let i = 0; i < form.regionRules.length; i++) {
    const r = form.regionRules[i]
    if (!r.regionGroupId) formErrors.value.push({ field: `region[${i}]`, message: `区域规则 ${i + 1}：未选择区域组` })
    if (r.firstQty < 1) formErrors.value.push({ field: `region[${i}]`, message: `区域规则 ${i + 1}：首件不能小于 1` })
    if (r.firstFee < 0) formErrors.value.push({ field: `region[${i}]`, message: `区域规则 ${i + 1}：首费不能为负` })
    if (r.additionalQty < 1) formErrors.value.push({ field: `region[${i}]`, message: `区域规则 ${i + 1}：续件不能小于 1` })
    if (r.additionalFee < 0) formErrors.value.push({ field: `region[${i}]`, message: `区域规则 ${i + 1}：续费不能为负` })
  }
  return formErrors.value.length === 0
}

const saveTemplate = () => {
  if (!validate()) {
    // 跳到第一个有错误的步骤
    if (formErrors.value.some(e => e.field === 'name')) currentStep.value = 1
    else if (formErrors.value.some(e => e.field === 'default')) currentStep.value = 3
    else if (formErrors.value.some(e => e.field.startsWith('region'))) currentStep.value = 4
    return
  }
  alert('运费模板保存成功！')
  console.log('Save Template:', JSON.parse(JSON.stringify(form)))
  router.push('/freight')
}

const goBack = () => router.push('/freight')

// ==================== 编辑模式 ====================
onMounted(() => {
  if (isEdit) {
    form.name = '满99包邮（偏远加收）'
    form.billingDimension = 'quantity'
    form.combineMode = 'by_order'
    form.freeShipping = {
      enabled: true, conditionType: 'amount', threshold: 99,
      applyTo: 'all', excludeRemote: true, remoteRegionGroupId: 'rg_remote'
    }
    form.defaultRule = { firstQty: 1, firstFee: 10, additionalQty: 1, additionalFee: 5, feeCap: undefined }
    form.regionRules = [
      { regionGroupId: 'rg_remote', firstQty: 1, firstFee: 20, additionalQty: 1, additionalFee: 15, feeCap: undefined, _open: false }
    ]
  }
})
</script>

<template>
  <div class="freight-publish">
    <!-- 顶部导航 -->
    <div class="fixed-top-area">
      <div class="page-header">
        <div class="breadcrumb">
          <span class="breadcrumb-link" @click="goBack">运费模板管理</span>
          <span class="breadcrumb-sep">/</span>
          <span>{{ isEdit ? '编辑模板' : '新建模板' }}</span>
        </div>
        <div class="header-actions">
          <button class="btn btn-default" @click="goBack">取消</button>
          <button class="btn btn-primary" @click="saveTemplate">保存模板</button>
        </div>
      </div>
    </div>

    <!-- 步骤条 -->
    <div class="step-bar">
      <div
        v-for="(label, idx) in stepLabels"
        :key="idx"
        class="step-item"
        :class="{ active: currentStep === idx + 1, done: currentStep > idx + 1 }"
        @click="goStep(idx + 1)"
      >
        <span class="step-num">{{ currentStep > idx + 1 ? '✓' : idx + 1 }}</span>
        <span class="step-label">{{ label }}</span>
      </div>
    </div>

    <!-- 全局错误 -->
    <div v-if="formErrors.length > 0" class="error-banner" style="margin: 0 24px 16px; max-width: 912px;">
      <span style="margin-right: 8px;">⚠️</span>
      <span>表单有 {{ formErrors.length }} 处错误，请修正后重试</span>
    </div>

    <!-- 主体内容 -->
    <div class="container">

      <!-- ==================== 第1步：基础设置 ==================== -->
      <div v-show="currentStep === 1" class="content-panel">
        <div class="panel-body">
          <div class="section-title">📋 基础设置</div>

          <div class="form-item">
            <label class="form-label required">模板名称</label>
            <div class="form-control-row">
              <input type="text" class="form-input form-input-lg" v-model="form.name" placeholder="如：满99包邮、大件按重量" />
            </div>
          </div>

          <div class="form-item">
            <label class="form-label required">计费维度</label>
            <div class="form-control-row">
              <label
                v-for="(label, key) in BILLING_DIMENSION_LABEL"
                :key="key"
                class="radio-card"
                :class="{ active: form.billingDimension === key }"
                @click="form.billingDimension = key as BillingDimension; handleDimensionChange()"
              >
                <input type="radio" :value="key" :checked="form.billingDimension === key" style="display: none;" />
                <span class="radio-card-icon">{{ key === 'quantity' ? '📦' : key === 'weight' ? '⚖️' : key === 'volume' ? '📐' : '💰' }}</span>
                <span>{{ label }}</span>
              </label>
            </div>
          </div>

          <div class="form-item">
            <label class="form-label">多商品合并</label>
            <div class="form-control-row">
              <label
                v-for="(label, key) in COMBINE_MODE_LABEL"
                :key="key"
                class="radio-card sm"
                :class="{ active: form.combineMode === key }"
                @click="form.combineMode = key as CombineMode"
              >
                <input type="radio" :value="key" :checked="form.combineMode === key" style="display: none;" />
                <span>{{ label }}</span>
              </label>
            </div>
          </div>

          <div class="form-tip-box">
            <strong>计费维度说明：</strong>件数适合标品，重量适合散装/生鲜，体积适合大件家具，金额适合按订单金额阶梯收费。
          </div>
        </div>
      </div>

      <!-- ==================== 第2步：包邮规则 ==================== -->
      <div v-show="currentStep === 2" class="content-panel">
        <div class="panel-body">
          <div class="section-title">🏷️ 包邮规则</div>

          <div class="form-item">
            <label class="form-label">是否包邮</label>
            <div class="form-control-row">
              <label class="toggle-switch">
                <input type="checkbox" :checked="form.freeShipping.enabled" @change="toggleFreeShipping" />
                <span class="toggle-slider"></span>
              </label>
              <span class="form-tip" style="margin-left: 8px;">{{ form.freeShipping.enabled ? '已开启' : '未开启' }}</span>
            </div>
          </div>

          <template v-if="form.freeShipping.enabled">
            <div class="form-item">
              <label class="form-label">包邮条件</label>
              <div class="form-control-row">
                <select class="form-select" v-model="form.freeShipping.conditionType">
                  <option value="none">无条件包邮</option>
                  <option value="amount">满金额包邮</option>
                  <option value="quantity">满件数包邮</option>
                </select>
                <template v-if="form.freeShipping.conditionType !== 'none'">
                  <span class="form-tip">满</span>
                  <input type="number" class="form-input form-input-xs" v-model.number="form.freeShipping.threshold" min="0" />
                  <span class="form-tip">{{ form.freeShipping.conditionType === 'amount' ? '元' : '件' }}</span>
                </template>
              </div>
            </div>

            <div class="form-item">
              <label class="form-label">适用区域</label>
              <div class="form-control-row">
                <label class="radio-card sm" :class="{ active: form.freeShipping.applyTo === 'all' }" @click="form.freeShipping.applyTo = 'all'">
                  <input type="radio" value="all" :checked="form.freeShipping.applyTo === 'all'" style="display: none;" />
                  <span>全国</span>
                </label>
                <label class="radio-card sm" :class="{ active: form.freeShipping.applyTo === 'group' }" @click="form.freeShipping.applyTo = 'group'">
                  <input type="radio" value="group" :checked="form.freeShipping.applyTo === 'group'" style="display: none;" />
                  <span>指定区域</span>
                </label>
                <select v-if="form.freeShipping.applyTo === 'group'" class="form-select" v-model="form.freeShipping.regionGroupId" style="margin-left: 8px;">
                  <option value="">请选择区域组</option>
                  <option v-for="g in mockRegionGroups" :key="g.id" :value="g.id">{{ g.name }}（{{ g.regions.join('、') }}）</option>
                </select>
              </div>
            </div>

            <div class="form-item">
              <label class="form-label">排除偏远</label>
              <div class="form-control-row">
                <label class="toggle-switch">
                  <input type="checkbox" v-model="form.freeShipping.excludeRemote" />
                  <span class="toggle-slider"></span>
                </label>
                <span class="form-tip" style="margin-left: 8px;">开启后，偏远地区不参与包邮条件</span>
              </div>
            </div>
          </template>

          <div class="form-tip-box">
            <strong>提示：</strong>包邮规则与下方的运费规则叠加。未达到包邮条件时，按默认/区域运费计算。
          </div>
        </div>
      </div>

      <!-- ==================== 第3步：默认运费 ==================== -->
      <div v-show="currentStep === 3" class="content-panel">
        <div class="panel-body">
          <div class="section-title">🚚 默认运费（全国兜底）</div>

          <table class="rule-table">
            <thead>
              <tr>
                <th style="width: 150px;">首{{ unitLabel }}</th>
                <th style="width: 120px;">首费 (元)</th>
                <th style="width: 150px;">续{{ unitLabel }}</th>
                <th style="width: 120px;">续费 (元)</th>
                <th style="width: 160px;">运费上限</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><input type="number" class="form-input rule-input" v-model.number="form.defaultRule.firstQty" min="1" /></td>
                <td><input type="number" class="form-input rule-input" v-model.number="form.defaultRule.firstFee" min="0" step="0.01" /></td>
                <td><input type="number" class="form-input rule-input" v-model.number="form.defaultRule.additionalQty" min="1" /></td>
                <td><input type="number" class="form-input rule-input" v-model.number="form.defaultRule.additionalFee" min="0" step="0.01" /></td>
                <td>
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <label class="toggle-switch" style="transform: scale(0.85);">
                      <input type="checkbox" v-model="hasDefaultCap" />
                      <span class="toggle-slider"></span>
                    </label>
                    <template v-if="hasDefaultCap">
                      <span class="form-tip">¥</span>
                      <input type="number" class="form-input form-input-xs" v-model.number="form.defaultRule.feeCap" min="0" placeholder="不限" />
                    </template>
                    <span v-else class="form-tip">不限</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <div class="form-tip-box" style="margin-top: 16px;">
            <strong>运费计算公式：</strong>
            运费 = 首费 + ⌈(数量 − 首{{ unitLabel }}) / 续{{ unitLabel }}⌉ × 续费。
            <template v-if="form.defaultRule.feeCap != null">
              设置上限 ¥{{ form.defaultRule.feeCap }} 后，超出部分不收取。
            </template>
          </div>
        </div>
      </div>

      <!-- ==================== 第4步：区域运费 ==================== -->
      <div v-show="currentStep === 4" class="content-panel">
        <div class="panel-body">
          <div class="section-title">📍 区域运费规则（可选）</div>
          <p class="form-tip" style="margin-bottom: 16px;">为指定区域设置独立运费，未覆盖的区域使用默认运费。</p>

          <div v-if="form.regionRules.length === 0" class="empty-block">暂无区域规则，点击下方按钮添加</div>

          <div v-for="(rule, index) in form.regionRules" :key="index" class="region-rule-card">
            <div class="region-rule-header">
              <div style="display: flex; align-items: center; gap: 12px;">
                <span class="region-rule-num">{{ index + 1 }}</span>
                <select class="form-select" v-model="rule.regionGroupId" style="width: 200px;">
                  <option value="">请选择区域组</option>
                  <option v-for="g in mockRegionGroups" :key="g.id" :value="g.id">{{ g.name }}（{{ g.regions.length }}省）</option>
                </select>
                <span v-if="rule.regionGroupId" class="sub-text">{{ regionGroupNameMap[rule.regionGroupId] }}</span>
              </div>
              <span class="action-link danger" @click="removeRegionRule(index)">删除</span>
            </div>

            <table class="rule-table" style="margin-top: 12px;">
              <thead>
                <tr>
                  <th>首{{ unitLabel }}</th>
                  <th>首费 (元)</th>
                  <th>续{{ unitLabel }}</th>
                  <th>续费 (元)</th>
                  <th>运费上限</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><input type="number" class="form-input rule-input" v-model.number="rule.firstQty" min="1" /></td>
                  <td><input type="number" class="form-input rule-input" v-model.number="rule.firstFee" min="0" step="0.01" /></td>
                  <td><input type="number" class="form-input rule-input" v-model.number="rule.additionalQty" min="1" /></td>
                  <td><input type="number" class="form-input rule-input" v-model.number="rule.additionalFee" min="0" step="0.01" /></td>
                  <td>
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <label class="toggle-switch" style="transform: scale(0.85);">
                        <input type="checkbox" v-model="hasCap[index]" />
                        <span class="toggle-slider"></span>
                      </label>
                      <template v-if="hasCap[index]">
                        <span class="form-tip">¥</span>
                        <input type="number" class="form-input form-input-xs" v-model.number="rule.feeCap" min="0" />
                      </template>
                      <span v-else class="form-tip">不限</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <button class="btn btn-default" style="margin-top: 16px;" @click="addRegionRule">+ 添加区域运费规则</button>
        </div>
      </div>

      <!-- ==================== 第5步：不配送地区 ==================== -->
      <div v-show="currentStep === 5" class="content-panel">
        <div class="panel-body">
          <div class="section-title">🚫 不配送地区（可选）</div>
          <p class="form-tip" style="margin-bottom: 16px;">选中的地区将无法下单，适合港澳台、海外等无法配送的区域。</p>

          <div v-if="form.excludeRegions.length > 0" class="exclude-tags">
            <span v-for="region in form.excludeRegions" :key="region" class="exclude-tag">
              {{ region }}
              <span class="exclude-tag-remove" @click="form.excludeRegions = form.excludeRegions.filter(r => r !== region)">×</span>
            </span>
          </div>
          <div v-else class="empty-block">暂无不配送地区</div>

          <button class="btn btn-default" style="margin-top: 12px;" @click="openExcludeSelector">选择不配送地区</button>
        </div>
      </div>

      <!-- 步骤导航 -->
      <div class="step-nav">
        <button class="btn btn-default" :disabled="currentStep <= 1" @click="goStep(currentStep - 1)">上一步</button>
        <span class="step-indicator">{{ currentStep }} / {{ totalSteps }}</span>
        <button v-if="currentStep < totalSteps" class="btn btn-primary" @click="goStep(currentStep + 1)">下一步</button>
        <button v-else class="btn btn-primary" @click="saveTemplate">保存模板</button>
      </div>
    </div>

    <!-- 不配送地区选择弹窗 -->
    <div v-if="excludeSelectorOpen" class="modal-overlay" @click.self="excludeSelectorOpen = false">
      <div class="modal-content modal-md">
        <div class="modal-header">
          <h3>选择不配送地区</h3>
          <span class="modal-close" @click="excludeSelectorOpen = false">
            <svg class="modal-close-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </span>
        </div>
        <div class="modal-body">
          <input type="text" class="form-input" v-model="excludeSearch" placeholder="搜索省份…" style="width: 100%; margin-bottom: 12px;" />
          <div class="province-grid">
            <div
              v-for="province in filteredExcludeProvinces"
              :key="province"
              class="province-item"
              :class="{ selected: tempExcludeSelected.includes(province) }"
              @click="toggleExcludeProvince(province)"
            >
              <span class="checkbox-box small" :class="{ checked: tempExcludeSelected.includes(province) }">
                <span v-if="tempExcludeSelected.includes(province)" class="checkmark">✓</span>
              </span>
              {{ province }}
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-default" @click="excludeSelectorOpen = false">取消</button>
          <button class="btn btn-primary" @click="confirmExclude">确定 ({{ tempExcludeSelected.length }})</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import '../assets/wallet-common.css';

.freight-publish {
  background-color: #F5F7FA;
  min-height: calc(100vh - 60px);
  color: #1D2129;
  font-family: -apple-system, 'SF Pro Display', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}
.fixed-top-area {
  position: sticky; top: 0; z-index: 999; background-color: #F5F7FA;
}
.page-header {
  height: 60px; background-color: #FFFFFF; box-shadow: 0 1px 2px rgba(0,0,0,0.06);
  display: flex; justify-content: space-between; align-items: center; padding: 0 24px;
}
.breadcrumb { font-size: 15px; font-weight: 600; color: #1D2129; }
.breadcrumb-link { color: #4F6EF7; cursor: pointer; }
.breadcrumb-link:hover { text-decoration: underline; }
.breadcrumb-sep { margin: 0 10px; color: #86909C; }
.header-actions { display: flex; gap: 8px; }
.container { padding: 0 24px 40px; max-width: 960px; }

/* 步骤条 */
.step-bar {
  display: flex; justify-content: center; gap: 4px;
  padding: 20px 24px; margin-bottom: 4px;
}
.step-item {
  display: flex; align-items: center; gap: 8px; padding: 8px 20px;
  border-radius: 8px; cursor: pointer; font-size: 13px; color: #86909C;
  transition: all 0.15s ease; position: relative;
}
.step-item.active {
  background-color: #4F6EF7; color: #FFFFFF; font-weight: 600;
}
.step-item.done {
  color: #4F6EF7; font-weight: 500;
}
.step-num {
  width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700; border: 2px solid currentColor;
}
.step-item.active .step-num {
  background-color: rgba(255,255,255,0.2); border-color: rgba(255,255,255,0.6);
}
.step-label { white-space: nowrap; }

/* 错误提示 */
.error-banner {
  background-color: #FFF1F0; border: 1px solid #FFCCC7; border-radius: 8px;
  padding: 10px 16px; font-size: 13px; color: #CF1322; display: flex; align-items: center;
}

/* 区块标题 */
.section-title {
  font-size: 16px; font-weight: 700; color: #1D2129; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid #E5E6EB;
}

/* 单选卡片 */
.radio-card {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  padding: 12px 20px; border: 2px solid #E5E6EB; border-radius: 10px;
  cursor: pointer; font-size: 13px; color: #4E5969; transition: all 0.15s ease; min-width: 80px;
}
.radio-card.sm {
  flex-direction: row; padding: 6px 14px; border-radius: 6px; min-width: auto; gap: 4px;
}
.radio-card:hover { border-color: #4F6EF7; }
.radio-card.active { border-color: #4F6EF7; background-color: #F0F5FF; color: #4F6EF7; font-weight: 600; }
.radio-card-icon { font-size: 20px; }

/* 提示框 */
.form-tip-box {
  background-color: #F7F8FA; border-radius: 8px; padding: 12px 16px;
  font-size: 13px; color: #86909C; line-height: 1.6; margin-top: 20px;
}

/* 规则表格 */
.rule-table { width: 100%; border-collapse: collapse; font-size: 14px; border: 1px solid #E5E6EB; border-radius: 8px; }
.rule-table th, .rule-table td { border: 1px solid #E5E6EB; padding: 12px; text-align: left; }
.rule-table th { background-color: #FAFAFA; color: #86909C; font-weight: 600; font-size: 12px; }
.rule-input { width: 80px !important; text-align: center; }

/* 区域规则卡片 */
.region-rule-card {
  border: 1px solid #E5E6EB; border-radius: 10px; padding: 16px; margin-bottom: 12px;
  background-color: #FDFDFD;
}
.region-rule-header {
  display: flex; justify-content: space-between; align-items: center;
}
.region-rule-num {
  width: 24px; height: 24px; border-radius: 50%; background-color: #4F6EF7; color: #FFFFFF;
  display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700;
}

/* 不配送标签 */
.exclude-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 8px; }
.exclude-tag {
  display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px;
  background-color: #FFF1F0; color: #CF1322; border-radius: 6px; font-size: 13px;
}
.exclude-tag-remove {
  cursor: pointer; font-size: 16px; line-height: 1; margin-left: 2px;
}
.exclude-tag-remove:hover { color: #a00; }

/* 省份选择弹窗 */
.province-grid {
  display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; max-height: 320px; overflow-y: auto;
}
.province-item {
  display: flex; align-items: center; gap: 6px; padding: 6px 8px; border-radius: 6px;
  cursor: pointer; font-size: 13px; color: #4E5969; transition: all 0.1s ease; user-select: none;
}
.province-item:hover { background-color: #F0F5FF; color: #4F6EF7; }
.province-item.selected { background-color: #E8F3FF; color: #4F6EF7; font-weight: 500; }

/* 复选框 */
.checkbox-box {
  width: 16px; height: 16px; border-radius: 3px; border: 2px solid #C9CDD4;
  display: inline-flex; align-items: center; justify-content: center;
  transition: all 0.1s ease; flex-shrink: 0;
}
.checkbox-box.small { width: 14px; height: 14px; }
.checkbox-box.checked { background-color: #4F6EF7; border-color: #4F6EF7; }
.checkmark { color: #FFFFFF; font-size: 11px; font-weight: bold; line-height: 1; }
.checkbox-box.small .checkmark { font-size: 10px; }

/* 步骤导航 */
.step-nav {
  display: flex; justify-content: space-between; align-items: center;
  margin-top: 24px; padding: 16px 0; border-top: 1px solid #E5E6EB;
}
.step-indicator { font-size: 13px; color: #86909C; }
</style>
