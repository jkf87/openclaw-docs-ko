---
summary: "OpenClaw 설정, 구성 및 사용에 대한 자주 묻는 질문"
read_when:
  - Answering common setup, install, onboarding, or runtime support questions
  - Triaging user-reported issues before deeper debugging
title: "FAQ"
---

# FAQ

실제 환경(로컬 개발, VPS, 멀티 에이전트, OAuth/API 키, 모델 장애 조치)에 대한 빠른 답변과 심층 문제 해결. 런타임 진단은 [문제 해결](/gateway/troubleshooting)을 참조하십시오. 전체 설정 참고는 [구성](/gateway/configuration)을 참조하십시오.

## 무언가가 고장났을 때 첫 60초

1. **빠른 상태 (첫 번째 확인)**

   ```bash
   openclaw status
   ```

   빠른 로컬 요약: OS + 업데이트, 게이트웨이/서비스 접근성, 에이전트/세션, 프로바이더 설정 + 런타임 문제(게이트웨이에 접근 가능한 경우).

2. **공유 가능한 리포트 (안전하게 공유)**

   ```bash
   openclaw status --all
   ```

   토큰이 제거된 로그 테일과 함께 읽기 전용 진단.

3. **데몬 + 포트 상태**

   ```bash
   openclaw gateway status
   ```

   슈퍼바이저 런타임 대 RPC 접근성, 프로브 대상 URL, 서비스가 사용한 설정을 표시합니다.

4. **심층 프로브**

   ```bash
   openclaw status --deep
   ```

   채널 프로브를 포함한 라이브 게이트웨이 상태 프로브를 실행합니다 (접근 가능한 게이트웨이 필요). [상태](/gateway/health)를 참조하십시오.

5. **최신 로그 테일**

   ```bash
   openclaw logs --follow
   ```

   RPC가 다운된 경우 폴백:

   ```bash
   tail -f "$(ls -t /tmp/openclaw/openclaw-*.log | head -1)"
   ```

   파일 로그는 서비스 로그와 별개입니다. [로깅](/logging) 및 [문제 해결](/gateway/troubleshooting)을 참조하십시오.

6. **Doctor 실행 (수리)**

   ```bash
   openclaw doctor
   ```

   설정/상태 수리/마이그레이션 + 상태 확인. [Doctor](/gateway/doctor)를 참조하십시오.

7. **게이트웨이 스냅샷**

   ```bash
   openclaw health --json
   openclaw health --verbose   # 오류 시 대상 URL + 설정 경로 표시
   ```

   실행 중인 게이트웨이에서 전체 스냅샷을 요청합니다 (WS 전용). [상태](/gateway/health)를 참조하십시오.

## 빠른 시작 및 첫 실행 설정

<AccordionGroup>
  <Accordion title="막혔을 때 가장 빠른 해결 방법">
    **머신을 볼 수 있는** 로컬 AI 에이전트를 사용하십시오. 대부분의 "막힘" 케이스는 원격 도우미가 검사할 수 없는 **로컬 설정 또는 환경 문제**이기 때문에 Discord에서 묻는 것보다 훨씬 효과적입니다.

    - **Claude Code**: [https://www.anthropic.com/claude-code/](https://www.anthropic.com/claude-code/)
    - **OpenAI Codex**: [https://openai.com/codex/](https://openai.com/codex/)

    이 도구들은 리포지토리를 읽고, 명령을 실행하고, 로그를 검사하고, 머신 수준 설정(PATH, 서비스, 권한, 인증 파일)을 수정하는 데 도움을 줄 수 있습니다. 해킹 가능한(git) 설치를 통해 **전체 소스 체크아웃**을 제공하십시오:

    ```bash
    curl -fsSL https://openclaw.ai/install.sh | bash -s -- --install-method git
    ```

    시작 명령 (도움 요청 시 출력 공유):

    ```bash
    openclaw status
    openclaw models status
    openclaw doctor
    ```

  </Accordion>

  <Accordion title="OpenClaw 설치 및 설정 권장 방법">
    리포지토리는 소스에서 실행하고 온보딩을 사용하도록 권장합니다:

    ```bash
    curl -fsSL https://openclaw.ai/install.sh | bash
    openclaw onboard --install-daemon
    ```

    소스에서 (기여자/개발):

    ```bash
    git clone https://github.com/openclaw/openclaw.git
    cd openclaw
    pnpm install
    pnpm build
    pnpm ui:build # 첫 실행 시 UI 의존성 자동 설치
    openclaw onboard
    ```

  </Accordion>

  <Accordion title="온보딩 후 대시보드를 어떻게 열나요?">
    마법사는 온보딩 직후 클린(비토큰화) 대시보드 URL로 브라우저를 열고 요약에 링크를 출력합니다. 해당 탭을 열어 두십시오. 실행되지 않은 경우 동일한 머신에서 출력된 URL을 복사하여 붙여넣으십시오.
  </Accordion>

  <Accordion title="localhost 대 원격에서 대시보드를 어떻게 인증하나요?">
    **Localhost (동일 머신):**

    - `http://127.0.0.1:18789/`를 여십시오.
    - 공유 비밀 인증을 요청하면 구성된 토큰 또는 비밀번호를 Control UI 설정에 붙여넣으십시오.
    - 토큰 소스: `gateway.auth.token` (또는 `OPENCLAW_GATEWAY_TOKEN`).
    - 비밀번호 소스: `gateway.auth.password` (또는 `OPENCLAW_GATEWAY_PASSWORD`).
    - 아직 공유 비밀이 구성되지 않은 경우: `openclaw doctor --generate-gateway-token`.

    **Localhost가 아닌 경우:**

    - **Tailscale Serve** (권장): 루프백 바인딩 유지, `openclaw gateway --tailscale serve` 실행, `https://<magicdns>/` 열기.
    - **Tailnet 바인딩**: `openclaw gateway --bind tailnet --token "<token>"` 실행, `http://<tailscale-ip>:18789/` 열기.
    - **SSH 터널**: `ssh -N -L 18789:127.0.0.1:18789 user@host` 후 `http://127.0.0.1:18789/` 열기.

    [대시보드](/web/dashboard) 및 [웹 표면](/web/)을 참조하십시오.

  </Accordion>

  <Accordion title="Raspberry Pi에서 실행되나요?">
    예. 게이트웨이는 경량입니다 - 문서에는 개인 사용에 **512MB-1GB RAM**, **1코어**, 약 **500MB**
    디스크가 충분하며 **Raspberry Pi 4가 실행할 수 있다**고 나와 있습니다.

    여유 공간(로그, 미디어, 기타 서비스)이 더 필요한 경우 **2GB가 권장**되지만 절대 최소값은 아닙니다.

    팁: 소형 Pi/VPS가 게이트웨이를 호스팅할 수 있으며 노트북/폰에 **노드**를 페어링하여 로컬 화면/카메라/canvas 또는 명령 실행에 사용할 수 있습니다. [노드](/nodes/)를 참조하십시오.

  </Accordion>

  <Accordion title="필요한 런타임은 무엇인가요?">
    Node **>= 22**가 필요합니다. `pnpm`이 권장됩니다. Bun은 게이트웨이에 **권장되지 않습니다**.
  </Accordion>

  <Accordion title="최신 버전에서 변경된 내용은 어디서 볼 수 있나요?">
    GitHub 변경 로그를 확인하십시오:
    [https://github.com/openclaw/openclaw/blob/main/CHANGELOG.md](https://github.com/openclaw/openclaw/blob/main/CHANGELOG.md)

    최신 항목이 상단에 있습니다. 상단 섹션이 **미출시**로 표시된 경우 날짜가 있는 다음 섹션이 최신 출시 버전입니다.

  </Accordion>

  <Accordion title="stable과 beta의 차이">
    **Stable**과 **beta**는 **npm dist-tag**이며 별도의 코드 라인이 아닙니다:

    - `latest` = 안정
    - `beta` = 테스트용 초기 빌드

    일반적으로 안정 출시는 먼저 **beta**에 배포되고 명시적인 승격 단계에서 동일한 버전을 `latest`로 이동시킵니다.

  </Accordion>

  <Accordion title="Windows 설치 시 git을 찾을 수 없거나 openclaw가 인식되지 않음">
    두 가지 일반적인 Windows 문제:

    **1) npm error spawn git / git을 찾을 수 없음**

    - **Git for Windows**를 설치하고 `git`이 PATH에 있는지 확인하십시오.
    - PowerShell을 닫았다가 다시 열고 설치 프로그램을 다시 실행하십시오.

    **2) 설치 후 openclaw가 인식되지 않음**

    - npm 전역 bin 폴더가 PATH에 없습니다.
    - 경로 확인:

      ```powershell
      npm config get prefix
      ```

    - 해당 디렉토리를 사용자 PATH에 추가하십시오 (Windows에서 `\bin` 접미사 불필요).
    - PATH 업데이트 후 PowerShell을 닫았다가 다시 여십시오.

    가장 매끄러운 Windows 설정을 원하면 기본 Windows 대신 **WSL2**를 사용하십시오.
    문서: [Windows](/platforms/windows).

  </Accordion>
</AccordionGroup>

## OpenClaw란 무엇인가?

<AccordionGroup>
  <Accordion title="한 단락으로 설명하는 OpenClaw">
    OpenClaw는 자신의 기기에서 실행하는 개인 AI 어시스턴트입니다. 이미 사용 중인 메시지 플랫폼(WhatsApp, Telegram, Slack, Mattermost, Discord, Google Chat, Signal, iMessage, WebChat 및 QQ Bot과 같은 번들 채널 플러그인)에서 답변하며 지원 플랫폼에서 음성 + 라이브 Canvas도 사용할 수 있습니다. **게이트웨이**는 상시 운영되는 컨트롤 플레인입니다. 어시스턴트가 바로 제품입니다.
  </Accordion>

  <Accordion title="가치 제안">
    OpenClaw는 "단순한 Claude 래퍼"가 아닙니다. **자체 하드웨어에서** 유능한 어시스턴트를 실행하고, 이미 사용하는 채팅 앱에서 접근 가능하며, 상태 유지 세션, 메모리, 도구를 갖추고 - 워크플로우의 제어권을 호스팅된 SaaS에 넘기지 않는 **로컬 우선 컨트롤 플레인**입니다.

    하이라이트:

    - **내 기기, 내 데이터:** 게이트웨이를 원하는 곳에서 실행하고 워크스페이스 + 세션 기록을 로컬에 유지
    - **실제 채널, 웹 샌드박스 아님:** WhatsApp/Telegram/Slack/Discord/Signal/iMessage/등, 지원 플랫폼의 모바일 음성 및 Canvas
    - **모델 불가지론:** Anthropic, OpenAI, MiniMax, OpenRouter 등 에이전트별 라우팅 및 장애 조치
    - **로컬 전용 옵션:** 원하는 경우 **모든 데이터가 기기에 유지**되도록 로컬 모델 실행
    - **멀티 에이전트 라우팅:** 채널, 계정 또는 작업별로 각자의 워크스페이스와 기본값을 가진 별도 에이전트
    - **오픈 소스 및 해킹 가능:** 벤더 잠금 없이 검사, 확장, 자체 호스팅

  </Accordion>

  <Accordion title="방금 설정했습니다 - 먼저 무엇을 해야 하나요?">
    좋은 첫 번째 프로젝트:

    - 웹사이트 구축 (WordPress, Shopify 또는 간단한 정적 사이트)
    - 모바일 앱 프로토타입 (개요, 화면, API 계획)
    - 파일 및 폴더 정리 (정리, 이름 지정, 태깅)
    - Gmail 연결 및 요약 또는 후속 작업 자동화

    큰 작업을 처리할 수 있지만 단계로 나누고 병렬 작업에 하위 에이전트를 사용할 때 가장 잘 작동합니다.

  </Accordion>
</AccordionGroup>

## 스킬 및 자동화

<AccordionGroup>
  <Accordion title="리포지토리를 더럽히지 않고 스킬을 사용자 정의하는 방법">
    리포지토리 복사본을 편집하는 대신 관리 재정의를 사용하십시오. 변경 사항을 `~/.openclaw/skills/<name>/SKILL.md`에 넣거나 `~/.openclaw/openclaw.json`의 `skills.load.extraDirs`를 통해 폴더를 추가하십시오. 우선 순위는 `<workspace>/skills` → `<workspace>/.agents/skills` → `~/.agents/skills` → `~/.openclaw/skills` → 번들 → `skills.load.extraDirs`이므로 git을 건드리지 않고도 관리 재정의가 번들 스킬보다 우선합니다.
  </Accordion>

  <Accordion title="크론 작업이 실행되지 않음. 무엇을 확인해야 하나요?">
    크론은 게이트웨이 프로세스 내에서 실행됩니다. 게이트웨이가 계속 실행 중이 아니면 예약된 작업이 실행되지 않습니다.

    체크리스트:

    - 크론이 활성화되어 있는지 (`cron.enabled`) 확인하고 `OPENCLAW_SKIP_CRON`이 설정되지 않았는지 확인하십시오.
    - 게이트웨이가 24/7 실행 중인지 확인하십시오 (절전/재시작 없음).
    - 작업의 시간대 설정 확인 (`--tz` 대 호스트 시간대).

    디버그:

    ```bash
    openclaw cron run <jobId>
    openclaw cron runs --id <jobId> --limit 50
    ```

  </Accordion>

  <Accordion title="Linux에서 스킬을 설치하는 방법">
    네이티브 `openclaw skills` 명령을 사용하거나 워크스페이스에 스킬을 넣으십시오. Linux에서는 macOS 스킬 UI를 사용할 수 없습니다.
    [https://clawhub.ai](https://clawhub.ai)에서 스킬을 찾아보십시오.

    ```bash
    openclaw skills search "calendar"
    openclaw skills install <skill-slug>
    openclaw skills update --all
    openclaw skills list --eligible
    ```

  </Accordion>
</AccordionGroup>

## 샌드박싱 및 메모리

<AccordionGroup>
  <Accordion title="메모리는 어떻게 작동하나요?">
    OpenClaw 메모리는 에이전트 워크스페이스의 마크다운 파일입니다:

    - `memory/YYYY-MM-DD.md`의 일일 노트
    - `MEMORY.md`의 선별된 장기 노트 (메인/개인 세션만)

    OpenClaw는 또한 자동 압축 전에 모델에게 내구성 있는 노트를 쓰도록 상기시키는 **자동 압축 전 메모리 플러시**를 실행합니다. [메모리](/concepts/memory)를 참조하십시오.

  </Accordion>

  <Accordion title="메모리가 계속 잊어버립니다. 어떻게 유지시키나요?">
    봇에게 **사실을 메모리에 쓰도록** 요청하십시오. 장기 노트는 `MEMORY.md`에, 단기 컨텍스트는 `memory/YYYY-MM-DD.md`에 저장됩니다.

    이것은 아직 개선 중인 영역입니다. 모델에게 메모리를 저장하도록 상기시키면 어떻게 해야 하는지 알 것입니다. 계속 잊어버리면 게이트웨이가 모든 실행에서 동일한 워크스페이스를 사용하는지 확인하십시오.

  </Accordion>
</AccordionGroup>

## 디스크의 파일 위치

<AccordionGroup>
  <Accordion title="OpenClaw에서 사용하는 모든 데이터가 로컬에 저장되나요?">
    아니요 - **OpenClaw의 상태는 로컬**이지만 **외부 서비스는 여전히 전송한 내용을 볼 수 있습니다**.

    - **기본적으로 로컬:** 세션, 메모리 파일, 설정, 워크스페이스는 게이트웨이 호스트(`~/.openclaw` + 워크스페이스 디렉토리)에 저장됩니다.
    - **필요에 의해 원격:** 모델 프로바이더(Anthropic/OpenAI/등)에 전송하는 메시지는 해당 API로 이동하고, 채팅 플랫폼(WhatsApp/Telegram/Slack/등)은 서버에 메시지 데이터를 저장합니다.
    - **자신이 발자국을 제어:** 로컬 모델을 사용하면 프롬프트를 머신에 유지하지만 채널 트래픽은 여전히 채널 서버를 통과합니다.

  </Accordion>

  <Accordion title="OpenClaw는 데이터를 어디에 저장하나요?">
    모든 것이 `$OPENCLAW_STATE_DIR` (기본값: `~/.openclaw`) 아래에 저장됩니다:

    | 경로                                                            | 용도                                                              |
    | --------------------------------------------------------------- | ----------------------------------------------------------------- |
    | `$OPENCLAW_STATE_DIR/openclaw.json`                             | 메인 설정 (JSON5)                                                 |
    | `$OPENCLAW_STATE_DIR/credentials/`                              | 프로바이더 상태 (예: `whatsapp/<accountId>/creds.json`)           |
    | `$OPENCLAW_STATE_DIR/agents/<agentId>/sessions/`                | 대화 기록 및 상태 (에이전트별)                                    |

    **워크스페이스** (AGENTS.md, 메모리 파일, 스킬 등)는 별도이며 `agents.defaults.workspace`를 통해 구성됩니다 (기본값: `~/.openclaw/workspace`).

  </Accordion>

  <Accordion title="권장 백업 전략">
    **에이전트 워크스페이스**를 **비공개** git 리포지토리에 넣고 어딘가에 백업하십시오 (예: GitHub private). 이렇게 하면 메모리 + AGENTS/SOUL/USER 파일이 캡처되고 나중에 어시스턴트의 "마음"을 복원할 수 있습니다.

    `~/.openclaw` 아래(자격 증명, 세션, 토큰 또는 암호화된 시크릿 페이로드)에 있는 것은 **절대 커밋하지 마십시오**.

  </Accordion>

  <Accordion title="OpenClaw를 완전히 제거하는 방법">
    전용 가이드를 참조하십시오: [제거](/install/uninstall).
  </Accordion>
</AccordionGroup>

## 설정 기초

<AccordionGroup>
  <Accordion title="설정 형식은 무엇인가요? 어디에 있나요?">
    OpenClaw는 `$OPENCLAW_CONFIG_PATH` (기본값: `~/.openclaw/openclaw.json`)에서 선택적 **JSON5** 설정을 읽습니다.

    파일이 없으면 안전한 기본값을 사용합니다 (`~/.openclaw/workspace`의 기본 워크스페이스 포함).

  </Accordion>

  <Accordion title="설정 변경 후 재시작해야 하나요?">
    게이트웨이는 설정을 감시하고 핫 리로드를 지원합니다:

    - `gateway.reload.mode: "hybrid"` (기본값): 안전한 변경 사항은 핫 적용, 중요한 것은 재시작
    - `hot`, `restart`, `off`도 지원됩니다

  </Accordion>
</AccordionGroup>

## 게이트웨이 포트, 이미 실행 중 및 원격 모드

<AccordionGroup>
  <Accordion title="다른 도구가 이미 18789 포트를 사용하고 있습니다">
    설정에서 포트를 변경하거나 `--port` 플래그를 사용하십시오:

    ```bash
    openclaw gateway --port 19000
    ```

    또는 설정에서:

    ```json5
    { gateway: { port: 19000 } }
    ```

    포트를 변경한 경우 TUI, 대시보드 URL, 노드 호스트 연결을 업데이트하십시오.

  </Accordion>

  <Accordion title="env vars와 .env 로딩">
    [환경 변수](/help/environment)를 참조하십시오.
  </Accordion>
</AccordionGroup>

## 관련

- [문제 해결](/help/troubleshooting) — 자주 발생하는 문제
- [게이트웨이 문제 해결](/gateway/troubleshooting) — 게이트웨이별 문제
- [Doctor](/gateway/doctor) — 자동화된 상태 확인 및 수리
- [채널 문제 해결](/channels/troubleshooting) — 채널 연결 문제
