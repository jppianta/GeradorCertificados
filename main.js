const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    width: 800,
    height: 600,
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'src/index.html'));

  const captureHandler = (evt, info) => {
    mainWindow.webContents.capturePage(info.rect).then(image => {
      const folderPath = path.join(__dirname, 'certificados');
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath);
      }
      const buff = image.toPNG();
      fs.writeFile(`${folderPath}/${info.name}.png`, buff, (err) => {
        if (err) {
          console.error(err);
        }
        evt.reply('capture-reply');
      })
    })
  }

  const saveImageHandler = (evt, info) => {
    const { name, canvas } = info;

    const folderPath = path.join(__dirname, 'certificados');
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath);
    }

    canvas.toBlob((blob) => {
      fs.writeFile(`${folderPath}/${name}.png`, blob, (err) => {
        if (err) {
          console.error(err);
        }
        evt.reply('save-image-reply');
      })
    })
  }

  ipcMain.removeAllListeners('capture');
  ipcMain.removeAllListeners('save-image');

  ipcMain.on('capture', captureHandler);
  ipcMain.on('save-image', saveImageHandler);

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
