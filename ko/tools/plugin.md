---
summary: "OpenClaw 플러그인 설치, 구성, 관리"
read_when:
  - 플러그인을 설치하거나 구성할 때
  - 플러그인 디스커버리 및 로드 규칙을 이해할 때
  - Codex/Claude 호환 플러그인 번들을 다룰 때
title: "플러그인(Plugins)"
sidebarTitle: "설치 및 구성"
---

플러그인은 OpenClaw에 새로운 기능을 확장합니다: 채널, 모델 프로바이더,
툴, skill, 음성, 실시간 전사, 실시간 음성, 미디어 이해, 이미지 생성,
비디오 생성, 웹 페치, 웹 검색 등. 일부 플러그인은 **코어**(OpenClaw에 함께 제공),
다른 일부는 **외부**(커뮤니티에서 npm에 게시)입니다.

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

    # 로컬 디렉터리 또는 아카이브에서
    openclaw plugins install ./my-plugin
    openclaw plugins install ./my-plugin.tgz
    ```

  </Step>

  <Step title="Gateway 재시작">
    ```bash
    openclaw gateway restart
    ```

    그런 다음 구성 파일의 `plugins.entries.\<id\>.config` 아래에서 구성합니다.

  </Step>
</Steps>

채팅 네이티브 제어를 선호한다면, `commands.plugins: true`를 활성화하고 다음을 사용하세요:

```text
/plugin install clawhub:@openclaw/voice-call
/plugin show voice-call
/plugin enable voice-call
```

설치 경로는 CLI와 동일한 리졸버를 사용합니다: 로컬 경로/아카이브, 명시적
`clawhub:<pkg>`, 또는 베어 패키지 스펙(ClawHub 먼저, 그 다음 npm 폴백).

구성이 유효하지 않으면, 설치는 일반적으로 fail-closed되고
`openclaw doctor --fix`를 가리킵니다. 유일한 복구 예외는
`openclaw.install.allowInvalidConfigRecovery`에 옵트인한 플러그인을 위한
좁은 번들 플러그인 재설치 경로입니다.

패키징된 OpenClaw 설치는 모든 번들 플러그인의 런타임 종속성 트리를
적극적으로(eagerly) 설치하지 않습니다. 번들된 OpenClaw 소유 플러그인이
플러그인 구성, 레거시 채널 구성, 또는 default-enabled 매니페스트에서 활성화되면,
시작 시 해당 플러그인의 선언된 런타임 종속성만 복구한 후 임포트합니다.
외부 플러그인과 커스텀 로드 경로는 여전히 `openclaw plugins install`로
설치되어야 합니다.

## 플러그인 타입

OpenClaw는 두 가지 플러그인 형식을 인식합니다:

| 형식       | 동작 방식                                                              | 예시                                                   |
| ---------- | --------------------------------------------------------------------- | ------------------------------------------------------ |
| **네이티브** | `openclaw.plugin.json` + 런타임 모듈; 프로세스 내에서 실행           | 공식 플러그인, 커뮤니티 npm 패키지                    |
| **번들**     | Codex/Claude/Cursor 호환 레이아웃; OpenClaw 기능으로 매핑됨          | `.codex-plugin/`, `.claude-plugin/`, `.cursor-plugin/` |

둘 다 `openclaw plugins list` 아래에 표시됩니다. 번들 세부사항은 [플러그인 번들](/plugins/bundles)을 참조하세요.

네이티브 플러그인을 작성하는 경우, [플러그인 빌드](/plugins/building-plugins)와
[플러그인 SDK 개요](/plugins/sdk-overview)부터 시작하세요.

## 공식 플러그인

### 설치 가능 (npm)

| 플러그인         | 패키지                 | 문서                                   |
| --------------- | ---------------------- | ------------------------------------ |
| Matrix          | `@openclaw/matrix`     | [Matrix](/channels/matrix)           |
| Microsoft Teams | `@openclaw/msteams`    | [Microsoft Teams](/channels/msteams) |
| Nostr           | `@openclaw/nostr`      | [Nostr](/channels/nostr)             |
| Voice Call      | `@openclaw/voice-call` | [Voice Call](/plugins/voice-call)    |
| Zalo            | `@openclaw/zalo`       | [Zalo](/channels/zalo)               |
| Zalo Personal   | `@openclaw/zalouser`   | [Zalo Personal](/plugins/zalouser)   |

### 코어 (OpenClaw 함께 제공)

<AccordionGroup>
  <Accordion title="모델 프로바이더 (기본 활성화)">
    `anthropic`, `byteplus`, `cloudflare-ai-gateway`, `github-copilot`, `google`,
    `huggingface`, `kilocode`, `kimi-coding`, `minimax`, `mistral`, `qwen`,
    `moonshot`, `nvidia`, `openai`, `opencode`, `opencode-go`, `openrouter`,
    `qianfan`, `synthetic`, `together`, `venice`,
    `vercel-ai-gateway`, `volcengine`, `xiaomi`, `zai`
  </Accordion>

  <Accordion title="메모리 플러그인">
    - `memory-core` — 번들 메모리 검색(기본값은 `plugins.slots.memory` 경유)
    - `memory-lancedb` — 자동 리콜/캡처가 있는 온디맨드 설치 장기 메모리(`plugins.slots.memory = "memory-lancedb"` 설정)
  </Accordion>

  <Accordion title="음성 프로바이더 (기본 활성화)">
    `elevenlabs`, `microsoft`
  </Accordion>

  <Accordion title="기타">
    - `browser` — browser 툴, `openclaw browser` CLI, `browser.request` gateway 메서드, 브라우저 런타임, 기본 브라우저 제어 서비스를 위한 번들 브라우저 플러그인(기본 활성화; 교체 전에 비활성화)
    - `copilot-proxy` — VS Code Copilot Proxy 브리지(기본 비활성화)
  </Accordion>
</AccordionGroup>

서드파티 플러그인을 찾고 있나요? [커뮤니티 플러그인](/plugins/community)을 참조하세요.

## 구성

```json5
{
  plugins: {
    enabled: true,
    allow: ["voice-call"],
    deny: ["untrusted-plugin"],
    load: { paths: ["~/Projects/oss/voice-call-plugin"] },
    entries: {
      "voice-call": { enabled: true, config: { provider: "twilio" } },
    },
  },
}
```

| 필드             | 설명                                                       |
| ---------------- | --------------------------------------------------------- |
| `enabled`        | 마스터 토글 (기본값: `true`)                              |
| `allow`          | 플러그인 허용 목록 (선택)                                 |
| `deny`           | 플러그인 거부 목록 (선택; deny가 우선)                    |
| `load.paths`     | 추가 플러그인 파일/디렉터리                               |
| `slots`          | 배타적 슬롯 셀렉터 (예: `memory`, `contextEngine`)       |
| `entries.\<id\>` | 플러그인별 토글 + 구성                                    |

구성 변경은 **gateway 재시작이 필요합니다**. Gateway가 구성 감시 +
인프로세스 재시작이 활성화된 상태(기본 `openclaw gateway` 경로)로 실행 중이면,
구성 쓰기가 이뤄진 직후 보통 해당 재시작이 자동으로 수행됩니다.

<Accordion title="플러그인 상태: disabled vs missing vs invalid">
  - **Disabled**: 플러그인이 존재하지만 활성화 규칙이 비활성화했습니다. 구성은 보존됩니다.
  - **Missing**: 구성이 디스커버리에서 찾을 수 없는 플러그인 id를 참조합니다.
  - **Invalid**: 플러그인이 존재하지만 구성이 선언된 스키마와 일치하지 않습니다.
</Accordion>

## 디스커버리 및 우선순위

OpenClaw는 다음 순서로 플러그인을 스캔합니다(첫 일치가 우선):

<Steps>
  <Step title="구성 경로">
    `plugins.load.paths` — 명시적 파일 또는 디렉터리 경로.
  </Step>

  <Step title="워크스페이스 플러그인">
    `\<workspace\>/.openclaw/<plugin-root>/*.ts` 및 `\<workspace\>/.openclaw/<plugin-root>/*/index.ts`.
  </Step>

  <Step title="글로벌 플러그인">
    `~/.openclaw/<plugin-root>/*.ts` 및 `~/.openclaw/<plugin-root>/*/index.ts`.
  </Step>

  <Step title="번들 플러그인">
    OpenClaw와 함께 제공됩니다. 다수는 기본 활성화됩니다(모델 프로바이더, 음성).
    그 외에는 명시적 활성화가 필요합니다.
  </Step>
</Steps>

### 활성화 규칙

- `plugins.enabled: false`는 모든 플러그인을 비활성화합니다
- `plugins.deny`는 항상 allow보다 우선합니다
- `plugins.entries.\<id\>.enabled: false`는 해당 플러그인을 비활성화합니다
- 워크스페이스 출처 플러그인은 **기본 비활성화**입니다(명시적으로 활성화해야 함)
- 번들 플러그인은 재정의되지 않는 한 내장된 default-on 집합을 따릅니다
- 배타적 슬롯은 해당 슬롯에 대해 선택된 플러그인을 강제 활성화할 수 있습니다

## 플러그인 슬롯 (배타 카테고리)

일부 카테고리는 배타적입니다(한 번에 하나만 활성):

```json5
{
  plugins: {
    slots: {
      memory: "memory-core", // 또는 "none"으로 비활성화
      contextEngine: "legacy", // 또는 플러그인 id
    },
  },
}
```

| 슬롯            | 제어 대상              | 기본값              |
| --------------- | ---------------------- | ------------------- |
| `memory`        | 활성 메모리 플러그인   | `memory-core`       |
| `contextEngine` | 활성 컨텍스트 엔진     | `legacy` (내장)     |

## CLI 레퍼런스

```bash
openclaw plugins list                       # 간결한 인벤토리
openclaw plugins list --enabled            # 로드된 플러그인만
openclaw plugins list --verbose            # 플러그인별 상세 라인
openclaw plugins list --json               # 기계 판독 가능 인벤토리
openclaw plugins inspect <id>              # 심층 상세
openclaw plugins inspect <id> --json       # 기계 판독 가능
openclaw plugins inspect --all             # 전체 플릿 테이블
openclaw plugins info <id>                 # inspect 별칭
openclaw plugins doctor                    # 진단

openclaw plugins install <package>         # 설치 (ClawHub 먼저, 그 다음 npm)
openclaw plugins install clawhub:<pkg>     # ClawHub에서만 설치
openclaw plugins install <spec> --force    # 기존 설치 덮어쓰기
openclaw plugins install <path>            # 로컬 경로에서 설치
openclaw plugins install -l <path>         # 개발용 링크 (복사 없음)
openclaw plugins install <plugin> --marketplace <source>
openclaw plugins install <plugin> --marketplace https://github.com/<owner>/<repo>
openclaw plugins install <spec> --pin      # 정확한 해석된 npm 스펙 기록
openclaw plugins install <spec> --dangerously-force-unsafe-install
openclaw plugins update <id-or-npm-spec> # 하나의 플러그인 업데이트
openclaw plugins update <id-or-npm-spec> --dangerously-force-unsafe-install
openclaw plugins update --all            # 모두 업데이트
openclaw plugins uninstall <id>          # 구성/설치 기록 제거
openclaw plugins uninstall <id> --keep-files
openclaw plugins marketplace list <source>
openclaw plugins marketplace list <source> --json

openclaw plugins enable <id>
openclaw plugins disable <id>
```

번들 플러그인은 OpenClaw와 함께 제공됩니다. 다수는 기본 활성화됩니다(예를 들어
번들 모델 프로바이더, 번들 음성 프로바이더, 번들 브라우저 플러그인).
다른 번들 플러그인은 여전히 `openclaw plugins enable <id>`가 필요합니다.

`--force`는 기존 설치된 플러그인이나 hook 팩을 제자리에서 덮어씁니다.
추적된 npm 플러그인의 일상적 업그레이드에는 `openclaw plugins update <id-or-npm-spec>`을
사용하세요. 관리형 설치 대상으로 복사하는 대신 소스 경로를 재사용하는 `--link`와는
함께 지원되지 않습니다.

`plugins.allow`가 이미 설정된 경우, `openclaw plugins install`은
활성화 전에 설치된 플러그인 id를 그 허용 목록에 추가하므로 재시작 후
설치를 즉시 로드할 수 있습니다.

`openclaw plugins update <id-or-npm-spec>`은 추적된 설치에 적용됩니다.
dist-tag 또는 정확한 버전이 있는 npm 패키지 스펙을 전달하면 패키지 이름을
추적된 플러그인 레코드로 다시 해석하고 향후 업데이트를 위해 새 스펙을 기록합니다.
버전 없이 패키지 이름을 전달하면 정확히 고정된 설치를 레지스트리의 기본 릴리스
라인으로 되돌립니다. 설치된 npm 플러그인이 이미 해석된 버전과 기록된 아티팩트
식별자에 일치하면, OpenClaw는 다운로드, 재설치, 구성 재작성 없이 업데이트를
건너뜁니다.

`--pin`은 npm 전용입니다. `--marketplace`와 함께는 지원되지 않는데, 이는
마켓플레이스 설치가 npm 스펙 대신 마켓플레이스 소스 메타데이터를 영구 저장하기
때문입니다.

`--dangerously-force-unsafe-install`은 내장 위험 코드 스캐너의 false positive에 대한
긴급(break-glass) 재정의입니다. 플러그인 설치 및 플러그인 업데이트가 내장 `critical`
발견을 넘어 계속되도록 허용하지만, 플러그인 `before_install` 정책 차단이나 스캔 실패
차단은 여전히 우회하지 않습니다.

이 CLI 플래그는 플러그인 설치/업데이트 흐름에만 적용됩니다. Gateway 기반 skill
종속성 설치는 대신 일치하는 `dangerouslyForceUnsafeInstall` 요청 재정의를 사용하며,
`openclaw skills install`은 별도의 ClawHub skill 다운로드/설치 흐름으로 남아 있습니다.

호환 번들은 동일한 플러그인 list/inspect/enable/disable 흐름에 참여합니다.
현재 런타임 지원은 다음을 포함합니다: 번들 skill, Claude 커맨드 skill,
Claude `settings.json` 기본값, Claude `.lsp.json` 및 매니페스트 선언
`lspServers` 기본값, Cursor 커맨드 skill, 호환 Codex hook 디렉터리.

`openclaw plugins inspect <id>`는 또한 감지된 번들 기능과 번들 기반 플러그인에
대해 지원/미지원 MCP 및 LSP 서버 항목을 보고합니다.

마켓플레이스 소스는 `~/.claude/plugins/known_marketplaces.json`의 Claude 알려진
마켓플레이스 이름, 로컬 마켓플레이스 루트 또는 `marketplace.json` 경로,
`owner/repo` 같은 GitHub 단축, GitHub 저장소 URL, 또는 git URL일 수 있습니다.
원격 마켓플레이스의 경우 플러그인 항목은 복제된 마켓플레이스 저장소 내부에
머물러야 하며 상대 경로 소스만 사용해야 합니다.

전체 세부사항은 [`openclaw plugins` CLI 레퍼런스](/cli/plugins)를 참조하세요.

## 플러그인 API 개요

네이티브 플러그인은 `register(api)`를 노출하는 엔트리 객체를 내보냅니다. 오래된
플러그인은 여전히 레거시 별칭으로 `activate(api)`를 사용할 수 있지만, 새 플러그인은
`register`를 사용해야 합니다.

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

OpenClaw는 엔트리 객체를 로드하고 플러그인 활성화 중에 `register(api)`를 호출합니다.
로더는 여전히 오래된 플러그인에 대해 `activate(api)`로 폴백하지만, 번들 플러그인과 새
외부 플러그인은 `register`를 공개 계약으로 취급해야 합니다.

일반적인 등록 메서드:

| 메서드                                  | 등록 대상                   |
| --------------------------------------- | --------------------------- |
| `registerProvider`                      | 모델 프로바이더 (LLM)       |
| `registerChannel`                       | 채팅 채널                   |
| `registerTool`                          | 에이전트 툴                 |
| `registerHook` / `on(...)`              | 라이프사이클 훅             |
| `registerSpeechProvider`                | 텍스트-투-스피치 / STT      |
| `registerRealtimeTranscriptionProvider` | 스트리밍 STT                |
| `registerRealtimeVoiceProvider`         | 양방향 실시간 음성          |
| `registerMediaUnderstandingProvider`    | 이미지/오디오 분석          |
| `registerImageGenerationProvider`       | 이미지 생성                 |
| `registerMusicGenerationProvider`       | 음악 생성                   |
| `registerVideoGenerationProvider`       | 비디오 생성                 |
| `registerWebFetchProvider`              | 웹 페치 / 스크레이프 프로바이더 |
| `registerWebSearchProvider`             | 웹 검색                     |
| `registerHttpRoute`                     | HTTP 엔드포인트             |
| `registerCommand` / `registerCli`       | CLI 명령                    |
| `registerContextEngine`                 | 컨텍스트 엔진               |
| `registerService`                       | 백그라운드 서비스           |

타입화된 라이프사이클 훅에 대한 훅 가드 동작:

- `before_tool_call`: `{ block: true }`는 종결입니다; 낮은 우선순위 핸들러는 건너뜁니다.
- `before_tool_call`: `{ block: false }`는 no-op이며 이전 block을 제거하지 않습니다.
- `before_install`: `{ block: true }`는 종결입니다; 낮은 우선순위 핸들러는 건너뜁니다.
- `before_install`: `{ block: false }`는 no-op이며 이전 block을 제거하지 않습니다.
- `message_sending`: `{ cancel: true }`는 종결입니다; 낮은 우선순위 핸들러는 건너뜁니다.
- `message_sending`: `{ cancel: false }`는 no-op이며 이전 cancel을 제거하지 않습니다.

전체 타입화된 훅 동작은 [SDK 개요](/plugins/sdk-overview#hook-decision-semantics)를 참조하세요.

## 관련 문서

- [플러그인 빌드](/plugins/building-plugins) — 직접 플러그인 작성
- [플러그인 번들](/plugins/bundles) — Codex/Claude/Cursor 번들 호환성
- [플러그인 매니페스트](/plugins/manifest) — 매니페스트 스키마
- [툴 등록](/plugins/building-plugins#registering-agent-tools) — 플러그인에 에이전트 툴 추가
- [플러그인 내부](/plugins/architecture) — 기능 모델 및 로드 파이프라인
- [커뮤니티 플러그인](/plugins/community) — 서드파티 목록
