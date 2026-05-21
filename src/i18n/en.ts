export default {
  cmd_export:         'Export vault for NotebookLM',
  cmd_export_current: 'Export current note for NotebookLM',
  cmd_pack_folder:    'Create Context Pack from folder',
  cmd_pack_tag:       'Create Context Pack from tag',
  cmd_pack_moc:       'Create Context Pack from MOC',

  ribbon_tooltip:    'Create Context Pack',
  menu_pack_folder:  'Pack this folder as Context Pack',
  menu_export_note:  'Export this note (NotebookLM)',
  menu_pack_moc:     'Create Context Pack from this MOC',

  prompt_tag_name:    'Enter tag name (without #)',
  prompt_file_name:   'Name your Context Pack file',

  setting_target_folder:      'Target folder',
  setting_target_folder_desc: 'Folder to export. Leave empty to export the entire vault.',
  setting_output_folder:      'Output folder',
  setting_output_folder_desc: 'Where to save the ZIP. Leave empty to use the vault root.',
  setting_flatten:             'Flatten folder structure',
  setting_flatten_desc:        'Merge all notes into one folder in the ZIP. Folder names are prepended to filenames.',
  setting_include_title:       'Include frontmatter title',
  setting_include_title_desc:  'Convert title and tags from frontmatter into readable text at the top of each note.',
  setting_open_after:          'Open folder after export',
  setting_open_after_desc:     'Automatically open the output folder when done. Desktop only.',
  setting_pack_output:         'Context Pack output folder',
  setting_pack_output_desc:    'Where to save Context Pack files. Leave empty to use the same folder as exports.',

  notice_exporting:  'Exporting notes…',
  notice_done:       (n: number) => `Done — ${n} note${n === 1 ? '' : 's'} exported.`,
  notice_pack_done:  (n: number) => `Context Pack created — ${n} note${n === 1 ? '' : 's'} included.`,
  notice_no_files:   'No markdown files found in the target folder.',
  notice_error:      'Something went wrong. Check the console for details.',
};
