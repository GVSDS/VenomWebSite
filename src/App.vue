<script setup lang="ts">
/**
 * 根组件：站点外壳（顶栏 + 路由出口 + 页脚）
 *
 * 全局职责：i18n 语言与文档标题同步、滚动揭示观察、Lenis 平滑滚动。
 * 页面内容由路由决定：`/` 首页、`/project/<包名>` 包详情。
 */
import { onMounted, onBeforeUnmount, watch, watchEffect, nextTick } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import Lenis from 'lenis'
import TheHeader from '@/components/TheHeader.vue'
import TheFooter from '@/components/TheFooter.vue'
import { currentLang, t } from '@/i18n'

const route = useRoute()

// html lang 与文档标题随语言/路由同步
watchEffect(() => {
  document.documentElement.lang = currentLang.value === 'zh' ? 'zh-CN' : 'en'
  const name = String(route.params.name || '')
  document.title = route.name === 'project' && name ? `${name} · Venom` : t.site.title
})

/** 全局滚动揭示：观察 [data-reveal]，进入视口即落定一次 */
function setupRevealObserver() {
  const els = document.querySelectorAll('[data-reveal]')
  if (!('IntersectionObserver' in window) || els.length === 0) return
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in')
          io.unobserve(entry.target)
        }
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -7% 0px' },
  )
  els.forEach((el) => io.observe(el))
}

// Lenis 平滑惯性滚动实例（接管滚轮，手势结束后继续滑行一段距离再停）
let lenis: Lenis | null = null

// 路由切换：回到页首 + 观察新页面的揭示元素
watch(
  () => route.fullPath,
  async () => {
    await nextTick()
    if (lenis) lenis.scrollTo(0, { immediate: true })
    else window.scrollTo(0, 0)
    setupRevealObserver()
  },
)

onMounted(async () => {
  await nextTick()
  setupRevealObserver()

  // lerp 越小滑行越久（0.1 为库默认值）；wheelMultiplier 略放大单次滚动量
  // anchors.offset 补偿固定顶栏高度（--nav-h 66px），确保锚点停靠不被遮挡
  // autoRaf 由库内部自驱动 requestAnimationFrame；respectReducedMotion 默认开启，
  // 系统开启"减弱动态效果"时自动退回原生滚动
  lenis = new Lenis({
    lerp: 0.08,
    wheelMultiplier: 1.05,
    anchors: { offset: -76 },
    autoRaf: true,
  })
})

onBeforeUnmount(() => {
  lenis?.destroy()
  lenis = null
})
</script>

<template>
  <TheHeader />
  <main>
    <RouterView />
  </main>
  <TheFooter />
</template>
