import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '../layout/MainLayout.vue'
import DashboardHome from '../views/DashboardHome.vue'
import ProductManage from '../views/ProductManage.vue'
import ProductPublish from '../views/ProductPublish.vue'
import FreightManage from '../views/FreightManage.vue'
import FreightPublish from '../views/FreightPublish.vue'
import ReservationProjectManage from '../views/ReservationProjectManage.vue'
import ReservationProjectPublish from '../views/ReservationProjectPublish.vue'
import ReservationBoard from '../views/ReservationBoard.vue'
import VoteManage from '../views/VoteManage.vue'
import VotePublish from '../views/VotePublish.vue'
import VoteOptionManage from '../views/VoteOptionManage.vue'
import VoteResult from '../views/VoteResult.vue'
import OrderManage from '../views/OrderManage.vue'
import PointsManagement from '../views/PointsManagement.vue'
import UserWallet from '../views/UserWallet.vue'
import WalletLayout from '../layout/WalletLayout.vue'
import WalletOverview from '../views/wallet/WalletOverview.vue'
import WalletConfig from '../views/wallet/WalletConfig.vue'
import MerchantSign from '../views/wallet/MerchantSign.vue'
import RechargePlan from '../views/wallet/RechargePlan.vue'
import WalletUser from '../views/wallet/WalletUser.vue'
import TransactionLedger from '../views/wallet/TransactionLedger.vue'
import RechargeManage from '../views/wallet/RechargeManage.vue'
import WithdrawManage from '../views/wallet/WithdrawManage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: MainLayout,
      children: [
        {
          path: '',
          name: 'dashboard-home',
          component: DashboardHome,
        },
        {
          path: 'product',
          name: 'product-manage',
          component: ProductManage,
        },
        {
          path: 'publish',
          name: 'product-publish',
          component: ProductPublish,
        },
        {
          path: 'freight',
          name: 'freight-manage',
          component: FreightManage,
        },
        {
          path: 'freight/publish',
          name: 'freight-publish',
          component: FreightPublish,
        },
        {
          path: 'reservation',
          name: 'reservation-manage',
          component: ReservationProjectManage,
        },
        {
          path: 'reservation/publish',
          name: 'reservation-publish',
          component: ReservationProjectPublish,
        },
        {
          path: 'reservation/board',
          name: 'reservation-board',
          component: ReservationBoard,
        },
        {
          path: 'vote',
          name: 'vote-manage',
          component: VoteManage,
        },
        {
          path: 'vote/publish',
          name: 'vote-publish',
          component: VotePublish,
        },
        {
          path: 'vote/options/:id',
          name: 'vote-options',
          component: VoteOptionManage,
        },
        {
          path: 'vote/result/:id',
          name: 'vote-result',
          component: VoteResult,
        },
        {
          path: 'order',
          name: 'order-manage',
          component: OrderManage,
        },
        {
          path: 'points',
          name: 'points-management',
          component: PointsManagement,
        },
        {
          path: 'wallet',
          component: WalletLayout,
          children: [
            { path: '', redirect: { name: 'wallet-overview' } },
            { path: 'overview', name: 'wallet-overview', component: WalletOverview },
            { path: 'config', name: 'wallet-config', component: WalletConfig },
            { path: 'merchant-sign', name: 'wallet-merchant-sign', component: MerchantSign },
            { path: 'recharge-plan', name: 'wallet-recharge-plan', component: RechargePlan },
            { path: 'user', name: 'wallet-user', component: WalletUser },
            { path: 'ledger', name: 'wallet-ledger', component: TransactionLedger },
            { path: 'recharge', name: 'wallet-recharge', component: RechargeManage },
            { path: 'withdraw', name: 'wallet-withdraw', component: WithdrawManage },
          ],
        },
      ],
    },
  ],
})

export default router
