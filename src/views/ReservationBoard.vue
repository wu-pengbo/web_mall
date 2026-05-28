<script setup lang="ts">
import { ref, computed } from 'vue'

// --- 模拟底层配置数据 ---
const projectConfig = ref({
  name: '奥体中心羽毛球馆',
  subResources: [
    { id: 1, name: '1号场' },
    { id: 2, name: '2号场' },
    { id: 3, name: '3号场' },
    { id: 4, name: 'VIP场' },
  ],
  timeSlots: [
    '09:00-10:00',
    '10:00-11:00',
    '11:00-12:00',
    '14:00-15:00',
    '15:00-16:00',
    '16:00-17:00',
    '18:00-19:00',
    '19:00-20:00',
    '20:00-21:00',
    '21:00-22:00',
  ],
  businessDays: ['1', '2', '3', '4', '5'], // 仅周一至周五营业
  exceptionDates: [
    { date: '2026-05-13', type: 'closed' }, // 模拟某一天特殊休业
  ],
})

// --- 状态控制 ---
const currentView = ref('matrix') // matrix: 日历看板, list: 预约流水

// 模拟未来7天的日期
const generateDays = () => {
  const days = []
  const today = new Date('2026-05-08') // 使用 mock 今天的时间 (周五)

  // 星期映射 (0-6对应周日-周六)
  const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

  for (let i = 0; i < 7; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

    // 判断是否营业
    const dayOfWeek = d.getDay().toString()
    let isBusinessDay = projectConfig.value.businessDays.includes(dayOfWeek)

    // 检查例外规则
    const exception = projectConfig.value.exceptionDates.find((e) => e.date === dateStr)
    if (exception) {
      isBusinessDay = exception.type === 'open'
    }

    days.push({
      date: dateStr,
      label: i === 0 ? '今天' : i === 1 ? '明天' : `${d.getMonth() + 1}月${d.getDate()}日`,
      dayName: dayNames[d.getDay()],
      isBusinessDay,
    })
  }
  return days
}

const dateTabs = ref(generateDays())
const currentDate = ref(dateTabs.value[0].date)

// --- 模拟订单数据 ---
// 格式：[日期_时段_资源ID] -> 订单详情数组 (支持多容量)
const ordersMap = ref<Record<string, any[]>>({
  '2026-05-08_14:00-15:00_1': [
    {
      id: 'E1001',
      name: '张三',
      phone: '138****0001',
      status: 'confirmed',
      type: 'sku_order',
    },
  ],
  '2026-05-08_14:00-15:00_2': [
    {
      id: 'E1002',
      name: '李四',
      phone: '139****0002',
      status: 'completed',
      type: 'sku_order',
    },
    {
      id: 'E1005',
      name: '王五',
      phone: '139****0005',
      status: 'pending',
      type: 'free_book',
    },
  ],
  '2026-05-08_19:00-20:00_4': [
    {
      id: 'E1003',
      name: '王老板',
      phone: '137****0003',
      status: 'confirmed',
      type: 'sku_order',
    },
  ],
  '2026-05-09_10:00-11:00_1': [
    {
      id: 'R2001',
      name: '赵六',
      phone: '136****0004',
      status: 'pending',
      type: 'free_book',
    },
  ],
})

// 每个格子/时段的最大容量
const getCapacity = (timeSlot: string, resourceId: number) => {
  // 这里可以根据实际 projectConfig 中 timeSlots 的配置返回
  // 暂时统一模拟为单资源容量为 4
  return 4
}

// --- 交互控制 ---
const selectedCell = ref<any>(null)
const isDrawerVisible = ref(false)

// 衍生流水数据
const orderList = computed(() => {
  const list: any[] = []
  Object.entries(ordersMap.value).forEach(([key, orders]) => {
    const [date, timeSlot, resourceIdStr] = key.split('_')
    const resourceId = Number(resourceIdStr)
    const resourceObj = projectConfig.value.subResources.find((r) => r.id === resourceId)
    const resource = resourceObj ? resourceObj.name : '未知资源'

    if (!orders) return // 过滤掉可能的空数据

    // orders 可能是单个对象（为了兼容旧数据），也可能是数组
    const ordersArray = Array.isArray(orders) ? orders : [orders]

    ordersArray.forEach((order) => {
      if (!order) return
      list.push({
        key,
        date: date || '',
        timeSlot: timeSlot || '',
        resourceId,
        resource,
        ...order,
      })
    })
  })

  return list.sort((a, b) => {
    if (a.date !== b.date) return b.date.localeCompare(a.date) // 倒序
    return b.timeSlot.localeCompare(a.timeSlot)
  })
})

const handleCellClick = (timeSlot: string, resourceId: number) => {
  const key = `${currentDate.value}_${timeSlot}_${resourceId}`
  const ordersRaw = ordersMap.value[key]

  if (ordersRaw) {
    const orders = Array.isArray(ordersRaw) ? ordersRaw : [ordersRaw]
    if (orders.length > 0) {
      // 检查格子是否已满，如果没满，依然可以在抽屉里加一个“新增”入口（暂用基础逻辑，先展示详情）
      selectedCell.value = {
        date: currentDate.value,
        timeSlot,
        resourceId,
        resource: projectConfig.value.subResources.find((r) => r.id === resourceId)?.name,
        orders, // 把整个数组传过去
        ...orders[0],
      }
      isDrawerVisible.value = true
      return
    }
  }

  // 如果点击的是空闲格子，直接打开代客预约弹窗
  createForm.value = {
    date: currentDate.value,
    timeSlot,
    resourceId: String(resourceId),
    name: '',
    phone: '',
  }
  isCreateModalVisible.value = true
}

const handleApprove = (orderId?: string) => {
  if (selectedCell.value) {
    const targetId = orderId || selectedCell.value.id
    if (!targetId) return

    const key =
      selectedCell.value.key ||
      `${selectedCell.value.date}_${selectedCell.value.timeSlot}_${selectedCell.value.resourceId}`

    if (ordersMap.value[key]) {
      const ordersArray = Array.isArray(ordersMap.value[key])
        ? ordersMap.value[key]
        : [ordersMap.value[key]]
      const targetOrder = ordersArray.find((o: any) => o.id === targetId)
      if (targetOrder) targetOrder.status = 'confirmed'
    }

    // 如果是从列表视图点进来的单个订单
    if (selectedCell.value.id === targetId) {
      selectedCell.value.status = 'confirmed'
    }

    alert('预约已通过审核，短信通知已发送给用户')
  }
}

const handleReject = (orderId?: string) => {
  if (selectedCell.value) {
    const targetId = orderId || selectedCell.value.id
    if (!targetId) return

    const key =
      selectedCell.value.key ||
      `${selectedCell.value.date}_${selectedCell.value.timeSlot}_${selectedCell.value.resourceId}`

    if (ordersMap.value[key]) {
      const ordersArray = Array.isArray(ordersMap.value[key])
        ? ordersMap.value[key]
        : [ordersMap.value[key]]
      ordersMap.value[key] = ordersArray.filter((o: any) => o.id !== targetId)
      if (ordersMap.value[key].length === 0) delete ordersMap.value[key]
    }

    // 更新当前抽屉视图
    if (selectedCell.value.orders) {
      selectedCell.value.orders = selectedCell.value.orders.filter((o: any) => o.id !== targetId)
    }

    alert('已拒绝预约，订单已取消')
    if (!selectedCell.value.orders || selectedCell.value.orders.length === 0) {
      closeDrawer()
    }
  }
}

const handleWriteOff = (orderId?: string) => {
  if (selectedCell.value) {
    const targetId = orderId || selectedCell.value.id
    if (!targetId) return

    const key =
      selectedCell.value.key ||
      `${selectedCell.value.date}_${selectedCell.value.timeSlot}_${selectedCell.value.resourceId}`

    if (ordersMap.value[key]) {
      const ordersArray = Array.isArray(ordersMap.value[key])
        ? ordersMap.value[key]
        : [ordersMap.value[key]]
      const targetOrder = ordersArray.find((o: any) => o.id === targetId)
      if (targetOrder) targetOrder.status = 'completed'
    }

    // 如果是从列表视图点进来的单个订单
    if (selectedCell.value.id === targetId) {
      selectedCell.value.status = 'completed'
    }

    alert('核销成功，用户已入场')
  }
}

const handleCancel = (orderId?: string) => {
  if (selectedCell.value) {
    const targetId = orderId || selectedCell.value.id
    if (!targetId) return

    const key =
      selectedCell.value.key ||
      `${selectedCell.value.date}_${selectedCell.value.timeSlot}_${selectedCell.value.resourceId}`

    if (ordersMap.value[key]) {
      const ordersArray = Array.isArray(ordersMap.value[key])
        ? ordersMap.value[key]
        : [ordersMap.value[key]]
      ordersMap.value[key] = ordersArray.filter((o: any) => o.id !== targetId)
      if (ordersMap.value[key].length === 0) delete ordersMap.value[key]
    }

    // 更新当前抽屉视图
    if (selectedCell.value.orders) {
      selectedCell.value.orders = selectedCell.value.orders.filter((o: any) => o.id !== targetId)
    }

    alert('订单已取消')
    if (!selectedCell.value.orders || selectedCell.value.orders.length === 0) {
      closeDrawer()
    }
  }
}

const handleListAction = (order: any) => {
  selectedCell.value = { ...order }
  isDrawerVisible.value = true
}

const closeDrawer = () => {
  isDrawerVisible.value = false
  selectedCell.value = null
}

// --- 后台代客预约逻辑 ---
const isCreateModalVisible = ref(false)
const createForm = ref({
  date: '',
  timeSlot: '',
  resourceId: '',
  name: '',
  phone: '',
})

const openCreateModal = () => {
  // 默认选中当前选中的日期和第一个时段、资源
  createForm.value = {
    date: currentDate.value,
    timeSlot: projectConfig.value.timeSlots[0],
    resourceId: String(projectConfig.value.subResources[0].id),
    name: '',
    phone: '',
  }
  isCreateModalVisible.value = true
}

const closeCreateModal = () => {
  isCreateModalVisible.value = false
}

const handleQuickCreateFromDrawer = () => {
  if (!selectedCell.value) return

  createForm.value = {
    date: selectedCell.value.date,
    timeSlot: selectedCell.value.timeSlot,
    resourceId: String(selectedCell.value.resourceId),
    name: '',
    phone: '',
  }
  isCreateModalVisible.value = true
  closeDrawer() // 关闭侧边栏，避免弹窗重叠遮挡
}

const submitCreateReservation = () => {
  if (!createForm.value.name || !createForm.value.phone) {
    alert('请填写客户姓名和手机号')
    return
  }

  const key = `${createForm.value.date}_${createForm.value.timeSlot}_${createForm.value.resourceId}`

  // 检查是否冲突
  if (ordersMap.value[key]) {
    alert('该时段和场地已被占用，请重新选择！')
    return
  }

  // 生成新订单
  if (!ordersMap.value[key]) {
    ordersMap.value[key] = []
  }

  ordersMap.value[key].push({
    id: `B${Math.floor(Math.random() * 10000)}`,
    name: createForm.value.name,
    phone: createForm.value.phone,
    status: 'confirmed', // 后台代客预约直接确认为已预订
    type: 'free_book', // 独立预约
  })

  alert('后台代客预约成功！')
  closeCreateModal()
}

const getCellStatusInfo = (timeSlot: string, resourceId: number) => {
  const key = `${currentDate.value}_${timeSlot}_${resourceId}`
  const ordersRaw = ordersMap.value[key] || []
  const orders = Array.isArray(ordersRaw) ? ordersRaw : [ordersRaw]
  const maxCapacity = getCapacity(timeSlot, resourceId)

  if (orders.length === 0) {
    return { status: 'free', text: '空闲', count: 0, max: maxCapacity }
  }

  // 计算不同状态的订单数量
  let pendingCount = 0
  let confirmedCount = 0
  let completedCount = 0

  orders.forEach((o) => {
    if (o.status === 'pending') pendingCount++
    if (o.status === 'confirmed') confirmedCount++
    if (o.status === 'completed') completedCount++
  })

  const totalOccupied = pendingCount + confirmedCount + completedCount
  const isFull = totalOccupied >= maxCapacity

  // 决定该格子的主色调状态 (优先级: 待审核 > 已满 > 已预订 > 已核销)
  let mainStatus = 'confirmed'
  if (pendingCount > 0) mainStatus = 'pending'
  else if (isFull) mainStatus = 'full'
  else if (completedCount > 0 && confirmedCount === 0) mainStatus = 'completed'

  return {
    status: mainStatus,
    text: isFull ? '已满' : '部分占用',
    count: totalOccupied,
    max: maxCapacity,
    orders,
  }
}
</script>

<template>
  <div class="reservation-board">
    <div class="page-header">
      <div class="header-left">
        <h2>预约工作台看板</h2>
        <div class="project-selector">
          <select class="form-select">
            <option>奥体中心羽毛球馆</option>
            <option>高级律师1v1咨询</option>
          </select>
        </div>
        <div class="view-toggle">
          <button
            class="toggle-btn"
            :class="{ active: currentView === 'matrix' }"
            @click="currentView = 'matrix'"
          >
            日历看板
          </button>
          <button
            class="toggle-btn"
            :class="{ active: currentView === 'list' }"
            @click="currentView = 'list'"
          >
            预约流水
          </button>
        </div>
      </div>
      <div class="header-right">
        <button class="btn btn-primary" style="margin-right: 16px" @click="openCreateModal">
          + 新增预约
        </button>
        <div class="status-legend">
          <span class="legend-item"><i class="dot free"></i>空闲</span>
          <span class="legend-item"><i class="dot pending"></i>待审核</span>
          <span class="legend-item"><i class="dot confirmed"></i>已预订</span>
          <span class="legend-item"><i class="dot completed"></i>已核销</span>
          <span class="legend-item"><i class="dot full"></i>已满</span>
        </div>
      </div>
    </div>

    <!-- 日期切换 -->
    <div class="date-tabs">
      <div
        v-for="tab in dateTabs"
        :key="tab.date"
        class="date-tab"
        :class="{
          active: currentDate === tab.date,
          'non-business': !tab.isBusinessDay,
        }"
        @click="tab.isBusinessDay ? (currentDate = tab.date) : null"
      >
        <div class="date-label">
          {{ tab.label }} <span style="font-size: 12px; opacity: 0.8">({{ tab.dayName }})</span>
        </div>
        <div class="date-value">{{ tab.date.substring(5) }}</div>
        <div class="closed-tag" v-if="!tab.isBusinessDay">休业</div>
      </div>
    </div>

    <!-- 二维矩阵日历 -->
    <div class="matrix-container" v-if="currentView === 'matrix'">
      <div
        v-if="!dateTabs.find((t) => t.date === currentDate)?.isBusinessDay"
        class="closed-state-view"
      >
        <div class="empty-state-icon">🏖️</div>
        <h3>当前日期为休业日</h3>
        <p>根据项目规则，该日期不开放预约，暂无排期数据。</p>
      </div>
      <table class="matrix-table" v-else>
        <thead>
          <tr>
            <th class="time-col">时间段</th>
            <th v-for="res in projectConfig.subResources" :key="res.id">
              {{ res.name }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="timeSlot in projectConfig.timeSlots" :key="timeSlot">
            <td class="time-col">{{ timeSlot }}</td>
            <td v-for="res in projectConfig.subResources" :key="res.id" class="cell-wrapper">
              <div
                class="matrix-cell"
                :class="getCellStatusInfo(timeSlot, res.id).status"
                @click="handleCellClick(timeSlot, res.id)"
              >
                <template v-if="getCellStatusInfo(timeSlot, res.id).status === 'free'">
                  <span class="free-text"
                    >空闲 (0/{{ getCellStatusInfo(timeSlot, res.id).max }})</span
                  >
                </template>
                <template v-else>
                  <div class="order-info">
                    <div class="capacity-text">
                      {{ getCellStatusInfo(timeSlot, res.id).text }} ({{
                        getCellStatusInfo(timeSlot, res.id).count
                      }}/{{ getCellStatusInfo(timeSlot, res.id).max }})
                    </div>

                    <!-- 简略展示最近的一个订单信息 -->
                    <div class="user-name" style="margin-top: 4px; font-size: 12px; opacity: 0.9">
                      {{ getCellStatusInfo(timeSlot, res.id).orders[0]?.name }}
                      <span v-if="getCellStatusInfo(timeSlot, res.id).count > 1"
                        >等{{ getCellStatusInfo(timeSlot, res.id).count }}人</span
                      >
                    </div>
                  </div>
                </template>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 预约流水列表 -->
    <div class="list-container" v-if="currentView === 'list'">
      <table class="list-table">
        <thead>
          <tr>
            <th>预订日期</th>
            <th>时间段</th>
            <th>资源/场地</th>
            <th>客户姓名</th>
            <th>联系电话</th>
            <th>订单来源</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in orderList" :key="order.key">
            <td>{{ order.date }}</td>
            <td>{{ order.timeSlot }}</td>
            <td>{{ order.resource }}</td>
            <td>{{ order.name }}</td>
            <td>{{ order.phone }}</td>
            <td>
              <span class="tag" :class="order.type">{{
                order.type === 'sku_order' ? '商品购买' : '独立预约'
              }}</span>
            </td>
            <td>
              <span class="status-tag" :class="order.status">
                {{
                  order.status === 'confirmed'
                    ? '已预订待核销'
                    : order.status === 'completed'
                      ? '已核销'
                      : '待审核'
                }}
              </span>
            </td>
            <td>
              <a class="action-link" @click="handleListAction(order)">查看详情</a>
            </td>
          </tr>
          <tr v-if="orderList.length === 0">
            <td colspan="8" class="empty-text">暂无预约数据</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 右侧详情抽屉 -->
    <div class="drawer-overlay" v-if="isDrawerVisible" @click="closeDrawer"></div>
    <div class="detail-drawer" :class="{ 'is-open': isDrawerVisible }">
      <div class="drawer-header">
        <h3>该时段预约列表</h3>
        <button class="close-btn" @click="closeDrawer">✕</button>
      </div>

      <template v-if="selectedCell">
        <!-- 汇总信息 -->
        <div
          style="
            padding: 16px 24px;
            background: #f9f9f9;
            border-bottom: 1px solid #eee;
            position: relative;
          "
        >
          <div
            style="
              font-size: 15px;
              font-weight: bold;
              color: #333;
              margin-bottom: 4px;
              padding-right: 80px;
            "
          >
            {{ selectedCell.date }} {{ selectedCell.timeSlot }}
          </div>
          <div style="font-size: 13px; color: #666">资源：{{ selectedCell.resource }}</div>
          <div style="font-size: 13px; color: #1677ff; margin-top: 8px">
            当前已约 {{ selectedCell.orders?.length || 1 }} 人 (容量:
            {{ getCapacity(selectedCell.timeSlot, selectedCell.resourceId) }})
          </div>

          <button
            v-if="
              (selectedCell.orders?.length || 1) <
              getCapacity(selectedCell.timeSlot, selectedCell.resourceId)
            "
            class="btn btn-primary"
            style="
              position: absolute;
              right: 24px;
              top: 16px;
              height: 28px;
              padding: 0 12px;
              font-size: 12px;
              width: auto;
            "
            @click="handleQuickCreateFromDrawer"
          >
            + 新增预约
          </button>
        </div>

        <div class="drawer-body" style="padding: 16px">
          <template
            v-for="order in selectedCell.orders || [selectedCell]"
            :key="order?.id || Math.random()"
          >
            <div
              v-if="order"
              style="
                background: #fff;
                border: 1px solid #eee;
                border-radius: 8px;
                padding: 16px;
                margin-bottom: 16px;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
              "
            >
              <div
                style="
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  margin-bottom: 12px;
                "
              >
                <div style="font-weight: bold; font-size: 15px; color: #333">{{ order.name }}</div>
                <span class="status-tag" :class="order.status">
                  {{
                    order.status === 'confirmed'
                      ? '已预订待核销'
                      : order.status === 'completed'
                        ? '已核销完成'
                        : '待审核'
                  }}
                </span>
              </div>

              <div class="info-group" style="margin-bottom: 8px">
                <div class="info-label">联系电话</div>
                <div class="info-value">{{ order.phone }}</div>
              </div>
              <div class="info-group" style="margin-bottom: 12px">
                <div class="info-label">订单来源</div>
                <div class="info-value">
                  <span class="tag" :class="order.type">{{
                    order.type === 'sku_order' ? '商品购买 (SKU关联)' : '独立预约登记'
                  }}</span>
                </div>
              </div>

              <!-- 操作按钮区域 -->
              <div
                style="
                  display: flex;
                  gap: 8px;
                  margin-top: 16px;
                  border-top: 1px dashed #eee;
                  padding-top: 12px;
                "
              >
                <button
                  class="btn btn-primary"
                  style="flex: 1; height: 28px; font-size: 13px; padding: 0"
                  v-if="order.status === 'confirmed'"
                  @click="handleWriteOff(order.id)"
                >
                  核销入场
                </button>

                <template v-if="order.status === 'pending'">
                  <button
                    class="btn btn-primary"
                    style="flex: 1; height: 28px; font-size: 13px; padding: 0"
                    @click="handleApprove(order.id)"
                  >
                    通过
                  </button>
                  <button
                    class="btn btn-danger-outline"
                    style="flex: 1; height: 28px; font-size: 13px; padding: 0"
                    @click="handleReject(order.id)"
                  >
                    拒绝
                  </button>
                </template>

                <button
                  class="btn btn-default"
                  style="flex: 1; height: 28px; font-size: 13px; padding: 0"
                  v-if="['pending', 'confirmed'].includes(order.status)"
                  @click="handleCancel(order.id)"
                >
                  取消订单
                </button>
              </div>
            </div>
          </template>
        </div>
      </template>
    </div>

    <!-- 后台新增预约弹窗 -->
    <div class="modal-overlay" v-if="isCreateModalVisible" @click="closeCreateModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>后台代客预约</h3>
          <button class="close-btn" @click="closeCreateModal">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-item">
            <label class="form-label required">预约日期</label>
            <select class="form-select" v-model="createForm.date" style="width: 100%">
              <template v-for="tab in dateTabs" :key="tab.date">
                <option v-if="tab.isBusinessDay" :value="tab.date">
                  {{ tab.date }} ({{ tab.dayName }})
                </option>
              </template>
            </select>
          </div>
          <div class="form-item">
            <label class="form-label required">预约时段</label>
            <select class="form-select" v-model="createForm.timeSlot" style="width: 100%">
              <option v-for="slot in projectConfig.timeSlots" :key="slot" :value="slot">
                {{ slot }}
              </option>
            </select>
          </div>
          <div class="form-item">
            <label class="form-label required">占用资源</label>
            <select class="form-select" v-model="createForm.resourceId" style="width: 100%">
              <option
                v-for="res in projectConfig.subResources"
                :key="res.id"
                :value="String(res.id)"
              >
                {{ res.name }}
              </option>
            </select>
          </div>
          <div class="form-item">
            <label class="form-label required">客户姓名</label>
            <input
              type="text"
              class="form-input"
              v-model="createForm.name"
              placeholder="请输入客户姓名"
              style="width: 100%"
            />
          </div>
          <div class="form-item">
            <label class="form-label required">联系电话</label>
            <input
              type="tel"
              class="form-input"
              v-model="createForm.phone"
              placeholder="请输入客户手机号"
              style="width: 100%"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-default" @click="closeCreateModal">取消</button>
          <button class="btn btn-primary" @click="submitCreateReservation">确认预约</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.reservation-board {
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-left h2 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.form-select {
  height: 32px;
  padding: 0 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  outline: none;
  font-size: 14px;
  min-width: 200px;
}

.view-toggle {
  display: flex;
  background: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  overflow: hidden;
}

.toggle-btn {
  padding: 6px 16px;
  background: transparent;
  border: none;
  font-size: 14px;
  cursor: pointer;
  color: #666;
  outline: none;
  transition: all 0.2s;
}

.toggle-btn:hover {
  color: #1677ff;
}

.toggle-btn.active {
  background: #e6f4ff;
  color: #1677ff;
  font-weight: 500;
}

.toggle-btn + .toggle-btn {
  border-left: 1px solid #d9d9d9;
}

.status-legend {
  display: flex;
  gap: 16px;
  background: #fff;
  padding: 8px 16px;
  border-radius: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #666;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
.dot.free {
  background-color: #f0f0f0;
  border: 1px solid #ddd;
}
.dot.pending {
  background-color: #faad14;
}
.dot.confirmed {
  background-color: #1677ff;
}
.dot.completed {
  background-color: #52c41a;
}
.dot.full {
  background-color: #ff4d4f;
}

/* 日期切换 */
.date-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  overflow-x: auto;
  padding-bottom: 5px;
}

.date-tab {
  background: #fff;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  text-align: center;
  min-width: 100px;
  border: 1px solid transparent;
  transition: all 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  position: relative;
}

.date-tab:hover:not(.non-business) {
  border-color: #1677ff;
}

.date-tab.active {
  background: #1677ff;
  color: #fff;
  border-color: #1677ff;
}

.date-tab.non-business {
  background: #f5f5f5;
  color: #999;
  cursor: not-allowed;
  border: 1px dashed #ddd;
}

.closed-tag {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ff4d4f;
  color: #fff;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(255, 77, 79, 0.3);
}

.date-label {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
}

.date-value {
  font-size: 12px;
  opacity: 0.8;
}

/* 矩阵表格 */
.matrix-container {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow-x: auto;
}

.matrix-table {
  width: 100%;
  border-collapse: collapse;
}

.matrix-table th {
  background: #fafafa;
  padding: 16px;
  text-align: center;
  font-weight: 500;
  color: #333;
  border-bottom: 1px solid #eee;
  border-right: 1px solid #eee;
}

.matrix-table td {
  border-bottom: 1px solid #eee;
  border-right: 1px solid #eee;
}

.time-col {
  width: 120px;
  text-align: center;
  font-weight: 500;
  color: #666;
  background: #fafafa;
}

.cell-wrapper {
  padding: 8px;
  height: 80px;
}

.matrix-cell {
  width: 100%;
  height: 100%;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s;
  padding: 8px;
}

.matrix-cell:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.matrix-cell.free {
  background-color: #f9f9f9;
  border: 1px dashed #ddd;
}
.matrix-cell.free:hover {
  border-color: #1677ff;
  background-color: #f0f5ff;
}
.matrix-cell.free .free-text {
  color: #ccc;
  font-size: 13px;
}

.matrix-cell.pending {
  background-color: #fffbe6;
  border: 1px solid #ffe58f;
}
.matrix-cell.confirmed {
  background-color: #e6f4ff;
  border: 1px solid #91caff;
}
.matrix-cell.completed {
  background-color: #f6ffed;
  border: 1px solid #b7eb8f;
  opacity: 0.7;
}
.matrix-cell.full {
  background-color: #fff2f0;
  border: 1px solid #ffccc7;
}
.matrix-cell.full .capacity-text,
.matrix-cell.full .user-name {
  color: #ff4d4f;
}

.order-info {
  text-align: center;
  width: 100%;
}
.capacity-text {
  font-size: 13px;
  font-weight: bold;
  color: #1677ff;
}
.matrix-cell.pending .capacity-text {
  color: #faad14;
}
.matrix-cell.completed .capacity-text {
  color: #52c41a;
}
.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}
.order-type {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  background: #1677ff;
  color: #fff;
}
.order-type.free {
  background: #faad14;
}

.closed-state-view {
  padding: 80px 20px;
  text-align: center;
  color: #999;
}

.empty-state-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.8;
}

.closed-state-view h3 {
  color: #666;
  margin-bottom: 8px;
}

/* 列表视图 */
.list-container {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.list-table {
  width: 100%;
  border-collapse: collapse;
}

.list-table th,
.list-table td {
  padding: 16px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

.list-table th {
  background: #fafafa;
  font-weight: 500;
  color: #333;
}

.list-table tr:hover {
  background: #fcfcfc;
}

.action-link {
  color: #1677ff;
  cursor: pointer;
}

.action-link:hover {
  color: #4096ff;
}

.empty-text {
  text-align: center;
  color: #999;
  padding: 40px !important;
}

/* 侧边栏抽屉 */
.drawer-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 900;
}

.detail-drawer {
  position: absolute;
  top: 0;
  right: -400px;
  width: 400px;
  height: 100%;
  background: #fff;
  z-index: 1000;
  box-shadow: -4px 0 16px rgba(0, 0, 0, 0.1);
  transition: right 0.3s cubic-bezier(0.23, 1, 0.32, 1);
  display: flex;
  flex-direction: column;
}

.detail-drawer.is-open {
  right: 0;
}

.drawer-header {
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.drawer-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 16px;
  color: #999;
  cursor: pointer;
}

.drawer-body {
  padding: 24px;
  flex: 1;
  overflow-y: auto;
}

.info-group {
  margin-bottom: 16px;
  display: flex;
}

.info-label {
  width: 80px;
  color: #999;
  font-size: 14px;
}

.info-value {
  flex: 1;
  color: #333;
  font-size: 14px;
}

.info-value.highlight {
  font-weight: 500;
  color: #1677ff;
  font-size: 16px;
}

.divider {
  height: 1px;
  background: #f0f0f0;
  margin: 20px 0;
}

.tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}
.tag.sku_order {
  background: #e6f4ff;
  color: #1677ff;
  border: 1px solid #91caff;
}
.tag.free_book {
  background: #fffbe6;
  color: #faad14;
  border: 1px solid #ffe58f;
}

.status-tag {
  font-weight: 500;
}
.status-tag.confirmed {
  color: #1677ff;
}
.status-tag.completed {
  color: #52c41a;
}
.status-tag.pending {
  color: #faad14;
}

.drawer-actions {
  margin-top: 40px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.btn {
  height: 36px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  border: 1px solid transparent;
  transition: all 0.2s;
  width: 100%;
}
.btn-primary {
  background-color: #1677ff;
  color: #fff;
}
.btn-primary:hover {
  background-color: #4096ff;
}
.btn-danger-outline {
  background-color: #fff;
  border-color: #ff4d4f;
  color: #ff4d4f;
}
.btn-danger-outline:hover {
  background-color: #fff2f0;
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
/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
}
.modal-content {
  background: #ffffff;
  border-radius: 8px;
  width: 480px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
.modal-header {
  padding: 16px 24px;
  border-bottom: 1px solid #eeeeee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.modal-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}
.modal-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #eeeeee;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
.form-item {
  display: flex;
  align-items: center;
  gap: 12px;
}
.form-label {
  width: 80px;
  font-size: 14px;
  color: #666;
  text-align: right;
}
.form-label.required::before {
  content: '*';
  color: #ff4d4f;
  margin-right: 4px;
}
.form-input {
  height: 32px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  padding: 0 12px;
  font-size: 14px;
  outline: none;
}
.form-input:focus {
  border-color: #1677ff;
}
</style>
