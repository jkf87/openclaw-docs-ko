---
summary: "Microsoft Teams bot 지원 상태, 기능 및 구성"
read_when:
  - Microsoft Teams 채널 기능 작업 시
title: "Microsoft Teams"
sidebarTitle: "Microsoft Teams"
---

텍스트와 DM 첨부파일을 지원하며, channel 및 그룹 파일 전송은 `sharePointSiteId` + Graph 권한이 필요합니다([그룹 채팅에서 파일 전송](#sending-files-in-group-chats) 참조). 투표는 Adaptive Cards를 통해 전송됩니다. 메시지 액션은 파일 우선 전송을 위한 명시적인 `upload-file`을 노출합니다.

## 번들 플러그인

Microsoft Teams는 최신 OpenClaw 릴리스에 번들 플러그인으로 제공되므로, 일반 패키지 빌드에서는 별도의 설치가 필요하지 않습니다.

구버전 빌드나 번들 Teams가 제외된 커스텀 설치 환경이라면 수동으로 설치합니다:

```bash
openclaw plugins install @openclaw/msteams
```

로컬 체크아웃(git 저장소에서 실행 시):

```bash
openclaw plugins install ./path/to/local/msteams-plugin
```

자세한 내용: [플러그인](/tools/plugin)

## 빠른 설정 (초보자)

1. Microsoft Teams 플러그인이 사용 가능한지 확인합니다.
   - 최신 패키지 OpenClaw 릴리스는 이미 번들로 포함합니다.
   - 구버전/커스텀 설치 환경은 위 명령으로 수동 추가할 수 있습니다.
2. **Azure Bot**을 생성합니다(App ID + client secret + tenant ID).
3. 해당 자격 증명으로 OpenClaw를 구성합니다.
4. `/api/messages`(기본 포트 3978)를 공개 URL 또는 터널을 통해 노출합니다.
5. Teams 앱 패키지를 설치하고 게이트웨이를 시작합니다.

최소 구성(client secret):

```json5
{
  channels: {
    msteams: {
      enabled: true,
      appId: "<APP_ID>",
      appPassword: "<APP_PASSWORD>",
      tenantId: "<TENANT_ID>",
      webhook: { port: 3978, path: "/api/messages" },
    },
  },
}
```

프로덕션 배포에서는 client secret 대신 [페더레이션 인증](#federated-authentication)(인증서 또는 managed identity) 사용을 고려하세요.

참고: 그룹 채팅은 기본적으로 차단됩니다(`channels.msteams.groupPolicy: "allowlist"`). 그룹 응답을 허용하려면 `channels.msteams.groupAllowFrom`을 설정하거나 `groupPolicy: "open"`을 사용해 모든 구성원을 허용하세요(멘션 게이팅 적용).

## 구성 쓰기(Config writes)

기본적으로 Microsoft Teams는 `/config set|unset`으로 트리거된 구성 업데이트 쓰기를 허용합니다(`commands.config: true` 필요).

비활성화하려면:

```json5
{
  channels: { msteams: { configWrites: false } },
}
```

## 접근 제어(DM + 그룹)

**DM 접근**

- 기본값: `channels.msteams.dmPolicy = "pairing"`. 알 수 없는 발신자는 승인될 때까지 무시됩니다.
- `channels.msteams.allowFrom`은 안정적인 AAD object ID를 사용해야 합니다.
- 허용 목록에 UPN/표시 이름 매칭을 의존하지 마세요. 변경될 수 있습니다. OpenClaw는 기본적으로 직접 이름 매칭을 비활성화합니다. 명시적으로 `channels.msteams.dangerouslyAllowNameMatching: true`로 옵트인하세요.
- 자격 증명이 허용하는 경우 wizard는 Microsoft Graph를 통해 이름을 ID로 해석할 수 있습니다.

**그룹 접근**

- 기본값: `channels.msteams.groupPolicy = "allowlist"`(`groupAllowFrom`을 추가하지 않으면 차단됨). 설정되지 않은 경우 기본값을 재정의하려면 `channels.defaults.groupPolicy`를 사용하세요.
- `channels.msteams.groupAllowFrom`은 그룹 채팅/채널에서 트리거할 수 있는 발신자를 제어합니다(`channels.msteams.allowFrom`으로 폴백됩니다).
- `groupPolicy: "open"`을 설정하면 모든 구성원을 허용합니다(기본적으로 여전히 멘션 게이팅 적용).
- **채널을 전혀 허용하지 않으려면** `channels.msteams.groupPolicy: "disabled"`를 설정하세요.

예시:

```json5
{
  channels: {
    msteams: {
      groupPolicy: "allowlist",
      groupAllowFrom: ["user@org.com"],
    },
  },
}
```

**팀 + 채널 허용 목록**

- `channels.msteams.teams` 아래에 팀과 채널을 나열하여 그룹/채널 응답 범위를 제한합니다.
- 키는 안정적인 team ID 및 channel conversation ID를 사용해야 합니다.
- `groupPolicy="allowlist"`이고 teams 허용 목록이 있는 경우, 나열된 팀/채널만 허용됩니다(멘션 게이팅 적용).
- configure wizard는 `Team/Channel` 항목을 수락하고 이를 저장합니다.
- 시작 시 OpenClaw는 팀/채널과 사용자 허용 목록의 이름을 ID로 해석하고(Graph 권한이 허용하는 경우) 매핑을 로깅합니다. 해석되지 않은 팀/채널 이름은 입력된 대로 유지되지만, `channels.msteams.dangerouslyAllowNameMatching: true`가 활성화되지 않는 한 기본적으로 라우팅에 사용되지 않습니다.

예시:

```json5
{
  channels: {
    msteams: {
      groupPolicy: "allowlist",
      teams: {
        "My Team": {
          channels: {
            General: { requireMention: true },
          },
        },
      },
    },
  },
}
```

## Azure Bot 설정

OpenClaw를 구성하기 전에 Azure Bot 리소스를 생성하고 자격 증명을 확보하세요.

<Steps>
  <Step title="Azure Bot 생성">
    [Azure Bot 생성](https://portal.azure.com/#create/Microsoft.AzureBot)으로 이동하여 **Basics** 탭을 채웁니다:

    | 필드              | 값                                                        |
    | ----------------- | --------------------------------------------------------- |
    | **Bot handle**    | bot 이름, 예: `openclaw-msteams` (고유해야 함)            |
    | **Subscription**  | Azure 구독                                                |
    | **Resource group**| 새로 생성하거나 기존 사용                                 |
    | **Pricing tier**  | 개발/테스트용 **Free**                                    |
    | **Type of App**   | **Single Tenant** (권장)                                  |
    | **Creation type** | **Create new Microsoft App ID**                           |

    <Note>
    새 multi-tenant bot은 2025-07-31 이후 사용 중단되었습니다. 새 bot은 **Single Tenant**를 사용하세요.
    </Note>

    **Review + create** → **Create**을 클릭합니다(약 1-2분 대기).

  </Step>

  <Step title="자격 증명 확보">
    Azure Bot 리소스 → **Configuration**에서:

    - **Microsoft App ID** 복사 → `appId`
    - **Manage Password** → **Certificates & secrets** → **New client secret** → 값 복사 → `appPassword`
    - **Overview** → **Directory (tenant) ID** → `tenantId`

  </Step>

  <Step title="메시징 엔드포인트 구성">
    Azure Bot → **Configuration** → **Messaging endpoint** 설정:

    - 프로덕션: `https://your-domain.com/api/messages`
    - 로컬 개발: 터널 사용([로컬 개발](#local-development-tunneling) 참조)

  </Step>

  <Step title="Teams 채널 활성화">
    Azure Bot → **Channels** → **Microsoft Teams** 클릭 → Configure → Save. 서비스 약관에 동의합니다.
  </Step>
</Steps>

## 페더레이션 인증(Federated authentication)

> 2026.3.24에 추가됨

프로덕션 배포를 위해 OpenClaw는 client secret보다 더 안전한 대안으로 **페더레이션 인증**을 지원합니다. 두 가지 방법을 사용할 수 있습니다:

### 옵션 A: 인증서 기반 인증

Entra ID 앱 등록에 등록된 PEM 인증서를 사용합니다.

**설정:**

1. 인증서 생성 또는 획득(개인 키가 포함된 PEM 형식).
2. Entra ID → App Registration → **Certificates & secrets** → **Certificates** → 공개 인증서를 업로드합니다.

**구성:**

```json5
{
  channels: {
    msteams: {
      enabled: true,
      appId: "<APP_ID>",
      tenantId: "<TENANT_ID>",
      authType: "federated",
      certificatePath: "/path/to/cert.pem",
      webhook: { port: 3978, path: "/api/messages" },
    },
  },
}
```

**환경 변수:**

- `MSTEAMS_AUTH_TYPE=federated`
- `MSTEAMS_CERTIFICATE_PATH=/path/to/cert.pem`

### 옵션 B: Azure Managed Identity

암호 없는 인증을 위해 Azure Managed Identity를 사용합니다. managed identity를 사용할 수 있는 Azure 인프라(AKS, App Service, Azure VM) 배포에 이상적입니다.

**동작 방식:**

1. bot pod/VM이 managed identity(system-assigned 또는 user-assigned)를 가집니다.
2. **federated identity credential**이 managed identity를 Entra ID 앱 등록에 연결합니다.
3. 런타임에 OpenClaw는 `@azure/identity`를 사용해 Azure IMDS 엔드포인트(`169.254.169.254`)에서 토큰을 획득합니다.
4. bot 인증을 위해 토큰이 Teams SDK로 전달됩니다.

**전제 조건:**

- managed identity가 활성화된 Azure 인프라(AKS workload identity, App Service, VM)
- Entra ID 앱 등록에 생성된 federated identity credential
- pod/VM에서 IMDS(`169.254.169.254:80`)로의 네트워크 접근

**구성(system-assigned managed identity):**

```json5
{
  channels: {
    msteams: {
      enabled: true,
      appId: "<APP_ID>",
      tenantId: "<TENANT_ID>",
      authType: "federated",
      useManagedIdentity: true,
      webhook: { port: 3978, path: "/api/messages" },
    },
  },
}
```

**구성(user-assigned managed identity):**

```json5
{
  channels: {
    msteams: {
      enabled: true,
      appId: "<APP_ID>",
      tenantId: "<TENANT_ID>",
      authType: "federated",
      useManagedIdentity: true,
      managedIdentityClientId: "<MI_CLIENT_ID>",
      webhook: { port: 3978, path: "/api/messages" },
    },
  },
}
```

**환경 변수:**

- `MSTEAMS_AUTH_TYPE=federated`
- `MSTEAMS_USE_MANAGED_IDENTITY=true`
- `MSTEAMS_MANAGED_IDENTITY_CLIENT_ID=<client-id>` (user-assigned 전용)

### AKS workload identity 설정

workload identity를 사용하는 AKS 배포의 경우:

1. AKS 클러스터에서 **workload identity를 활성화**합니다.
2. Entra ID 앱 등록에 **federated identity credential을 생성**합니다:

   ```bash
   az ad app federated-credential create --id <APP_OBJECT_ID> --parameters '{
     "name": "my-bot-workload-identity",
     "issuer": "<AKS_OIDC_ISSUER_URL>",
     "subject": "system:serviceaccount:<NAMESPACE>:<SERVICE_ACCOUNT>",
     "audiences": ["api://AzureADTokenExchange"]
   }'
   ```

3. **Kubernetes service account**에 앱 client ID로 주석을 추가합니다:

   ```yaml
   apiVersion: v1
   kind: ServiceAccount
   metadata:
     name: my-bot-sa
     annotations:
       azure.workload.identity/client-id: "<APP_CLIENT_ID>"
   ```

4. workload identity 주입을 위해 **pod에 레이블을 지정**합니다:

   ```yaml
   metadata:
     labels:
       azure.workload.identity/use: "true"
   ```

5. IMDS(`169.254.169.254`)로의 **네트워크 접근을 확보**합니다. NetworkPolicy를 사용하는 경우 `169.254.169.254/32`의 포트 80으로 향하는 트래픽을 허용하는 egress 규칙을 추가하세요.

### 인증 유형 비교

| 방식                 | 구성                                              | 장점                                       | 단점                                       |
| -------------------- | ------------------------------------------------- | ------------------------------------------ | ------------------------------------------ |
| **Client secret**    | `appPassword`                                     | 간단한 설정                                | 비밀 순환 필요, 보안성 낮음                |
| **Certificate**      | `authType: "federated"` + `certificatePath`       | 네트워크로 공유 비밀을 전달하지 않음       | 인증서 관리 오버헤드                       |
| **Managed Identity** | `authType: "federated"` + `useManagedIdentity`    | 암호 없음, 관리할 비밀 없음                | Azure 인프라 필요                          |

**기본 동작:** `authType`이 설정되지 않은 경우 OpenClaw는 client secret 인증으로 기본 설정됩니다. 기존 구성은 변경 없이 계속 작동합니다.

## 로컬 개발(터널링)

Teams는 `localhost`에 접근할 수 없습니다. 로컬 개발에는 터널을 사용하세요:

**옵션 A: ngrok**

```bash
ngrok http 3978
# https URL 복사, 예: https://abc123.ngrok.io
# 메시징 엔드포인트를 다음으로 설정: https://abc123.ngrok.io/api/messages
```

**옵션 B: Tailscale Funnel**

```bash
tailscale funnel 3978
# Tailscale funnel URL을 메시징 엔드포인트로 사용
```

## Teams Developer Portal (대안)

매니페스트 ZIP을 수동으로 생성하는 대신 [Teams Developer Portal](https://dev.teams.microsoft.com/apps)을 사용할 수 있습니다:

1. **+ New app** 클릭
2. 기본 정보 입력(이름, 설명, 개발자 정보)
3. **App features** → **Bot**으로 이동
4. **Enter a bot ID manually**를 선택하고 Azure Bot App ID를 붙여넣습니다
5. 범위 체크: **Personal**, **Team**, **Group Chat**
6. **Distribute** → **Download app package** 클릭
7. Teams에서: **Apps** → **Manage your apps** → **Upload a custom app** → ZIP 선택

이 방식이 JSON 매니페스트를 직접 편집하는 것보다 대체로 수월합니다.

## bot 테스트

**옵션 A: Azure Web Chat (webhook 먼저 검증)**

1. Azure Portal → Azure Bot 리소스 → **Test in Web Chat**
2. 메시지 전송 - 응답이 표시되어야 합니다
3. Teams 설정 전에 webhook 엔드포인트가 작동하는지 확인합니다

**옵션 B: Teams (앱 설치 후)**

1. Teams 앱 설치(사이드로드 또는 조직 카탈로그)
2. Teams에서 bot을 찾아 DM 전송
3. 수신 활동에 대해 게이트웨이 로그 확인

<Accordion title="환경 변수 오버라이드">

모든 bot/auth 구성 키는 환경 변수로도 설정할 수 있습니다:

- `MSTEAMS_APP_ID`, `MSTEAMS_APP_PASSWORD`, `MSTEAMS_TENANT_ID`
- `MSTEAMS_AUTH_TYPE` (`"secret"` 또는 `"federated"`)
- `MSTEAMS_CERTIFICATE_PATH`, `MSTEAMS_CERTIFICATE_THUMBPRINT` (federated + certificate)
- `MSTEAMS_USE_MANAGED_IDENTITY`, `MSTEAMS_MANAGED_IDENTITY_CLIENT_ID` (federated + managed identity; client ID는 user-assigned 전용)

</Accordion>

## 멤버 정보 액션

OpenClaw는 Microsoft Teams를 위한 Graph 기반 `member-info` 액션을 제공하여, 에이전트와 자동화가 채널 멤버 세부 정보(표시 이름, 이메일, 역할)를 Microsoft Graph에서 직접 해석할 수 있도록 합니다.

요구 사항:

- `Member.Read.Group` RSC 권한(이미 권장 매니페스트에 포함)
- 크로스팀 조회: 관리자 동의가 있는 `User.Read.All` Graph Application 권한

이 액션은 `channels.msteams.actions.memberInfo`로 게이팅됩니다(기본값: Graph 자격 증명이 사용 가능할 때 활성화).

## 히스토리 컨텍스트

- `channels.msteams.historyLimit`은 프롬프트에 얼마나 많은 최근 채널/그룹 메시지를 래핑할지 제어합니다.
- `messages.groupChat.historyLimit`으로 폴백됩니다. 비활성화하려면 `0`을 설정하세요(기본 50).
- 가져온 스레드 히스토리는 발신자 허용 목록(`allowFrom` / `groupAllowFrom`)으로 필터링되므로, 스레드 컨텍스트 시딩에는 허용된 발신자의 메시지만 포함됩니다.
- 인용된 첨부 컨텍스트(Teams 응답 HTML에서 파생된 `ReplyTo*`)는 현재 수신된 그대로 전달됩니다.
- 즉, 허용 목록은 누가 에이전트를 트리거할 수 있는지를 게이팅하며, 오늘날 필터링되는 것은 특정 보조 컨텍스트 경로뿐입니다.
- DM 히스토리는 `channels.msteams.dmHistoryLimit`(사용자 턴)로 제한할 수 있습니다. 사용자별 오버라이드: `channels.msteams.dms["<user_id>"].historyLimit`.

## 현재 Teams RSC 권한

다음은 Teams 앱 매니페스트의 **기존 resourceSpecific 권한**입니다. 앱이 설치된 팀/채팅 내에서만 적용됩니다.

**채널용(team scope):**

- `ChannelMessage.Read.Group` (Application) - @mention 없이 모든 채널 메시지 수신
- `ChannelMessage.Send.Group` (Application)
- `Member.Read.Group` (Application)
- `Owner.Read.Group` (Application)
- `ChannelSettings.Read.Group` (Application)
- `TeamMember.Read.Group` (Application)
- `TeamSettings.Read.Group` (Application)

**그룹 채팅용:**

- `ChatMessage.Read.Chat` (Application) - @mention 없이 모든 그룹 채팅 메시지 수신

## Teams 매니페스트 예시

필수 필드가 포함된 최소한의 유효한 예시입니다. ID와 URL을 교체하세요.

```json5
{
  $schema: "https://developer.microsoft.com/en-us/json-schemas/teams/v1.23/MicrosoftTeams.schema.json",
  manifestVersion: "1.23",
  version: "1.0.0",
  id: "00000000-0000-0000-0000-000000000000",
  name: { short: "OpenClaw" },
  developer: {
    name: "Your Org",
    websiteUrl: "https://example.com",
    privacyUrl: "https://example.com/privacy",
    termsOfUseUrl: "https://example.com/terms",
  },
  description: { short: "OpenClaw in Teams", full: "OpenClaw in Teams" },
  icons: { outline: "outline.png", color: "color.png" },
  accentColor: "#5B6DEF",
  bots: [
    {
      botId: "11111111-1111-1111-1111-111111111111",
      scopes: ["personal", "team", "groupChat"],
      isNotificationOnly: false,
      supportsCalling: false,
      supportsVideo: false,
      supportsFiles: true,
    },
  ],
  webApplicationInfo: {
    id: "11111111-1111-1111-1111-111111111111",
  },
  authorization: {
    permissions: {
      resourceSpecific: [
        { name: "ChannelMessage.Read.Group", type: "Application" },
        { name: "ChannelMessage.Send.Group", type: "Application" },
        { name: "Member.Read.Group", type: "Application" },
        { name: "Owner.Read.Group", type: "Application" },
        { name: "ChannelSettings.Read.Group", type: "Application" },
        { name: "TeamMember.Read.Group", type: "Application" },
        { name: "TeamSettings.Read.Group", type: "Application" },
        { name: "ChatMessage.Read.Chat", type: "Application" },
      ],
    },
  },
}
```

### 매니페스트 주의 사항(필수 필드)

- `bots[].botId`는 Azure Bot App ID와 **반드시** 일치해야 합니다.
- `webApplicationInfo.id`는 Azure Bot App ID와 **반드시** 일치해야 합니다.
- `bots[].scopes`는 사용할 표면(`personal`, `team`, `groupChat`)을 포함해야 합니다.
- `bots[].supportsFiles: true`는 personal scope에서 파일 처리를 위해 필요합니다.
- 채널 트래픽을 원한다면 `authorization.permissions.resourceSpecific`은 channel read/send를 포함해야 합니다.

### 기존 앱 업데이트

이미 설치된 Teams 앱을 업데이트(예: RSC 권한 추가)하려면:

1. 새 설정으로 `manifest.json`을 업데이트합니다
2. **`version` 필드를 증가**시킵니다(예: `1.0.0` → `1.1.0`)
3. 아이콘(`manifest.json`, `outline.png`, `color.png`)과 함께 매니페스트를 **다시 압축**합니다
4. 새 zip을 업로드합니다:
   - **옵션 A (Teams Admin Center):** Teams Admin Center → Teams apps → Manage apps → 앱 찾기 → Upload new version
   - **옵션 B (Sideload):** Teams에서 → Apps → Manage your apps → Upload a custom app
5. **팀 채널의 경우:** 새 권한이 적용되도록 각 팀에서 앱을 재설치합니다
6. 캐시된 앱 메타데이터를 지우려면 **Teams를 완전히 종료하고 다시 시작**하세요(창만 닫지 말고)

## 기능: RSC 전용 vs Graph

### Teams RSC 전용 (Graph API 권한 없음)

작동:

- 채널 메시지 **텍스트** 콘텐츠 읽기.
- 채널 메시지 **텍스트** 콘텐츠 전송.
- **개인(DM)** 파일 첨부 수신.

작동하지 않음:

- 채널/그룹 **이미지 또는 파일 콘텐츠**(페이로드에는 HTML 스텁만 포함됨).
- SharePoint/OneDrive에 저장된 첨부파일 다운로드.
- 메시지 히스토리 읽기(라이브 webhook 이벤트 외).

### Teams RSC + Microsoft Graph application 권한

추가 기능:

- 호스팅된 콘텐츠(메시지에 붙여넣은 이미지) 다운로드.
- SharePoint/OneDrive에 저장된 파일 첨부 다운로드.
- Graph를 통한 채널/채팅 메시지 히스토리 읽기.

### RSC vs Graph API

| 기능                    | RSC 권한                | Graph API                                |
| ----------------------- | ----------------------- | ---------------------------------------- |
| **실시간 메시지**       | 예 (webhook을 통해)     | 아니오 (폴링만 가능)                     |
| **과거 메시지**         | 아니오                  | 예 (히스토리 조회 가능)                  |
| **설정 복잡도**         | 앱 매니페스트만 필요    | 관리자 동의 + 토큰 흐름 필요             |
| **오프라인 동작**       | 아니오 (실행 중이어야)  | 예 (언제든지 조회 가능)                  |

**결론:** RSC는 실시간 수신용이고, Graph API는 과거 기록 접근용입니다. 오프라인 중 누락된 메시지를 따라잡으려면 `ChannelMessage.Read.All`이 있는 Graph API가 필요합니다(관리자 동의 필요).

## Graph 기반 미디어 + 히스토리 (채널에 필요)

**채널**에서 이미지/파일이 필요하거나 **메시지 히스토리**를 가져오려면 Microsoft Graph 권한을 활성화하고 관리자 동의를 부여해야 합니다.

1. Entra ID(Azure AD) **App Registration**에서 Microsoft Graph **Application permissions**를 추가합니다:
   - `ChannelMessage.Read.All` (채널 첨부 + 히스토리)
   - `Chat.Read.All` 또는 `ChatMessage.Read.All` (그룹 채팅)
2. 테넌트에 대해 **관리자 동의를 부여**합니다.
3. Teams 앱 **매니페스트 버전**을 올리고, 다시 업로드하고, **Teams에서 앱을 재설치**합니다.
4. 캐시된 앱 메타데이터를 지우려면 **Teams를 완전히 종료하고 다시 시작**합니다.

**사용자 멘션을 위한 추가 권한:** 사용자 @mention은 대화에 속한 사용자에 대해 기본적으로 작동합니다. 하지만 **현재 대화에 없는** 사용자를 동적으로 검색하고 멘션하려면 `User.Read.All`(Application) 권한을 추가하고 관리자 동의를 부여하세요.

## 알려진 제한 사항

### Webhook 타임아웃

Teams는 HTTP webhook을 통해 메시지를 전달합니다. 처리 시간이 너무 오래 걸리면(예: LLM 응답이 느린 경우) 다음이 발생할 수 있습니다:

- 게이트웨이 타임아웃
- Teams의 메시지 재시도(중복 유발)
- 응답 유실

OpenClaw는 빠르게 반환하고 응답을 능동적(proactive)으로 전송하여 이를 처리하지만, 매우 느린 응답은 여전히 문제를 일으킬 수 있습니다.

### 서식

Teams 마크다운은 Slack이나 Discord보다 더 제한적입니다:

- 기본 서식은 작동합니다: **볼드**, _이탤릭_, `code`, 링크
- 복잡한 마크다운(표, 중첩 리스트)은 올바르게 렌더링되지 않을 수 있습니다
- 투표 및 시맨틱 프레젠테이션 전송에는 Adaptive Cards가 지원됩니다(아래 참조)

## 구성

그룹화된 설정(공유 채널 패턴은 `/gateway/configuration/` 참조).

<AccordionGroup>
  <Accordion title="코어 및 webhook">
    - `channels.msteams.enabled`
    - `channels.msteams.appId`, `appPassword`, `tenantId`: bot 자격 증명
    - `channels.msteams.webhook.port` (기본 `3978`)
    - `channels.msteams.webhook.path` (기본 `/api/messages`)
  </Accordion>

  <Accordion title="인증">
    - `authType`: `"secret"` (기본값) 또는 `"federated"`
    - `certificatePath`, `certificateThumbprint`: federated + 인증서 인증(thumbprint는 선택 사항)
    - `useManagedIdentity`, `managedIdentityClientId`: federated + managed identity 인증
  </Accordion>

  <Accordion title="접근 제어">
    - `dmPolicy`: `pairing | allowlist | open | disabled` (기본값: pairing)
    - `allowFrom`: DM 허용 목록, AAD object ID 선호. wizard는 Graph 접근이 가능한 경우 이름을 해석합니다
    - `dangerouslyAllowNameMatching`: 변경 가능한 UPN/표시 이름 및 팀/채널 이름 라우팅용 비상 스위치
    - `requireMention`: 채널/그룹에서 @mention 요구(기본 `true`)
  </Accordion>

  <Accordion title="팀 및 채널 오버라이드">
    다음은 모두 최상위 기본값을 재정의합니다:

    - `teams.<teamId>.replyStyle`, `.requireMention`
    - `teams.<teamId>.tools`, `.toolsBySender`: 팀별 툴 정책 기본값
    - `teams.<teamId>.channels.<conversationId>.replyStyle`, `.requireMention`
    - `teams.<teamId>.channels.<conversationId>.tools`, `.toolsBySender`

    `toolsBySender` 키는 `id:`, `e164:`, `username:`, `name:` 접두사를 허용합니다(접두사 없는 키는 `id:`로 매핑됩니다). `"*"`는 와일드카드입니다.

  </Accordion>

  <Accordion title="전달, 미디어 및 액션">
    - `textChunkLimit`: 아웃바운드 텍스트 청크 크기
    - `chunkMode`: `length` (기본값) 또는 `newline` (길이 이전에 단락 경계에서 분할)
    - `mediaAllowHosts`: 인바운드 첨부 호스트 허용 목록(기본적으로 Microsoft/Teams 도메인)
    - `mediaAuthAllowHosts`: 재시도 시 Authorization 헤더를 수신할 수 있는 호스트(기본적으로 Graph + Bot Framework)
    - `replyStyle`: `thread | top-level` ([응답 스타일](#reply-style-threads-vs-posts) 참조)
    - `actions.memberInfo`: Graph 기반 멤버 정보 액션 토글(Graph 사용 가능 시 기본 활성)
    - `sharePointSiteId`: 그룹 채팅/채널의 파일 업로드에 필요([그룹 채팅에서 파일 전송](#sending-files-in-group-chats) 참조)
  </Accordion>
</AccordionGroup>

## 라우팅 및 세션

- 세션 키는 표준 에이전트 형식을 따릅니다([/concepts/session](/concepts/session) 참조):
  - DM은 메인 세션을 공유합니다(`agent:<agentId>:<mainKey>`).
  - 채널/그룹 메시지는 conversation id를 사용합니다:
    - `agent:<agentId>:msteams:channel:<conversationId>`
    - `agent:<agentId>:msteams:group:<conversationId>`

## 응답 스타일: threads vs posts

Teams는 최근 동일한 기반 데이터 모델 위에 두 가지 channel UI 스타일을 도입했습니다:

| 스타일                   | 설명                                                         | 권장 `replyStyle`        |
| ------------------------ | ------------------------------------------------------------ | ------------------------ |
| **Posts** (클래식)       | 메시지가 카드로 표시되고 아래에 스레드 응답이 달림           | `thread` (기본값)        |
| **Threads** (Slack-유사) | 메시지가 선형으로 흐르며 Slack과 유사함                      | `top-level`              |

**문제점:** Teams API는 채널이 어떤 UI 스타일을 사용하는지 노출하지 않습니다. 잘못된 `replyStyle`을 사용하면:

- Threads 스타일 채널에서 `thread` → 응답이 어색하게 중첩됩니다
- Posts 스타일 채널에서 `top-level` → 응답이 스레드 안이 아닌 별도의 최상위 포스트로 나타납니다

**해결책:** 채널이 설정된 방식에 따라 채널별로 `replyStyle`을 구성하세요:

```json5
{
  channels: {
    msteams: {
      replyStyle: "thread",
      teams: {
        "19:abc...@thread.tacv2": {
          channels: {
            "19:xyz...@thread.tacv2": {
              replyStyle: "top-level",
            },
          },
        },
      },
    },
  },
}
```

## 첨부 파일 및 이미지

**현재 제한 사항:**

- **DM:** 이미지와 파일 첨부는 Teams bot 파일 API를 통해 작동합니다.
- **채널/그룹:** 첨부 파일은 M365 스토리지(SharePoint/OneDrive)에 저장됩니다. webhook 페이로드에는 실제 파일 바이트가 아닌 HTML 스텁만 포함됩니다. 채널 첨부를 다운로드하려면 **Graph API 권한이 필요**합니다.
- 명시적 파일 우선 전송은 `action=upload-file`과 `media` / `filePath` / `path`를 사용하세요. 선택 사항인 `message`는 동반 텍스트/코멘트가 되며, `filename`은 업로드된 이름을 재정의합니다.

Graph 권한이 없으면 이미지가 포함된 채널 메시지는 텍스트 전용으로 수신됩니다(이미지 콘텐츠를 bot이 접근할 수 없음).
기본적으로 OpenClaw는 Microsoft/Teams 호스트 이름에서만 미디어를 다운로드합니다. `channels.msteams.mediaAllowHosts`로 재정의합니다(모든 호스트를 허용하려면 `["*"]`).
Authorization 헤더는 `channels.msteams.mediaAuthAllowHosts`에 있는 호스트에만 첨부됩니다(기본적으로 Graph + Bot Framework 호스트). 이 목록은 엄격하게 유지하세요(멀티테넌트 접미사 피하기).

## 그룹 채팅에서 파일 전송

bot은 내장된 FileConsentCard 흐름을 사용해 DM에서 파일을 전송할 수 있습니다. 하지만 **그룹 채팅/채널에서 파일을 전송**하려면 추가 설정이 필요합니다:

| 컨텍스트                  | 파일 전송 방식                                        | 필요한 설정                                              |
| ------------------------- | ----------------------------------------------------- | -------------------------------------------------------- |
| **DM**                    | FileConsentCard → 사용자 승인 → bot 업로드            | 기본 제공                                                |
| **그룹 채팅/채널**        | SharePoint로 업로드 → 공유 링크                       | `sharePointSiteId` + Graph 권한 필요                     |
| **이미지 (모든 컨텍스트)**| 인라인 Base64 인코딩                                  | 기본 제공                                                |

### 그룹 채팅에 SharePoint가 필요한 이유

bot은 개인 OneDrive 드라이브를 가지고 있지 않습니다(`/me/drive` Graph API 엔드포인트는 application identity에서 작동하지 않습니다). 그룹 채팅/채널에서 파일을 전송하려면 bot이 **SharePoint 사이트**에 업로드하고 공유 링크를 생성합니다.

### 설정

1. Entra ID(Azure AD) → App Registration에 **Graph API 권한을 추가**합니다:
   - `Sites.ReadWrite.All` (Application) - SharePoint에 파일 업로드
   - `Chat.Read.All` (Application) - 선택 사항, 사용자별 공유 링크 활성화

2. 테넌트에 **관리자 동의를 부여**합니다.

3. **SharePoint 사이트 ID 가져오기:**

   ```bash
   # Graph Explorer 또는 유효한 토큰이 있는 curl을 통해:
   curl -H "Authorization: Bearer $TOKEN" \
     "https://graph.microsoft.com/v1.0/sites/{hostname}:/{site-path}"

   # 예시: "contoso.sharepoint.com/sites/BotFiles" 사이트의 경우
   curl -H "Authorization: Bearer $TOKEN" \
     "https://graph.microsoft.com/v1.0/sites/contoso.sharepoint.com:/sites/BotFiles"

   # 응답에는 다음이 포함됩니다: "id": "contoso.sharepoint.com,guid1,guid2"
   ```

4. **OpenClaw 구성:**

   ```json5
   {
     channels: {
       msteams: {
         // ... 기타 구성 ...
         sharePointSiteId: "contoso.sharepoint.com,guid1,guid2",
       },
     },
   }
   ```

### 공유 동작

| 권한                                       | 공유 동작                                                        |
| ------------------------------------------ | ---------------------------------------------------------------- |
| `Sites.ReadWrite.All`만                    | 조직 전체 공유 링크(조직 내 누구나 접근 가능)                    |
| `Sites.ReadWrite.All` + `Chat.Read.All`    | 사용자별 공유 링크(채팅 멤버만 접근 가능)                        |

사용자별 공유는 채팅 참가자만 파일에 접근할 수 있으므로 더 안전합니다. `Chat.Read.All` 권한이 누락된 경우, bot은 조직 전체 공유로 폴백됩니다.

### 폴백 동작

| 시나리오                                               | 결과                                                          |
| ------------------------------------------------------ | ------------------------------------------------------------- |
| 그룹 채팅 + 파일 + `sharePointSiteId` 구성됨           | SharePoint로 업로드, 공유 링크 전송                           |
| 그룹 채팅 + 파일 + `sharePointSiteId` 없음             | OneDrive 업로드 시도(실패할 수 있음), 텍스트만 전송           |
| 개인 채팅 + 파일                                       | FileConsentCard 흐름(SharePoint 없이 작동)                    |
| 모든 컨텍스트 + 이미지                                 | 인라인 Base64 인코딩(SharePoint 없이 작동)                    |

### 파일 저장 위치

업로드된 파일은 구성된 SharePoint 사이트의 기본 document library에 있는 `/OpenClawShared/` 폴더에 저장됩니다.

## 투표 (adaptive cards)

OpenClaw는 Teams 투표를 Adaptive Cards로 전송합니다(네이티브 Teams 투표 API가 없기 때문).

- CLI: `openclaw message poll --channel msteams --target conversation:<id> ...`
- 투표는 `~/.openclaw/msteams-polls.json`에서 게이트웨이에 의해 기록됩니다.
- 게이트웨이는 투표를 기록하기 위해 온라인 상태를 유지해야 합니다.
- 투표는 아직 결과 요약을 자동 게시하지 않습니다(필요 시 저장 파일을 검사하세요).

## 프레젠테이션 카드

`message` 도구 또는 CLI를 사용하여 Teams 사용자 또는 대화에 시맨틱 프레젠테이션 페이로드를 전송합니다. OpenClaw는 이를 범용 프레젠테이션 계약에서 Teams Adaptive Cards로 렌더링합니다.

`presentation` 파라미터는 시맨틱 블록을 허용합니다. `presentation`이 제공되면 메시지 텍스트는 선택 사항입니다.

**에이전트 도구:**

```json5
{
  action: "send",
  channel: "msteams",
  target: "user:<id>",
  presentation: {
    title: "Hello",
    blocks: [{ type: "text", text: "Hello!" }],
  },
}
```

**CLI:**

```bash
openclaw message send --channel msteams \
  --target "conversation:19:abc...@thread.tacv2" \
  --presentation '{"title":"Hello","blocks":[{"type":"text","text":"Hello!"}]}'
```

target 형식 세부 사항은 아래 [Target 형식](#target-formats)을 참조하세요.

## Target 형식

MSTeams target은 사용자와 대화를 구분하기 위해 접두사를 사용합니다:

| Target 유형         | 형식                              | 예시                                                      |
| ------------------- | --------------------------------- | --------------------------------------------------------- |
| User (ID로)         | `user:<aad-object-id>`            | `user:40a1a0ed-4ff2-4164-a219-55518990c197`               |
| User (이름으로)     | `user:<display-name>`             | `user:John Smith` (Graph API 필요)                        |
| Group/channel       | `conversation:<conversation-id>`  | `conversation:19:abc123...@thread.tacv2`                  |
| Group/channel (raw) | `<conversation-id>`               | `19:abc123...@thread.tacv2` (`@thread` 포함 시)           |

**CLI 예시:**

```bash
# ID로 사용자에게 전송
openclaw message send --channel msteams --target "user:40a1a0ed-..." --message "Hello"

# 표시 이름으로 사용자에게 전송 (Graph API 조회 트리거)
openclaw message send --channel msteams --target "user:John Smith" --message "Hello"

# 그룹 채팅 또는 채널로 전송
openclaw message send --channel msteams --target "conversation:19:abc...@thread.tacv2" --message "Hello"

# 대화로 프레젠테이션 카드 전송
openclaw message send --channel msteams --target "conversation:19:abc...@thread.tacv2" \
  --presentation '{"title":"Hello","blocks":[{"type":"text","text":"Hello"}]}'
```

**에이전트 도구 예시:**

```json5
{
  action: "send",
  channel: "msteams",
  target: "user:John Smith",
  message: "Hello!",
}
```

```json5
{
  action: "send",
  channel: "msteams",
  target: "conversation:19:abc...@thread.tacv2",
  presentation: {
    title: "Hello",
    blocks: [{ type: "text", text: "Hello" }],
  },
}
```

참고: `user:` 접두사가 없으면 이름은 기본적으로 그룹/팀 해석으로 이동합니다. 표시 이름으로 사람을 대상으로 할 때는 항상 `user:`를 사용하세요.

## 능동적 메시징(Proactive messaging)

- 능동적 메시지는 사용자가 상호 작용한 **이후에만** 가능합니다. 그 시점에 대화 참조를 저장하기 때문입니다.
- `dmPolicy` 및 허용 목록 게이팅에 대해서는 `/gateway/configuration/`을 참조하세요.

## Team 및 channel ID

Teams URL의 `groupId` 쿼리 파라미터는 구성에 사용되는 team ID가 **아닙니다**. 대신 URL 경로에서 ID를 추출하세요:

**팀 URL:**

```
https://teams.microsoft.com/l/team/19%3ABk4j...%40thread.tacv2/conversations?groupId=...
                                    └────────────────────────────┘
                                    Team ID (URL 디코딩)
```

**채널 URL:**

```
https://teams.microsoft.com/l/channel/19%3A15bc...%40thread.tacv2/ChannelName?groupId=...
                                      └─────────────────────────┘
                                      Channel ID (URL 디코딩)
```

**구성용:**

- Team ID = `/team/` 뒤의 경로 세그먼트(URL 디코딩, 예: `19:Bk4j...@thread.tacv2`)
- Channel ID = `/channel/` 뒤의 경로 세그먼트(URL 디코딩)
- `groupId` 쿼리 파라미터는 **무시**하세요

## 프라이빗 채널(Private channels)

bot은 프라이빗 채널에서 제한된 지원을 제공합니다:

| 기능                         | 표준 채널              | 프라이빗 채널                  |
| ---------------------------- | ---------------------- | ------------------------------ |
| Bot 설치                     | 예                     | 제한적                         |
| 실시간 메시지 (webhook)      | 예                     | 작동하지 않을 수 있음          |
| RSC 권한                     | 예                     | 다르게 동작할 수 있음          |
| @mention                     | 예                     | bot 접근이 가능한 경우         |
| Graph API 히스토리           | 예                     | 예 (권한 필요)                 |

**프라이빗 채널이 작동하지 않을 때의 해결책:**

1. bot 상호작용에는 표준 채널을 사용합니다
2. DM 사용 - 사용자는 항상 bot에게 직접 메시지를 보낼 수 있습니다
3. 과거 접근에는 Graph API 사용(`ChannelMessage.Read.All` 필요)

## 문제 해결

### 일반적인 문제

- **채널에서 이미지가 표시되지 않음:** Graph 권한 또는 관리자 동의 누락. Teams 앱을 재설치하고 Teams를 완전히 종료 후 다시 엽니다.
- **채널에서 응답 없음:** 기본적으로 멘션이 필요합니다. `channels.msteams.requireMention=false`로 설정하거나 팀/채널별로 구성하세요.
- **버전 불일치 (Teams가 여전히 이전 매니페스트를 표시):** 앱을 제거 후 다시 추가하고 Teams를 완전히 종료하여 새로고침합니다.
- **webhook의 401 Unauthorized:** Azure JWT 없이 수동으로 테스트할 때 예상되는 결과 - 엔드포인트에는 도달하지만 인증에 실패했음을 의미합니다. 적절히 테스트하려면 Azure Web Chat을 사용하세요.

### 매니페스트 업로드 오류

- **"Icon file cannot be empty":** 매니페스트가 0바이트인 아이콘 파일을 참조합니다. 유효한 PNG 아이콘을 생성하세요(`outline.png`는 32x32, `color.png`는 192x192).
- **"webApplicationInfo.Id already in use":** 앱이 여전히 다른 팀/채팅에 설치되어 있습니다. 먼저 찾아서 제거하거나 전파를 위해 5-10분 기다리세요.
- **업로드 시 "Something went wrong":** [https://admin.teams.microsoft.com](https://admin.teams.microsoft.com)에서 대신 업로드하고, 브라우저 DevTools(F12) → Network 탭을 열어 실제 오류에 대한 응답 본문을 확인하세요.
- **사이드로드 실패:** "Upload a custom app" 대신 "Upload an app to your org's app catalog"를 시도하세요. 사이드로드 제한을 우회하는 경우가 많습니다.

### RSC 권한이 작동하지 않음

1. `webApplicationInfo.id`가 bot의 App ID와 정확히 일치하는지 확인합니다
2. 앱을 다시 업로드하고 팀/채팅에서 재설치합니다
3. 조직 관리자가 RSC 권한을 차단했는지 확인합니다
4. 올바른 scope를 사용하는지 확인합니다: 팀에는 `ChannelMessage.Read.Group`, 그룹 채팅에는 `ChatMessage.Read.Chat`

## 참고 자료

- [Azure Bot 생성](https://learn.microsoft.com/en-us/azure/bot-service/bot-service-quickstart-registration) - Azure Bot 설정 가이드
- [Teams Developer Portal](https://dev.teams.microsoft.com/apps) - Teams 앱 생성/관리
- [Teams app manifest schema](https://learn.microsoft.com/en-us/microsoftteams/platform/resources/schema/manifest-schema)
- [RSC로 채널 메시지 수신](https://learn.microsoft.com/en-us/microsoftteams/platform/bots/how-to/conversations/channel-messages-with-rsc)
- [RSC 권한 참조](https://learn.microsoft.com/en-us/microsoftteams/platform/graph-api/rsc/resource-specific-consent)
- [Teams bot 파일 처리](https://learn.microsoft.com/en-us/microsoftteams/platform/bots/how-to/bots-filesv4) (channel/group은 Graph 필요)
- [능동적 메시징](https://learn.microsoft.com/en-us/microsoftteams/platform/bots/how-to/conversations/send-proactive-messages)

## 관련 항목

<CardGroup cols={2}>
  <Card title="채널 개요" icon="list" href="/channels/">
    지원되는 모든 채널.
  </Card>
  <Card title="페어링" icon="link" href="/channels/pairing">
    DM 인증 및 페어링 흐름.
  </Card>
  <Card title="그룹" icon="users" href="/channels/groups">
    그룹 채팅 동작 및 멘션 게이팅.
  </Card>
  <Card title="채널 라우팅" icon="route" href="/channels/channel-routing">
    메시지 세션 라우팅.
  </Card>
  <Card title="보안" icon="shield" href="/gateway/security/">
    접근 모델 및 강화.
  </Card>
</CardGroup>
