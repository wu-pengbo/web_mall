<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// --- 搜索表单 ---
const searchForm = ref({
  keyword: ''
})

// --- 模拟运费模板数据 ---
const freights = ref([
  {
    id: 1,
    name: '全国包邮',
    type: 'piece', // piece 按件, weight 按重量, volume 按体积
    defaultRule: { firstAmount: 1, firstFee: 0, nextAmount: 1, nextFee: 0 },
    specialRules: [], // 无特殊地区
    updatedAt: '2026-04-01 10:00:00'
  },
  {
    id: 2,
    name: '基础运费模板 (偏远加收)',
    type: 'piece',
    defaultRule: { firstAmount: 1, firstFee: 10, nextAmount: 1, nextFee: 5 },
    specialRules: [
      { areas: ['新疆', '西藏', '内蒙古'], firstAmount: 1, firstFee: 20, nextAmount: 1, nextFee: 15 }
    ],
    updatedAt: '2026-04-05 14:20:00'
  },
  {
    id: 3,
    name: '大件商品按重量',
    type: 'weight',
    defaultRule: { firstAmount: 1, firstFee: 15, nextAmount: 1, nextFee: 8 },
    specialRules: [],
    updatedAt: '2026-04-08 09:15:00'
  }
])

const getTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    piece: '按件数',
    weight: '按重量',
    volume: '按体积'
  }
  return map[type] || type
}

// --- 搜索与过滤逻辑 ---
const filteredFreights = computed(() => {
  return freights.value.filter(f => f.name.includes(searchForm.value.keyword))
})

const handleSearch = () => {
  console.log('执行搜索：', searchForm.value)
}

const resetSearch = () => {
  searchForm.value.keyword = ''
}

// --- 操作逻辑 ---
const goPublish = (id?: number) => {
  const url = id ? `/freight/publish?id=${id}` : '/freight/publish'
  router.push(url)
}

const copyFreight = (item: any) => {
  const newItem = { ...item, id: Date.now(), name: item.name + ' - 副本', updatedAt: new Date().toLocaleString() }
  freights.value.unshift(newItem)
  alert('复制成功')
}

const deleteFreight = (index: number) => {
  if (confirm('确定要删除该运费模板吗？如果有商品正在使用该模板，可能会导致结算异常。')) {
    freights.value.splice(index, 1)
  }
}
</script>

<template>
  <div class="freight-manage">
    <div class="header">
      <div class="bread-crumb">运费模板管理</div>
    </div>

    <div class="container">
      <!-- 搜索区域 -->
      <div class="module search-area">
        <div class="form-item">
          <label>模板名称：</label>
          <input type="text" class="form-input" v-model="searchForm.keyword" placeholder="请输入模板名称">
        </div>
        <div class="form-actions">
          <button class="btn btn-primary" @click="handleSearch">查询</button>
          <button class="btn btn-default" @click="resetSearch">重置</button>
        </div>
      </div>

      <!-- 列表区域 -->
      <div class="module list-area">
        <div class="action-bar">
          <button class="btn btn-primary btn-add" @click="goPublish()">+ 新建运费模板</button>
        </div>
        
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 250px;">模板名称</th>
              <th style="width: 100px;">计费方式</th>
              <th>默认运费</th>
              <th>特殊地区规则数</th>
              <th style="width: 180px;">最后修改时间</th>
              <th style="width: 150px;">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in filteredFreights" :key="item.id">
              <td>
                <div class="freight-title" :title="item.name">{{ item.name }}</div>
              </td>
              <td>
                <span class="type-tag">{{ getTypeLabel(item.type) }}</span>
              </td>
              <td>
                <div class="fee-text">
                  首 {{ item.defaultRule.firstAmount }} ({{ item.type === 'piece' ? '件' : item.type === 'weight' ? 'kg' : 'm³' }}) 
                  - <span class="price">¥{{ item.defaultRule.firstFee.toFixed(2) }}</span>，
                  续 {{ item.defaultRule.nextAmount }} ({{ item.type === 'piece' ? '件' : item.type === 'weight' ? 'kg' : 'm³' }}) 
                  - <span class="price">¥{{ item.defaultRule.nextFee.toFixed(2) }}</span>
                </div>
              </td>
              <td>
                {{ item.specialRules.length }} 条
              </td>
              <td>
                <div class="time-text">{{ item.updatedAt }}</div>
              </td>
              <td>
                <button class="link-btn" @click="goPublish(item.id)">编辑</button>
                <button class="link-btn" @click="copyFreight(item)">复制</button>
                <button class="link-btn danger" @click="deleteFreight(index)">删除</button>
              </td>
            </tr>
            <tr v-if="filteredFreights.length === 0">
              <td colspan="6" class="empty-text">暂无符合条件的运费模板</td>
            </tr>
          </tbody>
        </table>
        
        <div class="pagination">
          <span>共 {{ filteredFreights.length }} 条记录</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 复用基础管理页样式 */
.freight-manage {
  background-color: #F5F7FA;
  min-height: 100vh;
  color: #333333;
  font-family: "Microsoft YaHei", sans-serif;
}
.header {
  position: sticky;
  top: 0;
  height: 60px;
  background-color: #FFFFFF;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  display: flex;
  align-items: center;
  padding: 0 20px;
  z-index: 999;
}
.bread-crumb {
  font-size: 14px;
  font-weight: bold;
  color: #333333;
}
.container {
  padding: 20px;
}
.module {
  background-color: #FFFFFF;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  padding: 20px;
  margin-bottom: 16px;
}

/* 搜索表单样式 */
.search-area {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  align-items: center;
}
.form-item {
  display: flex;
  align-items: center;
}
.form-item label {
  font-size: 14px;
  margin-right: 8px;
  color: #666666;
}
.form-input {
  height: 32px;
  border: 1px solid #DDDDDD;
  border-radius: 8px;
  padding: 0 12px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
  width: 240px;
}
.form-input:focus {
  border-color: #1677FF;
}
.form-actions {
  display: flex;
  gap: 10px;
}

/* 按钮通用样式 */
.btn {
  height: 32px;
  border-radius: 8px;
  border: none;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0 16px;
  font-weight: bold;
}
.btn-primary {
  background-color: #1677FF;
  color: #FFFFFF;
}
.btn-primary:hover {
  box-shadow: 0 2px 8px rgba(22, 119, 255, 0.2);
}
.btn-default {
  background-color: #EEEEEE;
  color: #333333;
}
.btn-default:hover {
  background-color: #E0E0E0;
}

/* 表格样式 */
.action-bar {
  margin-bottom: 16px;
}
.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
.data-table th, .data-table td {
  border-bottom: 1px solid #EEEEEE;
  padding: 16px 12px;
  text-align: left;
}
.data-table th {
  background-color: #FAFAFA;
  color: #666666;
  font-weight: bold;
  border-bottom: 2px solid #EEEEEE;
}
.data-table tbody tr:hover {
  background-color: #F5F7FA;
}
.freight-title {
  color: #333333;
  font-weight: 500;
}
.fee-text {
  color: #666;
  font-size: 13px;
}
.price {
  color: #FF4D4F;
  font-weight: bold;
}
.time-text {
  color: #999999;
  font-size: 13px;
}

.type-tag {
  display: inline-block;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  background-color: #F0F5FF;
  color: #2F54EB;
  border: 1px solid #ADC6FF;
}

/* 操作链接按钮样式 */
.link-btn {
  background: none;
  border: none;
  color: #1677FF;
  cursor: pointer;
  margin-right: 12px;
  font-size: 14px;
  padding: 0;
}
.link-btn.danger {
  color: #FF4D4F;
}
.link-btn:hover {
  text-decoration: underline;
}
.empty-text {
  text-align: center;
  padding: 60px 0;
  color: #999999;
}
.pagination {
  margin-top: 20px;
  font-size: 14px;
  color: #666666;
}
</style>