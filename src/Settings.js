import React, { Component } from 'react';
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

    addFilesDialog = (e) => {
        let name;
        switch (e.target.getAttribute("id")) {
            case "r-path":
                name = "rPath";
                break;
            case "tree-path":
                name = "treePath";
                break;
            case "rlibrary-path":
                name = "rlibPath";
                break;
            default:
                name = ""
                break;
        }
        const dialog = this.props.electron.remote.dialog;
        dialog.showOpenDialog(this.props.electron.remote.getCurrentWindow(),
            {
                title: 'Add path',
                defaultPath: this.state.settings.get(name, __dirname),
                properties: ['openDirectory'],
                filters: [
                    { name: "All Files", extensions: ['*'] }
                ]
            },
            (dir) => {
                if (dir !== undefined) {
                    this.state.settings.set(name, dir[0])
                    this.setState({});
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
                        <ul>
                            <li>
                                R bin directory (e.g. C:\Program Files\R\R-3.6.0\bin) <input type="text" value={this.state.settings.get('rPath', "")} readOnly /><button onClick={this.addFilesDialog} id="r-path">...</button>
                            </li>
                            <li>
                                Treetagger bin directory (e.g. C:\TreeTagger\bin) <input type="text" value={this.state.settings.get('treePath', "")} readOnly /><button onClick={this.addFilesDialog} id="tree-path">...</button>
                            </li>
                            <li>
                                Rlibrary directory (e.g. C:\Users\panos\Documents\R\win-library\3.6) <input type="text" value={this.state.settings.get('rlibPath', "")} readOnly /><button onClick={this.addFilesDialog} id="rlibrary-path">...</button>
                            </li>
                        </ul>
                    </TabPanel>
                </Tabs>
            </div>
        );
    }
}

export default Settings;