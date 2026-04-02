import { spawn } from 'node:child_process';
import process from 'node:process';
import { runPrewarm } from './prewarm-production.mjs';

function quoteWindowsArg(value) {
  if (/^[a-z0-9._:/=-]+$/i.test(value)) {
    return value;
  }

  return `"${value.replace(/(["^])/g, '^$1')}"`;
}

function resolveCommand(command, args) {
  if (process.platform !== 'win32') {
    return { command, resolvedArgs: args };
  }

  const commandLine = [command, ...args].map(quoteWindowsArg).join(' ');
  return {
    command: process.env.ComSpec ?? 'cmd.exe',
    resolvedArgs: ['/d', '/s', '/c', commandLine],
  };
}

async function runCommand(command, args, label) {
  return new Promise((resolve, reject) => {
    const resolved = resolveCommand(command, args);
    let output = '';
    const child = spawn(resolved.command, resolved.resolvedArgs, {
      cwd: process.cwd(),
      env: process.env,
      stdio: ['inherit', 'pipe', 'pipe'],
    });

    child.stdout.on('data', (chunk) => {
      const text = chunk.toString();
      output += text;
      process.stdout.write(text);
    });

    child.stderr.on('data', (chunk) => {
      const text = chunk.toString();
      output += text;
      process.stderr.write(text);
    });

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve(output);
        return;
      }

      reject(new Error(`${label} failed with exit code ${code}`));
    });
  });
}

function extractWorkersDevUrls(output) {
  return [...new Set(
    [...output.matchAll(/https:\/\/[^\s]+\.workers\.dev/gi)].map((match) => match[0]),
  )];
}

async function main() {
  console.log('[deploy] building production bundle');
  await runCommand('npm', ['run', 'build'], 'build');

  console.log('[deploy] publishing with Wrangler');
  const deployOutput = await runCommand('npx', ['wrangler', 'deploy'], 'deploy');
  const workersDevUrls = extractWorkersDevUrls(deployOutput);

  if (workersDevUrls.length > 0) {
    console.log(`[deploy] discovered workers.dev URLs: ${workersDevUrls.join(', ')}`);
  }

  const waitMs = Number(process.env.PREWARM_DEPLOY_WAIT_MS ?? '3000');
  if (Number.isFinite(waitMs) && waitMs > 0) {
    console.log(`[deploy] waiting ${waitMs}ms for route propagation`);
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  await runPrewarm({ additionalBaseUrls: workersDevUrls });
}

main().catch((error) => {
  console.error('[deploy] failed');
  console.error(error);
  process.exitCode = 1;
});
