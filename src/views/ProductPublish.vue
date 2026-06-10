<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

// --- 页面数据状态 ---
const router = useRouter()
const currentStep = ref(0)
const showAdvanced = ref(false)

const form = reactive({
  productName: '2026新款时尚休闲T恤 宽松显瘦百搭款',
  productCode: 'yx20260401001',
  orgSelect: 'head',
  merchantSelect: 'head1',
  onSaleTime: '2026-04-01T10:00',
  offSaleTime: '2027-04-01T10:00',
  originalPrice: 229,
  salePrice: 89,
  faceValue: 229,
  virtualSales: 0,
  barcode: '',
  channelId: '',
  channelProductId: '',
  // --- 新增业务配置项 ---
  productType: 'physical', // 实物快递: physical, 虚拟核销: virtual, 商家自配: merchant (11)
  freightTemplateId: 1, // 运费模板ID
  productWeight: 0, // 商品重量 kg
  productVolume: 0, // 商品体积 m³
  deliveryPaymentTime: 'post', // 商家自配时的支付时机：先支付 pre, 后支付 post
  paymentMethod: 'pay', // 普通支付: pay, 仅限用券: coupon_only (2)
  supportPointsDeduction: false, // 支持积分抵扣 (4)
  requireFullPoints: false, // 积分不足不允许支付 (3)
  validDays: 30, // 购买后有效天数 (5)
  requireReservation: false, // 需要预约 (9)
  reservationProjectId: '', // 关联的预约项目ID
  requireWriteOff: false, // 需要核销 (10)
  allowTransfer: false, // 是否允许赠送
  dailyLimit: null as number | null, // 每日限制
  weeklyLimit: null as number | null, // 每周限制
  monthlyLimit: null as number | null, // 每月限制
  showAvailableStores: false, // 显示可用门店 (6)
  supportRefund: true, // 支持退货 (7)
  refundRequiresApproval: false, // 退货需人工审批 (8)
  autoRefundDays: 0, // 多少天不核销自动退款 (1)

  // --- 可销售时间配置 ---
  saleTimeType: 'all', // 销售时间类型：all(不限制), date_range(指定日期范围), week_time(按周+时段)
  saleDateRange: { start: '', end: '' }, // 指定日期范围
  saleWeekDays: [] as string[], // 按周可售: '1','2','3','4','5','6','0' (0代表周日)
  saleTimeRanges: [{ start: '00:00', end: '23:59' }], // 每天可售时段

  // --- 卡项专用设置 ---
  serviceCardRules: {
    validityType: 'after_purchase',
    excludeHolidays: false,
    allowTransfer: false,
  },
})

// --- 模拟运费模板数据 ---
const freightTemplates = ref([
  { id: 1, name: '全国包邮 (按件)', type: 'piece' },
  { id: 2, name: '基础运费模板 (偏远加收, 按件)', type: 'piece' },
  { id: 3, name: '大件商品按重量', type: 'weight' },
  { id: 4, name: '超大件商品按体积', type: 'volume' },
])

const currentFreightType = computed(() => {
  const tpl = freightTemplates.value.find((t) => t.id === form.freightTemplateId)
  return tpl ? tpl.type : 'piece'
})

// --- 模拟预约项目数据 ---
const reservationProjects = ref([
  {
    id: 'p1',
    name: '奥体中心羽毛球馆',
    resources: [
      { id: 1, name: '1号场' },
      { id: 2, name: '2号场' },
      { id: 3, name: '3号场' },
      { id: 4, name: 'VIP场' },
    ],
  },
  {
    id: 'p2',
    name: '高级律师1v1咨询',
    resources: [
      { id: 11, name: '张律师' },
      { id: 12, name: '李律师' },
    ],
  },
])

const currentProjectResources = computed(() => {
  if (!form.reservationProjectId) return []
  const project = reservationProjects.value.find((p) => p.id === form.reservationProjectId)
  return project ? project.resources : []
})

// --- 模块折叠状态 ---
const collapsed = reactive({
  base: false,
  img: false,
  trade: false,
  fulfill: false,
  attr: false,
  spec: false,
  detail: false,
})

// --- 步骤条配置 ---
const stepList = [
  { id: 'baseInfoModule', name: '基础信息' },
  { id: 'imgModule', name: '商品图片' },
  { id: 'tradeModule', name: '交易设置' },
  { id: 'fulfillModule', name: '履约售后' },
  { id: 'specModule', name: '商品规格' },
  { id: 'detailModule', name: '商品详情' },
]

const toggleCollapse = (key: keyof typeof collapsed) => {
  collapsed[key] = !collapsed[key]
}

const toggleAdvanced = () => {
  showAdvanced.value = !showAdvanced.value
}

const resetCode = () => {
  form.productCode = `yx${new Date()
    .toISOString()
    .replace(/[-T:.Z]/g, '')
    .slice(0, 14)}`
}

// --- 可销售时间管理 ---
const addTimeRange = () => {
  form.saleTimeRanges.push({ start: '00:00', end: '23:59' })
}
const removeTimeRange = (index: number) => {
  form.saleTimeRanges.splice(index, 1)
}

// --- 商品图片管理 ---
const mainImg = ref('')
const subImgs = ref<string[]>([])
const mainImgInput = ref<HTMLInputElement | null>(null)
const subImgInput = ref<HTMLInputElement | null>(null)

const triggerMainUpload = () => mainImgInput.value?.click()
const triggerSubUpload = () => subImgInput.value?.click()

const handleMainUpload = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      mainImg.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const handleSubUpload = (e: Event) => {
  const files = (e.target as HTMLInputElement).files
  if (files) {
    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        if (subImgs.value.length < 10) {
          subImgs.value.push(ev.target?.result as string)
        } else {
          alert('最多只能上传10张副图')
        }
      }
      reader.readAsDataURL(file)
    })
  }
}

const moveSubImgLeft = (index: number) => {
  if (index > 0) {
    const temp = subImgs.value[index]
    subImgs.value[index] = subImgs.value[index - 1]!
    subImgs.value[index - 1] = temp!
  }
}

const removeSubImg = (index: number) => {
  subImgs.value.splice(index, 1)
}

// --- 商品属性 ---
const selectedTag = ref('新品')

// --- 商品规格 (SKU) ---
interface SpecValue {
  name: string
}
interface Spec {
  name: string
  values: SpecValue[]
}
interface SkuItem {
  specs: Record<string, string>
  price: number
  stock: number
  code: string
  writeOffTimes?: number
  reservationResourceId?: string | number
}

// 规格维度（如：颜色、尺码）
const specList = ref<Spec[]>([
  {
    name: '颜色',
    values: [{ name: '黑色' }, { name: '白色' }],
  },
  {
    name: '尺码',
    values: [{ name: 'L' }, { name: 'XL' }],
  },
])

// 添加规格维度
const addSpecDimension = () => {
  if (specList.value.length >= 3) {
    alert('最多只能添加 3 个规格维度！')
    return
  }
  specList.value.push({ name: '', values: [] })
}

// 删除规格维度
const removeSpecDimension = (index: number) => {
  specList.value.splice(index, 1)
}

// 添加规格值
const addSpecValue = (specIndex: number) => {
  const spec = specList.value[specIndex]
  if (spec) spec.values.push({ name: '' })
}

// 删除规格值
const removeSpecValue = (specIndex: number, valueIndex: number) => {
  const spec = specList.value[specIndex]
  if (spec) spec.values.splice(valueIndex, 1)
}

// 基于规格维度自动计算笛卡尔积生成 SKU 列表
const generatedSkuTable = computed<SkuItem[]>(() => {
  // 过滤掉空的规格名和规格值
  const validSpecs = specList.value.filter((s) => s.name.trim() !== '')

  if (validSpecs.length === 0) return []

  // 检查是否有有效的规格值
  const hasValidValues = validSpecs.every((s) => s.values.some((v) => v.name.trim() !== ''))
  if (!hasValidValues) return []

  // 递归计算笛卡尔积
  const result: SkuItem[] = []

  const generateSku = (currentSpecIndex: number, currentSpecs: Record<string, string>) => {
    if (currentSpecIndex === validSpecs.length) {
      // 生成一行 SKU
      result.push({
        specs: { ...currentSpecs },
        price: form.salePrice, // 默认取基础售价
        stock: 0,
        code: `${form.productCode}-${Object.values(currentSpecs).join('-')}`,
        writeOffTimes: 1, // 可核销次数，默认为1
        reservationResourceId: '', // 默认不限资源
      })
      return
    }

    const currentSpec = validSpecs[currentSpecIndex]
    if (!currentSpec) return

    const validValues = currentSpec.values.filter((v) => v.name.trim() !== '')

    if (validValues.length === 0) {
      // 如果某个维度没有有效值，就跳过它，但继续向下生成
      generateSku(currentSpecIndex + 1, currentSpecs)
    } else {
      for (const val of validValues) {
        currentSpecs[currentSpec.name] = val.name
        generateSku(currentSpecIndex + 1, currentSpecs)
      }
    }
  }

  generateSku(0, {})
  return result
})

// --- 商品详情 ---
const detailTabs = ['图文详情', '购买须知', '包装售后']
const activeTab = ref('图文详情')
const detailContents = reactive({
  图文详情: '<p>这里是图文详情内容，支持HTML预览</p>',
  购买须知: '发货时间：48小时内发货\n退换货规则：支持7天无理由退换货',
  包装售后: '包装精美，售后无忧',
})

//cons-- 底部与进度 ---
const completionPercentage = computed(() => {
  let score = 0
  const total = 8
  if (form.productName) score++
  if (form.orgSelect) score++
  if (form.merchantSelect) score++
  if (form.onSaleTime) score++
  if (form.offSaleTime) score++
  if (form.originalPrice) score++
  if (form.salePrice) score++
  if (mainImg.value) score++
  return Math.round((score / total) * 100)
})

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const scrollToModule = (id: string, stepIndex: number) => {
  const el = document.getElementById(id)
  if (el) {
    const y = el.getBoundingClientRect().top + window.scrollY - 140
    window.scrollTo({ top: y, behavior: 'smooth' })
    currentStep.value = stepIndex
  }
}

const goBack = () => {
  router.push('/')
}

const saveDraft = () => {
  alert('草稿保存成功！')
  console.log('Draft Data:', {
    form,
    mainImg: mainImg.value,
    subImgs: subImgs.value,
    selectedTag: selectedTag.value,
    specList: specList.value,
    detailContents,
  })
}

const submitProduct = () => {
  if (completionPercentage.value < 100) {
    alert('请填写完整核心必填信息！')
    return
  }
  alert('提交上架成功！')
  console.log('Submit Data:', {
    form,
    mainImg: mainImg.value,
    subImgs: subImgs.value,
    selectedTag: selectedTag.value,
    specList: specList.value,
    detailContents,
  })
}

const applyRulesToAll = () => {
  // 批量应用逻辑（目前 v-if="false" 已隐藏）
}

// 简单的滚动监听更新步骤
const onScroll = () => {
  const modules = stepList.map((s) => s.id)
  for (let i = modules.length - 1; i >= 0; i--) {
    const moduleId = modules[i]
    if (moduleId) {
      const el = document.getElementById(moduleId)
      if (el && window.scrollY >= el.offsetTop - 160) {
        currentStep.value = i
        break
      }
    }
  }
}

onMounted(() => {
  window.addEventListener('scroll', onScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <div class="product-publish">
    <!-- 顶部固定导航 -->
    <div class="fixed-top-area">
      <div class="header">
        <div class="bread-crumb">
          <span style="cursor: pointer; color: #666" @click="goBack">商品管理</span>
          <span style="margin: 0 8px">→</span>
          <span>商品上架</span>
        </div>
        <div>
          <button class="btn btn-default" @click="goBack">取消</button>
          <button class="btn btn-primary" id="saveBtn" @click="saveDraft">保存草稿</button>
          <button class="btn btn-primary" id="submitBtn" @click="submitProduct">提交上架</button>
        </div>
      </div>

      <!-- 步骤进度条 -->
      <div class="step-bar-container">
        <div class="step-bar">
          <div
            v-for="(step, index) in stepList"
            :key="step.id"
            class="step"
            :class="currentStep >= index ? 'step-finish' : 'step-unfinish'"
            @click="scrollToModule(step.id, index)"
          >
            {{ step.name }}
          </div>
          <div class="step step-unfinish">提交上架</div>
        </div>
      </div>
    </div>

    <!-- 主体容器 -->
    <div class="container">
      <!-- 基础信息模块 -->
      <div class="module" id="baseInfoModule">
        <div class="module-header">
          <div class="module-title"><i>📄</i>基础信息（核心必填）</div>
          <button class="collapse-btn" id="baseCollapseBtn" @click="toggleCollapse('base')">
            {{ collapsed.base ? '▲' : '▼' }}
          </button>
        </div>
        <div class="module-content" v-show="!collapsed.base">
          <div class="form-item">
            <label class="form-label required">商品名称</label>
            <input
              type="text"
              class="form-input"
              v-model="form.productName"
              placeholder="请输入商品全称（不超过50字，将同步显示在前端商品标题）"
            />
          </div>
          <div class="form-item">
            <label class="form-label">商品编码</label>
            <input type="text" class="form-input" v-model="form.productCode" readonly />
            <button
              class="btn btn-default"
              style="width: auto; height: 24px; font-size: 12px; margin-left: 10px"
              @click="resetCode"
            >
              重置为自动编码
            </button>
          </div>
          <div class="form-item">
            <label class="form-label required">所属机构</label>
            <select class="form-select" v-model="form.orgSelect">
              <option value="head">总部机构</option>
              <option value="branch">分部机构</option>
            </select>
          </div>
          <div class="form-item">
            <label class="form-label required">所属商户</label>
            <select class="form-select" v-model="form.merchantSelect">
              <option value="head1">总部直营店</option>
              <option value="head2">总部加盟店</option>
            </select>
          </div>
          <div class="form-item">
            <label class="form-label">适用门店</label>
            <div class="radio-group">
              <label class="radio-label">
                <input type="checkbox" v-model="form.showAvailableStores" /> 商品详情页显示可用门店
              </label>
            </div>
          </div>
          <div class="form-item">
            <label class="form-label required">上架时间</label>
            <input type="datetime-local" class="form-input" v-model="form.onSaleTime" />
          </div>
          <div class="form-item">
            <label class="form-label required">下架时间</label>
            <input type="datetime-local" class="form-input" v-model="form.offSaleTime" />
          </div>
          <div class="form-item">
            <label class="form-label required">原价</label>
            <input type="number" class="form-input" v-model="form.originalPrice" />
          </div>
          <div class="form-item">
            <label class="form-label required">售价</label>
            <input type="number" class="form-input" v-model="form.salePrice" />
            <span
              style="margin-left: 10px; color: #ff7a45; font-weight: bold"
              id="discountTip"
              v-if="form.originalPrice > 0"
            >
              {{ ((form.salePrice / form.originalPrice) * 10).toFixed(1) }}折 立省{{
                form.originalPrice - form.salePrice
              }}元
            </span>
          </div>
          <div class="form-item">
            <label class="form-label">面值</label>
            <input type="number" class="form-input" v-model="form.faceValue" />
          </div>
          <div class="form-item">
            <label class="form-label">虚拟销量</label>
            <input type="number" class="form-input" v-model="form.virtualSales" />
            <span style="margin-left: 10px; color: #999999; font-size: 12px"
              >建议填写100-500，提升商品转化</span
            >
          </div>

          <div class="advanced-set">
            <button class="advanced-btn" @click="toggleAdvanced">
              {{ showAdvanced ? '收起高级设置▲' : '展开高级设置▼' }}
            </button>
            <div class="advanced-content" v-show="showAdvanced">
              <div class="form-item">
                <label class="form-label">条码</label>
                <input
                  type="text"
                  class="form-input"
                  v-model="form.barcode"
                  placeholder="请输入商品条码（可选）"
                />
              </div>
              <div class="form-item">
                <label class="form-label">渠道ID</label>
                <input
                  type="text"
                  class="form-input"
                  v-model="form.channelId"
                  placeholder="请输入渠道ID（可选）"
                />
              </div>
              <div class="form-item">
                <label class="form-label">渠道商品ID</label>
                <input
                  type="text"
                  class="form-input"
                  v-model="form.channelProductId"
                  placeholder="请输入渠道商品ID（可选）"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 商品图片模块 -->
      <div class="module" id="imgModule">
        <div class="module-header">
          <div class="module-title"><i>🖼️</i>商品图片（核心必填）</div>
          <button class="collapse-btn" @click="toggleCollapse('img')">
            {{ collapsed.img ? '▲' : '▼' }}
          </button>
        </div>
        <div class="module-content" v-show="!collapsed.img">
          <p class="img-upload-tip">
            主图要求：建议尺寸800*800px，格式JPG/PNG，大小≤5M，最多上传10张；建议上传顺序：主图>细节图>场景图>搭配图
          </p>
          <div class="img-upload-area">
            <!-- 隐藏的 input -->
            <input
              type="file"
              ref="mainImgInput"
              style="display: none"
              accept="image/*"
              @change="handleMainUpload"
            />
            <input
              type="file"
              ref="subImgInput"
              style="display: none"
              accept="image/*"
              multiple
              @change="handleSubUpload"
            />

            <div
              class="main-img"
              id="mainImg"
              style="width: 200px; height: 200px; overflow: hidden"
              @click="triggerMainUpload"
            >
              <div class="main-img-label">主图</div>
              <img
                v-if="mainImg"
                :src="mainImg"
                style="width: 100%; height: 100%; object-fit: cover"
              />
              <div v-else style="color: #999; text-align: center">
                <p style="font-size: 24px">+</p>
                <p>点击上传主图</p>
              </div>
            </div>

            <div class="sub-img-list">
              <div
                class="sub-img"
                v-for="(img, index) in subImgs"
                :key="index"
                style="overflow: hidden"
              >
                <img :src="img" style="width: 100%; height: 100%; object-fit: cover" />
                <div class="img-operate">
                  <button class="img-btn" @click.stop="moveSubImgLeft(index)">左移</button>
                  <button class="img-btn" @click.stop="removeSubImg(index)">删除</button>
                </div>
              </div>
              <div class="sub-img" @click="triggerSubUpload" v-if="subImgs.length < 10">
                <div style="color: #999; text-align: center">
                  <p>+</p>
                  <p>副图</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 交易设置模块 -->
      <div class="module" id="tradeModule">
        <div class="module-header">
          <div class="module-title"><i>💳</i>交易设置</div>
          <button class="collapse-btn" @click="toggleCollapse('trade')">
            {{ collapsed.trade ? '▲' : '▼' }}
          </button>
        </div>
        <div class="module-content" v-show="!collapsed.trade">
          <div class="form-item">
            <label class="form-label required">可销售时间</label>
            <div
              class="radio-group"
              style="flex-direction: column; align-items: flex-start; gap: 12px"
            >
              <label class="radio-label"
                ><input type="radio" v-model="form.saleTimeType" value="all" /> 不限制
                (上架期间均可购买)</label
              >

              <div style="display: flex; align-items: center; gap: 12px">
                <label class="radio-label"
                  ><input type="radio" v-model="form.saleTimeType" value="date_range" />
                  指定日期范围</label
                >
                <div
                  v-if="form.saleTimeType === 'date_range'"
                  style="display: flex; align-items: center; gap: 8px"
                >
                  <input
                    type="date"
                    class="form-input"
                    style="width: 140px"
                    v-model="form.saleDateRange.start"
                  />
                  <span>至</span>
                  <input
                    type="date"
                    class="form-input"
                    style="width: 140px"
                    v-model="form.saleDateRange.end"
                  />
                </div>
              </div>

              <div
                style="
                  display: flex;
                  flex-direction: column;
                  gap: 12px;
                  background: #fafafa;
                  padding: 12px;
                  border-radius: 8px;
                  width: 100%;
                "
              >
                <label class="radio-label"
                  ><input type="radio" v-model="form.saleTimeType" value="week_time" />
                  按周期/时段限购 (如: 仅周末的晚餐时段可买)</label
                >
                <div
                  v-if="form.saleTimeType === 'week_time'"
                  style="padding-left: 24px; display: flex; flex-direction: column; gap: 12px"
                >
                  <!-- 按周选择 -->
                  <div style="display: flex; align-items: center; gap: 16px">
                    <span style="font-size: 13px; color: #666">可用星期：</span>
                    <label class="radio-label"
                      ><input type="checkbox" v-model="form.saleWeekDays" value="1" /> 周一</label
                    >
                    <label class="radio-label"
                      ><input type="checkbox" v-model="form.saleWeekDays" value="2" /> 周二</label
                    >
                    <label class="radio-label"
                      ><input type="checkbox" v-model="form.saleWeekDays" value="3" /> 周三</label
                    >
                    <label class="radio-label"
                      ><input type="checkbox" v-model="form.saleWeekDays" value="4" /> 周四</label
                    >
                    <label class="radio-label"
                      ><input type="checkbox" v-model="form.saleWeekDays" value="5" /> 周五</label
                    >
                    <label class="radio-label"
                      ><input type="checkbox" v-model="form.saleWeekDays" value="6" /> 周六</label
                    >
                    <label class="radio-label"
                      ><input type="checkbox" v-model="form.saleWeekDays" value="0" /> 周日</label
                    >
                  </div>
                  <!-- 时段选择 -->
                  <div style="display: flex; flex-direction: column; gap: 8px">
                    <div
                      style="display: flex; align-items: center; gap: 8px"
                      v-for="(tr, index) in form.saleTimeRanges"
                      :key="index"
                    >
                      <span style="font-size: 13px; color: #666">可用时段 {{ index + 1 }}：</span>
                      <input
                        type="time"
                        class="form-input"
                        style="width: 120px"
                        v-model="tr.start"
                      />
                      <span>至</span>
                      <input type="time" class="form-input" style="width: 120px" v-model="tr.end" />
                      <button
                        class="link-btn danger"
                        style="margin-left: 8px"
                        v-if="form.saleTimeRanges.length > 1"
                        @click="removeTimeRange(index)"
                      >
                        删除
                      </button>
                    </div>
                    <button
                      class="btn btn-default"
                      style="width: 120px; height: 28px; font-size: 12px; margin-top: 4px"
                      @click="addTimeRange"
                    >
                      + 添加可用时段
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            class="form-item"
            style="margin-top: 24px; padding-top: 16px; border-top: 1px dashed #eee"
          >
            <label class="form-label required">支付方式</label>
            <div class="radio-group">
              <label class="radio-label"
                ><input type="radio" v-model="form.paymentMethod" value="pay" /> 普通支付</label
              >
              <label class="radio-label"
                ><input type="radio" v-model="form.paymentMethod" value="coupon_only" />
                仅限用券兑换</label
              >
              <label class="radio-label"
                ><input type="radio" v-model="form.paymentMethod" value="points_only" />
                仅限用积分兑换</label
              >
            </div>
          </div>
          <div class="form-item" v-if="form.paymentMethod === 'pay'">
            <label class="form-label">积分抵扣</label>
            <div class="radio-group">
              <label class="radio-label"
                ><input type="checkbox" v-model="form.supportPointsDeduction" /> 支持积分抵扣</label
              >
            </div>
          </div>
        </div>
      </div>

      <!-- 履约售后模块 -->
      <div class="module" id="fulfillModule">
        <div class="module-header">
          <div class="module-title"><i>🛡️</i>履约与售后</div>
          <button class="collapse-btn" @click="toggleCollapse('fulfill')">
            {{ collapsed.fulfill ? '▲' : '▼' }}
          </button>
        </div>
        <div class="module-content" v-show="!collapsed.fulfill">
          <!-- 1. 全局配置：履约方式 -->
          <div class="form-item">
            <label class="form-label required">商品履约方式</label>
            <div class="radio-group" style="flex-wrap: wrap">
              <label class="radio-label"
                ><input type="radio" v-model="form.productType" value="physical" /> 实物快递</label
              >
              <label class="radio-label"
                ><input type="radio" v-model="form.productType" value="pickup" /> 用户自提</label
              >
              <label class="radio-label"
                ><input type="radio" v-model="form.productType" value="express_or_pickup" />
                快递或自提</label
              >
              <label class="radio-label"
                ><input type="radio" v-model="form.productType" value="merchant" /> 商家配送</label
              >
              <label class="radio-label"
                ><input type="radio" v-model="form.productType" value="virtual" />
                虚拟凭证/服务</label
              >
            </div>
          </div>

          <!-- 2. 动态分类配置：根据履约方式显示不同的专属设置 -->
          <div
            class="fulfill-specific-config"
            style="
              background: #fafafa;
              padding: 16px;
              border-radius: 8px;
              margin-top: 16px;
              margin-bottom: 16px;
            "
            v-if="form.productType !== 'pickup'"
          >
            <!-- 实物快递 / 快递或自提 专属设置 (运费模板) -->
            <template v-if="['physical', 'express_or_pickup'].includes(form.productType)">
              <div class="form-item">
                <label class="form-label required">运费模板</label>
                <div style="display: flex; align-items: center; gap: 10px">
                  <select class="form-select" v-model="form.freightTemplateId">
                    <option v-for="tpl in freightTemplates" :key="tpl.id" :value="tpl.id">
                      {{ tpl.name }}
                    </option>
                  </select>
                  <button class="link-btn" @click="router.push('/freight')">管理运费模板</button>
                </div>
              </div>

              <!-- 根据选择的模板类型动态显示重量/体积输入框 -->
              <div class="form-item" v-if="currentFreightType === 'weight'">
                <label class="form-label required">商品重量</label>
                <div style="display: flex; align-items: center; gap: 8px">
                  <input
                    type="number"
                    class="form-input"
                    style="width: 120px"
                    v-model="form.productWeight"
                    min="0"
                    step="0.01"
                  />
                  kg
                  <span style="color: #999; font-size: 12px; margin-left: 10px"
                    >(所选运费模板为按重量计费，必须填写)</span
                  >
                </div>
              </div>

              <div class="form-item" v-if="currentFreightType === 'volume'">
                <label class="form-label required">商品体积</label>
                <div style="display: flex; align-items: center; gap: 8px">
                  <input
                    type="number"
                    class="form-input"
                    style="width: 120px"
                    v-model="form.productVolume"
                    min="0"
                    step="0.01"
                  />
                  m³
                  <span style="color: #999; font-size: 12px; margin-left: 10px"
                    >(所选运费模板为按体积计费，必须填写)</span
                  >
                </div>
              </div>
            </template>

            <!-- 商家自配专属设置 (已移除支付时机) -->
            <template v-if="form.productType === 'merchant'">
              <div style="color: #999; font-size: 13px">商家配送模式已默认启用货到付款。</div>
            </template>

            <!-- 虚拟商品专属设置 -->
            <template v-if="form.productType === 'virtual'">
              <div class="form-item" style="padding-bottom: 16px; border-bottom: 1px dashed #eee">
                <label class="form-label required">核销设置</label>
                <div class="radio-group">
                  <label class="radio-label"
                    ><input type="radio" v-model="form.requireWriteOff" :value="true" />
                    需要核销</label
                  >
                  <label class="radio-label"
                    ><input type="radio" v-model="form.requireWriteOff" :value="false" />
                    不用核销</label
                  >
                </div>
              </div>

              <!-- 只有在"需要核销"时，才显示预约及其他限制配置 -->
              <template v-if="form.requireWriteOff">
                <div class="form-item">
                  <label class="form-label required">有效期限</label>
                  <div style="display: flex; align-items: center; gap: 8px">
                    购买后
                    <input
                      type="number"
                      class="form-input"
                      style="width: 80px"
                      v-model="form.validDays"
                    />
                    天内有效
                  </div>
                </div>

                <div class="form-item" v-if="false">
                  <label class="form-label required">转赠设置</label>
                  <div class="radio-group">
                    <label class="radio-label"
                      ><input type="checkbox" v-model="form.allowTransfer" /> 允许赠送</label
                    >
                  </div>
                </div>

                <div class="form-item">
                  <label class="form-label">使用限制</label>
                  <div style="display: flex; align-items: center; gap: 15px; flex-wrap: wrap">
                    <div style="display: flex; align-items: center; gap: 8px">
                      每日最多
                      <input
                        type="number"
                        class="form-input"
                        style="width: 80px"
                        v-model="form.dailyLimit"
                        placeholder="不限"
                      />
                      次
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px">
                      每周最多
                      <input
                        type="number"
                        class="form-input"
                        style="width: 80px"
                        v-model="form.weeklyLimit"
                        placeholder="不限"
                      />
                      次
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px">
                      每月最多
                      <input
                        type="number"
                        class="form-input"
                        style="width: 80px"
                        v-model="form.monthlyLimit"
                        placeholder="不限"
                      />
                      次
                    </div>
                  </div>
                </div>

                <div
                  class="form-item"
                  style="margin-top: 16px; padding-top: 16px; border-top: 1px dashed #eee"
                >
                  <label class="form-label">预约设置</label>
                  <div class="radio-group">
                    <label class="radio-label">
                      <input type="checkbox" v-model="form.requireReservation" /> 需要提前预约
                    </label>
                  </div>
                </div>

                <div class="form-item" v-if="form.requireReservation">
                  <label class="form-label required">关联预约项目</label>
                  <div style="display: flex; align-items: center; gap: 8px">
                    <select class="form-select" v-model="form.reservationProjectId">
                      <option value="">请选择要关联的预约项目</option>
                      <option v-for="p in reservationProjects" :key="p.id" :value="p.id">
                        {{ p.name }}
                      </option>
                    </select>
                    <span style="color: #999; font-size: 12px; margin-left: 10px"
                      >选中后，可在下方规格明细(SKU)中挂载具体资源场地</span
                    >
                  </div>
                </div>
              </template>
            </template>
          </div>

          <!-- 3. 全局配置：售后退款设置 -->
          <div
            class="form-item"
            style="margin-top: 16px; padding-top: 16px; border-top: 1px dashed #eee"
          >
            <label class="form-label required">售后/退货</label>
            <div class="radio-group">
              <label class="radio-label"
                ><input type="radio" v-model="form.supportRefund" :value="true" />
                支持退货/退款</label
              >
              <label class="radio-label"
                ><input type="radio" v-model="form.supportRefund" :value="false" />
                不支持退货/退款</label
              >
            </div>
          </div>
          <div class="form-item" v-if="form.supportRefund">
            <label class="form-label">退款审批</label>
            <div class="radio-group">
              <label class="radio-label"
                ><input type="checkbox" v-model="form.refundRequiresApproval" />
                退款需要人工审批</label
              >
            </div>
          </div>
          <div
            class="form-item"
            v-if="form.supportRefund && form.productType === 'virtual' && form.requireWriteOff"
          >
            <label class="form-label">自动退款</label>
            <div style="display: flex; align-items: center; gap: 8px">
              支付后
              <input
                type="number"
                class="form-input"
                style="width: 80px"
                v-model="form.autoRefundDays"
              />
              天内不核销自动退货 (填0表示不自动退货)
            </div>
          </div>
        </div>
      </div>

      <!-- 商品规格模块 -->
      <div class="module" id="specModule">
        <div class="module-header">
          <div class="module-title"><i>📐</i>商品规格</div>
          <button class="collapse-btn" @click="toggleCollapse('spec')">
            {{ collapsed.spec ? '▲' : '▼' }}
          </button>
        </div>
        <div class="module-content" v-show="!collapsed.spec">
          <!-- 规格维度设置 -->
          <div class="spec-settings">
            <div class="spec-dimension" v-for="(spec, index) in specList" :key="index">
              <div class="spec-title-bar">
                <input
                  type="text"
                  class="form-input spec-name-input"
                  v-model="spec.name"
                  placeholder="规格名 (如: 颜色)"
                />
                <button class="link-btn danger" @click="removeSpecDimension(index)">
                  删除此规格
                </button>
              </div>
              <div class="spec-values">
                <div class="spec-value-item" v-for="(val, vIndex) in spec.values" :key="vIndex">
                  <input
                    type="text"
                    class="form-input spec-val-input"
                    v-model="val.name"
                    placeholder="规格值"
                  />
                  <button class="spec-del-btn" @click="removeSpecValue(index, vIndex)">×</button>
                </div>
                <button class="btn btn-default add-val-btn" @click="addSpecValue(index)">
                  + 添加规格值
                </button>
              </div>
            </div>

            <div class="spec-add">
              <button
                class="btn btn-default"
                style="width: 140px"
                @click="addSpecDimension"
                :disabled="specList.length >= 3"
              >
                + 添加规格项目
              </button>
              <span style="color: #999; font-size: 12px; margin-left: 10px">(最多支持3级规格)</span>
            </div>
          </div>

          <!-- 自动生成的 SKU 表格 -->
          <div class="sku-table-container" v-if="generatedSkuTable && generatedSkuTable.length > 0">
            <div
              style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 12px;
              "
            >
              <h4 style="font-size: 14px; color: #333">规格明细 (SKU列表)</h4>
              <button
                class="btn btn-default"
                style="height: 26px; font-size: 12px"
                v-if="false"
                @click="applyRulesToAll"
              >
                批量应用卡项规则
              </button>
            </div>
            <table class="data-table sku-table">
              <thead>
                <tr>
                  <th v-for="spec in specList.filter((s) => s.name.trim() !== '')" :key="spec.name">
                    {{ spec.name }}
                  </th>
                  <th style="width: 120px">售价 (元)</th>
                  <th style="width: 120px">库存</th>
                  <th>SKU编码</th>
                  <th
                    v-if="form.productType === 'virtual' && form.requireWriteOff"
                    style="width: 120px"
                  >
                    可核销次数
                  </th>
                  <th
                    v-if="
                      form.productType === 'virtual' &&
                      form.requireWriteOff &&
                      form.requireReservation &&
                      form.reservationProjectId
                    "
                    style="width: 160px"
                  >
                    关联预约资源
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(sku, index) in generatedSkuTable" :key="index">
                  <td v-for="(val, key) in sku.specs" :key="key">
                    {{ val }}
                  </td>
                  <td>
                    <input type="number" class="form-input sku-input" v-model="sku.price" />
                  </td>
                  <td>
                    <input type="number" class="form-input sku-input" v-model="sku.stock" />
                  </td>
                  <td>
                    <input type="text" class="form-input sku-input" v-model="sku.code" />
                  </td>
                  <td v-if="form.productType === 'virtual' && form.requireWriteOff">
                    <input
                      type="number"
                      class="form-input sku-input"
                      v-model="sku.writeOffTimes"
                      min="1"
                    />
                  </td>
                  <td
                    v-if="
                      form.productType === 'virtual' &&
                      form.requireWriteOff &&
                      form.requireReservation &&
                      form.reservationProjectId
                    "
                  >
                    <select
                      class="form-select sku-input"
                      v-model="sku.reservationResourceId"
                      style="width: 100%"
                    >
                      <option value="">不限资源 (通用)</option>
                      <option v-for="res in currentProjectResources" :key="res.id" :value="res.id">
                        {{ res.name }}
                      </option>
                    </select>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div
            v-else
            style="
              color: #999;
              text-align: center;
              padding: 20px;
              background: #f9f9f9;
              border-radius: 8px;
            "
          >
            请先添加有效的规格项和规格值，将自动生成SKU列表
          </div>
        </div>
      </div>

      <!-- 商品详情模块 -->
      <div class="module" id="detailModule">
        <div class="module-header">
          <div class="module-title"><i>📝</i>商品详情</div>
          <button class="collapse-btn" @click="toggleCollapse('detail')">
            {{ collapsed.detail ? '▲' : '▼' }}
          </button>
        </div>
        <div class="module-content" v-show="!collapsed.detail">
          <div class="template-select">
            <span>详情模板：</span>
            <select class="form-select" style="width: 200px">
              <option>默认服装模板</option>
            </select>
          </div>
          <div class="tab-group">
            <div
              class="tab-item"
              v-for="tab in detailTabs"
              :key="tab"
              :class="{ active: activeTab === tab, required: tab === '图文详情' }"
              @click="activeTab = tab"
            >
              {{ tab }}
            </div>
          </div>
          <div class="detail-edit">
            <textarea
              class="edit-area"
              v-model="detailContents[activeTab as keyof typeof detailContents]"
              placeholder="在这里输入或粘贴详情内容..."
            ></textarea>
            <div class="preview-area">
              <div
                style="color: #999; text-align: center; margin-top: 10px"
                v-if="!detailContents[activeTab as keyof typeof detailContents]"
              >
                手机端预览效果区
              </div>
              <div
                v-else
                style="white-space: pre-wrap"
                v-html="detailContents[activeTab as keyof typeof detailContents]"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部辅助区域 -->
    <div class="footer">
      <div class="completion">
        当前信息完整度：<span
          class="completion-success"
          :style="{ color: completionPercentage === 100 ? '#52C41A' : '#FF7A45' }"
          >{{ completionPercentage }}%</span
        >
      </div>
      <div>
        <button class="jump-btn" @click="scrollToTop">回到顶部 ↑</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 全局样式（贴合优化需求，统一视觉规范） */
.product-publish {
  background-color: #f5f7fa;
  color: #333333;
  font-size: 14px;
  font-family: 'Microsoft YaHei', sans-serif;
  min-height: 100vh;
  padding-top: 1px; /* prevent margin collapse */
}

/* 顶部固定区域：包含导航和步骤条 */
.fixed-top-area {
  position: sticky;
  top: 0;
  z-index: 999;
  background-color: #f5f7fa;
}

/* 顶部固定导航 */
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
  color: #333333;
  font-size: 14px;
}
.btn {
  width: 80px;
  height: 36px;
  border-radius: 10px;
  border: none;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  margin-left: 10px;
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

/* 步骤进度条 */
.step-bar-container {
  background-color: #f5f7fa;
  padding: 20px 20px 0 20px;
}
.step-bar {
  height: 40px;
  background-color: #eeeeee;
  border-radius: 8px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin-bottom: 20px;
}
.step {
  font-size: 14px;
  position: relative;
  text-align: center;
  width: 16.67%;
}
.step-finish {
  color: #1677ff;
}
.step-finish::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  height: 2px;
  background-color: #1677ff;
}
.step-current {
  color: #1677ff;
  font-weight: bold;
}
.step-current::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  height: 2px;
  background-color: #1677ff;
}
.step-current::before {
  content: '';
  position: absolute;
  top: -5px;
  left: 50%;
  transform: translateX(-50%);
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #1677ff;
}
.step-unfinish {
  color: #999999;
}

/* 主体容器 */
.container {
  padding: 0 20px;
  margin-bottom: 80px;
}

/* 模块通用样式 */
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
.collapse-btn {
  color: #999999;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
}

/* 表单样式 */
.form-item {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}
.form-label {
  width: 120px;
  font-size: 14px;
  color: #333333;
}
.form-label.required::before {
  content: '*';
  color: #ff4d4f;
  margin-right: 4px;
}
.form-input,
.form-select {
  width: 300px;
  height: 32px;
  border: 1px solid #dddddd;
  border-radius: 8px;
  padding: 0 12px;
  font-size: 14px;
}
.form-input:focus,
.form-select:focus {
  border-color: #1677ff;
  outline: none;
  transition: all 0.2s;
}
.form-input.error {
  border-color: #ff4d4f;
}

/* 快速设置按钮组 */
.quick-set {
  margin-left: 120px;
  margin-bottom: 16px;
}
.quick-btn {
  height: 30px;
  padding: 0 12px;
  border-radius: 8px;
  background-color: #1677ff;
  color: #ffffff;
  border: none;
  font-size: 12px;
  cursor: pointer;
  margin-right: 10px;
}

/* 高级设置折叠面板 */
.advanced-set {
  margin-left: 120px;
  margin-top: 8px;
}
.advanced-btn {
  background: none;
  border: none;
  color: #1677ff;
  font-size: 14px;
  cursor: pointer;
}
.advanced-content {
  margin-top: 16px;
}

/* 图片上传模块 */
.img-upload-area {
  display: flex;
  gap: 20px;
}
.main-img {
  border: 1px dashed #dddddd;
  border-radius: 8px;
  background-color: #f5f7fa;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
}
.main-img-label {
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: #ff4d4f;
  color: #ffffff;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
}
.sub-img-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.sub-img {
  width: 100px;
  height: 100px;
  border: 1px dashed #dddddd;
  border-radius: 8px;
  background-color: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
}
.img-upload-tip {
  color: #999999;
  font-size: 12px;
  margin-bottom: 16px;
}
.img-operate {
  display: none;
  position: absolute;
  bottom: 5px;
  right: 5px;
  gap: 5px;
}
.img-btn {
  width: 40px;
  height: 20px;
  font-size: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  background-color: #ffffff;
  color: #333333;
}
.sub-img:hover .img-operate {
  display: flex;
}

/* 商品属性模块 */
.radio-group {
  display: flex;
  gap: 20px;
  margin-left: 0;
}
.radio-item {
  display: flex;
  align-items: center;
  gap: 4px;
}
.radio-label {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  font-size: 14px;
}
.radio-btn {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1px solid #dddddd;
  cursor: pointer;
  position: relative;
}
.radio-btn.checked {
  border-color: #1677ff;
}
.radio-btn.checked::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #1677ff;
}

/* 商品规格模块 */
.spec-dimension {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}
.spec-title-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.spec-name-input {
  width: 200px;
  font-weight: bold;
}
.spec-values {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}
.spec-value-item {
  position: relative;
  display: inline-block;
}
.spec-val-input {
  width: 120px;
}
.spec-del-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #ff4d4f;
  color: #fff;
  border: none;
  font-size: 12px;
  line-height: 14px;
  cursor: pointer;
  display: none;
}
.spec-value-item:hover .spec-del-btn {
  display: block;
}
.add-val-btn {
  width: auto;
  height: 32px;
  font-weight: normal;
  background: #fff;
  border: 1px dashed #ddd;
}
.sku-table-container {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}
.sku-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}
.sku-table th,
.sku-table td {
  border: 1px solid #eee;
  padding: 12px;
  font-size: 14px;
}
.sku-table th {
  background: #f5f7fa;
  font-weight: bold;
}
.sku-input {
  width: 100%;
  height: 28px;
  box-sizing: border-box;
}

/* 商品详情模块 */
.template-select {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.detail-edit {
  display: flex;
  gap: 20px;
}
.edit-area {
  width: 60%;
  height: 400px;
  border: 1px solid #dddddd;
  border-radius: 8px;
  padding: 10px;
  resize: none;
  font-family: inherit;
}
.preview-area {
  width: 38%;
  height: 400px;
  border: 1px solid #dddddd;
  border-radius: 8px;
  padding: 10px;
  background-color: #ffffff;
  overflow: auto;
}
.tab-group {
  display: flex;
  gap: 20px;
  margin-bottom: 10px;
}
.tab-item {
  font-size: 14px;
  cursor: pointer;
  padding: 4px 8px;
  border-bottom: 2px solid transparent;
}
.tab-item.active {
  color: #1677ff;
  border-bottom-color: #1677ff;
}
.tab-item.required {
  color: #ff4d4f;
}

/* 底部辅助区域 */
.footer {
  position: fixed;
  bottom: 0;
  left: 200px;
  right: 0;
  height: 60px;
  background-color: #ffffff;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  z-index: 999;
}
.completion {
  font-size: 14px;
  color: #333333;
}
.completion-success {
  color: #52c41a;
  font-weight: bold;
}
.jump-btn {
  background: none;
  border: none;
  color: #1677ff;
  cursor: pointer;
  font-size: 14px;
}

/* 卡项规则弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
}
.modal-content {
  background: #ffffff;
  border-radius: 8px;
  width: 500px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
.modal-header {
  padding: 16px 24px;
  border-bottom: 1px solid #eeeeee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.modal-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}
.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #999;
  cursor: pointer;
}
.close-btn:hover {
  color: #333;
}
.modal-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #eeeeee;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
