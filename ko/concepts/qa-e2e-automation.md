---
summary: "qa-lab, qa-channel, 시드된 시나리오, 프로토콜 보고서를 위한 프라이빗 QA 자동화 형태"
read_when:
  - qa-lab 또는 qa-channel 확장 시
  - 리포 기반 QA 시나리오 추가 시
  - 게이트웨이 대시보드 주변에서 고현실감 QA 자동화 구축 시
title: "QA E2E 자동화"
---

# QA E2E 자동화

프라이빗 QA 스택은 단일 단위 테스트가 할 수 있는 것보다 더 현실적인 채널 형태의 방식으로 OpenClaw를 테스트하기 위한 것입니다.

현재 구성 요소:

- `extensions/qa-channel`: DM, 채널, 스레드, 반응, 편집, 삭제 표면이 있는 합성 메시지 채널.
- `extensions/qa-lab`: 트랜스크립트 관찰, 인바운드 메시지 주입, Markdown 보고서 내보내기를 위한 디버거 UI 및 QA 버스.
- `qa/`: 킥오프 태스크 및 기준 QA 시나리오를 위한 리포 기반 시드 에셋.

현재 QA 운영자 흐름은 두 개의 창으로 구성된 QA 사이트입니다:

- 왼쪽: 에이전트가 있는 게이트웨이 대시보드 (Control UI).
- 오른쪽: Slack 형태의 트랜스크립트와 시나리오 계획을 표시하는 QA Lab.

다음으로 실행하십시오:

```bash
pnpm qa:lab:up
```

이는 QA 사이트를 빌드하고, Docker 기반 게이트웨이 레인을 시작하며, 운영자 또는 자동화 루프가 에이전트에게 QA 미션을 줄 수 있는 QA Lab 페이지를 노출합니다. 여기서 실제 채널 동작을 관찰하고 무엇이 작동했는지, 실패했는지, 차단된 상태로 있는지 기록할 수 있습니다.

매번 Docker 이미지를 재빌드하지 않고 더 빠른 QA Lab UI 반복을 위해 bind-mounted QA Lab 번들로 스택을 시작하십시오:

```bash
pnpm openclaw qa docker-build-image
pnpm qa:lab:build
pnpm qa:lab:up:fast
pnpm qa:lab:watch
```

`qa:lab:up:fast`는 Docker 서비스를 사전 빌드된 이미지에 유지하고 `extensions/qa-lab/web/dist`를 `qa-lab` 컨테이너에 bind-mount합니다. `qa:lab:watch`는 변경 시 해당 번들을 재빌드하고 QA Lab 에셋 해시가 변경되면 브라우저가 자동으로 새로 로드됩니다.

## 리포 기반 시드

시드 에셋은 `qa/`에 있습니다:

- `qa/scenarios/index.md`
- `qa/scenarios/*.md`

이는 QA 계획이 사람과 에이전트 모두에게 보이도록 의도적으로 git에 있습니다. 기준 목록은 다음을 커버할 만큼 충분히 넓어야 합니다:

- DM 및 채널 채팅
- 스레드 동작
- 메시지 액션 라이프사이클
- cron 콜백
- 메모리 회상
- 모델 전환
- 서브에이전트 핸드오프
- 리포 읽기 및 문서 읽기
- Lobster Invaders와 같은 작은 빌드 태스크 하나

## 보고

`qa-lab`은 관찰된 버스 타임라인에서 Markdown 프로토콜 보고서를 내보냅니다.
보고서는 다음에 답해야 합니다:

- 무엇이 작동했는가
- 무엇이 실패했는가
- 무엇이 차단된 상태로 있었는가
- 어떤 후속 시나리오를 추가할 가치가 있는가

캐릭터 및 스타일 검사를 위해 여러 라이브 모델 참조에서 동일한 시나리오를 실행하고 판단된 Markdown 보고서를 작성하십시오:

```bash
pnpm openclaw qa character-eval \
  --model openai/gpt-5.4,thinking=xhigh \
  --model openai/gpt-5.2,thinking=xhigh \
  --model anthropic/claude-opus-4-6,thinking=high \
  --model anthropic/claude-sonnet-4-6,thinking=high \
  --model minimax/MiniMax-M2.7,thinking=high \
  --model zai/glm-5.1,thinking=high \
  --model moonshot/kimi-k2.5,thinking=high \
  --model qwen/qwen3.6-plus,thinking=high \
  --model xiaomi/mimo-v2-pro,thinking=high \
  --model google/gemini-3.1-pro-preview,thinking=high \
  --judge-model openai/gpt-5.4,thinking=xhigh,fast \
  --judge-model anthropic/claude-opus-4-6,thinking=high \
  --concurrency 8 \
  --judge-concurrency 8
```

이 커맨드는 Docker가 아닌 로컬 QA 게이트웨이 자식 프로세스를 실행합니다. 캐릭터 평가 시나리오는 `SOUL.md`를 통해 페르소나를 설정한 다음 채팅, 워크스페이스 도움말, 소규모 파일 태스크와 같은 일반 사용자 턴을 실행해야 합니다. 후보 모델에게 평가 중이라고 알려서는 안 됩니다. 이 커맨드는 각 전체 트랜스크립트를 보존하고 기본 실행 통계를 기록한 다음, `xhigh` 추론이 있는 fast 모드로 판사 모델에게 자연스러움, 분위기, 유머를 기준으로 실행을 순위 매기도록 요청합니다.

후보 실행은 기본값으로 `high` thinking을 사용하며, 지원하는 OpenAI 모델에는 `xhigh`를 사용합니다. `--model provider/model,thinking=<level>`로 인라인에서 특정 후보를 오버라이드하십시오. `--thinking <level>`은 여전히 전역 폴백을 설정하며, 이전 `--model-thinking <provider/model=level>` 형식은 호환성을 위해 유지됩니다.

OpenAI 후보 참조는 기본적으로 fast 모드로 설정되어 프로바이더가 지원하는 경우 우선 처리가 사용됩니다. 단일 후보 또는 판사에 오버라이드가 필요한 경우 `,fast`, `,no-fast`, 또는 `,fast=false`를 인라인으로 추가하십시오. 모든 후보 모델에 대해 fast 모드를 강제로 활성화하려는 경우에만 `--fast`를 전달하십시오. 후보 및 판사 실행 시간은 벤치마크 분석을 위해 보고서에 기록되지만, 판사 프롬프트는 속도로 순위를 매기지 말라고 명시적으로 명시합니다.

후보 및 판사 모델 실행은 모두 기본적으로 동시성 8로 설정됩니다. 프로바이더 한도 또는 로컬 게이트웨이 압력으로 인해 실행이 너무 시끄러워지면 `--concurrency` 또는 `--judge-concurrency`를 낮추십시오.

후보 `--model`이 전달되지 않으면 캐릭터 평가는 기본값으로 `openai/gpt-5.4`, `openai/gpt-5.2`, `anthropic/claude-opus-4-6`, `anthropic/claude-sonnet-4-6`, `minimax/MiniMax-M2.7`, `zai/glm-5.1`, `moonshot/kimi-k2.5`, `qwen/qwen3.6-plus`, `xiaomi/mimo-v2-pro`, `google/gemini-3.1-pro-preview`를 사용합니다.

`--judge-model`이 전달되지 않으면 판사는 기본값으로 `openai/gpt-5.4,thinking=xhigh,fast` 및 `anthropic/claude-opus-4-6,thinking=high`를 사용합니다.

## 관련 문서

- [테스팅](/help/testing)
- [QA 채널](/channels/qa-channel)
- [대시보드](/web/dashboard)
