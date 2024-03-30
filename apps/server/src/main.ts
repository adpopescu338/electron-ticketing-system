import { getSystemSettings } from './libs/storage';
import { app, BrowserWindow } from 'electron';
import { startExpressApp } from './express/startExpressApp';
import { QueueManagers } from './libs/Queue';
import { getClientDir } from './express/router';
import path from 'path';

function createWindow(PORT: number = 3001) {
  // Create the browser window
  const mainWindow = new BrowserWindow({
    webPreferences: {
      sandbox: false,
      preload: path.join(__dirname, 'preload.js'), // require `path` if you haven't already
    },
    autoHideMenuBar: true, // This will auto hide the menu bar
    icon: path.join(getClientDir(), 'q.png'),
  });

  mainWindow.maximize();

  // and load the app.
  // if on dev, load react dev server, so we can see the changes live
  // if on prod, load the build
  mainWindow.loadURL(`http://localhost:${process.env.NODE_ENV === 'development' ? 3000 : PORT}/`);

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
  const { PORT = 3001 } = getSystemSettings();
  const nextPortAvailable = await startExpressApp(PORT);
  createWindow(nextPortAvailable);

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
  await QueueManagers.shutdown();
  app.quit();
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
