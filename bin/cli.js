#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const os = require('os');
const { execSync } = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const ask = (query) => new Promise((resolve) => rl.question(query, resolve));

async function main() {
  console.log("==========================================");
  console.log("         OmniRoute Installer & Setup      ");
  console.log("==========================================");

  let detectedTarget = null;
  try {
    const globalRoot = execSync('npm root -g', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
    const candidate = path.join(globalRoot, 'omniroute');
    if (fs.existsSync(candidate)) detectedTarget = candidate;
  } catch (e) {}

  let defaultTarget = detectedTarget || path.join(os.homedir(), '.omniroute');
  if (!detectedTarget && process.platform === 'win32' && process.env.APPDATA) {
    defaultTarget = path.join(process.env.APPDATA, 'omniroute');
  }

  const targetDir = await ask(`Directory di installazione target [${defaultTarget}]: `) || defaultTarget;
  const absTarget = path.resolve(process.cwd(), targetDir);

  const exists = fs.existsSync(absTarget);
  if (!exists) {
    const proceed = (await ask(`Directory ${absTarget} non trovata. Vuoi crearla e procedere con un nuovo setup Wyvern? (s/N): `)).toLowerCase().startsWith('s');
    if (!proceed) {
      console.log("Installazione annullata.");
      process.exit(0);
    }
  } else {
    console.log(`Installazione esistente trovata in ${absTarget}. Procedo con l'ottimizzazione Wyvern (compressione e caching)...`);
  }

  const port = 20128; // Default port
  try {
    execSync(`lsof -i :${port}`);
    console.warn(`[WARN] La porta ${port} sembra già in uso.`);
  } catch (e) {}

  const useDocker = (await ask("Vuoi usare Docker per eseguire OmniRoute? (s/N): ")).toLowerCase().startsWith('s');
  
  if (useDocker) {
    try {
      execSync('docker --version', { stdio: 'ignore' });
    } catch (e) {
      console.error("[ERRORE] Docker non trovato.");
      process.exit(1);
    }
  }

  fs.mkdirSync(absTarget, { recursive: true });
  fs.mkdirSync(path.join(absTarget, 'templates'), { recursive: true });

  function writeFileSafe(filePath, content) {
    if (fs.existsSync(filePath)) {
      console.log(`[SKIP] File esistente: ${path.relative(process.cwd(), filePath)}`);
      return;
    }
    fs.writeFileSync(filePath, content);
    console.log(`[OK] Creato: ${path.relative(process.cwd(), filePath)}`);
  }

  if (useDocker) {
    writeFileSafe(path.join(absTarget, 'docker-compose.yml'), `version: '3.8'\nservices:\n  omniroute:\n    image: wyrmrest/omniroute:3.8.51\n    restart: unless-stopped\n    ports:\n      - "${port}:20128"\n    volumes:\n      - ./config.json:/home/node/.omniroute/config.json:ro\n`);
    writeFileSafe(path.join(absTarget, '.env'), `OMNIROUTE_VERSION=3.8.51\nPORT=${port}\n`);
    writeFileSafe(path.join(absTarget, 'config.json'), fs.readFileSync(path.join(__dirname, '../templates/config.json'), 'utf8'));
    console.log(`\nPer avviare:\n  cd ${absTarget}\n  docker compose up -d`);
  } else {
    try { execSync('npm --version', { stdio: 'ignore' }); } catch (e) {
      console.error("[ERRORE] npm non trovato.");
      process.exit(1);
    }
    writeFileSafe(path.join(absTarget, '.env'), `PORT=${port}\n`);
    writeFileSafe(path.join(absTarget, 'config.json'), fs.readFileSync(path.join(__dirname, '../templates/config.json'), 'utf8'));
    if (exists) {
      console.log("\n[SKIP] OmniRoute già installato: nessuna reinstallazione necessaria.");
      console.log(`\nPer avviare:\n  omniroute serve --port ${port}`);
    } else {
      try {
        execSync('npm install omniroute --legacy-peer-deps', { cwd: absTarget, stdio: 'inherit' });
        console.log(`\nPer avviare:\n  cd ${absTarget}\n  npx omniroute serve --port ${port}`);
      } catch (e) { console.error("\n[ERRORE] Impossibile installare omniroute:", e.message); }
    }
  }
  rl.close();
}
main();
