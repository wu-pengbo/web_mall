<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const category = ref(route.query.category || 'normal')

// --- 表单数据 ---
const form = reactive({
  title: '',
  description: '',
  startTime: '',
  endTime: '',
  type: 'single', // single / multiple
  maxSelect: 2, // 多选时最多选几项
  anonymous: false, // 匿名投票
  participantLimit: 'all', // all / registered
  frequencyType: 'total', // total / daily / unlimited
  maxVotesPerUser: 1, // 每人最多可投次数
  resultVisibility: 'after', // after / public / admin
  // 活动评选专属规则
  activityRules: {
    limitType: 'both', // total / daily / both / unlimited
    dailyMaxVotes: null, // 每日最多投票数
    totalMaxVotes: null, // 活动期间最多投票数
    allowDuplicateVotes: false, // 是否允许给同一选项投多票
    maxVotesPerOptionDaily: null, // 每天给同一选项最多投票数
    maxVotesPerOptionTotal: null, // 活动期间给同一选项最多投票数
  },
})

const goBack = () => {
  router.push('/vote')
}

const saveVote = () => {
  if (!form.title) {
    alert('请填写投票名称！')
    return
  }

  alert('投票创建成功！请在列表中为其配置选项。')
  console.log('Vote Data:', { category: category.value, form })
  router.push('/vote')
}
</script>

<template>
  <div class="vote-publish">
    <!-- 顶部固定导航 -->
    <div class="fixed-top-area">
      <div class="header">
        <div class="bread-crumb">
          <span style="cursor: pointer; color: #666" @click="goBack">投票管理</span>
          <span style="margin: 0 8px">→</span>
          <span>{{ category === 'normal' ? '创建普通投票' : '创建活动评选' }}</span>
        </div>
        <div>
          <button class="btn btn-default" @click="goBack">取消</button>
          <button class="btn btn-primary" @click="saveVote">保存设置</button>
        </div>
      </div>
    </div>

    <!-- 主体容器 -->
    <div class="container">
      <!-- 基础信息 -->
      <div class="module">
        <div class="module-header">
          <div class="module-title"><i>📄</i>基础信息</div>
        </div>
        <div class="module-content">
          <div class="form-item">
            <label class="form-label required">投票名称</label>
            <input
              type="text"
              class="form-input"
              v-model="form.title"
              placeholder="请输入投票主题 (不超过50字)"
            />
          </div>
          <div class="form-item" style="align-items: flex-start">
            <label class="form-label">投票描述</label>
            <textarea
              class="form-textarea"
              v-model="form.description"
              placeholder="在此输入投票背景、规则说明等 (选填)"
            ></textarea>
          </div>
          <div class="form-item">
            <label class="form-label required">投票时间</label>
            <div style="display: flex; align-items: center; gap: 10px">
              <input
                type="datetime-local"
                class="form-input"
                style="width: 200px"
                v-model="form.startTime"
              />
              <span style="color: #999">至</span>
              <input
                type="datetime-local"
                class="form-input"
                style="width: 200px"
                v-model="form.endTime"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 规则设置 -->
      <div class="module">
        <div class="module-header">
          <div class="module-title"><i>⚙️</i>规则设置</div>
        </div>
        <div class="module-content">
          <!-- 普通投票独有规则 -->
          <template v-if="category === 'normal'">
            <div class="form-item">
              <label class="form-label required">投票类型</label>
              <div class="radio-group">
                <label class="radio-label"
                  ><input type="radio" v-model="form.type" value="single" /> 单选</label
                >
                <label class="radio-label"
                  ><input type="radio" v-model="form.type" value="multiple" /> 多选</label
                >
              </div>
            </div>
            <div class="form-item" v-if="form.type === 'multiple'">
              <label class="form-label required">最多可选项</label>
              <div style="display: flex; align-items: center; gap: 8px">
                最多可选
                <input
                  type="number"
                  class="form-input"
                  style="width: 80px"
                  v-model="form.maxSelect"
                />
                项
              </div>
            </div>

            <div class="form-item">
              <label class="form-label required">投票频次</label>
              <div
                class="radio-group"
                style="flex-direction: column; align-items: flex-start; gap: 12px"
              >
                <div style="display: flex; align-items: center; gap: 12px">
                  <label class="radio-label">
                    <input type="radio" v-model="form.frequencyType" value="total" />
                    限制总次数
                  </label>
                  <div
                    v-if="form.frequencyType === 'total'"
                    style="display: flex; align-items: center; gap: 8px"
                  >
                    活动期间每人最多可投
                    <input
                      type="number"
                      class="form-input"
                      style="width: 80px"
                      v-model="form.maxVotesPerUser"
                      min="1"
                    />
                    次
                  </div>
                </div>

                <div style="display: flex; align-items: center; gap: 12px">
                  <label class="radio-label">
                    <input type="radio" v-model="form.frequencyType" value="daily" />
                    按天限制次数
                  </label>
                  <div
                    v-if="form.frequencyType === 'daily'"
                    style="display: flex; align-items: center; gap: 8px"
                  >
                    每人每天最多可投
                    <input
                      type="number"
                      class="form-input"
                      style="width: 80px"
                      v-model="form.maxVotesPerUser"
                      min="1"
                    />
                    次
                  </div>
                </div>

                <label class="radio-label">
                  <input type="radio" v-model="form.frequencyType" value="unlimited" />
                  不限制 (可无限投)
                </label>
              </div>
            </div>
          </template>

          <!-- 活动评选独有规则 -->
          <template v-if="category === 'activity'">
            <div class="form-item" style="align-items: flex-start">
              <label class="form-label required">投票限制</label>
              <div style="display: flex; flex-direction: column; gap: 16px">
                <div class="radio-group">
                  <label class="radio-label"
                    ><input type="radio" v-model="form.activityRules.limitType" value="daily" />
                    仅按天限制</label
                  >
                  <label class="radio-label"
                    ><input type="radio" v-model="form.activityRules.limitType" value="total" />
                    仅按活动总期限制</label
                  >
                  <label class="radio-label"
                    ><input type="radio" v-model="form.activityRules.limitType" value="both" />
                    同时限制(每天及总计)</label
                  >
                  <label class="radio-label"
                    ><input type="radio" v-model="form.activityRules.limitType" value="unlimited" />
                    不限制</label
                  >
                </div>

                <!-- 每日限制配置区域 -->
                <div
                  v-if="['daily', 'both'].includes(form.activityRules.limitType)"
                  style="
                    background: #f9f9f9;
                    padding: 16px;
                    border-radius: 8px;
                    border: 1px solid #eeeeee;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                  "
                >
                  <div style="display: flex; align-items: center; gap: 8px">
                    <span style="font-weight: bold; width: 100px">每日总计：</span>
                    每人每天最多可投
                    <input
                      type="number"
                      class="form-input"
                      style="width: 80px"
                      v-model="form.activityRules.dailyMaxVotes"
                      placeholder="不限"
                      min="1"
                    />
                    票
                  </div>
                  <div style="display: flex; align-items: center; gap: 8px">
                    <span style="font-weight: bold; width: 100px">单项限制：</span>
                    <label class="radio-label" style="margin-right: 12px">
                      <input type="checkbox" v-model="form.activityRules.allowDuplicateVotes" />
                      允许投给同一选项
                    </label>
                    <template v-if="form.activityRules.allowDuplicateVotes">
                      每天最多投
                      <input
                        type="number"
                        class="form-input"
                        style="width: 80px; height: 28px"
                        v-model="form.activityRules.maxVotesPerOptionDaily"
                        placeholder="不限"
                        min="1"
                      />
                      票
                    </template>
                  </div>
                </div>

                <!-- 活动期间限制配置区域 -->
                <div
                  v-if="['total', 'both'].includes(form.activityRules.limitType)"
                  style="
                    background: #f9f9f9;
                    padding: 16px;
                    border-radius: 8px;
                    border: 1px solid #eeeeee;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                  "
                >
                  <div style="display: flex; align-items: center; gap: 8px">
                    <span style="font-weight: bold; width: 100px">活动总计：</span>
                    活动期间最多可投
                    <input
                      type="number"
                      class="form-input"
                      style="width: 80px"
                      v-model="form.activityRules.totalMaxVotes"
                      placeholder="不限"
                      min="1"
                    />
                    票
                  </div>
                  <div style="display: flex; align-items: center; gap: 8px">
                    <span style="font-weight: bold; width: 100px">单项限制：</span>
                    <label class="radio-label" style="margin-right: 12px">
                      <input type="checkbox" v-model="form.activityRules.allowDuplicateVotes" />
                      允许投给同一选项
                    </label>
                    <template v-if="form.activityRules.allowDuplicateVotes">
                      活动期间最多投
                      <input
                        type="number"
                        class="form-input"
                        style="width: 80px; height: 28px"
                        v-model="form.activityRules.maxVotesPerOptionTotal"
                        placeholder="不限"
                        min="1"
                      />
                      票
                    </template>
                  </div>
                </div>
              </div>
            </div>

            <div
              class="form-item"
              style="margin-top: 24px; border-top: 1px dashed #eee; padding-top: 24px"
            ></div>
          </template>

          <!-- 公共规则 -->
          <div class="form-item">
            <label class="form-label required">参与限制</label>
            <div class="radio-group">
              <label class="radio-label"
                ><input type="checkbox" v-model="form.anonymous" /> 允许匿名投票</label
              >
            </div>
          </div>

          <div class="form-item">
            <label class="form-label required">结果可见性</label>
            <div class="radio-group">
              <label class="radio-label"
                ><input type="radio" v-model="form.resultVisibility" value="after" />
                投票后可见</label
              >
              <label class="radio-label"
                ><input type="radio" v-model="form.resultVisibility" value="public" />
                所有人可见</label
              >
              <label class="radio-label"
                ><input type="radio" v-model="form.resultVisibility" value="admin" />
                仅管理员可见</label
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.vote-publish {
  background-color: #f5f7fa;
  min-height: 100vh;
  color: #333333;
  font-family: 'Microsoft YaHei', sans-serif;
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
  margin-bottom: 40px;
}
.module {
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  padding: 20px;
  margin-bottom: 16px;
}
.module-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.module-title {
  font-size: 16px;
  font-weight: bold;
  color: #333333;
  display: flex;
  align-items: center;
}
.module-title i {
  font-size: 18px;
  margin-right: 8px;
  font-style: normal;
}
.form-item {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}
.form-label {
  width: 120px;
  font-size: 14px;
  color: #333333;
  flex-shrink: 0;
}
.form-label.required::before {
  content: '*';
  color: #ff4d4f;
  margin-right: 4px;
}
.form-input {
  width: 400px;
  height: 32px;
  border: 1px solid #dddddd;
  border-radius: 8px;
  padding: 0 12px;
  font-size: 14px;
  outline: none;
}
.form-input:focus {
  border-color: #1677ff;
}
.form-textarea {
  width: 400px;
  height: 80px;
  border: 1px solid #dddddd;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 14px;
  outline: none;
  resize: none;
  font-family: inherit;
}
.form-textarea:focus {
  border-color: #1677ff;
}
.radio-group {
  display: flex;
  gap: 20px;
}
.radio-label {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  font-size: 14px;
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
  background-color: #1677ff;
  color: #ffffff;
}
.btn-primary:hover {
  box-shadow: 0 2px 8px rgba(22, 119, 255, 0.2);
}
.btn-default {
  background-color: #eeeeee;
  color: #333333;
}
.btn-default:hover {
  background-color: #e0e0e0;
}
.link-btn {
  background: none;
  border: none;
  color: #1677ff;
  cursor: pointer;
  font-size: 14px;
  padding: 0;
}
.link-btn.danger {
  color: #ff4d4f;
}
</style>
