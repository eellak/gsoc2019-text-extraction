import React, { Component } from 'react';
import Typography from '@material-ui/core/Typography';
import clsx from 'clsx';
import { withStyles } from '@material-ui/styles';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Checkbox from '@material-ui/core/Checkbox';

const styles = theme => ({

    table: {
        width: "100%",
        margin: "0 10px 0 10px"
    },

});

/* FilesTab is a stateless component, which renders
* the tab responsible for file selection
*/
class FilesTab extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        this.getBook();
    }

    getBook = (order = { order: this.props.order }) => {
        this.props.ipc.send("get-book", order);
    };

    /* addFilesDialog:
    * This function opens an electron dialog in order to select input files.
    * The selected files are then stored at the state of the Main component.
    */
    addFilesDialog = () => {
        const path = require('path');
        const dialog = this.props.electron.remote.dialog;
        dialog.showOpenDialog(this.props.electron.remote.getCurrentWindow(),
            {
                title: 'Add files to process',
                defaultPath: `${path.join(__dirname, '../data')}`,
                properties: ['openFile', 'multiSelections']
            },
            (filePaths) => {
                if (filePaths !== undefined) {
                    let fileNames = filePaths.map(path => {
                        switch (this.props.platform) {
                            case "win32":
                                return `${path.split('\\').slice(-1)[0]}`;
                            case "linux":
                            default:
                                return `${path.split('/').slice(-1)[0]}`;
                        }
                    });
                    const newChecked = [...this.props.selectedFilesPaths];
                    newChecked.forEach(filePath => {
                        const index = filePaths.indexOf(filePath);
                        if (index !== -1) {
                            filePaths.splice(index, 1);
                            fileNames.splice(index, 1);
                        }
                    })
                    newChecked = newChecked.concat(filePaths);
                    this.props.setDistantState({ selectedFilesPaths: newChecked });
                    filePaths.forEach((filePath, index) => {
                        const res = this.props.fs.statSync(filePath, { encoding: "utf8" })
                        this.props.ipc.send("add-book", {
                            filePath: filePath,
                            fileName: fileNames[index],
                            size: res.size,
                            lastModified: res.mtimeMs
                        });
                    });
                    this.getBook({
                        order: {
                            id: 0,
                            by: 'name',
                            asc: true
                        }
                    });

                }
            }
        );
    };

    handleToggleAll = () => {
        if (this.props.selectedFilesPaths.length === this.props.files.length) {
            this.props.setDistantState({ selectedFilesPaths: [] });
        } else {
            this.props.setDistantState({ selectedFilesPaths: this.props.files.map(fileObj => fileObj.path) })
        }
    };

    handleToggle = (value) => {
        const currentIndex = this.props.selectedFilesPaths.indexOf(value);
        const newChecked = [...this.props.selectedFilesPaths];

        if (currentIndex === -1) {
            newChecked.push(value);
        } else {
            newChecked.splice(currentIndex, 1);
        }

        this.props.setDistantState({ selectedFilesPaths: newChecked });
    };

    sortByColumn = (field, columnId) => {
        console.log(field)
        let newOrder = {};
        if (this.props.order.columnId === columnId) {
            newOrder = {
                columnId: columnId,
                by: field,
                asc: !this.props.order.asc
            };
            this.props.setDistantState({ fileOrder: newOrder });
        }
        else if (this.props.order.columnId !== columnId) {
            newOrder = {
                columnId: columnId,
                by: field,
                asc: true
            }
            this.props.setDistantState({ fileOrder: newOrder });
        }
        this.getBook({ order: newOrder });
    }

    render() {
        let columnId = 0;
        const classes = this.props.classes;
        return (
            <div>
                <Typography variant="subtitle1" align="center">Select one or more files to be processed</Typography>
                <div id="add-files">
                    <Button id="add-files-btn" onClick={this.addFilesDialog} variant="contained">Add files</Button>
                    {this.props.files.length === 0 ? <Typography id="selected-files">No files selected</Typography> :
                        <Table className={clsx(classes.table)}>
                            <TableHead>
                                <TableRow>
                                    <TableCell>
                                        <Checkbox
                                            checked={this.props.selectedFilesPaths.length === this.props.files.length}
                                            indeterminate={this.props.selectedFilesPaths.length !== this.props.files.length && this.props.selectedFilesPaths.length !== 0}
                                            onClick={this.handleToggleAll} />

                                    </TableCell>
                                    {Object.keys(this.props.files[0]).map(field => {
                                        const id = columnId++;
                                        return (
                                            <TableCell key={field}>
                                                <TableSortLabel
                                                    active={this.props.order.columnId === id}
                                                    direction={this.props.order.asc ? 'asc' : 'desc'}
                                                    onClick={() => this.sortByColumn(`${field}`, id)} >
                                                    {field}
                                                </TableSortLabel>
                                            </TableCell>
                                        )
                                    }
                                    )}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {this.props.files.map((fileObj, index) => (
                                    <TableRow key={index} onClick={() => this.handleToggle(fileObj.path)} >
                                        <TableCell>
                                            <Checkbox
                                                checked={this.props.selectedFilesPaths.indexOf(fileObj.path) !== -1} />
                                            <IconButton
                                                onClick={(event) => {
                                                    event.stopPropagation()
                                                    this.props.ipc.send('delete-book', {
                                                        path: fileObj.path
                                                    })
                                                    let selectedFilesPaths = Object.assign([], this.props.selectedFilesPaths);
                                                    if(selectedFilesPaths.indexOf(fileObj.path) !== -1) {
                                                    selectedFilesPaths.splice(selectedFilesPaths.indexOf(fileObj.path), 1);
                                                    }
                                                    this.props.setDistantState({ selectedFilesPaths: selectedFilesPaths });
                                                    this.getBook();
                                                }}
                                                className={classes.button}>
                                                <i className="material-icons">delete</i>
                                            </IconButton>
                                        </TableCell>
                                        {Object.values(fileObj).map((value, id) => (
                                            <TableCell key={id}>{value}</TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    }
                </div>
            </div >
        );
    };
}
export default withStyles(styles)(FilesTab);