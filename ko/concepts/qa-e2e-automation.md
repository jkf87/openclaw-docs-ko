---
summary: "qa-lab, qa-channel, 시드된 시나리오 및 프로토콜 리포트를 위한 비공개 QA 자동화 형태"
read_when:
  - qa-lab 또는 qa-channel을 확장할 때
  - repo 기반 QA 시나리오를 추가할 때
  - Gateway 대시보드 주변에서 더 높은 현실성의 QA 자동화를 구축할 때
title: "QA E2E 자동화"
---

비공개 QA 스택은 단일 유닛 테스트보다 더 현실적이고 채널 형태(channel-shaped)에 가까운 방식으로 OpenClaw를 실행하기 위한 것입니다.

현재 구성 요소:

- `extensions/qa-channel`: DM, 채널, 스레드, 반응(reaction), 편집(edit), 삭제(delete) 표면을 가진 합성 메시지 채널입니다.
- `extensions/qa-lab`: 트랜스크립트 관찰, 인바운드 메시지 주입, Markdown 리포트 내보내기를 위한 디버거 UI 및 QA 버스(bus)입니다.
- `qa/`: 킥오프 태스크 및 기준(baseline) QA 시나리오를 위한 repo 기반 시드(seed) 에셋입니다.

현재 QA 운영자 플로우는 2-페인(pane) QA 사이트입니다:

- 왼쪽: 에이전트가 있는 Gateway 대시보드(Control UI).
- 오른쪽: Slack과 유사한 트랜스크립트와 시나리오 계획을 표시하는 QA Lab.

다음으로 실행하십시오:

```bash
pnpm qa:lab:up
```

이 명령은 QA 사이트를 빌드하고, Docker 기반 gateway 레인(lane)을 시작하며, 운영자 또는 자동화 루프가 에이전트에게 QA 미션을 부여하고, 실제 채널 동작을 관찰하며, 성공한 것, 실패한 것, 또는 차단된 채 남아있는 것을 기록할 수 있도록 QA Lab 페이지를 노출합니다.

매번 Docker 이미지를 다시 빌드하지 않고 더 빠른 QA Lab UI 반복을 위해서는 bind-mount된 QA Lab 번들로 스택을 시작하십시오:

```bash
pnpm openclaw qa docker-build-image
pnpm qa:lab:build
pnpm qa:lab:up:fast
pnpm qa:lab:watch
```

`qa:lab:up:fast`는 Docker 서비스를 prebuilt 이미지 상태로 유지하고 `extensions/qa-lab/web/dist`를 `qa-lab` 컨테이너에 bind-mount합니다. `qa:lab:watch`는 변경 시 해당 번들을 다시 빌드하며, QA Lab 에셋 해시가 변경되면 브라우저가 자동으로 다시 로드됩니다.

transport-real Matrix smoke 레인(lane)을 실행하려면:

```bash
pnpm openclaw qa matrix
```

이 레인은 Docker에서 일회성 Tuwunel 홈서버(homeserver)를 프로비저닝하고, 임시 driver, SUT, observer 사용자를 등록하며, 하나의 비공개 room을 생성한 후, QA gateway 자식 프로세스 내부에서 실제 Matrix 플러그인을 실행합니다. 라이브 transport 레인은 자식 구성을 테스트 중인 transport에만 국한시키므로, Matrix는 자식 구성에서 `qa-channel` 없이 실행됩니다. 선택된 Matrix QA 출력 디렉터리에 구조화된 리포트 아티팩트와 결합된 stdout/stderr 로그를 기록합니다. 외부 `scripts/run-node.mjs` 빌드/런처 출력도 캡처하려면, `OPENCLAW_RUN_NODE_OUTPUT_LOG=<path>`를 repo-local 로그 파일로 설정하십시오.

transport-real Telegram smoke 레인을 실행하려면:

```bash
pnpm openclaw qa telegram
```

이 레인은 일회성 서버를 프로비저닝하는 대신 하나의 실제 비공개 Telegram 그룹을 대상으로 합니다. `OPENCLAW_QA_TELEGRAM_GROUP_ID`, `OPENCLAW_QA_TELEGRAM_DRIVER_BOT_TOKEN`, `OPENCLAW_QA_TELEGRAM_SUT_BOT_TOKEN`이 필요하며, 동일한 비공개 그룹에 두 개의 구별되는 봇(bot)이 있어야 합니다. SUT 봇은 Telegram username을 가져야 하며, bot-to-bot 관찰은 두 봇 모두 `@BotFather`에서 Bot-to-Bot Communication Mode가 활성화되었을 때 가장 잘 작동합니다.
이 명령은 시나리오가 하나라도 실패하면 non-zero로 종료합니다. 실패한 종료 코드 없이 아티팩트를 원할 때는 `--allow-failures`를 사용하십시오.
Telegram 리포트 및 요약은 canary부터 시작하여, driver 메시지 전송 요청으로부터 관찰된 SUT 응답까지의 per-reply RTT를 포함합니다.

transport-real Discord smoke 레인을 실행하려면:

```bash
pnpm openclaw qa discord
```

이 레인은 두 개의 봇이 있는 하나의 실제 비공개 Discord 길드(guild) 채널을 대상으로 합니다: 하니스(harness)가 제어하는 driver 봇과, 번들된 Discord 플러그인을 통해 자식 OpenClaw gateway가 시작하는 SUT 봇입니다. env 자격 증명을 사용할 때는 `OPENCLAW_QA_DISCORD_GUILD_ID`, `OPENCLAW_QA_DISCORD_CHANNEL_ID`, `OPENCLAW_QA_DISCORD_DRIVER_BOT_TOKEN`, `OPENCLAW_QA_DISCORD_SUT_BOT_TOKEN`, 그리고 `OPENCLAW_QA_DISCORD_SUT_APPLICATION_ID`가 필요합니다.
이 레인은 채널 mention 처리를 검증하고, SUT 봇이 Discord에 네이티브 `/help` 명령을 등록했는지 확인합니다.
이 명령은 시나리오가 하나라도 실패하면 non-zero로 종료합니다. 실패한 종료 코드 없이 아티팩트를 원할 때는 `--allow-failures`를 사용하십시오.

이제 라이브 transport 레인은 각자 자체 시나리오 리스트 형태를 만드는 대신 하나의 더 작은 contract를 공유합니다:

`qa-channel`은 광범위한 합성 product-behavior 스위트로 남아있으며 라이브 transport 커버리지 매트릭스의 일부가 아닙니다.

| Lane     | Canary | Mention gating | Allowlist block | Top-level reply | Restart resume | Thread follow-up | Thread isolation | Reaction observation | Help command | Native command registration |
| -------- | ------ | -------------- | --------------- | --------------- | -------------- | ---------------- | ---------------- | -------------------- | ------------ | --------------------------- |
| Matrix   | x      | x              | x               | x               | x              | x                | x                | x                    |              |                             |
| Telegram | x      | x              |                 |                 |                |                  |                  |                      | x            |                             |
| Discord  | x      | x              |                 |                 |                |                  |                  |                      |              | x                           |

이는 `qa-channel`을 광범위한 product-behavior 스위트로 유지하는 동시에 Matrix, Telegram, 그리고 향후 라이브 transport들이 하나의 명시적인 transport-contract 체크리스트를 공유하도록 합니다.

Docker를 QA 경로에 끌어들이지 않고 일회성 Linux VM 레인을 실행하려면:

```bash
pnpm openclaw qa suite --runner multipass --scenario channel-chat-baseline
```

이 명령은 새로운 Multipass 게스트를 부팅하고, 의존성을 설치하고, 게스트 내부에서 OpenClaw를 빌드하고, `qa suite`를 실행한 다음, 일반 QA 리포트와 요약을 호스트의 `.artifacts/qa-e2e/...`로 복사해 돌려놓습니다.
호스트의 `qa suite`와 동일한 시나리오 선택 동작을 재사용합니다.
호스트 및 Multipass 스위트 실행은 기본적으로 격리된 gateway 워커로 선택된 여러 시나리오를 병렬로 실행합니다. `qa-channel`은 기본 동시성(concurrency) 4이며, 선택된 시나리오 수에 의해 상한이 결정됩니다. 워커 수를 조정하려면 `--concurrency <count>`를, 직렬(serial) 실행을 원하면 `--concurrency 1`을 사용하십시오.
이 명령은 시나리오가 하나라도 실패하면 non-zero로 종료합니다. 실패한 종료 코드 없이 아티팩트를 원할 때는 `--allow-failures`를 사용하십시오.
라이브 실행은 게스트에 실용적인 지원되는 QA auth 입력을 포워딩합니다: env 기반 provider 키, QA 라이브 provider config 경로, 그리고 존재할 경우 `CODEX_HOME`입니다. 게스트가 마운트된 워크스페이스를 통해 다시 쓸 수 있도록 `--output-dir`은 repo 루트 아래로 유지하십시오.

## Repo 기반 시드(seeds)

시드 에셋은 `qa/`에 있습니다:

- `qa/scenarios/index.md`
- `qa/scenarios/<theme>/*.md`

QA 계획이 사람과 에이전트 모두에게 보이도록 의도적으로 git에 포함되어 있습니다.

`qa-lab`은 범용 markdown 러너(runner)로 유지되어야 합니다. 각 시나리오 markdown 파일은 하나의 테스트 실행에 대한 진실 공급원(source of truth)이며 다음을 정의해야 합니다:

- 시나리오 메타데이터
- 선택적 카테고리, 역량(capability), 레인, 리스크 메타데이터
- 문서(docs) 및 코드 참조
- 선택적 플러그인 요구사항
- 선택적 gateway config 패치
- 실행 가능한 `qa-flow`

`qa-flow`를 뒷받침하는 재사용 가능한 런타임 표면은 범용적이고 cross-cutting한 채로 유지되어도 됩니다. 예를 들어, markdown 시나리오는 transport-side 헬퍼와, 특수 케이스 러너를 추가하지 않고 Gateway `browser.request` 시임(seam)을 통해 내장된 Control UI를 구동하는 브라우저 측 헬퍼를 결합할 수 있습니다.

시나리오 파일은 소스 트리 폴더보다는 제품 역량(product capability)으로 그룹화해야 합니다. 파일이 이동해도 시나리오 ID를 안정적으로 유지하십시오; 구현 추적성(traceability)을 위해 `docsRefs` 및 `codeRefs`를 사용하십시오.

기준(baseline) 리스트는 다음을 커버할 만큼 충분히 광범위하게 유지되어야 합니다:

- DM 및 채널 채팅
- 스레드 동작
- 메시지 액션 라이프사이클
- cron 콜백
- 메모리 recall
- 모델 전환
- 서브에이전트(subagent) 핸드오프
- repo 읽기 및 docs 읽기
- Lobster Invaders 같은 작은 빌드 태스크 하나

## Provider 모의(mock) 레인

`qa suite`에는 두 개의 로컬 provider 모의 레인이 있습니다:

- `mock-openai`는 시나리오 인식(scenario-aware) OpenClaw 모의입니다. repo 기반 QA 및 패리티(parity) 게이트를 위한 기본 결정론적(deterministic) 모의 레인으로 유지됩니다.
- `aimock`은 실험적 프로토콜, 픽스처(fixture), 기록/재생(record/replay), 카오스(chaos) 커버리지를 위해 AIMock 기반 provider 서버를 시작합니다. 이는 부가적(additive)이며 `mock-openai` 시나리오 디스패처를 대체하지 않습니다.

Provider-레인 구현은 `extensions/qa-lab/src/providers/` 아래에 있습니다. 각 provider는 자체 기본값, 로컬 서버 시작, gateway 모델 구성, auth-profile 스테이징(staging) 필요사항, 라이브/모의 역량(capability) 플래그를 소유합니다. 공유되는 suite 및 gateway 코드는 provider 이름으로 분기하지 않고 provider 레지스트리를 통해 라우팅해야 합니다.

## Transport 어댑터

`qa-lab`은 markdown QA 시나리오를 위한 범용 transport 시임(seam)을 소유합니다. `qa-channel`은 해당 시임에서의 첫 번째 어댑터이지만, 설계 목표는 더 넓습니다: 향후 실제 또는 합성 채널은 transport-specific QA 러너를 추가하는 대신 동일한 suite 러너에 연결되어야 합니다.

아키텍처 수준에서, 분리는 다음과 같습니다:

- `qa-lab`은 범용 시나리오 실행, 워커 동시성, 아티팩트 쓰기, 리포팅을 소유합니다.
- transport 어댑터는 gateway config, 준비 상태(readiness), 인바운드 및 아웃바운드 관찰, transport 액션, 그리고 정규화된 transport 상태를 소유합니다.
- `qa/scenarios/` 아래의 markdown 시나리오 파일은 테스트 실행을 정의합니다; `qa-lab`은 이를 실행하는 재사용 가능한 런타임 표면을 제공합니다.

새 채널 어댑터에 대한 maintainer 대상 채택 가이드는 [Testing](/help/testing#adding-a-channel-to-qa)에 있습니다.

## 리포팅

`qa-lab`은 관찰된 버스(bus) 타임라인에서 Markdown 프로토콜 리포트를 내보냅니다. 리포트는 다음에 답해야 합니다:

- 무엇이 동작했는가
- 무엇이 실패했는가
- 무엇이 차단된 채 남아있는가
- 어떤 후속 시나리오를 추가할 가치가 있는가

캐릭터 및 스타일 검증을 위해서는, 동일한 시나리오를 여러 라이브 모델 참조(ref)에 걸쳐 실행하고 judged Markdown 리포트를 작성하십시오:

```bash
pnpm openclaw qa character-eval \
  --model openai/gpt-5.4,thinking=medium,fast \
  --model openai/gpt-5.2,thinking=xhigh \
  --model openai/gpt-5,thinking=xhigh \
  --model anthropic/claude-opus-4-6,thinking=high \
  --model anthropic/claude-sonnet-4-6,thinking=high \
  --model zai/glm-5.1,thinking=high \
  --model moonshot/kimi-k2.5,thinking=high \
  --model google/gemini-3.1-pro-preview,thinking=high \
  --judge-model openai/gpt-5.4,thinking=xhigh,fast \
  --judge-model anthropic/claude-opus-4-6,thinking=high \
  --blind-judge-models \
  --concurrency 16 \
  --judge-concurrency 16
```

이 명령은 Docker가 아닌 로컬 QA gateway 자식 프로세스를 실행합니다. 캐릭터 eval 시나리오는 `SOUL.md`를 통해 페르소나를 설정한 다음, 채팅, 워크스페이스 도움말, 작은 파일 태스크와 같은 일반 user 턴을 실행해야 합니다. 후보 모델(candidate model)에게 평가받고 있다는 사실을 알려서는 안 됩니다. 이 명령은 각 전체 트랜스크립트를 보존하고, 기본 run stats를 기록한 다음, 지원되는 경우 `xhigh` reasoning과 fast 모드로 judge 모델에게 실행들을 자연스러움(naturalness), vibe, humor로 순위를 매겨 달라고 요청합니다.
provider를 비교할 때는 `--blind-judge-models`를 사용하십시오: judge 프롬프트는 여전히 모든 트랜스크립트와 run status를 받지만, 후보 ref는 `candidate-01`과 같은 중립 레이블로 대체됩니다; 리포트는 파싱 후 순위를 실제 ref로 다시 매핑합니다.
후보 실행은 기본적으로 `high` thinking을 사용하며, GPT-5.4는 `medium`, 지원하는 older OpenAI eval ref는 `xhigh`를 사용합니다. 특정 후보를 인라인으로 오버라이드하려면 `--model provider/model,thinking=<level>`을 사용하십시오. `--thinking <level>`은 여전히 글로벌 폴백을 설정하며, 이전의 `--model-thinking <provider/model=level>` 형식도 호환성을 위해 유지됩니다.
OpenAI 후보 ref는 provider가 지원하는 경우 priority processing을 사용하도록 기본적으로 fast 모드입니다. 단일 후보 또는 judge가 오버라이드를 필요로 할 때는 `,fast`, `,no-fast`, 또는 `,fast=false`를 인라인으로 추가하십시오. 모든 후보 모델에 대해 fast 모드를 강제로 켜고 싶을 때만 `--fast`를 전달하십시오. 후보와 judge 소요 시간은 벤치마크 분석을 위해 리포트에 기록되지만, judge 프롬프트는 속도로 순위를 매기지 말라고 명시적으로 말합니다.
후보 및 judge 모델 실행은 모두 기본적으로 동시성 16입니다. Provider 한도나 로컬 gateway 압박으로 실행이 너무 시끄러울 때는 `--concurrency` 또는 `--judge-concurrency`를 낮추십시오.
후보 `--model`이 전달되지 않으면 캐릭터 eval은 기본적으로 `openai/gpt-5.4`, `openai/gpt-5.2`, `openai/gpt-5`, `anthropic/claude-opus-4-6`, `anthropic/claude-sonnet-4-6`, `zai/glm-5.1`, `moonshot/kimi-k2.5`, `google/gemini-3.1-pro-preview`를 사용합니다.
`--judge-model`이 전달되지 않으면 judge는 기본적으로 `openai/gpt-5.4,thinking=xhigh,fast`와 `anthropic/claude-opus-4-6,thinking=high`를 사용합니다.

## 관련 문서

- [Testing](/help/testing)
- [QA Channel](/channels/qa-channel)
- [대시보드](/web/dashboard)
