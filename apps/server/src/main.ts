import { config } from 'dotenv';
config();
import { getSystemSettings } from './libs/storage';
import { app, BrowserWindow } from 'electron';
import { startExpressApp } from './express/startExpressApp';
import { QueueManager } from './libs/Queue';

const { PORT = 3001 } = getSystemSettings();

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    webPreferences: {
      sandbox: false,
      preload: `${__dirname}/preload.js`,
    },
    autoHideMenuBar: true, // This will auto hide the menu bar
    icon: `${__dirname}/../client/build/q.png`,
  });

  mainWindow.maximize();

  // and load the app.
  mainWindow.loadURL(`http://localhost:${PORT}`);

  // Listen for new window creation
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    // If the URL of the new window is the specific one, create and maximize it
    if (url.includes('/display')) {
      return {
        action: 'allow' as const,
        overrideBrowserWindowOptions: {
          fullscreen: true,
          autoHideMenuBar: true, // This will auto hide the menu bar
        },
        outlivesOpener: true,
      };
    }

    return { action: 'allow' as const }; // Allow the new window with default behavior otherwise
  });
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
