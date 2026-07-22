<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { mockTemplates } from '../data/freight'
import { CHARGE_TYPE_LABEL, getChargeConfigSummary } from '../types/freight'
import type { FreightTemplate } from '../types/freight'

const router = useRouter()

const keyword = ref('')
const currentPage = ref(1)
const pageSize = 10

const filteredList = computed(() => mockTemplates.filter(t => !keyword.value || t.name.includes(keyword.value)))
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
  if (total <= 7) { for (let i = 1; i <= total; i++) pages.push(i) }
  else {
    pages.push(1)
    if (cur > 3) pages.push(0)
    for (let i = Math.max(2, cur - 1); i <= Math.min(total - 1, cur + 1); i++) pages.push(i)
    if (cur < total - 2) pages.push(0)
    pages.push(total)
  }
  return pages
})

const goPublish = (id?: string) => router.push(id ? `/freight/publish?id=${id}` : '/freight/publish')

const confirmDelete = (item: FreightTemplate) => {
  if (item.productCount > 0) {
    alert(`「${item.name}」已被 ${item.productCount} 个商品使用中，无法删除`)
    return
  }
  if (confirm(`「${item.name}」未关联商品，确定删除？`)) {
    alert('删除成功')
  }
}

const getFreeShippingText = (rule: { isFreeShipping: boolean; freeThreshold: number | null }) => {
  if (!rule.isFreeShipping) return '不包邮'
  if (rule.freeThreshold === 0 || rule.freeThreshold === null) return '完全包邮'
  return `满${rule.freeThreshold}元包邮`
}
</script>

<template>
  <div class="fm">
    <div class="pg-hd"><div class="tt">运费模板管理</div></div>
    <div class="panel">
      <div class="filter-bar">
        <div class="filter-item"><label>模板名称</label><input type="text" class="form-input" v-model="keyword" placeholder="搜索…" @keyup.enter="handleSearch" /></div>
        <div class="filter-item"><button class="btn btn-primary" @click="handleSearch">查询</button><button class="btn btn-default" @click="resetSearch">重置</button></div>
      </div>
      <div class="tb-hd"><span class="tb-tt">运费模板列表</span><button class="btn btn-primary" @click="goPublish()">+ 新建模板</button></div>

      <table class="data-table freight-table" v-if="pagedList.length > 0">
        <thead>
          <tr>
            <th>模板ID</th>
            <th>模板名称</th>
            <th>计费方式</th>
            <th>默认规则</th>
            <th>特殊地区</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in pagedList" :key="item.id">
            <td class="id-col">{{ item.id }}</td>
            <td class="nm" :title="item.name">{{ item.name }}</td>
            <td><span class="status-tag normal">{{ CHARGE_TYPE_LABEL[item.chargeType] }}</span></td>
            <td>
              <span class="free-tag" :class="item.defaultRule.isFreeShipping ? 'all' : 'none'">{{ getFreeShippingText(item.defaultRule) }}</span>
              <div class="fee-txt">{{ getChargeConfigSummary(item.chargeType, item.defaultRule.chargeConfig) }}</div>
            </td>
            <td>
              <template v-if="item.specialRules.length > 0">
                <span v-for="cr in item.specialRules" :key="cr.id" class="status-tag draft" style="font-size:10px;margin-right:3px;margin-bottom:2px;">{{ cr.regions.length }}省</span>
              </template>
              <span v-else class="sub-text">—</span>
            </td>
            <td><div class="act"><span class="action-link" @click="goPublish(item.id)">编辑</span><span class="action-link danger" @click="confirmDelete(item)">删除</span></div></td>
          </tr>
        </tbody>
      </table>
      <div v-if="pagedList.length === 0" class="empty-text"><div style="font-size:28px;color:#C9CDD4;">[ ]</div><div>暂无匹配的运费模板</div></div>
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

<style>
@import '../assets/wallet-common.css';
</style>

<style scoped>
.fm { background-color: #F5F7FA; min-height: calc(100vh - 60px); color: #1D2129; padding: 20px; font-family: -apple-system,'SF Pro Display','PingFang SC','Microsoft YaHei',sans-serif; }
.pg-hd { margin-bottom: 20px; }
.tt { font-size: 18px; font-weight: 700; color: #1D2129; }
.tb-hd { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; }
.tb-tt { font-size: 15px; font-weight: 600; color: #1D2129; }
.nm { font-weight: 500; color: #1D2129; white-space: nowrap; max-width: 200px; overflow: hidden; text-overflow: ellipsis; }
.id-col { font-size: 12px; color: #86909C; font-family: 'Geist Mono', 'SF Mono', monospace; white-space: nowrap; }
.fee-txt { font-size: 12px; color: #86909C; margin-top: 4px; line-height: 1.4; }
.free-tag { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 500; }
.free-tag.all { background-color: #E8F8EE; color: #0E7B3A; }
.free-tag.none { background-color: #F2F3F5; color: #86909C; }
.act { display: flex; gap: 12px; align-items: center; }
.freight-table { table-layout: auto; width: 100%; }
.freight-table th, .freight-table td { padding: 16px 14px !important; }
.freight-table th { white-space: nowrap; }
</style>
