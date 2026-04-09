---
title: "추론 CLI"
description: "프로바이더 기반 모델, 이미지, 오디오, TTS, 비디오, 웹, 임베딩 워크플로우를 위한 추론 우선 CLI"
---

# 추론 CLI

`openclaw infer`는 프로바이더 기반 추론 워크플로우를 위한 표준 헤드리스 표면입니다.

의도적으로 기능 패밀리를 노출하며, 원시 게이트웨이 RPC 이름이나 원시 에이전트 툴 id는 노출하지 않습니다.

## infer를 스킬로 만들기

다음을 에이전트에 복사하여 붙여넣으세요:

```text
Read https://docs.openclaw.ai/cli/infer, then create a skill that routes my common workflows to `openclaw infer`.
Focus on model runs, image generation, video generation, audio transcription, TTS, web search, and embeddings.
```

좋은 infer 기반 스킬은 다음을 해야 합니다:

- 일반적인 사용자 의도를 올바른 infer 하위 명령에 매핑
- 다루는 워크플로우에 대한 몇 가지 표준 infer 예시 포함
- 예시와 제안에서 `openclaw infer ...` 선호
- 스킬 본문 내에서 전체 infer 표면을 재문서화하는 것을 피함

일반적인 infer 집중 스킬 범위:

- `openclaw infer model run`
- `openclaw infer image generate`
- `openclaw infer audio transcribe`
- `openclaw infer tts convert`
- `openclaw infer web search`
- `openclaw infer embedding create`

## infer를 사용하는 이유

`openclaw infer`는 OpenClaw 내 프로바이더 기반 추론 작업을 위한 하나의 일관된 CLI를 제공합니다.

장점:

- 각 백엔드에 대한 일회성 래퍼를 연결하는 대신 OpenClaw에 이미 구성된 프로바이더와 모델을 사용하세요.
- 하나의 명령 트리 아래에 모델, 이미지, 오디오 전사, TTS, 비디오, 웹, 임베딩 워크플로우를 유지하세요.
- 스크립트, 자동화, 에이전트 기반 워크플로우에 안정적인 `--json` 출력 형태를 사용하세요.
- 작업이 근본적으로 "추론 실행"일 때 OpenClaw의 공식 표면을 선호하세요.
- 대부분의 infer 명령에 게이트웨이를 요구하지 않는 일반적인 로컬 경로를 사용하세요.

## 명령 트리

```text
 openclaw infer
  list
  inspect

  model
    run
    list
    inspect
    providers
    auth login
    auth logout
    auth status

  image
    generate
    edit
    describe
    describe-many
    providers

  audio
    transcribe
    providers

  tts
    convert
    voices
    providers
    status
    enable
    disable
    set-provider

  video
    generate
    describe
    providers

  web
    search
    fetch
    providers

  embedding
    create
    providers
```

## 일반 작업

이 표는 일반적인 추론 작업을 해당하는 infer 명령에 매핑합니다.

| 작업                    | 명령                                                                | 참고                                                 |
| ----------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------- |
| 텍스트/모델 프롬프트 실행 | `openclaw infer model run --prompt "..." --json`                       | 기본적으로 일반적인 로컬 경로 사용                |
| 이미지 생성       | `openclaw infer image generate --prompt "..." --json`                  | 기존 파일에서 시작할 때 `image edit` 사용 |
| 이미지 파일 설명  | `openclaw infer image describe --file ./image.png --json`              | `--model`은 `&lt;provider/model&gt;`이어야 함                 |
| 오디오 전사        | `openclaw infer audio transcribe --file ./memo.m4a --json`             | `--model`은 `&lt;provider/model&gt;`이어야 함                 |
| 음성 합성       | `openclaw infer tts convert --text "..." --output ./speech.mp3 --json` | `tts status`는 게이트웨이 지향                     |
| 비디오 생성        | `openclaw infer video generate --prompt "..." --json`                  |                                                      |
| 비디오 파일 설명   | `openclaw infer video describe --file ./clip.mp4 --json`               | `--model`은 `&lt;provider/model&gt;`이어야 함                 |
| 웹 검색          | `openclaw infer web search --query "..." --json`                       |                                                      |
| 웹 페이지 가져오기        | `openclaw infer web fetch --url https://example.com --json`            |                                                      |
| 임베딩 생성       | `openclaw infer embedding create --text "..." --json`                  |                                                      |

## 동작

- `openclaw infer ...`는 이러한 워크플로우의 기본 CLI 표면입니다.
- 출력이 다른 명령이나 스크립트에서 사용될 때 `--json`을 사용하세요.
- 특정 백엔드가 필요할 때 `--provider` 또는 `--model provider/model`을 사용하세요.
- `image describe`, `audio transcribe`, `video describe`의 경우 `--model`은 `&lt;provider/model&gt;` 형식을 사용해야 합니다.
- 상태 없는 실행 명령은 기본적으로 로컬입니다.
- 게이트웨이 관리 상태 명령은 기본적으로 게이트웨이입니다.
- 일반적인 로컬 경로는 게이트웨이가 실행 중일 필요가 없습니다.

## 모델

프로바이더 기반 텍스트 추론과 모델/프로바이더 검사에 `model`을 사용하세요.

```bash
openclaw infer model run --prompt "Reply with exactly: smoke-ok" --json
openclaw infer model run --prompt "Summarize this changelog entry" --provider openai --json
openclaw infer model providers --json
openclaw infer model inspect --name gpt-5.4 --json
```

참고사항:

- `model run`은 에이전트 런타임을 재사용하므로 프로바이더/모델 재정의가 일반적인 에이전트 실행처럼 동작합니다.
- `model auth login`, `model auth logout`, `model auth status`는 저장된 프로바이더 인증 상태를 관리합니다.

## 이미지

생성, 편집, 설명에 `image`를 사용하세요.

```bash
openclaw infer image generate --prompt "friendly lobster illustration" --json
openclaw infer image generate --prompt "cinematic product photo of headphones" --json
openclaw infer image describe --file ./photo.jpg --json
openclaw infer image describe --file ./ui-screenshot.png --model openai/gpt-4.1-mini --json
```

참고사항:

- 기존 입력 파일에서 시작할 때 `image edit`를 사용하세요.
- `image describe`의 경우 `--model`은 `&lt;provider/model&gt;`이어야 합니다.

## 오디오

파일 전사에 `audio`를 사용하세요.

```bash
openclaw infer audio transcribe --file ./memo.m4a --json
openclaw infer audio transcribe --file ./team-sync.m4a --language en --prompt "Focus on names and action items" --json
openclaw infer audio transcribe --file ./memo.m4a --model openai/whisper-1 --json
```

참고사항:

- `audio transcribe`는 실시간 세션 관리가 아닌 파일 전사를 위한 것입니다.
- `--model`은 `&lt;provider/model&gt;`이어야 합니다.

## TTS

음성 합성과 TTS 프로바이더 상태에 `tts`를 사용하세요.

```bash
openclaw infer tts convert --text "hello from openclaw" --output ./hello.mp3 --json
openclaw infer tts convert --text "Your build is complete" --output ./build-complete.mp3 --json
openclaw infer tts providers --json
openclaw infer tts status --json
```

참고사항:

- `tts status`는 게이트웨이 관리 TTS 상태를 반영하므로 기본적으로 게이트웨이입니다.
- `tts providers`, `tts voices`, `tts set-provider`를 사용하여 TTS 동작을 검사하고 구성하세요.

## 비디오

생성과 설명에 `video`를 사용하세요.

```bash
openclaw infer video generate --prompt "cinematic sunset over the ocean" --json
openclaw infer video generate --prompt "slow drone shot over a forest lake" --json
openclaw infer video describe --file ./clip.mp4 --json
openclaw infer video describe --file ./clip.mp4 --model openai/gpt-4.1-mini --json
```

참고사항:

- `video describe`의 경우 `--model`은 `&lt;provider/model&gt;`이어야 합니다.

## 웹

검색과 가져오기 워크플로우에 `web`을 사용하세요.

```bash
openclaw infer web search --query "OpenClaw docs" --json
openclaw infer web search --query "OpenClaw infer web providers" --json
openclaw infer web fetch --url https://docs.openclaw.ai/cli/infer --json
openclaw infer web providers --json
```

참고사항:

- `web providers`를 사용하여 사용 가능하고 구성되고 선택된 프로바이더를 검사하세요.

## 임베딩

벡터 생성과 임베딩 프로바이더 검사에 `embedding`을 사용하세요.

```bash
openclaw infer embedding create --text "friendly lobster" --json
openclaw infer embedding create --text "customer support ticket: delayed shipment" --model openai/text-embedding-3-large --json
openclaw infer embedding providers --json
```

## JSON 출력

Infer 명령은 공유 봉투 아래에 JSON 출력을 정규화합니다:

```json
{
  "ok": true,
  "capability": "image.generate",
  "transport": "local",
  "provider": "openai",
  "model": "gpt-image-1",
  "attempts": [],
  "outputs": []
}
```

최상위 필드는 안정적입니다:

- `ok`
- `capability`
- `transport`
- `provider`
- `model`
- `attempts`
- `outputs`
- `error`

## 일반적인 함정

```bash
# 잘못된 예
openclaw infer media image generate --prompt "friendly lobster"

# 올바른 예
openclaw infer image generate --prompt "friendly lobster"
```

```bash
# 잘못된 예
openclaw infer audio transcribe --file ./memo.m4a --model whisper-1 --json

# 올바른 예
openclaw infer audio transcribe --file ./memo.m4a --model openai/whisper-1 --json
```

## 참고사항

- `openclaw capability ...`는 `openclaw infer ...`의 별칭입니다.
