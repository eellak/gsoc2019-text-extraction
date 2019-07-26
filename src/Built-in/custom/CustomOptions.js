import React, { Component } from 'react';
import './CustomOptions.css';
import clsx from 'clsx';
import { withStyles } from '@material-ui/styles';
import Typography from '@material-ui/core/Typography';
import { IconButton, Checkbox, ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails, TextField, Input, DialogActions, Button, Dialog, DialogTitle, DialogContent, FormControl, InputLabel, Select, MenuItem, InputBase } from '@material-ui/core';

const styles = theme => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
    'flex-direction': 'column'
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 200,
  },
  expansionPanel: {
    display: 'flex',
    flexWrap: 'wrap',
    'flex-direction': 'column'
  }
});

class CustomOptions extends Component {

  constructor(props) {
    super(props);
    this.state = {
      resultList: [],
      environments: [
        { displayName: "Rscript", path: `${props.settings.get("rPath", "")}\\Rscript` },
        { displayName: "python3", path: `${props.settings.get("python3Path", "")}\\python3` },
        { displayName: "python", path: `${props.settings.get("python", "")}\\python` }
      ],
      scriptPath: {},
      scriptId: 0,
      displayData: {},
      open: false,
      name: '',
      env: '',
      scriptPath: '',
      args: ''
    };
  }

  componentDidMount() {
    this.getScript();
  }

  checkAll = () => {
    const checkboxes = document.querySelectorAll(".read-index");
    const isChecked = document.querySelector("#check-all").checked;
    checkboxes.forEach((checkbox) => {
      checkbox.checked = isChecked;
    });
  }

  addScriptDialog = (e) => {
    const path = require('path');
    const dialog = this.props.electron.remote.dialog;
    dialog.showOpenDialog(this.props.electron.remote.getCurrentWindow(),
      {
        title: 'Select processing script',
        defaultPath: this.props.isDev ? "/home/panagiotis/Documents/gsoc2019-text-extraction/data" : `${path.join(__dirname, '../data')}`,
        properties: ['openFile']
      },
      (scriptPath) => {
        let scriptName = ""
        if (scriptPath !== undefined) {
          scriptPath = scriptPath[0];
          this.setState({ scriptPath: scriptPath });
          scriptName = (() => {
            switch (this.props.platform) {
              case "win32":
                return scriptPath.split('\\').slice(-1)[0];
              case "linux":
              default:
                return scriptPath.split('/').slice(-1)[0];
            }
          })();
        }
        scriptPath === undefined ? {} : document.querySelector(`#script-path`).value = scriptName;
      }
    );
  }

  // addScript = (e) => {
  //   let [env, , , args] = e.target.parentNode.children;
  //   const id = e.target.parentNode.getAttribute("id").split('-').slice(-1);
  //   if (document.querySelector(`#add-script-${id}`).innerText === "add") this.spawnCustomOption();
  //   this.props.setScriptParameters(false, `${this.props.type}${id}`, env.value, this.state.scriptPaths.id, args.value.split(' '));
  //   document.querySelector(`#add-script-${id}`).innerText = "update";
  //   document.querySelector(`#remove-script-${id}`).style.display = "inline"
  // }

  getScript = () => {
    this.props.ipc.send("get-script");
  };

  addScript = (e) => {
    const args = this.state.args === undefined ? '' : this.state.args;
    const newScript = {
      name: this.state.name,
      env: this.state.env,
      path: this.state.scriptPath,
      args: args,
    }
    this.props.ipc.sendSync('add-script', newScript);
    this.getScript();

    this.props.setDistantState({ selectedCustomScripts: [...this.props.selectedCustomScripts, this.state.name] });
    this.handleClose();
  }

  removeScript = (e) => {
    const id = e.target.parentNode.getAttribute("id").split('-').slice(-1);
    this.props.setScriptParameters(true, `${this.props.type}${id}`);
    let displayData = { ...this.state.displayData };
    delete displayData[id];
    this.setState({ displayData: displayData });
  }

  // spawnCustomOption = () => {
  //   const envSelect =
  //     <select defaultValue="Choose environment">
  //       {this.state.environments.map((envObj, i) =>
  //         <option key={i} value={envObj.path}>{envObj.displayName}</option>
  //       )}
  //     </select>
  //   const child = (
  //     <div key={this.state.scriptId} value={this.state.scriptId}>
  //       {envSelect}
  //       <Button size="small" variant="contained" onClick={this.addScriptDialog}>Select script</Button>
  //       <div id={`display-script-${String(this.state.scriptId)}`}></div>
  //       <input type="text" placeholder="Insert necessary arguments" />
  //       <Button size="small" variant="contained" id={`add-script-${String(this.state.scriptId)}`} onClick={this.addScript}>add</Button>
  //       <Button size="small" variant="contained" className="remove-script" id={`remove-script-${String(this.state.scriptId)}`} onClick={this.removeScript}>remove</Button>
  //     </div>);
  //   let displayData = this.state.displayData;
  //   displayData[String(this.state.scriptId)] = child;
  //   this.setState({ id: this.state.scriptId + 1, displayData: displayData });
  // }

  handleChange = (name, event) => {
    this.setState({ [name]: event.target.value });
  };

  handleClickOpen = () => {
    this.setState({ open: true });
  }

  handleClose = () => {
    this.setState({
      open: false,
      name: '',
      env: '',
      scriptPath: '',
      args: ''
    });
  };

  handleToggleAll = () => {
    if (this.props.selectedCustomScripts.length === this.props.savedScripts.length) {
      this.props.setDistantState({ selectedCustomScripts: [] });
    } else {
      this.props.setDistantState({ selectedCustomScripts: this.props.savedScripts.map(scriptObj => scriptObj.name) });
    }
  };

  handleToggle = (event, value) => {
    event.stopPropagation();
    const currentIndex = this.props.selectedCustomScripts.indexOf(value);
    const newChecked = [...this.props.selectedCustomScripts];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    this.props.setDistantState({ selectedCustomScripts: newChecked });
  };

  render() {
    console.log(this.props.selectedCustomScripts, this.props.savedScripts)
    const classes = this.props.classes;
    return (
      <div id="custom-scripts">
        <Typography variant="subtitle1" align="center">{"Select options (access selected filepaths in commandArgs using {filepaths})"}</Typography>
        <div>
          <Checkbox
            onClick={this.handleToggleAll}
            checked={this.props.selectedCustomScripts.length === this.props.savedScripts.length && this.props.selectedCustomScripts.length !== 0}
            indeterminate={this.props.selectedCustomScripts.length !== this.props.savedScripts.length && this.props.selectedCustomScripts.length !== 0} />
          <Typography display='inline'>Saved scripts</Typography>
        </div>
        {(() => {
          if (this.props.savedScripts.length !== 0) {
            return this.props.savedScripts.map((scriptObj, index) => (
              <div key={scriptObj.name}>
                <ExpansionPanel>
                  <ExpansionPanelSummary
                    expandIcon={<i className="material-icons">expand_more</i>}
                  >
                    <div>
                      <Checkbox onClick={(e) => this.handleToggle(e, scriptObj.name)} checked={this.props.selectedCustomScripts.indexOf(scriptObj.name) !== -1} />
                      <IconButton
                        onClick={(event) => {
                          event.stopPropagation();
                          // Send sync message in order to avoid sync errors when fetching books
                          this.props.ipc.sendSync('delete-script', {
                            name: scriptObj.name
                          })
                          this.getScript();
                          // if (this.props.isDev) {
                          //   this.props.logMessage(`Delete ${fileObj.path}`, 'info');
                          // }
                          let selectedCustomScripts = Object.assign([], this.props.selectedCustomScripts);
                          if (selectedCustomScripts.indexOf(scriptObj.name) !== -1) {
                            selectedCustomScripts.splice(selectedCustomScripts.indexOf(scriptObj.name), 1);
                          }
                          this.props.setDistantState({ selectedCustomScripts: selectedCustomScripts });
                        }}
                        className={classes.button}>
                        <i className="material-icons">delete</i>
                      </IconButton>
                      <Typography display='inline' className={classes.heading}>{scriptObj.name}</Typography>
                    </div>
                  </ExpansionPanelSummary>
                  <ExpansionPanelDetails className={classes.expansionPanel}>
                    <Typography>Environment: {scriptObj.env}</Typography>
                    <Typography>Script: {scriptObj.path}</Typography>
                    <Typography>Arguments: {scriptObj.args}</Typography>
                  </ExpansionPanelDetails>
                </ExpansionPanel>
              </div>
            ))
          }
        })()
        }
        <Button onClick={this.handleClickOpen}>New script</Button>
        <Dialog disableBackdropClick disableEscapeKeyDown open={this.state.open} onClose={this.handleClose}>
          <DialogTitle>Fill every field</DialogTitle>
          <DialogContent>
            <form className={classes.container}>
              <FormControl className={classes.formControl} error={this.props.savedScripts.map(scriptObj => scriptObj.name).indexOf(this.state.name) !== -1}>
                <TextField
                  id="script-name"
                  label="Name"
                  error={this.props.savedScripts.map(scriptObj => scriptObj.name).indexOf(this.state.name) !== -1}
                  className={classes.textField}
                  onChange={(event) => this.handleChange('name', event)}
                  margin="normal"
                />
              </FormControl>
              <FormControl className={classes.formControl}>
                <InputLabel htmlFor="script-environment">Environment</InputLabel>
                <Select
                  value={this.state.env}
                  onChange={(event) => this.handleChange('env', event)}
                  input={<Input id="script-environment" />}
                >
                  {this.state.environments.map((envObj, i) =>
                    <MenuItem key={i} value={envObj.path}>{envObj.displayName}</MenuItem >
                  )}
                </Select>
              </FormControl>
              <FormControl className={classes.formControl}>
                <Button onClick={this.addScriptDialog}>
                  <TextField
                    id="script-path"
                    label="Script Path"
                    className={classes.textField}
                    margin="normal"
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </Button>
              </FormControl>
              <FormControl className={classes.formControl}>
                <TextField
                  id="script-args"
                  label="Script Arguments"
                  className={classes.textField}
                  onChange={(event) => this.handleChange('args', event)}
                  margin="normal"
                />
              </FormControl>
            </form>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color="primary">
              Cancel
          </Button>
            <Button onClick={this.addScript} disabled={!(this.state.name && this.state.env && this.state.scriptPath && this.props.savedScripts.map(scriptObj => scriptObj.name).indexOf(this.state.name) === -1)} color="primary">
              Add
          </Button>
          </DialogActions>
        </Dialog>
        {/* {Object.values(this.state.displayData)} */}
      </div>);
  }
}

export default withStyles(styles)(CustomOptions);
