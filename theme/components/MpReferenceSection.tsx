/** @jsxImportSource @ox-content/vite-plugin */
import { each, type JSXNode } from '@ox-content/vite-plugin';

const sheets = [
  {
    id: '01',
    name: '桜草メイ',
    nameEn: 'May Sakurakusa',
    role: 'ハウスキーパー',
    roleColor: '#6B8E5A',
    imageColor: '#6B8E5A',
    image: '/mayproject/assets/ref_mei.jpg',
    file: '/mayproject/assets/ref_mei.jpg',
    downloadName: 'mei-reference-sheet.jpg',
    width: 2752,
    height: 1536,
  },
  {
    id: '02',
    name: 'エレナ・グレース・アッシュフォード',
    nameEn: 'Elena Grace Ashford',
    role: 'お嬢様',
    roleColor: '#7F90A6',
    imageColor: '#7F90A6',
    image: '/mayproject/assets/ref_elena.jpg',
    file: '/mayproject/assets/ref_elena.jpg',
    downloadName: 'elena-reference-sheet.jpg',
    width: 4096,
    height: 2286,
  },
  {
    id: '03',
    name: 'アイリス・ウェインライト',
    nameEn: 'Iris Wainwright',
    role: '設備・制御管理担当',
    roleColor: '#5C7E86',
    imageColor: '#5C7E86',
    image: '/mayproject/assets/ref_iris.jpg',
    file: '/mayproject/assets/ref_iris.jpg',
    downloadName: 'iris-reference-sheet.jpg',
    width: 5504,
    height: 3072,
  },
];

export function MpReferenceSection(): JSXNode {
  return (
    <section class="MpRef" id="reference">
      <div class="MpRef__inner MpGrid">
        <div class="MpRef__header">
          <div class="MpRef__titleBg">REFERENCE</div>
          <div class="MpRef__titleWrap">
            <span class="MpRef__titleBar"></span>
            <div class="MpRef__titleGroup">
              <span class="MpRef__titleEn">REFERENCE SHEET</span>
              <h2 class="MpRef__titleJa">三面図・資料配布</h2>
            </div>
          </div>
        </div>

        <p class="MpRef__lead">
          二次創作にご活用いただける三面図・設定資料をご用意しました。<br />
          ガイドラインの範囲内でご自由にお使いください。
        </p>

        <div class="MpRef__grid">
          {each(sheets, (sheet) => (
            <div class="MpRef__card">
              <div class="MpRef__cardAccent" style={`background-color: ${sheet.imageColor}`}></div>
              <div class="MpRef__cardVisual">
                <img
                  src={sheet.image}
                  alt={`${sheet.name} 三面図`}
                  class="MpRef__cardImg"
                  width={sheet.width}
                  height={sheet.height}
                />
                <div class="MpRef__cardOverlay"></div>
                <span class="MpRef__cardNum">{sheet.id}</span>
              </div>
              <div class="MpRef__cardBody">
                <span class="MpRef__cardRole" style={`background-color: ${sheet.roleColor}`}>{sheet.role}</span>
                <h3 class="MpRef__cardName">{sheet.name}</h3>
                <p class="MpRef__cardNameEn">{sheet.nameEn}</p>
                <a href={sheet.file} download={sheet.downloadName} class="MpRef__cardDl">
                  <svg class="MpRef__cardDlIcon" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M8 1v10m0 0L4.5 7.5M8 11l3.5-3.5M2 14h12" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                  <span>DOWNLOAD</span>
                </a>
              </div>
            </div>
          ))}
        </div>

        <div class="MpRef__notice">
          <h3 class="MpRef__noticeTitle">二次創作ガイドライン</h3>
          <ul class="MpRef__noticeList">
            <li>非営利の個人利用に限り、ご自由にお使いいただけます</li>
            <li>公序良俗に反する利用はご遠慮ください</li>
            <li>公開時は「桜草メイ」のクレジット表記をお願いします</li>
            <li>生成AIを用いた二次創作も非営利の範囲で歓迎します</li>
          </ul>
          <a href="/mayproject/guidelines/" class="MpRef__noticeLink">
            ガイドラインの詳細を見る <span>&rarr;</span>
          </a>
        </div>
      </div>
    </section>
  );
}
