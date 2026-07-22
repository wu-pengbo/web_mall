
| 2026-07-01 18:58 | commit | feature/wallet-optimization | style: 冻结流水区块移入modal-body，左右留白对齐表单 | e5ec0d1 |

| 2026-07-02 14:43 | commit | feature/wallet-optimization | fix: PointsManagement积分变更流水新增5条mock数据覆盖全类型全原因 | 61d049c |

| 2026-07-02 15:02 | commit | feature/wallet-optimization | feat: 额度管理新增过期回滚类型，表格加备注列 | b302437 |

| 2026-07-02 15:22 | commit | feature/wallet-optimization | feat: 提现设置新增提现方式字段 | 0052e99 |

| 2026-07-02 15:29 | commit | feature/wallet-optimization | fix: 提现方式下拉修正，原充值订单退款可选，主商户账户分账disabled | 7ddbb2f |

| 2026-07-02 16:33 | commit | feature/wallet-optimization | feat: 提现管理表头和详情弹窗去掉提现类型、到账方式两列 | 16d1d24 |

| 2026-07-02 17:23 | commit | feature/wallet-optimization | feat: 查看详情弹窗提现流水表复用提现管理表字段 | 04663a1 |

| 2026-07-02 17:48 | checkout -b | feature/wallet-split | 从 main 创建拆分开发分支，准备 8 模块独立页面重构 | - |

| 2026-07-02 17:52 | commit | feature/wallet-split | feat: 提取共享类型定义到 src/types/wallet.ts | bb11769 |

| 2026-07-02 17:55 | commit | feature/wallet-split | feat: 提取共享商户列表到 src/data/wallet.ts | a99b7b1 |

| 2026-07-02 17:59 | commit | feature/wallet-split | feat: 提取钱包概览模块到 WalletOverview.vue | 69a25e9 |

| 2026-07-02 18:01 | commit | feature/wallet-split | feat: 提取钱包设置模块到 WalletConfig.vue | ea58568 |

| 2026-07-02 18:05 | commit | feature/wallet-split | feat: 提取充值方案模块到 RechargePlan.vue | 4d6f6ab |

| 2026-07-02 18:15 | commit | feature/wallet-split | feat: 路由+WalletLayout+MainLayout适配 | 3b51812 |

| 2026-07-02 18:28 | commit | feature/wallet-split | feat: 生成8个钱包模块的独立静态HTML文件 | 9315fdd |

| 2026-07-06 | merge | main | git merge feature/wallet-split（Fast-forward, 15 commits, 24 files） | e883f05 |

| 2026-07-06 | push | main | git push origin main（15 commits） | e883f05 |

| 2026-07-02 18:05 | commit | feature/wallet-split | feat: 提取商户签约模块到 MerchantSign.vue（含签约弹窗+收款流水） | 2888e19 |

| 2026-07-02 18:20 | commit | feature/wallet-split | docs: 更新操作日志 | 5cac13b |

| 2026-07-02 18:07 | commit | feature/wallet-split | feat: 提取交易流水模块到 TransactionLedger.vue | 5e5fa97 |

| 2026-07-02 18:08 | commit | feature/wallet-split | feat: 提取充值管理模块到 RechargeManage.vue | d530d55 |

| 2026-07-02 18:22 | commit | feature/wallet-split | fix: 抽取共享UI样式到 wallet-common.css | fd998b1 |

| 2026-07-02 18:28 | commit | feature/wallet-split | chore: 移除测试文件 | e883f05 |

| 2026-07-02 18:12 | commit | feature/wallet-split | feat: 提取用户钱包模块到 WalletUser.vue | e022faa |

| 2026-07-02 18:10 | commit | feature/wallet-split | feat: 提取提现管理模块到 WithdrawManage.vue | 7f64798 |

| 2026-07-06 | merge | main | git merge feature/wallet-split（提现管理表头重命名） | 9a3445e |

| 2026-07-06 | merge | main | git merge feature/wallet-split（提现流程重构：审核方式/自动执行/失败重试） | bf964b2 |

| 2026-07-06 | branch -d | main | 删除 feature/wallet-split（已合并到 main） | bf964b2 |

| 2026-07-16 09:53 | checkout -b | feature/freight-optimization | 从 main 创建开发分支，准备重构运费管理模块 | - |

| 2026-07-16 10:27 | commit | feature/freight-optimization | feat: 重构运费管理模块——提取共享类型/数据、地区选择弹窗、分页、表单校验 | 97a765e |

| 2026-07-16 10:35 | commit | feature/freight-optimization | docs: 更新运费模块开发操作日志 | 03c441b |

| 2026-07-16 10:52 | commit | feature/freight-optimization | feat: 运费模板v2——新增区域组/包邮规则/运费上限/不配送地区/按金额阶梯，5步表单 | 06ce132 |

| 2026-07-16 11:16 | commit | feature/freight-optimization | feat: 运费模板v3简化版——包邮优先三选一、默认运费+偏远加收、单页表单 | 727e4ab |

| 2026-07-16 11:29 | commit | feature/freight-optimization | style: 移除运费模块中的 emoji，使用 SVG 图标替代三卡片图标 | 61cc5f0 |

| 2026-07-16 11:35 | commit | feature/freight-optimization | style: 优化运费模板列表页排版——列宽分配、操作按钮间距、信息精简 | 59fa33e |

| 2026-07-16 11:45 | commit | feature/freight-optimization | feat: 运费模板计费方式新增「按金额」维度 | bcb806d |

| 2026-07-16 12:01 | commit | feature/freight-optimization | feat: 新增计费模式选择（首续费/固定运费），计费方式新增按金额 | f7d08f7 |

| 2026-07-16 12:35 | commit | feature/freight-optimization | feat: 运费模板大优化——动态表单、阶梯/固定计费、偏远合并、实时预览、字段重命名 | 0034502 |

| 2026-07-16 13:50 | commit | feature/freight-optimization | feat: 去掉硬编码偏远地区，改为默认运费+用户自定义地区运费 | 221c593 |

| 2026-07-16 14:22 | commit | feature/freight-optimization | feat: 运费模板按HTML重构——4种计费方式、默认+特殊规则、弹窗编辑、金额阶梯、地区冲突检测 | 2df914c |
| 2026-07-17 09:47 | commit | feature/freight-optimization | docs: 添加运费管理原型HTML(交互版) | 671caef |

| 2026-07-17 09:48 | push | feature/freight-optimization | git push origin feature/freight-optimization | 671caef |

| 2026-07-17 09:48 | push | feature/freight-optimization | git push github feature/freight-optimization | 671caef |

| 2026-07-17 10:25 | commit | feature/freight-optimization | feat: 运费模板增加模板ID字段显示 | 45a256d |

| 2026-07-17 10:25 | push | feature/freight-optimization | git push origin feature/freight-optimization | 45a256d |

| 2026-07-17 11:30 | commit | feature/freight-optimization | docs: PRD补充运费计算流程、拆单分摊方案，去掉多地址拆分，文件重命名 | 65b8e04 |

| 2026-07-17 08:35 | commit | feature/freight-optimization | fix: 首续计费说明完善+列表精简+弹窗分隔线+重量去单位+金额阶梯修复 | b8a0057 |

| 2026-07-17 08:36 | commit | feature/freight-optimization | style: 重量计费说明换行 | b31ee9e |
