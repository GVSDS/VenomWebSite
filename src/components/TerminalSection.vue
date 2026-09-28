<script setup lang="ts">
import { t } from '@/i18n'
</script>

<template>
  <section id="terminal" class="section terminal-section">
    <div class="container term-wrap">
      <div class="code-win term" data-reveal>
        <div class="code-win__bar">
          <span class="code-win__dot"></span>
          <span class="code-win__dot"></span>
          <span class="code-win__dot"></span>
          <span class="code-win__file">{{ t.terminal.file }}</span>
        </div>
        <pre><code><span class="tok-cmt">{{ t.terminal.cmdComment }}</span>
<span class="p"><span class="tok-fn">venom</span> <span class="tok-type">init</span> <span class="tok-str">--template viper-app</span></span>
<span class="p"><span class="tok-fn">venom</span> <span class="tok-type">add</span> <span class="tok-str">viper-json</span></span>
<span class="p"><span class="tok-fn">venom</span> <span class="tok-type">build</span></span>
<span class="tok-plain">→</span> <span class="out">./output/app.exe</span> <span class="tok-plain">ready in</span> <span class="tok-num">86ms</span><span class="caret"></span></code></pre>
      </div>
      <p class="soon mono" data-reveal>{{ t.terminal.soon }}</p>
    </div>
  </section>
</template>

<style scoped>
.terminal-section {
  padding-top: 0;
}

.term-wrap {
  max-width: 920px;
}

.term .out {
  color: #5ad7a6;
}

.term .p::before {
  content: '$ ';
  color: #5ad7a6;
  font-weight: 700;
  user-select: none;
}

.soon {
  margin-top: 14px;
  color: var(--text-faint);
  font-size: 0.76rem;
  letter-spacing: 0.06em;
  text-align: center;
}
</style>
