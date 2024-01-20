import { app, BrowserWindow, ipcMain } from 'electron';
import { startExpressApp } from './express/startExpressApp';
import { IPCEventNames } from './libs/constants';
import { QueueManager } from './libs/Queue';

const PORT = 3001;

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    height: 600,
    webPreferences: {
      sandbox: false,
    },
    width: 800,
    fullscreen: true,
  });

  // and load the app.
  mainWindow.loadURL(`http://localhost:${PORT}`);

  // // Open the DevTools.
  // mainWindow.webContents.openDevTools();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  await startExpressApp(PORT);
  createWindow();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  ipcMain.on('update' satisfies IPCEventNames, (_event, arg) => {
    console.log('update', {
      arg,
      _event,
    });
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', async () => {
  await QueueManager.shutdown();
  app.quit();
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
