# Static Blog Workflow

`data/blog-posts.json` に記事を追加して、`npm run build:blog` を実行すると以下が再生成されます。

- `blog/index.html`
- `blog/posts/{slug}/index.html`
- `blog.html`
- `blog-detail.html`
- `symptoms/*.html` の関連記事セクション

## 記事追加の流れ

1. `data/blog-posts.json` の `posts` に1件追加する
2. `slug` は重複しない英数字ベースにする
3. `title` `description` `date` `category` `sections` を入れる
4. 関連づけたい症状ページがある場合は `relatedSymptoms` に症状ページURLを入れる
5. 必要なら `faq` `cta` を追加する
6. `npm run build:blog` を実行して生成物を更新する

## セクションの書き方

- `body` に文章配列を入れると段落として表示
- `listStyle: "check"` を付けるとチェックリスト表示
- `subsections` を使うと `h3` 構造で整理可能
