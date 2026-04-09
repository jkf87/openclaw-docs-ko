---
title: "모델 CLI"
description: "모델 CLI: 목록, 설정, 별칭, 폴백, 스캔, 상태"
---

# 모델 CLI

인증 프로필 순환, 쿨다운, 폴백과의 상호작용에 대해서는 [/concepts/model-failover](/concepts/model-failover)를 참조하십시오.
빠른 프로바이더 개요 + 예시: [/concepts/model-providers](/concepts/model-providers).

## 모델 선택 작동 방식

OpenClaw는 다음 순서로 모델을 선택합니다:

1. **기본** 모델 (`agents.defaults.model.primary` 또는 `agents.defaults.model`).
2. `agents.defaults.model.fallbacks`의 **폴백** (순서대로).
3. **프로바이더 인증 장애 조치**는 다음 모델로 이동하기 전에 프로바이더 내부에서 발생합니다.

관련 항목:

- `agents.defaults.models`는 OpenClaw가 사용할 수 있는 모델의 허용 목록/카탈로그입니다 (별칭 포함).
- `agents.defaults.imageModel`은 기본 모델이 이미지를 허용하지 않는 경우에만 사용됩니다.
- `agents.defaults.pdfModel`은 `pdf` 도구에서 사용됩니다. 생략된 경우, 도구는 `agents.defaults.imageModel`로 폴백한 다음 해결된 세션/기본 모델로 폴백합니다.
- `agents.defaults.imageGenerationModel`은 공유 이미지 생성 기능에서 사용됩니다. 생략된 경우, `image_generate`는 여전히 인증 기반 프로바이더 기본값을 추론할 수 있습니다. 먼저 현재 기본 프로바이더를 시도하고, 나머지 등록된 이미지 생성 프로바이더를 프로바이더 id 순서로 시도합니다. 특정 provider/model을 설정하는 경우 해당 프로바이더의 인증/API 키도 구성하십시오.
- `agents.defaults.musicGenerationModel`은 공유 음악 생성 기능에서 사용됩니다. 생략된 경우, `music_generate`는 여전히 인증 기반 프로바이더 기본값을 추론할 수 있습니다. 먼저 현재 기본 프로바이더를 시도하고, 나머지 등록된 음악 생성 프로바이더를 프로바이더 id 순서로 시도합니다. 특정 provider/model을 설정하는 경우 해당 프로바이더의 인증/API 키도 구성하십시오.
- `agents.defaults.videoGenerationModel`은 공유 비디오 생성 기능에서 사용됩니다. 생략된 경우, `video_generate`는 여전히 인증 기반 프로바이더 기본값을 추론할 수 있습니다. 먼저 현재 기본 프로바이더를 시도하고, 나머지 등록된 비디오 생성 프로바이더를 프로바이더 id 순서로 시도합니다. 특정 provider/model을 설정하는 경우 해당 프로바이더의 인증/API 키도 구성하십시오.
- 에이전트별 기본값은 `agents.list[].model`과 바인딩을 통해 `agents.defaults.model`을 오버라이드할 수 있습니다 ([/concepts/multi-agent](/concepts/multi-agent) 참조).

## 빠른 모델 정책

- 기본 모델은 사용 가능한 가장 강력한 최신 세대 모델로 설정하십시오.
- 비용/지연 시간에 민감한 작업 및 낮은 위험도의 채팅에는 폴백을 사용하십시오.
- 도구 활성화 에이전트 또는 신뢰할 수 없는 입력의 경우, 오래되거나 약한 모델 티어를 피하십시오.

## 온보딩 (권장)

구성을 직접 편집하지 않으려면 온보딩을 실행하십시오:

```bash
openclaw onboard
```

**OpenAI Code (Codex) 구독** (OAuth) 및 **Anthropic** (API 키 또는 Claude CLI)을 포함하여 일반적인 프로바이더에 대한 모델 + 인증을 설정할 수 있습니다.

## 구성 키 (개요)

- `agents.defaults.model.primary` 및 `agents.defaults.model.fallbacks`
- `agents.defaults.imageModel.primary` 및 `agents.defaults.imageModel.fallbacks`
- `agents.defaults.pdfModel.primary` 및 `agents.defaults.pdfModel.fallbacks`
- `agents.defaults.imageGenerationModel.primary` 및 `agents.defaults.imageGenerationModel.fallbacks`
- `agents.defaults.videoGenerationModel.primary` 및 `agents.defaults.videoGenerationModel.fallbacks`
- `agents.defaults.models` (허용 목록 + 별칭 + 프로바이더 파라미터)
- `models.providers` (`models.json`에 작성되는 커스텀 프로바이더)

모델 참조는 소문자로 정규화됩니다. `z.ai/*`와 같은 프로바이더 별칭은 `zai/*`로 정규화됩니다.

프로바이더 구성 예시 (OpenCode 포함)는 [/providers/opencode](/providers/opencode)에 있습니다.

## "모델이 허용되지 않음" (응답이 중단되는 이유)

`agents.defaults.models`가 설정된 경우, `/model`과 세션 오버라이드의 **허용 목록**이 됩니다. 사용자가 해당 허용 목록에 없는 모델을 선택하면, OpenClaw는 다음을 반환합니다:

```
Model "provider/model" is not allowed. Use /model to list available models.
```

이는 일반 응답이 생성되기 **전에** 발생하므로, 메시지가 "응답하지 않은" 것처럼 느껴질 수 있습니다. 해결 방법:

- `agents.defaults.models`에 모델을 추가하거나,
- 허용 목록을 지우거나 (`agents.defaults.models` 제거),
- `/model list`에서 모델을 선택하십시오.

허용 목록 구성 예시:

```json5
{
  agent: {
    model: { primary: "anthropic/claude-sonnet-4-6" },
    models: {
      "anthropic/claude-sonnet-4-6": { alias: "Sonnet" },
      "anthropic/claude-opus-4-6": { alias: "Opus" },
    },
  },
}
```

## 채팅에서 모델 전환 (`/model`)

재시작 없이 현재 세션의 모델을 전환할 수 있습니다:

```
/model
/model list
/model 3
/model openai/gpt-5.4
/model status
```

참고:

- `/model` (및 `/model list`)는 간결한 번호 매긴 피커입니다 (모델 패밀리 + 사용 가능한 프로바이더).
- Discord에서 `/model` 및 `/models`는 프로바이더 및 모델 드롭다운과 제출 단계가 있는 대화형 피커를 엽니다.
- `/model <#>`는 해당 피커에서 선택합니다.
- `/model`은 즉시 새 세션 선택을 유지합니다.
- 에이전트가 유휴 상태이면 다음 실행 시 새 모델을 바로 사용합니다.
- 실행이 이미 활성 상태인 경우, OpenClaw는 라이브 전환을 보류 중으로 표시하고 깨끗한 재시도 지점에서만 새 모델로 재시작합니다.
- 도구 활동 또는 응답 출력이 이미 시작된 경우, 보류 중인 전환은 나중에 재시도 기회나 다음 사용자 턴까지 큐에 대기할 수 있습니다.
- `/model status`는 상세 보기입니다 (인증 후보 및 구성된 경우 프로바이더 엔드포인트 `baseUrl` + `api` 모드).
- 모델 참조는 **첫 번째** `/`로 분리하여 파싱됩니다. `/model &lt;ref&gt;` 입력 시 `provider/model`을 사용하십시오.
- 모델 ID 자체에 `/`가 포함된 경우 (OpenRouter 스타일), 프로바이더 접두사를 포함해야 합니다 (예: `/model openrouter/moonshotai/kimi-k2`).
- 프로바이더를 생략하면 OpenClaw는 다음 순서로 입력을 해결합니다:
  1. 별칭 매칭
  2. 해당 정확한 접두사 없는 모델 id에 대한 고유 구성 프로바이더 매칭
  3. 구성된 기본 프로바이더로의 더 이상 사용되지 않는 폴백.
     해당 프로바이더가 더 이상 구성된 기본 모델을 노출하지 않는 경우, OpenClaw는 오래된 제거된 프로바이더 기본값이 표시되지 않도록 첫 번째 구성된 provider/model로 폴백합니다.

전체 커맨드 동작/구성: [슬래시 커맨드](/tools/slash-commands).

## CLI 커맨드

```bash
openclaw models list
openclaw models status
openclaw models set &lt;provider/model&gt;
openclaw models set-image &lt;provider/model&gt;

openclaw models aliases list
openclaw models aliases add &lt;alias&gt; &lt;provider/model&gt;
openclaw models aliases remove &lt;alias&gt;

openclaw models fallbacks list
openclaw models fallbacks add &lt;provider/model&gt;
openclaw models fallbacks remove &lt;provider/model&gt;
openclaw models fallbacks clear

openclaw models image-fallbacks list
openclaw models image-fallbacks add &lt;provider/model&gt;
openclaw models image-fallbacks remove &lt;provider/model&gt;
openclaw models image-fallbacks clear
```

`openclaw models` (서브커맨드 없음)는 `models status`의 단축키입니다.

### `models list`

기본적으로 구성된 모델을 표시합니다. 유용한 플래그:

- `--all`: 전체 카탈로그
- `--local`: 로컬 프로바이더만
- `--provider &lt;name&gt;`: 프로바이더로 필터링
- `--plain`: 한 줄에 하나의 모델
- `--json`: 기계 판독 가능한 출력

### `models status`

해결된 기본 모델, 폴백, 이미지 모델, 구성된 프로바이더의 인증 개요를 표시합니다. 또한 인증 저장소에서 발견된 프로필의 OAuth 만료 상태를 표시합니다 (기본적으로 24시간 이내에 경고). `--plain`은 해결된 기본 모델만 출력합니다.

OAuth 상태는 항상 표시되며 (`--json` 출력에 포함됨). 구성된 프로바이더에 자격 증명이 없으면 `models status`는 **Missing auth** 섹션을 출력합니다. JSON에는 `auth.oauth` (경고 창 + 프로필) 및 `auth.providers` (환경 변수 기반 자격 증명 포함 프로바이더별 유효 인증)가 포함됩니다. `auth.oauth`는 인증 저장소 프로필 상태만입니다. env 전용 프로바이더는 여기에 나타나지 않습니다.

자동화에는 `--check`를 사용하십시오 (누락/만료 시 종료 코드 `1`, 만료 예정 시 `2`). 라이브 인증 확인에는 `--probe`를 사용하십시오. 프로브 행은 인증 프로필, env 자격 증명, 또는 `models.json`에서 가져올 수 있습니다.

명시적인 `auth.order.&lt;provider&gt;`가 저장된 프로필을 생략하면 프로브는 시도하는 대신 `excluded_by_auth_order`를 보고합니다. 인증이 있지만 해당 프로바이더에 대해 프로브 가능한 모델이 해결되지 않으면 프로브는 `status: no_model`을 보고합니다.

인증 선택은 프로바이더/계정에 따라 다릅니다. 항상 켜져 있는 게이트웨이 호스트의 경우, API 키가 일반적으로 가장 예측 가능합니다. Claude CLI 재사용 및 기존 Anthropic OAuth/토큰 프로필도 지원됩니다.

예시 (Claude CLI):

```bash
claude auth login
openclaw models status
```

## 스캔 (OpenRouter 무료 모델)

`openclaw models scan`은 OpenRouter의 **무료 모델 카탈로그**를 검사하고 선택적으로 도구 및 이미지 지원을 위해 모델을 프로브할 수 있습니다.

주요 플래그:

- `--no-probe`: 라이브 프로브 건너뜀 (메타데이터만)
- `--min-params <b>`: 최소 파라미터 크기 (단위: 십억)
- `--max-age-days &lt;days&gt;`: 오래된 모델 건너뜀
- `--provider &lt;name&gt;`: 프로바이더 접두사 필터
- `--max-candidates &lt;n&gt;`: 폴백 목록 크기
- `--set-default`: `agents.defaults.model.primary`를 첫 번째 선택으로 설정
- `--set-image`: `agents.defaults.imageModel.primary`를 첫 번째 이미지 선택으로 설정

프로빙에는 OpenRouter API 키 (인증 프로필 또는 `OPENROUTER_API_KEY`에서)가 필요합니다. 키 없이는 `--no-probe`를 사용하여 후보만 나열하십시오.

스캔 결과는 다음 순위로 정렬됩니다:

1. 이미지 지원
2. 도구 지연 시간
3. 컨텍스트 크기
4. 파라미터 수

입력

- OpenRouter `/models` 목록 (`:free` 필터)
- 인증 프로필 또는 `OPENROUTER_API_KEY`에서 OpenRouter API 키 필요 ([/environment](/help/environment) 참조)
- 선택적 필터: `--max-age-days`, `--min-params`, `--provider`, `--max-candidates`
- 프로브 제어: `--timeout`, `--concurrency`

TTY에서 실행하는 경우, 폴백을 대화형으로 선택할 수 있습니다. 비대화형 모드에서는 기본값을 수락하려면 `--yes`를 전달하십시오.

## 모델 레지스트리 (`models.json`)

`models.providers`의 커스텀 프로바이더는 에이전트 디렉터리 아래의 `models.json`에 기록됩니다 (기본값 `~/.openclaw/agents/&lt;agentId&gt;/agent/models.json`). 이 파일은 `models.mode`가 `replace`로 설정되지 않은 한 기본적으로 병합됩니다.

일치하는 프로바이더 ID에 대한 병합 모드 우선순위:

- 에이전트 `models.json`에 이미 있는 비어 있지 않은 `baseUrl`이 우선합니다.
- 에이전트 `models.json`의 비어 있지 않은 `apiKey`는 해당 프로바이더가 현재 구성/인증 프로필 컨텍스트에서 SecretRef 관리되지 않는 경우에만 우선합니다.
- SecretRef 관리 프로바이더 `apiKey` 값은 해결된 시크릿을 유지하는 대신 소스 마커 (env 참조의 경우 `ENV_VAR_NAME`, 파일/exec 참조의 경우 `secretref-managed`)에서 새로 고칩니다.
- SecretRef 관리 프로바이더 헤더 값은 소스 마커 (env 참조의 경우 `secretref-env:ENV_VAR_NAME`, 파일/exec 참조의 경우 `secretref-managed`)에서 새로 고칩니다.
- 비어 있거나 누락된 에이전트 `apiKey`/`baseUrl`은 구성 `models.providers`로 폴백합니다.
- 다른 프로바이더 필드는 구성 및 정규화된 카탈로그 데이터에서 새로 고칩니다.

마커 지속성은 소스 권한입니다: OpenClaw는 해결된 런타임 시크릿 값이 아닌 활성 소스 구성 스냅샷 (사전 해결)에서 마커를 씁니다. 이는 `openclaw agent`와 같은 커맨드 기반 경로를 포함하여 OpenClaw가 `models.json`을 재생성할 때마다 적용됩니다.

## 관련 항목

- [모델 프로바이더](/concepts/model-providers) — 프로바이더 라우팅 및 인증
- [모델 장애 조치](/concepts/model-failover) — 폴백 체인
- [이미지 생성](/tools/image-generation) — 이미지 모델 구성
- [음악 생성](/tools/music-generation) — 음악 모델 구성
- [비디오 생성](/tools/video-generation) — 비디오 모델 구성
- [구성 참조](/gateway/configuration-reference#agent-defaults) — 모델 구성 키
