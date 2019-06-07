import React, { Component } from 'react';
import './ResultsTab.css';
import '@trendmicro/react-sidenav/dist/react-sidenav.css';
import "react-tabs/style/react-tabs.css";

const ResultsTab = props => {
    const resultTable =
        <table id="results">
            <thead>
                <tr>
                    {props.resultList.map((resultObj, i) =>
                        <th key={i}>{resultObj.id}</th>
                    )}
                </tr>
            </thead>
            <tbody>
                <tr>
                    {props.resultList.map( (resultObj,i) =>
                        <td key={i}>{resultObj.grade}</td>
                    )}
                </tr>
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

