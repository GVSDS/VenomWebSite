# VenomWebSite

Venom 官网（[venom.gvsds.com](https://venom.gvsds.com)）源码。

Venom 是 [Viper](https://viper.gvsds.com) 语言的包管理器：覆盖包从发布到安装、依赖解析，并接入 TransPyC 的两阶段编译链路。

## 技术栈

- Vue 3（`<script setup>` + TypeScript）
- Vite 8（rolldown）
- 零 UI 框架：手写 CSS 设计系统（[src/assets/base.css](src/assets/base.css)）
- [Lenis](https://github.com/darkroomengineering/lenis) 平滑惯性滚动

## 目录结构

```
src/
├─ App.vue                    页面装配 + Lenis 实例 + 滚动揭示观察器
├─ main.ts                    入口
├─ assets/base.css            设计系统：色板 / 字体栈 / 通用工具类
├─ i18n/                      中英双语文案（index.ts 保存语言状态，zh.ts / en.ts 为词条）
└─ components/
   ├─ TheHeader.vue           顶栏：导航、语言切换
   ├─ HeroSection.vue         首屏
   ├─ CapabilitiesSection.vue 能力卡片（发布 / 解析 / 集成）
   ├─ TerminalSection.vue     终端演示
   └─ TheFooter.vue           页脚
deploy.ps1                    构建 + 部署脚本（见下）
```

## 开发

```powershell
npm install
npm run dev      # 开发服务器：http://localhost:5176（监听 0.0.0.0，便于局域网/手机真机预览）
```

## 构建与部署

```powershell
npm run build    # vue-tsc -b 类型检查 + vite build → dist/
.\deploy.ps1     # 清理旧产物 → 全量构建 → 同步 dist 到 TempLate/Venom → 校验一致性
```

`deploy.ps1` 做四件事：

1. 删除 `dist/` 与生产目录 `../TempLate/Venom/` 下的旧 `assets/`、`index.html`（避免残留旧 hash 文件）
2. 执行 `npm run build`，类型检查失败即中断
3. 把 `dist/*` 同步到 `../TempLate/Venom/`
4. 校验生产目录的文件名集合与 `dist/` 完全一致，并确认 `index.html` 引用的入口 JS 真实存在

生产目录 `TempLate/Venom` 由 Django 站点以 `venom.gvsds.com` 子域名托管，产物入口使用根绝对路径 `/assets/...`。
**本地直接打开构建产物会白屏**，需以 `TempLate/Venom` 为站点根访问。

> `deploy.ps1` 必须保持纯 ASCII：Windows PowerShell 5.1 会用 ANSI 代码页解析无 BOM 的 UTF-8 脚本，非 ASCII 字符会乱码。

## 相关仓库

- [ViperWebSite](https://git.gvsds.com/GVSDS/ViperWebSite) — Viper 语言官网
- [GVSite](https://git.gvsds.com/GVSDS/GVSite) — GVSDS 工作室站

## 浏览器兼容

- `overflow: clip` 前置 `overflow-x: hidden` 回退（老 iOS Safari < 16 / Chrome < 90 会丢弃 `clip`）
- 横向裁剪放在根元素 `html` 上：放 `body` 会把 `body` 的 `overflow-y` 算成 `auto`，被 Lenis 的 `allowNestedScroll` 误判为嵌套滚动源
- 尊重 `prefers-reduced-motion`：系统开启「减弱动态效果」时自动退回原生滚动
