import React, { Component } from 'react';
import './ResultsTab.css';
import '@trendmicro/react-sidenav/dist/react-sidenav.css';
import "react-tabs/style/react-tabs.css";

const ResultsTab = props => {
    console.log(props.resultList);

    const header = (() => {
        try {
            return (<tr>
                {Object.keys(props.resultList).map((indexName, i) =>
                    <th key={i}>{indexName}</th>
                )}
            </tr>)
        }
        catch (e) {
            return (
                <tr>
                    <div>No results</div>
                </tr>)
        }
    })()
    
    const body = (() => {
        try {
            return (Object.values(props.resultList).map((value, i) => {
            if(typeof(value) === typeof({})) {
                Object.value(value).map((val) => {
                    <td>{val}</td>
                })
            }
            else {
            return <tr key={i}>
                <td>
                {value}
                </td>
            </tr> 
            }
        })
            )
        }
        catch (e) {
            return (
                <tr>
                </tr>)
        }
    })()

    const resultTable =
        <table id="results">
            <thead>
                {header}
            </thead>
            <tbody>
                {body}
            </tbody>

        </table>
    return (
        <div>
            <button id="execute" onClick={props.executeAll}>Execute</button>
            {resultTable}
        </div>
    );
};

export default ResultsTab;

