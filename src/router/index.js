import Vue from 'vue'
import VueRouter from 'vue-router'

import Login from 'views/login/Login'

import Home from 'views/home/Home'
import Welcome from 'views/home/Welcome'

import Users from 'views/users/Users'

import Rights from 'views/power/Rights'
import Roles from 'views/power/Roles'

import Cate from 'views/goods/Cate'
import Params from 'views/goods/Params'
import GoodsList from 'views/goods/GoodsList'
import AddGoods from 'views/goods/AddGoods'
import EditorGoods from 'views/goods/EditorGoods'

import Order from 'views/order/Order'

import Report from 'views/report/Report'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      {
      path: '/welcome',
      component: Welcome
      },
      {
        path: '/users',
        component: Users
      },
      {
        path: '/rights',
        component:Rights
      },
      {
        path: '/roles',
        component:Roles
      },
      {
        path: '/categories',
        component:Cate
      },
      {
        path: '/params',
        component:Params
      },
      {
        path: '/goods',
        component:GoodsList
      },
      {
        path: '/goods/add',
        component:AddGoods
      },
      {
        path: '/goods/edit',
        component:EditorGoods
      },
      {
        path: '/orders',
        component:Order
      },
      {
        path: '/reports',
        component:Report
      }
    ]
  }
]

const router = new VueRouter({
  routes
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // to 将要访问的路径
  // from 代表从哪个路径跳转而来
  // next 是一个函数，表示放行
  //     next()  放行    next('/login')  强制跳转

  if (to.path === '/login') return next()
  // 获取token
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router
