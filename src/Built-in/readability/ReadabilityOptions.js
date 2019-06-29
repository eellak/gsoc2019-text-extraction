import React, { Component } from 'react';
import clsx from 'clsx';
import GridList from '@material-ui/core/GridList';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

class ReadabilityOptions extends Component {

  constructor(props) {
    super(props);
    this.state = {
      selectAll: false,
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
        { indexName: "meanWordSyllables", displayName: "Mean Word Syllables" }
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

  handleToggle = value => {
    let newChecked = [];
    if (value === "all") {
      if (this.state.selectAll) {
        this.setState({ selectAll: false });
        newChecked = [...this.props.selectedIndices];
      }
      else {
        newChecked = this.state.readabilityIndices.map(indexObj => indexObj.indexName);
        this.setState({ selectAll: true });
      }
    }
    else {
      if (this.state.selectAll) {
        newChecked = this.state.readabilityIndices.map(indexObj => indexObj.indexName);
      }
      else {
        const currentIndex = this.props.selectedIndices.indexOf(value);
        newChecked = [...this.props.selectedIndices];

        if (currentIndex === -1) {
          newChecked.push(value);
        } else {
          newChecked.splice(currentIndex, 1);
        }
      }
    }
    this.props.setDistantState({ readIndex: newChecked });
  };

  changeArgs = (e) => {
    if (this.props.selectedIndices.length === 0 || this.props.filePaths.length === 0) {
      console.log("Please select at least one file");
      this.props.setScriptParameters(true, this.props.type);
      e.target.innerText = "add";
    }
    else {
      const args = [`${this.props.settings.get("rlibPath")}`].concat(`-filePaths=${this.props.filePaths.join(',')}`).concat(`-readIndex=${this.props.selectedIndices.join(',')}`);
      this.props.setScriptParameters(false, this.props.type, this.state.env, this.state.scriptPath, args);
      e.target.innerText = "update";
    }
  };

  render() {
    return (
      <div>
        <Typography variant="subtitle1" align="center">Select one or more indices to extract</Typography>
        <GridList cols={5} cellHeight="auto">
          <ListItem button onClick={() => this.handleToggle("all")}>
            <Checkbox
              checked={this.state.selectAll}
            />
            <ListItemText primary="All" />
          </ListItem>
          {this.state.readabilityIndices.map((indexObj, i) => (
            <ListItem key={i} button onClick={() => this.handleToggle(indexObj.indexName)}>
              <Checkbox
                checked={this.state.selectAll || this.props.selectedIndices.indexOf(indexObj.indexName) !== -1}
              />
              <ListItemText primary={indexObj.displayName} />
            </ListItem>)
          )}
        </GridList>
        <Button size="small" variant="contained" onClick={this.changeArgs}>add</Button>
      </div>);
  }
}

export default ReadabilityOptions;