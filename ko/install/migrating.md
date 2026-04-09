---
summary: "OpenClaw 설치를 한 머신에서 다른 머신으로 이전 (마이그레이션)"
read_when:
  - OpenClaw를 새 노트북/서버로 이전하는 경우
  - 세션, 인증 및 채널 로그인 (WhatsApp 등)을 보존하려는 경우
title: "마이그레이션 가이드"
---

# 새 머신으로 OpenClaw 마이그레이션

이 가이드는 온보딩을 다시 수행하지 않고 OpenClaw 게이트웨이를 새 머신으로 이전합니다.

## 마이그레이션 내용

**상태 디렉터리** (`~/.openclaw/` 기본값)와 **작업 공간**을 복사하면 다음이 보존됩니다:

- **구성** -- `openclaw.json` 및 모든 게이트웨이 설정
- **인증** -- 에이전트별 `auth-profiles.json` (API 키 + OAuth), 그리고 `credentials/` 아래의 채널/제공자 상태
- **세션** -- 대화 기록 및 에이전트 상태
- **채널 상태** -- WhatsApp 로그인, Telegram 세션 등
- **작업 공간 파일** -- `MEMORY.md`, `USER.md`, 스킬 및 프롬프트

<Tip>
이전 머신에서 `openclaw status`를 실행하여 상태 디렉터리 경로를 확인합니다.
사용자 정의 프로파일은 `~/.openclaw-<profile>/` 또는 `OPENCLAW_STATE_DIR`을 통해 설정된 경로를 사용합니다.
</Tip>

## 마이그레이션 단계

<Steps>
  <Step title="게이트웨이 중지 및 백업">
    **이전** 머신에서 파일이 복사 중에 변경되지 않도록 게이트웨이를 중지한 다음 아카이브합니다:

    ```bash
    openclaw gateway stop
    cd ~
    tar -czf openclaw-state.tgz .openclaw
    ```

    여러 프로파일을 사용하는 경우(예: `~/.openclaw-work`) 각각 별도로 아카이브합니다.

  </Step>

  <Step title="새 머신에 OpenClaw 설치">
    새 머신에 CLI (및 필요한 경우 Node)를 [설치](/install/)합니다.
    온보딩이 새 `~/.openclaw/`를 생성해도 괜찮습니다 — 다음 단계에서 덮어씁니다.
  </Step>

  <Step title="상태 디렉터리 및 작업 공간 복사">
    `scp`, `rsync -a` 또는 외장 드라이브를 통해 아카이브를 전송한 다음 추출합니다:

    ```bash
    cd ~
    tar -xzf openclaw-state.tgz
    ```

    숨겨진 디렉터리가 포함되었는지, 파일 소유권이 게이트웨이를 실행할 사용자와 일치하는지 확인합니다.

  </Step>

  <Step title="Doctor 실행 및 확인">
    새 머신에서 [Doctor](/gateway/doctor)를 실행하여 구성 마이그레이션을 적용하고 서비스를 복구합니다:

    ```bash
    openclaw doctor
    openclaw gateway restart
    openclaw status
    ```

  </Step>
</Steps>

## 일반적인 함정

<AccordionGroup>
  <Accordion title="프로파일 또는 상태 디렉터리 불일치">
    이전 게이트웨이가 `--profile` 또는 `OPENCLAW_STATE_DIR`을 사용했지만 새 게이트웨이가 사용하지 않으면
    채널이 로그아웃된 것처럼 보이고 세션이 비어 있을 것입니다.
    마이그레이션한 동일한 프로파일 또는 상태 디렉터리로 게이트웨이를 시작한 다음 `openclaw doctor`를 다시 실행합니다.
  </Accordion>

  <Accordion title="openclaw.json만 복사">
    구성 파일 하나로는 충분하지 않습니다. 모델 인증 프로파일은
    `agents/<agentId>/agent/auth-profiles.json` 아래에 있고, 채널/제공자 상태는 여전히
    `credentials/` 아래에 있습니다. **항상** 전체 상태 디렉터리를 마이그레이션합니다.
  </Accordion>

  <Accordion title="권한 및 소유권">
    루트로 복사했거나 사용자를 전환한 경우 게이트웨이가 자격 증명을 읽지 못할 수 있습니다.
    상태 디렉터리와 작업 공간이 게이트웨이를 실행하는 사용자 소유인지 확인합니다.
  </Accordion>

  <Accordion title="원격 모드">
    UI가 **원격** 게이트웨이를 가리키는 경우 원격 호스트가 세션과 작업 공간을 소유합니다.
    로컬 노트북이 아닌 게이트웨이 호스트 자체를 마이그레이션합니다. [FAQ](/help/faq#where-things-live-on-disk) 참조.
  </Accordion>

  <Accordion title="백업의 시크릿">
    상태 디렉터리에는 인증 프로파일, 채널 자격 증명 및 기타 제공자 상태가 포함됩니다.
    백업을 암호화하여 저장하고, 안전하지 않은 전송 채널을 피하고, 노출이 의심되는 경우 키를 교체합니다.
  </Accordion>
</AccordionGroup>

## 확인 체크리스트

새 머신에서 다음을 확인합니다:

- [ ] `openclaw status`에서 게이트웨이가 실행 중임을 확인
- [ ] 채널이 여전히 연결되어 있음 (재페어링 불필요)
- [ ] 대시보드가 열리고 기존 세션을 표시함
- [ ] 작업 공간 파일 (메모리, 구성)이 존재함
