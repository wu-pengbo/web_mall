<script setup lang="ts">
withDefaults(
  defineProps<{
    open: boolean
    title: string
    width?: string
  }>(),
  { width: '560px' },
)
const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <Teleport to="body">
    <Transition name="member-modal">
      <div v-if="open" class="member-modal-mask" @click.self="emit('close')" @keydown.esc="emit('close')">
        <section class="member-modal" :style="{ width }" role="dialog" aria-modal="true" :aria-label="title">
          <header class="member-modal-head">
            <h2>{{ title }}</h2>
            <button class="icon-button" aria-label="关闭弹窗" @click="emit('close')">×</button>
          </header>
          <div class="member-modal-body"><slot /></div>
          <footer v-if="$slots.footer" class="member-modal-foot"><slot name="footer" /></footer>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>
