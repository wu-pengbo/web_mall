<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const voteId = ref(route.params.id)
const category = ref(route.query.category || 'normal')

// 选项列表
const options = ref<any[]>([])

onMounted(() => {
  // 模拟根据投票ID获取选项
  if (category.value === 'normal') {
    options.value = [
      { id: 1, title: '选项一' },
      { id: 2, title: '选项二' },
    ]
  } else {
    options.value = [
      {
        id: 1,
        title: '张三 - 销售部',
        image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&q=80',
        video: '',
        detailImages: ['https://images.unsplash.com/photo-1556761175-5973dc0f32d7?w=800&q=80'],
        description: '连续三个月销售冠军',
      },
      {
        id: 2,
        title: '李四 - 研发部',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
        video: 'https://www.w3schools.com/html/mov_bbb.mp4',
        detailImages: [],
        description: '核心产品架构师',
      },
    ]
  }
})

const goBack = () => {
  router.push('/vote')
}

const addOption = () => {
  if (category.value === 'normal') {
    options.value.push({ id: Date.now(), title: '' })
  } else {
    options.value.push({
      id: Date.now(),
      title: '',
      image: '',
      video: '',
      detailImages: [],
      description: '',
    })
  }
}

const removeOption = (index: number) => {
  options.value.splice(index, 1)
}

const handleImageUpload = (index: number) => {
  // 模拟上传封面
  const url = prompt(
    '请输入封面图片URL',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&q=80',
  )
  if (url) {
    options.value[index].image = url
  }
}

const handleVideoUpload = (index: number) => {
  // 模拟上传视频
  const url = prompt('请输入视频URL (支持mp4)', 'https://www.w3schools.com/html/mov_bbb.mp4')
  if (url !== null) {
    options.value[index].video = url
  }
}

const handleDetailImageUpload = (index: number) => {
  // 模拟上传详情图
  const url = prompt(
    '请输入详情图片URL',
    'https://images.unsplash.com/photo-1556761175-5973dc0f32d7?w=800&q=80',
  )
  if (url) {
    if (!options.value[index].detailImages) {
      options.value[index].detailImages = []
    }
    options.value[index].detailImages.push(url)
  }
}

const removeDetailImage = (optIndex: number, imgIndex: number) => {
  options.value[optIndex].detailImages.splice(imgIndex, 1)
}

const saveOptions = () => {
  // 校验
  const validOptions = options.value.filter((o) => o.title.trim() !== '')
  if (validOptions.length < 2) {
    alert('至少需要提供 2 个有效的选项！')
    return
  }
  alert('选项保存成功！')
  router.push('/vote')
}
</script>

<template>
  <div class="vote-option-manage">
    <!-- 顶部固定导航 -->
    <div class="fixed-top-area">
      <div class="header">
        <div class="bread-crumb">
          <span style="cursor: pointer; color: #666" @click="goBack">投票管理</span>
          <span style="margin: 0 8px">→</span>
          <span>选项管理 ({{ category === 'normal' ? '普通投票' : '活动评选' }})</span>
        </div>
        <div>
          <button class="btn btn-default" @click="goBack">取消</button>
          <button class="btn btn-primary" @click="saveOptions">保存选项</button>
        </div>
      </div>
    </div>

    <!-- 主体容器 -->
    <div class="container">
      <div class="module">
        <div class="module-header">
          <div class="module-title"><i>📝</i>配置投票选项</div>
          <button class="btn btn-primary" @click="addOption">+ 添加选项</button>
        </div>

        <div class="module-content">
          <!-- 普通投票选项 -->
          <div v-if="category === 'normal'" class="normal-options">
            <table class="data-table">
              <thead>
                <tr>
                  <th style="width: 60px">序号</th>
                  <th>选项内容</th>
                  <th style="width: 100px">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(opt, index) in options" :key="opt.id">
                  <td>{{ index + 1 }}</td>
                  <td>
                    <input
                      type="text"
                      class="form-input"
                      style="width: 100%"
                      v-model="opt.title"
                      placeholder="请输入选项内容"
                    />
                  </td>
                  <td>
                    <button class="link-btn danger" @click="removeOption(index)">删除</button>
                  </td>
                </tr>
                <tr v-if="options.length === 0">
                  <td colspan="3" class="empty-text">暂无选项，请添加</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- 活动评选选项 -->
          <div v-else class="activity-options">
            <div class="activity-grid">
              <div class="activity-card" v-for="(opt, index) in options" :key="opt.id">
                <div class="card-header">
                  <span class="index-badge">{{ index + 1 }}</span>
                  <button class="link-btn danger" @click="removeOption(index)">删除</button>
                </div>
                <div class="card-body">
                  <div class="form-item">
                    <label>封面图片 (必填)：</label>
                    <div class="image-uploader" @click="handleImageUpload(index)">
                      <img v-if="opt.image" :src="opt.image" class="preview-img" />
                      <div v-else class="upload-placeholder">
                        <span>+ 点击上传封面</span>
                      </div>
                    </div>
                  </div>

                  <div class="form-item">
                    <label>宣传视频 (选填)：</label>
                    <div style="display: flex; gap: 8px">
                      <input
                        type="text"
                        class="form-input"
                        style="flex: 1"
                        v-model="opt.video"
                        placeholder="如无视频可留空"
                      />
                      <button class="btn btn-default" @click="handleVideoUpload(index)">
                        上传
                      </button>
                    </div>
                  </div>

                  <div class="form-item">
                    <label>选项标题 (必填)：</label>
                    <input
                      type="text"
                      class="form-input"
                      style="width: 100%"
                      v-model="opt.title"
                      placeholder="如：张三、作品名称等"
                    />
                  </div>

                  <div class="form-item">
                    <label>详情描述 (必填)：</label>
                    <textarea
                      class="form-textarea"
                      style="width: 100%"
                      v-model="opt.description"
                      placeholder="请输入详细介绍（支持换行）"
                    ></textarea>
                  </div>

                  <div class="form-item">
                    <label>多张详情图 (选填)：</label>
                    <div class="detail-images-list">
                      <div
                        class="detail-img-item"
                        v-for="(img, imgIndex) in opt.detailImages"
                        :key="imgIndex"
                      >
                        <img :src="img" class="detail-preview-img" />
                        <div class="img-delete-mask" @click="removeDetailImage(index, imgIndex)">
                          删除
                        </div>
                      </div>
                      <div class="add-detail-img-btn" @click="handleDetailImageUpload(index)">
                        +
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="options.length === 0" class="empty-text" style="padding: 40px 0">
              暂无选项，请添加
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.vote-option-manage {
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

/* 表单样式 */
.form-input {
  height: 32px;
  border: 1px solid #dddddd;
  border-radius: 8px;
  padding: 0 12px;
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
}
.form-input:focus {
  border-color: #1677ff;
}
.form-textarea {
  height: 80px;
  border: 1px solid #dddddd;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 14px;
  outline: none;
  resize: none;
  font-family: inherit;
  box-sizing: border-box;
}
.form-textarea:focus {
  border-color: #1677ff;
}
.form-item {
  margin-top: 12px;
}
.form-item label {
  display: block;
  font-size: 13px;
  color: #666;
  margin-bottom: 4px;
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
.link-btn:hover {
  text-decoration: underline;
}

/* 普通表格样式 */
.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
.data-table th,
.data-table td {
  border-bottom: 1px solid #eeeeee;
  padding: 12px;
  text-align: left;
}
.data-table th {
  background-color: #fafafa;
  color: #666666;
  font-weight: bold;
}

/* 活动网格样式 */
.activity-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}
.activity-card {
  border: 1px solid #eeeeee;
  border-radius: 8px;
  background: #fafafa;
  overflow: hidden;
  transition: box-shadow 0.2s;
}
.activity-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border-bottom: 1px solid #eeeeee;
  background: #ffffff;
}
.index-badge {
  display: inline-block;
  width: 24px;
  height: 24px;
  background: #1677ff;
  color: #ffffff;
  border-radius: 50%;
  text-align: center;
  line-height: 24px;
  font-size: 12px;
}
.card-body {
  padding: 16px;
}
.image-uploader {
  width: 100%;
  height: 160px;
  background: #ffffff;
  border: 1px dashed #dddddd;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  overflow: hidden;
  transition: border-color 0.2s;
}
.image-uploader:hover {
  border-color: #1677ff;
}
.upload-placeholder {
  color: #999999;
  font-size: 14px;
}
.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.empty-text {
  text-align: center;
  color: #999999;
  font-size: 14px;
}

/* 详情图列表样式 */
.detail-images-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 4px;
}
.detail-img-item {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
  border: 1px solid #eee;
}
.detail-preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.img-delete-mask {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: 10px;
  text-align: center;
  padding: 2px 0;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
}
.detail-img-item:hover .img-delete-mask {
  opacity: 1;
}
.add-detail-img-btn {
  width: 60px;
  height: 60px;
  border: 1px dashed #ddd;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  transition: border-color 0.2s;
}
.add-detail-img-btn:hover {
  border-color: #1677ff;
  color: #1677ff;
}
</style>
