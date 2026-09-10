/** @jsxImportSource @ox-content/vite-plugin */
import { each, type JSXNode } from '@ox-content/vite-plugin';

const characters = [
  {
    id: '01',
    tabLabel: 'メイ',
    role: 'ハウスキーパー',
    roleColor: '#6B8E5A',
    name: '桜草メイ',
    nameEn: 'May Sakurakusa',
    description: 'アッシュフォード家の住み込みハウスキーパー兼ガーデナー・アシスタント。北海道出身の努力家で、失敗しても「勉強になります！」と前を向く。手仕事と対面の温かさを大切にする、屋敷の暮らしを温める存在。',
    tags: ['#園芸', '#ハーブティー', '#アナログ', '#努力型'],
    specs: [
      { label: '年齢', value: '20歳' },
      { label: '出身', value: '日本・北海道' },
      { label: '好きなもの', value: '園芸、料理、手紙、対面の会話' },
      { label: '苦手なもの', value: 'デジタル操作、人混み、雷' },
    ],
    imageColor: '#6B8E5A',
    number: '001',
    image: '/mayproject/img_character_may.avif',
  },
  {
    id: '02',
    tabLabel: 'エレナ',
    role: 'お嬢様',
    roleColor: '#7F90A6',
    name: 'エレナ・グレース・アッシュフォード',
    nameEn: 'Elena Grace Ashford',
    description: 'アッシュフォード家のお嬢様。上品で穏やか、言葉は多くないが気遣いがにじむ。写真で見たブルーポピーにずっと憧れている。静かにほどけるような優しさで、メイの努力を笑わず、安心できる言葉を返してくれる。',
    tags: ['#読書', '#ブルーポピー', '#穏やか', '#窓辺の光'],
    specs: [
      { label: '年齢', value: '20歳' },
      { label: '瞳の色', value: 'ブルーグレー' },
      { label: '好きなもの', value: '花の写真、読書、窓辺の光' },
      { label: '苦手なもの', value: '騒がしさ、人の多さ' },
    ],
    imageColor: '#7F90A6',
    number: '002',
    image: '/mayproject/img_character_elena.avif',
  },
  {
    id: '03',
    tabLabel: 'アイリス',
    role: '設備・制御管理担当',
    roleColor: '#5C7E86',
    name: 'アイリス・ウェインライト',
    nameEn: 'Iris Wainwright',
    description: '屋敷の設備と制御を預かる技術者。音、光、温度の乱れを先回りで抑え、静けさを壊さずに日常を支える"調律役"。メイのアナログな手仕事の価値を理解し、その温かさをAIにも残そうとする。',
    tags: ['#設備調整', '#対話AI設計', '#静かな理知', '#調律役'],
    specs: [
      { label: '年齢', value: '25歳' },
      { label: '瞳の色', value: 'スチールグレー' },
      { label: '好きなもの', value: '設備の微調整、整備記録、静かな巡回' },
      { label: '苦手なもの', value: '自分の休息、感情を伝えること' },
    ],
    imageColor: '#5C7E86',
    number: '003',
    image: '/mayproject/img_character_iris.avif',
  },
];

const defaultIdx = 0;

export function MpCharacterSection(): JSXNode {
  return (
    <section class="MpCharacter" id="character">
      <div class="MpCharacter__radial"></div>
      <div class="MpCharacter__inner MpGrid">
        <div class="MpCharacter__header">
          <div class="MpCharacter__titleBg">CHARACTER</div>
          <div class="MpCharacter__titleWrap">
            <span class="MpCharacter__titleBar"></span>
            <div class="MpCharacter__titleGroup">
              <span class="MpCharacter__titleEn">CHARACTER</span>
              <h2 class="MpCharacter__titleJa">キャラクター紹介</h2>
            </div>
          </div>
        </div>

        <div class="MpCharacter__tabs" role="tablist" aria-label="キャラクター選択">
          {each(characters, (char, i) => (
            <button
              class={`MpCharacter__tab js-mp-char-tab ${i === defaultIdx ? 'MpCharacter__tab--active' : ''}`}
              type="button"
              role="tab"
              aria-selected={i === defaultIdx ? 'true' : 'false'}
              aria-controls={`mp-char-panel-${char.id}`}
              data-index={String(i)}
            >
              <span class="MpCharacter__tabNum">{char.id}</span>
              <span class="MpCharacter__tabLabel">{char.tabLabel}</span>
            </button>
          ))}
        </div>

        {each(characters, (char, i) => (
          <div
            class={`MpCharacter__content js-mp-char-panel ${i === defaultIdx ? 'is-active' : ''}`}
            id={`mp-char-panel-${char.id}`}
            role="tabpanel"
            aria-hidden={i === defaultIdx ? 'false' : 'true'}
          >
            <div class="MpCharacter__imageWrap">
              <span class="MpCharacter__number">{char.number}</span>
              <div class="MpCharacter__imageFrame">
                <img src={char.image} alt={char.name} class="MpCharacter__image" width="1200" height="1600" />
              </div>
              <div class="MpCharacter__progress">
                <span class="MpCharacter__progressFill"></span>
                <span class="MpCharacter__progressDot"></span>
                <span class="MpCharacter__progressDotSm"></span>
              </div>
            </div>

            <div class="MpCharacter__profile">
              <div class="MpCharacter__roleBadge" style={`background-color: ${char.roleColor}`}>
                {char.role}
              </div>
              <h3 class="MpCharacter__name">{char.name}</h3>
              <p class="MpCharacter__nameEn">{char.nameEn}</p>
              <p class="MpCharacter__desc">{char.description}</p>

              <div class="MpCharacter__tags">
                {each(char.tags, (tag) => (
                  <span class="MpCharacter__tag">{tag}</span>
                ))}
              </div>

              <dl class="MpCharacter__specs">
                {each(char.specs, (spec) => (
                  <div class="MpCharacter__specRow">
                    <dt class="MpCharacter__specLabel">{spec.label}</dt>
                    <dd class="MpCharacter__specValue">{spec.value}</dd>
                  </div>
                ))}
              </dl>

              <div class="MpCharacter__colorInfo">
                <span class="MpCharacter__colorSwatch" style={`background-color: ${char.imageColor}`}></span>
                <span class="MpCharacter__colorText">IMAGE COLOR — {char.imageColor}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
