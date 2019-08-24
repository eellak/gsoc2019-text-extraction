import React, { Component } from 'react';
import { withStyles } from '@material-ui/styles';
import { List, ListItem, ListItemText, Checkbox, Paper, ListSubheader, Container } from '@material-ui/core';


const styles = theme => ({
  root: {
    width: '100%',
    position: 'relative',
    overflow: 'auto',
    maxHeight: '100%'
  },
  ul: {
    backgroundColor: theme.palette.common.white,
    padding: 0,
  },
  container: {
    height: 'calc(100% - 48px)',
    paddingBottom: `${theme.spacing(1)}px`,
    paddingTop: `${theme.spacing(1)}px`,
  }
});


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
    if (this.props.selectedIndices[this.props.type] !== prevProps.selectedIndices[this.props.type]) {
      const selectedIndices = this.props.selectedIndices[this.props.type] === undefined ? [] : this.props.selectedIndices[this.props.type];
      this.setState({ selectedIndices: selectedIndices });

      if (selectedIndices.length === 0) {
        console.log("Please select at least one file");
        this.props.setScriptParameters(true, this.props.type);
      }
      else {
        const args = [`${this.props.settings.get("rlibPath")}`].concat('-filePaths=').concat(`-index=${selectedIndices.join(',')}`);
        this.props.setScriptParameters(false, this.props.type, this.state.env, this.state.scriptPath, args);
      }
    }
  }

  handleToggleAll = () => {
    if (this.state.selectedIndices.length === this.state.indices.length) {
      let selectedIndices = Object.assign({}, this.props.selectedIndices);
      selectedIndices[this.props.type] = [];
      this.props.setDistantState({ selectedIndices: selectedIndices });
    } else {
      let selectedIndices = Object.assign({}, this.props.selectedIndices);
      selectedIndices[this.props.type] = this.state.indices.map(indexObj => indexObj.indexName);
      this.props.setDistantState({ selectedIndices: selectedIndices });
    }
  };

  handleToggle = value => {
    const currentIndex = this.state.selectedIndices.indexOf(value);
    const newChecked = [...this.state.selectedIndices];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    let selectedIndices = Object.assign({}, this.props.selectedIndices);
    selectedIndices[this.props.type] = newChecked;
    this.props.setDistantState({ selectedIndices: selectedIndices });
  };

  render() {
    const classes = this.props.classes;
    return (
      <Container maxWidth='sm' classes={{ root: classes.container }}>
        {/* <Typography variant="subtitle1" align="center">Select one or more indices to extract</Typography> */}
        <Paper classes={{ root: classes.root }}>
          <List dense>
            <ul className={classes.ul}>
              <ListSubheader disableGutters={true}>
                <ListItem button onClick={this.handleToggleAll}>
                  <Checkbox
                    checked={this.state.selectedIndices.length === this.state.indices.length}
                    indeterminate={this.state.selectedIndices.length !== this.state.indices.length && this.state.selectedIndices.length !== 0}
                  />
                  <ListItemText primary="All" />
                </ListItem>
              </ListSubheader>
              {this.state.indices.map((indexObj, i) => (
                <ListItem key={indexObj.indexName} button onClick={() => this.handleToggle(indexObj.indexName)}>
                  <Checkbox
                    checked={this.state.selectedIndices.indexOf(indexObj.indexName) !== -1}
                  />
                  <ListItemText primary={indexObj.displayName} />
                </ListItem>)
              )}
            </ul>
          </List>
        </Paper>
        {/* <Button size="small" variant="contained" onClick={this.changeArgs}>add</Button> */}
      </Container>
    );
  }
}

export default withStyles(styles)(ScriptOptions);