<script setup lang="ts">
/**
 * 包详情页 `/project/<包名>`（PyPI 风格版式）
 *
 * 数据来自 `/API/Venom/Project/<包名>`（主服务按域名反查产品并回源子服务器）。
 * 左侧为 README（Markdown → 消毒 HTML），右侧为元数据 / 依赖 / 版本历史卡片。
 * 数据到达前展示骨架 loading 层，避免首屏空白。
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
    <div class="container">
      <RouterLink class="back" to="/">{{ t.project.back }}</RouterLink>

      <!-- ==================== loading 层（骨架） ==================== -->
      <div v-if="loading" class="layout" aria-busy="true" aria-live="polite">
        <div class="main">
          <div class="sk sk-title"></div>
          <div class="sk sk-line"></div>
          <div class="sk sk-line short"></div>
          <div class="sk sk-bar"></div>
          <div class="sk sk-block"></div>
          <div class="sk sk-block"></div>
          <p class="sk-hint">{{ t.project.loading }}</p>
        </div>
        <aside class="side">
          <div class="sk sk-card"></div>
          <div class="sk sk-card"></div>
        </aside>
      </div>

      <!-- ==================== 不存在 / 失败 ==================== -->
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

      <!-- ==================== 包详情 ==================== -->
      <div v-else-if="project" class="layout">
        <div class="main">
          <h1 class="pkg-name">{{ project.PackageName }}</h1>
          <p class="pkg-desc">{{ project.PackageDesc || t.project.noDesc }}</p>

          <div class="install">
            <code class="install-cmd">{{ installCommand }}</code>
            <button class="copy" @click="copyInstall">{{ copied ? 'OK' : 'COPY' }}</button>
          </div>
          <p class="hint">{{ t.project.installHint }}</p>

          <hr class="rule" />

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
  padding-top: calc(var(--nav-h) + 28px);
  padding-bottom: clamp(3rem, 6vw, 5rem);
  min-height: 70vh;
}

.back {
  display: inline-block;
  font-size: 0.85rem;
  color: var(--accent);
  margin-bottom: 20px;
}

.back:hover {
  color: var(--accent-strong);
  text-decoration: underline;
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

/* ==================== loading 骨架 ==================== */
.sk {
  background: linear-gradient(90deg, #eef0f2 25%, #f6f7f8 37%, #eef0f2 63%);
  background-size: 400% 100%;
  border-radius: var(--radius-sm);
  animation: skShimmer 1.3s ease-in-out infinite;
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

.sk-title {
  width: 42%;
  height: 34px;
}

.sk-line {
  margin-top: 14px;
  width: 78%;
  height: 14px;
}

.sk-line.short {
  width: 52%;
}

.sk-bar {
  margin-top: 22px;
  width: 100%;
  height: 40px;
}

.sk-block {
  margin-top: 26px;
  width: 100%;
  height: 120px;
}

.sk-card {
  height: 150px;
  margin-bottom: 18px;
}

.sk-hint {
  margin-top: 18px;
  font-size: 0.82rem;
  color: var(--text-faint);
}

/* ==================== 状态（不存在 / 失败） ==================== */
.state {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  padding: 40px 0;
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

/* ==================== 包信息 ==================== */
.pkg-name {
  font-size: clamp(1.75rem, 3.2vw, 2.25rem);
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.01em;
  color: var(--text);
  word-break: break-all;
}

.pkg-desc {
  margin-top: 10px;
  font-size: 1rem;
  color: var(--text-dim);
  max-width: 72ch;
}

.install {
  margin-top: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--bg-soft);
  border: 1px solid var(--line-soft);
  border-radius: var(--radius);
  padding: 10px 12px;
}

.install-cmd {
  flex: 1;
  min-width: 0;
  font-family: var(--font-code);
  font-size: 0.86rem;
  color: var(--text);
  overflow-x: auto;
  white-space: nowrap;
}

.copy {
  flex-shrink: 0;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: var(--accent);
  border: 1px solid var(--line-soft);
  border-radius: var(--radius-sm);
  padding: 5px 10px;
  background: #fff;
  transition: color 0.15s, border-color 0.15s, background 0.15s;
}

.copy:hover {
  color: var(--accent-strong);
  border-color: var(--accent);
}

.hint {
  margin-top: 8px;
  font-size: 0.8rem;
  color: var(--text-faint);
}

.rule {
  margin: 28px 0 24px;
  border: none;
  border-top: 1px solid var(--line-soft);
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
