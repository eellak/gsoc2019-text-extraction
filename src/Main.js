import React, { Component } from 'react';
import clsx from 'clsx';
import FilesTab from './FilesTab'
import ScriptsTab from './ScriptsTab'
import ResultsTab from './ResultsTab'
import { withStyles } from '@material-ui/styles';
import AppBar from "@material-ui/core/AppBar";
import Drawer from "@material-ui/core/Drawer";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemIcon from "@material-ui/core/ListItemIcon";

const drawerWidth = 240;

const styles = theme => ({
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },
  hide: {
    display: 'none',
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
  drawerOpen: {
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerClose: {
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: theme.spacing(7) + 1,
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(9) + 1,
    },
  },
  tabs: {
    width: '100%',
    margin: '15px 0 15px 0'
  },
  toolbar: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  main: {
    display: "flex",
    margin: "0 0 0 10px"
  }
});

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
      openDrawer: false,
      readIndex: [],
      lexdivIndex: [],
      miscIndex: [],
      selectedFilesPaths: [],
      resultList: [],
      toExecute: {},
      settings: props.electron.remote.require('electron-settings'),
      tabIndex: 0,
      fs: window.require('fs'),
      ipc: props.electron.ipcRenderer,
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
  };

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
  };

  setScriptParameters = (remove, type, env, scriptPath, args) => {
    let toExecute = this.state.toExecute;
    if (remove) delete toExecute[type];
    else {
      toExecute[type] = { env: env, scriptPath: scriptPath, args: args }
      this.setState({ toExecute: toExecute });
    }
  };

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
      if (execKey === "misc") {
        const toExecute = this.state.toExecute;
        toExecute[execKey].args[2] = toExecute[execKey].args[2] + "tokens,vocabulary";
        this.setState({ toExecute: toExecute });
        addFreqAnalysis = false;
      }
      promises.push(createAsync(this.state.toExecute[execKey]));
    });
    if (addFreqAnalysis === true) {
      promises.push(createAsync({
        env: `${this.state.settings.get("rPath", "")}\\Rscript`,
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
  };

  changeTab = (tabIndex) => {
    this.setState({ tabIndex: Number(tabIndex) })
  };

  handleDrawerOpen = () => {
    this.setState({ openDrawer: true });
  };

  handleDrawerClose = () => {
    this.setState({ openDrawer: false });
  };

  render() {
    const classes = this.props.classes;
    const theme = this.props.theme;
    return (
      <div>
        <AppBar
          position="fixed"
          className={clsx(classes.appBar, {
            [classes.appBarShift]: open,
          })}
        >
          <Toolbar>
            <Typography variant="h6" noWrap>
              Testing grounds!
          </Typography>
          </Toolbar>
        </AppBar>
        <main className={clsx(classes.main)}>
          <Drawer
            variant="permanent"
            className={clsx(classes.drawer, {
              [classes.drawerOpen]: this.state.openDrawer,
              [classes.drawerClose]: !this.state.openDrawer,
            })}
            classes={{
              paper: clsx({
                [classes.drawerOpen]: this.state.openDrawer,
                [classes.drawerClose]: !this.state.openDrawer,
              }),
            }}
            open={this.state.openDrawer}
          >
            <div className={classes.toolbar} />
            <IconButton
              onClick={this.handleDrawerClose}
              className={clsx({ [classes.hide]: !this.state.openDrawer })}
            >
              <i className="material-icons">chevron_left</i>
            </IconButton>
            <IconButton onClick={this.handleDrawerOpen}
              className={clsx({ [classes.hide]: this.state.openDrawer })}
            >
              <i className="material-icons">chevron_right</i>
            </IconButton>
            <List>
              {['Input', 'Scripts', 'Results'].map((text, index) => {
                const iconstList = [
                  <i className="material-icons">add_box</i>,
                  <i className="material-icons">insert_drive_file</i>,
                  <i className="material-icons">signal_cellular_4_bar</i>];

                return (<ListItem
                  button
                  key={text}
                  selected={this.state.tabIndex === index}
                  onClick={() => this.changeTab(index)}
                >
                  <ListItemIcon>
                    {iconstList[index]}
                  </ListItemIcon>
                  <ListItemText primary={text} />
                </ListItem>
                )
              })}
            </List>
          </Drawer>
          <div className={clsx(classes.content)}>
            <div className={classes.toolbar} />
            <div className={clsx(classes.tabs)}>
              {this.state.tabIndex === 0 && <FilesTab
                selectedFilesPaths={this.state.selectedFilesPaths}
                electron={this.props.electron}
                platform={this.props.platform}
                isDev={this.props.isDev}
                setDistantState={this.setDistantState}
              />}
              {this.state.tabIndex === 1 && <ScriptsTab
                readIndex={this.state.readIndex}
                lexdivIndex={this.state.lexdivIndex}
                miscIndex={this.state.miscIndex}
                electron={this.props.electron}
                platform={this.props.platform}
                isDev={this.props.isDev}
                setDistantState={this.setDistantState}
                selectedFilesPaths={this.state.selectedFilesPaths}
                settings={this.state.settings}
                setScriptParameters={this.setScriptParameters}
              />}
              {this.state.tabIndex === 2 && <ResultsTab
                ipc={this.state.ipc}
                resultList={this.state.resultList}
                executeAll={this.executeAll}
              />}
            </div>
          </div>
        </main>
      </div >
    );
  }
};

export default withStyles(styles, { withTheme: true })(Main);