import React, { Component } from 'react';
import './Settings.css';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import "react-tabs/style/react-tabs.css";

class Settings extends Component {
    /* State:
    * platform: information about the platform (for cross-platform use)
    * electron: electron instance, used to reach application's main window
    * isDev: the mode in which the application runs (production or development)
    * toExecute: object with the scripts that are to be executed
    * selectedFilePaths: array which stores the paths of input files
    * resultList: a global array to store the results of the nlp scripts
    */

    constructor(props) {
        super(props);
        this.state = {
            settings: props.electron.remote.require('electron-settings')
        };
    }

    addFilesDialog = () => {
        const dialog = this.props.electron.remote.dialog;
        dialog.showOpenDialog(this.props.electron.remote.getCurrentWindow(),
            {
                title: 'Add path',
                defaultPath: this.state.settings.get('rPath', __dirname),
                properties: ['openDirectory']
            },
            (dir) => {
                if (dir !== undefined) {
                    document.querySelector('#r-path').innerText = dir[0];
                    this.state.settings.set('rPath', dir[0])
                }
            }
        );
    }


    render() {
        return (
            <div id="settings">
                <Tabs>
                    <TabList>
                        <Tab>Workspace</Tab>
                    </TabList>
                    <TabPanel forceRender={true}>
                        R bin directory (e.g. C:\Program Files\R\R-3.6.0\bin) <button onClick={this.addFilesDialog} id="r-path">{this.state.settings.get('rPath', "browse")}</button>
                    </TabPanel>
                </Tabs>
            </div>
        );
    }
}

export default Settings;