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
          name: 'user-wallet',
          component: UserWallet,
        },
      ],
    },
  ],
})

export default router
