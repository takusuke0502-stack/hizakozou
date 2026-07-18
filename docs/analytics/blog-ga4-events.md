# コラム GA4イベント運用メモ

更新日：2026年7月18日

## 実装済みイベント

| イベント名 | 発火条件 |
|---|---|
| `article_view` | コラム詳細ページを表示したとき |
| `article_scroll_50` | 本文の50％まで表示したとき |
| `article_scroll_90` | 本文の90％まで表示したとき |
| `article_toc_click` | 記事の目次リンクを選んだとき |
| `article_internal_link_click` | 本文中のサイト内リンクを選んだとき |
| `article_related_click` | 記事末の関連記事を選んだとき |
| `article_staff_profile_click` | 執筆者欄のプロフィールリンクを選んだとき |
| `article_line_click` | 記事内のLINE案内を選んだとき |

同じイベントは、一つのページ閲覧につき1回だけ送信する。目次や本文リンクを複数回選んでも、同名イベントは重複送信しない。

## 送信パラメーター

| パラメーター | 内容 | 例 |
|---|---|---|
| `article_slug` | 閲覧中の記事slug | `knee-pain-daily-care` |
| `article_category` | 記事カテゴリー | `膝の痛み` |
| `target_slug` | リンク先slug。表示・読了イベントでは閲覧中の記事slug | `knee-front-pain` |
| `link_position` | リンクや計測地点の位置 | `article_body`、`toc`、`related_articles` |
| `device_type` | 画面幅767px以下は`smartphone`、それ以外は`pc` | `smartphone` |
| `link_url` | 選ばれたリンクのURL | `/symptoms/knee-front-pain.html` |
| `link_text` | 選ばれたリンクの表示文（先頭80文字まで） | `膝の前側の痛みの相談ページ` |
| `scroll_percent` | 読了イベントの到達率 | `50`、`90` |
| `content_group` | コラム計測をまとめる固定値 | `blog_article` |

読了率は、画面下端が本文領域のどこまで到達したかで判定する。本文の高さに対して50％または90％へ到達した時点で送信する。

## GA4管理画面で登録するカスタム定義

イベントパラメーターは送信済みだが、通常のレポートや探索で使うには、GA4の「管理」→「カスタム定義」からイベントスコープのカスタムディメンションを登録する。

- `article_slug`
- `article_category`
- `target_slug`
- `link_position`
- `device_type`
- `content_group`

`scroll_percent`を数値集計したい場合は、イベントスコープのカスタム指標として登録する。`link_url`と`link_text`は必要になった段階で追加する。

## 公開後の確認

1. GA4のリアルタイムまたはDebugViewでコラム詳細を開く。
2. `article_view`が1件届くことを確認する。
3. 本文を50％、90％まで読み、各読了イベントが1件ずつ届くことを確認する。
4. 目次、本文リンク、関連記事、プロフィール、LINEを選び、対応イベントとパラメーターを確認する。
5. PCとスマートフォンで`device_type`が分かれることを確認する。

月次では、記事別の表示数に対する50％・90％読了数、本文内部リンク率、関連記事クリック率、記事内LINEクリック率を比較する。
