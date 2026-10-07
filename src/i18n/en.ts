// Venom official website · English dictionary
// Structure must mirror zh.ts (validated as typeof zh)
import type zh from './zh'

const en: typeof zh = {
  site: {
    title: 'Venom · the Viper package manager',
  },
  header: {
    backToViper: '← viper.gvsds.com',
    toHome: 'Home',
  },
  hero: {
    badge: 'UNDER DEVELOPMENT',
    stamp: 'The package manager for the Viper language',
    lead: 'Venom is the official package manager built for Viper — unifying how Viper libraries are published, installed and resolved, so sharing feels as native as the language itself.',
    ctaBack: 'Back to the Viper website',
    ctaSite: 'viper.gvsds.com ↗',
  },
  capabilities: {
    eyebrow: 'WHAT VENOM DOES',
    title: 'One flow for the whole package life',
    sub: 'From publish to install, then dependency resolution — finally plugged straight into the TransPyC two-phase toolchain.',
    items: [
      {
        num: '01',
        name: 'PUBLISH',
        title: 'Publish',
        desc: 'Ship Viper libraries in versions anyone can fetch.',
      },
      {
        num: '02',
        name: 'RESOLVE',
        title: 'Resolve',
        desc: 'Deterministic dependency resolution atop Viper SHA1 namespaces.',
      },
      {
        num: '03',
        name: 'INTEGRATE',
        title: 'Integrate',
        desc: 'Plugs straight into the TransPyC two-phase toolchain.',
      },
    ],
  },
  terminal: {
    file: 'venom — sample',
    cmdComment: '# sample commands; the real CLI lands with the release',
    soon: '// a brand placeholder — ecosystem & interfaces to follow',
  },
  project: {
    back: '← Back to home',
    loading: 'Loading package…',
    notFound: 'Package not found',
    loadFailed: 'Failed to load',
    retry: 'Retry',
    noDesc: 'No description provided',
    install: 'Install',
    installHint: 'Run inside a Viper project',
    latest: 'Latest',
    released: 'Releases',
    dependencies: 'Dependencies',
    dependency: 'Package',
    constraint: 'Constraint',
    noDeps: 'No external dependencies',
    versions: 'Version history',
    version: 'Version',
    publishedBy: 'Publisher',
    publishedAt: 'Published',
    notes: 'Notes',
    noVersions: 'No releases yet',
    readme: 'README',
    noReadme: 'No README provided',
    author: 'Author',
    updatedAt: 'Updated',
  },
  footer: {
    tagline: 'The Viper package manager · work in progress',
    copyright: '© GVSDS · Venom, the Viper package manager',
  },
}

export default en
