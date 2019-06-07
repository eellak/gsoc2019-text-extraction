import React, { Component } from 'react';
import './ResultsTab.css';
import '@trendmicro/react-sidenav/dist/react-sidenav.css';
import "react-tabs/style/react-tabs.css";

const ResultsTab = props => {
    console.log(props.resultList);

    const header = (() => {
        try {
            return (<tr>
                {Object.keys(props.resultList[0]).map((indexName, i) =>
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
            return (props.resultList.map((docIndices, i) =>
            <tr key={i}>
                {Object.values(docIndices).map((value, i) =>
                    <td key={i}>{value}</td>
                )}
                </tr>))
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

