---
title: "OpenCode Go"
description: "공유 OpenCode 설정으로 OpenCode Go 카탈로그 사용"
---

# OpenCode Go

OpenCode Go는 [OpenCode](/providers/opencode) 내의 Go 카탈로그입니다. Zen 카탈로그와 동일한 `OPENCODE_API_KEY`를 사용하지만 업스트림 모델별 라우팅이 올바르게 유지되도록 런타임 프로바이더 id `opencode-go`를 유지합니다.

## 지원 모델

- `opencode-go/kimi-k2.5`
- `opencode-go/glm-5`
- `opencode-go/minimax-m2.5`

## CLI 설정

```bash
openclaw onboard --auth-choice opencode-go
# 또는 비대화형
openclaw onboard --opencode-go-api-key "$OPENCODE_API_KEY"
```

## 구성 스니펫

```json5
{
  env: { OPENCODE_API_KEY: "YOUR_API_KEY_HERE" }, // pragma: allowlist secret
  agents: { defaults: { model: { primary: "opencode-go/kimi-k2.5" } } },
}
```

## 라우팅 동작

모델 참조가 `opencode-go/...`를 사용하면 OpenClaw가 모델별 라우팅을 자동으로 처리합니다.

## 참고 사항

- 공유 온보딩 및 카탈로그 개요는 [OpenCode](/providers/opencode)를 참조하십시오.
- 런타임 참조는 명시적으로 유지됩니다: Zen은 `opencode/...`, Go는 `opencode-go/...`.
