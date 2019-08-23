const path = require('path');
// Contains the MongoDB schema of corpora
const corpusSchema = require(path.join(__dirname, '..\\resources\\corpus.js'));
// Contains the MongoDB schema of indices
const indicesSchema = require(path.join(__dirname, '..\\resources\\indices.js'));
// Contains the MongoDB schema of script
const scriptSchema = require(path.join(__dirname, '..\\resources\\script.js'));
// Modules to control application life and create native browser window
const electron = require('electron');
// Module to control application life (app)
// Module to create browser's windows (BrowserWindow)
// Module to modify the menu bar and (Menu)
// Module for interprocess communication (ipcMain)
const { app, BrowserWindow, Menu, ipcMain } = electron;
// Package to determine run mode
const isDev = require('electron-is-dev');
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
let Script = mongoose.model('script', scriptSchema);

const firstTime = settings.get("firstTime", true);

if (firstTime) {
  fs.readFile(path.join(__dirname, '..\\resources\\indices\\indices.json'), 'utf8', (err, jsonString) => {
    if (err) {
      console.log("File read failed:", err)
      return;
    }
    Indices.insertMany(JSON.parse(jsonString));
  })
}
// Keep a global reference of the window objects, if you don't, the windows will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let settingsWindow;

// createSettingsWindow = () => {
//   if (settingsWindow) return;

//   settingsWindow = new BrowserWindow({
//     title: "Settings",
//     resizable: false,
//     width: 600,
//     height: 460,
//     backgournd: "#f3f3f3",
//     webPreferences: {
//       nodeIntegration: true
//     }
//   });

//   // and load the html using the appropriate path
//   settingsWindow.loadURL(isDev ? 'http://localhost:3000/settings' : /*TODO ??????????????????????*/ `file://${path.join(__dirname, 'index.html')}`);
//   if (isDev) {
//     // Open the DevTools.
//     //BrowserWindow.addDevToolsExtension('<location to your react chrome extension>');
//     settingsWindow.webContents.openDevTools();
//   }
//   settingsWindow.on('closed', function () {
//     settingsWindow = null;
//   });

// };

createMainWindow = (paramObj) => {
  let menu = Menu.buildFromTemplate([
    {
      label: "File",
      submenu: [
        { type: "separator" },
        {
          label: "Settings",
          click() {
            mainWindow.webContents.send('open-settings');
          }
        },
        {
          label: "Toggle Dev Tools",
          click() {
            mainWindow.webContents.toggleDevTools();
          },
          accelerator: "CmdOrCtrl+Shift+I"
        },
        {
          type: "separator"
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
  mainWindow.loadURL(isDev ? 'http://localhost:3000/' : `file://${path.join(__dirname, '../build/index.html')}`);
  if (isDev) {
    // Open the DevTools.
    mainWindow.webContents.toggleDevTools();
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
ipcMain.on('add-results', (event, parameters) => {
  // Read data from certain json file
  fs.readFile(`temp\\results_${parameters.resultType}.json`, 'utf8', (err, jsonString) => {
    if (err) {
      console.log("File read failed:", err)
      return;
    }
    let data = JSON.parse(jsonString);

    // Save books metadata from data obj in order to use remaining fields as database fields
    const booksNum = data.filePaths.length
    const filePaths = data.filePaths;
    delete data.filePaths;
    // Update or insert database with new data
    const operations = filePaths.map((filePath, index) => {
      let indices = {};
      // Replace '.' with '_' in index names in order to avoid problem with
      // MongoDB indices retrieval
      Object.keys(data).forEach(key => {
        // Check for indices that store objects (readability, lexdiv, misc etc)
        if (data[key][index].length === undefined) {
          let indicesObject = {};
          Object.keys(data[key][index]).forEach(indexName => {
            indicesObject[indexName.replace(/[.]/g, '_')] = data[key][index][indexName];
          })
          data[key][index] = indicesObject;
        }
        indices[`indices.${key}`] = data[key][index];
      });

      return {
        updateOne:
        {
          filter: { path: filePath },
          upsert: true,
          update: {
            $set: indices
          }
        }
      }
    });
    Corpus.bulkWrite(operations, (error, res) => event.returnValue = res);
  });
});

/* Create a channel between main and rendered process
* for result search and return.
* Returns every user specified fields (null for missing fields)
*/
ipcMain.on('get-results', (event, parameters) => {
  let direction = parameters.order.asc ? 1 : -1;
  let projection = {
    name: 1,
    path: 1,
    "indices.tokensNum": 1,
    "indices.vocabularyNum": 1,
    _id: 0
  }
  Object.keys(parameters.indices).forEach(indexType =>
    (parameters.indices[indexType]).map(indexName => projection[`indices.${indexType}.${indexName.replace(/[.]/g, '_')}`] = [`$indices.${indexType}.${indexName.replace(/[.]/g, '_')}`])
  );
  Corpus.aggregate([
    {
      $match: {
        path: {
          $in: parameters.filePaths
        }
      }
    }, {
      $project: projection,
    },
    {
      $sort: {
        [parameters.order.by]: direction
      }
    }], (e, result) => {
      result.forEach(resultObj =>
        Object.keys(parameters.indices).forEach(indexType =>
          (parameters.indices[indexType]).forEach(indexName => resultObj['indices'][indexType][indexName.replace(/[.]/g, '_')] = resultObj['indices'][indexType][indexName.replace(/[.]/g, '_')][0])
        )
      )
      // Send returned data through main - renderer channel
      event.sender.send('receive-results', result)
    })
});

/* Create a channel between main and rendered process
* for tokens or vocabulary return.
* Returns an array of strings
*/
ipcMain.on('get-wordList', (event, parameters) => {
  let projection = {
    name: 1,
    [`indices.${parameters.wordListType}`]: 1,
    _id: 0
  };
  Corpus.aggregate([
    {
      $match: {
        path: parameters.filePath
      }
    }, {
      $project: projection,
    }], (e, result) => {
      // Send returned data through main - renderer channel
      event.returnValue = result;
    })
});

/* Create a channel between main and rendered process
* for book retrieval
*/
ipcMain.on('get-book', (event, parameters) => {
  let direction = parameters.order.asc ? 1 : -1;
  let projection = {
    name: 1,
    path: 1,
    size: 1,
    _id: 0
  }
  Corpus.aggregate([
    {
      $project: projection
    },
    {
      $sort: {
        [parameters.order.by]: direction
      }
    }], (e, result) => {
      // Send returned data through main - renderer channel
      event.sender.send('receive-book', result)
    })
});

/* Create a channel between main and rendered process
* for custom script insertion.
*/
ipcMain.on('add-script', (event, parameters) => {
  Script.updateOne({ name: parameters.name }, {
    name: parameters.name,
    env: parameters.env,
    path: parameters.path,
    args: parameters.args
  },
    {
      upsert: true
    },
    (error, res) => event.returnValue = res);
});

/* Create a channel between main and rendered process
* for custom script deletion.
*/
ipcMain.on('delete-script', (event, parameters) => {
  Script.deleteOne({ name: parameters.name }, err => {
    if (err) return handleError(err);
    event.returnValue = 'done';
  });
});

/* Create a channel between main and rendered process
* to fetch custom scripts.
*/
ipcMain.on('get-script', event => {
  Script.find({}, (error, result) => {
    // Send found indices through main - renderer channel
    event.sender.send('receive-script', result.map(obj => obj._doc));
  });
});

/* Create a channel between main and rendered process
* for book insertion.
*/
ipcMain.on('add-book', (event, parameters) => {
  const operations = parameters.filePaths.map((filePath, index) => {
    return {
      updateOne:
      {
        filter: { path: filePath },
        upsert: true,
        update: {
          name: parameters.fileNames[index],
          path: parameters.filePaths[index],
          size: parameters.size[index],
          lastModified: parameters.lastModified[index]
        }
      }
    }
  });
  Corpus.bulkWrite(operations, (error, res) => event.returnValue = res);
});
/* Create a channel between main and rendered process
* for book deletion.
*/
ipcMain.on('delete-book', (event, parameters) => {
  Corpus.deleteOne({ path: parameters.path }, err => {
    if (err) return handleError(err);
    event.returnValue = 'done';
  });
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
