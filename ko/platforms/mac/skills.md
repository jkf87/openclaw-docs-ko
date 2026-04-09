---
summary: "macOS 스킬 설정 UI 및 게이트웨이 지원 상태"
read_when:
  - macOS 스킬 설정 UI 업데이트 시
  - 스킬 게이팅 또는 설치 동작 변경 시
title: "스킬 (macOS)"
---

# 스킬 (macOS)

macOS 앱은 게이트웨이를 통해 OpenClaw 스킬을 표시합니다. 로컬에서 스킬을 파싱하지 않습니다.

## 데이터 소스

- `skills.status` (게이트웨이)는 모든 스킬과 자격 및 누락된 요구 사항을 반환합니다
  (번들 스킬에 대한 허용 목록 차단 포함).
- 요구 사항은 각 `SKILL.md`의 `metadata.openclaw.requires`에서 파생됩니다.

## 설치 작업

- `metadata.openclaw.install`은 설치 옵션 (brew/node/go/uv)을 정의합니다.
- 앱은 `skills.install`을 호출하여 게이트웨이 호스트에서 설치 프로그램을 실행합니다.
- 내장된 위험한 코드 `critical` 발견은 기본적으로 `skills.install`을 차단합니다. 의심스러운 발견은 여전히 경고만 합니다. 위험한 재정의는 게이트웨이 요청에 있지만 기본 앱 흐름은 실패 시 안전하게 유지됩니다.
- 모든 설치 옵션이 `download`인 경우 게이트웨이는 모든 다운로드 선택을 표시합니다.
- 그렇지 않으면 게이트웨이는 현재 설치 기본 설정과 호스트 바이너리를 사용하여 하나의 선호하는 설치 프로그램을 선택합니다: `skills.install.preferBrew`가 활성화되어 있고 `brew`가 있으면 Homebrew를 먼저 사용하고, 그 다음 `uv`, 그 다음 `skills.install.nodeManager`에서 구성된 노드 관리자, 그 다음 `go` 또는 `download`와 같은 대체.
- 노드 설치 레이블은 `yarn`을 포함하여 구성된 노드 관리자를 반영합니다.

## 환경/API 키

- 앱은 `skills.entries.<skillKey>` 아래 `~/.openclaw/openclaw.json`에 키를 저장합니다.
- `skills.update`는 `enabled`, `apiKey`, `env`를 패치합니다.

## 원격 모드

- 설치 + 구성 업데이트는 게이트웨이 호스트에서 발생합니다 (로컬 Mac이 아님).
