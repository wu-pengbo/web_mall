# 积分系统 API 接口清单

> 版本：v1.1
> 日期：2026-06-10

***

## 一、平台管理端 API

基础路径：`/api/admin`

### 1.1 积分配置

| 方法  | 路径                       | 说明        |
| --- | ------------------------ | --------- |
| GET | `/points/config`         | 查询当前积分配置  |
| PUT | `/points/config`         | 保存/修改积分配置 |
| GET | `/points/config/history` | 配置修改记录    |

### 1.2 积分批次

| 方法   | 路径              | 说明          |
| ---- | --------------- | ----------- |
| POST | `/batch/create` | 新建积分批次      |
| PUT  | `/batch/status` | 启用/停用批次     |
| GET  | `/batch/list`   | 批次列表（分页+筛选） |

### 1.3 商户签约

| 方法   | 路径                    | 说明   |
| ---- | --------------------- | ---- |
| POST | `/merchant/sign`      | 商户签约 |
| PUT  | `/merchant/terminate` | 商户解约 |
| GET  | `/merchant/list`      | 商户列表 |

### 1.4 额度管理

| 方法   | 路径                       | 说明                   |
| ---- | ------------------------ | -------------------- |
| POST | `/quota/recharge`        | 额度充值                 |
| POST | `/quota/recycle`         | 额度回收                 |
| PUT  | `/quota/finance-confirm` | 财务确认（支付确认 + 变更确认/拒绝） |
| GET  | `/quota/list`            | 额度变更记录               |

### 1.5 用户余额

| 方法  | 路径                   | 说明            |
| --- | -------------------- | ------------- |
| GET | `/user/balance`      | 用户余额列表（搜索+分页） |
| GET | `/user/ledger/{uid}` | 查看指定用户积分流水    |

### 1.6 积分变更

| 方法   | 路径                    | 说明            |
| ---- | --------------------- | ------------- |
| POST | `/points/change`      | 后台积分变更（发放/扣除） |
| GET  | `/points/change/list` | 变更流水列表        |

### 1.7 积分流水

| 方法   | 路径               | 说明            |
| ---- | ---------------- | ------------- |
| GET  | `/ledger/list`   | 全局积分流水（多维度筛选） |
| POST | `/ledger/export` | 导出流水报表        |

***

## 二、迅收银 API

基础路径：`/api/merchant`

### 2.1 积分发放

| 方法   | 路径                   | 说明        |
| ---- | -------------------- | --------- |
| POST | `/points/grant`      | 向用户发放积分   |
| GET  | `/points/batch-list` | 查询本商户可用批次 |
| GET  | `/points/balance`    | 查询本商户剩余额度 |

### 2.2 积分抵扣

| 方法   | 路径                        | 说明           |
| ---- | ------------------------- | ------------ |
| POST | `/points/deduct`          | 抵扣用户积分（传订单号） |
| POST | `/points/deduct/rollback` | 撤销抵扣（退单）     |

### 2.3 流水查询

| 方法  | 路径                 | 说明           |
| --- | ------------------ | ------------ |
| GET | `/ledger/issue`    | 本商户发放流水      |
| GET | `/ledger/consume`  | 本商户抵扣流水      |
| GET | `/ledger/overview` | 商户积分概览       |
| GET | `/ledger/summary`  | 商户流水摘要（弹窗头部） |

### 2.4 用户查询

| 方法  | 路径             | 说明            |
| --- | -------------- | ------------- |
| GET | `/user/search` | 搜索用户（手机号/UID） |
| GET | `/user/points` | 查询用户积分余额      |

***

## 三、用户端（商城小程序）API

基础路径：`/api/user`

### 3.1 积分查询

| 方法  | 路径                  | 说明             |
| --- | ------------------- | -------------- |
| GET | `/points/balance`   | 查询我的积分余额       |
| GET | `/points/ledger`    | 查询我的积分流水（分页）   |
| GET | `/points/expiring`  | 查询即将过期积分       |
| GET | `/points/user-info` | 用户积分信息摘要（弹窗头部） |

### 3.2 积分获取

| 方法   | 路径                      | 说明       |
| ---- | ----------------------- | -------- |
| POST | `/points/earn`          | 通用积分获取入口 |
| POST | `/points/earn/sign`     | 签到领积分    |
| POST | `/points/earn/activity` | 活动获取积分   |
| POST | `/points/earn/photo`    | 拍照获取积分   |

### 3.3 积分抵扣

| 方法   | 路径                         | 说明      |
| ---- | -------------------------- | ------- |
| POST | `/points/deduct/calculate` | 计算可抵扣金额 |
| POST | `/points/deduct`           | 下单抵扣积分  |
| POST | `/points/deduct/rollback`  | 退款退回积分  |
| GET  | `/points/deduct/rules`     | 抵扣规则查询  |

### 3.4 通用

| 方法  | 路径               | 说明           |
| --- | ---------------- | ------------ |
| GET | `/points/config` | 积分系统全局配置（只读） |

***

## 四、开放 API

基础路径：`/api/open`

### 4.1 认证

| 方法   | 路径            | 说明               |
| ---- | ------------- | ---------------- |
| POST | `/auth/token` | 获取 access\_token |

### 4.2 积分发放

| 方法   | 路径                    | 说明     |
| ---- | --------------------- | ------ |
| POST | `/points/grant`       | 单笔发放积分 |
| POST | `/points/grant/batch` | 批量发放积分 |

### 4.3 积分查询

| 方法  | 路径                      | 说明         |
| --- | ----------------------- | ---------- |
| GET | `/points/balance/{uid}` | 查询用户积分余额   |
| GET | `/points/ledger`        | 查询用户流水     |
| GET | `/merchant/quota`       | 查询外部商户自身额度 |

### 4.4 积分抵扣

| 方法   | 路径                      | 说明     |
| ---- | ----------------------- | ------ |
| POST | `/points/deduct`        | 扣减用户积分 |
| POST | `/points/deduct/refund` | 积分扣减退款 |

### 4.5 回调通知（我方 → 外部）

| 方法   | 路径                            | 说明     |
| ---- | ----------------------------- | ------ |
| POST | `{callbackUrl}/points-change` | 积分变动通知 |

