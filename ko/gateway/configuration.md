---
summary: "Configuration 개요: 일반적인 작업, 빠른 설정, 전체 레퍼런스 링크"
read_when:
  - OpenClaw를 처음 설정할 때
  - 일반적인 configuration 패턴을 찾을 때
  - 특정 configuration 섹션으로 이동할 때
title: "Configuration"
sidebarTitle: "Configuration"
---

OpenClaw는 `~/.openclaw/openclaw.json`에서 선택적 <Tooltip tip="JSON5는 주석과 후행 쉼표를 지원합니다">**JSON5**</Tooltip> configuration을 읽습니다.
활성 configuration 경로는 일반 파일이어야 합니다. 심볼릭 링크된 `openclaw.json`
레이아웃은 OpenClaw 소유 쓰기에서 지원되지 않습니다; 원자적 쓰기가 심볼릭 링크를
보존하는 대신 경로를 대체할 수 있습니다. 기본 상태 디렉토리 외부에 configuration을
유지하는 경우, `OPENCLAW_CONFIG_PATH`를 실제 파일로 직접 가리키게 하십시오.

파일이 없으면, OpenClaw는 안전한 기본값을 사용합니다. configuration을 추가하는
일반적인 이유는 다음과 같습니다:

- Channel을 연결하고 봇에 메시지를 보낼 수 있는 사람을 제어
- 모델, tool, 샌드박싱, 또는 자동화(cron, hook) 설정
- 세션, 미디어, 네트워킹, UI 조정

사용 가능한 모든 필드는 [전체 레퍼런스](/gateway/configuration-reference)를
참조하십시오.

<Tip>
**Configuration이 처음이신가요?** 대화형 설정을 위해 `openclaw onboard`로 시작하거나, 전체 복사-붙여넣기 configuration을 위해 [Configuration 예시](/gateway/configuration-examples) 가이드를 확인하십시오.
</Tip>

## 최소 configuration

```json5
// ~/.openclaw/openclaw.json
{
  agents: { defaults: { workspace: "~/.openclaw/workspace" } },
  channels: { whatsapp: { allowFrom: ["+15555550123"] } },
}
```

## Configuration 편집

<Tabs>
  <Tab title="대화형 wizard">
    ```bash
    openclaw onboard       # full onboarding flow
    openclaw configure     # config wizard
    ```
  </Tab>
  <Tab title="CLI (한 줄 명령)">
    ```bash
    openclaw config get agents.defaults.workspace
    openclaw config set agents.defaults.heartbeat.every "2h"
    openclaw config unset plugins.entries.brave.config.webSearch.apiKey
    ```
  </Tab>
  <Tab title="Control UI">
    [http://127.0.0.1:18789](http://127.0.0.1:18789)을 열고 **Config** 탭을
    사용하십시오. Control UI는 라이브 configuration schema에서 폼을 렌더링하며,
    가능한 경우 plugin 및 channel 스키마와 함께 필드 `title` / `description`
    문서 메타데이터를 포함하고, **Raw JSON** 에디터를 탈출구로 제공합니다.
    드릴다운 UI 및 기타 툴링을 위해, gateway는 또한 한 경로 범위 schema 노드와
    즉시 하위 요약을 가져오는 `config.schema.lookup`을 노출합니다.
  </Tab>
  <Tab title="직접 편집">
    `~/.openclaw/openclaw.json`을 직접 편집하십시오. Gateway가 파일을 감시하고 변경을 자동으로 적용합니다([핫 리로드](#config-hot-reload) 참조).
  </Tab>
</Tabs>

## 엄격한 검증

<Warning>
OpenClaw는 스키마와 완전히 일치하는 configuration만 수락합니다. 알 수 없는 키, 잘못된 타입, 유효하지 않은 값은 Gateway가 **시작을 거부**하게 합니다. 유일한 루트 수준 예외는 `$schema`(문자열)이며, 에디터가 JSON Schema 메타데이터를 첨부할 수 있도록 합니다.
</Warning>

`openclaw config schema`는 Control UI 및 검증에 사용되는 정규 JSON Schema를
출력합니다. `config.schema.lookup`은 드릴다운 툴링을 위해 하나의 경로 범위
노드와 하위 요약을 가져옵니다. 필드 `title`/`description` 문서 메타데이터는
중첩된 객체, wildcard(`*`), array-item(`[]`), `anyOf`/`oneOf`/`allOf` 분기를
통해 전달됩니다. 런타임 plugin 및 channel 스키마는 manifest 레지스트리가
로드될 때 병합됩니다.

검증이 실패하면:

- Gateway는 부팅되지 않습니다
- 진단 명령만 작동합니다(`openclaw doctor`, `openclaw logs`, `openclaw health`, `openclaw status`)
- 정확한 문제를 확인하려면 `openclaw doctor`를 실행하십시오
- 복구를 적용하려면 `openclaw doctor --fix`(또는 `--yes`)를 실행하십시오

Gateway는 각 성공적인 시작 후 신뢰된 last-known-good 사본을 유지합니다.
`openclaw.json`이 나중에 검증에 실패하거나(또는 `gateway.mode`를 누락하거나,
급격히 축소되거나, 로그 라인이 앞에 추가된 경우), OpenClaw는 손상된 파일을
`.clobbered.*`로 보존하고, last-known-good 사본을 복원하고, 복구 이유를
기록합니다. 다음 agent 턴에도 시스템 이벤트 경고가 수신되어 주 agent가
복원된 configuration을 맹목적으로 다시 쓰지 않도록 합니다. 후보에 `***` 같은
수정된 시크릿 placeholder가 포함된 경우 last-known-good으로의 승격은
건너뜁니다.

## 일반적인 작업

<AccordionGroup>
  <Accordion title="채널 설정 (WhatsApp, Telegram, Discord 등)">
    각 channel은 `channels.<provider>` 아래에 자체 configuration 섹션이 있습니다. 설정 단계는 전용 channel 페이지를 참조하십시오:

    - [WhatsApp](/channels/whatsapp) — `channels.whatsapp`
    - [Telegram](/channels/telegram) — `channels.telegram`
    - [Discord](/channels/discord) — `channels.discord`
    - [Feishu](/channels/feishu) — `channels.feishu`
    - [Google Chat](/channels/googlechat) — `channels.googlechat`
    - [Microsoft Teams](/channels/msteams) — `channels.msteams`
    - [Slack](/channels/slack) — `channels.slack`
    - [Signal](/channels/signal) — `channels.signal`
    - [iMessage](/channels/imessage) — `channels.imessage`
    - [Mattermost](/channels/mattermost) — `channels.mattermost`

    모든 channel은 동일한 DM 정책 패턴을 공유합니다:

    ```json5
    {
      channels: {
        telegram: {
          enabled: true,
          botToken: "123:abc",
          dmPolicy: "pairing",   // pairing | allowlist | open | disabled
          allowFrom: ["tg:123"], // only for allowlist/open
        },
      },
    }
    ```

  </Accordion>

  <Accordion title="모델 선택 및 구성">
    주 모델과 선택적 fallback을 설정하십시오:

    ```json5
    {
      agents: {
        defaults: {
          model: {
            primary: "anthropic/claude-sonnet-4-6",
            fallbacks: ["openai/gpt-5.4"],
          },
          models: {
            "anthropic/claude-sonnet-4-6": { alias: "Sonnet" },
            "openai/gpt-5.4": { alias: "GPT" },
          },
        },
      },
    }
    ```

    - `agents.defaults.models`는 모델 카탈로그를 정의하고 `/model`의 허용 목록 역할을 합니다.
    - 기존 모델을 제거하지 않고 허용 목록 항목을 추가하려면 `openclaw config set agents.defaults.models '<json>' --strict-json --merge`를 사용하십시오. 항목을 제거하는 일반 교체는 `--replace`를 전달하지 않는 한 거부됩니다.
    - 모델 ref는 `provider/model` 형식을 사용합니다(예: `anthropic/claude-opus-4-6`).
    - `agents.defaults.imageMaxDimensionPx`는 transcript/tool 이미지 다운스케일링을 제어합니다(기본값 `1200`); 값이 낮을수록 보통 스크린샷이 많은 실행에서 비전 토큰 사용량이 줄어듭니다.
    - chat에서 모델을 전환하려면 [Models CLI](/concepts/models)를 참조하고, auth 회전 및 fallback 동작에 대해서는 [Model Failover](/concepts/model-failover)를 참조하십시오.
    - 커스텀/자체 호스팅된 provider의 경우, 레퍼런스의 [Custom providers](/gateway/config-tools#custom-providers-and-base-urls)를 참조하십시오.

  </Accordion>

  <Accordion title="봇에 메시지를 보낼 수 있는 사람 제어">
    DM 접근은 `dmPolicy`를 통해 channel별로 제어됩니다:

    - `"pairing"`(기본값): 알 수 없는 발신자는 승인을 위한 일회성 페어링 코드를 받습니다
    - `"allowlist"`: `allowFrom`(또는 페어링된 허용 저장소)의 발신자만
    - `"open"`: 모든 인바운드 DM 허용(`allowFrom: ["*"]` 필요)
    - `"disabled"`: 모든 DM 무시

    그룹의 경우, `groupPolicy` + `groupAllowFrom` 또는 channel별 허용 목록을 사용하십시오.

    channel별 세부 사항은 [전체 레퍼런스](/gateway/config-channels#dm-and-group-access)를 참조하십시오.

  </Accordion>

  <Accordion title="그룹 chat 멘션 게이팅 설정">
    그룹 메시지는 기본적으로 **멘션 필요**로 설정됩니다. agent별로 패턴을 구성하십시오:

    ```json5
    {
      agents: {
        list: [
          {
            id: "main",
            groupChat: {
              mentionPatterns: ["@openclaw", "openclaw"],
            },
          },
        ],
      },
      channels: {
        whatsapp: {
          groups: { "*": { requireMention: true } },
        },
      },
    }
    ```

    - **메타데이터 멘션**: native @-멘션(WhatsApp tap-to-mention, Telegram @bot 등)
    - **텍스트 패턴**: `mentionPatterns`의 안전한 regex 패턴
    - channel별 재정의 및 자가 chat 모드에 대해서는 [전체 레퍼런스](/gateway/config-channels#group-chat-mention-gating)를 참조하십시오.

  </Accordion>

  <Accordion title="Agent별 skill 제한">
    공유 baseline에는 `agents.defaults.skills`를 사용한 후 `agents.list[].skills`로
    특정 agent를 재정의하십시오:

    ```json5
    {
      agents: {
        defaults: {
          skills: ["github", "weather"],
        },
        list: [
          { id: "writer" }, // inherits github, weather
          { id: "docs", skills: ["docs-search"] }, // replaces defaults
          { id: "locked-down", skills: [] }, // no skills
        ],
      },
    }
    ```

    - 기본적으로 skill을 제한하지 않으려면 `agents.defaults.skills`를 생략하십시오.
    - 기본값을 상속하려면 `agents.list[].skills`를 생략하십시오.
    - skill을 사용하지 않으려면 `agents.list[].skills: []`로 설정하십시오.
    - [Skills](/tools/skills), [Skills config](/tools/skills-config), 그리고
      [Configuration Reference](/gateway/config-agents#agents-defaults-skills)를 참조하십시오.

  </Accordion>

  <Accordion title="Gateway channel 상태 모니터링 조정">
    오래되어 보이는 channel을 얼마나 적극적으로 재시작할지 제어하십시오:

    ```json5
    {
      gateway: {
        channelHealthCheckMinutes: 5,
        channelStaleEventThresholdMinutes: 30,
        channelMaxRestartsPerHour: 10,
      },
      channels: {
        telegram: {
          healthMonitor: { enabled: false },
          accounts: {
            alerts: {
              healthMonitor: { enabled: true },
            },
          },
        },
      },
    }
    ```

    - 상태 모니터 재시작을 전역적으로 비활성화하려면 `gateway.channelHealthCheckMinutes: 0`으로 설정하십시오.
    - `channelStaleEventThresholdMinutes`는 검사 간격 이상이어야 합니다.
    - 전역 모니터를 비활성화하지 않고 하나의 channel 또는 계정에 대해 자동 재시작을 비활성화하려면 `channels.<provider>.healthMonitor.enabled` 또는 `channels.<provider>.accounts.<id>.healthMonitor.enabled`를 사용하십시오.
    - 운영 디버깅을 위해 [Health Checks](/gateway/health)를, 모든 필드를 위해 [전체 레퍼런스](/gateway/configuration-reference#gateway)를 참조하십시오.

  </Accordion>

  <Accordion title="세션 및 리셋 구성">
    세션은 대화 연속성과 격리를 제어합니다:

    ```json5
    {
      session: {
        dmScope: "per-channel-peer",  // recommended for multi-user
        threadBindings: {
          enabled: true,
          idleHours: 24,
          maxAgeHours: 0,
        },
        reset: {
          mode: "daily",
          atHour: 4,
          idleMinutes: 120,
        },
      },
    }
    ```

    - `dmScope`: `main`(공유) | `per-peer` | `per-channel-peer` | `per-account-channel-peer`
    - `threadBindings`: thread 바인딩된 세션 라우팅에 대한 전역 기본값(Discord는 `/focus`, `/unfocus`, `/agents`, `/session idle`, `/session max-age`를 지원함).
    - scope 지정, identity 링크, 전송 정책에 대해서는 [세션 관리](/concepts/session)를 참조하십시오.
    - 모든 필드에 대해 [전체 레퍼런스](/gateway/config-agents#session)를 참조하십시오.

  </Accordion>

  <Accordion title="샌드박싱 활성화">
    격리된 샌드박스 런타임에서 agent 세션을 실행합니다:

    ```json5
    {
      agents: {
        defaults: {
          sandbox: {
            mode: "non-main",  // off | non-main | all
            scope: "agent",    // session | agent | shared
          },
        },
      },
    }
    ```

    먼저 이미지를 빌드하십시오: `scripts/sandbox-setup.sh`

    전체 가이드는 [샌드박싱](/gateway/sandboxing)을 참조하고, 모든 옵션에 대해서는 [전체 레퍼런스](/gateway/config-agents#agentsdefaultssandbox)를 참조하십시오.

  </Accordion>

  <Accordion title="공식 iOS 빌드용 relay 기반 push 활성화">
    Relay 기반 push는 `openclaw.json`에서 구성됩니다.

    gateway configuration에 이것을 설정하십시오:

    ```json5
    {
      gateway: {
        push: {
          apns: {
            relay: {
              baseUrl: "https://relay.example.com",
              // Optional. Default: 10000
              timeoutMs: 10000,
            },
          },
        },
      },
    }
    ```

    CLI 동등:

    ```bash
    openclaw config set gateway.push.apns.relay.baseUrl https://relay.example.com
    ```

    이것이 하는 일:

    - Gateway가 외부 relay를 통해 `push.test`, wake nudge, 재연결 wake를 보낼 수 있게 합니다.
    - 페어링된 iOS 앱이 전달하는 등록 범위 전송 권한을 사용합니다. Gateway는 배포 전반 relay 토큰이 필요하지 않습니다.
    - 각 relay 기반 등록을 iOS 앱이 페어링한 gateway identity에 바인딩하여, 다른 gateway가 저장된 등록을 재사용할 수 없도록 합니다.
    - 로컬/수동 iOS 빌드를 직접 APNs에 유지합니다. Relay 기반 전송은 relay를 통해 등록된 공식 배포 빌드에만 적용됩니다.
    - 등록과 전송 트래픽이 동일한 relay 배포에 도달하도록 공식/TestFlight iOS 빌드에 구워진 relay base URL과 일치해야 합니다.

    엔드투엔드 흐름:

    1. 동일한 relay base URL로 컴파일된 공식/TestFlight iOS 빌드를 설치하십시오.
    2. Gateway에서 `gateway.push.apns.relay.baseUrl`을 구성하십시오.
    3. iOS 앱을 gateway에 페어링하고 node 및 operator 세션이 모두 연결되도록 하십시오.
    4. iOS 앱은 gateway identity를 가져와서 App Attest와 앱 영수증으로 relay에 등록한 다음, 페어링된 gateway에 relay 기반 `push.apns.register` 페이로드를 게시합니다.
    5. Gateway는 relay 핸들과 전송 권한을 저장한 다음, `push.test`, wake nudge, 재연결 wake에 사용합니다.

    운영 참고:

    - iOS 앱을 다른 gateway로 전환하면, 해당 gateway에 바인딩된 새 relay 등록을 게시할 수 있도록 앱을 재연결하십시오.
    - 다른 relay 배포를 가리키는 새 iOS 빌드를 배송하면, 앱은 이전 relay 원본을 재사용하는 대신 캐시된 relay 등록을 새로 고칩니다.

    호환성 참고:

    - `OPENCLAW_APNS_RELAY_BASE_URL` 및 `OPENCLAW_APNS_RELAY_TIMEOUT_MS`는 여전히 임시 env 재정의로 작동합니다.
    - `OPENCLAW_APNS_RELAY_ALLOW_HTTP=true`는 loopback 전용 개발 탈출구로 유지됩니다; configuration에 HTTP relay URL을 영구 저장하지 마십시오.

    엔드투엔드 흐름은 [iOS 앱](/platforms/ios#relay-backed-push-for-official-builds)을, relay 보안 모델은 [인증 및 신뢰 흐름](/platforms/ios#authentication-and-trust-flow)을 참조하십시오.

  </Accordion>

  <Accordion title="Heartbeat 설정 (주기적 체크인)">
    ```json5
    {
      agents: {
        defaults: {
          heartbeat: {
            every: "30m",
            target: "last",
          },
        },
      },
    }
    ```

    - `every`: 지속 시간 문자열(`30m`, `2h`). 비활성화하려면 `0m`으로 설정.
    - `target`: `last` | `none` | `<channel-id>`(예: `discord`, `matrix`, `telegram`, `whatsapp`)
    - `directPolicy`: DM 스타일 heartbeat 대상에 대한 `allow`(기본값) 또는 `block`
    - 전체 가이드는 [Heartbeat](/gateway/heartbeat)를 참조하십시오.

  </Accordion>

  <Accordion title="Cron 작업 구성">
    ```json5
    {
      cron: {
        enabled: true,
        maxConcurrentRuns: 2,
        sessionRetention: "24h",
        runLog: {
          maxBytes: "2mb",
          keepLines: 2000,
        },
      },
    }
    ```

    - `sessionRetention`: `sessions.json`에서 완료된 격리된 실행 세션을 정리합니다(기본값 `24h`; 비활성화하려면 `false`로 설정).
    - `runLog`: 크기 및 유지 라인으로 `cron/runs/<jobId>.jsonl`을 정리합니다.
    - 기능 개요 및 CLI 예시에 대해서는 [Cron 작업](/automation/cron-jobs)을 참조하십시오.

  </Accordion>

  <Accordion title="Webhook(hook) 설정">
    Gateway에서 HTTP webhook 엔드포인트를 활성화합니다:

    ```json5
    {
      hooks: {
        enabled: true,
        token: "shared-secret",
        path: "/hooks",
        defaultSessionKey: "hook:ingress",
        allowRequestSessionKey: false,
        allowedSessionKeyPrefixes: ["hook:"],
        mappings: [
          {
            match: { path: "gmail" },
            action: "agent",
            agentId: "main",
            deliver: true,
          },
        ],
      },
    }
    ```

    보안 참고:
    - 모든 hook/webhook 페이로드 콘텐츠를 신뢰할 수 없는 입력으로 취급하십시오.
    - 전용 `hooks.token`을 사용하십시오; 공유 Gateway 토큰을 재사용하지 마십시오.
    - Hook 인증은 헤더 전용입니다(`Authorization: Bearer ...` 또는 `x-openclaw-token`); 쿼리 문자열 토큰은 거부됩니다.
    - `hooks.path`는 `/`일 수 없습니다; webhook 수신을 `/hooks` 같은 전용 하위 경로에 유지하십시오.
    - 엄격하게 범위가 지정된 디버깅을 수행하지 않는 한 안전하지 않은 콘텐츠 bypass 플래그(`hooks.gmail.allowUnsafeExternalContent`, `hooks.mappings[].allowUnsafeExternalContent`)를 비활성화 상태로 유지하십시오.
    - `hooks.allowRequestSessionKey`를 활성화하는 경우, 호출자가 선택한 세션 키를 제한하기 위해 `hooks.allowedSessionKeyPrefixes`도 설정하십시오.
    - Hook 기반 agent의 경우, 강력한 현대적 모델 계층 및 엄격한 tool 정책(예: 가능한 경우 메시징 전용 + 샌드박싱)을 선호하십시오.

    모든 매핑 옵션과 Gmail 통합에 대해서는 [전체 레퍼런스](/gateway/configuration-reference#hooks)를 참조하십시오.

  </Accordion>

  <Accordion title="다중 agent 라우팅 구성">
    별도의 workspace 및 세션으로 여러 격리된 agent를 실행합니다:

    ```json5
    {
      agents: {
        list: [
          { id: "home", default: true, workspace: "~/.openclaw/workspace-home" },
          { id: "work", workspace: "~/.openclaw/workspace-work" },
        ],
      },
      bindings: [
        { agentId: "home", match: { channel: "whatsapp", accountId: "personal" } },
        { agentId: "work", match: { channel: "whatsapp", accountId: "biz" } },
      ],
    }
    ```

    바인딩 규칙 및 agent별 접근 프로파일에 대해서는 [Multi-Agent](/concepts/multi-agent) 및 [전체 레퍼런스](/gateway/config-agents#multi-agent-routing)를 참조하십시오.

  </Accordion>

  <Accordion title="Configuration을 여러 파일로 분할 ($include)">
    `$include`를 사용하여 큰 configuration을 구성하십시오:

    ```json5
    // ~/.openclaw/openclaw.json
    {
      gateway: { port: 18789 },
      agents: { $include: "./agents.json5" },
      broadcast: {
        $include: ["./clients/a.json5", "./clients/b.json5"],
      },
    }
    ```

    - **단일 파일**: 포함하는 객체를 대체합니다
    - **파일 배열**: 순서대로 deep-merge됩니다(나중 것이 승리)
    - **형제 키**: include 후에 병합됩니다(포함된 값을 재정의)
    - **중첩 include**: 최대 10 레벨 깊이까지 지원
    - **상대 경로**: 포함하는 파일을 기준으로 해석됩니다
    - **OpenClaw 소유 쓰기**: 쓰기가 `plugins: { $include: "./plugins.json5" }`
      같은 단일 파일 include로 뒷받침되는 하나의 최상위 섹션만 변경하는 경우,
      OpenClaw는 해당 포함된 파일을 업데이트하고 `openclaw.json`은 그대로
      둡니다
    - **지원되지 않는 write-through**: 루트 include, include 배열, 형제 재정의가
      있는 include는 configuration을 평탄화하는 대신 OpenClaw 소유 쓰기에 대해
      fail-closed합니다
    - **오류 처리**: 누락된 파일, 구문 분석 오류, 순환 include에 대한 명확한 오류

  </Accordion>
</AccordionGroup>

## Configuration 핫 리로드

Gateway는 `~/.openclaw/openclaw.json`을 감시하고 변경을 자동으로 적용합니다 —
대부분의 설정에 수동 재시작이 필요하지 않습니다.

직접적인 파일 편집은 검증되기 전까지 신뢰할 수 없는 것으로 취급됩니다. 감시자는
에디터 임시 쓰기/이름 변경 churn이 가라앉기를 기다린 다음 최종 파일을 읽고,
last-known-good configuration을 복원하여 유효하지 않은 외부 편집을 거부합니다.
OpenClaw 소유 configuration 쓰기는 쓰기 전에 동일한 스키마 게이트를 사용합니다;
`gateway.mode`를 삭제하거나 파일을 절반 이상 축소하는 것 같은 파괴적인 clobber는
거부되고 검사를 위해 `.rejected.*`로 저장됩니다.

로그에서 `Config auto-restored from last-known-good` 또는
`config reload restored last-known-good config`를 보면, `openclaw.json` 옆의
일치하는 `.clobbered.*` 파일을 검사하고, 거부된 페이로드를 수정한 다음,
`openclaw config validate`를 실행하십시오. 복구 체크리스트는
[Gateway 문제 해결](/gateway/troubleshooting#gateway-restored-last-known-good-config)을
참조하십시오.

### 리로드 모드

| 모드                    | 동작                                                                                      |
| ---------------------- | ----------------------------------------------------------------------------------------- |
| **`hybrid`**(기본값)    | 안전한 변경을 즉시 핫 적용합니다. 중요한 변경의 경우 자동으로 재시작합니다.               |
| **`hot`**              | 안전한 변경만 핫 적용합니다. 재시작이 필요한 경우 경고를 기록 — 사용자가 처리합니다.     |
| **`restart`**          | 안전하든 안전하지 않든 모든 configuration 변경에 Gateway를 재시작합니다.                 |
| **`off`**              | 파일 감시를 비활성화합니다. 변경은 다음 수동 재시작에서 적용됩니다.                       |

```json5
{
  gateway: {
    reload: { mode: "hybrid", debounceMs: 300 },
  },
}
```

### 핫 적용되는 것과 재시작이 필요한 것

대부분의 필드는 다운타임 없이 핫 적용됩니다. `hybrid` 모드에서는 재시작이
필요한 변경이 자동으로 처리됩니다.

| 카테고리            | 필드                                                              | 재시작 필요? |
| ------------------- | ----------------------------------------------------------------- | ------------ |
| Channel             | `channels.*`, `web`(WhatsApp) — 모든 내장 및 plugin channel       | 아니오       |
| Agent & model       | `agent`, `agents`, `models`, `routing`                            | 아니오       |
| 자동화              | `hooks`, `cron`, `agent.heartbeat`                                | 아니오       |
| 세션 & 메시지       | `session`, `messages`                                             | 아니오       |
| Tool & 미디어       | `tools`, `browser`, `skills`, `audio`, `talk`                     | 아니오       |
| UI & 기타           | `ui`, `logging`, `identity`, `bindings`                           | 아니오       |
| Gateway 서버        | `gateway.*`(port, bind, auth, tailscale, TLS, HTTP)               | **예**       |
| 인프라              | `discovery`, `canvasHost`, `plugins`                              | **예**       |

<Note>
`gateway.reload`와 `gateway.remote`는 예외입니다 — 이를 변경해도 재시작이 트리거되지 **않습니다**.
</Note>

### 리로드 계획

`$include`를 통해 참조되는 소스 파일을 편집할 때, OpenClaw는 평탄화된 메모리
내 뷰가 아닌 소스에 작성된 레이아웃에서 리로드를 계획합니다. 이는 하나의
최상위 섹션이 `plugins: { $include: "./plugins.json5" }`처럼 자체 포함된 파일에
있을 때에도 핫 리로드 결정(핫 적용 대 재시작)을 예측 가능하게 유지합니다.
소스 레이아웃이 모호하면 리로드 계획은 fail-closed합니다.

## Configuration RPC (프로그래밍 방식 업데이트)

Gateway API를 통해 configuration을 쓰는 툴링의 경우, 다음 흐름을 선호하십시오:

- `config.schema.lookup`으로 하나의 하위 트리를 검사(얕은 스키마 노드 + 하위
  요약)
- `config.get`으로 현재 스냅샷과 `hash`를 가져옴
- `config.patch`로 부분 업데이트(JSON merge patch: 객체는 병합, `null`은
  삭제, 배열은 대체)
- 전체 configuration을 대체하려는 경우에만 `config.apply`
- 명시적 자가 업데이트 + 재시작을 위한 `update.run`

<Note>
Control-plane 쓰기(`config.apply`, `config.patch`, `update.run`)는
`deviceId+clientIp`당 60초에 3개 요청으로 속도 제한됩니다. 재시작 요청은
병합된 다음 재시작 사이클 간 30초 쿨다운을 적용합니다.
</Note>

부분 패치 예시:

```bash
openclaw gateway call config.get --params '{}'  # capture payload.hash
openclaw gateway call config.patch --params '{
  "raw": "{ channels: { telegram: { groups: { \"*\": { requireMention: false } } } } }",
  "baseHash": "<hash>"
}'
```

`config.apply`와 `config.patch` 모두 `raw`, `baseHash`, `sessionKey`, `note`,
`restartDelayMs`를 수락합니다. 구성이 이미 존재하는 경우 두 메서드 모두에 대해
`baseHash`가 필요합니다.

## 환경 변수

OpenClaw는 부모 프로세스에서 환경 변수를 읽고 추가로 다음을 읽습니다:

- 현재 작업 디렉토리의 `.env`(존재하는 경우)
- `~/.openclaw/.env`(전역 fallback)

어느 파일도 기존 환경 변수를 재정의하지 않습니다. configuration에서 인라인
환경 변수를 설정할 수도 있습니다:

```json5
{
  env: {
    OPENROUTER_API_KEY: "sk-or-...",
    vars: { GROQ_API_KEY: "gsk-..." },
  },
}
```

<Accordion title="Shell env 가져오기 (선택 사항)">
  활성화되어 있고 예상되는 키가 설정되지 않은 경우, OpenClaw는 로그인 shell을 실행하고 누락된 키만 가져옵니다:

```json5
{
  env: {
    shellEnv: { enabled: true, timeoutMs: 15000 },
  },
}
```

환경 변수 동등: `OPENCLAW_LOAD_SHELL_ENV=1`
</Accordion>

<Accordion title="Configuration 값의 환경 변수 치환">
  `${VAR_NAME}`으로 모든 configuration 문자열 값에서 환경 변수를 참조할 수 있습니다:

```json5
{
  gateway: { auth: { token: "${OPENCLAW_GATEWAY_TOKEN}" } },
  models: { providers: { custom: { apiKey: "${CUSTOM_API_KEY}" } } },
}
```

규칙:

- 대문자 이름만 일치: `[A-Z_][A-Z0-9_]*`
- 누락되거나 빈 변수는 로드 시간에 오류를 발생시킵니다
- 리터럴 출력을 위해 `$${VAR}`로 이스케이프
- `$include` 파일 내부에서 작동합니다
- 인라인 치환: `"${BASE}/v1"` → `"https://api.example.com/v1"`

</Accordion>

<Accordion title="Secret ref (env, file, exec)">
  SecretRef 객체를 지원하는 필드의 경우, 다음을 사용할 수 있습니다:

```json5
{
  models: {
    providers: {
      openai: { apiKey: { source: "env", provider: "default", id: "OPENAI_API_KEY" } },
    },
  },
  skills: {
    entries: {
      "image-lab": {
        apiKey: {
          source: "file",
          provider: "filemain",
          id: "/skills/entries/image-lab/apiKey",
        },
      },
    },
  },
  channels: {
    googlechat: {
      serviceAccountRef: {
        source: "exec",
        provider: "vault",
        id: "channels/googlechat/serviceAccount",
      },
    },
  },
}
```

SecretRef 세부 정보(`env`/`file`/`exec`에 대한 `secrets.providers` 포함)는 [시크릿 관리](/gateway/secrets)에 있습니다.
지원되는 자격 증명 경로는 [SecretRef Credential Surface](/reference/secretref-credential-surface)에 나열되어 있습니다.
</Accordion>

전체 우선순위 및 소스는 [환경](/help/environment)을 참조하십시오.

## 전체 레퍼런스

완전한 필드별 레퍼런스는 **[Configuration Reference](/gateway/configuration-reference)**를
참조하십시오.

---

_관련: [Configuration 예시](/gateway/configuration-examples) · [Configuration Reference](/gateway/configuration-reference) · [Doctor](/gateway/doctor)_

## 관련 문서

- [Configuration reference](/gateway/configuration-reference)
- [Configuration examples](/gateway/configuration-examples)
- [Gateway runbook](/gateway/)
