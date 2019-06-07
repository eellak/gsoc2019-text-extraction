import React, { Component } from 'react';
import './ResultsTab.css';
import '@trendmicro/react-sidenav/dist/react-sidenav.css';
import "react-tabs/style/react-tabs.css";

const ResultsTab = props => {
    console.log(props.resultList);

    const header = (() => {
        try {
            return (<tr>
                <th>FileName</th>
                {props.resultList[0].readIndices.map((resultObj, i) =>
                    <th key={i}>{resultObj.id}</th>
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
            return (props.resultList.map((resultObj, i) =>
            <tr key={i}>
                <td>{resultObj.name[0]}</td>
                {resultObj.readIndices.map((readIndicesObj, i) =>
                    <td key={i}>{readIndicesObj.grade}</td>
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

