/**
 * epcode jira <subcommand>
 *   sync <file.md> [--project PROJ] [--type Task]
 *   create-issue --project PROJ --type Task --summary "..."
 *   list [--project PROJ]
 */
import { join } from 'node:path';
import { runScript, parseArgs } from './_util.js';

export async function run(args, { REPO }) {
  const sub = args[0];
  const rest = args.slice(1);
  const dir = join(REPO, 'tools/integrations/jira');
  const map = {
    sync: 'sync-from-markdown.js',
    'create-issue': 'create-issue.js',
    list: 'list-issues.js',
  };
  const script = map[sub];
  if (!script) {
    console.error('用法: epcode jira <sync|create-issue|list> [...args]');
    return 2;
  }
  // sync 语法: epcode jira sync <file.md>  →  sync-from-markdown.js --file <file.md>
  if (sub === 'sync' && rest[0] && !rest[0].startsWith('--')) {
    rest.unshift('--file');
  }
  return runScript(join(dir, script), rest, REPO);
}
