import type { MemberLevel, MemberState } from '@/types/member'

const stamp = '2026-09-01 10:00'

export const defaultMemberLevel: MemberLevel = {
  id: 'level-normal',
  name: '普通会员',
  order: 1,
  isDefault: true,
  status: 'enabled',
  growthThreshold: 0,
  condition: { paidAmount: 0, validOrderCount: 0, relation: 'all' },
  description: '注册商城后自动获得的基础等级',
  createdAt: '2026-01-01 00:00',
  updatedAt: stamp,
}

export const initialMemberState: MemberState = {
  upgradeMode: null,
  growthPerYuan: 1,
  levels: [defaultMemberLevel],
  tags: [
    { id: 'tag-repeat', name: '高复购', description: '近期多次完成购买', status: 'enabled', createdAt: '2026-05-08 09:20', updatedAt: stamp },
    { id: 'tag-follow', name: '重点跟进', description: '需要专人跟进服务', status: 'enabled', createdAt: '2026-06-12 14:10', updatedAt: stamp },
    { id: 'tag-feedback', name: '体验反馈', description: '参与过产品体验反馈', status: 'disabled', createdAt: '2026-07-02 11:45', updatedAt: stamp },
  ],
  coupons: [
    { id: 'coupon-10', name: '新人满50减10元', faceValue: 10, threshold: 50, stock: 500, validDays: 30, status: 'enabled' },
    { id: 'coupon-20', name: '会员专享20元券', faceValue: 20, threshold: 100, stock: 260, validDays: 45, status: 'enabled' },
    { id: 'coupon-5', name: '无门槛5元券', faceValue: 5, threshold: 0, stock: 1200, validDays: 15, status: 'enabled' },
    { id: 'coupon-low-stock', name: '等级专享15元券', faceValue: 15, threshold: 80, stock: 0, validDays: 30, status: 'enabled' },
    { id: 'coupon-ended', name: '夏日活动券', faceValue: 15, threshold: 80, stock: 0, validDays: 0, status: 'disabled' },
  ],
  benefits: [],
  grants: [],
  members: [
    { id: 'M2026010081', nickname: '林小满', phone: '138****2031', avatarColor: '#d8e4ff', registeredAt: '2026-01-08 09:32', registerSource: '微信小程序', lastConsumedAt: '2026-09-18 16:42', status: 'normal', currentLevelId: 'level-normal', levelObtainedAt: '2026-01-08 09:32', growthValue: 860, totalPaid: 2860.5, validOrderCount: 8, tagIds: ['tag-repeat'], levelLogs: [], growthLogs: [] },
    { id: 'M2026010142', nickname: '陈予安', phone: '139****6148', avatarColor: '#ffe2d5', registeredAt: '2026-01-14 14:08', registerSource: 'H5商城', lastConsumedAt: '2026-09-21 11:20', status: 'normal', currentLevelId: 'level-normal', levelObtainedAt: '2026-01-14 14:08', growthValue: 1240, totalPaid: 4200, validOrderCount: 12, tagIds: ['tag-repeat', 'tag-follow'], levelLogs: [], growthLogs: [] },
    { id: 'M2026020037', nickname: '周一诺', phone: '186****2205', avatarColor: '#f6e0ff', registeredAt: '2026-02-03 10:17', registerSource: '微信小程序', lastConsumedAt: '2026-08-29 19:05', status: 'normal', currentLevelId: 'level-normal', levelObtainedAt: '2026-02-03 10:17', growthValue: 540, totalPaid: 1760.8, validOrderCount: 5, tagIds: ['tag-feedback'], levelLogs: [], growthLogs: [] },
    { id: 'M2026020196', nickname: '许知夏', phone: '137****0936', avatarColor: '#ffedc9', registeredAt: '2026-02-19 16:51', registerSource: '安卓应用', lastConsumedAt: '2026-09-10 08:54', status: 'normal', currentLevelId: 'level-normal', levelObtainedAt: '2026-02-19 16:51', growthValue: 2100, totalPaid: 6850, validOrderCount: 19, tagIds: ['tag-repeat'], levelLogs: [], growthLogs: [] },
    { id: 'M2026030064', nickname: '沈清和', phone: '151****4830', avatarColor: '#d8f3e8', registeredAt: '2026-03-06 12:26', registerSource: '微信小程序', lastConsumedAt: '2026-07-22 13:16', status: 'normal', currentLevelId: 'level-normal', levelObtainedAt: '2026-03-06 12:26', growthValue: 180, totalPaid: 520, validOrderCount: 2, tagIds: [], levelLogs: [], growthLogs: [] },
    { id: 'M2026030255', nickname: '唐可欣', phone: '133****7561', avatarColor: '#ffe0e8', registeredAt: '2026-03-25 18:03', registerSource: 'H5商城', lastConsumedAt: '2026-09-23 20:11', status: 'normal', currentLevelId: 'level-normal', levelObtainedAt: '2026-03-25 18:03', growthValue: 930, totalPaid: 3180, validOrderCount: 10, tagIds: ['tag-repeat', 'tag-follow'], levelLogs: [], growthLogs: [] },
    { id: 'M2026040109', nickname: '顾星野', phone: '158****3107', avatarColor: '#deedff', registeredAt: '2026-04-01 08:40', registerSource: 'iOS应用', lastConsumedAt: '2026-08-13 17:27', status: 'normal', currentLevelId: 'level-normal', levelObtainedAt: '2026-04-01 08:40', growthValue: 350, totalPaid: 980, validOrderCount: 3, tagIds: [], levelLogs: [], growthLogs: [] },
    { id: 'M2026040188', nickname: '苏念', phone: '185****9024', avatarColor: '#f4e4d6', registeredAt: '2026-04-18 21:12', registerSource: '微信小程序', lastConsumedAt: '2026-09-05 10:02', status: 'disabled', currentLevelId: 'level-normal', levelObtainedAt: '2026-04-18 21:12', growthValue: 620, totalPaid: 2050, validOrderCount: 6, tagIds: ['tag-follow'], levelLogs: [], growthLogs: [] },
    { id: 'M2026050073', nickname: '陆闻溪', phone: '132****1442', avatarColor: '#e2e8d3', registeredAt: '2026-05-07 13:38', registerSource: 'H5商城', lastConsumedAt: '2026-06-16 09:43', status: 'normal', currentLevelId: 'level-normal', levelObtainedAt: '2026-05-07 13:38', growthValue: 90, totalPaid: 198, validOrderCount: 1, tagIds: [], levelLogs: [], growthLogs: [] },
    { id: 'M2026050221', nickname: '叶知秋', phone: '176****6509', avatarColor: '#ece0d6', registeredAt: '2026-05-22 15:24', registerSource: '微信小程序', lastConsumedAt: '2026-09-26 12:39', status: 'normal', currentLevelId: 'level-normal', levelObtainedAt: '2026-05-22 15:24', growthValue: 1480, totalPaid: 5120, validOrderCount: 14, tagIds: ['tag-repeat'], levelLogs: [], growthLogs: [] },
    { id: 'M2026060049', nickname: '白予川', phone: '159****7815', avatarColor: '#d9ecef', registeredAt: '2026-06-04 11:05', registerSource: '安卓应用', lastConsumedAt: '2026-07-01 18:12', status: 'normal', currentLevelId: 'level-normal', levelObtainedAt: '2026-06-04 11:05', growthValue: 260, totalPaid: 740.3, validOrderCount: 3, tagIds: [], levelLogs: [], growthLogs: [] },
    { id: 'M2026070128', nickname: '姜晚晴', phone: '136****5690', avatarColor: '#f6e0d9', registeredAt: '2026-07-01 16:33', registerSource: '微信小程序', lastConsumedAt: '', status: 'normal', currentLevelId: 'level-normal', levelObtainedAt: '2026-07-01 16:33', growthValue: 0, totalPaid: 0, validOrderCount: 0, tagIds: ['tag-feedback'], levelLogs: [], growthLogs: [] },
  ],
}

