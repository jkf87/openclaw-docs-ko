---
summary: "definePluginEntry, defineChannelPluginEntry, defineSetupPluginEntry 레퍼런스"
title: "플러그인 엔트리 포인트"
sidebarTitle: "엔트리 포인트"
read_when:
  - definePluginEntry 또는 defineChannelPluginEntry의 정확한 타입 시그니처가 필요할 때
  - 등록 모드(full vs setup vs CLI 메타데이터)를 이해하고 싶을 때
  - 엔트리 포인트 옵션을 찾아볼 때
---

모든 플러그인은 기본 엔트리(entry) 객체를 내보냅니다. SDK는 이를 생성하기 위한 세 가지 헬퍼를 제공합니다.

설치된 플러그인의 경우, `package.json`은 사용 가능할 때 런타임 로딩이 빌드된 JavaScript를 가리키도록 해야 합니다:

```json
{
  "openclaw": {
    "extensions": ["./src/index.ts"],
    "runtimeExtensions": ["./dist/index.js"],
    "setupEntry": "./src/setup-entry.ts",
    "runtimeSetupEntry": "./dist/setup-entry.js"
  }
}
```

`extensions`와 `setupEntry`는 워크스페이스 및 git 체크아웃 개발을 위한 유효한 소스 엔트리로 남아 있습니다. `runtimeExtensions`와 `runtimeSetupEntry`는 OpenClaw가 설치된 패키지를 로드할 때 선호되며, npm 패키지가 런타임 TypeScript 컴파일을 피할 수 있게 해줍니다. 설치된 패키지가 TypeScript 소스 엔트리만 선언한 경우, OpenClaw는 존재할 때 일치하는 빌드된 `dist/*.js` 피어를 사용하고, 그 다음 TypeScript 소스로 폴백합니다.

모든 엔트리 경로는 플러그인 패키지 디렉토리 내부에 있어야 합니다. 런타임 엔트리와 추론된 빌드 JavaScript 피어는 `extensions`나 `setupEntry` 소스 경로가 디렉토리 밖으로 벗어나는 것을 유효하게 만들지 않습니다.

<Tip>
  **단계별 가이드를 찾고 계신가요?** 단계별 안내는 [채널 플러그인](/plugins/sdk-channel-plugins)이나 [프로바이더 플러그인](/plugins/sdk-provider-plugins)을 참조하십시오.
</Tip>

## `definePluginEntry`

**Import:** `openclaw/plugin-sdk/plugin-entry`

provider 플러그인, tool 플러그인, hook 플러그인, 그리고 메시징 채널이 **아닌** 모든 것에 사용합니다.

```typescript
import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";

export default definePluginEntry({
  id: "my-plugin",
  name: "My Plugin",
  description: "Short summary",
  register(api) {
    api.registerProvider({
      /* ... */
    });
    api.registerTool({
      /* ... */
    });
  },
});
```

| 필드           | 타입                                                             | 필수   | 기본값              |
| -------------- | ---------------------------------------------------------------- | ------ | ------------------- |
| `id`           | `string`                                                         | 예     | —                   |
| `name`         | `string`                                                         | 예     | —                   |
| `description`  | `string`                                                         | 예     | —                   |
| `kind`         | `string`                                                         | 아니오 | —                   |
| `configSchema` | `OpenClawPluginConfigSchema \| () => OpenClawPluginConfigSchema` | 아니오 | 빈 객체 스키마      |
| `register`     | `(api: OpenClawPluginApi) => void`                               | 예     | —                   |

- `id`는 `openclaw.plugin.json` 매니페스트와 일치해야 합니다.
- `kind`는 배타적 슬롯용입니다: `"memory"` 또는 `"context-engine"`.
- `configSchema`는 지연 평가를 위해 함수가 될 수 있습니다.
- OpenClaw는 첫 접근 시 해당 스키마를 해결하고 메모이즈하므로, 비용이 많이 드는 스키마 빌더는 한 번만 실행됩니다.

## `defineChannelPluginEntry`

**Import:** `openclaw/plugin-sdk/channel-core`

`definePluginEntry`를 채널 관련 와이어링으로 감쌉니다. 자동으로 `api.registerChannel({ plugin })`을 호출하고, 선택적 root-help CLI 메타데이터 이음새를 노출하며, 등록 모드에 따라 `registerFull`을 게이팅합니다.

```typescript
import { defineChannelPluginEntry } from "openclaw/plugin-sdk/channel-core";

export default defineChannelPluginEntry({
  id: "my-channel",
  name: "My Channel",
  description: "Short summary",
  plugin: myChannelPlugin,
  setRuntime: setMyRuntime,
  registerCliMetadata(api) {
    api.registerCli(/* ... */);
  },
  registerFull(api) {
    api.registerGatewayMethod(/* ... */);
  },
});
```

| 필드                  | 타입                                                             | 필수   | 기본값              |
| --------------------- | ---------------------------------------------------------------- | ------ | ------------------- |
| `id`                  | `string`                                                         | 예     | —                   |
| `name`                | `string`                                                         | 예     | —                   |
| `description`         | `string`                                                         | 예     | —                   |
| `plugin`              | `ChannelPlugin`                                                  | 예     | —                   |
| `configSchema`        | `OpenClawPluginConfigSchema \| () => OpenClawPluginConfigSchema` | 아니오 | 빈 객체 스키마      |
| `setRuntime`          | `(runtime: PluginRuntime) => void`                               | 아니오 | —                   |
| `registerCliMetadata` | `(api: OpenClawPluginApi) => void`                               | 아니오 | —                   |
| `registerFull`        | `(api: OpenClawPluginApi) => void`                               | 아니오 | —                   |

- `setRuntime`은 등록 중에 호출되어 런타임 참조를 저장할 수 있게 합니다(일반적으로 `createPluginRuntimeStore`를 통해). CLI 메타데이터 캡처 중에는 건너뜁니다.
- `registerCliMetadata`는 `api.registrationMode === "cli-metadata"`와 `api.registrationMode === "full"` 양쪽 모두에서 실행됩니다. 채널이 소유한 CLI 디스크립터의 표준 위치로 사용하여, root help가 비활성 상태를 유지하면서도 일반 CLI 명령 등록이 전체 플러그인 로드와 호환되도록 하십시오.
- `registerFull`은 `api.registrationMode === "full"`일 때만 실행됩니다. setup 전용 로딩 중에는 건너뜁니다.
- `definePluginEntry`와 마찬가지로, `configSchema`는 지연 팩토리가 될 수 있으며 OpenClaw는 첫 접근 시 해결된 스키마를 메모이즈합니다.
- 플러그인이 소유한 root CLI 명령의 경우, 명령이 root CLI 파싱 트리에서 사라지지 않으면서 지연 로드 상태를 유지하기를 원한다면 `api.registerCli(..., { descriptors: [...] })`를 선호하십시오. 채널 플러그인의 경우, 해당 디스크립터를 `registerCliMetadata(...)`에서 등록하는 것을 선호하고 `registerFull(...)`은 런타임 전용 작업에 집중하도록 하십시오.
- `registerFull(...)`이 게이트웨이 RPC 메서드도 등록하는 경우, 플러그인별 접두사를 유지하십시오. 예약된 코어 관리자 네임스페이스(`config.*`, `exec.approvals.*`, `wizard.*`, `update.*`)는 항상 `operator.admin`으로 강제됩니다.

## `defineSetupPluginEntry`

**Import:** `openclaw/plugin-sdk/channel-core`

경량 `setup-entry.ts` 파일용입니다. 런타임이나 CLI 와이어링 없이 `{ plugin }`만 반환합니다.

```typescript
import { defineSetupPluginEntry } from "openclaw/plugin-sdk/channel-core";

export default defineSetupPluginEntry(myChannelPlugin);
```

OpenClaw는 채널이 비활성화되었거나, 구성되지 않았거나, 지연 로딩이 활성화된 경우에 전체 엔트리 대신 이것을 로드합니다. 이것이 중요해지는 경우는 [Setup 및 구성](/plugins/sdk-setup#setup-entry)을 참조하십시오.

실제로는 `defineSetupPluginEntry(...)`를 좁은 setup 헬퍼 제품군과 짝지으십시오:

- import-safe setup 패치 어댑터, 조회-노트 출력, `promptResolvedAllowFrom`, `splitSetupEntries`, 위임된 setup 프록시와 같은 런타임 안전 setup 헬퍼는 `openclaw/plugin-sdk/setup-runtime`
- 선택적 설치 setup 표면은 `openclaw/plugin-sdk/channel-setup`
- setup/install CLI/아카이브/문서 헬퍼는 `openclaw/plugin-sdk/setup-tools`

무거운 SDK, CLI 등록, 장기 실행 런타임 서비스는 full 엔트리에 유지하십시오.

setup과 런타임 표면을 분할하는 번들 워크스페이스 채널은 대신 `openclaw/plugin-sdk/channel-entry-contract`의 `defineBundledChannelSetupEntry(...)`를 사용할 수 있습니다. 해당 계약은 setup 엔트리가 런타임 setter를 노출하면서도 setup-safe plugin/secrets exports를 유지할 수 있게 해줍니다:

```typescript
import { defineBundledChannelSetupEntry } from "openclaw/plugin-sdk/channel-entry-contract";

export default defineBundledChannelSetupEntry({
  importMetaUrl: import.meta.url,
  plugin: {
    specifier: "./channel-plugin-api.js",
    exportName: "myChannelPlugin",
  },
  runtime: {
    specifier: "./runtime-api.js",
    exportName: "setMyChannelRuntime",
  },
});
```

해당 번들 계약은 setup 플로우가 full 채널 엔트리 로드 전에 경량 런타임 setter가 진정으로 필요할 때만 사용하십시오.

## 등록 모드

`api.registrationMode`는 플러그인이 어떻게 로드되었는지 알려줍니다:

| 모드              | 시점                                    | 등록할 항목                                                                           |
| ----------------- | --------------------------------------- | ------------------------------------------------------------------------------------- |
| `"full"`          | 일반 게이트웨이 시작                    | 모든 것                                                                               |
| `"setup-only"`    | 비활성화/미구성 채널                    | 채널 등록만                                                                           |
| `"setup-runtime"` | 런타임이 사용 가능한 setup 플로우       | 채널 등록과 full 엔트리가 로드되기 전에 필요한 경량 런타임만                          |
| `"cli-metadata"`  | Root help / CLI 메타데이터 캡처         | CLI 디스크립터만                                                                      |

`defineChannelPluginEntry`는 이 분할을 자동으로 처리합니다. 채널에 대해 `definePluginEntry`를 직접 사용하는 경우, 모드를 직접 확인하십시오:

```typescript
register(api) {
  if (api.registrationMode === "cli-metadata" || api.registrationMode === "full") {
    api.registerCli(/* ... */);
    if (api.registrationMode === "cli-metadata") return;
  }

  api.registerChannel({ plugin: myPlugin });
  if (api.registrationMode !== "full") return;

  // Heavy runtime-only registrations
  api.registerService(/* ... */);
}
```

`"setup-runtime"`은 setup 전용 시작 표면이 full 번들 채널 런타임에 재진입하지 않고 존재해야 하는 창으로 취급하십시오. 적합한 대상은 채널 등록, setup-safe HTTP 라우트, setup-safe 게이트웨이 메서드, 위임된 setup 헬퍼입니다. 무거운 백그라운드 서비스, CLI 레지스트라, provider/client SDK 부트스트랩은 여전히 `"full"`에 속합니다.

CLI 레지스트라의 경우 특히:

- 레지스트라가 하나 이상의 root 명령을 소유하고 OpenClaw가 첫 호출 시 실제 CLI 모듈을 지연 로드하기를 원할 때 `descriptors`를 사용하십시오
- 해당 디스크립터가 레지스트라가 노출하는 모든 최상위 명령 root를 포함하는지 확인하십시오
- 즉시 실행 호환성 경로에만 `commands`를 단독으로 사용하십시오

## 플러그인 형태

OpenClaw는 로드된 플러그인을 등록 동작에 따라 분류합니다:

| 형태                  | 설명                                               |
| --------------------- | -------------------------------------------------- |
| **plain-capability**  | 하나의 역량 타입 (예: provider 전용)               |
| **hybrid-capability** | 여러 역량 타입 (예: provider + speech)             |
| **hook-only**         | 훅만 있고 역량 없음                                |
| **non-capability**    | 도구/명령/서비스만 있고 역량 없음                  |

플러그인의 형태를 보려면 `openclaw plugins inspect <id>`를 사용하십시오.

## 관련 문서

- [SDK 개요](/plugins/sdk-overview) — 등록 API 및 서브패스 레퍼런스
- [런타임 헬퍼](/plugins/sdk-runtime) — `api.runtime` 및 `createPluginRuntimeStore`
- [Setup 및 구성](/plugins/sdk-setup) — 매니페스트, setup 엔트리, 지연 로딩
- [채널 플러그인](/plugins/sdk-channel-plugins) — `ChannelPlugin` 객체 빌드
- [프로바이더 플러그인](/plugins/sdk-provider-plugins) — provider 등록 및 훅
