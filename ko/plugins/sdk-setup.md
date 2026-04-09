---
title: "플러그인 Setup 및 구성"
sidebarTitle: "Setup 및 구성"
summary: "Setup 마법사, setup-entry.ts, 구성 스키마, package.json 메타데이터"
read_when:
  - 플러그인에 setup 마법사를 추가할 때
  - setup-entry.ts와 index.ts의 차이를 이해해야 할 때
  - 플러그인 구성 스키마 또는 package.json openclaw 메타데이터를 정의할 때
---

# 플러그인 Setup 및 구성

플러그인 패키징(`package.json` 메타데이터), 매니페스트(`openclaw.plugin.json`), setup 엔트리, 구성 스키마에 대한 레퍼런스입니다.

<Tip>
  **단계별 안내가 필요하신가요?** 방법론 가이드에서 패키징을 문맥 속에서 다룹니다:
  [채널 플러그인](/plugins/sdk-channel-plugins#step-1-package-and-manifest) 및
  [프로바이더 플러그인](/plugins/sdk-provider-plugins#step-1-package-and-manifest).
</Tip>

## 패키지 메타데이터

`package.json`에는 플러그인 시스템에 플러그인이 무엇을 제공하는지 알려주는 `openclaw` 필드가 필요합니다:

**채널 플러그인:**

```json
{
  "name": "@myorg/openclaw-my-channel",
  "version": "1.0.0",
  "type": "module",
  "openclaw": {
    "extensions": ["./index.ts"],
    "setupEntry": "./setup-entry.ts",
    "channel": {
      "id": "my-channel",
      "label": "My Channel",
      "blurb": "Short description of the channel."
    }
  }
}
```

**프로바이더 플러그인 / ClawHub 게시 기준:**

```json openclaw-clawhub-package.json
{
  "name": "@myorg/openclaw-my-plugin",
  "version": "1.0.0",
  "type": "module",
  "openclaw": {
    "extensions": ["./index.ts"],
    "compat": {
      "pluginApi": ">=2026.3.24-beta.2",
      "minGatewayVersion": "2026.3.24-beta.2"
    },
    "build": {
      "openclawVersion": "2026.3.24-beta.2",
      "pluginSdkVersion": "2026.3.24-beta.2"
    }
  }
}
```

플러그인을 ClawHub에 외부적으로 게시하는 경우 해당 `compat` 및 `build` 필드가 필수입니다. 표준 게시 스니펫은 `docs/snippets/plugin-publish/`에 있습니다.

### `openclaw` 필드

| 필드         | 타입       | 설명                                                                                            |
| ------------ | ---------- | ----------------------------------------------------------------------------------------------- |
| `extensions` | `string[]` | 엔트리포인트 파일 (패키지 루트에 상대적)                                                        |
| `setupEntry` | `string`   | 경량 setup 전용 엔트리 (선택 사항)                                                              |
| `channel`    | `object`   | setup, 피커, 빠른 시작, 상태 표면을 위한 채널 카탈로그 메타데이터                              |
| `providers`  | `string[]` | 이 플러그인이 등록하는 프로바이더 id                                                            |
| `install`    | `object`   | 설치 힌트: `npmSpec`, `localPath`, `defaultChoice`, `minHostVersion`, `allowInvalidConfigRecovery` |
| `startup`    | `object`   | 시작 동작 플래그                                                                                |

### `openclaw.channel`

`openclaw.channel`은 런타임 로드 전에 채널 검색 및 setup 표면을 위한 저렴한 패키지 메타데이터입니다.

| 필드                                   | 타입       | 의미                                                                           |
| -------------------------------------- | ---------- | ------------------------------------------------------------------------------ |
| `id`                                   | `string`   | 표준 채널 id.                                                                  |
| `label`                                | `string`   | 기본 채널 레이블.                                                              |
| `selectionLabel`                       | `string`   | `label`과 달라야 할 때 피커/setup 레이블.                                     |
| `detailLabel`                          | `string`   | 더 풍부한 채널 카탈로그 및 상태 표면을 위한 보조 세부 레이블.                 |
| `docsPath`                             | `string`   | setup 및 선택 링크를 위한 문서 경로.                                          |
| `docsLabel`                            | `string`   | 채널 id와 달라야 할 때 문서 링크에 사용되는 레이블 재정의.                    |
| `blurb`                                | `string`   | 짧은 온보딩/카탈로그 설명.                                                    |
| `order`                                | `number`   | 채널 카탈로그의 정렬 순서.                                                    |
| `aliases`                              | `string[]` | 채널 선택을 위한 추가 조회 별칭.                                              |
| `preferOver`                           | `string[]` | 이 채널이 앞서야 하는 낮은 우선순위 플러그인/채널 id.                         |
| `systemImage`                          | `string`   | 채널 UI 카탈로그를 위한 선택적 아이콘/시스템 이미지 이름.                     |
| `selectionDocsPrefix`                  | `string`   | 선택 표면의 문서 링크 앞에 오는 접두사 텍스트.                                |
| `selectionDocsOmitLabel`               | `boolean`  | 선택 텍스트에서 레이블 있는 문서 링크 대신 직접 문서 경로를 표시합니다.       |
| `selectionExtras`                      | `string[]` | 선택 텍스트에 추가되는 짧은 문자열.                                           |
| `markdownCapable`                      | `boolean`  | 아웃바운드 포맷팅 결정을 위해 채널을 마크다운 지원으로 표시합니다.            |
| `exposure`                             | `object`   | setup, 구성된 목록, 문서 표면에 대한 채널 가시성 제어.                        |
| `quickstartAllowFrom`                  | `boolean`  | 이 채널을 표준 빠른 시작 `allowFrom` setup 흐름에 옵트인합니다.               |
| `forceAccountBinding`                  | `boolean`  | 계정이 하나뿐인 경우에도 명시적 계정 바인딩을 요구합니다.                     |
| `preferSessionLookupForAnnounceTarget` | `boolean`  | 이 채널의 알림 타겟을 해결할 때 세션 조회를 선호합니다.                       |

예시:

```json
{
  "openclaw": {
    "channel": {
      "id": "my-channel",
      "label": "My Channel",
      "selectionLabel": "My Channel (self-hosted)",
      "detailLabel": "My Channel Bot",
      "docsPath": "/channels/my-channel",
      "docsLabel": "my-channel",
      "blurb": "Webhook-based self-hosted chat integration.",
      "order": 80,
      "aliases": ["mc"],
      "preferOver": ["my-channel-legacy"],
      "selectionDocsPrefix": "Guide:",
      "selectionExtras": ["Markdown"],
      "markdownCapable": true,
      "exposure": {
        "configured": true,
        "setup": true,
        "docs": true
      },
      "quickstartAllowFrom": true
    }
  }
}
```

`exposure`는 다음을 지원합니다:

- `configured`: 구성된/상태 스타일 목록 표면에 채널 포함
- `setup`: 인터랙티브 setup/구성 피커에 채널 포함
- `docs`: 문서/탐색 표면에서 채널을 공개 대면으로 표시

`showConfigured`와 `showInSetup`은 레거시 별칭으로 지원됩니다. `exposure`를 선호하십시오.

### `openclaw.install`

`openclaw.install`은 매니페스트 메타데이터가 아닌 패키지 메타데이터입니다.

| 필드                         | 타입                 | 의미                                                                                 |
| ---------------------------- | -------------------- | ------------------------------------------------------------------------------------ |
| `npmSpec`                    | `string`             | 설치/업데이트 흐름을 위한 표준 npm 스펙.                                             |
| `localPath`                  | `string`             | 로컬 개발 또는 번들 설치 경로.                                                       |
| `defaultChoice`              | `"npm"` \| `"local"` | 둘 다 사용 가능할 때 선호 설치 소스.                                                 |
| `minHostVersion`             | `string`             | `>=x.y.z` 형식의 최소 지원 OpenClaw 버전.                                           |
| `allowInvalidConfigRecovery` | `boolean`            | 번들 플러그인 재설치 흐름이 특정 구형 구성 실패에서 복구하도록 허용합니다.           |

`minHostVersion`이 설정되면 설치 및 매니페스트 레지스트리 로딩 모두 이를 적용합니다. 구형 호스트는 플러그인을 건너뜁니다; 잘못된 버전 문자열은 거부됩니다.

`allowInvalidConfigRecovery`는 깨진 구성에 대한 일반적인 우회 방법이 아닙니다. 재설치/setup이 해당 동일 플러그인의 누락된 번들 플러그인 경로나 구형 `channels.<id>` 항목과 같은 알려진 업그레이드 잔재물을 복구할 수 있도록 하는 좁은 번들 플러그인 복구용입니다.

### 전체 로드 지연

채널 플러그인은 다음으로 지연 로딩을 옵트인할 수 있습니다:

```json
{
  "openclaw": {
    "extensions": ["./index.ts"],
    "setupEntry": "./setup-entry.ts",
    "startup": {
      "deferConfiguredChannelFullLoadUntilAfterListen": true
    }
  }
}
```

활성화되면 OpenClaw는 이미 구성된 채널의 경우에도 리슨 이전 시작 단계에서 `setupEntry`만 로드합니다. 게이트웨이가 리스닝을 시작한 후 전체 엔트리가 로드됩니다.

<Warning>
  `setupEntry`가 게이트웨이가 리스닝을 시작하기 전에 필요한 모든 것(채널 등록, HTTP 라우트, 게이트웨이 메서드)을 등록할 때만 지연 로딩을 활성화하십시오. 전체 엔트리가 필수 시작 역량을 소유한다면 기본 동작을 유지하십시오.
</Warning>

setup/전체 엔트리가 게이트웨이 RPC 메서드를 등록한다면 플러그인별 접두사로 유지하십시오. 예약된 코어 관리자 네임스페이스(`config.*`, `exec.approvals.*`, `wizard.*`, `update.*`)는 코어 소유로 유지되며 항상 `operator.admin`으로 해결됩니다.

## 플러그인 매니페스트

모든 네이티브 플러그인은 패키지 루트에 `openclaw.plugin.json`을 제공해야 합니다. OpenClaw는 이를 사용하여 플러그인 코드를 실행하지 않고 구성을 검증합니다.

```json
{
  "id": "my-plugin",
  "name": "My Plugin",
  "description": "Adds My Plugin capabilities to OpenClaw",
  "configSchema": {
    "type": "object",
    "additionalProperties": false,
    "properties": {
      "webhookSecret": {
        "type": "string",
        "description": "Webhook verification secret"
      }
    }
  }
}
```

채널 플러그인의 경우 `kind`와 `channels`를 추가하십시오:

```json
{
  "id": "my-channel",
  "kind": "channel",
  "channels": ["my-channel"],
  "configSchema": {
    "type": "object",
    "additionalProperties": false,
    "properties": {}
  }
}
```

구성이 없는 플러그인도 스키마를 제공해야 합니다. 빈 스키마는 유효합니다:

```json
{
  "id": "my-plugin",
  "configSchema": {
    "type": "object",
    "additionalProperties": false
  }
}
```

전체 스키마 레퍼런스는 [플러그인 매니페스트](/plugins/manifest)를 참조하십시오.

## ClawHub 게시

플러그인 패키지에는 패키지별 ClawHub 명령을 사용하십시오:

```bash
clawhub package publish your-org/your-plugin --dry-run
clawhub package publish your-org/your-plugin
```

레거시 스킬 전용 게시 별칭은 스킬용입니다. 플러그인 패키지는 항상 `clawhub package publish`를 사용해야 합니다.

## Setup 엔트리

`setup-entry.ts` 파일은 OpenClaw가 setup 표면만 필요할 때(온보딩, 구성 복구, 비활성 채널 검사) 로드하는 `index.ts`의 경량 대안입니다.

```typescript
// setup-entry.ts
import { defineSetupPluginEntry } from "openclaw/plugin-sdk/channel-core";
import { myChannelPlugin } from "./src/channel.js";

export default defineSetupPluginEntry(myChannelPlugin);
```

이렇게 하면 setup 흐름 중 무거운 런타임 코드(암호화 라이브러리, CLI 등록, 백그라운드 서비스)가 로드되지 않습니다.

**OpenClaw가 전체 엔트리 대신 `setupEntry`를 사용하는 경우:**

- 채널이 비활성화되어 있지만 setup/온보딩 표면이 필요할 때
- 채널이 활성화되었지만 아직 구성되지 않았을 때
- 지연 로딩이 활성화된 경우 (`deferConfiguredChannelFullLoadUntilAfterListen`)

**`setupEntry`가 반드시 등록해야 하는 항목:**

- 채널 플러그인 객체 (`defineSetupPluginEntry`를 통해)
- 게이트웨이 리스닝 전에 필요한 HTTP 라우트
- 시작 중 필요한 게이트웨이 메서드

해당 시작 게이트웨이 메서드는 여전히 `config.*` 또는 `update.*`와 같은 예약된 코어 관리자 네임스페이스를 피해야 합니다.

**`setupEntry`에 포함되어서는 안 되는 항목:**

- CLI 등록
- 백그라운드 서비스
- 무거운 런타임 임포트 (암호화, SDK)
- 시작 이후에만 필요한 게이트웨이 메서드

### 좁은 setup 헬퍼 임포트

핫 setup 전용 경로의 경우 setup 표면의 일부만 필요할 때 더 넓은 `plugin-sdk/setup` 우산 대신 좁은 setup 헬퍼 이음새를 선호하십시오:

| 임포트 경로                        | 사용 용도                                                                                  | 주요 내보내기                                                                                                                                                                                                                                                                                    |
| ---------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `plugin-sdk/setup-runtime`         | `setupEntry` / 지연된 채널 시작에서 사용 가능한 setup 시간 런타임 헬퍼                    | `createPatchedAccountSetupAdapter`, `createEnvPatchedAccountSetupAdapter`, `createSetupInputPresenceValidator`, `noteChannelLookupFailure`, `noteChannelLookupSummary`, `promptResolvedAllowFrom`, `splitSetupEntries`, `createAllowlistSetupWizardProxy`, `createDelegatedSetupWizardProxy` |
| `plugin-sdk/setup-adapter-runtime` | 환경 인식 계정 setup 어댑터                                                                | `createEnvPatchedAccountSetupAdapter`                                                                                                                                                                                                                                                            |
| `plugin-sdk/setup-tools`           | setup/설치 CLI/아카이브/문서 헬퍼                                                          | `formatCliCommand`, `detectBinary`, `extractArchive`, `resolveBrewExecutable`, `formatDocsLink`, `CONFIG_DIR`                                                                                                                                                                                   |

`moveSingleAccountChannelSectionToDefaultAccount(...)`와 같은 구성 패치 헬퍼를 포함한 전체 공유 setup 도구 상자를 원할 때 더 넓은 `plugin-sdk/setup` 이음새를 사용하십시오.

Setup 패치 어댑터는 임포트 시 핫 경로 안전을 유지합니다. 번들 단일 계정 승격 계약 표면 조회는 지연되므로, `plugin-sdk/setup-runtime`을 임포트해도 어댑터가 실제로 사용되기 전에 번들 계약 표면 검색을 즉시 로드하지 않습니다.

### 채널 소유 단일 계정 승격

채널이 단일 계정 최상위 구성에서 `channels.<id>.accounts.*`로 업그레이드할 때, 기본 공유 동작은 승격된 계정 범위 값을 `accounts.default`로 이동하는 것입니다.

번들 채널은 setup 계약 표면을 통해 해당 승격을 좁히거나 재정의할 수 있습니다:

- `singleAccountKeysToMove`: 승격된 계정으로 이동해야 하는 추가 최상위 키
- `namedAccountPromotionKeys`: 명명된 계정이 이미 존재할 때 이 키들만 승격된 계정으로 이동하고, 공유 정책/delivery 키는 채널 루트에 유지됩니다
- `resolveSingleAccountPromotionTarget(...)`: 승격된 값을 받을 기존 계정 선택

Matrix가 현재 번들 예시입니다. 정확히 하나의 명명된 Matrix 계정이 이미 존재하거나 `defaultAccount`가 `Ops`와 같은 비표준 키를 가리키는 경우, 승격은 새 `accounts.default` 항목을 만드는 대신 해당 계정을 보존합니다.

## 구성 스키마

플러그인 구성은 매니페스트의 JSON 스키마에 대해 검증됩니다. 사용자는 다음을 통해 플러그인을 구성합니다:

```json5
{
  plugins: {
    entries: {
      "my-plugin": {
        config: {
          webhookSecret: "abc123",
        },
      },
    },
  },
}
```

플러그인은 등록 중 `api.pluginConfig`로 이 구성을 받습니다.

채널별 구성의 경우 대신 채널 구성 섹션을 사용하십시오:

```json5
{
  channels: {
    "my-channel": {
      token: "bot-token",
      allowFrom: ["user1", "user2"],
    },
  },
}
```

### 채널 구성 스키마 빌드하기

`openclaw/plugin-sdk/core`의 `buildChannelConfigSchema`를 사용하여 Zod 스키마를 OpenClaw가 검증하는 `ChannelConfigSchema` 래퍼로 변환하십시오:

```typescript
import { z } from "zod";
import { buildChannelConfigSchema } from "openclaw/plugin-sdk/core";

const accountSchema = z.object({
  token: z.string().optional(),
  allowFrom: z.array(z.string()).optional(),
  accounts: z.object({}).catchall(z.any()).optional(),
  defaultAccount: z.string().optional(),
});

const configSchema = buildChannelConfigSchema(accountSchema);
```

## Setup 마법사

채널 플러그인은 `openclaw onboard`를 위한 인터랙티브 setup 마법사를 제공할 수 있습니다. 마법사는 `ChannelPlugin`의 `ChannelSetupWizard` 객체입니다:

```typescript
import type { ChannelSetupWizard } from "openclaw/plugin-sdk/channel-setup";

const setupWizard: ChannelSetupWizard = {
  channel: "my-channel",
  status: {
    configuredLabel: "Connected",
    unconfiguredLabel: "Not configured",
    resolveConfigured: ({ cfg }) => Boolean((cfg.channels as any)?.["my-channel"]?.token),
  },
  credentials: [
    {
      inputKey: "token",
      providerHint: "my-channel",
      credentialLabel: "Bot token",
      preferredEnvVar: "MY_CHANNEL_BOT_TOKEN",
      envPrompt: "Use MY_CHANNEL_BOT_TOKEN from environment?",
      keepPrompt: "Keep current token?",
      inputPrompt: "Enter your bot token:",
      inspect: ({ cfg, accountId }) => {
        const token = (cfg.channels as any)?.["my-channel"]?.token;
        return {
          accountConfigured: Boolean(token),
          hasConfiguredValue: Boolean(token),
        };
      },
    },
  ],
};
```

`ChannelSetupWizard` 타입은 `credentials`, `textInputs`, `dmPolicy`, `allowFrom`, `groupAccess`, `prepare`, `finalize` 등을 지원합니다. 전체 예시는 번들 플러그인 패키지(예: Discord 플러그인 `src/channel.setup.ts`)를 참조하십시오.

표준 `note -> prompt -> parse -> merge -> patch` 흐름만 필요한 DM 허용 목록 프롬프트의 경우, `openclaw/plugin-sdk/setup`의 공유 setup 헬퍼를 선호하십시오: `createPromptParsedAllowFromForAccount(...)`, `createTopLevelChannelParsedAllowFromPrompt(...)`, `createNestedChannelParsedAllowFromPrompt(...)`.

레이블, 점수, 선택적 추가 줄만 다른 채널 setup 상태 블록의 경우, 각 플러그인에서 동일한 `status` 객체를 수작업으로 작성하는 대신 `openclaw/plugin-sdk/setup`의 `createStandardChannelSetupStatus(...)`를 선호하십시오.

특정 컨텍스트에서만 나타나는 선택적 setup 표면의 경우, `openclaw/plugin-sdk/channel-setup`의 `createOptionalChannelSetupSurface`를 사용하십시오:

```typescript
import { createOptionalChannelSetupSurface } from "openclaw/plugin-sdk/channel-setup";

const setupSurface = createOptionalChannelSetupSurface({
  channel: "my-channel",
  label: "My Channel",
  npmSpec: "@myorg/openclaw-my-channel",
  docsPath: "/channels/my-channel",
});
// { setupAdapter, setupWizard } 반환
```

`plugin-sdk/channel-setup`은 해당 선택적 설치 표면의 절반만 필요할 때 하위 수준 `createOptionalChannelSetupAdapter(...)` 및 `createOptionalChannelSetupWizard(...)` 빌더도 노출합니다.

생성된 선택적 어댑터/마법사는 실제 구성 쓰기에서 닫힌 상태로 실패합니다. `validateInput`, `applyAccountConfig`, `finalize` 전반에 걸쳐 하나의 설치 필수 메시지를 재사용하고, `docsPath`가 설정된 경우 문서 링크를 추가합니다.

바이너리 기반 setup UI의 경우, 모든 채널에 동일한 바이너리/상태 접착제를 복사하는 대신 공유 위임 헬퍼를 선호하십시오:

- 레이블, 힌트, 점수, 바이너리 감지만 다른 상태 블록을 위한 `createDetectedBinaryStatus(...)`
- 경로 기반 텍스트 입력을 위한 `createCliPathTextInput(...)`
- `setupEntry`가 무거운 전체 마법사에 지연 방식으로 전달해야 할 때 `createDelegatedSetupWizardStatusResolvers(...)`, `createDelegatedPrepare(...)`, `createDelegatedFinalize(...)`, `createDelegatedResolveConfigured(...)`
- `setupEntry`가 `textInputs[*].shouldPrompt` 결정만 위임해야 할 때 `createDelegatedTextInputShouldPrompt(...)`

## 게시 및 설치

**외부 플러그인:** [ClawHub](/tools/clawhub) 또는 npm에 게시한 후 설치하십시오:

```bash
openclaw plugins install @myorg/openclaw-my-plugin
```

OpenClaw는 먼저 ClawHub를 시도하고 자동으로 npm으로 폴백합니다. ClawHub를 명시적으로 강제할 수도 있습니다:

```bash
openclaw plugins install clawhub:@myorg/openclaw-my-plugin   # ClawHub만
```

ClawHub 폴백 후 npm 경로를 원할 때는 일반 npm 패키지 스펙을 사용하십시오:

```bash
openclaw plugins install @myorg/openclaw-my-plugin
```

**레포 내 플러그인:** 번들 플러그인 워크스페이스 트리 아래에 배치하면 빌드 중 자동으로 검색됩니다.

**사용자가 설치할 수 있는 방법:**

```bash
openclaw plugins install <package-name>
```

<Info>
  npm 소스 설치의 경우 `openclaw plugins install`은 `npm install --ignore-scripts`를 실행합니다(수명 주기 스크립트 없음). 플러그인 의존성 트리를 순수 JS/TS로 유지하고 `postinstall` 빌드가 필요한 패키지를 피하십시오.
</Info>

## 관련 문서

- [SDK 엔트리포인트](/plugins/sdk-entrypoints) — `definePluginEntry` 및 `defineChannelPluginEntry`
- [플러그인 매니페스트](/plugins/manifest) — 전체 매니페스트 스키마 레퍼런스
- [플러그인 빌드하기](/plugins/building-plugins) — 단계별 시작 가이드
