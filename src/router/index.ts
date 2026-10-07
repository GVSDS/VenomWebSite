/** Venom 官网路由
 *
 * 两个页面：首页（品牌落地页）与包详情页 `/project/<包名>`。
 * history 模式：venom.gvsds.com 由 Main.py 静态托管并做了 SPA 兜底
 * （无扩展名的路径回退 index.html），深链/刷新可直接打开详情页。
 */
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/project/:name',
      name: 'project',
      component: () => import('@/views/ProjectView.vue'),
      props: true,
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

export default router
