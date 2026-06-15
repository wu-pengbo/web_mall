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
  { path: '/points', name: '积分管理', icon: '💰' },
  { path: '/wallet', name: '钱包管理', icon: '💳' },
  { path: '/user', name: '用户管理', icon: '👥' },
  { path: '/setting', name: '系统设置', icon: '⚙️' },
]

const goMenu = (path: string) => {
  if (
    path === '/' ||
    path === '/product' ||
    path === '/freight' ||
    path === '/reservation' ||
    path === '/reservation/board' ||
    path === '/vote' ||
    path === '/order' ||
    path === '/points' ||
    path === '/wallet'
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
              (menu.path === '/reservation' &&
                route.path.startsWith('/reservation') &&
                !route.path.startsWith('/reservation/board')) ||
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
  background-color: #F0F2F5;
  font-family: -apple-system, 'SF Pro Display', 'Helvetica Neue', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}
.sidebar {
  width: 200px;
  background-color: #001529;
  color: #FFFFFF;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 1000;
}
.logo {
  height: 80px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #002140;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.logo h2 {
  margin: 0;
  font-size: 18px;
  color: #FFFFFF;
  letter-spacing: -0.02em;
  font-weight: 700;
}
.logo p {
  margin: 4px 0 0;
  font-size: 11px;
  color: #8C939D;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
.menu-list {
  padding-top: 12px;
}
.menu-item {
  height: 44px;
  line-height: 44px;
  padding: 0 24px;
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  color: #8C939D;
  font-size: 14px;
}
.menu-icon {
  margin-right: 12px;
  font-size: 14px;
}
.menu-item:hover {
  color: #FFFFFF;
  background-color: rgba(255,255,255,0.06);
}
.menu-item.active {
  background-color: #4F6EF7;
  color: #FFFFFF;
  font-weight: 500;
}
.main-content {
  flex: 1;
  margin-left: 200px;
  min-height: 100vh;
  position: relative;
}
</style>
