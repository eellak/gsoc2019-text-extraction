import React, { Component } from 'react';
import './App.css';
import Main from './Main';
import Settings from './Settings';
import { Switch, Route } from 'react-router-dom';
import "react-tabs/style/react-tabs.css";

import { ThemeProvider } from '@material-ui/styles';
import { createMuiTheme } from '@material-ui/core/styles';

const palette = {
  primary: { main: '#1B5E20', light: '#4C8C4A', dark: '#003300' },
  secondary: { main: '#FFAB40', light: '#FFDD71', dark: '#C77C02' }
};

const themeName = 'Custom theme';

const theme = createMuiTheme({
  palette,
  themeName,
  overrides:
  {
    MuiListItem: {
      "root": {
        "&$selected": {
          "background-color": palette.primary.light,
        },
      }
    },
    MuiTab: {
      "textColorInherit": {
        "&$selected": {
          "background-color": palette.secondary.main,
        },
      }
    }
  }
});

/* App is the main component which renders all
* application routes which relate to different application windows
*/

class App extends Component {
  constructor() {
    super();
    this.state = {
      platform: window.process.platform,
      electron: window.require('electron'),
      isDev: window.require('electron-is-dev')
    };
  }
  render() {
    return (
      <ThemeProvider theme={theme}>
        <Switch>
          <Route path='/settings' render={() => <Settings platform={this.state.platform} electron={this.state.electron} isDev={this.state.isDev} />} />
          <Route path='/main' render={() => <Main platform={this.state.platform} electron={this.state.electron} isDev={this.state.isDev} />} />
        </Switch>
      </ThemeProvider>
    );
  }
}

export default App;