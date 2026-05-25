<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// --- 搜索表单状态 ---
const searchForm = ref({
  keyword: '',
  status: '',
})

// --- 模拟商品数据 ---
const products = ref([
  {
    id: 1,
    name: '2026新款时尚休闲T恤 宽松显瘦百搭款',
    code: 'yx20260401001',
    price: 89.0,
    stock: 1200,
    status: 'on',
    time: '2026-04-01 10:00:00',
  },
  {
    id: 2,
    name: '春季新款直筒牛仔裤 男士百搭长裤 修身显瘦',
    code: 'yx20260401002',
    price: 129.0,
    stock: 850,
    status: 'off',
    time: '2026-03-28 14:20:00',
  },
  {
    id: 3,
    name: '纯棉透气圆领短袖T恤 基础款 纯色打底衫',
    code: 'yx20260401003',
    price: 59.0,
    stock: 0,
    status: 'draft',
    time: '2026-03-25 09:15:00',
  },
  {
    id: 4,
    name: '男士加绒加厚卫衣 冬季保暖宽松连帽上衣',
    code: 'yx20260401004',
    price: 159.0,
    stock: 320,
    status: 'on',
    time: '2026-03-10 11:30:00',
  },
])

// --- 搜索与过滤逻辑 ---
const filteredProducts = computed(() => {
  return products.value.filter((p) => {
    const matchKeyword =
      p.name.includes(searchForm.value.keyword) || p.code.includes(searchForm.value.keyword)
    const matchStatus = searchForm.value.status ? p.status === searchForm.value.status : true
    return matchKeyword && matchStatus
  })
})

const handleSearch = () => {
  // 在真实项目中，这里通常会触发接口请求
  console.log('执行搜索：', searchForm.value)
}

const resetSearch = () => {
  searchForm.value.keyword = ''
  searchForm.value.status = ''
}

// --- 页面跳转与操作逻辑 ---
const goPublish = () => {
  router.push('/publish')
}

const toggleStatus = (item: any) => {
  if (item.status === 'on') {
    if (confirm(`确定要下架商品 "${item.name}" 吗？`)) {
      item.status = 'off'
    }
  } else if (item.status === 'off' || item.status === 'draft') {
    if (confirm(`确定要上架商品 "${item.name}" 吗？`)) {
      item.status = 'on'
    }
  }
}

const deleteProduct = (index: number) => {
  if (confirm('确定要彻底删除该商品吗？此操作不可恢复。')) {
    products.value.splice(index, 1)
  }
}
</script>

<template>
  <div class="product-manage">
    <!-- 顶部导航 -->
    <div class="header">
      <div class="bread-crumb">商品管理</div>
    </div>

    <!-- 页面主体 -->
    <div class="container">
      <!-- 搜索区域 -->
      <div class="module search-area">
        <div class="form-item">
          <label>商品搜索：</label>
          <input
            type="text"
            class="form-input"
            v-model="searchForm.keyword"
            placeholder="请输入商品名称或编码"
          />
        </div>
        <div class="form-item">
          <label>商品状态：</label>
          <select class="form-select" v-model="searchForm.status">
            <option value="">全部</option>
            <option value="on">上架中</option>
            <option value="off">已下架</option>
            <option value="draft">草稿</option>
          </select>
        </div>
        <div class="form-actions">
          <button class="btn btn-primary" @click="handleSearch">查询</button>
          <button class="btn btn-default" @click="resetSearch">重置</button>
        </div>
      </div>

      <!-- 列表区域 -->
      <div class="module list-area">
        <div class="action-bar">
          <button class="btn btn-primary btn-add" @click="goPublish">+ 创建商品</button>
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 300px">商品信息</th>
              <th>商品编码</th>
              <th>售价</th>
              <th>库存</th>
              <th>状态</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in filteredProducts" :key="item.id">
              <td>
                <div class="product-info">
                  <div class="product-img">图</div>
                  <div class="product-name" :title="item.name">{{ item.name }}</div>
                </div>
              </td>
              <td>{{ item.code }}</td>
              <td class="price-text">￥{{ item.price.toFixed(2) }}</td>
              <td>
                <span :style="{ color: item.stock < 10 ? '#FF4D4F' : 'inherit' }">{{
                  item.stock
                }}</span>
              </td>
              <td>
                <span class="status-tag" :class="item.status">
                  {{ item.status === 'on' ? '上架中' : item.status === 'off' ? '已下架' : '草稿' }}
                </span>
              </td>
              <td class="time-text">{{ item.time }}</td>
              <td>
                <button class="link-btn" @click="goPublish">编辑</button>
                <button class="link-btn" @click="toggleStatus(item)">
                  {{ item.status === 'on' ? '下架' : '上架' }}
                </button>
                <button class="link-btn danger" @click="deleteProduct(index)">删除</button>
              </td>
            </tr>
            <tr v-if="filteredProducts.length === 0">
              <td colspan="7" class="empty-text">暂无符合条件的商品</td>
            </tr>
          </tbody>
        </table>

        <!-- 简单分页区域（UI展示） -->
        <div class="pagination">
          <span>共 {{ filteredProducts.length }} 条记录</span>
          <div class="page-btns">
            <button class="page-btn disabled">上一页</button>
            <button class="page-btn active">1</button>
            <button class="page-btn disabled">下一页</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 基础与页面框架样式 */
.product-manage {
  background-color: #f5f7fa;
  min-height: 100vh;
  color: #333333;
  font-family: 'Microsoft YaHei', sans-serif;
}
.header {
  position: sticky;
  top: 0;
  height: 60px;
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
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
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
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
.form-input,
.form-select {
  height: 32px;
  border: 1px solid #dddddd;
  border-radius: 8px;
  padding: 0 12px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}
.form-input:focus,
.form-select:focus {
  border-color: #1677ff;
}
.form-input {
  width: 240px;
}
.form-select {
  width: 140px;
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
  background-color: #1677ff;
  color: #ffffff;
}
.btn-primary:hover {
  box-shadow: 0 2px 8px rgba(22, 119, 255, 0.2);
}
.btn-default {
  background-color: #eeeeee;
  color: #333333;
}
.btn-default:hover {
  background-color: #e0e0e0;
}
.btn-add {
  width: auto;
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
.data-table th,
.data-table td {
  border-bottom: 1px solid #eeeeee;
  padding: 16px 12px;
  text-align: left;
}
.data-table th {
  background-color: #fafafa;
  color: #666666;
  font-weight: bold;
  border-bottom: 2px solid #eeeeee;
}
.data-table tbody tr:hover {
  background-color: #f5f7fa;
}
.product-info {
  display: flex;
  align-items: center;
  gap: 12px;
}
.product-img {
  width: 50px;
  height: 50px;
  background-color: #f0f0f0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999999;
  font-size: 12px;
  flex-shrink: 0;
}
.product-name {
  color: #333333;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.price-text {
  color: #ff4d4f;
  font-weight: bold;
}
.time-text {
  color: #999999;
  font-size: 13px;
}

/* 状态标签样式 */
.status-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}
.status-tag.on {
  background-color: #e6f4ff;
  color: #1677ff;
  border: 1px solid #91caff;
}
.status-tag.off {
  background-color: #fff1f0;
  color: #ff4d4f;
  border: 1px solid #ffa39e;
}
.status-tag.draft {
  background-color: #f5f5f5;
  color: #666666;
  border: 1px solid #d9d9d9;
}

/* 操作链接按钮样式 */
.link-btn {
  background: none;
  border: none;
  color: #1677ff;
  cursor: pointer;
  margin-right: 12px;
  font-size: 14px;
  padding: 0;
}
.link-btn.danger {
  color: #ff4d4f;
}
.link-btn:hover {
  text-decoration: underline;
}
.empty-text {
  text-align: center;
  padding: 60px 0;
  color: #999999;
}

/* 分页样式 */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  font-size: 14px;
  color: #666666;
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
