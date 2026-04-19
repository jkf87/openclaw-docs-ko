---
summary: "Render에 Infrastructure as Code(Blueprint)로 OpenClaw 배포하기"
read_when:
  - Render에서 OpenClaw Gateway를 호스팅하려는 경우
  - `render.yaml` 블루프린트 구조와 플랜 선택을 이해하려는 경우
title: "Render"
---

# Render

`render.yaml` Blueprint로 Render에 OpenClaw를 Infrastructure as Code로 배포합니다. 서비스, 디스크, 환경 변수를 포함한 전체 스택을 선언적으로 정의하므로 원클릭 배포가 가능하고 인프라를 코드와 함께 버전 관리할 수 있습니다.

## 사전 준비

- [Render 계정](https://render.com) (무료 티어 제공)
- 선호하는 [모델 제공자](/providers/)의 API 키

## Render Blueprint로 배포

[Deploy to Render](https://render.com/deploy?repo=https://github.com/openclaw/openclaw)

이 링크를 클릭하면:

1. 저장소 루트의 `render.yaml` Blueprint에서 새 Render 서비스가 생성됩니다.
2. Docker 이미지를 빌드하고 배포합니다.

배포되면 서비스 URL은 `https://<service-name>.onrender.com` 패턴을 따릅니다.

## Blueprint 이해하기

Render Blueprint는 인프라를 정의하는 YAML 파일입니다. 이 저장소의 `render.yaml`은 OpenClaw 실행에 필요한 모든 것을 구성합니다:

```yaml
services:
  - type: web
    name: openclaw
    runtime: docker
    plan: starter
    healthCheckPath: /health
    envVars:
      - key: OPENCLAW_GATEWAY_PORT
        value: "8080"
      - key: OPENCLAW_STATE_DIR
        value: /data/.openclaw
      - key: OPENCLAW_WORKSPACE_DIR
        value: /data/workspace
      - key: OPENCLAW_GATEWAY_TOKEN
        generateValue: true # 안전한 토큰을 자동 생성
    disk:
      name: openclaw-data
      mountPath: /data
      sizeGB: 1
```

핵심 Blueprint 기능:

| 기능                  | 목적                                                       |
| --------------------- | ---------------------------------------------------------- |
| `runtime: docker`     | 저장소의 Dockerfile로 빌드                                 |
| `healthCheckPath`     | Render가 `/health`를 모니터링하고 비정상 인스턴스를 재시작 |
| `generateValue: true` | 암호학적으로 안전한 값을 자동 생성                         |
| `disk`                | 재배포 후에도 유지되는 영속 스토리지                       |

## 플랜 선택

| 플랜      | 슬립            | 디스크    | 적합한 용도                     |
| --------- | --------------- | --------- | ------------------------------- |
| Free      | 15분 유휴 후    | 사용 불가 | 테스트, 데모                    |
| Starter   | 없음            | 1GB+      | 개인 사용, 소규모 팀            |
| Standard+ | 없음            | 1GB+      | 프로덕션, 다중 채널             |

Blueprint 기본값은 `starter`입니다. 무료 티어를 사용하려면 포크의 `render.yaml`에서 `plan: free`로 변경하세요 (단, 영속 디스크가 없으므로 OpenClaw 상태가 매번 재배포 시 초기화됩니다).

## 배포 후

### Control UI 접근

웹 대시보드는 `https://<your-service>.onrender.com/`에서 사용할 수 있습니다.

설정된 공유 비밀(shared secret)로 연결합니다. 이 배포 템플릿은 `OPENCLAW_GATEWAY_TOKEN`을 자동 생성합니다 (**Dashboard → your service → Environment**에서 확인). 비밀번호 인증으로 바꾸었다면 해당 비밀번호를 사용하세요.

## Render 대시보드 기능

### 로그

**Dashboard → your service → Logs**에서 실시간 로그를 확인합니다. 필터:

- Build 로그 (Docker 이미지 생성)
- Deploy 로그 (서비스 시작)
- Runtime 로그 (애플리케이션 출력)

### 셸 접근

디버깅을 위해 **Dashboard → your service → Shell**로 셸 세션을 엽니다. 영속 디스크는 `/data`에 마운트됩니다.

### 환경 변수

**Dashboard → your service → Environment**에서 변수를 수정합니다. 변경 시 자동 재배포가 트리거됩니다.

### 자동 배포

원본 OpenClaw 저장소를 사용한다면 Render는 자동 배포하지 않습니다. 업데이트하려면 대시보드에서 수동 Blueprint 동기화를 실행하세요.

## 커스텀 도메인

1. **Dashboard → your service → Settings → Custom Domains**로 이동합니다.
2. 도메인을 추가합니다.
3. 지시에 따라 DNS를 구성합니다 (`*.onrender.com`에 대한 CNAME).
4. Render가 TLS 인증서를 자동으로 프로비저닝합니다.

## 스케일링

Render는 수평/수직 스케일링을 지원합니다:

- **수직**: 더 많은 CPU/RAM을 위해 플랜을 변경합니다.
- **수평**: 인스턴스 수를 늘립니다 (Standard 플랜 이상).

OpenClaw에는 일반적으로 수직 스케일링으로 충분합니다. 수평 스케일링에는 sticky session 또는 외부 상태 관리가 필요합니다.

## 백업 및 마이그레이션

Render 대시보드의 셸 접근을 사용해 언제든지 상태, 설정, 인증 프로필, 워크스페이스를 내보낼 수 있습니다:

```bash
openclaw backup create
```

OpenClaw 상태와 설정된 워크스페이스가 포함된 휴대용 백업 아카이브를 생성합니다. 자세한 내용은 [백업](/cli/backup)을 참조하세요.

## 문제 해결

### 서비스가 시작되지 않음

Render Dashboard의 deploy 로그를 확인합니다. 일반적인 문제:

- `OPENCLAW_GATEWAY_TOKEN` 누락 — **Dashboard → Environment**에 설정되어 있는지 확인하세요.
- 포트 불일치 — Gateway가 Render가 기대하는 포트에 바인딩하도록 `OPENCLAW_GATEWAY_PORT=8080`이 설정되어 있는지 확인하세요.

### 느린 콜드 스타트 (무료 티어)

무료 티어 서비스는 15분간 비활성 상태면 스핀다운됩니다. 스핀다운 후 첫 요청은 컨테이너가 시작되는 동안 몇 초가 걸립니다. 상시 실행을 원한다면 Starter 플랜으로 업그레이드하세요.

### 재배포 후 데이터 손실

무료 티어에서 발생합니다 (영속 디스크 없음). 유료 플랜으로 업그레이드하거나 Render 셸에서 `openclaw backup create`로 정기 전체 백업을 내보내세요.

### 헬스 체크 실패

Render는 30초 이내 `/health`에서 200 응답을 기대합니다. 빌드는 성공하는데 배포가 실패한다면 서비스 시작이 너무 오래 걸릴 수 있습니다. 확인:

- 빌드 로그에서 오류
- 컨테이너가 로컬에서 `docker build && docker run`으로 실행되는지

## 다음 단계

- 메시지 채널 설정: [채널](/channels/)
- Gateway 설정: [Gateway 설정](/gateway/configuration)
- OpenClaw 최신 상태 유지: [업데이트](/install/updating)
