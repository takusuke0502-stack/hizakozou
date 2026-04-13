# Source Articles

`content/source/` はブログ原稿の一次入力です。

- 先頭に `---` で囲ったフロントマターを入れます
- 本文は通常の Markdown で書けます
- `slug` を入れると公開URLを固定できます
- `_` で始まるファイルはテンプレート扱いで生成対象から除外されます
- 生成後に `data/blog-posts.json` と静的ブログ一式が更新されます
- 生成物は手で直さず、必要なら原稿かスクリプトを修正します

ローカル実行:

```bash
npm run generate:blog
npm run generate:blog:source -- --source content/source/YYYY-MM-slug.md
```

必須フロントマター:

```yaml
---
title: 記事タイトル
slug: url-slug
date: YYYY-MM-DD
description: 120-140字程度の説明文
category: 膝の痛み
region: 柏市
tags: 膝痛,タグ2
symptoms: 変形性膝関節症,腰痛
heroImage: /image/example.webp
draft: false
replaceSlug: old-url-slug
---
```

GitHub Actions 実行:

- Actions の `Generate blog content` を開く
- `source_file` に `content/source/xxx.md` か `xxx.md` を入力
- 空欄なら全件を対象にします
