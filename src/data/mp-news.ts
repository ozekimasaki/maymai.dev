export interface MpNewsItem {
  slug: string;
  date: string;
  category: 'INFO' | 'EVENT' | 'UPDATE';
  title: string;
  body: string;
  isPublished: boolean;
}

export const categoryColors: Record<MpNewsItem['category'], string> = {
  INFO: '#e8732a',
  EVENT: '#3b82f6',
  UPDATE: '#10b981',
};

export const mpNewsItems: MpNewsItem[] = [
  {
    slug: 'reference-sheet-release',
    date: '2026.04.10',
    category: 'INFO',
    title: 'キャラクター三面図・設定資料を公開しました',
    body: `桜草メイプロジェクト・エレナ・アイリスの三面図および設定資料を公開いたしました。

二次創作ガイドラインの範囲内で、ご自由にご活用ください。各キャラクターの配色、アクセサリー、衣装の詳細を記載した資料となっております。

ダウンロードはキャラクターページの「三面図・資料配布」セクションよりどうぞ。`,
    isPublished: false,
  },
  {
    slug: 'mei-greenhouse-diary',
    date: '2026.04.05',
    category: 'EVENT',
    title: 'メイの温室日記 〜春の芽吹き編〜 を公開',
    body: `メイが日々手入れをしている温室の様子をまとめた「温室日記」を公開しました。

今回は春の芽吹きをテーマに、冬を越えた植物たちの変化や、新しく植えたハーブの生育記録をお届けします。メイの観察眼と手仕事の温かさが伝わる内容です。

次回は初夏の庭園整備編を予定しております。`,
    isPublished: false,
  },
  {
    slug: 'iris-facility-report',
    date: '2026.03.28',
    category: 'UPDATE',
    title: 'アイリスの設備レポート — 春の空調調整について',
    body: `屋敷の設備・制御管理担当アイリスによる季節の設備レポートを公開しました。

春先の気温変化に合わせた空調設定の微調整や、清掃ロボの動線見直し、温室の湿度管理システムのアップデートについて報告しています。

暮らしの裏側を静かに支える、アイリスの仕事の一端をご覧いただけます。`,
    isPublished: false,
  },
  {
    slug: 'elena-blue-poppy',
    date: '2026.03.20',
    category: 'INFO',
    title: 'エレナのブルーポピー便り — 春の写真コレクション',
    body: `エレナが幼い頃から憧れ続けているブルーポピーの写真コレクションを特別公開いたします。

「実物はまだ見たことがない」というエレナが集めてきた写真の数々と、それぞれの写真にまつわるエレナ自身の短いコメントを添えました。

静かで穏やかなエレナの世界を、少しだけ覗いていただけます。`,
    isPublished: false,
  },
  {
    slug: 'teatime-spring-blend',
    date: '2026.03.15',
    category: 'EVENT',
    title: 'ティータイム特集 — メイの春ブレンドハーブティー',
    body: `メイが気分や疲れに合わせてブレンドする「春のハーブティー」のレシピを公開しました。

温室で育てたカモミールやレモンバーム、ラベンダーを使った3種のブレンドをご紹介。エレナとのティータイムで実際にお出ししているレシピです。

ご自宅でも再現できるよう、分量と淹れ方を丁寧にまとめています。`,
    isPublished: false,
  },
  {
    slug: 'project-world-setting',
    date: '2026.03.10',
    category: 'INFO',
    title: '世界観設定ページを公開しました',
    body: `桜草メイプロジェクトの舞台「アッシュフォード家のカントリー・ハウス」の詳細な世界観設定を公開しました。

ロンドン郊外に佇む古い屋敷の外観・内観、主要ロケーション、日常のトラブル、季節と自然の扱いなど、作品の空気感を形づくる要素を網羅しています。

制作のブレを防ぐための"合言葉"もご紹介しております。`,
    isPublished: false,
  },
  {
    slug: 'character-iris-reveal',
    date: '2026.02.28',
    category: 'EVENT',
    title: '新キャラクター「アイリス・ウェインライト」を公開',
    body: `桜草メイプロジェクト3人目のキャラクター「アイリス・ウェインライト」のデザインと設定を公開いたしました。

屋敷の設備と制御を預かる技術者であり、メイのアナログな手仕事の価値を理解し尊重する存在。静けさを壊さずに日常を支える"調律役"です。

スチールグレーの瞳と非対称レイヤーのアッシュネイビーの髪が特徴の、知的で静かなキャラクターです。`,
    isPublished: false,
  },
  {
    slug: 'website-open',
    date: '2026-04-21',
    category: 'UPDATE',
    title: '桜草メイプロジェクト 公式サイトを公開しました',
    body: `桜草メイプロジェクトの公式サイトを公開しました。

本サイトでは、メイ・エレナ・アイリスのキャラクター紹介をはじめ、ギャラリー、三面図・資料配布、二次創作ガイドライン、お知らせをまとめてご覧いただけます。作品の空気感と創作に必要な情報の両方へアクセスしやすい、入口となるサイトを目指して整えました。

今回の公開時点では、各キャラクターのプロフィールとビジュアル、配布用の三面図、ガイドライン、最新のお知らせまでご確認いただけます。今後も、公開できる情報から少しずつ内容を充実させてまいりますので、気になる更新があればぜひ覗いてみてください。`,
    isPublished: true,
  },
];

export const publishedMpNewsItems = mpNewsItems.filter((item) => item.isPublished);
