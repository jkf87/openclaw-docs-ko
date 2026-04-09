---
summary: "OpenClaw에서 OpenCode Zen 및 Go 카탈로그 사용"
read_when:
  - OpenCode 호스팅 모델 접근을 원하는 경우
  - Zen 및 Go 카탈로그 중 선택하려는 경우
title: "OpenCode"
---

# OpenCode

OpenCode는 OpenClaw에서 두 가지 호스팅 카탈로그를 노출합니다:

- **Zen** 카탈로그용 `opencode/...`
- **Go** 카탈로그용 `opencode-go/...`

두 카탈로그는 동일한 OpenCode API 키를 사용합니다. OpenClaw는 업스트림 모델별 라우팅이 올바르게 유지되도록 런타임 프로바이더 id를 분리하지만, 온보딩과 문서는 하나의 OpenCode 설정으로 취급합니다.

## CLI 설정

### Zen 카탈로그

```bash
openclaw onboard --auth-choice opencode-zen
openclaw onboard --opencode-zen-api-key "$OPENCODE_API_KEY"
```

### Go 카탈로그

```bash
openclaw onboard --auth-choice opencode-go
openclaw onboard --opencode-go-api-key "$OPENCODE_API_KEY"
```

## 구성 스니펫

```json5
{
  env: { OPENCODE_API_KEY: "sk-..." },
  agents: { defaults: { model: { primary: "opencode/claude-opus-4-6" } } },
}
```

## 카탈로그

### Zen

- 런타임 프로바이더: `opencode`
- 예시 모델: `opencode/claude-opus-4-6`, `opencode/gpt-5.4`, `opencode/gemini-3-pro`
- 큐레이션된 OpenCode 멀티 모델 프록시를 원할 때 최적

### Go

- 런타임 프로바이더: `opencode-go`
- 예시 모델: `opencode-go/kimi-k2.5`, `opencode-go/glm-5`, `opencode-go/minimax-m2.5`
- OpenCode 호스팅 Kimi/GLM/MiniMax 라인업을 원할 때 최적

## 참고 사항

- `OPENCODE_ZEN_API_KEY`도 지원됩니다.
- 설정 중 하나의 OpenCode 키를 입력하면 두 런타임 프로바이더 모두의 자격 증명이 저장됩니다.
- OpenCode에 로그인하고, 청구 정보를 추가하고, API 키를 복사하십시오.
- 청구 및 카탈로그 가용성은 OpenCode 대시보드에서 관리됩니다.
- Gemini 기반 OpenCode 참조는 프록시-Gemini 경로에 유지되므로 OpenClaw는 네이티브 Gemini 재생 검증이나 부트스트랩 재작성을 활성화하지 않고 거기서 Gemini 사고 서명 위생을 유지합니다.
- Gemini 이외의 OpenCode 참조는 최소한의 OpenAI 호환 재생 정책을 유지합니다.
