import React, { Component } from 'react';
import clsx from 'clsx';
import { withStyles } from '@material-ui/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Button from '@material-ui/core/Button';
import MenuList from '@material-ui/core/MenuList';
import MenuItem from '@material-ui/core/MenuItem';
import { Checkbox } from '@material-ui/core';

const styles = theme => ({

    table: {
        width: "100%",
        margin: "0 10px 0 10px"
    },
    execute: {
        "background-color": "#009b15",
        "-moz-border-radius": "28px",
        "-webkit - border - radius": "28px",
        "border-radius": "15px",
        border: "1px #009b15 solid",
        display: "inline-block",
        cursor: "pointer",
        color: "#fff",
        "font-family": "Arial",
        "font-size": "1.1rem",
        padding: "15px 30px",
        margin: "10px 0 10px 0",
    },
    disabled: {
        opacity: "0.6",
        "background-color": "black",
        cursor: "default",
        "background- color": "#148340"
    }

});

class ResultsTab extends Component {
    constructor(props) {
        super(props);
        this.state = {
            anchorRef: React.createRef(null),
            open: false,
            exportTypes: [
                {
                    type: 'csv',
                    displayName: 'CSV'
                }, {
                    type: 'json',
                    displayName: 'JSON'
                }],
            selectedExportType: {
                type: 'csv',
                displayName: 'CSV'
            }
        };
        this.resultTable = [];
    }

    componentDidMount() {
        this.setResults();
    }

    // pass by value
    // TODO : find better way?
    componentDidUpdate(prevProps) {
        if (prevProps.resultList !== this.props.resultList) {
            this.setResults();
            this.props.setDistantState({ selectedResultRows: [...Array(this.props.resultList.length).keys()] });
        }
    }

    setResults = () => {
        let resultList = [];
        this.props.resultList.forEach(elem => {
            resultList.push(Object.assign([], elem));
        });
        resultList.forEach(bookObj => {
            const indices = bookObj.indices;
            delete bookObj.indices;
            Object.keys(indices).map(index => {
                if (indices[index].length !== 0)
                    bookObj[index] = indices[index];
            });
            return bookObj
        });
        this.setState({ resultList: resultList })
    }

    sortByColumn = (indexName, columnId) => {
        if (indexName !== 'name') {
            indexName = 'indices.' + indexName;
        }
        let newOrder = {};
        if (this.props.order.columnId === columnId) {
            newOrder = {
                columnId: columnId,
                by: indexName,
                asc: !this.props.order.asc
            };
            this.props.setDistantState({ resultOrder: newOrder });
        }
        else if (this.props.order.columnId !== columnId) {
            newOrder = {
                columnId: columnId,
                by: indexName,
                asc: true
            }
            this.props.setDistantState({ resultOrder: newOrder });
        }
        this.props.getResults(newOrder);
    }

    handleToggleAll = () => {
        if (this.props.selectedResultRows.length === this.props.resultList.length) {
            this.props.setDistantState({ selectedResultRows: [] });
        } else {
            this.props.setDistantState({ selectedResultRows: [...Array(this.props.resultList.length).keys()] });
        }
    };

    handleToggle = (value) => {
        const currentIndex = this.props.selectedResultRows.indexOf(value);
        const newChecked = [...this.props.selectedResultRows];

        if (currentIndex === -1) {
            newChecked.push(value);
        } else {
            newChecked.splice(currentIndex, 1);
        }

        this.props.setDistantState({ selectedResultRows: newChecked });
    };

    /* exportResultsDialog:
    * This function opens an electron dialog in order to export selected results.
    */
    exportResultsDialog = () => {
        const type = this.state.selectedExportType.type;
        let exportArray = [this.resultTable[0]];
        exportArray = exportArray.concat(this.props.selectedResultRows.sort().map(index => this.resultTable[index + 1]))
        const path = require('path');
        const dialog = this.props.electron.remote.dialog;
        dialog.showSaveDialog(this.props.electron.remote.getCurrentWindow(),
            {
                title: 'Select file to save',
                defaultPath: `${path.join(__dirname, '../data')}`
            },
            (filePath) => {
                if (filePath !== undefined) {
                    let exportString;
                    switch (type) {
                        case 'csv':
                            exportString = (exportArray.map(exportList => exportList.join(','))).join('\n');
                            break;
                        case 'json':
                            let exportTitles = exportArray[0];
                            let exportData = exportArray.slice(1).map(dataList => {
                                let tempObj = {};
                                dataList.forEach((fieldValue, index) => tempObj[exportTitles[index]] = fieldValue)
                                return tempObj;
                            });
                            exportString = JSON.stringify(exportData);
                            break;
                    }
                    this.props.fs.writeFileSync(filePath + `.${type}`, exportString)
                }
            });
    };

    handleMenuToggle = () => {
        this.setState({ open: !this.state.open });
    }

    handleMenuItemClick = typeObj => {
        this.setState({
            open: !this.state.open,
            selectedExportType: typeObj
        });
    };

    handleClose = event => {
        if (this.state.anchorRef.current && this.state.anchorRef.current.contains(event.target)) {
            return;
        }
        this.setState({ open: !this.state.open });
    };

    render() {
        const classes = this.props.classes;

        for (var i = 0; i <= this.props.resultList.length; i++) {
            this.resultTable.push([]);
        }

        return (
            <div>
                <Button variant="contained" disabled={this.props.processing} className={clsx(classes.execute, { [classes.disabled]: this.props.processing })} onClick={this.props.executeAll}>Execute</Button>
                <Table className={clsx(classes.table)}>
                    {(() => {
                        try {
                            let columnId = 0;
                            return (<TableHead>
                                <TableRow>
                                    <TableCell>
                                        <Checkbox
                                            onClick={this.handleToggleAll}
                                            checked={this.props.selectedResultRows.length === this.props.resultList.length}
                                            indeterminate={this.props.selectedResultRows.length !== this.props.resultList.length && this.props.selectedResultRows.length !== 0} />
                                    </TableCell>
                                    {Object.keys(this.state.resultList[0]).map((indexName, i) => {
                                        if (typeof (this.state.resultList[0][indexName]) !== typeof ({}) || Array.isArray(this.state.resultList[0][indexName])) {
                                            return <TableCell key={i} />
                                        }
                                        return <TableCell colSpan={Object.keys(Object.keys(this.state.resultList[0][indexName])).length} key={i}>{indexName}</TableCell>

                                    })}
                                </TableRow>
                                <TableRow>
                                    <TableCell />
                                    {Object.keys(this.state.resultList[0]).map((indexName, i) => {
                                        if (typeof (this.state.resultList[0][indexName]) !== typeof ({}) || Array.isArray(this.state.resultList[0][indexName])) {
                                            const id = columnId++;
                                            this.resultTable[0][id] = indexName;
                                            return (<TableCell rowSpan="2" key={i}>
                                                <TableSortLabel
                                                    active={this.props.order.columnId === id}
                                                    direction={this.props.order.asc ? 'asc' : 'desc'}
                                                    onClick={() => this.sortByColumn(`${indexName}`, id)} >
                                                    {indexName}
                                                </TableSortLabel>
                                            </TableCell>)
                                        }
                                        return Object.keys(this.state.resultList[0][indexName]).map((el, idx) => {
                                            const id = columnId++;
                                            this.resultTable[0][id] = el;
                                            return (
                                                <TableCell key={idx}>
                                                    <TableSortLabel
                                                        active={this.props.order.columnId === id}
                                                        direction={this.props.order.asc ? 'asc' : 'desc'}
                                                        onClick={() => this.sortByColumn(`${indexName}.${el}`, id)}
                                                    >
                                                        {el}
                                                    </TableSortLabel>
                                                </TableCell>
                                            )
                                        })
                                    })}
                                </TableRow>
                            </TableHead>
                            )
                        }
                        catch (e) {
                            return (
                                <TableHead>
                                    <TableRow>
                                        <TableCell>No results</TableCell>
                                    </TableRow>
                                </TableHead>
                            )
                        }
                    })()}
                    <TableBody>
                        {(() => {
                            try {
                                return this.state.resultList.map((elem, i) => {
                                    let columnId = 0;
                                    return (<TableRow key={i} onClick={() => this.handleToggle(i)}>
                                        <TableCell>
                                            <Checkbox
                                                checked={this.props.selectedResultRows.indexOf(i) !== -1} />
                                        </TableCell>
                                        {Object.values(elem).map((value, id) => {
                                            if (typeof (value) === typeof ({})) {
                                                return Object.values(value).map((val, idx) => {
                                                    const id = columnId++;
                                                    this.resultTable[i + 1][id] = val;
                                                    return (
                                                        <TableCell key={idx}>{val}</TableCell>)
                                                })
                                            }
                                            else {
                                                const id = columnId++;
                                                this.resultTable[i + 1][id] = value;
                                                return <TableCell key={id}>{value}</TableCell>
                                            }
                                        })
                                        }
                                    </TableRow>)
                                })
                            }
                            catch (e) {
                                return (
                                    <TableRow>
                                    </TableRow>)
                            }
                        })()}
                    </TableBody>
                </Table>
                <ButtonGroup variant="contained" color="primary" ref={this.state.anchorRef} aria-label="Split button">
                    <Button variant="contained" disabled={this.props.selectedResultRows.length === 0} className={clsx(classes.execute, { [classes.disabled]: this.props.selectedResultRows.length === 0 })} onClick={this.exportResultsDialog}>Export selected as {this.state.selectedExportType.displayName}</Button>
                    <Button
                        color="primary"
                        variant="contained"
                        size="small"
                        onClick={this.handleMenuToggle}
                    >
                        <i className="material-icons">arrow_drop_down</i>
                    </Button>
                </ButtonGroup>
                <Popper open={this.state.open} anchorEl={this.state.anchorRef.current} transition disablePortal>
                    {() => (
                        <Paper>
                            <ClickAwayListener onClickAway={this.handleClose}>
                                <MenuList>
                                    {this.state.exportTypes.map((typeObj, index) => (
                                        <MenuItem
                                            key={index}
                                            selected={typeObj.type === this.state.selectedExportType}
                                            onClick={() => this.handleMenuItemClick(typeObj)}
                                        >
                                            {typeObj.displayName}
                                        </MenuItem>
                                    ))}
                                </MenuList>
                            </ClickAwayListener>
                        </Paper>
                    )}
                </Popper>
            </div >
        );
    };
}
export default withStyles(styles)(ResultsTab);
