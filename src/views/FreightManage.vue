<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { mockFreightTemplates, ALL_PROVINCES, REMOTE_AREAS } from '../data/freight'
import { CHARGE_TYPE_LABEL, CHARGE_TYPE_UNIT, type ChargeType, type FreightTemplate } from '../types/freight'

const router = useRouter()

// --- 搜索与筛选 ---
const searchForm = ref({ keyword: '', type: '' as ChargeType | '' })
const currentPage = ref(1)
const pageSize = 10

const filteredList = computed(() => {
  return mockFreightTemplates.filter(t => {
    if (searchForm.value.keyword && !t.name.includes(searchForm.value.keyword)) return false
    if (searchForm.value.type && t.type !== searchForm.value.type) return false
    return true
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredList.value.length / pageSize)))

const pagedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredList.value.slice(start, start + pageSize)
})

const handleSearch = () => {
  currentPage.value = 1
}

const resetSearch = () => {
  searchForm.value = { keyword: '', type: '' }
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
    if (cur > 3) pages.push(0) // ellipsis
    for (let i = Math.max(2, cur - 1); i <= Math.min(total - 1, cur + 1); i++) pages.push(i)
    if (cur < total - 2) pages.push(0)
    pages.push(total)
  }
  return pages
})

// --- 加载态 / 空态 ---
const loading = ref(false)

// --- 操作 ---
const goPublish = (id?: number) => {
  router.push(id ? `/freight/publish?id=${id}` : '/freight/publish')
}

const copyFreight = (item: FreightTemplate) => {
  // 后续支持真正的复制
  alert('复制成功')
}

const confirmDelete = (item: FreightTemplate) => {
  if (item.usedProductCount > 0) {
    alert(`该模板已被 ${item.usedProductCount} 个商品使用，无法删除`)
    return
  }
  if (confirm(`确定删除「${item.name}」？`)) {
    // 后续接入真实删除
    alert('删除成功')
  }
}

const getTypeUnit = (type: ChargeType) => CHARGE_TYPE_UNIT[type] || '件'
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
          <input
            type="text"
            class="form-input"
            v-model="searchForm.keyword"
            placeholder="搜索模板名称…"
            @keyup.enter="handleSearch"
          />
        </div>
        <div class="filter-item">
          <label>计费方式</label>
          <select class="form-select" v-model="searchForm.type">
            <option value="">全部</option>
            <option value="piece">按件数</option>
            <option value="weight">按重量</option>
            <option value="volume">按体积</option>
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
      <table class="data-table table-nowrap" v-if="!loading && pagedList.length > 0">
        <thead>
          <tr>
            <th>模板名称</th>
            <th>计费方式</th>
            <th>状态</th>
            <th>默认运费</th>
            <th>特殊地区</th>
            <th style="text-align: center;">使用商品</th>
            <th>更新时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in pagedList" :key="item.id">
            <td><span class="freight-name">{{ item.name }}</span></td>
            <td>
              <span class="status-tag" :class="item.type === 'piece' ? 'normal' : item.type === 'weight' ? 'processing' : 'paid'">
                {{ CHARGE_TYPE_LABEL[item.type] }}
              </span>
            </td>
            <td>
              <span class="status-tag" :class="item.status === 'active' ? 'success' : 'frozen'">
                {{ item.status === 'active' ? '启用' : '停用' }}
              </span>
            </td>
            <td>
              <div class="fee-text">
                首{{ item.defaultRule.firstAmount }}{{ getTypeUnit(item.type) }}
                <span class="price">¥{{ item.defaultRule.firstFee.toFixed(2) }}</span>
                ／续{{ item.defaultRule.nextAmount }}{{ getTypeUnit(item.type) }}
                <span class="price">¥{{ item.defaultRule.nextFee.toFixed(2) }}</span>
              </div>
            </td>
            <td>
              <template v-if="item.specialRules.length > 0">
                <span class="status-tag draft">{{ item.specialRules.length }} 条</span>
                <div class="area-preview">{{ item.specialRules[0].areas.join('、') }}{{ item.specialRules.length > 1 ? '…' : '' }}</div>
              </template>
              <span v-else class="sub-text">—</span>
            </td>
            <td style="text-align: center;">
              <span :class="item.usedProductCount > 0 ? 'count-badge' : 'sub-text'">
                {{ item.usedProductCount }}
              </span>
            </td>
            <td><span class="time-text">{{ item.updatedAt }}</span></td>
            <td>
              <span class="action-link" @click="goPublish(item.id)">编辑</span>
              <span class="action-link" @click="copyFreight(item)">复制</span>
              <span class="action-link danger" @click="confirmDelete(item)">删除</span>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 空状态 -->
      <div v-if="!loading && pagedList.length === 0" class="empty-text">
        <div style="font-size: 32px; margin-bottom: 8px;">📦</div>
        <div>暂无匹配的运费模板</div>
        <div class="sub-text" style="margin-top: 4px;">试试修改筛选条件或<a class="action-link" @click="resetSearch">重置</a></div>
      </div>

      <!-- 分页 -->
      <div class="pagination" v-if="totalPages > 1">
        <span>共 {{ filteredList.length }} 条记录，第 {{ currentPage }} / {{ totalPages }} 页</span>
        <div class="page-btns">
          <button class="page-btn" :class="{ disabled: currentPage <= 1 }" @click="goPage(currentPage - 1)" :disabled="currentPage <= 1">上一页</button>
          <button
            v-for="p in pageNumbers"
            :key="p"
            class="page-btn"
            :class="{ active: p === currentPage, disabled: p === 0 }"
            :disabled="p === 0"
            @click="goPage(p)"
          >{{ p === 0 ? '…' : p }}</button>
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
.page-header {
  margin-bottom: 20px;
}
.breadcrumb {
  font-size: 18px;
  font-weight: 700;
  color: #1D2129;
  letter-spacing: -0.01em;
}
.table-title {
  font-size: 15px;
  font-weight: 600;
  color: #1D2129;
}
.freight-name {
  font-weight: 500;
  color: #1D2129;
}
.fee-text {
  font-size: 13px;
  color: #4E5969;
  line-height: 1.5;
}
.price {
  color: #CF1322;
  font-weight: 600;
}
.area-preview {
  font-size: 11px;
  color: #86909C;
  margin-top: 4px;
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
