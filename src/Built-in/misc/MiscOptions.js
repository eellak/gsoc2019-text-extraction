import React, { Component } from 'react';
import './MiscOptions.css';

class MiscOptions extends Component {

  constructor(props) {
    super(props);
    this.state = {
      miscIndices: [
        //TODO probably will add a "what to return" field. Maybe load from database
        { indexName: "entropy", displayName: "Entropy" },
        { indexName: "normentropy", displayName: "Normalized Entropy" }
      ],
      env: `${props.settings.get("rPath", "")}\\Rscript`,
      scriptPath: (() => {
        switch (props.platform) {
          case "win32":
            return "src\\Built-in\\misc\\misc_indices.R";
          case "linux":
          default:
            return "src/Built-in/misc/misc_indices.R";
        }
      })(),
    }
  };

  checkAll = () => {
    const checkboxes = document.querySelectorAll(".misc-index");
    const isChecked = document.querySelector("#misc-check-all").checked;
    checkboxes.forEach((checkbox) => {
      checkbox.checked = isChecked;
    });
  }

  changeArgs = (e) => {
    const checkboxes = document.querySelectorAll(".misc-index");
    let indexList = [];
    checkboxes.forEach((checkbox) => {
      if (checkbox.checked) {
        indexList.push(checkbox.value);
      }
      else {
        document.querySelector("#misc-check-all").checked = false;
      }
    })
    if (indexList.length === 0 || this.props.filePaths.length === 0) {
      console.log("Please select at least one file");
      this.props.setScriptParameters(true, this.props.type);
      e.target.innerText = "add";
    }
    else {
      const args = [`${this.props.settings.get("rlibPath")}`].concat(`-filePaths=${this.props.filePaths.join(',')}`).concat(`-miscIndex=${indexList.join(',')}`);
      this.props.setScriptParameters(false, this.props.type, this.state.env, this.state.scriptPath, args);
      e.target.innerText = "update";
    }
  }

  render() {
    return (
      <div id="select-misc-indices">
        <h4>Select one or more indices to extract</h4>
        <div>
          <input type="checkbox" id="misc-check-all" name="misc-index" value="all" onClick={this.checkAll} />All
        {this.state.miscIndices.map((indexObj, i) =>
            <div key={i}><input type="checkbox" className="misc-index" name="misc-index" value={indexObj.indexName} />{indexObj.displayName}</div>
          )}
          <button id={`add-misc-${String(this.state.id)}`} onClick={this.changeArgs}>add</button>
        </div>
      </div>
    );
  }
}

export default MiscOptions;