<template>
  <div class="book-banner">
    <div class="book-content">
      <span class="book-badge">NEW</span>
      <div>
        <strong>이게 되네? 오픈클로 미친 활용법 50제</strong>
        <p>한준구 저 | 골든래빗 | 노코딩으로 누구나 쉽게 AI 에이전트 활용하기</p>
      </div>
    </div>
    <a
      href="https://www.yes24.com/product/goods/185166276"
      target="_blank"
      rel="noopener"
      class="book-cta"
    >
      Yes24에서 구매 &rarr;
    </a>
  </div>
</template>

<style scoped>
.book-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 20px;
  margin: 24px 0;
  border: 2px solid var(--vp-c-brand-1);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
}
.book-content {
  display: flex;
  align-items: center;
  gap: 12px;
}
.book-content p {
  margin: 4px 0 0;
  font-size: 0.85em;
  color: var(--vp-c-text-2);
}
.book-badge {
  background: var(--vp-c-brand-1);
  color: white;
  font-size: 0.7em;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
  white-space: nowrap;
}
.book-cta {
  white-space: nowrap;
  padding: 8px 16px;
  background: var(--vp-c-brand-1);
  color: white !important;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9em;
  transition: opacity 0.2s;
}
.book-cta:hover { opacity: 0.9; }
@media (max-width: 640px) {
  .book-banner { flex-direction: column; text-align: center; }
  .book-content { flex-direction: column; }
}
</style>
