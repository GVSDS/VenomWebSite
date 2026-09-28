// 轻量 i18n：zh/en 双字典 + 响应式替换（无外部依赖）
import { reactive, computed } from 'vue'
import zh from './zh'
import en from './en'

export type Lang = 'zh' | 'en'

function deepCopyInto(target: Record<string, unknown>, source: Record<string, unknown>): void {
  for (const key of Object.keys(source)) {
    const srcVal = source[key]
    const dstVal = target[key]
    if (
      srcVal !== null &&
      typeof srcVal === 'object' &&
      !Array.isArray(srcVal) &&
      dstVal !== null &&
      typeof dstVal === 'object'
    ) {
      deepCopyInto(dstVal as Record<string, unknown>, srcVal as Record<string, unknown>)
    } else {
      target[key] = srcVal
    }
  }
}

const state = reactive({
  lang: (localStorage.getItem('venom-lang') as Lang) || 'zh',
})

// 响应式文案对象：结构 = typeof zh（en.ts 已按同结构校验）
export const t = reactive<typeof zh>(deepClone(zh))

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

export const currentLang = computed(() => state.lang)

export function setLang(lang: Lang): void {
  if (state.lang === lang) return
  state.lang = lang
  localStorage.setItem('venom-lang', lang)
  deepCopyInto(t as unknown as Record<string, unknown>, lang === 'zh' ? zh : en)
}
