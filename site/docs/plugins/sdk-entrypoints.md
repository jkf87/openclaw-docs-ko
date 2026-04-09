---
title: "플러그인 엔트리포인트"
description: "definePluginEntry, defineChannelPluginEntry, defineSetupPluginEntry 레퍼런스"
---

# 플러그인 엔트리포인트

모든 플러그인은 기본 엔트리 객체를 내보냅니다. SDK는 이를 생성하기 위한 세 가지 헬퍼를 제공합니다.

::: tip
**단계별 안내가 필요하신가요?** 단계별 가이드는 [채널 플러그인](/plugins/sdk-channel-plugins)
  또는 [프로바이더 플러그인](/plugins/sdk-provider-plugins)을 참조하십시오.
:::


## `definePluginEntry`

**임포트:** `openclaw/plugin-sdk/plugin-entry`

프로바이더 플러그인, 도구 플러그인, 훅 플러그인, 그리고 메시징 채널이 **아닌** 모든 것에 사용합니다.

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

| 필드           | 타입                                                             | 필수 | 기본값              |
| -------------- | ---------------------------------------------------------------- | ---- | ------------------- |
| `id`           | `string`                                                         | 예   | —                   |
| `name`         | `string`                                                         | 예   | —                   |
| `description`  | `string`                                                         | 예   | —                   |
| `kind`         | `string`                                                         | 아니오 | —                   |
| `configSchema` | `OpenClawPluginConfigSchema \| () => OpenClawPluginConfigSchema` | 아니오 | 빈 객체 스키마      |
| `register`     | `(api: OpenClawPluginApi) => void`                               | 예   | —                   |

- `id`는 `openclaw.plugin.json` 매니페스트와 일치해야 합니다.
- `kind`는 독점 슬롯용입니다: `"memory"` 또는 `"context-engine"`.
- `configSchema`는 지연 평가를 위한 함수가 될 수 있습니다.
- OpenClaw는 첫 번째 접근 시 해당 스키마를 확인하고 메모이즈하므로, 비용이 큰 스키마 빌더는 한 번만 실행됩니다.

## `defineChannelPluginEntry`

**임포트:** `openclaw/plugin-sdk/channel-core`

채널별 와이어링과 함께 `definePluginEntry`를 래핑합니다. 자동으로 `api.registerChannel({ plugin })`을 호출하고, 선택적 루트 도움말 CLI 메타데이터 이음새를 노출하며, 등록 모드에 따라 `registerFull`을 제한합니다.

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

| 필드                  | 타입                                                             | 필수 | 기본값              |
| --------------------- | ---------------------------------------------------------------- | ---- | ------------------- |
| `id`                  | `string`                                                         | 예   | —                   |
| `name`                | `string`                                                         | 예   | —                   |
| `description`         | `string`                                                         | 예   | —                   |
| `plugin`              | `ChannelPlugin`                                                  | 예   | —                   |
| `configSchema`        | `OpenClawPluginConfigSchema \| () => OpenClawPluginConfigSchema` | 아니오 | 빈 객체 스키마      |
| `setRuntime`          | `(runtime: PluginRuntime) => void`                               | 아니오 | —                   |
| `registerCliMetadata` | `(api: OpenClawPluginApi) => void`                               | 아니오 | —                   |
| `registerFull`        | `(api: OpenClawPluginApi) => void`                               | 아니오 | —                   |

- `setRuntime`은 런타임 참조를 저장할 수 있도록 등록 중 호출됩니다(일반적으로 `createPluginRuntimeStore`를 통해). CLI 메타데이터 캡처 중에는 건너뜁니다.
- `registerCliMetadata`는 `api.registrationMode === "cli-metadata"`와 `api.registrationMode === "full"` 모두에서 실행됩니다.
  채널 소유 CLI 디스크립터의 표준 위치로 사용하면 루트 도움말이 비활성화 상태를 유지하면서 일반 CLI 명령 등록이 전체 플러그인 로드와 호환되도록 합니다.
- `registerFull`은 `api.registrationMode === "full"`일 때만 실행됩니다. setup 전용 로딩 중에는 건너뜁니다.
- `definePluginEntry`와 마찬가지로 `configSchema`는 지연 팩토리가 될 수 있으며 OpenClaw는 첫 번째 접근 시 확인된 스키마를 메모이즈합니다.
- 플러그인 소유 루트 CLI 명령에 대해, 루트 CLI 파스 트리에서 사라지지 않으면서 명령을 지연 로드하려면 `api.registerCli(..., { descriptors: [...] })`를 선호하십시오. 채널 플러그인의 경우 `registerCliMetadata(...)`에서 해당 디스크립터를 등록하고 `registerFull(...)`은 런타임 전용 작업에 집중하는 것을 권장합니다.
- `registerFull(...)`이 게이트웨이 RPC 메서드도 등록한다면 플러그인별 접두사로 유지하십시오. 예약된 코어 관리자 네임스페이스(`config.*`, `exec.approvals.*`, `wizard.*`, `update.*`)는 항상 `operator.admin`으로 강제 변환됩니다.

## `defineSetupPluginEntry`

**임포트:** `openclaw/plugin-sdk/channel-core`

경량 `setup-entry.ts` 파일용입니다. 런타임 또는 CLI 와이어링 없이 `{ plugin }`만 반환합니다.

```typescript
import { defineSetupPluginEntry } from "openclaw/plugin-sdk/channel-core";

export default defineSetupPluginEntry(myChannelPlugin);
```

OpenClaw는 채널이 비활성화되거나, 구성되지 않았거나, 지연 로딩이 활성화된 경우 전체 엔트리 대신 이것을 로드합니다. 이것이 중요한 경우는 [Setup 및 구성](/plugins/sdk-setup#setup-entry)을 참조하십시오.

실제로 `defineSetupPluginEntry(...)`를 좁은 setup 헬퍼 패밀리와 함께 사용하십시오:

- 임포트 안전 setup 패치 어댑터, 조회 노트 출력, `promptResolvedAllowFrom`, `splitSetupEntries`, 위임 setup 프록시 등 런타임 안전 setup 헬퍼를 위한 `openclaw/plugin-sdk/setup-runtime`
- 선택적 설치 setup 표면을 위한 `openclaw/plugin-sdk/channel-setup`
- setup/설치 CLI/아카이브/문서 헬퍼를 위한 `openclaw/plugin-sdk/setup-tools`

무거운 SDK, CLI 등록, 장기 실행 런타임 서비스는 전체 엔트리에 유지하십시오.

## 등록 모드

`api.registrationMode`는 플러그인이 어떻게 로드되었는지 알려줍니다:

| 모드              | 시기                              | 등록할 항목                                                                                   |
| ----------------- | --------------------------------- | --------------------------------------------------------------------------------------------- |
| `"full"`          | 일반 게이트웨이 시작              | 모든 것                                                                                       |
| `"setup-only"`    | 비활성화/미구성 채널              | 채널 등록만                                                                                   |
| `"setup-runtime"` | 런타임 사용 가능한 setup 흐름     | 채널 등록 및 전체 엔트리 로드 전에 필요한 경량 런타임만                                       |
| `"cli-metadata"`  | 루트 도움말 / CLI 메타데이터 캡처 | CLI 디스크립터만                                                                              |

`defineChannelPluginEntry`는 이 분기를 자동으로 처리합니다. 채널에 `definePluginEntry`를 직접 사용한다면 모드를 직접 확인하십시오:

```typescript
register(api) {
  if (api.registrationMode === "cli-metadata" || api.registrationMode === "full") {
    api.registerCli(/* ... */);
    if (api.registrationMode === "cli-metadata") return;
  }

  api.registerChannel({ plugin: myPlugin });
  if (api.registrationMode !== "full") return;

  // 무거운 런타임 전용 등록
  api.registerService(/* ... */);
}
```

`"setup-runtime"`은 setup 전용 시작 표면이 전체 번들 채널 런타임에 재진입하지 않고도 존재해야 하는 기간으로 처리하십시오. 적합한 항목은 채널 등록, setup 안전 HTTP 라우트, setup 안전 게이트웨이 메서드, 위임 setup 헬퍼입니다. 무거운 백그라운드 서비스, CLI 레지스트라, 프로바이더/클라이언트 SDK 부트스트랩은 여전히 `"full"`에 속합니다.

CLI 레지스트라의 경우 특히:

- 레지스트라가 하나 이상의 루트 명령을 소유하고 첫 번째 호출 시 실제 CLI 모듈을 지연 로드하도록 OpenClaw가 처리하길 원할 때 `descriptors`를 사용하십시오
- 해당 디스크립터가 레지스트라가 노출하는 모든 최상위 명령 루트를 포함하는지 확인하십시오
- 즉시 실행 호환성 경로에만 단독으로 `commands`를 사용하십시오

## 플러그인 형태

OpenClaw는 로드된 플러그인을 등록 동작에 따라 분류합니다:

| 형태                  | 설명                                               |
| --------------------- | -------------------------------------------------- |
| **plain-capability**  | 하나의 역량 타입(예: 프로바이더 전용)              |
| **hybrid-capability** | 여러 역량 타입(예: 프로바이더 + 음성)              |
| **hook-only**         | 훅만, 역량 없음                                    |
| **non-capability**    | 도구/명령/서비스는 있지만 역량 없음                |

`openclaw plugins inspect &lt;id&gt;`를 사용하여 플러그인의 형태를 확인하십시오.

## 관련 문서

- [SDK 개요](/plugins/sdk-overview) — 등록 API 및 서브패스 레퍼런스
- [런타임 헬퍼](/plugins/sdk-runtime) — `api.runtime` 및 `createPluginRuntimeStore`
- [Setup 및 구성](/plugins/sdk-setup) — 매니페스트, setup 엔트리, 지연 로딩
- [채널 플러그인](/plugins/sdk-channel-plugins) — `ChannelPlugin` 객체 빌드하기
- [프로바이더 플러그인](/plugins/sdk-provider-plugins) — 프로바이더 등록 및 훅
