import React, { Component } from 'react';
import logo from './logo.svg';
import './Main.css';
import FilesTab from './FilesTab'
import ScriptsTab from './ScriptsTab'
import ResultsTab from './ResultsTab'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import SideNav, { NavItem, NavIcon, NavText } from '@trendmicro/react-sidenav';;
import '@trendmicro/react-sidenav/dist/react-sidenav.css';
import "react-tabs/style/react-tabs.css";

class Main extends Component {
  /* State:
  * platform: information about the platform (for cross-platform use)
  * electron: electron instance, used to reach application's main window
  * isDev: the mode in which the application runs (production or development)
  * toExecute: object with the scripts that are to be executed
  * selectedFilePaths: array which stores the paths of input files
  */

  constructor(props) {
    super(props);
    this.state = {
      selectedFilesPaths: [],
      resultList: [],
      toExecute: {},
      settings: props.electron.remote.require('electron-settings'),
      tabIndex: 0,
      fs: window.require('fs'),
      ipc: props.electron.ipcRenderer
    };
    this.state.ipc.on('receive-books', (event, arg) => {
      this.setDistantState({ resultList: arg });
    });
  }

  /* R environment is initialized immediately after startup*
  */

  componentDidMount() {
    const scriptPath = (() => {
      switch (this.props.platform) {
        case "win32":
          return '.\\src\\initializeR.R';
        case "linux":
        default:
          return './src/initializeR.R';
      }
    })()
    this.executeScript(`${this.state.settings.get("rPath", "")}\\Rscript`, scriptPath, this.state.settings.get("rlibPath", "Rlibrary"));
  }


  // // /* addFilesDialog:
  // // * an electron dialog opens in order to select input files
  // // */

  // addFilesDialog = () => {
  //   const path = require('path');
  //   const dialog = this.props.electron.remote.dialog;
  //   dialog.showOpenDialog(this.props.electron.remote.getCurrentWindow(),
  //     {
  //       title: 'Add files to process',
  //       defaultPath: this.props.isDev ? "/home/panagiotis/Documents/gsoc2019-text-extraction/data" : `${path.join(__dirname, '../data')}`,
  //       properties: ['openFile', 'multiSelections']
  //     },
  //     (filePaths) => {
  //       let filenames = []
  //       if (filePaths !== undefined) {
  //         this.setState({ selectedFilesPaths: filePaths });
  //         filenames = filePaths.map((path) => {
  //           switch (this.props.platform) {
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

  setDistantState = (obj) => {
    this.setState(obj);
  }

  /* executeScript:
  * call an NLP script using the npm's child_process module
  */

  executeScript = (env, scriptPath, args = [], callback = undefined) => {
    if (env[0] === '\\') env = env.slice(1);
    let replaceIndex = args.indexOf("{filepaths}")
    if (replaceIndex !== -1) {
      let firstPart = args.slice(0, replaceIndex);
      let secondPart = args.slice(replaceIndex + 1);
      args = firstPart.concat(this.state.selectedFilesPaths).concat(secondPart);
    }
    const { spawn } = window.require('child_process');
    const process = spawn(env, [scriptPath].concat(args));

    // process.stderr.on('data', (data) => {
    //   console.log(`${data}`);
    // });

    process.stdout.on('data', (data) => {
      // will probably store to a database
      this.state.ipc.send('add-books');
    });

    process.on('exit', (code) => {
      console.log(`child process exited with code ${code}`);
      if (callback !== undefined) {
        callback();
      }
    });
  }

  setScriptParameters = (remove, type, env, scriptPath, args) => {
    let toExecute = this.state.toExecute;
    if (remove) delete toExecute[type];
    else {
      toExecute[type] = { env: env, scriptPath: scriptPath, args: args }
      this.setState({ toExecute: toExecute });
    }
  }

  executeAll = () => {
    let promises = [];
    const execButton = document.querySelector('#execute');
    execButton.disabled = true;

    const createAsync = execObj => {
      return new Promise((resolve, reject) => {
        this.executeScript(execObj.env, execObj.scriptPath, execObj.args, () => resolve());
      });
    };

    let addFreqAnalysis = true;
    Object.keys(this.state.toExecute).map((execKey) => {
      if(execKey === "misc") {
        const toExecute = this.state.toExecute;
        toExecute[execKey].args[2] = toExecute[execKey].args[2] + "tokens,vocabulary";
        this.setState({ toExecute: toExecute});
        addFreqAnalysis = false;
      }
      promises.push(createAsync(this.state.toExecute[execKey]));
    });
    if(addFreqAnalysis === true) {
      promises.push(createAsync({env: `${this.state.settings.get("rPath", "")}\\Rscript`,
      scriptPath: (() => {
        switch (this.state.platform) {
          case "win32":
            return "src\\Built-in\\misc\\misc_indices.R";
          case "linux":
          default:
            return "src/Built-in/misc/misc_indices.R";
        }
      })(),
      args: [`${this.state.settings.get("rlibPath")}`].concat(`-filePaths=${this.state.selectedFilesPaths.join(',')}`).concat(`-miscIndex=tokens,vocabulary`)
    }))
    }
    Promise.all(promises)
      .then(() => {
        this.state.ipc.send('get-books', this.state.selectedFilesPaths);
        execButton.disabled = false;
      });
  }

  changeTab = (tabIndex) => {
    this.setState({ tabIndex: Number(tabIndex) })
  }

  render() {
    return (
      <div className="App">
        <header>
          <h2>Welcome to Testing grounds!</h2>
        </header>
        <main>
          <div className="content">
            <SideNav>
              <SideNav.Toggle />
              <SideNav.Nav defaultSelected="0" onSelect={this.changeTab}>
                <NavItem eventKey="0">
                  <NavIcon>
                    <i className="fas fa-file-alt"></i>
                  </NavIcon>
                  <NavText>
                    Input
            </NavText>
                </NavItem>
                <NavItem eventKey="1" onSelect={this.changeTab}>
                  <NavIcon>
                    <i className="fas fa-tasks"></i>
                  </NavIcon>
                  <NavText>
                    Scripts
            </NavText>
                </NavItem>
                <NavItem eventKey="2" onSelect={this.changeTab}>
                  <NavIcon>
                    <i className="fas fa-signal"></i>
                  </NavIcon>
                  <NavText>
                    Results
            </NavText>
                </NavItem>
              </SideNav.Nav>
            </SideNav>
            <Tabs selectedIndex={this.state.tabIndex} forceRenderTabPanel={true} className="main-tabs" onSelect={tabIndex => this.setState({ tabIndex: tabIndex })}>
              <TabList className="collapsed">
                <Tab />
                <Tab />
                <Tab />
              </TabList>
              <TabPanel>
                <FilesTab
                  electron={this.props.electron}
                  platform={this.props.platform}
                  isDev={this.props.isDev}
                  setParentState={this.setDistantState}
                />
              </TabPanel>
              <TabPanel>
                <ScriptsTab
                  electron={this.props.electron}
                  platform={this.props.platform}
                  isDev={this.props.isDev}
                  setParentState={this.setDistantState}
                  selectedFilesPaths={this.state.selectedFilesPaths}
                  settings={this.state.settings}
                  setScriptParameters={this.setScriptParameters}
                />
              </TabPanel>
              <TabPanel>
                <ResultsTab
                  ipc={this.state.ipc}
                  resultList={this.state.resultList}
                  executeAll={this.executeAll}
                />
              </TabPanel>
            </Tabs>
          </div>
        </main>
      </div>
    );
  }
};

export default Main;