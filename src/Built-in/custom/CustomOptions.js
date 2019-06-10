import React, { Component } from 'react';
import './CustomOptions.css';

class CustomOptions extends Component {

  constructor(props) {
    super(props);
    this.state = {
      resultList: [],
      environments: [
        { displayName: "Rscript", path: `${props.settings.get("rPath", "")}\\Rscript`},
        { displayName: "python3", path: `${props.settings.get("python3Path", "")}\\python3`},
        { displayName: "python", path: `${props.settings.get("python", "")}\\python`}
      ],
      scriptPaths: {},
      id: 0,
      displayData: {}
    };
  }

  componentDidMount() {
    this.spawnCustomOption();
  }

  checkAll = () => {
    const checkboxes = document.querySelectorAll(".read-index");
    const isChecked = document.querySelector("#check-all").checked;
    checkboxes.forEach((checkbox) => {
      checkbox.checked = isChecked;
    });
  }

  addScriptDialog = (e) => {
    const button = e.target;
    const id = button.parentNode.getAttribute("id").split('-').slice(-1);
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
          let scriptPaths = this.state.scriptPaths;
          scriptPaths.id = scriptPath;
          this.setState({ scriptPaths: scriptPaths });
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
        scriptPath === undefined ? {} : document.querySelector(`#display-script-${id}`).innerHTML = scriptName;
      }
    );
  }

  addScript = (e) => {
    let [env, , , args] = e.target.parentNode.children;
    const id = e.target.parentNode.getAttribute("id").split('-').slice(-1);
    if(document.querySelector(`#add-script-${id}`).innerText === "add") this.spawnCustomOption();
    this.props.setScriptParameters(false, `${this.props.type}${id}`, env.value, this.state.scriptPaths.id, args.value.split(' '));
    document.querySelector(`#add-script-${id}`).innerText = "update";
    document.querySelector(`#remove-script-${id}`).style.display = "inline"
  }

  removeScript = (e) => {
    const id = e.target.parentNode.getAttribute("id").split('-').slice(-1);
    this.props.setScriptParameters(true, `${this.props.type}${id}`);
    let displayData = this.state.displayData;
    delete displayData[id];
    this.setState({ displayData: displayData });
  }

  spawnCustomOption = () => {
    const envSelect =
      <select defaultValue="Choose environment">
        {this.state.environments.map((envObj, i) =>
          <option key={i} value={envObj.path}>{envObj.displayName}</option>
        )}
      </select>
    const child = (
      <div key={this.state.id} id={`custom-options-${String(this.state.id)}`}>
        {envSelect}
        <button onClick={this.addScriptDialog}>Select script</button>
        <div id={`display-script-${String(this.state.id)}`}></div>
        <input type="text" placeholder="Insert necessary arguments" />
        <button id={`add-script-${String(this.state.id)}`} onClick={this.addScript}>add</button>
        <button className="remove-script" id={`remove-script-${String(this.state.id)}`} onClick={this.removeScript}>remove</button>
      </div>);
    let displayData = this.state.displayData;
    displayData[String(this.state.id)] = child;
    this.setState({ id: this.state.id + 1, displayData: displayData });
  }

  render() {
    return (
      <div id="custom-scripts">
        <h4>{"Select options (access selected filepaths in commandArgs using {filepaths})"}</h4>
        {Object.values(this.state.displayData)}
      </div>);
  }
}

export default CustomOptions;