---
summary: "`openclaw dns`에 대한 CLI 참조 (광역 탐색 도우미)"
read_when:
  - Tailscale + CoreDNS를 통한 광역 탐색 (DNS-SD)을 원하는 경우
  - 사용자 정의 탐색 도메인 (예: openclaw.internal)에 대한 분할 DNS 설정 중인 경우
title: "dns"
---

# `openclaw dns`

광역 탐색을 위한 DNS 도우미 (Tailscale + CoreDNS). 현재 macOS + Homebrew CoreDNS에 집중합니다.

관련:

- Gateway 탐색: [탐색](/gateway/discovery)
- 광역 탐색 구성: [구성](/gateway/configuration)

## 설정

```bash
openclaw dns setup
openclaw dns setup --domain openclaw.internal
openclaw dns setup --apply
```

## `dns setup`

유니캐스트 DNS-SD 탐색을 위한 CoreDNS 설정을 계획하거나 적용합니다.

옵션:

- `--domain <domain>`: 광역 탐색 도메인 (예: `openclaw.internal`)
- `--apply`: CoreDNS 구성을 설치 또는 업데이트하고 서비스를 재시작합니다 (sudo 필요; macOS만 해당)

표시 내용:

- 확인된 탐색 도메인
- 존 파일 경로
- 현재 tailnet IP
- 권장 `openclaw.json` 탐색 구성
- 설정할 Tailscale 분할 DNS 네임서버/도메인 값

참고사항:

- `--apply` 없이 명령은 계획 도우미에 불과하며 권장 설정을 출력합니다.
- `--domain`이 생략되면 OpenClaw는 구성의 `discovery.wideArea.domain`을 사용합니다.
- `--apply`는 현재 macOS만 지원하며 Homebrew CoreDNS를 예상합니다.
- `--apply`는 필요한 경우 존 파일을 부트스트랩하고 CoreDNS import 구문이 존재하는지 확인하며 `coredns` brew 서비스를 재시작합니다.
