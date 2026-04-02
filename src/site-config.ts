export const DEFAULT_SITE_URL = 'https://maymai.dev';
export const DEFAULT_SITE_NAME = 'Maymai.dev';
export const DEFAULT_TAGLINE = 'AIの力をかりながら、\nしずかで心地よいデジタル体験をつくっています。';
export const DEFAULT_TITLE_SEPARATOR = ' | ';

export interface SkillGroup {
  label: string;
  items: string[];
}

export interface SocialLink {
  label: string;
  href: string;
}

interface MediaSettingLike {
  mediaId?: string;
  alt?: string;
  url?: string | null;
}

export interface SiteProfileData {
  heroLabel: string;
  heroHeadingLine1: string;
  heroHeadingLine2: string;
  profileName: string;
  profileAlias: string;
  profileRole: string;
  basedIn: string;
  philosophy: string;
  aboutParagraphs: string[];
  contactDescription: string;
  skillGroups: SkillGroup[];
}

const DEFAULT_SOCIAL_LINKS: SocialLink[] = [
  { label: 'X (Twitter)', href: 'https://x.com/mei_999_' },
  { label: 'GitHub', href: 'https://github.com/ozekimasaki' },
];

const SOCIAL_LINK_LABELS: Array<{ key: string; label: string }> = [
  { key: 'twitter', label: 'X (Twitter)' },
  { key: 'github', label: 'GitHub' },
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'youtube', label: 'YouTube' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'facebook', label: 'Facebook' },
];

export const DEFAULT_PROFILE: SiteProfileData = {
  heroLabel: '// portfolio_v1.0',
  heroHeadingLine1: 'Code with AI,',
  heroHeadingLine2: 'Create for Someone.',
  profileName: 'Masaki Ozeki',
  profileAlias: 'Maymai',
  profileRole: 'Frontend Engineer',
  basedIn: 'Hokkaido',
  philosophy: '技術は誰かのために',
  aboutParagraphs: [
    '技術は誰かのために。誰かの小さな幸せのために、コードを書いています。',
    'Cursor・Claude Code・Copilot など AIコーディングツール を日常の開発に取り入れ、品質とスピードを両立するワークフローを追求しています。',
    'Viteプラグインの自作からMCPゲームの実験まで、思いついたら手を動かす。そのアウトプットの積み重ねが、すべての技術力の起点です。',
  ],
  contactDescription: '連絡はお気軽にどうぞ。',
  skillGroups: [
    {
      label: '// languages',
      items: ['TypeScript', 'JavaScript', 'Python', 'PHP', 'Kotlin', 'HTML', 'CSS · SCSS', 'Pug'],
    },
    {
      label: '// frameworks',
      items: ['Astro', 'Vite', 'React', 'Node.js', 'WordPress', 'Discord.js'],
    },
    {
      label: '// infrastructure',
      items: ['Cloudflare Workers', 'KV', 'R2', 'D1', 'Docker'],
    },
    {
      label: '// ai coding',
      items: ['Cursor', 'Codex', 'Claude Code', 'GitHub Copilot', 'Windsurf', 'Opencode', 'OpenClaw'],
    },
    {
      label: '// tools & services',
      items: ['Git', 'Chrome Extensions', 'MCP', 'Figma'],
    },
  ],
};

export interface SiteSettingsLike {
  title?: string | null;
  tagline?: string | null;
  logo?: MediaSettingLike | null;
  favicon?: MediaSettingLike | null;
  url?: string | null;
  social?: Record<string, unknown> | null;
  seo?: {
    titleSeparator?: string | null;
    defaultOgImage?: MediaSettingLike | null;
    googleVerification?: string | null;
    bingVerification?: string | null;
  } | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getString(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim().length > 0 ? value : fallback;
}

function cloneSkillGroups(skillGroups: readonly SkillGroup[]): SkillGroup[] {
  return skillGroups.map((group) => ({
    label: group.label,
    items: [...group.items],
  }));
}

export function normalizeStringArray(value: unknown, fallback: readonly string[]): string[] {
  if (!Array.isArray(value)) {
    return [...fallback];
  }

  const items = value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);

  return items.length > 0 ? items : [...fallback];
}

export function normalizeSkillGroups(
  value: unknown,
  fallback: readonly SkillGroup[] = DEFAULT_PROFILE.skillGroups,
): SkillGroup[] {
  if (!Array.isArray(value)) {
    return cloneSkillGroups(fallback);
  }

  const groups = value.flatMap((group) => {
    if (!isRecord(group)) {
      return [];
    }

    const label = typeof group.label === 'string' && group.label.trim().length > 0 ? group.label : null;
    const items = normalizeStringArray(group.items, []);

    if (!label || items.length === 0) {
      return [];
    }

    return [{ label, items }];
  });

  return groups.length > 0 ? groups : cloneSkillGroups(fallback);
}

function normalizeSiteUrl(url: string): string {
  try {
    return new URL(url).href.replace(/\/+$/, '');
  } catch {
    return DEFAULT_SITE_URL;
  }
}

export function resolveSiteName(settings?: SiteSettingsLike | null): string {
  return getString(settings?.title, DEFAULT_SITE_NAME);
}

export function resolveTagline(settings?: SiteSettingsLike | null): string {
  return getString(settings?.tagline, DEFAULT_TAGLINE);
}

export function resolveSiteUrl(settings?: SiteSettingsLike | null): string {
  return typeof settings?.url === 'string' && settings.url.trim().length > 0
    ? normalizeSiteUrl(settings.url)
    : DEFAULT_SITE_URL;
}

export function resolveTitleSeparator(settings?: SiteSettingsLike | null): string {
  return getString(settings?.seo?.titleSeparator, DEFAULT_TITLE_SEPARATOR);
}

export function resolveSocialLinks(settings?: SiteSettingsLike | null): SocialLink[] {
  const social = isRecord(settings?.social) ? settings.social : null;
  const links = SOCIAL_LINK_LABELS.flatMap(({ key, label }) => {
    const href = social?.[key];
    return typeof href === 'string' && href.trim().length > 0 ? [{ label, href }] : [];
  });

  return links.length > 0 ? links : DEFAULT_SOCIAL_LINKS.map((link) => ({ ...link }));
}

export function resolveSameAs(settings?: SiteSettingsLike | null): string[] {
  return resolveSocialLinks(settings).map((link) => link.href);
}

export function resolveMediaUrl(value: unknown): string | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  return typeof value.url === 'string' && value.url.trim().length > 0 ? value.url : undefined;
}

export function canFallbackProfileEntry(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();
  return (
    message.includes('not found')
    || message.includes('unknown collection')
    || message.includes('no such table')
  );
}

export function resolveSiteProfile(data: unknown): SiteProfileData {
  const profile = isRecord(data) ? data : {};

  return {
    heroLabel: getString(profile.hero_label ?? profile.heroLabel, DEFAULT_PROFILE.heroLabel),
    heroHeadingLine1: getString(
      profile.hero_heading_line_1 ?? profile.heroHeadingLine1,
      DEFAULT_PROFILE.heroHeadingLine1,
    ),
    heroHeadingLine2: getString(
      profile.hero_heading_line_2 ?? profile.heroHeadingLine2,
      DEFAULT_PROFILE.heroHeadingLine2,
    ),
    profileName: getString(profile.profile_name ?? profile.profileName, DEFAULT_PROFILE.profileName),
    profileAlias: getString(profile.profile_alias ?? profile.profileAlias, DEFAULT_PROFILE.profileAlias),
    profileRole: getString(profile.profile_role ?? profile.profileRole, DEFAULT_PROFILE.profileRole),
    basedIn: getString(profile.based_in ?? profile.basedIn, DEFAULT_PROFILE.basedIn),
    philosophy: getString(profile.philosophy, DEFAULT_PROFILE.philosophy),
    aboutParagraphs: normalizeStringArray(
      profile.about_paragraphs ?? profile.aboutParagraphs,
      DEFAULT_PROFILE.aboutParagraphs,
    ),
    contactDescription: getString(
      profile.contact_description ?? profile.contactDescription,
      DEFAULT_PROFILE.contactDescription,
    ),
    skillGroups: normalizeSkillGroups(profile.skill_groups ?? profile.skillGroups),
  };
}
