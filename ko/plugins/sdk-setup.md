---
summary: "setup wizard, setup-entry.ts, config 스키마 및 package.json 메타데이터"
title: "플러그인 setup 및 config"
sidebarTitle: "Setup 및 Config"
read_when:
  - 플러그인에 setup wizard를 추가할 때
  - setup-entry.ts와 index.ts의 차이를 이해해야 할 때
  - 플러그인 config 스키마 또는 package.json openclaw 메타데이터를 정의할 때
---

플러그인 패키징(`package.json` 메타데이터), 매니페스트(`openclaw.plugin.json`), setup 엔트리, config 스키마에 대한 레퍼런스입니다.

<Tip>
  **워크스루를 찾으십니까?** how-to 가이드는 패키징을 맥락 속에서 다룹니다:
  [Channel Plugins](/plugins/sdk-channel-plugins#step-1-package-and-manifest) 및
  [Provider Plugins](/plugins/sdk-provider-plugins#step-1-package-and-manifest).
</Tip>

## 패키지 메타데이터

`package.json`에는 플러그인 시스템에 플러그인이 무엇을 제공하는지 알려주는 `openclaw` 필드가 필요합니다:

**Channel 플러그인:**

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

**Provider 플러그인 / ClawHub 배포 베이스라인:**

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

ClawHub에서 플러그인을 외부에 배포하는 경우 이러한 `compat` 및 `build` 필드가 필수입니다. 표준 배포 스니펫은 `docs/snippets/plugin-publish/`에 있습니다.

### `openclaw` 필드

| 필드         | 타입       | 설명                                                                                                                         |
| ------------ | ---------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `extensions` | `string[]` | 엔트리 포인트 파일 (패키지 루트에 상대적)                                                                                    |
| `setupEntry` | `string`   | 경량 setup 전용 엔트리 (선택 사항)                                                                                           |
| `channel`    | `object`   | setup, picker, quickstart 및 상태 표면을 위한 channel 카탈로그 메타데이터                                                    |
| `providers`  | `string[]` | 이 플러그인이 등록하는 provider id                                                                                           |
| `install`    | `object`   | 설치 힌트: `npmSpec`, `localPath`, `defaultChoice`, `minHostVersion`, `expectedIntegrity`, `allowInvalidConfigRecovery`      |
| `startup`    | `object`   | 시작 동작 플래그                                                                                                             |

### `openclaw.channel`

`openclaw.channel`은 runtime 로드 이전에 channel 검색 및 setup 표면을 위한 저렴한 패키지 메타데이터입니다.

| 필드                                   | 타입       | 의미                                                                                  |
| -------------------------------------- | ---------- | ------------------------------------------------------------------------------------- |
| `id`                                   | `string`   | 표준 channel id.                                                                      |
| `label`                                | `string`   | 기본 channel 레이블.                                                                  |
| `selectionLabel`                       | `string`   | `label`과 달라야 할 때 사용하는 picker/setup 레이블.                                  |
| `detailLabel`                          | `string`   | 풍부한 channel 카탈로그 및 상태 표면을 위한 보조 상세 레이블.                         |
| `docsPath`                             | `string`   | setup 및 선택 링크를 위한 docs 경로.                                                  |
| `docsLabel`                            | `string`   | channel id와 달라야 할 때 docs 링크에 사용되는 재정의 레이블.                         |
| `blurb`                                | `string`   | 짧은 onboarding/카탈로그 설명.                                                        |
| `order`                                | `number`   | channel 카탈로그에서의 정렬 순서.                                                     |
| `aliases`                              | `string[]` | channel 선택을 위한 추가 조회 별칭.                                                   |
| `preferOver`                           | `string[]` | 이 channel이 우선해야 하는 낮은 우선순위 플러그인/channel id.                         |
| `systemImage`                          | `string`   | channel UI 카탈로그를 위한 선택적 아이콘/시스템 이미지 이름.                          |
| `selectionDocsPrefix`                  | `string`   | 선택 표면에서 docs 링크 앞에 오는 접두사 텍스트.                                      |
| `selectionDocsOmitLabel`               | `boolean`  | 선택 문구에서 레이블이 있는 docs 링크 대신 docs 경로를 직접 표시합니다.               |
| `selectionExtras`                      | `string[]` | 선택 문구에 덧붙이는 추가 짧은 문자열.                                                |
| `markdownCapable`                      | `boolean`  | 아웃바운드 포맷팅 결정을 위해 channel을 markdown 지원으로 표시합니다.                 |
| `exposure`                             | `object`   | setup, 구성된 목록 및 docs 표면에 대한 channel 가시성 제어.                           |
| `quickstartAllowFrom`                  | `boolean`  | 이 channel을 표준 quickstart `allowFrom` setup 흐름에 포함시킵니다.                   |
| `forceAccountBinding`                  | `boolean`  | 계정이 하나만 있어도 명시적인 계정 바인딩을 요구합니다.                               |
| `preferSessionLookupForAnnounceTarget` | `boolean`  | 이 channel의 공지 대상 해결 시 세션 조회를 선호합니다.                                |

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

- `configured`: 구성된/상태 스타일 목록 표면에 channel 포함
- `setup`: 인터랙티브 setup/configure picker에 channel 포함
- `docs`: docs/내비게이션 표면에서 channel을 공개 대상으로 표시

`showConfigured` 및 `showInSetup`은 레거시 별칭으로 여전히 지원됩니다. `exposure`를 선호하십시오.

### `openclaw.install`

`openclaw.install`은 매니페스트 메타데이터가 아니라 패키지 메타데이터입니다.

| 필드                         | 타입                 | 의미                                                                              |
| ---------------------------- | -------------------- | --------------------------------------------------------------------------------- |
| `npmSpec`                    | `string`             | 설치/업데이트 흐름을 위한 표준 npm spec.                                          |
| `localPath`                  | `string`             | 로컬 개발 또는 번들 설치 경로.                                                    |
| `defaultChoice`              | `"npm"` \| `"local"` | 둘 다 사용 가능할 때 선호되는 설치 소스.                                          |
| `minHostVersion`             | `string`             | `>=x.y.z` 형태의 최소 지원 OpenClaw 버전.                                         |
| `expectedIntegrity`          | `string`             | 고정 설치를 위한 예상 npm dist integrity 문자열, 일반적으로 `sha512-...`.         |
| `allowInvalidConfigRecovery` | `boolean`            | 번들 플러그인 재설치 흐름이 특정 오래된 config 실패에서 복구할 수 있도록 합니다. |

인터랙티브 onboarding은 install-on-demand 표면에도 `openclaw.install`을 사용합니다. 플러그인이 runtime 로드 이전에 provider auth 선택지 또는 channel setup/카탈로그 메타데이터를 노출하면, onboarding은 해당 선택지를 표시하고, npm 대 로컬 설치를 프롬프트하고, 플러그인을 설치하거나 활성화한 다음, 선택된 흐름을 계속 진행할 수 있습니다. Npm onboarding 선택지에는 레지스트리 `npmSpec`이 있는 신뢰할 수 있는 카탈로그 메타데이터가 필요합니다; 정확한 버전과 `expectedIntegrity`는 선택적 고정값입니다. `expectedIntegrity`가 있으면 설치/업데이트 흐름이 이를 강제합니다. "무엇을 표시할지" 메타데이터는 `openclaw.plugin.json`에 유지하고 "어떻게 설치할지" 메타데이터는 `package.json`에 유지하십시오.

`minHostVersion`이 설정되면 설치와 매니페스트 레지스트리 로딩 모두가 이를 강제합니다. 오래된 호스트는 플러그인을 건너뛰고; 잘못된 버전 문자열은 거부됩니다.

고정된 npm 설치의 경우 정확한 버전을 `npmSpec`에 유지하고 예상 아티팩트 integrity를 추가하십시오:

```json
{
  "openclaw": {
    "install": {
      "npmSpec": "@wecom/wecom-openclaw-plugin@1.2.3",
      "expectedIntegrity": "sha512-REPLACE_WITH_NPM_DIST_INTEGRITY",
      "defaultChoice": "npm"
    }
  }
}
```

`allowInvalidConfigRecovery`는 손상된 config에 대한 일반적인 우회 수단이 아닙니다. 이것은 좁은 의미의 번들 플러그인 복구 전용이므로, 재설치/setup이 누락된 번들 플러그인 경로나 동일 플러그인에 대한 오래된 `channels.<id>` 항목과 같이 알려진 업그레이드 잔여물을 복구할 수 있게 합니다. 관련 없는 이유로 config가 손상된 경우 설치는 여전히 안전하게 실패하고 운영자에게 `openclaw doctor --fix`를 실행하도록 알립니다.

### 지연된 전체 로드

Channel 플러그인은 다음을 통해 지연 로딩을 선택할 수 있습니다:

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

활성화되면 OpenClaw는 이미 구성된 channel에 대해서도 pre-listen 시작 단계에서 `setupEntry`만 로드합니다. 전체 엔트리는 gateway가 listen을 시작한 후에 로드됩니다.

<Warning>
  gateway가 listen을 시작하기 전에 필요한 모든 것(channel 등록, HTTP 라우트, gateway 메서드)을 `setupEntry`가 등록할 때만 지연 로딩을 활성화하십시오. 전체 엔트리가 필수 시작 역량을 소유하는 경우 기본 동작을 유지하십시오.
</Warning>

Setup/전체 엔트리가 gateway RPC 메서드를 등록하는 경우 플러그인 전용 접두사에 유지하십시오. 예약된 코어 관리 네임스페이스(`config.*`, `exec.approvals.*`, `wizard.*`, `update.*`)는 코어 소유로 유지되며 항상 `operator.admin`으로 해결됩니다.

## 플러그인 매니페스트

모든 네이티브 플러그인은 패키지 루트에 `openclaw.plugin.json`을 함께 배포해야 합니다. OpenClaw는 플러그인 코드를 실행하지 않고 config를 검증하기 위해 이것을 사용합니다.

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

Channel 플러그인의 경우 `kind`와 `channels`를 추가하십시오:

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

config가 없는 플러그인이라도 스키마를 함께 배포해야 합니다. 빈 스키마는 유효합니다:

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

## ClawHub 배포

플러그인 패키지의 경우 패키지 전용 ClawHub 명령을 사용하십시오:

```bash
clawhub package publish your-org/your-plugin --dry-run
clawhub package publish your-org/your-plugin
```

레거시 skill 전용 배포 별칭은 skill용입니다. 플러그인 패키지는 항상 `clawhub package publish`를 사용해야 합니다.

## Setup 엔트리

`setup-entry.ts` 파일은 `index.ts`의 경량 대안으로, OpenClaw가 setup 표면(onboarding, config 복구, 비활성화된 channel 검사)만 필요할 때 로드합니다.

```typescript
// setup-entry.ts
import { defineSetupPluginEntry } from "openclaw/plugin-sdk/channel-core";
import { myChannelPlugin } from "./src/channel.js";

export default defineSetupPluginEntry(myChannelPlugin);
```

이를 통해 setup 흐름 중에 무거운 runtime 코드(crypto 라이브러리, CLI 등록, 백그라운드 서비스)를 로드하는 것을 피할 수 있습니다.

setup 안전 내보내기를 사이드카 모듈에 유지하는 번들 워크스페이스 channel은 `defineSetupPluginEntry(...)` 대신 `openclaw/plugin-sdk/channel-entry-contract`의 `defineBundledChannelSetupEntry(...)`를 사용할 수 있습니다. 해당 번들 계약은 또한 setup 시점 runtime wiring을 경량이고 명시적으로 유지할 수 있도록 선택적 `runtime` 내보내기를 지원합니다.

**OpenClaw가 전체 엔트리 대신 `setupEntry`를 사용하는 경우:**

- channel이 비활성화되어 있지만 setup/onboarding 표면이 필요한 경우
- channel이 활성화되어 있지만 구성되지 않은 경우
- 지연 로딩이 활성화된 경우 (`deferConfiguredChannelFullLoadUntilAfterListen`)

**`setupEntry`가 등록해야 하는 것:**

- channel 플러그인 객체 (`defineSetupPluginEntry`를 통해)
- gateway listen 이전에 필요한 모든 HTTP 라우트
- 시작 중에 필요한 모든 gateway 메서드

이러한 시작 gateway 메서드도 여전히 `config.*` 또는 `update.*`와 같은 예약된 코어 관리 네임스페이스를 피해야 합니다.

**`setupEntry`에 포함하면 안 되는 것:**

- CLI 등록
- 백그라운드 서비스
- 무거운 runtime 임포트 (crypto, SDK)
- 시작 이후에만 필요한 gateway 메서드

### 좁은 setup helper 임포트

핫 setup 전용 경로의 경우, setup 표면의 일부만 필요하다면 더 넓은 `plugin-sdk/setup` 우산보다 좁은 setup helper 이음새를 선호하십시오:

| 임포트 경로                        | 용도                                                                                           | 주요 내보내기                                                                                                                                                                                                                                                                                |
| ---------------------------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `plugin-sdk/setup-runtime`         | `setupEntry` / 지연된 channel 시작에서 사용할 수 있는 setup 시점 runtime helper                | `createPatchedAccountSetupAdapter`, `createEnvPatchedAccountSetupAdapter`, `createSetupInputPresenceValidator`, `noteChannelLookupFailure`, `noteChannelLookupSummary`, `promptResolvedAllowFrom`, `splitSetupEntries`, `createAllowlistSetupWizardProxy`, `createDelegatedSetupWizardProxy` |
| `plugin-sdk/setup-adapter-runtime` | 환경 인식 계정 setup 어댑터                                                                    | `createEnvPatchedAccountSetupAdapter`                                                                                                                                                                                                                                                        |
| `plugin-sdk/setup-tools`           | setup/설치 CLI/아카이브/docs helper                                                            | `formatCliCommand`, `detectBinary`, `extractArchive`, `resolveBrewExecutable`, `formatDocsLink`, `CONFIG_DIR`                                                                                                                                                                                |

`moveSingleAccountChannelSectionToDefaultAccount(...)`와 같은 config-patch helper를 포함한 전체 공유 setup 툴박스가 필요할 때는 더 넓은 `plugin-sdk/setup` 이음새를 사용하십시오.

Setup patch 어댑터는 임포트 시 핫 경로에서 안전하게 유지됩니다. 번들 단일 계정 승격 계약-표면 조회는 지연적이므로, `plugin-sdk/setup-runtime`을 임포트해도 어댑터가 실제로 사용되기 전에 번들 계약-표면 검색을 적극적으로 로드하지 않습니다.

### Channel 소유 단일 계정 승격

Channel이 단일 계정 최상위 config에서 `channels.<id>.accounts.*`로 업그레이드할 때, 기본 공유 동작은 승격된 계정 범위 값을 `accounts.default`로 이동하는 것입니다.

번들 channel은 setup 계약 표면을 통해 해당 승격을 좁히거나 재정의할 수 있습니다:

- `singleAccountKeysToMove`: 승격된 계정으로 이동해야 하는 추가 최상위 키
- `namedAccountPromotionKeys`: 이름이 지정된 계정이 이미 있을 때, 이 키만 승격된 계정으로 이동합니다; 공유 정책/delivery 키는 channel 루트에 유지됩니다
- `resolveSingleAccountPromotionTarget(...)`: 어떤 기존 계정이 승격된 값을 받을지 선택합니다

Matrix가 현재 번들 예시입니다. 이미 이름이 지정된 Matrix 계정이 정확히 하나 있거나, `defaultAccount`가 `Ops`와 같은 기존 비표준 키를 가리킨다면, 승격은 새 `accounts.default` 항목을 만드는 대신 해당 계정을 보존합니다.

## Config 스키마

플러그인 config는 매니페스트의 JSON Schema에 대해 검증됩니다. 사용자는 다음을 통해 플러그인을 구성합니다:

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

플러그인은 등록 중에 이 config를 `api.pluginConfig`로 받습니다.

Channel 전용 config의 경우 channel config 섹션을 대신 사용하십시오:

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

### Channel config 스키마 빌드

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

## Setup wizard

Channel 플러그인은 `openclaw onboard`를 위한 인터랙티브 setup wizard를 제공할 수 있습니다. Wizard는 `ChannelPlugin`의 `ChannelSetupWizard` 객체입니다:

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

`ChannelSetupWizard` 타입은 `credentials`, `textInputs`, `dmPolicy`, `allowFrom`, `groupAccess`, `prepare`, `finalize` 등을 지원합니다. 전체 예시는 번들 플러그인 패키지(예: Discord 플러그인의 `src/channel.setup.ts`)를 참조하십시오.

표준 `note -> prompt -> parse -> merge -> patch` 흐름만 필요한 DM 허용 목록 프롬프트의 경우 `openclaw/plugin-sdk/setup`의 공유 setup helper를 선호하십시오: `createPromptParsedAllowFromForAccount(...)`, `createTopLevelChannelParsedAllowFromPrompt(...)`, `createNestedChannelParsedAllowFromPrompt(...)`.

레이블, 점수 및 선택적 추가 라인에 따라서만 달라지는 channel setup 상태 블록의 경우, 각 플러그인에서 동일한 `status` 객체를 직접 작성하는 대신 `openclaw/plugin-sdk/setup`의 `createStandardChannelSetupStatus(...)`를 선호하십시오.

특정 컨텍스트에서만 나타나야 하는 선택적 setup 표면의 경우 `openclaw/plugin-sdk/channel-setup`의 `createOptionalChannelSetupSurface`를 사용하십시오:

```typescript
import { createOptionalChannelSetupSurface } from "openclaw/plugin-sdk/channel-setup";

const setupSurface = createOptionalChannelSetupSurface({
  channel: "my-channel",
  label: "My Channel",
  npmSpec: "@myorg/openclaw-my-channel",
  docsPath: "/channels/my-channel",
});
// Returns { setupAdapter, setupWizard }
```

`plugin-sdk/channel-setup`은 또한 해당 선택적 설치 표면의 절반만 필요할 때 사용할 수 있는 저수준 `createOptionalChannelSetupAdapter(...)` 및 `createOptionalChannelSetupWizard(...)` 빌더를 노출합니다.

생성된 선택적 어댑터/wizard는 실제 config 쓰기 시 안전하게 실패합니다. 이들은 `validateInput`, `applyAccountConfig`, `finalize`에서 하나의 설치 필수 메시지를 재사용하고, `docsPath`가 설정된 경우 docs 링크를 추가합니다.

바이너리 기반 setup UI의 경우, 동일한 바이너리/상태 연결 코드를 모든 channel에 복사하는 대신 공유 위임 helper를 선호하십시오:

- `createDetectedBinaryStatus(...)`: 레이블, 힌트, 점수 및 바이너리 감지에 따라서만 달라지는 상태 블록용
- `createCliPathTextInput(...)`: 경로 기반 텍스트 입력용
- `createDelegatedSetupWizardStatusResolvers(...)`, `createDelegatedPrepare(...)`, `createDelegatedFinalize(...)`, `createDelegatedResolveConfigured(...)`: `setupEntry`가 더 무거운 전체 wizard로 지연 전달해야 할 때
- `createDelegatedTextInputShouldPrompt(...)`: `setupEntry`가 `textInputs[*].shouldPrompt` 결정만 위임하면 될 때

## 배포 및 설치

**외부 플러그인:** [ClawHub](/tools/clawhub) 또는 npm에 배포한 다음 설치하십시오:

```bash
openclaw plugins install @myorg/openclaw-my-plugin
```

OpenClaw는 먼저 ClawHub를 시도하고 자동으로 npm으로 폴백합니다. ClawHub를 명시적으로 강제할 수도 있습니다:

```bash
openclaw plugins install clawhub:@myorg/openclaw-my-plugin   # ClawHub only
```

일치하는 `npm:` 재정의는 없습니다. ClawHub 폴백 이후 npm 경로를 원할 때는 일반 npm 패키지 spec을 사용하십시오:

```bash
openclaw plugins install @myorg/openclaw-my-plugin
```

**리포지토리 내 플러그인:** 번들 플러그인 워크스페이스 트리 아래에 배치하면 빌드 중에 자동으로 검색됩니다.

**사용자 설치 방법:**

```bash
openclaw plugins install <package-name>
```

<Info>
  npm 소스 설치의 경우 `openclaw plugins install`은 `npm install --ignore-scripts`를 실행합니다(lifecycle 스크립트 없음). 플러그인 의존성 트리를 순수 JS/TS로 유지하고 `postinstall` 빌드가 필요한 패키지를 피하십시오.
</Info>

번들 OpenClaw 소유 플러그인은 유일한 시작 복구 예외입니다: 패키지 설치가 플러그인 config, 레거시 channel config 또는 번들 기본 활성화 매니페스트에 의해 활성화된 플러그인을 볼 때, 시작은 임포트하기 전에 해당 플러그인의 누락된 runtime 의존성을 설치합니다. 서드파티 플러그인은 시작 설치에 의존해서는 안 됩니다; 계속해서 명시적인 플러그인 설치 프로그램을 사용하십시오.

## 관련 문서

- [SDK 엔트리 포인트](/plugins/sdk-entrypoints) -- `definePluginEntry` 및 `defineChannelPluginEntry`
- [플러그인 매니페스트](/plugins/manifest) -- 전체 매니페스트 스키마 레퍼런스
- [플러그인 빌드하기](/plugins/building-plugins) -- 단계별 시작 가이드
