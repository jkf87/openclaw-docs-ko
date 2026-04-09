---
title: "플러그인 테스팅"
description: "OpenClaw 플러그인을 위한 테스트 유틸리티 및 패턴"
---

# 플러그인 테스팅

OpenClaw 플러그인의 테스트 유틸리티, 패턴, 린트 적용에 대한 레퍼런스입니다.

::: tip
**테스트 예시가 필요하신가요?** 방법론 가이드에는 테스트 예시가 포함되어 있습니다:
  [채널 플러그인 테스트](/plugins/sdk-channel-plugins#step-6-test) 및
  [프로바이더 플러그인 테스트](/plugins/sdk-provider-plugins#step-6-test).
:::


## 테스트 유틸리티

**임포트:** `openclaw/plugin-sdk/testing`

testing 서브패스는 플러그인 작성자를 위한 좁은 헬퍼 집합을 내보냅니다:

```typescript
import {
  installCommonResolveTargetErrorCases,
  shouldAckReaction,
  removeAckReactionAfterReply,
} from "openclaw/plugin-sdk/testing";
```

### 사용 가능한 내보내기

| 내보내기                                | 목적                                                 |
| --------------------------------------- | ---------------------------------------------------- |
| `installCommonResolveTargetErrorCases`  | 타겟 해결 오류 처리를 위한 공유 테스트 케이스       |
| `shouldAckReaction`                     | 채널이 확인 반응을 추가해야 하는지 확인             |
| `removeAckReactionAfterReply`           | 답글 delivery 후 확인 반응 제거                     |

### 타입

testing 서브패스는 테스트 파일에 유용한 타입도 재내보냅니다:

```typescript
import type {
  ChannelAccountSnapshot,
  ChannelGatewayContext,
  OpenClawConfig,
  PluginRuntime,
  RuntimeEnv,
  MockFn,
} from "openclaw/plugin-sdk/testing";
```

## 타겟 해결 테스트

채널 타겟 해결을 위한 표준 오류 케이스를 추가하려면 `installCommonResolveTargetErrorCases`를 사용하십시오:

```typescript
import { describe } from "vitest";
import { installCommonResolveTargetErrorCases } from "openclaw/plugin-sdk/testing";

describe("my-channel target resolution", () => {
  installCommonResolveTargetErrorCases({
    resolveTarget: ({ to, mode, allowFrom }) => {
      // 채널의 타겟 해결 로직
      return myChannelResolveTarget({ to, mode, allowFrom });
    },
    implicitAllowFrom: ["user1", "user2"],
  });

  // 채널별 테스트 케이스 추가
  it("should resolve @username targets", () => {
    // ...
  });
});
```

## 테스트 패턴

### 채널 플러그인 단위 테스트

```typescript
import { describe, it, expect, vi } from "vitest";

describe("my-channel plugin", () => {
  it("should resolve account from config", () => {
    const cfg = {
      channels: {
        "my-channel": {
          token: "test-token",
          allowFrom: ["user1"],
        },
      },
    };

    const account = myPlugin.setup.resolveAccount(cfg, undefined);
    expect(account.token).toBe("test-token");
  });

  it("should inspect account without materializing secrets", () => {
    const cfg = {
      channels: {
        "my-channel": { token: "test-token" },
      },
    };

    const inspection = myPlugin.setup.inspectAccount(cfg, undefined);
    expect(inspection.configured).toBe(true);
    expect(inspection.tokenStatus).toBe("available");
    // 토큰 값은 노출되지 않음
    expect(inspection).not.toHaveProperty("token");
  });
});
```

### 프로바이더 플러그인 단위 테스트

```typescript
import { describe, it, expect } from "vitest";

describe("my-provider plugin", () => {
  it("should resolve dynamic models", () => {
    const model = myProvider.resolveDynamicModel({
      modelId: "custom-model-v2",
      // ... 컨텍스트
    });

    expect(model.id).toBe("custom-model-v2");
    expect(model.provider).toBe("my-provider");
    expect(model.api).toBe("openai-completions");
  });

  it("should return catalog when API key is available", async () => {
    const result = await myProvider.catalog.run({
      resolveProviderApiKey: () => ({ apiKey: "test-key" }),
      // ... 컨텍스트
    });

    expect(result?.provider?.models).toHaveLength(2);
  });
});
```

### 플러그인 런타임 목킹

`createPluginRuntimeStore`를 사용하는 코드의 경우 테스트에서 런타임을 목킹하십시오:

```typescript
import { createPluginRuntimeStore } from "openclaw/plugin-sdk/runtime-store";
import type { PluginRuntime } from "openclaw/plugin-sdk/runtime-store";

const store = createPluginRuntimeStore&lt;PluginRuntime&gt;("test runtime not set");

// 테스트 setup에서
const mockRuntime = {
  agent: {
    resolveAgentDir: vi.fn().mockReturnValue("/tmp/agent"),
    // ... 다른 목
  },
  config: {
    loadConfig: vi.fn(),
    writeConfigFile: vi.fn(),
  },
  // ... 다른 네임스페이스
} as unknown as PluginRuntime;

store.setRuntime(mockRuntime);

// 테스트 후
store.clearRuntime();
```

### 인스턴스별 스텁으로 테스트하기

프로토타입 변형보다 인스턴스별 스텁을 선호하십시오:

```typescript
// 권장: 인스턴스별 스텁
const client = new MyChannelClient();
client.sendMessage = vi.fn().mockResolvedValue({ id: "msg-1" });

// 지양: 프로토타입 변형
// MyChannelClient.prototype.sendMessage = vi.fn();
```

## 계약 테스트 (레포 내 플러그인)

번들 플러그인에는 등록 소유권을 검증하는 계약 테스트가 있습니다:

```bash
pnpm test -- src/plugins/contracts/
```

이 테스트는 다음을 검증합니다:

- 어떤 플러그인이 어떤 프로바이더를 등록하는지
- 어떤 플러그인이 어떤 음성 프로바이더를 등록하는지
- 등록 형태 정확성
- 런타임 계약 준수

### 스코프된 테스트 실행

특정 플러그인:

```bash
pnpm test -- &lt;bundled-plugin-root&gt;/my-channel/
```

계약 테스트만:

```bash
pnpm test -- src/plugins/contracts/shape.contract.test.ts
pnpm test -- src/plugins/contracts/auth.contract.test.ts
pnpm test -- src/plugins/contracts/runtime.contract.test.ts
```

## 린트 적용 (레포 내 플러그인)

`pnpm check`에 의해 레포 내 플러그인에 세 가지 규칙이 적용됩니다:

1. **모놀리식 루트 임포트 없음** — `openclaw/plugin-sdk` 루트 배럴은 거부됩니다
2. **직접 `src/` 임포트 없음** — 플러그인은 `../../src/`를 직접 임포트할 수 없습니다
3. **자기 임포트 없음** — 플러그인은 자신의 `plugin-sdk/&lt;name&gt;` 서브패스를 임포트할 수 없습니다

외부 플러그인에는 이 린트 규칙이 적용되지 않지만, 동일한 패턴을 따르는 것을 권장합니다.

## 테스트 구성

OpenClaw는 V8 커버리지 임계값과 함께 Vitest를 사용합니다. 플러그인 테스트:

```bash
# 모든 테스트 실행
pnpm test

# 특정 플러그인 테스트 실행
pnpm test -- &lt;bundled-plugin-root&gt;/my-channel/src/channel.test.ts

# 특정 테스트 이름 필터로 실행
pnpm test -- &lt;bundled-plugin-root&gt;/my-channel/ -t "resolves account"

# 커버리지로 실행
pnpm test:coverage
```

로컬 실행 시 메모리 압박이 발생한다면:

```bash
OPENCLAW_VITEST_MAX_WORKERS=1 pnpm test
```

## 관련 문서

- [SDK 개요](/plugins/sdk-overview) — 임포트 규칙
- [SDK 채널 플러그인](/plugins/sdk-channel-plugins) — 채널 플러그인 인터페이스
- [SDK 프로바이더 플러그인](/plugins/sdk-provider-plugins) — 프로바이더 플러그인 훅
- [플러그인 빌드하기](/plugins/building-plugins) — 시작 가이드
