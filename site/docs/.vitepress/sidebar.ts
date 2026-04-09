import type { DefaultTheme } from 'vitepress'

interface SidebarSection {
  label: string
  prefix: string
  collapsed?: boolean
  items: { text: string; link: string }[]
}

const sections: SidebarSection[] = [
  {
    label: '시작하기',
    prefix: '/start/',
    items: [
      { text: '시작하기', link: '/start/getting-started' },
      { text: '빠른 시작', link: '/start/quickstart' },
      { text: '설정', link: '/start/setup' },
      { text: '온보딩', link: '/start/onboarding' },
      { text: '온보딩 개요', link: '/start/onboarding-overview' },
      { text: '부트스트래핑', link: '/start/bootstrapping' },
      { text: 'OpenClaw 소개', link: '/start/openclaw' },
      { text: '문서 허브', link: '/start/hubs' },
      { text: '문서 디렉토리', link: '/start/docs-directory' },
      { text: '역사', link: '/start/lore' },
    ],
  },
  {
    label: '개념',
    prefix: '/concepts/',
    items: [
      { text: '아키텍처', link: '/concepts/architecture' },
      { text: '에이전트', link: '/concepts/agent' },
      { text: '에이전트 루프', link: '/concepts/agent-loop' },
      { text: '에이전트 워크스페이스', link: '/concepts/agent-workspace' },
      { text: '컨텍스트 엔진', link: '/concepts/context-engine' },
      { text: '컴팩션', link: '/concepts/compaction' },
      { text: '메모리 개요', link: '/concepts/memory' },
      { text: '메모리 검색', link: '/concepts/memory-search' },
      { text: '내장 메모리', link: '/concepts/memory-builtin' },
      { text: 'QMD 메모리', link: '/concepts/memory-qmd' },
      { text: 'Honcho 메모리', link: '/concepts/memory-honcho' },
    ],
  },
  {
    label: 'CLI',
    prefix: '/cli/',
    items: [
      { text: 'memory', link: '/cli/memory' },
      { text: 'wiki', link: '/cli/wiki' },
      { text: 'agent', link: '/cli/agent' },
      { text: 'agents', link: '/cli/agents' },
      { text: 'channels', link: '/cli/channels' },
      { text: 'browser', link: '/cli/browser' },
      { text: 'backup', link: '/cli/backup' },
      { text: 'clawbot', link: '/cli/clawbot' },
      { text: 'completion', link: '/cli/completion' },
      { text: 'approvals', link: '/cli/approvals' },
      { text: 'acp', link: '/cli/acp' },
    ],
  },
  {
    label: '플러그인',
    prefix: '/plugins/',
    items: [
      { text: 'Memory Wiki', link: '/plugins/memory-wiki' },
      { text: '에이전트 도구', link: '/plugins/agent-tools' },
      { text: '플러그인 빌드', link: '/plugins/building-plugins' },
      { text: '확장 빌드', link: '/plugins/building-extensions' },
      { text: '번들', link: '/plugins/bundles' },
      { text: '커뮤니티', link: '/plugins/community' },
    ],
  },
  {
    label: '게이트웨이',
    prefix: '/gateway/',
    collapsed: true,
    items: [
      { text: '개요', link: '/gateway/index' },
      { text: '인증', link: '/gateway/authentication' },
      { text: '백그라운드 프로세스', link: '/gateway/background-process' },
    ],
  },
  {
    label: '채널',
    prefix: '/channels/',
    collapsed: true,
    items: [
      { text: '개요', link: '/channels/index' },
      { text: '페어링', link: '/channels/pairing' },
      { text: '채널 라우팅', link: '/channels/channel-routing' },
      { text: '문제 해결', link: '/channels/troubleshooting' },
    ],
  },
  {
    label: '설치',
    prefix: '/install/',
    collapsed: true,
    items: [
      { text: 'Docker VM', link: '/install/docker-vm-runtime' },
      { text: 'Ansible', link: '/install/ansible' },
      { text: 'Azure', link: '/install/azure' },
      { text: 'Bun', link: '/install/bun' },
      { text: 'ClawDock', link: '/install/clawdock' },
      { text: 'DigitalOcean', link: '/install/digitalocean' },
      { text: '개발 채널', link: '/install/development-channels' },
    ],
  },
  {
    label: '플랫폼',
    prefix: '/platforms/',
    collapsed: true,
    items: [
      { text: '개요', link: '/platforms/index' },
      { text: 'macOS', link: '/platforms/macos' },
      { text: 'Linux', link: '/platforms/linux' },
      { text: 'iOS', link: '/platforms/ios' },
      { text: 'Android', link: '/platforms/android' },
      { text: 'DigitalOcean', link: '/platforms/digitalocean' },
    ],
  },
  {
    label: '자동화',
    prefix: '/automation/',
    collapsed: true,
    items: [
      { text: '개요', link: '/automation/index' },
      { text: 'Cron 작업', link: '/automation/cron-jobs' },
      { text: 'Cron vs Heartbeat', link: '/automation/cron-vs-heartbeat' },
      { text: 'ClawFlow', link: '/automation/clawflow' },
      { text: 'TaskFlow', link: '/automation/taskflow' },
      { text: 'Hooks', link: '/automation/hooks' },
      { text: 'Poll', link: '/automation/poll' },
      { text: 'Standing Orders', link: '/automation/standing-orders' },
      { text: 'Webhook', link: '/automation/webhook' },
      { text: '인증 모니터링', link: '/automation/auth-monitoring' },
      { text: 'Gmail PubSub', link: '/automation/gmail-pubsub' },
      { text: '문제 해결', link: '/automation/troubleshooting' },
    ],
  },
  {
    label: '프로바이더',
    prefix: '/providers/',
    collapsed: true,
    items: [
      { text: '개요', link: '/providers/index' },
      { text: 'Anthropic', link: '/providers/anthropic' },
      { text: 'Bedrock', link: '/providers/bedrock' },
      { text: 'Bedrock Mantle', link: '/providers/bedrock-mantle' },
      { text: 'DeepSeek', link: '/providers/deepseek' },
      { text: 'Google', link: '/providers/google' },
      { text: 'Groq', link: '/providers/groq' },
      { text: 'OpenAI', link: '/providers/openai' },
      { text: 'OpenRouter', link: '/providers/openrouter' },
      { text: 'Alibaba', link: '/providers/alibaba' },
      { text: 'Arcee', link: '/providers/arcee' },
      { text: 'Chutes', link: '/providers/chutes' },
    ],
  },
  {
    label: '도구',
    prefix: '/tools/',
    collapsed: true,
    items: [
      { text: 'Agent Send', link: '/tools/agent-send' },
      { text: 'Apply Patch', link: '/tools/apply-patch' },
      { text: 'Brave Search', link: '/tools/brave-search' },
      { text: '브라우저 로그인', link: '/tools/browser-login' },
      { text: 'BTW', link: '/tools/btw' },
    ],
  },
  {
    label: '노드',
    prefix: '/nodes/',
    collapsed: true,
    items: [
      { text: '개요', link: '/nodes/index' },
      { text: '오디오', link: '/nodes/audio' },
      { text: '카메라', link: '/nodes/camera' },
      { text: '이미지', link: '/nodes/images' },
      { text: '위치 명령', link: '/nodes/location-command' },
    ],
  },
  {
    label: '참조',
    prefix: '/reference/',
    collapsed: true,
    items: [
      { text: 'AGENTS.md 기본값', link: '/reference/AGENTS.default' },
      { text: 'API 사용 비용', link: '/reference/api-usage-costs' },
      { text: '크레딧', link: '/reference/credits' },
      { text: '기기 모델', link: '/reference/device-models' },
      { text: 'RPC', link: '/reference/rpc' },
      { text: '릴리스', link: '/reference/RELEASING' },
    ],
  },
  {
    label: '웹',
    prefix: '/web/',
    collapsed: true,
    items: [],
  },
  {
    label: '보안',
    prefix: '/security/',
    collapsed: true,
    items: [],
  },
  {
    label: '도움말',
    prefix: '/help/',
    collapsed: true,
    items: [],
  },
]

export function generateSidebar(): DefaultTheme.Sidebar {
  return sections
    .filter((s) => s.items.length > 0)
    .map((s) => ({
      text: s.label,
      collapsed: s.collapsed ?? false,
      items: s.items,
    }))
}
