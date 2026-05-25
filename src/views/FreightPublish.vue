<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const isEdit = !!route.query.id

// 模拟省份数据用于多选
const provinces = ['北京', '天津', '河北', '山西', '内蒙古', '辽宁', '吉林', '黑龙江', '上海', '江苏', '浙江', '安徽', '福建', '江西', '山东', '山东', '河南', '湖北', '湖南', '广东', '广西', '海南', '重庆', '四川', '贵州', '云南', '西藏', '陕西', '甘肃', '青海', '宁夏', '新疆', '台湾', '香港', '澳门']

// --- 表单数据 ---
const form = reactive({
  name: '',
  type: 'piece', // piece 按件, weight 按重量, volume 按体积
  defaultRule: { firstAmount: 1, firstFee: 0, nextAmount: 1, nextFee: 0 },
  specialRules: [] as Array<{ areas: string[], firstAmount: number, firstFee: number, nextAmount: number, nextFee: number }>
})

onMounted(() => {
  if (isEdit) {
    // 模拟加载数据
    form.name = '基础运费模板 (偏远加收)'
    form.type = 'piece'
    form.defaultRule = { firstAmount: 1, firstFee: 10, nextAmount: 1, nextFee: 5 }
    form.specialRules = [
      { areas: ['新疆', '西藏', '内蒙古'], firstAmount: 1, firstFee: 20, nextAmount: 1, nextFee: 15 }
    ]
  }
})

// --- 动态单位显示 ---
const unitLabel = computed(() => {
  if (form.type === 'piece') return '件'
  if (form.type === 'weight') return 'kg'
  if (form.type === 'volume') return 'm³'
  return '件'
})

// --- 规则操作 ---
const addSpecialRule = () => {
  form.specialRules.push({
    areas: [],
    firstAmount: 1,
    firstFee: 0,
    nextAmount: 1,
    nextFee: 0
  })
}

const removeSpecialRule = (index: number) => {
  form.specialRules.splice(index, 1)
}

// 模拟地区选择
const editAreas = (index: number) => {
  const currentAreas = form.specialRules[index].areas.join(',')
  const input = prompt(`请输入需要指定运费的地区（用英文逗号分隔），可选范围：\n${provinces.slice(0, 10).join(',')}...等`, currentAreas)
  if (input !== null) {
    const areas = input.split(',').map(s => s.trim()).filter(s => s)
    form.specialRules[index].areas = areas
  }
}

const goBack = () => {
  router.push('/freight')
}

const saveFreight = () => {
  if (!form.name.trim()) {
    alert('请填写模板名称')
    return
  }
  
  // 简单校验
  for (let i = 0; i < form.specialRules.length; i++) {
    if (form.specialRules[i].areas.length === 0) {
      alert(`特殊地区规则第 ${i + 1} 行未选择任何地区！`)
      return
    }
  }

  alert('运费模板保存成功！')
  console.log('Save Freight:', form)
  router.push('/freight')
}
</script>

<template>
  <div class="freight-publish">
    <!-- 顶部固定导航 -->
    <div class="fixed-top-area">
      <div class="header">
        <div class="bread-crumb">
          <span style="cursor: pointer; color: #666" @click="goBack">运费模板管理</span>
          <span style="margin: 0 8px">→</span>
          <span>{{ isEdit ? '编辑模板' : '新建模板' }}</span>
        </div>
        <div>
          <button class="btn btn-default" @click="goBack">取消</button>
          <button class="btn btn-primary" @click="saveFreight">保存模板</button>
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
            <label class="form-label required">模板名称</label>
            <input
              type="text"
              class="form-input"
              v-model="form.name"
              placeholder="请输入模板名称，如：全国包邮、大件偏远加收"
            />
          </div>
          <div class="form-item" style="margin-top: 24px;">
            <label class="form-label required">计费方式</label>
            <div class="radio-group">
              <label class="radio-label"><input type="radio" v-model="form.type" value="piece" /> 按件数</label>
              <label class="radio-label"><input type="radio" v-model="form.type" value="weight" /> 按重量</label>
              <label class="radio-label"><input type="radio" v-model="form.type" value="volume" /> 按体积</label>
            </div>
            <div class="tip-text" style="margin-left: 16px; color: #999; font-size: 12px;">
              (切换计费方式将清空下方已设置的计费规则)
            </div>
          </div>
        </div>
      </div>

      <!-- 配送区域与运费 -->
      <div class="module">
        <div class="module-header">
          <div class="module-title"><i>🚚</i>配送区域与运费</div>
        </div>
        <div class="module-content">
          <table class="rule-table">
            <thead>
              <tr>
                <th>配送区域</th>
                <th style="width: 120px;">首件/重/体积 ({{ unitLabel }})</th>
                <th style="width: 120px;">首费 (元)</th>
                <th style="width: 120px;">续件/重/体积 ({{ unitLabel }})</th>
                <th style="width: 120px;">续费 (元)</th>
                <th style="width: 80px;">操作</th>
              </tr>
            </thead>
            <tbody>
              <!-- 默认规则 -->
              <tr class="default-row">
                <td>
                  <strong>默认运费</strong>
                  <div style="font-size: 12px; color: #999; margin-top: 4px;">除指定地区外，其余地区的运费采用默认运费</div>
                </td>
                <td><input type="number" class="form-input rule-input" v-model="form.defaultRule.firstAmount" min="1"></td>
                <td><input type="number" class="form-input rule-input" v-model="form.defaultRule.firstFee" min="0"></td>
                <td><input type="number" class="form-input rule-input" v-model="form.defaultRule.nextAmount" min="1"></td>
                <td><input type="number" class="form-input rule-input" v-model="form.defaultRule.nextFee" min="0"></td>
                <td>-</td>
              </tr>
              <!-- 特殊地区规则 -->
              <tr v-for="(rule, index) in form.specialRules" :key="index">
                <td>
                  <div class="areas-display">
                    <span v-if="rule.areas.length === 0" style="color: #FF4D4F;">未选择地区，请编辑</span>
                    <span v-else>{{ rule.areas.join('、') }}</span>
                  </div>
                  <button class="link-btn" style="margin-top: 8px;" @click="editAreas(index)">编辑地区</button>
                </td>
                <td><input type="number" class="form-input rule-input" v-model="rule.firstAmount" min="1"></td>
                <td><input type="number" class="form-input rule-input" v-model="rule.firstFee" min="0"></td>
                <td><input type="number" class="form-input rule-input" v-model="rule.nextAmount" min="1"></td>
                <td><input type="number" class="form-input rule-input" v-model="rule.nextFee" min="0"></td>
                <td><button class="link-btn danger" @click="removeSpecialRule(index)">删除</button></td>
              </tr>
            </tbody>
          </table>
          <button class="btn btn-default" style="margin-top: 16px;" @click="addSpecialRule">+ 为指定地区设置特殊运费</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.freight-publish {
  background-color: #F5F7FA;
  min-height: 100vh;
  color: #333333;
  font-family: "Microsoft YaHei", sans-serif;
}
.fixed-top-area {
  position: sticky;
  top: 0;
  z-index: 999;
  background-color: #F5F7FA;
}
.header {
  height: 60px;
  background-color: #FFFFFF;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
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
  background-color: #FFFFFF;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
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
}
.form-label {
  width: 100px;
  font-size: 14px;
  color: #333333;
  flex-shrink: 0;
}
.form-label.required::before {
  content: "*";
  color: #FF4D4F;
  margin-right: 4px;
}
.form-input {
  width: 400px;
  height: 32px;
  border: 1px solid #DDDDDD;
  border-radius: 8px;
  padding: 0 12px;
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
}
.form-input:focus {
  border-color: #1677FF;
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

/* 按钮样式 */
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
.btn-primary:hover {
  box-shadow: 0 2px 8px rgba(22, 119, 255, 0.2);
}
.btn-default {
  background-color: #EEEEEE;
  color: #333333;
}
.btn-default:hover {
  background-color: #E0E0E0;
}
.link-btn {
  background: none;
  border: none;
  color: #1677FF;
  cursor: pointer;
  font-size: 14px;
  padding: 0;
}
.link-btn.danger {
  color: #FF4D4F;
}

/* 规则表格样式 */
.rule-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  border: 1px solid #EEEEEE;
}
.rule-table th, .rule-table td {
  border: 1px solid #EEEEEE;
  padding: 12px;
  text-align: left;
  vertical-align: top;
}
.rule-table th {
  background-color: #FAFAFA;
  color: #666666;
  font-weight: bold;
}
.default-row {
  background-color: #FDFDFD;
}
.rule-input {
  width: 100% !important;
  text-align: center;
}
.areas-display {
  font-size: 13px;
  color: #333;
  line-height: 1.5;
  margin-bottom: 8px;
}
</style>