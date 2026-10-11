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

  console.log(`\nCreazione directory in: ${absTarget}`);
  fs.mkdirSync(absTarget, { recursive: true });
  fs.mkdirSync(path.join(absTarget, 'templates'), { recursive: true });

  const useDocker = (await ask("Vuoi usare Docker per eseguire OmniRoute? (s/N): ")).toLowerCase().startsWith('s');

  console.log(useDocker ? "\nModalità selezionata: Docker (Docker Compose)" : "\nModalità selezionata: Installazione Nativa (Node.js)");

  if (useDocker) {
    // Scriviamo docker-compose e Dockerfile ed .env
    const templateDir = path.join(__dirname, '../templates');
    // Generiamo i file di esempio
    fs.writeFileSync(path.join(absTarget, 'docker-compose.yml'), `# Docker Compose per OmniRoute
version: '3.8'
services:
  omniroute:
    image: wyrmrest/omniroute:3.8.51
    restart: unless-stopped
    ports:
      - "20128:20128"
    environment:
      - PORT=20128
      - OMNIROUTE_SERVER_HOST=0.0.0.0
`);
    fs.writeFileSync(path.join(absTarget, '.env'), `OMNIROUTE_VERSION=3.8.51\nPORT=20128\n`);
    console.log("\n[OK] Creati docker-compose.yml e .env nella cartella di installazione.");
    console.log(`\nPer avviare:\n  cd ${targetDir}\n  docker compose up -d`);
  } else {
    // Installazione nativa
    console.log("\nInstallazione dipendenze e configurazione nativa...");
    fs.writeFileSync(path.join(absTarget, '.env'), `PORT=20128\n`);
    try {
      execSync('npm install omniroute', { cwd: absTarget, stdio: 'inherit' });
      console.log("\n[OK] Pacchetto npm 'omniroute' installato con successo.");
      console.log(`\nPer avviare:\n  cd ${targetDir}\n  npx omniroute serve --port 20128`);
    } catch (e) {
      console.error("\n[ERRORE] Impossibile installare il pacchetto npm:", e.message);
    }
  }

  rl.close();
}

main();
