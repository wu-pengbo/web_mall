<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const menuList = [
  { key: 'overview', path: '/wallet/overview', label: '钱包概览' },
  { key: 'config', path: '/wallet/config', label: '钱包设置' },
  { key: 'merchant-sign', path: '/wallet/merchant-sign', label: '商户签约' },
  { key: 'recharge-plan', path: '/wallet/recharge-plan', label: '充值方案' },
  { key: 'user', path: '/wallet/user', label: '用户钱包' },
  { key: 'ledger', path: '/wallet/ledger', label: '交易流水' },
  { key: 'recharge', path: '/wallet/recharge', label: '充值管理' },
  { key: 'withdraw', path: '/wallet/withdraw', label: '提现管理' },
]
</script>

<template>
  <div class="wallet-management">
    <div class="sidebar">
      <div class="sidebar-title">钱包管理</div>
      <div class="menu-list">
        <div
          v-for="menu in menuList"
          :key="menu.key"
          class="menu-item"
          :class="{ active: route.path === menu.path }"
          @click="router.push(menu.path)"
        >
          {{ menu.label }}
        </div>
      </div>
    </div>
    <div class="main-content">
      <router-view />
    </div>
  </div>
</template>

<style scoped>
.wallet-management {
  display: flex;
  min-height: 100vh;
  background-color: #F0F2F5;
  color: #1D2129;
  font-family: 'SF Pro Display', 'Geist Sans', 'Helvetica Neue', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  line-height: 1.6;
}
.sidebar {
  width: 210px;
  background-color: #FFFFFF;
  border-right: 1px solid #E5E6EB;
  padding: 0;
  flex-shrink: 0;
}
.sidebar-title {
  height: 56px;
  line-height: 56px;
  padding: 0 20px;
  font-size: 15px;
  font-weight: 700;
  color: #1D2129;
  letter-spacing: -0.01em;
  border-bottom: 1px solid #E5E6EB;
}
.menu-list {
  padding: 8px 0;
}
.menu-item {
  padding: 0 20px 0 32px;
  height: 40px;
  line-height: 40px;
  font-size: 14px;
  color: #86909C;
  cursor: pointer;
  transition: all 0.15s ease;
}
.menu-item:hover {
  color: #1D2129;
  background-color: #FAFAFA;
}
.menu-item.active {
  color: #4F6EF7;
  background-color: #E8F3FF;
  font-weight: 600;
  position: relative;
}
.menu-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background-color: #4F6EF7;
  border-radius: 0 3px 3px 0;
}
.main-content {
  flex: 1;
  padding: 24px;
  min-width: 0;
}

</style>
<style>
@import '../assets/wallet-common.css';
</style>
