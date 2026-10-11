const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
  const win = new BrowserWindow({
    width: 600,
    height: 500,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile(path.join(__dirname, 'index.html'));
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.on('setup-complete', (event, data) => {
  console.log("Configurazione ricevuta da Electron:", data);
  // Qui possiamo scrivere i file di configurazione
  const targetDir = path.resolve(process.cwd(), data.targetDir || './omniroute-setup');
  fs.mkdirSync(targetDir, { recursive: true });
  fs.writeFileSync(path.join(targetDir, '.env'), `PORT=${data.port || 20128}\n`);
  
  if (data.useDocker) {
    fs.writeFileSync(path.join(targetDir, 'docker-compose.yml'), `version: '3.8'\nservices:\n  omniroute:\n    image: wyrmrest/omniroute:3.8.51\n    ports:\n      - "${data.port || 20128}:20128"\n`);
  }
});
