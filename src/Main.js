import React, { Component } from 'react';
import logo from './logo.svg';
import './Main.css';
import ReadabilityOptions from './Built-in/readability/ReadabilityOptions'
import CustomOptions from './Built-in/custom/CustomOptions'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import SideNav, { Toggle, Nav, NavItem, NavIcon, NavText } from '@trendmicro/react-sidenav';;
import '@trendmicro/react-sidenav/dist/react-sidenav.css';
import "react-tabs/style/react-tabs.css";

class Main extends Component {
  /* State:
  * platform: information about the platform (for cross-platform use)
  * electron: electron instance, used to reach application's main window
  * isDev: the mode in which the application runs (production or development)
  * toExecute: object with the scripts that are to be executed
  * selectedFilePaths: array which stores the paths of input files
  * resultList: a global array to store the results of the nlp scripts
  */

  constructor(props) {
    super(props);
    this.state = {
      selectedFilesPaths: [],
      toExecute: {},
      resultList: [],
      settings: props.electron.remote.require('electron-settings'),
      tabIndex: 0
    };
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

  // /* addFilesDialog:
  // * an electron dialog opens in order to select input files
  // */

  addFilesDialog = () => {
    const path = require('path');
    const dialog = this.props.electron.remote.dialog;
    dialog.showOpenDialog(this.props.electron.remote.getCurrentWindow(),
      {
        title: 'Add files to process',
        defaultPath: this.props.isDev ? "/home/panagiotis/Documents/gsoc2019-text-extraction/data" : `${path.join(__dirname, '../data')}`,
        properties: ['openFile', 'multiSelections']
      },
      (filePaths) => {
        let filenames = []
        if (filePaths !== undefined) {
          this.setState({ selectedFilesPaths: filePaths });
          filenames = filePaths.map((path) => {
            switch (this.props.platform) {
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


  /* executeScript:
  * call an NLP script using the npm's child_process module
  */

  executeScript = (env, scriptPath, args = []) => {
    if (env[0] === '\\') env = env.slice(1);
    let replaceIndex = args.indexOf("{filepaths}")
    if (replaceIndex !== -1) {
      let firstPart = args.slice(0, replaceIndex);
      let secondPart = args.slice(replaceIndex + 1);
      args = firstPart.concat(this.state.selectedFilesPaths).concat(secondPart);
    }
    const execButton = document.querySelector('#execute');
    execButton.disabled = true;
    const { spawn } = window.require('child_process');
    const process = spawn(env, [scriptPath].concat(args));

    // process.stderr.on('data', (data) => {
    //   console.log(`${data}`);
    // });

    process.stdout.on('data', (data) => {
      // will probably read from a database
      console.log(`${data}`)
      // data = String(data);
      // if (data.startsWith('{')) {
      //   try{
      //     this.state.resultList.push(JSON.parse(data));
      //   }
      //   catch(e) {
      //     if(e === SyntaxError) {
      //       const multipleDataList = data.split('\n');
      //       multipleDataList.forEach((json) => {
      //         this.state.resultList.push(JSON.parse(json));
      //       });
      //     }
      //   }
      // }
    });

    process.on('exit', (code) => {
      // console.log(this.state.resultList);
      console.log(`child process exited with code ${code}`);
      // this.state.resultList = [];
      execButton.disabled = false;
    });
  }

  executeAll = () => {
    Object.values(this.state.toExecute).map((execObj) => {
      this.executeScript(execObj.env, execObj.scriptPath, execObj.args);
    })
  }

  setScriptParameters = (remove, type, env, scriptPath, args) => {
    let toExecute = this.state.toExecute;
    if (remove) delete toExecute[type];
    else {
      toExecute[type] = { env: env, scriptPath: scriptPath, args: args }
      this.setState({ toExecute: toExecute });
    }
  }
  changePanel = (tabIndex) => {
    this.setState({ tabIndex: Number(tabIndex) })
  }
  render() {
    // console.log(this.state.toExecute)
    const dummyTab = (() => {
      if (this.state.selectedFilesPaths.length !== 0) {
        const file = new File(["foo"], this.state.selectedFilesPaths[0]);
        return <div>Dummy method which pastes the path of the first selected file. {file.name}</div>;
      }
      else return <div>No file selected.</div>;
    })();

    const readabilityTab = (
      <div>
        <ReadabilityOptions filePaths={this.state.selectedFilesPaths} settings={this.state.settings} type="readability" setScriptParameters={this.setScriptParameters} platform={this.state.platform} />
      </div>);

    const customScriptTab = (
      <div>
        <CustomOptions platform={this.state.platform} settings={this.state.settings} electron={this.props.electron} isDev={this.state.isDev} type="custom" setScriptParameters={this.setScriptParameters} />
      </div>);

    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to Testing grounds!</h2>
        </div>
        <div className="content">
          <SideNav
            onSelect={(selected) => {
              // Add your code here
            }}
          >
            <SideNav.Toggle />
            <SideNav.Nav defaultSelected="1" onSelect={this.changePanel}>
              <NavItem eventKey="0">
                <NavIcon>
                  <i class="fas fa-file-alt"></i>
                </NavIcon>
                <NavText>
                  Input
            </NavText>
              </NavItem>
              <NavItem eventKey="1" onSelect={this.changePanel}>
                <NavIcon>
                  <i class="fas fa-tasks"></i>
                </NavIcon>
                <NavText>
                  Scripts
            </NavText>
              </NavItem>
              <NavItem eventKey="2" onSelect={this.changePanel}>
                <NavIcon>
                  <i class="fas fa-signal"></i>
                </NavIcon>
                <NavText>
                  Results
            </NavText>
              </NavItem>
            </SideNav.Nav>
          </SideNav>
          <Tabs selectedIndex={this.state.tabIndex} forceRenderTabPanel={true} onSelect={tabIndex => this.setState({ tabIndex: tabIndex })}>
            <TabPanel>
              <div>
                Select one or more files to be processed
          </div>
              <div id="add-files">
                <button id="add-files-btn" onClick={this.addFilesDialog}>
                  Add files
            </button>
                <div id="selected-files">
                </div>
                <div id=""></div>
              </div>
            </TabPanel>
            <TabPanel>
              <div>Select processing script</div>
              <Tabs id="script-select">
                <TabList>
                  <Tab>DummyScript</Tab>
                  <Tab>Readability</Tab>
                  <Tab>CustomScript</Tab>
                </TabList>
                <TabPanel>
                  {dummyTab}
                </TabPanel>
                <TabPanel forceRender={true}>
                  {readabilityTab}
                </TabPanel>
                <TabPanel forceRender={true}>
                  {customScriptTab}
                </TabPanel>
              </Tabs>
            </TabPanel>
            <TabPanel>
            <button id="execute" onClick={this.executeAll}>Execute</button>
          <div id="results" />
            </TabPanel>
          </Tabs>
        </div>
      </div>
    );
  }
}

export default Main;