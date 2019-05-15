import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  constructor() {
    super();
    this.state = {
      electron: window.require('electron'),
      isDev: window.require('electron-is-dev'),
      selectedFilesPaths: []
    };
  }

  addFilesDialog = () => {
    const path = require('path');
    const dialog = this.state.electron.remote.dialog;
    dialog.showOpenDialog({
      title: 'Add files to process',
      defaultPath: this.state.isDev ? "/home/panagiotis/Documents/gsoc2019-text-extraction/data" : `${path.join(__dirname, '../data')}`,
      properties: ['openFile', 'multiSelections']
    },
      (filePaths) => {
        this.setState({ selectedFilesPaths: filePaths });
        console.log(filePaths);
      }
    );
  }


  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to Testing grounds!</h2>
        </div>
        <p className="App-intro">
          Select one or more files
        </p>
        <button id="add-files" onClick={this.addFilesDialog}>
          Add files
        </button>
      </div>
    );
  }
}

export default App;
