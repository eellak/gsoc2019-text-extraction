import React, { Component } from 'react';
import clsx from 'clsx';
import FilesTab from './FilesTab'
import ScriptsTab from './ScriptsTab'
import Console from './Console'
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

// Basic styles for this component
const drawerWidth = 180;
const consoleHeight = 200;

// Export for Console style prop
export { consoleHeight };

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
  },
  tabs: {
    width: '100%',
    margin: `${theme.spacing(1)}px 0 0 0`,
    height: `calc(100% - 64px - ${theme.spacing(1)}px)`
  },
  toolbar: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    position: "relative"
  },
  contentWidthDrawerClosed: {
    width: `calc(100vw - ${theme.spacing(6)}px - ${theme.spacing(7)}px - 1px)`
  },
  contentWidthDrawerOpen: {
    width: `calc(100vw - ${theme.spacing(6)}px - ${drawerWidth}px)`
  },
  main: {
    display: "flex",
    height: "100vh",
  },

  container: {
    maxHeight: `calc(100% - ${consoleHeight}px)`,
    height: 'fit-content'
  }
});

/* Main is the main application component, which is responsible for the render
* of everything the user can see on the main window and which stores
* and operates the majority of the tool's functionality
*/


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
      settings: props.electron.remote.require('electron-settings'),
      fs: window.require('fs'),
      ipc: props.electron.ipcRenderer,
      openDrawer: false,
      tabIndex: 0,
      processing: false,
      files: [],
      selectedFilesPaths: [],
      selectedResultRows: [],
      selectedIndices: {},
      selectedCustomScripts: [],
      toExecute: {},
      resultList: [],
      additionalResults: [],
      resultOrder: {
        columnId: 0,
        by: 'name',
        asc: true
      },
      fileOrder: {
        columnId: 0,
        by: 'name',
        asc: true
      },
      savedScripts: [],
      logMessage: () => { }
    };
    this.state.ipc.on('receive-results', (event, arg) => {
      this.setDistantState({ resultList: arg });
    });

    this.state.ipc.on('receive-indices', (event, arg) => {
      this.setDistantState({ indices: arg });
    });

    this.state.ipc.on('receive-book', (event, arg) => {
      this.setDistantState({ files: arg });
    });

    this.state.ipc.on('receive-script', (event, arg) => {
      this.setDistantState({ savedScripts: arg });
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
    this.executeScript(`${this.state.settings.get("rPath", "")}\\Rscript`, scriptPath, [this.state.settings.get("rlibPath", "Rlibrary")]);
    this.state.ipc.send('get-indices');
    this.state.ipc.send('get-book', { order: this.state.fileOrder });
    this.state.ipc.send('get-script');
  }

  /* executeScript:
  * call a script using the npm's child_process module
  */

  executeScript = (env, scriptPath, args = [], callback = undefined) => {
    if (env[0] === '\\') env = env.slice(1);

    // Copy args
    let newArgs = [...args];
    // Replace built in script argument with selected filepaths
    let replaceIndex = args.indexOf("-filePaths=")
    if (replaceIndex !== -1) {
      newArgs[replaceIndex] = newArgs[replaceIndex] + this.state.selectedFilesPaths.join(',');
    }
    // Replace custom script argument with selected filepaths
    replaceIndex = newArgs.indexOf("{filepaths}")
    if (replaceIndex !== -1) {
      newArgs[replaceIndex] = this.state.selectedFilesPaths;
    }
    const { spawn } = window.require('child_process');
    const process = spawn(env, [scriptPath].concat(newArgs));

    // process.stderr.on('data', (data) => {
    //   console.log(`${data}`);
    //   });

    // Send message to main process to add new book to database
    process.stdout.on('data', (data) => {
      console.log(`${data}`)
      this.state.ipc.send('add-results');
    });


    // Call callback on exit (to resolve promise)
    process.on('exit', (code) => {
      this.state.logMessage(`Finished execution of ${scriptPath} ${code === 0 ? 'successfully' : 'unsuccessfully'}`, 'info');
      console.log(`child process exited with code ${code}`);
      if (callback !== undefined) {
        callback();
      }
    });
  };

  /* executeAll:
  * execute every script that currently is in the state's
  * toExecute object and in addition, calculates tokens and types of selected
  * files. The execution is done by creating a promise that
  * calls executeScript function and thus, it is all done in an
  * asynchronous manner.
  */
  executeAll = () => {
    let promises = [];
    this.setState({ processing: true });
    const createAsync = execObj => {
      return new Promise((resolve, reject) => {
        this.state.logMessage(`Start execution of ${execObj.scriptPath}`, 'info');
        this.executeScript(execObj.env, execObj.scriptPath, execObj.args, () => resolve());
      });
    };

    this.state.selectedCustomScripts.map(scriptName => {
      // Maybe do a database call. Too silly
      const script = this.state.savedScripts.filter(scriptObj => scriptObj.name === scriptName)[0];
      promises.push(createAsync({
        env: script.env,
        scriptPath: script.path,
        args: script.args
      }))
    })

    let addFreqAnalysis = true;
    Object.keys(this.state.toExecute).map((execKey) => {
      if (execKey === "misc") {
        const toExecute = this.state.toExecute;
        toExecute[execKey].args[2] = toExecute[execKey].args[2] + ",tokens,vocabulary";
        this.setState({ toExecute: toExecute });
        addFreqAnalysis = false;
      }
      promises.push(createAsync(this.state.toExecute[execKey]));
    });

    // Make tokens and types calculation compulsory
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
        args: [`${this.state.settings.get("rlibPath")}`].concat(`-filePaths=${this.state.selectedFilesPaths.join(',')}`).concat(`-index=tokens,vocabulary`)
      }))
    }

    /* When every script has finished execution, fetch results and
    * enable button
    */
    Promise.all(promises)
      .then(() => {
        this.getResults(this.state.resultOrder);
        this.state.logMessage(`Get results`, 'info');
        this.setState({
          processing: false,
          resultOrder:
          {
            columnId: 0,
            by: 'name',
            asc: true
          }
        });
      });
  };

  getResults = (order, filePaths = this.state.selectedFilesPaths, indices = this.state.selectedIndices) => {
    this.state.ipc.send('get-results', {
      filePaths: filePaths,
      indices: indices,
      order: order
    });
  };

  // Change view tab according to user's selection
  changeTab = (tabIndex) => {
    this.setState({ tabIndex: Number(tabIndex) })
  };

  // Open/close side drawer
  handleDrawerToggle = () => {
    this.setState({ openDrawer: !this.state.openDrawer });
  };

  /* Method that is passed to children components in order
  * to change the state of this component
  */
  setDistantState = (obj) => {
    this.setState(obj);
  };

  /* Method that is passed to children in order to
  * add a new script to be executed
  */
  setScriptParameters = (remove, type, env, scriptPath, args) => {
    let toExecute = this.state.toExecute;
    if (remove) delete toExecute[type];
    else {
      toExecute[type] = { env: env, scriptPath: scriptPath, args: args }
      this.setState({ toExecute: toExecute });
    }
  };

  render() {
    const classes = this.props.classes;
    const theme = this.props.theme;

    return (
      <div>
        <AppBar
          position="fixed"
          className={clsx(classes.appBar)}
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
              color='primary'
              onClick={this.handleDrawerToggle}
              className={clsx({ [classes.hide]: !this.state.openDrawer })}
            >
              <i className="material-icons">chevron_left</i>
            </IconButton>
            <IconButton
              color='primary'
              onClick={this.handleDrawerToggle}
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
                  <ListItemText
                    primary={text}
                  />
                </ListItem>
                )
              })}
            </List>
          </Drawer>
          <div className={clsx(classes.content, { [classes.contentWidthDrawerClosed]: !this.state.openDrawer, [classes.contentWidthDrawerOpen]: this.state.openDrawer })}>
            <div className={classes.container}>
              <div className={classes.toolbar} />
              <div className={clsx(classes.tabs, classes.correctHeight)}>
                {this.state.tabIndex === 0 && <FilesTab
                  fs={this.state.fs}
                  ipc={this.state.ipc}
                  files={this.state.files}
                  order={this.state.fileOrder}
                  selectedFilesPaths={this.state.selectedFilesPaths}
                  electron={this.props.electron}
                  platform={this.props.platform}
                  isDev={this.props.isDev}
                  setDistantState={this.setDistantState}
                  logMessage={this.state.logMessage}
                />}
                {this.state.tabIndex === 1 && <ScriptsTab
                  fs={this.state.fs}
                  ipc={this.state.ipc}
                  electron={this.props.electron}
                  platform={this.props.platform}
                  isDev={this.props.isDev}
                  setDistantState={this.setDistantState}
                  selectedFilesPaths={this.state.selectedFilesPaths}
                  selectedCustomScripts={this.state.selectedCustomScripts}
                  indices={this.state.indices}
                  selectedIndices={this.state.selectedIndices}
                  settings={this.state.settings}
                  setScriptParameters={this.setScriptParameters}
                  logMessage={this.state.logMessage}
                  savedScripts={this.state.savedScripts}
                />}
                {this.state.tabIndex === 2 && <ResultsTab
                  getResults={this.getResults}
                  setDistantState={this.setDistantState}
                  selectedResultRows={this.state.selectedResultRows}
                  order={this.state.resultOrder}
                  processing={this.state.processing}
                  fs={this.state.fs}
                  additionalResults={this.state.additionalResults}
                  ipc={this.state.ipc}
                  electron={this.props.electron}
                  resultList={this.state.resultList}
                  executeAll={this.executeAll}
                  logMessage={this.state.logMessage}
                />}
              </div>
            </div>
            <Console
            consoleHeight={consoleHeight}
              setDistantState={this.setDistantState}
              logMessage={this.state.logMessage} />
          </div>
        </main>

      </div >
    );
  }
};

export default withStyles(styles, { withTheme: true })(Main);