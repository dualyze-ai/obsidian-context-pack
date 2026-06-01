---
tags:
  - spec
---

# データ設計

保存するリンクのデータ構造：

```ts
interface Link {
  id: string;      // nanoid
  url: string;
  title: string;   // ユーザー入力 or ページタイトルから自動取得
  tag: string;     // タグ（1件・省略可）
  savedAt: string; // ISO日時
}
```

`localStorage["linkbox"]` にJSON配列として保存する。
