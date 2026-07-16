<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ALL_PROVINCES } from '../data/freight'
import { CHARGE_TYPE_LABEL, CHARGE_TYPE_UNIT, type ChargeType, type FreightRule, type AreaRule, type FreightTemplate } from '../types/freight'

const router = useRouter()
const route = useRoute()
const isEdit = !!route.query.id

// --- 表单数据 ---
const form = reactive<{
  name: string
  type: ChargeType
  defaultRule: FreightRule
  specialRules: AreaRule[]
}>({
  name: '',
  type: 'piece',
  defaultRule: { firstAmount: 1, firstFee: 0, nextAmount: 1, nextFee: 0 },
  specialRules: []
})

// --- 区划选择弹窗 ---
const showAreaModal = ref(false)
const editingRuleIndex = ref(-1)
const tempSelected = ref<string[]>([])
const searchAreaKeyword = ref('')

const filteredProvinces = computed(() => {
  if (!searchAreaKeyword.value) return ALL_PROVINCES
  return ALL_PROVINCES.filter(p => p.includes(searchAreaKeyword.value))
})

const openAreaSelector = (index: number) => {
  editingRuleIndex.value = index
  tempSelected.value = [...form.specialRules[index].areas]
  searchAreaKeyword.value = ''
  showAreaModal.value = true
}

const toggleProvince = (province: string) => {
  const idx = tempSelected.value.indexOf(province)
  if (idx >= 0) {
    tempSelected.value.splice(idx, 1)
  } else {
    tempSelected.value.push(province)
  }
}

const confirmAreas = () => {
  form.specialRules[editingRuleIndex.value].areas = [...tempSelected.value]
  showAreaModal.value = false
}

const isAllSelected = computed(() => {
  return filteredProvinces.value.length > 0 && filteredProvinces.value.every(p => tempSelected.value.includes(p))
})

const toggleAll = () => {
  if (isAllSelected.value) {
    tempSelected.value = tempSelected.value.filter(p => !filteredProvinces.value.includes(p))
  } else {
    const existing = new Set(tempSelected.value)
    for (const p of filteredProvinces.value) {
      if (!existing.has(p)) tempSelected.value.push(p)
    }
  }
}

// --- 单位 ---
const unitLabel = computed(() => CHARGE_TYPE_UNIT[form.type] || '件')

// --- 切换计费方式 ---
const handleTypeChange = () => {
  form.defaultRule = { firstAmount: 1, firstFee: 0, nextAmount: 1, nextFee: 0 }
  form.specialRules = []
}

// --- 特殊规则操作 ---
const addSpecialRule = () => {
  form.specialRules.push({ areas: [], firstAmount: 1, firstFee: 0, nextAmount: 1, nextFee: 0 })
}

const removeSpecialRule = (index: number) => {
  form.specialRules.splice(index, 1)
}

// --- 表单校验 ---
interface FormError {
  field: string
  message: string
}

const formErrors = ref<FormError[]>([])

const validate = (): boolean => {
  formErrors.value = []
  if (!form.name.trim()) {
    formErrors.value.push({ field: 'name', message: '请填写模板名称' })
  }
  const d = form.defaultRule
  if (d.firstAmount < 1) formErrors.value.push({ field: 'defaultRule', message: '首件/重/体积不能小于 1' })
  if (d.firstFee < 0) formErrors.value.push({ field: 'defaultRule', message: '首费不能为负数' })
  if (d.nextAmount < 1) formErrors.value.push({ field: 'defaultRule', message: '续件/重/体积不能小于 1' })
  if (d.nextFee < 0) formErrors.value.push({ field: 'defaultRule', message: '续费不能为负数' })
  for (let i = 0; i < form.specialRules.length; i++) {
    const r = form.specialRules[i]
    if (r.areas.length === 0) {
      formErrors.value.push({ field: `specialRules[${i}]`, message: `特殊规则 ${i + 1}：未选择地区` })
    }
    if (r.firstAmount < 1) formErrors.value.push({ field: `specialRules[${i}]`, message: `特殊规则 ${i + 1}：首件/重/体积不能小于 1` })
    if (r.firstFee < 0) formErrors.value.push({ field: `specialRules[${i}]`, message: `特殊规则 ${i + 1}：首费不能为负数` })
    if (r.nextAmount < 1) formErrors.value.push({ field: `specialRules[${i}]`, message: `特殊规则 ${i + 1}：续件/重/体积不能小于 1` })
    if (r.nextFee < 0) formErrors.value.push({ field: `specialRules[${i}]`, message: `特殊规则 ${i + 1}：续费不能为负数` })
  }
  return formErrors.value.length === 0
}

const saveFreight = () => {
  if (!validate()) return
  alert('运费模板保存成功！')
  console.log('Save Freight:', form)
  router.push('/freight')
}

const goBack = () => router.push('/freight')

// --- 编辑模式加载数据 ---
onMounted(() => {
  if (isEdit) {
    form.name = '基础运费（偏远加收）'
    form.type = 'piece'
    form.defaultRule = { firstAmount: 1, firstFee: 10, nextAmount: 1, nextFee: 5 }
    form.specialRules = [
      { areas: ['新疆', '西藏', '内蒙古'], firstAmount: 1, firstFee: 25, nextAmount: 1, nextFee: 15 }
    ]
  }
})

const errorMsg = (field: string): string => {
  const found = formErrors.value.find(e => e.field === field)
  return found?.message || ''
}
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
          <button class="btn btn-primary" @click="saveFreight">保存模板</button>
        </div>
      </div>
    </div>

    <!-- 主体 -->
    <div class="container">
      <!-- 全局错误 -->
      <div v-if="formErrors.length > 0" class="error-banner">
        <span style="margin-right: 8px;">⚠️</span>
        <span>表单有 {{ formErrors.length }} 处错误，请修正后重试</span>
      </div>

      <!-- 基础信息 -->
      <div class="content-panel" style="margin-bottom: 16px;">
        <div class="panel-body">
          <div class="form-item">
            <label class="form-label required">模板名称</label>
            <div class="form-control-row" style="flex-direction: column; align-items: stretch;">
              <input
                type="text"
                class="form-input"
                :class="{ 'input-error': errorMsg('name') }"
                v-model="form.name"
                placeholder="请输入模板名称，如：全国包邮、大件偏远加收"
                style="width: 380px;"
              />
              <span v-if="errorMsg('name')" class="field-error">{{ errorMsg('name') }}</span>
            </div>
          </div>
          <div class="form-item" style="margin-top: 20px;">
            <label class="form-label required">计费方式</label>
            <div class="form-control-row">
              <label
                v-for="ct in (['piece', 'weight', 'volume'] as ChargeType[])"
                :key="ct"
                class="radio-label"
                :class="{ active: form.type === ct }"
                @click="form.type = ct; handleTypeChange()"
              >
                <input
                  type="radio"
                  :value="ct"
                  :checked="form.type === ct"
                  style="display: none;"
                />
                <span class="radio-dot"></span>
                {{ CHARGE_TYPE_LABEL[ct] }}
              </label>
              <span class="form-tip" style="margin-left: 16px;">（切换后将重置运费规则）</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 配送区域与运费 -->
      <div class="content-panel">
        <div class="panel-body">
          <div style="font-size: 15px; font-weight: 600; color: #1D2129; margin-bottom: 20px;">🚚 配送区域与运费</div>

          <table class="rule-table">
            <thead>
              <tr>
                <th style="width: 220px;">配送区域</th>
                <th style="width: 110px;">首件/重/体积 ({{ unitLabel }})</th>
                <th style="width: 100px;">首费 (元)</th>
                <th style="width: 110px;">续件/重/体积 ({{ unitLabel }})</th>
                <th style="width: 100px;">续费 (元)</th>
                <th style="width: 60px;">操作</th>
              </tr>
            </thead>
            <tbody>
              <!-- 默认规则 -->
              <tr class="default-row">
                <td>
                  <strong>默认运费</strong>
                  <div class="sub-text" style="margin-top: 4px;">除指定地区外的所有区域</div>
                </td>
                <td><input type="number" class="form-input rule-input" v-model.number="form.defaultRule.firstAmount" min="1" /></td>
                <td><input type="number" class="form-input rule-input" v-model.number="form.defaultRule.firstFee" min="0" step="0.01" /></td>
                <td><input type="number" class="form-input rule-input" v-model.number="form.defaultRule.nextAmount" min="1" /></td>
                <td><input type="number" class="form-input rule-input" v-model.number="form.defaultRule.nextFee" min="0" step="0.01" /></td>
                <td class="sub-text">—</td>
              </tr>
              <!-- 特殊地区规则 -->
              <tr v-for="(rule, index) in form.specialRules" :key="index">
                <td>
                  <div class="areas-display" :class="{ 'areas-empty': rule.areas.length === 0 }">
                    <template v-if="rule.areas.length > 0">{{ rule.areas.join('、') }}</template>
                    <span v-else class="status-tag failed">未选择</span>
                  </div>
                  <span class="action-link" style="margin-top: 6px; display: inline-block;" @click="openAreaSelector(index)">选择地区</span>
                </td>
                <td><input type="number" class="form-input rule-input" v-model.number="rule.firstAmount" min="1" /></td>
                <td><input type="number" class="form-input rule-input" v-model.number="rule.firstFee" min="0" step="0.01" /></td>
                <td><input type="number" class="form-input rule-input" v-model.number="rule.nextAmount" min="1" /></td>
                <td><input type="number" class="form-input rule-input" v-model.number="rule.nextFee" min="0" step="0.01" /></td>
                <td><span class="action-link danger" @click="removeSpecialRule(index)">删除</span></td>
              </tr>
            </tbody>
          </table>

          <button class="btn btn-default" style="margin-top: 16px;" @click="addSpecialRule">+ 为指定地区设置特殊运费</button>
        </div>
      </div>
    </div>

    <!-- 地区选择弹窗 -->
    <div v-if="showAreaModal" class="modal-overlay" @click.self="showAreaModal = false">
      <div class="modal-content modal-md">
        <div class="modal-header">
          <h3>选择地区</h3>
          <span class="modal-close" @click="showAreaModal = false">
            <svg class="modal-close-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </span>
        </div>
        <div class="modal-body">
          <!-- 搜索 -->
          <input
            type="text"
            class="form-input"
            v-model="searchAreaKeyword"
            placeholder="搜索省份…"
            style="width: 100%; margin-bottom: 16px;"
          />

          <!-- 全选 -->
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #E5E6EB;">
            <label class="checkbox-label" @click="toggleAll" style="display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 13px;">
              <span class="checkbox-box" :class="{ checked: isAllSelected && filteredProvinces.length > 0 }">
                <span v-if="isAllSelected && filteredProvinces.length > 0" class="checkmark">✓</span>
              </span>
              全选当前筛选
            </label>
            <span class="sub-text">已选 {{ tempSelected.length }} 个省份</span>
          </div>

          <!-- 省份列表 -->
          <div class="province-grid">
            <div
              v-for="province in filteredProvinces"
              :key="province"
              class="province-item"
              :class="{ selected: tempSelected.includes(province) }"
              @click="toggleProvince(province)"
            >
              <span class="checkbox-box small" :class="{ checked: tempSelected.includes(province) }">
                <span v-if="tempSelected.includes(province)" class="checkmark">✓</span>
              </span>
              {{ province }}
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-default" @click="showAreaModal = false">取消</button>
          <button class="btn btn-primary" @click="confirmAreas">确定 ({{ tempSelected.length }})</button>
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
  position: sticky;
  top: 0;
  z-index: 999;
  background-color: #F5F7FA;
}
.page-header {
  height: 60px;
  background-color: #FFFFFF;
  box-shadow: 0 1px 2px rgba(0,0,0,0.06);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
}
.breadcrumb {
  font-size: 15px;
  font-weight: 600;
  color: #1D2129;
}
.breadcrumb-link {
  color: #4F6EF7;
  cursor: pointer;
}
.breadcrumb-link:hover {
  text-decoration: underline;
}
.breadcrumb-sep {
  margin: 0 10px;
  color: #86909C;
}
.header-actions {
  display: flex;
  gap: 8px;
}
.container {
  padding: 20px 24px;
  margin-bottom: 40px;
  max-width: 960px;
}

/* 错误提示 */
.error-banner {
  background-color: #FFF1F0;
  border: 1px solid #FFCCC7;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 13px;
  color: #CF1322;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}
.field-error {
  font-size: 12px;
  color: #CF1322;
  margin-top: 4px;
}
.input-error {
  border-color: #CF1322 !important;
}
.input-error:focus {
  box-shadow: 0 0 0 2px rgba(207, 19, 34, 0.1);
}

/* 单选按钮自定义 */
.radio-label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 14px;
  color: #4E5969;
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid #E5E6EB;
  transition: all 0.15s ease;
}
.radio-label:hover {
  border-color: #4F6EF7;
  color: #1D2129;
}
.radio-label.active {
  border-color: #4F6EF7;
  background-color: #F0F5FF;
  color: #4F6EF7;
  font-weight: 500;
}
.radio-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid #C9CDD4;
  display: inline-block;
  transition: all 0.15s ease;
}
.radio-label.active .radio-dot {
  border-color: #4F6EF7;
  background-color: #4F6EF7;
  box-shadow: inset 0 0 0 3px #FFF;
}

/* 规则表格 */
.rule-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  border: 1px solid #E5E6EB;
  border-radius: 8px;
}
.rule-table th, .rule-table td {
  border: 1px solid #E5E6EB;
  padding: 12px;
  text-align: left;
  vertical-align: top;
}
.rule-table th {
  background-color: #FAFAFA;
  color: #86909C;
  font-weight: 600;
  font-size: 12px;
  letter-spacing: 0.02em;
}
.default-row {
  background-color: #FDFDFD;
}
.rule-input {
  width: 80px !important;
  text-align: center;
}
.areas-display {
  font-size: 13px;
  color: #1D2129;
  line-height: 1.5;
  margin-bottom: 4px;
}
.areas-empty {
  color: #86909C;
}

/* 地区选择弹窗 */
.province-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px;
  max-height: 320px;
  overflow-y: auto;
}
.province-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  color: #4E5969;
  transition: all 0.1s ease;
  user-select: none;
}
.province-item:hover {
  background-color: #F0F5FF;
  color: #4F6EF7;
}
.province-item.selected {
  background-color: #E8F3FF;
  color: #4F6EF7;
  font-weight: 500;
}

/* 复选框 */
.checkbox-box {
  width: 16px;
  height: 16px;
  border-radius: 3px;
  border: 2px solid #C9CDD4;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.1s ease;
  flex-shrink: 0;
}
.checkbox-box.small {
  width: 14px;
  height: 14px;
}
.checkbox-box.checked {
  background-color: #4F6EF7;
  border-color: #4F6EF7;
}
.checkmark {
  color: #FFFFFF;
  font-size: 11px;
  font-weight: bold;
  line-height: 1;
}
.checkbox-box.small .checkmark {
  font-size: 10px;
}
</style>
