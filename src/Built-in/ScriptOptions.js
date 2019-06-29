import React, { Component } from 'react';
import clsx from 'clsx';
import GridList from '@material-ui/core/GridList';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

class ScriptOptions extends Component {

  constructor(props) {
    super(props);
    this.state = {
      selectedIndices: this.props.selectedIndices[this.props.type] === undefined ? [] : this.props.selectedIndices[this.props.type],
      selectAll: false,
      indices: props.indices.map(obj => obj._doc),
      env: `${props.settings.get(props.env, "")}\\Rscript`,
      scriptPath: (() => {
        switch (props.platform) {
          case "win32":
            return props.scriptPath;
          case "linux":
          default:
            // probably replace \\ with / or sth
            return props.scriptPath;
        }
      })()
    };
  };

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      this.setState({ selectedIndices: this.props.selectedIndices[this.props.type] === undefined ? [] : this.props.selectedIndices[this.props.type] })
    }
  }

  handleToggle = value => {
    let newChecked = [];
    if (value === "all") {
      if (this.state.selectAll) {
        this.setState({ selectAll: false });
        newChecked = this.state.selectedIndices;
      }
      else {
        newChecked = this.state.indices.map(indexObj => indexObj.indexName);
        this.setState({ selectAll: true });
      }
    }
    else {
      if (this.state.selectAll) {
        newChecked = this.props.indices.map(indexObj => indexObj.indexName);
      }
      else {
        const currentIndex = this.state.selectedIndices.indexOf(value);
        newChecked = this.state.selectedIndices;

        if (currentIndex === -1) {
          newChecked.push(value);
        } else {
          newChecked.splice(currentIndex, 1);
        }
      }
    }
    let selectedIndices = this.props.selectedIndices;
    selectedIndices[this.props.type] = newChecked;
    this.props.setDistantState({ selectedIndices: selectedIndices });
  };

  changeArgs = (e) => {
    if (this.state.selectedIndices.length === 0 || this.props.filePaths.length === 0) {
      console.log("Please select at least one file");
      this.props.setScriptParameters(true, this.props.type);
      e.target.innerText = "add";
    }
    else {
      const args = [`${this.props.settings.get("rlibPath")}`].concat(`-filePaths=${this.props.filePaths.join(',')}`).concat(`-readIndex=${this.state.selectedIndices.join(',')}`);
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
          {this.state.indices.map((indexObj, i) => (
            <ListItem key={i} button onClick={() => this.handleToggle(indexObj.indexName)}>
              <Checkbox
                checked={this.state.selectAll || this.state.selectedIndices.indexOf(indexObj.indexName) !== -1}
              />
              <ListItemText primary={indexObj.displayName} />
            </ListItem>)
          )}
        </GridList>
        <Button size="small" variant="contained" onClick={this.changeArgs}>add</Button>
      </div>);
  }
}

export default ScriptOptions;