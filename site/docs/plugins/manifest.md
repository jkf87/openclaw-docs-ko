---
title: "플러그인 매니페스트"
description: "플러그인 매니페스트 + JSON 스키마 요구사항(엄격한 구성 유효성 검사)"
---

# 플러그인 매니페스트 (openclaw.plugin.json)

이 페이지는 **네이티브 OpenClaw 플러그인 매니페스트**에 대한 것입니다.

호환 번들 레이아웃은 [플러그인 번들](/plugins/bundles)을 참조하십시오.

호환 번들 형식은 다른 매니페스트 파일을 사용합니다:

- Codex 번들: `.codex-plugin/plugin.json`
- Claude 번들: `.claude-plugin/plugin.json` 또는 매니페스트 없이 기본 Claude 구성 요소
  레이아웃
- Cursor 번들: `.cursor-plugin/plugin.json`

OpenClaw는 이러한 번들 레이아웃도 자동 감지하지만, 여기에서 설명하는
`openclaw.plugin.json` 스키마에 대해 유효성을 검사하지는 않습니다.

호환 번들의 경우, OpenClaw는 현재 번들 메타데이터 및 선언된 스킬 루트,
Claude 명령 루트, Claude 번들 `settings.json` 기본값, Claude 번들 LSP 기본값,
레이아웃이 OpenClaw 런타임 예상과 일치하는 경우 지원되는 훅 팩을 읽습니다.

모든 네이티브 OpenClaw 플러그인은 **플러그인 루트**에 `openclaw.plugin.json` 파일을
**반드시** 제공해야 합니다. OpenClaw는 이 매니페스트를 사용하여 **플러그인 코드를 실행하지 않고**
구성을 유효성 검사합니다. 누락되거나 잘못된 매니페스트는 플러그인 오류로 처리되어
구성 유효성 검사를 차단합니다.

전체 플러그인 시스템 가이드: [플러그인](/tools/plugin).
네이티브 기능 모델 및 현재 외부 호환성 지침:
[기능 모델](/plugins/architecture#public-capability-model).

## 이 파일의 역할

`openclaw.plugin.json`은 OpenClaw가 플러그인 코드를 로드하기 전에 읽는 메타데이터입니다.

다음에 사용하십시오:

- 플러그인 신원
- 구성 유효성 검사
- 플러그인 런타임 부팅 없이 사용 가능해야 하는 인증 및 온보딩 메타데이터
- 플러그인 런타임 로드 전에 해결되어야 하는 별칭 및 자동 활성화 메타데이터
- 런타임 로드 전에 플러그인을 자동 활성화해야 하는 단축 모델 패밀리 소유권 메타데이터
- 번들 호환 배선 및 계약 적용 범위에 사용되는 정적 기능 소유권 스냅샷
- 런타임 로드 없이 카탈로그 및 유효성 검사 표면으로 병합되어야 하는 채널별 구성 메타데이터
- 구성 UI 힌트

다음에는 사용하지 마십시오:

- 런타임 동작 등록
- 코드 엔트리포인트 선언
- npm 설치 메타데이터

이들은 플러그인 코드와 `package.json`에 속합니다.

## 최소 예시

```json
{
  "id": "voice-call",
  "configSchema": {
    "type": "object",
    "additionalProperties": false,
    "properties": {}
  }
}
```

## 풍부한 예시

```json
{
  "id": "openrouter",
  "name": "OpenRouter",
  "description": "OpenRouter provider plugin",
  "version": "1.0.0",
  "providers": ["openrouter"],
  "modelSupport": {
    "modelPrefixes": ["router-"]
  },
  "cliBackends": ["openrouter-cli"],
  "providerAuthEnvVars": {
    "openrouter": ["OPENROUTER_API_KEY"]
  },
  "providerAuthAliases": {
    "openrouter-coding": "openrouter"
  },
  "channelEnvVars": {
    "openrouter-chatops": ["OPENROUTER_CHATOPS_TOKEN"]
  },
  "providerAuthChoices": [
    {
      "provider": "openrouter",
      "method": "api-key",
      "choiceId": "openrouter-api-key",
      "choiceLabel": "OpenRouter API key",
      "groupId": "openrouter",
      "groupLabel": "OpenRouter",
      "optionKey": "openrouterApiKey",
      "cliFlag": "--openrouter-api-key",
      "cliOption": "--openrouter-api-key &lt;key&gt;",
      "cliDescription": "OpenRouter API key",
      "onboardingScopes": ["text-inference"]
    }
  ],
  "uiHints": {
    "apiKey": {
      "label": "API key",
      "placeholder": "sk-or-v1-...",
      "sensitive": true
    }
  },
  "configSchema": {
    "type": "object",
    "additionalProperties": false,
    "properties": {
      "apiKey": {
        "type": "string"
      }
    }
  }
}
```

## 최상위 필드 참조

| 필드                                | 필수 여부 | 타입                             | 의미                                                                                                                                                                                                         |
| ----------------------------------- | -------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `id`                                | 예       | `string`                         | 표준 플러그인 id. `plugins.entries.&lt;id&gt;`에서 사용되는 id입니다.                                                                                                                                               |
| `configSchema`                      | 예       | `object`                         | 이 플러그인 구성의 인라인 JSON 스키마입니다.                                                                                                                                                                  |
| `enabledByDefault`                  | 아니요   | `true`                           | 번들 플러그인을 기본적으로 활성화로 표시합니다. 생략하거나 `true` 이외의 값을 설정하면 플러그인이 기본적으로 비활성화됩니다.                                                                                   |
| `legacyPluginIds`                   | 아니요   | `string[]`                       | 이 표준 플러그인 id로 정규화되는 레거시 id입니다.                                                                                                                                                            |
| `autoEnableWhenConfiguredProviders` | 아니요   | `string[]`                       | 인증, 구성, 또는 모델 참조에서 언급될 때 이 플러그인을 자동 활성화해야 하는 프로바이더 id입니다.                                                                                                              |
| `kind`                              | 아니요   | `"memory"` \| `"context-engine"` | `plugins.slots.*`에서 사용하는 독점 플러그인 종류를 선언합니다.                                                                                                                                              |
| `channels`                          | 아니요   | `string[]`                       | 이 플러그인이 소유한 채널 id입니다. 검색 및 구성 유효성 검사에 사용됩니다.                                                                                                                                    |
| `providers`                         | 아니요   | `string[]`                       | 이 플러그인이 소유한 프로바이더 id입니다.                                                                                                                                                                     |
| `modelSupport`                      | 아니요   | `object`                         | 런타임 이전에 플러그인을 자동 로드하는 데 사용되는 매니페스트 소유 단축 모델 패밀리 메타데이터입니다.                                                                                                         |
| `cliBackends`                       | 아니요   | `string[]`                       | 이 플러그인이 소유한 CLI 추론 백엔드 id입니다. 명시적 구성 참조에서 시작 시 자동 활성화에 사용됩니다.                                                                                                         |
| `providerAuthEnvVars`               | 아니요   | `Record&lt;string, string[]&gt;`       | 플러그인 코드를 로드하지 않고 OpenClaw가 검사할 수 있는 저렴한 프로바이더-인증 환경 메타데이터입니다.                                                                                                         |
| `providerAuthAliases`               | 아니요   | `Record&lt;string, string&gt;`         | 인증 조회를 위해 다른 프로바이더 id를 재사용해야 하는 프로바이더 id입니다. 예를 들어 기본 프로바이더 API 키 및 인증 프로필을 공유하는 코딩 프로바이더입니다.                                                  |
| `channelEnvVars`                    | 아니요   | `Record&lt;string, string[]&gt;`       | 플러그인 코드를 로드하지 않고 OpenClaw가 검사할 수 있는 저렴한 채널 환경 메타데이터입니다. 일반적인 시작/구성 헬퍼가 볼 수 있어야 하는 환경 기반 채널 설정 또는 인증 표면에 사용하십시오.                   |
| `providerAuthChoices`               | 아니요   | `object[]`                       | 온보딩 피커, 선호 프로바이더 해결, 및 간단한 CLI 플래그 배선을 위한 저렴한 인증 선택 메타데이터입니다.                                                                                                        |
| `contracts`                         | 아니요   | `object`                         | 음성, 실시간 전사, 실시간 음성, 미디어 이해, 이미지 생성, 음악 생성, 동영상 생성, 웹 페치, 웹 검색, 도구 소유권을 위한 정적 번들 기능 스냅샷입니다.                                                          |
| `channelConfigs`                    | 아니요   | `Record&lt;string, object&gt;`         | 런타임 로드 전에 검색 및 유효성 검사 표면으로 병합되는 매니페스트 소유 채널 구성 메타데이터입니다.                                                                                                            |
| `skills`                            | 아니요   | `string[]`                       | 로드할 스킬 디렉토리로, 플러그인 루트에 상대적입니다.                                                                                                                                                        |
| `name`                              | 아니요   | `string`                         | 사람이 읽을 수 있는 플러그인 이름입니다.                                                                                                                                                                     |
| `description`                       | 아니요   | `string`                         | 플러그인 표면에 표시되는 짧은 요약입니다.                                                                                                                                                                    |
| `version`                           | 아니요   | `string`                         | 정보용 플러그인 버전입니다.                                                                                                                                                                                  |
| `uiHints`                           | 아니요   | `Record&lt;string, object&gt;`         | 구성 필드를 위한 UI 레이블, 자리 표시자, 민감도 힌트입니다.                                                                                                                                                  |

## providerAuthChoices 참조

각 `providerAuthChoices` 항목은 하나의 온보딩 또는 인증 선택을 설명합니다.
OpenClaw는 프로바이더 런타임 로드 전에 이를 읽습니다.

| 필드                  | 필수 여부 | 타입                                            | 의미                                                                                            |
| --------------------- | -------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `provider`            | 예       | `string`                                        | 이 선택이 속하는 프로바이더 id입니다.                                                           |
| `method`              | 예       | `string`                                        | 디스패치할 인증 메서드 id입니다.                                                                |
| `choiceId`            | 예       | `string`                                        | 온보딩 및 CLI 흐름에서 사용되는 안정적인 인증 선택 id입니다.                                    |
| `choiceLabel`         | 아니요   | `string`                                        | 사용자 대면 레이블. 생략하면 OpenClaw는 `choiceId`로 폴백합니다.                                |
| `choiceHint`          | 아니요   | `string`                                        | 피커용 짧은 도움말 텍스트입니다.                                                                |
| `assistantPriority`   | 아니요   | `number`                                        | 값이 낮을수록 어시스턴트 기반 인터랙티브 피커에서 앞에 정렬됩니다.                              |
| `assistantVisibility` | 아니요   | `"visible"` \| `"manual-only"`                  | 수동 CLI 선택을 허용하면서 어시스턴트 피커에서 선택을 숨깁니다.                                  |
| `deprecatedChoiceIds` | 아니요   | `string[]`                                      | 이 대체 선택으로 사용자를 리디렉션해야 하는 레거시 선택 id입니다.                               |
| `groupId`             | 아니요   | `string`                                        | 관련 선택을 그룹화하기 위한 선택적 그룹 id입니다.                                               |
| `groupLabel`          | 아니요   | `string`                                        | 해당 그룹의 사용자 대면 레이블입니다.                                                           |
| `groupHint`           | 아니요   | `string`                                        | 그룹의 짧은 도움말 텍스트입니다.                                                                |
| `optionKey`           | 아니요   | `string`                                        | 간단한 단일 플래그 인증 흐름을 위한 내부 옵션 키입니다.                                         |
| `cliFlag`             | 아니요   | `string`                                        | CLI 플래그 이름, 예: `--openrouter-api-key`.                                                    |
| `cliOption`           | 아니요   | `string`                                        | 전체 CLI 옵션 형식, 예: `--openrouter-api-key &lt;key&gt;`.                                           |
| `cliDescription`      | 아니요   | `string`                                        | CLI 도움말에서 사용되는 설명입니다.                                                             |
| `onboardingScopes`    | 아니요   | `Array<"text-inference" \| "image-generation">` | 이 선택이 표시되어야 하는 온보딩 표면입니다. 생략하면 기본값은 `["text-inference"]`입니다.      |

## uiHints 참조

`uiHints`는 구성 필드 이름에서 소규모 렌더링 힌트로의 맵입니다.

```json
{
  "uiHints": {
    "apiKey": {
      "label": "API key",
      "help": "Used for OpenRouter requests",
      "placeholder": "sk-or-v1-...",
      "sensitive": true
    }
  }
}
```

각 필드 힌트는 다음을 포함할 수 있습니다:

| 필드          | 타입       | 의미                                    |
| ------------- | ---------- | --------------------------------------- |
| `label`       | `string`   | 사용자 대면 필드 레이블입니다.          |
| `help`        | `string`   | 짧은 도움말 텍스트입니다.               |
| `tags`        | `string[]` | 선택적 UI 태그입니다.                   |
| `advanced`    | `boolean`  | 필드를 고급으로 표시합니다.             |
| `sensitive`   | `boolean`  | 필드를 비밀 또는 민감으로 표시합니다.   |
| `placeholder` | `string`   | 양식 입력의 자리 표시자 텍스트입니다.   |

## contracts 참조

플러그인 런타임을 임포트하지 않고 OpenClaw가 읽을 수 있는
정적 기능 소유권 메타데이터에만 `contracts`를 사용하십시오.

```json
{
  "contracts": {
    "speechProviders": ["openai"],
    "realtimeTranscriptionProviders": ["openai"],
    "realtimeVoiceProviders": ["openai"],
    "mediaUnderstandingProviders": ["openai", "openai-codex"],
    "imageGenerationProviders": ["openai"],
    "videoGenerationProviders": ["qwen"],
    "webFetchProviders": ["firecrawl"],
    "webSearchProviders": ["gemini"],
    "tools": ["firecrawl_search", "firecrawl_scrape"]
  }
}
```

각 목록은 선택 사항입니다:

| 필드                             | 타입       | 의미                                                           |
| -------------------------------- | ---------- | -------------------------------------------------------------- |
| `speechProviders`                | `string[]` | 이 플러그인이 소유한 음성 프로바이더 id입니다.                 |
| `realtimeTranscriptionProviders` | `string[]` | 이 플러그인이 소유한 실시간 전사 프로바이더 id입니다.          |
| `realtimeVoiceProviders`         | `string[]` | 이 플러그인이 소유한 실시간 음성 프로바이더 id입니다.          |
| `mediaUnderstandingProviders`    | `string[]` | 이 플러그인이 소유한 미디어 이해 프로바이더 id입니다.          |
| `imageGenerationProviders`       | `string[]` | 이 플러그인이 소유한 이미지 생성 프로바이더 id입니다.          |
| `videoGenerationProviders`       | `string[]` | 이 플러그인이 소유한 동영상 생성 프로바이더 id입니다.          |
| `webFetchProviders`              | `string[]` | 이 플러그인이 소유한 웹 페치 프로바이더 id입니다.              |
| `webSearchProviders`             | `string[]` | 이 플러그인이 소유한 웹 검색 프로바이더 id입니다.              |
| `tools`                          | `string[]` | 번들 계약 검사를 위해 이 플러그인이 소유한 에이전트 도구 이름입니다. |

## channelConfigs 참조

채널 플러그인이 런타임 로드 전에 저렴한 구성 메타데이터가 필요할 때
`channelConfigs`를 사용하십시오.

```json
{
  "channelConfigs": {
    "matrix": {
      "schema": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "homeserverUrl": { "type": "string" }
        }
      },
      "uiHints": {
        "homeserverUrl": {
          "label": "Homeserver URL",
          "placeholder": "https://matrix.example.com"
        }
      },
      "label": "Matrix",
      "description": "Matrix homeserver connection",
      "preferOver": ["matrix-legacy"]
    }
  }
}
```

각 채널 항목은 다음을 포함할 수 있습니다:

| 필드          | 타입                     | 의미                                                                                      |
| ------------- | ------------------------ | ----------------------------------------------------------------------------------------- |
| `schema`      | `object`                 | `channels.&lt;id&gt;`의 JSON 스키마. 선언된 각 채널 구성 항목에 필요합니다.                     |
| `uiHints`     | `Record&lt;string, object&gt;` | 해당 채널 구성 섹션에 대한 선택적 UI 레이블/자리 표시자/민감도 힌트입니다.               |
| `label`       | `string`                 | 런타임 메타데이터가 준비되지 않은 경우 피커 및 검사 표면으로 병합되는 채널 레이블입니다. |
| `description` | `string`                 | 검사 및 카탈로그 표면을 위한 짧은 채널 설명입니다.                                       |
| `preferOver`  | `string[]`               | 이 채널이 선택 표면에서 우선해야 하는 레거시 또는 낮은 우선순위 플러그인 id입니다.        |

## modelSupport 참조

런타임 로드 전에 `gpt-5.4` 또는 `claude-sonnet-4.6`과 같은 단축 모델 id에서
프로바이더 플러그인을 추론해야 할 때 `modelSupport`를 사용하십시오.

```json
{
  "modelSupport": {
    "modelPrefixes": ["gpt-", "o1", "o3", "o4"],
    "modelPatterns": ["^computer-use-preview"]
  }
}
```

OpenClaw는 다음 우선순위를 적용합니다:

- 명시적 `provider/model` 참조는 소유 `providers` 매니페스트 메타데이터를 사용합니다
- `modelPatterns`가 `modelPrefixes`보다 우선합니다
- 하나의 비번들 플러그인과 하나의 번들 플러그인이 모두 일치하면 비번들 플러그인이 이깁니다
- 사용자 또는 구성이 프로바이더를 지정할 때까지 나머지 모호함은 무시됩니다

필드:

| 필드            | 타입       | 의미                                                                           |
| --------------- | ---------- | ------------------------------------------------------------------------------- |
| `modelPrefixes` | `string[]` | 단축 모델 id에 대해 `startsWith`로 매칭되는 접두사입니다.                      |
| `modelPatterns` | `string[]` | 프로필 접미사 제거 후 단축 모델 id에 대해 매칭되는 정규식 소스입니다.          |

레거시 최상위 기능 키는 더 이상 사용되지 않습니다. `openclaw doctor --fix`를 사용하여
`speechProviders`, `realtimeTranscriptionProviders`,
`realtimeVoiceProviders`, `mediaUnderstandingProviders`,
`imageGenerationProviders`, `videoGenerationProviders`,
`webFetchProviders`, `webSearchProviders`를 `contracts` 아래로 이동하십시오;
일반 매니페스트 로딩은 더 이상 이러한 최상위 필드를 기능 소유권으로 처리하지 않습니다.

## 매니페스트 대 package.json

두 파일은 서로 다른 역할을 합니다:

| 파일                   | 사용 목적                                                                                                               |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `openclaw.plugin.json` | 플러그인 코드 실행 전에 존재해야 하는 검색, 구성 유효성 검사, 인증 선택 메타데이터, 및 UI 힌트                          |
| `package.json`         | npm 메타데이터, 의존성 설치, 엔트리포인트, 설치 게이팅, 설정, 또는 카탈로그 메타데이터에 사용되는 `openclaw` 블록     |

어느 파일에 메타데이터가 속하는지 확실하지 않으면 이 규칙을 사용하십시오:

- 플러그인 코드를 로드하기 전에 OpenClaw가 알아야 하는 경우 `openclaw.plugin.json`에 넣으십시오
- 패키징, 엔트리 파일, 또는 npm 설치 동작에 관한 것이면 `package.json`에 넣으십시오

### 검색에 영향을 미치는 package.json 필드

일부 사전 런타임 플러그인 메타데이터는 `openclaw.plugin.json` 대신 의도적으로
`package.json`의 `openclaw` 블록에 있습니다.

중요한 예시:

| 필드                                                             | 의미                                                                                                                                         |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `openclaw.extensions`                                             | 네이티브 플러그인 엔트리포인트를 선언합니다.                                                                                                 |
| `openclaw.setupEntry`                                             | 온보딩 및 지연된 채널 시작 시 사용되는 경량 설정 전용 엔트리포인트입니다.                                                                     |
| `openclaw.channel`                                                | 레이블, 문서 경로, 별칭, 선택 텍스트와 같은 저렴한 채널 카탈로그 메타데이터입니다.                                                           |
| `openclaw.channel.configuredState`                                | "환경 전용 설정이 이미 있는가?"라는 질문에 전체 채널 런타임 로드 없이 답할 수 있는 경량 구성 상태 검사기 메타데이터입니다.                     |
| `openclaw.channel.persistedAuthState`                             | "이미 로그인된 것이 있는가?"라는 질문에 전체 채널 런타임 로드 없이 답할 수 있는 경량 지속 인증 상태 검사기 메타데이터입니다.                   |
| `openclaw.install.npmSpec` / `openclaw.install.localPath`         | 번들 및 외부 게시 플러그인의 설치/업데이트 힌트입니다.                                                                                       |
| `openclaw.install.defaultChoice`                                  | 여러 설치 소스를 사용할 수 있을 때 선호하는 설치 경로입니다.                                                                                  |
| `openclaw.install.minHostVersion`                                 | `>=2026.3.22`와 같은 semver 하한을 사용하는 최소 지원 OpenClaw 호스트 버전입니다.                                                            |
| `openclaw.install.allowInvalidConfigRecovery`                     | 구성이 잘못된 경우 좁은 번들 플러그인 재설치 복구 경로를 허용합니다.                                                                         |
| `openclaw.startup.deferConfiguredChannelFullLoadUntilAfterListen` | 전체 채널 플러그인보다 먼저 설정 전용 채널 표면이 로드되도록 합니다.                                                                          |

`openclaw.install.minHostVersion`은 설치 및 매니페스트 레지스트리 로딩 시 모두 적용됩니다.
유효하지 않은 값은 거부되고, 유효하지만 더 새로운 값은 이전 호스트에서 플러그인을 건너뜁니다.

`openclaw.install.allowInvalidConfigRecovery`는 의도적으로 좁습니다. 임의로 손상된 구성을
설치 가능하게 만들지는 않습니다. 오늘날 설치 흐름이 특정 오래된 번들 플러그인 업그레이드
실패(예: 누락된 번들 플러그인 경로 또는 동일한 번들 플러그인의 오래된 `channels.&lt;id&gt;` 항목)에서
복구할 수 있도록 허용합니다. 관련 없는 구성 오류는 여전히 설치를 차단하고 운영자를
`openclaw doctor --fix`로 안내합니다.

`openclaw.channel.persistedAuthState`는 작은 검사기 모듈의 패키지 메타데이터입니다:

```json
{
  "openclaw": {
    "channel": {
      "id": "whatsapp",
      "persistedAuthState": {
        "specifier": "./auth-presence",
        "exportName": "hasAnyWhatsAppAuth"
      }
    }
  }
}
```

설정, doctor, 또는 구성 상태 흐름에서 전체 채널 플러그인이 로드되기 전에 저렴한
yes/no 인증 프로브가 필요할 때 사용하십시오. 대상 내보내기는 지속된 상태만 읽는 소규모
함수여야 합니다; 전체 채널 런타임 배럴을 통해 라우팅하지 마십시오.

`openclaw.channel.configuredState`는 저렴한 환경 전용 구성 검사에 대해 동일한 형식을 따릅니다:

```json
{
  "openclaw": {
    "channel": {
      "id": "telegram",
      "configuredState": {
        "specifier": "./configured-state",
        "exportName": "hasTelegramConfiguredState"
      }
    }
  }
}
```

채널이 환경 또는 다른 작은 비런타임 입력에서 구성 상태에 답할 수 있을 때 사용하십시오.
검사에 전체 구성 해결 또는 실제 채널 런타임이 필요하다면, 해당 로직을 플러그인
`config.hasConfiguredState` 훅에 유지하십시오.

## JSON 스키마 요구사항

- **모든 플러그인은 JSON 스키마를 제공해야 합니다**, 구성이 없는 경우에도.
- 빈 스키마도 허용됩니다(예: `{ "type": "object", "additionalProperties": false }`).
- 스키마는 런타임이 아닌 구성 읽기/쓰기 시간에 유효성을 검사합니다.

## 유효성 검사 동작

- 알 수 없는 `channels.*` 키는 **오류**입니다, 플러그인 매니페스트에 채널 id가 선언된 경우를 제외하고.
- `plugins.entries.&lt;id&gt;`, `plugins.allow`, `plugins.deny`, `plugins.slots.*`는
  **검색 가능한** 플러그인 id를 참조해야 합니다. 알 수 없는 id는 **오류**입니다.
- 플러그인이 설치되었지만 매니페스트나 스키마가 손상되거나 누락된 경우,
  유효성 검사가 실패하고 Doctor가 플러그인 오류를 보고합니다.
- 플러그인 구성이 있지만 플러그인이 **비활성화**된 경우, 구성은 유지되고
  Doctor + 로그에 **경고**가 표시됩니다.

전체 `plugins.*` 스키마는 [구성 참조](/gateway/configuration)를 참조하십시오.

## 참고 사항

- 매니페스트는 로컬 파일시스템 로드를 포함한 **네이티브 OpenClaw 플러그인에 필수**입니다.
- 런타임은 여전히 플러그인 모듈을 별도로 로드합니다; 매니페스트는 오직
  검색 + 유효성 검사를 위한 것입니다.
- 네이티브 매니페스트는 JSON5로 파싱되므로 주석, 후행 쉼표, 따옴표 없는 키가
  최종 값이 여전히 객체인 한 허용됩니다.
- 문서화된 매니페스트 필드만 매니페스트 로더에서 읽힙니다. 커스텀 최상위 키를
  추가하지 마십시오.
- `providerAuthEnvVars`는 플러그인 런타임을 부팅하지 않고 환경 이름을 검사해야 하는
  인증 프로브, 환경 마커 유효성 검사, 및 유사한 프로바이더-인증 표면을 위한
  저렴한 메타데이터 경로입니다.
- `providerAuthAliases`는 프로바이더 변형이 코어에 해당 관계를 하드코딩하지 않고
  다른 프로바이더의 인증 환경 변수, 인증 프로필, 구성 기반 인증, API 키 온보딩 선택을
  재사용할 수 있도록 합니다.
- `channelEnvVars`는 플러그인 런타임을 부팅하지 않고 환경 이름을 검사해야 하는
  셸 환경 폴백, 설정 프롬프트, 및 유사한 채널 표면을 위한 저렴한 메타데이터 경로입니다.
- `providerAuthChoices`는 프로바이더 런타임 로드 전에 인증 선택 피커, `--auth-choice`
  해결, 선호 프로바이더 매핑, 간단한 온보딩 CLI 플래그 등록을 위한 저렴한 메타데이터 경로입니다.
  프로바이더 코드가 필요한 런타임 마법사 메타데이터는
  [프로바이더 런타임 훅](/plugins/architecture#provider-runtime-hooks)을 참조하십시오.
- 독점 플러그인 종류는 `plugins.slots.*`를 통해 선택됩니다.
  - `kind: "memory"`는 `plugins.slots.memory`에 의해 선택됩니다.
  - `kind: "context-engine"`은 `plugins.slots.contextEngine`에 의해 선택됩니다
    (기본값: 내장 `legacy`).
- 플러그인에 필요하지 않으면 `channels`, `providers`, `cliBackends`, `skills`를
  생략할 수 있습니다.
- 플러그인이 네이티브 모듈에 의존하는 경우, 빌드 단계와 패키지 관리자 허용 목록
  요구사항을 문서화하십시오(예: pnpm `allow-build-scripts`
  - `pnpm rebuild &lt;package&gt;`).

## 관련 문서

- [플러그인 빌드하기](/plugins/building-plugins) — 플러그인 시작하기
- [플러그인 아키텍처](/plugins/architecture) — 내부 아키텍처
- [SDK 개요](/plugins/sdk-overview) — 플러그인 SDK 참조
