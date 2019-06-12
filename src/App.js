import React, { Component } from 'react';
import './App.css';
import Main from './Main';
import Settings from './Settings';
import { Switch, Route } from 'react-router-dom';
import "react-tabs/style/react-tabs.css";

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
         <Switch>
          <Route path='/settings' render={() => <Settings platform={this.state.platform} electron={this.state.electron} isDev={this.state.isDev} />} />
          <Route path='/main' render={() => <Main platform={this.state.platform} electron={this.state.electron} isDev={this.state.isDev} />} />
         </Switch>
    );
  }
}

export default App;