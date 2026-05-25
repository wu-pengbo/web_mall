<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// --- 搜索表单状态 ---
const searchForm = ref({
  keyword: '',
  status: '',
})

// --- 模拟预约项目数据 ---
const projects = ref([
  {
    id: 1,
    name: '高级律师 1v1 咨询',
    type: 'time_slot', // time_slot: 按时段, date: 按天
    status: 'active',
    createTime: '2026-05-01 10:00:00',
    capacity: '1人/时段',
    advanceHours: 24,
  },
  {
    id: 2,
    name: '奥体中心羽毛球馆 (含4个子场地)',
    type: 'time_slot',
    status: 'active',
    createTime: '2026-04-28 14:20:00',
    capacity: '1场/时段 (共4场)',
    advanceHours: 2,
  },
  {
    id: 3,
    name: '周末亲子烘焙大课',
    type: 'date',
    status: 'offline',
    createTime: '2026-04-15 09:15:00',
    capacity: '20组/天',
    advanceHours: 48,
  },
])

// --- 过滤逻辑 ---
const filteredProjects = computed(() => {
  return projects.value.filter((p) => {
    const matchKeyword = p.name.toLowerCase().includes(searchForm.value.keyword.toLowerCase())
    const matchStatus = searchForm.value.status === '' || p.status === searchForm.value.status
    return matchKeyword && matchStatus
  })
})

const getStatusText = (status: string) => {
  switch (status) {
    case 'active':
      return '开放中'
    case 'offline':
      return '已停用'
    default:
      return status
  }
}

const getTypeText = (type: string) => {
  return type === 'time_slot' ? '按时段预约' : '按天预约'
}

const goToPublish = (id?: number) => {
  if (id) {
    router.push(`/reservation/publish/${id}`)
  } else {
    router.push('/reservation/publish')
  }
}
</script>

<template>
  <div class="reservation-manage">
    <div class="page-header">
      <div class="title-area">
        <h2>预约项目管理</h2>
        <span class="sub-title">管理所有的独立排期引擎和预约表单</span>
      </div>
      <div class="action-area">
        <button class="btn btn-primary" @click="goToPublish()">+ 创建预约项目</button>
      </div>
    </div>

    <!-- 搜索与筛选区域 -->
    <div class="filter-card">
      <div class="filter-item">
        <label>项目名称</label>
        <input
          type="text"
          class="form-input"
          v-model="searchForm.keyword"
          placeholder="请输入项目名称搜索"
        />
      </div>
      <div class="filter-item">
        <label>状态</label>
        <select class="form-select" v-model="searchForm.status">
          <option value="">全部状态</option>
          <option value="active">开放中</option>
          <option value="offline">已停用</option>
        </select>
      </div>
      <div class="filter-actions">
        <button class="btn btn-primary">查询</button>
        <button
          class="btn btn-default"
          @click="
            () => {
              searchForm.keyword = ''
              searchForm.status = ''
            }
          "
        >
          重置
        </button>
      </div>
    </div>

    <!-- 列表区域 -->
    <div class="table-card">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>项目名称</th>
            <th>排期模式</th>
            <th>容量/库存配置</th>
            <th>提前预约要求</th>
            <th>状态</th>
            <th>创建时间</th>
            <th style="width: 180px; text-align: center">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredProjects" :key="item.id">
            <td style="color: #666">#{{ item.id }}</td>
            <td>
              <div class="project-name">{{ item.name }}</div>
            </td>
            <td>
              <span class="type-tag" :class="item.type">{{ getTypeText(item.type) }}</span>
            </td>
            <td>{{ item.capacity }}</td>
            <td>提前 {{ item.advanceHours }} 小时</td>
            <td>
              <span class="status-badge" :class="item.status">{{
                getStatusText(item.status)
              }}</span>
            </td>
            <td style="color: #666; font-size: 13px">{{ item.createTime }}</td>
            <td class="action-cell">
              <button class="link-btn" @click="router.push('/reservation/publish')">
                编辑排期
              </button>
              <button class="link-btn" @click="router.push('/reservation/board')">
                工作台日历
              </button>
              <button class="link-btn danger" v-if="item.status === 'active'">停用</button>
              <button class="link-btn success" v-else>启用</button>
            </td>
          </tr>
          <tr v-if="filteredProjects.length === 0">
            <td colspan="8" class="empty-text">暂无符合条件的预约项目</td>
          </tr>
        </tbody>
      </table>

      <!-- 简单分页 -->
      <div class="pagination">
        <span class="page-info">共 {{ filteredProjects.length }} 条记录</span>
        <div class="page-btns">
          <button class="page-btn disabled">上一页</button>
          <button class="page-btn active">1</button>
          <button class="page-btn disabled">下一页</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.reservation-manage {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.title-area h2 {
  margin: 0;
  font-size: 20px;
  color: #333;
}
.sub-title {
  font-size: 13px;
  color: #999;
  margin-top: 4px;
  display: inline-block;
}

.filter-card {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  gap: 24px;
  align-items: flex-end;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
.filter-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.filter-item label {
  font-size: 13px;
  color: #666;
}
.form-input,
.form-select {
  height: 32px;
  padding: 0 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  outline: none;
  transition: all 0.3s;
}
.form-input {
  width: 240px;
}
.form-select {
  width: 160px;
}
.form-input:focus,
.form-select:focus {
  border-color: #1677ff;
  box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.1);
}
.filter-actions {
  display: flex;
  gap: 12px;
}

.table-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
.data-table {
  width: 100%;
  border-collapse: collapse;
}
.data-table th,
.data-table td {
  padding: 16px 12px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}
.data-table th {
  background-color: #fafafa;
  color: #333;
  font-weight: 500;
  font-size: 14px;
}
.data-table td {
  color: #333;
  font-size: 14px;
}
.data-table tbody tr:hover {
  background-color: #fafafa;
}

.project-name {
  font-weight: 500;
  color: #333;
}

.type-tag {
  display: inline-block;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}
.type-tag.time_slot {
  background-color: #e6f4ff;
  color: #1677ff;
  border: 1px solid #91caff;
}
.type-tag.date {
  background-color: #f6ffed;
  color: #52c41a;
  border: 1px solid #b7eb8f;
}

.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}
.status-badge.active {
  background-color: #f6ffed;
  color: #52c41a;
  border: 1px solid #b7eb8f;
}
.status-badge.offline {
  background-color: #f5f5f5;
  color: #999999;
  border: 1px solid #d9d9d9;
}

.action-cell {
  display: flex;
  gap: 12px;
  justify-content: center;
}
.link-btn {
  background: none;
  border: none;
  color: #1677ff;
  cursor: pointer;
  padding: 0;
  font-size: 14px;
}
.link-btn.danger {
  color: #ff4d4f;
}
.link-btn.success {
  color: #52c41a;
}
.link-btn:hover {
  text-decoration: underline;
}

.empty-text {
  text-align: center;
  padding: 60px 0;
  color: #999999;
}

/* 按钮样式 */
.btn {
  height: 32px;
  padding: 0 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  border: 1px solid transparent;
  transition: all 0.2s;
}
.btn-primary {
  background-color: #1677ff;
  color: #fff;
}
.btn-primary:hover {
  background-color: #4096ff;
}
.btn-default {
  background-color: #fff;
  border-color: #d9d9d9;
  color: #333;
}
.btn-default:hover {
  color: #1677ff;
  border-color: #1677ff;
}

/* 分页样式 */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}
.page-info {
  color: #666;
  font-size: 14px;
}
.page-btns {
  display: flex;
  gap: 8px;
}
.page-btn {
  height: 28px;
  padding: 0 12px;
  border: 1px solid #dddddd;
  background-color: #ffffff;
  border-radius: 4px;
  cursor: pointer;
  color: #333333;
}
.page-btn:hover:not(.disabled) {
  border-color: #1677ff;
  color: #1677ff;
}
.page-btn.active {
  background-color: #1677ff;
  color: #ffffff;
  border-color: #1677ff;
}
.page-btn.disabled {
  color: #cccccc;
  background-color: #f5f5f5;
  cursor: not-allowed;
}
</style>
