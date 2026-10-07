// Venom 官网 · 中文文案字典
// 注意：结构与 en.ts 完全一致（en.ts 以 typeof zh 校验）
export default {
  site: {
    title: 'Venom · Viper 官方包管理器',
  },
  header: {
    backToViper: '← viper.gvsds.com',
    toHome: '首页',
  },
  hero: {
    badge: 'UNDER DEVELOPMENT · 开发中',
    stamp: 'Viper 语言官方包管理器',
    lead: 'Venom 是为 Viper 语言而生的官方包管理器：统一 Viper 库的分发、安装与依赖解析，让复用生态像使用语言本身一样自然。',
    ctaBack: '回到 Viper 官网',
    ctaSite: 'viper.gvsds.com ↗',
  },
  capabilities: {
    eyebrow: 'WHAT VENOM DOES',
    title: '包的一生，一次走完',
    sub: '从发布到安装，再到依赖解析，最后无缝接入 TransPyC 的两阶段编译链路。',
    items: [
      {
        num: '01',
        name: 'PUBLISH',
        title: '发布',
        desc: '让 Viper 库能够按版本发布并被任何人获取。',
      },
      {
        num: '02',
        name: 'RESOLVE',
        title: '解析',
        desc: '在 Viper 的 SHA1 命名空间之上，做确定性的依赖解析。',
      },
      {
        num: '03',
        name: 'INTEGRATE',
        title: '集成',
        desc: '与 TransPyC 两阶段编译链路无缝衔接。',
      },
    ],
  },
  terminal: {
    file: 'venom — 示意 · sample',
    cmdComment: '# 命令示意，正式接口将于发布时确定',
    soon: '// 当前为品牌占位页 · 生态与接口随后公布 —— placeholder page, details will follow',
  },
  project: {
    back: '← 返回首页',
    loading: '正在读取包信息…',
    notFound: '未找到该包',
    loadFailed: '加载失败',
    retry: '重试',
    noDesc: '该包未填写说明',
    install: '安装',
    installHint: '在 Viper 工程中执行',
    latest: '最新版本',
    released: '发布',
    dependencies: '依赖',
    dependency: '包名',
    constraint: '版本约束',
    noDeps: '无外部依赖',
    versions: '版本历史',
    version: '版本',
    publishedBy: '发布人',
    publishedAt: '发布时间',
    notes: '说明',
    noVersions: '暂无发布记录',
    readme: 'README',
    noReadme: '该包暂未提供 README',
    author: '作者',
    updatedAt: '最近更新',
  },
  footer: {
    tagline: 'Viper 官方包管理器 · 开发中',
    copyright: '© GVSDS · Venom, the Viper package manager',
  },
}
