---
summary: "FAQ: 빠른 시작 및 첫 실행 설정 — 설치, 온보딩, 인증, 구독, 초기 실패"
read_when:
  - 새로 설치했거나 온보딩이 막혔거나 첫 실행 오류가 발생한 경우
  - 인증 및 프로바이더 구독을 선택할 때
  - docs.openclaw.ai에 접근할 수 없거나 대시보드를 열 수 없거나 설치가 멈춘 경우
title: "FAQ: 첫 실행 설정"
sidebarTitle: "첫 실행 FAQ"
---

빠른 시작 및 첫 실행 Q&A. 일상적인 운영, 모델, 인증, 세션 및 문제 해결은 메인 [FAQ](/help/faq)를 참조하십시오.

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

    이는 OpenClaw를 **git 체크아웃에서** 설치하므로 에이전트가 코드 + 문서를 읽고 실행 중인 정확한 버전에 대해 추론할 수 있습니다. `--install-method git` 없이 설치 프로그램을 다시 실행하면 언제든지 안정 버전으로 돌아갈 수 있습니다.

    팁: 에이전트에게 수정 사항을 **계획하고 감독**(단계별)한 다음 필요한 명령만 실행하도록 요청하십시오. 그러면 변경 사항이 작게 유지되어 감사하기 더 쉽습니다.

    실제 버그나 수정 사항을 발견하면 GitHub 이슈를 열거나 PR을 보내 주십시오:
    [https://github.com/openclaw/openclaw/issues](https://github.com/openclaw/openclaw/issues)
    [https://github.com/openclaw/openclaw/pulls](https://github.com/openclaw/openclaw/pulls)

    다음 명령으로 시작하십시오 (도움을 요청할 때 출력 공유):

    ```bash
    openclaw status
    openclaw models status
    openclaw doctor
    ```

    각 명령의 용도:

    - `openclaw status`: 게이트웨이/에이전트 상태 + 기본 설정의 빠른 스냅샷.
    - `openclaw models status`: 프로바이더 인증 + 모델 가용성 확인.
    - `openclaw doctor`: 일반적인 설정/상태 문제를 검증하고 수리합니다.

    기타 유용한 CLI 확인: `openclaw status --all`, `openclaw logs --follow`,
    `openclaw gateway status`, `openclaw health --verbose`.

    빠른 디버그 루프: [무언가가 고장났을 때 첫 60초](#first-60-seconds-if-something-is-broken).
    설치 문서: [설치](/install/), [설치 프로그램 플래그](/install/installer), [업데이트](/install/updating).

  </Accordion>

  <Accordion title="Heartbeat가 계속 건너뜁니다. 건너뛰기 이유는 무엇을 의미하나요?">
    일반적인 heartbeat 건너뛰기 이유:

    - `quiet-hours`: 구성된 활성 시간 창 외부
    - `empty-heartbeat-file`: `HEARTBEAT.md`가 존재하지만 빈/헤더 전용 스캐폴딩만 포함됨
    - `no-tasks-due`: `HEARTBEAT.md` 작업 모드가 활성화되어 있지만 아직 도래한 작업 간격이 없음
    - `alerts-disabled`: 모든 heartbeat 가시성이 비활성화됨 (`showOk`, `showAlerts`, `useIndicator`가 모두 꺼짐)

    작업 모드에서는 실제 heartbeat 실행이 완료된 후에만 만기 타임스탬프가 진행됩니다. 건너뛴 실행은 작업을 완료된 것으로 표시하지 않습니다.

    문서: [Heartbeat](/gateway/heartbeat), [자동화 및 작업](/automation/).

  </Accordion>

  <Accordion title="OpenClaw 설치 및 설정 권장 방법">
    리포지토리는 소스에서 실행하고 온보딩을 사용하도록 권장합니다:

    ```bash
    curl -fsSL https://openclaw.ai/install.sh | bash
    openclaw onboard --install-daemon
    ```

    마법사는 UI 자산도 자동으로 빌드할 수 있습니다. 온보딩 후에는 일반적으로 게이트웨이를 포트 **18789**에서 실행합니다.

    소스에서 (기여자/개발):

    ```bash
    git clone https://github.com/openclaw/openclaw.git
    cd openclaw
    pnpm install
    pnpm build
    pnpm ui:build
    openclaw onboard
    ```

    아직 전역 설치가 없는 경우 `pnpm openclaw onboard`로 실행하십시오.

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
    - 아직 공유 비밀이 구성되지 않은 경우 `openclaw doctor --generate-gateway-token`으로 토큰을 생성하십시오.

    **Localhost가 아닌 경우:**

    - **Tailscale Serve** (권장): 루프백 바인딩 유지, `openclaw gateway --tailscale serve` 실행, `https://<magicdns>/` 열기. `gateway.auth.allowTailscale`이 `true`인 경우 ID 헤더가 Control UI/WebSocket 인증을 충족합니다(붙여넣은 공유 비밀 없음, 신뢰할 수 있는 게이트웨이 호스트 가정). HTTP API는 의도적으로 private-ingress `none` 또는 trusted-proxy HTTP 인증을 사용하지 않는 한 여전히 공유 비밀 인증이 필요합니다.
      동일한 클라이언트에서의 잘못된 동시 Serve 인증 시도는 failed-auth 제한기가 기록하기 전에 직렬화되므로 두 번째 잘못된 재시도가 이미 `retry later`를 표시할 수 있습니다.
    - **Tailnet 바인딩**: `openclaw gateway --bind tailnet --token "<token>"` 실행 (또는 비밀번호 인증 구성), `http://<tailscale-ip>:18789/` 열기, 그런 다음 일치하는 공유 비밀을 대시보드 설정에 붙여넣습니다.
    - **ID 인식 리버스 프록시**: 게이트웨이를 루프백이 아닌 신뢰할 수 있는 프록시 뒤에 두고 `gateway.auth.mode: "trusted-proxy"`를 구성한 다음 프록시 URL을 여십시오.
    - **SSH 터널**: `ssh -N -L 18789:127.0.0.1:18789 user@host` 후 `http://127.0.0.1:18789/` 열기. 공유 비밀 인증은 여전히 터널을 통해 적용됩니다. 요청 시 구성된 토큰 또는 비밀번호를 붙여넣으십시오.

    바인딩 모드 및 인증 세부 사항은 [대시보드](/web/dashboard) 및 [웹 표면](/web/)을 참조하십시오.

  </Accordion>

  <Accordion title="채팅 승인에 두 개의 exec 승인 설정이 있는 이유는?">
    이들은 서로 다른 계층을 제어합니다:

    - `approvals.exec`: 승인 프롬프트를 채팅 대상으로 전달
    - `channels.<channel>.execApprovals`: 해당 채널이 exec 승인을 위한 네이티브 승인 클라이언트 역할을 하도록 함

    호스트 exec 정책은 여전히 실제 승인 게이트입니다. 채팅 설정은 승인 프롬프트가 표시되는 위치와 사람들이 응답할 수 있는 방법만 제어합니다.

    대부분의 설정에서는 둘 다 **필요하지 않습니다**:

    - 채팅이 이미 명령과 답변을 지원하는 경우 same-chat `/approve`가 공유 경로를 통해 작동합니다.
    - 지원되는 네이티브 채널이 승인자를 안전하게 추론할 수 있는 경우 `channels.<channel>.execApprovals.enabled`가 설정되지 않았거나 `"auto"`일 때 OpenClaw가 이제 DM 우선 네이티브 승인을 자동으로 활성화합니다.
    - 네이티브 승인 카드/버튼을 사용할 수 있는 경우 해당 네이티브 UI가 기본 경로입니다. 에이전트는 도구 결과가 채팅 승인을 사용할 수 없거나 수동 승인이 유일한 경로라고 말하는 경우에만 수동 `/approve` 명령을 포함해야 합니다.
    - `approvals.exec`는 프롬프트를 다른 채팅이나 명시적 운영 룸으로도 전달해야 하는 경우에만 사용하십시오.
    - `channels.<channel>.execApprovals.target: "channel"` 또는 `"both"`는 승인 프롬프트를 원래 룸/토픽으로 다시 게시하고자 할 때만 사용하십시오.
    - 플러그인 승인은 다시 별개입니다: 기본적으로 same-chat `/approve`를 사용하고, 선택적 `approvals.plugin` 전달을 사용하며, 일부 네이티브 채널만 플러그인 승인 네이티브 처리를 상위에 유지합니다.

    짧게 말해: 전달은 라우팅용이고, 네이티브 클라이언트 구성은 채널별로 더 풍부한 UX를 위한 것입니다.
    [Exec 승인](/tools/exec-approvals)을 참조하십시오.

  </Accordion>

  <Accordion title="필요한 런타임은 무엇인가요?">
    Node **>= 22**가 필요합니다. `pnpm`이 권장됩니다. Bun은 게이트웨이에 **권장되지 않습니다**.
  </Accordion>

  <Accordion title="Raspberry Pi에서 실행되나요?">
    예. 게이트웨이는 경량입니다 - 문서에는 개인 사용에 **512MB-1GB RAM**, **1코어**, 약 **500MB**
    디스크가 충분하며 **Raspberry Pi 4가 실행할 수 있다**고 나와 있습니다.

    여유 공간(로그, 미디어, 기타 서비스)이 더 필요한 경우 **2GB가 권장**되지만 절대 최소값은 아닙니다.

    팁: 소형 Pi/VPS가 게이트웨이를 호스팅할 수 있으며 노트북/폰에 **노드**를 페어링하여 로컬 화면/카메라/canvas 또는 명령 실행에 사용할 수 있습니다. [노드](/nodes/)를 참조하십시오.

  </Accordion>

  <Accordion title="Raspberry Pi 설치 팁이 있나요?">
    짧게 말하면: 작동하지만 거친 부분이 있을 수 있습니다.

    - **64비트** OS를 사용하고 Node >= 22를 유지하십시오.
    - 로그를 볼 수 있고 빠르게 업데이트할 수 있도록 **해킹 가능한(git) 설치**를 선호하십시오.
    - 채널/스킬 없이 시작한 다음 하나씩 추가하십시오.
    - 이상한 바이너리 문제가 발생하면 일반적으로 **ARM 호환성** 문제입니다.

    문서: [Linux](/platforms/linux), [설치](/install/).

  </Accordion>

  <Accordion title="wake up my friend / 온보딩이 부화하지 않는 상태에서 멈춥니다. 이제 어떻게 해야 하나요?">
    해당 화면은 게이트웨이가 접근 가능하고 인증되었는지에 따라 달라집니다. TUI는 또한 첫 번째 부화 시 "Wake up, my friend!"를 자동으로 보냅니다. **응답 없이** 해당 라인이 표시되고 토큰이 0으로 유지되면 에이전트가 실행되지 않은 것입니다.

    1. 게이트웨이 재시작:

    ```bash
    openclaw gateway restart
    ```

    2. 상태 + 인증 확인:

    ```bash
    openclaw status
    openclaw models status
    openclaw logs --follow
    ```

    3. 여전히 멈춰 있으면 다음을 실행하십시오:

    ```bash
    openclaw doctor
    ```

    게이트웨이가 원격인 경우 터널/Tailscale 연결이 유지되고 UI가 올바른 게이트웨이를 가리키는지 확인하십시오. [원격 접속](/gateway/remote)을 참조하십시오.

  </Accordion>

  <Accordion title="온보딩을 다시 수행하지 않고 새 머신(Mac mini)으로 설정을 마이그레이션할 수 있나요?">
    예. **상태 디렉토리**와 **워크스페이스**를 복사한 다음 Doctor를 한 번 실행하십시오. 이렇게 하면 **두 위치를 모두** 복사하는 한 봇이 "정확히 동일하게"(메모리, 세션 기록, 인증, 채널 상태) 유지됩니다:

    1. 새 머신에 OpenClaw를 설치합니다.
    2. 기존 머신에서 `$OPENCLAW_STATE_DIR` (기본값: `~/.openclaw`)을 복사합니다.
    3. 워크스페이스를 복사합니다 (기본값: `~/.openclaw/workspace`).
    4. `openclaw doctor`를 실행하고 게이트웨이 서비스를 재시작합니다.

    이는 설정, 인증 프로필, WhatsApp 자격 증명, 세션 및 메모리를 보존합니다. 원격 모드에 있는 경우 게이트웨이 호스트가 세션 저장소와 워크스페이스를 소유한다는 점을 기억하십시오.

    **중요:** 워크스페이스를 GitHub에 커밋/푸시만 하는 경우 **메모리 + 부트스트랩 파일**은 백업되지만 세션 기록이나 인증은 **백업되지 않습니다**. 이들은 `~/.openclaw/` 아래에 있습니다 (예: `~/.openclaw/agents/<agentId>/sessions/`).

    관련: [마이그레이션](/install/migrating), [디스크의 파일 위치](#where-things-live-on-disk),
    [에이전트 워크스페이스](/concepts/agent-workspace), [Doctor](/gateway/doctor),
    [원격 모드](/gateway/remote).

  </Accordion>

  <Accordion title="최신 버전에서 변경된 내용은 어디서 볼 수 있나요?">
    GitHub 변경 로그를 확인하십시오:
    [https://github.com/openclaw/openclaw/blob/main/CHANGELOG.md](https://github.com/openclaw/openclaw/blob/main/CHANGELOG.md)

    최신 항목이 상단에 있습니다. 상단 섹션이 **Unreleased**로 표시된 경우 날짜가 있는 다음 섹션이 최신 출시 버전입니다. 항목은 **Highlights**, **Changes**, **Fixes**로 그룹화됩니다(필요한 경우 docs/기타 섹션 추가).

  </Accordion>

  <Accordion title="docs.openclaw.ai에 접근할 수 없습니다 (SSL 오류)">
    일부 Comcast/Xfinity 연결은 Xfinity Advanced Security를 통해 `docs.openclaw.ai`를 잘못 차단합니다. 비활성화하거나 `docs.openclaw.ai`를 허용 목록에 추가한 다음 다시 시도하십시오.
    여기에 보고하여 차단을 해제하는 데 도움을 주십시오: [https://spa.xfinity.com/check_url_status](https://spa.xfinity.com/check_url_status).

    여전히 사이트에 접근할 수 없으면 문서가 GitHub에 미러링되어 있습니다:
    [https://github.com/openclaw/openclaw/tree/main/docs](https://github.com/openclaw/openclaw/tree/main/docs)

  </Accordion>

  <Accordion title="stable과 beta의 차이">
    **Stable**과 **beta**는 **npm dist-tag**이며 별도의 코드 라인이 아닙니다:

    - `latest` = 안정
    - `beta` = 테스트용 초기 빌드

    일반적으로 안정 출시는 먼저 **beta**에 배포되고 명시적인 승격 단계에서 동일한 버전을 `latest`로 이동시킵니다. 관리자는 필요한 경우 `latest`로 직접 게시할 수도 있습니다. 이것이 승격 후 beta와 stable이 **동일한 버전**을 가리킬 수 있는 이유입니다.

    변경 사항 확인:
    [https://github.com/openclaw/openclaw/blob/main/CHANGELOG.md](https://github.com/openclaw/openclaw/blob/main/CHANGELOG.md)

    설치 한 줄 명령과 beta와 dev의 차이점은 아래 아코디언을 참조하십시오.

  </Accordion>

  <Accordion title="beta 버전은 어떻게 설치하며 beta와 dev의 차이점은 무엇인가요?">
    **Beta**는 npm dist-tag `beta`입니다 (승격 후 `latest`와 일치할 수 있음).
    **Dev**는 `main`의 이동하는 헤드(git)입니다. 게시되면 npm dist-tag `dev`를 사용합니다.

    한 줄 명령 (macOS/Linux):

    ```bash
    curl -fsSL --proto '=https' --tlsv1.2 https://openclaw.ai/install.sh | bash -s -- --beta
    ```

    ```bash
    curl -fsSL --proto '=https' --tlsv1.2 https://openclaw.ai/install.sh | bash -s -- --install-method git
    ```

    Windows 설치 프로그램 (PowerShell):
    [https://openclaw.ai/install.ps1](https://openclaw.ai/install.ps1)

    자세한 내용: [개발 채널](/install/development-channels) 및 [설치 프로그램 플래그](/install/installer).

  </Accordion>

  <Accordion title="최신 비트를 어떻게 시도해 볼 수 있나요?">
    두 가지 옵션:

    1. **Dev 채널 (git 체크아웃):**

    ```bash
    openclaw update --channel dev
    ```

    이는 `main` 브랜치로 전환하고 소스에서 업데이트합니다.

    2. **해킹 가능한 설치 (설치 프로그램 사이트에서):**

    ```bash
    curl -fsSL https://openclaw.ai/install.sh | bash -s -- --install-method git
    ```

    그러면 편집할 수 있는 로컬 리포가 제공되며 git을 통해 업데이트할 수 있습니다.

    수동으로 깨끗한 클론을 선호하는 경우 다음을 사용하십시오:

    ```bash
    git clone https://github.com/openclaw/openclaw.git
    cd openclaw
    pnpm install
    pnpm build
    ```

    문서: [업데이트](/cli/update), [개발 채널](/install/development-channels),
    [설치](/install/).

  </Accordion>

  <Accordion title="설치 및 온보딩은 보통 얼마나 걸리나요?">
    대략적인 가이드:

    - **설치:** 2-5분
    - **온보딩:** 구성하는 채널/모델 수에 따라 5-15분

    멈추면 [설치 프로그램 멈춤](#quick-start-and-first-run-setup)과 [막혔을 때](#quick-start-and-first-run-setup)의 빠른 디버그 루프를 사용하십시오.

  </Accordion>

  <Accordion title="설치 프로그램이 멈췄나요? 더 많은 피드백을 얻으려면 어떻게 해야 하나요?">
    **상세 출력**으로 설치 프로그램을 다시 실행하십시오:

    ```bash
    curl -fsSL https://openclaw.ai/install.sh | bash -s -- --verbose
    ```

    상세 출력을 포함한 Beta 설치:

    ```bash
    curl -fsSL https://openclaw.ai/install.sh | bash -s -- --beta --verbose
    ```

    해킹 가능한(git) 설치의 경우:

    ```bash
    curl -fsSL https://openclaw.ai/install.sh | bash -s -- --install-method git --verbose
    ```

    Windows (PowerShell) 동등:

    ```powershell
    # install.ps1에는 아직 전용 -Verbose 플래그가 없습니다.
    Set-PSDebug -Trace 1
    & ([scriptblock]::Create((iwr -useb https://openclaw.ai/install.ps1))) -NoOnboard
    Set-PSDebug -Trace 0
    ```

    더 많은 옵션: [설치 프로그램 플래그](/install/installer).

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

    - 해당 디렉토리를 사용자 PATH에 추가하십시오 (Windows에서 `\bin` 접미사 불필요. 대부분의 시스템에서는 `%AppData%\npm`입니다).
    - PATH 업데이트 후 PowerShell을 닫았다가 다시 여십시오.

    가장 매끄러운 Windows 설정을 원하면 기본 Windows 대신 **WSL2**를 사용하십시오.
    문서: [Windows](/platforms/windows).

  </Accordion>

  <Accordion title="Windows exec 출력에 깨진 중국어 텍스트가 표시됩니다 - 어떻게 해야 하나요?">
    이는 일반적으로 기본 Windows 셸의 콘솔 코드 페이지 불일치입니다.

    증상:

    - `system.run`/`exec` 출력이 중국어를 mojibake로 렌더링
    - 다른 터미널 프로필에서는 동일한 명령이 정상적으로 보임

    PowerShell의 빠른 해결 방법:

    ```powershell
    chcp 65001
    [Console]::InputEncoding = [System.Text.UTF8Encoding]::new($false)
    [Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
    $OutputEncoding = [System.Text.UTF8Encoding]::new($false)
    ```

    그런 다음 게이트웨이를 재시작하고 명령을 다시 시도하십시오:

    ```powershell
    openclaw gateway restart
    ```

    최신 OpenClaw에서 여전히 이것을 재현한다면 다음에서 추적/보고하십시오:

    - [이슈 #30640](https://github.com/openclaw/openclaw/issues/30640)

  </Accordion>

  <Accordion title="문서가 질문에 답하지 못했습니다 - 어떻게 하면 더 나은 답변을 얻을 수 있나요?">
    전체 소스와 문서를 로컬에 보유할 수 있도록 **해킹 가능한(git) 설치**를 사용한 다음 해당 폴더 _에서_ 봇(또는 Claude/Codex)에게 질문하여 리포를 읽고 정확하게 답변할 수 있도록 하십시오.

    ```bash
    curl -fsSL https://openclaw.ai/install.sh | bash -s -- --install-method git
    ```

    자세한 내용: [설치](/install/) 및 [설치 프로그램 플래그](/install/installer).

  </Accordion>

  <Accordion title="Linux에서 OpenClaw를 어떻게 설치하나요?">
    짧은 답: Linux 가이드를 따른 다음 온보딩을 실행하십시오.

    - Linux 빠른 경로 + 서비스 설치: [Linux](/platforms/linux).
    - 전체 안내: [시작하기](/start/getting-started).
    - 설치 프로그램 + 업데이트: [설치 및 업데이트](/install/updating).

  </Accordion>

  <Accordion title="VPS에서 OpenClaw를 어떻게 설치하나요?">
    모든 Linux VPS가 작동합니다. 서버에 설치한 다음 SSH/Tailscale을 사용하여 게이트웨이에 연결하십시오.

    가이드: [exe.dev](/install/exe-dev), [Hetzner](/install/hetzner), [Fly.io](/install/fly).
    원격 접속: [게이트웨이 원격](/gateway/remote).

  </Accordion>

  <Accordion title="클라우드/VPS 설치 가이드는 어디에 있나요?">
    일반적인 프로바이더와 함께 **호스팅 허브**를 유지합니다. 하나를 선택하고 가이드를 따르십시오:

    - [VPS 호스팅](/vps) (한 곳의 모든 프로바이더)
    - [Fly.io](/install/fly)
    - [Hetzner](/install/hetzner)
    - [exe.dev](/install/exe-dev)

    클라우드에서 작동하는 방식: **게이트웨이가 서버에서 실행**되며 노트북/폰에서 Control UI(또는 Tailscale/SSH)를 통해 접근합니다. 상태 + 워크스페이스가 서버에 있으므로 호스트를 진실의 원천으로 간주하고 백업하십시오.

    클라우드 게이트웨이에 **노드**(Mac/iOS/Android/헤드리스)를 페어링하여 로컬 화면/카메라/canvas에 접근하거나 게이트웨이는 클라우드에 유지하면서 노트북에서 명령을 실행할 수 있습니다.

    허브: [플랫폼](/platforms/). 원격 접속: [게이트웨이 원격](/gateway/remote).
    노드: [노드](/nodes/), [노드 CLI](/cli/nodes).

  </Accordion>

  <Accordion title="OpenClaw에게 자체 업데이트를 요청할 수 있나요?">
    짧은 답: **가능하지만 권장되지 않습니다**. 업데이트 플로우는 게이트웨이를 재시작(활성 세션 삭제)할 수 있고, 깨끗한 git 체크아웃이 필요할 수 있으며, 확인을 요청할 수 있습니다. 더 안전한 방법: 운영자로서 셸에서 업데이트를 실행하십시오.

    CLI 사용:

    ```bash
    openclaw update
    openclaw update status
    openclaw update --channel stable|beta|dev
    openclaw update --tag <dist-tag|version>
    openclaw update --no-restart
    ```

    에이전트에서 자동화해야 하는 경우:

    ```bash
    openclaw update --yes --no-restart
    openclaw gateway restart
    ```

    문서: [업데이트](/cli/update), [업데이트하기](/install/updating).

  </Accordion>

  <Accordion title="온보딩은 실제로 무엇을 하나요?">
    `openclaw onboard`는 권장되는 설정 경로입니다. **로컬 모드**에서는 다음을 안내합니다:

    - **모델/인증 설정** (프로바이더 OAuth, API 키, Anthropic setup-token, LM Studio와 같은 로컬 모델 옵션 포함)
    - **워크스페이스** 위치 + 부트스트랩 파일
    - **게이트웨이 설정** (bind/port/auth/tailscale)
    - **채널** (WhatsApp, Telegram, Discord, Mattermost, Signal, iMessage, QQ Bot과 같은 번들 채널 플러그인 포함)
    - **데몬 설치** (macOS의 LaunchAgent; Linux/WSL2의 systemd 사용자 유닛)
    - **상태 확인** 및 **스킬** 선택

    구성된 모델을 알 수 없거나 인증이 누락된 경우 경고합니다.

  </Accordion>

  <Accordion title="이것을 실행하려면 Claude 또는 OpenAI 구독이 필요한가요?">
    아니요. **API 키**(Anthropic/OpenAI/기타)를 사용하거나 데이터를 기기에 유지하도록 **로컬 전용 모델**로 OpenClaw를 실행할 수 있습니다. 구독(Claude Pro/Max 또는 OpenAI Codex)은 해당 프로바이더를 인증하는 선택적 방법입니다.

    OpenClaw에서 Anthropic의 경우 실용적인 구분은 다음과 같습니다:

    - **Anthropic API 키**: 일반 Anthropic API 청구
    - **OpenClaw에서 Claude CLI / Claude 구독 인증**: Anthropic 직원이 이 사용이 다시 허용된다고 알려왔으며, OpenClaw는 Anthropic이 새 정책을 게시하지 않는 한 이 통합에 대해 `claude -p` 사용을 승인된 것으로 취급합니다

    장기 실행 게이트웨이 호스트의 경우 Anthropic API 키가 여전히 더 예측 가능한 설정입니다. OpenAI Codex OAuth는 OpenClaw와 같은 외부 도구에 명시적으로 지원됩니다.

    OpenClaw는 또한 **Qwen Cloud Coding Plan**, **MiniMax Coding Plan**, **Z.AI / GLM Coding Plan**을 포함한 기타 호스팅된 구독 스타일 옵션을 지원합니다.

    문서: [Anthropic](/providers/anthropic), [OpenAI](/providers/openai),
    [Qwen Cloud](/providers/qwen),
    [MiniMax](/providers/minimax), [GLM 모델](/providers/glm),
    [로컬 모델](/gateway/local-models), [모델](/concepts/models).

  </Accordion>

  <Accordion title="API 키 없이 Claude Max 구독을 사용할 수 있나요?">
    예.

    Anthropic 직원이 OpenClaw 스타일 Claude CLI 사용이 다시 허용된다고 알려왔으므로, OpenClaw는 Anthropic이 새 정책을 게시하지 않는 한 이 통합에 대해 Claude 구독 인증 및 `claude -p` 사용을 승인된 것으로 취급합니다. 가장 예측 가능한 서버 측 설정을 원하면 대신 Anthropic API 키를 사용하십시오.

  </Accordion>

  <Accordion title="Claude 구독 인증(Claude Pro 또는 Max)을 지원하나요?">
    예.

    Anthropic 직원이 이 사용이 다시 허용된다고 알려왔으므로, OpenClaw는 Anthropic이 새 정책을 게시하지 않는 한 이 통합에 대해 Claude CLI 재사용 및 `claude -p` 사용을 승인된 것으로 취급합니다.

    Anthropic setup-token은 여전히 지원되는 OpenClaw 토큰 경로로 사용 가능하지만, OpenClaw는 이제 가능한 경우 Claude CLI 재사용 및 `claude -p`를 선호합니다.
    프로덕션 또는 다중 사용자 워크로드의 경우 Anthropic API 키 인증이 여전히 더 안전하고 예측 가능한 선택입니다. OpenClaw의 다른 구독 스타일 호스팅 옵션을 원하면 [OpenAI](/providers/openai), [Qwen / Model Cloud](/providers/qwen), [MiniMax](/providers/minimax) 및 [GLM 모델](/providers/glm)을 참조하십시오.

  </Accordion>

</AccordionGroup>

<a id="why-am-i-seeing-http-429-ratelimiterror-from-anthropic"></a>

<AccordionGroup>
  <Accordion title="Anthropic에서 HTTP 429 rate_limit_error가 표시되는 이유는?">
    이는 현재 창에 대한 **Anthropic 할당량/속도 제한**이 소진되었음을 의미합니다. **Claude CLI**를 사용하는 경우 창이 재설정될 때까지 기다리거나 플랜을 업그레이드하십시오. **Anthropic API 키**를 사용하는 경우 사용량/청구를 확인하고 필요에 따라 제한을 높이려면 Anthropic Console을 확인하십시오.

    메시지가 구체적으로 다음과 같은 경우:
    `Extra usage is required for long context requests`, 요청이 Anthropic의 1M 컨텍스트 베타(`context1m: true`)를 사용하려고 합니다. 이는 자격 증명이 긴 컨텍스트 청구(API 키 청구 또는 Extra Usage가 활성화된 OpenClaw Claude-login 경로)에 적합한 경우에만 작동합니다.

    팁: 프로바이더가 속도 제한에 걸려 있는 동안에도 OpenClaw가 계속 응답할 수 있도록 **폴백 모델**을 설정하십시오.
    [모델](/cli/models), [OAuth](/concepts/oauth) 및
    [/gateway/troubleshooting#anthropic-429-extra-usage-required-for-long-context](/gateway/troubleshooting#anthropic-429-extra-usage-required-for-long-context)를 참조하십시오.

  </Accordion>

  <Accordion title="AWS Bedrock이 지원되나요?">
    예. OpenClaw에는 번들 **Amazon Bedrock (Converse)** 프로바이더가 있습니다. AWS 환경 마커가 있으면 OpenClaw는 스트리밍/텍스트 Bedrock 카탈로그를 자동으로 발견하고 암시적 `amazon-bedrock` 프로바이더로 병합할 수 있습니다. 그렇지 않으면 `plugins.entries.amazon-bedrock.config.discovery.enabled`를 명시적으로 활성화하거나 수동 프로바이더 항목을 추가할 수 있습니다. [Amazon Bedrock](/providers/bedrock) 및 [모델 프로바이더](/providers/models)를 참조하십시오. 관리되는 키 플로우를 선호하는 경우 Bedrock 앞에 OpenAI 호환 프록시를 두는 것도 여전히 유효한 옵션입니다.
  </Accordion>

  <Accordion title="Codex 인증은 어떻게 작동하나요?">
    OpenClaw는 OAuth(ChatGPT 로그인)를 통해 **OpenAI Code (Codex)**를 지원합니다. 기본 PI 러너를 통한 Codex OAuth에는 `openai-codex/gpt-5.5`를 사용하십시오. 현재 직접 OpenAI API 키 접근에는 `openai/gpt-5.4`를 사용하십시오. OpenAI가 공용 API에서 활성화하면 GPT-5.5 직접 API 키 접근이 지원됩니다. 오늘날 GPT-5.5는 `openai-codex/gpt-5.5`를 통한 구독/OAuth 또는 `openai/gpt-5.5` 및 `embeddedHarness.runtime: "codex"`를 사용한 네이티브 Codex 앱 서버 실행을 사용합니다.
    [모델 프로바이더](/concepts/model-providers) 및 [온보딩 (CLI)](/start/wizard)를 참조하십시오.
  </Accordion>

  <Accordion title="OpenClaw가 여전히 openai-codex를 언급하는 이유는?">
    `openai-codex`는 ChatGPT/Codex OAuth용 프로바이더 및 인증 프로필 ID입니다. 또한 Codex OAuth에 대한 명시적 PI 모델 접두사이기도 합니다:

    - `openai/gpt-5.4` = PI의 현재 직접 OpenAI API 키 경로
    - `openai/gpt-5.5` = OpenAI가 API에서 GPT-5.5를 활성화하면 향후 직접 API 키 경로
    - `openai-codex/gpt-5.5` = PI의 Codex OAuth 경로
    - `openai/gpt-5.5` + `embeddedHarness.runtime: "codex"` = 네이티브 Codex 앱 서버 경로
    - `openai-codex:...` = 인증 프로필 ID, 모델 참조 아님

    직접 OpenAI Platform 청구/제한 경로를 원하면 `OPENAI_API_KEY`를 설정하십시오. ChatGPT/Codex 구독 인증을 원하면 `openclaw models auth login --provider openai-codex`로 로그인하고 PI 실행에 `openai-codex/*` 모델 참조를 사용하십시오.

  </Accordion>

  <Accordion title="Codex OAuth 제한이 ChatGPT 웹과 다를 수 있는 이유는?">
    Codex OAuth는 OpenAI 관리, 플랜 의존적인 할당량 창을 사용합니다. 실제로는 두 가지가 동일한 계정에 연결되어 있는 경우에도 해당 제한이 ChatGPT 웹사이트/앱 경험과 다를 수 있습니다.

    OpenClaw는 `openclaw models status`에서 현재 표시되는 프로바이더 사용량/할당량 창을 표시할 수 있지만 ChatGPT 웹 권한을 직접 API 접근으로 발명하거나 정규화하지 않습니다. 직접 OpenAI Platform 청구/제한 경로를 원하면 API 키와 함께 `openai/*`를 사용하십시오.

  </Accordion>

  <Accordion title="OpenAI 구독 인증(Codex OAuth)을 지원하나요?">
    예. OpenClaw는 **OpenAI Code (Codex) 구독 OAuth**를 완전히 지원합니다.
    OpenAI는 OpenClaw와 같은 외부 도구/워크플로우에서 구독 OAuth 사용을 명시적으로 허용합니다. 온보딩이 OAuth 플로우를 실행해 줄 수 있습니다.

    [OAuth](/concepts/oauth), [모델 프로바이더](/concepts/model-providers) 및 [온보딩 (CLI)](/start/wizard)를 참조하십시오.

  </Accordion>

  <Accordion title="Gemini CLI OAuth는 어떻게 설정하나요?">
    Gemini CLI는 `openclaw.json`의 클라이언트 ID 또는 시크릿이 아닌 **플러그인 인증 플로우**를 사용합니다.

    단계:

    1. `gemini`가 `PATH`에 있도록 Gemini CLI를 로컬에 설치합니다.
       - Homebrew: `brew install gemini-cli`
       - npm: `npm install -g @google/gemini-cli`
    2. 플러그인 활성화: `openclaw plugins enable google`
    3. 로그인: `openclaw models auth login --provider google-gemini-cli --set-default`
    4. 로그인 후 기본 모델: `google-gemini-cli/gemini-3-flash-preview`
    5. 요청이 실패하면 게이트웨이 호스트에서 `GOOGLE_CLOUD_PROJECT` 또는 `GOOGLE_CLOUD_PROJECT_ID`를 설정하십시오.

    이는 게이트웨이 호스트의 인증 프로필에 OAuth 토큰을 저장합니다. 자세한 내용: [모델 프로바이더](/concepts/model-providers).

  </Accordion>

  <Accordion title="캐주얼 채팅에 로컬 모델이 괜찮나요?">
    보통은 아닙니다. OpenClaw는 큰 컨텍스트 + 강력한 안전성이 필요합니다. 작은 카드는 잘리고 누출됩니다. 꼭 해야 한다면 로컬에서 실행할 수 있는 **가장 큰** 모델 빌드(LM Studio)를 실행하고 [/gateway/local-models](/gateway/local-models)를 참조하십시오. 더 작은/양자화된 모델은 프롬프트 주입 위험을 증가시킵니다 - [보안](/gateway/security/)을 참조하십시오.
  </Accordion>

  <Accordion title="호스팅된 모델 트래픽을 특정 리전에 유지하려면 어떻게 해야 하나요?">
    리전에 고정된 엔드포인트를 선택하십시오. OpenRouter는 MiniMax, Kimi 및 GLM에 대해 미국 호스팅 옵션을 노출합니다. 데이터를 리전 내에 유지하려면 미국 호스팅 변형을 선택하십시오. 선택한 리전 프로바이더를 존중하면서 폴백을 사용할 수 있도록 `models.mode: "merge"`를 사용하여 Anthropic/OpenAI를 이와 함께 나열할 수도 있습니다.
  </Accordion>

  <Accordion title="이것을 설치하려면 Mac Mini를 사야 하나요?">
    아니요. OpenClaw는 macOS 또는 Linux(WSL2를 통한 Windows)에서 실행됩니다. Mac mini는 선택 사항입니다 - 일부 사람들은 상시 운영 호스트로 하나를 구입하지만 소형 VPS, 홈 서버 또는 Raspberry Pi급 박스도 작동합니다.

    **macOS 전용 도구**에만 Mac이 필요합니다. iMessage의 경우 [BlueBubbles](/channels/bluebubbles)(권장)를 사용하십시오 - BlueBubbles 서버는 모든 Mac에서 실행되며 게이트웨이는 Linux 또는 다른 곳에서 실행할 수 있습니다. 다른 macOS 전용 도구를 원하면 Mac에서 게이트웨이를 실행하거나 macOS 노드를 페어링하십시오.

    문서: [BlueBubbles](/channels/bluebubbles), [노드](/nodes/), [Mac 원격 모드](/platforms/mac/remote).

  </Accordion>

  <Accordion title="iMessage 지원을 위해 Mac mini가 필요한가요?">
    Messages에 로그인된 **일부 macOS 기기**가 필요합니다. Mac mini일 필요는 **없습니다** - 모든 Mac이 작동합니다. iMessage에는 **[BlueBubbles](/channels/bluebubbles) 사용**(권장) - BlueBubbles 서버는 macOS에서 실행되며 게이트웨이는 Linux 또는 다른 곳에서 실행할 수 있습니다.

    일반적인 설정:

    - Linux/VPS에서 게이트웨이를 실행하고 Messages에 로그인된 모든 Mac에서 BlueBubbles 서버를 실행합니다.
    - 가장 간단한 단일 머신 설정을 원하면 Mac에서 모든 것을 실행합니다.

    문서: [BlueBubbles](/channels/bluebubbles), [노드](/nodes/),
    [Mac 원격 모드](/platforms/mac/remote).

  </Accordion>

  <Accordion title="OpenClaw를 실행하기 위해 Mac mini를 구입한 경우 MacBook Pro에 연결할 수 있나요?">
    예. **Mac mini가 게이트웨이를 실행**할 수 있고 MacBook Pro는 **노드**(동반 기기)로 연결할 수 있습니다. 노드는 게이트웨이를 실행하지 않습니다 - 화면/카메라/canvas 및 해당 기기에서의 `system.run`과 같은 추가 기능을 제공합니다.

    일반적인 패턴:

    - Mac mini의 게이트웨이(상시 운영).
    - MacBook Pro는 macOS 앱 또는 노드 호스트를 실행하고 게이트웨이에 페어링합니다.
    - `openclaw nodes status` / `openclaw nodes list`를 사용하여 확인합니다.

    문서: [노드](/nodes/), [노드 CLI](/cli/nodes).

  </Accordion>

  <Accordion title="Bun을 사용할 수 있나요?">
    Bun은 **권장되지 않습니다**. 특히 WhatsApp 및 Telegram에서 런타임 버그가 발견됩니다. 안정적인 게이트웨이에는 **Node**를 사용하십시오.

    그래도 Bun을 실험하려면 WhatsApp/Telegram 없이 비 프로덕션 게이트웨이에서 하십시오.

  </Accordion>

  <Accordion title="Telegram: allowFrom에 무엇이 들어가나요?">
    `channels.telegram.allowFrom`은 **사람 발신자의 Telegram 사용자 ID**(숫자)입니다. 봇 사용자 이름이 아닙니다.

    설정은 숫자 사용자 ID만 요청합니다. 설정에 이미 레거시 `@username` 항목이 있는 경우 `openclaw doctor --fix`가 이를 해결하려고 시도할 수 있습니다.

    더 안전함 (타사 봇 없음):

    - 봇에 DM을 보낸 다음 `openclaw logs --follow`를 실행하고 `from.id`를 읽으십시오.

    공식 Bot API:

    - 봇에 DM을 보낸 다음 `https://api.telegram.org/bot<bot_token>/getUpdates`를 호출하고 `message.from.id`를 읽으십시오.

    타사 (덜 비공개):

    - `@userinfobot` 또는 `@getidsbot`에 DM을 보냅니다.

    [/channels/telegram](/channels/telegram#access-control-and-activation)을 참조하십시오.

  </Accordion>

  <Accordion title="여러 사람이 다른 OpenClaw 인스턴스로 하나의 WhatsApp 번호를 사용할 수 있나요?">
    예, **멀티 에이전트 라우팅**을 통해. 각 발신자의 WhatsApp **DM**(피어 `kind: "direct"`, E.164와 같은 발신자 `+15551234567`)을 다른 `agentId`에 바인딩하여 각 사람이 자신의 워크스페이스와 세션 저장소를 갖도록 합니다. 답변은 여전히 **동일한 WhatsApp 계정**에서 오며 DM 접근 제어(`channels.whatsapp.dmPolicy` / `channels.whatsapp.allowFrom`)는 WhatsApp 계정별로 전역입니다. [멀티 에이전트 라우팅](/concepts/multi-agent) 및 [WhatsApp](/channels/whatsapp)을 참조하십시오.
  </Accordion>

  <Accordion title='"빠른 채팅" 에이전트와 "코딩용 Opus" 에이전트를 실행할 수 있나요?'>
    예. 멀티 에이전트 라우팅을 사용하십시오: 각 에이전트에 자체 기본 모델을 제공한 다음 인바운드 경로(프로바이더 계정 또는 특정 피어)를 각 에이전트에 바인딩하십시오. 예제 설정은 [멀티 에이전트 라우팅](/concepts/multi-agent)에 있습니다. [모델](/concepts/models) 및 [구성](/gateway/configuration)도 참조하십시오.
  </Accordion>

  <Accordion title="Linux에서 Homebrew가 작동하나요?">
    예. Homebrew는 Linux(Linuxbrew)를 지원합니다. 빠른 설정:

    ```bash
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    echo 'eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"' >> ~/.profile
    eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"
    brew install <formula>
    ```

    systemd를 통해 OpenClaw를 실행하는 경우 서비스 PATH에 `/home/linuxbrew/.linuxbrew/bin`(또는 brew 접두사)이 포함되어 있는지 확인하여 `brew`로 설치된 도구가 비 로그인 셸에서 해결되도록 하십시오.
    최근 빌드는 또한 Linux systemd 서비스에 일반적인 사용자 bin 디렉토리(예: `~/.local/bin`, `~/.npm-global/bin`, `~/.local/share/pnpm`, `~/.bun/bin`)를 앞에 추가하고 설정된 경우 `PNPM_HOME`, `NPM_CONFIG_PREFIX`, `BUN_INSTALL`, `VOLTA_HOME`, `ASDF_DATA_DIR`, `NVM_DIR`, `FNM_DIR`을 존중합니다.

  </Accordion>

  <Accordion title="해킹 가능한 git 설치와 npm 설치의 차이점">
    - **해킹 가능한(git) 설치:** 전체 소스 체크아웃, 편집 가능, 기여자에게 가장 좋음.
      로컬에서 빌드를 실행하고 코드/문서를 패치할 수 있습니다.
    - **npm 설치:** 전역 CLI 설치, 리포 없음, "그냥 실행" 용도로 가장 좋음.
      업데이트는 npm dist-tag에서 제공됩니다.

    문서: [시작하기](/start/getting-started), [업데이트하기](/install/updating).

  </Accordion>

  <Accordion title="나중에 npm과 git 설치 사이를 전환할 수 있나요?">
    예. 다른 버전을 설치한 다음 Doctor를 실행하여 게이트웨이 서비스가 새 진입점을 가리키도록 하십시오. 이는 **데이터를 삭제하지 않습니다** - OpenClaw 코드 설치만 변경합니다. 상태(`~/.openclaw`)와 워크스페이스(`~/.openclaw/workspace`)는 그대로 유지됩니다.

    npm에서 git으로:

    ```bash
    git clone https://github.com/openclaw/openclaw.git
    cd openclaw
    pnpm install
    pnpm build
    openclaw doctor
    openclaw gateway restart
    ```

    git에서 npm으로:

    ```bash
    npm install -g openclaw@latest
    openclaw doctor
    openclaw gateway restart
    ```

    Doctor는 게이트웨이 서비스 진입점 불일치를 감지하고 현재 설치와 일치하도록 서비스 설정을 다시 작성하도록 제안합니다(자동화에서는 `--repair` 사용).

    백업 팁: [백업 전략](#where-things-live-on-disk)을 참조하십시오.

  </Accordion>

  <Accordion title="게이트웨이를 노트북에서 실행해야 하나요, VPS에서 실행해야 하나요?">
    짧은 답: **24/7 안정성을 원하면 VPS를 사용하십시오**. 마찰이 가장 적고 절전/재시작이 괜찮으면 로컬에서 실행하십시오.

    **노트북 (로컬 게이트웨이)**

    - **장점:** 서버 비용 없음, 로컬 파일에 직접 접근, 라이브 브라우저 창.
    - **단점:** 절전/네트워크 끊김 = 연결 해제, OS 업데이트/재부팅이 중단, 계속 깨어 있어야 함.

    **VPS / 클라우드**

    - **장점:** 상시 운영, 안정적인 네트워크, 노트북 절전 문제 없음, 실행 유지 용이.
    - **단점:** 종종 헤드리스로 실행(스크린샷 사용), 원격 파일 접근만 가능, 업데이트를 위해 SSH 필요.

    **OpenClaw 특정 참고 사항:** WhatsApp/Telegram/Slack/Mattermost/Discord는 모두 VPS에서 잘 작동합니다. 유일한 실제 트레이드오프는 **헤드리스 브라우저**와 표시되는 창입니다. [브라우저](/tools/browser)를 참조하십시오.

    **권장 기본값:** 이전에 게이트웨이 연결 해제가 있었다면 VPS. Mac을 적극적으로 사용 중이고 로컬 파일 접근이나 표시되는 브라우저로 UI 자동화를 원한다면 로컬이 좋습니다.

  </Accordion>

  <Accordion title="전용 머신에서 OpenClaw를 실행하는 것이 얼마나 중요한가요?">
    필수는 아니지만 **안정성과 격리를 위해 권장됩니다**.

    - **전용 호스트 (VPS/Mac mini/Pi):** 상시 운영, 절전/재부팅 중단 감소, 깨끗한 권한, 실행 유지 용이.
    - **공유 노트북/데스크톱:** 테스트 및 활성 사용에는 완전히 괜찮지만 머신이 절전 또는 업데이트될 때 일시 중지가 예상됨.

    두 세계 모두의 장점을 원하면 게이트웨이를 전용 호스트에 유지하고 노트북을 로컬 화면/카메라/exec 도구를 위한 **노드**로 페어링하십시오. [노드](/nodes/)를 참조하십시오.
    보안 지침은 [보안](/gateway/security/)을 읽으십시오.

  </Accordion>

  <Accordion title="최소 VPS 요구 사항 및 권장 OS는 무엇인가요?">
    OpenClaw는 경량입니다. 기본 게이트웨이 + 하나의 채팅 채널:

    - **절대 최소:** 1 vCPU, 1GB RAM, ~500MB 디스크.
    - **권장:** 여유 공간(로그, 미디어, 여러 채널)을 위해 1-2 vCPU, 2GB RAM 이상. 노드 도구와 브라우저 자동화는 리소스가 많이 필요할 수 있습니다.

    OS: **Ubuntu LTS**(또는 모든 최신 Debian/Ubuntu)를 사용하십시오. Linux 설치 경로가 거기서 가장 잘 테스트됩니다.

    문서: [Linux](/platforms/linux), [VPS 호스팅](/vps).

  </Accordion>

  <Accordion title="VM에서 OpenClaw를 실행할 수 있으며 요구 사항은 무엇인가요?">
    예. VM을 VPS와 동일하게 처리하십시오: 상시 운영되고, 접근 가능하며, 활성화된 채널과 게이트웨이를 위한 충분한 RAM이 필요합니다.

    기준 가이드:

    - **절대 최소:** 1 vCPU, 1GB RAM.
    - **권장:** 여러 채널, 브라우저 자동화 또는 미디어 도구를 실행하는 경우 2GB RAM 이상.
    - **OS:** Ubuntu LTS 또는 다른 최신 Debian/Ubuntu.

    Windows에 있는 경우 **WSL2가 가장 쉬운 VM 스타일 설정**이며 가장 좋은 도구 호환성을 제공합니다. [Windows](/platforms/windows), [VPS 호스팅](/vps)을 참조하십시오.
    macOS를 VM에서 실행하는 경우 [macOS VM](/install/macos-vm)을 참조하십시오.

  </Accordion>
</AccordionGroup>

## 관련

- [FAQ](/help/faq) — 메인 FAQ (모델, 세션, 게이트웨이, 보안 등)
- [설치 개요](/install/)
- [시작하기](/start/getting-started)
- [문제 해결](/help/troubleshooting)
