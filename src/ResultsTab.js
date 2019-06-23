import React, { Component } from 'react';
import clsx from 'clsx';
import './ResultsTab.css';
import { withStyles } from '@material-ui/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

const styles = theme => ({

    table: {
        width: "100%",
        margin: "0 10px 0 10px"
    },

});

const ResultsTab = props => {
    // pass by value
    // TODO : find better way?
    let resultList = [];
    console.log(props.resultList)
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

    const classes = props.classes;

    return (
        <div>
            <button id="execute" onClick={props.executeAll}>Execute</button>
            <Table className={clsx(classes.table)}>
                {(() => {
                    try {
                        return (<TableHead>
                            <TableRow>
                                {Object.keys(resultList[0]).map((indexName, i) => {
                                    if (typeof (resultList[0][indexName]) !== typeof ({}) || Array.isArray(resultList[0][indexName])) {
                                        return <TableCell rowSpan="2" key={i}>{indexName}</TableCell>
                                    }
                                    return <TableCell colSpan={Object.keys(Object.keys(resultList[0][indexName])).length} key={i}>{indexName}</TableCell>

                                })}
                            </TableRow>
                            <TableRow>
                                {Object.keys(resultList[0]).map((indexName, i) => {
                                    if (typeof (resultList[0][indexName]) !== typeof ({}) || Array.isArray(resultList[0][indexName]))
                                        return;
                                    return Object.keys(resultList[0][indexName]).map((el, idx) => <TableCell key={idx}>{el}</TableCell>
                                    )
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
                            return resultList.map((elem, i) =>
                                <TableRow key={i}>
                                    {Object.values(elem).map((value, id) => {
                                        if (typeof (value) === typeof ({})) {
                                            return Object.values(value).map((val, i) =>
                                                <TableCell key={i}>{val}</TableCell>
                                            )
                                        }
                                        else {
                                            return <TableCell key={id}>{value}</TableCell>
                                        }
                                    })
                                    }
                                </TableRow>)
                        }
                        catch (e) {
                            return (
                                <TableRow>
                                </TableRow>)
                        }
                    })()}
                </TableBody>
            </Table>
        </div >
    );
};

export default withStyles(styles)(ResultsTab);
