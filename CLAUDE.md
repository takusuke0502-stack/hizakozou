# 整体院ひざこぞう — プロジェクトガイド

## 院の基本情報

| 項目 | 内容 |
|------|------|
| 院名 | 整体院ひざこぞう |
| 住所 | 千葉県柏市あけぼの4-4-3 BoaSorte柏 305（3階） |
| 電話 | 04-7114-3274 |
| 営業時間 | 9:00〜19:00（定休日：日曜・祝日） |
| アクセス | 柏駅西口 徒歩9分・バス1分（完全予約制） |
| URL | https://hizakozou.jp/ |
| 対応エリア | 柏市・流山市・松戸市・我孫子市・野田市・守谷市・取手市 |
| 専門 | 膝痛を中心に慢性痛全般（腰痛・坐骨神経痛 等） |
| 特徴 | 国家資格を持つ院長が対応、手技・運動療法・丁寧な説明 |

## プロジェクト概要

- 静的HTMLサイト（Node.js v20、ES modules）
- ブログ記事のみ自動生成（`scripts/generate-blog.mjs`）
- ホスティング：GitHub Pages（CNAME: hizakozou.jp）
- ブランチ戦略：feature branch → PR → main へマージ

## ファイル構成

```
/
├── index.html               # トップページ（Tailwind CDN）
├── blog.html                # /blog/ へのリダイレクト（noindex）
├── blog-detail.html         # JSリダイレクト（noindex）
├── blog/
│   ├── index.html           # ブログ一覧（generate-blog.mjs で自動生成）
│   ├── assets/blog.css      # ブログ専用CSS
│   ├── data/posts.json      # ブログメタデータ（自動生成）
│   └── posts/*.html         # 各記事HTML（自動生成）
├── content/
│   ├── source/*.md          # 原稿ファイル（ここだけ手動編集）
│   ├── seo/*.md             # SEO拡張版（自動生成・編集不要）
│   └── meo/*.txt            # MEOテキスト（自動生成・編集不要）
├── image/                   # 全画像素材（WebP優先）
├── scripts/
│   └── generate-blog.mjs    # ブログ生成スクリプト
├── symptoms/
│   ├── symptoms.css         # 症状ページ共通CSS
│   └── *.html               # 症状別ページ（16ページ）
├── package.json
├── sitemap.xml
├── robots.txt
└── .github/workflows/
    └── generate-blog-content.yml  # 自動生成GitHub Actions
```

## CSS 設計ルール

| ページ | スタイル管理 |
|--------|-------------|
| `index.html` | Tailwind CDN のみ（外部CSS追加不可） |
| `symptoms/*.html` | `symptoms/symptoms.css` を `<link>` で読み込む |
| `blog/` 以下 | `blog/assets/blog.css` を使用 |

- 3つのCSSを混在・共有しない
- `symptoms/*.html` にインライン `<style>` を追加しない

## 画像ルール

- **形式**：WebP優先（新規追加は `.jpg/.png` ではなくWebP形式で）
- **ファイル名**：kebab-case英語（スペース・大文字・日本語は使わない）
- **alt属性**：必須（空にしない）
- **object-fit**：
  - 写真類（`clinic-*.webp` 等）→ `object-fit: cover`
  - イラスト・縦長画像（`hiza.jpg` 等）→ `object-fit: contain; background: #fff`
- **サイズ**：1MB超のファイルは追加しない（Pillow等で圧縮してから追加）

```bash
# Python Pillow による WebP 変換例
python3 -c "from PIL import Image; img = Image.open('input.jpg'); img.save('output.webp', 'WEBP', quality=82)"
```

## ブログ生成ワークフロー

### 新規記事の作成手順

1. `content/source/` に `YYYY-MM-スラッグ名.md` を作成
2. フロントマター（必須）：

```yaml
---
title: 記事タイトル
slug: url-slug
date: YYYY-MM-DD
description: 130字程度の説明文
category: カテゴリ名
region: 柏市
tags: タグ1,タグ2
symptoms: 変形性膝関節症,腰痛,坐骨神経痛
heroImage: /image/ファイル名.webp
draft: false
---
```

3. 記事本文を書く（Markdown形式）
4. 生成コマンドを実行

```bash
npm run generate:blog                              # 全記事再生成
node scripts/generate-blog.mjs --source 2026-03-スラッグ.md  # 特定記事のみ
```

5. 生成物を確認してコミット

### 出力先（編集不要・自動生成）

| ファイル | 説明 |
|--------|------|
| `blog/posts/スラッグ.html` | 記事ページ（JSON-LD付き） |
| `blog/data/posts.json` | 全記事メタデータ |
| `blog/index.html` | ブログ一覧ページ |
| `content/seo/スラッグ.md` | SEO拡張版原稿 |
| `content/meo/スラッグ.txt` | MEOテキスト |

### ブログ記事の仕様

- `heroImage` は `/image/` 以下のパスで指定
- `draft: true` で下書き（公開されない）
- `symptoms` フィールドが症状ページへのリンクカード生成に使われる
- 記事本文の `# タイトル` は自動的に `<h2>` に変換される（`<h1>` は article-title が担う）

## やってはいけないこと

- `blog/posts/*.html` を直接編集しない → 再生成で上書きされる
- `blog/data/posts.json` を直接編集しない → 同上
- `blog/index.html` を直接編集しない → 同上
- `content/seo/` と `content/meo/` を編集しない → 自動生成ファイル
- `symptoms/*.html` にインライン `<style>` を追加しない → `symptoms.css` で管理
- 画像をスペース・大文字含むファイル名で追加しない
- main ブランチに直接 push しない → feature branch → PR → merge

## SEO 設計（現状）

| ページ | 構造化データ |
|--------|-------------|
| `index.html` | `LocalBusiness` + `FAQPage` JSON-LD 実装済み |
| `blog/posts/*.html` | `BlogPosting` + `BreadcrumbList` JSON-LD（スクリプトが自動挿入） |
| `symptoms/*.html` | 未実装（今後の課題） |

- canonical URL：全ページ設定済み
- OGP（og:title / og:description / og:image）：全ページ設定済み

## GitHub Actions

`.github/workflows/generate-blog-content.yml`

- **トリガー**：手動（workflow_dispatch）
- **入力**：
  - `source_file`：対象 .md ファイル名（省略で全記事）
  - `commit_changes`：生成後に自動コミット（デフォルト: true）
- 生成後、変更があれば `github-actions[bot]` としてコミット・プッシュ
