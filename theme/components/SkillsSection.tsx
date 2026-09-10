/** @jsxImportSource @ox-content/vite-plugin */
import { each, type JSXNode } from '@ox-content/vite-plugin';

const skillGroups = [
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
];

const totalCount = skillGroups.reduce((sum, group) => sum + group.items.length, 0);

export function SkillsSection(): JSXNode {
  return (
    <section id="skills" class="Skills">
      <div class="Skills__inner l-inner">
        <div class="Skills__header u-anime">
          <h2 class="Skills__heading">Skills</h2>
          <span class="Skills__label">// skills.length({totalCount})</span>
        </div>

        <div class="Skills__body">
          {each(skillGroups, (group, i) => (
            <div class="Skills__group u-anime" style={`--delay: ${.1 + i * .08}s;`}>
              <p class="Skills__groupLabel">{group.label}</p>
              <ul class="Skills__list">
                {each(group.items, (skill) => (
                  <li class="Skills__item">{skill}<span class="Skills__slash">/</span></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
