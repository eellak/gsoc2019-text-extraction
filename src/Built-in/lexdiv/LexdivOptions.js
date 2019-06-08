import React, { Component } from 'react';
import './LexdivOptions.css';

class LexdivOptions extends Component {

  constructor(props) {
    super(props);
    this.state = {
      lexdivIndices: [
        //TODO probably will add a "what to return" field. Maybe load from database
        { indexName: "TTR", displayName: "TTR" },
        { indexName: "C", displayName: "C" },
        { indexName: "R", displayName: "R" },
        { indexName: "CTTR", displayName: "CTTR" },
        { indexName: "U", displayName: "U" },
        { indexName: "S", displayName: "S" },
        { indexName: "K", displayName: "K" },
        { indexName: "D", displayName: "D" },
        { indexName: "Vm", displayName: "Vm" },
        { indexName: "Maas", displayName: "Maas" },
        { indexName: "MATTR", displayName: "MATTR" },
        { indexName: "MSTTR", displayName: "MSTTR" },
        { indexName: "lgV0", displayName: "lgV0" },
        { indexName: "lgeV0", displayName: "lgeV0" },
      ],
      env: `${props.settings.get("rPath", "")}\\Rscript`,
      scriptPath: (() => {
        switch (props.platform) {
          case "win32":
            return "src\\Built-in\\readability\\readability_indices.R";
          case "linux":
          default:
            return "src/Built-in/readability/readability_indices.R";
        }
      })(),
    }
  };

  checkAll = () => {
    const checkboxes = document.querySelectorAll(".lexdiv-index");
    const isChecked = document.querySelector("#lexdiv-check-all").checked;
    checkboxes.forEach((checkbox) => {
      checkbox.checked = isChecked;
    });
  }
 
  changeArgs = (e) => {
    const checkboxes = document.querySelectorAll(".lexdiv-index");
    let indexList = [];
    checkboxes.forEach((checkbox) => {
      if (checkbox.checked) {
        indexList.push(checkbox.value);
      }
      else {
        document.querySelector("#lexdiv-check-all").checked = false;
      }
    })
    if(indexList.length === 0 || this.props.filePaths.length === 0) {
      console.log("Please select at least one file");
      this.props.setScriptParameters(true, this.props.type);
      e.target.innerText = "add";
    }
    else {
      const args = [`${this.props.settings.get("rlibPath")}`].concat(`-filePaths=${this.props.filePaths.join(',')}`).concat(`-lexdivIndex=${indexList.join(',')}`);
      this.props.setScriptParameters(false, this.props.type, this.state.env, this.state.scriptPath, args);
      e.target.innerText = "update";
    }
}

  render() {
    return (
      <div id="select-lexdiv-indices">
        <p>Select one or more indices to extract</p>
        <div>
          <input type="checkbox" id="lexdiv-check-all" name="lexdiv-index" value="all" onClick={this.checkAll} />All
        {this.state.lexdivIndices.map((indexObj, i) =>
            <div key={i}><input type="checkbox" className="lexdiv-index" name="lexdiv-index" value={indexObj.indexName} />{indexObj.displayName}</div>
          )}
          <button id={`add-lexdiv-${String(this.state.id)}`} onClick={this.changeArgs}>add</button>
        </div>
      </div>
    );
  }
}

export default LexdivOptions;