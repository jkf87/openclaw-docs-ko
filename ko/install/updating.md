---
summary: "OpenClaw 안전하게 업데이트 (전역 설치 또는 소스) 및 롤백 전략"
read_when:
  - OpenClaw 업데이트 중인 경우
  - 업데이트 후 문제가 발생한 경우
title: "업데이트"
---

# 업데이트

OpenClaw를 최신 상태로 유지합니다.

## 권장: `openclaw update`

가장 빠른 업데이트 방법입니다. 설치 유형(npm 또는 git)을 감지하고, 최신 버전을 가져와 `openclaw doctor`를 실행한 다음 게이트웨이를 재시작합니다.

```bash
openclaw update
```

채널을 전환하거나 특정 버전을 대상으로 하는 경우:

```bash
openclaw update --channel beta
openclaw update --tag main
openclaw update --dry-run   # 적용하지 않고 미리 보기
```

`--channel beta`는 베타를 선호하지만, 베타 태그가 없거나 최신 안정 릴리즈보다 오래된 경우 런타임은 stable/latest로 대체됩니다. 일회성 패키지 업데이트를 위해 npm 베타 dist-tag를 원하는 경우 `--tag beta`를 사용합니다.

채널 의미론은 [개발 채널](/install/development-channels)을 참조하십시오.

## 대안: 설치 프로그램 재실행

```bash
curl -fsSL https://openclaw.ai/install.sh | bash
```

온보딩을 건너뛰려면 `--no-onboard`를 추가합니다. 소스 설치의 경우 `--install-method git --no-onboard`를 전달합니다.

## 대안: 수동 npm, pnpm 또는 bun

```bash
npm i -g openclaw@latest
```

```bash
pnpm add -g openclaw@latest
```

```bash
bun add -g openclaw@latest
```

## 자동 업데이트

자동 업데이트는 기본적으로 꺼져 있습니다. `~/.openclaw/openclaw.json`에서 활성화합니다:

```json5
{
  update: {
    channel: "stable",
    auto: {
      enabled: true,
      stableDelayHours: 6,
      stableJitterHours: 12,
      betaCheckIntervalHours: 1,
    },
  },
}
```

| 채널     | 동작                                                                                                         |
| -------- | ------------------------------------------------------------------------------------------------------------ |
| `stable` | `stableDelayHours`를 기다린 다음 `stableJitterHours` 동안 결정론적 지터로 적용합니다 (분산 롤아웃).         |
| `beta`   | `betaCheckIntervalHours`마다 확인하고 (기본값: 매시간) 즉시 적용합니다.                                     |
| `dev`    | 자동 적용 없음. `openclaw update`를 수동으로 사용합니다.                                                     |

게이트웨이는 시작 시 업데이트 힌트도 기록합니다 (`update.checkOnStart: false`로 비활성화).

## 업데이트 후

<Steps>

### Doctor 실행

```bash
openclaw doctor
```

구성을 마이그레이션하고, DM 정책을 감사하며, 게이트웨이 상태를 확인합니다. 자세한 내용: [Doctor](/gateway/doctor)

### 게이트웨이 재시작

```bash
openclaw gateway restart
```

### 확인

```bash
openclaw health
```

</Steps>

## 롤백

### 버전 고정 (npm)

```bash
npm i -g openclaw@<version>
openclaw doctor
openclaw gateway restart
```

팁: `npm view openclaw version`으로 현재 게시된 버전을 확인합니다.

### 커밋 고정 (소스)

```bash
git fetch origin
git checkout "$(git rev-list -n 1 --before=\"2026-01-01\" origin/main)"
pnpm install && pnpm build
openclaw gateway restart
```

최신으로 돌아가려면: `git checkout main && git pull`.

## 막힌 경우

- `openclaw doctor`를 다시 실행하고 출력을 주의 깊게 읽습니다.
- 소스 체크아웃에서 `openclaw update --channel dev`를 사용하는 경우 업데이트 프로그램은 필요 시 `pnpm`을 자동으로 부트스트랩합니다. pnpm/corepack 부트스트랩 오류가 표시되면 `pnpm`을 수동으로 설치하거나 (또는 `corepack`을 다시 활성화) 업데이트를 다시 실행합니다.
- 확인: [문제 해결](/gateway/troubleshooting)
- Discord에서 문의: [https://discord.gg/clawd](https://discord.gg/clawd)

## 관련 항목

- [설치 개요](/install) — 모든 설치 방법
- [Doctor](/gateway/doctor) — 업데이트 후 상태 점검
- [마이그레이션](/install/migrating) — 주요 버전 마이그레이션 가이드
