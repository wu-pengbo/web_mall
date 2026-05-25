<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 模拟从路由参数获取投票ID
const voteId = computed(() => route.params.id || '1')

// --- 模拟数据 ---
const voteData = ref({
  id: voteId.value,
  title: '2026年第一季度优秀员工评选',
  status: 'active',
  totalVotes: 128,
  participants: 128,
  options: [
    { id: 1, text: '技术部 - 张三', votes: 45, percentage: 35.1 },
    { id: 2, text: '市场部 - 李四', votes: 32, percentage: 25.0 },
    { id: 3, text: '产品部 - 王五', votes: 28, percentage: 21.9 },
    { id: 4, text: '设计部 - 赵六', votes: 23, percentage: 18.0 }
  ]
})

const goBack = () => {
  router.push('/vote')
}
</script>

<template>
  <div class="vote-result">
    <!-- 顶部固定导航 -->
    <div class="fixed-top-area">
      <div class="header">
        <div class="bread-crumb">
          <span style="cursor: pointer; color: #666;" @click="goBack">投票管理</span>
          <span style="margin: 0 8px;">→</span>
          <span>投票结果</span>
        </div>
        <div>
          <button class="btn btn-default" @click="goBack">返回列表</button>
          <button class="btn btn-primary" style="margin-left: 12px;">导出明细 (Excel)</button>
        </div>
      </div>
    </div>

    <div class="container">
      <!-- 概览看板 -->
      <div class="module summary-board">
        <div class="vote-title">{{ voteData.title }}</div>
        <div class="stat-cards">
          <div class="card">
            <div class="label">当前状态</div>
            <div class="value" style="color: #1677FF;">进行中</div>
          </div>
          <div class="card">
            <div class="label">参与总人数</div>
            <div class="value">{{ voteData.participants }}</div>
          </div>
          <div class="card">
            <div class="label">累计总票数</div>
            <div class="value">{{ voteData.totalVotes }}</div>
          </div>
        </div>
      </div>

      <!-- 结果明细 -->
      <div class="module">
        <div class="module-header">
          <div class="module-title"><i>📊</i>投票选项排行</div>
        </div>
        <div class="module-content">
          <div class="result-list">
            <div class="result-item" v-for="(opt, index) in voteData.options" :key="opt.id">
              <div class="rank" :class="'rank-' + (index + 1)">{{ index + 1 }}</div>
              <div class="info-area">
                <div class="opt-name">{{ opt.text }}</div>
                <div class="progress-bar-bg">
                  <div class="progress-bar-fill" :style="{ width: opt.percentage + '%' }"></div>
                </div>
              </div>
              <div class="data-area">
                <div class="votes"><strong>{{ opt.votes }}</strong> 票</div>
                <div class="percent">{{ opt.percentage }}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.vote-result {
  background-color: #F5F7FA;
  min-height: 100vh;
  color: #333333;
  font-family: "Microsoft YaHei", sans-serif;
}
.fixed-top-area {
  position: sticky;
  top: 0;
  z-index: 999;
  background-color: #f5f7fa;
}
.header {
  height: 60px;
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
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
.module-header {
  margin-bottom: 20px;
}
.module-title {
  font-size: 16px;
  font-weight: bold;
  display: flex;
  align-items: center;
}
.module-title i {
  margin-right: 8px;
  font-style: normal;
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
.btn-default {
  background-color: #EEEEEE;
  color: #333333;
}

/* 概览看板 */
.summary-board {
  text-align: center;
  padding: 30px 20px;
}
.vote-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 30px;
  color: #111;
}
.stat-cards {
  display: flex;
  justify-content: center;
  gap: 60px;
}
.card {
  text-align: center;
}
.card .label {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}
.card .value {
  font-size: 32px;
  font-weight: bold;
  color: #333;
}

/* 结果列表 */
.result-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.result-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 8px;
}
.rank {
  width: 36px;
  height: 36px;
  background: #eee;
  color: #666;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  margin-right: 20px;
  flex-shrink: 0;
}
.rank-1 { background: #ffe58f; color: #fa8c16; }
.rank-2 { background: #e6f7ff; color: #1890ff; }
.rank-3 { background: #f6ffed; color: #52c41a; }

.info-area {
  flex: 1;
  margin-right: 30px;
}
.opt-name {
  font-size: 15px;
  font-weight: 500;
  margin-bottom: 8px;
}
.progress-bar-bg {
  height: 12px;
  background: #e5e5e5;
  border-radius: 6px;
  overflow: hidden;
}
.progress-bar-fill {
  height: 100%;
  background: #1677FF;
  border-radius: 6px;
  transition: width 0.5s ease-out;
}
.data-area {
  text-align: right;
  min-width: 100px;
}
.votes {
  font-size: 16px;
  color: #333;
  margin-bottom: 4px;
}
.percent {
  font-size: 14px;
  color: #999;
}
</style>