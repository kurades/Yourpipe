import store from '@/store'
import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: "/login",
    name: "login",
    component: () => import("@/views/LoginView.vue"),
    meta: {
      preventLogin: true,
    }
  },
  {
    path: "/",
    name: "home",
    component: () => import("@/views/HomeView.vue"),
    meta: {
      requiresAuth: true,

    }
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    if (store.state.user) {
      next();
    } else {
      next({ name: 'login' });
    }
  } else {
    next();
  }

  if (to.meta.preventLogin) {
    if (!store.state.user) {
      next();
    } else {
      next({ name: 'home' });
    }
  } else {
    next();
  }
})

export default router
