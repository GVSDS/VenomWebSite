<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { RouterLink } from 'vue-router'
import { t, currentLang, setLang } from '@/i18n'

const scrolled = ref(false)

function onScroll() {
  scrolled.value = window.scrollY > 10
}

function toggleLang() {
  setLang(currentLang.value === 'zh' ? 'en' : 'zh')
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <header class="site-header" :class="{ scrolled }">
    <div class="container header-inner">
      <RouterLink class="brand" to="/">
        <svg viewBox="0 0 64 64" aria-hidden="true">
          <rect width="64" height="64" rx="14" fill="none" />
          <path d="M14 47 V17 h8 l10 19 10-19 h8 V47 H40 V28 L32 47 24 28 v19 Z" />
        </svg>
        <span class="brand-name">Venom</span>
        <span class="brand-sub">PKG&nbsp;MANAGER</span>
      </RouterLink>

      <div class="header-actions">
        <button class="lang-btn" @click="toggleLang" aria-label="Switch language">
          {{ currentLang === 'zh' ? 'EN' : '中' }}
        </button>
        <a
          class="nav-pill"
          href="https://viper.gvsds.com"
          target="_blank"
          rel="noreferrer"
        >
          {{ t.header.backToViper }}
        </a>
      </div>
    </div>
  </header>
</template>

<style scoped>
/* 常驻品牌蓝顶栏（#0073B7 底 + 白字），滚动时只加一层阴影 */
.site-header {
  --hdr-fg: #ffffff;
  --hdr-fg-dim: rgba(255, 255, 255, 0.82);
  --hdr-line: rgba(255, 255, 255, 0.45);
  position: fixed;
  inset: 0 0 auto;
  z-index: 60;
  height: var(--nav-h);
  display: flex;
  align-items: center;
  background: #0073b7;
  transition: box-shadow 0.3s var(--ease-out);
}

.site-header.scrolled {
  box-shadow: 0 2px 12px -6px rgba(10, 26, 47, 0.45);
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.brand svg {
  width: 24px;
  height: 24px;
  fill: var(--hdr-fg);
}

.brand-name {
  font-weight: 750;
  font-size: 1.2rem;
  letter-spacing: 0.02em;
  color: var(--hdr-fg);
}

.brand-sub {
  color: var(--hdr-fg-dim);
  font-size: 0.62rem;
  letter-spacing: 0.22em;
  transform: translateY(1px);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.lang-btn {
  border: 1px solid var(--hdr-line);
  color: var(--hdr-fg);
  width: 42px;
  height: 34px;
  border-radius: 8px;
  font-size: 0.82rem;
  letter-spacing: 0.08em;
  transition: border-color 0.2s, color 0.2s, background 0.2s;
}

.lang-btn:hover {
  border-color: #fff;
  background: rgba(255, 255, 255, 0.16);
}

.nav-pill {
  color: var(--hdr-fg);
  font-size: 0.86rem;
  border: 1px solid var(--hdr-line);
  border-radius: 999px;
  padding: 7px 15px;
  transition: color 0.22s var(--ease-out), border-color 0.22s var(--ease-out),
    background 0.22s var(--ease-out);
}

.nav-pill:hover {
  border-color: #fff;
  background: rgba(255, 255, 255, 0.16);
}

@media (max-width: 640px) {
  .nav-pill {
    display: none;
  }
}
</style>
