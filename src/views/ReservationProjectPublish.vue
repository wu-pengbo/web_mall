<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// --- 表单数据 ---
const form = reactive({
  name: '',
  coverImg: '',
  description: '',

  // 资源维度配置
  subResources: [
    { id: 1, name: '1号场' },
    { id: 2, name: '2号场' },
  ],

  // 排期规则
  scheduleType: 'time_slot', // time_slot: 按时段, date: 按天
  advanceHours: 24, // 需提前预约的小时数
  openDays: 14, // 开放未来多少天

  // 营业日与例外规则
  businessDays: ['1', '2', '3', '4', '5', '6', '0'], // 默认周一到周日全营业, 0代表周日
  exceptionDates: [] as { date: string; type: 'closed' | 'open'; reason: string }[],

  // 预约审核机制
  requireApproval: false, // 是否需要人工审核

  // C端可见性控制
  isVisible: true, // 控制用户端是否能看到该预约项目进行预约

  // 容量与时段 (按时段预约时使用)
  timeSlots: [
    {
      start: '14:00',
      end: '15:00',
      capacity: 1,
      resourceMap: { 1: true, 2: true } as Record<number, boolean>,
    },
    {
      start: '15:00',
      end: '16:00',
      capacity: 1,
      resourceMap: { 1: true, 2: true } as Record<number, boolean>,
    },
  ],

  // 容量 (按天预约时使用)
  dailyCapacity: 20,
})

const goBack = () => {
  router.push('/reservation')
}

const saveProject = () => {
  if (!form.name) {
    alert('请填写项目名称')
    return
  }
  alert('保存成功！')
  router.push('/reservation')
}

// 模拟图片上传
const coverImgInput = ref<HTMLInputElement | null>(null)
const triggerUpload = () => {
  coverImgInput.value?.click()
}
const handleUpload = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      form.coverImg = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

// 子资源操作
const addSubResource = () => {
  const nextId =
    form.subResources.length > 0 ? Math.max(...form.subResources.map((r) => r.id)) + 1 : 1
  form.subResources.push({ id: nextId, name: `新资源 ${nextId}` })
  // 默认给所有时段勾选该新资源
  form.timeSlots.forEach((slot) => {
    slot.resourceMap[nextId] = true
  })
}
const removeSubResource = (index: number) => {
  if (form.subResources.length <= 1) {
    alert('必须至少保留一个资源！')
    return
  }
  const resourceItem = form.subResources[index]
  if (!resourceItem) return
  const resourceId = resourceItem.id
  form.subResources.splice(index, 1)
  // 移除对应时段的映射
  form.timeSlots.forEach((slot) => {
    delete slot.resourceMap[resourceId]
  })
}

// 例外日期操作
const addExceptionDate = () => {
  form.exceptionDates.push({ date: '', type: 'closed', reason: '' })
}
const removeExceptionDate = (index: number) => {
  form.exceptionDates.splice(index, 1)
}

// 时段操作
const addTimeSlot = () => {
  const newResourceMap: Record<number, boolean> = {}
  form.subResources.forEach((r) => {
    newResourceMap[r.id] = true
  })

  let newStart = ''
  let newEnd = ''
  let newCapacity = 1

  // 智能推断下一个时段
  if (form.timeSlots.length > 0) {
    const lastSlot = form.timeSlots[form.timeSlots.length - 1]
    newCapacity = lastSlot.capacity // 继承容量

    if (lastSlot.start && lastSlot.end) {
      // 继承上一个的结束时间作为新的开始时间
      newStart = lastSlot.end

      // 计算上一个时段的持续时长（分钟）
      const [startHour, startMin] = lastSlot.start.split(':').map(Number)
      const [endHour, endMin] = lastSlot.end.split(':').map(Number)
      const durationMins = endHour * 60 + endMin - (startHour * 60 + startMin)

      // 如果计算出有效时长，则自动推断新的结束时间
      if (durationMins > 0) {
        const nextEndTotalMins = endHour * 60 + endMin + durationMins
        const nextEndHour = Math.floor(nextEndTotalMins / 60) % 24 // 处理跨天情况
        const nextEndMin = nextEndTotalMins % 60
        newEnd = `${String(nextEndHour).padStart(2, '0')}:${String(nextEndMin).padStart(2, '0')}`
      }
    }
  }

  form.timeSlots.push({
    start: newStart,
    end: newEnd,
    capacity: newCapacity,
    resourceMap: newResourceMap,
  })
}
const removeTimeSlot = (index: number) => {
  form.timeSlots.splice(index, 1)
}
</script>

<template>
  <div class="reservation-publish">
    <div class="page-header">
      <div class="header-left">
        <button class="back-btn" @click="goBack">❮ 返回</button>
        <h2>{{ form.name ? '编辑预约项目' : '新建预约项目' }}</h2>
      </div>
      <div class="header-right">
        <button class="btn btn-default" @click="goBack">取消</button>
        <button class="btn btn-primary" @click="saveProject">保存项目</button>
      </div>
    </div>

    <div class="form-container">
      <!-- 基础信息 -->
      <div class="module">
        <div class="module-header">
          <div class="module-title"><i>📝</i>基础信息</div>
        </div>
        <div class="module-content">
          <div class="form-item">
            <label class="form-label required">项目名称</label>
            <input
              type="text"
              class="form-input"
              style="width: 400px"
              v-model="form.name"
              placeholder="例如：奥体中心羽毛球馆、高级律师1v1咨询"
            />
          </div>
          <div class="form-item" style="align-items: flex-start">
            <label class="form-label required">封面图片</label>
            <div class="upload-area">
              <input
                type="file"
                ref="coverImgInput"
                style="display: none"
                accept="image/*"
                @change="handleUpload"
              />
              <div class="img-preview" v-if="form.coverImg" @click="triggerUpload">
                <img :src="form.coverImg" />
                <div class="img-mask">修改图片</div>
              </div>
              <div class="upload-btn" v-else @click="triggerUpload">
                <span style="font-size: 24px">+</span>
                <span>上传封面</span>
              </div>
              <div class="upload-tip">建议尺寸比例 16:9，大小不超过 2MB</div>
            </div>
          </div>
          <div class="form-item" style="align-items: flex-start">
            <label class="form-label">详细介绍</label>
            <textarea
              class="form-textarea"
              v-model="form.description"
              placeholder="请输入项目详细介绍、注意事项等"
            ></textarea>
          </div>
        </div>
      </div>

      <!-- 排期与容量引擎 -->
      <div class="module">
        <div class="module-header">
          <div class="module-title"><i>📅</i>排期与容量规则</div>
          <div style="font-size: 12px; color: #999; font-weight: normal; margin-left: 10px">
            此规则将作为底层引擎，供电商商品(SPU)挂载使用
          </div>
        </div>
        <div class="module-content">
          <div class="form-item">
            <label class="form-label required">排期模式</label>
            <div class="radio-group">
              <label class="radio-label">
                <input type="radio" v-model="form.scheduleType" value="time_slot" /> 按时段预约 (如:
                14:00-15:00)
              </label>
              <label class="radio-label">
                <input type="radio" v-model="form.scheduleType" value="date" /> 按天预约 (如:
                仅选日期)
              </label>
            </div>
          </div>

          <div class="form-item">
            <label class="form-label required">可预约范围</label>
            <div style="display: flex; align-items: center; gap: 15px">
              <div style="display: flex; align-items: center; gap: 8px">
                提前
                <input
                  type="number"
                  class="form-input"
                  style="width: 80px"
                  v-model="form.advanceHours"
                />
                小时可约
              </div>
              <div style="display: flex; align-items: center; gap: 8px">
                最多开放未来
                <input
                  type="number"
                  class="form-input"
                  style="width: 80px"
                  v-model="form.openDays"
                />
                天的排期
              </div>
            </div>
          </div>

          <div class="form-item">
            <label class="form-label">预约确认机制</label>
            <div class="radio-group">
              <label class="radio-label">
                <input type="radio" v-model="form.requireApproval" :value="false" /> 自动确认
                (用户提交后立即锁定资源)
              </label>
              <label class="radio-label">
                <input type="radio" v-model="form.requireApproval" :value="true" /> 人工审核
                (需商家同意后才算预约成功)
              </label>
            </div>
          </div>

          <div class="form-item">
            <label class="form-label">用户端展示</label>
            <div style="display: flex; align-items: center; gap: 12px">
              <label class="switch">
                <input type="checkbox" v-model="form.isVisible" />
                <span class="slider round"></span>
              </label>
              <span style="font-size: 14px; color: #333">{{
                form.isVisible
                  ? '允许用户在 C 端独立预约大厅看到该项目'
                  : '隐藏项目 (仅供商品 SKU 关联或后台代客预约)'
              }}</span>
            </div>
          </div>

          <div class="form-item" style="align-items: flex-start">
            <label class="form-label required">常规营业日</label>
            <div style="display: flex; flex-direction: column; gap: 8px; flex: 1">
              <div style="display: flex; flex-wrap: wrap; gap: 16px">
                <label class="radio-label"
                  ><input type="checkbox" v-model="form.businessDays" value="1" /> 周一</label
                >
                <label class="radio-label"
                  ><input type="checkbox" v-model="form.businessDays" value="2" /> 周二</label
                >
                <label class="radio-label"
                  ><input type="checkbox" v-model="form.businessDays" value="3" /> 周三</label
                >
                <label class="radio-label"
                  ><input type="checkbox" v-model="form.businessDays" value="4" /> 周四</label
                >
                <label class="radio-label"
                  ><input type="checkbox" v-model="form.businessDays" value="5" /> 周五</label
                >
                <label class="radio-label"
                  ><input type="checkbox" v-model="form.businessDays" value="6" /> 周六</label
                >
                <label class="radio-label"
                  ><input type="checkbox" v-model="form.businessDays" value="0" /> 周日</label
                >
              </div>
              <div style="font-size: 12px; color: #999">
                未勾选的星期将被视为休息日，系统将不会为其生成可预约的排期。
              </div>
            </div>
          </div>

          <div class="form-item" style="align-items: flex-start">
            <label class="form-label">特殊营业/休业日</label>
            <div style="display: flex; flex-direction: column; gap: 12px; flex: 1">
              <div class="time-slots-container" style="margin-top: 0">
                <div
                  v-for="(exc, index) in form.exceptionDates"
                  :key="index"
                  style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px"
                >
                  <input type="date" class="form-input" style="width: 150px" v-model="exc.date" />
                  <select class="form-select" style="width: 120px" v-model="exc.type">
                    <option value="closed">休业日 (不开放)</option>
                    <option value="open">营业日 (强制开放)</option>
                  </select>
                  <input
                    type="text"
                    class="form-input"
                    style="flex: 1"
                    v-model="exc.reason"
                    placeholder="原因备注 (如：国庆放假 / 周末调休营业)"
                  />
                  <button class="link-btn danger" @click="removeExceptionDate(index)">删除</button>
                </div>
                <button class="btn btn-default" style="width: 140px" @click="addExceptionDate">
                  + 添加特殊日期
                </button>
                <div style="font-size: 12px; color: #999; margin-top: 8px">
                  特殊日期的优先级高于常规营业日。你可以用它来设置法定节假日休息，或者周六的调休上班。
                </div>
              </div>
            </div>
          </div>

          <div class="form-item" style="align-items: flex-start">
            <label class="form-label required">空间资源分配</label>
            <div style="display: flex; flex-direction: column; gap: 12px; flex: 1">
              <div class="sub-resources-container" style="margin-top: 0">
                <div class="sub-resource-list">
                  <div
                    class="sub-resource-item"
                    v-for="(res, index) in form.subResources"
                    :key="res.id"
                  >
                    <input
                      type="text"
                      class="form-input"
                      style="width: 150px"
                      v-model="res.name"
                      placeholder="资源名称"
                    />
                    <button class="link-btn danger" @click="removeSubResource(index)">删除</button>
                  </div>
                </div>
                <button class="btn btn-default" style="margin-top: 10px" @click="addSubResource">
                  + 添加资源
                </button>
                <div class="tip-text" style="margin-top: 8px">
                  提示：至少需要配置 1 个资源（如：通用场地）。
                </div>
              </div>
            </div>
          </div>

          <!-- 按时段预约的容量配置 -->
          <div
            class="form-item"
            v-if="form.scheduleType === 'time_slot'"
            style="align-items: flex-start"
          >
            <label class="form-label required">时段与排期矩阵</label>
            <div class="time-slots-container">
              <div
                class="time-slot-item"
                v-for="(slot, index) in form.timeSlots"
                :key="index"
                style="
                  flex-direction: column;
                  align-items: flex-start;
                  border-bottom: 1px dashed #ddd;
                  padding-bottom: 15px;
                  margin-bottom: 15px;
                "
              >
                <div style="display: flex; align-items: center; gap: 8px">
                  <input type="time" class="form-input" style="width: 120px" v-model="slot.start" />
                  <span>至</span>
                  <input type="time" class="form-input" style="width: 120px" v-model="slot.end" />
                  <span style="margin-left: 15px">单资源容量：</span>
                  <input
                    type="number"
                    class="form-input"
                    style="width: 80px"
                    v-model="slot.capacity"
                    min="1"
                  />
                  <span>人/资源</span>
                  <button
                    class="link-btn danger"
                    style="margin-left: 10px"
                    @click="removeTimeSlot(index)"
                  >
                    删除时段
                  </button>
                </div>

                <!-- 资源分配矩阵 -->
                <div
                  style="
                    margin-top: 12px;
                    background: #fff;
                    padding: 12px;
                    border-radius: 4px;
                    width: 100%;
                    border: 1px solid #eee;
                  "
                >
                  <div style="font-size: 13px; color: #666; margin-bottom: 8px">
                    勾选该时段开放的资源：
                  </div>
                  <div style="display: flex; flex-wrap: wrap; gap: 12px">
                    <label class="radio-label" v-for="res in form.subResources" :key="res.id">
                      <input type="checkbox" v-model="slot.resourceMap[res.id]" />
                      {{ res.name }}
                    </label>
                  </div>
                </div>
              </div>
              <button class="btn btn-default" style="width: 120px" @click="addTimeSlot">
                + 添加时段
              </button>
              <div style="color: #999; font-size: 12px; margin-top: 10px">
                提示：如果容量设为 1，则代表该时段(或资源)一旦被预定，即被独占（包场）。
              </div>
            </div>
          </div>

          <!-- 按天预约的容量配置 -->
          <div class="form-item" v-if="form.scheduleType === 'date'">
            <label class="form-label required">每日总容量</label>
            <div style="display: flex; align-items: center; gap: 8px">
              每天最多接待
              <input
                type="number"
                class="form-input"
                style="width: 100px"
                v-model="form.dailyCapacity"
                min="1"
              />
              人
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.reservation-publish {
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
  padding-bottom: 40px;
}

.page-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #fff;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  background: none;
  border: none;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
}
.back-btn:hover {
  background: #f0f0f0;
  color: #333;
}

.header-left h2 {
  margin: 0;
  font-size: 18px;
  color: #333;
  font-weight: 500;
}

.header-right {
  display: flex;
  gap: 12px;
}

.form-container {
  max-width: 1000px;
  margin: 24px auto 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.module {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.module-header {
  padding: 16px 24px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
}

.module-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
}

.module-content {
  padding: 24px;
}

.form-item {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}
.form-item:last-child {
  margin-bottom: 0;
}

.form-label {
  width: 120px;
  text-align: right;
  padding-right: 16px;
  color: #333;
  font-size: 14px;
  flex-shrink: 0;
}
.form-label.required::before {
  content: '*';
  color: #ff4d4f;
  margin-right: 4px;
}

.form-input {
  height: 32px;
  padding: 0 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  outline: none;
  transition: all 0.3s;
  font-size: 14px;
}
.form-input:focus {
  border-color: #1677ff;
  box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.1);
}

.form-textarea {
  width: 100%;
  max-width: 600px;
  height: 100px;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  outline: none;
  resize: vertical;
  font-size: 14px;
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
  gap: 6px;
  cursor: pointer;
  color: #333;
  font-size: 14px;
}

/* 子资源相关 */
.sub-resources-container {
  background: #f9f9f9;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #eee;
  margin-top: 12px;
}
.sub-resource-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.sub-resource-item {
  display: flex;
  align-items: center;
  gap: 12px;
}
.tip-text {
  font-size: 12px;
  color: #999;
}

/* 图片上传相关 */
.upload-area {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.upload-btn {
  width: 160px;
  height: 90px;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #999;
  cursor: pointer;
  background: #fafafa;
  transition: border-color 0.3s;
}
.upload-btn:hover {
  border-color: #1677ff;
}
.img-preview {
  width: 160px;
  height: 90px;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  border: 1px solid #d9d9d9;
}
.img-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.img-mask {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  text-align: center;
  padding: 4px 0;
  font-size: 12px;
  opacity: 0;
  transition: opacity 0.3s;
}
.img-preview:hover .img-mask {
  opacity: 1;
}
.upload-tip {
  font-size: 12px;
  color: #999;
}

/* 排期时段相关 */
.time-slots-container {
  background: #f9f9f9;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #eee;
  flex: 1;
  max-width: 600px;
}
.time-slot-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

/* 按钮样式 */
.btn {
  height: 32px;
  padding: 0 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  border: 1px solid transparent;
  transition: all 0.2s;
}
.btn-primary {
  background-color: #1677ff;
  color: #fff;
}
.btn-primary:hover {
  background-color: #4096ff;
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
.link-btn {
  background: none;
  border: none;
  color: #1677ff;
  cursor: pointer;
  padding: 0;
  font-size: 14px;
}
.link-btn.danger {
  color: #ff4d4f;
}
.link-btn:hover {
  text-decoration: underline;
}

/* Switch 开关样式 */
.switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
}

.slider:before {
  position: absolute;
  content: '';
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.4s;
}

input:checked + .slider {
  background-color: #1677ff;
}

input:focus + .slider {
  box-shadow: 0 0 1px #1677ff;
}

input:checked + .slider:before {
  transform: translateX(20px);
}

.slider.round {
  border-radius: 24px;
}

.slider.round:before {
  border-radius: 50%;
}
</style>
