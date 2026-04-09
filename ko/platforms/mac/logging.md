---
summary: "OpenClaw 로깅: 롤링 진단 파일 로그 + 통합 로그 개인 정보 플래그"
read_when:
  - macOS 로그 캡처 또는 개인 데이터 로깅 조사 시
  - 음성 wake/세션 라이프사이클 문제 디버깅 시
title: "macOS 로깅"
---

# 로깅 (macOS)

## 롤링 진단 파일 로그 (Debug 창)

OpenClaw는 macOS 앱 로그를 swift-log를 통해 라우팅하며 (기본값 통합 로깅), 내구성 있는 캡처가 필요할 때 로컬 회전 파일 로그를 디스크에 쓸 수 있습니다.

- 상세도: **Debug 창 → Logs → App logging → Verbosity**
- 활성화: **Debug 창 → Logs → App logging → "Write rolling diagnostics log (JSONL)"**
- 위치: `~/Library/Logs/OpenClaw/diagnostics.jsonl` (자동으로 회전됨; 이전 파일에는 `.1`, `.2`, ...가 접미사로 붙음)
- 지우기: **Debug 창 → Logs → App logging → "Clear"**

참고:

- 기본적으로 **꺼져 있습니다**. 활발하게 디버깅하는 동안에만 활성화하십시오.
- 파일을 민감한 것으로 취급하십시오. 검토 없이 공유하지 마십시오.

## macOS에서 통합 로깅 개인 데이터

통합 로깅은 서브시스템이 `privacy -off`를 선택하지 않는 한 대부분의 페이로드를 수정합니다. macOS [로깅 개인 정보 기이한 점](https://steipete.me/posts/2025/logging-privacy-shenanigans) (2025)에 대한 Peter의 글에 따르면 이는 서브시스템 이름을 키로 하는 `/Library/Preferences/Logging/Subsystems/`의 plist로 제어됩니다. 새 로그 항목만 플래그를 선택하므로 문제를 재현하기 전에 활성화하십시오.

## OpenClaw에 대해 활성화 (`ai.openclaw`)

- plist를 임시 파일에 먼저 쓴 다음 루트로 원자적으로 설치합니다:

```bash
cat <<'EOF' >/tmp/ai.openclaw.plist
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>DEFAULT-OPTIONS</key>
    <dict>
        <key>Enable-Private-Data</key>
        <true/>
    </dict>
</dict>
</plist>
EOF
sudo install -m 644 -o root -g wheel /tmp/ai.openclaw.plist /Library/Preferences/Logging/Subsystems/ai.openclaw.plist
```

- 재부팅이 필요하지 않습니다. logd가 파일을 빠르게 인식하지만 새 로그 줄에만 개인 페이로드가 포함됩니다.
- 기존 도우미를 사용하여 풍부한 출력을 봅니다. 예: `./scripts/clawlog.sh --category WebChat --last 5m`.

## 디버깅 후 비활성화

- 재정의 제거: `sudo rm /Library/Preferences/Logging/Subsystems/ai.openclaw.plist`.
- 선택적으로 `sudo log config --reload`를 실행하여 logd가 재정의를 즉시 삭제하도록 강제합니다.
- 이 표면에는 전화번호와 메시지 본문이 포함될 수 있습니다. 추가 세부 정보가 필요한 동안에만 plist를 유지하십시오.
