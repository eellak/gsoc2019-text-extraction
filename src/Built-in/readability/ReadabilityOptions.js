import React, { Component } from 'react';
import './ReadabilityOptions.css';

class ReadabilityOptions extends Component {

  constructor(props) {
    super(props);
    this.state = {
      readabilityIndices: [
        //TODO probably will add a "what to return" field. Maybe load from database
        { indexName: "ARI", displayName: "ARI" },
        { indexName: "ARI.NRI", displayName: "ARI NRI" },
        { indexName: "ARI.simple", displayName: "ARI simplified" },
        { indexName: "Bormuth", displayName: "Bormuth" },
        { indexName: "Coleman", displayName: "Coleman" },
        { indexName: "Coleman.Liau", displayName: "Coleman.Liau" },
        { indexName: "Dale.Chall", displayName: "Dale.Chall" },
        { indexName: "Danielson.Bryan", displayName: "Danielson.Bryan" },
        { indexName: "Dickes.Steiwer", displayName: "Dickes.Steiwer" },
        { indexName: "DRP", displayName: "DRP" },
        { indexName: "ELF", displayName: "ELF" },
        { indexName: "Farr.Jenkins.Paterson", displayName: "Farr.Jenkins.Paterson" },
        { indexName: "Farr.Jenkins.Paterson.PSK", displayName: "Farr.Jenkins.Paterson PSK" },
        { indexName: "Flesch", displayName: "Flesch" },
        { indexName: "Flesch.PSK", displayName: "Flesch PSK" },
        { indexName: "Flesch.Kincaid", displayName: "Flesch.Kincaid" },
        { indexName: "FOG", displayName: "FOG" },
        { indexName: "FOG.PSK", displayName: "FOG PSK" },
        { indexName: "FOG.NRI", displayName: "FOG NRI" },
        { indexName: "FORCAST", displayName: "FORCAST" },
        { indexName: "FORCAST.RGL", displayName: "FORCAST Reading Grade Level" },
        { indexName: "Fucks", displayName: "Fucks" },
        { indexName: "Harris.Jacobson", displayName: "Harris.Jacobson" },
        { indexName: "Linsear.Write", displayName: "Linsear.Write" },
        { indexName: "LIX", displayName: "LIX" },
        { indexName: "RIX", displayName: "RIX" },
        { indexName: "SMOG", displayName: "SMOG" },
        { indexName: "SMOG.C", displayName: "SMOG C" },
        { indexName: "SMOG.simple", displayName: "SMOG simplified" },
        { indexName: "Spache", displayName: "Spache" },
        { indexName: "Strain", displayName: "Strain" },
        { indexName: "Traenkle.Bailer", displayName: "Traenkle.Bailer" },
        { indexName: "TRI", displayName: "TRI" },
        { indexName: "Tuldava", displayName: "Tuldava" },
        { indexName: "Wheeler.Smith", displayName: "Wheeler.Smith" },
      ],
      env: 'Rscript',
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
    const checkboxes = document.querySelectorAll(".read-index");
    const isChecked = document.querySelector("#check-all").checked;
    checkboxes.forEach((checkbox) => {
      checkbox.checked = isChecked;
    });
  }
 
  changeArgs = (e) => {
    const checkboxes = document.querySelectorAll(".read-index");
    let indexList = [];
    checkboxes.forEach((checkbox) => {
      if (checkbox.checked) {
        indexList.push(checkbox.value);
      }
      else {
        document.querySelector("#check-all").checked = false;
      }
    })
    if(indexList.length === 0 || this.props.filePaths.length === 0) {
      console.log("Please select at least one file");
      this.props.setScriptParameters(true, this.props.type);
      e.target.innerText = "add";
    }
    else {
      const args = ["-filePaths=" + this.props.filePaths.join(','), "-index=" + indexList.join(',')];
      this.props.setScriptParameters(false, this.props.type, this.state.env, this.state.scriptPath, args);
      e.target.innerText = "update";
    }
}

  render() {
    return (
      <div id="select-read-indices">
        <div>
          <input type="checkbox" id="check-all" name="readability-index" value="all" onClick={this.checkAll} />All
        {this.state.readabilityIndices.map((indexObj, i) =>
            <div key={i}><input type="checkbox" className="read-index" name="readability-index" value={indexObj.indexName} />{indexObj.displayName}</div>
          )}
          <button id={`add-readability-${String(this.state.id)}`} onClick={this.changeArgs}>add</button>
        </div>
      </div>
    );
  }
}

export default ReadabilityOptions;