import React, { Component } from 'react';
import './ResultsTab.css';
import '@trendmicro/react-sidenav/dist/react-sidenav.css';
import "react-tabs/style/react-tabs.css";

const ResultsTab = props => {

    return (
        <div>
            <button id="execute" onClick={props.executeAll}>Execute</button>
            <table className="resultsTable">
                {(() => {
                    try {
                        return (<thead>
                            <tr>
                                {Object.keys(props.resultList).map((indexName, i) => {
                                    if (typeof (props.resultList[indexName][0]) !== typeof ({})) {
                                        // console.log(props.resultList[indexName])
                                        return <th rowSpan="2" key={i}>{indexName}</th>
                                    }
                                        return <th colSpan={Object.keys(Object.keys(props.resultList[indexName][0])).length} key={i}>{indexName}</th>

                                })}
                            </tr>
                            <tr>
                                {Object.keys(props.resultList).map((indexName, i) => {
                                    if (typeof (props.resultList[indexName][0]) !== typeof ({}))
                                        return;
                                        return Object.keys(Object.values(props.resultList[indexName])[0]).map((el, idx) =><th key={idx}>{el}</th>
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
                            return props.resultList.documents.map((e, i) =>
                                <tr key={i}>
                                    {Object.values(props.resultList).map((value, id) => {
                                        // console.log(value[i])
                                        if (typeof (value[i]) === typeof ({})) {
                                            // return <td key={id}>kako</td>
                                            return Object.values(value[i]).map((val, i) =>
                                                <td key={i}>{val}</td>
                                            )
                                        }
                                        else {
                                            return <td key={id}>{value[i]}</td>
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

