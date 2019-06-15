import React, { Component } from 'react';
import './ResultsTab.css';
import '@trendmicro/react-sidenav/dist/react-sidenav.css';
import "react-tabs/style/react-tabs.css";

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
            if(indices[index].length !== 0)
            bookObj[index] = indices[index];
        });
        return bookObj
    });
    return (
        <div>
            <button id="execute" onClick={props.executeAll}>Execute</button>
            <table className="resultsTable">
                {(() => {
                    try {
                        return (<thead>
                            <tr>
                                {Object.keys(resultList[0]).map((indexName, i) => {
                                    if (typeof(resultList[0][indexName]) !== typeof({})) {
                                        return <th rowSpan="2" key={i}>{indexName}</th>
                                    }
                                    return <th colSpan={Object.keys(Object.keys(resultList[0][indexName])).length} key={i}>{indexName}</th>
                                    
                                })}
                            </tr>
                            <tr>
                                {Object.keys(resultList[0]).map((indexName, i) => {
                                    if (typeof(resultList[0][indexName]) !== typeof({}))
                                    return;
                                        return Object.keys(resultList[0][indexName]).map((el, idx) =><th key={idx}>{el}</th>
                                        )
                                })}
                            </tr>
                        </thead>
                        )
                    }
                    catch (e) {
                        return (
                            <thead>
                                <tr>
                                    <td>No results</td>
                                </tr>
                            </thead>
                        )
                    }
                })()}
                <tbody>
                    {(() => {
                        try {
                            return resultList.map((elem, i) =>
                                <tr key={i}>
                                    {Object.values(elem).map((value, id) => {
                                        if (typeof (value) === typeof ({})) {
                                            // return <td key={id}>kako</td>
                                            return Object.values(value).map((val, i) =>
                                                <td key={i}>{val}</td>
                                            )
                                        }
                                        else {
                                            return <td key={id}>{value}</td>
                                        }
                                    })
                                    }
                                </tr>)
                        }
                        catch (e) {
                            return (
                                <tr>
                                </tr>)
                        }
                    })()}
                </tbody>
            </table>
        </div>
    );
};

export default ResultsTab;

