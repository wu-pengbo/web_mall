import re, os

def strip_ts(script):
    out = []; in_if = False
    for line in script.split('\n'):
        s = line.strip()
        if s.startswith('interface '): in_if = True; continue
        if in_if:
            if s == '}': in_if = False
            continue
        if s.startswith('import '): continue
        out.append(line)
    return '\n'.join(out)

def extract(content, tag):
    m = re.search(r'<' + tag + r'[^>]*>(.*?)</' + tag + r'>', content, re.DOTALL)
    return m.group(1).strip() if m else ''

def gen(vue, out_path, title, keys):
    c = open(vue, encoding='utf-8').read()
    tmpl = extract(c, 'template')
    scr = extract(c, 'script')
    sty = extract(c, 'style').replace('scoped', '')
    scr = strip_ts(scr)
    ks = ', '.join(keys)
    ml = "createApp({ setup() { return { " + ks + " } } }).mount('#app')"
    nl = '\n'
    html = ('<!DOCTYPE html>' + nl +
        '<html lang="zh-CN">' + nl +
        '<head>' + nl +
        '<meta charset="UTF-8">' + nl +
        '<meta name="viewport" content="width=device-width, initial-scale=1.0">' + nl +
        '<title>' + title + '</title>' + nl +
        '<script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>' + nl +
        '<style>' + nl + COMMON_CSS + nl + sty + nl + '</style>' + nl +
        '</head><body>' + nl +
        '<div id="app">' + tmpl + '</div>' + nl +
        '<script>' + nl +
        'const { createApp, ref, reactive, computed } = Vue' + nl +
        scr + nl +
        ml + nl +
        '</script></body></html>')
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    open(out_path, 'w', encoding='utf-8').write(html)

COMMON_CSS = open('src/assets/wallet-common.css', encoding='utf-8').read()
OUT = '04_deliverables/wallet'

jobs = [
    ('src/views/wallet/WalletOverview.vue',   OUT+'/overview.html',      '钱包概览', ['mockOverviewStats','trendData','maxTrend','txTypeLabel','mockTransactions']),
    ('src/views/wallet/WalletConfig.vue',      OUT+'/config.html',        '钱包设置', ['walletConfig','configSaved','editingConfig','configBackup','startEditConfig','cancelEditConfig','saveConfig','configHistoryList','configHistoryExpandedId','configHistorySectionOpen','toggleConfigHistory']),
    ('src/views/wallet/MerchantSign.vue',      OUT+'/merchant-sign.html', '商户签约', ['signList','signFilter','signStatusOptions','filteredSignList','showSignModal','isEditSign','editingSignId','signForm','openSignModal','closeSignModal','handleAgreementUpload','submitSign','terminateSign','showSettlementModal','settlementMerchant','settlementTab','mockSettlementTx','settlementConsumeRecords','settlementRefundRecords','settlementTotalConsume','settlementTotalRefund','settlementNet','openSettlementFlow']),
    ('src/views/wallet/RechargePlan.vue',      OUT+'/recharge-plan.html', '充值方案', ['rechargePlans','planEditModal','planEditMode','planEditData','planDetailModal','planDetailId','activityEditModal','activityEditIndex','activityEditData','openPlanCreate','openPlanEdit','savePlan','togglePlanEnabled','deletePlan','addPreset','removePreset','movePresetUp','movePresetDown','openActivityCreate','openActivityEdit','saveActivity','removeActivity','planDetailData','openPlanDetail']),
    ('src/views/wallet/WalletUser.vue',        OUT+'/user.html',          '用户钱包', ['mockUserWallets','walletSearchForm','filteredWallets','userFlowModal','userFlowWallet','userFlowTxs','userFlowTab','userFlowExpandedTxId','toggleUserFlowBucket','txTypeLabel','mockTransactions','mockRechargeRecords','mockWithdrawRecords','withdrawStatusLabel','showUserFlow','freezeModal','freezeWalletTarget','freezeMode','freezeForm','freezeReasonOptions','unfreezeReasonOptions','showFreezeModal','confirmFreezeAction','freezeWallet','unfreezeWallet']),
    ('src/views/wallet/TransactionLedger.vue', OUT+'/ledger.html',        '交易流水', ['mockTransactions','txTypeLabel','ledgerSearchForm','filteredLedger','merchantOptions','txDetailModal','txDetailItem','showTxDetail']),
    ('src/views/wallet/RechargeManage.vue',    OUT+'/recharge.html',      '充值管理', ['mockRechargeRecords','rechargeSearchForm','filteredRecharges','rechargeDetailModal','rechargeDetailItem','showRechargeDetail','manualRecharge','rechargeFlowModal','rechargeFlowItem','rechargeFlowBuckets','showRechargeFlow','paymentStatusLabel','rechargeStatusLabel']),
    ('src/views/wallet/WithdrawManage.vue',    OUT+'/withdraw.html',      '提现管理', ['mockWithdrawRecords','withdrawSearchForm','filteredWithdraws','withdrawDetailModal','withdrawDetailItem','showWithdrawDetail','withdrawStatusLabel','approveWithdraw','confirmRefund','rejectWithdraw']),
]

for path, out, title, keys in jobs:
    print('Generating ' + os.path.basename(out) + '...')
    gen(path, out, title, keys)
print('All done.')
for f in sorted(os.listdir(OUT)):
    print(f'  {f}: {os.path.getsize(os.path.join(OUT, f))} bytes')
print(f'Total: {len(os.listdir(OUT))} files')
