<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { mockTemplates } from '../data/freight'
import { CHARGE_TYPE_LABEL, CHARGE_TYPE_UNIT, DEFAULT_REMOTE_AREAS } from '../types/freight'
import type { ChargeType, FreeShippingMode, FreightTemplate } from '../types/freight'

const router = useRouter()
const route = useRoute()
const isEdit = !!route.query.id

const form = reactive({
  name: '',
  chargeType: 'piece' as ChargeType,
  freeShippingMode: 'none' as FreeShippingMode,
  freeShippingThreshold: 99,
  freeShippingExcludeRemote: true,
  defaultRule: { firstQty: 1, firstFee: 10, additionalQty: 1, additionalFee: 5 },
  enableRemoteRule: false,
  remoteRule: { firstQty: 1, firstFee: 20, additionalQty: 1, additionalFee: 15 }
})

// 选择包邮模式时的联动
const handleFreeShippingModeChange = () => {
  if (form.freeShippingMode === 'all') {
    // 完全包邮 → 清空并禁用运费规则
    form.defaultRule = { firstQty: 1, firstFee: 0, additionalQty: 1, additionalFee: 0 }
    form.enableRemoteRule = false
    form.remoteRule = { firstQty: 1, firstFee: 0, additionalQty: 1, additionalFee: 0 }
  } else if (form.freeShippingMode === 'none') {
    // 不包邮 → 用默认值
    form.defaultRule = { firstQty: 1, firstFee: 10, additionalQty: 1, additionalFee: 5 }
  }
  // amount 模式保持现有
}

const unitLabel = computed(() => CHARGE_TYPE_UNIT[form.chargeType] || '件')
const needsDefaultRule = computed(() => form.freeShippingMode !== 'all')

// 表单校验
const formErrors = ref<string[]>([])
const validate = (): boolean => {
  formErrors.value = []
  if (!form.name.trim()) formErrors.value.push('请填写模板名称')
  if (needsDefaultRule.value) {
    if (form.defaultRule.firstQty < 1) formErrors.value.push('默认运费：首件/重不能小于 1')
    if (form.defaultRule.firstFee < 0) formErrors.value.push('默认运费：首费不能为负数')
    if (form.defaultRule.additionalQty < 1) formErrors.value.push('默认运费：续件/重不能小于 1')
    if (form.defaultRule.additionalFee < 0) formErrors.value.push('默认运费：续费不能为负数')
  }
  if (form.enableRemoteRule) {
    if (form.remoteRule.firstQty < 1) formErrors.value.push('偏远加收：首件/重不能小于 1')
    if (form.remoteRule.firstFee < 0) formErrors.value.push('偏远加收：首费不能为负数')
    if (form.remoteRule.additionalQty < 1) formErrors.value.push('偏远加收：续件/重不能小于 1')
    if (form.remoteRule.additionalFee < 0) formErrors.value.push('偏远加收：续费不能为负数')
  }
  return formErrors.value.length === 0
}

const saveTemplate = () => {
  if (!validate()) return
  alert('运费模板保存成功！')
  console.log('Save:', JSON.parse(JSON.stringify(form)))
  router.push('/freight')
}

const goBack = () => router.push('/freight')

// 编辑模式加载
onMounted(() => {
  if (isEdit) {
    const tpl = mockTemplates.find(t => t.id === route.query.id)
    if (tpl) {
      form.name = tpl.name
      form.chargeType = tpl.chargeType
      form.freeShippingMode = tpl.freeShippingMode
      form.freeShippingThreshold = tpl.freeShippingThreshold ?? 99
      form.freeShippingExcludeRemote = tpl.freeShippingExcludeRemote
      form.defaultRule = { ...tpl.defaultRule }
      form.enableRemoteRule = !!tpl.remoteRule
      if (tpl.remoteRule) form.remoteRule = { ...tpl.remoteRule }
    }
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

    <div class="container">
      <!-- 错误 -->
      <div v-if="formErrors.length > 0" class="error-banner">
        <span>⚠️ 表单有 {{ formErrors.length }} 处问题：</span>
        <ul style="margin: 4px 0 0 16px;">
          <li v-for="(err, i) in formErrors" :key="i">{{ err }}</li>
        </ul>
      </div>

      <div class="content-panel">
        <div class="panel-body" style="max-width: 640px;">

          <!-- 模板名称 -->
          <div class="form-item">
            <label class="form-label required">模板名称</label>
            <div class="form-control-row">
              <input type="text" class="form-input" v-model="form.name" placeholder="如：全国包邮、满99包邮" style="width: 320px;" />
            </div>
          </div>

          <!-- 计费方式 -->
          <div class="form-item" style="margin-top: 20px;">
            <label class="form-label required">计费方式</label>
            <div class="form-control-row">
              <label
                v-for="(label, key) in CHARGE_TYPE_LABEL"
                :key="key"
                class="radio-card"
                :class="{ active: form.chargeType === key }"
                @click="form.chargeType = key as ChargeType"
              >
                <input type="radio" :value="key" :checked="form.chargeType === key" style="display: none;" />
                <span>{{ label }}</span>
                <span class="sub-text" style="font-size: 11px;">{{ key === 'piece' ? '📦 适合标品' : '⚖️ 适合散装' }}</span>
              </label>
            </div>
          </div>

          <!-- 分隔线 -->
          <div class="divider"></div>

          <!-- 包邮方式 — 三段式 -->
          <div class="section-label">📮 包邮方式</div>

          <div class="shipping-cards">
            <div
              class="shipping-card"
              :class="{ active: form.freeShippingMode === 'all' }"
              @click="form.freeShippingMode = 'all'; handleFreeShippingModeChange()"
            >
              <div class="shipping-card-icon">✅</div>
              <div class="shipping-card-title">完全包邮</div>
              <div class="shipping-card-desc">买家全部免运费</div>
            </div>
            <div
              class="shipping-card"
              :class="{ active: form.freeShippingMode === 'amount' }"
              @click="form.freeShippingMode = 'amount'"
            >
              <div class="shipping-card-icon">🛒</div>
              <div class="shipping-card-title">满额包邮</div>
              <div class="shipping-card-desc">满X元/件免运费</div>
            </div>
            <div
              class="shipping-card"
              :class="{ active: form.freeShippingMode === 'none' }"
              @click="form.freeShippingMode = 'none'; handleFreeShippingModeChange()"
            >
              <div class="shipping-card-icon">💰</div>
              <div class="shipping-card-title">不包邮</div>
              <div class="shipping-card-desc">买家自付运费</div>
            </div>
          </div>

          <!-- 满额包邮详细设置 -->
          <div v-if="form.freeShippingMode === 'amount'" class="nested-section">
            <div class="form-item">
              <label class="form-label required">包邮门槛</label>
              <div class="form-control-row">
                <span class="form-tip">满</span>
                <input type="number" class="form-input form-input-sm" v-model.number="form.freeShippingThreshold" min="0" />
                <span class="form-tip">{{ form.chargeType === 'piece' ? '件' : 'kg' }}</span>
              </div>
            </div>
            <div class="form-item" style="margin-top: 16px;">
              <label class="form-label">偏远除外</label>
              <div class="form-control-row">
                <label class="toggle-switch">
                  <input type="checkbox" v-model="form.freeShippingExcludeRemote" />
                  <span class="toggle-slider"></span>
                </label>
                <span class="form-tip" style="margin-left: 8px;">开启后，{{ DEFAULT_REMOTE_AREAS.join('、') }} 不参与包邮</span>
              </div>
            </div>
          </div>

          <!-- 分隔线（仅在需要显示运费规则时） -->
          <div v-if="needsDefaultRule" class="divider"></div>

          <!-- 默认运费（完全包邮时隐藏） -->
          <div v-if="needsDefaultRule">
            <div class="section-label">🚚 默认运费</div>

            <table class="rule-table">
              <thead>
                <tr>
                  <th style="width: 130px;">首{{ unitLabel }}</th>
                  <th style="width: 100px;">首费</th>
                  <th style="width: 130px;">续{{ unitLabel }}</th>
                  <th style="width: 100px;">续费</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><input type="number" class="form-input rule-input" v-model.number="form.defaultRule.firstQty" min="1" /></td>
                  <td>
                    <div style="display: flex; align-items: center; gap: 4px;">
                      <span class="form-tip">¥</span>
                      <input type="number" class="form-input rule-input" v-model.number="form.defaultRule.firstFee" min="0" step="0.01" />
                    </div>
                  </td>
                  <td><input type="number" class="form-input rule-input" v-model.number="form.defaultRule.additionalQty" min="1" /></td>
                  <td>
                    <div style="display: flex; align-items: center; gap: 4px;">
                      <span class="form-tip">¥</span>
                      <input type="number" class="form-input rule-input" v-model.number="form.defaultRule.additionalFee" min="0" step="0.01" />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- 偏远加收开关 -->
            <div class="remote-toggle">
              <label class="toggle-switch">
                <input type="checkbox" v-model="form.enableRemoteRule" />
                <span class="toggle-slider"></span>
              </label>
              <span style="margin-left: 8px; font-size: 14px; color: #4E5969;">
                偏远地区加收（{{ DEFAULT_REMOTE_AREAS.join('、') }}）
              </span>
            </div>

            <div v-if="form.enableRemoteRule" class="nested-section">
              <table class="rule-table">
                <thead>
                  <tr>
                    <th style="width: 130px;">首{{ unitLabel }}</th>
                    <th style="width: 100px;">首费</th>
                    <th style="width: 130px;">续{{ unitLabel }}</th>
                    <th style="width: 100px;">续费</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><input type="number" class="form-input rule-input" v-model.number="form.remoteRule.firstQty" min="1" /></td>
                    <td>
                      <div style="display: flex; align-items: center; gap: 4px;">
                        <span class="form-tip">¥</span>
                        <input type="number" class="form-input rule-input" v-model.number="form.remoteRule.firstFee" min="0" step="0.01" />
                      </div>
                    </td>
                    <td><input type="number" class="form-input rule-input" v-model.number="form.remoteRule.additionalQty" min="1" /></td>
                    <td>
                      <div style="display: flex; align-items: center; gap: 4px;">
                        <span class="form-tip">¥</span>
                        <input type="number" class="form-input rule-input" v-model.number="form.remoteRule.additionalFee" min="0" step="0.01" />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- 费率说明 -->
            <div class="form-tip-box">
              <strong>运费计算：</strong>运费 = 首费 + ⌈(数量 − 首{{ unitLabel }}) / 续{{ unitLabel }}⌉ × 续费
            </div>
          </div>

          <!-- 完全包邮提示 -->
          <div v-if="form.freeShippingMode === 'all'" class="all-free-note">
            ✨ 完全包邮模板已配置完成，所有买家免运费
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import '../assets/wallet-common.css';

.freight-publish {
  background-color: #F5F7FA; min-height: calc(100vh - 60px); color: #1D2129;
  font-family: -apple-system, 'SF Pro Display', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}
.fixed-top-area { position: sticky; top: 0; z-index: 999; background-color: #F5F7FA; }
.page-header {
  height: 60px; background-color: #FFFFFF; box-shadow: 0 1px 2px rgba(0,0,0,0.06);
  display: flex; justify-content: space-between; align-items: center; padding: 0 24px;
}
.breadcrumb { font-size: 15px; font-weight: 600; color: #1D2129; }
.breadcrumb-link { color: #4F6EF7; cursor: pointer; }
.breadcrumb-link:hover { text-decoration: underline; }
.breadcrumb-sep { margin: 0 10px; color: #86909C; }
.header-actions { display: flex; gap: 8px; }
.container { padding: 20px 24px 40px; max-width: 700px; }

/* 错误 */
.error-banner {
  background-color: #FFF1F0; border: 1px solid #FFCCC7; border-radius: 8px;
  padding: 12px 16px; font-size: 13px; color: #CF1322; margin-bottom: 16px;
}

/* 分隔线 */
.divider { height: 1px; background-color: #E5E6EB; margin: 24px 0; }

/* 区块标题 */
.section-label { font-size: 14px; font-weight: 700; color: #1D2129; margin-bottom: 16px; }

/* 计费方式单选卡片 */
.radio-card {
  display: flex; flex-direction: column; align-items: center; gap: 2px;
  padding: 12px 16px; border: 2px solid #E5E6EB; border-radius: 10px;
  cursor: pointer; font-size: 14px; color: #4E5969; transition: all 0.15s ease; min-width: 100px;
}
.radio-card:hover { border-color: #4F6EF7; }
.radio-card.active { border-color: #4F6EF7; background-color: #F0F5FF; color: #4F6EF7; font-weight: 600; }

/* 包邮方式三卡 */
.shipping-cards { display: flex; gap: 12px; margin-bottom: 16px; }
.shipping-card {
  flex: 1; padding: 20px 16px; border: 2px solid #E5E6EB; border-radius: 12px;
  cursor: pointer; transition: all 0.15s ease; text-align: center;
}
.shipping-card:hover { border-color: #4F6EF7; transform: translateY(-1px); }
.shipping-card.active { border-color: #4F6EF7; background-color: #F0F5FF; }
.shipping-card-icon { font-size: 28px; margin-bottom: 8px; }
.shipping-card-title { font-size: 15px; font-weight: 600; color: #1D2129; margin-bottom: 4px; }
.shipping-card-desc { font-size: 12px; color: #86909C; }
.shipping-card.active .shipping-card-title { color: #4F6EF7; }

/* 折叠区间 */
.nested-section {
  background-color: #F7F8FA; border-radius: 10px; padding: 20px; margin: 12px 0;
  border-left: 3px solid #4F6EF7;
}

/* 规则表格 */
.rule-table { width: 100%; border-collapse: collapse; font-size: 14px; border: 1px solid #E5E6EB; border-radius: 8px; }
.rule-table th, .rule-table td { border: 1px solid #E5E6EB; padding: 10px; text-align: left; }
.rule-table th { background-color: #FAFAFA; color: #86909C; font-weight: 600; font-size: 12px; }
.rule-input { width: 72px !important; text-align: center; }

/* 偏远加收开关行 */
.remote-toggle { display: flex; align-items: center; margin-top: 20px; padding: 12px 0; }

/* 提示框 */
.form-tip-box {
  background-color: #F7F8FA; border-radius: 8px; padding: 12px 16px;
  font-size: 13px; color: #86909C; line-height: 1.6; margin-top: 20px;
}

/* 完全包邮提示 */
.all-free-note {
  text-align: center; font-size: 16px; color: #0E7B3A; font-weight: 500;
  padding: 40px 0; background-color: #E8F8EE; border-radius: 10px; margin-top: 16px;
}
</style>
