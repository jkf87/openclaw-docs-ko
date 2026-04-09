---
summary: "Bun 워크플로우 (실험적): pnpm과의 설치 및 주의 사항"
read_when:
  - 가장 빠른 로컬 개발 루프를 원하는 경우 (bun + watch)
  - Bun 설치/패치/라이프사이클 스크립트 문제가 발생한 경우
title: "Bun (실험적)"
---

# Bun (실험적)

<Warning>
Bun은 **게이트웨이 런타임에 권장되지 않습니다** (WhatsApp 및 Telegram과의 알려진 문제). 프로덕션에는 Node를 사용하십시오.
</Warning>

Bun은 TypeScript를 직접 실행하기 위한 선택적 로컬 런타임입니다(`bun run ...`, `bun --watch ...`). 기본 패키지 관리자는 완전히 지원되며 문서 도구에서 사용하는 `pnpm`으로 유지됩니다. Bun은 `pnpm-lock.yaml`을 사용할 수 없으며 이를 무시합니다.

## 설치

<Steps>
  <Step title="종속성 설치">
    ```sh
    bun install
    ```

    `bun.lock` / `bun.lockb`은 gitignored되므로 저장소 변경 사항이 없습니다. 락파일 쓰기를 완전히 건너뛰려면:

    ```sh
    bun install --no-save
    ```

  </Step>
  <Step title="빌드 및 테스트">
    ```sh
    bun run build
    bun run vitest run
    ```
  </Step>
</Steps>

## 라이프사이클 스크립트

Bun은 명시적으로 신뢰하지 않는 한 종속성 라이프사이클 스크립트를 차단합니다. 이 저장소의 경우 일반적으로 차단되는 스크립트는 필요하지 않습니다:

- `@whiskeysockets/baileys` `preinstall` -- Node 메이저 버전 >= 20 확인 (OpenClaw는 기본적으로 Node 24를 사용하며 Node 22 LTS, 현재 `22.14+`도 지원함)
- `protobufjs` `postinstall` -- 호환되지 않는 버전 체계에 대한 경고 출력 (빌드 아티팩트 없음)

이러한 스크립트가 필요한 런타임 문제가 발생하면 명시적으로 신뢰합니다:

```sh
bun pm trust @whiskeysockets/baileys protobufjs
```

## 주의 사항

일부 스크립트는 여전히 pnpm을 하드코딩합니다(예: `docs:build`, `ui:*`, `protocol:check`). 현재로서는 pnpm을 통해 실행하십시오.
