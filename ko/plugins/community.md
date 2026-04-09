---
summary: "커뮤니티에서 유지 관리하는 OpenClaw 플러그인: 탐색, 설치, 자신의 플러그인 제출하기"
read_when:
  - 서드파티 OpenClaw 플러그인을 찾고 싶을 때
  - 자신의 플러그인을 게시하거나 목록에 추가하고 싶을 때
title: "커뮤니티 플러그인"
---

# 커뮤니티 플러그인

커뮤니티 플러그인은 새로운 채널, 도구, 프로바이더, 또는 기타 기능으로 OpenClaw를 확장하는
서드파티 패키지입니다. 커뮤니티에서 빌드하고 유지 관리하며, [ClawHub](/tools/clawhub) 또는 npm에
게시되고, 단일 명령으로 설치할 수 있습니다.

ClawHub는 커뮤니티 플러그인의 표준 검색 표면입니다. 검색 가능성을 위해 플러그인을
추가하는 문서 전용 PR을 열지 마십시오; 대신 ClawHub에 게시하십시오.

```bash
openclaw plugins install <package-name>
```

OpenClaw는 먼저 ClawHub를 확인하고 자동으로 npm으로 폴백합니다.

## 목록에 있는 플러그인

### Codex App Server Bridge

Codex App Server 대화를 위한 독립적인 OpenClaw 브리지입니다. 채팅을
Codex 스레드에 바인딩하고 일반 텍스트로 대화하며 재개, 계획, 검토,
모델 선택, 압축 등을 위한 채팅 네이티브 명령으로 제어합니다.

- **npm:** `openclaw-codex-app-server`
- **저장소:** [github.com/pwrdrvr/openclaw-codex-app-server](https://github.com/pwrdrvr/openclaw-codex-app-server)

```bash
openclaw plugins install openclaw-codex-app-server
```

### DingTalk

스트림 모드를 사용하는 엔터프라이즈 로봇 통합입니다. 모든 DingTalk 클라이언트를 통해
텍스트, 이미지, 파일 메시지를 지원합니다.

- **npm:** `@largezhou/ddingtalk`
- **저장소:** [github.com/largezhou/openclaw-dingtalk](https://github.com/largezhou/openclaw-dingtalk)

```bash
openclaw plugins install @largezhou/ddingtalk
```

### Lossless Claw (LCM)

OpenClaw용 무손실 컨텍스트 관리 플러그인입니다. DAG 기반 대화
요약과 증분 압축으로 전체 컨텍스트 충실도를 유지하면서 토큰 사용량을 줄입니다.

- **npm:** `@martian-engineering/lossless-claw`
- **저장소:** [github.com/Martian-Engineering/lossless-claw](https://github.com/Martian-Engineering/lossless-claw)

```bash
openclaw plugins install @martian-engineering/lossless-claw
```

### Opik

에이전트 트레이스를 Opik으로 내보내는 공식 플러그인입니다. 에이전트 동작,
비용, 토큰, 오류 등을 모니터링합니다.

- **npm:** `@opik/opik-openclaw`
- **저장소:** [github.com/comet-ml/opik-openclaw](https://github.com/comet-ml/opik-openclaw)

```bash
openclaw plugins install @opik/opik-openclaw
```

### QQbot

QQ Bot API를 통해 OpenClaw를 QQ에 연결합니다. 개인 채팅, 그룹
언급, 채널 메시지, 음성, 이미지, 동영상, 파일을 포함한 리치 미디어를 지원합니다.

- **npm:** `@tencent-connect/openclaw-qqbot`
- **저장소:** [github.com/tencent-connect/openclaw-qqbot](https://github.com/tencent-connect/openclaw-qqbot)

```bash
openclaw plugins install @tencent-connect/openclaw-qqbot
```

### wecom

Tencent WeCom 팀의 OpenClaw용 WeCom 채널 플러그인입니다. WeCom Bot WebSocket 지속
연결로 구동되며, 직접 메시지 및 그룹 채팅, 스트리밍 답장, 능동적 메시징, 이미지/파일
처리, 마크다운 형식, 내장 액세스 제어, 문서/회의/메시징 스킬을 지원합니다.

- **npm:** `@wecom/wecom-openclaw-plugin`
- **저장소:** [github.com/WecomTeam/wecom-openclaw-plugin](https://github.com/WecomTeam/wecom-openclaw-plugin)

```bash
openclaw plugins install @wecom/wecom-openclaw-plugin
```

## 플러그인 제출하기

유용하고 문서화되어 있으며 안전하게 운영할 수 있는 커뮤니티 플러그인을 환영합니다.

<Steps>
  <Step title="ClawHub 또는 npm에 게시하기">
    플러그인은 `openclaw plugins install \<package-name\>`으로 설치할 수 있어야 합니다.
    [ClawHub](/tools/clawhub)(권장) 또는 npm에 게시하십시오.
    전체 가이드는 [플러그인 빌드하기](/plugins/building-plugins)를 참조하십시오.

  </Step>

  <Step title="GitHub에 호스팅하기">
    소스 코드는 설정 문서와 이슈 트래커가 있는 공개 저장소에 있어야 합니다.

  </Step>

  <Step title="소스 문서 변경에만 문서 PR 사용하기">
    플러그인을 검색 가능하게 만들기 위한 문서 PR은 필요하지 않습니다. 대신 ClawHub에 게시하십시오.

    OpenClaw의 소스 문서에 실제 콘텐츠 변경이 필요한 경우에만 문서 PR을 여십시오.
    예를 들어, 설치 안내를 수정하거나 기본 문서 세트에 포함되어야 하는
    크로스-저장소 문서를 추가하는 경우입니다.

  </Step>
</Steps>

## 품질 기준

| 요구사항                       | 이유                                           |
| ----------------------------- | --------------------------------------------- |
| ClawHub 또는 npm에 게시됨      | 사용자가 `openclaw plugins install`을 사용할 수 있어야 합니다 |
| 공개 GitHub 저장소             | 소스 검토, 이슈 추적, 투명성                  |
| 설정 및 사용 문서              | 사용자가 구성 방법을 알아야 합니다            |
| 활발한 유지 관리               | 최근 업데이트 또는 이슈에 대한 응답           |

낮은 품질의 래퍼, 불명확한 소유권, 또는 유지 관리되지 않는 패키지는 거부될 수 있습니다.

## 관련 문서

- [플러그인 설치 및 구성](/tools/plugin) — 플러그인 설치 방법
- [플러그인 빌드하기](/plugins/building-plugins) — 직접 만들기
- [플러그인 매니페스트](/plugins/manifest) — 매니페스트 스키마
