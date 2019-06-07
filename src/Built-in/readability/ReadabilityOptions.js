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
        { indexName: "Bormuth.MC", displayName: "BormuthMC" },
        { indexName: "Bormuth.GP", displayName: "BormuthGP" },
        { indexName: "Coleman", displayName: "Coleman" },
        { indexName: "Coleman.C2", displayName: "ColemanC2" },
        { indexName: "Coleman.Liau.ECP", displayName: "Coleman.Liau.ECP" },
        { indexName: "Coleman.Liau.grade", displayName: "Coleman.Liau.grade" },
        { indexName: "Dale.Chall", displayName: "Dale.Chall" },
        { indexName: "Dale.Chall.old", displayName: "Dale.Chall.old" },
        { indexName: "Dale.Chall.PSK", displayName: "Dale.Chall.PSK" },
        { indexName: "Danielson.Bryan", displayName: "Danielson.Bryan" },
        { indexName: "Danielson.Bryan.2", displayName: "Danielson.Bryan2" },
        { indexName: "Dickes.Steiwer", displayName: "Dickes.Steiwer" },
        { indexName: "DRP", displayName: "DRP" },
        { indexName: "ELF", displayName: "ELF" },
        { indexName: "Farr.Jenkins.Paterson", displayName: "Farr.Jenkins.Paterson" },
        { indexName: "Flesch", displayName: "Flesch" },
        { indexName: "Flesch.PSK", displayName: "Flesch PSK" },
        { indexName: "Flesch.Kincaid", displayName: "Flesch.Kincaid" },
        { indexName: "FOG", displayName: "FOG" },
        { indexName: "FOG.PSK", displayName: "FOG PSK" },
        { indexName: "FOG.NRI", displayName: "FOG NRI" },
        { indexName: "FORCAST", displayName: "FORCAST" },
        { indexName: "FORCAST.RGL", displayName: "FORCAST Reading Grade Level" },
        { indexName: "Fucks", displayName: "Fucks" },
        { indexName: "Linsear.Write", displayName: "Linsear.Write" },
        { indexName: "LIW", displayName: "LIW" },
        { indexName: "nWS", displayName: "nWS" },
        { indexName: "nWS.2", displayName: "nWS 2" },
        { indexName: "nWS.3", displayName: "nWS 3" },
        { indexName: "nWS.4", displayName: "nWS 4" },
        { indexName: "RIX", displayName: "RIX" },
        { indexName: "Scrabble", displayName: "Scrabble" },
        { indexName: "SMOG", displayName: "SMOG" },
        { indexName: "SMOG.C", displayName: "SMOG C" },
        { indexName: "SMOG.simple", displayName: "SMOG simplified" },
        { indexName: "Spache", displayName: "Spache" },
        { indexName: "Spache.old", displayName: "Spache.old" },
        { indexName: "Strain", displayName: "Strain" },
        { indexName: "Traenkle.Bailer", displayName: "Traenkle.Bailer" },
        { indexName: "Traenkle.Bailer.2", displayName: "Traenkle.Bailer 2" },
        { indexName: "Wheeler.Smith", displayName: "Wheeler.Smith" },
        { indexName: "meanSentenceLength", displayName: "Mean Sentence Length" },
        { indexName: "meanWordSyllables", displayName: "Mean Word Syllables" },
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
      const args = ["-filePaths"].concat(this.props.filePaths).concat("-index").concat(indexList);
      this.props.setScriptParameters(false, this.props.type, this.state.env, this.state.scriptPath, args);
      e.target.innerText = "update";
    }
}

  render() {
    return (
      <div id="select-read-indices">
        <p>Select one or more indices to extract</p>
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