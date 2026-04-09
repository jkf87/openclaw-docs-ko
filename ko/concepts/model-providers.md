---
summary: "예제 구성 + CLI 흐름이 있는 모델 프로바이더 개요"
read_when:
  - 프로바이더별 모델 설정 참조가 필요한 경우
  - 모델 프로바이더의 예제 구성 또는 CLI 온보딩 커맨드를 원할 때
title: "모델 프로바이더"
---

# 모델 프로바이더

이 페이지는 **LLM/모델 프로바이더** (WhatsApp/Telegram과 같은 채팅 채널이 아님)를 다룹니다.
모델 선택 규칙은 [/concepts/models](/concepts/models)를 참조하십시오.

## 빠른 규칙

- 모델 참조는 `provider/model` 형식을 사용합니다 (예: `opencode/claude-opus-4-6`).
- `agents.defaults.models`를 설정하면 허용 목록이 됩니다.
- CLI 도우미: `openclaw onboard`, `openclaw models list`, `openclaw models set <provider/model>`.
- 폴백 런타임 규칙, 쿨다운 프로브, 세션 오버라이드 지속성은
  [/concepts/model-failover](/concepts/model-failover)에 설명되어 있습니다.
- `models.providers.*.models[].contextWindow`는 기본 모델 메타데이터이고,
  `models.providers.*.models[].contextTokens`는 효과적인 런타임 상한입니다.
- 프로바이더 플러그인은 `registerProvider({ catalog })`를 통해 모델 카탈로그를 주입할 수 있습니다.
  OpenClaw는 해당 출력을 `models.providers`에 병합한 후 `models.json`을 씁니다.
- 프로바이더 매니페스트는 `providerAuthEnvVars` 및 `providerAuthAliases`를 선언하여
  일반 env 기반 인증 프로브 및 프로바이더 변형이 플러그인 런타임을 로드하지 않아도 되게 할 수 있습니다.
  나머지 코어 env 변수 맵은 현재 비플러그인/코어 프로바이더와 Anthropic API-key-first 온보딩과 같은
  몇 가지 일반 우선순위 케이스에만 사용됩니다.
- 프로바이더 플러그인은 `normalizeModelId`, `normalizeTransport`, `normalizeConfig`,
  `applyNativeStreamingUsageCompat`, `resolveConfigApiKey`,
  `resolveSyntheticAuth`, `shouldDeferSyntheticProfileAuth`,
  `resolveDynamicModel`, `prepareDynamicModel`,
  `normalizeResolvedModel`, `contributeResolvedModelCompat`,
  `capabilities`, `normalizeToolSchemas`,
  `inspectToolSchemas`, `resolveReasoningOutputMode`,
  `prepareExtraParams`, `createStreamFn`, `wrapStreamFn`,
  `resolveTransportTurnState`, `resolveWebSocketSessionPolicy`,
  `createEmbeddingProvider`, `formatApiKey`, `refreshOAuth`,
  `buildAuthDoctorHint`,
  `matchesContextOverflowError`, `classifyFailoverReason`,
  `isCacheTtlEligible`, `buildMissingAuthMessage`, `suppressBuiltInModel`,
  `augmentModelCatalog`, `isBinaryThinking`, `supportsXHighThinking`,
  `resolveDefaultThinkingLevel`, `applyConfigDefaults`, `isModernModelRef`,
  `prepareRuntimeAuth`, `resolveUsageAuth`, `fetchUsageSnapshot`,
  `onModelSelected`를 통해 프로바이더 런타임 동작도 소유할 수 있습니다.
- 참고: 프로바이더 런타임 `capabilities`는 공유 러너 메타데이터 (프로바이더 패밀리,
  트랜스크립트/툴링 특이사항, 트랜스포트/캐시 힌트)입니다. 플러그인이 등록하는 것
  (텍스트 추론, 스피치 등)을 설명하는
  [공개 기능 모델](/plugins/architecture#public-capability-model)과는 다릅니다.

## 플러그인 소유 프로바이더 동작

프로바이더 플러그인은 이제 대부분의 프로바이더별 로직을 소유할 수 있으며,
OpenClaw는 일반 추론 루프를 유지합니다.

일반적인 분리:

- `auth[].run` / `auth[].runNonInteractive`: 프로바이더가 `openclaw onboard`,
  `openclaw models auth`, 헤드리스 설정을 위한 온보딩/로그인 흐름을 소유
- `wizard.setup` / `wizard.modelPicker`: 프로바이더가 인증 선택 레이블,
  레거시 별칭, 온보딩 허용 목록 힌트, 온보딩/모델 피커의 설정 항목을 소유
- `catalog`: 프로바이더가 `models.providers`에 나타남
- `normalizeModelId`: 프로바이더가 조회 또는 정규화 전에 레거시/프리뷰 모델 id를 정규화
- `normalizeTransport`: 프로바이더가 일반 모델 어셈블리 전에 트랜스포트 패밀리 `api` / `baseUrl`을
  정규화. OpenClaw는 먼저 일치하는 프로바이더를 확인한 다음 실제로 트랜스포트를 변경하는
  다른 훅 가능한 프로바이더 플러그인을 확인합니다
- `normalizeConfig`: 프로바이더가 런타임이 사용하기 전에 `models.providers.<id>` 구성을 정규화.
  OpenClaw는 먼저 일치하는 프로바이더를 확인한 다음 실제로 구성을 변경하는 다른 훅 가능한
  프로바이더 플러그인을 확인합니다. 프로바이더 훅이 구성을 다시 쓰지 않으면 번들된 Google 패밀리
  도우미가 여전히 지원되는 Google 프로바이더 항목을 정규화합니다
- `applyNativeStreamingUsageCompat`: 프로바이더가 구성 프로바이더에 대한 엔드포인트 기반 네이티브
  스트리밍 사용 호환 재작성을 적용
- `resolveConfigApiKey`: 프로바이더가 전체 런타임 인증 로딩을 강제하지 않고 구성 프로바이더에 대한
  env-마커 인증을 해결. `amazon-bedrock`도 여기에 내장 AWS env-마커 해결기가 있습니다
  (Bedrock 런타임 인증은 AWS SDK 기본 체인을 사용하지만)
- `resolveSyntheticAuth`: 프로바이더가 일반 텍스트 시크릿을 저장하지 않고 로컬/자체 호스팅 또는
  기타 구성 기반 인증 가용성을 노출할 수 있음
- `shouldDeferSyntheticProfileAuth`: 프로바이더가 저장된 합성 프로필 플레이스홀더를 env/구성 기반
  인증보다 낮은 우선순위로 표시할 수 있음
- `resolveDynamicModel`: 프로바이더가 로컬 정적 카탈로그에 아직 없는 모델 id를 수락
- `prepareDynamicModel`: 프로바이더가 동적 해결 재시도 전에 메타데이터 새로 고침이 필요
- `normalizeResolvedModel`: 프로바이더가 트랜스포트 또는 기본 URL 재작성이 필요
- `contributeResolvedModelCompat`: 프로바이더가 다른 호환 트랜스포트를 통해 도착한 경우에도
  벤더 모델에 대한 호환 플래그를 기여
- `capabilities`: 프로바이더가 트랜스크립트/툴링/프로바이더 패밀리 특이사항을 게시
- `normalizeToolSchemas`: 프로바이더가 임베디드 러너가 보기 전에 도구 스키마를 정리
- `inspectToolSchemas`: 프로바이더가 정규화 후 트랜스포트별 스키마 경고를 표시
- `resolveReasoningOutputMode`: 프로바이더가 네이티브 대 태그된 추론 출력 계약을 선택
- `prepareExtraParams`: 프로바이더가 모델별 요청 파라미터 기본값을 설정하거나 정규화
- `createStreamFn`: 프로바이더가 완전히 커스텀 트랜스포트로 일반 스트림 경로를 대체
- `wrapStreamFn`: 프로바이더가 요청 헤더/본문/모델 호환 래퍼를 적용
- `resolveTransportTurnState`: 프로바이더가 턴별 네이티브 트랜스포트 헤더 또는 메타데이터를 제공
- `resolveWebSocketSessionPolicy`: 프로바이더가 네이티브 WebSocket 세션 헤더 또는 세션 쿨다운
  정책을 제공
- `createEmbeddingProvider`: 프로바이더가 코어 임베딩 스위치보드 대신 프로바이더 플러그인에 속하는
  경우 메모리 임베딩 동작을 소유
- `formatApiKey`: 프로바이더가 저장된 인증 프로필을 트랜스포트가 기대하는 런타임 `apiKey` 문자열로
  포맷
- `refreshOAuth`: 공유 `pi-ai` 새로 고침기로 충분하지 않을 때 프로바이더가 OAuth 새로 고침을 소유
- `buildAuthDoctorHint`: OAuth 새로 고침 실패 시 프로바이더가 복구 안내를 추가
- `matchesContextOverflowError`: 프로바이더가 일반 휴리스틱이 놓칠 수 있는 프로바이더별
  컨텍스트 창 오버플로 오류를 인식
- `classifyFailoverReason`: 프로바이더가 프로바이더별 원시 트랜스포트/API 오류를 속도 제한 또는
  과부하 같은 장애 조치 이유로 매핑
- `isCacheTtlEligible`: 프로바이더가 어떤 업스트림 모델 id가 프롬프트 캐시 TTL을 지원하는지 결정
- `buildMissingAuthMessage`: 프로바이더가 일반 인증 저장소 오류를 프로바이더별 복구 힌트로 대체
- `suppressBuiltInModel`: 프로바이더가 오래된 업스트림 행을 숨기고 직접 해결 실패에 대한 벤더 소유
  오류를 반환할 수 있음
- `augmentModelCatalog`: 프로바이더가 탐색 및 구성 병합 후 합성/최종 카탈로그 행을 추가
- `isBinaryThinking`: 프로바이더가 이진 온/오프 thinking UX를 소유
- `supportsXHighThinking`: 프로바이더가 선택된 모델을 `xhigh`에 옵트인
- `resolveDefaultThinkingLevel`: 프로바이더가 모델 패밀리에 대한 기본 `/think` 정책을 소유
- `applyConfigDefaults`: 프로바이더가 인증 모드, env, 또는 모델 패밀리를 기반으로 구성 구체화
  중에 프로바이더별 전역 기본값을 적용
- `isModernModelRef`: 프로바이더가 라이브/스모크 선호 모델 매칭을 소유
- `prepareRuntimeAuth`: 프로바이더가 구성된 자격 증명을 단기 런타임 토큰으로 변환
- `resolveUsageAuth`: 프로바이더가 `/usage` 및 관련 상태/보고 표면에 대한 사용량/할당량
  자격 증명을 해결
- `fetchUsageSnapshot`: 프로바이더가 사용량 엔드포인트 가져오기/파싱을 소유하는 반면
  코어는 여전히 요약 쉘 및 포맷팅을 소유
- `onModelSelected`: 프로바이더가 텔레메트리 또는 프로바이더 소유 세션 북키핑과 같은 선택 후
  부작용을 실행

현재 번들된 예시:

- `anthropic`: Claude 4.6 forward-compat 폴백, 인증 복구 힌트, 사용량 엔드포인트 가져오기,
  캐시-TTL/프로바이더 패밀리 메타데이터, 인증 인식 전역 구성 기본값
- `amazon-bedrock`: Bedrock별 throttle/not-ready 오류에 대한 프로바이더 소유 컨텍스트 오버플로
  매칭 및 장애 조치 이유 분류, Anthropic 전용 트래픽에 대한 Claude 전용 재생 정책 가드를 위한
  공유 `anthropic-by-model` 재생 패밀리
- `anthropic-vertex`: Anthropic 메시지 트래픽에 대한 Claude 전용 재생 정책 가드
- `openrouter`: 통과 모델 id, 요청 래퍼, 프로바이더 기능 힌트, 프록시 Gemini 트래픽에 대한
  Gemini 사고 서명 제거, `openrouter-thinking` 스트림 패밀리를 통한 프록시 추론 주입, 라우팅
  메타데이터 전달, 캐시-TTL 정책
- `github-copilot`: 온보딩/디바이스 로그인, forward-compat 모델 폴백, Claude-thinking 트랜스크립트
  힌트, 런타임 토큰 교환, 사용량 엔드포인트 가져오기
- `openai`: GPT-5.4 forward-compat 폴백, 직접 OpenAI 트랜스포트 정규화, Codex 인식 누락 인증 힌트,
  Spark 억제, 합성 OpenAI/Codex 카탈로그 행, thinking/live-model 정책, 사용량 토큰 별칭 정규화
  (`input` / `output` 및 `prompt` / `completion` 패밀리), 네이티브 OpenAI/Codex 래퍼를 위한
  공유 `openai-responses-defaults` 스트림 패밀리, 프로바이더 패밀리 메타데이터,
  `gpt-image-1`에 대한 번들된 이미지 생성 프로바이더 등록,
  `sora-2`에 대한 번들된 비디오 생성 프로바이더 등록
- `google` 및 `google-gemini-cli`: Gemini 3.1 forward-compat 폴백, 네이티브 Gemini 재생 유효성
  검사, 부트스트랩 재생 제거, 태그된 추론 출력 모드, 모던 모델 매칭, Gemini 이미지 미리보기 모델에
  대한 번들된 이미지 생성 프로바이더 등록, Veo 모델에 대한 번들된 비디오 생성 프로바이더 등록.
  Gemini CLI OAuth도 사용량 표면에 대한 인증 프로필 토큰 포맷팅, 사용량 토큰 파싱,
  할당량 엔드포인트 가져오기를 소유
- `moonshot`: 공유 트랜스포트, 플러그인 소유 thinking 페이로드 정규화
- `kilocode`: 공유 트랜스포트, 플러그인 소유 요청 헤더, 추론 페이로드 정규화,
  프록시-Gemini 사고 서명 제거, 캐시-TTL 정책
- `zai`: GLM-5 forward-compat 폴백, `tool_stream` 기본값, 캐시-TTL 정책, 이진 thinking/live-model
  정책, 사용량 인증 + 할당량 가져오기. 알 수 없는 `glm-5*` id는 번들된 `glm-4.7` 템플릿에서
  합성됩니다
- `xai`: 네이티브 Responses 트랜스포트 정규화, Grok fast 변형에 대한 `/fast` 별칭 재작성,
  기본 `tool_stream`, xAI별 도구 스키마/추론 페이로드 정리,
  `grok-imagine-video`에 대한 번들된 비디오 생성 프로바이더 등록
- `mistral`: 플러그인 소유 기능 메타데이터
- `opencode` 및 `opencode-go`: 플러그인 소유 기능 메타데이터 + 프록시-Gemini 사고 서명 제거
- `alibaba`: `alibaba/wan2.6-t2v`와 같은 직접 Wan 모델 참조에 대한 플러그인 소유 비디오 생성 카탈로그
- `byteplus`: 플러그인 소유 카탈로그 + Seedance 텍스트-비디오/이미지-비디오 모델에 대한 번들된 비디오
  생성 프로바이더 등록
- `fal`: 호스팅된 서드파티 이미지 생성 프로바이더 등록을 위한 FLUX 이미지 모델에 대한 번들된 이미지
  생성 프로바이더 등록 + 호스팅된 서드파티 비디오 모델에 대한 번들된 비디오 생성 프로바이더 등록
- `cloudflare-ai-gateway`, `huggingface`, `kimi`, `nvidia`, `qianfan`,
  `stepfun`, `synthetic`, `venice`, `vercel-ai-gateway`, `volcengine`:
  플러그인 소유 카탈로그만
- `qwen`: 텍스트 모델에 대한 플러그인 소유 카탈로그 + 멀티모달 표면을 위한 공유 미디어 이해 및 비디오
  생성 프로바이더 등록. Qwen 비디오 생성은 `wan2.6-t2v` 및 `wan2.7-r2v`와 같은 번들된 Wan 모델과
  함께 표준 DashScope 비디오 엔드포인트를 사용합니다
- `runway`: `gen4.5`와 같은 네이티브 Runway 태스크 기반 모델에 대한 플러그인 소유 비디오 생성
  프로바이더 등록
- `minimax`: 플러그인 소유 카탈로그, Hailuo 비디오 모델에 대한 번들된 비디오 생성 프로바이더 등록,
  `image-01`에 대한 번들된 이미지 생성 프로바이더 등록, 하이브리드 Anthropic/OpenAI 재생 정책 선택,
  사용량 인증/스냅샷 로직
- `together`: 플러그인 소유 카탈로그 + Wan 비디오 모델에 대한 번들된 비디오 생성 프로바이더 등록
- `xiaomi`: 플러그인 소유 카탈로그 + 사용량 인증/스냅샷 로직

번들된 `openai` 플러그인은 이제 두 프로바이더 id를 모두 소유합니다: `openai` 및 `openai-codex`.

이것으로 OpenClaw의 일반 트랜스포트에 적합한 프로바이더가 다루어집니다. 완전히 커스텀 요청 실행기가
필요한 프로바이더는 별도의 더 깊은 확장 표면입니다.

## API 키 순환

- 선택된 프로바이더에 대한 일반 프로바이더 순환을 지원합니다.
- 다음을 통해 여러 키를 구성합니다:
  - `OPENCLAW_LIVE_<PROVIDER>_KEY` (단일 라이브 오버라이드, 최고 우선순위)
  - `<PROVIDER>_API_KEYS` (쉼표 또는 세미콜론 목록)
  - `<PROVIDER>_API_KEY` (기본 키)
  - `<PROVIDER>_API_KEY_*` (번호 매긴 목록, 예: `<PROVIDER>_API_KEY_1`)
- Google 프로바이더의 경우 `GOOGLE_API_KEY`도 폴백으로 포함됩니다.
- 키 선택 순서는 우선순위를 유지하고 값을 중복 제거합니다.
- 요청은 속도 제한 응답에서만 다음 키로 재시도됩니다 (예: `429`, `rate_limit`, `quota`,
  `resource exhausted`, `Too many concurrent requests`, `ThrottlingException`,
  `concurrency limit reached`, `workers_ai ... quota limit exceeded`, 또는 주기적 사용량 제한 메시지).
- 속도 제한이 아닌 실패는 즉시 실패합니다. 키 순환이 시도되지 않습니다.
- 모든 후보 키가 실패하면 마지막 시도의 최종 오류가 반환됩니다.

## 내장 프로바이더 (pi-ai 카탈로그)

OpenClaw는 pi-ai 카탈로그와 함께 제공됩니다. 이 프로바이더는 `models.providers` 구성이 **불필요**합니다.
인증을 설정하고 모델을 선택하기만 하면 됩니다.

### OpenAI

- 프로바이더: `openai`
- 인증: `OPENAI_API_KEY`
- 선택적 순환: `OPENAI_API_KEYS`, `OPENAI_API_KEY_1`, `OPENAI_API_KEY_2`, `OPENCLAW_LIVE_OPENAI_KEY` (단일 오버라이드)
- 예제 모델: `openai/gpt-5.4`, `openai/gpt-5.4-pro`
- CLI: `openclaw onboard --auth-choice openai-api-key`
- 기본 트랜스포트는 `auto` (WebSocket 우선, SSE 폴백)
- `agents.defaults.models["openai/<model>"].params.transport` (`"sse"`, `"websocket"`, 또는 `"auto"`)를 통해 모델별 오버라이드 가능
- OpenAI Responses WebSocket 웜업은 `params.openaiWsWarmup` (`true`/`false`)를 통해 기본으로 활성화됩니다
- OpenAI 우선 처리는 `agents.defaults.models["openai/<model>"].params.serviceTier`를 통해 활성화할 수 있습니다
- `/fast` 및 `params.fastMode`는 `api.openai.com`에 대한 직접 `openai/*` Responses 요청을 `service_tier=priority`에 매핑합니다
- 공유 `/fast` 토글 대신 명시적인 티어를 원할 때 `params.serviceTier`를 사용하십시오
- 숨겨진 OpenClaw 어트리뷰션 헤더 (`originator`, `version`, `User-Agent`)는
  `api.openai.com`에 대한 네이티브 OpenAI 트래픽에만 적용되며, 일반 OpenAI 호환 프록시에는 적용되지 않습니다
- 네이티브 OpenAI 경로도 Responses `store`, 프롬프트 캐시 힌트, OpenAI 추론 호환 페이로드 셰이핑을 유지합니다.
  프록시 경로는 그렇지 않습니다
- `openai/gpt-5.3-codex-spark`는 라이브 OpenAI API가 거부하므로 OpenClaw에서 의도적으로 억제됩니다.
  Spark는 Codex 전용으로 처리됩니다

```json5
{
  agents: { defaults: { model: { primary: "openai/gpt-5.4" } } },
}
```

### Anthropic

- 프로바이더: `anthropic`
- 인증: `ANTHROPIC_API_KEY`
- 선택적 순환: `ANTHROPIC_API_KEYS`, `ANTHROPIC_API_KEY_1`, `ANTHROPIC_API_KEY_2`, `OPENCLAW_LIVE_ANTHROPIC_KEY` (단일 오버라이드)
- 예제 모델: `anthropic/claude-opus-4-6`
- CLI: `openclaw onboard --auth-choice apiKey`
- `api.anthropic.com`에 전송되는 API 키 및 OAuth 인증 트래픽을 포함하여 직접 공개 Anthropic 요청은
  공유 `/fast` 토글 및 `params.fastMode`를 지원합니다. OpenClaw는 이를 Anthropic `service_tier`
  (`auto` 대 `standard_only`)에 매핑합니다
- Anthropic 참고: Anthropic 직원이 OpenClaw 스타일 Claude CLI 사용이 다시 허용된다고 알려주었으므로,
  OpenClaw는 Anthropic이 새 정책을 게시하지 않는 한 Claude CLI 재사용 및 `claude -p` 사용을
  이 통합에서 허가된 것으로 처리합니다
- Anthropic 설정 토큰은 지원되는 OpenClaw 토큰 경로로 여전히 사용 가능하지만, OpenClaw는 이제 가능한
  경우 Claude CLI 재사용 및 `claude -p`를 선호합니다

```json5
{
  agents: { defaults: { model: { primary: "anthropic/claude-opus-4-6" } } },
}
```

### OpenAI Code (Codex)

- 프로바이더: `openai-codex`
- 인증: OAuth (ChatGPT)
- 예제 모델: `openai-codex/gpt-5.4`
- CLI: `openclaw onboard --auth-choice openai-codex` 또는 `openclaw models auth login --provider openai-codex`
- 기본 트랜스포트는 `auto` (WebSocket 우선, SSE 폴백)
- `agents.defaults.models["openai-codex/<model>"].params.transport` (`"sse"`, `"websocket"`, 또는 `"auto"`)를 통해 모델별 오버라이드 가능
- `params.serviceTier`도 네이티브 Codex Responses 요청 (`chatgpt.com/backend-api`)에서 전달됩니다
- 숨겨진 OpenClaw 어트리뷰션 헤더 (`originator`, `version`, `User-Agent`)는
  `chatgpt.com/backend-api`에 대한 네이티브 Codex 트래픽에만 첨부되며, 일반 OpenAI 호환 프록시에는 적용되지 않습니다
- 직접 `openai/*`와 동일한 `/fast` 토글 및 `params.fastMode` 구성을 공유합니다. OpenClaw는 이를
  `service_tier=priority`에 매핑합니다
- `openai-codex/gpt-5.3-codex-spark`는 Codex OAuth 카탈로그가 노출할 때 사용 가능합니다. 자격 부여에 따라 다릅니다
- `openai-codex/gpt-5.4`는 네이티브 `contextWindow = 1050000`과 기본 런타임 `contextTokens = 272000`을 유지합니다.
  `models.providers.openai-codex.models[].contextTokens`로 런타임 상한을 오버라이드하십시오
- 정책 참고: OpenAI Codex OAuth는 OpenClaw와 같은 외부 도구/워크플로를 위해 명시적으로 지원됩니다

```json5
{
  agents: { defaults: { model: { primary: "openai-codex/gpt-5.4" } } },
}
```

```json5
{
  models: {
    providers: {
      "openai-codex": {
        models: [{ id: "gpt-5.4", contextTokens: 160000 }],
      },
    },
  },
}
```

### 기타 구독형 호스팅 옵션

- [Qwen Cloud](/providers/qwen): Qwen Cloud 프로바이더 표면 + Alibaba DashScope 및 Coding Plan 엔드포인트 매핑
- [MiniMax](/providers/minimax): MiniMax Coding Plan OAuth 또는 API 키 액세스
- [GLM 모델](/providers/glm): Z.AI Coding Plan 또는 일반 API 엔드포인트

### OpenCode

- 인증: `OPENCODE_API_KEY` (또는 `OPENCODE_ZEN_API_KEY`)
- Zen 런타임 프로바이더: `opencode`
- Go 런타임 프로바이더: `opencode-go`
- 예제 모델: `opencode/claude-opus-4-6`, `opencode-go/kimi-k2.5`
- CLI: `openclaw onboard --auth-choice opencode-zen` 또는 `openclaw onboard --auth-choice opencode-go`

```json5
{
  agents: { defaults: { model: { primary: "opencode/claude-opus-4-6" } } },
}
```

### Google Gemini (API 키)

- 프로바이더: `google`
- 인증: `GEMINI_API_KEY`
- 선택적 순환: `GEMINI_API_KEYS`, `GEMINI_API_KEY_1`, `GEMINI_API_KEY_2`, `GOOGLE_API_KEY` 폴백, `OPENCLAW_LIVE_GEMINI_KEY` (단일 오버라이드)
- 예제 모델: `google/gemini-3.1-pro-preview`, `google/gemini-3-flash-preview`
- 호환성: `google/gemini-3.1-flash-preview`를 사용하는 레거시 OpenClaw 구성은 `google/gemini-3-flash-preview`로 정규화됩니다
- CLI: `openclaw onboard --auth-choice gemini-api-key`
- 직접 Gemini 실행은 `agents.defaults.models["google/<model>"].params.cachedContent` (또는 레거시 `cached_content`)도 허용합니다.
  이는 프로바이더 네이티브 `cachedContents/...` 핸들을 전달하며, Gemini 캐시 히트는 OpenClaw `cacheRead`로 표시됩니다

### Google Vertex 및 Gemini CLI

- 프로바이더: `google-vertex`, `google-gemini-cli`
- 인증: Vertex는 gcloud ADC 사용. Gemini CLI는 OAuth 흐름 사용
- 주의: OpenClaw에서의 Gemini CLI OAuth는 비공식 통합입니다. 일부 사용자가 서드파티 클라이언트 사용 후
  Google 계정 제한을 경험했다고 보고했습니다. Google 약관을 검토하고 진행하기로 결정했다면 중요하지 않은
  계정을 사용하십시오
- Gemini CLI OAuth는 번들된 `google` 플러그인의 일부로 제공됩니다
  - 먼저 Gemini CLI를 설치하십시오:
    - `brew install gemini-cli`
    - 또는 `npm install -g @google/gemini-cli`
  - 활성화: `openclaw plugins enable google`
  - 로그인: `openclaw models auth login --provider google-gemini-cli --set-default`
  - 기본 모델: `google-gemini-cli/gemini-3-flash-preview`
  - 참고: `openclaw.json`에 클라이언트 id나 시크릿을 붙여넣지 **마십시오**. CLI 로그인 흐름이 게이트웨이
    호스트의 인증 프로필에 토큰을 저장합니다
  - 로그인 후 요청이 실패하면 게이트웨이 호스트에 `GOOGLE_CLOUD_PROJECT` 또는
    `GOOGLE_CLOUD_PROJECT_ID`를 설정하십시오
  - Gemini CLI JSON 응답은 `response`에서 파싱됩니다. 사용량은 `stats`로 폴백하며,
    `stats.cached`는 OpenClaw `cacheRead`로 정규화됩니다

### Z.AI (GLM)

- 프로바이더: `zai`
- 인증: `ZAI_API_KEY`
- 예제 모델: `zai/glm-5.1`
- CLI: `openclaw onboard --auth-choice zai-api-key`
  - 별칭: `z.ai/*` 및 `z-ai/*`는 `zai/*`로 정규화됩니다
  - `zai-api-key`는 일치하는 Z.AI 엔드포인트를 자동 감지합니다. `zai-coding-global`, `zai-coding-cn`,
    `zai-global`, `zai-cn`은 특정 표면을 강제합니다

### Vercel AI Gateway

- 프로바이더: `vercel-ai-gateway`
- 인증: `AI_GATEWAY_API_KEY`
- 예제 모델: `vercel-ai-gateway/anthropic/claude-opus-4.6`
- CLI: `openclaw onboard --auth-choice ai-gateway-api-key`

### Kilo Gateway

- 프로바이더: `kilocode`
- 인증: `KILOCODE_API_KEY`
- 예제 모델: `kilocode/kilo/auto`
- CLI: `openclaw onboard --auth-choice kilocode-api-key`
- 기본 URL: `https://api.kilo.ai/api/gateway/`
- 정적 폴백 카탈로그는 `kilocode/kilo/auto`를 제공합니다. 라이브 `https://api.kilo.ai/api/gateway/models`
  탐색이 런타임 카탈로그를 추가로 확장할 수 있습니다
- `kilocode/kilo/auto` 뒤의 정확한 업스트림 라우팅은 OpenClaw가 아닌 Kilo Gateway가 소유합니다

설정 세부사항은 [/providers/kilocode](/providers/kilocode)를 참조하십시오.

### 기타 번들된 프로바이더 플러그인

- OpenRouter: `openrouter` (`OPENROUTER_API_KEY`)
- 예제 모델: `openrouter/auto`
- OpenClaw는 요청이 실제로 `openrouter.ai`를 대상으로 할 때만 OpenRouter 공식 앱 어트리뷰션 헤더를 적용합니다
- OpenRouter별 Anthropic `cache_control` 마커도 검증된 OpenRouter 경로로만 게이팅됩니다. 임의 프록시 URL에는 적용되지 않습니다
- OpenRouter는 프록시 스타일 OpenAI 호환 경로에 있으므로 네이티브 OpenAI 전용 요청 셰이핑
  (`serviceTier`, Responses `store`, 프롬프트 캐시 힌트, OpenAI 추론 호환 페이로드)은 전달되지 않습니다
- Gemini 기반 OpenRouter 참조는 프록시-Gemini 사고 서명 제거만 유지합니다. 네이티브 Gemini 재생 유효성 검사
  및 부트스트랩 재작성은 비활성화됩니다
- Kilo Gateway: `kilocode` (`KILOCODE_API_KEY`)
- 예제 모델: `kilocode/kilo/auto`
- Gemini 기반 Kilo 참조는 동일한 프록시-Gemini 사고 서명 제거 경로를 유지합니다. `kilocode/kilo/auto` 및
  기타 프록시 추론 비지원 힌트는 프록시 추론 주입을 건너뜁니다
- MiniMax: `minimax` (API 키) 및 `minimax-portal` (OAuth)
- 인증: `minimax`에는 `MINIMAX_API_KEY`. `minimax-portal`에는 `MINIMAX_OAUTH_TOKEN` 또는 `MINIMAX_API_KEY`
- 예제 모델: `minimax/MiniMax-M2.7` 또는 `minimax-portal/MiniMax-M2.7`
- MiniMax 온보딩/API 키 설정은 `input: ["text", "image"]`가 있는 명시적 M2.7 모델 정의를 씁니다.
  해당 프로바이더 구성이 구체화될 때까지 번들된 프로바이더 카탈로그는 채팅 참조를 텍스트 전용으로 유지합니다
- Moonshot: `moonshot` (`MOONSHOT_API_KEY`)
- 예제 모델: `moonshot/kimi-k2.5`
- Kimi Coding: `kimi` (`KIMI_API_KEY` 또는 `KIMICODE_API_KEY`)
- 예제 모델: `kimi/kimi-code`
- Qianfan: `qianfan` (`QIANFAN_API_KEY`)
- 예제 모델: `qianfan/deepseek-v3.2`
- Qwen Cloud: `qwen` (`QWEN_API_KEY`, `MODELSTUDIO_API_KEY`, 또는 `DASHSCOPE_API_KEY`)
- 예제 모델: `qwen/qwen3.5-plus`
- NVIDIA: `nvidia` (`NVIDIA_API_KEY`)
- 예제 모델: `nvidia/nvidia/llama-3.1-nemotron-70b-instruct`
- StepFun: `stepfun` / `stepfun-plan` (`STEPFUN_API_KEY`)
- 예제 모델: `stepfun/step-3.5-flash`, `stepfun-plan/step-3.5-flash-2603`
- Together: `together` (`TOGETHER_API_KEY`)
- 예제 모델: `together/moonshotai/Kimi-K2.5`
- Venice: `venice` (`VENICE_API_KEY`)
- Xiaomi: `xiaomi` (`XIAOMI_API_KEY`)
- 예제 모델: `xiaomi/mimo-v2-flash`
- Vercel AI Gateway: `vercel-ai-gateway` (`AI_GATEWAY_API_KEY`)
- Hugging Face Inference: `huggingface` (`HUGGINGFACE_HUB_TOKEN` 또는 `HF_TOKEN`)
- Cloudflare AI Gateway: `cloudflare-ai-gateway` (`CLOUDFLARE_AI_GATEWAY_API_KEY`)
- Volcengine: `volcengine` (`VOLCANO_ENGINE_API_KEY`)
- 예제 모델: `volcengine-plan/ark-code-latest`
- BytePlus: `byteplus` (`BYTEPLUS_API_KEY`)
- 예제 모델: `byteplus-plan/ark-code-latest`
- xAI: `xai` (`XAI_API_KEY`)
  - 네이티브 번들된 xAI 요청은 xAI Responses 경로를 사용합니다
  - `/fast` 또는 `params.fastMode: true`는 `grok-3`, `grok-3-mini`, `grok-4`, `grok-4-0709`를
    `*-fast` 변형으로 재작성합니다
  - `tool_stream`이 기본으로 활성화됩니다. 비활성화하려면
    `agents.defaults.models["xai/<model>"].params.tool_stream`을 `false`로 설정하십시오
- Mistral: `mistral` (`MISTRAL_API_KEY`)
- 예제 모델: `mistral/mistral-large-latest`
- CLI: `openclaw onboard --auth-choice mistral-api-key`
- Groq: `groq` (`GROQ_API_KEY`)
- Cerebras: `cerebras` (`CEREBRAS_API_KEY`)
  - Cerebras의 GLM 모델은 `zai-glm-4.7` 및 `zai-glm-4.6` id를 사용합니다
  - OpenAI 호환 기본 URL: `https://api.cerebras.ai/v1`
- GitHub Copilot: `github-copilot` (`COPILOT_GITHUB_TOKEN` / `GH_TOKEN` / `GITHUB_TOKEN`)
- Hugging Face Inference 예제 모델: `huggingface/deepseek-ai/DeepSeek-R1`. CLI: `openclaw onboard --auth-choice huggingface-api-key`.
  [Hugging Face (Inference)](/providers/huggingface)를 참조하십시오.

## `models.providers`를 통한 프로바이더 (커스텀/기본 URL)

`models.providers` (또는 `models.json`)를 사용하여 **커스텀** 프로바이더 또는
OpenAI/Anthropic 호환 프록시를 추가하십시오.

아래의 많은 번들된 프로바이더 플러그인은 이미 기본 카탈로그를 게시합니다.
기본 URL, 헤더, 또는 모델 목록을 오버라이드하려는 경우에만 명시적인
`models.providers.<id>` 항목을 사용하십시오.

### Moonshot AI (Kimi)

Moonshot은 번들된 프로바이더 플러그인으로 제공됩니다. 기본적으로 내장 프로바이더를 사용하고,
기본 URL 또는 모델 메타데이터를 오버라이드해야 하는 경우에만 명시적인 `models.providers.moonshot` 항목을 추가하십시오:

- 프로바이더: `moonshot`
- 인증: `MOONSHOT_API_KEY`
- 예제 모델: `moonshot/kimi-k2.5`
- CLI: `openclaw onboard --auth-choice moonshot-api-key` 또는 `openclaw onboard --auth-choice moonshot-api-key-cn`

Kimi K2 모델 ID:

[//]: # "moonshot-kimi-k2-model-refs:start"

- `moonshot/kimi-k2.5`
- `moonshot/kimi-k2-thinking`
- `moonshot/kimi-k2-thinking-turbo`
- `moonshot/kimi-k2-turbo`

[//]: # "moonshot-kimi-k2-model-refs:end"

```json5
{
  agents: {
    defaults: { model: { primary: "moonshot/kimi-k2.5" } },
  },
  models: {
    mode: "merge",
    providers: {
      moonshot: {
        baseUrl: "https://api.moonshot.ai/v1",
        apiKey: "${MOONSHOT_API_KEY}",
        api: "openai-completions",
        models: [{ id: "kimi-k2.5", name: "Kimi K2.5" }],
      },
    },
  },
}
```

### Kimi Coding

Kimi Coding은 Moonshot AI의 Anthropic 호환 엔드포인트를 사용합니다:

- 프로바이더: `kimi`
- 인증: `KIMI_API_KEY`
- 예제 모델: `kimi/kimi-code`

```json5
{
  env: { KIMI_API_KEY: "sk-..." },
  agents: {
    defaults: { model: { primary: "kimi/kimi-code" } },
  },
}
```

레거시 `kimi/k2p5`는 호환성 모델 id로 계속 허용됩니다.

### Volcano Engine (Doubao)

Volcano Engine (火山引擎)은 중국에서 Doubao 및 기타 모델에 대한 액세스를 제공합니다.

- 프로바이더: `volcengine` (코딩: `volcengine-plan`)
- 인증: `VOLCANO_ENGINE_API_KEY`
- 예제 모델: `volcengine-plan/ark-code-latest`
- CLI: `openclaw onboard --auth-choice volcengine-api-key`

```json5
{
  agents: {
    defaults: { model: { primary: "volcengine-plan/ark-code-latest" } },
  },
}
```

온보딩은 기본적으로 코딩 표면으로 설정되지만, 일반 `volcengine/*` 카탈로그도 동시에 등록됩니다.

온보딩/모델 구성 피커에서 Volcengine 인증 선택은 `volcengine/*` 및 `volcengine-plan/*` 행을 모두
선호합니다. 해당 모델이 아직 로드되지 않은 경우, OpenClaw는 빈 프로바이더 범위 피커를 표시하는 대신
필터링되지 않은 카탈로그로 폴백합니다.

사용 가능한 모델:

- `volcengine/doubao-seed-1-8-251228` (Doubao Seed 1.8)
- `volcengine/doubao-seed-code-preview-251028`
- `volcengine/kimi-k2-5-260127` (Kimi K2.5)
- `volcengine/glm-4-7-251222` (GLM 4.7)
- `volcengine/deepseek-v3-2-251201` (DeepSeek V3.2 128K)

코딩 모델 (`volcengine-plan`):

- `volcengine-plan/ark-code-latest`
- `volcengine-plan/doubao-seed-code`
- `volcengine-plan/kimi-k2.5`
- `volcengine-plan/kimi-k2-thinking`
- `volcengine-plan/glm-4.7`

### BytePlus (국제)

BytePlus ARK는 국제 사용자를 위해 Volcano Engine과 동일한 모델에 대한 액세스를 제공합니다.

- 프로바이더: `byteplus` (코딩: `byteplus-plan`)
- 인증: `BYTEPLUS_API_KEY`
- 예제 모델: `byteplus-plan/ark-code-latest`
- CLI: `openclaw onboard --auth-choice byteplus-api-key`

```json5
{
  agents: {
    defaults: { model: { primary: "byteplus-plan/ark-code-latest" } },
  },
}
```

온보딩은 기본적으로 코딩 표면으로 설정되지만, 일반 `byteplus/*` 카탈로그도 동시에 등록됩니다.

온보딩/모델 구성 피커에서 BytePlus 인증 선택은 `byteplus/*` 및 `byteplus-plan/*` 행을 모두 선호합니다.
해당 모델이 아직 로드되지 않은 경우, OpenClaw는 빈 프로바이더 범위 피커를 표시하는 대신
필터링되지 않은 카탈로그로 폴백합니다.

사용 가능한 모델:

- `byteplus/seed-1-8-251228` (Seed 1.8)
- `byteplus/kimi-k2-5-260127` (Kimi K2.5)
- `byteplus/glm-4-7-251222` (GLM 4.7)

코딩 모델 (`byteplus-plan`):

- `byteplus-plan/ark-code-latest`
- `byteplus-plan/doubao-seed-code`
- `byteplus-plan/kimi-k2.5`
- `byteplus-plan/kimi-k2-thinking`
- `byteplus-plan/glm-4.7`

### Synthetic

Synthetic은 `synthetic` 프로바이더 뒤에 Anthropic 호환 모델을 제공합니다:

- 프로바이더: `synthetic`
- 인증: `SYNTHETIC_API_KEY`
- 예제 모델: `synthetic/hf:MiniMaxAI/MiniMax-M2.5`
- CLI: `openclaw onboard --auth-choice synthetic-api-key`

```json5
{
  agents: {
    defaults: { model: { primary: "synthetic/hf:MiniMaxAI/MiniMax-M2.5" } },
  },
  models: {
    mode: "merge",
    providers: {
      synthetic: {
        baseUrl: "https://api.synthetic.new/anthropic",
        apiKey: "${SYNTHETIC_API_KEY}",
        api: "anthropic-messages",
        models: [{ id: "hf:MiniMaxAI/MiniMax-M2.5", name: "MiniMax M2.5" }],
      },
    },
  },
}
```

### MiniMax

MiniMax는 커스텀 엔드포인트를 사용하므로 `models.providers`를 통해 구성됩니다:

- MiniMax OAuth (글로벌): `--auth-choice minimax-global-oauth`
- MiniMax OAuth (CN): `--auth-choice minimax-cn-oauth`
- MiniMax API 키 (글로벌): `--auth-choice minimax-global-api`
- MiniMax API 키 (CN): `--auth-choice minimax-cn-api`
- 인증: `minimax`에는 `MINIMAX_API_KEY`. `minimax-portal`에는 `MINIMAX_OAUTH_TOKEN` 또는 `MINIMAX_API_KEY`

설정 세부사항, 모델 옵션, 구성 스니펫은 [/providers/minimax](/providers/minimax)를 참조하십시오.

MiniMax의 Anthropic 호환 스트리밍 경로에서 OpenClaw는 명시적으로 설정하지 않는 한 기본적으로 thinking을
비활성화하고, `/fast on`은 `MiniMax-M2.7`을 `MiniMax-M2.7-highspeed`로 재작성합니다.

플러그인 소유 기능 분리:

- 텍스트/채팅 기본값은 `minimax/MiniMax-M2.7`에 유지됩니다
- 이미지 생성은 `minimax/image-01` 또는 `minimax-portal/image-01`입니다
- 이미지 이해는 두 MiniMax 인증 경로 모두에서 플러그인 소유 `MiniMax-VL-01`입니다
- 웹 검색은 프로바이더 id `minimax`에 유지됩니다

### Ollama

Ollama는 번들된 프로바이더 플러그인으로 제공되며 Ollama의 네이티브 API를 사용합니다:

- 프로바이더: `ollama`
- 인증: 불필요 (로컬 서버)
- 예제 모델: `ollama/llama3.3`
- 설치: [https://ollama.com/download](https://ollama.com/download)

```bash
# Ollama를 설치한 다음 모델을 가져옵니다:
ollama pull llama3.3
```

```json5
{
  agents: {
    defaults: { model: { primary: "ollama/llama3.3" } },
  },
}
```

Ollama는 `OLLAMA_API_KEY`로 옵트인할 때 `http://127.0.0.1:11434`에서 로컬로 감지되며, 번들된 프로바이더
플러그인이 Ollama를 `openclaw onboard` 및 모델 피커에 직접 추가합니다. 온보딩, 클라우드/로컬 모드,
커스텀 구성은 [/providers/ollama](/providers/ollama)를 참조하십시오.

### vLLM

vLLM은 로컬/자체 호스팅 OpenAI 호환 서버를 위한 번들된 프로바이더 플러그인으로 제공됩니다:

- 프로바이더: `vllm`
- 인증: 선택적 (서버에 따라 다름)
- 기본 기본 URL: `http://127.0.0.1:8000/v1`

로컬에서 자동 탐색에 옵트인하려면 (서버가 인증을 강제하지 않는 경우 임의의 값 사용):

```bash
export VLLM_API_KEY="vllm-local"
```

그런 다음 모델을 설정합니다 (`/v1/models`가 반환하는 id 중 하나로 교체):

```json5
{
  agents: {
    defaults: { model: { primary: "vllm/your-model-id" } },
  },
}
```

세부사항은 [/providers/vllm](/providers/vllm)를 참조하십시오.

### SGLang

SGLang은 빠른 자체 호스팅 OpenAI 호환 서버를 위한 번들된 프로바이더 플러그인으로 제공됩니다:

- 프로바이더: `sglang`
- 인증: 선택적 (서버에 따라 다름)
- 기본 기본 URL: `http://127.0.0.1:30000/v1`

로컬에서 자동 탐색에 옵트인하려면 (서버가 인증을 강제하지 않는 경우 임의의 값 사용):

```bash
export SGLANG_API_KEY="sglang-local"
```

그런 다음 모델을 설정합니다 (`/v1/models`가 반환하는 id 중 하나로 교체):

```json5
{
  agents: {
    defaults: { model: { primary: "sglang/your-model-id" } },
  },
}
```

세부사항은 [/providers/sglang](/providers/sglang)를 참조하십시오.

### 로컬 프록시 (LM Studio, vLLM, LiteLLM 등)

예시 (OpenAI 호환):

```json5
{
  agents: {
    defaults: {
      model: { primary: "lmstudio/my-local-model" },
      models: { "lmstudio/my-local-model": { alias: "Local" } },
    },
  },
  models: {
    providers: {
      lmstudio: {
        baseUrl: "http://localhost:1234/v1",
        apiKey: "LMSTUDIO_KEY",
        api: "openai-completions",
        models: [
          {
            id: "my-local-model",
            name: "Local Model",
            reasoning: false,
            input: ["text"],
            cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
            contextWindow: 200000,
            maxTokens: 8192,
          },
        ],
      },
    },
  },
}
```

참고:

- 커스텀 프로바이더의 경우 `reasoning`, `input`, `cost`, `contextWindow`, `maxTokens`는 선택적입니다.
  생략하면 OpenClaw는 다음을 기본값으로 사용합니다:
  - `reasoning: false`
  - `input: ["text"]`
  - `cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 }`
  - `contextWindow: 200000`
  - `maxTokens: 8192`
- 권장: 프록시/모델 한도와 일치하는 명시적인 값을 설정하십시오.
- `api: "openai-completions"`를 사용하는 비네이티브 엔드포인트 (호스트가 `api.openai.com`이 아닌 비어 있지 않은
  `baseUrl`)의 경우, OpenClaw는 지원되지 않는 `developer` 역할에 대한 프로바이더 400 오류를 피하기 위해
  `compat.supportsDeveloperRole: false`를 강제합니다
- 프록시 스타일 OpenAI 호환 경로도 네이티브 OpenAI 전용 요청 셰이핑을 건너뜁니다:
  `service_tier` 없음, Responses `store` 없음, 프롬프트 캐시 힌트 없음,
  OpenAI 추론 호환 페이로드 셰이핑 없음, 숨겨진 OpenClaw 어트리뷰션 헤더 없음.
- `baseUrl`이 비어 있거나 생략된 경우, OpenClaw는 기본 OpenAI 동작을 유지합니다 (`api.openai.com`으로 해결됩니다).
- 안전을 위해 비네이티브 `openai-completions` 엔드포인트에 대한 명시적인 `compat.supportsDeveloperRole: true`는 여전히 오버라이드됩니다.

## CLI 예시

```bash
openclaw onboard --auth-choice opencode-zen
openclaw models set opencode/claude-opus-4-6
openclaw models list
```

전체 구성 예시는 [/gateway/configuration](/gateway/configuration)을 참조하십시오.

## 관련 항목

- [모델](/concepts/models) — 모델 구성 및 별칭
- [모델 장애 조치](/concepts/model-failover) — 폴백 체인 및 재시도 동작
- [구성 참조](/gateway/configuration-reference#agent-defaults) — 모델 구성 키
- [프로바이더](/providers/) — 프로바이더별 설정 가이드
