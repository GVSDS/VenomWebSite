<script setup lang="ts">
/**
 * 包详情页 `/project/<包名>`
 *
 * 数据来自 `/API/Venom/Project/<包名>`（主服务按域名反查产品并回源子服务器）。
 * 左侧渲染 README（Markdown → 消毒 HTML），右侧为安装命令 / 依赖列表 / 版本历史。
 */
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { VenomApiError, getProject, type VenomProject } from '@/api/venom'
import { renderMarkdown } from '@/markdown'
import { t } from '@/i18n'

const route = useRoute()

const loading = ref(false)
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
      <RouterLink class="back mono" to="/">{{ t.project.back }}</RouterLink>

      <p v-if="loading" class="state mono" data-reveal>{{ t.project.loading }}</p>

      <div v-else-if="notFound" class="state" data-reveal>
        <p class="state-title">{{ t.project.notFound }}</p>
        <p class="state-sub mono">{{ route.params.name }}</p>
        <RouterLink class="btn btn-ghost" to="/">{{ t.project.back }}</RouterLink>
      </div>

      <div v-else-if="error" class="state" data-reveal>
        <p class="state-title">{{ t.project.loadFailed }}</p>
        <p class="state-sub mono">{{ error }}</p>
        <button class="btn btn-ghost" @click="load">{{ t.project.retry }}</button>
      </div>

      <template v-else-if="project">
        <!-- 包信息头 -->
        <header class="pkg-head" data-reveal>
          <div class="pkg-title">
            <h1 class="pkg-name mono">{{ project.PackageName }}</h1>
            <span v-if="project.LatestVersion" class="ver-pill mono">
              v{{ project.LatestVersion }}
            </span>
          </div>
          <p class="pkg-desc">{{ project.PackageDesc || t.project.noDesc }}</p>
          <div class="pkg-meta mono">
            <span v-if="project.CreatorName">{{ t.project.author }} {{ project.CreatorName }}</span>
            <span>{{ t.project.released }} {{ project.ReleaseCount }}</span>
            <span v-if="project.UpdateTime">{{ t.project.updatedAt }} {{ project.UpdateTime }}</span>
            <span class="pkg-uuid">{{ project.PackageUUID }}</span>
          </div>
        </header>

        <div class="pkg-body">
          <!-- README -->
          <article class="readme" data-reveal>
            <div class="eyebrow">{{ t.project.readme }}</div>
            <div v-if="readmeHtml" class="md" v-html="readmeHtml"></div>
            <p v-else class="empty">{{ t.project.noReadme }}</p>
          </article>

          <!-- 侧栏 -->
          <aside class="side">
            <div class="card" data-reveal>
              <h2 class="card-title mono">{{ t.project.install }}</h2>
              <div class="install">
                <code class="install-cmd mono">{{ installCommand }}</code>
                <button class="copy mono" @click="copyInstall">
                  {{ copied ? 'OK' : 'COPY' }}
                </button>
              </div>
              <p class="hint">{{ t.project.installHint }}</p>
            </div>

            <div class="card" data-reveal>
              <h2 class="card-title mono">{{ t.project.dependencies }}</h2>
              <ul v-if="project.Dependencies.length" class="deps">
                <li v-for="d in project.Dependencies" :key="d.Name">
                  <RouterLink class="dep-name mono" :to="`/project/${encodeName(d.Name)}`">
                    {{ d.Name }}
                  </RouterLink>
                  <span class="dep-ver mono">{{ d.Version || '*' }}</span>
                </li>
              </ul>
              <p v-else class="empty">{{ t.project.noDeps }}</p>
            </div>

            <div class="card" data-reveal>
              <h2 class="card-title mono">{{ t.project.versions }}</h2>
              <ul v-if="project.Releases.length" class="rels">
                <li v-for="r in project.Releases" :key="r.ReleaseUUID">
                  <div class="rel-line">
                    <span class="rel-ver mono">{{ r.Version }}</span>
                    <span class="rel-time mono">{{ r.CreateTime }}</span>
                  </div>
                  <p v-if="r.Notes" class="rel-notes">{{ r.Notes }}</p>
                  <p v-if="r.PublisherName" class="rel-by mono">
                    {{ t.project.publishedBy }} {{ r.PublisherName }}
                  </p>
                </li>
              </ul>
              <p v-else class="empty">{{ t.project.noVersions }}</p>
            </div>
          </aside>
        </div>
      </template>
    </div>
  </section>
</template>

<style scoped>
/* 页面基线：让开固定顶栏 */
.project {
  padding-top: calc(var(--nav-h) + 44px);
  padding-bottom: clamp(4rem, 8vw, 6rem);
  min-height: 60vh;
}

.back {
  display: inline-flex;
  font-size: 0.82rem;
  letter-spacing: 0.06em;
  color: var(--text-dim);
  padding: 6px 12px;
  border: 1px solid var(--line-soft);
  border-radius: 999px;
  transition: color 0.2s var(--ease-out), border-color 0.2s var(--ease-out);
}

.back:hover {
  color: var(--accent-strong);
  border-color: var(--line);
}

/* ------- 状态（加载 / 不存在 / 失败） ------- */
.state {
  margin-top: 40px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  color: var(--text-dim);
}

.state-title {
  font-size: 1.3rem;
  font-weight: 650;
  color: var(--text);
}

.state-sub {
  font-size: 0.86rem;
  color: var(--text-faint);
  word-break: break-all;
}

/* ------- 包信息头 ------- */
.pkg-head {
  margin: 22px 0 34px;
  padding-bottom: 22px;
  border-bottom: 1px solid var(--line-soft);
}

.pkg-title {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.pkg-name {
  font-size: clamp(1.5rem, 3.4vw, 2.1rem);
  font-weight: 700;
  letter-spacing: -0.01em;
  word-break: break-all;
}

.ver-pill {
  font-size: 0.78rem;
  color: var(--accent-strong);
  background: rgba(var(--accent-rgb), 0.09);
  border: 1px solid rgba(var(--accent-rgb), 0.22);
  border-radius: 999px;
  padding: 3px 10px;
}

.pkg-desc {
  margin-top: 10px;
  color: var(--text-dim);
  max-width: 70ch;
}

.pkg-meta {
  margin-top: 14px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px 20px;
  font-size: 0.76rem;
  color: var(--text-faint);
}

.pkg-uuid {
  opacity: 0.6;
}

/* ------- 主体两栏 ------- */
.pkg-body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 40px;
  align-items: start;
}

@media (max-width: 980px) {
  .pkg-body {
    grid-template-columns: minmax(0, 1fr);
    gap: 28px;
  }
}

/* ------- README ------- */
.readme {
  min-width: 0;
}

.readme .eyebrow {
  margin-bottom: 12px;
}

.md {
  color: var(--text);
  font-size: 0.97rem;
  line-height: 1.78;
  word-wrap: break-word;
}

.md :deep(h1),
.md :deep(h2),
.md :deep(h3),
.md :deep(h4) {
  font-weight: 650;
  line-height: 1.3;
  letter-spacing: -0.01em;
  margin: 1.9em 0 0.7em;
}

.md :deep(h1) {
  font-size: 1.6rem;
  padding-bottom: 0.3em;
  border-bottom: 1px solid var(--line-soft);
}

.md :deep(h2) {
  font-size: 1.28rem;
  padding-bottom: 0.28em;
  border-bottom: 1px solid var(--line-soft);
}

.md :deep(h3) {
  font-size: 1.06rem;
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
  border-bottom: 1px solid rgba(var(--accent-rgb), 0.3);
}

.md :deep(a:hover) {
  color: var(--accent-strong);
  border-bottom-color: var(--accent-strong);
}

.md :deep(code) {
  font-family: var(--font-mono);
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
  border-left: 3px solid rgba(var(--accent-rgb), 0.35);
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
  margin: 2em 0;
}

.md :deep(img) {
  border-radius: var(--radius);
}

/* ------- 侧栏卡片 ------- */
.side {
  display: flex;
  flex-direction: column;
  gap: 18px;
  position: sticky;
  top: calc(var(--nav-h) + 20px);
}

.card {
  border: 1px solid var(--line-soft);
  border-radius: var(--radius);
  padding: 16px 16px 18px;
  background: #fff;
}

.card-title {
  font-size: 0.74rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 12px;
}

.install {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-soft);
  border: 1px solid var(--line-soft);
  border-radius: var(--radius-sm);
  padding: 9px 10px;
}

.install-cmd {
  flex: 1;
  min-width: 0;
  font-size: 0.8rem;
  overflow-x: auto;
  white-space: nowrap;
}

.copy {
  flex-shrink: 0;
  font-size: 0.68rem;
  letter-spacing: 0.12em;
  color: var(--text-dim);
  border: 1px solid var(--line-soft);
  border-radius: var(--radius-sm);
  padding: 4px 8px;
  transition: color 0.2s, border-color 0.2s;
}

.copy:hover {
  color: var(--accent-strong);
  border-color: var(--line);
}

.hint {
  margin-top: 8px;
  font-size: 0.76rem;
  color: var(--text-faint);
}

.deps {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.deps li {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
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
  font-size: 0.76rem;
  color: var(--text-faint);
}

.rels {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rels li {
  padding-bottom: 12px;
  border-bottom: 1px dashed var(--line-soft);
}

.rels li:last-child {
  padding-bottom: 0;
  border-bottom: none;
}

.rel-line {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
}

.rel-ver {
  font-size: 0.86rem;
  font-weight: 650;
  color: var(--text);
}

.rel-time {
  font-size: 0.72rem;
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
  font-size: 0.72rem;
  color: var(--text-faint);
}

.empty {
  font-size: 0.84rem;
  color: var(--text-faint);
}
</style>
