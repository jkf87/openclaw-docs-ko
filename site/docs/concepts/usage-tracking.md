---
title: "사용량 추적"
description: "사용량 추적 표면 및 자격 증명 요구사항"
---

# 사용량 추적

## 이것이란

- 프로바이더의 사용량 엔드포인트에서 직접 프로바이더 사용량/할당량을 가져옵니다.
- 예상 비용 없음. 프로바이더가 보고하는 창만.
- 사람이 읽을 수 있는 상태 출력은 업스트림 API가 소비된 할당량, 남은 할당량 또는 원시 카운트만 보고하는 경우에도 `X% left`로 정규화됩니다.
- 세션 수준 `/status` 및 `session_status`는 라이브 세션 스냅샷이 희박할 때 최신 트랜스크립트 사용량 항목으로 폴백할 수 있습니다. 해당 폴백은 누락된 토큰/캐시 카운터를 채우고, 활성 런타임 모델 레이블을 복원할 수 있으며, 세션 메타데이터가 누락되거나 더 작을 때 더 큰 프롬프트 지향 합계를 선호합니다. 기존 0이 아닌 라이브 값은 여전히 우선합니다.

## 표시되는 위치

- 채팅에서 `/status`: 세션 토큰 + 예상 비용 (API 키만)이 있는 이모지가 풍부한 상태 카드. 프로바이더 사용량은 사용 가능한 경우 **현재 모델 프로바이더**에 대해 정규화된 `X% left` 창으로 표시됩니다.
- 채팅에서 `/usage off|tokens|full`: 응답별 사용량 푸터 (OAuth는 토큰만 표시).
- 채팅에서 `/usage cost`: OpenClaw 세션 로그에서 집계된 로컬 비용 요약.
- CLI: `openclaw status --usage`는 프로바이더별 전체 분석을 출력합니다.
- CLI: `openclaw channels list`는 프로바이더 구성 옆에 동일한 사용량 스냅샷을 출력합니다 (`--no-usage`로 건너뛸 수 있음).
- macOS 메뉴바: 컨텍스트 아래의 "Usage" 섹션 (사용 가능한 경우에만).

## 프로바이더 + 자격 증명

- **Anthropic (Claude)**: 인증 프로필의 OAuth 토큰.
- **GitHub Copilot**: 인증 프로필의 OAuth 토큰.
- **Gemini CLI**: 인증 프로필의 OAuth 토큰.
  - JSON 사용량은 `stats`로 폴백합니다. `stats.cached`는 `cacheRead`로 정규화됩니다.
- **OpenAI Codex**: 인증 프로필의 OAuth 토큰 (있는 경우 accountId 사용).
- **MiniMax**: API 키 또는 MiniMax OAuth 인증 프로필. OpenClaw는 `minimax`, `minimax-cn`, `minimax-portal`을 동일한 MiniMax 할당량 표면으로 처리하며, 저장된 MiniMax OAuth가 있으면 선호하고 그렇지 않으면 `MINIMAX_CODE_PLAN_KEY`, `MINIMAX_CODING_API_KEY`, `MINIMAX_API_KEY`로 폴백합니다. MiniMax의 원시 `usage_percent` / `usagePercent` 필드는 **남은** 할당량을 의미하므로 OpenClaw는 표시 전에 반전합니다. 카운트 기반 필드가 있으면 우선합니다.
  - 코딩 플랜 창 레이블은 있는 경우 프로바이더 hours/minutes 필드에서 가져오고, 그런 다음 `start_time` / `end_time` 범위로 폴백합니다.
  - 코딩 플랜 엔드포인트가 `model_remains`를 반환하는 경우, OpenClaw는 채팅 모델 항목을 선호하고, 명시적 `window_hours` / `window_minutes` 필드가 없을 때 타임스탬프에서 창 레이블을 파생하며, 계획 레이블에 모델 이름을 포함합니다.
- **Xiaomi MiMo**: env/구성/인증 저장소를 통한 API 키 (`XIAOMI_API_KEY`).
- **z.ai**: env/구성/인증 저장소를 통한 API 키.

사용 가능한 프로바이더 사용량 인증이 해결되지 않으면 사용량이 숨겨집니다. 프로바이더는 플러그인별 사용량 인증 로직을 제공할 수 있습니다. 그렇지 않으면 OpenClaw는 인증 프로필, 환경 변수, 구성에서 일치하는 OAuth/API 키 자격 증명으로 폴백합니다.
