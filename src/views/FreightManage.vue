<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { mockShippingTemplates, regionGroupNameMap } from '../data/freight'
import { BILLING_DIMENSION_LABEL, BILLING_DIMENSION_UNIT, COMBINE_MODE_LABEL, FREE_SHIPPING_TYPE_LABEL } from '../types/freight'
import type { BillingDimension, ShippingTemplate } from '../types/freight'

const router = useRouter()

// --- 搜索与筛选 ---
const searchForm = ref({ keyword: '', dimension: '' as BillingDimension | '', status: '' as '' | 'active' | 'disabled' })
const currentPage = ref(1)
const pageSize = 10

const filteredList = computed(() => {
  return mockShippingTemplates.filter(t => {
    if (searchForm.value.keyword && !t.name.includes(searchForm.value.keyword)) return false
    if (searchForm.value.dimension && t.billingDimension !== searchForm.value.dimension) return false
    if (searchForm.value.status && t.status !== searchForm.value.status) return false
    return true
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredList.value.length / pageSize)))
const pagedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredList.value.slice(start, start + pageSize)
})

const handleSearch = () => { currentPage.value = 1 }
const resetSearch = () => {
  searchForm.value = { keyword: '', dimension: '', status: '' }
  currentPage.value = 1
}

// --- 分页 ---
const goPage = (page: number) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
}
const pageNumbers = computed(() => {
  const pages: number[] = []
  const total = totalPages.value
  const cur = currentPage.value
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    pages.push(1)
    if (cur > 3) pages.push(0)
    for (let i = Math.max(2, cur - 1); i <= Math.min(total - 1, cur + 1); i++) pages.push(i)
    if (cur < total - 2) pages.push(0)
    pages.push(total)
  }
  return pages
})

// --- 操作 ---
const goPublish = (id?: string) => {
  router.push(id ? `/freight/publish?id=${id}` : '/freight/publish')
}

const confirmDelete = (item: ShippingTemplate) => {
  if (item.productCount > 0) {
    alert(`该模板已被 ${item.productCount} 个商品使用，无法删除`)
    return
  }
  if (confirm(`确定删除「${item.name}」？`)) {
    alert('删除成功')
  }
}

// --- 工具函数 ---
const getUnit = (dim: BillingDimension) => BILLING_DIMENSION_UNIT[dim]

const getRuleSummary = (t: ShippingTemplate) => {
  const unit = getUnit(t.billingDimension)
  const d = t.defaultRule
  const cap = d.feeCap != null ? `（上限¥${d.feeCap}）` : ''
  return `首${d.firstQty}${unit}¥${d.firstFee} ／续${d.additionalQty}${unit}¥${d.additionalFee}${cap}`
}

const getFreeShippingSummary = (t: ShippingTemplate) => {
  const fs = t.freeShipping
  if (!fs.enabled) return null
  if (fs.conditionType === 'none') return '无条件包邮'
  if (fs.conditionType === 'amount') {
    let s = `满¥${fs.threshold}包邮`
    if (fs.applyTo === 'group' && fs.regionGroupId) {
      s += `（${regionGroupNameMap[fs.regionGroupId] || '指定区域'}）`
    }
    if (fs.excludeRemote) s += '，偏远除外'
    return s
  }
  if (fs.conditionType === 'quantity') {
    let s = `满${fs.threshold}件包邮`
    if (fs.applyTo === 'group' && fs.regionGroupId) {
      s += `（${regionGroupNameMap[fs.regionGroupId] || '指定区域'}）`
    }
    return s
  }
  return null
}
</script>

<template>
  <div class="freight-manage">
    <div class="page-header">
      <div class="breadcrumb">🚚 运费模板管理</div>
    </div>

    <div class="content-panel">
      <!-- 筛选栏 -->
      <div class="filter-bar">
        <div class="filter-item">
          <label>模板名称</label>
          <input type="text" class="form-input" v-model="searchForm.keyword" placeholder="搜索模板名称…" @keyup.enter="handleSearch" />
        </div>
        <div class="filter-item">
          <label>计费维度</label>
          <select class="form-select" v-model="searchForm.dimension">
            <option value="">全部</option>
            <option v-for="(label, key) in BILLING_DIMENSION_LABEL" :key="key" :value="key">{{ label }}</option>
          </select>
        </div>
        <div class="filter-item">
          <label>状态</label>
          <select class="form-select" v-model="searchForm.status">
            <option value="">全部</option>
            <option value="active">启用</option>
            <option value="disabled">停用</option>
          </select>
        </div>
        <div class="filter-item">
          <button class="btn btn-primary" @click="handleSearch">查询</button>
          <button class="btn btn-default" @click="resetSearch">重置</button>
        </div>
      </div>

      <!-- 操作栏 -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <div class="table-title">运费模板列表</div>
        <button class="btn btn-primary" @click="goPublish()">+ 新建模板</button>
      </div>

      <!-- 表格 -->
      <table class="data-table" v-if="pagedList.length > 0">
        <thead>
          <tr>
            <th>模板名称</th>
            <th>计费维度</th>
            <th>状态</th>
            <th>包邮规则</th>
            <th>默认运费</th>
            <th>区域规则</th>
            <th style="text-align: center;">商品数</th>
            <th>更新时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in pagedList" :key="item.id">
            <td>
              <span class="freight-name">{{ item.name }}</span>
              <div class="sub-text" style="margin-top: 2px;">{{ COMBINE_MODE_LABEL[item.combineMode] }}</div>
            </td>
            <td>
              <span class="status-tag" :class="item.billingDimension === 'quantity' ? 'normal' : item.billingDimension === 'weight' ? 'processing' : item.billingDimension === 'volume' ? 'paid' : 'pending'">
                {{ BILLING_DIMENSION_LABEL[item.billingDimension] }}
              </span>
            </td>
            <td>
              <span class="status-tag" :class="item.status === 'active' ? 'success' : 'frozen'">
                {{ item.status === 'active' ? '启用' : '停用' }}
              </span>
            </td>
            <td>
              <template v-if="getFreeShippingSummary(item)">
                <span class="free-shipping-tag">🏷️ {{ getFreeShippingSummary(item) }}</span>
              </template>
              <span v-else class="sub-text">不包邮</span>
            </td>
            <td>
              <div class="fee-text">{{ getRuleSummary(item) }}</div>
            </td>
            <td>
              <template v-if="item.regionRules.length > 0">
                <div v-for="rr in item.regionRules" :key="rr.regionGroupId" class="region-rule-row">
                  <span class="status-tag draft" style="font-size: 10px;">{{ regionGroupNameMap[rr.regionGroupId] || rr.regionGroupId }}</span>
                  <span class="sub-text">首{{rr.firstQty}}{{getUnit(item.billingDimension)}}¥{{rr.firstFee}}</span>
                </div>
              </template>
              <span v-else class="sub-text">—</span>
            </td>
            <td style="text-align: center;">
              <span :class="item.productCount > 0 ? 'count-badge' : 'sub-text'">{{ item.productCount }}</span>
            </td>
            <td><span class="time-text">{{ item.updatedAt }}</span></td>
            <td>
              <span class="action-link" @click="goPublish(item.id)">编辑</span>
              <span class="action-link danger" @click="confirmDelete(item)">删除</span>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 空状态 -->
      <div v-if="pagedList.length === 0" class="empty-text">
        <div style="font-size: 32px; margin-bottom: 8px;">📦</div>
        <div>暂无匹配的运费模板</div>
        <div class="sub-text" style="margin-top: 4px;">试试修改筛选条件或<a class="action-link" @click="resetSearch">重置</a></div>
      </div>

      <!-- 分页 -->
      <div class="pagination" v-if="totalPages > 1">
        <span>共 {{ filteredList.length }} 条，第 {{ currentPage }} / {{ totalPages }} 页</span>
        <div class="page-btns">
          <button class="page-btn" :class="{ disabled: currentPage <= 1 }" @click="goPage(currentPage - 1)" :disabled="currentPage <= 1">上一页</button>
          <button v-for="p in pageNumbers" :key="p" class="page-btn" :class="{ active: p === currentPage, disabled: p === 0 }" :disabled="p === 0" @click="goPage(p)">{{ p === 0 ? '…' : p }}</button>
          <button class="page-btn" :class="{ disabled: currentPage >= totalPages }" @click="goPage(currentPage + 1)" :disabled="currentPage >= totalPages">下一页</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import '../assets/wallet-common.css';

.freight-manage {
  background-color: #F5F7FA;
  min-height: calc(100vh - 60px);
  color: #1D2129;
  padding: 20px;
  font-family: -apple-system, 'SF Pro Display', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}
.page-header { margin-bottom: 20px; }
.breadcrumb { font-size: 18px; font-weight: 700; color: #1D2129; }
.table-title { font-size: 15px; font-weight: 600; color: #1D2129; }
.freight-name { font-weight: 500; color: #1D2129; }
.fee-text { font-size: 13px; color: #4E5969; line-height: 1.5; }
.free-shipping-tag {
  display: inline-block;
  padding: 2px 8px;
  background-color: #E8F8EE;
  color: #0E7B3A;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}
.region-rule-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}
.count-badge {
  display: inline-block;
  min-width: 22px;
  height: 22px;
  line-height: 22px;
  text-align: center;
  background-color: #F2F3F5;
  color: #4E5969;
  border-radius: 11px;
  font-size: 12px;
  font-weight: 500;
  padding: 0 6px;
}
</style>
