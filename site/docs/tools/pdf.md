---
title: "PDF 도구"
description: "네이티브 프로바이더 지원 및 추출 폴백이 있는 하나 이상의 PDF 문서 분석"
---

# PDF 도구

`pdf`는 하나 이상의 PDF 문서를 분석하고 텍스트를 반환합니다.

빠른 동작:

- Anthropic 및 Google 모델 프로바이더를 위한 네이티브 프로바이더 모드.
- 다른 프로바이더를 위한 추출 폴백 모드 (먼저 텍스트 추출, 그런 다음 필요한 경우 페이지 이미지).
- 단일 (`pdf`) 또는 다중 (`pdfs`) 입력 지원, 호출당 최대 10개 PDF.

## 가용성

이 도구는 OpenClaw가 에이전트에 대한 PDF 지원 모델 설정을 확인할 수 있는 경우에만 등록됩니다:

1. `agents.defaults.pdfModel`
2. `agents.defaults.imageModel`으로 폴백
3. 에이전트의 결정된 세션/기본 모델로 폴백
4. 네이티브 PDF 프로바이더가 인증 기반이면 일반 이미지 폴백 후보 앞에 우선시됨

사용 가능한 모델을 결정할 수 없으면 `pdf` 도구가 노출되지 않습니다.

가용성 참고 사항:

- 폴백 체인은 인증을 인식합니다. 구성된 `provider/model`은 OpenClaw가 에이전트에 대해 해당 프로바이더를 실제로 인증할 수 있는 경우에만 카운트됩니다.
- 네이티브 PDF 프로바이더는 현재 **Anthropic**과 **Google**입니다.
- 결정된 세션/기본 프로바이더에 이미 구성된 비전/PDF 모델이 있으면 PDF 도구는 다른 인증 기반 프로바이더로 폴백하기 전에 해당 모델을 재사용합니다.

## 입력 레퍼런스

- `pdf` (`string`): 하나의 PDF 경로 또는 URL
- `pdfs` (`string[]`): 여러 PDF 경로 또는 URL, 총 최대 10개
- `prompt` (`string`): 분석 프롬프트, 기본값 `Analyze this PDF document.`
- `pages` (`string`): `1-5` 또는 `1,3,7-9`와 같은 페이지 필터
- `model` (`string`): 선택적 모델 재정의 (`provider/model`)
- `maxBytesMb` (`number`): PDF당 크기 상한 (MB)

입력 참고 사항:

- `pdf`와 `pdfs`는 로드하기 전에 병합되고 중복 제거됩니다.
- PDF 입력이 제공되지 않으면 도구 오류가 발생합니다.
- `pages`는 1 기반 페이지 번호로 파싱되고 중복 제거되고 정렬되고 구성된 최대 페이지로 제한됩니다.
- `maxBytesMb`는 `agents.defaults.pdfMaxBytesMb` 또는 `10`으로 기본 설정됩니다.

## 지원 PDF 참조

- 로컬 파일 경로 (`~` 확장 포함)
- `file://` URL
- `http://` 및 `https://` URL

참조 참고 사항:

- 다른 URI 스킴 (예: `ftp://`)은 `unsupported_pdf_reference`로 거부됩니다.
- 샌드박스 모드에서 원격 `http(s)` URL은 거부됩니다.
- 워크스페이스 전용 파일 정책이 활성화된 경우 허용된 루트 외부의 로컬 파일 경로는 거부됩니다.

## 실행 모드

### 네이티브 프로바이더 모드

네이티브 모드는 프로바이더 `anthropic` 및 `google`에 사용됩니다.
도구가 원시 PDF 바이트를 직접 프로바이더 API로 전송합니다.

네이티브 모드 제한:

- `pages`는 지원되지 않습니다. 설정하면 도구가 오류를 반환합니다.
- 멀티 PDF 입력이 지원됩니다. 각 PDF는 프롬프트 전에 네이티브 문서 블록 / 인라인 PDF 부분으로 전송됩니다.

### 추출 폴백 모드

폴백 모드는 비네이티브 프로바이더에 사용됩니다.

흐름:

1. 선택된 페이지에서 텍스트를 추출합니다 (`agents.defaults.pdfMaxPages`까지, 기본값 `20`).
2. 추출된 텍스트 길이가 `200`자 미만이면 선택된 페이지를 PNG 이미지로 렌더링하고 포함합니다.
3. 추출된 콘텐츠와 프롬프트를 선택된 모델로 전송합니다.

폴백 세부 정보:

- 페이지 이미지 추출은 픽셀 예산 `4,000,000`을 사용합니다.
- 대상 모델이 이미지 입력을 지원하지 않고 추출 가능한 텍스트가 없으면 도구 오류가 발생합니다.
- 텍스트 추출이 성공하지만 이미지 추출이 텍스트 전용 모델에서 비전이 필요한 경우 OpenClaw는 렌더링된 이미지를 삭제하고 추출된 텍스트로 계속합니다.
- 추출 폴백에는 `pdfjs-dist` (이미지 렌더링을 위한 `@napi-rs/canvas`도 필요)가 필요합니다.

## 설정

```json5
{
  agents: {
    defaults: {
      pdfModel: {
        primary: "anthropic/claude-opus-4-6",
        fallbacks: ["openai/gpt-5.4-mini"],
      },
      pdfMaxBytesMb: 10,
      pdfMaxPages: 20,
    },
  },
}
```

전체 필드 세부 정보는 [설정 레퍼런스](/gateway/configuration-reference)를 참조하십시오.

## 출력 세부 정보

도구는 `content[0].text`에 텍스트를 반환하고 `details`에 구조화된 메타데이터를 반환합니다.

공통 `details` 필드:

- `model`: 결정된 모델 참조 (`provider/model`)
- `native`: 네이티브 프로바이더 모드는 `true`, 폴백은 `false`
- `attempts`: 성공 전에 실패한 폴백 시도

경로 필드:

- 단일 PDF 입력: `details.pdf`
- 여러 PDF 입력: `pdf` 항목이 있는 `details.pdfs[]`
- 샌드박스 경로 재작성 메타데이터 (해당하는 경우): `rewrittenFrom`

## 오류 동작

- 누락된 PDF 입력: `pdf required: provide a path or URL to a PDF document` 오류 발생
- 너무 많은 PDF: `details.error = "too_many_pdfs"`에 구조화된 오류 반환
- 지원되지 않는 참조 스킴: `details.error = "unsupported_pdf_reference"` 반환
- `pages`를 사용한 네이티브 모드: 명확한 `pages is not supported with native PDF providers` 오류 발생

## 예시

단일 PDF:

```json
{
  "pdf": "/tmp/report.pdf",
  "prompt": "Summarize this report in 5 bullets"
}
```

여러 PDF:

```json
{
  "pdfs": ["/tmp/q1.pdf", "/tmp/q2.pdf"],
  "prompt": "Compare risks and timeline changes across both documents"
}
```

페이지 필터링된 폴백 모델:

```json
{
  "pdf": "https://example.com/report.pdf",
  "pages": "1-3,7",
  "model": "openai/gpt-5.4-mini",
  "prompt": "Extract only customer-impacting incidents"
}
```

## 관련 항목

- [도구 개요](/tools) — 모든 사용 가능한 에이전트 도구
- [설정 레퍼런스](/gateway/configuration-reference#agent-defaults) — pdfMaxBytesMb 및 pdfMaxPages 설정
