---
summary: "OpenClaw 플러그인 설치, 구성 및 관리"
read_when:
  - Installing or configuring plugins
  - Understanding plugin discovery and load rules
  - Working with Codex/Claude-compatible plugin bundles
title: "플러그인"
sidebarTitle: "설치 및 구성"
---

# 플러그인

플러그인은 새로운 기능으로 OpenClaw를 확장합니다: 채널, 모델 프로바이더, 도구, 스킬, 음성, 실시간 전사, 실시간 음성, 미디어 이해, 이미지 생성, 비디오 생성, 웹 페치, 웹 검색 등. 일부 플러그인은 **코어** (OpenClaw와 함께 제공됨)이고, 다른 것들은 **외부** (커뮤니티에서 npm에 게시됨)입니다.

## 빠른 시작

<Steps>
  <Step title="로드된 항목 확인">
    ```bash
    openclaw plugins list
    ```
  </Step>

  <Step title="플러그인 설치">
    ```bash
    # npm에서
    openclaw plugins install @openclaw/voice-call

    # 로컬 디렉토리 또는 아카이브에서
    openclaw plugins install ./my-plugin
    openclaw plugins install ./my-plugin.tgz
    ```

  </Step>

  <Step title="게이트웨이 재시작">
    ```bash
    openclaw gateway restart
    ```

    그런 다음 설정 파일의 `plugins.entries.\<id\>.config`에서 구성하십시오.

  </Step>
</Steps>

채팅 네이티브 제어를 선호하는 경우 `commands.plugins: true`를 활성화하고 다음을 사용하십시오:

```text
/plugin install clawhub:@openclaw/voice-call
/plugin show voice-call
/plugin enable voice-call
```

설치 경로는 CLI와 동일한 확인자를 사용합니다: 로컬 경로/아카이브, 명시적 `clawhub:<pkg>`, 또는 베어 패키지 사양 (ClawHub 먼저, 그런 다음 npm 폴백).

설정이 유효하지 않으면 설치는 일반적으로 닫힌 상태로 실패하고 `openclaw doctor --fix`를 가리킵니다. 유일한 복구 예외는 `openclaw.install.allowInvalidConfigRecovery`에 옵트인하는 플러그인에 대한 좁은 번들 플러그인 재설치 경로입니다.

## 플러그인 유형

OpenClaw는 두 가지 플러그인 형식을 인식합니다:

| 형식        | 작동 방식                                                       | 예시                                                   |
| ----------- | --------------------------------------------------------------- | ------------------------------------------------------ |
| **네이티브** | `openclaw.plugin.json` + 런타임 모듈; 인프로세스로 실행         | 공식 플러그인, 커뮤니티 npm 패키지                     |
| **번들**    | Codex/Claude/Cursor 호환 레이아웃; OpenClaw 기능으로 매핑       | `.codex-plugin/`, `.claude-plugin/`, `.cursor-plugin/` |

둘 다 `openclaw plugins list`에 표시됩니다. 번들 세부 정보는 [플러그인 번들](/plugins/bundles)을 참조하십시오.

네이티브 플러그인을 작성하는 경우 [플러그인 빌드](/plugins/building-plugins) 및 [플러그인 SDK 개요](/plugins/sdk-overview)로 시작하십시오.

## 공식 플러그인

### 설치 가능 (npm)

| 플러그인        | 패키지                 | 문서                                 |
| --------------- | ---------------------- | ------------------------------------ |
| Matrix          | `@openclaw/matrix`     | [Matrix](/channels/matrix)           |
| Microsoft Teams | `@openclaw/msteams`    | [Microsoft Teams](/channels/msteams) |
| Nostr           | `@openclaw/nostr`      | [Nostr](/channels/nostr)             |
| Voice Call      | `@openclaw/voice-call` | [Voice Call](/plugins/voice-call)    |
| Zalo            | `@openclaw/zalo`       | [Zalo](/channels/zalo)               |
| Zalo Personal   | `@openclaw/zalouser`   | [Zalo Personal](/plugins/zalouser)   |

### 코어 (OpenClaw와 함께 제공됨)

<AccordionGroup>
  <Accordion title="모델 프로바이더 (기본 활성화)">
    `anthropic`, `byteplus`, `cloudflare-ai-gateway`, `github-copilot`, `google`,
    `huggingface`, `kilocode`, `kimi-coding`, `minimax`, `mistral`, `qwen`,
    `moonshot`, `nvidia`, `openai`, `opencode`, `opencode-go`, `openrouter`,
    `qianfan`, `synthetic`, `together`, `venice`,
    `vercel-ai-gateway`, `volcengine`, `xiaomi`, `zai`
  </Accordion>

  <Accordion title="메모리 플러그인">
    - `memory-core` — 번들된 메모리 검색 (`plugins.slots.memory`를 통한 기본값)
    - `memory-lancedb` — 자동 회상/캡처가 있는 설치 온디맨드 장기 메모리 (`plugins.slots.memory = "memory-lancedb"` 설정)
  </Accordion>

  <Accordion title="음성 프로바이더 (기본 활성화)">
    `elevenlabs`, `microsoft`
  </Accordion>

  <Accordion title="기타">
    - `browser` — 브라우저 도구, `openclaw browser` CLI, `browser.request` 게이트웨이 메서드, 브라우저 런타임, 기본 브라우저 제어 서비스를 위한 번들된 브라우저 플러그인 (기본 활성화; 교체하기 전에 비활성화하십시오)
    - `copilot-proxy` — VS Code Copilot 프록시 브리지 (기본 비활성화)
  </Accordion>
</AccordionGroup>

서드파티 플러그인을 찾고 있나요? [커뮤니티 플러그인](/plugins/community)을 참조하십시오.

## 설정

```json5
{
  plugins: {
    enabled: true,
    allow: ["voice-call"],
    deny: ["untrusted-plugin"],
    load: { paths: ["~/Projects/oss/voice-call-extension"] },
    entries: {
      "voice-call": { enabled: true, config: { provider: "twilio" } },
    },
  },
}
```

| 필드             | 설명                                                 |
| ---------------- | ---------------------------------------------------- |
| `enabled`        | 마스터 토글 (기본값: `true`)                          |
| `allow`          | 플러그인 허용 목록 (선택 사항)                        |
| `deny`           | 플러그인 거부 목록 (선택 사항; 거부가 우선)           |
| `load.paths`     | 추가 플러그인 파일/디렉토리                           |
| `slots`          | 독점 슬롯 선택기 (예: `memory`, `contextEngine`)      |
| `entries.\<id\>` | 플러그인별 토글 + 설정                               |

설정 변경은 **게이트웨이 재시작이 필요합니다**. 게이트웨이가 설정 감시 + 인프로세스 재시작이 활성화된 상태로 실행 중인 경우 (기본 `openclaw gateway` 경로), 해당 재시작은 일반적으로 설정 쓰기가 도착한 직후 자동으로 수행됩니다.

<Accordion title="플러그인 상태: 비활성화 vs 누락 vs 유효하지 않음">
  - **비활성화됨**: 플러그인이 존재하지만 활성화 규칙이 꺼져 있습니다. 설정은 보존됩니다.
  - **누락됨**: 설정이 검색에서 찾지 못한 플러그인 ID를 참조합니다.
  - **유효하지 않음**: 플러그인이 존재하지만 설정이 선언된 스키마와 일치하지 않습니다.
</Accordion>

## 검색 및 우선순위

OpenClaw는 이 순서로 플러그인을 스캔합니다 (첫 번째 일치가 우선):

<Steps>
  <Step title="설정 경로">
    `plugins.load.paths` — 명시적 파일 또는 디렉토리 경로.
  </Step>

  <Step title="워크스페이스 확장">
    `\<workspace\>/.openclaw/<plugin-root>/*.ts` 및 `\<workspace\>/.openclaw/<plugin-root>/*/index.ts`.
  </Step>

  <Step title="전역 확장">
    `~/.openclaw/<plugin-root>/*.ts` 및 `~/.openclaw/<plugin-root>/*/index.ts`.
  </Step>

  <Step title="번들된 플러그인">
    OpenClaw와 함께 제공됩니다. 많은 것들이 기본적으로 활성화됩니다 (모델 프로바이더, 음성).
    다른 것들은 명시적 활성화가 필요합니다.
  </Step>
</Steps>

### 활성화 규칙

- `plugins.enabled: false`는 모든 플러그인을 비활성화합니다
- `plugins.deny`는 항상 allow보다 우선합니다
- `plugins.entries.\<id\>.enabled: false`는 해당 플러그인을 비활성화합니다
- 워크스페이스 출처 플러그인은 **기본적으로 비활성화됩니다** (명시적으로 활성화해야 함)
- 번들된 플러그인은 재정의되지 않는 한 기본 켜짐 세트를 따릅니다
- 독점 슬롯은 해당 슬롯에 대해 선택된 플러그인을 강제 활성화할 수 있습니다

## 플러그인 슬롯 (독점 카테고리)

일부 카테고리는 독점입니다 (한 번에 하나만 활성화):

```json5
{
  plugins: {
    slots: {
      memory: "memory-core", // 또는 "none"으로 비활성화
      contextEngine: "legacy", // 또는 플러그인 ID
    },
  },
}
```

| 슬롯            | 제어 대상          | 기본값              |
| --------------- | ------------------ | ------------------- |
| `memory`        | 활성 메모리 플러그인 | `memory-core`      |
| `contextEngine` | 활성 컨텍스트 엔진  | `legacy` (내장)    |

## CLI 레퍼런스

```bash
openclaw plugins list                       # 컴팩트 목록
openclaw plugins list --enabled            # 로드된 플러그인만
openclaw plugins list --verbose            # 플러그인별 세부 라인
openclaw plugins list --json               # 기계 판독 가능 목록
openclaw plugins inspect <id>              # 심층 세부 정보
openclaw plugins inspect <id> --json       # 기계 판독 가능
openclaw plugins inspect --all             # 플릿 전체 테이블
openclaw plugins info <id>                 # inspect 별칭
openclaw plugins doctor                    # 진단

openclaw plugins install <package>         # 설치 (ClawHub 먼저, 그런 다음 npm)
openclaw plugins install clawhub:<pkg>     # ClawHub에서만 설치
openclaw plugins install <spec> --force    # 기존 설치 덮어쓰기
openclaw plugins install <path>            # 로컬 경로에서 설치
openclaw plugins install -l <path>         # 개발을 위한 링크 (복사 없음)
openclaw plugins install <plugin> --marketplace <source>
openclaw plugins install <plugin> --marketplace https://github.com/<owner>/<repo>
openclaw plugins install <spec> --pin      # 해결된 정확한 npm 사양 기록
openclaw plugins install <spec> --dangerously-force-unsafe-install
openclaw plugins update <id>             # 하나의 플러그인 업데이트
openclaw plugins update <id> --dangerously-force-unsafe-install
openclaw plugins update --all            # 모두 업데이트
openclaw plugins uninstall <id>          # 설정/설치 레코드 제거
openclaw plugins uninstall <id> --keep-files
openclaw plugins marketplace list <source>
openclaw plugins marketplace list <source> --json

openclaw plugins enable <id>
openclaw plugins disable <id>
```

번들된 플러그인은 OpenClaw와 함께 제공됩니다. 많은 것들이 기본적으로 활성화됩니다 (예: 번들된 모델 프로바이더, 번들된 음성 프로바이더, 번들된 브라우저 플러그인). 다른 번들된 플러그인은 여전히 `openclaw plugins enable <id>`가 필요합니다.

`--force`는 기존에 설치된 플러그인 또는 훅 팩을 그 자리에서 덮어씁니다.
`--link`와는 지원되지 않습니다. `--link`는 관리된 설치 대상을 복사하는 대신 소스 경로를 재사용합니다.

`--pin`은 npm 전용입니다. `--marketplace`와는 지원되지 않습니다. 마켓플레이스 설치는 npm 사양 대신 마켓플레이스 소스 메타데이터를 지속시키기 때문입니다.

`--dangerously-force-unsafe-install`은 내장된 위험 코드 스캐너의 오탐지에 대한 비상 탈출구입니다. 플러그인 설치 및 업데이트가 내장된 `critical` 결과를 지나치도록 허용하지만 플러그인 `before_install` 정책 블록이나 스캔 실패 차단은 우회하지 않습니다.

이 CLI 플래그는 플러그인 설치/업데이트 흐름에만 적용됩니다. 게이트웨이 기반 스킬 종속성 설치는 대신 매칭 `dangerouslyForceUnsafeInstall` 요청 재정의를 사용하며, `openclaw skills install`은 별도의 ClawHub 스킬 다운로드/설치 흐름으로 유지됩니다.

호환 번들은 동일한 플러그인 list/inspect/enable/disable 흐름에 참여합니다. 현재 런타임 지원에는 번들 스킬, Claude 명령 스킬, Claude `settings.json` 기본값, Claude `.lsp.json` 및 매니페스트 선언 `lspServers` 기본값, Cursor 명령 스킬, 호환 Codex 훅 디렉토리가 포함됩니다.

`openclaw plugins inspect <id>`는 감지된 번들 기능과 번들 기반 플러그인에 대한 지원 또는 미지원 MCP 및 LSP 서버 항목도 보고합니다.

마켓플레이스 소스는 `~/.claude/plugins/known_marketplaces.json`의 Claude 알려진 마켓플레이스 이름, 로컬 마켓플레이스 루트 또는 `marketplace.json` 경로, `owner/repo`와 같은 GitHub 약칭, GitHub 레포 URL, 또는 git URL일 수 있습니다. 원격 마켓플레이스의 경우 플러그인 항목은 복제된 마켓플레이스 레포 내에 있어야 하며 상대 경로 소스만 사용해야 합니다.

전체 세부 정보는 [`openclaw plugins` CLI 레퍼런스](/cli/plugins)를 참조하십시오.

## 플러그인 API 개요

네이티브 플러그인은 `register(api)`를 노출하는 엔트리 객체를 내보냅니다. 오래된 플러그인은 여전히 `activate(api)`를 레거시 별칭으로 사용할 수 있지만 새 플러그인은 `register`를 사용해야 합니다.

```typescript
export default definePluginEntry({
  id: "my-plugin",
  name: "My Plugin",
  register(api) {
    api.registerProvider({
      /* ... */
    });
    api.registerTool({
      /* ... */
    });
    api.registerChannel({
      /* ... */
    });
  },
});
```

OpenClaw는 엔트리 객체를 로드하고 플러그인 활성화 중에 `register(api)`를 호출합니다. 로더는 여전히 오래된 플러그인에 대해 `activate(api)`로 폴백하지만 번들된 플러그인과 새 외부 플러그인은 `register`를 공개 계약으로 취급해야 합니다.

일반적인 등록 메서드:

| 메서드                                  | 등록 대상                    |
| --------------------------------------- | ---------------------------- |
| `registerProvider`                      | 모델 프로바이더 (LLM)        |
| `registerChannel`                       | 채팅 채널                    |
| `registerTool`                          | 에이전트 도구                |
| `registerHook` / `on(...)`              | 수명 주기 훅                 |
| `registerSpeechProvider`                | 텍스트 음성 변환 / STT       |
| `registerRealtimeTranscriptionProvider` | 스트리밍 STT                 |
| `registerRealtimeVoiceProvider`         | 양방향 실시간 음성            |
| `registerMediaUnderstandingProvider`    | 이미지/오디오 분석            |
| `registerImageGenerationProvider`       | 이미지 생성                  |
| `registerMusicGenerationProvider`       | 음악 생성                    |
| `registerVideoGenerationProvider`       | 비디오 생성                  |
| `registerWebFetchProvider`              | 웹 페치 / 스크래핑 프로바이더 |
| `registerWebSearchProvider`             | 웹 검색                      |
| `registerHttpRoute`                     | HTTP 엔드포인트              |
| `registerCommand` / `registerCli`       | CLI 명령                     |
| `registerContextEngine`                 | 컨텍스트 엔진                |
| `registerService`                       | 백그라운드 서비스             |

타입 지정 수명 주기 훅에 대한 훅 가드 동작:

- `before_tool_call`: `{ block: true }`는 종료입니다. 낮은 우선순위 핸들러는 건너뜁니다.
- `before_tool_call`: `{ block: false }`는 no-op이며 이전 블록을 지우지 않습니다.
- `before_install`: `{ block: true }`는 종료입니다. 낮은 우선순위 핸들러는 건너뜁니다.
- `before_install`: `{ block: false }`는 no-op이며 이전 블록을 지우지 않습니다.
- `message_sending`: `{ cancel: true }`는 종료입니다. 낮은 우선순위 핸들러는 건너뜁니다.
- `message_sending`: `{ cancel: false }`는 no-op이며 이전 취소를 지우지 않습니다.

전체 타입 지정 훅 동작에 대해서는 [SDK 개요](/plugins/sdk-overview#hook-decision-semantics)를 참조하십시오.

## 관련 항목

- [플러그인 빌드](/plugins/building-plugins) — 자신만의 플러그인 만들기
- [플러그인 번들](/plugins/bundles) — Codex/Claude/Cursor 번들 호환성
- [플러그인 매니페스트](/plugins/manifest) — 매니페스트 스키마
- [도구 등록](/plugins/building-plugins#registering-agent-tools) — 플러그인에서 에이전트 도구 추가
- [플러그인 내부](/plugins/architecture) — 기능 모델 및 로드 파이프라인
- [커뮤니티 플러그인](/plugins/community) — 서드파티 목록
