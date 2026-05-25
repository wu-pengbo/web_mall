<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const menus = [
  { path: '/', name: '平台首页', icon: '🏠' },
  { path: '/product', name: '商品管理', icon: '🛍️' },
  { path: '/freight', name: '运费管理', icon: '🚚' },
  { path: '/reservation', name: '预约项目', icon: '📅' },
  { path: '/reservation/board', name: '工作台日历', icon: '📅' },
  { path: '/vote', name: '投票管理', icon: '📊' },
  { path: '/order', name: '订单管理', icon: '📋' },
  { path: '/user', name: '用户管理', icon: '👥' },
  { path: '/setting', name: '系统设置', icon: '⚙️' },
]

const goMenu = (path: string) => {
  // 只实现已有的页面跳转，未实现的给出提示
  if (
    path === '/' ||
    path === '/product' ||
    path === '/freight' ||
    path === '/reservation' ||
    path === '/reservation/board' ||
    path === '/vote' ||
    path === '/order'
  ) {
    router.push(path)
  } else {
    alert('该功能模块正在开发中...')
  }
}
</script>

<template>
  <div class="layout">
    <!-- 左侧导航边栏 -->
    <div class="sidebar">
      <div class="logo">
        <h2>Web Mall</h2>
        <p>商家管理后台</p>
      </div>
      <div class="menu-list">
        <div
          v-for="menu in menus"
          :key="menu.path"
          class="menu-item"
          :class="{
            active:
              route.path === menu.path ||
              (menu.path === '/product' && route.path.startsWith('/publish')) ||
              (menu.path === '/freight' && route.path.startsWith('/freight')) ||
              (menu.path === '/reservation' && route.path.startsWith('/reservation') && !route.path.startsWith('/reservation/board')) ||
              (menu.path === '/reservation/board' && route.path.startsWith('/reservation/board')) ||
              (menu.path === '/vote' && route.path.startsWith('/vote')) ||
              (menu.path === '/order' && route.path.startsWith('/order')),
          }"
          @click="goMenu(menu.path)"
        >
          <span class="menu-icon">{{ menu.icon }}</span>
          {{ menu.name }}
        </div>
      </div>
    </div>

    <!-- 右侧内容区域 -->
    <div class="main-content">
      <router-view />
    </div>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
  background-color: #f5f7fa;
}
.sidebar {
  width: 200px;
  background-color: #001529;
  color: #ffffff;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 1000;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
}
.logo {
  height: 80px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #002140;
  border-bottom: 1px solid #000c17;
}
.logo h2 {
  margin: 0;
  font-size: 20px;
  color: #fff;
}
.logo p {
  margin: 4px 0 0;
  font-size: 12px;
  color: #1890ff;
}
.menu-list {
  padding-top: 16px;
}
.menu-item {
  height: 48px;
  line-height: 48px;
  padding: 0 24px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  color: #a6adb4;
}
.menu-icon {
  margin-right: 12px;
  font-size: 16px;
}
.menu-item:hover {
  color: #fff;
}
.menu-item.active {
  background-color: #1677ff;
  color: #ffffff;
}
.main-content {
  flex: 1;
  margin-left: 200px; /* 避开固定侧边栏 */
  min-height: 100vh;
  position: relative;
}
</style>
