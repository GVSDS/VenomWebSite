<script setup lang="ts">
import { t } from '@/i18n'

/** 鼠标跟随光晕：在网格上做事件委托，把指针在卡片内的坐标写进该卡片的 CSS 变量 --mx / --my */
function onCardPointerMove(e: PointerEvent) {
  const card = (e.target as HTMLElement | null)?.closest<HTMLElement>('.cap-card')
  if (!card) return
  const rect = card.getBoundingClientRect()
  card.style.setProperty('--mx', `${e.clientX - rect.left}px`)
  card.style.setProperty('--my', `${e.clientY - rect.top}px`)
}
</script>

<template>
  <section id="capabilities" class="section capabilities">
    <div class="container">
      <div class="cap-head" data-reveal>
        <p class="eyebrow mono">{{ t.capabilities.eyebrow }}</p>
        <h2 class="section-title">{{ t.capabilities.title }}</h2>
        <p class="section-sub">{{ t.capabilities.sub }}</p>
      </div>

      <div class="cap-grid" @pointermove="onCardPointerMove">
        <article
          v-for="(item, i) in t.capabilities.items"
          :key="item.num"
          class="cap-card"
          data-reveal
          :style="{ '--reveal-delay': `${i * 110}ms` }"
        >
          <p class="cap-num mono">{{ item.num }}</p>
          <p class="cap-name mono">{{ item.name }}</p>
          <h3 class="cap-title">{{ item.title }}</h3>
          <p class="cap-desc">{{ item.desc }}</p>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.capabilities {
  /* 顶部留透明区：让首屏辉光透上来继续可见，实现跨 section 的光晕衔接；
     其后接浅色带（两端回到 --bg，与相邻 section 无接缝） */
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0) 0%,
    var(--bg) 20%,
    var(--bg-soft) 42%,
    var(--bg) 100%
  );
}

.cap-head {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.cap-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
  margin-top: clamp(2.4rem, 5vw, 3.6rem);
}

.cap-card {
  position: relative;
  overflow: hidden; /* 裁掉光晕的直角，贴合圆角卡片 */
  background: var(--bg);
  border: 1px solid var(--line-soft);
  border-radius: var(--radius);
  padding: 26px 26px 24px;
  transition: border-color 0.25s var(--ease-out), transform 0.25s var(--ease-out),
    box-shadow 0.3s var(--ease-out);
}

/* 鼠标跟随光晕：位置由 --mx / --my 决定，未移动时落在卡片中心 */
.cap-card::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 0;
  background: radial-gradient(
    240px circle at var(--mx, 50%) var(--my, 50%),
    rgba(var(--accent-rgb), 0.14),
    transparent 68%
  );
  opacity: 0;
  transition: opacity 0.28s var(--ease-out);
  pointer-events: none;
}

/* 仅在支持悬停的指针设备上启用，触屏不残留光斑 */
@media (hover: hover) and (pointer: fine) {
  .cap-card:hover::before {
    opacity: 1;
  }
}

.cap-card:hover {
  border-color: var(--line);
  transform: translateY(-3px);
  box-shadow: 0 22px 46px -30px rgba(14, 138, 93, 0.5);
}

/* 卡片内容压在光晕之上 */
.cap-num,
.cap-name,
.cap-title,
.cap-desc {
  position: relative;
  z-index: 1;
}

.cap-num {
  color: var(--accent-strong);
  font-size: 0.7rem;
  letter-spacing: 0.18em;
}

.cap-name {
  margin-top: 2px;
  color: var(--text-faint);
  font-size: 0.66rem;
  letter-spacing: 0.22em;
}

.cap-title {
  margin-top: 14px;
  font-size: 1.16rem;
  font-weight: 650;
}

.cap-desc {
  margin-top: 8px;
  color: var(--text-dim);
  font-size: 0.94rem;
}

@media (max-width: 900px) {
  .cap-grid {
    grid-template-columns: 1fr;
  }
}
</style>
