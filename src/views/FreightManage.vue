<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { mockTemplates } from '../data/freight'
import { CHARGE_TYPE_LABEL, CHARGE_TYPE_UNIT, FREE_SHIPPING_MODE_LABEL, DEFAULT_REMOTE_AREAS } from '../types/freight'
import type { FreightTemplate } from '../types/freight'

const router = useRouter()

const keyword = ref('')
const currentPage = ref(1)
const pageSize = 10

const filteredList = computed(() => {
  return mockTemplates.filter(t => {
    if (keyword.value && !t.name.includes(keyword.value)) return false
    return true
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredList.value.length / pageSize)))
const pagedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredList.value.slice(start, start + pageSize)
})

const handleSearch = () => { currentPage.value = 1 }
const resetSearch = () => { keyword.value = ''; currentPage.value = 1 }

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

const goPublish = (id?: string) => {
  router.push(id ? `/freight/publish?id=${id}` : '/freight/publish')
}

const confirmDelete = (item: FreightTemplate) => {
  if (item.productCount > 0) {
    alert(`该模板已被 ${item.productCount} 个商品使用，无法删除`)
    return
  }
  if (confirm(`确定删除「${item.name}」？`)) alert('删除成功')
}

const getFreeShippingText = (t: FreightTemplate) => {
  if (t.freeShippingMode === 'all') return '完全包邮'
  if (t.freeShippingMode === 'amount') {
    const threshold = t.freeShippingThreshold ?? 0
    const unit = CHARGE_TYPE_UNIT[t.chargeType]
    let text = `满${threshold}${unit}包邮`
    if (t.freeShippingExcludeRemote) text += '（偏远除外）'
    return text
  }
  return '不包邮'
}

const getRuleSummary = (t: FreightTemplate): string => {
  if (t.freeShippingMode === 'all') return '—'
  const unit = CHARGE_TYPE_UNIT[t.chargeType]
  let s = `首${t.defaultRule.firstQty}${unit}¥${t.defaultRule.firstFee}`
  s += ` 续${t.defaultRule.additionalQty}${unit}¥${t.defaultRule.additionalFee}`
  return s
}
</script>

<template>
  <div class="freight-manage">
    <div class="page-header">
      <div class="breadcrumb">🚚 运费模板管理</div>
    </div>

    <div class="content-panel">
      <div class="filter-bar">
        <div class="filter-item">
          <label>模板名称</label>
          <input type="text" class="form-input" v-model="keyword" placeholder="搜索…" @keyup.enter="handleSearch" />
        </div>
        <div class="filter-item">
          <button class="btn btn-primary" @click="handleSearch">查询</button>
          <button class="btn btn-default" @click="resetSearch">重置</button>
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <div class="table-title">运费模板列表</div>
        <button class="btn btn-primary" @click="goPublish()">+ 新建模板</button>
      </div>

      <table class="data-table" v-if="pagedList.length > 0">
        <thead>
          <tr>
            <th>模板名称</th>
            <th>计费方式</th>
            <th>包邮方式</th>
            <th>运费规则</th>
            <th>偏远加收</th>
            <th style="text-align: center;">商品数</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in pagedList" :key="item.id">
            <td class="freight-name">{{ item.name }}</td>
            <td><span class="status-tag" :class="item.chargeType === 'piece' ? 'normal' : 'processing'">{{ CHARGE_TYPE_LABEL[item.chargeType] }}</span></td>
            <td>
              <span class="free-tag" :class="item.freeShippingMode">
                {{ getFreeShippingText(item) }}
              </span>
            </td>
            <td>
              <template v-if="item.freeShippingMode === 'all'">
                <span class="sub-text">—</span>
              </template>
              <template v-else>
                <div class="fee-text">{{ getRuleSummary(item) }}</div>
              </template>
            </td>
            <td>
              <template v-if="item.remoteRule">
                <span class="status-tag draft">{{ item.remoteRule.firstQty }}{{CHARGE_TYPE_UNIT[item.chargeType]}}起</span>
              </template>
              <span v-else class="sub-text">—</span>
            </td>
            <td style="text-align: center;">
              <span :class="item.productCount > 0 ? 'count-badge' : 'sub-text'">{{ item.productCount }}</span>
            </td>
            <td>
              <span class="status-tag" :class="item.status === 'active' ? 'success' : 'frozen'">
                {{ item.status === 'active' ? '启用' : '停用' }}
              </span>
            </td>
            <td>
              <span class="action-link" @click="goPublish(item.id)">编辑</span>
              <span class="action-link danger" @click="confirmDelete(item)">删除</span>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="pagedList.length === 0" class="empty-text">
        <div style="font-size: 32px; margin-bottom: 8px;">📦</div>
        <div>暂无匹配的运费模板</div>
      </div>

      <div class="pagination" v-if="totalPages > 1">
        <span>共 {{ filteredList.length }} 条，第 {{ currentPage }} / {{ totalPages }} 页</span>
        <div class="page-btns">
          <button class="page-btn" :class="{ disabled: currentPage <= 1 }" @click="goPage(currentPage - 1)">上一页</button>
          <button v-for="p in pageNumbers" :key="p" class="page-btn" :class="{ active: p === currentPage, disabled: p === 0 }" @click="goPage(p)">{{ p === 0 ? '…' : p }}</button>
          <button class="page-btn" :class="{ disabled: currentPage >= totalPages }" @click="goPage(currentPage + 1)">下一页</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import '../assets/wallet-common.css';

.freight-manage {
  background-color: #F5F7FA; min-height: calc(100vh - 60px); color: #1D2129;
  padding: 20px; font-family: -apple-system, 'SF Pro Display', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}
.page-header { margin-bottom: 20px; }
.breadcrumb { font-size: 18px; font-weight: 700; color: #1D2129; }
.table-title { font-size: 15px; font-weight: 600; color: #1D2129; }
.freight-name { font-weight: 500; color: #1D2129; }
.fee-text { font-size: 13px; color: #4E5969; }

/* 包邮标签 */
.free-tag {
  display: inline-block; padding: 2px 8px; border-radius: 4px;
  font-size: 11px; font-weight: 500;
}
.free-tag.all { background-color: #E8F8EE; color: #0E7B3A; }
.free-tag.amount { background-color: #E8F3FF; color: #4F6EF7; }
.free-tag.none { background-color: #F2F3F5; color: #86909C; }

.count-badge {
  display: inline-block; min-width: 22px; height: 22px; line-height: 22px;
  text-align: center; background-color: #F2F3F5; color: #4E5969;
  border-radius: 11px; font-size: 12px; font-weight: 500; padding: 0 6px;
}
</style>
