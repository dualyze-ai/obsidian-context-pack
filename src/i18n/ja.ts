export default {
  cmd_export:         'NotebookLM向けにVaultをエクスポート',
  cmd_export_current: 'NotebookLM向けに現在のノートをエクスポート',
  cmd_pack_folder:    'フォルダからContext Packを作成',
  cmd_pack_tag:       'タグからContext Packを作成',
  cmd_pack_moc:       'MOCからContext Packを作成',

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
  notice_done:       (n: number) => `完了しました。${n}件のノートをエクスポートしました。`,
  notice_pack_done:  (n: number) => `Context Packを作成しました。${n}件のノートを含んでいます。`,
  notice_no_files:   '対象フォルダにMarkdownファイルが見つかりませんでした。',
  notice_error:      'エラーが発生しました。コンソールを確認してください。',
};
