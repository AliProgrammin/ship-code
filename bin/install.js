#!/usr/bin/env node

import { copyFileSync, mkdirSync, readdirSync, existsSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { homedir } from 'os';
import { fileURLToPath } from 'url';
import { createInterface } from 'readline';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkgRoot = join(__dirname, '..');

const args = process.argv.slice(2);
const isGlobal = args.includes('--global');
const isUninstall = args.includes('--uninstall');
const installAll = args.includes('--all');
const installCodex = installAll || args.includes('--codex');
const installClaude = installAll || args.includes('--claude') || !installCodex;

async function ask(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    rl.question(question, answer => { rl.close(); resolve(answer.trim()); });
  });
}

function copyDir(src, dest) {
  mkdirSync(dest, { recursive: true });
  for (const entry of readdirSync(src)) {
    const from = join(src, entry);
    const to = join(dest, entry);
    if (statSync(from).isDirectory()) {
      copyDir(from, to);
    } else {
      copyFileSync(from, to);
    }
  }
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
  const codexDir = global
    ? join(process.env.CODEX_HOME || join(homedir(), '.codex'))
    : join(process.cwd(), '.codex');

  const commandsDest = join(claudeDir, 'commands', 'ship-code');
  const agentsDest   = join(claudeDir, 'agents');
  const codexSkillDest = join(codexDir, 'skills', 'ship-code');

  if (isUninstall) {
    const { rmSync } = await import('fs');
    let removed = false;
    if (installClaude && existsSync(commandsDest)) {
      rmSync(commandsDest, { recursive: true, force: true });
      console.log(`✅ Removed ${commandsDest}`);
      removed = true;
    }
    if (installCodex && existsSync(codexSkillDest)) {
      rmSync(codexSkillDest, { recursive: true, force: true });
      console.log(`✅ Removed ${codexSkillDest}`);
      removed = true;
    }
    if (!removed) {
      console.log('Nothing to uninstall.');
    }
    return;
  }

  const { rmSync, unlinkSync } = await import('fs');

  if (installClaude) {
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
  }

  if (installCodex) {
    const codexSkillSrc = join(pkgRoot, 'skills', 'ship-code');
    if (existsSync(codexSkillDest)) {
      rmSync(codexSkillDest, { recursive: true, force: true });
    }
    copyDir(codexSkillSrc, codexSkillDest);
  }

  console.log('');
  console.log(`✅ ship-code installed ${global ? 'globally' : 'for this project'}`);
  console.log('');
  if (installClaude) {
    const cmdSrc = join(pkgRoot, 'commands');
    console.log('Claude Code commands available:');
    for (const f of readdirSync(cmdSrc).filter(f => f.endsWith('.md')).sort()) {
      console.log(`  /ship-code:${f.replace('.md', '')}`);
    }
    console.log('');
    console.log('Restart Claude Code, then type /ship-code: to get started.');
  }
  if (installCodex) {
    console.log(`Codex skill installed: ${codexSkillDest}`);
    console.log('Restart Codex, then ask it to use $ship-code.');
  }
}

main().catch(err => { console.error(err.message); process.exit(1); });
