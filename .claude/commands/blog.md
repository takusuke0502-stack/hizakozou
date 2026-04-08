# ブログ記事作成コマンド

引数（$ARGUMENTS）をテーマとして、整体院ひざこぞうのブログ記事を作成し、PRまで投稿する。

## 手順

### 1. data/blog-posts.json に記事を追加

`data/blog-posts.json` の `posts` 配列の先頭に新しい記事オブジェクトを追加する。

**必須フィールド：**
- `slug`: kebab-case英語（URL になる）
- `title`: 記事タイトル（日本語、SEOを意識した具体的な表現）
- `description`: 130字程度の説明文（meta description に使われる）
- `date`: 今日の日付（YYYY-MM-DD）
- `updatedDate`: 同上
- `category`: `"knee-pain"` / `"lower-back-pain"` / `"exercise-therapy"` のいずれか
- `tags`: 関連タグの配列（3〜5個）
- `eyecatch`: `/image/` 以下の既存画像パス（WebP優先）
- `readingTime`: `"約X分"`
- `relatedSymptoms`: 関連症状ページへのリンク配列（2〜3件）
  - `label`, `href`（`/symptoms/xxx.html`）, `description`
- `lead`: 記事冒頭の導入文（2〜3文）
- `sections`: 本文セクションの配列
  - `heading`: 見出し
  - `body`: 本文の配列（段落 or リスト項目）
  - `listStyle`: `"check"` を指定するとチェックリスト表示（省略可）
  - `subsections`: サブ見出しの配列（省略可）
- `faq`: よくある質問の配列（2〜3件）
  - `question`, `answer`
- `cta`: 記事末尾のCTA
  - `heading`, `text`, `label`, `href`（`"https://lin.ee/X01F2mP"`）, `note`

**利用可能な症状ページ（relatedSymptomsに使う）：**
- `/symptoms/knee-osteoarthritis.html` → 変形性膝関節症
- `/symptoms/knee-effusion.html` → 膝に水がたまる
- `/symptoms/knee-lateral-pain.html` → 膝の外側の痛み
- `/symptoms/pes-anserine-bursitis.html` → 膝の内側の痛み・鵞足炎
- `/symptoms/lower-back-pain.html` → 腰痛
- `/symptoms/sciatica.html` → 坐骨神経痛
- `/symptoms/spinal-stenosis.html` → 脊柱管狭窄症
- `/symptoms/hip-osteoarthritis.html` → 変形性股関節症
- `/symptoms/frozen-shoulder.html` → 五十肩
- `/symptoms/shoulder-stiffness.html` → 肩こり
- `/symptoms/plantar-fasciitis.html` → 足底筋膜炎

**利用可能な画像（eyecatch に使う）：**
- `/image/knee-pain.webp`
- `/image/knee-symptom.jpg`
- `/image/knee-symptom-close.webp`
- `/image/medical-interview.webp`
- `/image/consultation-scene.webp`
- `/image/hiza.jpg`
- `/image/hiza2.jpg`

**記事の書き方のガイドライン：**
- 整体院ひざこぞうの院長（国家資格保有）の視点で書く
- 柏市・千葉県の地域性を意識する
- 患者さんの不安に寄り添い、押しつけがましくない表現にする
- 専門用語には必ずやさしい説明を添える
- 「まず医療機関へ」が必要な場面はFAQや本文で言及する
- sections は 4〜6 個程度、各 body は 1〜3 項目

### 2. ブログを生成する

```bash
node scripts/generate-blog.mjs
```

### 3. コミット・プッシュ

現在のブランチ（`claude/blog-goose-foot-inflammation-fmHSt`）にコミット＆プッシュする。

### 4. PRを作成

GitHub MCP ツール（`mcp__github__create_pull_request`）を使って PR を作成する。
- owner: `takusuke0502-stack`
- repo: `hizakozou`
- base: `main`
- head: 現在のブランチ名
- title: 記事タイトルを含む簡潔な名前

### 完了後に報告する内容
- 記事タイトル
- slug（公開URL）
- PR URL
