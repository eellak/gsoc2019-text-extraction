import React, { Component } from 'react';
import { withStyles } from '@material-ui/styles';
import { IconButton, Table, TableBody, TableCell, TableHead, TableRow, TableSortLabel, Checkbox, Paper, Container } from '@material-ui/core';

const styles = theme => ({
    root: {
        width: '100%',
        marginTop: theme.spacing(1),
        overflow: 'auto',
        maxHeight: `calc(100% - ${theme.spacing(1)}px - 31px)`
    },
    container: {
        height: '100%',
        paddingBottom: `${theme.spacing(1)}px`,
        paddingTop: `${theme.spacing(1)}px`,
    },
    flexContainer: {
        display: 'flex',
        alignItems: 'center'
    }
});

/**
 * FilesTab is an, almost, stateless component, which renders
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

    /**
     * Method for book fetching
     */
    getBook = (order = { order: this.props.order }) => {
        this.props.ipc.send("get-book", order);
    };

    /**
     * This function opens an electron dialog in order to select input files.
     * The selected files are then stored at the state of the Main component.
     */
    addFilesDialog = () => {
        if (this.props.isDev) {
            this.props.logMessage('Open dialog for file selection', 'info');
        }
        const path = require('path');
        const dialog = this.props.electron.remote.dialog;
        dialog.showOpenDialog(this.props.electron.remote.getCurrentWindow(),
            {
                title: 'Add files to process',
                defaultPath: `${path.join(__dirname, '../data')}`,
                properties: ['openFile', 'multiSelections'],
                filters: [{
                    name: 'Text files',
                    extensions: ['txt']
                }]
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

                    let res = [];
                    filePaths.forEach((filePath, index) => res.push(this.props.fs.statSync(filePath, { encoding: "utf8" })));

                    // Send sync message in order to avoid sync errors when fetching books
                    const insertResults = this.props.ipc.sendSync("add-book", {
                        filePaths: filePaths,
                        fileNames: fileNames,
                        size: res.map(resObj => resObj.size),
                        lastModified: res.map(resObj => resObj.mtimeMs)
                    })
                    this.props.logMessage(`Dialog closed. ${insertResults.upsertedCount !== 0 ? `${insertResults.upsertedCount} file(s) added.` : 'No files added.'} `, 'info');
                    this.getBook({
                        order: {
                            id: 0,
                            by: 'name',
                            asc: true
                        }
                    });
                }
                else {
                    this.props.logMessage(`Dialog closed. No files added.`, 'info');
                }
            });
    };

    /**
     * Method to select all files
     */
    handleToggleAll = () => {
        if (this.props.selectedFilesPaths.length === this.props.files.length) {
            if (this.props.isDev) {
                this.props.logMessage(`Unselect all files`, 'info');
            }
            this.props.setDistantState({ selectedFilesPaths: [] });
        } else {
            if (this.props.isDev) {
                this.props.logMessage(`Select all files`, 'info');
            }
            this.props.setDistantState({ selectedFilesPaths: this.props.files.map(fileObj => fileObj.path) })
        }
    };

    /**
     * Method to select one
     */
    handleToggle = (value) => {
        const currentIndex = this.props.selectedFilesPaths.indexOf(value);
        const newChecked = [...this.props.selectedFilesPaths];

        if (currentIndex === -1) {
            if (this.props.isDev) {
                this.props.logMessage(`Select ${value}`, 'info');
            }
            newChecked.push(value);
        } else {
            if (this.props.isDev) {
                this.props.logMessage(`Unselect ${value}`, 'info');
            }
            newChecked.splice(currentIndex, 1);
        }

        this.props.setDistantState({ selectedFilesPaths: newChecked });
    };

    /**
     * Method that stores table by columns. It does so by doing a database 
     * query with the correct order 
     */
    sortByColumn = (field, columnId) => {
        let newOrder = {};
        if (this.props.order.columnId === columnId) {
            if (this.props.isDev) {
                // this.props.logMessage(`Sort by ${field}, ${this.props.order.asc ? 'ascending' : 'descending'}`, 'info');
            }
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

    /**
     * Delete book method
     */

    deleteBook = (event, bookObj) => {
        event.stopPropagation();
        // Send sync message in order to avoid sync errors when fetching books
        this.props.ipc.sendSync('delete-book', {
            path: bookObj.path
        })
        this.getBook();
        if (this.props.isDev) {
            this.props.logMessage(`Delete ${bookObj.path}`, 'info');
        }
        let selectedFilesPaths = Object.assign([], this.props.selectedFilesPaths);
        if (selectedFilesPaths.indexOf(bookObj.path) !== -1) {
            selectedFilesPaths.splice(selectedFilesPaths.indexOf(bookObj.path), 1);
        }
        this.props.setDistantState({ selectedFilesPaths: selectedFilesPaths });
    }
    render() {
        let columnId = 0;
        const classes = this.props.classes;
        return (
            <Container maxWidth='md' classes={{root: classes.container}}>
                    {<Paper className={classes.root}>
                    <Table>
                            <TableHead>
                                <TableRow>
                                    <StyledTableCell>
                                        <div className={classes.flexContainer}>
                                            <Checkbox
                                                checked={this.props.selectedFilesPaths.length === this.props.files.length && this.props.selectedFilesPaths.length !== 0}
                                                indeterminate={this.props.selectedFilesPaths.length !== this.props.files.length && this.props.selectedFilesPaths.length !== 0}
                                                onClick={this.handleToggleAll} />
                                            <IconButton 
                                            onClick={this.addFilesDialog}>
                                                <i className="material-icons">add_circle</i>
                                            </IconButton>
                                        </div>
                                    </StyledTableCell>
                                    {(() => {try {
                                        return (
                                            Object.keys(this.props.files[0]).map(field => {
                                                const id = columnId++;
                                                return (
                                                    <StyledTableCell key={field}>
                                                <TableSortLabel
                                                    active={this.props.order.columnId === id}
                                                    direction={this.props.order.asc ? 'asc' : 'desc'}
                                                    onClick={() => this.sortByColumn(`${field}`, id)} >
                                                    {field}
                                                </TableSortLabel>
                                            </StyledTableCell>
                                        )
                                    })
                                    )
                                }
                                catch (e) {}
                            })()}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {this.props.files.map((fileObj, index) => (
                                    <TableRow key={index} onClick={() => this.handleToggle(fileObj.path)} >
                                        <StyledTableCell padding='checkbox'>
                                            <div className={classes.flexContainer}>
                                                <Checkbox
                                                    checked={this.props.selectedFilesPaths.indexOf(fileObj.path) !== -1} />
                                                <IconButton
                                                    onClick={(event) => this.deleteBook(event, fileObj)}
                                                    className={classes.button}>
                                                    <i className="material-icons">delete</i>
                                                </IconButton>
                                            </div>
                                        </StyledTableCell>
                                        {Object.values(fileObj).map((value, id) => (
                                            <StyledTableCell key={id}>{value}</StyledTableCell>
                                            ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Paper>
                    }
            </Container >
            );
        };
}


const StyledTableCell = withStyles(theme => {
    return ({
        head: {
            // "background-color": theme.palette.secondary.main,
    //   color: theme.palette.text.primary,
    },
    body: {
      fontSize: 14,
    },
  })})(TableCell);

export default withStyles(styles)(FilesTab);