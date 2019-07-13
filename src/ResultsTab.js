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

    const doNothing = (id) => {
        if(id !== 'name') {
            id = 'indices.' + id;
        }
        console.log(id)
        let newOrder = {};
        if (props.order.by === id) {
            newOrder = {
                by: id,
                asc: !props.order.asc
            };
            props.setDistantState({ resultOrder: newOrder });
        }
        else if (props.order.by !== id) {
            newOrder = {
                by: id,
                asc: true
            }
            props.setDistantState({ resultOrder: newOrder });
        }
        props.getResults(newOrder);
    }

    const classes = props.classes;
    return (
        <div>
            <Button variant="contained" id="execute" className={clsx(classes.execute, { [classes.disabled]: props.processing })} onClick={props.executeAll}>Execute</Button>
            <Table className={clsx(classes.table)}>
                {(() => {
                    try {
                        return (<TableHead>
                            <TableRow>
                                {Object.keys(resultList[0]).map((indexName, i) => {
                                    if (typeof (resultList[0][indexName]) !== typeof ({}) || Array.isArray(resultList[0][indexName])) {
                                        return (
                                            <TableCell rowSpan="2" key={i}>
                                                <TableSortLabel
                                                    active={props.order.by === indexName}
                                                    direction={props.order.asc ? 'asc' : 'desc'}
                                                    onClick={() => doNothing(`${indexName}`)} >
                                                    {indexName}
                                                </TableSortLabel>
                                            </TableCell>
                                        )
                                    }
                                    return <TableCell colSpan={Object.keys(Object.keys(resultList[0][indexName])).length} key={i}>{indexName}</TableCell>

                                })}
                            </TableRow>
                            <TableRow>
                                {Object.keys(resultList[0]).map((indexName, i) => {
                                    if (typeof (resultList[0][indexName]) !== typeof ({}) || Array.isArray(resultList[0][indexName]))
                                        return;
                                    return Object.keys(resultList[0][indexName]).map((el, idx) => (
                                        <TableCell key={idx}>
                                            <TableSortLabel
                                                active={props.order.by === indexName}
                                                direction={props.order.asc ? 'asc' : 'desc'}
                                                onClick={() => doNothing(`${indexName}.${el}`)}
                                            >
                                                {el}
                                            </TableSortLabel>
                                        </TableCell>
                                    ))
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
