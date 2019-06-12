const corpusSchema = require('../public/corpus.js');
// Modules to control application life and create native browser window
const electron = require('electron');
// Module to control application life
// Module to create native browser window.
const { app, BrowserWindow, Menu, ipcMain } = electron;
const isDev = require('electron-is-dev');
const path = require('path');
const settings = require('electron-settings');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/text_extraction_db', { useNewUrlParser: true }, (error) => {
  if (error) console.log(error);
  else console.log("Connection successful");
});

let Corpus = mongoose.model('corpus', corpusSchema);

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let settingsWindow;

createSettingsWindow = () => {
  if (settingsWindow) return;

  settingsWindow = new BrowserWindow({
    title: "Settings",
    resizable: false,
    width: 600,
    height: 460,
    backgournd: "#f3f3f3",
    webPreferences: {
      nodeIntegration: true
    }
  });

  // and load the index.html of the app.
  settingsWindow.loadURL(isDev ? 'http://localhost:3000/settings' : /*TODO ??????????????????????*/ `file://${path.join(__dirname, '../build/index.html')}`);
  if (isDev) {
    // Open the DevTools.
    //BrowserWindow.addDevToolsExtension('<location to your react chrome extension>');
    settingsWindow.webContents.openDevTools();
  }
  settingsWindow.on('closed', function () {
    settingsWindow = null;
  });

};

createMainWindow = (paramObj) => {
  let menu = Menu.buildFromTemplate([
    {
      label: "File",
      submenu: [
        { type: "separator" },
        {
          label: "Settings",
          click() {
            this.createSettingsWindow();
          }
        },
        {
          label: "Exit",
          role: "quit",
          accelerator: "CmdOrCtrl+Q"
        }
      ]
    }
  ])
  Menu.setApplicationMenu(menu);


  const { width, height, x, y } = paramObj;

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: width,
    height: height,
    x: x,
    y: y,
    webPreferences: {
      nodeIntegration: true
    }
  })

  // and load the index.html of the app.
  mainWindow.loadURL(isDev ? 'http://localhost:3000/main' : `file://${path.join(__dirname, '../build/index.html')}`);
  if (isDev) {
    // Open the DevTools.
    //BrowserWindow.addDevToolsExtension('<location to your react chrome extension>');
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('resize', () => {
    let { width, height } = mainWindow.getBounds();
    settings.set('windowBounds', { width, height });
  });

  mainWindow.on('move', () => {
    let [x, y] = mainWindow.getPosition();
    settings.set('windowPosition', { x: x, y: y });
  });
  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  })
}

ipcMain.on('add-book', (e, data) => {
  console.log(data);
  Corpus.create({
    name: data.documents[0], indices: {
      readability: data.readability
    }
  });
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  let { width, height } = settings.get('windowBounds', { width: 1024, height: 800 });
  let { x, y } = settings.get('windowPosition', { x: 40, y: 60 });
  createMainWindow({
    width: width,
    height: height,
    x: x,
    y: y
  });
});


// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit();
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createMainWindow();
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.