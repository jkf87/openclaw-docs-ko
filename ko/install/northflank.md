---
summary: "원클릭 템플릿으로 Northflank에 OpenClaw 배포"
read_when:
  - Northflank에서 OpenClaw를 호스팅하려는 경우
  - 서버에 터미널 없이 가장 쉬운 배포 경로를 찾는 경우
title: "Northflank"
---

# Northflank

원클릭 템플릿으로 Northflank에 OpenClaw를 배포하고 웹 Control UI를 통해 접근합니다.
"서버에 터미널 없음" 경로 중 가장 쉬운 방법입니다 — Northflank가 게이트웨이를 대신 실행해 줍니다.

## 시작하는 방법

1. [Deploy OpenClaw](https://northflank.com/stacks/deploy-openclaw) 를 클릭해 템플릿을 엽니다.
2. 계정이 없다면 [Northflank 가입](https://app.northflank.com/signup) 을 진행합니다.
3. **Deploy OpenClaw now** 를 클릭합니다.
4. 필수 환경 변수를 설정합니다: `OPENCLAW_GATEWAY_TOKEN` (강력한 랜덤 값을 사용).
5. **Deploy stack** 을 클릭해 OpenClaw 템플릿을 빌드 및 실행합니다.
6. 배포 완료를 기다린 다음 **View resources** 를 클릭합니다.
7. OpenClaw 서비스를 엽니다.
8. `/openclaw`의 공개 OpenClaw URL을 열고 설정한 공유 시크릿으로 연결합니다. 이 템플릿은 기본적으로 `OPENCLAW_GATEWAY_TOKEN` 을 사용합니다. 비밀번호 인증으로 교체했다면 해당 비밀번호를 사용합니다.

## 제공되는 것

* 호스팅된 OpenClaw Gateway + Control UI
* Northflank Volume(`/data`) 을 통한 영구 저장소 — `openclaw.json`,
  에이전트별 `auth-profiles.json`, 채널/프로바이더 상태, 세션, 워크스페이스가
  재배포 후에도 유지됩니다.

## 채널 연결

`/openclaw`의 Control UI를 사용하거나 SSH를 통해 `openclaw onboard` 를 실행해 채널 설정 방법을 확인합니다:

* [Telegram](/channels/telegram) (가장 빠름 — 봇 토큰만 있으면 됨)
* [Discord](/channels/discord)
* [모든 채널](/channels/)

## 다음 단계

* 메시징 채널 설정: [채널](/channels/)
* 게이트웨이 구성: [게이트웨이 구성](/gateway/configuration)
* OpenClaw 최신 상태 유지: [업데이트](/install/updating)
