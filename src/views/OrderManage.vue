<script setup lang="ts">
import { ref, computed } from 'vue'

// --- 搜索表单状态 ---
const searchForm = ref({
  orderNo: '',
  receiver: '',
  status: '',
  dateRange: { start: '', end: '' }
})

// --- 模拟订单数据 ---
const orders = ref([
  {
    id: 1001,
    orderNo: 'ORD202604050001',
    createTime: '2026-04-05 10:23:45',
    status: 'unshipped', // pending_payment, unshipped, shipped, completed, cancelled, refunding
    amount: 178.00,
    payMethod: 'WeChat',
    receiver: { name: '张伟', phone: '13800138000', address: '北京市朝阳区中关村大街1号' },
    products: [
      { name: '2026新款时尚休闲T恤 宽松显瘦百搭款', spec: '黑色 / L', price: 89.00, qty: 2, image: '' }
    ]
  },
  {
    id: 1002,
    orderNo: 'ORD202604040102',
    createTime: '2026-04-04 15:42:10',
    status: 'shipped',
    amount: 129.00,
    payMethod: 'Alipay',
    receiver: { name: '李娜', phone: '13912345678', address: '上海市海淀区科技园路8号' },
    products: [
      { name: '春季新款直筒牛仔裤 男士百搭长裤', spec: '深蓝色 / 32', price: 129.00, qty: 1, image: '' }
    ]
  },
  {
    id: 1003,
    orderNo: 'ORD202604030055',
    createTime: '2026-04-03 09:15:00',
    status: 'pending_payment',
    amount: 318.00,
    payMethod: '',
    receiver: { name: '王强', phone: '15888888888', address: '广州市浦东新区滨海大道9号' },
    products: [
      { name: '男士加绒加厚卫衣 冬季保暖宽松连帽上衣', spec: '灰色 / XL', price: 159.00, qty: 2, image: '' }
    ]
  },
  {
    id: 1004,
    orderNo: 'ORD202604010023',
    createTime: '2026-04-01 18:30:00',
    status: 'completed',
    amount: 89.00,
    payMethod: 'WeChat',
    receiver: { name: '赵丽', phone: '13777777777', address: '深圳市天河区深南大道100号' },
    products: [
      { name: '纯棉透气圆领短袖T恤 基础款 纯色打底衫', spec: '白色 / M', price: 89.00, qty: 1, image: '' }
    ]
  },
  {
    id: 1005,
    orderNo: 'ORD202603300188',
    createTime: '2026-03-30 14:20:00',
    status: 'refunding',
    amount: 129.00,
    payMethod: 'CreditCard',
    receiver: { name: '孙博', phone: '13666666666', address: '成都市越秀区天府三街' },
    products: [
      { name: '春季新款直筒牛仔裤 男士百搭长裤', spec: '浅蓝色 / 30', price: 129.00, qty: 1, image: '' }
    ]
  }
])

// --- 状态字典映射 ---
const statusMap: Record<string, { label: string, color: string, bgColor: string, borderColor: string }> = {
  pending_payment: { label: '待付款', color: '#FA8C16', bgColor: '#FFF7E6', borderColor: '#FFD591' },
  unshipped: { label: '待发货', color: '#1890FF', bgColor: '#E6F7FF', borderColor: '#91D5FF' },
  shipped: { label: '已发货', color: '#722ED1', bgColor: '#F9F0FF', borderColor: '#D3ADF7' },
  completed: { label: '已完成', color: '#52C41A', bgColor: '#F6FFED', borderColor: '#B7EB8F' },
  cancelled: { label: '已取消', color: '#999999', bgColor: '#F5F5F5', borderColor: '#D9D9D9' },
  refunding: { label: '退款中', color: '#F5222D', bgColor: '#FFF1F0', borderColor: '#FFA39E' }
}

// --- 搜索与过滤逻辑 ---
const filteredOrders = computed(() => {
  return orders.value.filter(o => {
    const matchOrderNo = o.orderNo.includes(searchForm.value.orderNo)
    const matchReceiver = o.receiver.name.includes(searchForm.value.receiver) || o.receiver.phone.includes(searchForm.value.receiver)
    const matchStatus = searchForm.value.status ? o.status === searchForm.value.status : true
    
    // 日期范围过滤
    let matchDate = true
    if (searchForm.value.dateRange.start && searchForm.value.dateRange.end) {
      const orderDate = o.createTime.split(' ')[0]
      matchDate = orderDate >= searchForm.value.dateRange.start && orderDate <= searchForm.value.dateRange.end
    }

    return matchOrderNo && matchReceiver && matchStatus && matchDate
  })
})

const handleSearch = () => {
  console.log('执行订单搜索：', searchForm.value)
}

const resetSearch = () => {
  searchForm.value.orderNo = ''
  searchForm.value.receiver = ''
  searchForm.value.status = ''
  searchForm.value.dateRange = { start: '', end: '' }
}

// --- 订单操作逻辑 ---
const shipOrder = (order: any) => {
  if (confirm(`确认对订单 ${order.orderNo} 进行发货操作吗？`)) {
    order.status = 'shipped'
    alert('发货成功！')
  }
}

const cancelOrder = (order: any) => {
  if (confirm(`确认取消订单 ${order.orderNo} 吗？`)) {
    order.status = 'cancelled'
    alert('订单已取消。')
  }
}

const processRefund = (order: any) => {
  if (confirm(`确认同意订单 ${order.orderNo} 的退款申请吗？\n将退还 ￥${order.amount.toFixed(2)}`)) {
    order.status = 'cancelled'
    alert('退款已处理，订单已关闭。')
  }
}
</script>

<template>
  <div class="order-manage">
    <!-- 顶部导航 -->
    <div class="header">
      <div class="bread-crumb">订单管理</div>
    </div>

    <!-- 页面主体 -->
    <div class="container">
      <!-- 搜索区域 -->
      <div class="module search-area">
        <div class="form-item">
          <label>订单编号：</label>
          <input type="text" class="form-input" v-model="searchForm.orderNo" placeholder="请输入订单编号">
        </div>
        <div class="form-item">
          <label>收货人：</label>
          <input type="text" class="form-input" v-model="searchForm.receiver" placeholder="姓名或手机号">
        </div>
        <div class="form-item">
          <label>订单状态：</label>
          <select class="form-select" v-model="searchForm.status">
            <option value="">全部</option>
            <option value="pending_payment">待付款</option>
            <option value="unshipped">待发货</option>
            <option value="shipped">已发货</option>
            <option value="completed">已完成</option>
            <option value="refunding">退款/售后</option>
            <option value="cancelled">已关闭</option>
          </select>
        </div>
        <div class="form-item">
          <label>下单时间：</label>
          <div style="display: flex; align-items: center; gap: 8px;">
            <input type="date" class="form-input" style="width: 140px;" v-model="searchForm.dateRange.start">
            <span>至</span>
            <input type="date" class="form-input" style="width: 140px;" v-model="searchForm.dateRange.end">
          </div>
        </div>
        <div class="form-actions">
          <button class="btn btn-primary" @click="handleSearch">查询</button>
          <button class="btn btn-default" @click="resetSearch">重置</button>
        </div>
      </div>

      <!-- 列表区域 -->
      <div class="module list-area">
        <div class="action-bar">
          <button class="btn btn-default">批量导出订单</button>
          <button class="btn btn-default" style="margin-left: 10px;">批量发货</button>
        </div>
        
        <!-- 订单列表采用卡片式表格以更好地展示多商品和收货信息 -->
        <div class="order-list">
          <div class="order-card" v-for="order in filteredOrders" :key="order.id">
            <!-- 订单卡片头部 -->
            <div class="order-header">
              <div class="header-left">
                <span class="order-no">订单号：{{ order.orderNo }}</span>
                <span class="order-time">下单时间：{{ order.createTime }}</span>
              </div>
              <div class="header-right">
                <span class="status-tag" :style="{ 
                  color: statusMap[order.status].color, 
                  backgroundColor: statusMap[order.status].bgColor, 
                  borderColor: statusMap[order.status].borderColor 
                }">
                  {{ statusMap[order.status].label }}
                </span>
              </div>
            </div>
            
            <!-- 订单卡片内容 -->
            <div class="order-body">
              <!-- 商品信息区 (可能有多行) -->
              <div class="product-col">
                <div class="product-item" v-for="(prod, index) in order.products" :key="index">
                  <div class="product-img">商品图</div>
                  <div class="product-info">
                    <div class="product-name" :title="prod.name">{{ prod.name }}</div>
                    <div class="product-spec">{{ prod.spec }}</div>
                  </div>
                  <div class="product-price">
                    <div>￥{{ prod.price.toFixed(2) }}</div>
                    <div class="product-qty">x {{ prod.qty }}</div>
                  </div>
                </div>
              </div>
              
              <!-- 收货人信息区 -->
              <div class="receiver-col">
                <div class="receiver-name">{{ order.receiver.name }} <span class="receiver-phone">{{ order.receiver.phone }}</span></div>
                <div class="receiver-address" :title="order.receiver.address">{{ order.receiver.address }}</div>
              </div>
              
              <!-- 金额区 -->
              <div class="amount-col">
                <div class="total-amount">￥{{ order.amount.toFixed(2) }}</div>
                <div class="pay-method" v-if="order.payMethod">{{ order.payMethod === 'WeChat' ? '微信支付' : order.payMethod === 'Alipay' ? '支付宝' : '其他支付' }}</div>
                <div class="pay-method" v-else>未支付</div>
              </div>
              
              <!-- 操作区 -->
              <div class="action-col">
                <button class="link-btn">订单详情</button>
                <button class="link-btn" v-if="order.status === 'unshipped'" @click="shipOrder(order)">发货</button>
                <button class="link-btn" v-if="order.status === 'pending_payment'" @click="cancelOrder(order)">取消订单</button>
                <button class="link-btn danger" v-if="order.status === 'refunding'" @click="processRefund(order)">处理退款</button>
                <button class="link-btn" v-if="order.status === 'shipped'">查看物流</button>
              </div>
            </div>
          </div>

          <div v-if="filteredOrders.length === 0" class="empty-text">
            暂无符合条件的订单
          </div>
        </div>
        
        <!-- 分页 -->
        <div class="pagination">
          <span>共 {{ filteredOrders.length }} 条记录</span>
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
.order-manage {
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
  gap: 20px;
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
  white-space: nowrap;
}
.form-input, .form-select {
  height: 32px;
  border: 1px solid #DDDDDD;
  border-radius: 8px;
  padding: 0 12px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}
.form-input:focus, .form-select:focus {
  border-color: #1677FF;
}
.form-input { width: 200px; }
.form-select { width: 140px; }
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
  background-color: #FFFFFF;
  color: #333333;
  border: 1px solid #DDDDDD;
}
.btn-default:hover {
  border-color: #1677FF;
  color: #1677FF;
}

/* 订单卡片列表样式 */
.action-bar {
  margin-bottom: 16px;
}
.order-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.order-card {
  border: 1px solid #EEEEEE;
  border-radius: 8px;
  overflow: hidden;
}
.order-header {
  background-color: #FAFAFA;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #EEEEEE;
  font-size: 13px;
}
.header-left {
  display: flex;
  gap: 24px;
}
.order-no {
  font-weight: bold;
  color: #333;
}
.order-time {
  color: #999;
}
.status-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid transparent;
}

/* 订单卡片主体布局 */
.order-body {
  display: flex;
  align-items: stretch;
}
.order-body > div {
  padding: 16px;
  border-right: 1px solid #EEEEEE;
}
.order-body > div:last-child {
  border-right: none;
}

.product-col {
  flex: 3;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.product-item {
  display: flex;
  gap: 12px;
}
.product-img {
  width: 60px;
  height: 60px;
  background-color: #F0F0F0;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 12px;
  flex-shrink: 0;
}
.product-info {
  flex: 1;
}
.product-name {
  font-size: 14px;
  color: #333;
  line-height: 1.4;
  margin-bottom: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.product-spec {
  font-size: 12px;
  color: #999;
}
.product-price {
  text-align: right;
  width: 80px;
  font-size: 14px;
  color: #333;
}
.product-qty {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.receiver-col {
  flex: 1.5;
  font-size: 13px;
  color: #333;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.receiver-name {
  margin-bottom: 4px;
}
.receiver-phone {
  color: #666;
  margin-left: 4px;
}
.receiver-address {
  color: #999;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

.amount-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.total-amount {
  font-size: 16px;
  font-weight: bold;
  color: #FF4D4F;
  margin-bottom: 4px;
}
.pay-method {
  font-size: 12px;
  color: #999;
}

.action-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

/* 操作链接按钮样式 */
.link-btn {
  background: none;
  border: none;
  color: #1677FF;
  cursor: pointer;
  font-size: 13px;
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
  font-size: 14px;
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
  border: 1px solid #DDDDDD;
  background-color: #FFFFFF;
  border-radius: 4px;
  cursor: pointer;
  color: #333333;
}
.page-btn:hover:not(.disabled) {
  border-color: #1677FF;
  color: #1677FF;
}
.page-btn.active {
  background-color: #1677FF;
  color: #FFFFFF;
  border-color: #1677FF;
}
.page-btn.disabled {
  color: #CCCCCC;
  background-color: #F5F5F5;
  cursor: not-allowed;
}
</style>