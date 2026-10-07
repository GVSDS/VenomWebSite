/** README 渲染：Markdown → 消毒后的 HTML
 *
 * 关闭 markdown-it 的原始 HTML（`html: false`），再用 DOMPurify 消毒一次，
 * 双重防护：README 由包作者自由填写，属于不可信内容。
 */
import MarkdownIt from 'markdown-it'
import DOMPurify from 'dompurify'

const md = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: false,
  typographer: false,
})

// 外链一律新窗口打开，并阻断 referrer / window.opener
const defaultLinkOpen = md.renderer.rules.link_open
md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
  tokens[idx].attrSet('target', '_blank')
  tokens[idx].attrSet('rel', 'noopener noreferrer')
  if (defaultLinkOpen) return defaultLinkOpen(tokens, idx, options, env, self)
  return self.renderToken(tokens, idx, options)
}

/** 渲染 README（Markdown 原文 → 可安全 v-html 的 HTML） */
export function renderMarkdown(source: string): string {
  return DOMPurify.sanitize(md.render(source || ''))
}
