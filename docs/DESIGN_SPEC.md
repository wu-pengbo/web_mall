# Web Mall 前端设计规范

> 风格：Ant Design Pro 经典蓝
> 生效日期：2026-06-15
> 适用范围：Web Mall 管理后台所有页面与组件

---

## 1. 设计理念

专业、可信、明亮。以皇家蓝为主色调，搭配深蓝侧边栏和冷灰背景，打造清晰高效的后台管理体验。色彩饱和度适中，层次分明，确保长时间使用不疲劳。

---

## 2. 色彩体系

### 2.1 品牌色

| 名称 | 色值 | 用途 |
|------|------|------|
| 皇家蓝（Primary） | `#4F6EF7` | 主按钮、链接、开关激活、分页选中、菜单选中 |
| 皇家蓝悬停 | `#6B8BF5` | 主按钮 hover 状态 |
| 皇家蓝浅底 | `#E8F3FF` | 菜单选中背景、浅蓝底色区域 |

### 2.2 布局色

| 名称 | 色值 | 用途 |
|------|------|------|
| 深蓝侧栏 | `#001529` | 全局左侧导航栏背景 |
| 深蓝Logo区 | `#002140` | Logo 区域背景 |
| 页面背景 | `#F0F2F5` | 主内容区整体背景 |
| 卡片/面板背景 | `#FFFFFF` | 白色卡片、表单面板 |
| 表头背景 | `#FAFAFA` | 数据表格表头行 |
| 子面板背景 | `#F2F3F5` | 子流水面板、禁用输入框背景 |

### 2.3 文字色

| 名称 | 色值 | 用途 |
|------|------|------|
| 主文字 | `#1D2129` | 标题、正文、重要信息 |
| 次文字 | `#4E5969` | 表单标签、次要信息 |
| 辅助文字 | `#86909C` | 提示文字、说明、占位符、时间戳 |
| 侧栏默认文字 | `#8C939D` | 侧边栏未选中菜单项 |
| 反白文字 | `#FFFFFF` | 深色/主色背景上的文字 |

### 2.4 边框色

| 名称 | 色值 | 用途 |
|------|------|------|
| 默认边框 | `#E5E6EB` | 卡片边框、分隔线、输入框边框、表格行线 |
| 输入框聚焦 | `#4F6EF7` | 表单输入框 focus 状态边框 |
| 侧栏菜单悬停 | `rgba(255,255,255,0.06)` | 深色侧栏菜单 hover 背景 |

### 2.5 语义色（状态标签）

| 语义 | 背景色 | 文字色 | 使用场景 |
|------|--------|--------|----------|
| 成功/正常/启用/完成/已支付 | `#E8F3FF` | `#4F6EF7` | 正常、启用、充值 |
| 危险/失败/冻结/停用/已拒绝 | `#FFF1F0` | `#CF1322` | 失败、冻结、提现 |
| 警告/待处理/草稿/部分 | `#FFF7E6` | `#D46B08` | 待审核、消费 |
| 成功/退款/已通过 | `#E8F8EE` | `#0E7B3A` | 已退款、退款 |
| 中性/已关闭 | `#F2F3F5` | `#86909C` | 已关闭 |

> 状态标签统一使用 pill 圆角（`border-radius: 9999px`），无边框，`font-size: 11px`，`font-weight: 600`，`padding: 2px 10px`。

### 2.6 金额色

| 类型 | 色值 | 用途 |
|------|------|------|
| 正数（收入） | `#CF1322` | 充值、退款等增加金额 |
| 负数（支出） | `#0E7B3A` | 消费、提现等减少金额 |
| 价格文字 | `#CF1322` | 商品价格显示 |

---

## 3. 字体规范

### 3.1 字体栈

```css
--font-sans: -apple-system, 'SF Pro Display', 'Helvetica Neue', 'PingFang SC', 'Microsoft YaHei', sans-serif;
--font-mono: 'Geist Mono', 'SF Mono', 'Menlo', monospace;
```

### 3.2 字号层级

| 元素 | 字号 | 字重 | 备注 |
|------|------|------|------|
| 面板标题 | 17px | 700 | `.panel-header h2` |
| 弹窗标题 | 16px | 600 | `.modal-header h3` |
| 侧栏标题 | 15px | 700 | `.sidebar-title` |
| 正文/表单 | 14px | 400 | 默认文字大小 |
| 表单标签 | 14px | 400 | `.form-label` |
| 辅助文字 | 13px | 400 | `.time-text`, `.sub-text` |
| 操作链接 | 13px | 400 | `.action-link` |
| 表头/标签 | 12px | 600 | `.data-table th`, UPPERCASE |
| 状态标签 | 11px | 600 | `.status-tag` |
| 菜单分组标题 | 11px | 400 | `.menu-group-title`, UPPERCASE |
| 统计数值 | 22px | 700 | `.stat-value`，等宽字体 |

### 3.3 等宽字体使用场景

金额、编号、ID、时间戳等数字内容统一使用 `Geist Mono` 等宽字体：

- `.stat-value` — 统计数值
- `.price-text` — 价格文字
- `.amount-positive` / `.amount-negative` — 金额
- `.time-text` — 时间文字
- `.trend-label` — 趋势图标签
- `.history-count` — 修改记录计数

---

## 4. 组件规范

### 4.1 按钮

| 类型 | 背景 | 文字 | 边框 | 圆角 |
|------|------|------|------|------|
| 主按钮 | `#4F6EF7` | `#FFFFFF` | 无 | 6px |
| 主按钮 hover | `#6B8BF5` | `#FFFFFF` | 无 | 6px |
| 主按钮 disabled | `#4F6EF7` (opacity 0.4) | `#FFFFFF` | 无 | 6px |
| 默认按钮 | `#FFFFFF` | `#4E5969` | `1px solid #E5E6EB` | 6px |
| 默认按钮 hover | `#FFFFFF` | `#1D2129` | `1px solid #4E5969` | 6px |

- 高度：32px
- 内边距：`0 16px`
- 字号：14px，字重 500
- 交互：`:active` 时 `transform: scale(0.98)`
- 过渡：`transition: all 0.15s ease`

### 4.2 开关（Toggle）

| 状态 | 轨道色 | 圆点色 |
|------|--------|--------|
| 关闭 | `#E5E6EB` | `#FFFFFF` |
| 开启 | `#4F6EF7` | `#FFFFFF` |
| 禁用 | opacity 0.4 | `#FFFFFF` |

- 尺寸：44px × 22px
- 圆点：18px，开启时 `translateX(22px)`
- 圆角：22px（全圆）
- 过渡：`0.25s ease`

### 4.3 表单输入框

| 状态 | 边框 | 背景 |
|------|------|------|
| 默认 | `1px solid #E5E6EB` | `#FFFFFF` |
| 聚焦 | `1px solid #4F6EF7` | `#FFFFFF` |
| 禁用 | `1px solid #E5E6EB` | `#F2F3F5` |

- 高度：32px
- 圆角：6px
- 内边距：`0 12px`
- 字号：14px
- 过渡：`transition: border-color 0.15s ease`
- 必填标记：红色星号 `*`，颜色 `#CF1322`
- Radio：`accent-color: #4F6EF7`

### 4.4 数据表格

| 元素 | 样式 |
|------|------|
| 表头背景 | `#FAFAFA` |
| 表头文字 | `#86909C`，12px，UPPERCASE，`letter-spacing: 0.03em` |
| 行边框 | `1px solid #E5E6EB`（底边框） |
| 行内边距 | `14px 10px` |
| 行 hover | 背景 `#FAFAFA` |
| 行过渡 | `transition: background-color 0.15s ease` |

### 4.5 状态标签

```css
.status-tag {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.03em;
  border: none;
}
```

### 4.6 分页

| 元素 | 样式 |
|------|------|
| 页码按钮 | 28px 高，`1px solid #E5E6EB`，白底 |
| 页码 hover | 边框 `#4F6EF7`，文字 `#4F6EF7` |
| 当前页 | 背景 `#4F6EF7`，白字，边框 `#4F6EF7` |
| 禁用页 | 文字 `#E5E6EB`，背景 `#F2F3F5` |

### 4.7 弹窗（Modal）

```css
.modal-overlay {
  background-color: rgba(0, 0, 0, 0.45);
  animation: fadeIn 0.2s ease;
}
.modal-content {
  background-color: #FFFFFF;
  border-radius: 10px;
  border: 1px solid #E5E6EB;
  box-shadow: 0 6px 30px rgba(0, 0, 0, 0.08);
  animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
```

#### 弹窗尺寸

| 尺寸 | 宽度 | Class | 使用场景 |
|------|------|-------|----------|
| 小 | 440px | `.modal-sm` | 确认、简单操作（冻结钱包） |
| 中 | 560px | `.modal-md` | 详情查看（充值详情、提现详情、交易详情） |
| 大 | 720px | `.modal-lg` | 复杂表单（方案编辑、用户流水） |

#### 弹窗结构

- 头部：`padding: 16px 28px`，底边框 `1px solid #E5E6EB`，标题 16px/600
- 内容：`padding: 24px 28px`，`overflow-y: auto`，`flex: 1`
- 底部：`padding: 14px 28px`，顶边框 `1px solid #E5E6EB`
- 关闭按钮：SVG X 图标（`.modal-close-icon` 16×16），28px 可点击区域，hover 背景 `#F2F3F5`

#### 弹窗内表单分组

弹窗内表单超过 4 个字段时，必须使用分组标题 + 分隔线进行轻量分区，避免字段平铺：

```css
.af-group-title {
  font-size: 13px;
  font-weight: 600;
  color: #1D2129;
  margin-bottom: 14px;
  letter-spacing: 0.01em;
}
.af-group-divider {
  height: 1px;
  background-color: #E5E6EB;
  margin: 18px 0 14px;
}
```

分组命名规范：
- **基本信息** — 名称、类型、触发条件等核心字段
- **优惠规则** — 金额/折扣内容、活动时间
- **高级设置** — 限额、开关等非必填/少用字段

### 4.8 操作链接

| 类型 | 颜色 | hover |
|------|------|-------|
| 默认 | `#4F6EF7` | `#4F6EF7` + 下划线 |
| 危险 | `#CF1322` | `#CF1322` + 下划线 |

### 4.9 Segmented Control（分段控制器）

用于 2~3 个互斥选项的切换（替代 radio 按钮组），比 radio 更醒目、更易点击。

```css
.segmented-control {
  display: inline-flex;
  background-color: #F2F3F5;
  border-radius: 8px;
  padding: 3px;
  gap: 2px;
}
.segmented-btn {
  height: 30px;
  padding: 0 20px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #4E5969;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}
.segmented-btn.active {
  background-color: #FFFFFF;
  color: #4F6EF7;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}
```

使用场景：活动类型（赠送/折扣）、支付方式选择、时间范围快捷切换等。

### 4.10 表单字段提示（Field Hint）

表单字段的说明文字必须独立显示在输入框下方，禁止与控件混在同一行。

```css
.af-field-hint {
  font-size: 12px;
  color: #86909C;
  margin-top: 6px;
  line-height: 1.5;
}
```

规范：
- 提示文字字号 12px，颜色 `#86909C`，始终在输入区域下方
- 多行提示每行不超过 40 字
- 禁止将提示文字用 `font-size: 11px` 挤在控件右侧

### 4.11 限额行（Limit Row）

两个同类型的数值输入（如"每人限享"+"每日限量"）合并到同一个 label 下，并排展示：

```css
.af-limit-row {
  display: flex;
  gap: 24px;
  padding-top: 6px;
}
.af-limit-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #4E5969;
}
```

- 统一 label 为概括性名称（如"使用限制"）
- 具体含义在输入框前用短词说明（如"每人限享"/"每日限量"）
- 公共注释统一写在下方 `.af-field-hint`

### 4.12 开关文字标签

开关右侧必须附带当前状态文字，让用户一眼识别开关状态：

```css
.af-toggle-label {
  font-size: 13px;
  color: #86909C;
  margin-left: 10px;
  line-height: 22px;
}
```

- 开启时显示"启用"，关闭时显示"禁用"
- 颜色统一 `#86909C`，不随开关状态变化

---

## 5. 布局规范

### 5.1 全局布局

```
+------------------+-------------------------------------------+
| 侧边栏 200px     |  主内容区（margin-left: 200px）             |
| 背景 #001529     |  背景 #F0F2F5                              |
|                  |                                            |
| [Logo区 #002140] |  [页面内容]                                |
| [菜单列表]       |                                            |
+------------------+-------------------------------------------+
```

### 5.2 模块内布局（左侧导航 + 右侧内容）

```
+------------------+-------------------------------------------+
| 模块侧栏 210px   |  内容面板                                  |
| 背景 #FFFFFF     |  背景 #FFFFFF                              |
| 右边框 #E5E6EB   |  圆角 10px，边框 #E5E6EB                   |
|                  |  padding: 28px                             |
| [模块标题]       |                                            |
| [菜单分组]       |  [面板标题 + 副标题]                        |
|   [菜单项]       |  [面板内容]                                |
+------------------+-------------------------------------------+
```

- 模块菜单选中：字色 `#4F6EF7`，背景 `#E8F3FF`，左侧 3px 竖条 `#4F6EF7`
- 模块菜单悬停：字色 `#1D2129`，背景 `#FAFAFA`

### 5.3 概览卡片

- 网格：`grid-template-columns: repeat(4, 1fr)`
- 间距：16px
- 卡片：白底，`border: 1px solid #E5E6EB`，圆角 10px，内边距 24px
- hover：`box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04)`

---

## 6. 动画规范

### 6.1 弹窗入场

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
```

- fadeIn 用于遮罩层，0.2s ease
- slideUp 用于弹窗主体，0.25s cubic-bezier(0.16, 1, 0.3, 1)

### 6.2 通用过渡

- 按钮/菜单/行 hover：`transition: all 0.15s ease`
- 开关动画：`transition: 0.25s ease`
- 趋势柱状图：`transition: height 0.3s ease`

---

## 7. 间距规范

| 场景 | 数值 |
|------|------|
| 面板内边距 | 24px 28px |
| 面板头部内边距 | 18px 28px |
| 弹窗内边距 | 24px 28px |
| 页面外边距 | 28px |
| 表单项间距 | 16px |
| 筛选栏间距 | 16px |
| 概览卡片间距 | 16px |
| 操作按钮间距 | 8px |
| 分页按钮间距 | 6px |

---

## 8. 圆角规范

| 元素 | 圆角 |
|------|------|
| 面板/卡片 | 10px |
| 弹窗 | 10px |
| 按钮 | 6px |
| 输入框 | 6px |
| 状态标签 | 9999px（pill） |
| 开关 | 22px |
| 分页按钮 | 6px |
| 菜单选中竖条 | 0 3px 3px 0 |

---

## 9. 禁用规范

| 元素 | 禁用样式 |
|------|----------|
| 按钮 | opacity: 0.4，cursor: not-allowed，无 transform |
| 输入框 | 背景 `#F2F3F5`，文字 `#86909C`，cursor: not-allowed |
| 开关 | opacity: 0.4，cursor: not-allowed |
| 分页按钮 | 文字 `#E5E6EB`，背景 `#F2F3F5`，cursor: not-allowed |

---

## 10. 趋势图配色

| 数据类型 | 色值 |
|----------|------|
| 充值柱 | `#4F6EF7`（主色蓝） |
| 消费柱 | `#D46B08`（橙色） |
| 退款柱 | `#0E7B3A`（绿色） |

---

## 11. 设计红线（禁止事项）

1. **禁止使用 `#111111` 炭黑**作为主色或按钮背景（已废弃 minimalist-ui 暗灰方案）
2. **禁止使用 `#1677ff` 或 `#1890ff`**（旧版 Ant Design 蓝与当前主色冲突）
3. **禁止在状态标签上使用边框**（pill 无 border）
4. **禁止卡片使用厚重阴影**（仅允许 `0 2px 8px rgba(0,0,0,0.04)` 级别的轻阴影）
5. **禁止使用渐变背景**
6. **禁止 emoji 替代图标**（当前侧栏使用 emoji 为过渡方案，正式版需替换为 SVG 图标）
7. **禁止在表头中使用 Sentence case**（必须 UPPERCASE + letter-spacing）
8. **禁止将提示文字与控件混在同一行**（必须使用 `.af-field-hint` 独立行）
9. **禁止在弹窗表单中使用原生 radio 按钮组做互斥选择**（必须使用 Segmented Control）

---

## 12. 设计 Token 速查表

```css
:root {
  /* Brand */
  --color-primary: #4F6EF7;
  --color-primary-hover: #6B8BF5;
  --color-primary-bg: #E8F3FF;

  /* Layout */
  --color-sidebar-bg: #001529;
  --color-sidebar-logo: #002140;
  --color-page-bg: #F0F2F5;
  --color-card-bg: #FFFFFF;
  --color-header-bg: #FAFAFA;
  --color-disabled-bg: #F2F3F5;

  /* Text */
  --color-text-primary: #1D2129;
  --color-text-secondary: #4E5969;
  --color-text-tertiary: #86909C;
  --color-text-inverse: #FFFFFF;
  --color-sidebar-text: #8C939D;

  /* Border */
  --color-border: #E5E6EB;
  --color-border-focus: #4F6EF7;

  /* Semantic */
  --color-success-bg: #E8F8EE;  --color-success-text: #0E7B3A;
  --color-danger-bg: #FFF1F0;   --color-danger-text: #CF1322;
  --color-warning-bg: #FFF7E6;  --color-warning-text: #D46B08;
  --color-info-bg: #E8F3FF;     --color-info-text: #4F6EF7;
  --color-neutral-bg: #F2F3F5;  --color-neutral-text: #86909C;

  /* Modal */
  --color-modal-shadow: 0 6px 30px rgba(0, 0, 0, 0.08);
  --color-modal-overlay: rgba(0, 0, 0, 0.45);
  --radius-segmented: 8px;

  /* Radius */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-pill: 9999px;

  /* Font */
  --font-sans: -apple-system, 'SF Pro Display', 'Helvetica Neue', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  --font-mono: 'Geist Mono', 'SF Mono', 'Menlo', monospace;
}
```

---

*本文档为 Web Mall 项目前端设计的唯一权威规范，所有新增页面和组件必须严格遵循。如需调整，须同步更新本文档。*
