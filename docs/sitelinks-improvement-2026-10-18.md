# サイトリンク改善の公開記録（2026-10-18）

最新の公開済みmain（906e833）に今回の変更だけを反映した。元の作業フォルダーの未公開変更は含めていない。

| 案内 | 公開版のリンク先 |
| --- | --- |
| 膝の痛みについて | /symptoms/knee-pain.html |
| 初回の流れ・料金 | /#first-visit |
| 施術について（MSMメソッド） | /msm.html |
| 院長紹介 | /staff.html |
| アクセス・道順 | /access.html |
| よくある質問 | /faq.html |

## 変更

- 公開版の主要・スマホ・フッターメニューに膝の総合案内を追加。既存の症状別一覧や他のページへのリンクは残した。
- アクセスのリンク名を「アクセス・道順」に統一。施術案内は既存の専用ページmsm.htmlへ揃えた。
- 膝の総合案内と施術案内のtitle・h1、院長紹介のtitle・共有用タイトル、初回案内のh2を内容に合わせた。
- 旧レイアウトの症状ページとブログも、生成元のテンプレート・共通フッターから同じ案内へつなげた。
- ページ削除、noindex追加、本文・画像・CSSの変更は行っていない。

## 公開前検証

- ブログ生成77記事を再生成し、ナビゲーションとフッター以外のブログ本文に変更がないことを差分で確認。
- 内部リンク・画像参照：116ページ、7,543参照、欠落0件。
- npm run check:blog-links：78ページ、3,294参照、成功。
- 390・768・1440pxでトップ、施術、院長、アクセス、FAQ、膝、ブログ一覧・記事を確認。横はみ出しなし。スマホメニューの開閉も確認。
- npm test：187件成功、100件は既存の旧レイアウトテストとしてスキップ、2件失敗。
- 残る2件は既存のsite-updatesテスト。腰痛・坐骨神経痛ページに対し、更新関数が現行レイアウト属性を要求して失敗する。変更前のmain本文でも同じエラーを確認した。今回の変更による回帰ではないため、別機能の修正は含めなかった。
- GitNexusの変更検出も実施。古い索引による位置ずれがあるため、実際の差分と生成・リンク・表示検査を優先した。

## Search Console

公開後に以下の6URLをURL検査し、必要に応じて公開URLテスト、インデックス登録リクエストを行う。

- https://hizakozou.jp/
- https://hizakozou.jp/symptoms/knee-pain.html
- https://hizakozou.jp/msm.html
- https://hizakozou.jp/staff.html
- https://hizakozou.jp/access.html
- https://hizakozou.jp/faq.html

初回の流れ・料金はトップ内の位置なので、#first-visitを別ページとして申請しない。サイトマップ https://hizakozou.jp/sitemap.xml の取得成功も確認する。

サイトリンクはGoogleの自動選択で、希望項目や表示順を直接指定する設定はない。再クロール・再評価後の検索結果を確認する。同じURLの繰り返し申請で処理が速くなるわけではない。

公式資料（2026-10-18確認）：[サイトリンク](https://developers.google.com/search/docs/appearance/sitelinks?hl=ja)、[再クロールのリクエスト](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl?hl=ja)。
