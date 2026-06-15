export default {
  cmd_export:         'NotebookLM向けにVaultをエクスポート',
  cmd_export_current: 'NotebookLM向けに現在のノートをエクスポート',
  cmd_pack_folder:    'フォルダからContext Packを作成',
  cmd_pack_tag:       'タグからContext Packを作成',
  cmd_create_moc_tag: 'タグからMOCを作成',
  cmd_create_ai_moc:  'AI MOCを作成: ノートから',
  cmd_pack_moc:       'MOCからContext Packを作成',

  ribbon_tooltip:        'AI Context Pack / エクスポート',
  ribbon_pack_folder:    'Context Pack（フォルダを選択）',
  ribbon_pack_tag:       'Context Pack（タグを選択）',
  ribbon_create_moc_tag:  'MOCを作成（タグから）',
  ribbon_create_moc_note: 'MOCを作成（ノートから）',
  ribbon_export_tag:     'タグをエクスポート（ZIP）',
  ribbon_export_vault:   'Vault全体をエクスポート（ZIP）',
  ribbon_export_folder:  'フォルダをエクスポート（ZIP）',
  menu_pack_folder:      'このフォルダをContext Packにする',
  menu_create_moc:       'このフォルダのMOCを作成',
  menu_export_folder:    'このフォルダをエクスポート（ZIP）',
  menu_export_note:      'このノートをエクスポート（.md）',
  menu_pack_moc:         'このMOCからContext Packを作成',
  menu_create_ai_moc:    'このノートからAI MOCを作成',

  prompt_tag_name:    'タグ名を入力してください（# 不要）',
  prompt_file_name:   'Context Packのファイル名を入力してください',

  setting_target_folder:      'エクスポート対象フォルダ',
  setting_target_folder_desc: 'エクスポートするフォルダを指定します。空欄の場合はVault全体が対象です。',
  setting_output_folder:      '出力先フォルダ',
  setting_output_folder_desc: 'ZIPファイルの保存先です。空欄の場合はVaultのルートに保存されます。',
  setting_flatten:             'フォルダ構造をフラット化',
  setting_flatten_desc:        'ZIP内のすべてのノートを1つのフォルダにまとめます。ファイル名にフォルダ名が付加されます。',
  setting_include_title:       'frontmatterのタイトルを含める',
  setting_include_title_desc:  'frontmatterのtitleとtagsをノート冒頭の読みやすいテキストに変換して挿入します。',
  setting_open_after:          'エクスポート後にフォルダを開く',
  setting_open_after_desc:     '完了後に出力先フォルダを自動的に開きます。デスクトップのみ対応。',
  setting_pack_output:         'Context Pack出力先フォルダ',
  setting_pack_output_desc:    'Context Packファイルの保存先です。空欄の場合はエクスポートと同じフォルダに保存されます。',

  notice_exporting:  'ノートをエクスポート中…',
  notice_packing:    'Context Pack を作成中…',
  notice_done:       (n: number) => `完了しました。${n}件のノートをエクスポートしました。`,
  notice_pack_done:  (n: number) => `Context Packを作成しました。${n}件のノートを含んでいます。`,
  notice_no_files:   '対象フォルダにMarkdownファイルが見つかりませんでした。',
  notice_no_links:   'このノートに [[リンク]] が見つかりません。MOCとして使うには他のノートへのリンクを追加してください。',
  notice_moc_done:   (n: number) => `MOCを作成しました。${n}件のノートを含んでいます。`,
  notice_cancelled:  'キャンセルしました。',
  notice_error:      'エラーが発生しました。コンソールを確認してください。',
  btn_cancel:        '中止',
  folder_search_placeholder: 'フォルダを検索…',
  folder_picker_title_pack:   'パックするフォルダを選択',
  folder_picker_title_export: 'エクスポートするフォルダを選択',

  cmd_daily_default:   'Daily Notes: デフォルト期間でパックを作成',
  cmd_daily_custom:    'Daily Notes: 期間を選択してパックを作成',
  cmd_daily_weekly:    'Daily Notes: 今週の週次サマリーパックを作成',
  ribbon_daily:        'Daily Notesパックを作成',

  daily_modal_title:      'Daily Notesパックの作成',
  daily_preset_this_week: '今週',
  daily_preset_last_week: '先週',
  daily_preset_7:         '過去7日',
  daily_preset_14:        '過去14日',
  daily_preset_30:        '過去30日',
  daily_preset_custom:    'カスタム',
  daily_start_date:       '開始日',
  daily_end_date:         '終了日',
  daily_exclude_tags:     '除外タグ',
  daily_folder_label:     'フォルダを変更',
  daily_folder_picker:    'フォルダを選択...',
  daily_preview_found:    (n: number) => `${n}件のDaily Notesが見つかりました`,
  daily_preview_none:     '該当するDaily Notesがありません',
  daily_btn_cancel:       'キャンセル',
  daily_btn_create:       'パックを作成',
  daily_vault_root:       '（Vault直下）',
  daily_notice_none:      '指定期間内にDaily Notesが見つかりませんでした',

  setting_daily_section:       'Daily Notes モード',
  setting_daily_auto:          'Daily Notesを自動検出する',
  setting_daily_auto_desc:     'ObsidianのDaily Notesプラグイン設定からフォルダと日付形式を自動取得します',
  setting_daily_folder:        'Daily Notesフォルダ',
  setting_daily_format:        '日付形式',
  setting_daily_format_desc:   'moment.jsの形式で指定（例：YYYY-MM-DD）',
  setting_daily_range:         'デフォルト期間',
  setting_daily_exclude:       '除外タグ',
  setting_daily_exclude_desc:  'カンマ区切りで複数指定可（例：#private, #todo）',
  setting_daily_sort:          '並び順',
  setting_daily_sort_asc:      '古い順',
  setting_daily_sort_desc:     '新しい順',

  pack_period:        '期間',
  pack_count:         (n: number) => `${n}件`,
  pack_generated:     '生成日時',
  pack_no_content:    '（内容なし）',
  pack_dow:           (day: number) => ['（日）', '（月）', '（火）', '（水）', '（木）', '（金）', '（土）'][day],
  weekly_title:       (year: number, month: number, week: number) => `${year}年${month}月第${week}週`,
  weekly_header:      '週次サマリー',
  weekly_count:       (n: number) => `Daily Notes数：${n}件`,

  modal_select_target:    '出力先を選択',
  modal_token_estimated:  (n: number) => `推定トークン数：約${n.toLocaleString()}`,
  modal_token_over:       (ai: string, max: string) => `${ai}の推奨上限（${max}トークン）を超えています`,
  modal_method_label:     '出力方法',
  modal_method_clipboard: 'クリップボードにコピー',
  modal_method_file:      'ファイルとして保存',
  modal_btn_export:       '出力する',
  modal_coming_soon:      'v2.2で対応予定',

  notice_ai_copied: (n: number) => `クリップボードにコピーしました（約${n.toLocaleString()}トークン）`,
  notice_ai_saved:  (path: string, n: number) => `保存しました：${path}（約${n.toLocaleString()}トークン）`,
  notice_ai_done:   (n: number) => `完了しました（約${n.toLocaleString()}トークン）`,

  setting_output_section:      '出力設定',
  setting_default_target:      'デフォルト出力先',
  setting_default_target_desc: '「出力先を毎回選択する」がOFFのときに使用されます。',
  setting_show_modal:          '出力先を毎回選択する',
  setting_show_modal_desc:     '出力のたびに出力先を選択します。OFFにするとデフォルト出力先が使用されます。',
  setting_show_tokens:         'トークン数を表示する',
  setting_show_tokens_desc:    '出力先選択画面に推定トークン数を表示します。',
  setting_warn_tokens:         '推奨上限超過時に警告する',
  setting_warn_tokens_desc:    'パックのトークン数が推奨上限を超えた場合に警告を表示します。',
  setting_open_url:            'エクスポート後にAIサイトを開く',
  setting_open_url_desc:       'クリップボードへのコピー後にAIのWebサイトを開きます。ChatGPT・Claude・Geminiのみ対応。',

  setting_common_instructions:             '共通指示',
  setting_common_instructions_desc:        'Context Packの先頭に付加されます。AI別の指示は自動的に末尾に追加されます。{source} でフォルダ/タグ名、{count} でノート数を挿入できます。',
  setting_common_instructions_toggle:      'デフォルトで共通指示を含める',
  setting_common_instructions_toggle_desc: 'ONにすると、すべてのパックに共通指示が付加されます。出力先選択画面でその都度切り替えることもできます。',
  setting_common_instructions_reset:       'デフォルトに戻す',

  modal_include_prompt:    '共通指示を含める',
  modal_method_file_vault: 'Vaultに保存',
  modal_open_ai_url:       'エクスポート後にAIサイトを開く',

  default_starter_prompt: '以下は私の「{source}」のObsidianノート（{count}件）です。内容を把握した上で、私の質問に答えてください。',

  default_common_instructions: `以下は「{source}」のObsidianノート（{count}件）から生成したContext Packです。

このContext Packに情報が存在する場合は、その内容を優先してください。
根拠がない場合は、推測・一般知識・外部知識のいずれかを明示してください。
Obsidian・Context Pack・NotebookLMなどのシステムへの言及やドキュメントの改善提案は不要です。`,

  default_knowledge_base_instructions: `以下は「{source}」に関するソースナレッジです（{count}件）。

このドキュメントの情報を使って、主題に関する質問に答えてください。
内容を生成されたドキュメントとして評価するのではなく、事実のソース知識として扱ってください。`,

  usage_guidance: `## 使用ガイダンス

このドキュメントの情報をソース知識として使用してください。

質問に答える際は、主題とノートに含まれる情報を優先してください。`,

  ai_addition_chatgpt:     '回答は見出しによる構造化・箇条書き・結論先出しを優先してください。',
  ai_addition_claude:      '情報同士の関連性・矛盾・抜け漏れ・前提条件・暗黙知を重視してください。',
  ai_addition_gemini:      '複数ノートの情報を統合し、共通点・相違点・時系列・関連トピックを整理して回答してください。',
  ai_moc_modal_title:        'AI MOCを作成',
  ai_moc_note_placeholder:   'ノートを選択...',
  ai_moc_scope_direct:       'Direct Links',
  ai_moc_scope_related:      'Related Notes',
  ai_moc_backlinks_moc:      'MOCに含める',
  ai_moc_backlinks_pack:     'Context Packに含める',
  ai_moc_backlinks_note:     'Backlinksはノイズになる場合があります',
  ai_moc_generate_pack:      'Context Packも同時に生成',
  ai_moc_btn_select:         '選択...',
  ai_moc_btn_cancel:         'キャンセル',
  ai_moc_btn_create:         '作成',
  ai_moc_notice_select:      'ノートを選択してください',
  ai_moc_notice_creating:    'AI MOCを作成中...',
  ai_moc_notice_moc_done:    (name: string) => `${name} MOC.md を作成しました`,
  ai_moc_overwrite_message:  (name: string) => `${name} MOC.md は既に存在します。上書きしますか？`,
  ai_moc_overwrite_cancel:   'キャンセル',
  ai_moc_overwrite_confirm:  '上書きする',

  setting_default_mode:      'デフォルトモード',
  setting_default_mode_desc: 'AI別指示の末尾に、モード別の追加指示が付加されます。',

  modal_mode_label:         'モード',
  modal_mode_desc:          'AI へのプロンプトに用途別の指示を追加します',
  modal_mode_not_supported: 'この出力先では使用できません',

  mode_none_name:        'なし',
  mode_none_desc:        '追加指示なし',
  mode_research_name:    'リサーチ',
  mode_research_desc:    '情報収集・比較・分析',
  mode_learning_name:    '学習',
  mode_learning_desc:    'ステップバイステップ・教育的説明',
  mode_writing_name:     'ライティング',
  mode_writing_desc:     '記事・文書執筆支援',
  mode_development_name: '開発',
  mode_development_desc: '実装・開発支援',

  mode_research_prompt:    '比較・根拠明示・情報の網羅性を重視。可能な限り根拠を示し、推測と事実を区別してください。反証や別解釈がある場合は合わせて示してください。可能な限り、回答の根拠となったノートを明示してください。',
  mode_learning_prompt:    'ステップバイステップ・例示・理解確認を重視してください。専門用語は必要に応じて説明してください。',
  mode_writing_prompt:     '文体統一・構成提案・読者視点を重視してください。',
  mode_development_prompt: `実装可能な手順で回答してください。
曖昧な提案より具体的な変更案を優先してください。
既存仕様と異なる場合はその理由を説明してください。`,

  pk_chatgpt_projects: `このパックをプロジェクト知識として扱ってください。

これらのノートの情報を主要な参照資料として使用してください。

不足している要件を推測しないでください。

仕様が不明または不足している場合：
- 不明点を明示する
- 可能な解釈を列挙する
- 必要に応じて確認を求める

新しいパターンを導入するよりも、既存のプロジェクトの決定との一貫性を優先してください。`,

  pk_claude_project: `このパックをプロジェクト知識として扱ってください。

要件や仕様を分析する際：
- 複数のノートにわたる関連情報を結びつける
- 依存関係や影響を特定する
- 関係性・概念的なつながり・テーマ的な連関を明らかにする
- 矛盾や未解決の決定を指摘する
- 提供されたノートの根拠を使って推論を説明する

明示的に要求されない限り、プロジェクトの慣習を一般的なベストプラクティスに置き換えないでください。`,

  pk_gemini_notebook: `このパックをナレッジリポジトリとして扱ってください。

回答する際：
- 提供されたノート全体を幅広く検索する
- 複数のセクションからの情報を統合する
- 繰り返し現れるテーマやパターンを特定する
- 可能な場合は関連するノートのセクションを引用する

孤立した記述よりも、複数のノートに裏付けられた結論を優先してください。`,

  pk_agents_claudecode: `このパックをプロジェクト知識として扱ってください。

コードを生成する前に：
- 関連する仕様を特定する
- アーキテクチャの制約を特定する
- 命名規則を特定する
- 既存の設計上の決定を特定する

生成するコードは、できる限りプロジェクト知識に従ってください。

実装の詳細が不足している場合：
- 前提条件を明示的に説明する
- 根拠なくAPIや構造を作り出すことを避ける

明示的に要求されない限り、既存のアーキテクチャを置き換えたり既存のコードをリファクタリングしたりしないでください。

一般的な例よりもプロジェクトのドキュメントとの一貫性を優先してください。`,

  'tab.chatgpt':    'ChatGPT',
  'tab.claude':     'Claude',
  'tab.gemini':     'Gemini',
  'tab.agents':     'エージェント',
  'tab.epub':       'EPUB',

  epub_book_title:          'ブックタイトル',
  epub_sort_strategy:       '章の並び順',
  epub_sort_current:        '現在の順序',
  epub_sort_title:          'タイトル順',
  epub_sort_filename:       'ファイル名順',
  epub_sort_ai_brief:       'AI Brief順',
  epub_include_brief:       'AI Briefをまえがきとして含める',
  epub_include_toc:         '目次を含める',
  epub_include_notes:       '元ノート本文を章として含める',
  epub_convert_links:       'Obsidianリンクを通常テキストに変換',
  epub_strip_frontmatter:   'Frontmatterを除外',
  epub_btn_create:          'EPUBを作成',
  epub_notice_exported:     (filename: string) => `EPUBを出力しました: ${filename}`,
  epub_notice_no_notes:     'EPUBに含めるノートが見つかりませんでした。',
  'mode.chat':      'チャット',
  'mode.projects':  'Projects',
  'mode.project':   'Project',
  'mode.notebook':  'Notebook',
  'mode.claudecode': 'Claude Code',
  'mode.notebooklm': 'NotebookLM',

  ai_addition_claude_code: `このContext Packはプロジェクト知識です。実装時は：
- Context Packを事実として扱う
- コーディング規約を優先する
- アーキテクチャ方針を優先する
- 推測で新規設計を行わない
- 既存実装との整合性を重視する
- 不明な要件は実装前に確認する`,

  setting_freshness_section:          'Freshness Auto Check',
  setting_freshness_auto_check:       'Vault起動時に自動チェック',
  setting_freshness_auto_check_desc:  'Obsidian起動時にすべてのパックの新鮮度を自動チェックします。',

  freshness_level_fresh:  '最新',
  freshness_level_warn:   '要確認',
  freshness_level_stale:  '古い',
  freshness_loading:      '鮮度チェック中…',
  freshness_empty:        'パックがありません。パックを作成すると鮮度の追跡が始まります。',
  freshness_count_fresh:  (n: number) => `最新 / ${n} ノート`,
  freshness_count_notes:  (n: number) => `/ ${n} ノート`,
  freshness_updated:      (n: number) => `${n} 更新`,
  freshness_added:        (n: number) => `${n} 新規`,
  freshness_created_at:   (s: string) => `投入 ${s}`,
  freshness_not_found:    (n: number) => `⚠ ${n} Not Found`,
  freshness_diff_btn:     '差分を見る',
  freshness_diff_soon:    '差分表示は近日公開予定です。',
  freshness_reexport_btn: '再エクスポート',
  freshness_delete_title: 'このパックを削除',

  cmd_generate_brief_folder:       'フォルダからAI Briefを生成',
  cmd_generate_brief_tag:          'タグからAI Briefを生成',
  cmd_generate_brief_moc:          'MOCからAI Briefを生成',
  cmd_generate_ai_moc_from_brief:  'AI BriefからAI MOCを生成',
  menu_generate_brief:             'このフォルダのAI Briefを生成',
  menu_generate_ai_moc_from_brief: 'このAI BriefからAI MOCを生成',
  menu_pack_from_brief:            'このAI BriefからContext Packを作成',
  menu_epub_from_brief:            'このAI BriefからEPUBを作成',
  notice_generating_brief:         'AI Brief を生成中…',
  notice_brief_done:               (path: string) => `AI Brief を保存しました: ${path}`,
  notice_brief_moc_done:           (path: string) => `AI Brief MOC を保存しました: ${path}`,
  notice_brief_not_detected:       'このファイルはAI Briefではないようです。',
  notice_brief_no_structure:       'AI Briefの構造が見つかりませんでした。',
  notice_ai_brief_not_packable:    'AI BriefはAnalysisドキュメントです。まずAI MOCを生成してから、AI MOCからContext Packを作成してください。',

  setting_ai_brief_section:          'AI Brief Generator',
  setting_ai_brief_mermaid:          'Mermaidダイアグラムを有効化',
  setting_ai_brief_mermaid_desc:     'Knowledge MapをMermaid mindmapとして描画します。',
  setting_ai_brief_max_topics:       'キートピック最大数',
  setting_ai_brief_max_topics_desc:  'Briefに含めるキートピックの最大数を設定します。',
  setting_ai_brief_similarity:       '類似度しきい値 (%)',
  setting_ai_brief_similarity_desc:  'Similar Notesセクションに含めるペアの最低類似スコアです。',

  folder_picker_title_brief: 'AI Brief対象フォルダを選択',

  cluster_other:             'その他',

  // ── AI Brief 出力コンテンツ ──────────────────────────────────────────────
  brief_generated:           (date: string, n: number) => `_生成日時：${date} | ${n}件のノート_`,
  brief_h_executive_insight: '## 全体概観',
  brief_h_executive_summary: '## エグゼクティブサマリー',
  brief_h_key_topics:        '## 主要トピック',
  brief_h_knowledge_map:     '## ナレッジマップ',
  brief_h_document_structure:'## ドキュメント構造',
  brief_h_topic_clusters:    '## トピッククラスター',
  brief_h_relationship_map:  '## 関係マップ',
  brief_h_similar_notes:     '## 類似ノート',
  brief_h_related_notes:     '## 関連ノート',
  brief_h_knowledge_health:  '## ナレッジヘルス',
  brief_h_diagnostic_summary:'### 診断サマリー',
  brief_h_open_questions:    '## 未解決の課題',
  brief_h_expansion_candidates: '### 発展候補ノート',
  brief_expansion_desc:      '頻繁に参照されているため、内容を拡張するとナレッジベース全体の価値向上が期待できます。',
  brief_h_suggested_prompts: '## 推奨プロンプト',

  brief_cluster_notes:       (n: number) => `**ノート数：** ${n}`,
  brief_cluster_themes:      '**主なテーマ：**',
  brief_cluster_rep:         '**代表ノート：**',

  brief_no_relationships:    '_強い関係性は検出されませんでした。_',
  brief_no_pairs:            '_最小しきい値を超えるノートペアは検出されませんでした。_',
  brief_shared:              '共通：',
  brief_none:                '_なし_',
  brief_list_sep:            '、',
  brief_list_and:            'と',

  brief_health_inferred:     '> **注意：** このBriefに表示されている関係性は、タグ・見出し・コンテンツの類似性から推定されたものです。',
  brief_health_no_links:     '> Obsidianの明示的なリンクは検出されませんでした。',
  brief_health_conn_note:    '> **補足：** 孤立ノートはありませんが、クラスター間リンクが少ないため接続性スコアは控えめになっています。',
  brief_health_col_header:   '| 指標 | 値 |',
  brief_health_col_sep:      '|---|---|',
  brief_health_row_notes:    (n: number) => `| ノート数 | ${n} |`,
  brief_health_row_links:    (n: number) => `| リンク数 | ${n} |`,
  brief_health_row_orphans:  (n: number) => `| 孤立ノート数 | ${n} |`,
  brief_health_row_dupes:    (n: number) => `| 重複候補数 | ${n} |`,
  brief_health_row_conn:     (n: number) => `| 接続性スコア | ${n}/100 |`,
  brief_health_row_coverage: (n: number, label: string) => `| トピックカバレッジ | ${n}/100 — ${label} |`,

  brief_coverage_high:       '高カバレッジ',
  brief_coverage_good:       '良好なカバレッジ',
  brief_coverage_moderate:   '中程度のカバレッジ',
  brief_coverage_basic:      '基本的なカバレッジ',
  brief_coverage_low:        '低カバレッジ',

  brief_exec_kb_header:      'このナレッジベースの構成：',
  brief_exec_doc_header:     'このドキュメントの構成：',
  brief_exec_row_notes:      (n: number) => `- ${n}件のノート`,
  brief_exec_row_links:      (n: number) => `- ${n}本のリンク`,
  brief_exec_row_tags:       (n: number) => `- ${n}種類のタグ`,
  brief_exec_row_clusters:   (n: number) => `- ${n}個の主要トピッククラスター`,
  brief_exec_row_sections:   (n: number) => `- ${n}つのセクション`,

  brief_insight_kb_intro:    (notes: number, clusters: number) =>
    `このナレッジベースには${notes}件のノートが${clusters}つのトピッククラスターに整理されています。`,
  brief_insight_largest:     (name: string, pct: number) =>
    `「${name}」が最大のクラスターで、全ノートの${pct}%を占めています。`,
  brief_insight_single:      (notes: number) =>
    `このナレッジベースには${notes}件のノートが1つのトピック領域に集まっています。`,
  brief_insight_doc_intro:   (n: number, list: string) =>
    `このドキュメントには${n}つのセクションが含まれています：${list}。`,
  brief_insight_sec_conn:    'セクションは相互にリンクされており、まとまりのある参照構造を形成しています。',
  brief_insight_sec_alone:   'セクションは比較的独立しています。セクション間にリンクを追加するとナビゲーションが向上します。',
  brief_insight_hub:         (name: string) => `「${name}」がこのVaultで最も発達した領域です。`,
  brief_insight_hub_themed:  (name: string, themes: string) =>
    `「${name}」は知識の中核を形成しており、${themes}を中心に構成されています。`,
  brief_insight_second:      (name: string, n: number) =>
    `次に大きなクラスターは「${name}」で、${n}件のノートを含みます。`,
  brief_insight_conn_high:   'コレクションはよく繋がっており、ほとんどのノートが関連コンテンツにリンクされています。',
  brief_insight_conn_mid:    'ノートはクラスター内では繋がっていますが、クラスター間のリンクは限られています。',
  brief_insight_conn_low:    '接続性が低いです。ノート間にリンクを追加するとナビゲーションが大幅に向上します。',
  brief_insight_add_overview:(names: string) => `${names}を繋ぐ概要ノートや比較ノートの追加を検討してください。`,

  brief_hi_doc:              (n: number, names: string) =>
    `このドキュメントは${n}つのセクションで構成されています：${names}。`,
  brief_hi_clusters:         (n: number, names: string) =>
    `Vaultは${n}つのクラスターに整理されています：${names}。`,
  brief_hi_clusters_with_index: (n: number, names: string, indexName: string) =>
    `Vaultは${n}つの主要クラスター（${names}）と1つのインデックスノート（${indexName}）で構成されています。`,
  brief_hi_conn_high:        'ノートはトピック領域内でよく繋がっています。',
  brief_hi_conn_mid:         'ほとんどのノートはクラスター内で繋がっています。クラスター間の接続は限られています。',
  brief_hi_conn_low:         'ほとんどのノートの接続が少ないです。リンクを追加するとナビゲーションが向上します。',
  brief_hi_all_reach:        'すべてのノートは少なくとも1つのリンクからアクセスできます。',
  brief_hi_orphans:          (n: number) => `${n}件のノートが他のノートからリンクされていません。`,
  brief_hi_coverage_high:    'トピックカバレッジは広く、クラスター間のバランスが取れています。',
  brief_hi_coverage_mid:     'カバレッジは中程度です。一部のクラスターは追加のノートで補強できます。',
  brief_hi_coverage_low:     '1つのクラスターがコレクションの大部分を占めています。小さなトピック領域の拡充を検討してください。',
  brief_hi_overview:         (names: string) =>
    `クラスター間のナビゲーションを改善するために、${names}を繋ぐ概要ノートの作成を検討してください。`,

  brief_prompt_compare:      (a: string, b: string) => `「${a}」と「${b}」を比較・対照してください。`,
  brief_prompt_summarize:    (cluster: string) => `${cluster}の主なテーマをまとめてください。`,
  brief_prompt_overview:     (topic: string) => `「${topic}」の体系的な概要を作成してください。`,
  brief_prompt_connections:  (a: string, b: string) => `${a}と${b}の関係性を教えてください。`,
  brief_prompt_gaps:         'このコレクションの中で最も重要な知識のギャップを特定してください。',
  brief_prompt_central:      'このナレッジベースで最も中心的なトピックは何ですか？',
  brief_prompt_improve:      'これらのノートの構造と接続性を改善する方法を提案してください。',
  brief_prompt_roadmap:      'トピッククラスターに基づいて学習ロードマップを作成してください。',

  oq_orphan_notes:           (n: number) => `${n}件のノートがメインのナレッジグラフから孤立しています。`,
  oq_small_clusters:         (n: number) => `${n}つのクラスターにはノートが1件しかなく、補足資料が必要かもしれません。`,
  oq_primary_cluster:        'このナレッジベースで主要フォーカスとして扱うべきトピッククラスターはどれですか？',
  oq_dominant_cluster:       (name: string) => `「${name}」クラスターには全ノートの半数以上が含まれています。サブトピックへの分割を検討してください。`,
  oq_peer_isolated:          (n: number) => `${n}件のノートがハブノードやインデックスノードを介してのみ繋がっており、直接のピア接続がありません。`,
  oq_sparse_clusters:        (names: string, _plural: boolean) => `クラスター${names}の内部接続が少ないです。クラスター内の関連ノートを繋ぐことを検討してください。`,
  oq_no_cross_links:         'ハブ以外のノート間にクラスターをまたぐ直接リンクがありません。関連するトピック間の接続を追加することを検討してください。',
  oq_duplicate_candidates:   (n: number) => `${n}組の高類似度ノートがマージの候補である可能性があります。`,

  brief_level_very_similar:  '非常に類似',
  brief_level_strong:        '重複候補',
  brief_level_review:        '要確認',
  brief_level_related:       '関連あり',
};
