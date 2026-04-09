---
title: "Diffs"
summary: "에이전트를 위한 읽기 전용 diff 뷰어 및 파일 렌더러 (선택적 플러그인 도구)"
read_when:
  - You want agents to show code or markdown edits as diffs
  - You want a canvas-ready viewer URL or a rendered diff file
  - You need controlled, temporary diff artifacts with secure defaults
---

# Diffs

`diffs`는 간결한 내장 시스템 가이드와 변경 콘텐츠를 에이전트를 위한 읽기 전용 diff 아티팩트로 변환하는 컴패니언 스킬이 있는 선택적 플러그인 도구입니다.

다음 중 하나를 허용합니다:

- `before`와 `after` 텍스트
- 통합 `patch`

다음을 반환할 수 있습니다:

- 캔버스 프레젠테이션을 위한 게이트웨이 뷰어 URL
- 메시지 전달을 위한 렌더링된 파일 경로 (PNG 또는 PDF)
- 하나의 호출에서 두 출력 모두

활성화된 경우 플러그인은 간결한 사용 가이드를 시스템 프롬프트 공간에 준비하고, 에이전트에게 더 자세한 지침이 필요한 경우를 위해 상세 스킬을 노출합니다.

## 빠른 시작

1. 플러그인을 활성화합니다.
2. 캔버스 우선 흐름에는 `mode: "view"`로 `diffs`를 호출합니다.
3. 채팅 파일 전달 흐름에는 `mode: "file"`로 `diffs`를 호출합니다.
4. 두 아티팩트가 모두 필요한 경우 `mode: "both"`로 `diffs`를 호출합니다.

## 플러그인 활성화

```json5
{
  plugins: {
    entries: {
      diffs: {
        enabled: true,
      },
    },
  },
}
```

## 내장 시스템 가이드 비활성화

`diffs` 도구를 활성화 상태로 유지하되 내장 시스템 프롬프트 가이드를 비활성화하려면 `plugins.entries.diffs.hooks.allowPromptInjection`을 `false`로 설정하십시오:

```json5
{
  plugins: {
    entries: {
      diffs: {
        enabled: true,
        hooks: {
          allowPromptInjection: false,
        },
      },
    },
  },
}
```

이것은 플러그인, 도구, 컴패니언 스킬은 사용 가능한 상태로 유지하면서 diffs 플러그인의 `before_prompt_build` 훅을 차단합니다.

가이드와 도구를 모두 비활성화하려면 플러그인을 비활성화하십시오.

## 일반적인 에이전트 워크플로우

1. 에이전트가 `diffs`를 호출합니다.
2. 에이전트가 `details` 필드를 읽습니다.
3. 에이전트는 다음 중 하나를 수행합니다:
   - `canvas present`로 `details.viewerUrl`을 엽니다
   - `path` 또는 `filePath`를 사용하여 `message`로 `details.filePath`를 전송합니다
   - 두 가지를 모두 수행합니다

## 입력 예시

Before와 after:

```json
{
  "before": "# Hello\n\nOne",
  "after": "# Hello\n\nTwo",
  "path": "docs/example.md",
  "mode": "view"
}
```

Patch:

```json
{
  "patch": "diff --git a/src/example.ts b/src/example.ts\n--- a/src/example.ts\n+++ b/src/example.ts\n@@ -1 +1 @@\n-const x = 1;\n+const x = 2;\n",
  "mode": "both"
}
```

## 도구 입력 레퍼런스

별도로 표시되지 않는 한 모든 필드는 선택적입니다:

- `before` (`string`): 원본 텍스트. `patch`가 생략된 경우 `after`와 함께 필수입니다.
- `after` (`string`): 업데이트된 텍스트. `patch`가 생략된 경우 `before`와 함께 필수입니다.
- `patch` (`string`): 통합 diff 텍스트. `before` 및 `after`와 상호 배타적입니다.
- `path` (`string`): before와 after 모드를 위한 표시 파일명.
- `lang` (`string`): before와 after 모드를 위한 언어 재정의 힌트. 알 수 없는 값은 일반 텍스트로 폴백됩니다.
- `title` (`string`): 뷰어 제목 재정의.
- `mode` (`"view" | "file" | "both"`): 출력 모드. 기본값은 플러그인 기본값 `defaults.mode`입니다.
  더 이상 사용되지 않는 별칭: `"image"`는 `"file"`처럼 작동하며 하위 호환성을 위해 여전히 허용됩니다.
- `theme` (`"light" | "dark"`): 뷰어 테마. 플러그인 기본값 `defaults.theme`으로 기본 설정됩니다.
- `layout` (`"unified" | "split"`): diff 레이아웃. 플러그인 기본값 `defaults.layout`으로 기본 설정됩니다.
- `expandUnchanged` (`boolean`): 전체 컨텍스트를 사용할 수 있을 때 변경되지 않은 섹션을 확장합니다. 호출별 옵션만 해당 (플러그인 기본 키 아님).
- `fileFormat` (`"png" | "pdf"`): 렌더링된 파일 형식. 플러그인 기본값 `defaults.fileFormat`으로 기본 설정됩니다.
- `fileQuality` (`"standard" | "hq" | "print"`): PNG 또는 PDF 렌더링을 위한 품질 프리셋.
- `fileScale` (`number`): 장치 배율 재정의 (`1`-`4`).
- `fileMaxWidth` (`number`): CSS 픽셀 단위 최대 렌더링 너비 (`640`-`2400`).
- `ttlSeconds` (`number`): 뷰어 및 독립형 파일 출력에 대한 아티팩트 TTL(초). 기본값 1800, 최대 21600.
- `baseUrl` (`string`): 뷰어 URL 출처 재정의. 플러그인 `viewerBaseUrl`을 재정의합니다. `http` 또는 `https`여야 하며, 쿼리/해시는 포함하지 않습니다.

하위 호환성을 위해 여전히 허용되는 레거시 입력 별칭:

- `format` -> `fileFormat`
- `imageFormat` -> `fileFormat`
- `imageQuality` -> `fileQuality`
- `imageScale` -> `fileScale`
- `imageMaxWidth` -> `fileMaxWidth`

유효성 검사 및 제한:

- `before`와 `after` 각각 최대 512 KiB.
- `patch` 최대 2 MiB.
- `path` 최대 2048 바이트.
- `lang` 최대 128 바이트.
- `title` 최대 1024 바이트.
- 패치 복잡성 캡: 최대 128개 파일 및 120000 총 줄.
- `patch`와 `before` 또는 `after`를 함께 사용하면 거부됩니다.
- 렌더링된 파일 안전 제한 (PNG 및 PDF에 적용):
  - `fileQuality: "standard"`: 최대 8 MP (8,000,000 렌더링된 픽셀).
  - `fileQuality: "hq"`: 최대 14 MP (14,000,000 렌더링된 픽셀).
  - `fileQuality: "print"`: 최대 24 MP (24,000,000 렌더링된 픽셀).
  - PDF는 또한 최대 50 페이지입니다.

## 출력 세부 정보 계약

도구는 `details` 아래에 구조화된 메타데이터를 반환합니다.

뷰어를 생성하는 모드의 공유 필드:

- `artifactId`
- `viewerUrl`
- `viewerPath`
- `title`
- `expiresAt`
- `inputKind`
- `fileCount`
- `mode`
- `context` (`agentId`, `sessionId`, `messageChannel`, `agentAccountId` - 사용 가능한 경우)

PNG 또는 PDF가 렌더링될 때의 파일 필드:

- `artifactId`
- `expiresAt`
- `filePath`
- `path` (`filePath`와 동일한 값, 메시지 도구 호환성을 위해)
- `fileBytes`
- `fileFormat`
- `fileQuality`
- `fileScale`
- `fileMaxWidth`

기존 호출자를 위한 호환성 별칭도 반환됩니다:

- `format` (`fileFormat`와 동일한 값)
- `imagePath` (`filePath`와 동일한 값)
- `imageBytes` (`fileBytes`와 동일한 값)
- `imageQuality` (`fileQuality`와 동일한 값)
- `imageScale` (`fileScale`와 동일한 값)
- `imageMaxWidth` (`fileMaxWidth`와 동일한 값)

모드 동작 요약:

- `mode: "view"`: 뷰어 필드만.
- `mode: "file"`: 파일 필드만, 뷰어 아티팩트 없음.
- `mode: "both"`: 뷰어 필드 + 파일 필드. 파일 렌더링이 실패하면 `fileError` 및 호환성 별칭 `imageError`와 함께 뷰어가 반환됩니다.

## 접힌 변경되지 않은 섹션

- 뷰어는 `N unmodified lines` 같은 행을 표시할 수 있습니다.
- 해당 행의 확장 컨트롤은 조건부이며 모든 입력 유형에 대해 보장되지 않습니다.
- 확장 컨트롤은 렌더링된 diff에 확장 가능한 컨텍스트 데이터가 있을 때 나타납니다. 이는 before와 after 입력에 일반적입니다.
- 많은 통합 패치 입력의 경우 생략된 컨텍스트 본문은 파싱된 패치 청크에서 사용할 수 없어, 확장 컨트롤 없이 행이 나타날 수 있습니다. 이것은 예상되는 동작입니다.
- `expandUnchanged`는 확장 가능한 컨텍스트가 있을 때만 적용됩니다.

## 플러그인 기본값

`~/.openclaw/openclaw.json`에서 플러그인 전체 기본값을 설정하십시오:

```json5
{
  plugins: {
    entries: {
      diffs: {
        enabled: true,
        config: {
          defaults: {
            fontFamily: "Fira Code",
            fontSize: 15,
            lineSpacing: 1.6,
            layout: "unified",
            showLineNumbers: true,
            diffIndicators: "bars",
            wordWrap: true,
            background: true,
            theme: "dark",
            fileFormat: "png",
            fileQuality: "standard",
            fileScale: 2,
            fileMaxWidth: 960,
            mode: "both",
          },
        },
      },
    },
  },
}
```

지원되는 기본값:

- `fontFamily`
- `fontSize`
- `lineSpacing`
- `layout`
- `showLineNumbers`
- `diffIndicators`
- `wordWrap`
- `background`
- `theme`
- `fileFormat`
- `fileQuality`
- `fileScale`
- `fileMaxWidth`
- `mode`

명시적 도구 파라미터는 이 기본값을 재정의합니다.

영구 뷰어 URL 구성:

- `viewerBaseUrl` (`string`, 선택적)
  - 도구 호출이 `baseUrl`을 전달하지 않을 때 반환되는 뷰어 링크를 위한 플러그인 소유 폴백.
  - `http` 또는 `https`여야 하며, 쿼리/해시는 포함하지 않습니다.

예시:

```json5
{
  plugins: {
    entries: {
      diffs: {
        enabled: true,
        config: {
          viewerBaseUrl: "https://gateway.example.com/openclaw",
        },
      },
    },
  },
}
```

## 보안 구성

- `security.allowRemoteViewer` (`boolean`, 기본값 `false`)
  - `false`: 루프백 이외의 뷰어 라우트 요청이 거부됩니다.
  - `true`: 토큰화된 경로가 유효한 경우 원격 뷰어가 허용됩니다.

예시:

```json5
{
  plugins: {
    entries: {
      diffs: {
        enabled: true,
        config: {
          security: {
            allowRemoteViewer: false,
          },
        },
      },
    },
  },
}
```

## 아티팩트 수명 주기 및 저장소

- 아티팩트는 임시 하위 폴더 `$TMPDIR/openclaw-diffs` 아래에 저장됩니다.
- 뷰어 아티팩트 메타데이터 포함:
  - 무작위 아티팩트 ID (20자리 16진수)
  - 무작위 토큰 (48자리 16진수)
  - `createdAt`와 `expiresAt`
  - 저장된 `viewer.html` 경로
- 지정되지 않은 경우 기본 아티팩트 TTL은 30분입니다.
- 허용되는 최대 뷰어 TTL은 6시간입니다.
- 정리는 아티팩트 생성 후 기회가 있을 때 실행됩니다.
- 만료된 아티팩트는 삭제됩니다.
- 폴백 정리는 메타데이터가 없을 때 24시간보다 오래된 오래된 폴더를 제거합니다.

## 뷰어 URL 및 네트워크 동작

뷰어 라우트:

- `/plugins/diffs/view/{artifactId}/{token}`

뷰어 에셋:

- `/plugins/diffs/assets/viewer.js`
- `/plugins/diffs/assets/viewer-runtime.js`

뷰어 문서는 뷰어 URL에 상대적으로 해당 에셋을 해결하므로 선택적 `baseUrl` 경로 접두사가 두 에셋 요청 모두에 대해 보존됩니다.

URL 구성 동작:

- 도구 호출 `baseUrl`이 제공된 경우 엄격한 유효성 검사 후 사용됩니다.
- 플러그인 `viewerBaseUrl`이 구성된 경우 사용됩니다.
- 두 재정의가 없으면 뷰어 URL은 루프백 `127.0.0.1`로 기본 설정됩니다.
- 게이트웨이 바인드 모드가 `custom`이고 `gateway.customBindHost`가 설정된 경우 해당 호스트가 사용됩니다.

`baseUrl` 규칙:

- `http://` 또는 `https://`여야 합니다.
- 쿼리와 해시는 거부됩니다.
- 출처 및 선택적 기본 경로가 허용됩니다.

## 보안 모델

뷰어 강화:

- 기본적으로 루프백 전용.
- 엄격한 ID 및 토큰 유효성 검사가 있는 토큰화된 뷰어 경로.
- 뷰어 응답 CSP:
  - `default-src 'none'`
  - 스크립트와 에셋은 self에서만
  - 아웃바운드 `connect-src` 없음
- 원격 액세스가 활성화된 경우 원격 미스 스로틀링:
  - 60초당 40회 실패
  - 60초 잠금 (`429 Too Many Requests`)

파일 렌더링 강화:

- 스크린샷 브라우저 요청 라우팅은 기본값으로 거부됩니다.
- `http://127.0.0.1/plugins/diffs/assets/*`의 로컬 뷰어 에셋만 허용됩니다.
- 외부 네트워크 요청이 차단됩니다.

## 파일 모드를 위한 브라우저 요구 사항

`mode: "file"`과 `mode: "both"`에는 Chromium 호환 브라우저가 필요합니다.

해결 순서:

1. OpenClaw 구성의 `browser.executablePath`.
2. 환경 변수:
   - `OPENCLAW_BROWSER_EXECUTABLE_PATH`
   - `BROWSER_EXECUTABLE_PATH`
   - `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`
3. 플랫폼 명령/경로 검색 폴백.

일반적인 실패 텍스트:

- `Diff PNG/PDF rendering requires a Chromium-compatible browser...`

Chrome, Chromium, Edge, 또는 Brave를 설치하거나 위의 실행 파일 경로 옵션 중 하나를 설정하여 수정하십시오.

## 문제 해결

입력 유효성 검사 오류:

- `Provide patch or both before and after text.`
  - `before`와 `after`를 모두 포함하거나 `patch`를 제공하십시오.
- `Provide either patch or before/after input, not both.`
  - 입력 모드를 혼합하지 마십시오.
- `Invalid baseUrl: ...`
  - 선택적 경로가 있는 `http(s)` 출처를 사용하고 쿼리/해시는 없어야 합니다.
- `{field} exceeds maximum size (...)`
  - 페이로드 크기를 줄이십시오.
- 대용량 패치 거부
  - 패치 파일 수 또는 총 줄을 줄이십시오.

뷰어 접근성 문제:

- 뷰어 URL은 기본적으로 `127.0.0.1`로 해결됩니다.
- 원격 액세스 시나리오의 경우:
  - 플러그인 `viewerBaseUrl`을 설정하거나
  - 도구 호출별로 `baseUrl`을 전달하거나
  - `gateway.bind=custom` 및 `gateway.customBindHost` 사용
- `gateway.trustedProxies`에 동일 호스트 프록시(예: Tailscale Serve)를 위한 루프백이 포함된 경우, 전달된 클라이언트-IP 헤더가 없는 원시 루프백 뷰어 요청은 설계상 실패합니다.
- 해당 프록시 토폴로지의 경우:
  - 첨부 파일만 필요한 경우 `mode: "file"` 또는 `mode: "both"`를 선호하거나
  - 공유 가능한 뷰어 URL이 필요한 경우 `security.allowRemoteViewer`를 의도적으로 활성화하고 플러그인 `viewerBaseUrl`을 설정하거나 프록시/공개 `baseUrl`을 전달하십시오
- 외부 뷰어 액세스가 필요한 경우에만 `security.allowRemoteViewer`를 활성화하십시오.

변경되지 않은 줄 행에 확장 버튼 없음:

- 패치에 확장 가능한 컨텍스트가 없는 경우 패치 입력에서 발생할 수 있습니다.
- 이것은 예상되는 동작이며 뷰어 실패를 나타내지 않습니다.

아티팩트를 찾을 수 없음:

- TTL로 인해 아티팩트가 만료됨.
- 토큰이나 경로가 변경됨.
- 정리로 오래된 데이터가 제거됨.

## 운영 지침

- 캔버스에서의 로컬 대화형 검토에는 `mode: "view"`를 선호하십시오.
- 첨부 파일이 필요한 아웃바운드 채팅 채널에는 `mode: "file"`을 선호하십시오.
- 배포에서 원격 뷰어 URL이 필요하지 않는 한 `allowRemoteViewer`를 비활성화 상태로 유지하십시오.
- 민감한 diff에는 명시적으로 짧은 `ttlSeconds`를 설정하십시오.
- 필요하지 않은 경우 diff 입력에 시크릿을 보내지 마십시오.
- 채널이 이미지를 공격적으로 압축하는 경우(예: Telegram 또는 WhatsApp), PDF 출력(`fileFormat: "pdf"`)을 선호하십시오.

Diff 렌더링 엔진:

- [Diffs](https://diffs.com)로 구동됩니다.

## 관련 문서

- [도구 개요](/tools/)
- [플러그인](/tools/plugin)
- [브라우저](/tools/browser)
