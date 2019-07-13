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

// Basic styles for this component
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
      selectedIndices: {},
      toExecute: {},
      resultList: [],
      resultOrder: {
        columnId: 0,
        by: 'name',
        asc: true
      }
    };
    this.state.ipc.on('receive-results', (event, arg) => {
      console.log(arg)
      this.setDistantState({ resultList: arg });
    });

    this.state.ipc.on('receive-indices', (event, arg) => {
      this.setDistantState({ indices: arg });
    });

    this.state.ipc.on('receive-book', (event, arg) => {
      this.setDistantState({ files: arg });
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
    this.state.ipc.send('get-indices');
  }

  /* executeScript:
  * call a script using the npm's child_process module
  */

  executeScript = (env, scriptPath, args = [], callback = undefined) => {
    if (env[0] === '\\') env = env.slice(1);

    // Replace custom script argument with selected filepaths
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

    // Send message to main process to add new book to database
    process.stdout.on('data', (data) => {
      this.state.ipc.send('add-results');
    });


    // Call callback on exit (to resolve promise)
    process.on('exit', (code) => {
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
    const execButton = document.querySelector('#execute');
    execButton.disabled = true;
    this.setState({ processing: true });

    const createAsync = execObj => {
      return new Promise((resolve, reject) => {
        this.executeScript(execObj.env, execObj.scriptPath, execObj.args, () => resolve());
      });
    };

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
        execButton.disabled = false;
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

  getResults = (order, filePaths = this.state.selectedFilesPaths, indices=this.state.selectedIndices) => {
    console.log(order);
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
              onClick={this.handleDrawerToggle}
              className={clsx({ [classes.hide]: !this.state.openDrawer })}
            >
              <i className="material-icons">chevron_left</i>
            </IconButton>
            <IconButton onClick={this.handleDrawerToggle}
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
                fs={this.state.fs}
                ipc={this.state.ipc}
                files={this.state.files}
                selectedFilesPaths={this.state.selectedFilesPaths}
                electron={this.props.electron}
                platform={this.props.platform}
                isDev={this.props.isDev}
                setDistantState={this.setDistantState}
              />}
              {this.state.tabIndex === 1 && <ScriptsTab
                fs={this.state.fs}
                ipc={this.state.ipc}
                electron={this.props.electron}
                platform={this.props.platform}
                isDev={this.props.isDev}
                setDistantState={this.setDistantState}
                selectedFilesPaths={this.state.selectedFilesPaths}
                indices={this.state.indices}
                selectedIndices={this.state.selectedIndices}
                settings={this.state.settings}
                setScriptParameters={this.setScriptParameters}
              />}
              {this.state.tabIndex === 2 && <ResultsTab
                getResults={this.getResults}
                setDistantState={this.setDistantState}
                order={this.state.resultOrder}
                processing={this.state.processing}
                fs={this.state.fs}
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