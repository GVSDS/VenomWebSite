<script setup lang="ts">
import { t } from '@/i18n'

const year = new Date().getFullYear()
</script>

<template>
  <footer class="footer">
    <div class="container footer-inner">
      <div class="f-brand">
        <div class="f-brand-line">
          <svg viewBox="0 0 64 64" aria-hidden="true">
            <rect width="64" height="64" rx="14" fill="none" />
            <path d="M14 47 V17 h8 l10 19 10-19 h8 V47 H40 V28 L32 47 24 28 v19 Z" />
          </svg>
          <span class="f-name">Venom</span>
        </div>
        <p class="f-tagline">{{ t.footer.tagline }}</p>
      </div>

      <div class="foot-links mono">
        <a href="https://viper.gvsds.com" target="_blank" rel="noreferrer">Viper</a>
        <a href="https://venom.gvsds.com" target="_blank" rel="noreferrer">Venom</a>
        <a href="https://git.gvsds.com/GVSDS/TransPyC" target="_blank" rel="noreferrer">TransPyC</a>
      </div>

      <p class="f-copy mono">{{ t.footer.copyright.replace('©', '© ' + year) }}</p>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  --text: #e8f1fa;
  --text-dim: #9db8cf;
  --text-faint: #6f88a0;
  --line-soft: rgba(255, 255, 255, 0.09);
  --accent: #7cc4ff;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  background: var(--bg-deep);
  padding: 34px 0 30px;
  color: #6f88a0;
}

.footer-inner {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
  font-size: 0.82rem;
}

.f-brand-line {
  display: flex;
  align-items: center;
  gap: 10px;
}

.f-brand-line svg {
  width: 22px;
  height: 22px;
  fill: var(--accent);
}

.f-name {
  color: #e8f1fa;
  font-size: 1.05rem;
  font-weight: 750;
}

.f-tagline {
  margin-top: 4px;
  font-size: 0.8rem;
}

.foot-links {
  display: flex;
  gap: 18px;
}

.foot-links a {
  color: #9db8cf;
  transition: color 0.2s;
}

.foot-links a:hover {
  color: #7cc4ff;
}

.f-copy {
  color: #6f88a0;
  font-size: 0.76rem;
  letter-spacing: 0.04em;
}

@media (max-width: 760px) {
  .footer-inner {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }
}
</style>
