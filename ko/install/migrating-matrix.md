---
summary: "OpenClaw가 이전 Matrix 플러그인을 현재 위치에서 업그레이드하는 방법, 암호화된 상태 복구 한계 및 수동 복구 단계 포함."
read_when:
  - 기존 Matrix 설치를 업그레이드하는 경우
  - 암호화된 Matrix 기록 및 장치 상태를 마이그레이션하는 경우
title: "Matrix 마이그레이션"
---

# Matrix 마이그레이션

이 페이지는 이전 공개 `matrix` 플러그인에서 현재 구현으로의 업그레이드를 다룹니다.

대부분의 사용자에게 업그레이드는 현재 위치에서 이루어집니다:

- 플러그인은 `@openclaw/matrix`로 유지됩니다
- 채널은 `matrix`로 유지됩니다
- 구성은 `channels.matrix` 아래에 유지됩니다
- 캐시된 자격 증명은 `~/.openclaw/credentials/matrix/` 아래에 유지됩니다
- 런타임 상태는 `~/.openclaw/matrix/` 아래에 유지됩니다

구성 키 이름을 변경하거나 새 이름으로 플러그인을 재설치할 필요가 없습니다.

## 마이그레이션이 자동으로 수행하는 작업

게이트웨이가 시작될 때와 [`openclaw doctor --fix`](/gateway/doctor)를 실행할 때 OpenClaw는 이전 Matrix 상태를 자동으로 복구하려고 시도합니다.
실행 가능한 Matrix 마이그레이션 단계가 디스크 상태를 변경하기 전에 OpenClaw는 집중된 복구 스냅샷을 생성하거나 재사용합니다.

`openclaw update`를 사용하면 정확한 트리거는 OpenClaw 설치 방법에 따라 다릅니다:

- 소스 설치는 업데이트 흐름 중에 `openclaw doctor --fix`를 실행한 다음 기본적으로 게이트웨이를 재시작합니다
- 패키지 관리자 설치는 패키지를 업데이트하고 비대화형 doctor 패스를 실행한 다음 기본 게이트웨이 재시작에 의존하여 시작 시 Matrix 마이그레이션을 완료합니다
- `openclaw update --no-restart`를 사용하는 경우 시작으로 지원되는 Matrix 마이그레이션은 나중에 `openclaw doctor --fix`를 실행하고 게이트웨이를 재시작할 때까지 연기됩니다

자동 마이그레이션에는 다음이 포함됩니다:

- `~/Backups/openclaw-migrations/` 아래에 마이그레이션 전 스냅샷 생성 또는 재사용
- 캐시된 Matrix 자격 증명 재사용
- 동일한 계정 선택 및 `channels.matrix` 구성 유지
- 가장 오래된 플랫 Matrix 동기화 저장소를 현재 계정 범위 위치로 이동
- 대상 계정을 안전하게 확인할 수 있는 경우 가장 오래된 플랫 Matrix 암호화 저장소를 현재 계정 범위 위치로 이동
- 이전 rust 암호화 저장소에서 이전에 저장된 Matrix 방 키 백업 암호화 해제 키 추출 (해당 키가 로컬에 존재하는 경우)
- 액세스 토큰이 나중에 변경될 때 동일한 Matrix 계정, 홈서버 및 사용자에 대해 가장 완전한 기존 토큰 해시 스토리지 루트 재사용
- 형제 토큰 해시 스토리지 루트에서 보류 중인 암호화된 상태 복원 메타데이터 검색 (Matrix 액세스 토큰이 변경되었지만 계정/장치 ID는 동일하게 유지된 경우)
- 다음 Matrix 시작 시 새 암호화 저장소로 백업된 방 키 복원

스냅샷 세부 사항:

- OpenClaw는 성공적인 스냅샷 후 `~/.openclaw/matrix/migration-snapshot.json`에 마커 파일을 씁니다. 이후 시작 및 복구 패스는 동일한 아카이브를 재사용할 수 있습니다.
- 이러한 자동 Matrix 마이그레이션 스냅샷은 구성 + 상태만 백업합니다(`includeWorkspace: false`).
- Matrix에 경고 전용 마이그레이션 상태만 있는 경우(예: `userId` 또는 `accessToken`이 여전히 누락된 경우) OpenClaw는 Matrix 변경이 실행 가능하지 않으므로 아직 스냅샷을 생성하지 않습니다.
- 스냅샷 단계가 실패하면 OpenClaw는 복구 지점 없이 상태를 변경하는 대신 해당 실행에 대한 Matrix 마이그레이션을 건너뜁니다.

다중 계정 업그레이드에 대해:

- 가장 오래된 플랫 Matrix 저장소(`~/.openclaw/matrix/bot-storage.json` 및 `~/.openclaw/matrix/crypto/`)는 단일 저장소 레이아웃에서 왔으므로 OpenClaw는 이를 하나의 확인된 Matrix 계정 대상으로만 마이그레이션할 수 있습니다
- 이미 계정 범위의 레거시 Matrix 저장소는 구성된 Matrix 계정별로 감지되고 준비됩니다

## 마이그레이션이 자동으로 할 수 없는 작업

이전 공개 Matrix 플러그인은 Matrix 방 키 백업을 자동으로 생성하지 **않았습니다**. 로컬 암호화 상태를 유지하고 장치 확인을 요청했지만 방 키가 홈서버에 백업되었음을 보장하지 않았습니다.

즉, 일부 암호화된 설치는 부분적으로만 마이그레이션될 수 있습니다.

OpenClaw가 자동으로 복구할 수 없는 항목:

- 백업된 적이 없는 로컬 전용 방 키
- `homeserver`, `userId` 또는 `accessToken`이 아직 사용 불가능하여 대상 Matrix 계정을 확인할 수 없는 경우의 암호화된 상태
- `channels.matrix.defaultAccount`가 설정되지 않은 상태에서 여러 Matrix 계정이 구성된 경우 하나의 공유 플랫 Matrix 저장소의 자동 마이그레이션
- 표준 Matrix 패키지 대신 저장소 경로에 고정된 사용자 정의 플러그인 경로 설치
- 이전 저장소에 백업된 키가 있었지만 암호화 해제 키를 로컬에 보관하지 않은 경우 누락된 복구 키

현재 경고 범위:

- 사용자 정의 Matrix 플러그인 경로 설치는 게이트웨이 시작 및 `openclaw doctor` 모두에 의해 표시됩니다

이전 설치에 백업된 적이 없는 로컬 전용 암호화된 기록이 있는 경우 업그레이드 후 일부 이전 암호화된 메시지는 읽을 수 없는 상태로 남아 있을 수 있습니다.

## 권장 업그레이드 흐름

1. OpenClaw 및 Matrix 플러그인을 정상적으로 업데이트합니다.
   `--no-restart` 없이 일반 `openclaw update`를 사용하여 시작 시 Matrix 마이그레이션을 즉시 완료합니다.
2. 실행:

   ```bash
   openclaw doctor --fix
   ```

   Matrix에 실행 가능한 마이그레이션 작업이 있는 경우 doctor는 먼저 마이그레이션 전 스냅샷을 생성하거나 재사용하고 아카이브 경로를 출력합니다.

3. 게이트웨이를 시작하거나 재시작합니다.
4. 현재 확인 및 백업 상태 확인:

   ```bash
   openclaw matrix verify status
   openclaw matrix verify backup status
   ```

5. OpenClaw에서 복구 키가 필요하다고 알리면 실행:

   ```bash
   openclaw matrix verify backup restore --recovery-key "<your-recovery-key>"
   ```

6. 이 장치가 여전히 확인되지 않은 경우 실행:

   ```bash
   openclaw matrix verify device "<your-recovery-key>"
   ```

7. 복구할 수 없는 이전 기록을 의도적으로 포기하고 미래 메시지를 위한 새로운 백업 기준을 원하는 경우 실행:

   ```bash
   openclaw matrix verify backup reset --yes
   ```

8. 서버 측 키 백업이 아직 없는 경우 미래 복구를 위해 생성합니다:

   ```bash
   openclaw matrix verify bootstrap
   ```

## 암호화된 마이그레이션 작동 방식

암호화된 마이그레이션은 2단계 프로세스입니다:

1. 시작 또는 `openclaw doctor --fix`는 암호화된 마이그레이션이 실행 가능한 경우 마이그레이션 전 스냅샷을 생성하거나 재사용합니다.
2. 시작 또는 `openclaw doctor --fix`는 활성 Matrix 플러그인 설치를 통해 이전 Matrix 암호화 저장소를 검사합니다.
3. 백업 암호화 해제 키가 발견되면 OpenClaw는 이를 새 복구 키 흐름에 쓰고 방 키 복원을 보류 중으로 표시합니다.
4. 다음 Matrix 시작 시 OpenClaw는 백업된 방 키를 새 암호화 저장소로 자동으로 복원합니다.

이전 저장소에서 백업된 적이 없는 방 키를 보고하는 경우 OpenClaw는 복구가 성공한 척하는 대신 경고합니다.

## 일반적인 메시지 및 의미

### 업그레이드 및 감지 메시지

`Matrix plugin upgraded in place.`

- 의미: 이전 디스크 Matrix 상태가 감지되고 현재 레이아웃으로 마이그레이션되었습니다.
- 해야 할 일: 동일한 출력에 경고도 포함되지 않는 한 아무 것도 하지 않습니다.

`Matrix migration snapshot created before applying Matrix upgrades.`

- 의미: OpenClaw는 Matrix 상태를 변경하기 전에 복구 아카이브를 생성했습니다.
- 해야 할 일: 마이그레이션이 성공했음을 확인할 때까지 출력된 아카이브 경로를 유지합니다.

`Matrix migration snapshot reused before applying Matrix upgrades.`

- 의미: OpenClaw는 기존 Matrix 마이그레이션 스냅샷 마커를 찾고 중복 백업을 생성하는 대신 해당 아카이브를 재사용했습니다.
- 해야 할 일: 마이그레이션이 성공했음을 확인할 때까지 출력된 아카이브 경로를 유지합니다.

`Legacy Matrix state detected at ... but channels.matrix is not configured yet.`

- 의미: 이전 Matrix 상태가 존재하지만 OpenClaw는 Matrix가 구성되지 않았으므로 현재 Matrix 계정에 매핑할 수 없습니다.
- 해야 할 일: `channels.matrix`를 구성한 다음 `openclaw doctor --fix`를 다시 실행하거나 게이트웨이를 재시작합니다.

`Legacy Matrix state detected at ... but the new account-scoped target could not be resolved yet (need homeserver, userId, and access token for channels.matrix...).`

- 의미: OpenClaw는 이전 상태를 찾았지만 정확한 현재 계정/장치 루트를 아직 결정할 수 없습니다.
- 해야 할 일: 작동하는 Matrix 로그인으로 게이트웨이를 한 번 시작하거나 캐시된 자격 증명이 존재한 후 `openclaw doctor --fix`를 다시 실행합니다.

`Legacy Matrix state detected at ... but multiple Matrix accounts are configured and channels.matrix.defaultAccount is not set.`

- 의미: OpenClaw는 하나의 공유 플랫 Matrix 저장소를 찾았지만 어떤 명명된 Matrix 계정이 받아야 하는지 추측하지 않으려 합니다.
- 해야 할 일: `channels.matrix.defaultAccount`를 의도한 계정으로 설정한 다음 `openclaw doctor --fix`를 다시 실행하거나 게이트웨이를 재시작합니다.

`Matrix legacy sync store not migrated because the target already exists (...)`

- 의미: 새 계정 범위 위치에 이미 동기화 또는 암호화 저장소가 있으므로 OpenClaw는 자동으로 덮어쓰지 않았습니다.
- 해야 할 일: 충돌하는 대상을 수동으로 제거하거나 이동하기 전에 현재 계정이 올바른 것인지 확인합니다.

`Failed migrating Matrix legacy sync store (...)` 또는 `Failed migrating Matrix legacy crypto store (...)`

- 의미: OpenClaw는 이전 Matrix 상태를 이동하려 했지만 파일 시스템 작업이 실패했습니다.
- 해야 할 일: 파일 시스템 권한과 디스크 상태를 검사한 다음 `openclaw doctor --fix`를 다시 실행합니다.

`Legacy Matrix encrypted state detected at ... but channels.matrix is not configured yet.`

- 의미: OpenClaw는 이전 암호화된 Matrix 저장소를 찾았지만 첨부할 현재 Matrix 구성이 없습니다.
- 해야 할 일: `channels.matrix`를 구성한 다음 `openclaw doctor --fix`를 다시 실행하거나 게이트웨이를 재시작합니다.

`Legacy Matrix encrypted state detected at ... but the account-scoped target could not be resolved yet (need homeserver, userId, and access token for channels.matrix...).`

- 의미: 암호화된 저장소가 존재하지만 OpenClaw는 어떤 현재 계정/장치에 속하는지 안전하게 결정할 수 없습니다.
- 해야 할 일: 작동하는 Matrix 로그인으로 게이트웨이를 한 번 시작하거나 캐시된 자격 증명이 사용 가능한 후 `openclaw doctor --fix`를 다시 실행합니다.

`Legacy Matrix encrypted state detected at ... but multiple Matrix accounts are configured and channels.matrix.defaultAccount is not set.`

- 의미: OpenClaw는 하나의 공유 플랫 레거시 암호화 저장소를 찾았지만 어떤 명명된 Matrix 계정이 받아야 하는지 추측하지 않으려 합니다.
- 해야 할 일: `channels.matrix.defaultAccount`를 의도한 계정으로 설정한 다음 `openclaw doctor --fix`를 다시 실행하거나 게이트웨이를 재시작합니다.

`Matrix migration warnings are present, but no on-disk Matrix mutation is actionable yet. No pre-migration snapshot was needed.`

- 의미: OpenClaw는 이전 Matrix 상태를 감지했지만 마이그레이션이 여전히 누락된 ID 또는 자격 증명 데이터로 인해 차단되어 있습니다.
- 해야 할 일: Matrix 로그인 또는 구성 설정을 완료한 다음 `openclaw doctor --fix`를 다시 실행하거나 게이트웨이를 재시작합니다.

`Legacy Matrix encrypted state was detected, but the Matrix plugin helper is unavailable. Install or repair @openclaw/matrix so OpenClaw can inspect the old rust crypto store before upgrading.`

- 의미: OpenClaw는 이전 암호화된 Matrix 상태를 찾았지만 해당 저장소를 검사하는 Matrix 플러그인의 헬퍼 진입점을 로드할 수 없었습니다.
- 해야 할 일: Matrix 플러그인을 재설치하거나 복구합니다(`openclaw plugins install @openclaw/matrix` 또는 저장소 체크아웃의 경우 `openclaw plugins install ./path/to/local/matrix-plugin`). 그런 다음 `openclaw doctor --fix`를 다시 실행하거나 게이트웨이를 재시작합니다.

`Matrix plugin helper path is unsafe: ... Reinstall @openclaw/matrix and try again.`

- 의미: OpenClaw는 플러그인 루트를 벗어나거나 플러그인 경계 확인에 실패한 헬퍼 파일 경로를 찾아 가져오기를 거부했습니다.
- 해야 할 일: 신뢰할 수 있는 경로에서 Matrix 플러그인을 재설치한 다음 `openclaw doctor --fix`를 다시 실행하거나 게이트웨이를 재시작합니다.

`- Failed creating a Matrix migration snapshot before repair: ...`

`- Skipping Matrix migration changes for now. Resolve the snapshot failure, then rerun "openclaw doctor --fix".`

- 의미: OpenClaw는 먼저 복구 스냅샷을 생성할 수 없었기 때문에 Matrix 상태 변경을 거부했습니다.
- 해야 할 일: 백업 오류를 해결한 다음 `openclaw doctor --fix`를 다시 실행하거나 게이트웨이를 재시작합니다.

`Failed migrating legacy Matrix client storage: ...`

- 의미: Matrix 클라이언트 측 폴백이 이전 플랫 저장소를 찾았지만 이동에 실패했습니다. OpenClaw는 이제 자동으로 새 저장소로 시작하는 대신 해당 폴백을 중단합니다.
- 해야 할 일: 파일 시스템 권한이나 충돌을 검사하고, 이전 상태를 그대로 유지하며, 오류를 수정한 후 재시도합니다.

`Matrix is installed from a custom path: ...`

- 의미: Matrix는 경로 설치에 고정되어 있으므로 메인라인 업데이트가 저장소의 표준 Matrix 패키지로 자동으로 교체하지 않습니다.
- 해야 할 일: 기본 Matrix 플러그인으로 돌아가려면 `openclaw plugins install @openclaw/matrix`로 재설치합니다.

### 암호화된 상태 복구 메시지

`matrix: restored X/Y room key(s) from legacy encrypted-state backup`

- 의미: 백업된 방 키가 새 암호화 저장소로 성공적으로 복원되었습니다.
- 해야 할 일: 일반적으로 아무 것도 하지 않습니다.

`matrix: N legacy local-only room key(s) were never backed up and could not be restored automatically`

- 의미: 일부 이전 방 키는 이전 로컬 저장소에만 존재했고 Matrix 백업에 업로드된 적이 없었습니다.
- 해야 할 일: 다른 확인된 클라이언트에서 해당 키를 수동으로 복구할 수 없는 한 일부 이전 암호화된 기록이 사용 불가능한 상태로 남아 있을 것으로 예상합니다.

`Legacy Matrix encrypted state for account "..." has backed-up room keys, but no local backup decryption key was found. Ask the operator to run "openclaw matrix verify backup restore --recovery-key <key>" after upgrade if they have the recovery key.`

- 의미: 백업이 존재하지만 OpenClaw는 복구 키를 자동으로 복구할 수 없었습니다.
- 해야 할 일: `openclaw matrix verify backup restore --recovery-key "<your-recovery-key>"`를 실행합니다.

`Failed inspecting legacy Matrix encrypted state for account "..." (...): ...`

- 의미: OpenClaw는 이전 암호화된 저장소를 찾았지만 복구를 준비할 만큼 안전하게 검사할 수 없었습니다.
- 해야 할 일: `openclaw doctor --fix`를 다시 실행합니다. 반복되면 이전 상태 디렉터리를 그대로 유지하고 다른 확인된 Matrix 클라이언트와 `openclaw matrix verify backup restore --recovery-key "<your-recovery-key>"`를 사용하여 복구합니다.

`Legacy Matrix backup key was found for account "...", but .../recovery-key.json already contains a different recovery key. Leaving the existing file unchanged.`

- 의미: OpenClaw는 백업 키 충돌을 감지하고 현재 복구 키 파일을 자동으로 덮어쓰기를 거부했습니다.
- 해야 할 일: 복구 명령을 재시도하기 전에 어떤 복구 키가 올바른지 확인합니다.

`Legacy Matrix encrypted state for account "..." cannot be fully converted automatically because the old rust crypto store does not expose all local room keys for export.`

- 의미: 이것은 이전 저장소 형식의 하드 한계입니다.
- 해야 할 일: 백업된 키는 여전히 복원될 수 있지만 로컬 전용 암호화된 기록은 사용 불가능한 상태로 남아 있을 수 있습니다.

`matrix: failed restoring room keys from legacy encrypted-state backup: ...`

- 의미: 새 플러그인이 복원을 시도했지만 Matrix가 오류를 반환했습니다.
- 해야 할 일: `openclaw matrix verify backup status`를 실행한 다음 필요한 경우 `openclaw matrix verify backup restore --recovery-key "<your-recovery-key>"`로 재시도합니다.

### 수동 복구 메시지

`Backup key is not loaded on this device. Run 'openclaw matrix verify backup restore' to load it and restore old room keys.`

- 의미: OpenClaw는 백업 키가 있어야 한다는 것을 알지만 이 장치에서는 활성화되지 않았습니다.
- 해야 할 일: `openclaw matrix verify backup restore`를 실행하거나 필요한 경우 `--recovery-key`를 전달합니다.

`Store a recovery key with 'openclaw matrix verify device <key>', then run 'openclaw matrix verify backup restore'.`

- 의미: 이 장치에는 현재 복구 키가 저장되어 있지 않습니다.
- 해야 할 일: 먼저 복구 키로 장치를 확인한 다음 백업을 복원합니다.

`Backup key mismatch on this device. Re-run 'openclaw matrix verify device <key>' with the matching recovery key.`

- 의미: 저장된 키가 활성 Matrix 백업과 일치하지 않습니다.
- 해야 할 일: 올바른 키로 `openclaw matrix verify device "<your-recovery-key>"`를 다시 실행합니다.

복구할 수 없는 이전 암호화된 기록을 잃어버리는 것을 수용하면 `openclaw matrix verify backup reset --yes`로 현재 백업 기준을 대신 재설정할 수 있습니다. 저장된 백업 시크릿이 손상된 경우 해당 재설정은 새 백업 키가 재시작 후 올바르게 로드될 수 있도록 시크릿 저장소를 재생성할 수도 있습니다.

`Backup trust chain is not verified on this device. Re-run 'openclaw matrix verify device <key>'.`

- 의미: 백업이 존재하지만 이 장치는 아직 교차 서명 체인을 충분히 신뢰하지 않습니다.
- 해야 할 일: `openclaw matrix verify device "<your-recovery-key>"`를 다시 실행합니다.

`Matrix recovery key is required`

- 의미: 복구 키가 필요한 경우 복구 키를 제공하지 않고 복구 단계를 시도했습니다.
- 해야 할 일: 복구 키와 함께 명령을 다시 실행합니다.

`Invalid Matrix recovery key: ...`

- 의미: 제공된 키를 파싱할 수 없거나 예상 형식과 일치하지 않았습니다.
- 해야 할 일: Matrix 클라이언트 또는 복구 키 파일의 정확한 복구 키로 재시도합니다.

`Matrix device is still unverified after applying recovery key. Verify your recovery key and ensure cross-signing is available.`

- 의미: 키가 적용되었지만 장치가 여전히 확인을 완료할 수 없었습니다.
- 해야 할 일: 올바른 키를 사용했는지 확인하고 계정에서 교차 서명을 사용할 수 있는지 확인한 다음 재시도합니다.

`Matrix key backup is not active on this device after loading from secret storage.`

- 의미: 시크릿 저장소가 이 장치에서 활성 백업 세션을 생성하지 못했습니다.
- 해야 할 일: 먼저 장치를 확인한 다음 `openclaw matrix verify backup status`로 다시 확인합니다.

`Matrix crypto backend cannot load backup keys from secret storage. Verify this device with 'openclaw matrix verify device <key>' first.`

- 의미: 이 장치는 장치 확인이 완료될 때까지 시크릿 저장소에서 복원할 수 없습니다.
- 해야 할 일: 먼저 `openclaw matrix verify device "<your-recovery-key>"`를 실행합니다.

### 사용자 정의 플러그인 설치 메시지

`Matrix is installed from a custom path that no longer exists: ...`

- 의미: 플러그인 설치 기록이 사라진 로컬 경로를 가리킵니다.
- 해야 할 일: `openclaw plugins install @openclaw/matrix`로 재설치하거나 저장소 체크아웃에서 실행 중인 경우 `openclaw plugins install ./path/to/local/matrix-plugin`을 사용합니다.

## 암호화된 기록이 여전히 돌아오지 않는 경우

다음 순서로 확인을 실행합니다:

```bash
openclaw matrix verify status --verbose
openclaw matrix verify backup status --verbose
openclaw matrix verify backup restore --recovery-key "<your-recovery-key>" --verbose
```

백업이 성공적으로 복원되었지만 일부 이전 방의 기록이 여전히 누락된 경우 해당 누락된 키는 이전 플러그인에 의해 백업된 적이 없었을 가능성이 있습니다.

## 미래 메시지를 위해 새로 시작하려는 경우

복구할 수 없는 이전 암호화된 기록을 잃어버리는 것을 수용하고 앞으로 나아가기 위한 깨끗한 백업 기준만 원하는 경우 다음 명령을 순서대로 실행합니다:

```bash
openclaw matrix verify backup reset --yes
openclaw matrix verify backup status --verbose
openclaw matrix verify status
```

그 후에도 장치가 여전히 확인되지 않은 경우 Matrix 클라이언트에서 SAS 이모지 또는 십진수 코드를 비교하고 일치함을 확인하여 확인을 완료합니다.

## 관련 페이지

- [Matrix](/channels/matrix)
- [Doctor](/gateway/doctor)
- [마이그레이션](/install/migrating)
- [플러그인](/tools/plugin)
