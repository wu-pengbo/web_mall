<script setup lang="ts">
// ==================== 钱包概览 - 统计卡片 ====================
const mockOverviewStats = [
  { label: '平台总余额', value: '¥1,286,532.80', change: '+5.2%', up: true },
  { label: '总充值金额', value: '¥3,580,000.00', change: '+12.3%', up: true },
  { label: '总消费金额', value: '¥2,150,000.00', change: '+8.7%', up: true },
  { label: '总退款金额', value: '¥143,467.20', change: '-2.1%', up: false },
  { label: '待审核提现', value: '3 笔', change: '', up: true },
  { label: '钱包用户数', value: '8,356 人', change: '+3.8%', up: true },
  { label: '冻结账户数', value: '23 个', change: '-1', up: false },
  { label: '今日充值', value: '¥45,230.00', change: '+15.6%', up: true },
]

// ==================== 趋势数据 ====================
const trendData = [
  { month: '1月', recharge: 320000, consume: 280000, refund: 18000 },
  { month: '2月', recharge: 380000, consume: 310000, refund: 22000 },
  { month: '3月', recharge: 350000, consume: 290000, refund: 20000 },
  { month: '4月', recharge: 420000, consume: 350000, refund: 25000 },
  { month: '5月', recharge: 480000, consume: 410000, refund: 28000 },
  { month: '6月', recharge: 450000, consume: 380000, refund: 23000 },
]

import { computed } from 'vue'

const maxTrend = computed(() => {
  let max = 0
  trendData.forEach(d => {
    ;['recharge', 'consume', 'refund'].forEach(k => {
      if ((d as any)[k] > max) max = (d as any)[k]
    })
  })
  return max
})

// ==================== 最近交易 ====================
const txTypeLabel: Record<string, string> = {
  recharge: '充值', refund: '退款', consume: '消费', withdraw: '提现', freeze: '冻结',
}

interface WalletTransaction {
  id: string; transactionNo: string; uid: string; phone: string
  type: string; amount: number; balance: number; relatedNo: string
  merchant: string; operator: string; time: string; remark: string
}

const mockTransactions: WalletTransaction[] = [
  { id: '1', transactionNo: 'TXN-20260611-001', uid: 'u10001', phone: '138****1234', type: 'recharge', amount: 1000, balance: 2280.50, relatedNo: 'RCH-20260611-001', merchant: '平台自营商户', operator: '系统', time: '2026-06-11 10:30:18', remark: '线上充值' },
  { id: '2', transactionNo: 'TXN-20260611-002', uid: 'u10001', phone: '138****1234', type: 'consume', amount: -188, balance: 2092.50, relatedNo: 'ORD-20260611-001', merchant: 'XX服饰专营店', operator: '系统', time: '2026-06-11 14:20:00', remark: '订单消费' },
  { id: '3', transactionNo: 'TXN-20260610-001', uid: 'u10002', phone: '139****5678', type: 'recharge', amount: 500, balance: 4060, relatedNo: 'RCH-20260610-003', merchant: '平台自营商户', operator: '系统', time: '2026-06-10 16:00:00', remark: '线上充值' },
  { id: '4', transactionNo: 'TXN-20260610-002', uid: 'u10005', phone: '135****7890', type: 'refund', amount: 200, balance: 1000, relatedNo: 'ORD-20260609-005', merchant: 'XX服饰专营店', operator: '系统', time: '2026-06-10 14:30:00', remark: '订单退款' },
  { id: '5', transactionNo: 'TXN-20260609-001', uid: 'u10004', phone: '136****3456', type: 'withdraw', amount: -800, balance: 4400, relatedNo: 'WDR-20260609-001', merchant: '系统', operator: '张三', time: '2026-06-09 10:00:00', remark: '用户提现' },
  { id: '6', transactionNo: 'TXN-20260609-002', uid: 'u10008', phone: '132****0123', type: 'recharge', amount: 1500, balance: 8300, relatedNo: 'RCH-20260609-002', merchant: '平台自营商户', operator: '系统', time: '2026-06-09 16:45:03', remark: '线上充值' },
  { id: '7', transactionNo: 'TXN-20260608-001', uid: 'u10002', phone: '139****5678', type: 'consume', amount: -129, balance: 3560, relatedNo: 'ORD-20260608-002', merchant: 'XX数码旗舰店', operator: '系统', time: '2026-06-08 11:30:00', remark: '订单消费' },
  { id: '8', transactionNo: 'TXN-20260607-001', uid: 'u10003', phone: '137****9012', type: 'consume', amount: -59, balance: 148.50, relatedNo: 'ORD-20260607-001', merchant: 'XX食品店', operator: '系统', time: '2026-06-07 09:15:00', remark: '订单消费' },
]
</script>

<template>
  <div class="content-panel">
    <div class="panel-header">
      <h2>钱包概览</h2>
    </div>
    <div class="panel-body">
      <!-- 统计卡片 -->
      <div class="overview-cards">
        <div v-for="stat in mockOverviewStats" :key="stat.label" class="overview-card">
          <div class="stat-label">{{ stat.label }}</div>
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-change" :class="{ up: stat.up, down: !stat.up }" v-if="stat.change">
            {{ stat.change }}
          </div>
        </div>
      </div>

      <!-- 趋势图 -->
      <div class="trend-section">
        <h3>近6个月趋势</h3>
        <div class="trend-chart">
          <div class="trend-legend">
            <span class="legend-item"><i style="background: #4F6EF7"></i>充值</span>
            <span class="legend-item"><i style="background: #D46B08"></i>消费</span>
            <span class="legend-item"><i style="background: #0E7B3A"></i>退款</span>
          </div>
          <div class="trend-bars">
            <div v-for="d in trendData" :key="d.month" class="trend-group">
              <div class="bar-cluster">
                <div class="bar bar-recharge" :style="{ height: (d.recharge / maxTrend * 180) + 'px' }"></div>
                <div class="bar bar-consume" :style="{ height: (d.consume / maxTrend * 180) + 'px' }"></div>
                <div class="bar bar-refund" :style="{ height: (d.refund / maxTrend * 180) + 'px' }"></div>
              </div>
              <div class="trend-label">{{ d.month }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 最近交易 -->
      <div class="recent-section">
        <h3>最近交易</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>流水号</th>
              <th>用户</th>
              <th>类型</th>
              <th>金额</th>
              <th>时间</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="tx in mockTransactions.slice(0, 8)" :key="tx.id">
              <td>{{ tx.transactionNo }}</td>
              <td>{{ tx.phone }}</td>
              <td><span class="status-tag" :class="tx.type">{{ txTypeLabel[tx.type] }}</span></td>
              <td :class="{ 'amount-positive': tx.amount > 0, 'amount-negative': tx.amount < 0 }">{{ tx.amount > 0 ? '+' : '' }}¥{{ Math.abs(tx.amount).toFixed(2) }}</td>
              <td class="time-text">{{ tx.time }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ==================== 概览卡片 ==================== */
.overview-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 28px;
}
.overview-card {
  background-color: #FFFFFF;
  border-radius: 10px;
  padding: 24px;
  border: 1px solid #E5E6EB;
  transition: box-shadow 0.2s ease;
}
.overview-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
.stat-label {
  font-size: 12px;
  color: #86909C;
  margin-bottom: 10px;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}
.stat-value {
  font-size: 22px;
  font-weight: 700;
  color: #1D2129;
  margin-bottom: 4px;
  letter-spacing: -0.02em;
  font-family: 'Geist Mono', 'SF Mono', 'Menlo', monospace;
}
.stat-change {
  font-size: 12px;
  font-family: 'Geist Mono', 'SF Mono', 'Menlo', monospace;
}
.stat-change.up {
  color: #CF1322;
}
.stat-change.down {
  color: #0E7B3A;
}

/* ==================== 趋势图 ==================== */
.trend-section {
  margin-bottom: 28px;
}
.trend-section h3 {
  font-size: 13px;
  font-weight: 700;
  color: #1D2129;
  margin: 0 0 16px;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}
.trend-chart {
  background-color: #FFFFFF;
  border-radius: 10px;
  padding: 24px;
  border: 1px solid #E5E6EB;
}
.trend-legend {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
  font-size: 13px;
  color: #86909C;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}
.legend-item i {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 2px;
}
.trend-bars {
  display: flex;
  align-items: flex-end;
  gap: 20px;
  height: 200px;
  padding: 0 10px;
}
.trend-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.bar-cluster {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  height: 180px;
}
.bar {
  width: 20px;
  border-radius: 3px 3px 0 0;
  transition: height 0.3s ease;
}
.bar-recharge {
  background-color: #4F6EF7;
}
.bar-consume {
  background-color: #D46B08;
}
.bar-refund {
  background-color: #0E7B3A;
}
.trend-label {
  margin-top: 8px;
  font-size: 12px;
  color: #86909C;
  font-family: 'Geist Mono', 'SF Mono', 'Menlo', monospace;
}

/* ==================== 最近交易 ==================== */
.recent-section h3 {
  font-size: 13px;
  font-weight: 700;
  color: #1D2129;
  margin: 0 0 16px;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}
.amount-positive {
  color: #CF1322;
}
.amount-negative {
  color: #0E7B3A;
}
.time-text {
  font-family: 'Geist Mono', 'SF Mono', 'Menlo', monospace;
  font-size: 12px;
  color: #86909C;
}
</style>
