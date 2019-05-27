import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  constructor() {
    super();
    this.state = {
      platform: window.process.platform,
      electron: window.require('electron'),
      isDev: window.require('electron-is-dev'),
      selectedFilesPaths: [],
      resultList: []
    };
  }

  componentDidMount() {
    const { spawn } = window.require('child_process');
    const scriptSrc = () => {
      switch (this.state.platform) {
        case "win32":
          return '.\\src\\initializeR.R';
        case "linux":
        default:
          return './src/initializeR.R';
      }
    }
    const script = spawn('Rscript', [scriptSrc()]);

    // script.stderr.on('data', (data) => {
    //   console.log(`${data}`);
    // });

    script.stdout.on('data', (data) => {
      console.log(`${data}`);
    });


    script.on('exit', (code) => {
      console.log(`InitializeR process exited with code ${code}`);
    });
  }

  addFilesDialog = () => {
    const path = require('path');
    const dialog = this.state.electron.remote.dialog;
    dialog.showOpenDialog(this.state.electron.remote.getCurrentWindow(),
      {
        title: 'Add files to process',
        defaultPath: this.state.isDev ? "/home/panagiotis/Documents/gsoc2019-text-extraction/data" : `${path.join(__dirname, '../data')}`,
        properties: ['openFile', 'multiSelections']
      },
      (filePaths) => {
        let filenames = []
        if (filePaths !== undefined) {
          this.setState({ selectedFilesPaths: filePaths });
          filenames = filePaths.map((path) => {
            switch (this.state.platform) {
              case "win32":
                return path.split('\\').slice(-1)[0];
              case "linux":
              default:
                return path.split('/').slice(-1)[0];
            }
          });
        }
        filePaths === undefined ? {} : document.querySelector('#selected-files').innerHTML = 'You have selected ' + filenames.join(', ');
      }
    );
  }

  executeScript = () => {
    const execButton = document.querySelector('#execute');
    execButton.disabled = true;
    const { spawn } = window.require('child_process');
    const scriptSrc = () => {
      switch (this.state.platform) {
        case "win32":
          return '.\\src\\readability_indices.R';
        case "linux":
        default:
          return './src/readability_indices.R';
      }
    }

    const checkboxes = document.querySelectorAll(".read-index");
    let indices = [];
    checkboxes.forEach((checkbox) => {
      if (checkbox.checked) {
        indices.push(checkbox.value);
      }
    })


    const script = spawn('Rscript', [scriptSrc()].concat("-filePaths=" + this.state.selectedFilesPaths).concat("-index=" + indices.join(',')));
    // script.stderr.on('data', (data) => {
    //   console.log(`${data}`);
    // });

    script.stdout.on('data', (data) => {
      console.log(`${data}`);
      // this.setState(this.state.resultList.push(result))
      data = String(data);
      if (data.startsWith('{')) {
        try{
          this.state.resultList.push(JSON.parse(data));
        }
        catch(e) {
          if(e === SyntaxError) {
            const multipleDataList = data.split('\n');
            multipleDataList.forEach((json) => {
              this.state.resultList.push(JSON.parse(json));
            });
          }
        }
      }
    });


    script.on('exit', (code) => {
      console.log(this.state.resultList);
      console.log(`child process exited with code ${code}`);
      execButton.disabled = false;
      this.state.resultList = [];
    });
  }

  checkAll = () => {
    const checkboxes = document.querySelectorAll(".read-index");
    const isChecked = document.querySelector("#check-all").checked;
    checkboxes.forEach((checkbox) => {
      checkbox.checked = isChecked;
    });
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
        <div id="selected-files">
        </div>
        <div id="select-read-indices">
          <input type="checkbox" id="check-all" name="readability-index" value="all" onClick={this.checkAll} />All
          <input type="checkbox" className="read-index" name="readability-index" value="ARI" />ARI
          <input type="checkbox" className="read-index" name="readability-index" value="ARI.NRI" />(ARI NRI)
          <input type="checkbox" className="read-index" name="readability-index" value="ARI.simple" />(ARI simplified)
          <input type="checkbox" className="read-index" name="readability-index" value="Bormuth" />Bormuth
          <input type="checkbox" className="read-index" name="readability-index" value="Coleman" />Coleman
          <input type="checkbox" className="read-index" name="readability-index" value="Coleman.Liau" />Coleman.Liau
          <input type="checkbox" className="read-index" name="readability-index" value="Dale.Chall" />Dale.Chall
          <input type="checkbox" className="read-index" name="readability-index" value="Danielson.Bryan" />Danielson.Bryan
          <input type="checkbox" className="read-index" name="readability-index" value="Dickes.Steiwer" />Dickes.Steiwer
          <input type="checkbox" className="read-index" name="readability-index" value="DRP" />DRP
          <input type="checkbox" className="read-index" name="readability-index" value="ELF" />ELF
          <input type="checkbox" className="read-index" name="readability-index" value="Farr.Jenkins.Paterson" />Farr.Jenkins.Paterson
          <input type="checkbox" className="read-index" name="readability-index" value="Farr.Jenkins.Paterson.PSK" />Farr.Jenkins.Paterson PSK
          <input type="checkbox" className="read-index" name="readability-index" value="Flesch" />Flesch
          <input type="checkbox" className="read-index" name="readability-index" value="Flesch.PSK" />Flesch PSK
          <input type="checkbox" className="read-index" name="readability-index" value="Flesch.Kincaid" />Flesch.Kincaid
          <input type="checkbox" className="read-index" name="readability-index" value="FOG" />FOG
          <input type="checkbox" className="read-index" name="readability-index" value="FOG.PSK" />FOG PSK
          <input type="checkbox" className="read-index" name="readability-index" value="FOG.NRI" />FOG NRI
          <input type="checkbox" className="read-index" name="readability-index" value="FORCAST" />FORCAST
          <input type="checkbox" className="read-index" name="readability-index" value="FORCAST.RGL" />FORCAST Reading Grade Level
          <input type="checkbox" className="read-index" name="readability-index" value="Fucks" />Fucks
          <input type="checkbox" className="read-index" name="readability-index" value="Harris.Jacobson" />Harris.Jacobson
          <input type="checkbox" className="read-index" name="readability-index" value="Linsear.Write" />Linsear.Write
          <input type="checkbox" className="read-index" name="readability-index" value="LIX" />LIX
          {/* <input type="checkbox" className="read-index" name="readability-index" value="nWS" />nWS */}
          <input type="checkbox" className="read-index" name="readability-index" value="RIX" />RIX
          <input type="checkbox" className="read-index" name="readability-index" value="SMOG" />SMOG
          <input type="checkbox" className="read-index" name="readability-index" value="SMOG.C" />SMOG C
          <input type="checkbox" className="read-index" name="readability-index" value="SMOG.simple" />SMOG simplified
          <input type="checkbox" className="read-index" name="readability-index" value="Spache" />Spache
          <input type="checkbox" className="read-index" name="readability-index" value="Strain" />Strain
          <input type="checkbox" className="read-index" name="readability-index" value="Traenkle.Bailer" />Traenkle.Bailer
          <input type="checkbox" className="read-index" name="readability-index" value="TRI" />TRI
          <input type="checkbox" className="read-index" name="readability-index" value="Tuldava" />Tuldava
          <input type="checkbox" className="read-index" name="readability-index" value="Wheeler.Smith" />Wheeler.Smith
        </div>
        <button id="execute" onClick={this.executeScript}>
          Execute
        </button>
        <div id="results">
        </div>
      </div>
    );
  }
}

export default App;