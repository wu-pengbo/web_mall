<script setup lang="ts">
import { ref, reactive } from 'vue'
import { mockMerchants } from '../../data/wallet'

// ==================== 钱包设置 ====================
interface ConfigSnapshot {
  name: string; enabled: boolean; withdrawEnabled: boolean
  withdrawNeedReview: boolean; withdrawMethod: string; feeType: string
  feeValue: number; minWithdraw: number; maxWithdraw: number
}
interface ConfigHistoryRecord {
  id: number; operator: string; operateTime: string; snapshot: ConfigSnapshot
}

interface WalletConfig {
  enabled: boolean; name: string; minRecharge: number; maxRecharge: number
  receiveMerchantId: string; receiveMerchantName: string
  withdrawEnabled: boolean; withdrawNeedReview: boolean; withdrawMethod: string
  feeType: 'fixed' | 'percent'; feeValue: number
  minWithdraw: number; maxWithdraw: number; dailyWithdrawLimit: number
  minBalanceAfterWithdraw: number
}

const walletConfig = reactive<WalletConfig>({
  enabled: false, name: '我的钱包', minRecharge: 1, maxRecharge: 50000,
  receiveMerchantId: '', receiveMerchantName: '',
  withdrawEnabled: true, withdrawNeedReview: true, withdrawMethod: 'refund_to_recharge',
  feeType: 'fixed', feeValue: 0,
  minWithdraw: 10, maxWithdraw: 50000, dailyWithdrawLimit: 100000, minBalanceAfterWithdraw: 0,
})

const configSaved = ref(true)
const editingConfig = ref(false)
type WalletConfigType = typeof walletConfig
const configBackup = ref<WalletConfigType | null>(null)

const startEditConfig = () => {
  configBackup.value = JSON.parse(JSON.stringify(walletConfig))
  editingConfig.value = true
}
const cancelEditConfig = () => {
  if (configBackup.value) Object.assign(walletConfig, configBackup.value)
  editingConfig.value = false
}
const saveConfig = () => {
  const merchant = mockMerchants.find(m => m.id === walletConfig.receiveMerchantId)
  walletConfig.receiveMerchantName = merchant ? merchant.name : ''
  configSaved.value = true
  editingConfig.value = false
  alert('钱包配置保存成功！')
}

const configHistoryList = ref<ConfigHistoryRecord[]>([
  { id: 1, operator: '张三', operateTime: '2026-06-10 14:30',
    snapshot: { name: '我的钱包', enabled: true, withdrawEnabled: true, withdrawNeedReview: true, withdrawMethod: 'refund_to_recharge', feeType: 'fixed', feeValue: 0, minWithdraw: 10, maxWithdraw: 50000 } },
  { id: 2, operator: '李四', operateTime: '2026-06-09 10:00',
    snapshot: { name: '零钱', enabled: false, withdrawEnabled: false, withdrawNeedReview: false, withdrawMethod: 'refund_to_recharge', feeType: 'percent', feeValue: 0.1, minWithdraw: 100, maxWithdraw: 10000 } },
])
const configHistoryExpandedId = ref<number | null>(null)
const configHistorySectionOpen = ref(false)
const toggleConfigHistory = (id: number) => {
  configHistoryExpandedId.value = configHistoryExpandedId.value === id ? null : id
}
</script>

<template>
  <div class="content-panel">
    <div class="panel-header">
      <h2>钱包设置</h2>
      <span class="panel-subtitle">全局钱包功能开关及业务规则配置</span>
      <button v-if="configSaved && !editingConfig" class="btn btn-primary btn-xs" @click="startEditConfig" style="margin-left: auto">编辑</button>
    </div>
    <div class="panel-body">
      <!-- ========== 编辑模式 ========== -->
      <template v-if="!configSaved || editingConfig">
        <div class="wcfg-card">
          <div class="wcfg-card-header">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4F6EF7" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="12" y2="17"/></svg>
            <span>基础设置</span>
          </div>
          <div class="wcfg-card-body">
            <div class="wcfg-row">
              <div class="wcfg-field">
                <label class="wcfg-label">钱包开关</label>
                <label class="toggle-switch">
                  <input type="checkbox" v-model="walletConfig.enabled" />
                  <span class="toggle-slider"></span>
                </label>
              </div>
              <div class="wcfg-field" v-if="walletConfig.enabled">
                <label class="wcfg-label required">钱包名称</label>
                <input type="text" class="form-input" v-model="walletConfig.name" placeholder="如：零钱、余额" />
              </div>
            </div>
          </div>
        </div>
        <template v-if="walletConfig.enabled">
          <div class="wcfg-card">
            <div class="wcfg-card-header">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4F6EF7" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              <span>充值设置</span>
            </div>
            <div class="wcfg-card-body">
              <div class="wcfg-row">
                <div class="wcfg-field">
                  <label class="wcfg-label required">最低充值金额</label>
                  <div class="wcfg-input-group">
                    <input type="number" class="form-input form-input-sm" v-model.number="walletConfig.minRecharge" min="0.01" step="0.01" />
                    <span class="wcfg-unit">元</span>
                  </div>
                </div>
                <div class="wcfg-field">
                  <label class="wcfg-label required">最高充值金额</label>
                  <div class="wcfg-input-group">
                    <input type="number" class="form-input form-input-sm" v-model.number="walletConfig.maxRecharge" min="1" step="0.01" />
                    <span class="wcfg-unit">元</span>
                  </div>
                </div>
              </div>
              <div class="wcfg-field" style="margin-bottom: 0">
                <label class="wcfg-label required">收款商户</label>
                <select class="form-select" v-model="walletConfig.receiveMerchantId" style="width: 240px">
                  <option value="">请选择商户</option>
                  <option v-for="m in mockMerchants" :key="m.id" :value="m.id">{{ m.name }}</option>
                </select>
                <span class="wcfg-hint">用户充值时资金打入该商户账户</span>
              </div>
            </div>
          </div>
          <div class="wcfg-card">
            <div class="wcfg-card-header">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4F6EF7" stroke-width="2" stroke-linecap="round"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              <span>提现设置</span>
            </div>
            <div class="wcfg-card-body">
              <div class="wcfg-row">
                <div class="wcfg-field">
                  <label class="wcfg-label">是否支持提现</label>
                  <label class="toggle-switch">
                    <input type="checkbox" v-model="walletConfig.withdrawEnabled" />
                    <span class="toggle-slider"></span>
                  </label>
                </div>
                <div class="wcfg-field" v-if="walletConfig.withdrawEnabled">
                  <label class="wcfg-label">提现审核</label>
                  <label class="toggle-switch">
                    <input type="checkbox" v-model="walletConfig.withdrawNeedReview" />
                    <span class="toggle-slider"></span>
                  </label>
                  <span class="wcfg-hint">{{ walletConfig.withdrawNeedReview ? '开启（人工审批）' : '关闭（自动放行）' }}</span>
                </div>
              </div>
              <template v-if="walletConfig.withdrawEnabled">
                <div class="wcfg-divider"></div>
                <div class="wcfg-row">
                  <div class="wcfg-field">
                    <label class="wcfg-label">手续费</label>
                    <div class="wcfg-input-group">
                      <select class="form-select form-input-sm" v-model="walletConfig.feeType" style="width: 100px">
                        <option value="fixed">固定</option>
                        <option value="percent">比例</option>
                      </select>
                      <input type="number" class="form-input form-input-sm" v-model.number="walletConfig.feeValue" min="0" step="0.01" style="width: 80px" />
                      <span class="wcfg-unit">{{ walletConfig.feeType === "fixed" ? "元/笔" : "%" }}</span>
                    </div>
                  </div>
                </div>
                <div class="wcfg-row">
                  <div class="wcfg-field">
                    <label class="wcfg-label">提现方式</label>
                    <div class="wcfg-input-group">
                      <select class="form-select form-input-md">
                        <option value="refund_to_recharge" selected>原充值订单退款</option>
                        <option value="merchant_sub_account" disabled>主商户账户分账</option>
                      </select>
                      <span class="wcfg-hint" style="color:#faad14;font-size:12px">暂不可选，仅原充值订单退款可选</span>
                    </div>
                  </div>
                </div>
                <div class="wcfg-divider"></div>
                <div class="wcfg-row">
                  <div class="wcfg-field">
                    <label class="wcfg-label required">最低提现金额</label>
                    <div class="wcfg-input-group">
                      <input type="number" class="form-input form-input-sm" v-model.number="walletConfig.minWithdraw" min="0.01" step="0.01" />
                      <span class="wcfg-unit">元</span>
                    </div>
                  </div>
                  <div class="wcfg-field">
                    <label class="wcfg-label required">最高提现金额</label>
                    <div class="wcfg-input-group">
                      <input type="number" class="form-input form-input-sm" v-model.number="walletConfig.maxWithdraw" min="1" step="0.01" />
                      <span class="wcfg-unit">元</span>
                    </div>
                  </div>
                </div>
                <div class="wcfg-row">
                  <div class="wcfg-field">
                    <label class="wcfg-label">日提现限额</label>
                    <div class="wcfg-input-group">
                      <input type="number" class="form-input form-input-sm" v-model.number="walletConfig.dailyWithdrawLimit" min="1" step="0.01" />
                      <span class="wcfg-unit">元</span>
                    </div>
                  </div>
                  <div class="wcfg-field">
                    <label class="wcfg-label">提现后余额下限</label>
                    <div class="wcfg-input-group">
                      <input type="number" class="form-input form-input-sm" v-model.number="walletConfig.minBalanceAfterWithdraw" min="0" step="0.01" />
                      <span class="wcfg-unit">元（0=不限制）</span>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </template>
        <div style="display: flex; gap: 12px; margin-top: 24px">
          <button class="btn btn-primary" @click="saveConfig" :disabled="!walletConfig.receiveMerchantId">保存配置</button>
          <button class="btn btn-default" @click="cancelEditConfig">取消</button>
        </div>
      </template>

      <!-- ========== 查看模式 ========== -->
      <template v-else>
        <div class="wcfg-view-grid">
          <div class="wcfg-view-card">
            <div class="wcfg-view-card-header">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4F6EF7" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="12" y2="17"/></svg>
              <span>基础设置</span>
            </div>
            <div class="wcfg-view-card-body">
              <div class="wcfg-view-field">
                <span class="wcfg-view-label">钱包开关</span>
                <span class="wcfg-view-value"><span class="wcfg-status-badge" :class="walletConfig.enabled ? 'on' : 'off'">{{ walletConfig.enabled ? '已开启' : '已关闭' }}</span></span>
              </div>
              <div class="wcfg-view-field">
                <span class="wcfg-view-label">钱包名称</span>
                <span class="wcfg-view-value">{{ walletConfig.name || '-' }}</span>
              </div>
            </div>
          </div>
          <template v-if="walletConfig.enabled">
            <div class="wcfg-view-card">
              <div class="wcfg-view-card-header">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4F6EF7" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                <span>充值设置</span>
              </div>
              <div class="wcfg-view-card-body">
                <div class="wcfg-view-field">
                  <span class="wcfg-view-label">最低充值金额</span>
                  <span class="wcfg-view-value price-text">¥{{ walletConfig.minRecharge.toFixed(2) }}</span>
                </div>
                <div class="wcfg-view-field">
                  <span class="wcfg-view-label">最高充值金额</span>
                  <span class="wcfg-view-value price-text">¥{{ walletConfig.maxRecharge.toFixed(2) }}</span>
                </div>
                <div class="wcfg-view-field">
                  <span class="wcfg-view-label">收款商户</span>
                  <span class="wcfg-view-value">{{ walletConfig.receiveMerchantName || '-' }}</span>
                </div>
              </div>
            </div>
            <div class="wcfg-view-card">
              <div class="wcfg-view-card-header">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4F6EF7" stroke-width="2" stroke-linecap="round"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                <span>提现设置</span>
              </div>
              <div class="wcfg-view-card-body">
                <div class="wcfg-view-field">
                  <span class="wcfg-view-label">提现开关</span>
                  <span class="wcfg-view-value"><span class="wcfg-status-badge" :class="walletConfig.withdrawEnabled ? 'on' : 'off'">{{ walletConfig.withdrawEnabled ? '已开启' : '已关闭' }}</span></span>
                </div>
                <template v-if="walletConfig.withdrawEnabled">
                  <div class="wcfg-view-field">
                    <span class="wcfg-view-label">提现审核</span>
                    <span class="wcfg-view-value"><span class="wcfg-status-badge" :class="walletConfig.withdrawNeedReview ? 'on' : 'off'">{{ walletConfig.withdrawNeedReview ? '开启' : '关闭' }}</span></span>
                  </div>
                  <div class="wcfg-view-field">
                    <span class="wcfg-view-label">手续费</span>
                    <span class="wcfg-view-value">{{ walletConfig.feeType === 'fixed' ? walletConfig.feeValue + ' 元/笔' : walletConfig.feeValue + ' %' }}</span>
                  </div>
                  <div class="wcfg-view-field">
                    <span class="wcfg-view-label">提现方式</span>
                    <span class="wcfg-view-value">原充值订单退款</span>
                  </div>
                  <div class="wcfg-view-field">
                    <span class="wcfg-view-label">最低提现金额</span>
                    <span class="wcfg-view-value price-text">¥{{ walletConfig.minWithdraw.toFixed(2) }}</span>
                  </div>
                  <div class="wcfg-view-field">
                    <span class="wcfg-view-label">最高提现金额</span>
                    <span class="wcfg-view-value price-text">¥{{ walletConfig.maxWithdraw.toFixed(2) }}</span>
                  </div>
                  <div class="wcfg-view-field">
                    <span class="wcfg-view-label">日提现限额</span>
                    <span class="wcfg-view-value price-text">¥{{ walletConfig.dailyWithdrawLimit.toFixed(2) }}</span>
                  </div>
                  <div class="wcfg-view-field">
                    <span class="wcfg-view-label">提现后余额下限</span>
                    <span class="wcfg-view-value price-text">¥{{ walletConfig.minBalanceAfterWithdraw.toFixed(2) }}</span>
                  </div>
                </template>
              </div>
            </div>
          </template>
        </div>
        <!-- 修改记录 -->
        <div class="history-section" style="margin-top: 32px">
          <div class="history-header" @click="configHistorySectionOpen = !configHistorySectionOpen">
            <span class="history-toggle">{{ configHistorySectionOpen ? '▼' : '▶' }}</span>
            <span class="history-title">修改记录</span>
            <span class="history-count">共 {{ configHistoryList.length }} 条</span>
          </div>
          <div v-show="configHistorySectionOpen" class="history-body">
            <table class="data-table">
              <thead>
                <tr>
                  <th style="width: 60px">序号</th>
                  <th style="width: 100px">修改人</th>
                  <th style="width: 160px">修改时间</th>
                  <th style="width: 80px">操作</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="(record, index) in configHistoryList" :key="record.id">
                  <tr>
                    <td>{{ index + 1 }}</td>
                    <td>{{ record.operator }}</td>
                    <td>{{ record.operateTime }}</td>
                    <td>
                      <span class="action-link primary" @click="toggleConfigHistory(record.id)">{{ configHistoryExpandedId === record.id ? '收起' : '展开' }}</span>
                    </td>
                  </tr>
                  <tr v-show="configHistoryExpandedId === record.id" class="snapshot-row">
                    <td colspan="4" style="padding: 0">
                      <div class="snapshot-detail">
                        <div class="snapshot-header">完整配置快照（只读）</div>
                        <div class="snapshot-grid">
                          <div class="snapshot-field"><span class="snapshot-label">钱包名称</span><span class="snapshot-value">{{ record.snapshot.name }}</span></div>
                          <div class="snapshot-field"><span class="snapshot-label">钱包开关</span><span class="snapshot-value">{{ record.snapshot.enabled ? '开启' : '关闭' }}</span></div>
                          <div class="snapshot-field"><span class="snapshot-label">提现开关</span><span class="snapshot-value">{{ record.snapshot.withdrawEnabled ? '开启' : '关闭' }}</span></div>
                          <div class="snapshot-field"><span class="snapshot-label">手续费</span><span class="snapshot-value">{{ record.snapshot.feeType === 'fixed' ? record.snapshot.feeValue + '元/笔' : record.snapshot.feeValue + '%' }}</span></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
/* ==================== 钱包设置卡片（编辑模式） ==================== */
.wcfg-card { background: #F7F8FA; border: 1px solid #E5E6EB; border-radius: 8px; margin-bottom: 16px; overflow: hidden; }
.wcfg-card-header { display: flex; align-items: center; gap: 8px; padding: 12px 16px; font-size: 14px; font-weight: 600; color: #1D2129; background: #FFFFFF; border-bottom: 1px solid #E5E6EB; }
.wcfg-card-body { padding: 16px; }
.wcfg-row { display: flex; gap: 24px; margin-bottom: 16px; }
.wcfg-row:last-child { margin-bottom: 0; }
.wcfg-field { display: flex; flex-direction: column; gap: 6px; flex: 1; }
.wcfg-label { font-size: 13px; font-weight: 500; color: #4E5969; }
.wcfg-label.required::after { content: " *"; color: #CF1322; }
.wcfg-input-group { display: flex; align-items: center; gap: 6px; }
.wcfg-unit { font-size: 13px; color: #86909C; white-space: nowrap; }
.wcfg-hint { font-size: 12px; color: #86909C; margin-top: 4px; }
.wcfg-divider { height: 1px; background: #E5E6EB; margin: 12px 0; }

/* ==================== 钱包设置查看模式 ==================== */
.wcfg-view-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }
.wcfg-view-card { border: 1px solid #E5E6EB; border-radius: 8px; overflow: hidden; background: #FFFFFF; }
.wcfg-view-card-header { display: flex; align-items: center; gap: 8px; padding: 12px 16px; font-size: 14px; font-weight: 600; color: #1D2129; background: #FAFAFA; border-bottom: 1px solid #E5E6EB; }
.wcfg-view-card-body { padding: 12px 16px; }
.wcfg-view-field { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #F2F3F5; }
.wcfg-view-field:last-child { border-bottom: none; }
.wcfg-view-label { font-size: 13px; color: #86909C; }
.wcfg-view-value { font-size: 14px; color: #1D2129; font-weight: 500; }
.wcfg-status-badge { display: inline-block; padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: 500; }
.wcfg-status-badge.on { background: #E8FFE8; color: #00A854; }
.wcfg-status-badge.off { background: #FFF0F0; color: #CF1322; }

/* ==================== 修改记录 ==================== */
.history-section { margin-top: 36px; border-top: 1px solid #E5E6EB; padding-top: 20px; }
.history-header { display: flex; align-items: center; gap: 8px; padding: 8px 0; cursor: pointer; user-select: none; }
.history-toggle { font-size: 12px; color: #86909C; }
.history-title { font-size: 13px; font-weight: 700; color: #1D2129; letter-spacing: 0.02em; }
.history-count { font-size: 12px; color: #86909C; font-family: 'Geist Mono', 'SF Mono', 'Menlo', monospace; }
.history-body { margin-top: 8px; }
.snapshot-row td { background-color: #FAFAFA; }
.snapshot-detail { padding: 16px; }
.snapshot-header { font-size: 12px; font-weight: 600; color: #86909C; margin-bottom: 12px; letter-spacing: 0.03em; }
.snapshot-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.snapshot-field { display: flex; flex-direction: column; gap: 4px; }
.snapshot-label { font-size: 12px; color: #86909C; }
.snapshot-value { font-size: 14px; color: #4E5969; }
</style>
