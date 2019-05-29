import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import ReadabilityOptions from './Built-in/readability/ReadabilityOptions'
import CustomOptions from './Built-in/custom/CustomOptions'

class App extends Component {
  /* State:
  * platform: information about the platform (for cross-platform use)
  * isDev: the mode in which the application runs (production or development)
  * electron: electron instance, used to reach application's main window
  * selectedFilePaths: array which stores the paths of input files
  */

  /* resultList: a global array to store the results of the nlp scripts
  */

  constructor() {
    super();
    this.state = {
      platform: window.process.platform,
      electron: window.require('electron'),
      isDev: window.require('electron-is-dev'),
      selectedFilesPaths: [],
      resultList: [],
      type: ""
    };
  }

  /* R environment is initialized immediately after startup*
  */

  // componentDidMount() {
  //   const { spawn } = window.require('child_process');
  //   const scriptSrc = () => {
  //     switch (this.state.platform) {
  //       case "win32":
  //         return '.\\src\\initializeR.R';
  //       case "linux":
  //       default:
  //         return './src/initializeR.R';
  //     }
  //   }
  //   const script = spawn('Rscript', [scriptSrc()]);

  //   // script.stderr.on('data', (data) => {
  //   //   console.log(`${data}`);
  //   // });

  //   // script.stdout.on('data', (data) => {
  //   //   console.log(`${data}`);
  //   // });

  //   script.on('exit', (code) => {
  //     console.log(`InitializeR process exited with code ${code}`);
  //   });
  // }

  // /* addFilesDialog:
  // * an electron dialog opens in order to select input files
  // */

  // addFilesDialog = () => {
  //   const path = require('path');
  //   const dialog = this.state.electron.remote.dialog;
  //   dialog.showOpenDialog(this.state.electron.remote.getCurrentWindow(),
  //     {
  //       title: 'Add files to process',
  //       defaultPath: this.state.isDev ? "/home/panagiotis/Documents/gsoc2019-text-extraction/data" : `${path.join(__dirname, '../data')}`,
  //       properties: ['openFile', 'multiSelections']
  //     },
  //     (filePaths) => {
  //       let filenames = []
  //       if (filePaths !== undefined) {
  //         this.setState({ selectedFilesPaths: filePaths });
  //         filenames = filePaths.map((path) => {
  //           switch (this.state.platform) {
  //             case "win32":
  //               return path.split('\\').slice(-1)[0];
  //             case "linux":
  //             default:
  //               return path.split('/').slice(-1)[0];
  //           }
  //         });
  //       }
  //       filePaths === undefined ? {} : document.querySelector('#selected-files').innerHTML = 'You have selected ' + filenames.join(', ');
  //     }
  //   );
  // }


  // /* executeScript:
  // * call an NLP script using the npm's child_process module
  // */
  // executeScript = () => {
  //   const execButton = document.querySelector('#execute');
  //   execButton.disabled = true;
  //   const { spawn } = window.require('child_process');
  //   const scriptSrc = () => {
  //     switch (this.state.platform) {
  //       case "win32":
  //         return '.\\src\\readability_indices.R';
  //       case "linux":
  //       default:
  //         return './src/readability_indices.R';
  //     }
  //   }

  //   const checkboxes = document.querySelectorAll(".read-index");
  //   let indices = [];
  //   checkboxes.forEach((checkbox) => {
  //     if (checkbox.checked) {
  //       indices.push(checkbox.value);
  //     }
  //   })


  //   const script = spawn('Rscript', [scriptSrc()].concat("-filePaths=" + this.state.selectedFilesPaths).concat("-index=" + indices.join(',')));
  //   // script.stderr.on('data', (data) => {
  //   //   console.log(`${data}`);
  //   // });

  //   script.stdout.on('data', (data) => {
  //     // this.setState(this.state.resultList.push(result))
  //     data = String(data);
  //     if (data.startsWith('{')) {
  //       try{
  //         this.state.resultList.push(JSON.parse(data));
  //       }
  //       catch(e) {
  //         if(e === SyntaxError) {
  //           const multipleDataList = data.split('\n');
  //           multipleDataList.forEach((json) => {
  //             this.state.resultList.push(JSON.parse(json));
  //           });
  //         }
  //       }
  //     }
  //   });

  //   script.on('exit', (code) => {
  //     console.log(this.state.resultList);
  //     console.log(`child process exited with code ${code}`);
  //     execButton.disabled = false;
  //     this.state.resultList = [];
  //   });
  // }

  setType = (e) => {
    const type = e.target.getAttribute("value");
    this.setState({ type: type });
  }

  render() {
    const renderType = (() => {
      switch (this.state.type) {
        case "dummy":
          return <p>Executing dummy copy-paste to data\results</p>;
        case "readability":
          return (
            <div>
            <p>Select one or more indices to extract</p>
            <ReadabilityOptions />
            </div>);
        case "custom":
          return (
            <div>
              <p>Select options</p>
              <CustomOptions />
            </div>);
        default:
          return <div />;
      }
    })();
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to Testing grounds!</h2>
        </div>
        <div className="content">
          <p>
            Select one or more files to be processed
          </p>
          <div id="add-files">
            <button id="add-files-btn" onClick={this.addFilesDialog}>
              Add files
            </button>
            <div id="selected-files">
            </div>
            <div id=""></div>
          </div>
          <div id="script-select">
            <p>Select processing script</p>
            <button onClick={this.setType} value="dummy" id="built-in-dummy">
              DummyScript
          </button>
            <button onClick={this.setType} value="readability" id="built-in-readability">
              Readability
          </button>
            <button onClick={this.setType} value="custom" id="built-in-readability">
              CustomScript
          </button>
          </div>
          <div id="configuration-tab">
            {renderType}
          </div>
          <div id="results">
          </div>
        </div>
      </div>
    );
  }
}

export default App;