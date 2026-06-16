# 积分系统 API 接口文档

> 版本：v1.1\
> 日期：2026-06-10\
> 适用范围：平台管理端 / 商户端 / 用户端 / 开放 API

***

## 目录

- [通用约定](#通用约定)
- [一、平台管理端 API](#一平台管理端-api)
- [二、内部商户手机端 API](#二内部商户手机端-api)
- [三、用户端（商城小程序）API](#三用户端商城小程序-api)
- [四、开放 API](#四开放-api)
- [通用数据模型](#通用数据模型)
- [架构总览](#架构总览)

***

## 通用约定

### 请求头

| Header          | 说明                                | 必填 |
| --------------- | --------------------------------- | -- |
| `Content-Type`  | `application/json`                | 是  |
| `Authorization` | Bearer token（管理端/商户/用户）或签名（开放API） | 是  |

### 通用响应格式

```json
{
  "code": 0,
  "message": "success",
  "data": {},
  "traceId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

| 字段        | 类型     | 说明          |
| --------- | ------ | ----------- |
| `code`    | int    | 0=成功，非0=错误码 |
| `message` | string | 提示信息        |
| `data`    | object | 业务数据        |
| `traceId` | string | 链路追踪ID      |

### 分页请求参数

| 参数         | 类型  | 默认值 | 说明   |
| ---------- | --- | --- | ---- |
| `page`     | int | 1   | 页码   |
| `pageSize` | int | 20  | 每页条数 |

### 分页响应格式

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [],
    "total": 100,
    "page": 1,
    "pageSize": 20
  }
}
```

### 错误码

| code  | message             | 说明            |
| ----- | ------------------- | ------------- |
| 0     | success             | 成功            |
| 400   | bad request         | 请求参数错误        |
| 401   | unauthorized        | 未认证/Token过期   |
| 403   | forbidden           | 无权限           |
| 404   | not found           | 资源不存在         |
| 429   | too many requests   | 请求频率超限        |
| 10001 | points insufficient | 积分余额不足        |
| 10002 | quota exhausted     | 商户额度耗尽        |
| 10003 | batch expired       | 批次已过期/停用      |
| 20001 | signature invalid   | 签名验证失败（开放API） |
| 20002 | idempotent conflict | 幂等冲突          |

***

## 一、平台管理端 API

> **调用方**：后台管理员/运营人员\
> **鉴权**：管理员账号密码 + RBAC 权限\
> **基础路径**：`/api/admin`

***

### 1.1 积分配置

#### GET /api/admin/points/config — 查询积分配置

**Response** **`data`**：

```json
{
  "name": "平台通用积分",
  "code": "PTS-20260604-001",
  "exchangeRate": 100,
  "validityType": "dynamic",
  "dynamicDays": 365,
  "yearlyClearDate": "12-31",
  "updatedAt": "2026-06-10 14:30:00",
  "updatedBy": "张三"
}
```

| 字段                | 类型     | 说明                                  |
| ----------------- | ------ | ----------------------------------- |
| `name`            | string | 积分名称                                |
| `code`            | string | 积分编码（系统自动生成）                        |
| `exchangeRate`    | int    | 汇率，N积分=1元                           |
| `validityType`    | string | `forever`永久 `dynamic`动态 `yearly`自然年 |
| `dynamicDays`     | int    | 动态有效期天数                             |
| `yearlyClearDate` | string | 自然年清零日期（MM-dd）                      |

#### PUT /api/admin/points/config — 修改积分配置

**Request**：

```json
{
  "name": "平台通用积分",
  "exchangeRate": 100,
  "validityType": "dynamic",
  "dynamicDays": 365,
  "yearlyClearDate": "12-31"
}
```

**Response** **`data`**：更新后的配置对象

#### GET /api/admin/points/config/history — 配置修改记录

**Response** **`data`**：

```json
{
  "list": [
    {
      "id": 1,
      "operator": "张三",
      "operateTime": "2026-06-10 14:30:00",
      "snapshot": {
        "name": "平台通用积分",
        "code": "PTS-20260604-001",
        "exchangeRate": 100,
        "validityType": "dynamic",
        "dynamicDays": 365,
        "yearlyClearDate": "12-31"
      }
    }
  ],
  "total": 3
}
```

***

### 1.2 积分批次

#### POST /api/admin/batch/create — 新建批次

**Request**：

```json
{
  "merchantId": "M001",
  "batchName": "2026年618大促批次",
  "validityType": "inherit",
  "validDays": 365,
  "yearlyClearDate": "12-31",
  "totalPoints": 100000,
  "remark": "618活动专用"
}
```

| 字段                | 类型     | 必填 | 说明                                                |
| ----------------- | ------ | -- | ------------------------------------------------- |
| `merchantId`      | string | 是  | 所属商户ID                                            |
| `batchName`       | string | 是  | 批次名称                                              |
| `validityType`    | string | 是  | `inherit`继承商户 `forever`永久 `dynamic`动态 `yearly`自然年 |
| `validDays`       | int    | 否  | 动态有效天数                                            |
| `yearlyClearDate` | string | 否  | 自然年清零日                                            |
| `totalPoints`     | int    | 否  | 批次总额度上限                                           |
| `remark`          | string | 否  | 备注                                                |

#### PUT /api/admin/batch/status — 启用/停用批次

**Request**：

```json
{
  "batchId": "BATCH-20260603-001",
  "status": "disabled"
}
```

#### GET /api/admin/batch/list — 批次列表

**Query 参数**：

| 参数             | 类型     | 说明                  |
| -------------- | ------ | ------------------- |
| `merchantName` | string | 商户名称模糊搜索            |
| `status`       | string | `active` `disabled` |
| `page`         | int    | 页码                  |
| `pageSize`     | int    | 每页条数                |

**Response** **`data`**：

```json
{
  "list": [
    {
      "id": "BATCH-20260603-001",
      "batchNo": "BATCH-20260603-001",
      "merchantName": "总部直营店",
      "batchName": "2026年6月通用批次",
      "issuedPoints": 50000,
      "totalPoints": 100000,
      "validityType": "dynamic",
      "validDays": 365,
      "yearlyClearDate": "",
      "status": "active",
      "createTime": "2026-06-03"
    }
  ],
  "total": 10,
  "page": 1,
  "pageSize": 20
}
```

***

### 1.3 商户签约

#### POST /api/admin/merchant/sign — 商户签约

**Request**：

```json
{
  "merchantName": "总部直营店",
  "contactPerson": "张三",
  "contactPhone": "13800138000",
  "signDate": "2026-06-01",
  "remark": ""
}
```

#### PUT /api/admin/merchant/terminate — 解约

**Request**：

```json
{
  "merchantId": "M001",
  "terminateReason": "合作到期"
}
```

#### GET /api/admin/merchant/list — 商户列表

**Query**：`keyword`、`status`（`active`/`terminated`）、分页

**Response**：

```json
{
  "list": [
    {
      "id": "M001",
      "merchantName": "总部直营店",
      "contactPerson": "张三",
      "contactPhone": "138****1234",
      "signDate": "2026-06-01",
      "status": "active",
      "terminateTime": null
    }
  ]
}
```

***

### 1.4 额度管理

#### POST /api/admin/quota/recharge — 额度充值

**Request**：

```json
{
  "merchantId": "M001",
  "amount": 50000,
  "rechargeType": "buy",
  "payMethod": "transfer",
  "payAmount": 5000.0,
  "remark": "6月额度充值"
}
```

| 字段             | 类型     | 必填    | 说明                                 |
| -------------- | ------ | ----- | ---------------------------------- |
| `rechargeType` | string | 是     | `buy`购买 `gift`赠送                   |
| `payMethod`    | string | 购买时必填 | `cash`现金 `transfer`转账 `online`线上付款 |
| `payAmount`    | number | 购买时必填 | 实际支付金额（元）                          |

#### POST /api/admin/quota/recycle — 额度回收

**Request**：

```json
{
  "merchantId": "M001",
  "amount": 10000,
  "remark": "回收未使用额度"
}
```

#### PUT /api/admin/quota/finance-confirm — 财务确认

财务确认弹窗支持对**一条额度记录**进行以下两项独立操作（可同时操作）：

| 操作      | 字段             | 变更流程                                 | 说明         |
| ------- | -------------- | ------------------------------------ | ---------- |
| 支付确认    | `payStatus`    | `unpaid` → `paid`                    | 标记支付状态为已支付 |
| 变更确认/拒绝 | `changeStatus` | `pending` → `completed` 或 `rejected` | 确认或拒绝额度变更  |

**Request**：

```json
{
  "recordId": "QR-20260610-001",
  "payStatus": "paid",
  "changeStatus": "completed"
}
```

| 字段             | 类型     | 必填 | 说明                                                     |
| -------------- | ------ | -- | ------------------------------------------------------ |
| `recordId`     | string | 是  | 额度变更记录ID                                               |
| `payStatus`    | string | 否  | `paid`标记已支付（仅当当前状态为`unpaid`时可操作）                       |
| `changeStatus` | string | 否  | `completed`确认变更 / `rejected`拒绝变更（仅当当前状态为`pending`时可操作） |

> 两项参数可同时传，也可只传其中一项单独操作。

#### GET /api/admin/quota/list — 额度变更记录

**Query**：`merchantName`、`action`（`recharge`充值/`recycle`回收）、`changeStatus`、分页

**Response**：

```json
{
  "list": [
    {
      "recordNo": "QR-20260610-001",
      "merchantName": "总部直营店",
      "action": "recharge",
      "rechargeType": "buy",
      "amount": 50000,
      "payAmount": 5000.0,
      "payMethod": "transfer",
      "payStatus": "paid",
      "changeStatus": "completed",
      "source": "platform",
      "operator": "admin",
      "operateTime": "2026-06-10 10:00:00",
      "remark": "Q2季度额度采购"
    }
  ]
}
```

#### 额度相关枚举

| 枚举             | 值                                    | 说明              |
| -------------- | ------------------------------------ | --------------- |
| `action`       | `recharge` / `recycle`               | 充值 / 回收         |
| `rechargeType` | `buy` / `gift`                       | 购买 / 赠送         |
| `payMethod`    | `cash` / `transfer` / `online`       | 现金 / 转账 / 线上付款  |
| `payStatus`    | `unpaid` / `paid`                    | 未支付 / 已支付       |
| `changeStatus` | `pending` / `completed` / `rejected` | 待变更 / 已变更 / 已拒绝 |
| `source`       | `platform` / `merchant`              | 平台操作 / 商户操作     |

***

### 1.5 用户余额

#### GET /api/admin/user/balance — 用户余额列表

**Query**：`keyword`（UID/手机号）、分页

**Response**：

```json
{
  "list": [
    {
      "uid": "U10001",
      "phone": "138****1234",
      "currentPoints": 2350,
      "expiringPoints": 150,
      "totalEarned": 5200,
      "totalBurned": 2850
    }
  ]
}
```

#### GET /api/admin/user/ledger/{uid} — 用户积分流水

**Query**：`direction`（`earn`/`burn`）、`startDate`、`endDate`、分页

**Response**：

```json
{
  "list": [
    {
      "id": "L001",
      "type": "earn",
      "reason": "activity",
      "reasonDetail": "618活动奖励",
      "amount": 200,
      "balance": 2350,
      "batch": "BATCH-20260603-001",
      "userUid": "U10001",
      "userPhone": "138****1234",
      "merchant": "总部直营店",
      "operator": "系统",
      "orderNo": "ORD-20260603-001",
      "expireTime": "2027-06-03",
      "time": "2026-06-03 15:30:00"
    }
  ]
}
```

***

### 1.6 积分变更

#### POST /api/admin/points/change — 后台积分变更

**Request**：

```json
{
  "userUid": "U10001",
  "changeType": "issue",
  "batchId": "BATCH-20260603-001",
  "amount": 500,
  "reasonType": "manual",
  "reasonDetail": "运营手动补发"
}
```

| 字段           | 类型     | 必填   | 说明                   |
| ------------ | ------ | ---- | -------------------- |
| `changeType` | string | 是    | `issue`发放 `deduct`扣除 |
| `batchId`    | string | 发放必填 | 所属批次，扣除时无需           |
| `reasonType` | string | 是    | 原因编码                 |

#### GET /api/admin/points/change/list — 变更流水

**Query**：

| 参数           | 类型     | 说明                           |
| ------------ | ------ | ---------------------------- |
| `keyword`    | string | 手机号/UID搜索                    |
| `changeType` | string | 筛选：`issue`发放 `deduct`扣除，空=全部 |
| `merchant`   | string | 来源商户                         |
| `startDate`  | string | 开始日期                         |
| `endDate`    | string | 结束日期                         |

**Response**：

```json
{
  "list": [
    {
      "id": "D001",
      "type": "earn",
      "userUid": "U10001",
      "userPhone": "138****1234",
      "changeType": "issue",
      "reason": "manual",
      "reasonDetail": "运营手动补发",
      "amount": 500,
      "balance": 2850,
      "merchant": "总部直营店",
      "batch": "BATCH-20260603-001",
      "orderNo": "",
      "operator": "张三",
      "time": "2026-06-10 14:00:00",
      "expireTime": "2027-06-10"
    }
  ]
}
```

***

### 1.7 积分流水

#### GET /api/admin/ledger/list — 全局积分流水

**Query**：

| 参数            | 类型        | 说明                |
| ------------- | --------- | ----------------- |
| `userKeyword` | string    | 手机号/UID搜索         |
| `merchant`    | string    | 商户筛选              |
| `direction`   | string    | `earn`发放 `burn`消耗 |
| `type`        | string\[] | 流水类型筛选            |
| `startDate`   | string    | 开始日期              |
| `endDate`     | string    | 结束日期              |
| `batchId`     | string    | 关联批次              |

**Response**：

```json
{
  "list": [
    {
      "id": "L001",
      "type": "earn",
      "reason": "activity",
      "reasonDetail": "618大促活动",
      "amount": 200,
      "balance": 2350,
      "merchant": "总部直营店",
      "batch": "BATCH-20260603-001",
      "userUid": "U10001",
      "userPhone": "138****1234",
      "operator": "系统",
      "orderNo": "ORD-20260603-001",
      "expireTime": "2027-06-03",
      "time": "2026-06-03 15:30:00"
    }
  ]
}
```

#### POST /api/admin/ledger/export — 导出报表

**Query**：同上筛选条件\
**Response**：文件流（CSV/Excel）

## 二、迅收银 API

> **调用方**：商户店员/店长\
> **鉴权**：商户账号登录 + JWT\
> **基础路径**：`/api/merchant`

***

### 2.1 积分发放

#### POST /api/merchant/points/grant — 发放积分

**Request**：

```json
{
  "searchUserType": "uid",
  "searchKeyword": "U10001",
  "batchId": "BATCH-20260603-001",
  "amount": 200,
  "reason": "purchase_gift",
  "reasonDetail": "满1000赠200积分"
}
```

#### GET /api/merchant/points/batch-list — 可用批次

**Response**：

```json
{
  "list": [
    {
      "id": "BATCH-20260603-001",
      "batchName": "2026年6月通用批次",
      "merchantName": "总部直营店",
      "issuedPoints": 50000,
      "totalPoints": 100000
    }
  ]
}
```

#### GET /api/merchant/points/balance — 商户额度查询

**Response**：

```json
{
  "totalAmount": 200000,
  "usedAmount": 85000,
  "remainAmount": 115000
}
```

***

### 2.2 积分抵扣

#### POST /api/merchant/points/deduct — 抵扣积分

**Request**：

```json
{
  "userUid": "U10001",
  "orderNo": "ORD-20260610-001",
  "deductPoints": 150,
  "reason": "consume",
  "reasonDetail": "订单#2026061001消费抵扣"
}
```

**Response**：

```json
{
  "deductId": "DEDUCT-20260610-001",
  "deductPoints": 150,
  "balanceAfter": 2200,
  "orderNo": "ORD-20260610-001"
}
```

#### POST /api/merchant/points/deduct/rollback — 撤销抵扣

**Request**：

```json
{
  "deductId": "DEDUCT-20260610-001",
  "orderNo": "ORD-20260610-001",
  "reason": "order_cancel"
}
```

***

### 2.3 流水查询

#### GET /api/merchant/ledger/issue — 发放流水

**Query**：`startDate`、`endDate`、分页

#### GET /api/merchant/ledger/consume — 抵扣流水

**Query**：同上

#### GET /api/merchant/ledger/overview — 商户概览

**Response**：

```json
{
  "totalIssued": 350000,
  "totalConsumed": 180000,
  "remainingQuota": 170000,
  "todayIssued": 5000,
  "todayConsumed": 2000
}
```

#### GET /api/merchant/ledger/summary — 商户流水摘要（弹窗头部展示）

**Response**：

```json
{
  "merchantName": "总部直营店",
  "totalIssued": 350000,
  "totalConsumed": 180000,
  "remainingQuota": 170000
}
```

***

### 2.4 用户查询

#### GET /api/merchant/user/search — 搜索用户

**Query**：`keyword`（手机号/UID）

**Response**：

```json
{
  "list": [
    {
      "uid": "U10001",
      "phone": "138****1234",
      "currentPoints": 2350,
      "expiringPoints": 150
    }
  ]
}
```

#### GET /api/merchant/user/points — 查询用户积分

**Query**：`uid`

**Response**：

```json
{
  "uid": "U10001",
  "phone": "138****1234",
  "currentPoints": 2350,
  "expiringPoints": 150,
  "totalEarned": 5200,
  "totalBurned": 2850
}
```

***

## 三、用户端（商城小程序）API

> **调用方**：普通用户\
> **鉴权**：微信登录 + 用户 token\
> **基础路径**：`/api/user`

***

### 3.1 积分查询

#### GET /api/user/points/balance — 我的积分

**Response**：

```json
{
  "currentPoints": 2350,
  "expiringPoints": 150,
  "totalEarned": 5200,
  "totalBurned": 2850,
  "expireDate": "2026-07-10"
}
```

#### GET /api/user/points/ledger — 我的流水

**Query**：`direction`（`earn`发放 `burn`消耗）、`page`、`pageSize`

**Response**：

```json
{
  "list": [
    {
      "id": "L001",
      "type": "earn",
      "reason": "activity",
      "reasonDetail": "618大促活动",
      "amount": 200,
      "balance": 2350,
      "merchant": "总部直营店",
      "batch": "BATCH-20260603-001",
      "orderNo": "ORD-20260603-001",
      "time": "2026-06-03 15:30:00"
    }
  ],
  "total": 20
}
```

> 为用户展示时附带批次和订单号，方便对账

#### GET /api/user/points/user-info — 用户积分信息摘要（弹窗头部展示）

**Response**：

```json
{
  "uid": "U10001",
  "phone": "138****1234",
  "currentPoints": 2350
}
```

#### GET /api/user/points/expiring — 即将过期

**Response**：

```json
{
  "expiringPoints": 150,
  "expireDate": "2026-07-10",
  "tips": "您有150积分即将在30天后过期，快去使用吧！"
}
```

***

### 3.2 积分获取

#### POST /api/user/points/earn — 通用获取入口

**Request**：

```json
{
  "source": "sign",
  "sourceId": "",
  "amount": 10
}
```

#### POST /api/user/points/earn/sign — 签到领积分

**Response**：

```json
{
  "earnedPoints": 10,
  "currentPoints": 2360,
  "continuousDays": 5,
  "bonusTips": "连续签到5天，明日签到可获20积分"
}
```

#### POST /api/user/points/earn/activity — 活动获取

**Request**：

```json
{
  "activityId": "ACT-20260601-001"
}
```

#### POST /api/user/points/earn/photo — 拍照获取

**Request**：

```json
{
  "photoTaskId": "PHOTO-20260610-001",
  "photoUrls": ["https://cdn.example.com/photo1.jpg"]
}
```

***

### 3.3 积分抵扣

#### POST /api/user/points/deduct/calculate — 计算可抵扣金额

**Request**：

```json
{
  "merchantId": "M001",
  "orderAmount": 100.0
}
```

**Response**：

```json
{
  "userPoints": 2350,
  "maxDeductPoints": 1000,
  "maxDeductAmount": 10.0,
  "exchangeRate": 100,
  "deductRateLimit": 0.3,
  "tips": "本次最多可抵扣¥10.00（1000积分）"
}
```

#### POST /api/user/points/deduct — 下单抵扣

**Request**：

```json
{
  "merchantId": "M001",
  "orderNo": "ORD-20260610-001",
  "deductPoints": 500,
  "orderAmount": 100.0
}
```

**Response**：

```json
{
  "deductId": "DEDUCT-20260610-001",
  "deductPoints": 500,
  "deductAmount": 5.0,
  "balanceAfter": 1850,
  "payAmount": 95.0
}
```

#### POST /api/user/points/deduct/rollback — 退款退回

**Request**：

```json
{
  "orderNo": "ORD-20260610-001",
  "refundType": "full"
}
```

#### GET /api/user/points/deduct/rules — 抵扣规则

**Response**：

```json
{
  "exchangeRate": 100,
  "maxDeductRate": 0.3,
  "minDeductPoints": 100,
  "maxDeductPoints": 50000
}
```

***

### 3.4 通用

#### GET /api/user/points/config — 系统配置（只读）

**Response**：

```json
{
  "name": "平台通用积分",
  "exchangeRate": 100
}
```

> 用户端仅暴露积分名称和汇率，不暴露有效期策略等管理端信息

***

## 四、开放 API

> **调用方**：第三方外部系统（服务器到服务器）\
> **鉴权**：appKey + appSecret 签名\
> **基础路径**：`/api/open`

***

### 4.1 认证

#### POST /api/open/auth/token — 获取 access\_token

**Request**：

```json
{
  "appKey": "APP_KEY_001",
  "appSecret": "your-app-secret",
  "grantType": "client_credentials"
}
```

**Response**：

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 7200,
  "tokenType": "Bearer"
}
```

***

### 4.2 积分发放

#### POST /api/open/points/grant — 单笔发放

**Request**：

```json
{
  "merchantId": "M001",
  "userIdentify": {
    "type": "uid",
    "value": "U10001"
  },
  "amount": 500,
  "batchId": "BATCH-20260603-001",
  "externalOrderNo": "EXT-ORD-20260610-001",
  "reason": "external_grant",
  "reasonDetail": "外部系统积分赠送",
  "idempotentKey": "uuid-xxxxxxxx"
}
```

| 字段                | 说明                   |
| ----------------- | -------------------- |
| `userIdentify`    | 用户标识，支持uid/phone两种类型 |
| `externalOrderNo` | 外部系统订单号（用于对账）        |
| `idempotentKey`   | 幂等键，防止重复发放           |

**Response**：

```json
{
  "grantId": "GRANT-OPEN-20260610-001",
  "amount": 500,
  "balanceAfter": 2850,
  "externalOrderNo": "EXT-ORD-20260610-001"
}
```

#### POST /api/open/points/grant/batch — 批量发放

**Request**：

```json
{
  "merchantId": "M001",
  "batchId": "BATCH-20260603-001",
  "items": [
    {
      "userIdentify": { "type": "uid", "value": "U10001" },
      "amount": 500,
      "externalOrderNo": "EXT-ORD-001"
    },
    {
      "userIdentify": { "type": "phone", "value": "138****1234" },
      "amount": 300,
      "externalOrderNo": "EXT-ORD-002"
    }
  ],
  "reason": "external_grant",
  "idempotentKey": "uuid-yyyyyyyy"
}
```

**Response**：

```json
{
  "successCount": 2,
  "failCount": 0,
  "results": [
    { "externalOrderNo": "EXT-ORD-001", "success": true, "grantId": "GRANT-001" },
    { "externalOrderNo": "EXT-ORD-002", "success": true, "grantId": "GRANT-002" }
  ]
}
```

***

### 4.3 积分查询

#### GET /api/open/points/balance/{uid} — 查询用户余额

**Response**：

```json
{
  "uid": "U10001",
  "currentPoints": 2350,
  "expiringPoints": 150,
  "expireDate": "2026-07-10"
}
```

#### GET /api/open/points/ledger — 查询用户流水

**Query**：`uid`、`startTime`、`endTime`、`page`、`pageSize`

**Response**：同用户流水结构

#### GET /api/open/merchant/quota — 查询商户额度

**Response**：

```json
{
  "merchantId": "M001",
  "merchantName": "外部合作商户",
  "totalAmount": 500000,
  "usedAmount": 120000,
  "remainAmount": 380000
}
```

***

### 4.4 积分抵扣

#### POST /api/open/points/deduct — 扣减积分

**Request**：

```json
{
  "merchantId": "M001",
  "userIdentify": { "type": "uid", "value": "U10001" },
  "amount": 200,
  "externalOrderNo": "EXT-DEDUCT-001",
  "reason": "external_consume",
  "idempotentKey": "uuid-zzzzzzzz"
}
```

#### POST /api/open/points/deduct/refund — 扣减退款

**Request**：

```json
{
  "merchantId": "M001",
  "externalOrderNo": "EXT-DEDUCT-001",
  "refundAmount": 200,
  "idempotentKey": "uuid-wwwwwwww"
}
```

***

### 4.5 回调通知（我方 → 外部）

#### POST {external.callbackUrl}/points-change

我方推送至外部系统注册的回调地址：

```json
{
  "eventType": "points_change",
  "merchantId": "M001",
  "userUid": "U10001",
  "changeType": "earn",
  "amount": 500,
  "balanceAfter": 2850,
  "externalOrderNo": "EXT-ORD-20260610-001",
  "changeTime": "2026-06-10 14:30:00",
  "signature": "sha256-signature"
}
```

***

### 4.6 签名规范

开放 API 的请求需要在 Header 中携带：

| Header        | 说明         |
| ------------- | ---------- |
| `X-App-Key`   | 分配的 appKey |
| `X-Timestamp` | 当前时间戳（毫秒）  |
| `X-Nonce`     | 随机字符串      |
| `X-Signature` | 签名         |

签名算法：

```
signString = appKey + timestamp + nonce + requestBody
signature = HMAC-SHA256(signString, appSecret)
```

响应 header 中 `X-Trace-Id` 用于问题追踪。

***

## 通用数据模型

### 积分流水类型（type）

| 值      | 说明     |
| ------ | ------ |
| `earn` | 发放（收入） |
| `burn` | 消耗（支出） |

### 积分变更类型（changeType）

| 值        | 说明 |
| -------- | -- |
| `issue`  | 发放 |
| `deduct` | 扣除 |

### 积分原因（reason）

| 值                    | 说明     | 适用场景        |
| -------------------- | ------ | ----------- |
| `manual`             | 手动发放   | 后台/商户手动操作   |
| `activity`           | 活动奖励   | 活动配置发放      |
| `complaint`          | 客诉补偿   | 客服操作        |
| `supplement`         | 补发     | 异常补发        |
| `sign`               | 签到获取   | 用户签到        |
| `consume`            | 消费抵扣   | 下单扣减        |
| `refund`             | 退款退回   | 退单回退        |
| `expire`             | 过期回收   | 自然年/有效期到期清零 |
| `deduct`             | 手动扣除   | 手动扣除积分      |
| `manual_deduct`      | 手动扣除   | 异常扣减        |
| `fraud_recovery`     | 异常交易回收 | 风控回收        |
| `duplicate_recovery` | 重复发放回收 | 重复发放纠正      |
| `photo`              | 拍照获取   | 拍照任务        |
| `external_grant`     | 外部发放   | 开放API       |
| `external_consume`   | 外部抵扣   | 开放API       |

### 有效期策略（validityType）

| 值         | 说明        |
| --------- | --------- |
| `forever` | 永久有效      |
| `dynamic` | 动态有效期（按天） |
| `yearly`  | 自然年清零     |
| `inherit` | 继承商户配置    |

### 批次状态（batch.status）

| 值          | 说明  |
| ---------- | --- |
| `active`   | 启用  |
| `disabled` | 已停用 |

***

## 架构总览

```
┌──────────────────────────────────────────────────────────────────┐
│                         API Gateway                              │
│     /api/admin/*     /api/merchant/*    /api/user/*   /api/open/*│
├──────────────────────────────────────────────────────────────────┤
│                         认证层                                    │
│   管理员 RBAC    │   商户 JWT    │   用户 Token    │   签名鉴权     │
├──────────────────────────────────────────────────────────────────┤
│                      Controller 层                                │
│  PointsConfigCtl │  MerchantCtl  │  UserCtl      │  OpenCtl      │
│  BatchCtl        │  GrantCtl     │  DeductCtl    │  AuthCtl      │
│  QuotaCtl        │  LedgerCtl    │               │  CallbackCtl  │
│  LedgerCtl       │               │               │               │
├──────────────────────────────────────────────────────────────────┤
│                       Service 层（复用）                           │
│  PointsService  │  LedgerService  │  QuotaService  │  Config       │
│  BatchService   │  UserService    │  MerchantSign  │               │
├──────────────────────────────────────────────────────────────────┤
│                       DAO / 数据层                                 │
│  points_config  │  points_batch  │  points_ledger  │  merchant    │
│  merchant_quota │  quota_record  │  user_account   │  sign_record │
│  config_history │                │                 │              │
└──────────────────────────────────────────────────────────────────┘
```

***

### 总计

| 端         | 接口数量   |
| --------- | ------ |
| 平台管理端 API | 21     |
| 内部商户端 API | 11     |
| 用户端 API   | 13     |
| 开放 API    | 9      |
| **合计**    | **54** |

