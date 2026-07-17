<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { mockTemplates } from '../data/freight'
import { CHARGE_TYPE_LABEL, CHARGE_TYPE_UNIT, BILLING_MODE_LABEL, DEFAULT_REMOTE_AREAS } from '../types/freight'
import type { ChargeType, BillingMode, FreeShippingMode, FreightTemplate } from '../types/freight'

const router = useRouter()
const route = useRoute()
const isEdit = !!route.query.id

const form = reactive({
  name: '',
  chargeType: 'piece' as ChargeType,
  billingMode: 'tiered' as BillingMode,
  fixedFee: 10,
  freeShippingMode: 'none' as FreeShippingMode,
  freeShippingThreshold: 99,
  freeShippingExcludeRemote: true,
  defaultRule: { firstQty: 1, firstFee: 10, additionalQty: 1, additionalFee: 5 },
  enableRemoteFee: false,
  remoteFee: 0,
  remoteRule: { firstQty: 1, firstFee: 20, additionalQty: 1, additionalFee: 15 }
})

const unitLabel = computed(() => CHARGE_TYPE_UNIT[form.chargeType] || '件')
const showFeeSection = computed(() => form.freeShippingMode !== 'all')

// 计费维度对应的首/续列名
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
    form.enableRemoteFee = false
    form.remoteFee = 0
    form.remoteRule = { firstQty: 1, firstFee: 0, additionalQty: 1, additionalFee: 0 }
  } else if (form.freeShippingMode === 'none') {
    form.defaultRule = { firstQty: 1, firstFee: 10, additionalQty: 1, additionalFee: 5 }
  }
}

// 偏远除外只在满额包邮时显示
const showRemoteExclude = computed(() => form.freeShippingMode === 'amount')

// 表单校验
const formErrors = ref<string[]>([])
const validate = (): boolean => {
  formErrors.value = []
  if (!form.name.trim()) formErrors.value.push('请填写模板名称')
  if (showFeeSection.value) {
    if (form.billingMode === 'fixed') {
      if (form.fixedFee < 0) formErrors.value.push('固定运费不能为负数')
    } else {
      if (form.defaultRule.firstQty < 1) formErrors.value.push(`${firstLabel.value}不能小于 1`)
      if (form.defaultRule.firstFee < 0) formErrors.value.push('首运费不能为负数')
      if (form.defaultRule.additionalQty < 1) formErrors.value.push(`${additionalLabel.value}不能小于 1`)
      if (form.defaultRule.additionalFee < 0) formErrors.value.push('续运费不能为负数')
    }
  }
  if (form.enableRemoteFee && form.remoteFee < 0) {
    formErrors.value.push('偏远加收金额不能为负数')
  }
  return formErrors.value.length === 0
}

const saveTemplate = () => {
  if (!validate()) return
  alert('运费模板保存成功！')
  router.push('/freight')
}

const goBack = () => router.push('/freight')

// 运费预览计算
const previewExamples = computed(() => {
  const results: { label: string; fee: string }[] = []
  if (!showFeeSection.value) return results

  if (form.billingMode === 'fixed') {
    results.push({ label: `任意数量，非偏远`, fee: `¥${(form.fixedFee ?? 0).toFixed(2)}` })
    if (form.enableRemoteFee) {
      results.push({ label: `任意数量，偏远地区`, fee: `¥${((form.fixedFee ?? 0) + form.remoteFee).toFixed(2)}` })
    }
  } else {
    const d = form.defaultRule
    for (const qty of [1, 3, 5, 10]) {
      const extra = Math.max(0, Math.ceil((qty - d.firstQty) / d.additionalQty))
      const fee = d.firstFee + extra * d.additionalFee
      results.push({ label: `${qty}${unitLabel}，非偏远`, fee: `¥${fee.toFixed(2)}` })
    }
    if (form.enableRemoteFee) {
      const r = form.remoteRule
      for (const qty of [1, 3]) {
        const extra = Math.max(0, Math.ceil((qty - r.firstQty) / r.additionalQty))
        const base = r.firstFee + extra * r.additionalFee
        results.push({ label: `${qty}${unitLabel}，偏远地区`, fee: `¥${base.toFixed(2)}` })
      }
    }
  }
  return results
})

// 编辑模式加载
onMounted(() => {
  if (isEdit) {
    const tpl = mockTemplates.find(t => t.id === route.query.id)
    if (tpl) {
      form.name = tpl.name
      form.chargeType = tpl.chargeType
      form.billingMode = tpl.billingMode === 'first_next' ? 'tiered' : tpl.billingMode
      form.fixedFee = tpl.fixedFee ?? 10
      form.freeShippingMode = tpl.freeShippingMode
      form.freeShippingThreshold = tpl.freeShippingThreshold ?? 99
      form.freeShippingExcludeRemote = tpl.freeShippingExcludeRemote
      form.defaultRule = { ...tpl.defaultRule }
      form.enableRemoteFee = !!tpl.remoteRule
      if (tpl.remoteRule) form.remoteRule = { ...tpl.remoteRule }
    }
  }
})
</script>

<template>
  <div class="freight-publish">
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
      <div v-if="formErrors.length > 0" class="error-banner">
        <span>表单有 {{ formErrors.length }} 处问题：</span>
        <ul style="margin: 4px 0 0 16px;">
          <li v-for="(err, i) in formErrors" :key="i">{{ err }}</li>
        </ul>
      </div>

      <div class="content-panel">
        <div class="panel-body" style="max-width: 680px;">

          <!-- ====== ① 基础设置 ====== -->
          <div class="section-header">① 基础设置</div>

          <div class="form-item">
            <label class="form-label required">模板名称</label>
            <div class="form-control-row">
              <input type="text" class="form-input" v-model="form.name" placeholder="如：全国包邮、满99包邮" style="width: 320px;" />
            </div>
          </div>

          <div class="form-item" style="margin-top: 16px;">
            <label class="form-label required">计费维度</label>
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
              </label>
            </div>
          </div>

          <div class="section-divider"></div>

          <!-- ====== ② 包邮策略 ====== -->
          <div class="section-header">② 包邮策略</div>

          <div class="policy-cards">
            <div
              class="policy-card"
              :class="{ active: form.freeShippingMode === 'all' }"
              @click="form.freeShippingMode = 'all'; handleFreeShippingModeChange()"
            >
              <div class="policy-card-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 12h-4l-3 9H9l-3-9H2"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/><path d="M6 14h12"/></svg>
              </div>
              <div class="policy-card-title">完全包邮</div>
              <div class="policy-card-desc">买家全部免运费</div>
            </div>
            <div
              class="policy-card"
              :class="{ active: form.freeShippingMode === 'amount' }"
              @click="form.freeShippingMode = 'amount'"
            >
              <div class="policy-card-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>
              </div>
              <div class="policy-card-title">满额包邮</div>
              <div class="policy-card-desc">满一定金额/数量免运费</div>
              <!-- 内联展开 -->
              <div v-if="form.freeShippingMode === 'amount'" class="policy-card-expand" @click.stop>
                <div class="policy-inline-row">
                  <span>满</span>
                  <input type="number" class="form-input" v-model.number="form.freeShippingThreshold" min="0" style="width: 72px; text-align: center;" />
                  <span>{{ unitLabel }}</span>
                </div>
                <label class="policy-inline-row" style="cursor: pointer; margin-top: 8px;">
                  <input type="checkbox" v-model="form.freeShippingExcludeRemote" />
                  <span style="margin-left: 6px; font-size: 13px;">偏远除外（{{ DEFAULT_REMOTE_AREAS.join('、') }}不参与包邮）</span>
                </label>
              </div>
            </div>
            <div
              class="policy-card"
              :class="{ active: form.freeShippingMode === 'none' }"
              @click="form.freeShippingMode = 'none'; handleFreeShippingModeChange()"
            >
              <div class="policy-card-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
              </div>
              <div class="policy-card-title">不包邮</div>
              <div class="policy-card-desc">买家自付运费</div>
            </div>
          </div>

          <!-- ====== ③ 运费规则（动态展开） ====== -->
          <template v-if="showFeeSection">
            <div class="section-divider"></div>
            <div class="section-header">③ 运费规则</div>

            <!-- 计费模式 -->
            <div class="form-item">
              <label class="form-label">计费模式</label>
              <div class="form-control-row">
                <label
                  class="radio-card sm"
                  :class="{ active: form.billingMode === 'tiered' }"
                  @click="form.billingMode = 'tiered'"
                >
                  <span>阶梯运费</span>
                </label>
                <label
                  class="radio-card sm"
                  :class="{ active: form.billingMode === 'fixed' }"
                  @click="form.billingMode = 'fixed'"
                >
                  <span>固定运费</span>
                </label>
              </div>
            </div>

            <!-- 阶梯运费 -->
            <template v-if="form.billingMode === 'tiered'">
              <table class="rule-table">
                <thead>
                  <tr>
                    <th>{{ firstLabel }}（{{ unitLabel }}）</th>
                    <th>首运费（元）</th>
                    <th>{{ additionalLabel }}（{{ unitLabel }}）</th>
                    <th>续运费（元）</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><input type="number" class="form-input rule-input" v-model.number="form.defaultRule.firstQty" min="1" /></td>
                    <td><input type="number" class="form-input rule-input" v-model.number="form.defaultRule.firstFee" min="0" step="0.01" /></td>
                    <td><input type="number" class="form-input rule-input" v-model.number="form.defaultRule.additionalQty" min="1" /></td>
                    <td><input type="number" class="form-input rule-input" v-model.number="form.defaultRule.additionalFee" min="0" step="0.01" /></td>
                  </tr>
                </tbody>
              </table>
            </template>

            <!-- 固定运费 -->
            <template v-if="form.billingMode === 'fixed'">
              <div class="fee-row">
                <span>每单统一收取</span>
                <span class="fee-input-wrap">
                  <span class="fee-currency">¥</span>
                  <input type="number" class="form-input" v-model.number="form.fixedFee" min="0" step="0.01" style="width: 100px; text-align: center;" />
                </span>
                <span>运费</span>
              </div>
            </template>

            <!-- 偏远地区附加规则（合并位置） -->
            <div class="remote-section">
              <div class="remote-header">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <span>偏远地区（{{ DEFAULT_REMOTE_AREAS.join('、') }}）</span>
              </div>
              <div class="remote-options">
                <label class="remote-option" v-if="showRemoteExclude">
                  <input type="checkbox" v-model="form.freeShippingExcludeRemote" />
                  <span>不参与包邮（满额包邮时，偏远地区不享受包邮）</span>
                </label>
                <label class="remote-option">
                  <input type="checkbox" v-model="form.enableRemoteFee" />
                  <span>额外加收运费</span>
                </label>
                <template v-if="form.enableRemoteFee">
                  <div class="remote-fee-inputs">
                    <template v-if="form.billingMode === 'fixed'">
                      <span>每单加收</span>
                      <span class="fee-input-wrap">
                        <span class="fee-currency">¥</span>
                        <input type="number" class="form-input" v-model.number="form.remoteFee" min="0" step="0.01" style="width: 80px; text-align: center;" />
                      </span>
                    </template>
                    <template v-else>
                      <table class="rule-table compact">
                        <thead>
                          <tr>
                            <th>{{ firstLabel }}（{{ unitLabel }}）</th>
                            <th>首运费（元）</th>
                            <th>{{ additionalLabel }}（{{ unitLabel }}）</th>
                            <th>续运费（元）</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td><input type="number" class="form-input rule-input" v-model.number="form.remoteRule.firstQty" min="1" /></td>
                            <td><input type="number" class="form-input rule-input" v-model.number="form.remoteRule.firstFee" min="0" step="0.01" /></td>
                            <td><input type="number" class="form-input rule-input" v-model.number="form.remoteRule.additionalQty" min="1" /></td>
                            <td><input type="number" class="form-input rule-input" v-model.number="form.remoteRule.additionalFee" min="0" step="0.01" /></td>
                          </tr>
                        </tbody>
                      </table>
                    </template>
                  </div>
                </template>
              </div>
            </div>
          </template>

          <!-- 完全包邮提示 -->
          <div v-if="form.freeShippingMode === 'all'" class="all-free-note">
            完全包邮，所有买家免运费
          </div>

          <!-- ====== ④ 运费预览 ====== -->
          <template v-if="showFeeSection && previewExamples.length > 0">
            <div class="section-divider"></div>
            <div class="section-header">④ 运费预览</div>
            <div class="preview-grid">
              <div v-for="(ex, i) in previewExamples" :key="i" class="preview-item">
                <span class="preview-label">{{ ex.label }}</span>
                <span class="preview-fee">{{ ex.fee }}</span>
              </div>
            </div>
          </template>

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
.container { padding: 20px 24px 40px; max-width: 750px; }

/* 错误 */
.error-banner {
  background-color: #FFF1F0; border: 1px solid #FFCCC7; border-radius: 8px;
  padding: 12px 16px; font-size: 13px; color: #CF1322; margin-bottom: 16px;
}

/* 区块标题 */
.section-header {
  font-size: 15px; font-weight: 700; color: #4F6EF7; margin-bottom: 20px;
  padding-bottom: 8px; border-bottom: 2px solid #E8F3FF;
}
.section-divider { height: 1px; background-color: #E5E6EB; margin: 24px 0; }

/* 单选卡片 */
.radio-card {
  display: flex; flex-direction: column; align-items: center; gap: 2px;
  padding: 12px 20px; border: 2px solid #E5E6EB; border-radius: 10px;
  cursor: pointer; font-size: 14px; color: #4E5969; transition: all 0.15s ease; min-width: 90px;
}
.radio-card.sm { flex-direction: row; padding: 6px 14px; border-radius: 6px; min-width: auto; }
.radio-card:hover { border-color: #4F6EF7; }
.radio-card.active { border-color: #4F6EF7; background-color: #F0F5FF; color: #4F6EF7; font-weight: 600; }

/* 包邮策略卡片（内联展开） */
.policy-cards { display: flex; gap: 12px; }
.policy-card {
  flex: 1; padding: 16px 12px; border: 2px solid #E5E6EB; border-radius: 12px;
  cursor: pointer; transition: all 0.15s ease; text-align: center; position: relative;
}
.policy-card:hover { border-color: #4F6EF7; }
.policy-card.active { border-color: #4F6EF7; background-color: #F0F5FF; }
.policy-card-icon { height: 24px; display: flex; align-items: center; justify-content: center; margin-bottom: 6px; color: #86909C; }
.policy-card.active .policy-card-icon { color: #4F6EF7; }
.policy-card-title { font-size: 14px; font-weight: 600; color: #1D2129; margin-bottom: 4px; }
.policy-card.active .policy-card-title { color: #4F6EF7; }
.policy-card-desc { font-size: 11px; color: #86909C; }
.policy-card-expand {
  margin-top: 12px; padding: 12px; background-color: #FFFFFF; border-radius: 8px;
  border: 1px solid #E5E6EB; text-align: left;
}
.policy-inline-row { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #4E5969; }

/* 规则表格 */
.rule-table { width: 100%; border-collapse: collapse; font-size: 14px; border: 1px solid #E5E6EB; border-radius: 8px; }
.rule-table th, .rule-table td { border: 1px solid #E5E6EB; padding: 10px; text-align: left; }
.rule-table th { background-color: #FAFAFA; color: #86909C; font-weight: 600; font-size: 12px; white-space: nowrap; }
.rule-table.compact th, .rule-table.compact td { padding: 6px 8px; }
.rule-input { width: 72px !important; text-align: center; }

/* 固定运费行 */
.fee-row { display: flex; align-items: center; gap: 8px; padding: 16px; background-color: #FAFAFA; border-radius: 8px; border: 1px solid #E5E6EB; }
.fee-input-wrap { position: relative; display: inline-flex; align-items: center; }
.fee-currency { position: absolute; left: 10px; font-size: 14px; color: #86909C; pointer-events: none; }

/* 偏远地区合并区 */
.remote-section {
  margin-top: 20px; border: 1px solid #E5E6EB; border-radius: 10px; padding: 16px;
  background-color: #FAFAFA;
}
.remote-header { display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; color: #4E5969; margin-bottom: 12px; }
.remote-options { display: flex; flex-direction: column; gap: 10px; }
.remote-option { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #4E5969; cursor: pointer; }
.remote-fee-inputs { margin: 8px 0 0 22px; display: flex; align-items: center; gap: 8px; }

/* 完全包邮提示 */
.all-free-note {
  text-align: center; font-size: 15px; color: #0E7B3A; font-weight: 500;
  padding: 32px 0; background-color: #E8F8EE; border-radius: 10px; margin-top: 20px;
}

/* 运费预览 */
.preview-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.preview-item {
  display: flex; flex-direction: column; gap: 4px; padding: 12px;
  background-color: #FAFAFA; border-radius: 8px; border: 1px solid #E5E6EB;
}
.preview-label { font-size: 12px; color: #86909C; }
.preview-fee { font-size: 16px; font-weight: 700; color: #CF1322; }
</style>
