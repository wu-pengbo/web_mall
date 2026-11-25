<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import MemberModal from '@/components/member/MemberModal.vue'
import { countMembersWithTag, deleteTag, memberState, saveTag, toggleTagStatus } from '@/stores/member'
import { notifyMember } from '@/stores/member-ui'
import type { MemberTag } from '@/types/member'

const router = useRouter()
const keyword = ref('')
const statusFilter = ref('')
const editorOpen = ref(false)
const deleteOpen = ref(false)
const editingTagId = ref('')
const deletingTagId = ref('')
const form = reactive({ name: '', description: '' })
const editingTag = computed(() => memberState.tags.find((tag) => tag.id === editingTagId.value))
const deletingTag = computed(() => memberState.tags.find((tag) => tag.id === deletingTagId.value))
const filteredTags = computed(() => memberState.tags.filter((tag) =>
  (!keyword.value.trim() || tag.name.includes(keyword.value.trim()) || tag.description.includes(keyword.value.trim())) &&
  (!statusFilter.value || tag.status === statusFilter.value),
))

const openCreate = () => {
  editingTagId.value = ''
  form.name = ''
  form.description = ''
  editorOpen.value = true
}
const openEdit = (tag: MemberTag) => {
  editingTagId.value = tag.id
  form.name = tag.name
  form.description = tag.description
  editorOpen.value = true
}
const save = () => {
  const name = form.name.trim()
  if (!name) return notifyMember('请输入标签名称', 'error')
  if ([...name].length > 20) return notifyMember('标签名称最多 20 个字符', 'error')
  if (!saveTag(name, form.description, editingTagId.value || undefined)) return notifyMember('标签名称已存在，请更换名称', 'error')
  editorOpen.value = false
  notifyMember(editingTagId.value ? '标签已更新' : '标签已创建', 'success')
}
const confirmDelete = (tag: MemberTag) => {
  deletingTagId.value = tag.id
  deleteOpen.value = true
}
const remove = () => {
  if (!deletingTag.value) return
  const count = countMembersWithTag(deletingTag.value.id)
  deleteTag(deletingTag.value.id)
  deleteOpen.value = false
  notifyMember(count ? `标签已删除，并从 ${count} 位会员移除` : '标签已删除', 'success')
}
const switchStatus = (tag: MemberTag) => {
  const status = tag.status === 'enabled' ? 'disabled' : 'enabled'
  toggleTagStatus(tag.id, status)
  notifyMember(status === 'enabled' ? '标签已启用' : '标签已停用', 'success')
}
</script>

<template>
  <div class="member-page">
    <header class="member-page-header"><div><h1>会员标签</h1><p>使用人工标签分类会员；停用后保留已有关系，不再允许添加。</p></div><button class="btn btn-primary" @click="openCreate">新建标签</button></header>
    <section class="member-stats">
      <article class="member-stat"><div class="member-stat-label">标签总数</div><div class="member-stat-value">{{ memberState.tags.length }}</div><div class="member-stat-note">包含启用和停用标签</div></article>
      <article class="member-stat"><div class="member-stat-label">启用中</div><div class="member-stat-value">{{ memberState.tags.filter((tag) => tag.status === 'enabled').length }}</div><div class="member-stat-note">可添加到会员资料</div></article>
      <article class="member-stat"><div class="member-stat-label">已停用</div><div class="member-stat-value">{{ memberState.tags.filter((tag) => tag.status === 'disabled').length }}</div><div class="member-stat-note">已有关系仍保留</div></article>
      <article class="member-stat"><div class="member-stat-label">已打标会员</div><div class="member-stat-value">{{ memberState.members.filter((member) => member.tagIds.length).length }}</div><div class="member-stat-note">按会员去重</div></article>
    </section>
    <section class="member-card">
      <div class="member-toolbar"><div class="member-filters"><div class="filter-field"><label>搜索标签</label><input v-model="keyword" class="member-input input-search" placeholder="标签名称或说明" /></div><div class="filter-field"><label>状态</label><select v-model="statusFilter" class="member-select"><option value="">全部状态</option><option value="enabled">启用</option><option value="disabled">停用</option></select></div></div><span class="member-pill pill-neutral">{{ filteredTags.length }} 个标签</span></div>
      <div class="member-table-wrap"><table class="member-table"><thead><tr><th>标签名称</th><th>标签说明</th><th>会员人数</th><th>状态</th><th>创建时间</th><th>更新时间</th><th>操作</th></tr></thead><tbody>
        <tr v-for="tag in filteredTags" :key="tag.id"><td class="strong-cell">{{ tag.name }}</td><td>{{ tag.description || '—' }}</td><td><button class="member-link" @click="router.push({ path: '/member/members', query: { tagId: tag.id } })">{{ countMembersWithTag(tag.id) }} 位</button></td><td><span class="member-pill" :class="tag.status === 'enabled' ? 'pill-enabled' : 'pill-disabled'">{{ tag.status === 'enabled' ? '启用' : '停用' }}</span></td><td class="member-time">{{ tag.createdAt }}</td><td class="member-time">{{ tag.updatedAt }}</td><td><div class="member-actions"><button class="member-link" @click="openEdit(tag)">编辑</button><button class="member-link" @click="switchStatus(tag)">{{ tag.status === 'enabled' ? '停用' : '启用' }}</button><button class="member-link danger" @click="confirmDelete(tag)">删除</button></div></td></tr>
        <tr v-if="filteredTags.length === 0"><td colspan="7" class="member-empty">暂无符合条件的标签</td></tr>
      </tbody></table></div>
    </section>

    <MemberModal :open="editorOpen" :title="editingTag ? '编辑标签' : '新建标签'" @close="editorOpen = false">
      <div class="member-form-grid"><div class="form-field span-2"><label class="field-required">标签名称</label><input v-model="form.name" class="member-input" maxlength="20" placeholder="例如：高复购" /><div class="member-hint">同一商城名称不可重复，最多 20 个字符。{{ [...form.name].length }}/20</div></div><div class="form-field span-2"><label>标签说明</label><textarea v-model="form.description" class="member-textarea" maxlength="100" placeholder="说明标签用途（选填）"></textarea></div><div v-if="!editingTag" class="span-2 member-callout"><div><strong>创建后默认启用</strong><p>停用标签会保留已有会员关系，并禁止继续添加。</p></div></div></div>
      <template #footer><button class="btn btn-secondary" @click="editorOpen = false">取消</button><button class="btn btn-primary" @click="save">保存标签</button></template>
    </MemberModal>

    <MemberModal :open="deleteOpen" title="确认删除标签" width="480px" @close="deleteOpen = false">
      <div class="member-callout"><div><strong>将删除“{{ deletingTag?.name }}”</strong><p>当前有 {{ deletingTag ? countMembersWithTag(deletingTag.id) : 0 }} 位会员使用该标签。确认后会同时移除这些关联关系，不影响会员的其他数据。</p></div></div>
      <template #footer><button class="btn btn-secondary" @click="deleteOpen = false">取消</button><button class="btn btn-danger" @click="remove">删除标签并移除关系</button></template>
    </MemberModal>
  </div>
</template>
