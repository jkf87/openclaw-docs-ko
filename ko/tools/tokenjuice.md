---
summary: "선택적 번들 plugin으로 시끄러운 exec 및 bash tool 결과를 압축합니다"
title: "Tokenjuice"
read_when:
  - OpenClaw에서 `exec` 또는 `bash` tool 결과를 더 짧게 만들고 싶을 때
  - 번들된 tokenjuice plugin을 활성화하고 싶을 때
  - tokenjuice가 무엇을 변경하고 무엇을 원시(raw) 상태로 두는지 이해해야 할 때
---

`tokenjuice`는 명령이 이미 실행된 후에 시끄러운 `exec` 및 `bash` tool
결과를 압축하는 선택적 번들 plugin입니다.

이는 반환되는 `tool_result`를 변경하며, 명령 자체는 변경하지 않습니다. Tokenjuice는
shell 입력을 다시 작성하지 않고, 명령을 다시 실행하지 않으며, 종료 코드도 변경하지 않습니다.

현재 이는 Pi 임베디드 실행에 적용되며, tokenjuice가 임베디드 `tool_result`
경로를 후킹하여 세션으로 돌아가는 출력을 다듬습니다.

## Plugin 활성화

빠른 경로:

```bash
openclaw config set plugins.entries.tokenjuice.enabled true
```

동등한 방법:

```bash
openclaw plugins enable tokenjuice
```

OpenClaw는 이미 plugin을 함께 제공합니다. 별도의 `plugins install`
또는 `tokenjuice install openclaw` 단계는 없습니다.

구성 파일을 직접 편집하는 것을 선호한다면:

```json5
{
  plugins: {
    entries: {
      tokenjuice: {
        enabled: true,
      },
    },
  },
}
```

## tokenjuice가 변경하는 것

- 시끄러운 `exec` 및 `bash` 결과를 세션에 다시 공급되기 전에 압축합니다.
- 원래 명령 실행은 그대로 둡니다.
- 정확한 파일 내용 읽기 및 tokenjuice가 원시 상태로 두어야 할 기타 명령을 보존합니다.
- 옵트인 상태를 유지합니다: 어디서든 원문 그대로의 출력을 원한다면 plugin을 비활성화하세요.

## 동작 확인

1. plugin을 활성화합니다.
2. `exec`를 호출할 수 있는 세션을 시작합니다.
3. `git status` 같은 시끄러운 명령을 실행합니다.
4. 반환된 tool 결과가 원시 shell 출력보다 더 짧고 구조화되어 있는지 확인합니다.

## Plugin 비활성화

```bash
openclaw config set plugins.entries.tokenjuice.enabled false
```

또는:

```bash
openclaw plugins disable tokenjuice
```

## 관련

- [Exec tool](/tools/exec)
- [Thinking levels](/tools/thinking)
- [Context engine](/concepts/context-engine)
