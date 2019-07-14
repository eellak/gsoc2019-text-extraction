import React, { Component } from 'react';
import clsx from 'clsx';
import { withStyles } from '@material-ui/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Button from '@material-ui/core/Button';
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

const ResultsTab = props => {
    // pass by value
    // TODO : find better way?
    let resultList = [];
    props.resultList.forEach(elem => {
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

    const sortByColumn = (indexName, columnId) => {
        if (indexName !== 'name') {
            indexName = 'indices.' + indexName;
        }
        let newOrder = {};
        if (props.order.columnId === columnId) {
            newOrder = {
                columnId: columnId,
                by: indexName,
                asc: !props.order.asc
            };
            props.setDistantState({ resultOrder: newOrder });
        }
        else if (props.order.columnId !== columnId) {
            newOrder = {
                columnId: columnId,
                by: indexName,
                asc: true
            }
            props.setDistantState({ resultOrder: newOrder });
        }
        props.getResults(newOrder);
    }

    const handleToggleAll = () => {
        if (props.selectedResultRows.length === props.resultList.length) {
            props.setDistantState({ selectedResultRows: [] });
        } else {
            props.setDistantState({ selectedResultRows: props.resultList.map((fileObj, i) => i) })
        }
    };

    const handleToggle = (value) => {
        const currentIndex = props.selectedResultRows.indexOf(value);
        const newChecked = [...props.selectedResultRows];

        if (currentIndex === -1) {
            newChecked.push(value);
        } else {
            newChecked.splice(currentIndex, 1);
        }

        props.setDistantState({ selectedResultRows: newChecked });
    };

    /* exportResultsDialog:
    * This function opens an electron dialog in order to export selected results.
    */
    const exportResultsDialog = (type) => {
        type = 'csv';
        let exportArray = [resultTable[0]];
        exportArray = exportArray.concat(props.selectedResultRows.sort().map(index => resultTable[index + 1]))

        const path = require('path');
        const dialog = props.electron.remote.dialog;
        dialog.showSaveDialog(props.electron.remote.getCurrentWindow(),
            {
                title: 'Select file to save',
                defaultPath: `${path.join(__dirname, '../data')}`
            },
            (filePath) => {
                if (filePath !== undefined) {
                    switch (type) {
                        case 'csv':
                            const exportString = (exportArray.map(exportList => exportList.join(','))).join('\n');
                            props.fs.writeFileSync(filePath+'.csv', exportString)
                            break;
                    }
                }
            });
    };

    const classes = props.classes;

    let resultTable = []
    for (var i = 0; i <= props.resultList.length; i++) {
        resultTable.push([]);
    }

    return (
        <div>
            <Button variant="contained" disabled={props.processing} className={clsx(classes.execute, { [classes.disabled]: props.processing })} onClick={props.executeAll}>Execute</Button>
            <Table className={clsx(classes.table)}>
                {(() => {
                    try {
                        let columnId = 0;
                        return (<TableHead>
                            <TableRow>
                                <TableCell>
                                    <Checkbox
                                        onClick={handleToggleAll}
                                        checked={props.selectedResultRows.length === props.resultList.length}
                                        indeterminate={props.selectedResultRows.length !== props.resultList.length && props.selectedResultRows.length !== 0} />
                                </TableCell>
                                {Object.keys(resultList[0]).map((indexName, i) => {
                                    if (typeof (resultList[0][indexName]) !== typeof ({}) || Array.isArray(resultList[0][indexName])) {
                                        return <TableCell key={i} />
                                    }
                                    return <TableCell colSpan={Object.keys(Object.keys(resultList[0][indexName])).length} key={i}>{indexName}</TableCell>

                                })}
                            </TableRow>
                            <TableRow>
                                <TableCell />
                                {Object.keys(resultList[0]).map((indexName, i) => {
                                    if (typeof (resultList[0][indexName]) !== typeof ({}) || Array.isArray(resultList[0][indexName])) {
                                        const id = columnId++;
                                        resultTable[0][id] = indexName;
                                        return (<TableCell rowSpan="2" key={i}>
                                            <TableSortLabel
                                                active={props.order.columnId === id}
                                                direction={props.order.asc ? 'asc' : 'desc'}
                                                onClick={() => sortByColumn(`${indexName}`, id)} >
                                                {indexName}
                                            </TableSortLabel>
                                        </TableCell>)
                                    }
                                    return Object.keys(resultList[0][indexName]).map((el, idx) => {
                                        const id = columnId++;
                                        resultTable[0][id] = el;
                                        return (
                                            <TableCell key={idx}>
                                                <TableSortLabel
                                                    active={props.order.columnId === id}
                                                    direction={props.order.asc ? 'asc' : 'desc'}
                                                    onClick={() => sortByColumn(`${indexName}.${el}`, id)}
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
                            return resultList.map((elem, i) => {
                                let columnId = 0;
                                return (<TableRow key={i} onClick={() => handleToggle(i)}>
                                    <TableCell>
                                        <Checkbox
                                            checked={props.selectedResultRows.indexOf(i) !== -1} />
                                    </TableCell>
                                    {Object.values(elem).map((value, id) => {
                                        if (typeof (value) === typeof ({})) {
                                            return Object.values(value).map((val, idx) => {
                                                const id = columnId++;
                                                resultTable[i + 1][id] = val;
                                                return (
                                                    <TableCell key={idx}>{val}</TableCell>)
                                            })
                                        }
                                        else {
                                            const id = columnId++;
                                            resultTable[i + 1][id] = value;
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
            <Button variant="contained" className={clsx(classes.execute, { [classes.disabled]: props.selectedResultRows.length === 0 })} onClick={exportResultsDialog}>Export Selected</Button>
        </div >
    );
};

export default withStyles(styles)(ResultsTab);
