#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const readline = require('readline');
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

  const targetDir = await ask("Directory di installazione target [./omniroute-setup]: ") || "./omniroute-setup";
  const absTarget = path.resolve(process.cwd(), targetDir);

  // Pre-flight: Check Port
  try {
    execSync(`lsof -i :${data.port || 20128}`);
    console.warn(`[WARN] La porta ${data.port || 20128} sembra già in uso.`);
  } catch (e) {
    // Porta libera
  }

  // Pre-flight: Check Docker
  const useDocker = (await ask("Vuoi usare Docker per eseguire OmniRoute? (s/N): ")).toLowerCase().startsWith('s');
  if (useDocker) {
    try {
      execSync('docker --version', { stdio: 'ignore' });
    } catch (e) {
      console.error("[ERRORE] Docker non trovato. Installalo o scegli la modalità Nativa.");
      process.exit(1);
    }
  }

  console.log(`\nCreazione directory in: ${absTarget}`);
  fs.mkdirSync(absTarget, { recursive: true });
  fs.mkdirSync(path.join(absTarget, 'templates'), { recursive: true });

  const useDocker = (await ask("Vuoi usare Docker per eseguire OmniRoute? (s/N): ")).toLowerCase().startsWith('s');

  function writeFileSafe(filePath, content) {
    if (fs.existsSync(filePath)) {
      console.log(`[SKIP] File esistente, non sovrascritto: ${path.relative(process.cwd(), filePath)}`);
      return;
    }
    fs.writeFileSync(filePath, content);
    console.log(`[OK] Creato: ${path.relative(process.cwd(), filePath)}`);
  }

  console.log(useDocker ? "\nModalità selezionata: Docker" : "\nModalità selezionata: Nativa");

  if (useDocker) {
    writeFileSafe(path.join(absTarget, 'docker-compose.yml'), `version: '3.8'\nservices:\n  omniroute:\n    image: wyrmrest/omniroute:3.8.51\n    ports:\n      - "${data.port || 20128}:20128"\n    volumes:\n      - ./config.json:/home/node/.omniroute/config.json:ro\n`);
    writeFileSafe(path.join(absTarget, '.env'), `OMNIROUTE_VERSION=3.8.51\nPORT=${data.port || 20128}\n`);
    writeFileSafe(path.join(absTarget, 'config.json'), fs.readFileSync(path.join(__dirname, '../templates/config.json'), 'utf8'));
    console.log(`\nPer avviare:\n  cd ${targetDir}\n  docker compose up -d`);
  } else {
    writeFileSafe(path.join(absTarget, '.env'), `PORT=${data.port || 20128}\n`);
    writeFileSafe(path.join(absTarget, 'config.json'), fs.readFileSync(path.join(__dirname, '../templates/config.json'), 'utf8'));
    try {
      execSync('npm install omniroute', { cwd: absTarget, stdio: 'inherit' });
      console.log(`\nPer avviare:\n  cd ${targetDir}\n  npx omniroute serve --port ${data.port || 20128}`);
    } catch (e) {
      console.error("\n[ERRORE] Impossibile installare omniroute:", e.message);
    }
  }

  rl.close();
}

main();
