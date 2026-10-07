<script setup lang="ts">
/**
 * 包详情页 `/project/<包名>`（PyPI 风格版式）
 *
 * 数据来自 `/API/Venom/Project/<包名>`（主服务按域名反查产品并回源子服务器）。
 * 顶部为 PyPI `banner--project` 式蓝色头部块（包名 + 摘要 + 安装命令），
 * 下方左栏为 README（Markdown → 消毒 HTML），右栏为元数据 / 依赖 / 版本历史卡片。
 * 数据到达前头部与正文都展示骨架 loading，避免首屏空白。
 */
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { VenomApiError, getProject, type VenomProject } from '@/api/venom'
import { renderMarkdown } from '@/markdown'
import { t } from '@/i18n'

const route = useRoute()

/** 首屏即为 true：进入页面立刻进 loading 层，不留空白 */
const loading = ref(true)
const error = ref('')
const notFound = ref(false)
const project = ref<VenomProject | null>(null)
const copied = ref(false)

const readmeHtml = computed(() =>
  project.value ? renderMarkdown(project.value.Readme || '') : '',
)

const installCommand = computed(() =>
  project.value ? `venom install ${project.value.PackageName}` : '',
)

function encodeName(name: string): string {
  return name
    .split('/')
    .map((seg) => encodeURIComponent(seg))
    .join('/')
}

async function load(): Promise<void> {
  const name = String(route.params.name || '').trim()
  loading.value = true
  error.value = ''
  notFound.value = false
  project.value = null
  copied.value = false

  if (!name) {
    notFound.value = true
    loading.value = false
    return
  }
  try {
    project.value = await getProject(name)
  } catch (e) {
    const err = e as VenomApiError
    if (err.Status === 404) notFound.value = true
    else error.value = err.message || t.project.loadFailed
  } finally {
    loading.value = false
  }
}

async function copyInstall(): Promise<void> {
  if (!installCommand.value) return
  try {
    await navigator.clipboard.writeText(installCommand.value)
    copied.value = true
    window.setTimeout(() => {
      copied.value = false
    }, 1600)
  } catch {
    /* 剪贴板不可用（非 https / 无权限）时忽略 */
  }
}

watch(() => route.params.name, load, { immediate: true })
</script>

<template>
  <section class="project">
    <!-- ==================== 顶部头部块（banner） ==================== -->
    <div v-if="!notFound && !error" class="banner">
      <div class="container banner-inner">
        <RouterLink class="back" to="/">{{ t.project.back }}</RouterLink>

        <template v-if="project">
          <h1 class="banner-name">
            {{ project.PackageName }}
            <span v-if="project.LatestVersion" class="banner-ver">{{ project.LatestVersion }}</span>
          </h1>
          <p class="banner-summary">{{ project.PackageDesc || t.project.noDesc }}</p>
          <div class="install">
            <code class="install-cmd">{{ installCommand }}</code>
            <button class="copy" :title="copied ? 'Copied' : 'Copy'" @click="copyInstall">
              <!-- fa fa-copy / fa fa-check（内联 SVG，避免为单个图标引入 Font Awesome） -->
              <svg v-if="!copied" viewBox="0 0 448 512" aria-hidden="true">
                <path
                  d="M208 0H332.1c12.7 0 24.9 5.1 33.9 14.1l67.9 67.9c9 9 14.1 21.2 14.1 33.9V336c0 26.5-21.5 48-48 48H208c-26.5 0-48-21.5-48-48V48c0-26.5 21.5-48 48-48zM48 128h80v64H64V448h256V416h64v48c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V176c0-26.5 21.5-48 48-48z"
                />
              </svg>
              <svg v-else viewBox="0 0 448 512" aria-hidden="true">
                <path
                  d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"
                />
              </svg>
            </button>
          </div>
          <p class="banner-hint">{{ t.project.installHint }}</p>
        </template>

        <template v-else>
          <div class="sk sk-name on-blue"></div>
          <div class="sk sk-line on-blue"></div>
          <div class="sk sk-bar on-blue"></div>
          <p class="banner-hint">{{ t.project.loading }}</p>
        </template>
      </div>
    </div>

    <!-- ==================== 正文 ==================== -->
    <div class="container body">
      <!-- loading 层（骨架） -->
      <div v-if="loading" class="layout" aria-busy="true" aria-live="polite">
        <div class="main">
          <div class="sk sk-block"></div>
          <div class="sk sk-block"></div>
          <div class="sk sk-block short"></div>
        </div>
        <aside class="side">
          <div class="sk sk-card"></div>
          <div class="sk sk-card"></div>
        </aside>
      </div>

      <!-- 不存在 / 失败 -->
      <div v-else-if="notFound" class="state">
        <p class="state-title">{{ t.project.notFound }}</p>
        <p class="state-sub">{{ route.params.name }}</p>
        <RouterLink class="btn btn-ghost" to="/">{{ t.project.back }}</RouterLink>
      </div>

      <div v-else-if="error" class="state">
        <p class="state-title">{{ t.project.loadFailed }}</p>
        <p class="state-sub">{{ error }}</p>
        <button class="btn btn-ghost" @click="load">{{ t.project.retry }}</button>
      </div>

      <!-- 包详情 -->
      <div v-else-if="project" class="layout">
        <div class="main">
          <article class="readme">
            <div v-if="readmeHtml" class="md" v-html="readmeHtml"></div>
          </article>
        </div>

        <aside class="side">
          <div class="card">
            <h2 class="card-title">{{ t.project.meta }}</h2>
            <ul class="meta">
              <li v-if="project.LatestVersion">
                <span class="k">{{ t.project.latest }}</span>
                <span class="v">{{ project.LatestVersion }}</span>
              </li>
              <li v-if="project.CreatorName">
                <span class="k">{{ t.project.author }}</span>
                <span class="v">{{ project.CreatorName }}</span>
              </li>
              <li>
                <span class="k">{{ t.project.released }}</span>
                <span class="v">{{ project.ReleaseCount }}</span>
              </li>
              <li v-if="project.UpdateTime">
                <span class="k">{{ t.project.updatedAt }}</span>
                <span class="v">{{ project.UpdateTime }}</span>
              </li>
              <li>
                <span class="k">UUID</span>
                <span class="v uuid">{{ project.PackageUUID }}</span>
              </li>
            </ul>
          </div>

          <div class="card">
            <h2 class="card-title">{{ t.project.dependencies }}</h2>
            <ul v-if="project.Dependencies.length" class="rows">
              <li v-for="d in project.Dependencies" :key="d.Name">
                <RouterLink class="dep-name" :to="`/project/${encodeName(d.Name)}`">
                  {{ d.Name }}
                </RouterLink>
                <span class="dep-ver">{{ d.Version || '*' }}</span>
              </li>
            </ul>
            <p v-else class="empty">{{ t.project.noDeps }}</p>
          </div>

          <div class="card">
            <h2 class="card-title">{{ t.project.versions }}</h2>
            <ul v-if="project.Releases.length" class="rows rels">
              <li v-for="r in project.Releases" :key="r.ReleaseUUID">
                <div class="rel-line">
                  <span class="rel-ver">{{ r.Version }}</span>
                  <span class="rel-time">{{ r.CreateTime }}</span>
                </div>
                <p v-if="r.Notes" class="rel-notes">{{ r.Notes }}</p>
                <p v-if="r.PublisherName" class="rel-by">
                  {{ t.project.publishedBy }} {{ r.PublisherName }}
                </p>
              </li>
            </ul>
            <p v-else class="empty">{{ t.project.noVersions }}</p>
          </div>
        </aside>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* ==================== 页面骨架 ==================== */
.project {
  padding-bottom: clamp(3rem, 6vw, 5rem);
  min-height: 70vh;
}

.body {
  padding-top: 30px;
}

.layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
  gap: 36px;
  align-items: start;
}

@media (max-width: 900px) {
  .layout {
    grid-template-columns: minmax(0, 1fr);
    gap: 26px;
  }
}

.main {
  min-width: 0;
}

/* ==================== 顶部头部块（PyPI banner--project） ==================== */
.banner {
  background: #006dad;
  color: #fff;
  padding: calc(var(--nav-h) + 22px) 0 30px;
}

.banner-inner {
  display: block;
}

.banner .back {
  display: inline-block;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 16px;
}

.banner .back:hover {
  color: #fff;
  text-decoration: underline;
}

.banner-name {
  font-size: clamp(1.7rem, 3.2vw, 2.2rem);
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.01em;
  color: #fff;
  word-break: break-all;
}

.banner-ver {
  margin-left: 10px;
  font-size: 0.95rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.72);
  vertical-align: middle;
}

.banner-summary {
  margin-top: 10px;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.92);
  max-width: 76ch;
}

.install {
  margin-top: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: 620px;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: var(--radius);
  padding: 9px 11px;
}

.install-cmd {
  flex: 1;
  min-width: 0;
  font-family: var(--font-code);
  font-size: 0.86rem;
  color: #fff;
  overflow-x: auto;
  white-space: nowrap;
}

.copy {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 28px;
  color: #006dad;
  background: #fff;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  transition: background 0.15s, color 0.15s;
}

.copy svg {
  width: 14px;
  height: 14px;
  fill: currentColor;
}

.copy:hover {
  background: rgba(255, 255, 255, 0.85);
}

.banner-hint {
  margin-top: 9px;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.72);
}

/* ==================== loading 骨架 ==================== */
.sk {
  background: linear-gradient(90deg, #eef0f2 25%, #f6f7f8 37%, #eef0f2 63%);
  background-size: 400% 100%;
  border-radius: var(--radius-sm);
  animation: skShimmer 1.3s ease-in-out infinite;
}

/* 蓝色头部块上的骨架：半透明白 */
.sk.on-blue {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.2) 25%,
    rgba(255, 255, 255, 0.34) 37%,
    rgba(255, 255, 255, 0.2) 63%
  );
  background-size: 400% 100%;
}

@keyframes skShimmer {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .sk {
    animation: none;
  }
}

.sk-name {
  width: 38%;
  height: 32px;
}

.sk-line {
  margin-top: 14px;
  width: 62%;
  height: 14px;
}

.sk-bar {
  margin-top: 20px;
  width: 100%;
  max-width: 620px;
  height: 40px;
}

.sk-block {
  width: 100%;
  height: 130px;
}

.sk-block + .sk-block {
  margin-top: 22px;
}

.sk-block.short {
  height: 70px;
}

.sk-card {
  height: 150px;
}

.sk-card + .sk-card {
  margin-top: 18px;
}

/* ==================== 状态（不存在 / 失败） ==================== */
.state {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  padding: 32px 0;
}

.state-title {
  font-size: 1.25rem;
  font-weight: 650;
  color: var(--text);
}

.state-sub {
  font-size: 0.88rem;
  color: var(--text-faint);
  word-break: break-all;
}

/* ==================== README ==================== */
.md {
  color: var(--text);
  font-size: 0.95rem;
  line-height: 1.75;
  word-wrap: break-word;
}

.md :deep(h1),
.md :deep(h2),
.md :deep(h3),
.md :deep(h4) {
  font-weight: 650;
  line-height: 1.3;
  color: var(--text);
  margin: 1.6em 0 0.6em;
}

.md :deep(h1) {
  font-size: 1.6rem;
  padding-bottom: 0.3em;
  border-bottom: 1px solid var(--line-soft);
}

.md :deep(h2) {
  font-size: 1.24rem;
  padding-bottom: 0.28em;
  border-bottom: 1px solid var(--line-soft);
}

.md :deep(h3) {
  font-size: 1.05rem;
}

.md :deep(> :first-child) {
  margin-top: 0;
}

.md :deep(p),
.md :deep(ul),
.md :deep(ol),
.md :deep(table),
.md :deep(blockquote) {
  margin: 0.85em 0;
}

.md :deep(ul),
.md :deep(ol) {
  padding-left: 1.4em;
}

.md :deep(li) {
  margin: 0.3em 0;
}

.md :deep(a) {
  color: var(--accent);
}

.md :deep(a:hover) {
  color: var(--accent-strong);
  text-decoration: underline;
}

.md :deep(code) {
  font-family: var(--font-code);
  font-size: 0.86em;
  background: var(--bg-soft);
  border: 1px solid var(--line-soft);
  border-radius: var(--radius-sm);
  padding: 0.12em 0.4em;
}

.md :deep(pre) {
  background: var(--bg-soft);
  border: 1px solid var(--line-soft);
  border-radius: var(--radius);
  padding: 14px 16px;
  overflow-x: auto;
}

.md :deep(pre code) {
  background: none;
  border: none;
  padding: 0;
  font-size: 0.85rem;
  line-height: 1.7;
}

.md :deep(blockquote) {
  border-left: 3px solid var(--line-soft);
  background: var(--panel);
  padding: 2px 16px;
  color: var(--text-dim);
}

.md :deep(table) {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.md :deep(th),
.md :deep(td) {
  border: 1px solid var(--line-soft);
  padding: 8px 12px;
  text-align: left;
}

.md :deep(th) {
  background: var(--bg-soft);
  font-weight: 600;
}

.md :deep(hr) {
  border: none;
  border-top: 1px solid var(--line-soft);
  margin: 1.8em 0;
}

.md :deep(img) {
  border-radius: var(--radius);
  max-width: 100%;
}

/* ==================== 侧栏卡片（PyPI 风格） ==================== */
.side {
  display: flex;
  flex-direction: column;
  gap: 18px;
  position: sticky;
  top: calc(var(--nav-h) + 18px);
}

.card {
  border: 1px solid var(--line-soft);
  border-radius: var(--radius);
  background: #fff;
  overflow: hidden;
}

.card-title {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text);
  background: var(--bg-soft);
  border-bottom: 1px solid var(--line-soft);
  padding: 9px 13px;
}

.meta,
.rows {
  list-style: none;
}

.meta li {
  display: flex;
  gap: 10px;
  justify-content: space-between;
  align-items: baseline;
  padding: 9px 13px;
  border-bottom: 1px solid var(--line-soft);
  font-size: 0.84rem;
}

.meta li:last-child,
.rows li:last-child {
  border-bottom: none;
}

.meta .k {
  color: var(--text-faint);
  flex-shrink: 0;
}

.meta .v {
  color: var(--text);
  text-align: right;
  word-break: break-all;
}

.meta .uuid {
  font-size: 0.76rem;
  color: var(--text-dim);
}

.rows li {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  padding: 9px 13px;
  border-bottom: 1px solid var(--line-soft);
  font-size: 0.84rem;
}

.dep-name {
  color: var(--accent);
  word-break: break-all;
}

.dep-name:hover {
  color: var(--accent-strong);
  text-decoration: underline;
}

.dep-ver {
  flex-shrink: 0;
  font-size: 0.78rem;
  color: var(--text-faint);
}

.rels li {
  display: block;
}

.rel-line {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
}

.rel-ver {
  font-weight: 650;
  color: var(--text);
}

.rel-time {
  font-size: 0.74rem;
  color: var(--text-faint);
}

.rel-notes {
  margin-top: 5px;
  font-size: 0.8rem;
  color: var(--text-dim);
  white-space: pre-wrap;
}

.rel-by {
  margin-top: 4px;
  font-size: 0.74rem;
  color: var(--text-faint);
}

.empty {
  padding: 11px 13px;
  font-size: 0.82rem;
  color: var(--text-faint);
}
</style>
