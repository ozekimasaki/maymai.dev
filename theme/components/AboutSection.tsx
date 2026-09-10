/** @jsxImportSource @ox-content/vite-plugin */
import { each, type JSXNode } from '@ox-content/vite-plugin';

const profileItems = [
  { key: 'name', value: 'Masaki Ozeki' },
  { key: 'role', value: 'Frontend Engineer' },
  { key: 'based_in', value: 'Hokkaido' },
];

export function AboutSection(): JSXNode {
  return (
    <section id="about" class="About">
      <div class="About__inner l-inner">
        <div class="About__header u-anime">
          <h2 class="About__heading">About</h2>
          <span class="About__label">// Author_Profile</span>
        </div>

        <div class="About__body">
          <div class="About__text u-anime" style="--delay: .1s;">
            <p>
              技術は誰かのために。
              誰かの小さな幸せのために、コードを書いています。
            </p>
            <p>
              Cursor・Claude Code・Copilot など <span class="About__accent">AIコーディングツール</span> を日常の開発に取り入れ、
              品質とスピードを両立するワークフローを追求しています。
            </p>
            <p>
              Viteプラグインの自作からMCPゲームの実験まで、
              思いついたら手を動かす。そのアウトプットの積み重ねが、すべての技術力の起点です。
            </p>
          </div>

          <dl class="About__profile u-anime" style="--delay: .2s;">
            {each(profileItems, (item) => (
              <div class="About__profileItem">
                <dt class="About__profileKey">{item.key}:</dt>
                <dd class="About__profileValue">{item.value}</dd>
              </div>
            ))}
            <div class="About__profileItem">
              <dt class="About__profileKey">philosophy:</dt>
              <dd class="About__profileValue About__profileValue--accent">技術は誰かのために</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
