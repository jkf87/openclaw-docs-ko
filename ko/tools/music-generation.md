---
summary: "공유 프로바이더로 음악 생성, 워크플로우 기반 플러그인 포함"
read_when:
  - Generating music or audio via the agent
  - Configuring music generation providers and models
  - Understanding the music_generate tool parameters
title: "음악 생성"
---

# 음악 생성

`music_generate` 도구를 사용하면 에이전트가 Google, MiniMax, 워크플로우 구성된 ComfyUI와 같은 구성된 프로바이더가 있는 공유 음악 생성 기능을 통해 음악 또는 오디오를 생성할 수 있습니다.

공유 프로바이더 기반 에이전트 세션의 경우 OpenClaw는 백그라운드 작업으로 음악 생성을 시작하고 작업 원장에서 추적한 다음 트랙이 준비되면 에이전트를 다시 깨워 완성된 오디오를 원래 채널에 게시할 수 있도록 합니다.

<Note>
내장된 공유 도구는 적어도 하나의 음악 생성 프로바이더를 사용할 수 있을 때만 나타납니다. 에이전트 도구에서 `music_generate`가 보이지 않으면 `agents.defaults.musicGenerationModel`을 구성하거나 프로바이더 API 키를 설정하십시오.
</Note>

## 빠른 시작

### 공유 프로바이더 기반 생성

1. 적어도 하나의 프로바이더에 대한 API 키를 설정합니다. 예: `GEMINI_API_KEY` 또는 `MINIMAX_API_KEY`.
2. 선택적으로 선호하는 모델을 설정합니다:

```json5
{
  agents: {
    defaults: {
      musicGenerationModel: {
        primary: "google/lyria-3-clip-preview",
      },
    },
  },
}
```

3. 에이전트에 요청합니다: _"Generate an upbeat synthpop track about a night drive through a neon city."_

에이전트는 자동으로 `music_generate`를 호출합니다. 도구 허용 목록 추가가 필요하지 않습니다.

세션 기반 에이전트 실행 없이 직접 동기식 컨텍스트의 경우, 내장 도구는 여전히 인라인 생성으로 폴백하고 도구 결과에서 최종 미디어 경로를 반환합니다.

예시 프롬프트:

```text
Generate a cinematic piano track with soft strings and no vocals.
```

```text
Generate an energetic chiptune loop about launching a rocket at sunrise.
```

### 워크플로우 기반 Comfy 생성

번들된 `comfy` 플러그인은 음악 생성 프로바이더 레지스트리를 통해 공유 `music_generate` 도구에 연결됩니다.

1. 워크플로우 JSON 및 프롬프트/출력 노드로 `models.providers.comfy.music`을 구성합니다.
2. Comfy Cloud를 사용하는 경우 `COMFY_API_KEY` 또는 `COMFY_CLOUD_API_KEY`를 설정합니다.
3. 에이전트에 음악을 요청하거나 도구를 직접 호출합니다.

예시:

```text
/tool music_generate prompt="Warm ambient synth loop with soft tape texture"
```

## 공유 번들 프로바이더 지원

| 프로바이더 | 기본 모델              | 참조 입력         | 지원 제어                                                 | API 키                                 |
| ---------- | ---------------------- | ----------------- | --------------------------------------------------------- | -------------------------------------- |
| ComfyUI    | `workflow`             | 이미지 최대 1개   | 워크플로우 정의 음악 또는 오디오                          | `COMFY_API_KEY`, `COMFY_CLOUD_API_KEY` |
| Google     | `lyria-3-clip-preview` | 이미지 최대 10개  | `lyrics`, `instrumental`, `format`                        | `GEMINI_API_KEY`, `GOOGLE_API_KEY`     |
| MiniMax    | `music-2.5+`           | 없음              | `lyrics`, `instrumental`, `durationSeconds`, `format=mp3` | `MINIMAX_API_KEY`                      |

### 선언된 기능 매트릭스

이것은 `music_generate`, 계약 테스트, 공유 라이브 스윕에서 사용하는 명시적 모드 계약입니다.

| 프로바이더 | `generate` | `edit` | 편집 제한  | 공유 라이브 레인                                                           |
| ---------- | ---------- | ------ | ---------- | ------------------------------------------------------------------------- |
| ComfyUI    | Yes        | Yes    | 이미지 1개 | 공유 스윕에 없음; `extensions/comfy/comfy.live.test.ts`에서 커버됨        |
| Google     | Yes        | Yes    | 이미지 10개 | `generate`, `edit`                                                       |
| MiniMax    | Yes        | No     | 없음       | `generate`                                                                |

런타임에 사용 가능한 공유 프로바이더와 모델을 검사하려면 `action: "list"`를 사용하십시오:

```text
/tool music_generate action=list
```

활성 세션 기반 음악 작업을 검사하려면 `action: "status"`를 사용하십시오:

```text
/tool music_generate action=status
```

직접 생성 예시:

```text
/tool music_generate prompt="Dreamy lo-fi hip hop with vinyl texture and gentle rain" instrumental=true
```

## 내장 도구 파라미터

| 파라미터          | 유형     | 설명                                                                                              |
| ----------------- | -------- | ------------------------------------------------------------------------------------------------- |
| `prompt`          | string   | 음악 생성 프롬프트 (`action: "generate"`에 필수)                                                  |
| `action`          | string   | `"generate"` (기본값), 현재 세션 작업을 위한 `"status"`, 또는 프로바이더 검사를 위한 `"list"`    |
| `model`           | string   | 프로바이더/모델 재정의, 예: `google/lyria-3-pro-preview` 또는 `comfy/workflow`                    |
| `lyrics`          | string   | 프로바이더가 명시적 가사 입력을 지원하는 경우 선택적 가사                                        |
| `instrumental`    | boolean  | 프로바이더가 지원하는 경우 기악 전용 출력 요청                                                   |
| `image`           | string   | 단일 참조 이미지 경로 또는 URL                                                                    |
| `images`          | string[] | 여러 참조 이미지 (최대 10개)                                                                      |
| `durationSeconds` | number   | 프로바이더가 지속 시간 힌트를 지원하는 경우 목표 지속 시간 (초)                                   |
| `format`          | string   | 프로바이더가 지원하는 경우 출력 형식 힌트 (`mp3` 또는 `wav`)                                     |
| `filename`        | string   | 출력 파일명 힌트                                                                                  |

모든 프로바이더가 모든 파라미터를 지원하는 것은 아닙니다. OpenClaw는 여전히 제출 전에 입력 수와 같은 하드 제한을 검증합니다. 프로바이더가 지속 시간을 지원하지만 요청된 값보다 짧은 최대값을 사용하는 경우 OpenClaw는 자동으로 가장 가까운 지원 지속 시간으로 제한합니다. 선택된 프로바이더나 모델이 이를 지원할 수 없는 경우 진정으로 지원되지 않는 선택적 힌트는 경고와 함께 무시됩니다.

도구 결과는 적용된 설정을 보고합니다. OpenClaw가 프로바이더 폴백 중 지속 시간을 제한하는 경우 반환된 `durationSeconds`는 제출된 값을 반영하고 `details.normalization.durationSeconds`는 요청-적용 매핑을 표시합니다.

## 공유 프로바이더 기반 경로의 비동기 동작

- 세션 기반 에이전트 실행: `music_generate`는 백그라운드 작업을 생성하고 즉시 시작됨/작업 응답을 반환하며, 나중에 후속 에이전트 메시지로 완성된 트랙을 게시합니다.
- 중복 방지: 해당 백그라운드 작업이 여전히 `queued` 또는 `running` 상태인 동안 동일한 세션에서 나중의 `music_generate` 호출은 새 생성을 시작하는 대신 작업 상태를 반환합니다.
- 상태 조회: 새 작업을 시작하지 않고 활성 세션 기반 음악 작업을 검사하려면 `action: "status"`를 사용하십시오.
- 작업 추적: 생성의 대기 중, 실행 중, 종료 상태를 검사하려면 `openclaw tasks list` 또는 `openclaw tasks show <taskId>`를 사용하십시오.
- 완료 깨우기: OpenClaw는 내부 완료 이벤트를 동일한 세션에 다시 주입하여 모델이 사용자 대면 후속 조치를 직접 작성할 수 있도록 합니다.
- 프롬프트 힌트: 동일한 세션의 나중 사용자/수동 턴은 음악 작업이 이미 진행 중일 때 작은 런타임 힌트를 받아 모델이 맹목적으로 `music_generate`를 다시 호출하지 않도록 합니다.
- 세션 없음 폴백: 실제 에이전트 세션이 없는 직접/로컬 컨텍스트는 여전히 인라인으로 실행되고 동일한 턴에서 최종 오디오 결과를 반환합니다.

### 작업 수명 주기

각 `music_generate` 요청은 네 가지 상태를 거칩니다:

1. **queued** -- 작업이 생성되고 프로바이더가 수락을 기다리는 중.
2. **running** -- 프로바이더가 처리 중 (프로바이더 및 지속 시간에 따라 일반적으로 30초~3분 소요).
3. **succeeded** -- 트랙 준비됨; 에이전트가 깨어나 대화에 게시합니다.
4. **failed** -- 프로바이더 오류 또는 타임아웃; 에이전트가 오류 세부 정보와 함께 깨어납니다.

CLI에서 상태 확인:

```bash
openclaw tasks list
openclaw tasks show <taskId>
openclaw tasks cancel <taskId>
```

중복 방지: 현재 세션에 대해 음악 작업이 이미 `queued` 또는 `running` 상태인 경우 `music_generate`는 새 작업을 시작하는 대신 기존 작업 상태를 반환합니다. 새 생성을 트리거하지 않고 명시적으로 확인하려면 `action: "status"`를 사용하십시오.

## 설정

### 모델 선택

```json5
{
  agents: {
    defaults: {
      musicGenerationModel: {
        primary: "google/lyria-3-clip-preview",
        fallbacks: ["minimax/music-2.5+"],
      },
    },
  },
}
```

### 프로바이더 선택 순서

음악을 생성할 때 OpenClaw는 다음 순서로 프로바이더를 시도합니다:

1. 에이전트가 하나를 지정하는 경우 도구 호출의 `model` 파라미터
2. 설정의 `musicGenerationModel.primary`
3. 순서대로 `musicGenerationModel.fallbacks`
4. 인증 기반 프로바이더 기본값만 사용하는 자동 감지:
   - 현재 기본 프로바이더 먼저
   - 나머지 등록된 음악 생성 프로바이더를 프로바이더 ID 순서로

프로바이더가 실패하면 다음 후보가 자동으로 시도됩니다. 모두 실패하면 오류에 각 시도의 세부 정보가 포함됩니다.

음악 생성이 명시적 `model`, `primary`, `fallbacks` 항목만 사용하도록 하려면 `agents.defaults.mediaGenerationAutoProviderFallback: false`를 설정하십시오.

## 프로바이더 참고 사항

- Google은 Lyria 3 배치 생성을 사용합니다. 현재 번들된 흐름은 프롬프트, 선택적 가사 텍스트, 선택적 참조 이미지를 지원합니다.
- MiniMax는 배치 `music_generation` 엔드포인트를 사용합니다. 현재 번들된 흐름은 프롬프트, 선택적 가사, 기악 모드, 지속 시간 조정, mp3 출력을 지원합니다.
- ComfyUI 지원은 워크플로우 기반이며 구성된 그래프와 프롬프트/출력 필드에 대한 노드 매핑에 따라 다릅니다.

## 프로바이더 기능 모드

공유 음악 생성 계약은 이제 명시적 모드 선언을 지원합니다:

- 프롬프트 전용 생성을 위한 `generate`
- 요청에 하나 이상의 참조 이미지가 포함된 경우의 `edit`

새 프로바이더 구현은 명시적 모드 블록을 선호해야 합니다:

```typescript
capabilities: {
  generate: {
    maxTracks: 1,
    supportsLyrics: true,
    supportsFormat: true,
  },
  edit: {
    enabled: true,
    maxTracks: 1,
    maxInputImages: 1,
    supportsFormat: true,
  },
}
```

`maxInputImages`, `supportsLyrics`, `supportsFormat`과 같은 레거시 평면 필드는 편집 지원을 광고하기에 충분하지 않습니다. 프로바이더는 라이브 테스트, 계약 테스트, 공유 `music_generate` 도구가 모드 지원을 결정론적으로 검증할 수 있도록 `generate`와 `edit`을 명시적으로 선언해야 합니다.

## 올바른 경로 선택

- 모델 선택, 프로바이더 장애 조치, 내장된 비동기 작업/상태 흐름이 필요한 경우 공유 프로바이더 기반 경로를 사용하십시오.
- 사용자 지정 워크플로우 그래프 또는 공유 번들 음악 기능에 포함되지 않은 프로바이더가 필요한 경우 ComfyUI와 같은 플러그인 경로를 사용하십시오.
- ComfyUI 특정 동작을 디버깅 중인 경우 [ComfyUI](/providers/comfy)를 참조하십시오. 공유 프로바이더 동작을 디버깅 중인 경우 [Google (Gemini)](/providers/google) 또는 [MiniMax](/providers/minimax)로 시작하십시오.

## 라이브 테스트

공유 번들 프로바이더에 대한 옵트인 라이브 커버리지:

```bash
OPENCLAW_LIVE_TEST=1 pnpm test:live -- extensions/music-generation-providers.live.test.ts
```

레포 래퍼:

```bash
pnpm test:live:media music
```

이 라이브 파일은 `~/.profile`에서 누락된 프로바이더 환경 변수를 로드하고, 저장된 인증 프로파일보다 라이브/환경 API 키를 우선시하며, 프로바이더가 편집 모드를 활성화하는 경우 `generate`와 선언된 `edit` 커버리지 모두를 실행합니다.

오늘 그것이 의미하는 것:

- `google`: `generate` 및 `edit`
- `minimax`: `generate`만
- `comfy`: 공유 프로바이더 스윕이 아닌 별도의 Comfy 라이브 커버리지

번들된 ComfyUI 음악 경로에 대한 옵트인 라이브 커버리지:

```bash
OPENCLAW_LIVE_TEST=1 COMFY_LIVE_TEST=1 pnpm test:live -- extensions/comfy/comfy.live.test.ts
```

Comfy 라이브 파일은 해당 섹션이 구성되면 comfy 이미지 및 비디오 워크플로우도 커버합니다.

## 관련 항목

- [백그라운드 작업](/automation/tasks) - 분리된 `music_generate` 실행을 위한 작업 추적
- [설정 레퍼런스](/gateway/configuration-reference#agent-defaults) - `musicGenerationModel` 설정
- [ComfyUI](/providers/comfy)
- [Google (Gemini)](/providers/google)
- [MiniMax](/providers/minimax)
- [모델](/concepts/models) - 모델 설정 및 장애 조치
- [도구 개요](/tools)
