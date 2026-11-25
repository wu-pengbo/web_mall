import { reactive } from 'vue'

export const memberUi = reactive({ message: '', tone: 'info' as 'info' | 'success' | 'error' })
let timer: ReturnType<typeof setTimeout> | undefined

export const notifyMember = (message: string, tone: 'info' | 'success' | 'error' = 'info') => {
  memberUi.message = message
  memberUi.tone = tone
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => (memberUi.message = ''), 2800)
}
