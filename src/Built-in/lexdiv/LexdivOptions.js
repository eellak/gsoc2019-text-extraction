import React, { Component } from 'react';
import clsx from 'clsx';
import GridList from '@material-ui/core/GridList';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

class LexdivOptions extends Component {

  constructor(props) {
    super(props);
    this.state = {
      selectAll: false,
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
            return "src\\Built-in\\lexdiv\\lexdiv_indices.R";
          case "linux":
          default:
            return "src/Built-in/lexdiv/lexdiv_indices.R";
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
        newChecked = this.state.lexdivIndices.map(indexObj => indexObj.indexName);
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
    this.props.setDistantState({ lexdivIndex: newChecked });
  };

  changeArgs = (e) => {
    if (this.props.selectedIndices.length === 0 || this.props.filePaths.length === 0) {
      console.log("Please select at least one file");
      this.props.setScriptParameters(true, this.props.type);
      e.target.innerText = "add";
    }
    else {
      const args = [`${this.props.settings.get("rlibPath")}`].concat(`-filePaths=${this.props.filePaths.join(',')}`).concat(`-lexdivIndex=${this.props.selectedIndices.join(',')}`);
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
          {this.state.lexdivIndices.map((indexObj, i) => (
            <ListItem key={i} button onClick={() => this.handleToggle(indexObj.indexName)}>
              <Checkbox
                checked={this.state.selectAll || this.props.selectedIndices.indexOf(indexObj.indexName) !== -1}
              />
              <ListItemText primary={indexObj.displayName} />
            </ListItem>)
          )}
        </GridList>
        <Button variant="contained" size="small" onClick={this.changeArgs}>add</Button >
      </div>
    );
  }
}

export default LexdivOptions;