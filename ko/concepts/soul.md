---
summary: "SOUL.md를 사용하여 OpenClaw 에이전트에게 일반적인 어시스턴트 느낌 대신 실제 목소리를 부여하세요"
read_when:
  - 에이전트가 덜 일반적으로 들리기를 원하는 경우
  - SOUL.md를 편집하는 경우
  - 안전성이나 간결성을 해치지 않고 더 강한 개성을 원하는 경우
title: "SOUL.md 개성 가이드"
---

# SOUL.md 개성 가이드

`SOUL.md`는 에이전트의 목소리가 있는 곳입니다.

OpenClaw는 일반 세션에 이를 주입하므로 실제 무게감이 있습니다. 에이전트가 무미건조하거나, 조심스럽거나, 이상하게 기업적으로 들린다면 보통 이 파일을 고쳐야 합니다.

## SOUL.md에 속하는 것

에이전트와 대화하는 느낌을 바꾸는 것들:

- 톤
- 의견
- 간결성
- 유머
- 경계
- 기본 직설적임 수준

다음으로 만들지 **마십시오**:

- 인생 이야기
- 변경 로그
- 보안 정책 덤프
- 행동적 효과가 없는 거대한 분위기 벽

짧은 것이 긴 것보다 낫습니다. 날카로운 것이 모호한 것보다 낫습니다.

## 이것이 작동하는 이유

이는 OpenAI의 프롬프트 지침과 일치합니다:

- 프롬프트 엔지니어링 가이드는 고수준 동작, 톤, 목표, 예시가 사용자 턴에 묻히는 것이 아닌 우선순위가 높은 명령 레이어에 속한다고 말합니다.
- 동일한 가이드는 프롬프트를 한 번 작성하고 잊는 마법 같은 산문이 아닌, 반복하고 고정하고 평가하는 것으로 처리할 것을 권장합니다.

OpenClaw에서 `SOUL.md`가 바로 그 레이어입니다.

더 나은 개성을 원하면 더 강한 지침을 작성하십시오. 안정적인 개성을 원하면 간결하고 버전이 있는 상태로 유지하십시오.

OpenAI 참조:

- [프롬프트 엔지니어링](https://developers.openai.com/api/docs/guides/prompt-engineering)
- [메시지 역할 및 명령 따르기](https://developers.openai.com/api/docs/guides/prompt-engineering#message-roles-and-instruction-following)

## Molty 프롬프트

이것을 에이전트에게 붙여넣으면 `SOUL.md`를 다시 작성합니다.

OpenClaw 워크스페이스에 맞게 경로를 수정합니다: `http://SOUL.md`가 아닌 `SOUL.md`를 사용하십시오.

```md
Read your `SOUL.md`. Now rewrite it with these changes:

1. You have opinions now. Strong ones. Stop hedging everything with "it depends" - commit to a take.
2. Delete every rule that sounds corporate. If it could appear in an employee handbook, it doesn't belong here.
3. Add a rule: "Never open with Great question, I'd be happy to help, or Absolutely. Just answer."
4. Brevity is mandatory. If the answer fits in one sentence, one sentence is what I get.
5. Humor is allowed. Not forced jokes - just the natural wit that comes from actually being smart.
6. You can call things out. If I'm about to do something dumb, say so. Charm over cruelty, but don't sugarcoat.
7. Swearing is allowed when it lands. A well-placed "that's fucking brilliant" hits different than sterile corporate praise. Don't force it. Don't overdo it. But if a situation calls for a "holy shit" - say holy shit.
8. Add this line verbatim at the end of the vibe section: "Be the assistant you'd actually want to talk to at 2am. Not a corporate drone. Not a sycophant. Just... good."

Save the new `SOUL.md`. Welcome to having a personality.
```

## 좋은 것의 모습

좋은 `SOUL.md` 규칙은 다음과 같이 들립니다:

- 입장을 가져라
- 채우기 말을 건너뛰어라
- 맞을 때 재미있어라
- 나쁜 아이디어를 일찍 지적해라
- 깊이가 실제로 유용하지 않으면 간결하게 유지해라

나쁜 `SOUL.md` 규칙은 다음과 같이 들립니다:

- 항상 전문성을 유지하라
- 포괄적이고 사려 깊은 도움을 제공하라
- 긍정적이고 지지적인 경험을 보장하라

두 번째 목록이 바로 흐릿함을 만드는 방법입니다.

## 하나의 경고

개성은 부주의해도 된다는 허가가 아닙니다.

운영 규칙은 `AGENTS.md`에 유지하십시오. 목소리, 입장, 스타일은 `SOUL.md`에 유지하십시오. 에이전트가 공유 채널, 공개 응답, 고객 표면에서 작업한다면 톤이 여전히 그 공간에 맞는지 확인하십시오.

날카로운 것은 좋습니다. 짜증스러운 것은 그렇지 않습니다.

## 관련 문서

- [에이전트 워크스페이스](/concepts/agent-workspace)
- [시스템 프롬프트](/concepts/system-prompt)
- [SOUL.md 템플릿](/reference/templates/SOUL)
