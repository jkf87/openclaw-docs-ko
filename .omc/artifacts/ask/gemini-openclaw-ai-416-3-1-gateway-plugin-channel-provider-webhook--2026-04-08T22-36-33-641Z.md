# gemini advisor artifact

- Provider: gemini
- Exit code: 0
- Created at: 2026-04-08T22:36:33.642Z

## Original task

OpenClaw은 AI 에이전트 게이트웨이 프로젝트입니다. 416개의 영문 기술 문서를 한국어로 번역합니다. 현재 글로서리가 3개 항목뿐입니다. 다음을 제공해주세요: 1) 기술 문서 한국어 번역 시 자연스러운 표현 가이드라인 (예: gateway, plugin, channel, provider, webhook 등의 용어를 한국어로 번역할지 영어 그대로 둘지 결정 기준). 2) 40-50개 핵심 기술 용어의 한국어 번역 추천 (JSON 형식: [{"source":"term","target":"한국어"}]). 한국 개발자 커뮤니티에서 실제로 사용하는 자연스러운 용어를 선택해주세요. 3) 마크다운 기술 문서 번역 시 주의사항 (frontmatter, 코드블록, 링크 처리 등).

## Final prompt

OpenClaw은 AI 에이전트 게이트웨이 프로젝트입니다. 416개의 영문 기술 문서를 한국어로 번역합니다. 현재 글로서리가 3개 항목뿐입니다. 다음을 제공해주세요: 1) 기술 문서 한국어 번역 시 자연스러운 표현 가이드라인 (예: gateway, plugin, channel, provider, webhook 등의 용어를 한국어로 번역할지 영어 그대로 둘지 결정 기준). 2) 40-50개 핵심 기술 용어의 한국어 번역 추천 (JSON 형식: [{"source":"term","target":"한국어"}]). 한국 개발자 커뮤니티에서 실제로 사용하는 자연스러운 용어를 선택해주세요. 3) 마크다운 기술 문서 번역 시 주의사항 (frontmatter, 코드블록, 링크 처리 등).

## Raw output

```text
OpenClaw(AI 에이전트 게이트웨이) 프로젝트의 기술 문서 번역을 위한 가이드라인, 핵심 용어집, 마크다운 번역 주의사항을 정리해 드립니다. 한국 개발자 커뮤니티에서 가장 자연스럽고 표준적으로 사용되는 방식을 기준으로 작성했습니다.

### 1. 기술 문서 한국어 번역 가이드라인 (자연스러운 표현)

기술 문서 번역의 핵심은 **정확성**과 **가독성**입니다. 무리하게 우리말로 순화하기보다는 실무에서 개발자들이 소통할 때 사용하는 용어를 그대로 반영하는 것이 좋습니다.

*   **음역(영어 발음 그대로 표기) 기준:**
    *   **고유 명사 및 아키텍처 구성 요소:** `OpenClaw`, `Gateway`, `Plugin`, `Channel`, `Provider`, `Webhook` 등 시스템의 핵심 컴포넌트나 IT 업계의 표준 명사는 영어 발음 그대로 표기하는 것이 원칙입니다. (예: 게이트웨이, 플러그인, 채널, 프로바이더, 웹훅)
    *   **번역 시 의미가 퇴색되거나 혼동을 주는 경우:** `Context`(문맥보다 컨텍스트), `Instance`(개체/사례보다 인스턴스), `Session`(세션), `Cache`(캐시).
*   **의역/번역 기준:**
    *   **동사형 동작 및 행위:** 명확한 한국어 대응어가 있는 경우 번역합니다. (예: Deploy -> 배포하다, Authenticate -> 인증하다, Integrate -> 통합하다).
    *   **일반적인 UI/개념:** (예: Settings -> 설정, User -> 사용자, Permission -> 권한).
*   **어투 및 문체:**
    *   **존댓말 사용:** `~합니다`, `~입니다`, `~하십시오` (합쇼체)를 사용하여 전문적이고 정중한 톤을 유지합니다.
    *   **능동태 지향:** 영어의 수동태 표현은 가급적 한국어 능동태로 바꾸어 가독성을 높입니다. (예: "The plugin is loaded by the gateway" -> "게이트웨이가 플러그인을 로드합니다.")
    *   **간결성:** 불필요한 조사(의, 에, 대한)의 남용을 줄이고 문장을 짧게 끊어 씁니다. (예: "사용자에 대한 설정" -> "사용자 설정")

---

### 2. 핵심 기술 용어집 (Glossary)

AI 에이전트 및 게이트웨이 시스템에 자주 등장하는 45개의 핵심 용어를 JSON 형식으로 제공합니다. 이 목록을 자동화 스크립트나 번역 메모리(TM) 도구에 바로 적용하실 수 있습니다.

```json
[
  {"source": "Agent", "target": "에이전트"},
  {"source": "Gateway", "target": "게이트웨이"},
  {"source": "Plugin", "target": "플러그인"},
  {"source": "Channel", "target": "채널"},
  {"source": "Provider", "target": "프로바이더"},
  {"source": "Webhook", "target": "웹훅"},
  {"source": "Prompt", "target": "프롬프트"},
  {"source": "Context", "target": "컨텍스트"},
  {"source": "Token", "target": "토큰"},
  {"source": "Inference", "target": "추론"},
  {"source": "Endpoint", "target": "엔드포인트"},
  {"source": "Middleware", "target": "미들웨어"},
  {"source": "Routing", "target": "라우팅"},
  {"source": "Payload", "target": "페이로드"},
  {"source": "Rate limiting", "target": "처리율 제한"},
  {"source": "Load balancing", "target": "로드 밸런싱"},
  {"source": "Configuration", "target": "구성"},
  {"source": "Settings", "target": "설정"},
  {"source": "Deployment", "target": "배포"},
  {"source": "Environment variable", "target": "환경 변수"},
  {"source": "Dependency", "target": "종속성"},
  {"source": "Architecture", "target": "아키텍처"},
  {"source": "Cluster", "target": "클러스터"},
  {"source": "Node", "target": "노드"},
  {"source": "Instance", "target": "인스턴스"},
  {"source": "Authentication", "target": "인증"},
  {"source": "Authorization", "target": "인가"},
  {"source": "Credential", "target": "자격 증명"},
  {"source": "Session", "target": "세션"},
  {"source": "Cache", "target": "캐시"},
  {"source": "Latency", "target": "지연 시간"},
  {"source": "Throughput", "target": "처리량"},
  {"source": "Repository", "target": "리포지토리"},
  {"source": "Directory", "target": "디렉터리"},
  {"source": "Parameter", "target": "매개변수"},
  {"source": "Argument", "target": "인자"},
  {"source": "Property", "target": "속성"},
  {"source": "Method", "target": "메서드"},
  {"source": "Function", "target": "함수"},
  {"source": "Variable", "target": "변수"},
  {"source": "Schema", "target": "스키마"},
  {"source": "Query", "target": "쿼리"},
  {"source": "Request", "target": "요청"},
  {"source": "Response", "target": "응답"},
  {"source": "Exception", "target": "예외"}
]
```
*(참고: `Authorization`은 맥락에 따라 '권한 부여'로 번역하기도 하며, `Directory`는 '디렉토리'가 아닌 '디렉터리'가 외래어 표기법에 맞습니다.)*

---

### 3. 마크다운 기술 문서 번역 시 주의사항

문서를 파싱하고 렌더링하는 시스템(예: Docusaurus, VitePress 등)이 깨지지 않도록 마크다운 문법을 보존하는 것이 중요합니다.

1.  **Frontmatter (문서 메타데이터):**
    *   YAML 형식의 키(Key)는 절대 번역하지 않습니다. 값(Value)만 번역합니다.
    *   ❌ `제목: OpenClaw 시작하기`
    *   ✅ `title: OpenClaw 시작하기`
    *   (주의: `id`나 `slug`와 같은 시스템 식별자 값은 원본 영어 그대로 유지해야 합니다.)
2.  **코드 블록 (Code Blocks):**
    *   백틱 3개(```)로 감싸진 코드 블록 내부의 로직, 변수명, 클래스명 등은 번역하지 않습니다.
    *   단, 코드 블록 내부의 **주석(Comments)**이나 결과물을 설명하는 **출력값(Console output)** 중 사용자의 이해를 돕기 위한 텍스트는 번역하는 것이 좋습니다.
3.  **인라인 코드 (Inline Code):**
    *   문장 중간에 백틱 1개(`)로 감싸진 단어는 명령어, 변수, 파일명 등을 의미하므로 절대 번역하지 않습니다.
    *   (예: "`config.json` 파일을 열어 `timeout` 값을 변경하세요.")
4.  **링크 (Links):**
    *   표시되는 텍스트(대괄호 `[]` 안)만 번역하고, 실제 URL 경로(소괄호 `()` 안)는 원본을 유지합니다.
    *   ✅ `[설치 가이드](https://openclaw.com/docs/install)`
    *   **내부 앵커 링크 주의:** 마크다운에서 제목을 번역하면 자동 생성되는 앵커(Anchor, `#`) 링크가 깨질 수 있습니다. 정적 사이트 생성기의 설정에 따라 앵커 링크도 한국어에 맞춰 수정해야 할 수 있습니다. (예: `[아키텍처](#architecture)` -> 문서 제목이 '아키텍처'로 번역되었다면 `[아키텍처](#아키텍처)`로 수정이 필요할 수 있음)
5.  **콜아웃 및 Admonitions:**
    *   문서 생성기에서 사용하는 특수 문법(예: `:::info`, `> [!WARNING]`)은 그대로 유지하고 내부 텍스트만 번역합니다.
6.  **마크다운 서식 유지:**
    *   **굵게(**)**, *기울임(*)* 등의 텍스트 강조 기호는 한국어 번역 후에도 정확한 위치에 적용하여 강조 포인트를 잃지 않도록 합니다. 띄어쓰기 시 마크다운 기호가 단어와 떨어지지 않도록 주의하세요.


YOLO mode is enabled. All tool calls will be automatically approved.
Loaded cached credentials.
YOLO mode is enabled. All tool calls will be automatically approved.
[ERROR] [IDEClient] Failed to connect to IDE companion extension. Please ensure the extension is running. To install the extension, run /ide install.
Loading extension: Stitch
Loading extension: firebase
Hook registry initialized with 0 hook entries
Server 'chrome-devtools' supports tool updates. Listening for changes...
Server 'firebase' supports tool updates. Listening for changes...

```

## Concise summary

Provider completed successfully. Review the raw output for details.

## Action items

- Review the response and extract decisions you want to apply.
- Capture follow-up implementation tasks if needed.
