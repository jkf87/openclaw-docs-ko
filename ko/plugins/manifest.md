---
summary: "플러그인 manifest + JSON schema 요구사항 (엄격한 config 검증)"
read_when:
  - OpenClaw 플러그인을 구축하고 있을 때
  - 플러그인 config schema를 배포하거나 플러그인 검증 오류를 디버깅해야 할 때
title: "플러그인 manifest"
---

이 페이지는 **네이티브 OpenClaw 플러그인 manifest**에 대한 것입니다.

호환 번들 레이아웃에 대해서는 [플러그인 번들](/plugins/bundles)을 참조하십시오.

호환 번들 형식은 서로 다른 manifest 파일을 사용합니다:

- Codex 번들: `.codex-plugin/plugin.json`
- Claude 번들: `.claude-plugin/plugin.json` 또는 manifest가 없는 기본 Claude 컴포넌트
  레이아웃
- Cursor 번들: `.cursor-plugin/plugin.json`

OpenClaw는 이러한 번들 레이아웃도 자동 감지하지만, 여기에 설명된
`openclaw.plugin.json` schema에 대해서는 검증되지 않습니다.

호환 번들의 경우, OpenClaw는 현재 레이아웃이 OpenClaw 런타임 기대와 일치할 때
번들 메타데이터와 선언된 skill 루트, Claude 명령 루트, Claude 번들
`settings.json` 기본값, Claude 번들 LSP 기본값 및 지원되는 hook 팩을 읽습니다.

모든 네이티브 OpenClaw 플러그인은 **plugin 루트**에 `openclaw.plugin.json`
파일을 **반드시** 배포해야 합니다. OpenClaw는 이 manifest를 사용하여
**플러그인 코드를 실행하지 않고** 구성을 검증합니다. manifest가 누락되었거나
잘못된 경우 플러그인 오류로 간주되어 config 검증이 차단됩니다.

전체 플러그인 시스템 가이드는 다음을 참조하십시오: [플러그인](/tools/plugin).
네이티브 capability 모델과 현재 외부 호환성 가이드는 다음을 참조하십시오:
[Capability 모델](/plugins/architecture#public-capability-model).

## 이 파일의 역할

`openclaw.plugin.json`은 OpenClaw가 **플러그인 코드를 로드하기 전에** 읽는
메타데이터입니다. 아래의 모든 항목은 플러그인 런타임을 부팅하지 않고도
검사할 수 있을 만큼 가벼워야 합니다.

**다음 용도로 사용하십시오:**

- 플러그인 식별, config 검증 및 config UI 힌트
- auth, 온보딩 및 setup 메타데이터 (별칭, auto-enable, provider 환경 변수, auth 선택지)
- 컨트롤 플레인 표면을 위한 activation 힌트
- 단축 모델 계열 소유권
- 정적 capability 소유권 스냅샷 (`contracts`)
- 공유 `openclaw qa` 호스트가 검사할 수 있는 QA 러너 메타데이터
- 카탈로그 및 검증 표면에 병합되는 channel별 config 메타데이터

**다음 용도로는 사용하지 마십시오:** 런타임 동작 등록, 코드 엔트리포인트 선언,
또는 npm 설치 메타데이터. 이들은 플러그인 코드와 `package.json`에 속합니다.

## 최소 예제

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

## 상세 예제

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
  "providerEndpoints": [
    {
      "endpointClass": "xai-native",
      "hosts": ["api.x.ai"]
    }
  ],
  "cliBackends": ["openrouter-cli"],
  "syntheticAuthRefs": ["openrouter-cli"],
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
      "cliOption": "--openrouter-api-key <key>",
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

## 최상위 필드 레퍼런스

| 필드                                 | 필수   | 타입                             | 의미                                                                                                                                                                                                              |
| ------------------------------------ | ------ | -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`                                 | 예     | `string`                         | 정규 플러그인 id. `plugins.entries.<id>`에서 사용되는 id입니다.                                                                                                                                                     |
| `configSchema`                       | 예     | `object`                         | 이 플러그인 config의 인라인 JSON Schema.                                                                                                                                                                            |
| `enabledByDefault`                   | 아니오 | `true`                           | 번들된 플러그인을 기본적으로 활성화된 것으로 표시합니다. 생략하거나 `true`가 아닌 값으로 설정하면 플러그인이 기본적으로 비활성화된 상태로 유지됩니다.                                                               |
| `legacyPluginIds`                    | 아니오 | `string[]`                       | 이 정규 플러그인 id로 정규화되는 레거시 id.                                                                                                                                                                         |
| `autoEnableWhenConfiguredProviders`  | 아니오 | `string[]`                       | auth, config 또는 모델 참조에서 언급될 때 이 플러그인을 자동으로 활성화해야 하는 provider id.                                                                                                                       |
| `kind`                               | 아니오 | `"memory"` \| `"context-engine"` | `plugins.slots.*`에서 사용하는 배타적 플러그인 kind를 선언합니다.                                                                                                                                                   |
| `channels`                           | 아니오 | `string[]`                       | 이 플러그인이 소유한 channel id. 발견과 config 검증에 사용됩니다.                                                                                                                                                   |
| `providers`                          | 아니오 | `string[]`                       | 이 플러그인이 소유한 provider id.                                                                                                                                                                                   |
| `providerDiscoveryEntry`             | 아니오 | `string`                         | plugin 루트에 상대적인 경량 provider-discovery 모듈 경로로, 전체 플러그인 런타임을 활성화하지 않고도 로드할 수 있는 manifest 범위의 provider 카탈로그 메타데이터용입니다.                                           |
| `modelSupport`                       | 아니오 | `object`                         | 런타임 이전에 플러그인을 자동으로 로드하는 데 사용되는 manifest 소유 단축 모델 계열 메타데이터.                                                                                                                     |
| `providerEndpoints`                  | 아니오 | `object[]`                       | provider 런타임이 로드되기 전에 코어가 분류해야 하는 provider 경로의 manifest 소유 endpoint host/baseUrl 메타데이터.                                                                                                |
| `cliBackends`                        | 아니오 | `string[]`                       | 이 플러그인이 소유한 CLI 추론 backend id. 명시적 config 참조로부터 시작 시 auto-activation에 사용됩니다.                                                                                                            |
| `syntheticAuthRefs`                  | 아니오 | `string[]`                       | 런타임 로드 전 cold 모델 발견 중 플러그인 소유 synthetic auth hook을 탐지해야 하는 provider 또는 CLI backend 참조.                                                                                                  |
| `nonSecretAuthMarkers`               | 아니오 | `string[]`                       | non-secret 로컬, OAuth 또는 앰비언트 자격 증명 상태를 나타내는 번들 플러그인 소유 플레이스홀더 API key 값.                                                                                                          |
| `commandAliases`                     | 아니오 | `object[]`                       | 런타임 로드 전에 플러그인 인식 config 및 CLI 진단을 생성해야 하는 이 플러그인이 소유한 명령 이름.                                                                                                                   |
| `providerAuthEnvVars`                | 아니오 | `Record<string, string[]>`       | OpenClaw가 플러그인 코드를 로드하지 않고 검사할 수 있는 저비용 provider-auth env 메타데이터.                                                                                                                        |
| `providerAuthAliases`                | 아니오 | `Record<string, string>`         | 기본 provider API key 및 auth 프로필을 공유하는 coding provider와 같이, auth 조회를 위해 다른 provider id를 재사용해야 하는 provider id.                                                                             |
| `channelEnvVars`                     | 아니오 | `Record<string, string[]>`       | OpenClaw가 플러그인 코드를 로드하지 않고 검사할 수 있는 저비용 channel env 메타데이터. 범용 시작/config 헬퍼가 볼 수 있어야 하는 env 기반 channel setup 또는 auth 표면에 사용하십시오.                                |
| `providerAuthChoices`                | 아니오 | `object[]`                       | 온보딩 피커, 선호 provider 해결 및 간단한 CLI 플래그 연결을 위한 저비용 auth-choice 메타데이터.                                                                                                                     |
| `activation`                         | 아니오 | `object`                         | provider, 명령, channel, route 및 capability 트리거 로딩을 위한 저비용 activation 플래너 메타데이터. 메타데이터만 포함; 플러그인 런타임이 여전히 실제 동작을 소유합니다.                                             |
| `setup`                              | 아니오 | `object`                         | 런타임 로드 전 발견 및 setup 표면이 검사할 수 있는 저비용 setup/onboarding 디스크립터.                                                                                                                               |
| `qaRunners`                          | 아니오 | `object[]`                       | 플러그인 런타임 로드 전 공유 `openclaw qa` 호스트가 사용하는 저비용 QA 러너 디스크립터.                                                                                                                             |
| `contracts`                          | 아니오 | `object`                         | 외부 auth hook, speech, realtime transcription, realtime voice, media-understanding, image-generation, music-generation, video-generation, web-fetch, web search 및 tool 소유권을 위한 정적 번들 capability 스냅샷. |
| `mediaUnderstandingProviderMetadata` | 아니오 | `Record<string, object>`         | `contracts.mediaUnderstandingProviders`에 선언된 provider id에 대한 저비용 media-understanding 기본값.                                                                                                              |
| `channelConfigs`                     | 아니오 | `Record<string, object>`         | 런타임 로드 전에 발견 및 검증 표면에 병합되는 manifest 소유 channel config 메타데이터.                                                                                                                              |
| `skills`                             | 아니오 | `string[]`                       | 로드할 skill 디렉터리, plugin 루트에 상대적.                                                                                                                                                                        |
| `name`                               | 아니오 | `string`                         | 사람이 읽을 수 있는 플러그인 이름.                                                                                                                                                                                  |
| `description`                        | 아니오 | `string`                         | 플러그인 표면에 표시되는 짧은 요약.                                                                                                                                                                                 |
| `version`                            | 아니오 | `string`                         | 정보용 플러그인 버전.                                                                                                                                                                                                |
| `uiHints`                            | 아니오 | `Record<string, object>`         | config 필드의 UI 라벨, 플레이스홀더 및 민감도 힌트.                                                                                                                                                                  |

## providerAuthChoices 레퍼런스

각 `providerAuthChoices` 엔트리는 하나의 온보딩 또는 auth 선택지를 설명합니다.
OpenClaw는 provider 런타임이 로드되기 전에 이를 읽습니다.

| 필드                  | 필수   | 타입                                            | 의미                                                                                                  |
| --------------------- | ------ | ----------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `provider`            | 예     | `string`                                        | 이 선택지가 속한 provider id.                                                                          |
| `method`              | 예     | `string`                                        | 디스패치할 auth 메서드 id.                                                                             |
| `choiceId`            | 예     | `string`                                        | 온보딩 및 CLI 플로우에서 사용하는 안정적인 auth-choice id.                                             |
| `choiceLabel`         | 아니오 | `string`                                        | 사용자에게 표시되는 라벨. 생략하면 OpenClaw는 `choiceId`로 대체합니다.                                 |
| `choiceHint`          | 아니오 | `string`                                        | 피커용 짧은 도움말 텍스트.                                                                              |
| `assistantPriority`   | 아니오 | `number`                                        | 낮은 값이 어시스턴트 주도 대화형 피커에서 더 먼저 정렬됩니다.                                          |
| `assistantVisibility` | 아니오 | `"visible"` \| `"manual-only"`                  | 수동 CLI 선택은 여전히 허용하면서 어시스턴트 피커에서 선택지를 숨깁니다.                               |
| `deprecatedChoiceIds` | 아니오 | `string[]`                                      | 사용자를 이 대체 선택지로 리디렉션해야 하는 레거시 choice id.                                          |
| `groupId`             | 아니오 | `string`                                        | 관련 선택지를 그룹화하기 위한 선택적 그룹 id.                                                          |
| `groupLabel`          | 아니오 | `string`                                        | 해당 그룹에 대한 사용자 표시 라벨.                                                                     |
| `groupHint`           | 아니오 | `string`                                        | 그룹용 짧은 도움말 텍스트.                                                                              |
| `optionKey`           | 아니오 | `string`                                        | 단순 one-flag auth 플로우용 내부 옵션 key.                                                              |
| `cliFlag`             | 아니오 | `string`                                        | `--openrouter-api-key`와 같은 CLI 플래그 이름.                                                         |
| `cliOption`           | 아니오 | `string`                                        | `--openrouter-api-key <key>`와 같은 전체 CLI 옵션 형태.                                                |
| `cliDescription`      | 아니오 | `string`                                        | CLI 도움말에서 사용되는 설명.                                                                           |
| `onboardingScopes`    | 아니오 | `Array<"text-inference" \| "image-generation">` | 이 선택지가 나타나야 하는 온보딩 표면. 생략하면 기본값은 `["text-inference"]`입니다.                   |

## commandAliases 레퍼런스

사용자가 `plugins.allow`에 잘못 넣거나 루트 CLI 명령으로 실행하려고 할 수 있는
런타임 명령 이름을 플러그인이 소유할 때 `commandAliases`를 사용하십시오.
OpenClaw는 플러그인 런타임 코드를 임포트하지 않고 진단을 위해 이 메타데이터를
사용합니다.

```json
{
  "commandAliases": [
    {
      "name": "dreaming",
      "kind": "runtime-slash",
      "cliCommand": "memory"
    }
  ]
}
```

| 필드         | 필수   | 타입              | 의미                                                                  |
| ------------ | ------ | ----------------- | --------------------------------------------------------------------- |
| `name`       | 예     | `string`          | 이 플러그인에 속한 명령 이름.                                           |
| `kind`       | 아니오 | `"runtime-slash"` | 별칭을 루트 CLI 명령이 아닌 채팅 슬래시 명령으로 표시합니다.             |
| `cliCommand` | 아니오 | `string`          | CLI 작업에 제안할 관련 루트 CLI 명령이 있을 경우 해당 명령.              |

## activation 레퍼런스

플러그인이 어떤 컨트롤 플레인 이벤트가 activation/load 계획에 포함되어야 하는지
저비용으로 선언할 수 있을 때 `activation`을 사용하십시오.

이 블록은 플래너 메타데이터이며 수명 주기 API가 아닙니다. 런타임 동작을
등록하지 않고, `register(...)`를 대체하지 않으며, 플러그인 코드가 이미 실행되었다는
것을 보장하지도 않습니다. activation 플래너는 이러한 필드를 사용하여 후보
플러그인을 좁힌 다음, `providers`, `channels`, `commandAliases`, `setup.providers`,
`contracts.tools` 및 hook과 같은 기존 manifest 소유권 메타데이터로 폴백합니다.

이미 소유권을 설명하는 가장 좁은 메타데이터를 선호하십시오. 해당 필드가 관계를
표현할 때는 `providers`, `channels`, `commandAliases`, setup 디스크립터 또는
`contracts`를 사용하십시오. 이러한 소유권 필드로 표현할 수 없는 추가 플래너 힌트에는
`activation`을 사용하십시오.

이 블록은 메타데이터 전용입니다. 런타임 동작을 등록하지 않으며, `register(...)`,
`setupEntry` 또는 기타 런타임/플러그인 엔트리포인트를 대체하지 않습니다. 현재
소비자는 이를 더 넓은 플러그인 로딩 이전의 좁히기 힌트로 사용하므로, activation
메타데이터가 누락되면 일반적으로 성능 비용만 발생합니다; 레거시 manifest 소유권
폴백이 여전히 존재하는 한 정확성은 변경되지 않아야 합니다.

```json
{
  "activation": {
    "onProviders": ["openai"],
    "onCommands": ["models"],
    "onChannels": ["web"],
    "onRoutes": ["gateway-webhook"],
    "onCapabilities": ["provider", "tool"]
  }
}
```

| 필드             | 필수   | 타입                                                 | 의미                                                                                                     |
| ---------------- | ------ | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `onProviders`    | 아니오 | `string[]`                                           | 이 플러그인을 activation/load 계획에 포함해야 하는 provider id.                                            |
| `onCommands`     | 아니오 | `string[]`                                           | 이 플러그인을 activation/load 계획에 포함해야 하는 명령 id.                                                |
| `onChannels`     | 아니오 | `string[]`                                           | 이 플러그인을 activation/load 계획에 포함해야 하는 channel id.                                             |
| `onRoutes`       | 아니오 | `string[]`                                           | 이 플러그인을 activation/load 계획에 포함해야 하는 route kind.                                             |
| `onCapabilities` | 아니오 | `Array<"provider" \| "channel" \| "tool" \| "hook">` | 컨트롤 플레인 activation 계획에 사용되는 광범위한 capability 힌트. 가능하면 더 좁은 필드를 선호하십시오.   |

현재 활성 소비자:

- 명령 트리거 CLI 계획은 레거시 `commandAliases[].cliCommand` 또는
  `commandAliases[].name`으로 폴백합니다
- channel 트리거 setup/channel 계획은 명시적 channel activation 메타데이터가
  누락된 경우 레거시 `channels[]` 소유권으로 폴백합니다
- provider 트리거 setup/runtime 계획은 명시적 provider activation 메타데이터가
  누락된 경우 레거시 `providers[]` 및 최상위 `cliBackends[]` 소유권으로 폴백합니다

플래너 진단은 명시적 activation 힌트를 manifest 소유권 폴백과 구별할 수 있습니다.
예를 들어, `activation-command-hint`는 `activation.onCommands`가 일치했음을
의미하고, `manifest-command-alias`는 플래너가 대신 `commandAliases` 소유권을
사용했음을 의미합니다. 이러한 사유 라벨은 호스트 진단 및 테스트용입니다; 플러그인
작성자는 소유권을 가장 잘 설명하는 메타데이터를 계속 선언해야 합니다.

## qaRunners 레퍼런스

플러그인이 공유 `openclaw qa` 루트 아래에 하나 이상의 transport 러너를 기여할 때
`qaRunners`를 사용하십시오. 이 메타데이터는 저비용이고 정적으로 유지하십시오;
플러그인 런타임은 여전히 `qaRunnerCliRegistrations`를 내보내는 경량
`runtime-api.ts` 표면을 통해 실제 CLI 등록을 소유합니다.

```json
{
  "qaRunners": [
    {
      "commandName": "matrix",
      "description": "Run the Docker-backed Matrix live QA lane against a disposable homeserver"
    }
  ]
}
```

| 필드          | 필수   | 타입     | 의미                                                                 |
| ------------- | ------ | -------- | -------------------------------------------------------------------- |
| `commandName` | 예     | `string` | `openclaw qa` 아래에 마운트되는 서브명령, 예를 들어 `matrix`.          |
| `description` | 아니오 | `string` | 공유 호스트가 stub 명령을 필요로 할 때 사용되는 폴백 도움말 텍스트.    |

## setup 레퍼런스

setup 및 onboarding 표면이 런타임 로드 전에 저비용 플러그인 소유 메타데이터를
필요로 할 때 `setup`을 사용하십시오.

```json
{
  "setup": {
    "providers": [
      {
        "id": "openai",
        "authMethods": ["api-key"],
        "envVars": ["OPENAI_API_KEY"]
      }
    ],
    "cliBackends": ["openai-cli"],
    "configMigrations": ["legacy-openai-auth"],
    "requiresRuntime": false
  }
}
```

최상위 `cliBackends`는 유효하게 유지되며 CLI 추론 backend를 계속 설명합니다.
`setup.cliBackends`는 메타데이터 전용으로 유지되어야 하는 컨트롤 플레인/setup
플로우를 위한 setup 특화 디스크립터 표면입니다.

존재할 때, `setup.providers`와 `setup.cliBackends`는 setup 발견을 위한 선호되는
디스크립터 우선 조회 표면입니다. 디스크립터가 후보 플러그인만 좁히고 setup이
여전히 더 풍부한 setup 시점 런타임 hook을 필요로 하는 경우, `requiresRuntime: true`
로 설정하고 `setup-api`를 폴백 실행 경로로 유지하십시오.

setup 조회가 플러그인 소유 `setup-api` 코드를 실행할 수 있으므로, 정규화된
`setup.providers[].id` 및 `setup.cliBackends[]` 값은 발견된 플러그인 전체에서
고유해야 합니다. 모호한 소유권은 발견 순서에서 승자를 선택하는 대신 엄격하게
실패합니다.

### setup.providers 레퍼런스

| 필드          | 필수   | 타입       | 의미                                                                                             |
| ------------- | ------ | ---------- | ------------------------------------------------------------------------------------------------ |
| `id`          | 예     | `string`   | setup 또는 onboarding 중에 노출되는 provider id. 정규화된 id를 전역적으로 고유하게 유지하십시오. |
| `authMethods` | 아니오 | `string[]` | 전체 런타임을 로드하지 않고도 이 provider가 지원하는 setup/auth 메서드 id.                        |
| `envVars`     | 아니오 | `string[]` | 플러그인 런타임 로드 전에 범용 setup/status 표면이 확인할 수 있는 env 변수.                        |

### setup 필드

| 필드               | 필수   | 타입       | 의미                                                                                                    |
| ------------------ | ------ | ---------- | ------------------------------------------------------------------------------------------------------- |
| `providers`        | 아니오 | `object[]` | setup 및 onboarding 중에 노출되는 provider setup 디스크립터.                                              |
| `cliBackends`      | 아니오 | `string[]` | 디스크립터 우선 setup 조회에 사용되는 setup 시점 backend id. 정규화된 id를 전역적으로 고유하게 유지하십시오. |
| `configMigrations` | 아니오 | `string[]` | 이 플러그인의 setup 표면이 소유한 config 마이그레이션 id.                                                  |
| `requiresRuntime`  | 아니오 | `boolean`  | 디스크립터 조회 후 setup이 여전히 `setup-api` 실행을 필요로 하는지 여부.                                  |

## uiHints 레퍼런스

`uiHints`는 config 필드 이름에서 작은 렌더링 힌트로의 맵입니다.

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

각 필드 힌트에는 다음이 포함될 수 있습니다:

| 필드          | 타입       | 의미                                         |
| ------------- | ---------- | -------------------------------------------- |
| `label`       | `string`   | 사용자에게 표시되는 필드 라벨.                |
| `help`        | `string`   | 짧은 도움말 텍스트.                           |
| `tags`        | `string[]` | 선택적 UI 태그.                               |
| `advanced`    | `boolean`  | 필드를 고급으로 표시합니다.                   |
| `sensitive`   | `boolean`  | 필드를 secret 또는 민감한 것으로 표시합니다.  |
| `placeholder` | `string`   | 양식 입력의 플레이스홀더 텍스트.              |

## contracts 레퍼런스

OpenClaw가 플러그인 런타임을 임포트하지 않고 읽을 수 있는 정적 capability 소유권
메타데이터에만 `contracts`를 사용하십시오.

```json
{
  "contracts": {
    "embeddedExtensionFactories": ["pi"],
    "externalAuthProviders": ["acme-ai"],
    "speechProviders": ["openai"],
    "realtimeTranscriptionProviders": ["openai"],
    "realtimeVoiceProviders": ["openai"],
    "memoryEmbeddingProviders": ["local"],
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

| 필드                             | 타입       | 의미                                                                  |
| -------------------------------- | ---------- | -------------------------------------------------------------------- |
| `embeddedExtensionFactories`     | `string[]` | 번들된 플러그인이 팩토리를 등록할 수 있는 임베디드 런타임 id.          |
| `externalAuthProviders`          | `string[]` | 이 플러그인이 외부 auth 프로필 hook을 소유하는 provider id.            |
| `speechProviders`                | `string[]` | 이 플러그인이 소유한 speech provider id.                               |
| `realtimeTranscriptionProviders` | `string[]` | 이 플러그인이 소유한 realtime-transcription provider id.               |
| `realtimeVoiceProviders`         | `string[]` | 이 플러그인이 소유한 realtime-voice provider id.                       |
| `memoryEmbeddingProviders`       | `string[]` | 이 플러그인이 소유한 memory embedding provider id.                     |
| `mediaUnderstandingProviders`    | `string[]` | 이 플러그인이 소유한 media-understanding provider id.                  |
| `imageGenerationProviders`       | `string[]` | 이 플러그인이 소유한 image-generation provider id.                     |
| `videoGenerationProviders`       | `string[]` | 이 플러그인이 소유한 video-generation provider id.                     |
| `webFetchProviders`              | `string[]` | 이 플러그인이 소유한 web-fetch provider id.                            |
| `webSearchProviders`             | `string[]` | 이 플러그인이 소유한 web-search provider id.                           |
| `tools`                          | `string[]` | 번들 contract 검사를 위해 이 플러그인이 소유한 에이전트 도구 이름.      |

`resolveExternalAuthProfiles`를 구현하는 provider 플러그인은
`contracts.externalAuthProviders`를 선언해야 합니다. 선언 없이도 플러그인은
더 이상 사용되지 않는 호환성 폴백을 통해 실행되지만, 해당 폴백은 더 느리며
마이그레이션 기간 후 제거될 예정입니다.

번들된 memory embedding provider는 내장 어댑터(예: `local`)를 포함하여
노출하는 모든 어댑터 id에 대해 `contracts.memoryEmbeddingProviders`를
선언해야 합니다. 독립 실행형 CLI 경로는 이 manifest contract를 사용하여
전체 Gateway 런타임이 provider를 등록하기 전에 소유 플러그인만 로드합니다.

## mediaUnderstandingProviderMetadata 레퍼런스

media-understanding provider에 런타임 로드 전에 범용 코어 헬퍼가 필요로 하는
기본 모델, auto-auth 폴백 우선순위 또는 네이티브 문서 지원이 있을 때
`mediaUnderstandingProviderMetadata`를 사용하십시오. Key는 또한
`contracts.mediaUnderstandingProviders`에 선언되어야 합니다.

```json
{
  "contracts": {
    "mediaUnderstandingProviders": ["example"]
  },
  "mediaUnderstandingProviderMetadata": {
    "example": {
      "capabilities": ["image", "audio"],
      "defaultModels": {
        "image": "example-vision-latest",
        "audio": "example-transcribe-latest"
      },
      "autoPriority": {
        "image": 40
      },
      "nativeDocumentInputs": ["pdf"]
    }
  }
}
```

각 provider 엔트리에는 다음이 포함될 수 있습니다:

| 필드                   | 타입                                | 의미                                                                 |
| ---------------------- | ----------------------------------- | -------------------------------------------------------------------- |
| `capabilities`         | `("image" \| "audio" \| "video")[]` | 이 provider가 노출하는 media capability.                             |
| `defaultModels`        | `Record<string, string>`            | config가 모델을 지정하지 않을 때 사용되는 capability별 모델 기본값.  |
| `autoPriority`         | `Record<string, number>`            | 자격 증명 기반 자동 provider 폴백에서 낮은 값이 먼저 정렬됩니다.     |
| `nativeDocumentInputs` | `"pdf"[]`                           | provider가 지원하는 네이티브 문서 입력.                               |

## channelConfigs 레퍼런스

channel 플러그인이 런타임 로드 전에 저비용 config 메타데이터를 필요로 할 때
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

각 channel 엔트리에는 다음이 포함될 수 있습니다:

| 필드          | 타입                     | 의미                                                                                    |
| ------------- | ------------------------ | --------------------------------------------------------------------------------------- |
| `schema`      | `object`                 | `channels.<id>`에 대한 JSON Schema. 선언된 각 channel config 엔트리에 필수입니다.         |
| `uiHints`     | `Record<string, object>` | 해당 channel config 섹션에 대한 선택적 UI 라벨/플레이스홀더/민감도 힌트.                 |
| `label`       | `string`                 | 런타임 메타데이터가 준비되지 않았을 때 피커 및 inspect 표면에 병합되는 channel 라벨.    |
| `description` | `string`                 | inspect 및 카탈로그 표면을 위한 짧은 channel 설명.                                       |
| `preferOver`  | `string[]`               | 이 channel이 선택 표면에서 앞서야 하는 레거시 또는 낮은 우선순위 플러그인 id.             |

## modelSupport 레퍼런스

OpenClaw가 플러그인 런타임이 로드되기 전에 `gpt-5.5` 또는 `claude-sonnet-4.6`
같은 단축 모델 id로부터 provider 플러그인을 추론해야 할 때 `modelSupport`를
사용하십시오.

```json
{
  "modelSupport": {
    "modelPrefixes": ["gpt-", "o1", "o3", "o4"],
    "modelPatterns": ["^computer-use-preview"]
  }
}
```

OpenClaw는 다음 우선순위를 적용합니다:

- 명시적 `provider/model` 참조는 소유 `providers` manifest 메타데이터를 사용합니다
- `modelPatterns`가 `modelPrefixes`보다 우선합니다
- 번들되지 않은 플러그인 하나와 번들된 플러그인 하나가 모두 일치하면, 번들되지
  않은 플러그인이 승리합니다
- 남은 모호성은 사용자 또는 config가 provider를 지정할 때까지 무시됩니다

필드:

| 필드            | 타입       | 의미                                                                        |
| --------------- | ---------- | --------------------------------------------------------------------------- |
| `modelPrefixes` | `string[]` | 단축 모델 id에 대해 `startsWith`로 일치하는 접두사.                          |
| `modelPatterns` | `string[]` | profile 접미사 제거 후 단축 모델 id에 대해 일치하는 정규식 소스.             |

레거시 최상위 capability key는 더 이상 사용되지 않습니다. `openclaw doctor --fix`를
사용하여 `speechProviders`, `realtimeTranscriptionProviders`,
`realtimeVoiceProviders`, `mediaUnderstandingProviders`,
`imageGenerationProviders`, `videoGenerationProviders`,
`webFetchProviders`, `webSearchProviders`를 `contracts` 아래로 이동하십시오;
일반 manifest 로딩은 더 이상 이러한 최상위 필드를 capability 소유권으로 취급하지
않습니다.

## Manifest 대 package.json

두 파일은 서로 다른 작업을 수행합니다:

| 파일                   | 용도                                                                                                                                     |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `openclaw.plugin.json` | 플러그인 코드가 실행되기 전에 존재해야 하는 발견, config 검증, auth-choice 메타데이터 및 UI 힌트                                          |
| `package.json`         | npm 메타데이터, 종속성 설치 및 엔트리포인트, 설치 gating, setup 또는 카탈로그 메타데이터에 사용되는 `openclaw` 블록                        |

어떤 메타데이터가 어디에 속하는지 확신할 수 없다면 다음 규칙을 사용하십시오:

- OpenClaw가 플러그인 코드를 로드하기 전에 알아야 한다면 `openclaw.plugin.json`에 넣으십시오
- 패키징, 엔트리 파일 또는 npm 설치 동작에 관한 것이라면 `package.json`에 넣으십시오

### 발견에 영향을 주는 package.json 필드

일부 런타임 이전 플러그인 메타데이터는 의도적으로 `openclaw.plugin.json`이 아닌
`package.json`의 `openclaw` 블록 아래에 존재합니다.

중요한 예시:

| 필드                                                              | 의미                                                                                                                                                                                   |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `openclaw.extensions`                                             | 네이티브 플러그인 엔트리포인트를 선언합니다. 플러그인 패키지 디렉터리 내에 있어야 합니다.                                                                                                  |
| `openclaw.runtimeExtensions`                                      | 설치된 패키지의 빌드된 JavaScript 런타임 엔트리포인트를 선언합니다. 플러그인 패키지 디렉터리 내에 있어야 합니다.                                                                           |
| `openclaw.setupEntry`                                             | 온보딩, 지연된 channel 시작 및 읽기 전용 channel 상태/SecretRef 발견 중에 사용되는 경량 setup 전용 엔트리포인트. 플러그인 패키지 디렉터리 내에 있어야 합니다.                             |
| `openclaw.runtimeSetupEntry`                                      | 설치된 패키지에 대한 빌드된 JavaScript setup 엔트리포인트를 선언합니다. 플러그인 패키지 디렉터리 내에 있어야 합니다.                                                                       |
| `openclaw.channel`                                                | 라벨, 문서 경로, 별칭 및 선택 문구와 같은 저비용 channel 카탈로그 메타데이터.                                                                                                             |
| `openclaw.channel.configuredState`                                | 전체 channel 런타임을 로드하지 않고 "env 전용 setup이 이미 존재하는가?"에 답할 수 있는 경량 configured-state 체커 메타데이터.                                                              |
| `openclaw.channel.persistedAuthState`                             | 전체 channel 런타임을 로드하지 않고 "무엇이든 이미 로그인되어 있는가?"에 답할 수 있는 경량 persisted-auth 체커 메타데이터.                                                                 |
| `openclaw.install.npmSpec` / `openclaw.install.localPath`         | 번들된 플러그인과 외부 발행된 플러그인을 위한 설치/업데이트 힌트.                                                                                                                          |
| `openclaw.install.defaultChoice`                                  | 여러 설치 소스가 사용 가능할 때 선호되는 설치 경로.                                                                                                                                        |
| `openclaw.install.minHostVersion`                                 | 최소 지원 OpenClaw 호스트 버전, `>=2026.3.22`와 같은 semver 최소값 사용.                                                                                                                   |
| `openclaw.install.expectedIntegrity`                              | `sha512-...`와 같은 예상 npm dist integrity 문자열; 설치 및 업데이트 플로우는 가져온 artifact를 이에 대해 검증합니다.                                                                      |
| `openclaw.install.allowInvalidConfigRecovery`                     | config가 잘못된 경우 좁은 번들 플러그인 재설치 복구 경로를 허용합니다.                                                                                                                      |
| `openclaw.startup.deferConfiguredChannelFullLoadUntilAfterListen` | 시작 중 전체 channel 플러그인 이전에 setup 전용 channel 표면이 로드되도록 허용합니다.                                                                                                      |

Manifest 메타데이터는 런타임이 로드되기 전에 어떤 provider/channel/setup
선택지가 온보딩에 나타날지 결정합니다. `package.json#openclaw.install`은
사용자가 해당 선택지 중 하나를 선택할 때 온보딩에 해당 플러그인을 가져오거나
활성화하는 방법을 알려줍니다. 설치 힌트를 `openclaw.plugin.json`으로 이동하지
마십시오.

`openclaw.install.minHostVersion`은 설치 및 manifest 레지스트리 로딩 중에
강제 집행됩니다. 유효하지 않은 값은 거부됩니다; 더 새롭지만 유효한 값은
오래된 호스트에서 플러그인을 건너뜁니다.

정확한 npm 버전 고정은 이미 `npmSpec`에 존재합니다, 예를 들어
`"npmSpec": "@wecom/wecom-openclaw-plugin@1.2.3"`. 가져온 npm artifact가
고정된 릴리스와 더 이상 일치하지 않을 때 업데이트 플로우가 엄격하게 실패하기를
원하면 이를 `expectedIntegrity`와 결합하십시오. 대화형 온보딩은 bare 패키지
이름과 dist-tag를 포함한 신뢰할 수 있는 레지스트리 npm 스펙을 제공합니다.
`expectedIntegrity`가 있으면 설치/업데이트 플로우가 이를 강제합니다; 생략되면
레지스트리 해결은 integrity 핀 없이 기록됩니다.

Channel 플러그인은 status, channel 목록 또는 SecretRef 스캔이 전체 런타임을
로드하지 않고 구성된 계정을 식별해야 할 때 `openclaw.setupEntry`를 제공해야
합니다. setup 엔트리는 채널 메타데이터와 setup-safe config, status 및 secrets
어댑터를 노출해야 합니다; 네트워크 클라이언트, gateway 리스너 및 transport
런타임은 메인 extension 엔트리포인트에 유지하십시오.

런타임 엔트리포인트 필드는 소스 엔트리포인트 필드에 대한 패키지 경계 검사를
재정의하지 않습니다. 예를 들어, `openclaw.runtimeExtensions`는 탈출하는
`openclaw.extensions` 경로를 로드 가능하게 만들 수 없습니다.

`openclaw.install.allowInvalidConfigRecovery`는 의도적으로 좁습니다. 이는
임의의 손상된 config를 설치 가능하게 만들지 않습니다. 오늘날 이는 누락된 번들
플러그인 경로나 동일한 번들 플러그인에 대한 오래된 `channels.<id>` 엔트리와 같은
특정한 오래된 번들 플러그인 업그레이드 실패에서 설치 플로우가 복구하도록만
허용합니다. 관련이 없는 config 오류는 여전히 설치를 차단하고 운영자를
`openclaw doctor --fix`로 보냅니다.

`openclaw.channel.persistedAuthState`는 작은 체커 모듈에 대한 패키지
메타데이터입니다:

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

setup, doctor 또는 configured-state 플로우가 전체 channel 플러그인 로드 전에
저비용 yes/no auth 탐지를 필요로 할 때 사용하십시오. 대상 export는 지속된
상태만 읽는 작은 함수여야 합니다; 전체 channel 런타임 배럴을 통해 라우팅하지
마십시오.

`openclaw.channel.configuredState`는 저비용 env 전용 configured 검사에 대해
동일한 형태를 따릅니다:

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

channel이 env 또는 기타 작은 비 런타임 입력에서 configured-state에 응답할 수
있을 때 사용하십시오. 검사가 전체 config 해결 또는 실제 channel 런타임을
필요로 하는 경우, 해당 로직을 대신 플러그인 `config.hasConfiguredState` hook에
유지하십시오.

## 발견 우선순위 (중복 플러그인 id)

OpenClaw는 여러 루트(번들, 글로벌 설치, 워크스페이스, 명시적으로 config 선택된
경로)에서 플러그인을 발견합니다. 두 발견이 동일한 `id`를 공유하는 경우,
**최고 우선순위** manifest만 유지됩니다; 낮은 우선순위 중복은 함께 로드되는
대신 삭제됩니다.

우선순위, 높음에서 낮음:

1. **Config 선택** — `plugins.entries.<id>`에 명시적으로 고정된 경로
2. **번들** — OpenClaw와 함께 배송되는 플러그인
3. **글로벌 설치** — 글로벌 OpenClaw 플러그인 루트에 설치된 플러그인
4. **워크스페이스** — 현재 워크스페이스에 상대적으로 발견된 플러그인

함의:

- 워크스페이스에 있는 번들 플러그인의 포크 또는 오래된 복사본은 번들 빌드를
  그림자 처리하지 않습니다.
- 로컬 플러그인으로 번들 플러그인을 실제로 재정의하려면 워크스페이스 발견에
  의존하는 대신 `plugins.entries.<id>`를 통해 고정하여 우선순위에 따라 승리하도록
  하십시오.
- 중복 삭제는 Doctor 및 시작 진단이 버려진 복사본을 가리킬 수 있도록 로그에
  기록됩니다.

## JSON Schema 요구사항

- **모든 플러그인은 JSON Schema를 배포해야 합니다**, config를 받지 않더라도.
- 빈 schema도 허용됩니다 (예: `{ "type": "object", "additionalProperties": false }`).
- Schema는 런타임이 아닌 config 읽기/쓰기 시점에 검증됩니다.

## 검증 동작

- 알 수 없는 `channels.*` key는 **오류**입니다, channel id가 플러그인 manifest에
  의해 선언된 경우를 제외하고.
- `plugins.entries.<id>`, `plugins.allow`, `plugins.deny` 및 `plugins.slots.*`는
  **발견 가능한** 플러그인 id를 참조해야 합니다. 알 수 없는 id는 **오류**입니다.
- 플러그인이 설치되었지만 manifest 또는 schema가 손상되었거나 누락된 경우,
  검증이 실패하고 Doctor가 플러그인 오류를 보고합니다.
- 플러그인 config가 존재하지만 플러그인이 **비활성화**된 경우, config는 유지되고
  Doctor 및 로그에 **경고**가 표시됩니다.

전체 `plugins.*` schema에 대해서는 [구성 레퍼런스](/gateway/configuration)를 참조하십시오.

## 참고 사항

- manifest는 로컬 파일시스템 로드를 포함한 **네이티브 OpenClaw 플러그인에 필수**입니다. 런타임은 여전히 플러그인 모듈을 별도로 로드합니다; manifest는 발견 + 검증 전용입니다.
- 네이티브 manifest는 JSON5로 파싱되므로, 최종 값이 여전히 객체인 한 주석, 후행 쉼표 및 따옴표 없는 key가 허용됩니다.
- manifest 로더는 문서화된 manifest 필드만 읽습니다. 사용자 지정 최상위 key는 피하십시오.
- `channels`, `providers`, `cliBackends` 및 `skills`는 플러그인이 필요로 하지 않을 때 모두 생략할 수 있습니다.
- `providerDiscoveryEntry`는 경량으로 유지되어야 하며 광범위한 런타임 코드를 임포트하지 않아야 합니다; 요청 시점 실행이 아닌 정적 provider 카탈로그 메타데이터 또는 좁은 발견 디스크립터에 사용하십시오.
- 배타적 플러그인 kind는 `plugins.slots.*`를 통해 선택됩니다: `kind: "memory"`는 `plugins.slots.memory`를 통해, `kind: "context-engine"`은 `plugins.slots.contextEngine`(기본값 `legacy`)을 통해.
- Env-var 메타데이터(`providerAuthEnvVars`, `channelEnvVars`)는 선언적일 뿐입니다. Status, audit, cron 전달 검증 및 기타 읽기 전용 표면은 env 변수를 구성된 것으로 취급하기 전에 여전히 플러그인 신뢰 및 유효 activation 정책을 적용합니다.
- provider 코드가 필요한 런타임 마법사 메타데이터는 [Provider 런타임 훅](/plugins/architecture-internals#provider-runtime-hooks)을 참조하십시오.
- 플러그인이 네이티브 모듈에 의존하는 경우, 빌드 단계 및 패키지 관리자 allowlist 요구사항(예: pnpm `allow-build-scripts` + `pnpm rebuild <package>`)을 문서화하십시오.

## 관련 문서

<CardGroup cols={3}>
  <Card title="플러그인 구축" href="/plugins/building-plugins" icon="rocket">
    플러그인 시작하기.
  </Card>
  <Card title="플러그인 아키텍처" href="/plugins/architecture" icon="diagram-project">
    내부 아키텍처 및 capability 모델.
  </Card>
  <Card title="SDK 개요" href="/plugins/sdk-overview" icon="book">
    플러그인 SDK 레퍼런스 및 서브패스 임포트.
  </Card>
</CardGroup>
