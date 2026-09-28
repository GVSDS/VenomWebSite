<script setup lang="ts">
import { t } from '@/i18n'
</script>

<template>
  <section id="top" class="hero">
    <div class="hero-bg" aria-hidden="true">
      <div class="hero-glow"></div>
    </div>

    <div class="container hero-inner">
      <p class="pill mono">
        <span class="dot"></span>
        <span>{{ t.hero.badge }}</span>
      </p>
      <h1 class="hero-brand">
        Venom<span class="brand-dot">.</span>
      </h1>
      <p class="hero-stamp mono">{{ t.hero.stamp }}</p>
      <p class="hero-lead">{{ t.hero.lead }}</p>

      <div class="hero-cta">
        <a class="btn btn-primary" href="https://viper.gvsds.com" target="_blank" rel="noreferrer">
          {{ t.hero.ctaBack }}
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>
        </a>
        <a
          class="btn btn-ghost mono"
          href="https://viper.gvsds.com/#ecosystem"
          target="_blank"
          rel="noreferrer"
        >
          {{ t.hero.ctaSite }}
        </a>
      </div>
    </div>

    <a class="hero-scroll mono" href="#capabilities" aria-hidden="true">
      <span>↓</span>
    </a>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  min-height: 100svh;
  display: flex;
  align-items: center;
  justify-content: center;
  /* 辉光要越过底边渗入下一 section，所以不能整体裁剪。
     这里只做横向裁剪：辉光是 1100px 固定宽度，不横向裁会把页面撑得比视口宽
     （手机端表现为可以左右拖动、右侧一片空白）。
     前置的 overflow: hidden 是不支持 overflow: clip 的浏览器的回退：辉光不外溢，但布局一定安全。 */
  overflow: hidden;
  padding: calc(var(--nav-h) + 24px) 0 48px;
  text-align: center;
}

@supports (overflow-x: clip) {
  .hero {
    overflow-x: clip;
    overflow-y: visible;
  }
}

/* 背景：白底 + 极淡翡翠辉光（下缘越过 hero 底边，继续可见于下一 section） */
.hero-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.hero-glow {
  position: absolute;
  top: -24%;
  left: 50%;
  transform: translateX(-50%);
  width: 1100px;
  height: 155%;
  border-radius: 50%;
  background: radial-gradient(ellipse at 50% 41%, rgba(14, 138, 93, 0.1), transparent 68%);
  filter: blur(24px);
}

.hero-inner {
  position: relative;
  z-index: 1;
  max-width: 880px;
  margin-inline: auto;
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid rgba(29, 111, 184, 0.35);
  color: #1d6fb8;
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  border-radius: 999px;
  padding: 5px 13px;
  opacity: 0;
  animation: riseIn 0.7s var(--ease-out) 0.1s forwards;
}

.pill .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #1d6fb8;
  animation: caretBlink 1.4s steps(1) infinite;
}

.hero-brand {
  margin: 20px 0 0;
  font-size: clamp(3.6rem, 10vw, 6.4rem);
  line-height: 0.98;
  letter-spacing: -0.035em;
  font-weight: 800;
  color: var(--text);
  opacity: 0;
  animation: riseIn 0.75s var(--ease-out) 0.2s forwards;
}

.brand-dot {
  color: var(--accent);
}

.hero-stamp {
  margin-top: 18px;
  color: var(--accent-strong);
  font-size: clamp(0.9rem, 1.8vw, 1.15rem);
  letter-spacing: 0.04em;
  font-weight: 650;
  opacity: 0;
  animation: riseIn 0.7s var(--ease-out) 0.32s forwards;
}

.hero-lead {
  margin: 26px auto 0;
  color: var(--text-dim);
  font-size: 1.04rem;
  max-width: 60ch;
  opacity: 0;
  animation: riseIn 0.7s var(--ease-out) 0.42s forwards;
}

.hero-cta {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 14px;
  margin-top: 40px;
  opacity: 0;
  animation: riseIn 0.7s var(--ease-out) 0.52s forwards;
}

.hero-cta .btn svg {
  width: 16px;
  height: 16px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2.2;
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: transform 0.25s var(--ease-out);
}

.btn-primary:hover svg {
  transform: translateX(3px);
}

.hero-scroll {
  position: absolute;
  left: 50%;
  bottom: 20px;
  z-index: 1;
  transform: translateX(-50%);
  color: var(--text-faint);
  font-size: 1rem;
  opacity: 0.6;
  animation: fadeIn 0.8s ease 1.4s backwards, floatY 2.4s ease-in-out 1.4s infinite;
  transition: opacity 0.2s;
}

.hero-scroll:hover {
  opacity: 1;
}

@keyframes floatY {
  0%, 100% { transform: translate(-50%, 0); }
  50% { transform: translate(-50%, 7px); }
}

@media (max-width: 640px) {
  .hero {
    align-items: flex-start;
    padding-top: calc(var(--nav-h) + 56px);
  }
  .hero-scroll {
    display: none;
  }
}
</style>
