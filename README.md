# OpenClaw 한국어 문서

[OpenClaw](https://docs.openclaw.ai) — AI 에이전트용 멀티채널 게이트웨이 — 의 비공식 한국어 번역입니다.

## 📚 문서 보기

**[https://jkf87.github.io/openclaw-docs-ko/](https://jkf87.github.io/openclaw-docs-ko/)**

Discord, Slack, Telegram, WhatsApp, iMessage 등 20여 개 채널에 AI 에이전트를 연결하는 자체 호스팅 게이트웨이 OpenClaw의 전체 문서를 한국어로 제공합니다.

## 📖 함께 보면 좋은 책

[![이게 되네? 오픈클로 미친 활용법 50제](https://image.yes24.com/goods/185166276/XL)](https://www.yes24.com/product/goods/185166276)

**[이게 되네? 오픈클로 미친 활용법 50제](https://www.yes24.com/product/goods/185166276)**

- 저자: 한준구
- 출판사: 골든래빗
- 부제: 노코딩으로 누구나 쉽게 AI 에이전트 활용하기

## 🛠 로컬에서 실행

```bash
cd site
npm install
node scripts/prepare-docs.mjs
npx vitepress dev docs
```

번역 원본은 `ko/` 디렉터리에 있으며, `prepare-docs.mjs`가 Mintlify 컴포넌트를 VitePress 호환 마크다운으로 변환해 `site/docs/`에 복사합니다.

## 🤝 기여

오탈자, 번역 수정, 누락된 페이지에 대한 Pull Request와 Issue를 환영합니다.

## 📄 라이선스

원본 문서의 라이선스를 따릅니다. 자세한 내용은 [openclaw.ai](https://openclaw.ai)를 참조하세요.
