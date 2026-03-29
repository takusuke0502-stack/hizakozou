# Source Articles

`content/source/` には、元原稿の Markdown を置きます。

- 先頭に `---` で囲った簡単なメタ情報を入れます
- 本文は通常の Markdown で書けます
- `slug` を入れると公開URLを固定できます
- `_` で始まるファイルはテンプレート扱いで生成対象から除外されます

ローカル実行:

```bash
npm run generate:blog
```

GitHub Actions 実行:

- Actions の `Generate blog content` を開く
- `source_file` に `content/source/xxx.md` か `xxx.md` を入力
- 空欄なら全件を対象にします
