---
title: "backup"
description: "`openclaw backup`에 대한 CLI 참조 (로컬 백업 아카이브 생성)"
---

# `openclaw backup`

OpenClaw 상태, 구성, 인증 프로파일, 채널/프로바이더 자격 증명, 세션, 그리고 선택적으로 워크스페이스에 대한 로컬 백업 아카이브를 생성합니다.

```bash
openclaw backup create
openclaw backup create --output ~/Backups
openclaw backup create --dry-run --json
openclaw backup create --verify
openclaw backup create --no-include-workspace
openclaw backup create --only-config
openclaw backup verify ./2026-03-09T00-00-00.000Z-openclaw-backup.tar.gz
```

## 참고사항

- 아카이브에는 확인된 소스 경로와 아카이브 레이아웃이 포함된 `manifest.json` 파일이 포함됩니다.
- 기본 출력은 현재 작업 디렉터리에 타임스탬프가 있는 `.tar.gz` 아카이브입니다.
- 현재 작업 디렉터리가 백업된 소스 트리 내에 있는 경우 OpenClaw는 기본 아카이브 위치로 홈 디렉터리로 폴백합니다.
- 기존 아카이브 파일은 절대로 덮어쓰지 않습니다.
- 소스 상태/워크스페이스 트리 내부의 출력 경로는 자기 포함을 방지하기 위해 거부됩니다.
- `openclaw backup verify &lt;archive&gt;`는 아카이브에 정확히 하나의 루트 매니페스트가 포함되어 있는지 검증하고, 순회 스타일의 아카이브 경로를 거부하며, 모든 매니페스트 선언 페이로드가 tarball에 존재하는지 확인합니다.
- `openclaw backup create --verify`는 아카이브를 작성한 직후 해당 검증을 실행합니다.
- `openclaw backup create --only-config`는 활성 JSON 구성 파일만 백업합니다.

## 백업되는 항목

`openclaw backup create`는 로컬 OpenClaw 설치에서 백업 소스를 계획합니다:

- OpenClaw의 로컬 상태 확인자가 반환하는 상태 디렉터리, 보통 `~/.openclaw`
- 활성 구성 파일 경로
- 상태 디렉터리 외부에 존재하는 경우 확인된 `credentials/` 디렉터리
- `--no-include-workspace`를 전달하지 않는 한 현재 구성에서 발견된 워크스페이스 디렉터리

모델 인증 프로파일은 이미 `agents/&lt;agentId&gt;/agent/auth-profiles.json`의 상태 디렉터리에 포함되어 있으므로 일반적으로 상태 백업 항목에 포함됩니다.

`--only-config`를 사용하면 OpenClaw는 상태, 자격 증명 디렉터리, 워크스페이스 검색을 건너뛰고 활성 구성 파일 경로만 아카이브합니다.

OpenClaw는 아카이브를 빌드하기 전에 경로를 정규화합니다. 구성, 자격 증명 디렉터리, 또는 워크스페이스가 이미 상태 디렉터리 내에 있는 경우 별도의 최상위 백업 소스로 중복되지 않습니다. 누락된 경로는 건너뜁니다.

아카이브 페이로드는 해당 소스 트리의 파일 내용을 저장하며, 내장된 `manifest.json`은 확인된 절대 소스 경로와 각 자산에 사용된 아카이브 레이아웃을 기록합니다.

## 잘못된 구성 동작

`openclaw backup`은 복구 중에도 도움을 줄 수 있도록 의도적으로 일반 구성 사전 검사를 우회합니다. 워크스페이스 검색은 유효한 구성에 의존하므로 `openclaw backup create`는 구성 파일이 존재하지만 유효하지 않고 워크스페이스 백업이 여전히 활성화되어 있는 경우 빠르게 실패합니다.

해당 상황에서 부분 백업을 원하면 다시 실행하세요:

```bash
openclaw backup create --no-include-workspace
```

이렇게 하면 워크스페이스 검색을 완전히 건너뛰면서 상태, 구성, 외부 자격 증명 디렉터리를 범위에 유지합니다.

구성 파일 자체의 복사본만 필요한 경우 `--only-config`는 워크스페이스 검색을 위해 구성 파싱에 의존하지 않으므로 구성이 잘못된 경우에도 작동합니다.

## 크기 및 성능

OpenClaw는 내장된 최대 백업 크기나 파일당 크기 제한을 적용하지 않습니다.

실제적인 제한은 로컬 머신과 대상 파일시스템에서 옵니다:

- 임시 아카이브 쓰기와 최종 아카이브를 위한 사용 가능한 공간
- 대용량 워크스페이스 트리를 순회하고 `.tar.gz`로 압축하는 시간
- `openclaw backup create --verify`를 사용하거나 `openclaw backup verify`를 실행하는 경우 아카이브 재스캔 시간
- 대상 경로에서의 파일시스템 동작. OpenClaw는 덮어쓰지 않는 하드 링크 게시 단계를 선호하며 하드 링크가 지원되지 않는 경우 배타적 복사로 폴백합니다.

대용량 워크스페이스는 일반적으로 아카이브 크기의 주요 원인입니다. 더 작거나 빠른 백업을 원하면 `--no-include-workspace`를 사용하세요.

가장 작은 아카이브를 위해서는 `--only-config`를 사용하세요.
