export default {
  cmd_export:         'Export vault for NotebookLM',
  cmd_export_current: 'Export current note for NotebookLM',
  cmd_pack_folder:    'Create Context Pack from folder',
  cmd_pack_tag:       'Create Context Pack from tag',
  cmd_create_moc_tag: 'Create MOC from tag',
  cmd_create_ai_moc:  'Create AI MOC from note',
  cmd_pack_moc:       'Create Context Pack from MOC',

  ribbon_tooltip:        'AI Context Pack / Export',
  ribbon_pack_folder:    'Context Pack (choose folder)',
  ribbon_pack_tag:       'Context Pack (choose tag)',
  ribbon_create_moc_tag:  'Create MOC (from tag)',
  ribbon_create_moc_note: 'Create MOC (from note)',
  ribbon_export_tag:     'Export by tag (ZIP)',
  ribbon_export_vault:   'Export entire vault (ZIP)',
  ribbon_export_folder:  'Export folder (ZIP)',
  menu_pack_folder:      'Pack this folder as Context Pack',
  menu_create_moc:       'Create MOC from this folder',
  menu_export_folder:    'Export this folder (ZIP)',
  menu_export_note:      'Export this note (.md)',
  menu_pack_moc:         'Create Context Pack from this MOC',
  menu_create_ai_moc:    'Create AI MOC from this note',

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
  notice_packing:    'Building Context Pack…',
  notice_done:       (n: number) => `Done — ${n} note${n === 1 ? '' : 's'} exported.`,
  notice_pack_done:  (n: number) => `Context Pack created — ${n} note${n === 1 ? '' : 's'} included.`,
  notice_no_files:   'No markdown files found in the target folder.',
  notice_no_links:   'No [[links]] found in this note. Add links to other notes to use it as a MOC.',
  notice_moc_done:   (n: number) => `MOC created — ${n} note${n === 1 ? '' : 's'} included.`,
  notice_cancelled:  'Cancelled.',
  notice_error:      'Something went wrong. Check the console for details.',
  btn_cancel:        'Cancel',
  folder_search_placeholder: 'Search folders…',
  folder_picker_title_pack:   'Choose a folder to pack',
  folder_picker_title_export: 'Choose a folder to export',

  cmd_daily_default:   'Daily Notes: Create pack (default range)',
  cmd_daily_custom:    'Daily Notes: Create pack (choose range)',
  cmd_daily_weekly:    'Daily Notes: Create weekly summary pack',
  ribbon_daily:        'Create Daily Notes pack',

  daily_modal_title:      'Create Daily Notes Pack',
  daily_preset_this_week: 'This week',
  daily_preset_last_week: 'Last week',
  daily_preset_7:         'Last 7 days',
  daily_preset_14:        'Last 14 days',
  daily_preset_30:        'Last 30 days',
  daily_preset_custom:    'Custom',
  daily_start_date:       'Start date',
  daily_end_date:         'End date',
  daily_exclude_tags:     'Exclude tags',
  daily_folder_label:     'Change folder',
  daily_folder_picker:    'Select folder…',
  daily_preview_found:    (n: number) => `${n} Daily Note${n === 1 ? '' : 's'} found`,
  daily_preview_none:     'No Daily Notes found for this range',
  daily_btn_cancel:       'Cancel',
  daily_btn_create:       'Create pack',
  daily_vault_root:       '(Vault root)',
  daily_notice_none:      'No Daily Notes found for the selected range.',

  setting_daily_section:       'Daily Notes mode',
  setting_daily_auto:          'Auto-detect Daily Notes',
  setting_daily_auto_desc:     'Automatically detect folder and date format from Obsidian Daily Notes plugin settings.',
  setting_daily_folder:        'Daily Notes folder',
  setting_daily_format:        'Date format',
  setting_daily_format_desc:   'moment.js format (e.g. YYYY-MM-DD)',
  setting_daily_range:         'Default range',
  setting_daily_exclude:       'Exclude tags',
  setting_daily_exclude_desc:  'Comma-separated list of tags to exclude (e.g. #private, #todo)',
  setting_daily_sort:          'Sort order',
  setting_daily_sort_asc:      'Oldest first',
  setting_daily_sort_desc:     'Newest first',

  pack_period:        'Period',
  pack_count:         (n: number) => `${n} note${n === 1 ? '' : 's'}`,
  pack_generated:     'Generated',
  pack_no_content:    '(no content)',
  pack_dow:           (day: number) => ['(Sun)', '(Mon)', '(Tue)', '(Wed)', '(Thu)', '(Fri)', '(Sat)'][day],
  weekly_title:       (year: number, month: number, week: number) => `Week ${week} of ${year}-${String(month).padStart(2, '0')}`,
  weekly_header:      'Weekly Summary',
  weekly_count:       (n: number) => `${n} Daily Note${n === 1 ? '' : 's'}`,

  modal_select_target:   'Select output target',
  modal_token_estimated: (n: number) => `Estimated tokens: ~${n.toLocaleString()}`,
  modal_token_over:      (ai: string, max: string) => `Exceeds ${ai} recommended limit (${max} tokens)`,
  modal_method_label:    'Output method',
  modal_method_clipboard: 'Copy to clipboard',
  modal_method_file:     'Save as file',
  modal_btn_export:      'Export',
  modal_coming_soon:     'Planned for v2.2',

  notice_ai_copied: (n: number) => `Copied to clipboard (~${n.toLocaleString()} tokens)`,
  notice_ai_saved:  (path: string, n: number) => `Saved: ${path} (~${n.toLocaleString()} tokens)`,
  notice_ai_done:   (n: number) => `Done (~${n.toLocaleString()} tokens)`,

  setting_output_section:      'Output settings',
  setting_default_target:      'Default output target',
  setting_default_target_desc: 'Used when "Show output selector" is off.',
  setting_show_modal:          'Show output selector',
  setting_show_modal_desc:     'Choose the output target each time. When off, uses the default.',
  setting_show_tokens:         'Show token count',
  setting_show_tokens_desc:    'Display estimated token count in the output selector.',
  setting_warn_tokens:         'Warn when over limit',
  setting_warn_tokens_desc:    'Show a warning when the pack exceeds the recommended token limit.',
  setting_open_url:            'Open AI website after export',
  setting_open_url_desc:       'Open the AI website after copying to clipboard. ChatGPT, Claude, and Gemini only.',

  setting_common_instructions:             'Common Instructions',
  setting_common_instructions_desc:        'Prepended to every Context Pack. AI-specific instructions are added automatically after this. Use {source} for the folder/tag name and {count} for the note count.',
  setting_common_instructions_toggle:      'Include Common Instructions by default',
  setting_common_instructions_toggle_desc: 'When on, Common Instructions are added to every pack. You can also toggle it per export in the output selector.',
  setting_common_instructions_reset:       'Reset to default',

  modal_include_prompt:    'Include Common Instructions',
  modal_method_file_vault: 'Save to Vault',
  modal_open_ai_url:       'Open AI website after export',

  default_starter_prompt: 'The following is a collection of {count} Obsidian notes from "{source}". Please read the content and answer my questions based on it.',

  default_common_instructions: `The following is a Context Pack generated from {count} Obsidian notes in "{source}".

If information exists in this Context Pack, please prioritize it.
If the Context Pack does not contain a basis, indicate whether the response is based on inference, general knowledge, or external knowledge.
Do not mention Obsidian, Context Pack, NotebookLM, or similar systems, and do not offer suggestions for improving this document.`,

  ai_addition_chatgpt:    'Please prioritize structured responses: use headings, bullet points, conclusions first, and explanations accessible to beginners.',
  ai_addition_claude:     'Please focus on relationships between information, contradictions, gaps, preconditions, and implicit knowledge across the entire Context Pack.',
  ai_addition_gemini:     'Please integrate information from multiple notes and organize your response by common points, differences, chronology, and related topics.',
  ai_moc_modal_title:        'Create AI MOC',
  ai_moc_note_placeholder:   'Select a note…',
  ai_moc_scope_direct:       'Direct Links',
  ai_moc_scope_related:      'Related Notes',
  ai_moc_backlinks_moc:      'Include in MOC',
  ai_moc_backlinks_pack:     'Include in Context Pack',
  ai_moc_backlinks_note:     'Backlinks can add noise',
  ai_moc_generate_pack:      'Also generate a Context Pack',
  ai_moc_btn_select:         'Select',
  ai_moc_btn_cancel:         'Cancel',
  ai_moc_btn_create:         'Create',
  ai_moc_notice_select:      'Please select a note.',
  ai_moc_notice_creating:    'Creating AI MOC…',
  ai_moc_notice_moc_done:    (name: string) => `${name} MOC.md created.`,
  ai_moc_overwrite_message:  (name: string) => `${name} MOC.md already exists. Overwrite?`,
  ai_moc_overwrite_cancel:   'Cancel',
  ai_moc_overwrite_confirm:  'Overwrite',

  setting_default_mode:      'Default Mode',
  setting_default_mode_desc: 'Mode-specific instructions are appended to the prompt after AI-specific additions.',

  modal_mode_label:         'Mode',
  modal_mode_desc:          'Append mode-specific instructions to the prompt',
  modal_mode_not_supported: 'Not supported for this output',

  mode_none_name:        'None',
  mode_none_desc:        'No additional instructions',
  mode_research_name:    'Research',
  mode_research_desc:    'Information gathering, comparison, analysis',
  mode_learning_name:    'Learning',
  mode_learning_desc:    'Step-by-step explanations, educational support',
  mode_writing_name:     'Writing',
  mode_writing_desc:     'Article and document writing support',
  mode_development_name: 'Development',
  mode_development_desc: 'Implementation, code, development support',

  mode_research_prompt:    'Prioritize comparison, evidence-based reasoning, and comprehensive coverage. Clearly distinguish between facts and inferences. Present counterarguments or alternative interpretations when relevant. Whenever possible, cite the specific notes that support your answer.',
  mode_learning_prompt:    'Emphasize step-by-step explanations, examples, and comprehension checks. Define technical terms when needed.',
  mode_writing_prompt:     'Focus on consistent style, structural suggestions, and reader perspective.',
  mode_development_prompt: `Respond with actionable steps.
Prioritize concrete changes over vague suggestions.
If your answer differs from existing specifications, explain why.`,

  pk_chatgpt_projects: `Treat this pack as project knowledge.

Use the information in these notes as the primary reference.

Do not assume missing requirements.

If a specification is unclear or absent:
- explicitly identify the gap
- list possible interpretations
- ask for clarification when necessary

Prioritize consistency with existing project decisions over introducing new patterns.`,

  pk_claude_project: `Treat this pack as project knowledge.

When analyzing requirements or specifications:
- connect related information across multiple notes
- identify dependencies and implications
- identify relationships, conceptual links, and thematic connections
- highlight contradictions or unresolved decisions
- explain reasoning using evidence from the provided notes

Do not replace project conventions with generic best practices unless explicitly requested.`,

  pk_gemini_notebook: `Treat this pack as a knowledge repository.

When answering:
- search broadly across the provided notes
- synthesize information from multiple sections
- identify recurring themes and patterns
- cite the relevant note sections when possible

Prefer conclusions supported by multiple notes over isolated statements.`,

  pk_agents_claudecode: `Treat this pack as project knowledge.

Before generating code:
- identify relevant specifications
- identify architectural constraints
- identify naming conventions
- identify existing design decisions

Generated code should follow the project knowledge whenever possible.

If implementation details are missing:
- explain assumptions explicitly
- avoid inventing APIs or structures without evidence

Do not replace existing architecture or refactor existing code unless explicitly requested.

Prefer consistency with project documentation over generic examples.`,

  'tab.chatgpt':    'ChatGPT',
  'tab.claude':     'Claude',
  'tab.gemini':     'Gemini',
  'tab.agents':     'Agents',
  'mode.chat':      'Chat',
  'mode.projects':  'Projects',
  'mode.project':   'Project',
  'mode.notebook':  'Notebook',
  'mode.claudecode': 'Claude Code',
  'mode.notebooklm': 'NotebookLM',

  ai_addition_claude_code: `This Context Pack is project knowledge. When implementing:
- Treat the Context Pack as fact
- Follow coding conventions and architecture guidelines
- Do not make new designs based on inference
- Respect consistency with existing implementations
- Ask when requirements are unclear`,

  setting_freshness_section:          'Freshness Auto Check',
  setting_freshness_auto_check:       'Check pack freshness on startup',
  setting_freshness_auto_check_desc:  'Automatically check all pack freshness when Obsidian starts.',

  freshness_level_fresh:  'Fresh',
  freshness_level_warn:   'Needs Review',
  freshness_level_stale:  'Stale',
  freshness_loading:      'Checking freshness…',
  freshness_empty:        'No packs yet. Generate a pack to start tracking freshness.',
  freshness_count_fresh:  (n: number) => `Up to date / ${n} notes`,
  freshness_count_notes:  (n: number) => `/ ${n} notes`,
  freshness_updated:      (n: number) => `${n} updated`,
  freshness_added:        (n: number) => `${n} added`,
  freshness_created_at:   (s: string) => `Added ${s}`,
  freshness_not_found:    (n: number) => `⚠ ${n} Not Found`,
  freshness_diff_btn:     'View diff',
  freshness_diff_soon:    'Diff view coming soon.',
  freshness_reexport_btn: 'Re-export',
  freshness_delete_title: 'Delete this pack',

  cmd_generate_brief_folder: 'Generate AI Brief from folder',
  cmd_generate_brief_tag:    'Generate AI Brief from tag',
  cmd_generate_brief_moc:    'Generate AI Brief from MOC',
  menu_generate_brief:       'Generate AI Brief from this folder',
  notice_generating_brief:   'Generating AI Brief…',
  notice_brief_done:         (path: string) => `AI Brief saved: ${path}`,

  setting_ai_brief_section:          'AI Brief Generator',
  setting_ai_brief_mermaid:          'Enable Mermaid diagrams',
  setting_ai_brief_mermaid_desc:     'Render the Knowledge Map as a Mermaid mindmap diagram.',
  setting_ai_brief_max_topics:       'Max key topics',
  setting_ai_brief_max_topics_desc:  'Maximum number of key topics to include in the brief.',
  setting_ai_brief_similarity:       'Similarity threshold (%)',
  setting_ai_brief_similarity_desc:  'Minimum similarity score to include a pair in the Similar Notes section.',

  folder_picker_title_brief: 'Choose a folder for AI Brief',

  cluster_other:             'Other',

  // ── AI Brief output content ──────────────────────────────────────────────
  brief_generated:           (date: string, n: number) => `_Generated: ${date} | ${n} notes_`,
  brief_h_executive_insight: '## Executive Insight',
  brief_h_executive_summary: '## Executive Summary',
  brief_h_key_topics:        '## Key Topics',
  brief_h_knowledge_map:     '## Knowledge Map',
  brief_h_document_structure:'## Document Structure',
  brief_h_topic_clusters:    '## Topic Clusters',
  brief_h_relationship_map:  '## Relationship Map',
  brief_h_similar_notes:     '## Similar Notes',
  brief_h_related_notes:     '## Related Notes',
  brief_h_knowledge_health:  '## Knowledge Health',
  brief_h_diagnostic_summary:'### Diagnostic Summary',
  brief_h_open_questions:    '## Open Questions',
  brief_h_suggested_prompts: '## Suggested Prompts',

  brief_cluster_notes:       (n: number) => `**Notes:** ${n}`,
  brief_cluster_themes:      '**Main Themes:**',
  brief_cluster_rep:         '**Representative Notes:**',

  brief_no_relationships:    '_No strong relationships detected._',
  brief_no_pairs:            '_No note pairs detected above the minimum threshold._',
  brief_shared:              'Shared:',
  brief_none:                '_None_',
  brief_list_sep:            ', ',
  brief_list_and:            ' and ',

  brief_health_inferred:     '> **Note:** Relationships shown in this brief are inferred from tags, headings, and content similarity.',
  brief_health_no_links:     '> No explicit Obsidian links were detected.',
  brief_health_conn_note:    '> **Note:** No orphan notes detected, but the connectivity score is moderate because cross-cluster links are sparse.',
  brief_health_col_header:   '| Metric | Value |',
  brief_health_col_sep:      '|---|---|',
  brief_health_row_notes:    (n: number) => `| Total Notes | ${n} |`,
  brief_health_row_links:    (n: number) => `| Total Links | ${n} |`,
  brief_health_row_orphans:  (n: number) => `| Orphan Notes | ${n} |`,
  brief_health_row_dupes:    (n: number) => `| Duplicate Candidates | ${n} |`,
  brief_health_row_conn:     (n: number) => `| Connectivity Score | ${n}/100 |`,
  brief_health_row_coverage: (n: number, label: string) => `| Topic Coverage Score | ${n}/100 — ${label} |`,

  brief_coverage_high:       'High Coverage',
  brief_coverage_good:       'Good Coverage',
  brief_coverage_moderate:   'Moderate Coverage',
  brief_coverage_basic:      'Basic Coverage',
  brief_coverage_low:        'Low Coverage',

  brief_exec_kb_header:      'This knowledge base contains:',
  brief_exec_doc_header:     'This document contains:',
  brief_exec_row_notes:      (n: number) => `- ${n} notes`,
  brief_exec_row_links:      (n: number) => `- ${n} links`,
  brief_exec_row_tags:       (n: number) => `- ${n} tags`,
  brief_exec_row_clusters:   (n: number) => `- ${n} major topic cluster${n === 1 ? '' : 's'}`,
  brief_exec_row_sections:   (n: number) => `- ${n} section${n === 1 ? '' : 's'}`,

  brief_insight_kb_intro:    (notes: number, clusters: number) =>
    `This knowledge base contains ${notes} notes organized into ${clusters} topic cluster${clusters !== 1 ? 's' : ''}.`,
  brief_insight_largest:     (name: string, pct: number) =>
    `"${name}" is the largest cluster, accounting for ${pct}% of all notes.`,
  brief_insight_single:      (notes: number) =>
    `This knowledge base contains ${notes} notes in a single topic area.`,
  brief_insight_doc_intro:   (n: number, list: string) =>
    `This document contains ${n} section${n !== 1 ? 's' : ''}: ${list}.`,
  brief_insight_sec_conn:    'The sections are linked to each other, forming a cohesive reference structure.',
  brief_insight_sec_alone:   'Sections are relatively standalone. Adding links between them would improve navigability.',
  brief_insight_hub:         (name: string) => `"${name}" is the most developed area in this vault.`,
  brief_insight_hub_themed:  (name: string, themes: string) =>
    `"${name}" forms the core of this vault, centered around ${themes}.`,
  brief_insight_second:      (name: string, n: number) =>
    ` The next largest cluster is "${name}" with ${n} notes.`,
  brief_insight_conn_high:   'The collection is well connected, with most notes linked to related content.',
  brief_insight_conn_mid:    'Most notes are connected within their cluster, though cross-cluster links are limited.',
  brief_insight_conn_low:    'Connectivity is low. Adding more links between notes would significantly improve navigability.',
  brief_insight_add_overview:(names: string) => `Consider adding overview or comparison notes connecting ${names}.`,

  brief_hi_doc:              (n: number, names: string) =>
    `This document is structured into ${n} section${n !== 1 ? 's' : ''}: ${names}.`,
  brief_hi_clusters:         (n: number, names: string) =>
    `The vault is organized into ${n} cluster${n !== 1 ? 's' : ''}: ${names}.`,
  brief_hi_conn_high:        'Notes are well connected within their topic areas.',
  brief_hi_conn_mid:         'Most notes are connected within their regional clusters. Cross-cluster connections are limited.',
  brief_hi_conn_low:         'Most notes have few connections. Adding links would improve navigability.',
  brief_hi_all_reach:        'All notes are reachable via at least one link.',
  brief_hi_orphans:          (n: number) => `${n} note${n > 1 ? 's are' : ' is'} not linked from any other note.`,
  brief_hi_coverage_high:    'Topic coverage is broad and well-balanced across clusters.',
  brief_hi_coverage_mid:     'Coverage is moderate — some clusters may benefit from additional notes.',
  brief_hi_coverage_low:     'One cluster dominates the collection. Consider developing the smaller topic areas.',
  brief_hi_overview:         (names: string) =>
    `Consider creating overview notes linking ${names} to improve cross-cluster navigation.`,

  brief_prompt_compare:      (a: string, b: string) => `Compare and contrast "${a}" and "${b}".`,
  brief_prompt_summarize:    (cluster: string) => `Summarize the key themes in ${cluster}.`,
  brief_prompt_overview:     (topic: string) => `Create a structured overview of "${topic}".`,
  brief_prompt_connections:  (a: string, b: string) => `What are the connections between ${a} and ${b}?`,
  brief_prompt_gaps:         'Identify the most important knowledge gaps in this collection.',
  brief_prompt_central:      'What topics are most central to this knowledge base?',
  brief_prompt_improve:      'Suggest how to improve the structure and connectivity of these notes.',
  brief_prompt_roadmap:      'Create a learning roadmap based on the topic clusters.',

  oq_orphan_notes:           (n: number) => `${n} note${n > 1 ? 's are' : ' is'} isolated from the main knowledge graph.`,
  oq_small_clusters:         (n: number) => `${n} cluster${n > 1 ? 's contain' : ' contains'} only a single note and may need more supporting material.`,
  oq_primary_cluster:        'Which topic cluster should be treated as the primary focus of this knowledge base?',
  oq_dominant_cluster:       (name: string) => `The "${name}" cluster contains over half of all notes. Consider breaking it into sub-topic groupings.`,
  oq_peer_isolated:          (n: number) => `${n} notes are only connected through hub or index notes, lacking direct peer connections.`,
  oq_sparse_clusters:        (names: string, plural: boolean) => `Cluster${plural ? 's' : ''} ${names} have few internal connections. Consider linking related notes within the cluster.`,
  oq_no_cross_links:         'No direct cross-cluster links exist between non-hub notes. Consider adding connections between related topics across clusters.',
  oq_under_documented:       (n: number) => `${n} frequently referenced concept${n > 1 ? 's have' : ' has'} limited documentation.`,
  oq_duplicate_candidates:   (n: number) => `${n} pair${n > 1 ? 's' : ''} of highly similar notes may be candidates for merging.`,

  brief_level_very_similar:  'Very Similar',
  brief_level_strong:        'Strong Candidate',
  brief_level_review:        'Review Candidate',
  brief_level_related:       'Potentially Related',
};
