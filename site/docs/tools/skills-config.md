---
title: "스킬 설정"
description: "스킬 설정 스키마 및 예시"
---

# 스킬 설정

대부분의 스킬 로더/설치 설정은 `~/.openclaw/openclaw.json`의 `skills` 아래에 있습니다. 에이전트별 스킬 가시성은 `agents.defaults.skills` 및 `agents.list[].skills` 아래에 있습니다.

```json5
{
  skills: {
    allowBundled: ["gemini", "peekaboo"],
    load: {
      extraDirs: ["~/Projects/agent-scripts/skills", "~/Projects/oss/some-skill-pack/skills"],
      watch: true,
      watchDebounceMs: 250,
    },
    install: {
      preferBrew: true,
      nodeManager: "npm", // npm | pnpm | yarn | bun (게이트웨이 런타임은 여전히 Node; bun은 권장하지 않음)
    },
    entries: {
      "image-lab": {
        enabled: true,
        apiKey: { source: "env", provider: "default", id: "GEMINI_API_KEY" }, // 또는 평문 문자열
        env: {
          GEMINI_API_KEY: "GEMINI_KEY_HERE",
        },
      },
      peekaboo: { enabled: true },
      sag: { enabled: false },
    },
  },
}
```

내장된 이미지 생성/편집의 경우 번들된 스킬 대신 `agents.defaults.imageGenerationModel`과 함께 코어 `image_generate` 도구를 선호하십시오. `skills.entries.*`는 사용자 지정 또는 서드파티 스킬 워크플로우에만 사용됩니다.

특정 이미지 프로바이더/모델을 선택하는 경우 해당 프로바이더의 인증/API 키도 구성하십시오. 일반적인 예시: `google/*`에는 `GEMINI_API_KEY` 또는 `GOOGLE_API_KEY`, `openai/*`에는 `OPENAI_API_KEY`, `fal/*`에는 `FAL_KEY`.

예시:

- 네이티브 Nano Banana 스타일 설정: `agents.defaults.imageGenerationModel.primary: "google/gemini-3.1-flash-image-preview"`
- 네이티브 fal 설정: `agents.defaults.imageGenerationModel.primary: "fal/fal-ai/flux/dev"`

## 에이전트 스킬 허용 목록

동일한 머신/워크스페이스 스킬 루트를 원하지만 에이전트별로 다른 스킬 세트가 필요한 경우 에이전트 설정을 사용하십시오.

```json5
{
  agents: {
    defaults: {
      skills: ["github", "weather"],
    },
    list: [
      { id: "writer" }, // 기본값 상속 -> github, weather
      { id: "docs", skills: ["docs-search"] }, // 기본값 대체
      { id: "locked-down", skills: [] }, // 스킬 없음
    ],
  },
}
```

규칙:

- `agents.defaults.skills`: `agents.list[].skills`를 생략하는 에이전트를 위한 공유 기본 허용 목록.
- 기본적으로 스킬을 제한 없이 유지하려면 `agents.defaults.skills`를 생략하십시오.
- `agents.list[].skills`: 해당 에이전트에 대한 명시적 최종 스킬 세트. 기본값과 병합되지 않습니다.
- `agents.list[].skills: []`: 해당 에이전트에 대해 스킬을 노출하지 않습니다.

## 필드

- 내장 스킬 루트에는 항상 `~/.openclaw/skills`, `~/.agents/skills`, `&lt;workspace&gt;/.agents/skills`, `&lt;workspace&gt;/skills`가 포함됩니다.
- `allowBundled`: **번들된** 스킬에만 적용되는 선택적 허용 목록. 설정된 경우 목록의 번들된 스킬만 적합합니다 (관리, 에이전트, 워크스페이스 스킬에는 영향 없음).
- `load.extraDirs`: 스캔할 추가 스킬 디렉토리 (가장 낮은 우선순위).
- `load.watch`: 스킬 폴더를 감시하고 스킬 스냅샷을 새로 고침합니다 (기본값: true).
- `load.watchDebounceMs`: 스킬 감시자 이벤트의 디바운스 (밀리초, 기본값: 250).
- `install.preferBrew`: 사용 가능한 경우 brew 설치 프로그램을 선호합니다 (기본값: true).
- `install.nodeManager`: 노드 설치 프로그램 설정 (`npm` | `pnpm` | `yarn` | `bun`, 기본값: npm).
  이것은 **스킬 설치**에만 영향을 미칩니다. 게이트웨이 런타임은 여전히 Node이어야 합니다
  (Bun은 WhatsApp/Telegram에 권장하지 않습니다).
  - `openclaw setup --node-manager`는 더 좁고 현재 `npm`, `pnpm`, `bun`만 허용합니다. Yarn 기반 스킬 설치를 원한다면 `skills.install.nodeManager: "yarn"`을 수동으로 설정하십시오.
- `entries.&lt;skillKey&gt;`: 스킬별 재정의.
- `agents.defaults.skills`: `agents.list[].skills`를 생략하는 에이전트가 상속하는 선택적 기본 스킬 허용 목록.
- `agents.list[].skills`: 선택적 에이전트별 최종 스킬 허용 목록. 명시적 목록은 병합 대신 상속된 기본값을 대체합니다.

스킬별 필드:

- `enabled`: 번들/설치된 스킬이더라도 `false`로 설정하여 비활성화합니다.
- `env`: 에이전트 실행을 위해 주입된 환경 변수 (아직 설정되지 않은 경우에만).
- `apiKey`: 기본 환경 변수를 선언하는 스킬을 위한 선택적 편의. 평문 문자열 또는 SecretRef 객체 (`{ source, provider, id }`)를 지원합니다.

## 참고 사항

- `entries` 아래의 키는 기본적으로 스킬 이름에 매핑됩니다. 스킬이 `metadata.openclaw.skillKey`를 정의하는 경우 해당 키를 대신 사용하십시오.
- 로드 우선순위는 `&lt;workspace&gt;/skills` → `&lt;workspace&gt;/.agents/skills` → `~/.agents/skills` → `~/.openclaw/skills` → 번들된 스킬 → `skills.load.extraDirs`입니다.
- 감시자가 활성화된 경우 스킬 변경 사항은 다음 에이전트 턴에서 적용됩니다.

### 샌드박스된 스킬 + 환경 변수

세션이 **샌드박스된** 경우 스킬 프로세스는 Docker 내에서 실행됩니다. 샌드박스는 호스트 `process.env`를 **상속하지 않습니다**.

다음 중 하나를 사용하십시오:

- `agents.defaults.sandbox.docker.env` (또는 에이전트별 `agents.list[].sandbox.docker.env`)
- 사용자 지정 샌드박스 이미지에 환경 변수를 내장합니다

전역 `env` 및 `skills.entries.&lt;skill&gt;.env/apiKey`는 **호스트** 실행에만 적용됩니다.
