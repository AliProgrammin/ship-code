#!/usr/bin/env node

import { copyFileSync, mkdirSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { homedir } from 'os';
import { fileURLToPath } from 'url';
import { createInterface } from 'readline';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkgRoot = join(__dirname, '..');

const args = process.argv.slice(2);
const isGlobal = args.includes('--global');
const isUninstall = args.includes('--uninstall');

async function ask(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    rl.question(question, answer => { rl.close(); resolve(answer.trim()); });
  });
}

async function main() {
  // Determine install location
  let global = isGlobal;

  if (!isGlobal && !args.includes('--local') && process.stdin.isTTY) {
    const answer = await ask('Install ship-code globally or for this project? [G/p]: ');
    global = answer.toLowerCase() !== 'p';
  }

  const claudeDir = global
    ? join(homedir(), '.claude')
    : join(process.cwd(), '.claude');

  const commandsDest = join(claudeDir, 'commands', 'ship-code');
  const agentsDest   = join(claudeDir, 'agents');

  if (isUninstall) {
    const { rmSync } = await import('fs');
    if (existsSync(commandsDest)) {
      rmSync(commandsDest, { recursive: true, force: true });
      console.log(`✅ Removed ${commandsDest}`);
    } else {
      console.log('Nothing to uninstall.');
    }
    return;
  }

  const { rmSync, unlinkSync } = await import('fs');

  // Clean old ship-code commands so stale files from earlier versions
  // (e.g. loop.md, run.md, plan.md, queue.md in v3) are removed on upgrade.
  if (existsSync(commandsDest)) {
    rmSync(commandsDest, { recursive: true, force: true });
  }

  // Clean old ship-* agents so renamed/removed agents don't linger.
  if (existsSync(agentsDest)) {
    for (const f of readdirSync(agentsDest)) {
      if (f.startsWith('ship-') && f.endsWith('.md')) {
        unlinkSync(join(agentsDest, f));
      }
    }
  }

  // Copy commands/
  const cmdSrc = join(pkgRoot, 'commands');
  mkdirSync(commandsDest, { recursive: true });
  for (const f of readdirSync(cmdSrc)) {
    if (f.endsWith('.md')) {
      copyFileSync(join(cmdSrc, f), join(commandsDest, f));
    }
  }

  // Copy agents/
  const agentSrc = join(pkgRoot, 'agents');
  mkdirSync(agentsDest, { recursive: true });
  for (const f of readdirSync(agentSrc)) {
    if (f.endsWith('.md')) {
      copyFileSync(join(agentSrc, f), join(agentsDest, f));
    }
  }

  console.log('');
  console.log(`✅ ship-code installed ${global ? 'globally' : 'for this project'}`);
  console.log('');
  console.log('Commands available:');
  for (const f of readdirSync(cmdSrc).filter(f => f.endsWith('.md')).sort()) {
    console.log(`  /ship-code:${f.replace('.md', '')}`);
  }
  console.log('');
  console.log('Restart Claude Code, then type /ship-code: to get started.');
}

main().catch(err => { console.error(err.message); process.exit(1); });
