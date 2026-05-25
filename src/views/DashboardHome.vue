<template>
  <div class="dashboard">
    <div class="header">
      <div class="bread-crumb">平台首页 / Dashboard</div>
    </div>
    
    <div class="container">
      <div class="welcome-box">
        <h2>👋 欢迎回来，超级管理员！</h2>
        <p>今天是 {{ new Date().toLocaleDateString() }}，祝您工作愉快。</p>
      </div>

      <div class="stat-cards">
        <div class="card bg-blue">
          <div class="card-icon">🛍️</div>
          <div class="card-info">
            <div class="title">在售商品数</div>
            <div class="value">1,208</div>
          </div>
        </div>
        <div class="card bg-green">
          <div class="card-icon">💰</div>
          <div class="card-info">
            <div class="title">今日销售额</div>
            <div class="value">￥45,290</div>
          </div>
        </div>
        <div class="card bg-orange">
          <div class="card-icon">📦</div>
          <div class="card-info">
            <div class="title">待发货订单</div>
            <div class="value">342</div>
          </div>
        </div>
        <div class="card bg-red">
          <div class="card-icon">⚠️</div>
          <div class="card-info">
            <div class="title">待处理退款</div>
            <div class="value">12</div>
          </div>
        </div>
      </div>

      <div class="charts-area">
        <div class="chart-box">
          <h3>销售趋势 (模拟)</h3>
          <div class="mock-chart">
            <div class="bar" style="height: 60%"><span>周一</span></div>
            <div class="bar" style="height: 80%"><span>周二</span></div>
            <div class="bar" style="height: 40%"><span>周三</span></div>
            <div class="bar" style="height: 90%"><span>周四</span></div>
            <div class="bar" style="height: 50%"><span>周五</span></div>
            <div class="bar" style="height: 100%"><span>周六</span></div>
            <div class="bar" style="height: 70%"><span>周日</span></div>
          </div>
        </div>
        <div class="chart-box">
          <h3>快捷操作</h3>
          <div class="quick-links">
            <button class="quick-btn" @click="$router.push('/publish')">+ 发布新商品</button>
            <button class="quick-btn" @click="$router.push('/product')">🔍 管理商品</button>
            <button class="quick-btn">📥 导出订单</button>
            <button class="quick-btn">⚙️ 店铺设置</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
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
.welcome-box {
  background: #fff;
  padding: 24px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  margin-bottom: 20px;
}
.welcome-box h2 {
  margin: 0 0 8px;
  font-size: 20px;
}
.welcome-box p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

/* 数据卡片 */
.stat-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}
.card {
  border-radius: 10px;
  padding: 20px;
  display: flex;
  align-items: center;
  color: #fff;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transition: transform 0.2s;
}
.card:hover {
  transform: translateY(-4px);
}
.card-icon {
  font-size: 36px;
  margin-right: 16px;
  background: rgba(255,255,255,0.2);
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.card-info .title {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 4px;
}
.card-info .value {
  font-size: 28px;
  font-weight: bold;
}
.bg-blue { background: linear-gradient(135deg, #1890ff, #36cfc9); }
.bg-green { background: linear-gradient(135deg, #52c41a, #a0d911); }
.bg-orange { background: linear-gradient(135deg, #fa8c16, #fadb14); }
.bg-red { background: linear-gradient(135deg, #f5222d, #ff4d4f); }

/* 图表区域 */
.charts-area {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
}
.chart-box {
  background: #fff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
.chart-box h3 {
  margin: 0 0 20px;
  font-size: 16px;
  border-left: 4px solid #1890ff;
  padding-left: 10px;
}

/* 模拟柱状图 */
.mock-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  height: 200px;
  padding-top: 20px;
  border-bottom: 1px solid #eee;
}
.bar {
  width: 40px;
  background-color: #1890ff;
  border-radius: 4px 4px 0 0;
  position: relative;
  transition: height 1s;
}
.bar span {
  position: absolute;
  bottom: -24px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  color: #666;
}

/* 快捷操作 */
.quick-links {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.quick-btn {
  padding: 16px;
  border: 1px dashed #ddd;
  background: #fafafa;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  color: #333;
}
.quick-btn:hover {
  border-color: #1890ff;
  color: #1890ff;
  background: #e6f7ff;
}
</style>