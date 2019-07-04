// Contains the MongoDB schema of corpora
const corpusSchema = require('../public/corpus.js');
// Contains the MongoDB schema of indices
const indicesSchema = require('../public/indices.js');
// Modules to control application life and create native browser window
const electron = require('electron');
// Module to control application life (app)
// Module to create browser's windows (BrowserWindow)
// Module to modify the menu bar and (Menu)
// Module for interprocess communication (ipcMain)
const { app, BrowserWindow, Menu, ipcMain } = electron;
// Package to determine run mode
const isDev = require('electron-is-dev');
const path = require('path');
const settings = require('electron-settings');
// Package to connect to database
// Package to connect to database
const mongoose = require('mongoose');
const fs = require('fs');
mongoose.connect('mongodb://localhost:27017/text_extraction_db', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false
}, (error) => {
  if (error) console.log(error);
  else console.log("Connection successful");
});

let Corpus = mongoose.model('corpus', corpusSchema);
let Indices = mongoose.model('indices', indicesSchema);

// Keep a global reference of the window objects, if you don't, the windows will
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

  // and load the html using the appropriate path
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
    mainWindow.webContents.openDevTools();
  }

  // Store the window dimensions on resize to use them on the next execution of the tool
  mainWindow.on('resize', () => {
    let { width, height } = mainWindow.getBounds();
    settings.set('windowBounds', { width, height });
  });

  // Store the window position on move to use them on the next execution of the tool
  mainWindow.on('move', () => {
    let [x, y] = mainWindow.getPosition();
    settings.set('windowPosition', { x: x, y: y });
  });

  // Set window to null when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

/* Create a channel between main and rendered process
* for book insertion
*/
ipcMain.on('add-results', e => {
  // Read data from certain json file
  fs.readFile('results.json', 'utf8', (err, jsonString) => {
    if (err) {
      console.log("File read failed:", err)
      return;
    }
    const data = JSON.parse(jsonString);

    // Save books metadata from data obj in order to use remaining fields as database fields
    const booksNum = data.fileNames.length
    const filePaths = data.filePaths;
    delete data.filePaths;
    // const fileNames = data.fileNames;
    // delete data.fileNames;
    // Update or insert database with new data
    for (var i = 0; i < booksNum; i++) {
      let indices = {};
      Object.keys(data).forEach(key => {
        indices[`indices.${key}`] = data[key][i];
      });
      Corpus.findOneAndUpdate({ path: filePaths[i] }, {
        name: fileNames[i],
        path: filePaths[i],
        $set: indices
      }, { upsert: true }, () => {
      })
    }
  });
});

/* Create a channel between main and rendered process
* for result search and return.
* Returns user specified fields
*/
ipcMain.on('get-results', (event, parameters) => {
  let projection = {
    name: 1,
    "indices.tokensNum": 1,
    "indices.vocabularyNum": 1,
    _id: 0
  }
  Object.keys(parameters.indices).map(indexType => {
    return (parameters.indices[indexType]).map(indexName => projection[`indices.${indexType}.${indexName}`] = 1)
  });
  Corpus.aggregate([
    {
      $match: {
        path: {
          $in: parameters.filePaths
        }
      }
    }, {
      $project: projection
    }], (e, result) => {
      // Send returned data through main - renderer channel
      event.sender.send('receive-results', result)
    })
});

/* Create a channel between main and rendered process
* for book retrieval.
*/
ipcMain.on('get-book', (event, parameters) => {
  let projection = {
    name: 1,
    size: 1,
    _id: 0
  }
  Corpus.aggregate([
    {
      $project: projection
    }], (e, result) => {
      // Send returned data through main - renderer channel
      event.sender.send('receive-book', result)
    })
});

/* Create a channel between main and rendered process
* for book insertion.
*/
ipcMain.on('add-book', (event, parameters) => {
  console.log({
    name: parameters.fileName,
    path: parameters.filePath,
    size: parameters.size,
    lastModified: parameters.lastModified,
  })
  Corpus.findOneAndUpdate({ path: parameters.filePaths }, {
    name: parameters.fileName,
    path: parameters.filePath,
    size: parameters.size,
    lastModified: parameters.lastModified,
  }, { upsert: true }, () => {
  })
});

/* Create a channel between main and rendered process
* to fetch indices based on their type.
*/
ipcMain.on('get-indices', event => {
  Indices.find({}, (error, result) => {
    // Send found indices through main - renderer channel
    event.sender.send('receive-indices', result.map(obj => obj._doc));
  });
});

/* When the Electron has finished initializastion create main window with
* window position and dimensions as determined in last execution
*/
app.on('ready', () => {
  let { width, height } = settings.get('windowBounds', { width: 1024, height: 800 });
  let { x, y } = settings.get('windowPosition', { x: 40, y: 60 });
  const firstTime = settings.get("firstTime", true);
  if (firstTime) {
    fs.readFile('data\\indices\\indices.json', 'utf8', (err, jsonString) => {
      if (err) {
        console.log("File read failed:", err)
        return;
      }
      Indices.insertMany(JSON.parse(jsonString));
    })
  }
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
  if (settings.get("firstTime")) {
    settings.set("firstTime", false);
  }
  if (process.platform !== 'darwin') app.quit();
});


app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createMainWindow();
});
