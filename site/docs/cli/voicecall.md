---
title: "voicecall"
description: "`openclaw voicecall`에 대한 CLI 참조 (음성 통화 플러그인 명령 표면)"
---

# `openclaw voicecall`

`voicecall`은 플러그인이 제공하는 명령입니다. 음성 통화 플러그인이 설치되고 활성화된 경우에만 나타납니다.

기본 문서:

- 음성 통화 플러그인: [음성 통화](/plugins/voice-call)

## 일반 명령

```bash
openclaw voicecall status --call-id &lt;id&gt;
openclaw voicecall call --to "+15555550123" --message "Hello" --mode notify
openclaw voicecall continue --call-id &lt;id&gt; --message "Any questions?"
openclaw voicecall end --call-id &lt;id&gt;
```

## 웹훅 노출 (Tailscale)

```bash
openclaw voicecall expose --mode serve
openclaw voicecall expose --mode funnel
openclaw voicecall expose --mode off
```

보안 참고: 신뢰할 수 있는 네트워크에만 웹훅 엔드포인트를 노출하세요. 가능한 경우 Funnel보다 Tailscale Serve를 선호하세요.
