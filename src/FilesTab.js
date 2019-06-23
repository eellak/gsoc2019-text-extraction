import React, { Component } from 'react';
import './FilesTab.css';

const FilesTab = props => {

    // /* addFilesDialog:
    // * an electron dialog opens in order to select input files
    // */

    const addFilesDialog = () => {
        const path = require('path');
        const dialog = props.electron.remote.dialog;
        dialog.showOpenDialog(props.electron.remote.getCurrentWindow(),
            {
                title: 'Add files to process',
                defaultPath: props.isDev ? "/home/panagiotis/Documents/gsoc2019-text-extraction/data" : `${path.join(__dirname, '../data')}`,
                properties: ['openFile', 'multiSelections']
            },
            (filePaths) => {
                if (filePaths !== undefined) {
                    props.setDistantState({ selectedFilesPaths: filePaths });
                }
            }
        );
    }

    const filenames = props.selectedFilesPaths.map(path => {
        switch (props.platform) {
            case "win32":
                return `${path.split('\\').slice(-1)[0]}`;
            case "linux":
            default:
                return `${path.split('/').slice(-1)[0]}`;
        }
    }).join(', ');
    return (
        <div>
            <h4>Select one or more files to be processed</h4>
            <div id="add-files">
                <button id="add-files-btn" onClick={addFilesDialog}>Add files</button>
                <div id="selected-files">{filenames.length === 0 ? `No files selected` : `You have selected ${filenames}`}</div>
            </div>
        </div>
    );
};

export default FilesTab;