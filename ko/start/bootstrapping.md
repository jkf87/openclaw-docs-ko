---
summary: "워크스페이스 및 신원 파일을 초기화하는 에이전트 부트스트랩 의식"
read_when:
  - 첫 에이전트 실행 시 발생하는 동작 파악
  - 부트스트랩 파일의 위치 설명
  - 온보딩 신원 설정 디버깅
title: "에이전트 부트스트랩"
sidebarTitle: "부트스트랩"
---

# 에이전트 부트스트랩

부트스트랩은 에이전트 워크스페이스를 준비하고 신원 정보를 수집하는 **최초 실행** 의식입니다. 온보딩 이후 에이전트가 처음 시작될 때 실행됩니다.

## 부트스트랩이 수행하는 작업

첫 에이전트 실행 시 OpenClaw는 워크스페이스(기본값 `~/.openclaw/workspace`)를 부트스트랩합니다:

- `AGENTS.md`, `BOOTSTRAP.md`, `IDENTITY.md`, `USER.md`를 초기화합니다.
- 짧은 Q&A 의식을 실행합니다(한 번에 하나의 질문).
- 신원 및 기본 설정을 `IDENTITY.md`, `USER.md`, `SOUL.md`에 기록합니다.
- 완료 후 `BOOTSTRAP.md`를 제거하여 한 번만 실행되도록 합니다.

## 실행 위치

부트스트랩은 항상 **게이트웨이 호스트**에서 실행됩니다. macOS 앱이 원격 Gateway에 연결되는 경우, 워크스페이스 및 부트스트랩 파일은 해당 원격 머신에 저장됩니다.

<Note>
Gateway가 다른 머신에서 실행 중인 경우, 게이트웨이 호스트(예: `user@gateway-host:~/.openclaw/workspace`)에서 워크스페이스 파일을 편집하십시오.
</Note>

## 관련 문서

- macOS 앱 온보딩: [온보딩](/start/onboarding)
- 워크스페이스 구조: [에이전트 워크스페이스](/concepts/agent-workspace)
