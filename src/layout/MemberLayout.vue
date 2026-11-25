<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { memberUi } from '@/stores/member-ui'

const route = useRoute()
const router = useRouter()
const menu = [
  { path: '/member/members', label: '会员管理' },
  { path: '/member/tags', label: '会员标签' },
  { path: '/member/levels', label: '会员等级' },
  { path: '/member/benefits', label: '会员权益' },
  { path: '/member/grants', label: '发放记录' },
]
</script>

<template>
  <div class="member-module">
    <aside class="member-module-nav">
      <div class="member-module-title">会员运营</div>
      <div class="member-nav-group">会员管理</div>
      <button
        v-for="item in menu"
        :key="item.path"
        class="member-nav-item"
        :class="{ active: route.path === item.path }"
        @click="router.push(item.path)"
      >
        {{ item.label }}
      </button>
      <div class="member-nav-bottom">
        <div class="member-nav-note">V1 会员体系</div>
        <p>注册即会员 · 普通会员为固定默认等级</p>
      </div>
    </aside>
    <main class="member-module-content"><router-view /></main>
    <Transition name="member-toast">
      <div v-if="memberUi.message" class="member-toast" :class="`tone-${memberUi.tone}`" role="status">
        <span class="toast-mark"></span>{{ memberUi.message }}
      </div>
    </Transition>
  </div>
</template>

<style>
@import '../assets/member-common.css';
</style>
