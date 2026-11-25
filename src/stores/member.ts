import { reactive, watch } from 'vue'
import { initialMemberState } from '@/data/member'
import type {
  ActiveStatus,
  BenefitGrant,
  ConditionRelation,
  GrantTrigger,
  Member,
  MemberBenefit,
  MemberLevel,
  MemberState,
  UpgradeMode,
} from '@/types/member'

const STORAGE_KEY = 'web-mall-member-v1'

const cloneInitial = (): MemberState => JSON.parse(JSON.stringify(initialMemberState)) as MemberState

const readInitialState = (): MemberState => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return cloneInitial()
    const state = JSON.parse(saved) as MemberState
    if (!Array.isArray(state.members) || !Array.isArray(state.levels)) return cloneInitial()
    if (!state.levels.some((level) => level.isDefault)) state.levels.unshift(cloneInitial().levels[0]!)
    state.levels.sort((a, b) => a.order - b.order)
    state.members.forEach((member) => {
      member.tagIds ??= []
      member.levelLogs ??= []
      member.growthLogs ??= []
      if (!state.levels.some((level) => level.id === member.currentLevelId)) {
        member.currentLevelId = state.levels.find((level) => level.isDefault)!.id
      }
    })
    state.tags ??= []
    state.coupons ??= cloneInitial().coupons
    state.benefits ??= []
    state.grants ??= []
    state.upgradeMode ??= null
    state.growthPerYuan ??= 1
    return state
  } catch {
    return cloneInitial()
  }
}

export const memberState = reactive<MemberState>(readInitialState())

watch(
  memberState,
  (state) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // Keep the current page usable when browser storage is unavailable.
    }
  },
  { deep: true },
)

const nowText = () => new Date().toLocaleString('sv-SE', { hour12: false }).slice(0, 16)
const id = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
const baseLevel = () => memberState.levels.find((level) => level.isDefault)!
const orderedLevels = () => [...memberState.levels].sort((a, b) => a.order - b.order)

export const getLevel = (levelId: string) => memberState.levels.find((level) => level.id === levelId)
export const getTag = (tagId: string) => memberState.tags.find((tag) => tag.id === tagId)
export const getCoupon = (couponId: string) => memberState.coupons.find((coupon) => coupon.id === couponId)
export const getBenefit = (benefitId: string) => memberState.benefits.find((benefit) => benefit.id === benefitId)
export const getMember = (memberId: string) => memberState.members.find((member) => member.id === memberId)
export const countMembersWithTag = (tagId: string) => memberState.members.filter((member) => member.tagIds.includes(tagId)).length
export const countMembersAtLevel = (levelId: string) => memberState.members.filter((member) => member.currentLevelId === levelId).length

const qualifies = (member: Member, level: MemberLevel) => {
  if (memberState.upgradeMode === 'growth') return member.growthValue >= level.growthThreshold
  if (memberState.upgradeMode !== 'condition') return false
  const amountOk = member.totalPaid >= level.condition.paidAmount
  const orderOk = member.validOrderCount >= level.condition.validOrderCount
  return level.condition.relation === 'all' ? amountOk && orderOk : amountOk || orderOk
}

const attemptCouponGrant = (grant: BenefitGrant): boolean => {
  const benefit = getBenefit(grant.benefitId)
  const coupon = getCoupon(grant.couponId)
  if (!benefit || benefit.status !== 'enabled') {
    grant.status = 'failed'
    grant.failureReason = '权益已停用或已删除'
    return false
  }
  if (!coupon || coupon.status !== 'enabled') {
    grant.status = 'failed'
    grant.failureReason = '优惠券已失效'
    return false
  }
  if (coupon.stock < grant.expectedQuantity) {
    grant.status = 'failed'
    grant.failureReason = '优惠券库存不足'
    return false
  }
  coupon.stock -= grant.expectedQuantity
  grant.status = 'success'
  grant.actualQuantity = grant.expectedQuantity
  grant.failureReason = ''
  grant.grantedAt = nowText()
  return true
}

const grantLevelBenefits = (member: Member, level: MemberLevel, triggerType: GrantTrigger, sourceId: string) => {
  const benefits = memberState.benefits.filter((benefit) => benefit.levelId === level.id && benefit.status === 'enabled')
  for (const benefit of benefits) {
    const existed = memberState.grants.some(
      (grant) => grant.memberId === member.id && grant.levelId === level.id && grant.benefitId === benefit.id,
    )
    if (existed) continue
    const grant: BenefitGrant = {
      id: id('grant'),
      memberId: member.id,
      levelId: level.id,
      benefitId: benefit.id,
      couponId: benefit.couponId,
      expectedQuantity: benefit.couponQuantity,
      actualQuantity: 0,
      status: 'failed',
      triggerType,
      triggerSourceId: sourceId,
      failureReason: '',
      retryCount: 0,
      createdAt: nowText(),
      grantedAt: '',
    }
    attemptCouponGrant(grant)
    memberState.grants.unshift(grant)
  }
}

const grantBetweenLevels = (member: Member, fromOrder: number, toOrder: number, trigger: GrantTrigger, sourceId: string) => {
  orderedLevels()
    .filter((level) => level.status === 'enabled' && level.order > fromOrder && level.order <= toOrder)
    .forEach((level) => grantLevelBenefits(member, level, trigger, sourceId))
}

export const setUpgradeMode = (mode: Exclude<UpgradeMode, null>) => {
  if (memberState.levels.some((level) => !level.isDefault)) return false
  memberState.upgradeMode = mode
  return true
}

export const saveLevel = (
  input: Pick<MemberLevel, 'name' | 'growthThreshold' | 'condition' | 'description' | 'status'>,
  levelId?: string,
  firstMode?: Exclude<UpgradeMode, null>,
) => {
  const current = levelId ? getLevel(levelId) : undefined
  if (levelId && (!current || current.isDefault)) return false
  if (current && input.status === 'disabled' && countMembersAtLevel(current.id) > 0) return false
  if (!current && memberState.upgradeMode === null) {
    if (!firstMode) return false
    memberState.upgradeMode = firstMode
  }
  const timestamp = nowText()
  if (current) {
    Object.assign(current, input, { updatedAt: timestamp })
  } else {
    const level: MemberLevel = {
      ...input,
      id: id('level'),
      order: Math.max(0, ...memberState.levels.map((item) => item.order)) + 1,
      isDefault: false,
      createdAt: timestamp,
      updatedAt: timestamp,
    }
    memberState.levels.push(level)
  }
  memberState.levels.sort((a, b) => a.order - b.order)
  return true
}

export const moveLevel = (levelId: string, direction: -1 | 1) => {
  const levels = orderedLevels()
  const index = levels.findIndex((level) => level.id === levelId)
  const nextIndex = index + direction
  if (index <= 0 || nextIndex <= 0 || nextIndex >= levels.length) return false
  const first = levels[index]!
  const second = levels[nextIndex]!
  const order = first.order
  first.order = second.order
  second.order = order
  if (memberState.upgradeMode === 'growth') {
    const threshold = first.growthThreshold
    first.growthThreshold = second.growthThreshold
    second.growthThreshold = threshold
  } else {
    const condition = first.condition
    first.condition = second.condition
    second.condition = condition
  }
  memberState.levels.sort((a, b) => a.order - b.order)
  return true
}

export const deleteLevel = (levelId: string) => {
  const level = getLevel(levelId)
  if (!level || level.isDefault) return false
  const hasMember = memberState.members.some(
    (member) => member.currentLevelId === levelId || member.levelLogs.some((log) => log.toLevelId === levelId || log.fromLevelId === levelId),
  )
  const hasGrant = memberState.grants.some((grant) => grant.levelId === levelId)
  if (hasMember || hasGrant) return false
  memberState.benefits = memberState.benefits.filter((benefit) => benefit.levelId !== levelId)
  memberState.levels = memberState.levels.filter((item) => item.id !== levelId)
  if (!memberState.levels.some((item) => !item.isDefault)) memberState.upgradeMode = null
  memberState.levels.forEach((item, index) => (item.order = index + 1))
  return true
}

export const toggleLevelStatus = (levelId: string, status: ActiveStatus) => {
  const level = getLevel(levelId)
  if (!level || level.isDefault || (status === 'disabled' && countMembersAtLevel(levelId) > 0)) return false
  level.status = status
  level.updatedAt = nowText()
  return true
}

export const recalculateMember = (member: Member, reason = '根据当前等级规则自动计算') => {
  const current = getLevel(member.currentLevelId) ?? baseLevel()
  const target = orderedLevels()
    .filter((level) => level.status === 'enabled' && level.order > current.order && qualifies(member, level))
    .at(-1)
  if (!target) return false
  const timestamp = nowText()
  const sourceId = id('evaluation')
  grantBetweenLevels(member, current.order, target.order, 'automatic', sourceId)
  member.levelLogs.unshift({
    id: id('level-log'),
    fromLevelId: current.id,
    toLevelId: target.id,
    changeType: 'automatic',
    reason,
    operator: '系统规则',
    createdAt: timestamp,
  })
  member.currentLevelId = target.id
  member.levelObtainedAt = timestamp
  return true
}

export const recalculateAllMembers = () => {
  let count = 0
  for (const member of memberState.members) if (recalculateMember(member)) count += 1
  return count
}

export const adjustMemberLevel = (memberId: string, targetLevelId: string, reason: string) => {
  const member = getMember(memberId)
  const current = member ? getLevel(member.currentLevelId) : undefined
  const target = getLevel(targetLevelId)
  if (!member || !current || !target || target.status !== 'enabled' || target.id === current.id || !reason.trim()) return false
  const timestamp = nowText()
  const sourceId = id('manual')
  if (target.order > current.order) grantBetweenLevels(member, current.order, target.order, 'manual', sourceId)
  member.levelLogs.unshift({
    id: id('level-log'),
    fromLevelId: current.id,
    toLevelId: target.id,
    changeType: 'manual',
    reason: reason.trim(),
    operator: '管理员',
    createdAt: timestamp,
  })
  member.currentLevelId = target.id
  member.levelObtainedAt = timestamp
  return true
}

export const recordOrderCompletion = (memberId: string, paidAmount: number) => {
  const member = getMember(memberId)
  if (!member || member.status !== 'normal' || paidAmount <= 0) return false
  const beforeValue = member.growthValue
  const growth = memberState.upgradeMode === 'growth' ? Math.floor(paidAmount * memberState.growthPerYuan) : 0
  member.growthValue += growth
  member.totalPaid = Number((member.totalPaid + paidAmount).toFixed(2))
  member.validOrderCount += 1
  member.lastConsumedAt = nowText()
  if (growth > 0) {
    member.growthLogs.unshift({
      id: id('growth-log'),
      changeValue: growth,
      beforeValue,
      afterValue: member.growthValue,
      source: '订单完成',
      relatedOrder: `ORD-${Date.now().toString().slice(-8)}`,
      remark: `实付 ¥${paidAmount.toFixed(2)} × ${memberState.growthPerYuan} 成长值/元，向下取整`,
      createdAt: nowText(),
    })
  }
  recalculateMember(member, '订单完成后重新计算等级')
  return true
}

export const recordRefund = (memberId: string, refundAmount: number, isFullRefund: boolean) => {
  const member = getMember(memberId)
  if (!member || refundAmount <= 0 || refundAmount > member.totalPaid || member.validOrderCount <= 0) return false
  const actualRefund = Number(refundAmount.toFixed(2))
  const beforeValue = member.growthValue
  const growth = memberState.upgradeMode === 'growth' ? Math.floor(actualRefund * memberState.growthPerYuan) : 0
  member.growthValue = Math.max(0, member.growthValue - growth)
  member.totalPaid = Number(Math.max(0, member.totalPaid - actualRefund).toFixed(2))
  if (isFullRefund) member.validOrderCount = Math.max(0, member.validOrderCount - 1)
  if (growth > 0) {
    member.growthLogs.unshift({
      id: id('growth-log'),
      changeValue: -Math.min(growth, beforeValue),
      beforeValue,
      afterValue: member.growthValue,
      source: '退款扣回',
      relatedOrder: `RFD-${Date.now().toString().slice(-8)}`,
      remark: `${isFullRefund ? '全额' : '部分'}退款 ¥${actualRefund.toFixed(2)}，等级不自动回退`,
      createdAt: nowText(),
    })
  }
  return true
}

export const saveTag = (name: string, description: string, tagId?: string) => {
  const normalizedName = name.trim()
  if (!normalizedName || memberState.tags.some((tag) => tag.name === normalizedName && tag.id !== tagId)) return false
  const timestamp = nowText()
  const current = tagId ? getTag(tagId) : undefined
  if (tagId && !current) return false
  if (current) Object.assign(current, { name: normalizedName, description: description.trim(), updatedAt: timestamp })
  else memberState.tags.unshift({ id: id('tag'), name: normalizedName, description: description.trim(), status: 'enabled', createdAt: timestamp, updatedAt: timestamp })
  return true
}

export const toggleTagStatus = (tagId: string, status: ActiveStatus) => {
  const tag = getTag(tagId)
  if (!tag) return false
  tag.status = status
  tag.updatedAt = nowText()
  return true
}

export const deleteTag = (tagId: string) => {
  const tag = getTag(tagId)
  if (!tag) return false
  memberState.tags = memberState.tags.filter((item) => item.id !== tagId)
  memberState.members.forEach((member) => (member.tagIds = member.tagIds.filter((item) => item !== tagId)))
  return true
}

export const assignTag = (memberIds: string[], tagId: string) => {
  const tag = getTag(tagId)
  if (!tag || tag.status !== 'enabled') return 0
  let changed = 0
  memberIds.forEach((memberId) => {
    const member = getMember(memberId)
    if (member && !member.tagIds.includes(tagId)) {
      member.tagIds.push(tagId)
      changed += 1
    }
  })
  return changed
}

export const removeTag = (memberIds: string[], tagId: string) => {
  let changed = 0
  memberIds.forEach((memberId) => {
    const member = getMember(memberId)
    if (!member?.tagIds.includes(tagId)) return
    member.tagIds = member.tagIds.filter((item) => item !== tagId)
    changed += 1
  })
  return changed
}

export const saveBenefit = (
  input: Pick<MemberBenefit, 'name' | 'couponId' | 'couponQuantity' | 'levelId' | 'status' | 'description'>,
  benefitId?: string,
) => {
  if (!input.name.trim() || !getCoupon(input.couponId) || !getLevel(input.levelId) || input.couponQuantity < 1) return false
  const timestamp = nowText()
  const current = benefitId ? getBenefit(benefitId) : undefined
  if (current) Object.assign(current, input, { name: input.name.trim(), updatedAt: timestamp })
  else memberState.benefits.unshift({ ...input, name: input.name.trim(), id: id('benefit'), createdAt: timestamp, updatedAt: timestamp })
  return true
}

export const toggleBenefitStatus = (benefitId: string, status: ActiveStatus) => {
  const benefit = getBenefit(benefitId)
  if (!benefit) return false
  benefit.status = status
  benefit.updatedAt = nowText()
  return true
}

export const retryGrant = (grantId: string) => {
  const grant = memberState.grants.find((item) => item.id === grantId)
  if (!grant || grant.status === 'success') return false
  grant.retryCount += 1
  return attemptCouponGrant(grant)
}

export const restoreCouponAvailability = (couponId: string) => {
  const coupon = getCoupon(couponId)
  if (!coupon || coupon.validDays <= 0) return false
  coupon.status = 'enabled'
  if (coupon.stock < 50) coupon.stock = 50
  return true
}

export const setGrowthPerYuan = (value: number) => {
  if (!Number.isFinite(value) || value <= 0) return false
  memberState.growthPerYuan = value
  return true
}

export const relationLabel = (relation: ConditionRelation) => (relation === 'all' ? '满足全部条件' : '满足任一条件')
